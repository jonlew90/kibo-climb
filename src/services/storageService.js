// Unified Storage Service Adapter for Kibo Math
// Multi-Profile Storage Engine (profiles[activeProfileId])
import { getStartingRatingForGrade } from '../utils/mathCurriculum.js';
import { getStartingRatingBadges } from '../utils/badgeManager.js';
import { getWeekStr } from '../utils/dateUtils.js';
import { leaderboardService } from './leaderboardService.js';
import { SUBJECTS_CONFIG } from '../config/subjects.js';

const KEYS = {
  PROFILES: 'kibo_profiles_data',
  NOTIF_SETTINGS: 'kibo_parent_notif_prefs',
  PARENT_PIN: 'kibo_parent_pin',
  PRACTICE_DAYS: 'kibo_practice_days',
  GATE_FAILED_ATTEMPTS: 'kibo_parent_gate_failed_attempts',
  GATE_LOCKOUT_UNTIL: 'kibo_parent_gate_lockout_until',
  APP_RATING_STATUS: 'kibo_app_rating_status',
  HAS_ONBOARDED: 'kibo_has_onboarded'
};

const DEFAULT_PROFILE_ID = 'default_child';

export const createDefaultSubjectState = (startingRating = 1000) => ({
  adaptiveCompetenceRating: startingRating,
  competenceRank: startingRating,
  tier: 1,
  unlockedTiers: [1],
  totalProblemsSolved: 0,
  cumulativeCorrectStreak: 0,
  personalRecords: { fastest12QuestionsTime: null, highestCorrectStreak: 0, mostPerfectSessions: 0 },
  practiceQueue: [],
  sprintHistory: [],
  skipLogs: []
});

const DEFAULT_PROFILE = {
  id: DEFAULT_PROFILE_ID,
  name: 'Kibo Climber',
  username: '',          // leaderboard handle — set during first-launch onboarding
  gradeLevel: 'Grade 1–2',
  practiceDays: [1, 2, 3, 4, 5],
  dailyReminderEnabled: true,
  reminderTime: '17:00',
  lastActiveSubject: 'math',
  userData: {
    adaptiveCompetenceRating: 1000,
    subjectRatings: Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).reduce((acc, k) => { acc[k] = 1000; return acc; }, {}),
    competenceRank: 1000,
    tier: 1,
    unlockedTiers: [1],
    tierMasteryPercent: { 1: 0 },
    tierBestTimes: {},
    masteredTricks: {},
    streak: 0,
    streakShields: 1,
    sparks: 50,
    isKiboClub: false,
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
    lastSprintTimestamp: null,
    lastSprintTimezone: null,
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
    },
    // Subject specific states will be nested under subject data.
    // Top-level fields above serve as defaults or aggregate fields (for math backwards compatibility)
    subjects: Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).reduce((acc, subId) => {
      acc[subId] = createDefaultSubjectState(1000);
      return acc;
    }, {})
  },
  shopState: {
    equippedItems: [],
    unlockedItems: [],
    redeemedPromoCodes: []
  },
  friends: [],
  friendRequests: []
};

const DEFAULT_PROFILES_STATE = {
  activeProfileId: DEFAULT_PROFILE_ID,
  isKiboClubFamily: false,
  profiles: {
    [DEFAULT_PROFILE_ID]: DEFAULT_PROFILE
  }
};

const DEFAULT_NOTIF_SETTINGS = {
  dailyReminderEnabled: true,
  reminderTime: '17:00',
  weeklyDigestEnabled: true,
  struggleAlertsEnabled: true,
  allowRealMoneyPurchases: false,
  primaryVerificationMethod: 'biometrics' // 'biometrics' | 'challenge'
};

const DEFAULT_PARENT_SETTINGS = {
  pin: null, // Deprecated static '1234' pin fallback
  practiceDays: [1, 2, 3, 4, 5]
};

function safeGetProfilesState() {
  try {
    const item = localStorage.getItem(KEYS.PROFILES);
    if (!item) return JSON.parse(JSON.stringify(DEFAULT_PROFILES_STATE));
    const parsed = JSON.parse(item);
    if (!parsed.profiles || !parsed.activeProfileId) return JSON.parse(JSON.stringify(DEFAULT_PROFILES_STATE));
    return parsed;
  } catch (e) {
    console.error('StorageService: error reading profiles state', e);
    return JSON.parse(JSON.stringify(DEFAULT_PROFILES_STATE));
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
  setActiveProfile(profileOrId) {
    const id = typeof profileOrId === 'object' && profileOrId !== null ? profileOrId.id : profileOrId;
    return this.setActiveProfileId(id);
  },
  getProfileById(id) {
    const state = safeGetProfilesState();
    const prof = state.profiles[id];
    if (!prof) return null;
    return {
      dailyReminderEnabled: prof.dailyReminderEnabled !== undefined ? prof.dailyReminderEnabled : true,
      reminderTime: prof.reminderTime || '17:00',
      lastActiveSubject: prof.lastActiveSubject || 'math',
      ...prof
    };
  },
  getActiveProfile() {
    const state = safeGetProfilesState();
    const prof = state.profiles[state.activeProfileId] || DEFAULT_PROFILE;
    return {
      dailyReminderEnabled: prof.dailyReminderEnabled !== undefined ? prof.dailyReminderEnabled : true,
      reminderTime: prof.reminderTime || '17:00',
      lastActiveSubject: prof.lastActiveSubject || 'math',
      ...prof
    };
  },
  getLastActiveSubject(profileId = null) {
    const state = safeGetProfilesState();
    const targetId = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    const prof = state.profiles[targetId];
    return prof?.lastActiveSubject || 'math';
  },
  setLastActiveSubject(subject, profileId = null) {
    const state = safeGetProfilesState();
    const targetId = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (state.profiles[targetId]) {
      state.profiles[targetId].lastActiveSubject = subject;
      safeSaveProfilesState(state);
    }
  },
  getSeenNews(profileId = null) {
    const targetId = profileId || this.getActiveProfileId();
    try {
      const raw = localStorage.getItem(`kibo_news_seen_${targetId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  markNewsAsSeen(newsIds, profileId = null) {
    const targetId = profileId || this.getActiveProfileId();
    if (!targetId || !newsIds) return;
    const ids = Array.isArray(newsIds) ? newsIds : [newsIds];
    try {
      const seen = this.getSeenNews(targetId);
      const updated = Array.from(new Set([...seen, ...ids]));
      localStorage.setItem(`kibo_news_seen_${targetId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save seen news', e);
    }
  },
  isAccountGloballyLinked() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles).some(p => p.userData && p.userData.isAnonymous === false);
  },

  setGlobalAccountLinkedState(accountInfo = {}) {
    const state = safeGetProfilesState();
    Object.keys(state.profiles).forEach(id => {
      const prof = state.profiles[id];
      const newUserData = {
        ...prof.userData,
        cloudUid: accountInfo.cloudUid !== undefined ? accountInfo.cloudUid : prof.userData?.cloudUid,
        isAnonymous: accountInfo.isAnonymous !== undefined ? accountInfo.isAnonymous : prof.userData?.isAnonymous,
        authProvider: accountInfo.authProvider !== undefined ? accountInfo.authProvider : prof.userData?.authProvider,
        displayName: accountInfo.displayName !== undefined ? accountInfo.displayName : prof.userData?.displayName,
        accountLinkedAt: accountInfo.accountLinkedAt !== undefined ? accountInfo.accountLinkedAt : prof.userData?.accountLinkedAt
      };

      if (newUserData.email) {
        delete newUserData.email;
      }

      state.profiles[id] = {
        ...prof,
        userData: newUserData
      };
    });
    safeSaveProfilesState(state);
  },

  getAllProfiles() {
    const state = safeGetProfilesState();
    return Object.values(state.profiles).map(prof => ({
      dailyReminderEnabled: prof.dailyReminderEnabled !== undefined ? prof.dailyReminderEnabled : true,
      reminderTime: prof.reminderTime || '17:00',
      ...prof
    }));
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
    const startingBadges = getStartingRatingBadges(startingRating);
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
        subjectRatings: { math: startingRating, words: startingRating },
        competenceRank: startingRating,
        unlockedBadges: startingBadges,
        isAnonymous: isLinked ? false : true,
        cloudUid: isLinked ? activeProf.userData?.cloudUid : undefined,
        authProvider: isLinked ? activeProf.userData?.authProvider : undefined,
        accountLinkedAt: isLinked ? activeProf.userData?.accountLinkedAt : undefined,
        subjectRatings: Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).reduce((acc, subId) => {
          acc[subId] = startingRating;
          return acc;
        }, {}),
        subjects: Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).reduce((acc, subId) => {
          acc[subId] = createDefaultSubjectState(startingRating);
          return acc;
        }, {})
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
      const startingBadges = getStartingRatingBadges(startingRating);
      const prevUserData = state.profiles[activeId].userData || DEFAULT_PROFILE.userData;
      const existingUnlocked = new Set(prevUserData.unlockedBadges || []);
      startingBadges.forEach((b) => existingUnlocked.add(b));

      const subjectRatings = {};
      const updatedSubjects = { ...(prevUserData.subjects || {}) };
      Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).forEach(subId => {
        subjectRatings[subId] = startingRating;
        updatedSubjects[subId] = {
          ...(updatedSubjects[subId] || createDefaultSubjectState(startingRating)),
          adaptiveCompetenceRating: startingRating,
          competenceRank: startingRating
        };
      });
      state.profiles[activeId].userData = {
        ...prevUserData,
        adaptiveCompetenceRating: startingRating,
        subjectRatings,
        competenceRank: startingRating,
        unlockedBadges: Array.from(existingUnlocked),
        subjects: updatedSubjects
      };
    }
    safeSaveProfilesState(state);
  },

  // User Data (scoped to activeProfileId)
  getUserData(subjectId = 'math') {
    const active = this.getActiveProfile();
    const data = active.userData || DEFAULT_PROFILE.userData;
    const globalState = safeGetProfilesState();

    // Migrate old math data into subjects if missing
    if (!data.subjects) {
      data.subjects = {};
      Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).forEach(id => {
        data.subjects[id] = createDefaultSubjectState(id === 'math' ? (data.adaptiveCompetenceRating || 1000) : 1000);
      });
      if (data.subjects.math) {
        data.subjects.math.totalProblemsSolved = data.totalProblemsSolved || 0;
        data.subjects.math.tier = data.tier || 1;
        data.subjects.math.unlockedTiers = data.unlockedTiers || [1];
        data.subjects.math.sprintHistory = data.sprintHistory || [];
      }
    } else if (!data.subjects[subjectId]) {
      data.subjects[subjectId] = createDefaultSubjectState(1000);
    }

    const subjectData = data.subjects[subjectId];

    // Auto-migration & validation: ensure valid numeric ratings >= 500
    let modified = false;
    const rawAdapt = Number(subjectData.adaptiveCompetenceRating);
    if (isNaN(rawAdapt) || rawAdapt <= 0) {
      subjectData.adaptiveCompetenceRating = 1000;
      modified = true;
    } else if (rawAdapt < 500) {
      subjectData.adaptiveCompetenceRating = Math.round(rawAdapt * 10);
      modified = true;
    } else {
      subjectData.adaptiveCompetenceRating = rawAdapt;
    }

    const rawRank = Number(subjectData.competenceRank);
    if (isNaN(rawRank) || rawRank <= 0) {
      subjectData.competenceRank = 1000;
      modified = true;
    } else if (rawRank < 500) {
      subjectData.competenceRank = Math.round(rawRank * 10);
      modified = true;
    } else {
      subjectData.competenceRank = rawRank;
    }

    // Preserve any legacy higher streak across subject records into profile streak
    const legacyMathStreak = data.subjects?.math?.streak || 0;
    const legacyWordsStreak = data.subjects?.words?.streak || 0;
    const maxLegacyStreak = Math.max(data.streak || 0, legacyMathStreak, legacyWordsStreak);
    if (maxLegacyStreak > (data.streak || 0)) {
      data.streak = maxLegacyStreak;
      modified = true;
    }

    if (modified) {
      this.saveUserData(subjectData, subjectId);
    }

    // Merge global data with subject specific data, ensuring unified streak and lastSprintDate/timezone metadata
    return {
      ...data,
      ...subjectData,
      streak: data.streak ?? 0,
      isKiboClub: data.isKiboClub || globalState.isKiboClubFamily || this.hasFamilyPlan() || (active?.shopState?.unlockedItems?.some(id => id === 'kibo_club_sub' || id === 'kibo_club_sub_annual')) || false,
      lastSprintDate: data.lastSprintDate ?? null,
      lastSprintTimestamp: data.lastSprintTimestamp ?? null,
      lastSprintTimezone: data.lastSprintTimezone ?? null
    };
  },

  setFamilyPlanState(isFamilyPlan) {
    const state = safeGetProfilesState();
    state.isKiboClubFamily = isFamilyPlan;
    safeSaveProfilesState(state);
  },

  getFamilyPlanState() {
    const state = safeGetProfilesState();
    return state.isKiboClubFamily || false;
  },

  saveUserData(userData, subjectId = 'math') {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }

    const currentProfileData = state.profiles[activeId].userData || {};

    const currentWeekStr = getWeekStr();

    // Check if we entered a new week, if so reset weeklySparks and weeklyMaxStreak
    if (currentProfileData.lastWeekStr !== currentWeekStr) {
      currentProfileData.lastWeekStr = currentWeekStr;
      currentProfileData.weeklySparks = 0;
      currentProfileData.weeklyMaxStreak = 0;
    }

    // Calculate sparks difference if sparks are being updated
    if (userData.sparks !== undefined) {
      const diff = userData.sparks - (currentProfileData.sparks || 0);
      if (diff > 0) {
        currentProfileData.weeklySparks = (currentProfileData.weeklySparks || 0) + diff;
      }
    }

    // Calculate max streak if streak is updated
    if (userData.streak !== undefined) {
      if (userData.streak > (currentProfileData.weeklyMaxStreak || 0)) {
        currentProfileData.weeklyMaxStreak = userData.streak;
      }
    }


    // Migrate missing subjects structure if needed
    if (!currentProfileData.subjects) {
      currentProfileData.subjects = {
        math: {
          adaptiveCompetenceRating: currentProfileData.adaptiveCompetenceRating || 1000,
          competenceRank: currentProfileData.competenceRank || 1000,
          tier: currentProfileData.tier || 1,
          unlockedTiers: currentProfileData.unlockedTiers || [1],
          totalProblemsSolved: currentProfileData.totalProblemsSolved || 0,
          cumulativeCorrectStreak: currentProfileData.cumulativeCorrectStreak || 0,
          personalRecords: currentProfileData.personalRecords || { fastest12QuestionsTime: null, highestCorrectStreak: 0, mostPerfectSessions: 0 },
          practiceQueue: currentProfileData.practiceQueue || [],
          sprintHistory: currentProfileData.sprintHistory || [],
          skipLogs: currentProfileData.skipLogs || []
        },
        words: createDefaultSubjectState(1000),
        world: createDefaultSubjectState(1000)
      };
    } else if (!currentProfileData.subjects[subjectId]) {
       currentProfileData.subjects[subjectId] = createDefaultSubjectState(1000);
    }

    // Extract subject specific fields from the payload (streak and lastSprintDate are profile-global)
    const subjectSpecificKeys = [
      'adaptiveCompetenceRating', 'competenceRank', 'tier', 'unlockedTiers',
      'totalProblemsSolved', 'cumulativeCorrectStreak', 'personalRecords',
      'practiceQueue', 'sprintHistory', 'skipLogs'
    ];

    const subjectData = { ...currentProfileData.subjects[subjectId] };
    const globalData = { ...currentProfileData };

    for (const key of Object.keys(userData)) {
      if (subjectSpecificKeys.includes(key)) {
        subjectData[key] = userData[key];
        // Mirror math to global root for backwards compatibility and fallback
        if (subjectId === 'math') {
          globalData[key] = userData[key];
        }
      } else {
        globalData[key] = userData[key];
      }
    }

    globalData.subjects[subjectId] = subjectData;

    // Keep subjectRatings in sync
    if (!globalData.subjectRatings) {
      globalData.subjectRatings = { math: globalData.adaptiveCompetenceRating || 1000, words: 1000 };
    }
    if (userData.adaptiveCompetenceRating !== undefined) {
      globalData.subjectRatings[subjectId] = userData.adaptiveCompetenceRating;
    }

    const activeRating = subjectData.adaptiveCompetenceRating || subjectData.competenceRank || 1000;
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let history = Array.isArray(globalData.ratingHistory) ? [...globalData.ratingHistory] : [];
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
    globalData.ratingHistory = history;

    state.profiles[activeId].userData = globalData;
    state.profiles[activeId].updatedAtMillis = Date.now();
    safeSaveProfilesState(state);

    // Sync profile to user's Cloud Firestore document for multi-device sync
    try {
      import('./userSyncService.js').then(({ userSyncService }) => {
        userSyncService.syncProfileToCloud(activeId);
      }).catch((e) => {});
    } catch (e) {
      console.warn('StorageService: userSyncService trigger failed', e);
    }

    // Sync rating & avatar gear to cloud leaderboard
    try {
      const activeProf = state.profiles[activeId];
      leaderboardService.syncUserScore({
        profileId: activeId,
        subject: subjectId,
        name: activeProf?.username || activeProf?.name || 'Kibo Climber',
        score: activeRating,
        subjectsMastered: Object.keys(globalData.masteredTricks || {}).length || 5,
        equipped: activeProf?.shopState?.equippedItems || []
      });
    } catch (e) {
      console.warn('StorageService: Leaderboard sync skipped', e);
    }
  },

  // Skip Event Diagnostics Logging
  getSkipLogs(subjectId = 'math') {
    const userData = this.getUserData(subjectId);
    return userData.skipLogs || [];
  },
  logSkipEvent(skipEventData = {}, subjectId = 'math') {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    const currentUserData = state.profiles[activeId].userData || {};

    // Ensure subjects structure exists
    if (!currentUserData.subjects) {
      currentUserData.subjects = { math: {}, words: {} };
    }
    if (!currentUserData.subjects[subjectId]) {
      currentUserData.subjects[subjectId] = {};
    }

    const existingLogs = currentUserData.subjects[subjectId].skipLogs || currentUserData.skipLogs || [];
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

    currentUserData.subjects[subjectId].skipLogs = updatedLogs;
    if (subjectId === 'math') {
        currentUserData.skipLogs = updatedLogs; // backward compat fallback
    }

    state.profiles[activeId].userData = currentUserData;
    safeSaveProfilesState(state);
    return newLog;
  },

  // Shop State (scoped to activeProfileId)
  getShopState() {
    const active = this.getActiveProfile();
    return active.shopState || DEFAULT_PROFILE.shopState;
  },
  saveShopState(equippedItems, unlockedItems, redeemedPromoCodes) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    const currentShopState = state.profiles[activeId].shopState || {};
    state.profiles[activeId].shopState = {
      equippedItems: equippedItems ?? currentShopState.equippedItems ?? [],
      unlockedItems: unlockedItems ?? currentShopState.unlockedItems ?? [],
      redeemedPromoCodes: redeemedPromoCodes ?? currentShopState.redeemedPromoCodes ?? []
    };
    safeSaveProfilesState(state);
  },
  getRedeemedPromoCodes() {
    const shopState = this.getShopState();
    return Array.isArray(shopState.redeemedPromoCodes) ? shopState.redeemedPromoCodes : [];
  },
  addRedeemedPromoCode(code) {
    const currentCodes = this.getRedeemedPromoCodes();
    const normalized = String(code).toUpperCase().trim();
    if (!currentCodes.includes(normalized)) {
      const updated = [...currentCodes, normalized];
      const shopState = this.getShopState();
      this.saveShopState(shopState.equippedItems, shopState.unlockedItems, updated);
      return updated;
    }
    return currentCodes;
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

  // Per-Profile Reminder Settings
  getProfileReminderSettings(profileId) {
    const state = safeGetProfilesState();
    const targetId = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    const prof = state.profiles[targetId];
    if (prof && prof.dailyReminderEnabled !== undefined && prof.reminderTime !== undefined) {
      return {
        dailyReminderEnabled: prof.dailyReminderEnabled,
        reminderTime: prof.reminderTime
      };
    }
    // Fallback / migration: check legacy global settings
    const globalSettings = this.getNotificationSettings();
    return {
      dailyReminderEnabled: prof?.dailyReminderEnabled ?? globalSettings.dailyReminderEnabled ?? true,
      reminderTime: prof?.reminderTime || globalSettings.reminderTime || '17:00'
    };
  },
  saveProfileReminderSettings(profileId, settings = {}) {
    const state = safeGetProfilesState();
    const targetId = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[targetId]) {
      state.profiles[targetId] = { ...DEFAULT_PROFILE, id: targetId };
    }
    if (settings.dailyReminderEnabled !== undefined) {
      state.profiles[targetId].dailyReminderEnabled = Boolean(settings.dailyReminderEnabled);
    }
    if (settings.reminderTime !== undefined) {
      state.profiles[targetId].reminderTime = String(settings.reminderTime);
    }
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

  // In-App Rating Prompt Status (Max 60-day cooldown)
  getAppRatingStatus() {
    try {
      const raw = localStorage.getItem(KEYS.APP_RATING_STATUS);
      if (!raw) {
        return { hasRated: false, lastDismissedAt: null };
      }
      return JSON.parse(raw);
    } catch (e) {
      return { hasRated: false, lastDismissedAt: null };
    }
  },
  setAppRated(hasRated = true) {
    try {
      const current = this.getAppRatingStatus();
      localStorage.setItem(KEYS.APP_RATING_STATUS, JSON.stringify({
        ...current,
        hasRated: Boolean(hasRated),
        ratedAt: Date.now()
      }));
    } catch (e) {
      console.error('StorageService: error saving app rating status', e);
    }
  },
  dismissAppRatingPrompt() {
    try {
      const current = this.getAppRatingStatus();
      localStorage.setItem(KEYS.APP_RATING_STATUS, JSON.stringify({
        ...current,
        lastDismissedAt: Date.now()
      }));
    } catch (e) {
      console.error('StorageService: error dismissing app rating prompt', e);
    }
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
  getActiveClimbState(profileId = null, subjectId = 'math') {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    const profile = state.profiles[pid];
    if (!profile || !profile.userData) return null;

    let climb = null;
    if (profile.userData.subjects && profile.userData.subjects[subjectId] && profile.userData.subjects[subjectId].activeClimb) {
      climb = profile.userData.subjects[subjectId].activeClimb;
    } else if (subjectId === 'math' && profile.userData.activeClimb) {
      // Validate that fallback root climb is actually a math climb
      if (profile.userData.activeClimb.subject && profile.userData.activeClimb.subject !== 'math') {
        climb = null;
      } else {
        climb = profile.userData.activeClimb;
      }
    }

    if (!climb) return null;

    // Strict subject mismatch check
    if (climb.subject && climb.subject !== subjectId) {
      this.clearActiveClimbState(pid, subjectId);
      return null;
    }

    // Question content validation to prevent cross-subject pollution
    if (Array.isArray(climb.problemQueue) && climb.problemQueue.length > 0) {
      const MATH_TYPES = new Set(['fill_blank', 'missing_operator', 'money', 'fraction', 'decimal', 'applied', 'signed']);

      if (subjectId === 'math') {
        const hasNonMath = climb.problemQueue.some(p => {
          if (!p) return true;
          if (p.subject && p.subject !== 'math') return true;
          if (p.shapeSvg !== undefined && p.shapeSvg !== null) return true;
          if (p.mapData !== undefined && p.mapData !== null) return true;
          if (p.missingLetters !== undefined) return true;
          const isStandardMath = (p.num1 !== undefined && p.num2 !== undefined) || (p.type && MATH_TYPES.has(p.type));
          return !isStandardMath;
        });
        if (hasNonMath) {
          this.clearActiveClimbState(pid, subjectId);
          return null;
        }
      } else if (subjectId === 'world') {
        const hasNonWorld = climb.problemQueue.some(p => 
          !p || p.subject === 'math' || p.subject === 'words' || p.type === 'words' || p.missingLetters !== undefined || (p.num1 !== undefined && p.num2 !== undefined && p.type !== 'applied')
        );
        if (hasNonWorld) {
          this.clearActiveClimbState(pid, subjectId);
          return null;
        }
      } else if (subjectId === 'words') {
        const hasNonWords = climb.problemQueue.some(p => 
          !p || p.subject === 'math' || p.subject === 'world' || p.subject === 'coding' || p.shapeSvg || p.mapData || (p.num1 !== undefined && p.num2 !== undefined)
        );
        if (hasNonWords) {
          this.clearActiveClimbState(pid, subjectId);
          return null;
        }
      } else if (subjectId === 'coding') {
        const hasNonCoding = climb.problemQueue.some(p => 
          !p || p.subject === 'math' || p.subject === 'world' || p.subject === 'words' || p.shapeSvg || p.mapData || (p.num1 !== undefined && p.num2 !== undefined)
        );
        if (hasNonCoding) {
          this.clearActiveClimbState(pid, subjectId);
          return null;
        }
      }
    }

    if (climb.sessionQuestionIndex > 12 || (climb.questionsAnswered && climb.questionsAnswered % 12 === 0 && climb.questionsAnswered > 0)) {
      this.clearActiveClimbState(pid, subjectId);
      return null;
    }
    return climb;
  },

  saveActiveClimbState(climbState, profileId = null, subjectId = 'math') {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[pid]) return;
    const currentUserData = state.profiles[pid].userData || {};

    if (!currentUserData.subjects) {
      currentUserData.subjects = { math: {}, words: {}, world: {}, coding: {} };
    }
    if (!currentUserData.subjects[subjectId]) {
       currentUserData.subjects[subjectId] = {};
    }

    const stateWithSubject = {
      ...climbState,
      subject: subjectId,
      subjectId: subjectId
    };

    currentUserData.subjects[subjectId].activeClimb = stateWithSubject;
    if (subjectId === 'math') {
      currentUserData.activeClimb = stateWithSubject; // Fallback for math backwards compatibility
    }

    state.profiles[pid].userData = currentUserData;
    safeSaveProfilesState(state);
  },

  clearActiveClimbState(profileId = null, subjectId = 'math') {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[pid] || !state.profiles[pid].userData) return;
    const currentUserData = { ...state.profiles[pid].userData };

    if (currentUserData.subjects && currentUserData.subjects[subjectId]) {
      delete currentUserData.subjects[subjectId].activeClimb;
    }
    if (subjectId === 'math') {
      delete currentUserData.activeClimb;
    }

    state.profiles[pid].userData = currentUserData;
    safeSaveProfilesState(state);
  },

  getSubscriptionPlan(profileId = null) {
    const state = safeGetProfilesState();
    const pid = profileId || state.activeProfileId;
    const allProfiles = Object.values(state.profiles || {});
    const now = this.getSimulatedDate() || new Date();

    // Check tracked subscription object first
    if (state.subscription && state.subscription.planId) {
      // Check if scheduled cancellation period has expired
      if (state.subscription.cancelAtPeriodEnd && state.subscription.currentPeriodEnd) {
        const periodEndDate = new Date(state.subscription.currentPeriodEnd);
        if (now >= periodEndDate) {
          state.subscription = null;
          safeSaveProfilesState(state);
          this.updateSubscriptionState('free', null, true);
          return null;
        }
      }

      return {
        id: state.subscription.planId,
        tier: state.subscription.tier,
        cycle: state.subscription.cycle,
        cancelAtPeriodEnd: !!state.subscription.cancelAtPeriodEnd,
        currentPeriodEnd: state.subscription.currentPeriodEnd,
        canceledAt: state.subscription.canceledAt || null
      };
    }

    // Fallback: Check family plan first (annual or monthly)
    const hasFamAnnual = allProfiles.some(p => p.shopState?.unlockedItems?.includes('kibo_club_family_annual'));
    if (hasFamAnnual) return { id: 'kibo_club_family_annual', tier: 'family', cycle: 'annual', cancelAtPeriodEnd: false };

    const hasFamMonthly = allProfiles.some(p => p.shopState?.unlockedItems?.includes('kibo_club_family'));
    if (hasFamMonthly) return { id: 'kibo_club_family', tier: 'family', cycle: 'monthly', cancelAtPeriodEnd: false };

    if (state.isKiboClubFamily) return { id: 'kibo_club_family_annual', tier: 'family', cycle: 'annual', cancelAtPeriodEnd: false };

    // Check single plan
    if (pid && state.profiles[pid]) {
      const items = state.profiles[pid].shopState?.unlockedItems || [];
      if (items.includes('kibo_club_sub_annual')) return { id: 'kibo_club_sub_annual', tier: 'single', cycle: 'annual', cancelAtPeriodEnd: false };
      if (items.includes('kibo_club_sub')) return { id: 'kibo_club_sub', tier: 'single', cycle: 'monthly', cancelAtPeriodEnd: false };
    }

    // Check any profile if not found on active
    const hasSingleAnnual = allProfiles.some(p => p.shopState?.unlockedItems?.includes('kibo_club_sub_annual'));
    if (hasSingleAnnual) return { id: 'kibo_club_sub_annual', tier: 'single', cycle: 'annual', cancelAtPeriodEnd: false };

    const hasSingleMonthly = allProfiles.some(p => p.shopState?.unlockedItems?.includes('kibo_club_sub'));
    if (hasSingleMonthly) return { id: 'kibo_club_sub', tier: 'single', cycle: 'monthly', cancelAtPeriodEnd: false };

    return null;
  },

  hasFamilyPlan() {
    const plan = this.getSubscriptionPlan();
    return plan?.tier === 'family';
  },

  hasSinglePlan(profileId = null) {
    const plan = this.getSubscriptionPlan(profileId);
    return plan?.tier === 'single';
  },


  hasClubMembership(profileId = null) {
    if (this.hasFamilyPlan()) return true;
    return this.hasSinglePlan(profileId);
  },

  isKiboClubMember(profileId = null) {
    return this.hasClubMembership(profileId);
  },

  isProfileLocked(profileId) {
    if (!profileId) return false;
    const hasFamily = this.hasFamilyPlan();
    if (hasFamily) return false;
    const needsSelection = this.needsProfileDowngradeSelection();
    if (needsSelection) return false;
    const primaryId = this.getPrimaryProfileId() || this.getAllProfiles()[0]?.id;
    return profileId !== primaryId;
  },

  getPrimaryProfileId() {
    const state = safeGetProfilesState();
    return state.primaryProfileId || null;
  },

  setPrimaryProfileId(profileId) {
    const state = safeGetProfilesState();
    state.primaryProfileId = profileId;
    safeSaveProfilesState(state);
  },

  needsProfileDowngradeSelection() {
    const state = safeGetProfilesState();
    return !!state.needsProfileDowngradeSelection;
  },

  setNeedsProfileDowngradeSelection(value) {
    const state = safeGetProfilesState();
    state.needsProfileDowngradeSelection = value;
    safeSaveProfilesState(state);
  },

  updateSubscriptionState(planType, targetProfileId = null, isFinalResolution = false) {
    const state = safeGetProfilesState();
    const allProfileIds = Object.keys(state.profiles);
    let activeProfilesCount = allProfileIds.length;
    const now = this.getSimulatedDate() || new Date();

    // Remove existing premium subs from ALL profiles first
    const SUB_IDS = ['kibo_club_family', 'kibo_club_family_annual', 'kibo_club_sub', 'kibo_club_sub_annual'];
    allProfileIds.forEach(pid => {
      const prof = state.profiles[pid];
      if (prof.shopState) {
        if (prof.shopState.unlockedItems) {
          prof.shopState.unlockedItems = prof.shopState.unlockedItems.filter(
            id => !SUB_IDS.includes(id)
          );
        }
        if (prof.shopState.equippedItems) {
          prof.shopState.equippedItems = prof.shopState.equippedItems.filter(
            id => !SUB_IDS.includes(id)
          );
        }
      }
    });

    if (planType === 'kibo_club_family' || planType === 'kibo_club_family_annual') {
      const pidToUpgrade = targetProfileId || state.activeProfileId || allProfileIds[0];
      if (pidToUpgrade && state.profiles[pidToUpgrade]) {
        state.profiles[pidToUpgrade].shopState = state.profiles[pidToUpgrade].shopState || {};
        state.profiles[pidToUpgrade].shopState.unlockedItems = state.profiles[pidToUpgrade].shopState.unlockedItems || [];
        state.profiles[pidToUpgrade].shopState.unlockedItems.push(planType);
      }
      state.isKiboClubFamily = true;
      state.needsProfileDowngradeSelection = false;

      const isAnnual = planType.includes('annual');
      const periodEnd = new Date(now.getTime());
      if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setDate(periodEnd.getDate() + 30);

      state.subscription = {
        planId: planType,
        tier: 'family',
        cycle: isAnnual ? 'annual' : 'monthly',
        status: 'active',
        activatedAt: (state.subscription && state.subscription.planId === planType) ? (state.subscription.activatedAt || now.toISOString()) : now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        canceledAt: null
      };
    } else if (planType === 'kibo_club_sub' || planType === 'kibo_club_sub_annual') {
      const pidToUpgrade = targetProfileId || state.activeProfileId || allProfileIds[0];
      if (pidToUpgrade && state.profiles[pidToUpgrade]) {
        state.profiles[pidToUpgrade].shopState = state.profiles[pidToUpgrade].shopState || {};
        state.profiles[pidToUpgrade].shopState.unlockedItems = state.profiles[pidToUpgrade].shopState.unlockedItems || [];
        state.profiles[pidToUpgrade].shopState.unlockedItems.push(planType);
        state.primaryProfileId = pidToUpgrade;
      }
      state.isKiboClubFamily = false;
      if (activeProfilesCount > 1 && !isFinalResolution) {
         state.needsProfileDowngradeSelection = true;
      } else {
         state.needsProfileDowngradeSelection = false;
      }

      const isAnnual = planType.includes('annual');
      const periodEnd = new Date(now.getTime());
      if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setDate(periodEnd.getDate() + 30);

      state.subscription = {
        planId: planType,
        tier: 'single',
        cycle: isAnnual ? 'annual' : 'monthly',
        status: 'active',
        activatedAt: (state.subscription && state.subscription.planId === planType) ? (state.subscription.activatedAt || now.toISOString()) : now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        canceledAt: null
      };
    } else {
      // Free / none
      state.isKiboClubFamily = false;
      state.subscription = null;
      if (activeProfilesCount > 1 && !isFinalResolution) {
         state.needsProfileDowngradeSelection = true;
      } else {
         state.needsProfileDowngradeSelection = false;
      }
    }

    safeSaveProfilesState(state);
  },

  /**
   * Enforces the "cancel at period end" policy.
   * Keeps access until currentPeriodEnd without prorated refund.
   * Checks for rapid cancellation abuse after purchasing discounted items.
   */
  cancelSubscription(cancelAtPeriodEnd = true) {
    const state = safeGetProfilesState();
    const currentPlan = this.getSubscriptionPlan();
    if (!currentPlan) {
      return { success: false, reason: 'No active subscription found' };
    }

    const now = this.getSimulatedDate() || new Date();

    if (cancelAtPeriodEnd) {
      if (!state.subscription) {
        const isAnnual = currentPlan.cycle === 'annual';
        const periodEnd = new Date(now.getTime());
        if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setDate(periodEnd.getDate() + 30);

        state.subscription = {
          planId: currentPlan.id,
          tier: currentPlan.tier,
          cycle: currentPlan.cycle,
          status: 'canceling',
          activatedAt: now.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          cancelAtPeriodEnd: true,
          canceledAt: now.toISOString()
        };
      } else {
        state.subscription.cancelAtPeriodEnd = true;
        state.subscription.status = 'canceling';
        state.subscription.canceledAt = now.toISOString();
      }

      // Check for rapid churn abuse
      const abuseCheck = this.checkSubscriptionAbuse(state.subscription);
      if (abuseCheck.flagged && abuseCheck.flag) {
        state.accountRiskFlags = state.accountRiskFlags || [];
        if (!state.accountRiskFlags.some(f => f.id === abuseCheck.flag.id)) {
          state.accountRiskFlags.push(abuseCheck.flag);
        }
      }

      safeSaveProfilesState(state);

      this.recordLedgerEntry({
        type: 'SUBSCRIPTION_CANCEL_SCHEDULED',
        planId: currentPlan.id,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: state.subscription.currentPeriodEnd,
        isFlaggedAbuse: abuseCheck.flagged
      });

      return {
        success: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: state.subscription.currentPeriodEnd,
        flagged: abuseCheck.flagged,
        flagReason: abuseCheck.reason
      };
    } else {
      this.updateSubscriptionState('free', null, true);
      return { success: true, cancelAtPeriodEnd: false };
    }
  },

  /**
   * Resumes / un-cancels an active subscription that was set to cancel at period end.
   */
  reactivateSubscription() {
    const state = safeGetProfilesState();
    if (state.subscription && state.subscription.cancelAtPeriodEnd) {
      state.subscription.cancelAtPeriodEnd = false;
      state.subscription.status = 'active';
      state.subscription.canceledAt = null;
      safeSaveProfilesState(state);

      this.recordLedgerEntry({
        type: 'SUBSCRIPTION_REACTIVATED',
        planId: state.subscription.planId
      });

      return { success: true };
    }
    return { success: false, reason: 'No pending cancellation found' };
  },

  /**
   * Retrieves all account risk/fraud flags.
   */
  getAccountRiskFlags() {
    const state = safeGetProfilesState();
    return state.accountRiskFlags || [];
  },

  /**
   * Flags the account for suspicious behavior / abuse.
   */
  flagAccount(flagDetails) {
    const state = safeGetProfilesState();
    state.accountRiskFlags = state.accountRiskFlags || [];
    const record = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (this.getSimulatedDate() || new Date()).toISOString(),
      ...flagDetails
    };
    state.accountRiskFlags.push(record);
    safeSaveProfilesState(state);

    this.recordLedgerEntry({
      type: 'ACCOUNT_RISK_FLAGGED',
      ...flagDetails
    });

    return record;
  },

  /**
   * Detects rapid cancellation abuse following member-discounted purchases.
   */
  checkSubscriptionAbuse(subscription) {
    if (!subscription) return { flagged: false };
    const now = this.getSimulatedDate() || new Date();
    const activatedAt = subscription.activatedAt ? new Date(subscription.activatedAt) : new Date(0);
    const diffHours = (now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60);

    let transactions = [];
    try {
      const raw = localStorage.getItem('kibo_transaction_ledger_history');
      transactions = raw ? JSON.parse(raw) : [];
    } catch {}

    const recentPurchases = transactions.filter(t => {
      if (t.type !== 'SHOP_PURCHASE' && t.type !== 'REAL_MONEY_PURCHASE' && t.type !== 'IAP_PURCHASE') return false;
      const tTime = new Date(t.timestamp);
      return tTime >= activatedAt;
    });

    const userData = this.getUserData('math');
    const hasBoughtDiscounts = userData.hasBoughtGemsWithRealMoney || recentPurchases.length > 0;

    // Flag if user subscribed and canceled within 48 hours after buying items/currency
    if (diffHours <= 48 && hasBoughtDiscounts) {
      const flag = this.flagAccount({
        flagType: 'RAPID_CANCEL_AFTER_DISCOUNT_PURCHASE',
        severity: 'HIGH',
        reason: `Subscription canceled ${diffHours.toFixed(1)} hours after activation with item/currency purchases. Potential discount arbitrage attempt.`,
        metadata: {
          activatedAt: subscription.activatedAt,
          canceledAt: now.toISOString(),
          hoursActive: Number(diffHours.toFixed(2)),
          purchaseCount: recentPurchases.length
        }
      });
      return { flagged: true, reason: flag.reason, flag };
    }

    return { flagged: false };
  },

  /**
   * Direct ledger recorder helper avoiding circular imports.
   */
  recordLedgerEntry(details) {
    try {
      const KEY = 'kibo_transaction_ledger_history';
      const raw = localStorage.getItem(KEY);
      const ledger = raw ? JSON.parse(raw) : [];
      ledger.push({
        txId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: (this.getSimulatedDate() || new Date()).toISOString(),
        ...details
      });
      localStorage.setItem(KEY, JSON.stringify(ledger.slice(-100)));
    } catch (e) {
      console.error('storageService: error recording ledger entry', e);
    }
  },

  getSubjectRating(profileId, subjectId = 'math') {
    const profile = this.getProfileById(profileId);
    if (!profile || !profile.userData) return 1000;
    if (profile.userData.subjects && profile.userData.subjects[subjectId]) {
      const sub = profile.userData.subjects[subjectId];
      if (sub.adaptiveCompetenceRating !== undefined) return sub.adaptiveCompetenceRating;
      if (sub.competenceRank !== undefined) return sub.competenceRank;
    }
    return profile?.userData?.subjectRatings?.[subjectId] || (subjectId === 'math' ? profile?.userData?.adaptiveCompetenceRating : 1000) || 1000;
  },

  getSubjectStreak(profileId, subjectId = 'math') {
    const profile = this.getProfileById(profileId);
    if (!profile || !profile.userData) return 0;
    return profile.userData.streak ?? 0;
  },

  getAggregateRating(profileId) {
    const profile = this.getProfileById(profileId);
    const ratings = profile?.userData?.subjectRatings || { math: profile?.userData?.adaptiveCompetenceRating || 1000 };
    const values = Object.values(ratings);
    if (values.length === 0) return 1000;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  },

  getSimulatedDate() {
    try {
      const stored = localStorage.getItem('kibo_dev_simulated_date');
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  },

  setSimulatedDate(dateVal) {
    try {
      if (!dateVal) {
        localStorage.removeItem('kibo_dev_simulated_date');
      } else {
        const iso = (dateVal instanceof Date ? dateVal : new Date(dateVal)).toISOString();
        localStorage.setItem('kibo_dev_simulated_date', iso);
      }
    } catch {
      // ignore
    }
  },

  getCurrentDate() {
    return this.getSimulatedDate() || new Date();
  },

  getConsumables(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    const saved = profile?.userData?.consumables;
    return {
      shieldCount: saved?.shieldCount ?? 1,
      streakSaverCount: saved?.streakSaverCount ?? 0,
      doubleSparksPotionCount: saved?.doubleSparksPotionCount ?? saved?.doubleCoinPotionCount ?? 0,
      hintScrollCount: saved?.hintScrollCount ?? 2,
      letterSpyglassCount: saved?.letterSpyglassCount ?? 2,
      letterPrunerCount: saved?.letterPrunerCount ?? 2,
      explorerCompassCount: saved?.explorerCompassCount ?? 2
    };
  },

  saveConsumables(consumables, profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (state.profiles[pid]) {
      state.profiles[pid].userData = state.profiles[pid].userData || {};
      state.profiles[pid].userData.consumables = {
        ...(state.profiles[pid].userData.consumables || {}),
        ...consumables
      };
      safeSaveProfilesState(state);
    }
  },

  // ─── Daily Bonus Vault Tracking ──────────────────────────────────────────
  canClaimDailyVault(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile) return false;
    const now = this.getCurrentDate();
    const todayStr = now.toISOString().slice(0, 10);
    const lastClaim = profile.userData?.lastDailyVaultClaimDate || null;
    return lastClaim !== todayStr;
  },

  claimDailyVault(profileId = null, isKiboClub = false) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile) return null;

    const now = this.getCurrentDate();
    const todayStr = now.toISOString().slice(0, 10);

    const hasClub = isKiboClub || this.hasClubMembership(pid);
    
    // Reward payloads: Free gets 30 sparks + 1 shield + 1 scroll, Club gets 100 sparks + 2 shields + 1 potion + 2 scrolls
    const sparksGranted = hasClub ? 100 : 30;
    const shieldsGranted = hasClub ? 2 : 1;
    const potionsGranted = hasClub ? 1 : 0;
    const scrollsGranted = hasClub ? 2 : 1;

    // Update sparks
    const currentSparks = profile.userData?.sparks ?? 0;
    const newSparks = currentSparks + sparksGranted;

    // Update consumables
    const curConsumables = this.getConsumables(pid);
    const nextConsumables = {
      shieldCount: (curConsumables.shieldCount || 0) + shieldsGranted,
      doubleSparksPotionCount: (curConsumables.doubleSparksPotionCount || 0) + potionsGranted,
      hintScrollCount: (curConsumables.hintScrollCount || 0) + scrollsGranted,
      streakSaverCount: curConsumables.streakSaverCount || 0
    };
    this.saveConsumables(nextConsumables, pid);

    // Save profile state
    const state = safeGetProfilesState();
    if (state.profiles[pid]) {
      state.profiles[pid].userData = state.profiles[pid].userData || {};
      state.profiles[pid].userData.sparks = newSparks;
      state.profiles[pid].userData.lastDailyVaultClaimDate = todayStr;
      safeSaveProfilesState(state);
    }

    try {
      localStorage.setItem('kibo_math_sparks', newSparks.toString());
    } catch {}

    return {
      sparks: sparksGranted,
      shields: shieldsGranted,
      potions: potionsGranted,
      scrolls: scrollsGranted,
      isKiboClub: hasClub,
      totalSparks: newSparks
    };
  },

  // ─── Unlocked & Seen Badges Tracking ────────────────────────────────────
  getSeenBadges(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile || !profile.userData) return [];
    return profile.userData.seenBadges || [];
  },

  markBadgesAsSeen(badgeIds = [], profileId = null) {
    if (!Array.isArray(badgeIds) || badgeIds.length === 0) return;
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return;
    const currentUserData = state.profiles[pid].userData || {};
    const existingSeen = new Set(currentUserData.seenBadges || []);
    badgeIds.forEach(id => existingSeen.add(id));
    currentUserData.seenBadges = Array.from(existingSeen);
    state.profiles[pid].userData = currentUserData;
    safeSaveProfilesState(state);
  },

  // ─── COPPA-Compliant Climber Friend Code (1.07 Billion Combinations) ─────
  getFriendCode(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile) return 'KIBO-7842AB';
    if (profile.friendCode) return profile.friendCode;

    // Generate unique 6-character code avoiding ambiguous chars (2-9, A-Z excl I, O, 1, 0)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `KIBO-${randomPart}`;
    this.updateProfile(pid, { friendCode: newCode });
    return newCode;
  },

  // ─── Friend Management (Max 25 friends per profile) ───────────────────────
  getFriends(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile || !Array.isArray(profile.friends)) return [];
    return profile.friends.slice(0, 25);
  },

  getFriendRequests(profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const profile = this.getProfileById(pid);
    if (!profile || !Array.isArray(profile.friendRequests)) return [];
    return profile.friendRequests;
  },

  sendFriendRequest(targetUserData, profileId = null) {
    if (!targetUserData) return this.getFriendRequests(profileId);
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return [];

    if (!Array.isArray(state.profiles[pid].friendRequests)) {
      state.profiles[pid].friendRequests = [];
    }

    const currentRequests = state.profiles[pid].friendRequests;
    const targetId = targetUserData.id || targetUserData.uid || targetUserData.username;
    const normalizedUsername = (targetUserData.username || targetUserData.name || '').trim().toLowerCase();
    const normalizedTargetId = (targetId || '').trim().toLowerCase();

    // Check if already friends
    if (this.isFriend(targetId, pid) || (normalizedUsername && this.isFriend(normalizedUsername, pid))) {
      throw new Error('You are already friends with this climber!');
    }

    // Check if request already sent or exists
    const exists = currentRequests.some(r => {
      const rId = (r.receiverId || r.receiverUid || r.targetId || r.receiverProfileId || '').trim().toLowerCase();
      const rUser = (r.receiverUsername || r.username || r.name || '').trim().toLowerCase();
      return (normalizedTargetId && rId === normalizedTargetId) ||
             (normalizedUsername && rUser === normalizedUsername);
    });

    if (exists) {
      throw new Error('Friend request already sent.');
    }

    const activeProfile = state.profiles[pid];
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Identify if target is a local profile in profiles state
    let localTargetProfileId = null;
    if (targetUserData.profileId && state.profiles[targetUserData.profileId] && targetUserData.profileId !== pid) {
      localTargetProfileId = targetUserData.profileId;
    } else {
      // Find by matching username or id among other local profiles
      for (const [otherPid, otherProf] of Object.entries(state.profiles)) {
        if (otherPid === pid) continue;
        const otherUsername = (otherProf.username || otherProf.name || '').trim().toLowerCase();
        if (otherPid === targetId || (normalizedUsername && otherUsername === normalizedUsername)) {
          localTargetProfileId = otherPid;
          break;
        }
      }
    }

    const resolvedReceiverProfileId = localTargetProfileId || targetUserData.profileId || (targetId.includes('_') ? targetId.split('_')[1] : 'default_child');
    const resolvedReceiverUid = targetUserData.uid || (targetId.includes('_') ? targetId.split('_')[0] : (activeProfile.userData?.cloudUid || 'local'));

    const newRequest = {
      id: requestId,
      type: 'sent', // 'sent' | 'received'
      targetId: targetId,
      receiverUid: resolvedReceiverUid,
      receiverProfileId: resolvedReceiverProfileId,
      receiverUsername: targetUserData.username || targetUserData.name || 'Climber Friend',
      name: targetUserData.name || targetUserData.username || 'Climber Friend',
      score: Number(targetUserData.score) || 1000,
      equipped: Array.isArray(targetUserData.equipped) ? targetUserData.equipped : [],
      subjectsMastered: Number(targetUserData.subjectsMastered) || 5,
      createdAt: new Date().toISOString()
    };

    currentRequests.push(newRequest);

    // If target profile is a local profile on this same device / account, deliver incoming request immediately!
    if (localTargetProfileId && state.profiles[localTargetProfileId]) {
      if (!Array.isArray(state.profiles[localTargetProfileId].friendRequests)) {
        state.profiles[localTargetProfileId].friendRequests = [];
      }
      
      const senderRating = activeProfile.userData?.adaptiveCompetenceRating || activeProfile.userData?.competenceRank || 1000;
      const senderEquipped = activeProfile.shopState?.equippedItems || [];
      const senderTricks = Object.keys(activeProfile.userData?.masteredTricks || {}).length || 5;

      state.profiles[localTargetProfileId].friendRequests.push({
        id: requestId,
        type: 'received',
        senderId: `${activeProfile.userData?.cloudUid || 'local'}_${pid}`,
        senderUid: activeProfile.userData?.cloudUid || 'local',
        senderProfileId: pid,
        senderUsername: activeProfile.username || activeProfile.name || 'Climber Friend',
        name: activeProfile.username || activeProfile.name || 'Climber Friend',
        score: senderRating,
        equipped: senderEquipped,
        subjectsMastered: senderTricks,
        createdAt: new Date().toISOString()
      });
    }

    safeSaveProfilesState(state);
    return currentRequests;
  },

  receiveFriendRequest(incomingData, profileId = null) {
    if (!incomingData) return this.getFriendRequests(profileId);
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return [];

    if (!Array.isArray(state.profiles[pid].friendRequests)) {
      state.profiles[pid].friendRequests = [];
    }

    const currentRequests = state.profiles[pid].friendRequests;
    const senderId = incomingData.senderId || incomingData.senderUid || incomingData.id || incomingData.uid;
    const senderUsername = incomingData.senderUsername || incomingData.username || incomingData.name;
    const normalizedUsername = (senderUsername || '').trim().toLowerCase();

    // Check if already friends
    if (this.isFriend(senderId, pid) || (normalizedUsername && this.isFriend(normalizedUsername, pid))) {
      return currentRequests;
    }

    const exists = currentRequests.some(r => {
      const rId = (r.senderId || r.senderUid || r.targetId || r.id || '').trim().toLowerCase();
      const rUser = (r.senderUsername || r.username || r.name || '').trim().toLowerCase();
      return (incomingData.id && r.id === incomingData.id) ||
             (senderId && rId === senderId.toLowerCase()) ||
             (normalizedUsername && rUser === normalizedUsername);
    });

    if (!exists) {
      currentRequests.push({
        id: incomingData.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'received',
        senderId: senderId,
        senderUid: incomingData.senderUid || incomingData.uid,
        senderProfileId: incomingData.senderProfileId || incomingData.profileId || 'default_child',
        senderUsername: senderUsername || 'Climber Friend',
        name: senderUsername || 'Climber Friend',
        score: Number(incomingData.score) || 1000,
        equipped: Array.isArray(incomingData.equipped) ? incomingData.equipped : [],
        subjectsMastered: Number(incomingData.subjectsMastered) || 5,
        createdAt: incomingData.createdAt || new Date().toISOString()
      });
      safeSaveProfilesState(state);
    }
    return currentRequests;
  },

  acceptFriendRequest(requestId, profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return { friends: [], requests: [] };

    if (!Array.isArray(state.profiles[pid].friendRequests)) {
      state.profiles[pid].friendRequests = [];
    }

    const reqIndex = state.profiles[pid].friendRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) {
      return { friends: this.getFriends(pid), requests: this.getFriendRequests(pid) };
    }

    const req = state.profiles[pid].friendRequests[reqIndex];
    state.profiles[pid].friendRequests.splice(reqIndex, 1);

    const activeProfile = state.profiles[pid];

    // Add sender as friend for the active profile
    const friendData = {
      id: req.senderId || req.targetId || req.receiverUid,
      uid: req.senderUid || req.receiverUid,
      profileId: req.senderProfileId || req.receiverProfileId || 'default_child',
      username: req.senderUsername || req.receiverUsername || req.name,
      name: req.name || req.senderUsername || req.receiverUsername,
      score: req.score || 1000,
      equipped: req.equipped || [],
      subjectsMastered: req.subjectsMastered || 5
    };

    if (!Array.isArray(activeProfile.friends)) {
      activeProfile.friends = [];
    }
    const currentFriends = activeProfile.friends;
    const friendId = friendData.id || friendData.uid || friendData.username;
    const normalizedUsername = (friendData.username || friendData.name || '').trim().toLowerCase();
    const normalizedFriendId = (friendId || '').trim().toLowerCase();

    const exists = currentFriends.some(f => {
      const fId = (f.id || f.uid || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return (normalizedFriendId && fId === normalizedFriendId) || 
             (normalizedUsername && fUser === normalizedUsername);
    });

    if (!exists && currentFriends.length < 25) {
      currentFriends.push({
        id: friendId,
        uid: friendData.uid || (friendId.includes('_') ? friendId.split('_')[0] : friendId),
        profileId: friendData.profileId || (friendId.includes('_') ? friendId.split('_')[1] : 'default_child'),
        username: friendData.username || friendData.name || 'Climber Friend',
        name: friendData.name || friendData.username || 'Climber Friend',
        score: Number(friendData.score) || 1000,
        equipped: Array.isArray(friendData.equipped) ? friendData.equipped : [],
        subjectsMastered: Number(friendData.subjectsMastered) || 5,
        addedAt: new Date().toISOString(),
        isDisplayedOnMain: false
      });
    }

    // Check if the sender is another local profile in profiles state -> update sender too!
    const senderLocalPid = req.senderProfileId;
    if (senderLocalPid && state.profiles[senderLocalPid] && senderLocalPid !== pid) {
      const senderProfile = state.profiles[senderLocalPid];
      // Remove the matching sent/received request from sender profile
      if (Array.isArray(senderProfile.friendRequests)) {
        senderProfile.friendRequests = senderProfile.friendRequests.filter(r => r.id !== requestId);
      }
      // Add active profile to sender's friend list
      if (!Array.isArray(senderProfile.friends)) {
        senderProfile.friends = [];
      }
      const senderFriends = senderProfile.friends;
      const receiverNormalized = (activeProfile.username || activeProfile.name || '').trim().toLowerCase();
      const receiverExists = senderFriends.some(f => {
        const fId = (f.id || f.uid || f.profileId || '').trim().toLowerCase();
        const fUser = (f.username || f.name || '').trim().toLowerCase();
        return fId === pid.toLowerCase() || (receiverNormalized && fUser === receiverNormalized);
      });

      if (!receiverExists && senderFriends.length < 25) {
        senderFriends.push({
          id: `${activeProfile.userData?.cloudUid || 'local'}_${pid}`,
          uid: activeProfile.userData?.cloudUid || 'local',
          profileId: pid,
          username: activeProfile.username || activeProfile.name || 'Climber Friend',
          name: activeProfile.username || activeProfile.name || 'Climber Friend',
          score: Number(activeProfile.userData?.adaptiveCompetenceRating || 1000),
          equipped: Array.isArray(activeProfile.shopState?.equippedItems) ? activeProfile.shopState.equippedItems : [],
          subjectsMastered: Object.keys(activeProfile.userData?.masteredTricks || {}).length || 5,
          addedAt: new Date().toISOString(),
          isDisplayedOnMain: false
        });
      }
    }

    safeSaveProfilesState(state);

    return {
      friends: this.getFriends(pid),
      requests: this.getFriendRequests(pid)
    };
  },

  declineFriendRequest(requestId, profileId = null) {
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return [];

    // Remove from the current profile
    if (Array.isArray(state.profiles[pid].friendRequests)) {
      state.profiles[pid].friendRequests = state.profiles[pid].friendRequests.filter(r => r.id !== requestId);
    }

    // Also remove from any other local profile that holds this request ID
    Object.keys(state.profiles).forEach(otherPid => {
      if (otherPid !== pid && Array.isArray(state.profiles[otherPid].friendRequests)) {
        state.profiles[otherPid].friendRequests = state.profiles[otherPid].friendRequests.filter(r => r.id !== requestId);
      }
    });

    safeSaveProfilesState(state);
    return state.profiles[pid].friendRequests;
  },

  cancelFriendRequest(requestId, profileId = null) {
    return this.declineFriendRequest(requestId, profileId);
  },

  hasPendingRequestWith(targetIdOrUsername, profileId = null) {
    if (!targetIdOrUsername) return false;
    const requests = this.getFriendRequests(profileId);
    const target = targetIdOrUsername.trim().toLowerCase();
    return requests.some(r => {
      const rId = (r.targetId || r.receiverUid || r.senderId || r.senderUid || r.receiverProfileId || r.senderProfileId || '').trim().toLowerCase();
      const rUser = (r.receiverUsername || r.senderUsername || r.name || r.username || '').trim().toLowerCase();
      return rId === target || rUser === target;
    });
  },

  addFriend(friendData, profileId = null) {
    if (!friendData) return this.getFriends(profileId);
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid]) return [];

    if (!Array.isArray(state.profiles[pid].friends)) {
      state.profiles[pid].friends = [];
    }

    const currentFriends = state.profiles[pid].friends;
    const friendId = friendData.id || friendData.uid || friendData.username;
    const normalizedUsername = (friendData.username || friendData.name || '').trim().toLowerCase();
    const normalizedFriendId = (friendId || '').trim().toLowerCase();

    // Prevent duplicate entries
    const exists = currentFriends.some(f => {
      const fId = (f.id || f.uid || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return (normalizedFriendId && fId === normalizedFriendId) || 
             (normalizedUsername && fUser === normalizedUsername);
    });

    if (!exists) {
      if (currentFriends.length >= 25) {
        throw new Error('Maximum friend limit reached (25 friends max).');
      }

      const newFriend = {
        id: friendId,
        uid: friendData.uid || (friendId.includes('_') ? friendId.split('_')[0] : friendId),
        profileId: friendData.profileId || (friendId.includes('_') ? friendId.split('_')[1] : 'default_child'),
        username: friendData.username || friendData.name || 'Climber Friend',
        name: friendData.name || friendData.username || 'Climber Friend',
        score: Number(friendData.score) || 1000,
        equipped: Array.isArray(friendData.equipped) ? friendData.equipped : [],
        subjectsMastered: Number(friendData.subjectsMastered) || 5,
        addedAt: new Date().toISOString(),
        isDisplayedOnMain: false
      };

      currentFriends.push(newFriend);
      safeSaveProfilesState(state);
    }

    return state.profiles[pid].friends;
  },

  toggleFriendDisplayOnMain(friendIdOrUsername, profileId = null) {
    if (!friendIdOrUsername) return this.getFriends(profileId);
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid] || !Array.isArray(state.profiles[pid].friends)) return [];

    const target = friendIdOrUsername.trim().toLowerCase();

    // Find the friend
    const friendIndex = state.profiles[pid].friends.findIndex(f => {
      const fId = (f.id || f.uid || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return fId === target || fUser === target;
    });

    if (friendIndex === -1) return state.profiles[pid].friends;

    const friend = state.profiles[pid].friends[friendIndex];

    if (friend.isDisplayedOnMain) {
      // Toggle off
      friend.isDisplayedOnMain = false;
    } else {
      // Toggle on - check if we already have 2
      const currentlyDisplayed = state.profiles[pid].friends.filter(f => f.isDisplayedOnMain).length;
      if (currentlyDisplayed >= 2) {
        throw new Error('You can only display up to 2 friends on the main page.');
      }
      friend.isDisplayedOnMain = true;
    }

    safeSaveProfilesState(state);
    return state.profiles[pid].friends;
  },

  removeFriend(friendIdOrUsername, profileId = null) {
    if (!friendIdOrUsername) return this.getFriends(profileId);
    const pid = profileId || this.getActiveProfileId();
    const state = safeGetProfilesState();
    if (!state.profiles[pid] || !Array.isArray(state.profiles[pid].friends)) return [];

    const target = friendIdOrUsername.trim().toLowerCase();
    
    // Find if target is a local profile in state.profiles
    let removedFriendLocalPid = null;
    const removedFriend = state.profiles[pid].friends.find(f => {
      const fId = (f.id || f.uid || f.profileId || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return fId === target || fUser === target;
    });
    if (removedFriend) {
      removedFriendLocalPid = removedFriend.profileId;
    }

    state.profiles[pid].friends = state.profiles[pid].friends.filter(f => {
      const fId = (f.id || f.uid || f.profileId || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return fId !== target && fUser !== target;
    });

    // If removed friend was a local profile, also remove current profile from that local profile
    if (removedFriendLocalPid && state.profiles[removedFriendLocalPid] && Array.isArray(state.profiles[removedFriendLocalPid].friends)) {
      const currentUsername = (state.profiles[pid].username || state.profiles[pid].name || '').trim().toLowerCase();
      state.profiles[removedFriendLocalPid].friends = state.profiles[removedFriendLocalPid].friends.filter(f => {
        const fId = (f.id || f.uid || f.profileId || '').trim().toLowerCase();
        const fUser = (f.username || f.name || '').trim().toLowerCase();
        return fId !== pid.toLowerCase() && (!currentUsername || fUser !== currentUsername);
      });
    }

    safeSaveProfilesState(state);
    return state.profiles[pid].friends;
  },

  isFriend(friendIdOrUsername, profileId = null) {
    if (!friendIdOrUsername) return false;
    const friends = this.getFriends(profileId);
    const target = friendIdOrUsername.trim().toLowerCase();
    return friends.some(f => {
      const fId = (f.id || f.uid || f.profileId || '').trim().toLowerCase();
      const fUser = (f.username || f.name || '').trim().toLowerCase();
      return fId === target || fUser === target;
    });
  },

  isOnboarded() {
    return !!localStorage.getItem(KEYS.HAS_ONBOARDED) ||
      !!localStorage.getItem('kibo_math_has_onboarded') ||
      !!localStorage.getItem('kibo_math_tier');
  },

  setOnboarded(value = true) {
    if (value) {
      localStorage.setItem(KEYS.HAS_ONBOARDED, 'true');
      localStorage.setItem('kibo_math_has_onboarded', 'true');
    } else {
      localStorage.removeItem(KEYS.HAS_ONBOARDED);
      localStorage.removeItem('kibo_math_has_onboarded');
    }
  }
};


