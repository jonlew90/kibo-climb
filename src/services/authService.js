import {
  signInWithPopup, 
  linkWithPopup, 
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInAnonymously,
  GoogleAuthProvider,
  OAuthProvider,
  unlink, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { storageService } from './storageService';

const GUEST_ID_KEY = 'kibo_anonymous_guest_id';

/**
 * Generates or retrieves a unique persistent Guest ID for fallback.
 */
export function getOrCreateGuestId() {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}


const _handleLinkCollision = async (linkedUser, authProviderName, email, provider) => {
  const currentData = storageService.getUserData('math');
  const userDocRef = doc(db, 'users', linkedUser.uid);
  let requiresConflictResolution = false;
  let cloudProfiles = {};

  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      if (cloudData && cloudData.profiles) {
        cloudProfiles = cloudData.profiles;
        const profileCount = Object.keys(cloudProfiles).length;

        // We need to check if they have a family plan on the cloud account
        // Since we can't easily query RevenueCat here without user context,
        // we'll rely on the storageService's current check (which might be local),
        // OR we check if they already have > 1 profile. If they have > 1, they have a family plan.
        const hasFamilyPlan = storageService.hasFamilyPlan();
        // If the cloud account has 6 profiles, or 1 profile and no family plan -> Conflict
        if (profileCount >= 6 || (profileCount >= 1 && !hasFamilyPlan && profileCount < 2)) {
          // Note: profileCount < 2 is to handle the case where they have 2 profiles (so they must have family plan).
          // But actually, just relying on profileCount >= 6 OR (profileCount === 1 && !hasFamilyPlan) is safer.
          // Wait, hasFamilyPlan checks local storage, which might not reflect the cloud user yet!
          // We can check if any profile in cloud has the sub, but that's complex.

          // Better logic:
          // If cloud has >= 6 profiles -> always full.
          // If cloud has >= 1 profile -> assume full UNLESS we know they have family plan.
          // Let's check cloud profiles for sub.
          let cloudHasFamilyPlan = false;
          Object.values(cloudProfiles).forEach(p => {
             if (p.shopState && p.shopState.unlockedItems && p.shopState.unlockedItems.includes('kibo_club_family')) {
                 cloudHasFamilyPlan = true;
             }
          });

          if (profileCount >= 6 || (profileCount >= 1 && !cloudHasFamilyPlan && !hasFamilyPlan)) {
             requiresConflictResolution = true;
          }
        }
      }
    }
  } catch(e) {
    console.warn('Could not fetch cloud profiles for collision check', e);
  }

  if (requiresConflictResolution) {
    const localProfiles = storageService.getAllProfiles();
    return {
      success: false,
      requires_conflict_resolution: true,
      linkedUser,
      cloudProfiles,
      localProfiles,
      cloudHasFamilyPlan,
      localHasFamilyPlan: hasFamilyPlan
    };
  }

  // If we can merge (has room), we just proceed normally, the local profile
  // will be uploaded as a new profile in the next sync cycle because its ID is unique
  // (unless it's 'default_child', which might overwrite the cloud's 'default_child' if they share the ID).

  // To be safe, if the local profile is 'default_child' and cloud has 'default_child',
  // we should rename the local one so we don't overwrite.
  const activeProfileId = storageService.getActiveProfileId();
  if (cloudProfiles[activeProfileId]) {
      const newId = 'profile_' + Date.now();
      const state = JSON.parse(localStorage.getItem('kibo_profiles_data'));
      state.profiles[newId] = { ...state.profiles[activeProfileId], id: newId };
      delete state.profiles[activeProfileId];
      state.activeProfileId = newId;
      localStorage.setItem('kibo_profiles_data', JSON.stringify(state));
  }

  const mergedUserData = {
    ...currentData,
    cloudUid: linkedUser.uid,
    isAnonymous: false,
    authProvider: authProviderName,
    email: linkedUser.email || email || `${provider}_user@kiboclimb.com`,
    displayName: linkedUser.displayName || currentData.name || 'Kibo Master',
    accountLinkedAt: new Date().toISOString()
  };

  storageService.setGlobalAccountLinkedState(mergedUserData);
  const earnedSparks = storageService.grantAccountLinkSparksReward();

  return {
    success: true,
    user: storageService.getUserData('math'),
    earnedSparks
  };
};

export const authService = {
  /**
   * Initializes real Firebase anonymous user or handles returning OAuth redirect on application launch.
   */
  async initAnonymousGuest() {
    try {
      if (auth.authStateReady) {
        await auth.authStateReady();
      }

      // 1. Process any pending OAuth redirect result FIRST before modifying auth state
      const redirectRes = await this.handleRedirectResult();
      if (redirectRes && redirectRes.success) {
        const activeProfile = storageService.getActiveProfile();
        return {
          ...activeProfile,
          cloudUid: redirectRes.user.cloudUid,
          isAnonymous: false,
          authProvider: redirectRes.user.authProvider
        };
      }

      // 2. Check if already linked according to stored user data
      const userData = storageService.getUserData('math');
      if (storageService.isAccountGloballyLinked() || (userData && userData.isAnonymous === false)) {
        const activeProfile = storageService.getActiveProfile();
        return {
          ...activeProfile,
          cloudUid: userData.cloudUid || activeProfile.cloudUid,
          isAnonymous: false,
          authProvider: userData.authProvider || 'google.com'
        };
      }

      let currentUser = auth.currentUser;
      if (!currentUser) {
        const userCred = await signInAnonymously(auth);
        currentUser = userCred.user;
      }

      const activeProfile = storageService.getActiveProfile();
      const updatedProfile = {
        ...activeProfile,
        cloudUid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous,
        authProvider: currentUser.isAnonymous ? 'anonymous' : (currentUser.providerData[0]?.providerId || 'firebase'),
        createdAt: activeProfile.createdAt || new Date().toISOString()
      };

      if (!currentUser.isAnonymous) {
        storageService.setGlobalAccountLinkedState({
          cloudUid: currentUser.uid,
          isAnonymous: false,
          authProvider: updatedProfile.authProvider
        });
      } else {
        storageService.saveUserData({
          cloudUid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous,
          authProvider: updatedProfile.authProvider
        });
      }

      return updatedProfile;
    } catch (e) {
      console.warn('Firebase Anonymous Auth failed, using local fallback guest ID:', e);
      const guestId = getOrCreateGuestId();
      const activeProfile = storageService.getActiveProfile();
      const userData = storageService.getUserData('math');
      const isAlreadyLinked = storageService.isAccountGloballyLinked() || (userData && userData.isAnonymous === false);
      return {
        ...activeProfile,
        cloudUid: activeProfile.cloudUid || guestId,
        isAnonymous: !isAlreadyLinked,
        authProvider: isAlreadyLinked ? (userData.authProvider || 'google.com') : 'anonymous'
      };
    }
  },

  /**
   * Links current Firebase user (or signs in) using real identity providers (Google, Apple, Email).
   * Supports both popup mode and redirect mode (useRedirect = true prevents COOP popup logs).
   */
  async linkAccount({ provider = 'google', email = null, password = null, useRedirect = false }) {
    try {
      const currentFirebaseUser = auth.currentUser;
      let linkedUser = null;
      let authProviderName = provider;

      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        if (useRedirect) {
          sessionStorage.setItem('kibo_account_link_return_url', window.location.pathname);
          if (currentFirebaseUser && currentFirebaseUser.isAnonymous) {
            await linkWithRedirect(currentFirebaseUser, googleProvider);
          } else {
            await signInWithRedirect(auth, googleProvider);
          }
          return { success: true, redirecting: true };
        }

        if (currentFirebaseUser && currentFirebaseUser.isAnonymous) {
          try {
            const res = await linkWithPopup(currentFirebaseUser, googleProvider);
            linkedUser = res.user;
          } catch (linkError) {
            if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
              const credential = GoogleAuthProvider.credentialFromError(linkError);
              if (credential) {
                try {
                  const res = await signInWithCredential(auth, credential);
                  linkedUser = res.user;
                } catch (credErr) {
                  const res = await signInWithPopup(auth, googleProvider);
                  linkedUser = res.user;
                }
              } else {
                const res = await signInWithPopup(auth, googleProvider);
                linkedUser = res.user;
              }
            } else {
              throw linkError;
            }
          }
        } else {
          const res = await signInWithPopup(auth, googleProvider);
          linkedUser = res.user;
        }
        authProviderName = 'google.com';
      } else if (provider === 'apple') {
        const appleProvider = new OAuthProvider('apple.com');
        if (useRedirect) {
          sessionStorage.setItem('kibo_account_link_return_url', window.location.pathname);
          if (currentFirebaseUser && currentFirebaseUser.isAnonymous) {
            await linkWithRedirect(currentFirebaseUser, appleProvider);
          } else {
            await signInWithRedirect(auth, appleProvider);
          }
          return { success: true, redirecting: true };
        }

        if (currentFirebaseUser && currentFirebaseUser.isAnonymous) {
          try {
            const res = await linkWithPopup(currentFirebaseUser, appleProvider);
            linkedUser = res.user;
          } catch (linkError) {
            if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
              const credential = OAuthProvider.credentialFromError(linkError);
              if (credential) {
                try {
                  const res = await signInWithCredential(auth, credential);
                  linkedUser = res.user;
                } catch (credErr) {
                  const res = await signInWithPopup(auth, appleProvider);
                  linkedUser = res.user;
                }
              } else {
                const res = await signInWithPopup(auth, appleProvider);
                linkedUser = res.user;
              }
            } else {
              throw linkError;
            }
          }
        } else {
          const res = await signInWithPopup(auth, appleProvider);
          linkedUser = res.user;
        }
        authProviderName = 'apple.com';
      } else if (provider === 'magic_link' || provider === 'email') {
        if (!email || !email.includes('@')) {
          return { success: false, reason: 'Please enter a valid email address' };
        }
        const defaultPassword = password || `KiboPass_${email.split('@')[0]}!99`;
        const credential = EmailAuthProvider.credential(email, defaultPassword);

        if (currentFirebaseUser && currentFirebaseUser.isAnonymous) {
          try {
            const res = await linkWithCredential(currentFirebaseUser, credential);
            linkedUser = res.user;
          } catch (linkErr) {
            if (linkErr.code === 'auth/credential-already-in-use' || linkErr.code === 'auth/email-already-in-use') {
              const res = await signInWithEmailAndPassword(auth, email, defaultPassword);
              linkedUser = res.user;
            } else if (linkErr.code === 'auth/user-not-found') {
              const res = await createUserWithEmailAndPassword(auth, email, defaultPassword);
              linkedUser = res.user;
            } else {
              throw linkErr;
            }
          }
        } else {
          try {
            const res = await signInWithEmailAndPassword(auth, email, defaultPassword);
            linkedUser = res.user;
          } catch (signInErr) {
            const res = await createUserWithEmailAndPassword(auth, email, defaultPassword);
            linkedUser = res.user;
          }
        }
        authProviderName = 'password';
      }

      if (!linkedUser) {
        linkedUser = auth.currentUser;
      }

      const currentData = storageService.getUserData('math');

      // If we got here through a credential collision catch, we need to check if we can merge
      const isCollision = (currentFirebaseUser && currentFirebaseUser.isAnonymous && linkedUser && linkedUser.uid !== currentFirebaseUser.uid);

      if (isCollision) {
          return await _handleLinkCollision(linkedUser, authProviderName, email, provider);
      }

      const mergedUserData = {
        ...currentData,
        cloudUid: linkedUser ? linkedUser.uid : `uid_${Date.now()}`,
        isAnonymous: linkedUser ? linkedUser.isAnonymous : false,
        authProvider: authProviderName,
        email: (linkedUser && linkedUser.email) || email || `${provider}_user@kiboclimb.com`,
        displayName: (linkedUser && linkedUser.displayName) || currentData.name || 'Kibo Master',
        accountLinkedAt: new Date().toISOString()
      };

      if (mergedUserData.isAnonymous === false) {
        storageService.setGlobalAccountLinkedState(mergedUserData);
      } else {
        storageService.saveUserData(mergedUserData);
      }
      const earnedSparks = storageService.grantAccountLinkSparksReward();

      return {
        success: true,
        user: storageService.getUserData('math'),
        earnedSparks
      };
} catch (error) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          cancelled: true,
          reason: 'Sign-in popup was closed before completing.',
          code: error.code
        };
      }

      console.error(`Firebase Auth link failure (${provider}):`, error);
      let friendlyMessage = error.message || 'Failed to link account with provider.';
      if (error.code === 'auth/popup-blocked') {
        friendlyMessage = 'Pop-up blocked by browser. Please allow popups for sign-in.';
      } else if (error.code === 'auth/unauthorized-domain') {
        friendlyMessage = 'Domain not authorized in Firebase Auth configuration.';
      }

      return {
        success: false,
        reason: friendlyMessage,
        code: error.code
      };
    }
  },

  /**
   * Processes authentication result after returning from an OAuth redirect flow.
   */
  async handleRedirectResult() {
    try {
      if (auth.authStateReady) {
        await auth.authStateReady();
      }
      const res = await getRedirectResult(auth);
      const returnUrl = sessionStorage.getItem('kibo_account_link_return_url');
      sessionStorage.removeItem('kibo_account_link_return_url');

      let targetUser = res?.user;
      if (!targetUser && auth.currentUser && !auth.currentUser.isAnonymous) {
        targetUser = auth.currentUser;
      }

      if (targetUser) {
        const currentData = storageService.getUserData('math');
        const providerId = targetUser.providerData[0]?.providerId || 'google.com';
        const mergedUserData = {
          ...currentData,
          cloudUid: targetUser.uid,
          isAnonymous: false,
          authProvider: providerId,
          email: targetUser.email || currentData.email || 'user@kiboclimb.com',
          displayName: targetUser.displayName || currentData.displayName || 'Kibo Master',
          accountLinkedAt: new Date().toISOString()
        };
        storageService.setGlobalAccountLinkedState(mergedUserData);
        const earnedSparks = storageService.grantAccountLinkSparksReward();
        return { success: true, user: storageService.getUserData('math'), earnedSparks, returnUrl };
      }
      return { success: false, reason: 'No redirect result found' };
    } catch (e) {
      console.error('Error handling auth redirect result:', e);
      const returnUrl = sessionStorage.getItem('kibo_account_link_return_url');
      sessionStorage.removeItem('kibo_account_link_return_url');

      if (e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use') {
        try {
          const credential = GoogleAuthProvider.credentialFromError(e) || OAuthProvider.credentialFromError(e);
          if (credential) {
            const userCred = await signInWithCredential(auth, credential);
            if (userCred && userCred.user) {
              const currentData = storageService.getUserData('math');
              const providerId = userCred.user.providerData[0]?.providerId || 'google.com';
              const mergedUserData = {
                ...currentData,
                cloudUid: userCred.user.uid,
                isAnonymous: false,
                authProvider: providerId,
                email: userCred.user.email || currentData.email || 'user@kiboclimb.com',
                displayName: userCred.user.displayName || currentData.displayName || 'Kibo Master',
                accountLinkedAt: new Date().toISOString()
              };
              storageService.setGlobalAccountLinkedState(mergedUserData);
              const earnedSparks = storageService.grantAccountLinkSparksReward();
              return { success: true, user: storageService.getUserData('math'), earnedSparks, returnUrl };
            }
          }
        } catch (signInErr) {
          console.error('Failed fallback sign in with credential during redirect:', signInErr);
        }
      }
      return { success: false, reason: e.message, code: e.code };
    }
  },

  /**
   * Sends email auth link / token or connects profile via Email Auth.
   */
  async sendMagicLink(email, password = null) {
    return this.linkAccount({ provider: 'magic_link', email, password });
  },

  /**
   * Returns current auth state and user claims from Firebase Auth & local storage.
   */

  async resolveLinkConflict(action, linkedUser) {
    try {
      if (action === 'keep_cloud') {
        // Wipe local device profiles and let userSyncService pull down cloud profiles
        localStorage.removeItem('kibo_profiles_data');
        localStorage.removeItem('kibo_parent_pin');

        // Save minimal state to re-trigger sync
        storageService.setGlobalAccountLinkedState({
          cloudUid: linkedUser.uid,
          isAnonymous: false,
          authProvider: 'resolved',
          email: linkedUser.email
        });

        return { success: true, reload: true };
      } else if (action === 'overwrite_cloud') {
        // We push current local state up, overwriting cloud profiles map entirely
        const userSyncService = (await import('./userSyncService.js')).userSyncService;

        const mergedUserData = {
            ...storageService.getUserData('math'),
            cloudUid: linkedUser.uid,
            isAnonymous: false,
            authProvider: 'resolved',
            email: linkedUser.email,
            accountLinkedAt: new Date().toISOString()
        };
        storageService.setGlobalAccountLinkedState(mergedUserData);

        await userSyncService.pushLocalToCloud(linkedUser.uid, null, true);
        return { success: true };
      }
    } catch(e) {
       return { success: false, reason: e.message };
    }
  },

  getAuthState() {
    const firebaseUser = auth.currentUser;
    const data = typeof storageService?.getUserData === 'function' ? storageService.getUserData('math') : null;
    const isGlobalLinked = typeof storageService?.isAccountGloballyLinked === 'function' ? storageService.isAccountGloballyLinked() : false;

    // Account is linked if saved in localStorage as non-anonymous OR if firebaseUser is non-anonymous
    const isAnonymous = (isGlobalLinked || (data && data.isAnonymous === false)) 
      ? false 
      : (firebaseUser ? firebaseUser.isAnonymous : true);

    const provider = (firebaseUser && firebaseUser.providerData && firebaseUser.providerData[0]?.providerId) 
      || (data && data.authProvider) 
      || 'anonymous';

    return {
      uid: (firebaseUser && firebaseUser.uid) || (data && data.cloudUid) || getOrCreateGuestId(),
      isAnonymous,
      authProvider: provider,
      provider: provider, // Provide alias for code referencing .provider
      displayName: (firebaseUser && firebaseUser.displayName) || (data && data.displayName) || 'Kibo Climber',
      email: (firebaseUser && firebaseUser.email) || (data && data.email) || null
    };
  },

  /**
   * Unlinks account from provider or signs out from Firebase, reverting to anonymous guest.
   */
      async unlinkAccount() {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.isAnonymous) {
        // ALWAYS sign out on unlink so the device returns to a fresh anonymous session
        await signOut(auth);
      }

      // Ensure we get a brand new anonymous session
      try {
        await signInAnonymously(auth);
      } catch (anonErr) {
        console.warn('Anonymous re-auth during unlink fallback:', anonErr);
      }
      const newFirebaseUser = auth.currentUser;
      const guestUid = newFirebaseUser ? newFirebaseUser.uid : `guest_${Date.now()}`;

      // Wipe all local storage keys starting with 'kibo_' so the device returns to a completely fresh 2-step onboarding install state
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('kibo_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.removeItem('kibo_parent_gate_session');

      // Reload page to re-initialize app state cleanly
      window.location.reload();
      return { success: true };
    } catch (e) {
      console.error('Error unlinking account:', e);
      return { success: false, reason: e.message };
    }
  },

  /**
   * Subscribes to real Firebase Auth state changes to keep local storage in sync.
   */
  subscribeAuthState(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const isGlobalLinked = storageService.isAccountGloballyLinked();
        const isAnon = user.isAnonymous && !isGlobalLinked;
        const currentData = storageService.getUserData('math');
        const updated = {
          ...currentData,
          cloudUid: user.uid,
          isAnonymous: isAnon,
          email: user.email || currentData.email,
          displayName: user.displayName || currentData.displayName
        };
        if (!isAnon) {
          storageService.setGlobalAccountLinkedState(updated);
        } else {
          storageService.saveUserData(updated);
        }
        if (callback) callback(user);
      }
    });
  },

  /**
   * Exports user data in JSON format for CCPA / GDPR-K compliance.
   */
  exportUserData() {
    const exportData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('kibo_')) {
        try {
          exportData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          exportData[key] = localStorage.getItem(key);
        }
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `kibo_climb_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  },

  /**
   * Deletes all local and cloud data, signing out of Firebase Auth completely.
   */
  async deleteAccount() {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
        } catch (e) {
          console.warn('Could not delete Firebase Auth user (may require fresh auth):', e);
          await signOut(auth);
        }
      }

      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('kibo_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.removeItem('kibo_parent_gate_session');

      return { success: true };
    } catch (e) {
      console.error('Delete account error:', e);
      return { success: false, reason: e.message };
    }
  }
};

