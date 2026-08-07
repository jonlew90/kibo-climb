import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles, Layers, Swords, Award, Info, X, Lock, ShieldCheck, Compass, MapPin, Users } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import PinGateModal from './components/PinGateModal';
import ParentDashboardModal from './components/ParentDashboardModal';
import SkillMapScreen from './components/SkillMapScreen';
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
  // App State: 'adaptive_session' | 'placement_test'
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
  const [pendingSparksPurchase, setPendingSparksPurchase] = useState(null);
  const [showMockCheckoutModal, setShowMockCheckoutModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);
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
  const [hasVisitedParentZone, setHasVisitedParentZone] = useState(() => {
    return storageService.getUserData().hasVisitedParentZone || false;
  });



  const [levelUpReason, setLevelUpReason] = useState('');
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

  // Persistent Session History (last 3 sessions)
  const [sessionHistory, setSessionHistory] = useState(() => {
    return storageService.getUserData().sessionHistory;
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

  ;

  const handleLevelUp = () => {
    if (tier < 8) {
      const nextTier = tier + 1;
      const updatedUnlocked = Array.from(new Set([...unlockedTiers, nextTier]));
      setTier(nextTier);
      setUnlockedTiers(updatedUnlocked);
      localStorage.setItem('kibo_math_tier', nextTier.toString());
      localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
      setSessionHistory([]);
      localStorage.setItem('kibo_math_session_history', JSON.stringify([]));
      setShowLevelUpModal(false);
      soundFx.playVictory();
    }
  };

  ;

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

  ;



  const getTierMeta = (t) => {
    return CURRICULUM_TIERS.find((item) => item.tier === t) || CURRICULUM_TIERS[0];
  };

  const currentTierMeta = getTierMeta(tier);

  const isAppPaused = showLevelUpModal || showSpeedInfoModal || showPinGateModal || showParentDashboard || showMockCheckoutModal || showStreakSavedModal || showPlacementRevealModal || showBadgesModal || showAccountLinkModal || showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher;

  const [liveCompetenceRating, setLiveCompetenceRating] = useState(() => {
    const uData = storageService.getUserData();
    return uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
  });

  return (
    <div className="app-viewport-root p-2 sm:p-4 safe-pt max-w-lg mx-auto relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50">
      {/* Sticky Top HUD Header Bar */}
      {true && (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 px-2 py-1.5 flex items-center justify-between shadow-sm rounded-2xl mb-2 shrink-0 gap-1.5 overflow-x-auto hide-scrollbar">
          {/* Brand Logo & Stats */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 w-full justify-between">
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
              <span className="tracking-tight font-black">Kibo Climb</span>
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
                profileId={activeProfileId}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
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
          </div>
        </header>
      )}

      {/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {(appState === 'adaptive_session' ||  appState === 'launch' || !['placement_test'].includes(appState)) && (
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
              onClick={() => setAppState('adaptive_session')}
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
              onClick={() => setAppState('adaptive_session')}
              className="btn-3d-orange w-full py-3.5 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group shadow-bouncy-orange"
            >
              <Play className="w-6 h-6 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
              Start Kibo Climb
            </button>

            <button
              onClick={() => setAppState('adaptive_session')}
              className="btn-3d-purple w-full py-3 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              World Map Trail 🗺️
            </button>

            {tier < 8 && (
              <button
                onClick={() => setAppState('adaptive_session')}
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
        sessionHistory={sessionHistory}
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

      {/* Bottom Navigation Bar */}
      {true && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200/80 px-2 pt-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-nav">
          <button
            onClick={() => handleOpenWorkshop()}
            className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-amber-600 transition-colors active:scale-95"
            aria-label="Open Kibo's Corner"
          >
            <ShoppingBag className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] font-black tracking-wide">Shop</span>
          </button>

          <button
            onClick={() => {
              soundFx.playKeyTap();
              setShowBadgesModal(true);
            }}
            className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-amber-500 transition-colors active:scale-95"
          >
            <Award className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] font-black tracking-wide">Trophies</span>
          </button>

          {storageService.getAllProfiles().length > 1 && (
            <button
              onClick={() => {
                soundFx.playKeyTap();
                setShowManualProfileSwitcher(true);
              }}
              className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
            >
              <Users className="w-6 h-6 stroke-[2]" />
              <span className="text-[10px] font-black tracking-wide">Switch</span>
            </button>
          )}

          <button
            onClick={() => setShowPinGateModal(true)}
            className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-purple-600 transition-colors active:scale-95"
          >
            <Lock className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] font-black tracking-wide">Parents</span>
          </button>

          <button
            onClick={toggleAudio}
            className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-rose-500 stroke-[2]" /> : <Volume2 className="w-6 h-6 stroke-[2]" />}
            <span className="text-[10px] font-black tracking-wide">Mute</span>
          </button>
        </footer>
      )}

      {/* Spacing element to prevent bottom nav from covering content */}
      {true && <div className="h-20 shrink-0 w-full"></div>}
    </div>
  );
}
