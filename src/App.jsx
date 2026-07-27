import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles, Layers, Swords, Award, Info, X, Lock, ShieldCheck, Compass, MapPin } from 'lucide-react';
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
import PlacementTest from './components/PlacementTest';
import PlacementRevealModal from './components/PlacementRevealModal';
import MicroHintCard from './components/MicroHintCard';
import FirstLaunchOnboardingModal from './components/FirstLaunchOnboardingModal';
import SprintResultsModal from './components/SprintResultsModal';
import BadgesModal from './components/BadgesModal';
import { evaluateBadges } from './utils/badgeManager';
import { generateProblems } from './utils/mathGenerator';
import { generatePlacementDiagnosticSet, evaluatePlacementTier, CURRICULUM_TIERS } from './utils/curriculum';
import { getItemById } from './utils/itemsCatalog';
import { classifyLatency } from './utils/latencyEngine';
import { soundFx } from './utils/audio';
import { BRAND_CONFIG } from './config/brand';
import { pluralize } from './utils/formatters';
import { storageService } from './services/storageService';

export default function App() {
  // App State: 'launch' | 'sprint' | 'victory' | 'skill_map' | 'world_map' | 'placement_test'
  const [appState, setAppState] = useState('launch');
  const [isMuted, setIsMuted] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSpeedInfoModal, setShowSpeedInfoModal] = useState(false);
  const [showPinGateModal, setShowPinGateModal] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);
  const [showSprintResultsModal, setShowSprintResultsModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    return storageService.getUserData().unlockedBadges || [];
  });

  // First-Time User Onboarding Modal State
  const [showFirstLaunchOnboardingModal, setShowFirstLaunchOnboardingModal] = useState(() => {
    return !localStorage.getItem('kibo_math_has_onboarded') && !localStorage.getItem('kibo_math_tier');
  });

  // Consecutive problem miss tracking for Micro-Hints
  const [consecutiveProblemMisses, setConsecutiveProblemMisses] = useState(0);

  // Test-Out State
  const [isTestOut, setIsTestOut] = useState(false);
  const [testOutTargetTier, setTestOutTargetTier] = useState(null);
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

  // Persistent Custom 7-Day Practice Schedule (Default [1, 2, 3, 4, 5] = Mon-Fri)
  const [practiceDays, setPracticeDays] = useState(() => {
    return storageService.getParentSettings().practiceDays;
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
      if (savedShields > 0) {
        const newShields = Math.max(0, savedShields - 1);
        setStreakShields(newShields);
        localStorage.setItem('kibo_math_shields', newShields.toString());
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
    setShowFirstLaunchOnboardingModal(false);
  };

  const handleStartPlacementFromOnboarding = () => {
    localStorage.setItem('kibo_math_has_onboarded', 'true');
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

  // Physical Keyboard listener
  useEffect(() => {
    if (appState !== 'sprint' || showQuitModal) return;

    const handleKeyDown = (e) => {
      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        soundFx.playKeyTap();
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        soundFx.playKeyTap();
        setInputVal((prev) => prev.slice(0, -1));
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        setInputVal('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, currentIndex, inputVal, problems, showQuitModal]);

  // Zero-Friction Auto-Submit & Format Mask logic
  const handleDigitInput = (digit) => {
    const currentProblem = problems[currentIndex];
    if (!currentProblem) return;

    if (digit === 'Yes' || digit === 'No') {
      setInputVal(digit);
      submitAnswer(digit, currentProblem);
      return;
    }

    if (digit === '.' && inputVal.includes('.')) return;

    let newInput = inputVal + digit;

    // Time Reading Auto-Formatting Mask (e.g. 230 -> 2:30, 1145 -> 11:45)
    const isTimeProblem = currentProblem.type && (
      currentProblem.type.startsWith('time') ||
      currentProblem.type === 'time_basics'
    );

    if (isTimeProblem && !newInput.includes(':')) {
      const rawDigits = newInput.replace(/\D/g, '');
      if (rawDigits.length === 3) {
        newInput = `${rawDigits[0]}:${rawDigits.slice(1)}`;
      } else if (rawDigits.length === 4) {
        newInput = `${rawDigits.slice(0, 2)}:${rawDigits.slice(2)}`;
      }
    }

    setInputVal(newInput);

    const targetLength = currentProblem.answerString.length;

    if (newInput.length >= targetLength) {
      submitAnswer(newInput, currentProblem);
    }
  };

  const submitAnswer = (userAnswerStr, currentProblem) => {
    const now = performance.now();
    const latencyMs = Math.round(Math.max(10, now - problemStartTimeRef.current));
    const isCorrect = userAnswerStr === currentProblem.answerString;
    const speedInfo = classifyLatency(currentProblem.answerString, latencyMs);

    const resultRecord = {
      problem: currentProblem,
      userAnswer: userAnswerStr,
      isCorrect,
      latencyMs,
      speedInfo
    };

    const nextResults = [...results, resultRecord];
    setResults(nextResults);

    if (isCorrect) {
      soundFx.playCorrect();
      setMascotMood('correct');
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
    }, isCorrect ? 200 : 800);
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
    setAppState('launch');
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
      const passedTestOut = accuracyPct === 100 && avgLatencySec < 2.5;

      if (passedTestOut) {
        const newUnlocked = Array.from(new Set([...unlockedTiers, testOutTargetTier]));
        for (let i = 1; i <= testOutTargetTier; i++) {
          if (!newUnlocked.includes(i)) newUnlocked.push(i);
        }

        const updatedSparks = sparks + 30;
        setTier(testOutTargetTier);
        setUnlockedTiers(newUnlocked.sort());
        setSparks(updatedSparks);

        localStorage.setItem('kibo_math_tier', testOutTargetTier.toString());
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
    const totalEarned = hasStreakMultiplier ? Math.floor(subtotalSparks * 1.5) : subtotalSparks;

    const newSparkBalance = sparks + totalEarned;
    setSparks(newSparkBalance);
    localStorage.setItem('kibo_math_sparks', newSparkBalance.toString());
    setEarnedSparksInfo({
      base: baseSparks,
      accuracyBonus: accuracyBonusSparks,
      speedBonus: speedBonusSparks,
      multiplier: hasStreakMultiplier ? 1.5 : 1.0,
      total: totalEarned
    });

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
    if (sparks < item.cost) return;

    if (item.isConsumable && item.id === 'kibo_shield') {
      if (streakShields >= 2) return;
      const updatedSparks = sparks - item.cost;
      const newShields = Math.min(2, streakShields + 1);
      setSparks(updatedSparks);
      setStreakShields(newShields);
      storageService.saveUserData({ sparks: updatedSparks, streakShields: newShields });
      return;
    }

    const updatedSparks = sparks - item.cost;
    const updatedUnlocked = Array.from(new Set([...unlockedItems, item.id]));

    const currentSlotCat = item.category;
    const filteredSameSlot = equippedItems.filter((id) => {
      const equippedItem = getItemById(id);
      return equippedItem ? equippedItem.category !== currentSlotCat : true;
    });

    const updatedEquipped = [...filteredSameSlot, item.id];

    setSparks(updatedSparks);
    setUnlockedItems(updatedUnlocked);
    setEquippedItems(updatedEquipped);

    storageService.saveUserData({ sparks: updatedSparks });
    storageService.saveShopState(updatedEquipped, updatedUnlocked);
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
    storageService.saveParentSettings(newPin, practiceDays);
  };

  const handleUpdatePracticeDays = (newDays) => {
    setPracticeDays(newDays);
    storageService.saveParentSettings(parentPin, newDays);
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

    const superFastCount = results.filter((r) => r.speedInfo.category === 'super_fast').length;
    const fluentCount = results.filter((r) => r.speedInfo.category === 'fluent').length;
    const practiceCount = results.filter((r) => r.speedInfo.category === 'practice').length;

    return {
      totalTimeSec,
      accuracyPct,
      avgVelocitySec,
      superFastCount,
      fluentCount,
      practiceCount,
      total: results.length
    };
  };

  const stats = calculateStats();

  const getTierMeta = (t) => {
    return CURRICULUM_TIERS.find((item) => item.tier === t) || CURRICULUM_TIERS[0];
  };

  const currentTierMeta = getTierMeta(tier);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 safe-pt safe-pb max-w-lg mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (appState === 'sprint') {
                handleOpenQuitModal();
              } else {
                setAppState('launch');
              }
            }}
            className="font-extrabold text-2xl tracking-tight text-kibo-orange drop-shadow-sm hover:opacity-90 transition-opacity active:scale-95 text-left flex items-center gap-1.5"
            title="Return to Home"
          >
            <span>🏔️</span>
            <span>Kibo<span className="text-kibo-teal">Math</span></span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Trail Badges Showcase Button */}
          <button
            onClick={() => {
              soundFx.playKeyTap();
              setShowBadgesModal(true);
            }}
            className="p-2 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold active:scale-95 transition-all shadow-sm flex items-center justify-center"
            title="View Trail Badges"
          >
            <Award className="w-5 h-5 text-amber-700 stroke-[2.5]" />
          </button>

          {/* Combined Shop & Spark Counter Button */}
          <button
            onClick={() => setIsWorkshopOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold active:scale-95 transition-all shadow-sm"
            aria-label="Open Kibo Workshop"
          >
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
            <span className="text-base">{sparks}</span>
            <span className="text-amber-400 font-bold">|</span>
            <ShoppingBag className="w-4 h-4 text-amber-800 stroke-[2.5]" />
          </button>

          {/* Parent Zone Entry Button */}
          <button
            onClick={() => setShowPinGateModal(true)}
            className="p-2 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-2xl text-purple-700 active:scale-95 transition-all shadow-sm"
            title="Parent Zone (PIN Protected)"
            aria-label="Open Parent Zone"
          >
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleAudio}
            className="p-2 bg-white rounded-2xl border-2 border-slate-200 text-slate-600 hover:text-slate-900 active:scale-95 transition-all shadow-sm"
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-kibo-teal" />}
          </button>
        </div>
      </header>

      {/* WORLD MAP SCREEN */}
      {appState === 'world_map' && (
        <WorldMap
          currentTier={tier}
          unlockedTiers={unlockedTiers}
          equippedItems={equippedItems}
          sprintHistory={sprintHistory}
          onSelectTierAndStartSprint={handleSelectTierFromMap}
          onStartTestOut={startTestOutSprint}
          onStartPlacementTest={startPlacementDiagnostic}
          onBackToHome={() => setAppState('launch')}
        />
      )}

      {/* PLACEMENT TEST SCREEN */}
      {appState === 'placement_test' && (
        <PlacementTest
          equippedItems={equippedItems}
          onCompletePlacement={handleCompletePlacementTest}
          onQuitToHome={() => setAppState('launch')}
        />
      )}

      {/* SKILL MAP ROADMAP SCREEN */}
      {appState === 'skill_map' && (
        <SkillMapScreen
          currentTier={tier}
          unlockedTiers={unlockedTiers}
          onSelectTier={(t) => handleSelectTierFromMap(t)}
          onStartPlacementTest={startPlacementDiagnostic}
          onBackToHome={() => setAppState('launch')}
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
          <div className="my-1 cursor-pointer" onClick={() => setIsWorkshopOpen(true)} title="Click to customize Kibo!">
            <Mascot mood="happy" equipped={equippedItems} className="w-32 h-32 sm:w-36 sm:h-36" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Ready for your Math Sprint?
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
            <button
              onClick={() => startNewSprint(false)}
              className="btn-3d-orange w-full py-3.5 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group shadow-bouncy-orange"
            >
              <Play className="w-6 h-6 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
              Start Sprint
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

      {/* STATE 2: THE MATH SPRINT */}
      {appState === 'sprint' && problems[currentIndex] && (
        <main className="w-full flex-1 flex flex-col items-center justify-between gap-3 py-2">
          {/* Top Progress Bar */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-1">
              <div className="flex items-center gap-2">
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

          {/* Mascot & Math Display Area */}
          <div className="w-full flex flex-col items-center my-auto">
            <Mascot mood={mascotMood} equipped={equippedItems} className="w-20 h-20 sm:w-24 sm:h-24 mb-2" />

            {/* Problem Card */}
            <div
              className={`w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 sm:p-7 text-center shadow-card-3d transition-transform ${
                isShaking ? 'animate-shake border-rose-400 bg-rose-50' : ''
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-800 flex items-center justify-center gap-3 flex-wrap">
                <span>{problems[currentIndex].displayString || `${problems[currentIndex].num1} ${problems[currentIndex].operatorSymbol} ${problems[currentIndex].num2}`}</span>
                <span className="text-slate-400 font-bold">=</span>

                {/* Input Box Display */}
                <span className="inline-block min-w-[70px] px-3 py-1 bg-amber-50 border-3 border-amber-300 rounded-xl text-kibo-teal text-3xl sm:text-4xl font-black shadow-inner">
                  {inputVal ? inputVal : <span className="text-slate-300 font-normal animate-pulse">?</span>}
                </span>
              </div>

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
            onDelete={() => setInputVal((prev) => prev.slice(0, -1))}
            onClear={() => setInputVal('')}
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
              {isBossMode ? 'Boss Challenge Complete! ⚡' : 'Sprint Complete! 🎉'}
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
              <Compass className="w-4 h-4 stroke-[2.5]" /> View World Map
            </button>

            <button
              onClick={() => setAppState('launch')}
              className="w-full py-2 text-slate-600 hover:text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Home
            </button>
          </div>
        </main>
      )}

      {/* FIRST LAUNCH ONBOARDING PLACEMENT MODAL */}
      <FirstLaunchOnboardingModal
        isOpen={showFirstLaunchOnboardingModal}
        equippedItems={equippedItems}
        onStartPlacementTest={handleStartPlacementFromOnboarding}
        onStartAtTier1={handleStartAtTier1FromOnboarding}
      />

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

      {/* PLACEMENT REVEAL MODAL */}
      <PlacementRevealModal
        isOpen={showPlacementRevealModal}
        placedTier={tier}
        equippedItems={equippedItems}
        onGoToWorldMap={() => {
          setShowPlacementRevealModal(false);
          setAppState('world_map');
        }}
      />

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
        onKeepPlaying={handleKeepPlaying}
        onQuitToHome={handleQuitToHome}
      />

      {/* PARENT PIN GATE MODAL */}
      <PinGateModal
        isOpen={showPinGateModal}
        onClose={() => setShowPinGateModal(false)}
        currentPin={parentPin}
        onUnlockSuccess={() => {
          setShowPinGateModal(false);
          setShowParentDashboard(true);
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
        unlockedBadges={unlockedBadges}
      />

      {/* TRAIL BADGES SHOWCASE MODAL */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        unlockedBadges={unlockedBadges}
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
        onContinueClimbing={() => {
          setShowSprintResultsModal(false);
          setAppState('world_map');
        }}
        onVisitWorkshop={() => {
          setShowSprintResultsModal(false);
          setIsWorkshopOpen(true);
        }}
      />

      {/* Workshop Modal */}
      <WorkshopModal
        isOpen={isWorkshopOpen}
        onClose={() => setIsWorkshopOpen(false)}
        sparks={sparks}
        streakShields={streakShields}
        unlockedItems={unlockedItems}
        equippedItems={equippedItems}
        onBuyItem={handleBuyItem}
        onToggleEquip={handleToggleEquip}
      />

      {/* Footer with Parent Zone Link */}
      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2 border-t border-slate-200/60 mt-auto flex items-center justify-between">
        <span>{BRAND_CONFIG.appName} by {BRAND_CONFIG.rootBrand} • math.kiboclimb.com</span>
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
