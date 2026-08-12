import { 
  signInAnonymously, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  linkWithPopup, 
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  unlink, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';
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

export const authService = {
  /**
   * Initializes real Firebase anonymous user or handles returning OAuth redirect on application launch.
   */
  async initAnonymousGuest() {
    try {
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
      const userData = storageService.getUserData();
      if (userData && userData.isAnonymous === false) {
        const activeProfile = storageService.getActiveProfile();
        return {
          ...activeProfile,
          cloudUid: userData.cloudUid || activeProfile.cloudUid,
          isAnonymous: false,
          authProvider: userData.authProvider || 'google.com'
        };
      }

      // 3. Wait for Firebase auth state to settle before creating a brand new guest user
      if (auth.authStateReady) {
        await auth.authStateReady();
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

      storageService.saveUserData({
        cloudUid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous,
        authProvider: updatedProfile.authProvider
      });

      return updatedProfile;
    } catch (e) {
      console.warn('Firebase Anonymous Auth failed, using local fallback guest ID:', e);
      const guestId = getOrCreateGuestId();
      const activeProfile = storageService.getActiveProfile();
      const userData = storageService.getUserData();
      const isAlreadyLinked = userData && userData.isAnonymous === false;
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
            if (linkError.code === 'auth/credential-already-in-use') {
              const res = await signInWithPopup(auth, googleProvider);
              linkedUser = res.user;
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
            if (linkError.code === 'auth/credential-already-in-use') {
              const res = await signInWithPopup(auth, appleProvider);
              linkedUser = res.user;
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

      const currentData = storageService.getUserData();
      const mergedUserData = {
        ...currentData,
        cloudUid: linkedUser ? linkedUser.uid : `uid_${Date.now()}`,
        isAnonymous: linkedUser ? linkedUser.isAnonymous : false,
        authProvider: authProviderName,
        email: (linkedUser && linkedUser.email) || email || `${provider}_user@kiboclimb.com`,
        displayName: (linkedUser && linkedUser.displayName) || currentData.name || 'Kibo Master',
        accountLinkedAt: new Date().toISOString()
      };

      storageService.saveUserData(mergedUserData);
      const earnedSparks = storageService.grantAccountLinkSparksReward();

      return {
        success: true,
        user: storageService.getUserData(),
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
      const res = await getRedirectResult(auth);
      if (res && res.user) {
        const currentData = storageService.getUserData();
        const providerId = res.user.providerData[0]?.providerId || 'google.com';
        const mergedUserData = {
          ...currentData,
          cloudUid: res.user.uid,
          isAnonymous: false,
          authProvider: providerId,
          email: res.user.email || currentData.email || 'user@kiboclimb.com',
          displayName: res.user.displayName || currentData.displayName || 'Kibo Master',
          accountLinkedAt: new Date().toISOString()
        };
        storageService.saveUserData(mergedUserData);
        const earnedSparks = storageService.grantAccountLinkSparksReward();
        return { success: true, user: storageService.getUserData(), earnedSparks };
      }
      return { success: false, reason: 'No redirect result found' };
    } catch (e) {
      console.error('Error handling auth redirect result:', e);
      if (e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use') {
        try {
          const credential = GoogleAuthProvider.credentialFromError(e) || OAuthProvider.credentialFromError(e);
          if (credential) {
            const userCred = await signInWithCredential(auth, credential);
            if (userCred && userCred.user) {
              const currentData = storageService.getUserData();
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
              storageService.saveUserData(mergedUserData);
              const earnedSparks = storageService.grantAccountLinkSparksReward();
              return { success: true, user: storageService.getUserData(), earnedSparks };
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
  getAuthState() {
    const firebaseUser = auth.currentUser;
    const data = storageService.getUserData();

    // Account is linked if saved in localStorage as non-anonymous OR if firebaseUser is non-anonymous
    const isAnonymous = (data && data.isAnonymous === false) 
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
        // Attempt to unlink provider if available, or sign out and create new anonymous account
        if (currentUser.providerData && currentUser.providerData.length > 0) {
          const providerId = currentUser.providerData[0].providerId;
          try {
            await unlink(currentUser, providerId);
          } catch (e) {
            console.warn('Unlink provider failed, signing out:', e);
            await signOut(auth);
            await signInAnonymously(auth);
          }
        } else {
          await signOut(auth);
          await signInAnonymously(auth);
        }
      }

      const newFirebaseUser = auth.currentUser;
      const currentData = storageService.getUserData();

      const mergedUserData = {
        ...currentData,
        cloudUid: newFirebaseUser ? newFirebaseUser.uid : `guest_${Date.now()}`,
        isAnonymous: true,
        authProvider: 'anonymous',
        email: null,
        accountLinkedAt: null,
        promptedLinkMilestones: [],
        lastPromptedLinkAt: null
      };

      storageService.saveUserData(mergedUserData);
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
        const currentData = storageService.getUserData();
        const isAnon = user.isAnonymous && currentData.isAnonymous !== false;
        const updated = {
          ...currentData,
          cloudUid: user.uid,
          isAnonymous: isAnon,
          email: user.email || currentData.email,
          displayName: user.displayName || currentData.displayName
        };
        storageService.saveUserData(updated);
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

