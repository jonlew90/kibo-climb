import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';
import Keypad from './Keypad';
import { generateProblems } from '../utils/mathGenerator';
import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { normalizeTimeAnswer } from '../utils/formatters';

export default function AdaptiveSessionView({
  equippedItems = [],
  sparks = 0,
  streak = 1,
  onAwardSparks,
  onOpenWorkshop,
  userTier = 1
}) {
  const [competenceRank, setCompetenceRank] = useState(userTier * 100);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentTier, setCurrentTier] = useState(userTier);
  const [inputVal, setInputVal] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);

  // Generate adaptive problem queue for active tier
  const [problemQueue, setProblemQueue] = useState(() => generateProblems(5, userTier, []));
  const [currentIndex, setCurrentIndex] = useState(0);

  const problemStartTimeRef = useRef(performance.now());

  const currentProblem = problemQueue[currentIndex] || {
    num1: 12,
    num2: 8,
    operatorSymbol: '+',
    answer: 20,
    answerString: '20'
  };

  useEffect(() => {
    problemStartTimeRef.current = performance.now();
  }, [currentIndex]);

  // Ensure new problems generated dynamically when queue gets low
  const replenishQueueIfNeeded = (nextIndex) => {
    if (nextIndex >= problemQueue.length - 2) {
      const nextTier = Math.min(8, Math.max(1, Math.floor(competenceRank / 100)));
      const newBatch = generateProblems(5, nextTier, []);
      setProblemQueue((prev) => [...prev, ...newBatch]);
    }
  };

  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString.trim()) return;

    const normUserAns = normalizeTimeAnswer(userAnsString);
    const normTargetAns = normalizeTimeAnswer(currentProblem.answerString || currentProblem.answer?.toString());
    const isCorrect = normUserAns === normTargetAns || Number(userAnsString) === Number(currentProblem.answer);

    if (isCorrect) {
      soundFx.playCorrect();
      setCorrectCount((prev) => prev + 1);
      const earned = 2;
      setSessionSparksEarned((prev) => prev + earned);
      if (onAwardSparks) onAwardSparks(earned);

      // Adaptive Competence Rank Increase (+10 points)
      setCompetenceRank((prev) => prev + 10);
      setFeedbackBanner({ type: 'success', text: `Correct! Competence Rank +10 ⭐ (+2⚡ Sparks)` });
    } else {
      soundFx.playIncorrect();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);

      // Adaptive Regression (-5 points)
      setCompetenceRank((prev) => Math.max(50, prev - 5));
      setFeedbackBanner({ type: 'error', text: `Incorrect! Answer was ${normTargetAns}` });
    }

    setQuestionsAnswered((prev) => prev + 1);
    setInputVal('');

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setCurrentIndex(nextIdx);

    // Auto-dismiss banner after 1.5s
    setTimeout(() => {
      setFeedbackBanner(null);
    }, 1500);
  };

  const handleDigitInput = (val) => {
    soundFx.playKeyTap();
    const newInput = (inputVal + val).trim();

    const normUserAns = normalizeTimeAnswer(newInput);
    const normTargetAns = normalizeTimeAnswer(currentProblem.answerString || currentProblem.answer?.toString());

    // Auto-detect instant match
    if (normUserAns === normTargetAns || Number(newInput) === Number(currentProblem.answer)) {
      processAnswerEvaluation(newInput);
      return;
    }

    // Auto-detect max length mismatch
    if (newInput.length >= normTargetAns.length) {
      processAnswerEvaluation(newInput);
      return;
    }

    setInputVal(newInput);
  };

  const handleDeleteDigit = () => {
    soundFx.playKeyTap();
    setInputVal((prev) => prev.slice(0, -1));
  };

  const handleClearInput = () => {
    soundFx.playKeyTap();
    setInputVal('');
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-2 px-3 max-w-lg mx-auto relative animate-pop">
      {/* MECHANICAL TRANSIENT FEEDBACK TOAST (SLIDES DOWN FROM TOP HUD) */}
      <div
        className={`absolute inset-x-4 z-50 transition-all duration-300 pointer-events-none ${
          feedbackBanner ? 'top-0 opacity-100 scale-100' : '-top-12 opacity-0 scale-95'
        }`}
      >
        <div
          className={`py-2 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md border ${
            feedbackBanner?.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400 shadow-emerald-950/20'
              : 'bg-rose-500/95 text-white border-rose-400 shadow-rose-950/20'
          }`}
        >
          {feedbackBanner?.text}
        </div>
      </div>

      {/* MASCOT & PROBLEM CARD CONTAINER */}
      <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
        {/* Animated Kibo Avatar */}
        <div
          onClick={onOpenWorkshop}
          className="cursor-pointer hover:scale-105 transition-transform"
          title="Tap Kibo to customize in Workshop!"
        >
          <Mascot mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'} equipped={equippedItems} className="w-28 h-28 sm:w-32 sm:h-32 filter drop-shadow-xl" />
        </div>

        {/* ACTIVE ADAPTIVE MATH QUESTION CARD */}
        <div
          className={`w-full bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3 transition-transform ${
            isShaking ? 'animate-shake border-rose-400 bg-rose-50/50' : ''
          }`}
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              ⚡ Question #{questionsAnswered + 1}
            </span>
            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1 shadow-xs">
              <Trophy className="w-3 h-3 text-amber-600 stroke-[2.5]" />
              Competence Rank: {competenceRank}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3 flex-wrap my-1">
            <span>{currentProblem.displayString || `${currentProblem.num1} ${currentProblem.operatorSymbol} ${currentProblem.num2}`}</span>
            <span className="text-slate-400 font-bold">=</span>

            {/* Answer Display */}
            <span className="inline-block min-w-[70px] px-3.5 py-1 bg-amber-50 border-3 border-amber-300 rounded-2xl text-kibo-teal font-black text-3xl sm:text-4xl shadow-inner">
              {inputVal ? inputVal : <span className="text-slate-300 animate-pulse font-normal">?</span>}
            </span>
          </div>
        </div>
      </div>

      {/* NUMERIC KEYPAD (AUTO-DETECTING) */}
      <div className="w-full max-w-sm mt-3 shrink-0">
        <Keypad
          onDigit={handleDigitInput}
          onDelete={handleDeleteDigit}
          onClear={handleClearInput}
          onSubmit={() => processAnswerEvaluation(inputVal)}
        />
      </div>
    </div>
  );
}
