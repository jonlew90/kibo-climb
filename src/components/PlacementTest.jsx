import React, { useState, useEffect, useRef } from 'react';
import { Target, X, Zap } from 'lucide-react';
import Mascot from './Mascot';
import Keypad from './Keypad';
import { generateTierProblem, getNormalizedProblemKey, CURRICULUM_TIERS } from '../utils/curriculum';
import { classifyLatency } from '../utils/latencyEngine';
import { soundFx } from '../utils/audio';

export default function PlacementTest({
  equippedItems = [],
  onCompletePlacement,
  onQuitToHome
}) {
  const [currentTierLevel, setCurrentTierLevel] = useState(1);
  const [tierProblemCount, setTierProblemCount] = useState(0); // 0 or 1 per tier (2 total)
  const [currentProblem, setCurrentProblem] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [mascotMood, setMascotMood] = useState('happy');
  const [isShaking, setIsShaking] = useState(false);

  // Tracking state for adaptive rules
  const highestPassedTierRef = useRef(1);
  const consecutiveErrorsRef = useRef(0);
  const seenKeysRef = useRef(new Set());
  const problemStartTimeRef = useRef(performance.now());
  const questionNumberRef = useRef(1);

  // Generate next adaptive problem based on currentTierLevel
  const generateNextProblem = (tierLevel) => {
    let probData;
    let attempts = 0;
    do {
      probData = generateTierProblem(tierLevel);
      attempts++;
    } while (seenKeysRef.current.has(getNormalizedProblemKey(probData)) && attempts < 40);

    seenKeysRef.current.add(getNormalizedProblemKey(probData));
    return probData;
  };

  // Initialize first problem on mount
  useEffect(() => {
    soundFx.init();
    const firstProb = generateNextProblem(1);
    setCurrentProblem(firstProb);
    problemStartTimeRef.current = performance.now();
  }, []);

  // Physical Keyboard listener
  useEffect(() => {
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
  }, [inputVal, currentProblem]);

  const handleDigitInput = (digit) => {
    if (!currentProblem) return;

    const newInput = inputVal + digit;
    setInputVal(newInput);

    const targetLength = currentProblem.answerString.length;
    if (newInput.length >= targetLength) {
      submitAnswer(newInput, currentProblem);
    }
  };

  const submitAnswer = (userAnswerStr, prob) => {
    const now = performance.now();
    const latencyMs = Math.round(Math.max(10, now - problemStartTimeRef.current));
    const latencySec = latencyMs / 1000;
    const isCorrect = userAnswerStr === prob.answerString;

    if (isCorrect) {
      soundFx.playCorrect();
      setMascotMood('correct');
      consecutiveErrorsRef.current = 0;
    } else {
      soundFx.playIncorrect();
      setMascotMood('incorrect');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      consecutiveErrorsRef.current += 1;
    }

    setTimeout(() => {
      setMascotMood('happy');
      setInputVal('');

      // Evaluate adaptive advancement / termination rules
      const isSlow = latencySec > 5.0;
      const isTooManyErrors = consecutiveErrorsRef.current >= 2;

      // Early Termination condition
      if (!isCorrect && (isTooManyErrors || isSlow)) {
        finishDiagnosticTest();
        return;
      }

      if (isCorrect && latencySec <= 3.5) {
        // High mastery: update highest passed tier
        highestPassedTierRef.current = Math.max(highestPassedTierRef.current, currentTierLevel);
      }

      // Progression logic
      let nextTier = currentTierLevel;
      let nextCount = tierProblemCount + 1;

      if (nextCount >= 2) {
        // Advance to next tier level if correct or fast
        if (isCorrect && currentTierLevel < 8 && !isSlow) {
          nextTier = currentTierLevel + 1;
          nextCount = 0;
        } else {
          // Completed current tier block, finish diagnostic test
          finishDiagnosticTest();
          return;
        }
      }

      if (questionNumberRef.current >= 10 || nextTier > 8) {
        finishDiagnosticTest();
        return;
      }

      questionNumberRef.current += 1;
      setCurrentTierLevel(nextTier);
      setTierProblemCount(nextCount);

      const nextProb = generateNextProblem(nextTier);
      setCurrentProblem(nextProb);
      problemStartTimeRef.current = performance.now();
    }, isCorrect ? 200 : 450);
  };

  const finishDiagnosticTest = () => {
    const placedTier = Math.min(8, Math.max(1, highestPassedTierRef.current));
    soundFx.playVictory();
    onCompletePlacement(placedTier);
  };

  if (!currentProblem) return null;

  const currentTierMeta = CURRICULUM_TIERS.find((t) => t.tier === currentTierLevel) || CURRICULUM_TIERS[0];

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-between gap-4 py-2 animate-pop">
      {/* Header Bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center text-sm font-bold text-slate-600 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-600" /> Placement Q{questionNumberRef.current} / 10
            </span>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Tier {currentTierLevel}: {currentTierMeta.title}
            </span>
          </div>

          <button
            onClick={onQuitToHome}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors rounded-lg"
            title="Exit Test"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-kibo-orange rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(questionNumberRef.current / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Mascot & Math Display Area */}
      <div className="w-full flex flex-col items-center my-auto">
        <Mascot mood={mascotMood} equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28 mb-3" />

        <div
          className={`w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-card-3d transition-transform ${
            isShaking ? 'animate-shake border-rose-400 bg-rose-50' : ''
          }`}
        >
          <div className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-800 flex items-center justify-center gap-3 flex-wrap">
            <span>{currentProblem.displayString}</span>
            <span className="text-slate-400 font-bold">=</span>
            <span className="inline-block min-w-[70px] px-3 py-1 bg-amber-50 border-3 border-amber-300 rounded-xl text-kibo-teal text-3xl sm:text-4xl font-black shadow-inner">
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
  );
}
