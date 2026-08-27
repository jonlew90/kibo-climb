import React, { useState, useEffect, useRef } from 'react';
import { Flame, Settings, Trophy, Crown, Zap, ArrowLeft, ShoppingBag, Sparkles, Award, Info, X, Lock, ShieldCheck, Users, Mountain, ChevronDown, Star, Scroll, WifiOff, Compass } from 'lucide-react';
import Mascot from './components/Mascot';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import PinGateModal from './components/PinGateModal';
import ParentDashboardModal from './components/ParentDashboardModal';
import StreakSavedModal from './components/StreakSavedModal';
import DailyStreakIncreasedModal from './components/DailyStreakIncreasedModal';
import PerfectMonthProgressModal from './components/PerfectMonthProgressModal';
import FirstLaunchOnboardingModal from './components/FirstLaunchOnboardingModal';
import ProfileSelectorScreen from './components/ProfileSelectorScreen';
import MathSessionView from './components/MathSessionView';
import WordsSessionView from './components/WordsSessionView';
import WorldSessionView from './components/WorldSessionView';
import CodingSessionView from './components/CodingSessionView';
import BadgesModal from './components/BadgesModal';
import DevControlPanel from './components/DevControlPanel';
import RollingNumberTicker from './components/RollingNumberTicker';
import { checkAndPromptLinkAccount } from './utils/linkPromptLogic';
import { useDevState } from './hooks/useDevState';
import { evaluateBadges } from './utils/badgeManager';
import { BADGES_CATALOG } from './data/badges';
import { CURRICULUM_TIERS } from './utils/mathCurriculum';
import { getItemById, getItemSlot } from './utils/itemsCatalog';
import { soundFx } from './utils/audio';
import { BRAND_CONFIG } from './config/brand';
import { pluralize } from './utils/formatters';
import { storageService } from './services/storageService';
import { questService } from './services/questService';
import { getCompetenceRankTier } from './utils/GameEconomyModel';
import {
  getTodayStr,
  getYesterdayStr,
  calculateStreakFromHistory,
  getCurrentTimezone,
  isWithinTravelGracePeriod
} from './utils/dateUtils';
import { authService } from './services/authService';
import { syncService } from './services/syncService';
import { shopLedgerService } from './services/shopLedgerService';
import { leaderboardService } from './services/leaderboardService';
import { analyticsService } from './services/analyticsService';
import AccountLinkModal from './components/AccountLinkModal';
import { getNotificationPrefs, scheduleAllProfileReminders } from './utils/notifications';
import MockCheckoutModal from './components/MockCheckoutModal';
import StripeCheckoutModal from './components/StripeCheckoutModal';
import FamilyPlanUpgradeModal from './components/FamilyPlanUpgradeModal';
import SettingsScreen from './components/SettingsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import ShareModal from './components/ShareModal';
import ReferralRewardModal from './components/ReferralRewardModal';
import NewsModal from './components/NewsModal';
import { getNewsItems } from './utils/newsManager';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import LeaderboardIcon from './components/LeaderboardIcon';
import LeaderboardScreen from './components/LeaderboardScreen';
import QuestsScreen from './components/QuestsScreen';
import FeedbackModal from './components/FeedbackModal';
import AddFriendModal from './components/AddFriendModal';
import SubjectWallpaper from './components/SubjectWallpaper';
import { setHapticsEnabled } from './utils/audio';

export default function App() {
  // App State: 'adaptive_session' | 'settings' | 'privacy' | 'terms' | 'leaderboard'
  const [activeProfileId, setActiveProfileId] = useState(() => {
    return storageService.getActiveProfileId();
  });
  const [activeSubject, setActiveSubject] = useState(() => {
    return storageService.getLastActiveSubject();
  });

  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [appState, setAppState] = useState(() => {
    const path = window.location.pathname;
    if (path === '/privacy' || path === '/privacy/') return 'privacy';
    if (path === '/terms' || path === '/terms/') return 'terms';
    if (path === '/settings' || path === '/settings/') return 'settings';
    if (path === '/leaderboard' || path === '/leaderboard/') return 'leaderboard';
    if (path === '/quests' || path === '/quests/') return 'quests';
    return 'adaptive_session';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/privacy' || path === '/privacy/') {
        setAppState('privacy');
      } else if (path === '/terms' || path === '/terms/') {
        setAppState('terms');
      } else if (path === '/settings' || path === '/settings/') {
        setAppState('settings');
      } else if (path === '/leaderboard' || path === '/leaderboard/') {
        setAppState('leaderboard');
      } else if (path === '/quests' || path === '/quests/') {
        setAppState('quests');
      } else {
        setAppState('adaptive_session');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateTo = (path, stateName) => {
    window.history.pushState({}, '', path);
    setAppState(stateName);
    window.scrollTo(0, 0);

    // Log screen view to Analytics
    let screenName = 'Home';
    if (stateName === 'settings') screenName = 'Settings';
    else if (stateName === 'privacy') screenName = 'PrivacyPolicy';
    else if (stateName === 'terms') screenName = 'TermsOfService';
    else if (stateName === 'leaderboard') screenName = 'Leaderboard';
    else if (stateName === 'quests') screenName = 'Quests';

    analyticsService.logScreenView(screenName);
  };

  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [workshopOriginState, setWorkshopOriginState] = useState('adaptive_session');

  const handleOpenWorkshop = (overrideOrigin = null) => {
    soundFx.playKeyTap();
    setWorkshopOriginState(overrideOrigin || appState);
    setIsWorkshopOpen(true);
  };

  const handleCloseWorkshop = () => {
    setIsWorkshopOpen(false);
    if (workshopOriginState) {
      setAppState(workshopOriginState);
    }
  };

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSpeedInfoModal, setShowSpeedInfoModal] = useState(false);
  const [showPinGateModal, setShowPinGateModal] = useState(false);
  const [pinGateSource, setPinGateSource] = useState(null);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [parentDashboardTab, setParentDashboardTab] = useState('overview');
  const [parentDashboardHighlight, setParentDashboardHighlight] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingReward, setPendingReward] = useState(null);
  const profileDropdownRef = useRef(null);
  const statsDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
        setShowStatsDropdown(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setShowSubjectDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [pendingSparksPurchase, setPendingSparksPurchase] = useState(null);
  const [showMockCheckoutModal, setShowMockCheckoutModal] = useState(false);
  const [showStripeCheckoutModal, setShowStripeCheckoutModal] = useState(false);
  const [showFamilyUpgradeModal, setShowFamilyUpgradeModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showDailyStreakIncreasedModal, setShowDailyStreakIncreasedModal] = useState(false);
  const [perfectMonthData, setPerfectMonthData] = useState(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(() => storageService.getFriends(activeProfileId).length);
  const [pendingFriendRequestsCount, setPendingFriendRequestsCount] = useState(() =>
    storageService.getFriendRequests(activeProfileId).filter(r => r.type === 'received').length
  );
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [linkModalMilestone, setLinkModalMilestone] = useState('Milestone');

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    return storageService.getUserData(activeSubject).unlockedBadges || [];
  });
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState([]);

  useEffect(() => {
    const activeUserData = storageService.getUserData(activeSubject);
    const evalRes = evaluateBadges({ ...activeUserData, subjectId: activeSubject });
    if (evalRes?.updatedUnlocked) {
      setUnlockedBadges(evalRes.updatedUnlocked);
    }
  }, [activeSubject]);

  // First-Time User Onboarding Modal State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsItems, setNewsItems] = useState([]);

  const [showFirstLaunchOnboardingModal, setShowFirstLaunchOnboardingModal] = useState(() => {
    return !localStorage.getItem('kibo_math_has_onboarded') && !localStorage.getItem('kibo_math_tier');
  });

  // Profile Selector — shown on every launch so players can pick who's climbing
  // and parents always have a discoverable path to add a new profile.
  const [showProfileSelector, setShowProfileSelector] = useState(() => {
    // Skip only during the very first-ever launch (onboarding takes precedence)
    const hasOnboarded = !!localStorage.getItem('kibo_math_has_onboarded') || !!localStorage.getItem('kibo_math_tier');
    return hasOnboarded;
  });

  // Manual Profile Switcher State
  const [showManualProfileSwitcher, setShowManualProfileSwitcher] = useState(false);
  const [profileSwitcherOrigin, setProfileSwitcherOrigin] = useState(null);

  // Consecutive problem miss tracking for Micro-Hints
  const [consecutiveProblemMisses, setConsecutiveProblemMisses] = useState(0);

  // Test-Out State
  const [isTestOut, setIsTestOut] = useState(false);
  const [testOutTargetTier, setTestOutTargetTier] = useState(null);
  const [hasVisitedParentZone, setHasVisitedParentZone] = useState(() => {
    return storageService.getUserData(activeSubject).hasVisitedParentZone || false;
  });
  const [showTestOutPassModal, setShowTestOutPassModal] = useState(false);
  const [showTestOutFailModal, setShowTestOutFailModal] = useState(false);



  const [levelUpReason, setLevelUpReason] = useState('');
  const [isBossMode, setIsBossMode] = useState(false);
  const [isPlacementTest, setIsPlacementTest] = useState(false);
  const [placementResultInfo, setPlacementResultInfo] = useState(null);
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);

  // Aggregate sprint history across subjects and calculate streak with dateUtils
  const getCombinedSprintHistory = (sprintHistory = []) => {
    const activeProf = storageService.getActiveProfile();
    const allSubjects = activeProf?.userData?.subjects || {};
    const combinedHistory = [
      ...(Array.isArray(sprintHistory) ? sprintHistory : []),
      ...(Array.isArray(activeProf?.userData?.sprintHistory) ? activeProf.userData.sprintHistory : [])
    ];
    Object.values(allSubjects).forEach(sub => {
      if (Array.isArray(sub?.sprintHistory)) {
        combinedHistory.push(...sub.sprintHistory);
      }
    });
    return combinedHistory;
  };

  const getActiveStreakFromHistory = (sprintHistory = [], practiceDays = [1, 2, 3, 4, 5]) => {
    const combined = getCombinedSprintHistory(sprintHistory);
    return calculateStreakFromHistory(combined, practiceDays);
  };

  // Persistent Kibo Shields (Streak Freezes: max capacity 2, default 1)
  const [streakShields, setStreakShields] = useState(() => {
    return storageService.getUserData(activeSubject).streakShields ?? 1;
  });

  // Persistent Custom 7-Day Practice Schedule (per child profile)
  const [practiceDays, setPracticeDays] = useState(() => {
    return storageService.getProfilePracticeDays();
  });

  // Check for pending referral rewards on load
  useEffect(() => {
    const checkForRewards = async () => {
      const currentUser = authService.getAuthState();
      if (!currentUser || currentUser.isAnonymous || !currentUser.uid) return;

      try {
        const rewardsRef = collection(db, 'users', currentUser.uid, 'pendingRewards');
        const q = query(rewardsRef, where('status', '==', 'pending'));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const firstReward = snap.docs[0];
          setPendingReward({ id: firstReward.id, ...firstReward.data() });
        }
      } catch (e) {
        console.warn("Could not fetch rewards:", e);
      }
    };
    checkForRewards();
  }, [activeProfileId]);

  // Persistent Daily Streak
  const [streak, setStreak] = useState(() => {
    return storageService.getUserData(activeSubject).streak;
  });

  // Persistent Sparks Currency (⚡)
  const [sparks, setSparks] = useState(() => {
    return storageService.getUserData(activeSubject).sparks;
  });

  const [isKiboClub, setIsKiboClub] = useState(() => {
    return storageService.getUserData(activeSubject).isKiboClub || false;
  });

  // Persistent Active Skill Tier (1 through 8)
  const [tier, setTier] = useState(() => {
    return storageService.getUserData(activeSubject).tier;
  });

  // Persistent Unlocked Curriculum Tiers
  const [unlockedTiers, setUnlockedTiers] = useState(() => {
    return storageService.getUserData(activeSubject).unlockedTiers;
  });

  // Persistent Tier Mastery Percent (0, 25, 50, 75, 100)
  const [tierMasteryPercent, setTierMasteryPercent] = useState(() => {
    return storageService.getUserData(activeSubject).tierMasteryPercent || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  });

  const [liveCompetenceRating, setLiveCompetenceRating] = useState(() => {
    const uData = storageService.getUserData(activeSubject);
    return uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
  });

  // Persistent Tier Best Completion Times in Seconds
  const [tierBestTimes, setTierBestTimes] = useState(() => {
    return storageService.getUserData(activeSubject).tierBestTimes || {};
  });

  const [isNewSpeedRecord, setIsNewSpeedRecord] = useState(false);

  // Persistent Parent PIN (Optional secondary fallback; default 1234 deprecated)
  const [parentPin, setParentPin] = useState(() => {
    return storageService.getParentSettings().pin;
  });

  // Persistent Sprint History (last 3 sprints)
  const [sprintHistory, setSprintHistory] = useState(() => {
    return storageService.getUserData(activeSubject).sprintHistory;
  });

  // Persistent Re-queued Practice Problems
  const [practiceQueue, setPracticeQueue] = useState(() => {
    return storageService.getUserData(activeSubject).practiceQueue;
  });

  // Persistent Inventory & Equipped Accessories
  const [unlockedItems, setUnlockedItems] = useState(() => {
    return storageService.getShopState().unlockedItems;
  });

  const [equippedItems, setEquippedItems] = useState(() => {
    return storageService.getShopState().equippedItems;
  });

  // Persistent Lifetime Problems Solved Tracker
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(() => {
    return storageService.getUserData(activeSubject).totalProblemsSolved || 0;
  });

  const [cumulativeCorrectStreak, setCumulativeCorrectStreak] = useState(() => {
    return storageService.getUserData(activeSubject).cumulativeCorrectStreak || 0;
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    return storageService.getUserData(activeSubject).personalRecords || {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    };
  });

  const recordDailyPractice = () => {

    const todayStr = getTodayStr();
    const uData = storageService.getUserData(activeSubject);
    const lastDateStr = uData.lastSprintDate;
    const lastTimestamp = uData.lastSprintTimestamp;
    let currentStreak = uData.streak ?? streak ?? 0;

    const historyStreak = getActiveStreakFromHistory(uData.sprintHistory || [], storageService.getProfilePracticeDays());
    if (historyStreak > currentStreak) {
      currentStreak = historyStreak;
    }

    if (lastDateStr === todayStr) {
      if (currentStreak !== streak) {
        setStreak(currentStreak);
        storageService.saveUserData({
          streak: currentStreak,
          lastSprintDate: todayStr,
          lastSprintTimestamp: new Date().toISOString(),
          lastSprintTimezone: getCurrentTimezone()
        }, activeSubject);
      }
      return;
    }

    let nextStreak = currentStreak;
    const yesterdayStr = getYesterdayStr();
    const isTravelGrace = isWithinTravelGracePeriod(lastTimestamp, new Date(), 36);

    if (!lastDateStr) {
      nextStreak = Math.max(1, historyStreak);
    } else if (lastDateStr === yesterdayStr || isTravelGrace) {
      nextStreak = currentStreak + 1;
    } else {
      const savedDays = storageService.getProfilePracticeDays() || [1, 2, 3, 4, 5];
      const [y, m, d] = lastDateStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);
      curr.setDate(curr.getDate() + 1);

      let missedActiveDays = 0;
      while (true) {
        const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        if (dateStr >= todayStr) break;

        const dayIdx = curr.getDay();
        if (savedDays.includes(dayIdx)) {
          missedActiveDays++;
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (missedActiveDays === 0) {
        nextStreak = currentStreak + 1;
      } else {
        nextStreak = 1;
      }
    }

    if (nextStreak > currentStreak && lastDateStr !== todayStr) {
      setShowDailyStreakIncreasedModal(true);
    }

    // Also display PerfectMonthProgressModal if it is the first climb of the day
    if (lastDateStr !== todayStr) {
      const combinedHistory = getCombinedSprintHistory(uData.sprintHistory || []);

      const monthlyActiveDays = new Set();
      // Calculate how many distinct days they've played this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      combinedHistory.forEach(item => {
        if (!item) return;
        let d = null;
        if (item.date) {
           d = new Date(item.date + 'T00:00:00'); // simple parse
        } else if (item.timestamp) {
           d = new Date(item.timestamp);
        }
        if (d && !isNaN(d.getTime())) {
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyActiveDays.add(d.getDate());
          }
        }
      });
      // Add today since they just played it
      monthlyActiveDays.add(new Date().getDate());

      setPerfectMonthData({ daysPlayedThisMonth: monthlyActiveDays.size });
    }

    setStreak(nextStreak);
    storageService.saveUserData({
      streak: nextStreak,
      lastSprintDate: todayStr,
      lastSprintTimestamp: new Date().toISOString(),
      lastSprintTimezone: getCurrentTimezone()
    }, activeSubject);
  };

  const handleIncrementLifetimeProblems = (isCorrect = true) => {
    const nextTotal = (totalProblemsSolved || 0) + 1;
    setTotalProblemsSolved(nextTotal);

    let nextStreak = isCorrect ? cumulativeCorrectStreak + 1 : 0;
    setCumulativeCorrectStreak(nextStreak);

    const nextRecords = {
      ...personalRecords,
      highestCorrectStreak: Math.max(personalRecords?.highestCorrectStreak || 0, nextStreak)
    };
    setPersonalRecords(nextRecords);

    const uData = storageService.getUserData(activeSubject);
    const currentRating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
    
    let extraSparks = 0;
    analyticsService.logQuestionAnswered(activeSubject, isCorrect, currentRating, 'unknown');
    analyticsService.logQuestionAnswered(activeSubject, isCorrect, currentRating, 'unknown');

    analyticsService.logQuestionAnswered(activeSubject, isCorrect, uData.competenceRank || 1000, 'unknown');


    analyticsService.logQuestionAnswered(activeSubject, isCorrect, uData.competenceRank || 1000, 'unknown');

    let newBaseline = uData.baselineRating;
    let newlyCalibrated = uData.isCalibrated || false;

    if (nextTotal >= 15 && !uData.isCalibrated) {
      newBaseline = currentRating;
      newlyCalibrated = true;
      extraSparks = 30;
      setSparks((prev) => prev + extraSparks);
      soundFx.playVictory();
    }

    questService.recordProgress(activeProfileId, {
      subject: activeSubject,
      isCorrect,
      streak: nextStreak
    });

    storageService.saveUserData({
      totalProblemsSolved: nextTotal,
      cumulativeCorrectStreak: nextStreak,
      personalRecords: nextRecords,
      ...(extraSparks > 0 ? { sparks: (sparks || 0) + extraSparks } : {}),
      ...(newlyCalibrated ? { baselineRating: newBaseline, isCalibrated: true } : {})
    }, activeSubject);
  };

  // Persistent Consumable Power-Ups Inventory
  const [consumables, setConsumables] = useState(() => {
    const saved = storageService.getUserData(activeSubject).consumables;
    return {
      shieldCount: saved?.shieldCount ?? 1,
      streakSaverCount: saved?.streakSaverCount ?? 0,
      doubleSparksPotionCount: saved?.doubleSparksPotionCount ?? saved?.doubleCoinPotionCount ?? 0,
      hintScrollCount: saved?.hintScrollCount ?? 2,
      letterSpyglassCount: saved?.letterSpyglassCount ?? 2,
      letterPrunerCount: saved?.letterPrunerCount ?? 2,
      explorerCompassCount: saved?.explorerCompassCount ?? 2
    };
  });

  const [durationInSeconds, setDurationInSeconds] = useState(0);

  const [preferences, setPreferences] = useState(() => {
    const defaultPrefs = { hideSprintTimer: false, isMuted: false, isMusicMuted: false, isHapticsEnabled: true };
    return { ...defaultPrefs, ...(storageService.getUserData(activeSubject).preferences || {}) };
  });

  // Apply preferences to audio engine and initialize multi-profile reminders on load
  useEffect(() => {
    soundFx.setMuted(preferences.isMuted);
    if (soundFx.setMusicMuted) {
      soundFx.setMusicMuted(preferences.isMusicMuted);
    }
    setHapticsEnabled(preferences.isHapticsEnabled);
    scheduleAllProfileReminders();
  }, []);

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    storageService.saveUserData({ preferences: newPrefs });

    if (newPrefs.isMuted !== undefined) {
      soundFx.setMuted(newPrefs.isMuted);
    }
    if (newPrefs.isMusicMuted !== undefined && soundFx.setMusicMuted) {
      soundFx.setMusicMuted(newPrefs.isMusicMuted);
    }
    if (newPrefs.isHapticsEnabled !== undefined) {
      setHapticsEnabled(newPrefs.isHapticsEnabled);
    }
  };

  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  useEffect(() => {
    setNotifPrefs(getNotificationPrefs());
  }, [showParentDashboard]);



  const [isShieldProtected, setIsShieldProtected] = useState(false);
  const [isDoubleSparksActive, setIsDoubleSparksActive] = useState(false);

  const devState = useDevState(() => {
    const uData = storageService.getUserData(activeSubject);
    const sData = storageService.getShopState();
    setSparks(uData.sparks || 0);
    setUnlockedItems(sData.unlockedItems || ['cap']);
  });

  const syncAppStateWithStorage = (subjectOverride) => {
    const sub = subjectOverride || activeSubject;
    const uData = storageService.getUserData(sub);
    const sData = storageService.getShopState();
    const cRating = Number(uData.adaptiveCompetenceRating) || Number(uData.competenceRank) || 1000;

    setActiveProfileId(storageService.getActiveProfileId());
    setLiveCompetenceRating(cRating);
    setTier(uData.tier || 1);
    setUnlockedTiers(uData.unlockedTiers || [1]);
    setTierMasteryPercent(uData.tierMasteryPercent || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 });
    setTierBestTimes(uData.tierBestTimes || {});
    setStreak(uData.streak ?? 1);
    setSparks(uData.sparks ?? 0);
    setIsKiboClub(uData.isKiboClub ?? false);
    setTotalProblemsSolved(uData.totalProblemsSolved ?? 0);
    setCumulativeCorrectStreak(uData.cumulativeCorrectStreak ?? 0);
    setPersonalRecords(uData.personalRecords || {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    });
    setSprintHistory(uData.sprintHistory || []);
    setPracticeQueue(uData.practiceQueue || []);
    const badgeEval = evaluateBadges({ ...uData, subjectId: sub });
    setUnlockedBadges(badgeEval?.updatedUnlocked || uData.unlockedBadges || []);
    setPracticeDays(storageService.getProfilePracticeDays());
    setEquippedItems(sData.equippedItems ?? []);
    setUnlockedItems(sData.unlockedItems ?? ['cap']);
    setHasVisitedParentZone(uData.hasVisitedParentZone || false);

    const currentPid = storageService.getActiveProfileId();
    setFriendsCount(storageService.getFriends(currentPid).length);
    setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);

    // Sync Audio & Haptics preferences
    const prefs = {
      hideSprintTimer: false,
      isMuted: false,
      isMusicMuted: false,
      isHapticsEnabled: true,
      ...(uData.preferences || {})
    };
    soundFx.setMuted(prefs.isMuted);
    if (soundFx.setMusicMuted) {
      soundFx.setMusicMuted(prefs.isMusicMuted);
    }
    setHapticsEnabled(prefs.isHapticsEnabled);
    setPreferences(prefs);
    setIsDoubleSparksActive(false);
  };

  const handleSubjectChange = (newSubject) => {
    soundFx.playKeyTap();
    storageService.setLastActiveSubject(newSubject);
    setActiveSubject(newSubject);
    setAppState('adaptive_session');
    syncAppStateWithStorage(newSubject);
  };

  useEffect(() => {
    syncAppStateWithStorage(activeSubject);

    // Check for incoming cloud friend requests in background
    const currentPid = activeProfileId || storageService.getActiveProfileId();
    leaderboardService.fetchCloudFriendRequests(currentPid).then(({ received }) => {
      if (Array.isArray(received) && received.length > 0) {
        let changed = false;
        received.forEach(req => {
          const targetPid = req.receiverProfileId || currentPid;
          storageService.receiveFriendRequest({
            id: req.id,
            senderId: `${req.senderUid}_${req.senderProfileId || 'default_child'}`,
            senderUid: req.senderUid,
            senderProfileId: req.senderProfileId || 'default_child',
            senderUsername: req.senderUsername,
            name: req.senderUsername,
            score: req.senderScore,
            equipped: req.senderEquipped,
            subjectsMastered: req.senderSubjectsMastered,
            createdAt: req.createdAt
          }, targetPid);
          changed = true;
        });
        if (changed) {
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
        }
      }
    }).catch(() => {});
  }, [activeSubject, activeProfileId]);

  // Initialize Auth (including OAuth redirect resolution) & Offline Background Sync Queue on Launch
  useEffect(() => {
    const initAppAuth = async () => {
      const authRes = await authService.initAnonymousGuest();
      syncAppStateWithStorage();
      syncService.initBackgroundSync();

      // If returning from OAuth redirect flow, preserve and restore original route
      if (authRes && authRes.returnUrl && authRes.returnUrl !== window.location.pathname) {
        let targetState = 'adaptive_session';
        if (authRes.returnUrl.includes('/settings')) targetState = 'settings';
        else if (authRes.returnUrl.includes('/privacy')) targetState = 'privacy';
        else if (authRes.returnUrl.includes('/terms')) targetState = 'terms';
        else if (authRes.returnUrl.includes('/leaderboard')) targetState = 'leaderboard';

        window.history.replaceState({}, '', authRes.returnUrl);
        setAppState(targetState);
      }
    };
    initAppAuth();
  }, []);

  const handleBuyConsumable = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item || sparks < item.cost) return;

    const newSparks = sparks - item.cost;
    let nextShieldCount = consumables.shieldCount || 0;
    let nextStreakSaverCount = consumables.streakSaverCount || 0;
    let nextPotionCount = consumables.doubleSparksPotionCount || consumables.doubleCoinPotionCount || 0;
    let nextHintScrollCount = consumables.hintScrollCount || 0;
    let nextLetterSpyglassCount = consumables.letterSpyglassCount || 0;
    let nextLetterPrunerCount = consumables.letterPrunerCount || 0;
    let nextExplorerCompassCount = consumables.explorerCompassCount || 0;

    if (item.id === 'kibo_shield') {
      nextShieldCount += 1;
    } else if (item.id === 'streak_saver') {
      nextStreakSaverCount += 1;
    } else if (item.id === 'double_sparks_potion' || item.id === 'double_coin_potion') {
      nextPotionCount += 1;
    } else if (item.id === 'hint_scroll') {
      nextHintScrollCount += 1;
    } else if (item.id === 'letter_spyglass') {
      nextLetterSpyglassCount += 1;
    } else if (item.id === 'explorer_compass') {
      nextExplorerCompassCount += 1;
    } else if (item.id === 'letter_pruner') {
      nextLetterPrunerCount += 1;
    }

    const nextConsumables = {
      shieldCount: nextShieldCount,
      streakSaverCount: nextStreakSaverCount,
      doubleSparksPotionCount: nextPotionCount,
      doubleCoinPotionCount: nextPotionCount,
      hintScrollCount: nextHintScrollCount,
      letterSpyglassCount: nextLetterSpyglassCount,
      letterPrunerCount: nextLetterPrunerCount,
      explorerCompassCount: nextExplorerCompassCount
    };

    setSparks(newSparks);
    setConsumables(nextConsumables);

    const activeData = storageService.getUserData(activeSubject);
    const newPurchasesCount = (activeData.shopPurchasesCount || 0) + 1;
    const currentRarities = Array.isArray(activeData.purchasedRarities) ? activeData.purchasedRarities : [];
    const itemRarity = item.rarity || 'common';
    const newRarities = Array.from(new Set([...currentRarities, itemRarity]));

    storageService.saveUserData({
      sparks: newSparks,
      consumables: nextConsumables,
      shopPurchasesCount: newPurchasesCount,
      purchasedRarities: newRarities
    });

    const refreshedUserData = storageService.getUserData(activeSubject);
    checkAndPromptLinkAccount(
      { purchasesCount: newPurchasesCount },
      setLinkModalMilestone,
      setShowAccountLinkModal
    );

    const userStateForBadges = {
      streak,
      sparks: newSparks,
      purchasedItemsCount: newPurchasesCount,
      purchasedRarities: newRarities,
      hasBoughtGemsWithRealMoney: refreshedUserData.hasBoughtGemsWithRealMoney || false,
      perfectClimbsCount: refreshedUserData.perfectClimbsCount || 0,
      consecutivePerfectClimbsCount: refreshedUserData.consecutivePerfectClimbsCount || 0,
      cumulativeCorrectStreak: refreshedUserData.cumulativeCorrectStreak || 0,
      unlockedBadges
    };
    const badgeEvalRes = evaluateBadges(userStateForBadges);
    if ((badgeEvalRes.newlyUnlocked || []).length > 0) {
      setUnlockedBadges(badgeEvalRes.updatedUnlocked);
      setNewlyUnlockedBadges(badgeEvalRes.newlyUnlocked);
    }

    soundFx.playVictory();
  };

  const handleConsumeHintScroll = () => {
    const owned = consumables.hintScrollCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playKeyTap();
    const nextConsumables = {
      ...consumables,
      hintScrollCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeLetterSpyglass = () => {
    const owned = consumables.letterSpyglassCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playSparkCollect();
    const nextConsumables = {
      ...consumables,
      letterSpyglassCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeExplorerCompass = () => {
    const owned = consumables.explorerCompassCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playSparkCollect();
    const nextConsumables = {
      ...consumables,
      explorerCompassCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeLetterPruner = () => {
    const owned = consumables.letterPrunerCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playKeyTap();
    const nextConsumables = {
      ...consumables,
      letterPrunerCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeShield = () => {
    const owned = consumables.shieldCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playVictory();
    const nextConsumables = {
      ...consumables,
      shieldCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleToggleDoubleSparksPotion = () => {
    if (isDoubleSparksActive) {
      setIsDoubleSparksActive(false);
    } else {
      const owned = consumables.doubleSparksPotionCount ?? consumables.doubleCoinPotionCount ?? 0;
      if (owned <= 0) return;
      soundFx.playSparkCollect();
      const nextPotionCount = owned - 1;
      const nextConsumables = {
        ...consumables,
        doubleSparksPotionCount: nextPotionCount,
        doubleCoinPotionCount: nextPotionCount
      };
      setConsumables(nextConsumables);
      storageService.saveUserData({ consumables: nextConsumables });
      setIsDoubleSparksActive(true);
      analyticsService.logSpendVirtualCurrency('double_sparks_potion', 0);
      analyticsService.logSpendVirtualCurrency('double_sparks_potion', 0);
    }
  };

  // Schedule-Aware & Timezone-Resilient Streak Validation per Profile
  const validateStreakForActiveProfile = (subjectOverride) => {
    const sub = subjectOverride || activeSubject;
    const uData = storageService.getUserData(sub);
    const lastDateStr = uData.lastSprintDate;
    const lastTimestamp = uData.lastSprintTimestamp;
    const savedDays = storageService.getProfilePracticeDays() || [1, 2, 3, 4, 5];
    const historyStreak = getActiveStreakFromHistory(uData.sprintHistory || [], savedDays);
    const storedStreak = uData.streak ?? 0;
    const savedStreak = Math.max(storedStreak, historyStreak);
    const savedShields = uData.streakShields ?? 1;

    if (savedStreak > storedStreak) {
      setStreak(savedStreak);
      storageService.saveUserData({ streak: savedStreak }, sub);
    }

    if (!lastDateStr || savedStreak === 0) return;

    const todayStr = getTodayStr();
    // Intact if already played today or yesterday
    if (lastDateStr === todayStr || lastDateStr === getYesterdayStr()) return;

    // Check if within travel / elapsed time grace period (e.g. traveling eastward across time zones)
    if (isWithinTravelGracePeriod(lastTimestamp, new Date(), 36)) {
      return;
    }

    const [y, m, d] = lastDateStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    let missedActiveDays = 0;

    if (!isNaN(curr.getTime())) {
      curr.setDate(curr.getDate() + 1);
      let safetyLimit = 3650;
      while (safetyLimit-- > 0) {
        const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        if (dateStr >= todayStr) break;

        const dayIdx = curr.getDay();
        if (savedDays.includes(dayIdx)) {
          missedActiveDays++;
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    if (missedActiveDays >= 1) {
      const activeConsumables = storageService.getConsumables();
      const currentStreakSaverCount = activeConsumables.streakSaverCount || 0;
      if (currentStreakSaverCount > 0 || savedShields > 0) {
        if (currentStreakSaverCount > 0) {
          const nextStreakSavers = Math.max(0, currentStreakSaverCount - 1);
          const nextConsumables = { ...activeConsumables, streakSaverCount: nextStreakSavers };
          setConsumables(nextConsumables);
          storageService.saveUserData({ consumables: nextConsumables });
        } else {
          const newShields = Math.max(0, savedShields - 1);
          setStreakShields(newShields);
          storageService.saveUserData({ streakShields: newShields });
          localStorage.setItem('kibo_math_shields', newShields.toString());
        }
        setShowStreakSavedModal(true);
      } else {
        setStreak(0);
        localStorage.setItem('kibo_math_streak', '0');
        storageService.saveUserData({ streak: 0 }, sub);
      }
    }
  };

  useEffect(() => {
    // Only run on startup if profile selector is NOT shown (e.g. single profile / direct mode)
    if (!showProfileSelector) {
      validateStreakForActiveProfile(activeSubject);
    }
  }, []);

  // First-Time Launch Handlers
  const handleStartAtTier1FromOnboarding = () => {
    setTier(1);
    setUnlockedTiers([1]);
    localStorage.setItem('kibo_math_has_onboarded', 'true');
    localStorage.setItem('kibo_math_tier', '1');
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify([1]));
    syncAppStateWithStorage();
    setShowFirstLaunchOnboardingModal(false);
  };

  const handleStartPlacementFromOnboarding = () => {
    localStorage.setItem('kibo_math_has_onboarded', 'true');
    syncAppStateWithStorage();
    setShowFirstLaunchOnboardingModal(false);
    startPlacementDiagnostic();
  };

  const handleCompletePlacementTest = (placedTier) => {
    const newUnlocked = [];
    for (let i = 1; i <= Math.max(1, placedTier); i++) newUnlocked.push(i);

    const updatedSparks = sparks + 50;

    setTier(placedTier);
    setUnlockedTiers(newUnlocked);
    setSparks(updatedSparks);

    localStorage.setItem('kibo_math_has_onboarded', 'true');
    localStorage.setItem('kibo_math_tier', placedTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(newUnlocked));
    localStorage.setItem('kibo_math_sparks', updatedSparks.toString());

    setShowPlacementRevealModal(true);
  };

  const handleOpenQuitModal = () => {
    pauseStartTimeRef.current = performance.now();
    setShowQuitModal(true);
  };

  const handleKeepPlaying = () => {
    const pausedDuration = performance.now() - pauseStartTimeRef.current;
    problemStartTimeRef.current += pausedDuration;
    setShowQuitModal(false);
  };

  const handleQuitToHome = () => {
    setShowQuitModal(false);
    setCurrentIndex(0);
    setProblems([]);
    setResults([]);
    setInputVal('');
    setIsBossMode(false);
    setIsPlacementTest(false);
    setIsTestOut(false);
    setConsecutiveProblemMisses(0);
    setAppState('adaptive_session');
  };

  const handleQuitToMap = () => {
    setShowQuitModal(false);
    setCurrentIndex(0);
    setProblems([]);
    setResults([]);
    setInputVal('');
    setIsBossMode(false);
    setIsPlacementTest(false);
    setIsTestOut(false);
    setConsecutiveProblemMisses(0);
    setAppState('adaptive_session');
  };

  const handleLevelUp = () => {
    if (tier < 8) {
      const nextTier = tier + 1;
      const updatedUnlocked = Array.from(new Set([...unlockedTiers, nextTier]));
      setTier(nextTier);
      setUnlockedTiers(updatedUnlocked);
      localStorage.setItem('kibo_math_tier', nextTier.toString());
      localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
      setSprintHistory([]);
      localStorage.setItem('kibo_math_sprint_history', JSON.stringify([]));
      setShowLevelUpModal(false);
      soundFx.playVictory();
    }
  };

  const handleSelectTierFromMap = (selectedTier) => {
    const updatedUnlocked = Array.from(new Set([...unlockedTiers, selectedTier]));
    setTier(selectedTier);
    setUnlockedTiers(updatedUnlocked);
    localStorage.setItem('kibo_math_tier', selectedTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
    startNewSprint(false, selectedTier);
  };


  const handleBuyItem = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item) {
      console.warn('Purchase rejected: Invalid item passed', itemInput);
      return;
    }
    const res = shopLedgerService.purchaseItem(item.id, item.cost);
    if (!res.success) {
      console.warn('Purchase rejected by authoritative ledger:', res.reason);
      return;
    }

    setSparks(res.newSparks);
    setUnlockedItems(res.unlockedItems);

    const currentSlotCat = item.category;
    const filteredSameSlot = equippedItems.filter((id) => {
      const equippedItem = getItemById(id);
      return equippedItem ? equippedItem.category !== currentSlotCat : true;
    });

    const updatedEquipped = [...filteredSameSlot, item.id];
    setEquippedItems(updatedEquipped);

    storageService.saveShopState(updatedEquipped, res.unlockedItems);

    const activeData = storageService.getUserData(activeSubject);
    const newPurchasesCount = (activeData.shopPurchasesCount || 0) + 1;
    const currentRarities = Array.isArray(activeData.purchasedRarities) ? activeData.purchasedRarities : [];
    const itemRarity = item.rarity || 'common';
    const newRarities = Array.from(new Set([...currentRarities, itemRarity]));

    storageService.saveUserData({
      sparks: res.newSparks,
      shopPurchasesCount: newPurchasesCount,
      purchasedRarities: newRarities
    });

    // Per-profile check for Save Progress Across All Devices modal (2 items purchased)
    const refreshedUserData = storageService.getUserData(activeSubject);

    checkAndPromptLinkAccount(
      { purchasesCount: newPurchasesCount },
      setLinkModalMilestone,
      setShowAccountLinkModal
    );

    // Evaluate shop badges
    const userStateForBadges = {
      streak,
      sparks: res.newSparks,
      purchasedItemsCount: newPurchasesCount,
      purchasedRarities: newRarities,
      hasBoughtGemsWithRealMoney: refreshedUserData.hasBoughtGemsWithRealMoney || false,
      perfectClimbsCount: refreshedUserData.perfectClimbsCount || 0,
      consecutivePerfectClimbsCount: refreshedUserData.consecutivePerfectClimbsCount || 0,
      cumulativeCorrectStreak: refreshedUserData.cumulativeCorrectStreak || 0,
      unlockedBadges
    };
    const badgeEvalRes = evaluateBadges(userStateForBadges);
    if ((badgeEvalRes.newlyUnlocked || []).length > 0) {
      setUnlockedBadges(badgeEvalRes.updatedUnlocked);
      setNewlyUnlockedBadges(badgeEvalRes.newlyUnlocked);
    }

    soundFx.playVictory();
  };

  const handleSellItem = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item) return;

    if (item.isConsumable) {
      // Handle consumable sell
      const sellPrice = Math.floor(item.cost * 0.5);
      const newSparks = sparks + sellPrice;

      let nextConsumables = { ...consumables };
      if (item.id === 'kibo_shield' && nextConsumables.shieldCount > 0) {
        nextConsumables.shieldCount -= 1;
      } else if (item.id === 'streak_saver' && nextConsumables.streakSaverCount > 0) {
        nextConsumables.streakSaverCount -= 1;
      } else if (item.id === 'double_sparks_potion' && nextConsumables.doubleSparksPotionCount > 0) {
        nextConsumables.doubleSparksPotionCount -= 1;
      } else if (item.id === 'double_coin_potion' && nextConsumables.doubleCoinPotionCount > 0) {
        nextConsumables.doubleCoinPotionCount -= 1;
      } else if (item.id === 'hint_scroll' && nextConsumables.hintScrollCount > 0) {
        nextConsumables.hintScrollCount -= 1;
      } else if (item.id === 'letter_spyglass' && nextConsumables.letterSpyglassCount > 0) {
        nextConsumables.letterSpyglassCount -= 1;
      } else if (item.id === 'letter_pruner' && nextConsumables.letterPrunerCount > 0) {
        nextConsumables.letterPrunerCount -= 1;
      } else if (item.id === 'explorer_compass' && nextConsumables.explorerCompassCount > 0) {
        nextConsumables.explorerCompassCount -= 1;
      } else {
        return; // Nothing to sell
      }

      setConsumables(nextConsumables);
      setSparks(newSparks);

      storageService.saveUserData({
        sparks: newSparks,
        streakShields: nextConsumables.shieldCount,
        streakSaverCount: nextConsumables.streakSaverCount,
        hintScrollCount: nextConsumables.hintScrollCount,
        doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
        doubleCoinPotionCount: nextConsumables.doubleCoinPotionCount,
        letterSpyglassCount: nextConsumables.letterSpyglassCount,
        letterPrunerCount: nextConsumables.letterPrunerCount,
        explorerCompassCount: nextConsumables.explorerCompassCount
      });

      soundFx.playKeyTap();

    } else {
      // Handle non-consumable sell using shopLedgerService
      const res = shopLedgerService.sellItem(item.id, item.cost);
      if (!res.success) {
        console.warn('Sell rejected by ledger:', res.reason);
        return;
      }

      setSparks(res.newSparks);
      setUnlockedItems(res.unlockedItems);
      setEquippedItems(res.equippedItems);

      soundFx.playKeyTap();
    }
  };

  const handleToggleEquip = (itemId) => {
    const targetItem = getItemById(itemId);
    let updatedEquipped;

    if (equippedItems.includes(itemId)) {
      updatedEquipped = equippedItems.filter((id) => id !== itemId);
    } else {
      const currentSlot = getItemSlot(targetItem);
      const filteredSameSlot = equippedItems.filter((id) => {
        const item = getItemById(id);
        return item ? getItemSlot(item) !== currentSlot : true;
      });
      updatedEquipped = [...filteredSameSlot, itemId];
    }

    setEquippedItems(updatedEquipped);
    storageService.saveShopState(updatedEquipped, unlockedItems);
  };

  const handleRedeemPromoCode = (res) => {
    if (!res || !res.updated) return;
    if (typeof res.updated.sparks === 'number') {
      setSparks(res.updated.sparks);
    }
    if (Array.isArray(res.updated.unlockedItems)) {
      setUnlockedItems(res.updated.unlockedItems);
    }
    if (res.updated.consumables) {
      setConsumables(res.updated.consumables);
    }
  };

  const handleUpdatePin = (newPin) => {
    setParentPin(newPin);
    storageService.saveParentSettings(newPin);
  };

  const handleUpdatePracticeDays = (newDays) => {
    setPracticeDays(newDays);
    storageService.saveProfilePracticeDays(newDays);
  };

  const handleSetTierManual = (newTier) => {
    const updatedUnlocked = [];
    for (let i = 1; i <= Math.max(1, newTier); i++) updatedUnlocked.push(i);
    setTier(newTier);
    setUnlockedTiers(updatedUnlocked);
    localStorage.setItem('kibo_math_tier', newTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
  };

  const getTierMeta = (t) => {
    return CURRICULUM_TIERS.find((item) => item.tier === t) || CURRICULUM_TIERS[0];
  };

  const currentTierMeta = getTierMeta(tier);
  const activeProfile = storageService.getActiveProfile();
  const allProfiles = storageService.getAllProfiles();

  const isAppPaused = isWorkshopOpen || showProfileDropdown || showFriendsModal || showLevelUpModal || showSpeedInfoModal || showPinGateModal || showParentDashboard || showMockCheckoutModal || showStripeCheckoutModal || showFamilyUpgradeModal || showStreakSavedModal || showDailyStreakIncreasedModal || !!perfectMonthData || showBadgesModal || showShareModal || showAccountLinkModal || showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher || showFeedbackModal || showNewsModal;

  // Check for News (Scoped per active profile)
  useEffect(() => {
    // Only check if we are on the main game screen and not in onboarding
    if (showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher || appState !== 'adaptive_session') return;

    const currentPid = activeProfileId || storageService.getActiveProfileId();
    if (!currentPid) return;

    const activeNews = getNewsItems(new Date());
    if (activeNews && activeNews.length > 0) {
      const seenNewsIds = storageService.getSeenNews(currentPid);
      const unseenNews = activeNews.filter(item => !seenNewsIds.includes(item.id));

      if (unseenNews.length > 0) {
        setNewsItems(unseenNews);
        storageService.markNewsAsSeen(unseenNews.map(n => n.id), currentPid);
        setShowNewsModal(true);
      }
    }
  }, [appState, activeProfileId, showFirstLaunchOnboardingModal, showProfileSelector, showManualProfileSwitcher]);

  const closeAllNavModals = (except = null) => {
    if (except !== 'workshop') setIsWorkshopOpen(false);
    if (except !== 'badges') setShowBadgesModal(false);
    setShowNewsModal(false);
    if (except !== 'profile') setShowManualProfileSwitcher(false);
    if (except !== 'profileDropdown') setShowProfileDropdown(false);
    if (except !== 'parents') {
      setShowPinGateModal(false);
      setShowParentDashboard(false);
    }
  };

  const renderNavigationFooter = () => (
    <footer className="sticky bottom-0 z-50 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-xs shrink-0">
      <div className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between sm:justify-around gap-1.5 sm:gap-3 max-w-4xl mx-auto">
        {/* 0. Climb (Main Session) Button: Emerald / Green */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            closeAllNavModals();
            setAppState('adaptive_session');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-100 text-emerald-950 border-2 border-emerald-400 rounded-xl hover:from-emerald-200 hover:to-teal-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'adaptive_session' ? 'ring-2 ring-emerald-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Return to Main Climb Session"
          title="Main Mountain Climb"
        >
          <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 stroke-[2.5]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Climb</span>
        </button>

        {/* 1. Shop Button: Warm Orange */}
        <button
          type="button"
          onClick={() => {
            closeAllNavModals('workshop');
            handleOpenWorkshop();
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-orange-100 via-orange-50 to-orange-100 text-orange-950 border-2 border-orange-400 rounded-xl hover:from-orange-200 hover:to-orange-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] ${
            isWorkshopOpen ? 'ring-2 ring-orange-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Open Kibo's Shop"
          title="Kibo's Workshop & Shop"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 stroke-[2.5]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Shop</span>
        </button>

        {/* 2. Records Button: Golden Yellow */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            closeAllNavModals('badges');
            setShowBadgesModal(true);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-yellow-100 via-yellow-50 to-yellow-100 text-yellow-950 border-2 border-yellow-400 rounded-xl hover:from-yellow-200 hover:to-yellow-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] ${
            showBadgesModal ? 'ring-2 ring-yellow-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          title="View Records"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 stroke-[2.5]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Records</span>
        </button>

        {/* 3. Leaderboard Button: Sapphire Blue */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            closeAllNavModals();
            setAppState('leaderboard');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-indigo-100 via-blue-50 to-indigo-100 text-indigo-950 border-2 border-indigo-400 rounded-xl hover:from-indigo-200 hover:to-blue-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] relative ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'leaderboard' ? 'ring-2 ring-indigo-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Leaderboard"
          title="Leaderboard"
        >
          <div className="relative">
            <Crown className={`w-4 h-4 sm:w-5 sm:h-5 text-indigo-700 stroke-[2.5] ${!isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'leaderboard' ? 'fill-indigo-300' : ''}`} />
            {pendingFriendRequestsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[0.95rem] h-3.5 px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full border border-white flex items-center justify-center animate-pulse leading-none">
                {pendingFriendRequestsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Rank</span>
        </button>

        {/* 4. Quests Button: Royal Purple / Violet (Direct 1-Tap) */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            closeAllNavModals();
            handleNavigateTo('/quests', 'quests');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-purple-100 via-fuchsia-50 to-purple-100 text-purple-950 border-2 border-purple-400 rounded-xl hover:from-purple-200 hover:to-fuchsia-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] relative ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'quests' ? 'ring-2 ring-purple-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Mountain Quests"
          title="Mountain Quests"
        >
          <div className="relative">
            <Scroll className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-700 stroke-[2.5] ${!isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'quests' ? 'fill-purple-300' : ''}`} />
            {questService.getUnclaimedCount(activeProfileId) > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[0.95rem] h-3.5 px-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full border border-white flex items-center justify-center animate-bounce leading-none">
                {questService.getUnclaimedCount(activeProfileId)}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Quests</span>
        </button>
      </div>
    </footer>
  );

  return (
    <div className="app-viewport-root w-full h-full relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col">
      {/* Subject Background Wallpaper */}
      <SubjectWallpaper activeSubject={activeSubject} />
      {isOffline && (
        <div className="bg-amber-100 text-amber-900 border-b border-amber-200 px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-bold z-50">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          You are offline. Progress will sync when reconnected.
        </div>
      )}
      {/* Sticky Top HUD Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between shadow-xs shrink-0 gap-1.5">
        {/* Brand Logo, User Profile & Stats */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 w-full justify-between max-w-4xl mx-auto">
          {/* 1. Active Profile Username / Avatar Dropdown (Top Left) */}
          <div className="relative shrink-0" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowProfileDropdown(!showProfileDropdown);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white border-2 border-sky-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer group"
              title="Climber Profile & Switcher"
              aria-expanded={showProfileDropdown}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 border border-white/40 flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 text-white uppercase shadow-2xs">
                {(activeProfile?.username || activeProfile?.name || 'C')[0].toUpperCase()}
              </div>
              <span className="max-w-[70px] sm:max-w-[110px] truncate tracking-tight font-black">
                {activeProfile?.username || activeProfile?.name || 'Climber'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/80 group-hover:text-white transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Current Active Profile Card */}
                <div className="p-3 bg-gradient-to-br from-slate-50 to-sky-50/50 border-b border-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-base font-black shadow-xs border-2 border-white shrink-0">
                      {(activeProfile?.username || activeProfile?.name || 'C')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-black text-slate-800 truncate leading-tight" title={activeProfile?.username || activeProfile?.name || 'Kibo Climber'}>
                        {activeProfile?.username || activeProfile?.name || 'Kibo Climber'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-sky-500 text-sky-500 inline shrink-0" />
                          {liveCompetenceRating} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Switch Profiles List */}
                <div className="p-2 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Switch Climber
                  </div>
                  {allProfiles
                    .filter((p) => p.id !== activeProfileId)
                    .map((profile) => {
                      const isLocked = storageService.isProfileLocked(profile.id);
                      const pRating = profile.userData?.subjects?.[activeSubject]?.competenceRank ||
                        profile.userData?.competenceRank ||
                        1000;
                      const pName = profile.username || profile.name || 'Climber';
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (isLocked) {
                              setShowProfileDropdown(false);
                              setShowFamilyUpgradeModal(true);
                              return;
                            }
                            storageService.setActiveProfileId(profile.id);
                            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile.id) || 'math';
                            storageService.setLastActiveSubject(targetSubject, profile.id);
                            setActiveProfileId(profile.id);
                            setActiveSubject(targetSubject);
                            syncAppStateWithStorage(targetSubject);
                            setShowProfileDropdown(false);
                            setAppState('adaptive_session');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer group w-full ${
                            isLocked
                              ? 'opacity-60 bg-slate-50/50 hover:bg-slate-100 hover:opacity-80 border border-slate-200'
                              : 'hover:bg-slate-100 active:bg-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                            <div className="relative shrink-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center text-xs font-black border border-white/60 shadow-2xs group-hover:scale-105 transition-transform">
                                {pName[0].toUpperCase()}
                              </div>
                              {isLocked && (
                                <div className="absolute -top-1 -right-1 bg-slate-700 rounded-full p-0.5 border border-white shadow-xs">
                                  <Lock className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-black text-slate-700 truncate group-hover:text-slate-900" title={pName}>
                                {pName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 shrink-0">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 inline shrink-0" />
                                {pRating} pts
                              </span>
                            </div>
                          </div>
                          {isLocked && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                              Locked
                            </span>
                          )}
                        </button>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowProfileDropdown(false);
                      setProfileSwitcherOrigin({ appState });
                      setShowManualProfileSwitcher(true);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-amber-50 text-amber-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                      <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Manage Profiles</span>
                  </button>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Parent Zone & Settings Quick Links */}
                <div className="p-2 bg-slate-50/50 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowProfileDropdown(false);
                      setParentDashboardTab('overview');
                      setParentDashboardHighlight(null);
                      setPinGateSource('profile_dropdown');
                      setShowPinGateModal(true);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-50 text-purple-800 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                    <span>Parent Zone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowProfileDropdown(false);
                      closeAllNavModals();
                      setAppState('settings');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Brand Anchor: Logo + Name (Top Center) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              closeAllNavModals();
              setAppState('adaptive_session');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer group select-none shrink-0"
            title="Kibo Climb Home"
          >
            <img src="/favicon.svg" alt="Kibo Climb Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:scale-110 transition-transform shrink-0 drop-shadow-xs" />
            <span className="font-black text-sm sm:text-base tracking-normal text-slate-800 group-hover:text-amber-600 transition-colors uppercase">
              {BRAND_CONFIG.rootBrand}
            </span>
          </button>

          {/* 3. Right HUD Stats & Shortcuts */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mobile Rolled Stats Button (< sm) */}
            <div className="relative sm:hidden" ref={statsDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setShowStatsDropdown(!showStatsDropdown);
                }}
                className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-2 border-amber-300 px-2.5 py-1 rounded-full text-xs font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Climber Stats"
                aria-expanded={showStatsDropdown}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-900 fill-amber-300 stroke-[2.5]" />
                <span className="text-[11px] font-black">{streak}d</span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-900 transition-transform duration-200 ${showStatsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Stats Roll-down Menu */}
              {showStatsDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Streak Item */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowStatsDropdown(false);
                      setShowBadgesModal(true);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                      <span>Daily Streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-black">{streak}d</span>
                      {((consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0) && (
                        <span className="text-xs">🛡️</span>
                      )}
                    </div>
                  </button>

                  {/* Sparks Item */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowStatsDropdown(false);
                      handleOpenWorkshop('adaptive_session');
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-500 stroke-[2.5] shrink-0" />
                      <span>Sparks</span>
                    </div>
                    <span className="font-black">{sparks}</span>
                  </button>

                  {/* Competence / Rank Item */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowStatsDropdown(false);
                      setShowBadgesModal(true);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-600 fill-purple-300 stroke-[2] shrink-0" />
                      <span>Rank ({getCompetenceRankTier(liveCompetenceRating, activeSubject)})</span>
                    </div>
                    <span className="font-black">{liveCompetenceRating} pts</span>
                  </button>

                  {/* Quest Rank & Level Item */}
                  {(() => {
                    const questState = questService.getQuests(activeProfileId);
                    const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer' };
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playKeyTap();
                          setShowStatsDropdown(false);
                          setAppState('quests');
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 font-black text-xs transition-colors cursor-pointer w-full text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>Quest ({questLevelInfo.title})</span>
                        </div>
                        <span className="font-black">Lvl {questLevelInfo.level} · {questState?.totalXp || 0} XP</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Desktop / Tablet Stats Icons (>= sm) */}
            {/* Streak Badge Button */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-2 border-rose-300 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 relative overflow-visible cursor-pointer"
              title={(consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0 ? "Daily Streak & Shield Active! 🛡️" : `Daily Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
              onClick={() => {
                soundFx.playKeyTap();
                setShowBadgesModal(true);
              }}
            >
              <RollingNumberTicker
                value={streak}
                suffix={` ${streak === 1 ? 'd' : 'd'}`}
                profileId={activeProfileId}
                subjectId={activeSubject}
                icon={<Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 shrink-0" />}
              />
              {((consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0) && (
                <span className="inline-flex items-center justify-center bg-white/95 rounded-full w-3.5 h-3.5 text-[10px] ml-0.5 animate-pulse shadow-2xs border border-rose-200 leading-none shrink-0" title="Kibo Shield Active">
                  🛡️
                </span>
              )}
            </button>

            {/* Sparks Counter Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                handleOpenWorkshop('adaptive_session');
              }}
              className="hidden sm:flex items-center gap-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-950 border-2 border-yellow-500 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all relative shrink-0 overflow-visible cursor-pointer"
              title="Open Kibo Workshop"
            >
              <RollingNumberTicker
                value={sparks}
                icon={<Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 fill-amber-500 stroke-[2.5]" />}
                profileId={activeProfileId}
                subjectId={activeSubject}
              />
            </button>

            {/* Competence Rank Button */}
            {(() => {
              const rankTitle = getCompetenceRankTier(liveCompetenceRating, activeSubject);
              return (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowBadgesModal(true);
                  }}
                  className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-200 text-purple-950 border-2 border-purple-400 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 relative overflow-visible cursor-pointer hover:border-purple-500"
                  title={`Competence Rank: ${liveCompetenceRating} pts (${rankTitle})`}
                >
                  <RollingNumberTicker
                    value={liveCompetenceRating}
                    profileId={activeProfileId}
                    subjectId={activeSubject}
                    icon={<Star className="w-3.5 h-3.5 text-purple-700 fill-purple-300 stroke-[2]" />}
                  />
                </button>
              );
            })()}

            {/* Friends Button (Available on all screen sizes) */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowFriendsModal(true);
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white border-2 border-sky-300 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer relative"
              title={`Friends (${friendsCount})${pendingFriendRequestsCount > 0 ? ` • ${pendingFriendRequestsCount} pending request${pendingFriendRequestsCount > 1 ? 's' : ''}` : ''}`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              {friendsCount > 0 && (
                <span className="inline-flex items-center justify-center bg-white text-sky-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs leading-tight">
                  {friendsCount}
                </span>
              )}
              {pendingFriendRequestsCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-4.5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-md flex items-center justify-center animate-bounce leading-none"
                  title={`${pendingFriendRequestsCount} new friend request${pendingFriendRequestsCount > 1 ? 's' : ''}!`}
                >
                  {pendingFriendRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-1 sm:p-2 relative min-h-0 overflow-y-auto hide-scrollbar">

      {/* In-Content Subject Selector Bar */}
      {appState === 'adaptive_session' && (
        <div className="w-full mb-2 sm:mb-3 flex items-center justify-center gap-2 px-1 shrink-0">
          {/* Mobile Subject Dropdown (< sm) */}
          <div className="relative sm:hidden w-48 max-w-[220px]" ref={subjectDropdownRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowSubjectDropdown(!showSubjectDropdown);
              }}
              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs border-2 ${
                activeSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50'
                  : activeSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50'
                  : activeSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50'
              }`}
              title="Switch Subject"
              aria-expanded={showSubjectDropdown}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none select-none">
                  {activeSubject === 'math' ? '🔢' : activeSubject === 'words' ? '📚' : activeSubject === 'world' ? '🌍' : '💻'}
                </span>
                <span className="tracking-tight capitalize">{activeSubject}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Subject Roll-down Menu */}
            {showSubjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Math Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('math');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'math'
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔢</span>
                    <span>Kibo Math</span>
                  </div>
                  {activeSubject === 'math' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                </button>

                {/* Words Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('words');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'words'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📚</span>
                    <span>Kibo Words</span>
                  </div>
                  {activeSubject === 'words' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>

                {/* World Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('world');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'world'
                      ? 'bg-teal-100 border-teal-300 text-teal-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span>Kibo World</span>
                  </div>
                  {activeSubject === 'world' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </button>

                {/* Coding Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('coding');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'coding'
                      ? 'bg-rose-100 border-rose-300 text-rose-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💻</span>
                    <span>Kibo Coding</span>
                  </div>
                  {activeSubject === 'coding' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                </button>

                {/* Coming Soon Teasers (Money & Music in Mobile Menu) */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black bg-slate-50/80 border border-dashed border-emerald-300 text-slate-700 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💰</span>
                    <span>Kibo Money</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 leading-none">
                    Coming Soon
                  </span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black bg-slate-50/80 border border-dashed border-purple-300 text-slate-700 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎵</span>
                    <span>Kibo Music</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 leading-none">
                    Coming Soon
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Subject Bar (>= sm) */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 w-full sm:w-auto">
            {/* Kibo Math */}
            <button
              type="button"
              onClick={() => handleSubjectChange('math')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-white/90 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-200'
              }`}
              title="Switch to Kibo Math"
            >
              <span className="text-sm sm:text-base leading-none select-none">🔢</span>
              <span className="tracking-tight">Math</span>
              {activeSubject === 'math' && <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse" />}
            </button>

            {/* Kibo Words */}
            <button
              type="button"
              onClick={() => handleSubjectChange('words')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50 scale-105'
                  : 'bg-white/90 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200'
              }`}
              title="Switch to Kibo Words"
            >
              <span className="text-sm sm:text-base leading-none select-none">📚</span>
              <span className="tracking-tight">Words</span>
              {activeSubject === 'words' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo World */}
            <button
              type="button"
              onClick={() => handleSubjectChange('world')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50 scale-105'
                  : 'bg-white/90 hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-200'
              }`}
              title="Switch to Kibo World"
            >
              <span className="text-sm sm:text-base leading-none select-none">🌍</span>
              <span className="tracking-tight">World</span>
              {activeSubject === 'world' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo Coding */}
            <button
              type="button"
              onClick={() => handleSubjectChange('coding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'coding'
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50 scale-105'
                  : 'bg-white/90 hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-200'
              }`}
              title="Switch to Kibo Coding"
            >
              <span className="text-sm sm:text-base leading-none select-none">💻</span>
              <span className="tracking-tight">Coding</span>
              {activeSubject === 'coding' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Coming Soon Teasers (Money & Music) */}
            <button
              type="button"
              disabled
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-white/90 border-2 border-dashed border-emerald-300 text-slate-700 shadow-2xs shrink-0 select-none cursor-not-allowed"
              title="Kibo Money - Coming Soon"
            >
              <span className="text-sm sm:text-base leading-none select-none">💰</span>
              <span className="tracking-tight">Money</span>
              <span className="absolute -top-2 -right-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs leading-none whitespace-nowrap">
                Coming Soon
              </span>
            </button>
            <button
              type="button"
              disabled
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-white/90 border-2 border-dashed border-purple-300 text-slate-700 shadow-2xs shrink-0 select-none cursor-not-allowed"
              title="Kibo Music - Coming Soon"
            >
              <span className="text-sm sm:text-base leading-none select-none">🎵</span>
              <span className="tracking-tight">Music</span>
              <span className="absolute -top-2 -right-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs leading-none whitespace-nowrap">
                Coming Soon
              </span>
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS SCREEN */}
      {appState === 'settings' && (
        <SettingsScreen
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          renderFooter={renderNavigationFooter}
          onNavigate={handleNavigateTo}
          onBack={() => handleNavigateTo('/', 'home')}
          onOpenFeedback={() => setShowFeedbackModal(true)}
          onOpenParentZone={(targetTab = 'overview') => {
            setParentDashboardTab(targetTab);
            setParentDashboardHighlight(null);
            setPinGateSource('settings_screen');
            setShowPinGateModal(true);
          }}
          onSwitchProfile={() => {
            setProfileSwitcherOrigin({ appState: 'settings' });
            setShowManualProfileSwitcher(true);
          }}
        />
      )}

      {/* PRIVACY POLICY SCREEN */}
      {appState === 'privacy' && (
        <PrivacyPolicyScreen
          onBack={() => handleNavigateTo('/settings', 'settings')}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* TERMS OF SERVICE SCREEN */}
      {appState === 'terms' && (
        <TermsOfServiceScreen
          onBack={() => handleNavigateTo('/settings', 'settings')}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* LEADERBOARD SCREEN */}
      {appState === 'leaderboard' && (
        <LeaderboardScreen
          activeSubject={activeSubject}
          userState={{
            competenceRank: liveCompetenceRating,
            adaptiveCompetenceRating: liveCompetenceRating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak
          }}
          renderFooter={renderNavigationFooter}
          equippedItems={equippedItems}
        />
      )}

      {/* QUESTS SCREEN */}
      {appState === 'quests' && (
        <QuestsScreen
          activeSubject={activeSubject}
          userState={{
            competenceRank: liveCompetenceRating,
            adaptiveCompetenceRating: liveCompetenceRating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak
          }}
          onNavigate={handleNavigateTo}
          onBack={() => handleNavigateTo('/', 'adaptive_session')}
          renderFooter={renderNavigationFooter}
          onAwardReward={(reward = {}) => {
            if (reward.sparks) {
              const clubMultiplier = isKiboClub ? 1.25 : 1;
              const finalEarned = Math.round(reward.sparks * clubMultiplier);
              const updated = (sparks || 0) + finalEarned;
              setSparks(updated);
              storageService.saveUserData({ sparks: updated }, activeSubject);
            }
            if (reward.shields) {
              const nextConsumables = {
                ...consumables,
                shieldCount: (consumables.shieldCount || 0) + reward.shields
              };
              setConsumables(nextConsumables);
              storageService.saveUserData({ consumables: nextConsumables }, activeSubject);
            }
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = (sparks || 0) + finalEarned;
            setSparks(updated);
            storageService.saveUserData({ sparks: updated }, activeSubject);
          }}
        />
      )}

      {/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {appState === 'adaptive_session' && activeSubject === 'math' && (
        <MathSessionView
          key={activeProfileId + '-math'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeLetterSpyglass={handleConsumeLetterSpyglass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'words' && (
        <WordsSessionView
          key={activeProfileId + '-words'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeLetterSpyglass={handleConsumeLetterSpyglass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'world' && (
        <WorldSessionView
          key={activeProfileId + '-world'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeExplorerCompass={handleConsumeExplorerCompass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'coding' && (
        <CodingSessionView
          key={activeProfileId + '-coding'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeExplorerCompass={handleConsumeExplorerCompass}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {/* PROFILE SELECTOR — shown on every load when 2+ profiles exist */}
      {showProfileSelector && (
        <ProfileSelectorScreen
          onSelectProfile={(profile) => {
            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile?.id) || 'math';
            storageService.setLastActiveSubject(targetSubject, profile?.id);
            setActiveSubject(targetSubject);
            syncAppStateWithStorage(targetSubject);
            setShowProfileSelector(false);
            setAppState('adaptive_session');
            validateStreakForActiveProfile(targetSubject);
          }}
          onOpenParentZone={(targetTab = 'overview') => {
            setParentDashboardTab(targetTab);
            setParentDashboardHighlight(null);
            setShowProfileSelector(false);
            setPinGateSource('profile_selector');
            setShowPinGateModal(true);
          }}
        />
      )}

      {/* MANUAL PROFILE SELECTOR */}
      {showManualProfileSwitcher && (
        <ProfileSelectorScreen
          canClose={true}
          onSelectProfile={(profile) => {
            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile?.id) || 'math';
            storageService.setLastActiveSubject(targetSubject, profile?.id);
            setActiveSubject(targetSubject);
            syncAppStateWithStorage(targetSubject);
            setShowManualProfileSwitcher(false);
            setAppState('adaptive_session');
            validateStreakForActiveProfile(targetSubject);
          }}
          onClose={() => {
            setShowManualProfileSwitcher(false);
            if (profileSwitcherOrigin) {
              if (profileSwitcherOrigin.showBadgesModal) {
                setShowBadgesModal(true);
              } else if (profileSwitcherOrigin.isWorkshopOpen) {
                setIsWorkshopOpen(true);
              } else if (profileSwitcherOrigin.showParentDashboard) {
                setShowParentDashboard(true);
              } else if (profileSwitcherOrigin.appState) {
                setAppState(profileSwitcherOrigin.appState);
              }
            }
            setProfileSwitcherOrigin(null);
          }}
          onOpenParentZone={(targetTab = 'overview') => {
            setParentDashboardTab(targetTab);
            setParentDashboardHighlight(null);
            setPinGateSource('manual_profile_switcher');
            setShowPinGateModal(true);
          }}
        />
      )}

      {/* FIRST LAUNCH ONBOARDING MODAL */}
      <FirstLaunchOnboardingModal
        isOpen={showFirstLaunchOnboardingModal}
        equippedItems={equippedItems}
        hasVisitedParentZone={hasVisitedParentZone}
        onUsernameSet={(username) => {
          storageService.updateProfile(storageService.getActiveProfileId(), { name: username });
          syncAppStateWithStorage();
        }}
        onOpenParentZone={(targetTab = 'overview') => {
          syncAppStateWithStorage();
          setShowFirstLaunchOnboardingModal(false);
          localStorage.setItem('kibo_math_has_onboarded', 'true');
          setParentDashboardTab(targetTab);
          setParentDashboardHighlight(null);
          setPinGateSource('onboarding');
          setShowPinGateModal(true);
        }}
        onStartAdaptiveClimb={(startingSubject = 'math') => {
          const validSubject = (startingSubject === 'words' || startingSubject === 'math' || startingSubject === 'world' || startingSubject === 'coding') ? startingSubject : 'math';
          storageService.setLastActiveSubject(validSubject);
          setActiveSubject(validSubject);
          syncAppStateWithStorage(validSubject);
          setShowFirstLaunchOnboardingModal(false);
          setAppState('adaptive_session');
        }}
      />

      {/* STREAK SAVED MODAL */}
      <StreakSavedModal
        isOpen={showStreakSavedModal}
        onClose={() => setShowStreakSavedModal(false)}
        streak={streak}
        remainingShields={streakShields}
      />

      {/* DAILY STREAK INCREASED MODAL */}
      <DailyStreakIncreasedModal
        isOpen={showDailyStreakIncreasedModal && !perfectMonthData}
        onClose={() => setShowDailyStreakIncreasedModal(false)}
        streak={streak}
      />

      {/* PERFECT MONTH PROGRESS MODAL */}
      <PerfectMonthProgressModal
        isOpen={!!perfectMonthData}
        onClose={() => {
          setPerfectMonthData(null);
          // If the streak modal was queued, let it show after closing this
        }}
        daysPlayedThisMonth={perfectMonthData?.daysPlayedThisMonth || 1}
      />

      {/* PARENT PIN GATE MODAL */}
      <PinGateModal
        isOpen={showPinGateModal}
        onClose={() => {
          setShowPinGateModal(false);
          setPendingSparksPurchase(null);
          if (pinGateSource === 'profile_selector') {
            setShowProfileSelector(true);
          } else if (pinGateSource === 'manual_profile_switcher') {
            setShowManualProfileSwitcher(true);
          } else if (pinGateSource === 'onboarding') {
            setShowFirstLaunchOnboardingModal(true);
          } else if (pinGateSource === 'settings_menu' && profileSwitcherOrigin) {
            if (profileSwitcherOrigin.showBadgesModal) {
              setShowBadgesModal(true);
            } else if (profileSwitcherOrigin.isWorkshopOpen) {
              setIsWorkshopOpen(true);
            } else if (profileSwitcherOrigin.showParentDashboard) {
              setShowParentDashboard(true);
            } else if (profileSwitcherOrigin.appState) {
              setAppState(profileSwitcherOrigin.appState);
            }
            setProfileSwitcherOrigin(null);
          }
          setPinGateSource(null);
        }}
        currentPin={parentPin}
        onUnlockSuccess={() => {
          setShowPinGateModal(false);
          if (pinGateSource === 'manual_profile_switcher') {
            setShowManualProfileSwitcher(false);
          } else if (pinGateSource === 'profile_selector') {
            setShowProfileSelector(false);
          }
          setPinGateSource(null);
          if (pendingSparksPurchase) {
            if (authService.getAuthState().isAnonymous) {
              setLinkModalMilestone('Real-Money Purchase Backup');
              setShowAccountLinkModal(true);
            } else {
              if (pendingSparksPurchase.realMoneyPrice) {
                setShowStripeCheckoutModal(true);
              } else {
                setShowMockCheckoutModal(true);
              }
            }
          } else {
            setShowParentDashboard(true);
            if (!hasVisitedParentZone) {
              setHasVisitedParentZone(true);
              storageService.saveUserData({ hasVisitedParentZone: true });
            }
          }
        }}
      />

      {/* PARENT DASHBOARD MODAL */}
      <ParentDashboardModal
        initialTab={parentDashboardTab}
        highlightSection={parentDashboardHighlight}
        activeSubject={activeSubject}
        isOpen={showParentDashboard}
        onClose={() => {
          setShowParentDashboard(false);
          setParentDashboardTab('overview');
          setParentDashboardHighlight(null);
        }}
        currentPin={parentPin}
        onUpdatePin={handleUpdatePin}
        tier={tier}
        onSetTier={handleSetTierManual}
        streak={streak}
        sparks={sparks}
        practiceQueueCount={practiceQueue.length}
        practiceQueue={practiceQueue}
        sprintHistory={[]}
        practiceDays={practiceDays}
        onUpdatePracticeDays={handleUpdatePracticeDays}
        onProfileSwitch={() => syncAppStateWithStorage()}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        unlockedBadges={unlockedBadges}
        totalProblemsSolved={totalProblemsSolved}
        personalRecords={personalRecords}
        onAccountLinked={(user, newSparks) => {
          if (newSparks !== undefined) {
            setSparks(newSparks);
          }
          syncAppStateWithStorage();
        }}
      />

      {/* TRAIL BADGES SHOWCASE MODAL */}
      <BadgesModal
        activeSubject={activeSubject}
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        unlockedBadges={unlockedBadges}
        personalRecords={personalRecords}
        userState={(() => {
          const uData = storageService.getUserData(activeSubject);
          const rating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
          return {
            ...uData,
            competenceRank: rating,
            adaptiveCompetenceRating: rating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak,
            sprintHistory: sprintHistory || uData.sprintHistory || [],
            completedClimbsCount: uData.completedClimbsCount || (sprintHistory || uData.sprintHistory || []).length
          };
        })()}
        renderFooter={renderNavigationFooter}
      />

      {/* PARENT SPEED INFO MODAL (ℹ️) */}
      {showSpeedInfoModal && (
        <div
          onClick={() => setShowSpeedInfoModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 text-left shadow-2xl space-y-3 relative cursor-default"
          >
            <button
              onClick={() => setShowSpeedInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2">
              <Info className="w-6 h-6 text-kibo-teal stroke-[2.5]" />
              <h3 className="text-xl font-extrabold text-slate-800">How Recall Latency Works</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kibo Math measures millisecond latency from the instant a problem appears until the user completes their answer.
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="font-extrabold text-amber-900">⚡ Instant Recall (&lt;1.5s / &lt;2.2s):</span>
                <p className="text-amber-800 font-normal">Direct memory retrieval without needing scratchpad calculation.</p>
              </div>

              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                <span className="font-extrabold text-yellow-900">🟡 Worked It Out (1.5s–4.0s / 2.2s–4.5s):</span>
                <p className="text-yellow-800 font-normal">Active calculation in working memory. Fluent and correct!</p>
              </div>

              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-extrabold text-blue-900">🔵 Focus Area (&gt;4.0s / &gt;4.5s or Incorrect):</span>
                <p className="text-blue-800 font-normal">Automatically re-queued into future daily sessions to reinforce memory!</p>
              </div>
            </div>

            <button
              onClick={() => setShowSpeedInfoModal(false)}
              className="btn-3d-teal w-full py-2.5 text-sm rounded-xl"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Tier Level-Up Celebration Modal */}
      {showLevelUpModal && (
        <div
          onClick={() => setShowLevelUpModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-purple-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 cursor-default"
          >
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto border-2 border-purple-300 animate-bounce">
              <Award className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-black text-purple-600 tracking-wider">Level-Up Unlocked!</span>
              <h3 className="text-2xl font-black text-slate-800">Advance to Tier {tier + 1}?</h3>
              <p className="text-xs text-slate-600 font-medium">
                {levelUpReason}
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-purple-900 font-extrabold text-sm">
              Unlock Tier {tier + 1}: {getTierMeta(tier + 1).title}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleLevelUp}
                className="btn-3d-purple w-full py-3.5 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
              >
                Advance to Tier {tier + 1}! 🎉
              </button>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full py-2 text-slate-500 font-extrabold text-sm hover:text-slate-800"
              >
                Stay in Tier {tier} for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workshop Modal */}
      <WorkshopModal
        isOpen={isWorkshopOpen}
        onClose={handleCloseWorkshop}
        sparks={sparks}
        streakShields={streakShields}
        consumables={consumables}
        unlockedItems={unlockedItems}
        equippedItems={equippedItems}
        onBuyItem={handleBuyItem}
        onBuyConsumable={handleBuyConsumable}
        onSellItem={handleSellItem}
        onToggleEquip={handleToggleEquip}
        onRedeemPromoCode={handleRedeemPromoCode}
        allowRealMoneyPurchases={notifPrefs.allowRealMoneyPurchases}
        onOpenParentZone={(targetTab = 'verification', highlight = 'real_money_purchases') => {
          setParentDashboardTab(targetTab);
          setParentDashboardHighlight(highlight);
          setPinGateSource('shop');
          setShowPinGateModal(true);
        }}
        onBuySparksPackage={(pack) => {
          setPendingSparksPurchase(pack);
          setShowPinGateModal(true);
        }}
        onRequestAccountLink={() => {
          setLinkModalMilestone('Shop Rewards');
          setShowAccountLinkModal(true);
        }}
        renderFooter={renderNavigationFooter}
      />

      <MockCheckoutModal
        isOpen={showMockCheckoutModal}
        onClose={() => {
          setShowMockCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
        packageInfo={pendingSparksPurchase}
        onConfirm={(pack) => {
          let newSparks = sparks + (pack.sparks || pack.sparksIncluded || 0);

          let nextConsumables = { ...consumables };
          if (pack.bundleConsumables) {
            Object.keys(pack.bundleConsumables).forEach((key) => {
              nextConsumables[key] = (nextConsumables[key] || 0) + pack.bundleConsumables[key];
            });
            setConsumables(nextConsumables);
            storageService.saveUserData({
              streakShields: nextConsumables.shieldCount,
              streakSaverCount: nextConsumables.streakSaverCount,
              hintScrollCount: nextConsumables.hintScrollCount,
              doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
            });
          }

          let nextUnlocked = [...unlockedItems];
          if (pack.bundleItems) {
            pack.bundleItems.forEach(itemId => {
               if (!nextUnlocked.includes(itemId)) {
                 nextUnlocked.push(itemId);
               }
            });
            if (pack.id && !nextUnlocked.includes(pack.id)) {
              nextUnlocked.push(pack.id);
            }
            setUnlockedItems(nextUnlocked);
            storageService.saveShopState(equippedItems, nextUnlocked);
          } else if (pack.realMoneyPrice && !pack.isSubscription && !pack.sparks && !pack.bundleItems && !pack.bundleConsumables) {
             // For single premium items
             if (!nextUnlocked.includes(pack.id)) {
                 nextUnlocked.push(pack.id);
             }
             setUnlockedItems(nextUnlocked);
             storageService.saveShopState(equippedItems, nextUnlocked);
          }

          if (pack.isSubscription) {
             setIsKiboClub(true);
             if (pack.isFamilyPlan) {
               storageService.setFamilyPlanState(true);
             } else {
               storageService.saveUserData({ isKiboClub: true });
             }
          }

          setSparks(newSparks);
          storageService.saveUserData({ sparks: newSparks });
          localStorage.setItem('kibo_math_sparks', newSparks.toString());

          soundFx.playSparkCollect();
          setShowMockCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
      />

      <StripeCheckoutModal
        isOpen={showStripeCheckoutModal}
        onClose={() => {
          setShowStripeCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
        packageInfo={pendingSparksPurchase}
        onConfirm={(pack) => {
          let newSparks = sparks + (pack.sparks || pack.sparksIncluded || 0);

          let nextConsumables = { ...consumables };
          if (pack.bundleConsumables) {
            Object.keys(pack.bundleConsumables).forEach((key) => {
              nextConsumables[key] = (nextConsumables[key] || 0) + pack.bundleConsumables[key];
            });
            setConsumables(nextConsumables);
            storageService.saveUserData({
              streakShields: nextConsumables.shieldCount,
              streakSaverCount: nextConsumables.streakSaverCount,
              hintScrollCount: nextConsumables.hintScrollCount,
              doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
            });
          }

          let nextUnlocked = [...unlockedItems];
          if (pack.bundleItems) {
            pack.bundleItems.forEach((id) => {
              if (!nextUnlocked.includes(id)) {
                nextUnlocked.push(id);
              }
            });
            setUnlockedItems(nextUnlocked);
            storageService.saveShopState({ unlockedItems: nextUnlocked });
          }

          setSparks(newSparks);
          storageService.saveUserData({ sparks: newSparks });
          localStorage.setItem('kibo_math_sparks', newSparks.toString());

          soundFx.playSparkCollect();
          setShowStripeCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
      />

      {/* Family Plan Upgrade Modal */}
      <FamilyPlanUpgradeModal
        isOpen={showFamilyUpgradeModal}
        onClose={() => setShowFamilyUpgradeModal(false)}
        onOpenParentZone={(targetTab = 'overview') => {
          setParentDashboardTab(targetTab);
          setParentDashboardHighlight(null);
          setShowFamilyUpgradeModal(false);
          setPinGateSource('profile_dropdown');
          setShowPinGateModal(true);
        }}
      />

      {/* News Modal */}
      <NewsModal
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
        newsItems={newsItems}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Friends Modal */}
      <AddFriendModal
        isOpen={showFriendsModal}
        onClose={() => {
          setShowFriendsModal(false);
          const currentPid = storageService.getActiveProfileId();
          setFriendsCount(storageService.getFriends(currentPid).length);
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
        }}
        activeSubject={activeSubject}
        onFriendAdded={() => {
          const currentPid = storageService.getActiveProfileId();
          setFriendsCount(storageService.getFriends(currentPid).length);
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => {
          setShowAccountLinkModal(false);
          if (pendingSparksPurchase) {
            setPendingSparksPurchase(null);
          }
        }}
        triggerMilestone={linkModalMilestone}
        onAccountLinked={(user, newSparks) => {
          if (newSparks !== undefined) {
            setSparks(newSparks);
          }
          syncAppStateWithStorage();
          setShowAccountLinkModal(false);
          if (pendingSparksPurchase) {
            if (pendingSparksPurchase.realMoneyPrice) {
              setShowStripeCheckoutModal(true);
            } else {
              setShowMockCheckoutModal(true);
            }
          }
        }}
      />

      {/* DEV CONTROL PANEL (TRIGGERED BY SECRET KEYSTROKE CODE 'kibodev') */}
      <DevControlPanel
        isOpen={devState.isDevPanelOpen}
        onClose={() => devState.setIsDevPanelOpen(false)}
        onResetAllStats={devState.resetAllStats}
        onSetRating={devState.setRating}
        onAdjustSparks={devState.adjustSparks}
        onUnlockAllWorkshopItems={devState.unlockAllWorkshopItems}
        onStateRefresh={() => {
          const uData = storageService.getUserData(activeSubject);
          const sData = storageService.getShopState();
          setSparks(uData.sparks || 0);
          setUnlockedItems(sData.unlockedItems || ['cap']);
        }}
      />

      </main>

      {/* Bottom Navigation Bar */}
      {appState !== 'settings' && appState !== 'privacy' && appState !== 'terms' && appState !== 'leaderboard' && appState !== 'quests' && renderNavigationFooter()}
    </div>
  );
}
