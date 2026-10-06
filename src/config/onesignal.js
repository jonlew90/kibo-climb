// src/config/onesignal.js
// OneSignal Push Notification Integration for Kibo Climb
// Active support: Delivers scheduled & manual push notifications to Android PWAs,
// web browsers, and native mobile environments with subscription ID sync to Firestore.

import OneSignalReact from 'react-onesignal';
import { auth } from './firebase';
import { storageService } from '../services/storageService';
import { userSyncService } from '../services/userSyncService';

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
            await navigator.serviceWorker.register('/OneSignalSDKWorker.js', {
              scope: '/'
            });
          } catch (e) {}
        }

        if (!window.OneSignal?.initialized) {
          await OneSignalReact.init({
            appId: APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: 'OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' },
            notifyButton: {
              enable: false,
            },
          });
        }
        isInitialized = true;

        // Automatically bind subscription opt-in & current user if already permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const os = window.OneSignal || OneSignalReact;
          if (os?.User?.PushSubscription?.optIn && !os.User.PushSubscription.optedIn) {
            try {
              await os.User.PushSubscription.optIn();
            } catch (e) {}
          }
        }

        // Cache and sync subscription ID to cloud
        try {
          const os = window.OneSignal || OneSignalReact;
          const subId = os?.User?.PushSubscription?.id;
          if (subId) {
            storageService.saveOneSignalSubscriptionId(subId);
            if (auth.currentUser?.uid) {
              loginToOneSignal(auth.currentUser.uid, auth.currentUser.email || null);
              userSyncService.pushLocalToCloud(auth.currentUser.uid);
            }
          }

          // Listen for push subscription changes
          if (os?.User?.PushSubscription?.addEventListener) {
            os.User.PushSubscription.addEventListener('change', (event) => {
              const newSubId = event?.current?.id || os?.User?.PushSubscription?.id;
              if (newSubId) {
                storageService.saveOneSignalSubscriptionId(newSubId);
                if (auth.currentUser?.uid) {
                  loginToOneSignal(auth.currentUser.uid, auth.currentUser.email || null);
                  userSyncService.pushLocalToCloud(auth.currentUser.uid);
                }
              }
            });
          }
        } catch (e) {}
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
export const loginToOneSignal = async (externalUserId, email = null) => {
  if (!externalUserId) return;

  try {
    if (!isInitialized) {
      await initOneSignal();
    }

    if (Capacitor?.isNativePlatform() && OneSignalCapacitor) {
      await OneSignalCapacitor.login(externalUserId);
      if (email && OneSignalCapacitor?.User?.addEmail) {
        try { await OneSignalCapacitor.User.addEmail(email); } catch (e) {}
      }
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
        if (email && os.User?.addEmail) {
          try { await os.User.addEmail(email); } catch (e) {}
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
        const subId = os.User.PushSubscription.id || storageService.getOneSignalSubscriptionId();
        if (subId) {
          storageService.saveOneSignalSubscriptionId(subId);
          userSyncService.pushLocalToCloud(externalUserId);
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
      const subId = os?.User?.PushSubscription?.id;
      if (subId) {
        storageService.saveOneSignalSubscriptionId(subId);
        if (auth.currentUser?.uid) {
          userSyncService.pushLocalToCloud(auth.currentUser.uid);
        }
      }
      return true;
    }
    if (os?.Slidedown?.promptPush) {
      await os.Slidedown.promptPush();
      if (os?.User?.PushSubscription?.optIn) {
        await os.User.PushSubscription.optIn();
      }
      const subId = os?.User?.PushSubscription?.id;
      if (subId) {
        storageService.saveOneSignalSubscriptionId(subId);
        if (auth.currentUser?.uid) {
          userSyncService.pushLocalToCloud(auth.currentUser.uid);
        }
      }
      return true;
    }

    // 3. Browser native Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        if (os?.User?.PushSubscription?.optIn) {
          await os.User.PushSubscription.optIn();
        }
        const subId = os?.User?.PushSubscription?.id;
        if (subId) {
          storageService.saveOneSignalSubscriptionId(subId);
        }
        if (auth.currentUser?.uid) {
          await loginToOneSignal(auth.currentUser.uid, auth.currentUser.email || null);
          userSyncService.pushLocalToCloud(auth.currentUser.uid);
        }
      }
      return perm === 'granted';
    }

    if (auth.currentUser?.uid) {
      await loginToOneSignal(auth.currentUser.uid, auth.currentUser.email || null);
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
