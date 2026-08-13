// Unified Storage Service Adapter for Kibo Math
// Multi-Profile Storage Engine (profiles[activeProfileId])
import { getStartingRatingForGrade } from '../utils/curriculum';
import { leaderboardService } from './leaderboardService';

const KEYS = {
  PROFILES: 'kibo_profiles_data',
  NOTIF_SETTINGS: 'kibo_parent_notif_prefs',
  PARENT_PIN: 'kibo_parent_pin',
  PRACTICE_DAYS: 'kibo_practice_days',
  GATE_FAILED_ATTEMPTS: 'kibo_parent_gate_failed_attempts',
  GATE_LOCKOUT_UNTIL: 'kibo_parent_gate_lockout_until'
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
    sprintHistory: [],
    skipLogs: [],
    unlockedBadges: [],
    consumables: {
      shieldCount: 1,
      streakSaverCount: 0,
      doubleCoinPotionCount: 0
    },
    preferences: {
      hideSprintTimer: false,
      isMuted: false,
      isHapticsEnabled: true
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
  pin: null, // Deprecated static '1234' pin fallback
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
  isAccountGloballyLinked() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles).some(p => p.userData && p.userData.isAnonymous === false);
  },

  setGlobalAccountLinkedState(accountInfo = {}) {
    const state = safeGetProfilesState();
    Object.keys(state.profiles).forEach(id => {
      const prof = state.profiles[id];
      state.profiles[id] = {
        ...prof,
        userData: {
          ...prof.userData,
          cloudUid: accountInfo.cloudUid !== undefined ? accountInfo.cloudUid : prof.userData?.cloudUid,
          isAnonymous: accountInfo.isAnonymous !== undefined ? accountInfo.isAnonymous : prof.userData?.isAnonymous,
          authProvider: accountInfo.authProvider !== undefined ? accountInfo.authProvider : prof.userData?.authProvider,
          email: accountInfo.email !== undefined ? accountInfo.email : prof.userData?.email,
          displayName: accountInfo.displayName !== undefined ? accountInfo.displayName : prof.userData?.displayName,
          accountLinkedAt: accountInfo.accountLinkedAt !== undefined ? accountInfo.accountLinkedAt : prof.userData?.accountLinkedAt
        }
      };
    });
    safeSaveProfilesState(state);
  },

  getAllProfiles() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles);
  },
  createProfile(name = 'New Climber', gradeLevel = 'Grade 1–2') {
    const state = safeGetProfilesState();
    if (Object.keys(state.profiles).length >= 6) {
      console.warn('Maximum profile limit of 6 reached.');
      return null;
    }
    const safeName = (name || 'New Climber').trim().slice(0, 20);
    const id = `profile_${Date.now()}`;
    const startingRating = getStartingRatingForGrade(gradeLevel);
    const isLinked = this.isAccountGloballyLinked();
    const activeProf = this.getActiveProfile();
    const newProfile = {
      ...DEFAULT_PROFILE,
      id,
      name: safeName,
      username: safeName,
      gradeLevel,
      userData: {
        ...DEFAULT_PROFILE.userData,
        adaptiveCompetenceRating: startingRating,
        competenceRank: startingRating,
        isAnonymous: isLinked ? false : true,
        cloudUid: isLinked ? activeProf.userData?.cloudUid : undefined,
        authProvider: isLinked ? activeProf.userData?.authProvider : undefined,
        email: isLinked ? activeProf.userData?.email : undefined,
        accountLinkedAt: isLinked ? activeProf.userData?.accountLinkedAt : undefined
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
      const sanitizedUpdates = { ...updates };
      if (typeof sanitizedUpdates.name === 'string') {
        sanitizedUpdates.name = sanitizedUpdates.name.trim().slice(0, 20);
      }
      if (typeof sanitizedUpdates.username === 'string') {
        sanitizedUpdates.username = sanitizedUpdates.username.trim().slice(0, 20);
      }
      state.profiles[profileId] = {
        ...state.profiles[profileId],
        ...sanitizedUpdates
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

  grantAccountLinkSparksReward() {
    const rewardGranted = localStorage.getItem('kibo_has_received_link_reward');
    if (!rewardGranted) {
      const state = safeGetProfilesState();
      Object.keys(state.profiles).forEach(id => {
        const prof = state.profiles[id];
        const currentSparks = prof.userData?.sparks || 0;
        state.profiles[id] = {
          ...prof,
          userData: {
            ...prof.userData,
            sparks: currentSparks + 200
          }
        };
      });
      safeSaveProfilesState(state);
      localStorage.setItem('kibo_has_received_link_reward', 'true');
      return 200;
    }
    return 0;
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
    const cleanUsername = (username || '').trim().slice(0, 20);
    state.profiles[activeId].username = cleanUsername;
    state.profiles[activeId].name = cleanUsername; // keep display name in sync
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
    state.profiles[activeId].updatedAtMillis = Date.now();
    safeSaveProfilesState(state);

    // Sync profile to user's Cloud Firestore document for multi-device sync
    try {
      import('./userSyncService').then(({ userSyncService }) => {
        userSyncService.syncProfileToCloud(activeId);
      });
    } catch (e) {
      console.warn('StorageService: userSyncService trigger failed', e);
    }

    // Sync rating & avatar gear to cloud leaderboard
    try {
      const activeProf = state.profiles[activeId];
      leaderboardService.syncUserScore({
        profileId: activeId,
        name: activeProf?.username || activeProf?.name || 'Kibo Climber',
        score: activeRating,
        subjectsMastered: Object.keys(updatedData.masteredTricks || {}).length || 5,
        equipped: activeProf?.shopState?.equippedItems || []
      });
    } catch (e) {
      console.warn('StorageService: Leaderboard sync skipped', e);
    }
  },

  // Skip Event Diagnostics Logging
  getSkipLogs() {
    const userData = this.getUserData();
    return userData.skipLogs || [];
  },
  logSkipEvent(skipEventData = {}) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    const currentUserData = state.profiles[activeId].userData || {};
    const existingLogs = currentUserData.skipLogs || [];
    const newLog = {
      id: `skip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      problemId: skipEventData.problemId || 'unknown',
      concept: skipEventData.concept || 'Addition & Subtraction',
      timeElapsedSec: Number(skipEventData.timeElapsedSec) || 0,
      consecutiveSkipCount: Number(skipEventData.consecutiveSkipCount) || 1
    };
    // Keep up to 100 recent skip logs
    const updatedLogs = [newLog, ...existingLogs].slice(0, 100);

    state.profiles[activeId].userData = {
      ...currentUserData,
      skipLogs: updatedLogs
    };
    safeSaveProfilesState(state);
    return newLog;
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

  // Parent Settings & Security Gate Storage
  getParentSettings() {
    try {
      let pin = localStorage.getItem(KEYS.PARENT_PIN);
      // Deprecate static 1234 PIN: If stored pin is '1234', remove it
      if (pin === '1234') {
        localStorage.removeItem(KEYS.PARENT_PIN);
        pin = null;
      }
      const daysRaw = localStorage.getItem(KEYS.PRACTICE_DAYS);
      const practiceDays = daysRaw ? JSON.parse(daysRaw) : DEFAULT_PARENT_SETTINGS.practiceDays;
      return { pin: pin || null, practiceDays };
    } catch (e) {
      return DEFAULT_PARENT_SETTINGS;
    }
  },
  saveParentSettings(pin) {
    try {
      if (pin && pin !== '1234') {
        localStorage.setItem(KEYS.PARENT_PIN, pin);
      } else {
        localStorage.removeItem(KEYS.PARENT_PIN);
      }
      return true;
    } catch (e) {
      console.error('StorageService: error writing parent settings', e);
      return false;
    }
  },
  hasCustomPin() {
    const { pin } = this.getParentSettings();
    return !!(pin && pin !== '1234');
  },

  // Parental Gate Lockout Rate Limiter Storage Helpers
  getLockoutStatus() {
    try {
      const lockoutUntilStr = localStorage.getItem(KEYS.GATE_LOCKOUT_UNTIL);
      const failedCountStr = localStorage.getItem(KEYS.GATE_FAILED_ATTEMPTS);
      const failedCount = failedCountStr ? parseInt(failedCountStr, 10) : 0;
      const lockoutUntil = lockoutUntilStr ? parseInt(lockoutUntilStr, 10) : 0;
      const now = Date.now();

      if (lockoutUntil && now < lockoutUntil) {
        return {
          isLocked: true,
          remainingMs: lockoutUntil - now,
          remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
          failedCount
        };
      }

      if (lockoutUntil && now >= lockoutUntil) {
        localStorage.removeItem(KEYS.GATE_LOCKOUT_UNTIL);
        localStorage.setItem(KEYS.GATE_FAILED_ATTEMPTS, '0');
      }

      return {
        isLocked: false,
        remainingMs: 0,
        remainingSeconds: 0,
        failedCount: now >= lockoutUntil && lockoutUntil ? 0 : failedCount
      };
    } catch (e) {
      return { isLocked: false, remainingMs: 0, remainingSeconds: 0, failedCount: 0 };
    }
  },
  recordFailedAttempt() {
    try {
      const currentStatus = this.getLockoutStatus();
      if (currentStatus.isLocked) return currentStatus;

      const nextCount = currentStatus.failedCount + 1;
      localStorage.setItem(KEYS.GATE_FAILED_ATTEMPTS, String(nextCount));

      if (nextCount >= 3) {
        const lockoutUntil = Date.now() + 120000; // 2 minutes (120 seconds) lockout
        localStorage.setItem(KEYS.GATE_LOCKOUT_UNTIL, String(lockoutUntil));
        return {
          isLocked: true,
          remainingMs: 120000,
          remainingSeconds: 120,
          failedCount: nextCount
        };
      }

      return {
        isLocked: false,
        remainingMs: 0,
        remainingSeconds: 0,
        failedCount: nextCount
      };
    } catch (e) {
      console.error('StorageService: error recording failed attempt', e);
      return { isLocked: false, remainingMs: 0, remainingSeconds: 0, failedCount: 0 };
    }
  },
  resetFailedAttempts() {
    try {
      localStorage.removeItem(KEYS.GATE_FAILED_ATTEMPTS);
      localStorage.removeItem(KEYS.GATE_LOCKOUT_UNTIL);
    } catch (e) {
      console.error('StorageService: error resetting failed attempts', e);
    }
  },

  // Active Climb Session Persistence (per-profile mid-climb progress)
  getActiveClimbState(profileId = null) {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    const profile = state.profiles[pid];
    if (!profile || !profile.userData || !profile.userData.activeClimb) return null;
    const climb = profile.userData.activeClimb;
    if (climb.sessionQuestionIndex > 12 || (climb.questionsAnswered && climb.questionsAnswered % 12 === 0 && climb.questionsAnswered > 0)) {
      this.clearActiveClimbState(pid);
      return null;
    }
    return climb;
  },

  saveActiveClimbState(climbState, profileId = null) {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[pid]) return;
    const currentUserData = state.profiles[pid].userData || {};
    state.profiles[pid].userData = {
      ...currentUserData,
      activeClimb: climbState
    };
    safeSaveProfilesState(state);
  },

  clearActiveClimbState(profileId = null) {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[pid] || !state.profiles[pid].userData) return;
    const currentUserData = { ...state.profiles[pid].userData };
    delete currentUserData.activeClimb;
    state.profiles[pid].userData = currentUserData;
    safeSaveProfilesState(state);
  }
};
