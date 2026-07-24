import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Volume2, VolumeX, Trophy, Clock, Target, Zap, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Mascot from './components/Mascot';
import Keypad from './components/Keypad';
import ConfettiCanvas from './components/ConfettiCanvas';
import { generate20Problems } from './utils/mathGenerator';
import { soundFx } from './utils/audio';

export default function App() {
  // App State: 'launch' | 'sprint' | 'victory'
  const [appState, setAppState] = useState('launch');
  const [isMuted, setIsMuted] = useState(false);

  // Persistent Streak (localStorage)
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('kibo_math_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Sprint State
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [results, setResults] = useState([]); // { problem, isCorrect, latencyMs }
  const [mascotMood, setMascotMood] = useState('happy');
  const [isShaking, setIsShaking] = useState(false);

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

    // Trigger auto-submit when character length matches expected answer length
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

    // Reset for next problem or finish sprint
    setTimeout(() => {
      setMascotMood('happy');
      setInputVal('');

      if (currentIndex + 1 < problems.length) {
        setCurrentIndex(currentIndex + 1);
        problemStartTimeRef.current = Date.now();
      } else {
        // Complete Sprint!
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
    // Update daily streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('kibo_math_streak', newStreak.toString());

    soundFx.playVictory();
    setMascotMood('celebrate');
    setAppState('victory');
  };

  const toggleAudio = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
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
      {/* Sound Toggle Header */}
      <header className="w-full flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight text-kibo-orange drop-shadow-sm">
            Kibo<span className="text-kibo-teal">Math</span>
          </span>
        </div>

        <button
          onClick={toggleAudio}
          className="p-2.5 bg-white rounded-2xl border-2 border-slate-200 text-slate-600 hover:text-slate-900 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-kibo-teal" />}
        </button>
      </header>

      {/* STATE 1: LAUNCH SCREEN */}
      {appState === 'launch' && (
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-6 py-6 text-center animate-pop">
          {/* Daily Streak Card */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-50 border-2 border-amber-200 rounded-full shadow-sm animate-bounce-short">
            <Flame className="w-7 h-7 text-amber-500 fill-amber-400 stroke-[2.5]" />
            <span className="font-extrabold text-amber-900 text-lg sm:text-xl">
              {streak} Day Streak!
            </span>
          </div>

          {/* Mascot Header */}
          <div className="my-2">
            <Mascot mood="happy" className="w-36 h-36 sm:w-44 sm:h-44" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Ready for your Math Sprint?
            </h1>
            <p className="text-slate-500 text-base sm:text-lg max-w-xs mx-auto font-medium">
              Solve 20 quick arithmetic problems as fast and accurately as you can!
            </p>
          </div>

          {/* Sprint Action Button */}
          <button
            onClick={startNewSprint}
            className="btn-3d-orange w-full max-w-xs py-4 text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 group mt-4 shadow-bouncy-orange"
          >
            <Play className="w-7 h-7 fill-white stroke-[2.5] group-hover:scale-110 transition-transform" />
            Start 20-Problem Sprint
          </button>
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
            <Mascot mood={mascotMood} className="w-24 h-24 sm:w-28 sm:h-28 mb-3" />

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
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-5 py-4 text-center animate-pop relative z-10">
          <ConfettiCanvas />

          <div className="relative">
            <Mascot mood="celebrate" className="w-36 h-36 sm:w-40 sm:h-40" />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-full border-2 border-white shadow-lg animate-bounce">
              <Trophy className="w-7 h-7 text-amber-900 fill-amber-300 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Sprint Complete! 🎉
            </h2>
            <p className="text-amber-600 font-bold text-lg flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 fill-amber-500 stroke-[2.5]" />
              Streak increased to {streak} days!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="w-full max-w-sm grid grid-cols-3 gap-3 my-2">
            {/* Total Time */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-md flex flex-col items-center">
              <Clock className="w-6 h-6 text-kibo-orange mb-1 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Time</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">{stats.totalTimeSec}s</span>
            </div>

            {/* Accuracy */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-md flex flex-col items-center">
              <Target className="w-6 h-6 text-kibo-teal mb-1 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Accuracy</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">{stats.accuracyPct}%</span>
            </div>

            {/* Speed / Velocity */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-md flex flex-col items-center">
              <Zap className="w-6 h-6 text-kibo-yellow mb-1 stroke-[2.5]" />
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Avg Speed</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">{stats.avgVelocitySec}s</span>
            </div>
          </div>

          {/* Problem Breakdown Summary List */}
          <div className="w-full max-w-sm bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1.5 text-left shadow-inner">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
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
          <div className="w-full max-w-sm space-y-2 mt-2">
            <button
              onClick={startNewSprint}
              className="btn-3d-orange w-full py-3.5 text-xl rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
            >
              <Play className="w-6 h-6 fill-white stroke-[2.5]" />
              Play Again
            </button>

            <button
              onClick={() => setAppState('launch')}
              className="w-full py-3 text-slate-600 hover:text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-base transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              Back to Home
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2 border-t border-slate-200/60 mt-auto">
        Kibo Math • Supercharged Fun Mental Math MVP
      </footer>
    </div>
  );
}
