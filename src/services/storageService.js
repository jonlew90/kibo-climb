// Unified Storage Service Adapter for Kibo Math
// Encapsulates all persistence operations with safe error handling and fallback defaults.

const KEYS = {
  USER_DATA: 'kibo_user_data',
  SHOP_STATE: 'kibo_shop_state',
  NOTIF_SETTINGS: 'kibo_parent_notif_prefs',
  PARENT_PIN: 'kibo_parent_pin',
  PRACTICE_DAYS: 'kibo_practice_days'
};

const DEFAULT_USER_DATA = {
  tier: 1,
  unlockedTiers: [1],
  streak: 1,
  streakShields: 1,
  sparks: 50,
  lastSprintDate: null,
  practiceQueue: [],
  sprintHistory: []
};

const DEFAULT_SHOP_STATE = {
  unlockedItems: ['cap'],
  equippedItems: ['cap']
};

const DEFAULT_NOTIF_SETTINGS = {
  dailyReminderEnabled: true,
  reminderTime: '17:00',
  weeklyDigestEnabled: true,
  struggleAlertsEnabled: true
};

const DEFAULT_PARENT_SETTINGS = {
  pin: '1234',
  practiceDays: [1, 2, 3, 4, 5]
};

// Safe helper for getting & parsing JSON
function safeGetJSON(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? { ...fallback, ...JSON.parse(item) } : fallback;
  } catch (e) {
    console.error(`StorageService: error reading key "${key}"`, e);
    return fallback;
  }
}

// Safe helper for setting JSON
function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`StorageService: error writing key "${key}"`, e);
    return false;
  }
}

export const storageService = {
  // User Data
  getUserData() {
    return safeGetJSON(KEYS.USER_DATA, DEFAULT_USER_DATA);
  },
  saveUserData(userData) {
    const current = this.getUserData();
    return safeSetJSON(KEYS.USER_DATA, { ...current, ...userData });
  },

  // Shop State
  getShopState() {
    return safeGetJSON(KEYS.SHOP_STATE, DEFAULT_SHOP_STATE);
  },
  saveShopState(equippedItems, unlockedItems) {
    return safeSetJSON(KEYS.SHOP_STATE, { equippedItems, unlockedItems });
  },

  // Notification Preferences
  getNotificationSettings() {
    return safeGetJSON(KEYS.NOTIF_SETTINGS, DEFAULT_NOTIF_SETTINGS);
  },
  saveNotificationSettings(settings) {
    return safeSetJSON(KEYS.NOTIF_SETTINGS, settings);
  },

  // Parent Settings (PIN & Schedule)
  getParentSettings() {
    try {
      const pin = localStorage.getItem(KEYS.PARENT_PIN) || DEFAULT_PARENT_SETTINGS.pin;
      const daysRaw = localStorage.getItem(KEYS.PRACTICE_DAYS);
      const practiceDays = daysRaw ? JSON.parse(daysRaw) : DEFAULT_PARENT_SETTINGS.practiceDays;
      return { pin, practiceDays };
    } catch (e) {
      return DEFAULT_PARENT_SETTINGS;
    }
  },
  saveParentSettings(pin, practiceDays) {
    try {
      if (pin) localStorage.setItem(KEYS.PARENT_PIN, pin);
      if (practiceDays) localStorage.setItem(KEYS.PRACTICE_DAYS, JSON.stringify(practiceDays));
      return true;
    } catch (e) {
      console.error('StorageService: error writing parent settings', e);
      return false;
    }
  }
};
