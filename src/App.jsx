import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle, ShoppingBag, Sparkles } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import { generate20Problems } from './utils/mathGenerator';
import { soundFx } from './utils/audio';

export default function App() {
  // App State: 'launch' | 'sprint' | 'victory'
  const [appState, setAppState] = useState('launch');
  const [isMuted, setIsMuted] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);

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
  const [results, setResults] = useState([]); // { problem, isCorrect, latencyMs }
  const [mascotMood, setMascotMood] = useState('happy');
  const [isShaking, setIsShaking] = useState(false);
  const [earnedSparksInfo, setEarnedSparksInfo] = useState({ base: 0, bonus: 0, total: 0 });

  // Latency measurement
  const problemStartTimeRef = useRef(Date.now());

  // Physical Keyboard listener for desktop convenience
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
    const now = Date.now();
    const latencyMs = Math.max(10, now - problemStartTimeRef.current);
    const isCorrect = userAnswerStr === currentProblem.answerString;

    const resultRecord = {
      problem: currentProblem,
      userAnswer: userAnswerStr,
      isCorrect,
      latencyMs
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
        problemStartTimeRef.current = Date.now();
      } else {
        finishSprint(nextResults);
      }
    }, isCorrect ? 200 : 450);
  };

  const startNewSprint = () => {
    soundFx.init();
    const newProbs = generate20Problems();
    setProblems(newProbs);
    setCurrentIndex(0);
    setInputVal('');
    setResults([]);
    setMascotMood('happy');
    setAppState('sprint');
    problemStartTimeRef.current = Date.now();
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

    const baseSparks = 10;
    const bonusSparks = accuracyPct === 100 ? 5 : 0;
    const totalEarned = baseSparks + bonusSparks;

    const newSparkBalance = sparks + totalEarned;
    setSparks(newSparkBalance);
    localStorage.setItem('kibo_math_sparks', newSparkBalance.toString());
    setEarnedSparksInfo({ base: baseSparks, bonus: bonusSparks, total: totalEarned });

    soundFx.playVictory();
    setMascotMood('celebrate');
    setAppState('victory');
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
    // Automatically equip newly purchased item
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
      // Unequip
      updatedEquipped = equippedItems.filter((id) => id !== itemId);
    } else {
      // Equip
      updatedEquipped = [...equippedItems, itemId];
    }
    setEquippedItems(updatedEquipped);
    localStorage.setItem('kibo_math_equipped', JSON.stringify(updatedEquipped));
  };

  // Stats Calculations for Victory Screen
  const calculateStats = () => {
    if (results.length === 0) return { totalTimeSec: '0', accuracyPct: 0, avgVelocitySec: '0' };

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalLatencyMs = results.reduce((acc, r) => acc + r.latencyMs, 0);

    const totalTimeSec = (totalLatencyMs / 1000).toFixed(1);
    const accuracyPct = Math.round((correctCount / results.length) * 100);
    const avgVelocitySec = (totalLatencyMs / (results.length * 1000)).toFixed(2);

    return { totalTimeSec, accuracyPct, avgVelocitySec, correctCount };
  };

  const stats = calculateStats();

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
          {/* Spark Currency Counter Button */}
          <button
            onClick={() => setIsWorkshopOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold hover:bg-amber-100 active:scale-95 transition-all shadow-sm"
          >
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
            <span>{sparks}</span>
          </button>

          {/* Workshop Button */}
          <button
            onClick={() => setIsWorkshopOpen(true)}
            className="p-2 bg-kibo-teal text-white rounded-2xl border-b-4 border-kibo-teal-dark hover:bg-teal-600 active:translate-y-0.5 active:border-b-0 transition-all shadow-sm flex items-center gap-1 font-bold text-xs"
            aria-label="Open Kibo Workshop"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Shop</span>
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
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-5 py-4 text-center animate-pop">
          {/* Top Badges Row */}
          <div className="flex items-center gap-3">
            {/* Daily Streak Card */}
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-full shadow-sm animate-bounce-short">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span className="font-extrabold text-amber-900 text-base sm:text-lg">
                {streak} Day Streak!
              </span>
            </div>

            {/* Spark Balance Badge */}
            <button
              onClick={() => setIsWorkshopOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 border-2 border-amber-300 rounded-full shadow-sm hover:bg-amber-200 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span className="font-black text-amber-900 text-base sm:text-lg">{sparks} Sparks</span>
            </button>
          </div>

          {/* Mascot Header with Equipped Accessories */}
          <div className="my-1 cursor-pointer" onClick={() => setIsWorkshopOpen(true)}>
            <Mascot mood="happy" equipped={equippedItems} className="w-36 h-36 sm:w-44 sm:h-44" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Ready for your Math Sprint?
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-xs mx-auto font-medium">
              Solve 20 quick arithmetic problems to earn Sparks ⚡ and customize Kibo!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs space-y-3 mt-2">
            <button
              onClick={startNewSprint}
              className="btn-3d-orange w-full py-4 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group shadow-bouncy-orange"
            >
              <Play className="w-7 h-7 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
              Start 20-Problem Sprint
            </button>

            <button
              onClick={() => setIsWorkshopOpen(true)}
              className="btn-3d-teal w-full py-3 text-lg rounded-2xl flex items-center justify-center gap-2"
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
              <span>Problem {currentIndex + 1} of 20</span>
              <span className="text-kibo-teal font-extrabold">{Math.round(((currentIndex + 1) / 20) * 100)}%</span>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-kibo-orange to-kibo-teal rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${((currentIndex + 1) / 20) * 100}%` }}
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
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-3 text-center animate-pop relative z-10">
          <ConfettiCanvas />

          <div className="relative">
            <Mascot mood="celebrate" equipped={equippedItems} className="w-32 h-32 sm:w-36 sm:h-36" />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 p-2 rounded-full border-2 border-white shadow-lg animate-bounce">
              <Trophy className="w-6 h-6 text-amber-900 fill-amber-300 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Sprint Complete! 🎉
            </h2>
            <p className="text-amber-600 font-bold text-base flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 fill-amber-500 stroke-[2.5]" />
              Streak increased to {streak} days!
            </p>
          </div>

          {/* Spark Reward Earnings Banner */}
          <div className="w-full max-w-sm bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-2xl p-3.5 border-2 border-amber-300 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-white/30 rounded-xl">
                <Sparkles className="w-7 h-7 text-amber-900 fill-amber-300 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-900/80 block">
                  Reward Earned
                </span>
                <span className="font-extrabold text-lg text-amber-950">
                  +{earnedSparksInfo.total} Sparks ⚡
                </span>
                {earnedSparksInfo.bonus > 0 && (
                  <span className="text-xs font-bold text-emerald-900 block">
                    (Includes +5 Lightning Bonus! ⚡)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsWorkshopOpen(true)}
              className="px-3 py-1.5 bg-white text-amber-900 font-extrabold text-xs rounded-xl shadow-sm hover:bg-amber-50 active:scale-95"
            >
              Workshop
            </button>
          </div>

          {/* Stats Grid */}
          <div className="w-full max-w-sm grid grid-cols-3 gap-2.5">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-md flex flex-col items-center">
              <Clock className="w-5 h-5 text-kibo-orange mb-0.5 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Time</span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{stats.totalTimeSec}s</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-md flex flex-col items-center">
              <Target className="w-5 h-5 text-kibo-teal mb-0.5 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Accuracy</span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{stats.accuracyPct}%</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-md flex flex-col items-center">
              <Zap className="w-5 h-5 text-kibo-yellow mb-0.5 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Avg Speed</span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{stats.avgVelocitySec}s</span>
            </div>
          </div>

          {/* Problem Breakdown Summary List */}
          <div className="w-full max-w-sm bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5 max-h-32 overflow-y-auto space-y-1 text-left shadow-inner">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  {r.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>
                    #{i + 1}: {r.problem.num1} {r.problem.operatorSymbol} {r.problem.num2} = {r.problem.answer}
                  </span>
                </div>
                <span className="text-slate-400 font-mono">{(r.latencyMs / 1000).toFixed(2)}s</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-sm space-y-2 mt-1">
            <button
              onClick={startNewSprint}
              className="btn-3d-orange w-full py-3 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
            >
              <Play className="w-5 h-5 fill-white stroke-[2.5]" />
              Play Again
            </button>

            <button
              onClick={() => setAppState('launch')}
              className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              Back to Home
            </button>
          </div>
        </main>
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
