// src/services/userSyncService.js
// Real-time Cloud Firestore Sync Service for Kibo Climb
// Supports multi-device bi-directional synchronization with offline fallback

import { db, auth } from '../config/firebase';
import { doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { storageService } from './storageService';

const USERS_COLLECTION = 'users';

class UserSyncService {
  constructor() {
    this.unsubscribeListener = null;
    this.isSyncingFromCloud = false;
    this.debounceTimer = null;
    this.currentUid = null;
  }

  /**
   * Initializes real-time listener for current user's profile in Firestore.
   */
  initUserSync(uid, onCloudUpdate = null) {
    if (!uid) return;
    if (this.currentUid === uid && this.unsubscribeListener) return;

    // Clean up existing listener if UID changed
    this.stopSync();
    this.currentUid = uid;

    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);

      this.unsubscribeListener = onSnapshot(userDocRef, (docSnap) => {
        if (!docSnap.exists()) {
          // Push initial local state to Firestore if doc doesn't exist yet
          this.pushLocalToCloud(uid);
          return;
        }

        const cloudData = docSnap.data();
        if (!cloudData || !cloudData.profiles) return;

        // Prevent echo loop when we just pushed changes to cloud
        this.isSyncingFromCloud = true;
        try {
          const localProfilesState = storageService.getAllProfiles();
          const cloudProfiles = cloudData.profiles;

          // Merge cloud profiles into local storage
          let updated = false;
          Object.keys(cloudProfiles).forEach((profileId) => {
            const cloudProfile = cloudProfiles[profileId];
            const localProfile = storageService.getProfileById(profileId);

            if (!localProfile) {
              // Profile exists in cloud but not locally -> create/save
              storageService.updateProfile(profileId, cloudProfile);
              updated = true;
            } else {
              // Compare timestamps or merge user data
              const cloudTimestamp = cloudProfile.updatedAtMillis || 0;
              const localTimestamp = localProfile.updatedAtMillis || 0;

              if (cloudTimestamp >= localTimestamp) {
                storageService.updateProfile(profileId, cloudProfile);
                updated = true;
              }
            }
          });

          if (updated && typeof onCloudUpdate === 'function') {
            onCloudUpdate();
          }
        } finally {
          this.isSyncingFromCloud = false;
        }
      }, (error) => {
        console.warn('UserSyncService: Firestore listener fallback (offline/permissions)', error);
      });
    } catch (e) {
      console.warn('UserSyncService: Failed to attach Firestore listener', e);
    }
  }

  /**
   * Stops real-time listener.
   */
  stopSync() {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
    this.currentUid = null;
  }

  /**
   * Debounced push of local profiles & user data to Cloud Firestore.
   */

  async processPendingReferrals() {
    const authState = auth.currentUser;
    if (!authState || authState.isAnonymous) return;

    const referredBy = localStorage.getItem('kibo_referred_by');
    if (!referredBy) return;

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { app } = await import('../config/firebase');
      const functions = getFunctions(app);
      const processReferral = httpsCallable(functions, 'processReferralLinking');

      await processReferral({ referrerId: referredBy, newUserId: authState.uid });
      localStorage.removeItem('kibo_referred_by');
      console.log('Referral processed successfully');
    } catch (e) {
      console.error('Failed to process referral linking', e);
    }
  }

  syncProfileToCloud(profileId) {
    if (this.isSyncingFromCloud) return;

    // Check COPPA consent before pushing child profile data to cloud
    try {
      const coppaConsent = JSON.parse(localStorage.getItem('kibo_parent_account_schema') || '{}')?.coppa_consent;
      if (coppaConsent && coppaConsent.consented === false) {
        return;
      }
    } catch (e) {}

    const currentUser = auth.currentUser;
    const uid = currentUser ? currentUser.uid : storageService.getUserData('math')?.cloudUid;
    if (!uid) return;

    // Check if we should process a pending referral (only if not anonymous)
    if (currentUser && !currentUser.isAnonymous) {
      this.processPendingReferrals();
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.pushLocalToCloud(uid, profileId);
    }, 1000);
  }

  /**
   * Directly pushes local profiles state to Firestore.
   */
  async pushLocalToCloud(uid, specificProfileId = null, overwriteEntireDocument = false) {
    try {
      const currentUser = auth.currentUser;
      const targetUid = currentUser ? currentUser.uid : uid;
      
      // Do not attempt write if user is not authenticated yet (prevents permission errors)
      if (!currentUser && !targetUid) return;

      const allProfiles = storageService.getAllProfiles();
      const profilesMap = {};
      const now = Date.now();

      allProfiles.forEach((prof) => {
        const profCopy = {
          ...prof,
          userData: prof.userData ? { ...prof.userData } : undefined
        };
        if (profCopy.userData && profCopy.userData.email) {
          delete profCopy.userData.email;
        }

        profilesMap[prof.id] = {
          ...profCopy,
          updatedAtMillis: now
        };
      });

      const userDocRef = doc(db, USERS_COLLECTION, targetUid);
      const payload = {
        uid: targetUid,
        activeProfileId: storageService.getActiveProfileId(),
        profiles: profilesMap,
        updatedAt: serverTimestamp(),
        lastSyncedMillis: now
      };

      if (overwriteEntireDocument) {
        await setDoc(userDocRef, payload);
      } else {
        await setDoc(userDocRef, payload, { merge: true });
      }
    } catch (error) {
      console.warn('UserSyncService: Cloud sync failed (will retry online)', error);
    }
  }
}

export const userSyncService = new UserSyncService();
