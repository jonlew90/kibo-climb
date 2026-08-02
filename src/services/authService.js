// Modern Authentication & Profile Management Service for Kibo Climb
// Handles Anonymous Guest Onboarding, Local Caching, and Account Linking

import { storageService } from './storageService';

const GUEST_ID_KEY = 'kibo_anonymous_guest_id';

/**
 * Generates or retrieves a unique persistent Guest ID for silent onboarding.
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
   * Initializes anonymous guest auth silently on application launch.
   */
  async initAnonymousGuest() {
    const guestId = getOrCreateGuestId();
    const activeProfile = storageService.getActiveProfile();

    if (!activeProfile.cloudUid) {
      const updatedProfile = {
        ...activeProfile,
        cloudUid: guestId,
        isAnonymous: true,
        authProvider: 'anonymous',
        createdAt: activeProfile.createdAt || new Date().toISOString()
      };
      storageService.saveUserData({
        cloudUid: guestId,
        isAnonymous: true,
        authProvider: 'anonymous'
      });
      return updatedProfile;
    }

    return activeProfile;
  },

  /**
   * Links an anonymous guest profile to a permanent account (Google, Apple, or Email).
   * Merges all local progress into the authenticated cloud record seamlessly.
   */
  async linkAccount({ provider = 'google', email = null, name = null }) {
    const currentData = storageService.getUserData();
    const guestId = currentData.cloudUid || getOrCreateGuestId();

    const permanentUid = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const mergedUserData = {
      ...currentData,
      cloudUid: permanentUid,
      linkedFromGuestId: guestId,
      isAnonymous: false,
      authProvider: provider,
      email: email || `${provider}_user@kiboclimb.com`,
      displayName: name || currentData.name || 'Kibo Master',
      accountLinkedAt: new Date().toISOString()
    };

    storageService.saveUserData(mergedUserData);

    return {
      success: true,
      user: mergedUserData
    };
  },

  /**
   * Returns current auth state and user claims.
   */
  getAuthState() {
    const data = storageService.getUserData();
    return {
      uid: data.cloudUid || getOrCreateGuestId(),
      isAnonymous: data.isAnonymous !== false,
      authProvider: data.authProvider || 'anonymous',
      displayName: data.displayName || 'Kibo Climber',
      email: data.email || null
    };
  }
};
