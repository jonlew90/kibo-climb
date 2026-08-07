// Unified Storage Service Adapter for Kibo Math
// Multi-Profile Storage Engine (profiles[activeProfileId])
import { getStartingRatingForGrade } from '../utils/curriculum';

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
  username: '',          // leaderboard handle — set during first-launch onboarding
  gradeLevel: 'Grade 1–2',
  practiceDays: [1, 2, 3, 4, 5],
  userData: {
    adaptiveCompetenceRating: 1000,
    competenceRank: 1000,
    tier: 1,
    unlockedTiers: [1],
    tierMasteryPercent: { 1: 0 },
    tierBestTimes: {},
    masteredTricks: {},
    streak: 1,
    streakShields: 1,
    sparks: 50,
    completedClimbsCount: 0,
    shopPurchasesCount: 0,
    purchasedRarities: [],
    hasPromptedLink_2Purchases: false,
    hasPromptedLink_2Climbs: false,
    hasPromptedLink_3DayStreak: false,
    promptedLinkMilestones: [],
    lastPromptedLinkAt: null,
    totalProblemsSolved: 0,
    cumulativeCorrectStreak: 0,
    personalRecords: {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    },
    lastSprintDate: null,
    hasVisitedParentZone: false,
    practiceQueue: [],
    sessionHistory: [],
    unlockedBadges: [],
    consumables: {
      shieldCount: 1,
      streakSaverCount: 0,
      doubleCoinPotionCount: 0
    },
    preferences: {
      hideSessionTimer: false
    }
  },
  shopState: {
    equippedItems: [],
    unlockedItems: [],
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
  struggleAlertsEnabled: true,
  allowRealMoneyPurchases: false
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
  getProfileById(id) {
    const state = safeGetProfilesState();
    return state.profiles[id] || null;
  },
  getActiveProfile() {
    const state = safeGetProfilesState();
    return state.profiles[state.activeProfileId] || DEFAULT_PROFILE;
  },
  getAllProfiles() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles);
  },
  createProfile(name = 'New Climber', gradeLevel = 'Grade 1–2') {
    const state = safeGetProfilesState();
    const id = `profile_${Date.now()}`;
    const startingRating = getStartingRatingForGrade(gradeLevel);
    const newProfile = {
      ...DEFAULT_PROFILE,
      id,
      name,
      gradeLevel,
      userData: {
        ...DEFAULT_PROFILE.userData,
        adaptiveCompetenceRating: startingRating,
        competenceRank: startingRating,
      }
    };
    state.profiles[id] = newProfile;
    state.activeProfileId = id;
    safeSaveProfilesState(state);
    return newProfile;
  },

  updateProfile(profileId, updates = {}) {
    const state = safeGetProfilesState();
    if (state.profiles[profileId]) {
      state.profiles[profileId] = {
        ...state.profiles[profileId],
        ...updates
      };
      safeSaveProfilesState(state);
    }
    return state.profiles[profileId];
  },

  deleteProfile(profileId) {
    const state = safeGetProfilesState();
    const keys = Object.keys(state.profiles);
    if (keys.length <= 1) return false;

    delete state.profiles[profileId];
    if (state.activeProfileId === profileId) {
      state.activeProfileId = Object.keys(state.profiles)[0];
    }
    safeSaveProfilesState(state);
    return true;
  },
  // Username (leaderboard handle, scoped to active profile)
  getUsername() {
    return this.getActiveProfile().username || '';
  },
  saveUsername(username, gradeLevel = null) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    state.profiles[activeId].username = username;
    state.profiles[activeId].name = username; // keep display name in sync
    if (gradeLevel) {
      state.profiles[activeId].gradeLevel = gradeLevel;
      const startingRating = getStartingRatingForGrade(gradeLevel);
      state.profiles[activeId].userData = {
        ...(state.profiles[activeId].userData || DEFAULT_PROFILE.userData),
        adaptiveCompetenceRating: startingRating,
        competenceRank: startingRating,
      };
    }
    safeSaveProfilesState(state);
  },

  // User Data (scoped to activeProfileId)
  getUserData() {
    const active = this.getActiveProfile();
    const data = active.userData || DEFAULT_PROFILE.userData;

    // Auto-migration: scale legacy ratings (<500) by 10x
    let modified = false;
    if (data.adaptiveCompetenceRating && data.adaptiveCompetenceRating < 500) {
      data.adaptiveCompetenceRating = Math.round(data.adaptiveCompetenceRating * 10);
      modified = true;
    } else if (!data.adaptiveCompetenceRating) {
      data.adaptiveCompetenceRating = 1000;
      modified = true;
    }

    if (data.competenceRank && data.competenceRank < 500) {
      data.competenceRank = Math.round(data.competenceRank * 10);
      modified = true;
    } else if (!data.competenceRank) {
      data.competenceRank = 1000;
      modified = true;
    }

    if (modified) {
      this.saveUserData(data);
    }

    return data;
  },
  saveUserData(userData) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }

    const currentProfileData = state.profiles[activeId].userData || {};
    const updatedData = { ...currentProfileData, ...userData };

    const activeRating = updatedData.adaptiveCompetenceRating || updatedData.competenceRank || 1000;
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let history = Array.isArray(currentProfileData.ratingHistory) ? [...currentProfileData.ratingHistory] : [];
    if (history.length === 0) {
      history = [{ label: todayLabel, rating: activeRating }];
    } else {
      const existingIdx = history.findIndex((h) => h.label === todayLabel || h.date === todayLabel);
      if (existingIdx >= 0) {
        history[existingIdx] = { label: todayLabel, rating: activeRating };
      } else {
        history.push({ label: todayLabel, rating: activeRating });
      }
    }

    state.profiles[activeId].userData = {
      ...updatedData,
      ratingHistory: history
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

  // Practice Days (scoped to active profile)
  getProfilePracticeDays() {
    const active = this.getActiveProfile();
    // Migrate from legacy global key if profile has no setting yet
    if (!active.practiceDays) {
      try {
        const legacy = localStorage.getItem(KEYS.PRACTICE_DAYS);
        return legacy ? JSON.parse(legacy) : [1, 2, 3, 4, 5];
      } catch (e) {
        return [1, 2, 3, 4, 5];
      }
    }
    return active.practiceDays;
  },
  saveProfilePracticeDays(profileIdOrDays, days) {
    const state = safeGetProfilesState();
    let targetId, newDays;

    if (typeof profileIdOrDays === 'string' && Array.isArray(days)) {
      targetId = profileIdOrDays;
      newDays = days;
    } else {
      targetId = state.activeProfileId || DEFAULT_PROFILE_ID;
      newDays = profileIdOrDays;
    }

    if (!state.profiles[targetId]) {
      state.profiles[targetId] = { ...DEFAULT_PROFILE, id: targetId };
    }
    state.profiles[targetId].practiceDays = newDays;
    safeSaveProfilesState(state);
  },

  // Parent Settings (PIN only — schedule is now per-profile)
  getParentSettings() {
    try {
      const pin = localStorage.getItem(KEYS.PARENT_PIN) || DEFAULT_PARENT_SETTINGS.pin;
      // Legacy: read practiceDays for callers that still use this signature
      const daysRaw = localStorage.getItem(KEYS.PRACTICE_DAYS);
      const practiceDays = daysRaw ? JSON.parse(daysRaw) : DEFAULT_PARENT_SETTINGS.practiceDays;
      return { pin, practiceDays };
    } catch (e) {
      return DEFAULT_PARENT_SETTINGS;
    }
  },
  saveParentSettings(pin) {
    try {
      if (pin) localStorage.setItem(KEYS.PARENT_PIN, pin);
      return true;
    } catch (e) {
      console.error('StorageService: error writing parent settings', e);
      return false;
    }
  }
};
