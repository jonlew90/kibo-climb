import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';
import Keypad from './Keypad';
import { generateProblems } from '../utils/mathGenerator';
import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { normalizeTimeAnswer, normalizeDecimal } from '../utils/formatters';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents } from '../utils/AdaptiveEngine';
import KiboBreakOverlay from './KiboBreakOverlay';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateBadges } from '../utils/badgeManager';
import { storageService } from '../services/storageService';

function getStreakTierConfig(streak) {
  if (streak >= 15) {
    return {
      label: `⚡ ${streak} ULTRA INFERNO (3x)`,
      pillClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white border-yellow-300 shadow-md shadow-purple-500/40 ring-2 ring-yellow-300 animate-pulse',
      cardGlow: 'shadow-[0_0_35px_rgba(168,85,247,0.4)] border-purple-400 bg-gradient-to-b from-white via-purple-50/20 to-amber-50/30'
    };
  }
  if (streak >= 10) {
    return {
      label: `💥 ${streak} SUPER NOVA (2x)`,
      pillClass: 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-white border-red-300 shadow-md shadow-orange-500/30 ring-2 ring-orange-400 animate-pulse',
      cardGlow: 'shadow-[0_0_25px_rgba(249,115,22,0.35)] border-orange-400 bg-gradient-to-b from-white via-orange-50/20 to-amber-50/30'
    };
  }
  if (streak >= 5) {
    return {
      label: `🔥 ${streak} Streak (1.5x)`,
      pillClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300 shadow-sm ring-1 ring-amber-400 animate-pulse',
      cardGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)] border-amber-400'
    };
  }
  if (streak >= 3) {
    return {
      label: `🔥 ${streak} Streak`,
      pillClass: 'text-orange-700 bg-orange-100 border-orange-300 animate-pulse shadow-xs',
      cardGlow: 'border-amber-300 shadow-2xl'
    };
  }
  return {
    label: `🔥 ${streak} Streak`,
    pillClass: 'text-slate-500 bg-slate-100 border-slate-200',
    cardGlow: 'border-amber-300 shadow-2xl'
  };
}

export default function AdaptiveSessionView({
  equippedItems = [],
  sparks = 0,
  streak = 1,
  onAwardSparks,
  onOpenWorkshop,
  onIncrementLifetimeProblems,
  onUpdatePersonalRecords,
  onUnlockedBadgesChange,
  userTier = 1,
  totalProblemsSolved = 0,
  isFTUX = false,
  isDoubleSparksActive = false
}) {
  const [competenceRank, setCompetenceRank] = useState(1000);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [blockCorrectCount, setBlockCorrectCount] = useState(0);
  const [blockSparksEarned, setBlockSparksEarned] = useState(0);
  const [blockRatingGain, setBlockRatingGain] = useState(0);
  const [currentTier, setCurrentTier] = useState(userTier);
  const [inputVal, setInputVal] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);

  // Character Animation & Audio State
  const [mascotState, setMascotState] = useState('idle');

  // In-session Streaks & Overlays
  const [inSessionStreak, setInSessionStreak] = useState(0);
  const [inSessionIncorrectStreak, setInSessionIncorrectStreak] = useState(0);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showFrustrationCard, setShowFrustrationCard] = useState(false);

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(performance.now());

  // Generate adaptive problem queue for active tier
  const [problemQueue, setProblemQueue] = useState(() => {
    const seen = new Set();
    const batch = generateProblems(15, isFTUX ? 1 : userTier, [], seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const problemStartTimeRef = useRef(performance.now());

  const currentProblem = problemQueue[currentIndex] || {
    num1: 12,
    num2: 8,
    operatorSymbol: '+',
    answer: 20,
    answerString: '20'
  };

  const targetStr = (currentProblem.answerString || currentProblem.answer?.toString() || '');
  const isMoneyQuestion = currentProblem.type === 'money' || currentProblem.requiresDecimal || targetStr.includes('.') || currentProblem.operatorSymbol === '🪙' || (currentProblem.displayString && (currentProblem.displayString.includes('$') || currentProblem.displayString.includes('¢') || currentProblem.displayString.includes('Change')));
  const isTimeQuestion = currentProblem.type === 'time' || currentProblem.requiresColon || targetStr.includes(':') || currentProblem.operatorSymbol === '⏰' || (currentProblem.displayString && (currentProblem.displayString.includes('time') || currentProblem.displayString.includes('Hike started')));

  useEffect(() => {
    problemStartTimeRef.current = performance.now();

    if (isMoneyQuestion && targetStr.startsWith('0.')) {
      setInputVal('0.');
    } else {
      setInputVal('');
    }
  }, [currentIndex, currentProblem, isMoneyQuestion, targetStr]);

  useEffect(() => {
    if (isFTUX) {
      setFeedbackBanner({
        type: 'success',
        text: "Welcome to Kibo Climb! Let's start your organic climb! 🏔️✨"
      });
      setTimeout(() => {
        setFeedbackBanner(null);
      }, 3000);
    }
  }, [isFTUX]);

  // Ensure new problems generated dynamically when queue gets low (deduplicated across active block)
  const replenishQueueIfNeeded = (nextIndex) => {
    if (nextIndex >= problemQueue.length - 3) {
      const nextTier = Math.min(8, Math.max(1, Math.floor(competenceRank / 100)));
      const newBatch = generateProblems(6, nextTier, [], blockSeenKeysRef.current);
      setProblemQueue((prev) => [...prev, ...newBatch]);
    }
  };

  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString || !userAnsString.trim()) return;

    const normUserAns = normalizeTimeAnswer(normalizeDecimal(userAnsString));
    const normTargetAns = normalizeTimeAnswer(normalizeDecimal(currentProblem.answerString || currentProblem.answer?.toString()));

    const userNum = Number(normalizeDecimal(userAnsString));
    const targetNum = Number(normalizeDecimal(currentProblem.answerString || currentProblem.answer));

    const isMoneyMatch =
      isMoneyQuestion &&
      !isNaN(userNum) &&
      !isNaN(targetNum) &&
      (Math.abs(userNum - targetNum) < 0.001 ||
       Math.abs(userNum * 100 - targetNum) < 0.001 ||
       Math.abs(userNum / 100 - targetNum) < 0.001);

    const isNumMatch = !isNaN(userNum) && !isNaN(targetNum) && userNum === targetNum;

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch;
    const latencyMs = performance.now() - problemStartTimeRef.current;

    const evalResult = evaluateAdaptiveAttempt({
      isCorrect,
      latencyMs,
      currentCompetenceRank: competenceRank,
      inSessionStreak,
      inSessionIncorrectStreak,
      totalProblemsSolved,
      isProbeQuestion: !!currentProblem.isProbe
    });

    // Update streak states
    setInSessionStreak(evalResult.nextInSessionStreak);
    setInSessionIncorrectStreak(evalResult.nextInSessionIncorrectStreak);
    let blockEarned = 0;
    if (isCorrect) {
      if (evalResult.nextInSessionStreak >= 3) {
        KiboAudioManager.playStreakSFX();
        setMascotState('streak');
      } else {
        KiboAudioManager.playCorrectSFX();
        setMascotState('correct');
      }
      setTimeout(() => setMascotState('idle'), 700);

      setCorrectCount((prev) => prev + 1);
      setBlockCorrectCount((prev) => prev + 1);
      const baseEarned = evalResult.totalSparksEarned;
      blockEarned = isDoubleSparksActive ? baseEarned * 2 : baseEarned;
      setSessionSparksEarned((prev) => prev + blockEarned);
      setBlockSparksEarned((prev) => prev + blockEarned);
      if (onAwardSparks) onAwardSparks(blockEarned);

      setCompetenceRank(evalResult.nextCompetenceRank);
      setShowFrustrationCard(false);

      const boostLabel = isDoubleSparksActive ? ' (2x Potion 🧪)' : '';
      const toastMsg = evalResult.streakBannerText ? `${evalResult.streakBannerText}${boostLabel}` : `Correct! Competence Rank +${evalResult.rankDelta} ⭐ (${evalResult.fluencyLabel})${boostLabel}`;
      setFeedbackBanner({
        type: 'success',
        text: toastMsg
      });
    } else {
      KiboAudioManager.playIncorrectSFX();
      setMascotState('incorrect');
      setTimeout(() => setMascotState('idle'), 500);

      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);

      setCompetenceRank(evalResult.nextCompetenceRank);
      setFeedbackBanner({ type: 'error', text: `Incorrect! Answer was ${normTargetAns}` });

      if (evalResult.triggerFrustrationCircuit) {
        setShowFrustrationCard(true);
      }
    }

    const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
    setBlockRatingGain(nextBlockRatingGain);

    storageService.saveUserData({
      adaptiveCompetenceRating: evalResult.nextCompetenceRank,
      competenceRank: evalResult.nextCompetenceRank
    });

    const activeUserData = storageService.getUserData();
    const badgeEvalRes = evaluateBadges({
      ...activeUserData,
      inSessionStreak: evalResult.nextInSessionStreak,
      competenceRank: evalResult.nextCompetenceRank,
      blockRatingGain: nextBlockRatingGain
    });

    if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
      onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
    }

    const existingMastery = activeUserData.recentSkillMastery || [];
    const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
    if (updatedMastery.length !== existingMastery.length) {
      storageService.saveUserData({ recentSkillMastery: updatedMastery });
    }

    const nextQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);
    if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(isCorrect);
    setInputVal('');

    // Trigger Kibo Break Overlay every 12 problems solved & record personal bests
    if (nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0) {
      KiboAudioManager.playBreakSFX();
      setMascotState('break');
      setShowBreakOverlay(true);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = isCorrect ? blockCorrectCount + 1 : blockCorrectCount;
      const isPerfectBlock = finalBlockCorrect === 12;

      const currentRecords = activeUserData.personalRecords || {};

      const updatedRecords = {
        ...currentRecords,
        fastest12QuestionsTime: (!currentRecords.fastest12QuestionsTime || blockTimeSec < currentRecords.fastest12QuestionsTime)
          ? blockTimeSec
          : currentRecords.fastest12QuestionsTime,
        mostPerfectSessions: isPerfectBlock
          ? (currentRecords.mostPerfectSessions || 0) + 1
          : (currentRecords.mostPerfectSessions || 0)
      };

      storageService.saveUserData({ personalRecords: updatedRecords });
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
    }

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setCurrentIndex(nextIdx);

    setTimeout(() => {
      setFeedbackBanner(null);
    }, 1800);
  };

  const handleDigitInput = (val) => {
    soundFx.playKeyTap();

    let newInput = inputVal;

    if (val === '.' || val === ':') {
      if (val === '.') {
        if (!newInput || newInput === '0') {
          newInput = '0.';
        } else if (!newInput.includes('.')) {
          newInput = newInput + '.';
        }
      } else if (val === ':') {
        if (!newInput.includes(':')) {
          newInput = newInput + ':';
        }
      }
    } else {
      if (isMoneyQuestion && targetStr.includes('.')) {
        if (!newInput || newInput === '0') {
          newInput = '0.' + val;
        } else if ((newInput === '0.' || newInput === '.') && val !== '.') {
          newInput = '0.' + val;
        } else {
          newInput = newInput + val;
        }
      } else if (isTimeQuestion && targetStr.includes(':')) {
        const parts = targetStr.split(':');
        const hourDigits = parts[0] ? parts[0].length : 1;
        const rawDigits = (newInput + val).replace(/[^0-9]/g, '');

        if (rawDigits.length >= hourDigits && !newInput.includes(':')) {
          const hours = rawDigits.slice(0, hourDigits);
          const mins = rawDigits.slice(hourDigits);
          newInput = `${hours}:${mins}`;
        } else {
          newInput = newInput + val;
        }
      } else {
        if (newInput === '.') {
          newInput = '0.' + val;
        } else {
          newInput = newInput + val;
        }
      }
    }

    newInput = newInput.trim();

    const normUserAns = normalizeTimeAnswer(normalizeDecimal(newInput));
    const normTargetAns = normalizeTimeAnswer(normalizeDecimal(targetStr));
    const userNum = Number(normalizeDecimal(newInput));
    const targetNum = Number(normalizeDecimal(targetStr));
    const isNumMatch = !isNaN(userNum) && !isNaN(targetNum) && userNum === targetNum;

    const isMoneyMatch =
      isMoneyQuestion &&
      !isNaN(userNum) &&
      !isNaN(targetNum) &&
      (Math.abs(userNum - targetNum) < 0.001 ||
       Math.abs(userNum * 100 - targetNum) < 0.001 ||
       Math.abs(userNum / 100 - targetNum) < 0.001);

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch;

    // Auto-detect instant match
    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    // Auto-detect max length mismatch (excluding leading "0." or "." so decimal is not counted as a digit)
    const extractDigits = (str) => {
      let s = String(str || '').replace('$', '').replace('¢', '').trim();
      if (s.startsWith('0.')) s = s.slice(2);
      else if (s.startsWith('.')) s = s.slice(1);
      else s = s.replace('.', '');
      return s.replace(/\D/g, '');
    };

    const userDigits = extractDigits(newInput);
    const targetDigits = extractDigits(targetStr);

    if (userDigits.length > 0 && targetDigits.length > 0 && userDigits.length >= targetDigits.length) {
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

  const handleSubmit = () => {
    if (!inputVal) return;
    processAnswerEvaluation(inputVal);
  };

  const currentQuestionNum = ((sessionQuestionIndex - 1) % 12) + 1;

  // Physical Desktop Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (/^[0-9]$/.test(e.key) || e.key === '.' || e.key === ':') {
        e.preventDefault();
        handleDigitInput(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleDigitInput('Yes');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleDigitInput('No');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputVal, currentProblem, competenceRank]);

  const lastBannerTypeRef = useRef('success');
  const lastBannerTextRef = useRef('');

  if (feedbackBanner && feedbackBanner.text) {
    lastBannerTypeRef.current = feedbackBanner.type || 'success';
    lastBannerTextRef.current = feedbackBanner.text || '';
  }

  const activeBannerType = feedbackBanner ? (feedbackBanner.type || 'success') : lastBannerTypeRef.current;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-2 px-3 max-w-lg mx-auto relative animate-pop">
      {/* TIMED KIBO BREAK OVERLAY */}
      {showBreakOverlay && (
        <KiboBreakOverlay
          correctCount={blockCorrectCount}
          totalCount={12}
          streak={inSessionStreak}
          sparksEarned={blockSparksEarned}
          competenceRating={competenceRank}
          equippedItems={equippedItems}
          onOpenWorkshop={() => {
            setShowBreakOverlay(false);
            if (onOpenWorkshop) onOpenWorkshop();
          }}
          onResumeClimb={() => {
            setShowBreakOverlay(false);
            setSessionQuestionIndex(1);
            setBlockCorrectCount(0);
            setBlockSparksEarned(0);
            setBlockRatingGain(0);
            blockSeenKeysRef.current.clear();
            blockStartTimeRef.current = performance.now();
            const nextTier = Math.min(8, Math.max(1, Math.floor(competenceRank / 100)));
            const freshBatch = generateProblems(15, nextTier, [], blockSeenKeysRef.current);
            setProblemQueue(freshBatch);
            setCurrentIndex(0);
          }}
        />
      )}

      {/* MECHANICAL TRANSIENT FEEDBACK TOAST (SLIDES DOWN FROM TOP HUD) */}
      <div
        className={`absolute inset-x-4 z-50 transition-all duration-300 pointer-events-none ${
          feedbackBanner ? 'top-0 opacity-100 scale-100' : '-top-12 opacity-0 scale-95'
        }`}
      >
        <div
          className={`py-2 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md border ${
            activeBannerType === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400 shadow-emerald-950/20'
              : 'bg-rose-500/95 text-white border-rose-400 shadow-rose-950/20'
          }`}
        >
          {feedbackBanner?.text || lastBannerTextRef.current}
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
          <Mascot mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'} state={mascotState} equipped={equippedItems} className="w-28 h-28 sm:w-32 sm:h-32 filter drop-shadow-xl" />
        </div>

        {/* FRUSTRATION CIRCUIT BREAKER SUPPORT CARD */}
        {showFrustrationCard && (
          <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 text-center space-y-1 animate-pop">
            <p className="text-xs font-black text-indigo-900">
              💪 Don't give up! Kibo is right here with you. Take your time!
            </p>
            {currentProblem.hint && (
              <p className="text-[11px] font-bold text-indigo-700 italic">
                {currentProblem.hint}
              </p>
            )}
          </div>
        )}

        {/* ACTIVE ADAPTIVE MATH QUESTION CARD */}
        {(() => {
          const streakCfg = getStreakTierConfig(inSessionStreak);

          return (
            <div
              className={`w-full bg-white border-4 rounded-3xl p-5 text-center transition-all duration-500 space-y-3 relative ${
                streakCfg.cardGlow
              } ${isShaking ? 'animate-shake border-rose-400 bg-rose-50/50' : ''}`}
            >
              {/* Floating Ambient Sparkles for High Streaks */}
              {inSessionStreak >= 5 && (
                <div className="absolute -top-3 left-4 right-4 flex justify-between pointer-events-none z-10">
                  <span className="text-sm animate-bounce text-amber-400 filter drop-shadow-xs">✨</span>
                  <span className="text-sm animate-pulse text-orange-500 filter drop-shadow-xs">🔥</span>
                  <span className="text-sm animate-bounce text-yellow-400 filter drop-shadow-xs">⚡</span>
                </div>
              )}

              <div className="h-7 flex items-center justify-center gap-1.5 shrink-0 overflow-hidden">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                  ⚡ Q #{currentQuestionNum}/12
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${streakCfg.pillClass}`}
                >
                  {streakCfg.label}
                </span>
                {isDoubleSparksActive && (
                  <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse shrink-0">
                    🧪 2x
                  </span>
                )}
                <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-xs shrink-0">
                  <Trophy className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                  Rank: {competenceRank}
                </span>
              </div>

          <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3 flex-wrap my-1">
            {(() => {
              const rawDisplay = currentProblem.displayString || `${currentProblem.num1} ${currentProblem.operatorSymbol} ${currentProblem.num2}`;
              const cleanDisplay = rawDisplay.replace(/\s*=\s*\?\s*¢?/gi, '').replace(/\s*=\s*\?\s*cents?/gi, '').trim();
              const hasQuestionSuffix = cleanDisplay.endsWith('?') || cleanDisplay.includes('Change?') || cleanDisplay.includes('Leftover?') || cleanDisplay.includes('End time?');

              return (
                <>
                  <span>{cleanDisplay}</span>
                  {!hasQuestionSuffix && <span className="text-slate-400 font-bold">=</span>}
                </>
              );
            })()}

            {/* Answer Display */}
            <span className="inline-block min-w-[70px] px-3.5 py-1 bg-amber-50 border-3 border-amber-300 rounded-2xl text-kibo-teal font-black text-3xl sm:text-4xl shadow-inner">
              {inputVal ? inputVal : <span className="text-slate-300 animate-pulse font-normal">?</span>}
            </span>
            </div>
          </div>
        );
      })()}
      </div>

      {/* NUMERIC KEYPAD (AUTO-DETECTING & TYPE AWARE) */}
      <div className="w-full max-w-sm mt-3 shrink-0">
        <Keypad
          onDigit={handleDigitInput}
          onDelete={handleDeleteDigit}
          onClear={handleClearInput}
          onSubmit={() => processAnswerEvaluation(inputVal)}
          problemType={currentProblem.type || (isMoneyQuestion ? 'money' : isTimeQuestion ? 'time' : '')}
          answerString={currentProblem.answerString || currentProblem.answer?.toString()}
          displayString={currentProblem.displayString}
          operatorSymbol={currentProblem.operatorSymbol}
          options={currentProblem.options}
        />
      </div>
    </div>
  );
}
