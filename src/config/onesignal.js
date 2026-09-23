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
let initPromise = null;

export const initOneSignal = async () => {
  if (!APP_ID) {
    if (import.meta.env.DEV) console.warn('[OneSignal] Missing VITE_ONESIGNAL_APP_ID in environment.');
    return;
  }

  if (isInitialized || (typeof window !== 'undefined' && window.OneSignal?.initialized)) {
    isInitialized = true;
    return;
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await loadCapacitorDependencies();

      if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
        OneSignalCapacitor.initialize(APP_ID);
        OneSignalCapacitor.Notifications?.requestPermission(true);
        isInitialized = true;
      } else if (typeof window !== 'undefined' && OneSignalReact) {
        // Suppress OneSignal SDK v16 WorkerMessenger errors before push permission is granted
        if (!window.__onesignal_wm_patched) {
          window.__onesignal_wm_patched = true;
          const origConsoleError = console.error;
          console.error = function (...args) {
            if (typeof args[0] === 'string' && args[0].includes('[WM]')) {
              return;
            }
            return origConsoleError.apply(console, args);
          };
        }

        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/push/onesignal/OneSignalSDKWorker.js', {
              scope: '/push/onesignal/'
            });
          } catch (e) {}
        }

        if (!window.OneSignal?.initialized) {
          await OneSignalReact.init({
            appId: APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/push/onesignal/' },
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
      } else if (import.meta.env.DEV) {
        console.warn('[OneSignal] Initialization note:', error?.message || error);
      }
    }
  })();

  return initPromise;
};

/**
 * Associates the device with a specific user ID for targeted pushes.
 */
export const loginToOneSignal = async (externalUserId) => {
  if (!externalUserId) return;

  try {
    if (!isInitialized) {
      await initOneSignal();
    }

    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      await OneSignalCapacitor.login(externalUserId);
      return;
    }

    const os = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (os) {
      const executeLogin = async () => {
        if (typeof os.login === 'function') {
          await os.login(externalUserId);
        } else if (OneSignalReact && typeof OneSignalReact.login === 'function') {
          await OneSignalReact.login(externalUserId);
        }
      };

      try {
        await executeLogin();
      } catch (err) {
        if (err?.message?.includes('reading \'Qe\'') || err?.message?.includes('undefined')) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          await executeLogin().catch(() => {});
        } else {
          throw err;
        }
      }

      // Check PushSubscription status & opt-in
      if (os.User?.PushSubscription) {
        const isOptedIn = os.User.PushSubscription.optedIn;
        if (!isOptedIn && typeof os.User.PushSubscription.optIn === 'function') {
          await os.User.PushSubscription.optIn();
        }
      }
    }
  } catch (error) {
    if (import.meta.env.DEV && !error?.message?.includes('reading \'Qe\'')) {
      console.warn('[OneSignal] Login note:', error?.message || error);
    }
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
    if (import.meta.env.DEV) console.warn('[OneSignal] Logout error:', error?.message || error);
  }
};

/**
 * Prompts the user for push notification permission (mostly for web/custom flows).
 */
export const promptForPushPermissions = async () => {
  try {
    // 1. Native Capacitor
    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      const permission = await OneSignalCapacitor.Notifications?.requestPermission(true);
      return permission;
    }

    // 2. OneSignal Web SDK (v16+)
    const os = (typeof window !== 'undefined' && window.OneSignal) || OneSignalReact;
    if (os?.Notifications?.requestPermission) {
      await os.Notifications.requestPermission();
      if (os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return true;
    }
    if (os?.Slidedown?.promptPush) {
      await os.Slidedown.promptPush();
      if (os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return true;
    }

    // 3. Browser native Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted' && os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      return perm === 'granted';
    }

    return false;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[OneSignal] Permission prompt error:', error?.message || error);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Notification API] Fallback error:', e);
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
