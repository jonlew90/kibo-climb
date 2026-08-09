import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Settings, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles, Layers, Swords, Award, Info, X, Lock, ShieldCheck, Compass, MapPin, Users, Mountain, ChevronDown } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import PinGateModal from './components/PinGateModal';
import ParentDashboardModal from './components/ParentDashboardModal';
import StreakSavedModal from './components/StreakSavedModal';
import MicroHintCard from './components/MicroHintCard';
import FirstLaunchOnboardingModal from './components/FirstLaunchOnboardingModal';
import ProfileSelectorScreen from './components/ProfileSelectorScreen';
import BadgesModal from './components/BadgesModal';
import AdaptiveSessionView from './components/AdaptiveSessionView';
import DevControlPanel from './components/DevControlPanel';
import RollingNumberTicker from './components/RollingNumberTicker';
import { checkAndPromptLinkAccount } from './utils/linkPromptLogic';
import { useDevState } from './hooks/useDevState';
import { evaluateBadges } from './utils/badgeManager';
import { BADGES_CATALOG } from './data/badges';
import { generateProblems } from './utils/mathGenerator';
import { CURRICULUM_TIERS, calculateStars } from './utils/curriculum';
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
import SettingsScreen from './components/SettingsScreen';
import { setHapticsEnabled } from './utils/audio';

export default function App() {
  // App State: 'adaptive_session' | 'settings'
  const [appState, setAppState] = useState('adaptive_session');
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
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const subjectSelectorRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (subjectSelectorRef.current && !subjectSelectorRef.current.contains(event.target)) {
        setShowSubjectSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [pendingSparksPurchase, setPendingSparksPurchase] = useState(null);
  const [showMockCheckoutModal, setShowMockCheckoutModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [linkModalMilestone, setLinkModalMilestone] = useState('Milestone');


  const syncAppStateWithStorage = () => {
    const uData = storageService.getUserData();
    const sData = storageService.getShopState();
    const cRating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;

    setActiveProfileId(storageService.getActiveProfileId());
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

    // Sync Audio & Haptics preferences
    const prefs = {
      hideSprintTimer: false,
      isMuted: false,
      isHapticsEnabled: true,
      ...(uData.preferences || {})
    };
    soundFx.setMuted(prefs.isMuted);
    setHapticsEnabled(prefs.isHapticsEnabled);
    setPreferences(prefs);
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
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);

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

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return storageService.getActiveProfileId();
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
    const defaultPrefs = { hideSprintTimer: false, isMuted: false, isHapticsEnabled: true };
    return { ...defaultPrefs, ...(storageService.getUserData().preferences || {}) };
  });

  // Apply preferences to audio engine on initial load
  useEffect(() => {
    soundFx.setMuted(preferences.isMuted);
    setHapticsEnabled(preferences.isHapticsEnabled);
  }, []);

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    storageService.saveUserData({ preferences: newPrefs });

    if (newPrefs.isMuted !== undefined) {
      soundFx.setMuted(newPrefs.isMuted);
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

  const handleBuyConsumable = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item || sparks < item.cost) return;

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

  const calculateStats = (results = []) => {
    if (!results || results.length === 0) {
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

  const isAppPaused = showLevelUpModal || showSpeedInfoModal || showPinGateModal || showParentDashboard || showMockCheckoutModal || showStreakSavedModal || showBadgesModal || showAccountLinkModal || showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher;

  const [liveCompetenceRating, setLiveCompetenceRating] = useState(() => {
    const uData = storageService.getUserData();
    return uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
  });

  const closeAllNavModals = (except = null) => {
    if (except !== 'workshop') setIsWorkshopOpen(false);
    if (except !== 'badges') setShowBadgesModal(false);
    if (except !== 'profile') setShowManualProfileSwitcher(false);
    if (except !== 'parents') {
      setShowPinGateModal(false);
      setShowParentDashboard(false);
    }
  };

  const renderNavigationFooter = () => (
    <footer className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 py-2 sm:py-3 flex items-center justify-around shadow-xs shrink-0 gap-1 sm:gap-2">
      {/* 0. Climb (Home) Button: Emerald Green */}
      <button
        type="button"
        onClick={() => {
          soundFx.playKeyTap();
          closeAllNavModals();
          setAppState('adaptive_session');
        }}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-100 text-emerald-950 border-2 border-emerald-400 rounded-xl hover:from-emerald-200 hover:to-teal-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
          !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'adaptive_session' ? 'ring-2 ring-emerald-500 scale-105 font-bold' : ''
        }`}
        aria-label="Return to Main Climb Session"
        title="Main Mountain Climb"
      >
        <Mountain className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
        <span className="text-[10px] font-black tracking-wide">Climb</span>
      </button>

      {/* 1. Shop Button: Warm Orange / Amber */}
      <button
        type="button"
        onClick={() => {
          closeAllNavModals('workshop');
          handleOpenWorkshop();
        }}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 text-amber-950 border-2 border-amber-400 rounded-xl hover:from-amber-200 hover:to-orange-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
          isWorkshopOpen ? 'ring-2 ring-amber-500 scale-105 font-bold' : ''
        }`}
        aria-label="Open Kibo's Corner"
        title="Kibo's Workshop & Shop"
      >
        <ShoppingBag className="w-5 h-5 text-amber-700 stroke-[2.5]" />
        <span className="text-[10px] font-black tracking-wide">Shop</span>
      </button>

      {/* 2. Badges Button: Golden Yellow */}
      <button
        type="button"
        onClick={() => {
          soundFx.playKeyTap();
          closeAllNavModals('badges');
          setShowBadgesModal(true);
        }}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-yellow-100 via-amber-50 to-yellow-100 text-yellow-950 border-2 border-yellow-400 rounded-xl hover:from-yellow-200 hover:to-amber-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
          showBadgesModal ? 'ring-2 ring-yellow-500 scale-105 font-bold' : ''
        }`}
        title="View Badges"
      >
        <Award className="w-5 h-5 text-yellow-700 stroke-[2.5]" />
        <span className="text-[10px] font-black tracking-wide">Badges</span>
      </button>

      {/* 3. Switch Profile Button: Ocean Cyan / Sky Blue */}
      {storageService.getAllProfiles().length > 1 && (
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            closeAllNavModals('profile');
            setShowManualProfileSwitcher(true);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-sky-100 via-cyan-50 to-sky-100 text-sky-950 border-2 border-sky-400 rounded-xl hover:from-sky-200 hover:to-cyan-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
            showManualProfileSwitcher ? 'ring-2 ring-sky-500 scale-105 font-bold' : ''
          }`}
          title="Switch Player Profile"
        >
          <Users className="w-5 h-5 text-sky-700 stroke-[2.5]" />
          <span className="text-[10px] font-black tracking-wide">Switch</span>
        </button>
      )}

      {/* 4. Parents Button: Royal Purple */}
      <button
        type="button"
        onClick={() => {
          soundFx.playKeyTap();
          closeAllNavModals('parents');
          setShowPinGateModal(true);
        }}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-purple-100 via-fuchsia-50 to-purple-100 text-purple-950 border-2 border-purple-400 rounded-xl hover:from-purple-200 hover:to-fuchsia-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
          showPinGateModal || showParentDashboard ? 'ring-2 ring-purple-500 scale-105 font-bold' : ''
        }`}
        title="Parent Dashboard & Settings"
      >
        <Lock className="w-5 h-5 text-purple-700 stroke-[2.5]" />
        <span className="text-[10px] font-black tracking-wide">Parents</span>
      </button>

      {/* 5. Settings Button: Slate Gray */}
      <button
        type="button"
        onClick={() => {
          soundFx.playKeyTap();
          closeAllNavModals();
          setAppState('settings');
        }}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100 text-slate-950 border-2 border-slate-300 rounded-xl hover:from-slate-200 hover:to-gray-200 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer min-w-[3.75rem] ${
          !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'settings' ? 'ring-2 ring-slate-400 scale-105 font-bold' : ''
        }`}
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-slate-700 stroke-[2.5]" />
        <span className="text-[10px] font-black tracking-wide">Settings</span>
      </button>
    </footer>
  );

  return (
    <div className="app-viewport-root w-full h-full relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col">
      {/* Sticky Top HUD Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 py-2 sm:py-3 flex items-center justify-between shadow-xs shrink-0 gap-1.5">
        {/* Brand Logo & Stats */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 w-full justify-between">
          {/* 1. Brand Button: Warm Amber / Orange & Subject Selector */}
          <div className="relative" ref={subjectSelectorRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowSubjectSelector(!showSubjectSelector);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 font-black text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border-2 border-amber-300 hover:border-amber-400"
              title="Subject Selector"
            >
              <img
                src="/kibo_mascot.svg"
                alt="Kibo Mascot"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain filter drop-shadow-2xs"
              />
              <span className="tracking-tight font-black">Kibo Math</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSubjectSelector ? 'rotate-180' : ''}`} />
            </button>

            {showSubjectSelector && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => {
                    soundFx.playKeyTap();
                    setAppState('adaptive_session');
                    setShowSubjectSelector(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center shrink-0">
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 leading-tight">Kibo Math</span>
                    <span className="text-[10px] font-bold text-emerald-600">Active</span>
                  </div>
                </button>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 opacity-75 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 border border-indigo-300 flex items-center justify-center shrink-0 opacity-50 grayscale">
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-400 leading-tight">Kibo Words</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 opacity-75 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-emerald-200 border border-teal-300 flex items-center justify-center shrink-0 opacity-50 grayscale">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-400 leading-tight">Kibo World</span>
                    <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 opacity-75 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 border border-emerald-300 flex items-center justify-center shrink-0 opacity-50 grayscale">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-400 leading-tight">Kibo Money</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Coming Soon</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Streak Badge Button: Fiery Rose / Red with spelled out day/days pluralization */}
          <button
            type="button"
            className="flex items-center gap-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-2 border-rose-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            title={(consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0 ? "Daily Streak & Shield Active! 🛡️" : `Daily Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
            onClick={() => {
              soundFx.playKeyTap();
              setShowBadgesModal(true);
            }}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
            <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
            {((consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0) && (
              <span className="text-[10px] ml-0.5 animate-pulse" title="Kibo Shield Active">🛡️</span>
            )}
          </button>

          {/* 3. Sparks Counter Button: Spark Gold / Yellow */}
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              handleOpenWorkshop('adaptive_session');
            }}
            className="flex items-center gap-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-950 border-2 border-yellow-500 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-black shadow-xs hover:scale-105 active:scale-95 transition-all relative shrink-0 overflow-visible cursor-pointer"
            title="Open Kibo Workshop"
          >
            <RollingNumberTicker
              value={sparks}
              icon={<Zap className="w-3.5 h-3.5 text-amber-800 fill-amber-500 stroke-[2.5]" />}
              profileId={activeProfileId}
            />
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* 4. Competence Rank Button: Royal Purple / Violet */}
            {(() => {
              const rankTitle = getCompetenceRankTier(liveCompetenceRating);
              return (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowBadgesModal(true);
                  }}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-200 text-purple-950 border-2 border-purple-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 relative overflow-visible cursor-pointer hover:border-purple-500"
                  title={`Competence Rank: ${liveCompetenceRating} pts (${rankTitle})`}
                >
                  <RollingNumberTicker
                    value={liveCompetenceRating}
                    showDeltaBadge={true}
                    icon={<Trophy className="w-3.5 h-3.5 text-purple-700 stroke-[2.5]" />}
                  />
                </button>
              );
            })()}
          </div>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-1.5 sm:p-4 relative min-h-0">



      {/* SETTINGS SCREEN */}
      {appState === 'settings' && (
        <SettingsScreen
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {appState === 'adaptive_session' && (
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

      {/* STREAK SAVED MODAL */}
      <StreakSavedModal
        isOpen={showStreakSavedModal}
        onClose={() => setShowStreakSavedModal(false)}
        streak={streak}
        remainingShields={streakShields}
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
        renderFooter={renderNavigationFooter}
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

      </main>

      {/* Bottom Navigation Bar */}
      {appState !== 'settings' && renderNavigationFooter()}
    </div>
  );
}
