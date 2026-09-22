import OneSignalReact from 'react-onesignal';

let OneSignalCapacitor = null;
let Capacitor = null;

// Dynamically load Capacitor dependencies on native mobile
const loadCapacitorDependencies = async () => {
  try {
    const capCore = await import('@capacitor/core');
    Capacitor = capCore?.Capacitor;
    if (Capacitor?.isNativePlatform()) {
      const capPlugin = await import('@onesignal/capacitor-plugin');
      OneSignalCapacitor = capPlugin.default || capPlugin.OneSignal;
    }
  } catch (e) {
    // Non-native / Web environment
  }
};

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'd192b852-cda6-4a6b-897a-51b3831ab1af';

// Internal state to track initialization
let isInitialized = false;

export const initOneSignal = async () => {
  if (!APP_ID) {
    console.warn('[OneSignal] Missing VITE_ONESIGNAL_APP_ID in environment.');
    return;
  }

  if (isInitialized || (typeof window !== 'undefined' && window.OneSignal?.initialized)) {
    isInitialized = true;
    return;
  }

  try {
    await loadCapacitorDependencies();

    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.initialize(APP_ID);
      OneSignalCapacitor.Notifications?.requestPermission(true);
      isInitialized = true;
    } else if (typeof window !== 'undefined' && OneSignalReact) {
      if (!window.OneSignal?.initialized) {
        await OneSignalReact.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          notifyButton: {
            enable: false,
          },
        });
      }
      isInitialized = true;
    }
  } catch (error) {
    if (error?.message?.includes('already initialized')) {
      isInitialized = true;
    } else if (error?.message?.includes('Can only be used on')) {
      // Expected in non-production environments
    } else {
      console.warn('[OneSignal] Initialization note:', error?.message || error);
    }
  }
};

/**
 * Associates the device with a specific user ID for targeted pushes.
 */
export const loginToOneSignal = async (externalUserId) => {
  if (!isInitialized || !externalUserId) return;

  try {
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.login(externalUserId);
    } else if (OneSignalReact) {
      await OneSignalReact.login(externalUserId);
    }
  } catch (error) {
    console.warn('[OneSignal] Login error:', error?.message || error);
  }
};

/**
 * Removes the association between the device and the user ID.
 */
export const logoutFromOneSignal = async () => {
  if (!isInitialized) return;

  try {
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.logout();
    } else if (OneSignalReact) {
      await OneSignalReact.logout();
    }
  } catch (error) {
    console.warn('[OneSignal] Logout error:', error?.message || error);
  }
};

/**
 * Prompts the user for push notification permission (mostly for web/custom flows).
 */
export const promptForPushPermissions = async () => {
  if (!isInitialized) return false;

  try {
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      const permission = await OneSignalCapacitor.Notifications?.requestPermission(true);
      return permission;
    } else if (OneSignalReact?.Slidedown) {
      await OneSignalReact.Slidedown.promptPush();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[OneSignal] Permission prompt error:', error?.message || error);
    return false;
  }
};

/**
 * Sets an in-app trigger key/value for targeted In-App Messages in OneSignal.
 * E.g.: sendOneSignalTrigger('screen', 'parent_dashboard')
 */
export const sendOneSignalTrigger = (key, value) => {
  if (!key) return;

  try {
    // 1. Native Capacitor
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor?.InAppMessages?.addTrigger) {
      OneSignalCapacitor.InAppMessages.addTrigger(key, value);
      return;
    }

    // 2. Global Web OneSignal window object (OneSignal SDK v16 / Web)
    const osObj = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (osObj) {
      if (typeof osObj.InAppMessages?.addTrigger === 'function') {
        osObj.InAppMessages.addTrigger(key, value);
      } else if (typeof osObj.InAppMessages?.addTriggers === 'function') {
        osObj.InAppMessages.addTriggers({ [key]: value });
      } else if (typeof osObj.addTrigger === 'function') {
        osObj.addTrigger(key, value);
      } else if (typeof osObj.push === 'function') {
        osObj.push(() => {
          if (window.OneSignal?.InAppMessages?.addTrigger) {
            window.OneSignal.InAppMessages.addTrigger(key, value);
          } else if (window.OneSignal?.addTrigger) {
            window.OneSignal.addTrigger(key, value);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[OneSignal] Failed to set In-App Message trigger:', err?.message || err);
  }
};

/**
 * Convenience helper to set the current active screen context.
 */
export const setOneSignalScreen = (screenName) => {
  sendOneSignalTrigger('screen', screenName);
};
