let OneSignalReact = null;
let OneSignalCapacitor = null;
let Capacitor = null;

// Dynamically load dependencies safely
const loadDependencies = async () => {
  try {
    const capCore = await (typeof window !== 'undefined' ? import('@capacitor/core') : Promise.reject());
    Capacitor = capCore?.Capacitor;
  } catch (e) {
    Capacitor = { isNativePlatform: () => false };
  }

  try {
    if (Capacitor?.isNativePlatform()) {
      const capPluginPkg = '@onesignal/capacitor-plugin';
      const capPlugin = await import(/* @vite-ignore */ capPluginPkg);
      OneSignalCapacitor = capPlugin.default || capPlugin.OneSignal;
    } else {
      const reactPluginPkg = 'react-onesignal';
      const reactPlugin = await import(/* @vite-ignore */ reactPluginPkg);
      OneSignalReact = reactPlugin.default || reactPlugin.OneSignal;
    }
  } catch (e) {
    // SDKs not installed or running in test/mock environment
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

  if (isInitialized) return;

  try {
    await loadDependencies();

    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.initialize(APP_ID);
      OneSignalCapacitor.Notifications?.requestPermission(true);
      isInitialized = true;
      console.log('[OneSignal] Capacitor SDK initialized');
    } else if (OneSignalReact) {
      await OneSignalReact.init({
        appId: APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
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
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.login(externalUserId);
    } else if (OneSignalReact) {
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
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.logout();
    } else if (OneSignalReact) {
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
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      const permission = await OneSignalCapacitor.Notifications?.requestPermission(true);
      return permission;
    } else if (OneSignalReact?.Slidedown) {
      await OneSignalReact.Slidedown.promptPush();
      return true;
    }
    return false;
  } catch (error) {
    console.error('[OneSignal] Permission prompt error:', error);
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
      console.log(`[OneSignal] Native trigger set: ${key}=${value}`);
      return;
    }

    // 2. Global Web OneSignal window object (OneSignal SDK v16 / Web)
    const osObj = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (osObj) {
      if (typeof osObj.InAppMessages?.addTrigger === 'function') {
        osObj.InAppMessages.addTrigger(key, value);
        console.log(`[OneSignal] Web InAppMessages trigger set: ${key}=${value}`);
      } else if (typeof osObj.InAppMessages?.addTriggers === 'function') {
        osObj.InAppMessages.addTriggers({ [key]: value });
        console.log(`[OneSignal] Web InAppMessages addTriggers set: ${key}=${value}`);
      } else if (typeof osObj.addTrigger === 'function') {
        osObj.addTrigger(key, value);
        console.log(`[OneSignal] Legacy addTrigger set: ${key}=${value}`);
      } else if (typeof osObj.push === 'function') {
        osObj.push(() => {
          if (window.OneSignal?.InAppMessages?.addTrigger) {
            window.OneSignal.InAppMessages.addTrigger(key, value);
          } else if (window.OneSignal?.addTrigger) {
            window.OneSignal.addTrigger(key, value);
          }
          console.log(`[OneSignal] Queued trigger set: ${key}=${value}`);
        });
      }
    }
  } catch (err) {
    console.warn('[OneSignal] Failed to set In-App Message trigger:', err);
  }
};

/**
 * Convenience helper to set the current active screen context.
 */
export const setOneSignalScreen = (screenName) => {
  sendOneSignalTrigger('screen', screenName);
};
