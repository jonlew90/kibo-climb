// Unified Storage Service Adapter for Kibo Math
// Multi-Profile Storage Engine (profiles[activeProfileId])

const KEYS = {
  PROFILES: 'kibo_profiles_data',
  NOTIF_SETTINGS: 'kibo_parent_notif_prefs',
  PARENT_PIN: 'kibo_parent_pin',
  PRACTICE_DAYS: 'kibo_practice_days'
};

const DEFAULT_PROFILE_ID = 'default_child';

const DEFAULT_PROFILE = {
  id: DEFAULT_PROFILE_ID,
  name: 'Kibo Climber',
  gradeLevel: 'Grade 3',
  userData: {
    tier: 1,
    unlockedTiers: [1],
    tierMasteryPercent: { 1: 0 },
    tierBestTimes: {},
    masteredTricks: {},
    streak: 1,
    streakShields: 1,
    sparks: 50,
    lastSprintDate: null,
    practiceQueue: [],
    sprintHistory: [],
    unlockedBadges: [],
    consumables: {
      shieldCount: 1,
      timeFreezeCount: 0
    }
  },
  shopState: {
    unlockedItems: ['cap'],
    equippedItems: ['cap']
  }
};

const DEFAULT_PROFILES_STATE = {
  activeProfileId: DEFAULT_PROFILE_ID,
  profiles: {
    [DEFAULT_PROFILE_ID]: DEFAULT_PROFILE
  }
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

function safeGetProfilesState() {
  try {
    const item = localStorage.getItem(KEYS.PROFILES);
    if (!item) return DEFAULT_PROFILES_STATE;
    const parsed = JSON.parse(item);
    if (!parsed.profiles || !parsed.activeProfileId) return DEFAULT_PROFILES_STATE;
    return parsed;
  } catch (e) {
    console.error('StorageService: error reading profiles state', e);
    return DEFAULT_PROFILES_STATE;
  }
}

function safeSaveProfilesState(state) {
  try {
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('StorageService: error saving profiles state', e);
    return false;
  }
}

export const storageService = {
  // Multi-Profile Management
  getActiveProfileId() {
    return safeGetProfilesState().activeProfileId || DEFAULT_PROFILE_ID;
  },
  setActiveProfileId(id) {
    const state = safeGetProfilesState();
    if (state.profiles[id]) {
      state.activeProfileId = id;
      safeSaveProfilesState(state);
    }
  },
  getActiveProfile() {
    const state = safeGetProfilesState();
    return state.profiles[state.activeProfileId] || DEFAULT_PROFILE;
  },
  getAllProfiles() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles);
  },
  createProfile(name = 'New Climber', gradeLevel = 'Grade 3') {
    const state = safeGetProfilesState();
    const id = `profile_${Date.now()}`;
    const newProfile = {
      ...DEFAULT_PROFILE,
      id,
      name,
      gradeLevel
    };
    state.profiles[id] = newProfile;
    state.activeProfileId = id;
    safeSaveProfilesState(state);
    return newProfile;
  },

  // User Data (scoped to activeProfileId)
  getUserData() {
    const active = this.getActiveProfile();
    return active.userData || DEFAULT_PROFILE.userData;
  },
  saveUserData(userData) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    state.profiles[activeId].userData = {
      ...state.profiles[activeId].userData,
      ...userData
    };
    safeSaveProfilesState(state);
  },

  // Shop State (scoped to activeProfileId)
  getShopState() {
    const active = this.getActiveProfile();
    return active.shopState || DEFAULT_PROFILE.shopState;
  },
  saveShopState(equippedItems, unlockedItems) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    state.profiles[activeId].shopState = { equippedItems, unlockedItems };
    safeSaveProfilesState(state);
  },

  // Notification Preferences
  getNotificationSettings() {
    try {
      const item = localStorage.getItem(KEYS.NOTIF_SETTINGS);
      return item ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(item) } : DEFAULT_NOTIF_SETTINGS;
    } catch (e) {
      return DEFAULT_NOTIF_SETTINGS;
    }
  },
  saveNotificationSettings(settings) {
    try {
      localStorage.setItem(KEYS.NOTIF_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('StorageService: error writing notification settings', e);
    }
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
