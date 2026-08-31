import OneSignalReact from 'react-onesignal';
import { Capacitor } from '@capacitor/core';
import OneSignalCapacitor from '@onesignal/capacitor-plugin';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

// Internal state to track initialization
let isInitialized = false;

export const initOneSignal = async () => {
  if (!APP_ID) {
    console.warn('[OneSignal] Missing VITE_ONESIGNAL_APP_ID in environment.');
    return;
  }

  if (isInitialized) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Initialize OneSignal for Capacitor (iOS/Android)
      OneSignalCapacitor.initialize(APP_ID);

      // Request permission immediately for simplicity, or defer based on your UX
      OneSignalCapacitor.Notifications.requestPermission(true);

      isInitialized = true;
      console.log('[OneSignal] Capacitor SDK initialized');
    } else {
      // Initialize OneSignal for Web
      await OneSignalReact.init({
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true, // Useful for dev
        notifyButton: {
          enable: false, // We'll manage prompting via custom UI
        },
      });

      isInitialized = true;
      console.log('[OneSignal] Web SDK initialized');
    }
  } catch (error) {
    console.error('[OneSignal] Initialization error:', error);
  }
};

/**
 * Associates the device with a specific user ID for targeted pushes.
 */
export const loginToOneSignal = async (externalUserId) => {
  if (!isInitialized || !externalUserId) return;

  try {
    if (Capacitor.isNativePlatform()) {
      OneSignalCapacitor.login(externalUserId);
    } else {
      await OneSignalReact.login(externalUserId);
    }
    console.log(`[OneSignal] Logged in user: ${externalUserId}`);
  } catch (error) {
    console.error('[OneSignal] Login error:', error);
  }
};

/**
 * Removes the association between the device and the user ID.
 */
export const logoutFromOneSignal = async () => {
  if (!isInitialized) return;

  try {
    if (Capacitor.isNativePlatform()) {
      OneSignalCapacitor.logout();
    } else {
      await OneSignalReact.logout();
    }
    console.log('[OneSignal] Logged out user');
  } catch (error) {
    console.error('[OneSignal] Logout error:', error);
  }
};

/**
 * Prompts the user for push notification permission (mostly for web/custom flows).
 */
export const promptForPushPermissions = async () => {
  if (!isInitialized) return false;

  try {
    if (Capacitor.isNativePlatform()) {
      const permission = await OneSignalCapacitor.Notifications.requestPermission(true);
      return permission;
    } else {
      // Slidedown prompt for web
      await OneSignalReact.Slidedown.promptPush();
      return true;
    }
  } catch (error) {
    console.error('[OneSignal] Permission prompt error:', error);
    return false;
  }
};
