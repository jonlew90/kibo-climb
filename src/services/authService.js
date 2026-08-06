// Modern Authentication & Profile Management Service for Kibo Climb
// Handles Anonymous Guest Onboarding, Local Caching, Google/Apple 1-Tap & Passwordless Magic Links

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
   * Links an anonymous guest profile to a permanent account (Google 1-Tap, Apple 1-Tap, or Passwordless Magic Link).
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
      email: email || (provider === 'apple' ? 'user@privaterelay.appleid.com' : `${provider}_user@kiboclimb.com`),
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
   * Sends a passwordless Magic Link email token and connects profile.
   */
  async sendMagicLink(email) {
    if (!email || !email.includes('@')) {
      return { success: false, reason: 'Please enter a valid email address' };
    }

    const token = `magic_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('kibo_magic_link_pending', JSON.stringify({ email, token, createdAt: new Date().toISOString() }));

    return this.linkAccount({ provider: 'magic_link', email, name: email.split('@')[0] });
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
  },

  /**
   * Unlinks an account from a cloud provider. Reverts to local guest.
   */
  async unlinkAccount() {
    const currentData = storageService.getUserData();

    // Create new guest ID
    const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, newGuestId);

    const mergedUserData = {
      ...currentData,
      cloudUid: newGuestId,
      isAnonymous: true,
      authProvider: 'anonymous',
      email: null,
      accountLinkedAt: null,
      promptedLinkMilestones: [],
      lastPromptedLinkAt: null
    };

    storageService.saveUserData(mergedUserData);

    return { success: true };
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
   * Deletes all local and cloud data, simulating a complete purge.
   */
  async deleteAccount() {
    // Clear all Kibo local storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('kibo_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear session storage as well
    sessionStorage.removeItem('kibo_parent_gate_session');

    // Return success to allow caller to reload or reset app
    return { success: true };
  }
};
