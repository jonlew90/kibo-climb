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

  console.log('[OneSignal] Initializing with APP_ID:', APP_ID);

  if (isInitialized || (typeof window !== 'undefined' && window.OneSignal?.initialized)) {
    isInitialized = true;
    console.log('[OneSignal] Already initialized.');
    return;
  }

  try {
    await loadCapacitorDependencies();

    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      OneSignalCapacitor.initialize(APP_ID);
      OneSignalCapacitor.Notifications?.requestPermission(true);
      isInitialized = true;
      console.log('[OneSignal] Native Capacitor initialized.');
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
        console.log('[OneSignal] Web SDK initialized successfully.');
      }
      isInitialized = true;
    }
  } catch (error) {
    if (error?.message?.includes('already initialized')) {
      isInitialized = true;
      console.log('[OneSignal] Init note: already initialized');
    } else {
      console.warn('[OneSignal] Initialization error:', error?.message || error);
    }
  }
};

/**
 * Associates the device with a specific user ID for targeted pushes.
 */
export const loginToOneSignal = async (externalUserId) => {
  if (!externalUserId) {
    console.warn('[OneSignal] loginToOneSignal called without externalUserId');
    return;
  }

  console.log('[OneSignal] Attempting login with externalUserId:', externalUserId);

  try {
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      await OneSignalCapacitor.login(externalUserId);
      console.log('[OneSignal] Native login complete.');
      return;
    }

    const os = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (os) {
      if (typeof os.login === 'function') {
        await os.login(externalUserId);
        console.log('[OneSignal] Web os.login() resolved.');
      } else if (OneSignalReact && typeof OneSignalReact.login === 'function') {
        await OneSignalReact.login(externalUserId);
        console.log('[OneSignal] OneSignalReact.login() resolved.');
      }

      // Check PushSubscription status & opt-in
      if (os.User?.PushSubscription) {
        const isOptedIn = os.User.PushSubscription.optedIn;
        const pushId = os.User.PushSubscription.id;
        const pushToken = os.User.PushSubscription.token;
        console.log('[OneSignal] PushSubscription status:', { isOptedIn, pushId, pushToken });

        if (!isOptedIn && typeof os.User.PushSubscription.optIn === 'function') {
          console.log('[OneSignal] Calling PushSubscription.optIn()...');
          await os.User.PushSubscription.optIn();
          console.log('[OneSignal] PushSubscription optIn resolved.');
        }
      }
      
      console.log('[OneSignal] Current OneSignal User state:', {
        externalId: os.User?.externalId,
        onesignalId: os.User?.onesignalId
      });
    }
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
  } catch (error) {
    console.warn('[OneSignal] Logout error:', error?.message || error);
  }
};

/**
 * Prompts the user for push notification permission (mostly for web/custom flows).
 */
export const promptForPushPermissions = async () => {
  console.log('[OneSignal] promptForPushPermissions invoked');
  try {
    // 1. Native Capacitor
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      const permission = await OneSignalCapacitor.Notifications?.requestPermission(true);
      return permission;
    }

    // 2. OneSignal Web SDK (v16+)
    const os = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (os?.Notifications?.requestPermission) {
      console.log('[OneSignal] Requesting permission via os.Notifications.requestPermission()...');
      await os.Notifications.requestPermission();
      if (os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return true;
    }
    if (os?.Slidedown?.promptPush) {
      console.log('[OneSignal] Requesting permission via os.Slidedown.promptPush()...');
      await os.Slidedown.promptPush();
      if (os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return true;
    }

    // 3. Browser native Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      console.log('[OneSignal] Requesting permission via window.Notification.requestPermission()...');
      const perm = await Notification.requestPermission();
      if (perm === 'granted' && os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return perm === 'granted';
    }

    return false;
  } catch (error) {
    console.warn('[OneSignal] Permission prompt error:', error?.message || error);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (e) {
        console.warn('[Notification API] Fallback error:', e);
      }
    }
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
