import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles, Layers, Swords, Award, Info, X, Lock, ShieldCheck, Compass, MapPin, Users } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import PinGateModal from './components/PinGateModal';
import ParentDashboardModal from './components/ParentDashboardModal';
import SkillMapScreen from './components/SkillMapScreen';
import QuitSprintModal from './components/QuitSprintModal';
import StreakSavedModal from './components/StreakSavedModal';
import WorldMap from './components/WorldMap';
import MicroHintCard from './components/MicroHintCard';
import FirstLaunchOnboardingModal from './components/FirstLaunchOnboardingModal';
import ProfileSelectorScreen from './components/ProfileSelectorScreen';
import SprintResultsModal from './components/SprintResultsModal';
import BadgesModal from './components/BadgesModal';
import AdaptiveSessionView from './components/AdaptiveSessionView';
import DevControlPanel from './components/DevControlPanel';
import RollingNumberTicker from './components/RollingNumberTicker';
import { checkAndPromptLinkAccount } from './utils/linkPromptLogic';
import { useDevState } from './hooks/useDevState';
import { evaluateBadges } from './utils/badgeManager';
import { BADGES_CATALOG } from './data/badges';
import { generateProblems } from './utils/mathGenerator';
import { generatePlacementDiagnosticSet, evaluatePlacementTier, CURRICULUM_TIERS, calculateStars } from './utils/curriculum';
import { getItemById } from './utils/itemsCatalog';
import { classifyLatency } from './utils/latencyEngine';
import { soundFx } from './utils/audio';
import { BRAND_CONFIG } from './config/brand';
import { pluralize, normalizeTimeAnswer } from './utils/formatters';
import { storageService } from './services/storageService';
import { getCompetenceRankTier } from './utils/GameEconomyModel';
import { authService } from './services/authService';
import { syncService } from './services/syncService';
import { shopLedgerService } from './services/shopLedgerService';
import AccountLinkModal from './components/AccountLinkModal';
import { getNotificationPrefs } from './utils/notifications';
import MockCheckoutModal from './components/MockCheckoutModal';

export default function App() {
  // App State: 'adaptive_session' | 'sprint' | 'victory' | 'skill_map' | 'world_map' | 'placement_test'
  const [appState, setAppState] = useState('adaptive_session');
  const [isMuted, setIsMuted] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [workshopOriginState, setWorkshopOriginState] = useState('adaptive_session');

  const devState = useDevState(() => {
    const uData = storageService.getUserData();
    const sData = storageService.getShopState();
    setSparks(uData.sparks || 0);
    setUnlockedItems(sData.unlockedItems || ['cap']);
  });

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
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pendingSparksPurchase, setPendingSparksPurchase] = useState(null);
  const [showMockCheckoutModal, setShowMockCheckoutModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);
  const [showSprintResultsModal, setShowSprintResultsModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [linkModalMilestone, setLinkModalMilestone] = useState('Milestone');


  const syncAppStateWithStorage = () => {
    const uData = storageService.getUserData();
    const sData = storageService.getShopState();
    const cRating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;

    setLiveCompetenceRating(cRating);
    setTier(uData.tier || 1);
    setUnlockedTiers(uData.unlockedTiers || [1]);
    setStreak(uData.streak ?? 1);
    setSparks(uData.sparks ?? 0);
    setTotalProblemsSolved(uData.totalProblemsSolved ?? 0);
    setUnlockedBadges(uData.unlockedBadges ?? []);
    setPracticeDays(storageService.getProfilePracticeDays());
    setEquippedItems(sData.equippedItems ?? []);
    setUnlockedItems(sData.unlockedItems ?? ['cap']);
    setHasVisitedParentZone(uData.hasVisitedParentZone || false);
  };

  // Initialize Silent Anonymous Guest Auth & Offline Background Sync Queue on Launch
  useEffect(() => {
    authService.initAnonymousGuest();
    syncService.initBackgroundSync();
  }, []);

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    return storageService.getUserData().unlockedBadges || [];
  });
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState([]);

  useEffect(() => {
    const activeUserData = storageService.getUserData();
    const evalRes = evaluateBadges(activeUserData);
    if (evalRes?.updatedUnlocked) {
      setUnlockedBadges(evalRes.updatedUnlocked);
    }
  }, []);

  // First-Time User Onboarding Modal State
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

  // Consecutive problem miss tracking for Micro-Hints
  const [consecutiveProblemMisses, setConsecutiveProblemMisses] = useState(0);

  // Test-Out State
  const [isTestOut, setIsTestOut] = useState(false);
  const [testOutTargetTier, setTestOutTargetTier] = useState(null);
  const [hasVisitedParentZone, setHasVisitedParentZone] = useState(() => {
    return storageService.getUserData().hasVisitedParentZone || false;
  });
  const [showTestOutPassModal, setShowTestOutPassModal] = useState(false);
  const [showTestOutFailModal, setShowTestOutFailModal] = useState(false);



  const [levelUpReason, setLevelUpReason] = useState('');
  const [isBossMode, setIsBossMode] = useState(false);
  const [isPlacementTest, setIsPlacementTest] = useState(false);
  const [placementResultInfo, setPlacementResultInfo] = useState(null);

  // Date helpers for calendar day streak tracking
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Persistent Kibo Shields (Streak Freezes: max capacity 2, default 1)
  const [streakShields, setStreakShields] = useState(() => {
    return storageService.getUserData().streakShields ?? 1;
  });

  // Persistent Custom 7-Day Practice Schedule (per child profile)
  const [practiceDays, setPracticeDays] = useState(() => {
    return storageService.getProfilePracticeDays();
  });

  // Persistent Daily Streak
  const [streak, setStreak] = useState(() => {
    return storageService.getUserData().streak;
  });

  // Persistent Sparks Currency (⚡)
  const [sparks, setSparks] = useState(() => {
    return storageService.getUserData().sparks;
  });

  // Persistent Active Skill Tier (1 through 8)
  const [tier, setTier] = useState(() => {
    return storageService.getUserData().tier;
  });

  // Persistent Unlocked Curriculum Tiers
  const [unlockedTiers, setUnlockedTiers] = useState(() => {
    return storageService.getUserData().unlockedTiers;
  });

  // Persistent Tier Mastery Percent (0, 25, 50, 75, 100)
  const [tierMasteryPercent, setTierMasteryPercent] = useState(() => {
    return storageService.getUserData().tierMasteryPercent || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  });

  // Persistent Tier Best Completion Times in Seconds
  const [tierBestTimes, setTierBestTimes] = useState(() => {
    return storageService.getUserData().tierBestTimes || {};
  });

  const [isNewSpeedRecord, setIsNewSpeedRecord] = useState(false);

  // Persistent Parent PIN (Default 1234)
  const [parentPin, setParentPin] = useState(() => {
    return storageService.getParentSettings().pin;
  });

  // Persistent Sprint History (last 3 sprints)
  const [sprintHistory, setSprintHistory] = useState(() => {
    return storageService.getUserData().sprintHistory;
  });

  // Persistent Re-queued Practice Problems
  const [practiceQueue, setPracticeQueue] = useState(() => {
    return storageService.getUserData().practiceQueue;
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
    return storageService.getUserData().totalProblemsSolved || 0;
  });

  const [cumulativeCorrectStreak, setCumulativeCorrectStreak] = useState(() => {
    return storageService.getUserData().cumulativeCorrectStreak || 0;
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    return storageService.getUserData().personalRecords || {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    };
  });

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

    const uData = storageService.getUserData();
    const currentRating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
    
    let extraSparks = 0;
    let newBaseline = uData.baselineRating;
    let newlyCalibrated = uData.isCalibrated || false;

    if (nextTotal >= 15 && !uData.isCalibrated) {
      newBaseline = currentRating;
      newlyCalibrated = true;
      extraSparks = 30;
      setSparks((prev) => prev + extraSparks);
      soundFx.playVictory();
    }

    storageService.saveUserData({
      totalProblemsSolved: nextTotal,
      cumulativeCorrectStreak: nextStreak,
      personalRecords: nextRecords,
      ...(extraSparks > 0 ? { sparks: (sparks || 0) + extraSparks } : {}),
      ...(newlyCalibrated ? { baselineRating: newBaseline, isCalibrated: true } : {})
    });
  };

  // Persistent Consumable Power-Ups Inventory
  const [consumables, setConsumables] = useState(() => {
    const saved = storageService.getUserData().consumables;
    return {
      shieldCount: saved?.shieldCount ?? 1,
      streakSaverCount: saved?.streakSaverCount ?? 0,
      doubleSparksPotionCount: saved?.doubleSparksPotionCount ?? saved?.doubleCoinPotionCount ?? 0,
      hintScrollCount: saved?.hintScrollCount ?? 2
    };
  });

  const [durationInSeconds, setDurationInSeconds] = useState(0);

  const [preferences, setPreferences] = useState(() => {
    return storageService.getUserData().preferences || { hideSprintTimer: false };
  });

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    storageService.saveUserData({ preferences: newPrefs });
  };

  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  useEffect(() => {
    setNotifPrefs(getNotificationPrefs());
  }, [showParentDashboard]);

  // Main Sprint Live Elapsed Timer Loop
  useEffect(() => {
    if (appState !== 'sprint' || showQuitModal) return;

    const interval = setInterval(() => {
      setDurationInSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [appState, showQuitModal]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [isShieldProtected, setIsShieldProtected] = useState(false);
  const [isDoubleSparksActive, setIsDoubleSparksActive] = useState(false);

  const handleBuyConsumable = (item) => {
    if (sparks < item.cost) return;

    const newSparks = sparks - item.cost;
    let nextShieldCount = consumables.shieldCount || 0;
    let nextStreakSaverCount = consumables.streakSaverCount || 0;
    let nextPotionCount = consumables.doubleSparksPotionCount || consumables.doubleCoinPotionCount || 0;
    let nextHintScrollCount = consumables.hintScrollCount || 0;

    if (item.id === 'kibo_shield') {
      nextShieldCount += 1;
    } else if (item.id === 'streak_saver') {
      nextStreakSaverCount += 1;
    } else if (item.id === 'double_sparks_potion' || item.id === 'double_coin_potion') {
      nextPotionCount += 1;
    } else if (item.id === 'hint_scroll') {
      nextHintScrollCount += 1;
    }

    const nextConsumables = {
      shieldCount: nextShieldCount,
      streakSaverCount: nextStreakSaverCount,
      doubleSparksPotionCount: nextPotionCount,
      doubleCoinPotionCount: nextPotionCount,
      hintScrollCount: nextHintScrollCount
    };

    setSparks(newSparks);
    setConsumables(nextConsumables);

    const activeData = storageService.getUserData();
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

    const refreshedUserData = storageService.getUserData();
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
    }
  };

  // Schedule-Aware Streak Validation on App Startup
  useEffect(() => {
    const lastDateStr = localStorage.getItem('kibo_math_last_date');
    const savedStreak = parseInt(localStorage.getItem('kibo_math_streak') || '0', 10);
    const savedShields = parseInt(localStorage.getItem('kibo_math_shields') || '1', 10);
    const savedDays = JSON.parse(localStorage.getItem('kibo_math_practice_days') || '[1,2,3,4,5]');

    if (!lastDateStr || savedStreak === 0) return;

    const todayStr = getTodayStr();
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

    if (missedActiveDays >= 1) {
      const currentStreakSaverCount = consumables.streakSaverCount || 0;
      if (currentStreakSaverCount > 0 || savedShields > 0) {
        if (currentStreakSaverCount > 0) {
          const nextStreakSavers = Math.max(0, currentStreakSaverCount - 1);
          const nextConsumables = { ...consumables, streakSaverCount: nextStreakSavers };
          setConsumables(nextConsumables);
          storageService.saveUserData({ consumables: nextConsumables });
        } else {
          const newShields = Math.max(0, savedShields - 1);
          setStreakShields(newShields);
          localStorage.setItem('kibo_math_shields', newShields.toString());
        }
        setShowStreakSavedModal(true);
      } else {
        setStreak(0);
        localStorage.setItem('kibo_math_streak', '0');
      }
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

  // Sprint State
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [results, setResults] = useState([]);
  const [mascotMood, setMascotMood] = useState('happy');
  const [isShaking, setIsShaking] = useState(false);
  const [earnedSparksInfo, setEarnedSparksInfo] = useState({
    base: 0,
    accuracyBonus: 0,
    speedBonus: 0,
    multiplier: 1.0,
    total: 0
  });

  const problemStartTimeRef = useRef(performance.now());
  const pauseStartTimeRef = useRef(0);

  // Reset inputVal to clean "" whenever problem index changes
  useEffect(() => {
    setInputVal('');
  }, [currentIndex]);

  // Physical Keyboard listener
  useEffect(() => {
    if (appState !== 'sprint' || showQuitModal) return;

    const handleKeyDown = (e) => {
      if ((e.key >= '0' && e.key <= '9') || e.key === '.' || e.key === ':') {
        soundFx.playKeyTap();
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        soundFx.playKeyTap();
        setInputVal((prev) => (prev === null || prev === undefined ? '' : String(prev)).slice(0, -1));
      } else if (e.key === 'Enter') {
        soundFx.playKeyTap();
        handleSubmitAnswer();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        setInputVal('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, currentIndex, inputVal, problems, showQuitModal]);

  const handleSubmitAnswer = () => {
    const currentProblem = problems[currentIndex];
    if (!currentProblem || inputVal === null || inputVal === undefined || String(inputVal).trim() === '') return;
    submitAnswer(String(inputVal).trim(), currentProblem);
  };

  // Controlled Digit Input & Format Mask logic with Smart Auto-Submit
  const handleDigitInput = (digit) => {
    try {
      const currentProblem = problems[currentIndex];
      if (!currentProblem) return;

      const key = String(digit);

      if (key === 'Yes' || key === 'No') {
        setInputVal(key);
        submitAnswer(key, currentProblem);
        return;
      }

      if (key === 'SUBMIT' || key === 'ENTER' || key === 'Enter' || key === 'check') {
        handleSubmitAnswer();
        return;
      }

      if (key === 'BACKSPACE' || key === 'DELETE' || key === '←' || key === 'backspace') {
        setInputVal((prev) => (prev === null || prev === undefined ? '' : String(prev)).slice(0, -1));
        return;
      }

      if (key === 'CLEAR' || key === 'C' || key === 'clear') {
        setInputVal('');
        return;
      }

      const isTimeProblem = Boolean(
        (currentProblem.type && (currentProblem.type.includes('time') || currentProblem.type === 'time_basics')) ||
        (currentProblem.answerString && String(currentProblem.answerString).includes(':')) ||
        currentProblem.operatorSymbol === '⏰' ||
        (currentProblem.displayString && (currentProblem.displayString.toLowerCase().includes('mins') || currentProblem.displayString.toLowerCase().includes('after')))
      );

      const current = inputVal === null || inputVal === undefined ? '' : String(inputVal);

      if (key === '.' && current.includes('.')) return;
      if (key === ':' && current.includes(':')) return;

      // Max input length guard (e.g. "12:59" = 5 chars)
      if (current.length >= 6) return;

      let nextInputStr = current + key;

      // Auto-prepend leading zero when pressing "." on empty or "$" input (e.g. "." -> "0.")
      if (key === '.') {
        if (current === '' || current === '$') {
          nextInputStr = current + '0.';
        }
      }

      // Time Reading Auto-Formatting Mask (e.g. 315 -> 3:15, 1030 -> 10:30)
      if (isTimeProblem) {
        if (key === ':') {
          if (!current.includes(':')) {
            nextInputStr = current + ':';
          }
        } else if (!current.includes(':')) {
          const rawDigits = (current + key).replace(/\D/g, '');
          if (rawDigits.length === 3) {
            nextInputStr = `${rawDigits[0]}:${rawDigits.slice(1)}`;
          } else if (rawDigits.length === 4) {
            nextInputStr = `${rawDigits.slice(0, 2)}:${rawDigits.slice(2)}`;
          }
        }
      }

      // Update state for visual rendering
      setInputVal(nextInputStr);

      // Auto-submit once the correct # of digits for the target answer is entered
      const targetAnsStr = String(currentProblem.answerString || currentProblem.correctAnswer || currentProblem.answer || '').trim();

      if (isTimeProblem) {
        const cleanUserDigits = nextInputStr.replace(/\D/g, '');
        const cleanTargetDigits = targetAnsStr.replace(/\D/g, '');
        const targetDigitCount = cleanTargetDigits.length > 0 ? cleanTargetDigits.length : 3;

        if (cleanUserDigits.length >= targetDigitCount) {
          submitAnswer(nextInputStr, currentProblem);
        }
      } else {
        // Standard Numeric / Multi-Digit / Money Problems (ignoring leading "0." or "." so decimal is not counted as a digit)
        const extractDigits = (str) => {
          let s = String(str || '').replace('$', '').replace('¢', '').trim();
          if (s.startsWith('0.')) s = s.slice(2);
          else if (s.startsWith('.')) s = s.slice(1);
          else s = s.replace('.', '');
          return s.replace(/\D/g, '');
        };

        const userDigits = extractDigits(nextInputStr);
        const targetDigits = extractDigits(targetAnsStr);

        if (userDigits.length > 0 && targetDigits.length > 0 && userDigits.length >= targetDigits.length) {
          submitAnswer(nextInputStr, currentProblem);
        }
      }
    } catch (err) {
      console.error('Error handling digit input:', err);
    }
  };

  const submitAnswer = (userAnswerStr, currentProblem) => {
    try {
      if (!currentProblem || userAnswerStr === '' || userAnswerStr === null || userAnswerStr === undefined) return;

      const now = performance.now();
      const latencyMs = Math.round(Math.max(10, now - problemStartTimeRef.current));
      const responseTimeSeconds = parseFloat((latencyMs / 1000).toFixed(2));

      const rawUser = String(userAnswerStr).trim();
      const rawTarget = String(currentProblem.answerString || currentProblem.correctAnswer || currentProblem.answer || '').trim();

      const normalize = (str) => {
        let clean = String(str || '').trim();
        clean = clean.replace(/^0(\d:)/, '$1');
        if (/^\d{3,4}$/.test(clean)) {
          clean = `${clean.slice(0, -2)}:${clean.slice(-2)}`;
        }
        return clean.replace(/\s*(am|pm)/gi, '').trim();
      };

      const normalizeDec = (str) => {
        if (!str) return '';
        let clean = String(str).replace('$', '').trim();
        if (clean.startsWith('.')) {
          clean = '0' + clean;
        }
        return clean.toLowerCase();
      };

      const isTimeQuestion = Boolean(
        (currentProblem.type && (currentProblem.type.includes('time') || currentProblem.type === 'time_basics')) ||
        rawTarget.includes(':') ||
        currentProblem.operatorSymbol === '⏰' ||
        (currentProblem.displayString && (currentProblem.displayString.toLowerCase().includes('mins') || currentProblem.displayString.toLowerCase().includes('after')))
      );

      let isCorrect = false;
      if (isTimeQuestion) {
        const normUser = normalize(rawUser);
        const normTarget = normalize(rawTarget);
        const digitsUser = rawUser.replace(/\D/g, '');
        const digitsTarget = rawTarget.replace(/\D/g, '');

        isCorrect =
          normUser === normTarget ||
          (digitsUser !== '' && digitsUser === digitsTarget) ||
          rawUser.toLowerCase() === rawTarget.toLowerCase();
      } else {
        const normUserDec = normalizeDec(rawUser);
        const normTargetDec = normalizeDec(rawTarget);

        const isMoneyQuestion = Boolean(
          (currentProblem.type && (currentProblem.type.includes('money') || currentProblem.type === 'change' || currentProblem.type === 'coins')) ||
          rawTarget.includes('.') ||
          currentProblem.operatorSymbol === '🪙' ||
          (currentProblem.displayString && (currentProblem.displayString.includes('$') || currentProblem.displayString.includes('¢') || currentProblem.displayString.includes('Change')))
        );

        const userNum = parseFloat(normUserDec);
        const targetNum = parseFloat(normTargetDec);

        const isMoneyMatch =
          isMoneyQuestion &&
          !isNaN(userNum) &&
          !isNaN(targetNum) &&
          (Math.abs(userNum - targetNum) < 0.001 ||
           Math.abs(userNum * 100 - targetNum) < 0.001 ||
           Math.abs(userNum / 100 - targetNum) < 0.001);

        isCorrect =
          rawUser.toLowerCase() === rawTarget.toLowerCase() ||
          normUserDec === normTargetDec ||
          (userNum === targetNum && !isNaN(userNum)) ||
          isMoneyMatch;
      }

      let effectiveIsCorrect = isCorrect;
      let usedShield = false;

      if (!isCorrect && consumables.shieldCount > 0) {
        usedShield = true;
        effectiveIsCorrect = true;
        const nextShieldCount = consumables.shieldCount - 1;
        const nextConsumables = { ...consumables, shieldCount: nextShieldCount };

        setConsumables(nextConsumables);
        storageService.saveUserData({ consumables: nextConsumables });

        setIsShieldProtected(true);
        setTimeout(() => setIsShieldProtected(false), 900);
      }

      const speedInfo = classifyLatency(rawTarget, latencyMs, effectiveIsCorrect);

      const resultRecord = {
        problem: currentProblem,
        userAnswer: rawUser,
        isCorrect: effectiveIsCorrect,
        usedShield,
        latencyMs,
        responseTimeSeconds,
        speedInfo
      };

      const nextResults = [...results, resultRecord];
      setResults(nextResults);

      if (effectiveIsCorrect) {
        if (usedShield) {
          soundFx.playSparkCollect();
          setMascotMood('excited');
        } else {
          soundFx.playCorrect();
          setMascotMood('correct');
        }
        setConsecutiveProblemMisses(0);
      } else {
        soundFx.playIncorrect();
        setMascotMood('incorrect');
        setIsShaking(true);
        setConsecutiveProblemMisses((prev) => prev + 1);
      }

      setTimeout(() => {
        setMascotMood('happy');
        setIsShaking(false);
        setInputVal('');

        if (currentIndex + 1 < problems.length) {
          setCurrentIndex(currentIndex + 1);
          problemStartTimeRef.current = performance.now();
        } else {
          finishSprint(nextResults);
        }
      }, isCorrect ? 150 : 800);
    } catch (error) {
      console.error('Answer evaluation error caught:', error);
      // Fallback: Clear input and advance to avoid locking screen
      setInputVal('');
      if (currentIndex + 1 < problems.length) {
        setCurrentIndex(currentIndex + 1);
        problemStartTimeRef.current = performance.now();
      } else {
        finishSprint(results);
      }
    }
  };

  const startNewSprint = (asBossMode = false, overrideTier = null) => {
    soundFx.init();
    setIsBossMode(asBossMode);
    setIsPlacementTest(false);
    setIsTestOut(false);
    setPlacementResultInfo(null);
    setShowQuitModal(false);
    setConsecutiveProblemMisses(0);

    const targetTier = overrideTier || tier;
    const count = asBossMode ? 25 : 20;
    const newProbs = generateProblems(count, targetTier, practiceQueue);
    setProblems(newProbs);
    setCurrentIndex(0);
    setInputVal('');
    setResults([]);
    setDurationInSeconds(0);
    setMascotMood('happy');
    setAppState('sprint');
    problemStartTimeRef.current = performance.now();
  };

  const startTestOutSprint = (targetTier) => {
    soundFx.init();
    setIsTestOut(true);
    setTestOutTargetTier(targetTier);
    setIsBossMode(false);
    setIsPlacementTest(false);
    setShowQuitModal(false);
    setConsecutiveProblemMisses(0);

    const testOutProbs = generateProblems(10, targetTier, []);
    setProblems(testOutProbs);
    setCurrentIndex(0);
    setInputVal('');
    setResults([]);
    setMascotMood('happy');
    setAppState('sprint');
    problemStartTimeRef.current = performance.now();
  };

  const startPlacementDiagnostic = () => {
    soundFx.init();
    setAppState('placement_test');
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
    setAppState('world_map');
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
    setAppState('world_map');
  };

  const finishSprint = (finalResults) => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    const lastDate = localStorage.getItem('kibo_math_last_date');

    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const accuracyPct = Math.round((correctCount / finalResults.length) * 100);
    const totalLatencyMs = finalResults.reduce((acc, r) => acc + r.latencyMs, 0);
    const avgLatencySec = parseFloat((totalLatencyMs / (finalResults.length * 1000)).toFixed(2));

    if (isTestOut && testOutTargetTier) {
      const passedTestOut = accuracyPct >= 90;

      if (passedTestOut) {
        const nextUnlockedTier = Math.min(8, testOutTargetTier + 1);
        const newUnlocked = Array.from(new Set([...unlockedTiers, testOutTargetTier, nextUnlockedTier]));
        for (let i = 1; i <= testOutTargetTier; i++) {
          if (!newUnlocked.includes(i)) newUnlocked.push(i);
        }

        const updatedSparks = sparks + 30;
        setTier(nextUnlockedTier);
        setUnlockedTiers(newUnlocked.sort((a, b) => a - b));
        setSparks(updatedSparks);

        localStorage.setItem('kibo_math_tier', nextUnlockedTier.toString());
        localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(newUnlocked));
        localStorage.setItem('kibo_math_sparks', updatedSparks.toString());

        soundFx.playVictory();
        setMascotMood('celebrate');
        setShowTestOutPassModal(true);
      } else {
        soundFx.playIncorrect();
        setMascotMood('happy');
        setShowTestOutFailModal(true);
      }
      return;
    }

    let newStreak = streak;
    if (lastDate === today) {
      newStreak = Math.max(1, streak);
    } else if (lastDate === yesterday) {
      newStreak = streak + 1;
    } else {
      newStreak = 1;
    }

    setStreak(newStreak);
    localStorage.setItem('kibo_math_streak', newStreak.toString());
    localStorage.setItem('kibo_math_last_date', today);

    const baseSparks = isBossMode ? 20 : 10;
    const accuracyBonusSparks = accuracyPct === 100 ? 10 : 0;
    const speedBonusSparks = avgLatencySec < 2.0 ? 5 : 0;
    const subtotalSparks = baseSparks + accuracyBonusSparks + speedBonusSparks;

    const hasStreakMultiplier = newStreak >= 5;
    let totalEarned = hasStreakMultiplier ? Math.floor(subtotalSparks * 1.5) : subtotalSparks;

    const potionMultiplier = isDoubleCoinActive ? 2 : 1;
    totalEarned = totalEarned * potionMultiplier;

    const newSparkBalance = sparks + totalEarned;
    setSparks(newSparkBalance);
    localStorage.setItem('kibo_math_sparks', newSparkBalance.toString());
    setEarnedSparksInfo({
      base: baseSparks,
      accuracyBonus: accuracyBonusSparks,
      speedBonus: speedBonusSparks,
      multiplier: hasStreakMultiplier ? 1.5 : 1.0,
      potionMultiplier,
      isDoubleCoinActive,
      total: totalEarned
    });

    setIsDoubleCoinActive(false);

    let updatedQueue = [...practiceQueue];
    finalResults.forEach((r) => {
      const eqKey = r.problem.displayString || `${r.problem.num1}${r.problem.operatorSymbol}${r.problem.num2}`;
      if (!r.isCorrect || r.speedInfo.category === 'practice') {
        if (!updatedQueue.some((p) => (p.displayString || `${p.num1}${p.operatorSymbol}${p.num2}`) === eqKey)) {
          updatedQueue.push({
            num1: r.problem.num1,
            num2: r.problem.num2,
            operatorSymbol: r.problem.operatorSymbol,
            displayString: r.problem.displayString,
            type: r.problem.type,
            answer: r.problem.answer,
            reason: !r.isCorrect ? 'ERROR' : 'LATENCY',
            latencyMs: r.latencyMs,
            tier: tier,
            timestamp: Date.now()
          });
        }
      } else {
        updatedQueue = updatedQueue.filter((p) => (p.displayString || `${p.num1}${p.operatorSymbol}${p.num2}`) !== eqKey);
      }
    });

    setPracticeQueue(updatedQueue);
    localStorage.setItem('kibo_math_practice_queue', JSON.stringify(updatedQueue));

    const newSprintRecord = { accuracyPct, avgLatencySec, date: today };
    const updatedHistory = [newSprintRecord, ...sprintHistory].slice(0, 3);
    setSprintHistory(updatedHistory);
    localStorage.setItem('kibo_math_sprint_history', JSON.stringify(updatedHistory));

    // 4-Segment 25% Step Tier Mastery & Auto-Unlock Calculation
    const activeTier = tier;
    const currentPercent = tierMasteryPercent[activeTier] || 0;
    let newMasteryPercent = currentPercent;

    if (accuracyPct === 100) {
      newMasteryPercent = 100; // Flawless Fast-Track!
    } else if (accuracyPct >= 80) {
      newMasteryPercent = Math.min(100, currentPercent + 25);
    }

    const updatedMastery = { ...tierMasteryPercent, [activeTier]: newMasteryPercent };
    setTierMasteryPercent(updatedMastery);

    let updatedUnlocked = unlockedTiers;
    if (newMasteryPercent === 100 && activeTier < 8) {
      const nextTier = activeTier + 1;
      updatedUnlocked = Array.from(new Set([...unlockedTiers, nextTier]));
      setUnlockedTiers(updatedUnlocked);
    }

    // Speed Record Evaluation (Strictly compare against saved best completion time in seconds)
    const durationInSeconds = totalLatencyMs > 1000 ? totalLatencyMs / 1000 : totalLatencyMs;
    const previousBestSeconds = tierBestTimes[activeTier] ?? null;
    const isNewRecord =
      accuracyPct >= 80 &&
      (previousBestSeconds === null || durationInSeconds < previousBestSeconds);

    let updatedBestTimes = tierBestTimes;
    if (isNewRecord) {
      updatedBestTimes = { ...tierBestTimes, [activeTier]: durationInSeconds };
      setTierBestTimes(updatedBestTimes);
    }
    setIsNewSpeedRecord(isNewRecord);

    const activeUserData = storageService.getUserData();
    const newCompletedClimbs = (activeUserData.completedClimbsCount || 0) + 1;
    const isPerfectRun = accuracyPct === 100;
    const newPerfectClimbsCount = isPerfectRun ? (activeUserData.perfectClimbsCount || 0) + 1 : (activeUserData.perfectClimbsCount || 0);
    const newConsecutivePerfect = isPerfectRun ? (activeUserData.consecutivePerfectClimbsCount || 0) + 1 : 0;
    const currentCorrectStreak = activeUserData.cumulativeCorrectStreak || 0;
    const newCumulativeCorrectStreak = Math.max(currentCorrectStreak, currentUserState?.cumulativeCorrectStreak || 0);

    storageService.saveUserData({
      streak: newStreak,
      tierMasteryPercent: updatedMastery,
      unlockedTiers: updatedUnlocked,
      tierBestTimes: updatedBestTimes,
      completedClimbsCount: newCompletedClimbs,
      perfectClimbsCount: newPerfectClimbsCount,
      consecutivePerfectClimbsCount: newConsecutivePerfect
    });

    // Per-profile check for Save Progress Across All Devices modal
    const refreshedUserData = storageService.getUserData();

    checkAndPromptLinkAccount(
      { completedClimbs: newCompletedClimbs, streak: newStreak },
      setLinkModalMilestone,
      setShowAccountLinkModal
    );

    // Badge Evaluation & Unlock Persistence
    const activeTierConfig = CURRICULUM_TIERS.find((t) => t.tier === activeTier) || CURRICULUM_TIERS[0];
    const starsEarned = calculateStars(accuracyPct, durationInSeconds, activeTierConfig, problems.length);
    const sprintResultData = {
      accuracyPct,
      avgLatencySec,
      totalTimeSec: durationInSeconds,
      totalQuestions: problems.length,
      starsEarned,
      tier: activeTier,
      tierConfig: activeTierConfig
    };

    const currentUserState = {
      streak: newStreak,
      tier: activeTier,
      sparks: newSparkBalance,
      purchasedItemsCount: refreshedUserData.shopPurchasesCount || 0,
      purchasedRarities: refreshedUserData.purchasedRarities || [],
      hasBoughtGemsWithRealMoney: refreshedUserData.hasBoughtGemsWithRealMoney || false,
      hasSetPersonalRecord: isNewRecord,
      isNewSpeedRecord: isNewRecord,
      perfectClimbsCount: newPerfectClimbsCount,
      consecutivePerfectClimbsCount: newConsecutivePerfect,
      cumulativeCorrectStreak: newCumulativeCorrectStreak,
      unlockedBadges
    };

    const badgeEvalRes = evaluateBadges(currentUserState, sprintResultData);
    const newBadges = badgeEvalRes.newlyUnlocked || [];
    if (newBadges.length > 0) {
      setUnlockedBadges(badgeEvalRes.updatedUnlocked);
      setNewlyUnlockedBadges(newBadges);
    } else {
      setNewlyUnlockedBadges([]);
    }

    let triggerLevelUp = false;
    let reasonText = '';

    if (tier < 8) {
      if (isBossMode && accuracyPct >= 96 && avgLatencySec <= 2.0) {
        triggerLevelUp = true;
        reasonText = '⚡ Boss Challenge Passed! You achieved ≥96% accuracy and ≤2.0s average speed on the 25-problem test out!';
      } else if (updatedHistory.length >= 3) {
        const avgHistLatency = updatedHistory.reduce((acc, s) => acc + s.avgLatencySec, 0) / 3;
        const allAccuracyPass = updatedHistory.every((s) => s.accuracyPct >= 90);

        if (allAccuracyPass && avgHistLatency <= 2.5) {
          triggerLevelUp = true;
          reasonText = `🎯 3-Sprint Consistency Mastered! You maintained ≥90% accuracy with an average speed of ${avgHistLatency.toFixed(2)}s across your last 3 sprints!`;
        }
      }
    }

    soundFx.playVictory();
    setMascotMood('celebrate');
    setShowSprintResultsModal(true);

    if (triggerLevelUp) {
      setLevelUpReason(reasonText);
      setTimeout(() => setShowLevelUpModal(true), 600);
    }
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

  const toggleAudio = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleBuyItem = (item) => {
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

    const activeData = storageService.getUserData();
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
    const refreshedUserData = storageService.getUserData();

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

  const handleToggleEquip = (itemId) => {
    const targetItem = getItemById(itemId);
    let updatedEquipped;

    if (equippedItems.includes(itemId)) {
      updatedEquipped = equippedItems.filter((id) => id !== itemId);
    } else {
      const currentSlotCat = targetItem ? targetItem.category : null;
      const filteredSameSlot = equippedItems.filter((id) => {
        const item = getItemById(id);
        return item ? item.category !== currentSlotCat : true;
      });
      updatedEquipped = [...filteredSameSlot, itemId];
    }

    setEquippedItems(updatedEquipped);
    storageService.saveShopState(updatedEquipped, unlockedItems);
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

  const calculateStats = () => {
    if (results.length === 0) {
      return {
        totalTimeSec: '0',
        accuracyPct: 0,
        avgVelocitySec: '0',
        superFastCount: 0,
        fluentCount: 0,
        practiceCount: 0,
        total: 0
      };
    }

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalLatencyMs = results.reduce((acc, r) => acc + r.latencyMs, 0);

    const totalTimeSec = (totalLatencyMs / 1000).toFixed(1);
    const accuracyPct = Math.round((correctCount / results.length) * 100);
    const avgVelocitySec = (totalLatencyMs / (results.length * 1000)).toFixed(2);

    const instantRecall = results.filter((p) => {
      const sec = p.responseTimeSeconds !== undefined
        ? (p.responseTimeSeconds > 100 ? p.responseTimeSeconds / 1000 : p.responseTimeSeconds)
        : (p.latencyMs > 100 ? p.latencyMs / 1000 : p.latencyMs);
      return p.isCorrect && sec < 3.5;
    });

    const workedOut = results.filter((p) => {
      const sec = p.responseTimeSeconds !== undefined
        ? (p.responseTimeSeconds > 100 ? p.responseTimeSeconds / 1000 : p.responseTimeSeconds)
        : (p.latencyMs > 100 ? p.latencyMs / 1000 : p.latencyMs);
      return p.isCorrect && sec >= 3.5;
    });

    const focusArea = results.filter((p) => !p.isCorrect);

    const superFastCount = instantRecall.length;
    const fluentCount = workedOut.length;
    const practiceCount = focusArea.length;

    const starsEarned = calculateStars(accuracyPct, totalTimeSec);

    return {
      totalTimeSec,
      accuracyPct,
      avgVelocitySec,
      superFastCount,
      fluentCount,
      practiceCount,
      correctCount,
      starsEarned,
      total: results.length
    };
  };

  const stats = calculateStats();

  const getTierMeta = (t) => {
    return CURRICULUM_TIERS.find((item) => item.tier === t) || CURRICULUM_TIERS[0];
  };

  const currentTierMeta = getTierMeta(tier);

  const isAppPaused = showLevelUpModal || showSpeedInfoModal || showPinGateModal || showParentDashboard || showQuitModal || showMockCheckoutModal || showStreakSavedModal || showPlacementRevealModal || showSprintResultsModal || showBadgesModal || showAccountLinkModal || showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher || showTestOutPassModal || showTestOutFailModal;

  const [liveCompetenceRating, setLiveCompetenceRating] = useState(() => {
    const uData = storageService.getUserData();
    return uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
  });

  return (
    <div className="app-viewport-root p-2 sm:p-4 safe-pt safe-pb max-w-lg mx-auto relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50">
      {/* Sticky Top HUD Header Bar */}
      {appState !== 'sprint' && (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 px-2 py-1.5 flex items-center justify-between shadow-sm rounded-2xl mb-2 shrink-0 gap-1 overflow-visible">
          {/* Brand Logo & Stats */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-visible">
            <button
              onClick={() => {
                soundFx.playKeyTap();
                setAppState('adaptive_session');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 font-black text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border border-amber-300"
              title="Kibo Climb Main Session"
            >
              <img
                src="/kibo_mascot.svg"
                alt="Kibo Mascot"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-2xs"
              />
              <span className="tracking-tight font-black hidden xs:inline">Kibo</span>
            </button>

            {/* Streak Badge */}
            <div
              className="flex items-center gap-0.5 bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs shrink-0 cursor-pointer"
              title={(consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0 ? "Daily Streak & Shield Active! 🛡️" : `Daily Streak: ${streak} days`}
              onClick={() => {
                soundFx.playKeyTap();
                setShowBadgesModal(true);
              }}
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{streak}d</span>
              {((consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0) && (
                <span className="text-[10px] ml-0.5 animate-pulse" title="Kibo Shield Active">🛡️</span>
              )}
            </div>

            {/* Sparks Counter */}
            <div className="flex items-center gap-0.5 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[11px] font-black shadow-2xs relative shrink-0 overflow-visible">
              <RollingNumberTicker
                value={sparks}
                icon={<Zap className="w-3 h-3 text-amber-500 fill-amber-400 stroke-[2.5]" />}
              />
            </div>

            {/* Always-Visible Competence Rank Badge */}
            {(() => {
              const rankTitle = getCompetenceRankTier(liveCompetenceRating);
              return (
                <button
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowBadgesModal(true);
                  }}
                  className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-black shadow-2xs transition-all active:scale-95 shrink-0 relative overflow-visible"
                  title={`Competence Rank: ${liveCompetenceRating} pts (${rankTitle})`}
                >
                  <RollingNumberTicker
                    value={liveCompetenceRating}
                    showDeltaBadge={true}
                    icon={<Trophy className="w-3 h-3 text-purple-600 stroke-[2.5]" />}
                  />
                </button>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleOpenWorkshop()}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-kibo-orange hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
              aria-label="Open Kibo's Corner"
              title="Open Kibo's Corner 🐾"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span className="hidden sm:inline">Kibo's Corner</span>
            </button>

            <button
              onClick={() => {
                soundFx.playKeyTap();
                setShowBadgesModal(true);
              }}
              className="px-2 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl text-amber-900 font-extrabold text-xs active:scale-95 transition-all shadow-2xs flex items-center gap-1 shrink-0"
              title="View Trophies & Records"
            >
              <Award className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
              <span className="text-[10px]">{unlockedBadges.length}</span>
            </button>

            {storageService.getAllProfiles().length > 1 && (
              <button
                onClick={() => {
                  soundFx.playKeyTap();
                  setShowManualProfileSwitcher(true);
                }}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 shrink-0"
                title="Switch Profile"
              >
                <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            )}
            <button
              onClick={() => setShowPinGateModal(true)}
              className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-700 active:scale-95 transition-all shadow-2xs shrink-0"
              title="Parent Zone (PIN Protected)"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              onClick={toggleAudio}
              className="p-1.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 active:scale-95 transition-all shadow-2xs shrink-0"
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-kibo-teal" />}
            </button>
          </div>
        </header>
      )}

      {/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {(appState === 'adaptive_session' || appState === 'world_map' || appState === 'launch' || !['sprint', 'victory', 'skill_map', 'placement_test'].includes(appState)) && (
        <AdaptiveSessionView
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
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => setUnlockedBadges(newList)}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const updated = sparks + earned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {/* PROFILE SELECTOR — shown on every load when 2+ profiles exist */}
      {showProfileSelector && (
        <ProfileSelectorScreen
          onSelectProfile={(profile) => {
            syncAppStateWithStorage();
            setShowProfileSelector(false);
          }}
        />
      )}


      {/* MANUAL PROFILE SELECTOR */}
      {showManualProfileSwitcher && (
        <ProfileSelectorScreen
          onSelectProfile={(profile) => {
            syncAppStateWithStorage();
            setShowManualProfileSwitcher(false);
          }}
          onClose={() => setShowManualProfileSwitcher(false)}
        />
      )}

      {/* FIRST LAUNCH ONBOARDING MODAL */}
      <FirstLaunchOnboardingModal
        isOpen={showFirstLaunchOnboardingModal}
        equippedItems={equippedItems}
        hasVisitedParentZone={hasVisitedParentZone}
        onUsernameSet={(username) => {
          // Username is already persisted by the modal via storageService.saveUsername().
          // Sync the active profile's display name in the parent dashboard list as well.
          storageService.updateProfile(storageService.getActiveProfileId(), { name: username });
          syncAppStateWithStorage();
        }}
        onOpenParentZone={() => {
          syncAppStateWithStorage();
          setShowFirstLaunchOnboardingModal(false);
          localStorage.setItem('kibo_math_has_onboarded', 'true');
          setShowPinGateModal(true);
        }}
        onStartAdaptiveClimb={() => {
          syncAppStateWithStorage();
          setShowFirstLaunchOnboardingModal(false);
          setAppState('adaptive_session');
        }}
      />



      {/* SKILL MAP ROADMAP SCREEN */}
      {appState === 'skill_map' && (
        <SkillMapScreen
          currentTier={tier}
          unlockedTiers={unlockedTiers}
          onSelectTier={(t) => handleSelectTierFromMap(t)}
          onStartPlacementTest={startPlacementDiagnostic}
          onBackToHome={() => setAppState('world_map')}
        />
      )}

      {/* STATE 1: LAUNCH SCREEN (Default Child Play Dashboard) */}
      {appState === 'launch' && (
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-3.5 py-2 text-center animate-pop">
          {/* Top Badges Row */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Daily Streak Card */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border-2 border-amber-200 rounded-full shadow-sm">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span className="font-extrabold text-amber-900 text-sm sm:text-base">
                {pluralize(streak, 'Day')} Streak!
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-black text-slate-700 flex items-center gap-1" title="Kibo Shields Remaining">
                🛡️ {streakShields}/2
              </span>
            </div>

            {/* Current Tier Badge */}
            <button
              onClick={() => setAppState('world_map')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-full shadow-sm active:scale-95 transition-all"
            >
              <Layers className="w-5 h-5 text-purple-600 stroke-[2.5]" />
              <span className="font-extrabold text-purple-900 text-sm sm:text-base">
                Tier {tier}: {currentTierMeta.title}
              </span>
            </button>
          </div>

          {/* Mascot Header */}
          <div className="my-1 cursor-pointer" onClick={() => handleOpenWorkshop()} title="Click to customize Kibo!">
            <Mascot mood="happy" equipped={equippedItems} className="w-32 h-32 sm:w-36 sm:h-36" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Ready for your Math Climb?
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-purple-700 font-extrabold text-xs bg-purple-50 px-3 py-1 rounded-xl border border-purple-200 flex items-center gap-1">
                {currentTierMeta.icon} {currentTierMeta.subtitle}
              </span>
            </div>
            {practiceQueue.length > 0 && (
              <p className="text-amber-600 font-bold text-xs">
                🎯 {pluralize(practiceQueue.length, 'practice problem')} queued for recall!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs space-y-2 mt-1">
            {((consumables.doubleSparksPotionCount > 0 || consumables.doubleCoinPotionCount > 0) || isDoubleSparksActive) && (
              <button
                type="button"
                onClick={handleToggleDoubleSparksPotion}
                className={`w-full py-2.5 px-3 rounded-2xl border-2 font-extrabold text-xs flex items-center justify-between transition-all active:scale-95 ${
                  isDoubleSparksActive
                    ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                    : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🧪</span>
                  <span>Double Sparks Potion ({consumables.doubleSparksPotionCount ?? consumables.doubleCoinPotionCount ?? 0} owned)</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isDoubleSparksActive ? 'bg-amber-400 text-amber-950 animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDoubleSparksActive ? 'ACTIVE 2X 🧪' : 'ACTIVATE'}
                </span>
              </button>
            )}

            <button
              onClick={() => startNewSprint(false)}
              className="btn-3d-orange w-full py-3.5 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group shadow-bouncy-orange"
            >
              <Play className="w-6 h-6 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
              Start Kibo Climb
            </button>

            <button
              onClick={() => setAppState('world_map')}
              className="btn-3d-purple w-full py-3 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              World Map Trail 🗺️
            </button>

            {tier < 8 && (
              <button
                onClick={() => startNewSprint(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                ⚡ Boss Challenge Test Out (25 Qs)
              </button>
            )}
          </div>
        </main>
      )}

      {/* STATE 2: ACTIVE SPRINT VIEW */}
      {appState === 'sprint' && problems.length > 0 && (
        <main className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-pop relative">
          {/* Top Progress Bar */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-1">
              <div className="flex items-center gap-2 flex-wrap">
                {!preferences?.hideSprintTimer ? (
                  <div className="text-base font-extrabold tracking-tight text-slate-800 flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{formatTime(durationInSeconds)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] uppercase font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-300">
                    ⏱️ Zen Mode
                  </span>
                )}
                <span>Problem {currentIndex + 1} of {problems.length}</span>
                {isTestOut && (
                  <span className="text-[10px] uppercase font-black bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-300">
                    ⚡ Tier {testOutTargetTier} Test-Out Blitz
                  </span>
                )}
                {isBossMode && (
                  <span className="text-[10px] uppercase font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-300">
                    ⚡ Boss Challenge
                  </span>
                )}
                {problems[currentIndex].isPracticeItem && !isBossMode && !isTestOut && (
                  <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                    Practice Recall
                  </span>
                )}
              </div>

              {/* Progress % + Quit Sprint Button */}
              <div className="flex items-center gap-2">
                <span className="text-kibo-teal font-extrabold">{Math.round(((currentIndex + 1) / problems.length) * 100)}%</span>
                <button
                  onClick={handleOpenQuitModal}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-extrabold text-xs rounded-xl border border-slate-200 transition-all active:scale-95"
                  title="Quit Sprint"
                  aria-label="Quit Sprint"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Quit</span>
                </button>
              </div>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-300 shadow-sm ${
                  isTestOut
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-500'
                    : isBossMode
                    ? 'bg-gradient-to-r from-purple-500 to-kibo-orange'
                    : 'bg-gradient-to-r from-kibo-orange to-kibo-teal'
                }`}
                style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Power-Ups HUD Controls */}
          <div className="flex items-center justify-between w-full max-w-sm px-1 my-1 flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-black text-amber-950 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <span>Shield: {consumables.shieldCount}</span>
            </div>

            {isDoubleCoinActive && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-300 border border-amber-400 px-2.5 py-1 rounded-full text-xs font-black text-amber-950 shadow-xs animate-pulse">
                <span>🧪 2x Active!</span>
              </span>
            )}
          </div>

          {/* Mascot & Math Display Area */}
          <div className="w-full flex flex-col items-center my-auto">
            <Mascot mood={mascotMood} equipped={equippedItems} className="w-20 h-20 sm:w-24 sm:h-24 mb-2" />

            {/* Problem Card */}
            <div
              className={`w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 sm:p-7 text-center shadow-card-3d transition-transform ${
                isShaking
                  ? 'animate-shake border-rose-400 bg-rose-50'
                  : isShieldProtected
                  ? 'border-amber-400 bg-amber-50 ring-4 ring-amber-200'
                  : ''
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-800 flex items-center justify-center gap-3 flex-wrap">
                {(() => {
                  const prob = problems[currentIndex];
                  const rawDisplay = prob?.displayString || `${prob?.num1} ${prob?.operatorSymbol} ${prob?.num2}`;
                  const cleanDisplay = rawDisplay.replace(/\s*=\s*\?\s*¢?/gi, '').replace(/\s*=\s*\?\s*cents?/gi, '').trim();
                  const hasQuestionSuffix = cleanDisplay.endsWith('?') || cleanDisplay.includes('Change?') || cleanDisplay.includes('Leftover?') || cleanDisplay.includes('End time?');

                  return (
                    <>
                      <span>{cleanDisplay}</span>
                      {!hasQuestionSuffix && <span className="text-slate-400 font-bold">=</span>}
                    </>
                  );
                })()}

                {/* Input Box Display */}
                <span className={`inline-block min-w-[70px] px-3 py-1 rounded-xl text-3xl sm:text-4xl font-black shadow-inner transition-all ${
                  isShieldProtected
                    ? 'bg-amber-200 border-4 border-amber-400 text-amber-950 scale-105 shadow-amber-300/50'
                    : 'bg-amber-50 border-3 border-amber-300 text-kibo-teal'
                }`}>
                  {inputVal ? inputVal : <span className="text-slate-300 font-normal animate-pulse">?</span>}
                </span>
              </div>

              {isShieldProtected && (
                <div className="mt-2 text-xs font-black text-amber-950 bg-amber-200 py-1.5 px-3 rounded-full border border-amber-400 animate-pop inline-block shadow-sm">
                  🛡️ Kibo Shield Absorbed Your Mistake! Streak Saved!
                </div>
              )}

              {isShaking && (
                <div className="mt-2 text-xs font-black text-rose-700 bg-rose-100 py-1.5 px-3 rounded-full border border-rose-300 animate-pop inline-block">
                  Correct Answer: {problems[currentIndex].answerString}
                </div>
              )}
            </div>

            {/* Mid-Sprint Micro-Hint Card (Triggered on >= 2 consecutive misses) */}
            {consecutiveProblemMisses >= 2 && (
              <MicroHintCard problem={problems[currentIndex]} tierLevel={tier} />
            )}
          </div>

          {/* Keypad Input */}
          <Keypad
            onKeyPress={handleDigitInput}
            onDelete={() => setInputVal((prev) => (prev === null || prev === undefined ? '' : String(prev)).slice(0, -1))}
            onClear={() => setInputVal('')}
            onSubmit={handleSubmitAnswer}
            problemType={problems[currentIndex]?.type}
            allowDecimal={problems[currentIndex]?.requiresDecimal || problems[currentIndex]?.type?.includes('money')}
            answerString={problems[currentIndex]?.answerString}
            displayString={problems[currentIndex]?.displayString}
            operatorSymbol={problems[currentIndex]?.operatorSymbol}
          />
        </main>
      )}

      {/* STATE 3: VICTORY SCREEN */}
      {appState === 'victory' && (
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-3 py-2 text-center animate-pop relative z-10">
          <ConfettiCanvas />

          <div className="relative">
            <Mascot mood="celebrate" equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1.5 rounded-full border-2 border-white shadow-lg animate-bounce">
              <Trophy className="w-5 h-5 text-amber-900 fill-amber-300 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {isBossMode ? 'Boss Challenge Complete! ⚡' : 'Climb Complete! 🎉'}
            </h2>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-2.5 rounded-2xl max-w-sm mx-auto space-y-1 shadow-sm">
              <p className="text-amber-900 font-extrabold text-sm flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 fill-amber-500 stroke-[2.5]" />
                Streak: {streak} days | Total Earned: +{earnedSparksInfo.total} Sparks ⚡
              </p>
              <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-2 flex-wrap border-t border-amber-200/60 pt-1">
                <span>Base: +{earnedSparksInfo.base}⚡</span>
                {earnedSparksInfo.accuracyBonus > 0 && <span className="text-emerald-700 font-bold">+10 100% Acc</span>}
                {earnedSparksInfo.speedBonus > 0 && <span className="text-amber-700 font-bold">+5 Lightning</span>}
                {earnedSparksInfo.multiplier > 1 && <span className="text-purple-700 font-black bg-purple-100 px-1.5 rounded">1.5x Streak Boost!🔥</span>}
              </div>
            </div>
          </div>

          {/* Speed Breakdown Container */}
          <div className="w-full max-w-sm bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase font-extrabold text-slate-600 tracking-wider">
                  Speed Breakdown
                </span>
                <button
                  onClick={() => setShowSpeedInfoModal(true)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                  title="How recall latency works"
                >
                  <Info className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Avg: <span className="font-extrabold text-slate-800">{stats.avgVelocitySec}s</span> / Q
              </span>
            </div>

            {/* Visual Segmented Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
              {stats.total > 0 && (
                <>
                  <div
                    style={{ width: `${(stats.superFastCount / stats.total) * 100}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${(stats.fluentCount / stats.total) * 100}%` }}
                    className="bg-yellow-400 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${(stats.practiceCount / stats.total) * 100}%` }}
                    className="bg-blue-400 h-full transition-all duration-500"
                  />
                </>
              )}
            </div>

            {/* 3 Stat Band Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2 flex flex-col items-center justify-between text-center min-h-[82px]">
                <div className="flex items-center gap-1">
                  <span className="text-xs">⚡</span>
                  <span className={`text-lg font-black ${stats.superFastCount === 0 ? 'text-slate-400' : 'text-amber-900'}`}>
                    {stats.superFastCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-amber-900 leading-tight block">Instant Recall</span>
                  <span className="text-[9px] font-bold text-amber-700/80 block mt-0.5">&lt; 1.5s recall</span>
                </div>
              </div>

              <div className="bg-yellow-50/80 border border-yellow-200 rounded-xl p-2 flex flex-col items-center justify-between text-center min-h-[82px]">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🟡</span>
                  <span className={`text-lg font-black ${stats.fluentCount === 0 ? 'text-slate-400' : 'text-yellow-900'}`}>
                    {stats.fluentCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-yellow-900 leading-tight block">Worked It Out</span>
                  <span className="text-[9px] font-bold text-yellow-700/80 block mt-0.5">1.5s – 4.0s</span>
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2 flex flex-col items-center justify-between text-center min-h-[82px] relative overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🔵</span>
                  <span className={`text-lg font-black ${stats.practiceCount === 0 ? 'text-slate-400' : 'text-blue-900'}`}>
                    {stats.practiceCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-blue-900 leading-tight block">Focus Area</span>
                  <span className="text-[9px] font-bold text-blue-700/80 block mt-0.5">&gt; 4.0s (Queued)</span>
                </div>

                {stats.practiceCount === 0 && (
                  <div className="mt-1 px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-[9px] font-extrabold flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" /> Clean Sweep!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem Breakdown List */}
          <div className="w-full max-w-sm bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5 max-h-28 overflow-y-auto space-y-1 text-left shadow-inner">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  {r.isCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                  )}
                  <span>
                    #{i + 1}: {r.problem.displayString || `${r.problem.num1} ${r.problem.operatorSymbol} ${r.problem.num2}`} = {r.problem.answer}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{r.speedInfo.icon}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{(r.latencyMs / 1000).toFixed(2)}s</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-sm space-y-2 mt-1">
            <button
              onClick={() => startNewSprint(false)}
              className="btn-3d-orange w-full py-3 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
            >
              <Play className="w-5 h-5 fill-white stroke-[2.5]" />
              Play Again
            </button>

            <button
              onClick={() => setAppState('world_map')}
              className="btn-3d-purple w-full py-2.5 text-sm rounded-2xl flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" /> Return to World Map 🗺️
            </button>
          </div>
        </main>
      )}



      {/* TEST-OUT PASS CELEBRATION MODAL */}
      {showTestOutPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-purple-400 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <ConfettiCanvas />
            <Mascot mood="celebrate" equipped={equippedItems} className="w-28 h-28 mx-auto" />

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-purple-600 tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-block">
                ⚡ Test-Out Challenge Passed!
              </span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                Tier {testOutTargetTier} Unlocked! 🎉
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                You achieved 100% accuracy and rapid recall speed!
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-center gap-2 text-amber-950 shadow-sm">
              <Zap className="w-6 h-6 text-amber-600 fill-amber-400 stroke-[2.5] animate-pulse" />
              <span className="font-black text-base">+30 Test-Out Bonus Sparks! ⚡</span>
            </div>

            <button
              onClick={() => {
                setShowTestOutPassModal(false);
                setAppState('world_map');
              }}
              className="btn-3d-purple w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              Continue to World Map 🗺️
            </button>
          </div>
        </div>
      )}

      {/* TEST-OUT FAIL ENCOURAGEMENT MODAL */}
      {showTestOutFailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <Mascot mood="happy" equipped={equippedItems} className="w-24 h-24 mx-auto" />

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase text-amber-700 tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                Test-Out Challenge
              </span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Almost there! Practice a bit more to unlock. 💪
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Test-Out requires <strong>100% accuracy</strong> and average recall speed under <strong>2.5s</strong>. Keep practicing on current tiers to level up!
              </p>
            </div>

            <button
              onClick={() => {
                setShowTestOutFailModal(false);
                setAppState('world_map');
              }}
              className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              Back to World Map 🗺️
            </button>
          </div>
        </div>
      )}



      {/* STREAK SAVED MODAL */}
      <StreakSavedModal
        isOpen={showStreakSavedModal}
        onClose={() => setShowStreakSavedModal(false)}
        streak={streak}
        remainingShields={streakShields}
      />

      {/* QUIT SPRINT CONFIRMATION MODAL */}
      <QuitSprintModal
        isOpen={showQuitModal}
        isTestOut={isTestOut}
        onKeepPlaying={handleKeepPlaying}
        onQuitToHome={handleQuitToHome}
        onQuitToMap={handleQuitToMap}
      />

      {/* PARENT PIN GATE MODAL */}
      <PinGateModal
        isOpen={showPinGateModal}
        onClose={() => {
          setShowPinGateModal(false);
          setPendingSparksPurchase(null);
        }}
        currentPin={parentPin}
        onUnlockSuccess={() => {
          setShowPinGateModal(false);
          if (pendingSparksPurchase) {
            if (authService.getAuthState().isAnonymous) {
              setLinkModalMilestone('Real-Money Purchase Backup');
              setShowAccountLinkModal(true);
            } else {
              setShowMockCheckoutModal(true);
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
        isOpen={showParentDashboard}
        onClose={() => setShowParentDashboard(false)}
        currentPin={parentPin}
        onUpdatePin={handleUpdatePin}
        tier={tier}
        onSetTier={handleSetTierManual}
        streak={streak}
        sparks={sparks}
        practiceQueueCount={practiceQueue.length}
        practiceQueue={practiceQueue}
        sprintHistory={sprintHistory}
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
        }}
      />

      {/* TRAIL BADGES SHOWCASE MODAL */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        unlockedBadges={unlockedBadges}
        personalRecords={personalRecords}
        userState={(() => {
          const uData = storageService.getUserData();
          const rating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
          return {
            competenceRank: rating,
            adaptiveCompetenceRating: rating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak
          };
        })()}
      />

      {/* PARENT SPEED INFO MODAL (ℹ️) */}
      {showSpeedInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 text-left shadow-2xl space-y-3 relative">
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
                <p className="text-blue-800 font-normal">Automatically re-queued into future daily sprints to reinforce memory!</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-purple-400 rounded-3xl p-6 text-center shadow-2xl space-y-4">
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

      {/* SPRINT RESULTS CELEBRATION MODAL */}
      <SprintResultsModal
        isOpen={showSprintResultsModal}
        stats={stats}
        earnedSparksInfo={earnedSparksInfo}
        streak={streak}
        equippedItems={equippedItems}
        isBossMode={isBossMode}
        isNewSpeedRecord={isNewSpeedRecord}
        newlyUnlockedBadges={newlyUnlockedBadges}
        cumulativeCorrectStreak={cumulativeCorrectStreak}
        onStartNextSprint={() => {
          setShowSprintResultsModal(false);
          const nextTier = Math.min(8, tier + 1);
          handleSelectTierFromMap(nextTier);
        }}
        onContinueClimbing={() => {
          setShowSprintResultsModal(false);
          setAppState('world_map');
        }}
        onVisitWorkshop={() => {
          setShowSprintResultsModal(false);
          handleOpenWorkshop('world_map');
        }}
      />

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
        onToggleEquip={handleToggleEquip}
        allowRealMoneyPurchases={notifPrefs.allowRealMoneyPurchases}
        onBuySparksPackage={(pack) => {
          setPendingSparksPurchase(pack);
          setShowPinGateModal(true);
        }}
        onRequestAccountLink={() => {
          setLinkModalMilestone('Shop Rewards');
          setShowAccountLinkModal(true);
        }}
      />

      <MockCheckoutModal
        isOpen={showMockCheckoutModal}
        onClose={() => {
          setShowMockCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
        packageInfo={pendingSparksPurchase}
        onConfirm={(pack) => {
          const newSparks = sparks + pack.sparks;
          setSparks(newSparks);
          storageService.saveUserData({ sparks: newSparks });
          localStorage.setItem('kibo_math_sparks', newSparks.toString());
          soundFx.playSparkCollect();
          setShowMockCheckoutModal(false);
          setPendingSparksPurchase(null);
        }}
      />

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => {
          setShowAccountLinkModal(false);
          if (pendingSparksPurchase) {
            // Require linking for real-money purchases. If they close the modal, cancel the purchase.
            setPendingSparksPurchase(null);
          }
        }}
        triggerMilestone={linkModalMilestone}
        onAccountLinked={(user, newSparks) => {
          if (newSparks !== undefined) {
            setSparks(newSparks);
          }
          setShowAccountLinkModal(false);
          if (pendingSparksPurchase) {
            setShowMockCheckoutModal(true);
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
          const uData = storageService.getUserData();
          const sData = storageService.getShopState();
          setSparks(uData.sparks || 0);
          setUnlockedItems(sData.unlockedItems || ['cap']);
        }}
      />

      {/* Footer with Parent Zone Link */}
      <footer className="w-full text-center text-xs font-bold text-slate-700 py-2.5 px-4 border-t border-slate-200/80 mt-auto flex items-center justify-between">
        <span>{BRAND_CONFIG.appName} by {BRAND_CONFIG.rootBrand} • {BRAND_CONFIG.tagline}</span>
        <button
          onClick={() => setShowPinGateModal(true)}
          className="text-purple-600 hover:text-purple-800 flex items-center gap-1 font-extrabold"
        >
          <Lock className="w-3.5 h-3.5" /> Parent Zone
        </button>
      </footer>
    </div>
  );
}
