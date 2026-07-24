import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles, Layers, Swords, Award, Info, X } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import { generateProblems } from './utils/mathGenerator';
import { classifyLatency } from './utils/latencyEngine';
import { soundFx } from './utils/audio';

export default function App() {
  // App State: 'launch' | 'sprint' | 'victory'
  const [appState, setAppState] = useState('launch');
  const [isMuted, setIsMuted] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSpeedInfoModal, setShowSpeedInfoModal] = useState(false);
  const [levelUpReason, setLevelUpReason] = useState('');
  const [isBossMode, setIsBossMode] = useState(false);

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

  // Persistent Daily Streak (calendar-day based)
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('kibo_math_streak');
    const lastDate = localStorage.getItem('kibo_math_last_date');
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    if (!saved || !lastDate) return 0;
    if (lastDate !== today && lastDate !== yesterday) {
      return 0;
    }
    return parseInt(saved, 10);
  });

  // Persistent Sparks Currency (⚡)
  const [sparks, setSparks] = useState(() => {
    const saved = localStorage.getItem('kibo_math_sparks');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persistent Skill Tier (1, 2, 3)
  const [tier, setTier] = useState(() => {
    const saved = localStorage.getItem('kibo_math_tier');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Persistent Sprint History (last 3 sprints regardless of day)
  const [sprintHistory, setSprintHistory] = useState(() => {
    const saved = localStorage.getItem('kibo_math_sprint_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent Re-queued Practice Problems
  const [practiceQueue, setPracticeQueue] = useState(() => {
    const saved = localStorage.getItem('kibo_math_practice_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent Inventory & Equipped Accessories
  const [unlockedItems, setUnlockedItems] = useState(() => {
    const saved = localStorage.getItem('kibo_math_unlocked');
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedItems, setEquippedItems] = useState(() => {
    const saved = localStorage.getItem('kibo_math_equipped');
    return saved ? JSON.parse(saved) : [];
  });

  // Sprint State
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [results, setResults] = useState([]);
  const [mascotMood, setMascotMood] = useState('happy');
  const [isShaking, setIsShaking] = useState(false);
  const [earnedSparksInfo, setEarnedSparksInfo] = useState({ base: 0, bonus: 0, total: 0 });

  // High precision latency measurement
  const problemStartTimeRef = useRef(performance.now());

  // Physical Keyboard listener
  useEffect(() => {
    if (appState !== 'sprint') return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
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
  }, [appState, currentIndex, inputVal, problems]);

  // Zero-Friction Auto-Submit logic
  const handleDigitInput = (digit) => {
    const currentProblem = problems[currentIndex];
    if (!currentProblem) return;

    const newInput = inputVal + digit;
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
    } else {
      soundFx.playIncorrect();
      setMascotMood('incorrect');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }

    setTimeout(() => {
      setMascotMood('happy');
      setInputVal('');

      if (currentIndex + 1 < problems.length) {
        setCurrentIndex(currentIndex + 1);
        problemStartTimeRef.current = performance.now();
      } else {
        finishSprint(nextResults);
      }
    }, isCorrect ? 200 : 450);
  };

  const startNewSprint = (asBossMode = false) => {
    soundFx.init();
    setIsBossMode(asBossMode);
    const count = asBossMode ? 25 : 20;
    const newProbs = generateProblems(count, tier, practiceQueue);
    setProblems(newProbs);
    setCurrentIndex(0);
    setInputVal('');
    setResults([]);
    setMascotMood('happy');
    setAppState('sprint');
    problemStartTimeRef.current = performance.now();
  };

  const finishSprint = (finalResults) => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    const lastDate = localStorage.getItem('kibo_math_last_date');

    // 1. Streak update
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

    // 2. Spark Reward Calculation (Base: 10, Bonus: 5 for 100% accuracy)
    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const accuracyPct = Math.round((correctCount / finalResults.length) * 100);
    const totalLatencyMs = finalResults.reduce((acc, r) => acc + r.latencyMs, 0);
    const avgLatencySec = parseFloat((totalLatencyMs / (finalResults.length * 1000)).toFixed(2));

    const baseSparks = isBossMode ? 20 : 10;
    const bonusSparks = accuracyPct === 100 ? 5 : 0;
    const totalEarned = baseSparks + bonusSparks;

    const newSparkBalance = sparks + totalEarned;
    setSparks(newSparkBalance);
    localStorage.setItem('kibo_math_sparks', newSparkBalance.toString());
    setEarnedSparksInfo({ base: baseSparks, bonus: bonusSparks, total: totalEarned });

    // 3. Update Practice Queue
    let updatedQueue = [...practiceQueue];
    finalResults.forEach((r) => {
      const eqKey = `${r.problem.num1}${r.problem.operatorSymbol}${r.problem.num2}`;
      if (!r.isCorrect || r.speedInfo.category === 'practice') {
        if (!updatedQueue.some((p) => `${p.num1}${p.operatorSymbol}${p.num2}` === eqKey)) {
          updatedQueue.push({
            num1: r.problem.num1,
            num2: r.problem.num2,
            operatorSymbol: r.problem.operatorSymbol,
            type: r.problem.type,
            answer: r.problem.answer
          });
        }
      } else {
        updatedQueue = updatedQueue.filter((p) => `${p.num1}${p.operatorSymbol}${p.num2}` !== eqKey);
      }
    });

    setPracticeQueue(updatedQueue);
    localStorage.setItem('kibo_math_practice_queue', JSON.stringify(updatedQueue));

    // 4. Update Sprint History
    const newSprintRecord = { accuracyPct, avgLatencySec, date: today };
    const updatedHistory = [newSprintRecord, ...sprintHistory].slice(0, 3);
    setSprintHistory(updatedHistory);
    localStorage.setItem('kibo_math_sprint_history', JSON.stringify(updatedHistory));

    // 5. Dual-Path Level-Up Evaluation
    let triggerLevelUp = false;
    let reasonText = '';

    if (tier < 3) {
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
    setAppState('victory');

    if (triggerLevelUp) {
      setLevelUpReason(reasonText);
      setTimeout(() => setShowLevelUpModal(true), 600);
    }
  };

  const handleLevelUp = () => {
    if (tier < 3) {
      const nextTier = tier + 1;
      setTier(nextTier);
      localStorage.setItem('kibo_math_tier', nextTier.toString());
      setSprintHistory([]);
      localStorage.setItem('kibo_math_sprint_history', JSON.stringify([]));
      setShowLevelUpModal(false);
      soundFx.playVictory();
    }
  };

  const toggleAudio = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Workshop Actions
  const handleBuyItem = (item) => {
    if (sparks < item.cost) return;

    const updatedSparks = sparks - item.cost;
    const updatedUnlocked = [...unlockedItems, item.id];
    const updatedEquipped = [...equippedItems, item.id];

    setSparks(updatedSparks);
    setUnlockedItems(updatedUnlocked);
    setEquippedItems(updatedEquipped);

    localStorage.setItem('kibo_math_sparks', updatedSparks.toString());
    localStorage.setItem('kibo_math_unlocked', JSON.stringify(updatedUnlocked));
    localStorage.setItem('kibo_math_equipped', JSON.stringify(updatedEquipped));
  };

  const handleToggleEquip = (itemId) => {
    let updatedEquipped;
    if (equippedItems.includes(itemId)) {
      updatedEquipped = equippedItems.filter((id) => id !== itemId);
    } else {
      updatedEquipped = [...equippedItems, itemId];
    }
    setEquippedItems(updatedEquipped);
    localStorage.setItem('kibo_math_equipped', JSON.stringify(updatedEquipped));
  };

  // Stats Calculations for Victory Screen
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

  const getTierTitle = (t) => {
    if (t === 1) return 'Tier 1: Single-Digit Math (1–9)';
    if (t === 2) return 'Tier 2: Crossing the Tens (Regrouping)';
    return 'Tier 3: Multiplication Tables';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 max-w-lg mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight text-kibo-orange drop-shadow-sm">
            Kibo<span className="text-kibo-teal">Math</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
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

      {/* STATE 1: LAUNCH SCREEN */}
      {appState === 'launch' && (
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-3 text-center animate-pop">
          {/* Top Badges Row */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Daily Streak Card */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-2 border-amber-200 rounded-full shadow-sm">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span className="font-extrabold text-amber-900 text-sm sm:text-base">
                {streak} Day Streak!
              </span>
            </div>

            {/* Current Tier Badge */}
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-50 border-2 border-purple-200 rounded-full shadow-sm">
              <Layers className="w-5 h-5 text-purple-600 stroke-[2.5]" />
              <span className="font-extrabold text-purple-900 text-sm sm:text-base">
                Tier {tier}
              </span>
            </div>
          </div>

          {/* Mascot Header */}
          <div className="my-1 cursor-pointer" onClick={() => setIsWorkshopOpen(true)} title="Click to customize Kibo!">
            <Mascot mood="happy" equipped={equippedItems} className="w-36 h-36 sm:w-40 sm:h-40" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Ready for your Math Sprint?
            </h1>
            <p className="text-purple-600 font-extrabold text-xs sm:text-sm bg-purple-50/80 px-3 py-1 rounded-xl inline-block border border-purple-200">
              {getTierTitle(tier)}
            </p>
            {practiceQueue.length > 0 && (
              <p className="text-amber-600 font-bold text-xs">
                🎯 {practiceQueue.length} practice problem{practiceQueue.length > 1 ? 's' : ''} queued for recall!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs space-y-2.5 mt-1">
            <button
              onClick={() => startNewSprint(false)}
              className="btn-3d-orange w-full py-4 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group shadow-bouncy-orange"
            >
              <Play className="w-7 h-7 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
              Start 20-Problem Sprint
            </button>

            {tier < 3 && (
              <button
                onClick={() => startNewSprint(true)}
                className="btn-3d-purple w-full py-3.5 text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
              >
                <Swords className="w-5 h-5 stroke-[2.5]" />
                ⚡ Boss Challenge Test Out (25 Qs)
              </button>
            )}

            <button
              onClick={() => setIsWorkshopOpen(true)}
              className="btn-3d-teal w-full py-3 text-base rounded-2xl flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              Kibo's Workshop
            </button>
          </div>
        </main>
      )}

      {/* STATE 2: THE MATH SPRINT */}
      {appState === 'sprint' && problems[currentIndex] && (
        <main className="w-full flex-1 flex flex-col items-center justify-between gap-4 py-2">
          {/* Top Progress Bar */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <span>Problem {currentIndex + 1} of {problems.length}</span>
                {isBossMode && (
                  <span className="text-[10px] uppercase font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-300">
                    ⚡ Boss Challenge
                  </span>
                )}
                {problems[currentIndex].isPracticeItem && !isBossMode && (
                  <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                    Practice Recall
                  </span>
                )}
              </div>
              <span className="text-kibo-teal font-extrabold">{Math.round(((currentIndex + 1) / problems.length) * 100)}%</span>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-300 shadow-sm ${
                  isBossMode
                    ? 'bg-gradient-to-r from-purple-500 to-kibo-orange'
                    : 'bg-gradient-to-r from-kibo-orange to-kibo-teal'
                }`}
                style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Mascot & Math Display Area */}
          <div className="w-full flex flex-col items-center my-auto">
            <Mascot mood={mascotMood} equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28 mb-3" />

            {/* Problem Card */}
            <div
              className={`w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-card-3d transition-transform ${
                isShaking ? 'animate-shake border-rose-400 bg-rose-50' : ''
              }`}
            >
              <div className="text-4xl sm:text-5xl font-extrabold tracking-wider text-slate-800 flex items-center justify-center gap-3">
                <span>{problems[currentIndex].num1}</span>
                <span className="text-kibo-orange font-black">{problems[currentIndex].operatorSymbol}</span>
                <span>{problems[currentIndex].num2}</span>
                <span className="text-slate-400 font-bold">=</span>

                {/* Input Box Display */}
                <span className="inline-block min-w-[70px] px-3 py-1 bg-amber-50 border-3 border-amber-300 rounded-xl text-kibo-teal text-4xl sm:text-5xl font-black shadow-inner">
                  {inputVal ? inputVal : <span className="text-slate-300 font-normal animate-pulse">?</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Keypad Input */}
          <Keypad
            onKeyPress={handleDigitInput}
            onDelete={() => setInputVal((prev) => prev.slice(0, -1))}
            onClear={() => setInputVal('')}
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
            <p className="text-amber-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-500 stroke-[2.5]" />
              Streak: {streak} days | +{earnedSparksInfo.total} Sparks ⚡
            </p>
          </div>

          {/* --- REDESIGNED SPEED BREAKDOWN CONTAINER --- */}
          <div className="w-full max-w-sm bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-md space-y-3">
            {/* Header with Parent Info (ℹ️) Icon */}
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
                    title={`Super Fast: ${stats.superFastCount}`}
                  />
                  <div
                    style={{ width: `${(stats.fluentCount / stats.total) * 100}%` }}
                    className="bg-yellow-400 h-full transition-all duration-500"
                    title={`Fluent: ${stats.fluentCount}`}
                  />
                  <div
                    style={{ width: `${(stats.practiceCount / stats.total) * 100}%` }}
                    className="bg-blue-400 h-full transition-all duration-500"
                    title={`Needs Practice: ${stats.practiceCount}`}
                  />
                </>
              )}
            </div>

            {/* 3 Explicit Stat Band Cards */}
            <div className="grid grid-cols-3 gap-2">
              {/* Super Fast Card */}
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

              {/* Fluent Card */}
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

              {/* Focus Area / Practice Card */}
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

                {/* Clean Sweep Badge on 0 Practice */}
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
                    #{i + 1}: {r.problem.num1} {r.problem.operatorSymbol} {r.problem.num2} = {r.problem.answer}
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
              onClick={() => setAppState('launch')}
              className="w-full py-2 text-slate-600 hover:text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Home
            </button>
          </div>
        </main>
      )}

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
              Unlock Tier {tier + 1}: {getTierTitle(tier + 1)}
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
        onClose={() => setIsWorkshopOpen(false)}
        sparks={sparks}
        unlockedItems={unlockedItems}
        equippedItems={equippedItems}
        onBuyItem={handleBuyItem}
        onToggleEquip={handleToggleEquip}
      />

      {/* Footer */}
      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2 border-t border-slate-200/60 mt-auto">
        Kibo Math • Supercharged Fun Mental Math MVP
      </footer>
    </div>
  );
}
