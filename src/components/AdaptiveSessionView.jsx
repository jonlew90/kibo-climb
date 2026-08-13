import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';
import Keypad from './Keypad';
import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import { generateProblems } from '../utils/mathGenerator';
import { getTierFromRating, generateTierProblem, isNearTierThreshold } from '../utils/curriculum';
import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { normalizeTimeAnswer, normalizeDecimal, parseFractionValue } from '../utils/formatters';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents, shouldTriggerProbeQuestion } from '../utils/AdaptiveEngine';
import { getProbeTargetTier } from '../utils/SkillTreeConfig';
import KiboBreakOverlay from './KiboBreakOverlay';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateBadges } from '../utils/badgeManager';
import { storageService } from '../services/storageService';
import { getConceptForProblem } from '../utils/skipDiagnosticEngine';

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
      label: `🔥 ${streak} ON FIRE`,
      pillClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 shadow-sm animate-pulse',
      cardGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)] border-amber-400'
    };
  }
  return {
    label: `🔥 ${streak} STREAK`,
    pillClass: 'bg-slate-100 text-slate-700 border-slate-300',
    cardGlow: 'border-slate-300 hover:border-slate-400'
  };
}

export default function AdaptiveSessionView({
  profileId,
  isPaused = false,
  equippedItems = [],
  sparks = 0,
  streak = 0,
  onOpenWorkshop,
  onAwardSparks,
  onIncrementLifetimeProblems,
  onRecordDailyPractice,
  onUpdatePersonalRecords,
  onUnlockedBadgesChange,
  onUpdateCompetenceRating,
  userTier = 1,
  totalProblemsSolved = 0,
  isFTUX = false,
  isDoubleSparksActive = false,
  consumables = {},
  onToggleDoubleSparksPotion,
  onConsumeHintScroll,
  onConsumeShield,
  onResetDoubleSparks
}) {
  const [competenceRank, setCompetenceRank] = useState(() => {
    return storageService.getUserData().adaptiveCompetenceRating || storageService.getUserData().competenceRank || 1000;
  });
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [blockCorrectCount, setBlockCorrectCount] = useState(0);
  const [blockSparksEarned, setBlockSparksEarned] = useState(0);
  const [blockRatingGain, setBlockRatingGain] = useState(0);
  const [blockShieldsUsed, setBlockShieldsUsed] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  const [completedBlockStats, setCompletedBlockStats] = useState({
    correctCount: 12,
    sparksEarned: 0,
    blockRatingGain: 0,
    shieldsUsed: 0
  });

  const [inputVal, setInputVal] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);

  // Character Animation & Audio State
  const [mascotState, setMascotState] = useState('idle');

  // In-session Streaks & Overlays
  const [inSessionStreak, setInSessionStreak] = useState(0);
  const [inSessionIncorrectStreak, setInSessionIncorrectStreak] = useState(0);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showFrustrationCard, setShowFrustrationCard] = useState(false);
  const [celebrationEvent, setCelebrationEvent] = useState(null);

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [savedClimbState, setSavedClimbState] = useState(() => {
    return storageService.getActiveClimbState(profileId);
  });

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(0);

  // Sync saved climb state when active profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId);
    setSavedClimbState(saved);
  }, [profileId]);

  // Generate adaptive problem queue for active tier based on competence rating
  const [problemQueue, setProblemQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId);
    if (saved && saved.problemQueue && saved.problemQueue.length > 0) {
      return saved.problemQueue;
    }
    const seen = new Set();
    const currentRating = storageService.getUserData().adaptiveCompetenceRating || storageService.getUserData().competenceRank || 1000;
    const activeTier = isFTUX ? 1 : getTierFromRating(currentRating);
    const batch = generateProblems(15, activeTier, [], seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldPulseHint, setShouldPulseHint] = useState(false);

  const currentProblem = problemQueue[currentIndex] || {};
  const isMoneyQuestion =
    currentProblem.type === 'money' ||
    currentProblem.operatorSymbol === '🪙' ||
    /quarter|dime|nickel|penny|\$|¢|change|costing/i.test(currentProblem.displayString || '');
  const isTimeQuestion = currentProblem.type === 'time';
  const targetStr = String(currentProblem.answerString || currentProblem.answer || '');

  const problemStartTimeRef = useRef(0);
  const pauseStartRef = useRef(null);

  const saveCurrentClimbProgress = () => {
    if (!hasStartedClimb || showBreakOverlay) return;
    if (sessionQuestionIndex > 12 || (questionsAnswered > 0 && questionsAnswered % 12 === 0)) return;

    const now = performance.now();
    const currentPause = pauseStartRef.current ? (now - pauseStartRef.current) : 0;

    let accumulatedBlockTime = 0;
    let accumulatedProblemTime = 0;

    if (blockStartTimeRef.current > 0) {
      accumulatedBlockTime = Math.max(0, now - blockStartTimeRef.current - currentPause);
    }
    if (problemStartTimeRef.current > 0) {
      accumulatedProblemTime = Math.max(0, now - problemStartTimeRef.current - currentPause);
    }

    const climbState = {
      version: 1,
      savedAt: Date.now(),
      problemQueue,
      currentIndex,
      sessionQuestionIndex,
      questionsAnswered,
      correctCount,
      blockCorrectCount,
      blockSparksEarned,
      sessionSparksEarned,
      blockRatingGain,
      mistakeCount,
      inSessionStreak,
      inSessionIncorrectStreak,
      consecutiveSkips,
      competenceRank,
      accumulatedBlockTime,
      accumulatedProblemTime,
      isDoubleSparksActive
    };

    storageService.saveActiveClimbState(climbState, profileId);
    setSavedClimbState(climbState);
  };

  const handleStartClimb = () => {
    soundFx.playKeyTap();
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId);
    setSavedClimbState(null);
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    const saved = storageService.getActiveClimbState(profileId);
    if (saved) {
      if (saved.problemQueue && saved.problemQueue.length > 0) {
        setProblemQueue(saved.problemQueue);
      }
      setCurrentIndex(saved.currentIndex || 0);
      setSessionQuestionIndex(saved.sessionQuestionIndex || 1);
      setQuestionsAnswered(saved.questionsAnswered || 0);
      setCorrectCount(saved.correctCount || 0);
      setBlockCorrectCount(saved.blockCorrectCount || 0);
      setBlockSparksEarned(saved.blockSparksEarned || 0);
      setSessionSparksEarned(saved.sessionSparksEarned || 0);
      setBlockRatingGain(saved.blockRatingGain || 0);
      setMistakeCount(saved.mistakeCount || 0);
      setInSessionStreak(saved.inSessionStreak || 0);
      setInSessionIncorrectStreak(saved.inSessionIncorrectStreak || 0);
      setConsecutiveSkips(saved.consecutiveSkips || 0);
      if (saved.competenceRank) setCompetenceRank(saved.competenceRank);

      const now = performance.now();
      const blockTime = saved.accumulatedBlockTime || 0;
      const probTime = saved.accumulatedProblemTime || 0;

      blockStartTimeRef.current = now - blockTime;
      problemStartTimeRef.current = now - probTime;
      pauseStartRef.current = null;
    } else {
      blockStartTimeRef.current = performance.now();
      problemStartTimeRef.current = performance.now();
    }
    setHasStartedClimb(true);
  };


  // Continuous background saving while climbing
  useEffect(() => {
    if (hasStartedClimb) {
      saveCurrentClimbProgress();
    }
  }, [
    hasStartedClimb,
    currentIndex,
    sessionQuestionIndex,
    questionsAnswered,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    mistakeCount,
    inSessionStreak,
    inSessionIncorrectStreak,
    consecutiveSkips,
    competenceRank,
    isDoubleSparksActive
  ]);

  // Window unload / unmount saving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasStartedClimb) {
        saveCurrentClimbProgress();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (hasStartedClimb) {
        saveCurrentClimbProgress();
      }
    };
  }, [
    hasStartedClimb,
    profileId,
    problemQueue,
    currentIndex,
    sessionQuestionIndex,
    questionsAnswered,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    mistakeCount,
    inSessionStreak,
    inSessionIncorrectStreak,
    consecutiveSkips,
    competenceRank,
    isDoubleSparksActive
  ]);

  // Handle modal pausing logic
  useEffect(() => {
    if (isPaused) {
      if (!pauseStartRef.current) {
        pauseStartRef.current = performance.now();
      }
    } else if (pauseStartRef.current) {
      const pauseDuration = performance.now() - pauseStartRef.current;
      if (problemStartTimeRef.current !== null && problemStartTimeRef.current !== 0) {
        problemStartTimeRef.current += pauseDuration;
      }
      if (blockStartTimeRef.current !== null && blockStartTimeRef.current !== 0) {
        blockStartTimeRef.current += pauseDuration;
      }
      pauseStartRef.current = null;
    }
  }, [isPaused]);

  // Handle Tab Visibility & Navigating Away pausing/resume logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!pauseStartRef.current) {
          pauseStartRef.current = performance.now();
        }
        if (hasStartedClimb) {
          saveCurrentClimbProgress();
          setHasStartedClimb(false);
        }
      } else {
        const saved = storageService.getActiveClimbState(profileId);
        setSavedClimbState(saved);
        if (pauseStartRef.current && !isPaused) {
          const pauseDuration = performance.now() - pauseStartRef.current;
          if (problemStartTimeRef.current !== null && problemStartTimeRef.current !== 0) {
            problemStartTimeRef.current += pauseDuration;
          }
          if (blockStartTimeRef.current !== null && blockStartTimeRef.current !== 0) {
            blockStartTimeRef.current += pauseDuration;
          }
          pauseStartRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [
    isPaused,
    hasStartedClimb,
    profileId,
    problemQueue,
    currentIndex,
    sessionQuestionIndex,
    questionsAnswered,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    mistakeCount,
    inSessionStreak,
    inSessionIncorrectStreak,
    consecutiveSkips,
    competenceRank,
    isDoubleSparksActive
  ]);

  useEffect(() => {
    if (hasStartedClimb) {
      problemStartTimeRef.current = performance.now();
    } else {
      problemStartTimeRef.current = 0;
    }
    setShouldPulseHint(false);

    const hintTimer = setTimeout(() => {
      setShouldPulseHint(true);
    }, 7000);

    if (isMoneyQuestion && targetStr.startsWith('0.')) {
      setInputVal('0.');
    } else {
      setInputVal('');
    }

    return () => clearTimeout(hintTimer);
  }, [currentIndex, currentProblem, isMoneyQuestion, targetStr, hasStartedClimb]);

  const bannerTimerRef = useRef(null);

  const triggerToastBanner = (bannerObj, durationMs = 1100) => {
    setFeedbackBanner(bannerObj);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, durationMs);
  };

  useEffect(() => {
    triggerToastBanner({
      type: 'success',
      text: "Welcome to Kibo Climb! Let's start your organic climb! 🏔️✨"
    }, 4500);

    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  // Ensure new problems generated dynamically when queue gets low (deduplicated across active block)
  const replenishQueueIfNeeded = (nextIndex) => {
    if (nextIndex >= problemQueue.length - 3) {
      const nextTier = getTierFromRating(competenceRank);
      const newBatch = generateProblems(6, nextTier, [], blockSeenKeysRef.current);
      setProblemQueue((prev) => [...prev, ...newBatch]);
    }
  };

  const handlePassQuestion = () => {
    if (consecutiveSkips >= 2) return;
    soundFx.playKeyTap();

    const timeElapsedSec = problemStartTimeRef.current > 0
      ? (performance.now() - problemStartTimeRef.current) / 1000
      : 1.0;

    const nextConsecutiveSkips = consecutiveSkips + 1;
    setConsecutiveSkips(nextConsecutiveSkips);

    const concept = getConceptForProblem(currentProblem);

    storageService.logSkipEvent({
      problemId: currentProblem.id || `prob_${currentIndex}`,
      concept: concept,
      timeElapsedSec: Number(timeElapsedSec.toFixed(1)),
      consecutiveSkipCount: nextConsecutiveSkips
    });

    const evalResult = evaluateAdaptiveAttempt({
      isCorrect: false,
      isSkip: true,
      latencyMs: timeElapsedSec * 1000,
      currentCompetenceRank: competenceRank,
      inSessionStreak,
      inSessionIncorrectStreak,
      totalProblemsSolved,
      isProbeQuestion: !!currentProblem.isProbe,
      problemTier: currentProblem.tier || getTierFromRating(competenceRank)
    });

    setInSessionStreak(0);
    setCompetenceRank(evalResult.nextCompetenceRank);
    if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

    const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
    setBlockRatingGain(nextBlockRatingGain);

    storageService.saveUserData({
      adaptiveCompetenceRating: evalResult.nextCompetenceRank,
      competenceRank: evalResult.nextCompetenceRank
    });

    triggerToastBanner({
      type: 'success',
      text: 'Trying another problem 🔄'
    }, 1100);

    const nextQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);
    setInputVal('');

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setCurrentIndex(nextIdx);
  };

  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString || !userAnsString.trim()) return;

    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

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

    const isNumMatch = !isNaN(userNum) && !isNaN(targetNum) && (userNum === targetNum || Math.abs(userNum - targetNum) < 0.0001);

    const userFracVal = parseFractionValue(userAnsString);
    const targetFracVal = parseFractionValue(currentProblem.answerString || currentProblem.answer);
    const isReductionQuestion = currentProblem.displayString?.toLowerCase().includes('reduce') || currentProblem.operatorSymbol === '⚡';

    const isFractionMatch =
      ((userFracVal !== null && targetFracVal !== null && Math.abs(userFracVal - targetFracVal) < 0.0001) ||
       (userFracVal !== null && !isNaN(targetNum) && Math.abs(userFracVal - targetNum) < 0.0001) ||
       (targetFracVal !== null && !isNaN(userNum) && Math.abs(userNum - targetFracVal) < 0.0001)) &&
      (!isReductionQuestion || normUserAns === normTargetAns);


    // Decimal implicit match (e.g. user typed "62" for "6.2" or "35" for "0.35")
    let isDecimalImplicitMatch = false;
    const targetAnsStr = String(currentProblem.answerString || currentProblem.answer || '');
    if (targetAnsStr.includes('.') && !userAnsString.includes('.')) {
      const decIndex = targetAnsStr.indexOf('.');
      const decPlaces = targetAnsStr.length - decIndex - 1;
      if (decPlaces > 0 && !isNaN(userNum) && !isNaN(targetNum)) {
        const scaledUserVal = userNum / Math.pow(10, decPlaces);
        if (Math.abs(scaledUserVal - targetNum) < 0.0001) {
          isDecimalImplicitMatch = true;
        }
      }
    }

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch || isFractionMatch || isDecimalImplicitMatch;
    const latencyMs = performance.now() - problemStartTimeRef.current;

    const evalResult = evaluateAdaptiveAttempt({
      isCorrect,
      latencyMs,
      currentCompetenceRank: competenceRank,
      inSessionStreak,
      inSessionIncorrectStreak,
      totalProblemsSolved,
      isProbeQuestion: !!currentProblem.isProbe,
      problemTier: currentProblem.tier || getTierFromRating(competenceRank)
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
      if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);
      setShowFrustrationCard(false);

      // Rapid initial calibration: inject Probe Challenge during Provisional Phase (<15 solved) on 3+ streak
      if (shouldTriggerProbeQuestion({ totalProblemsSolved: totalProblemsSolved + 1, inSessionStreak: evalResult.nextInSessionStreak })) {
        const curTier = getTierFromRating(evalResult.nextCompetenceRank);
        const probeTier = getProbeTargetTier(curTier);
        const probeData = generateTierProblem(probeTier);
        const probeProblem = {
          ...probeData,
          id: `probe-${Date.now()}`,
          isProbe: true
        };

        setProblemQueue((prev) => {
          const updated = [...prev];
          updated.splice(currentIndex + 1, 0, probeProblem);
          return updated;
        });
      }

      const toastMsg = evalResult.streakBannerText ? evalResult.streakBannerText : `Correct! (${evalResult.fluencyLabel})`;
      triggerToastBanner({
        type: 'success',
        text: toastMsg
      }, 1100);
    } else {
      let isShieldAbsorbed = false;
      const ownedShields = (consumables?.shieldCount || 0) + (consumables?.streakSaverCount || 0);

      if (ownedShields > 0 && onConsumeShield) {
        isShieldAbsorbed = onConsumeShield();
        if (isShieldAbsorbed) {
          // Protect the streak!
          setInSessionStreak(inSessionStreak);
        }
      }

      if (isShieldAbsorbed) {
        setBlockShieldsUsed(prev => prev + 1);
        KiboAudioManager.playStreakSFX();
        setMascotState('streak');
        setTimeout(() => setMascotState('idle'), 700);

        triggerToastBanner({
          type: 'success',
          text: `🛡️ Kibo Shield Absorbed the Mistake! (Streak Protected ✨)`
        }, 1800);
      } else {
        KiboAudioManager.playIncorrectSFX();
        setMascotState('incorrect');
        setTimeout(() => setMascotState('idle'), 500);

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);

        const isProbe = currentProblem.isProbe;
        const toastMessage = isProbe
          ? `🚀 Probe missed! Active tier maintained (Answer: ${normTargetAns})`
          : `Incorrect! Answer was ${normTargetAns}`;

        triggerToastBanner({ type: 'error', text: toastMessage }, 1600);
      }

      setCompetenceRank(evalResult.nextCompetenceRank);
      if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

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
      blockRatingGain: nextBlockRatingGain,
      lastProblemType: currentProblem.type,
      lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank)
    });

    if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
      onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
    }

    // --- CELEBRATION REWARDS (ONLY FOR NEW BADGE UNLOCKS TO PREVENT POPUP FATIGUE) ---
    if (isCorrect && badgeEvalRes?.newlyUnlocked && badgeEvalRes.newlyUnlocked.length > 0) {
      // Priority sorting: pick the highest tier/prestigious badge among all newly unlocked badges
      const priorityOrder = [
        'rank_tier8', 'master_prealgebra',
        'rank_tier7', 'master_fractions',
        'rank_tier6',
        'rank_tier5', 'master_time_money',
        'rank_tier4',
        'rank_tier3', 'master_multiplication',
        'rank_tier2',
        'rank_tier1', 'master_addition'
      ];

      const highestBadge = badgeEvalRes.newlyUnlocked.slice().sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      })[0] || badgeEvalRes.newlyUnlocked[badgeEvalRes.newlyUnlocked.length - 1];

      const bonusSparks = 25;
      if (onAwardSparks) onAwardSparks(bonusSparks);
      setSessionSparksEarned((prev) => prev + bonusSparks);
      setBlockSparksEarned((prev) => prev + bonusSparks);
      soundFx.playVictory();
      setCelebrationEvent({
        type: 'badge',
        title: '🏆 NEW BADGE UNLOCKED!',
        icon: highestBadge.icon || '🏅',
        name: highestBadge.title || highestBadge.name,
        description: highestBadge.description,
        bonusSparks: bonusSparks
      });
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

      storageService.clearActiveClimbState(profileId);
      setSavedClimbState(null);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = Math.min(12, isCorrect ? blockCorrectCount + 1 : blockCorrectCount);
      const finalBlockSparks = blockSparksEarned + blockEarned;
      const isPerfectBlock = finalBlockCorrect === 12;

      // RECORD COMPLETED CLIMB BLOCK INTO SPRINT HISTORY FOR ACCURATE PRACTICE TIME TRACKING
      const newSessionRecord = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        tier: getTierFromRating(evalResult.nextCompetenceRank),
        totalTimeSec: blockTimeSec,
        correctCount: finalBlockCorrect,
        totalQuestions: 12,
        sparksEarned: finalBlockSparks,
        accuracyPct: Math.round((finalBlockCorrect / 12) * 100),
        ratingGain: nextBlockRatingGain
      };

      const existingHistory = activeUserData.sprintHistory || [];
      const updatedHistory = [newSessionRecord, ...existingHistory];

      setCompletedBlockStats({
        correctCount: finalBlockCorrect,
        sparksEarned: finalBlockSparks,
        blockRatingGain: nextBlockRatingGain,
        shieldsUsed: blockShieldsUsed
      });

      // Immediately reset block counters to 0 for the next 12-question block
      setBlockCorrectCount(0);
      setBlockSparksEarned(0);
      setBlockRatingGain(0);
      setBlockShieldsUsed(0);

      const currentRecords = activeUserData.personalRecords || {};

      const updatedRecords = {
        ...currentRecords,
        fastest12QuestionsTime: (isPerfectBlock && (!currentRecords.fastest12QuestionsTime || blockTimeSec < currentRecords.fastest12QuestionsTime))
          ? blockTimeSec
          : currentRecords.fastest12QuestionsTime,
        mostPerfectSessions: isPerfectBlock
          ? (currentRecords.mostPerfectSessions || 0) + 1
          : (currentRecords.mostPerfectSessions || 0)
      };

      storageService.saveUserData({
        sprintHistory: updatedHistory,
        personalRecords: updatedRecords
      });
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (onRecordDailyPractice) onRecordDailyPractice();

      // Immediately evaluate and claim any newly met badges at block completion (e.g. 3rd Perfect Run)
      const postBlockUserData = storageService.getUserData();
      const blockBadgeEval = evaluateBadges({
        ...postBlockUserData,
        inSessionStreak: evalResult.nextInSessionStreak,
        competenceRank: evalResult.nextCompetenceRank,
        blockRatingGain: nextBlockRatingGain
      });
      if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
      }
    }

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setCurrentIndex(nextIdx);

    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, 3500);
  };

  const handleDigitInput = (val) => {
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    soundFx.playKeyTap();

    let newInput = inputVal;

    if (val === '.' || val === ':' || val === '/' || val === '-') {
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
      } else if (val === '/') {
        if (!newInput.includes('/')) {
          newInput = newInput + '/';
        }
      } else if (val === '-') {
        if (newInput.startsWith('-')) {
          newInput = newInput.slice(1);
        } else {
          newInput = '-' + newInput;
        }
      }
    } else {
      if (isMoneyQuestion && targetStr.startsWith('0.')) {
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
    const isNumMatch = !isNaN(userNum) && !isNaN(targetNum) && (userNum === targetNum || Math.abs(userNum - targetNum) < 0.0001);
    const isMoneyMatch =
      isMoneyQuestion &&
      !isNaN(userNum) &&
      !isNaN(targetNum) &&
      (Math.abs(userNum - targetNum) < 0.001 ||
       Math.abs(userNum * 100 - targetNum) < 0.001 ||
       Math.abs(userNum / 100 - targetNum) < 0.001);

    const userFracVal = parseFractionValue(newInput);
    const targetFracVal = parseFractionValue(targetStr);
    const isReductionQuestion = currentProblem.displayString?.toLowerCase().includes('reduce') || currentProblem.operatorSymbol === '⚡';

    const isFractionMatch =
      ((userFracVal !== null && targetFracVal !== null && Math.abs(userFracVal - targetFracVal) < 0.0001) ||
       (userFracVal !== null && !isNaN(targetNum) && Math.abs(userFracVal - targetNum) < 0.0001) ||
       (targetFracVal !== null && !isNaN(userNum) && Math.abs(userNum - targetFracVal) < 0.0001)) &&
      (!isReductionQuestion || normUserAns === normTargetAns);

    // Decimal implicit match (e.g. user typed "62" for "6.2" or "35" for "0.35")
    let isDecimalImplicitMatch = false;
    if (targetStr.includes('.') && !newInput.includes('.')) {
      const decIndex = targetStr.indexOf('.');
      const decPlaces = targetStr.length - decIndex - 1;
      if (decPlaces > 0 && !isNaN(userNum) && !isNaN(targetNum)) {
        const scaledUserVal = userNum / Math.pow(10, decPlaces);
        if (Math.abs(scaledUserVal - targetNum) < 0.0001) {
          isDecimalImplicitMatch = true;
        }
      }
    }

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch || isFractionMatch || isDecimalImplicitMatch;

    // Auto-detect instant match
    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    // Auto-detect max length mismatch for standard non-fraction / non-ratio numbers and decimals
    const hasFractionOrRatioSeparator = newInput.includes('/') || newInput.includes(':') || targetStr.includes('/') || targetStr.includes(':');

    if (!hasFractionOrRatioSeparator) {
      if (!targetStr.includes('.') || newInput.includes('.')) {
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
      }
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
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        document.body.style.overflow === 'hidden' ||
        document.querySelector('.z-\\[1000\\]')
      ) {
        return;
      }

      if (!hasStartedClimb) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartClimb();
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (/^[0-9]$/.test(e.key) || e.key === '.' || e.key === ':' || e.key === '/' || e.key === '-') {
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
  }, [inputVal, currentProblem, competenceRank, hasStartedClimb]);

  const lastBannerTypeRef = useRef('success');
  const lastBannerTextRef = useRef('');

  if (feedbackBanner && feedbackBanner.text) {
    lastBannerTypeRef.current = feedbackBanner.type || 'success';
    lastBannerTextRef.current = feedbackBanner.text || '';
  }

  const activeBannerType = feedbackBanner ? (feedbackBanner.type || 'success') : lastBannerTypeRef.current;

  if (showBreakOverlay) {
    return (
      <KiboBreakOverlay
        correctCount={completedBlockStats.correctCount}
        totalCount={12}
        streak={inSessionStreak}
        sparksEarned={completedBlockStats.sparksEarned}
        blockRatingGain={completedBlockStats.blockRatingGain}
        shieldsUsed={completedBlockStats.shieldsUsed}
        competenceRating={competenceRank}
        equippedItems={equippedItems}
        onOpenWorkshop={() => {
          setShowBreakOverlay(false);
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId);
          setSavedClimbState(null);
          setQuestionsAnswered(0);
          setSessionQuestionIndex(1);
          setCorrectCount(0);
          setBlockCorrectCount(0);
          setBlockSparksEarned(0);
          setSessionSparksEarned(0);
          setBlockRatingGain(0);
          setMistakeCount(0);
          setInSessionStreak(0);
          setInSessionIncorrectStreak(0);
          setConsecutiveSkips(0);
          blockSeenKeysRef.current.clear();
          setHasStartedClimb(false);
          blockStartTimeRef.current = 0;
          problemStartTimeRef.current = 0;
          const nextTier = getTierFromRating(competenceRank);
          const freshBatch = generateProblems(15, nextTier, [], blockSeenKeysRef.current);
          setProblemQueue(freshBatch);
          setCurrentIndex(0);
          if (onOpenWorkshop) onOpenWorkshop();
        }}
        onResumeClimb={() => {
          setShowBreakOverlay(false);
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId);
          setSavedClimbState(null);
          setQuestionsAnswered(0);
          setSessionQuestionIndex(1);
          setCorrectCount(0);
          setBlockCorrectCount(0);
          setBlockSparksEarned(0);
          setSessionSparksEarned(0);
          setBlockRatingGain(0);
          setMistakeCount(0);
          setInSessionStreak(0);
          setInSessionIncorrectStreak(0);
          setConsecutiveSkips(0);
          blockSeenKeysRef.current.clear();
          setHasStartedClimb(false);
          blockStartTimeRef.current = 0;
          problemStartTimeRef.current = 0;
          const nextTier = getTierFromRating(competenceRank);
          const freshBatch = generateProblems(15, nextTier, [], blockSeenKeysRef.current);
          setProblemQueue(freshBatch);
          setCurrentIndex(0);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 relative overflow-visible animate-pop flex flex-col">
      <div className="w-full h-full flex flex-col items-center justify-between sm:justify-end pb-1 sm:pb-2 pt-1 px-1.5 sm:px-3 max-w-4xl mx-auto relative overflow-visible flex-1 min-h-0">

      {/* CELEBRATION OVERLAY FOR BADGES, MILESTONES & PERSONAL RECORDS */}
      {celebrationEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-pop">
          <ConfettiCanvas />
          <div className="w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-amber-50 via-white to-yellow-50 border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative overflow-hidden text-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 inline-block shadow-xs">
                {celebrationEvent.title}
              </span>
            </div>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-600 flex items-center justify-center text-4xl shadow-clay-amber animate-pulse">
              {celebrationEvent.icon}
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">{celebrationEvent.name}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {celebrationEvent.description}
              </p>
            </div>

            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-amber-950 font-black text-xs sm:text-sm shadow-xs animate-pulse">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span>+{celebrationEvent.bonusSparks} Bonus Sparks Awarded! ⚡</span>
            </div>

            <button
              onClick={() => setCelebrationEvent(null)}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm sm:text-base py-3 px-6 rounded-2xl shadow-md border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 transition-all"
            >
              Keep Climbing 🚀
            </button>
          </div>
        </div>
      )}

      {/* MECHANICAL TRANSIENT FEEDBACK TOAST (SLIDES DOWN FROM TOP HUD) */}
      <div
        onClick={() => {
          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
          setFeedbackBanner(null);
        }}
        className={`absolute inset-x-4 z-50 transition-all duration-300 ${
          feedbackBanner ? 'top-0 opacity-100 scale-100 pointer-events-auto cursor-pointer' : '-top-12 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          className={`py-2.5 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md border flex items-center justify-between gap-2 ${
            activeBannerType === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40'
              : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
          }`}
        >
          <span className="flex-1 text-center leading-snug">{feedbackBanner?.text || lastBannerTextRef.current}</span>
          <span className="text-xs font-black opacity-80 hover:opacity-100 bg-black/20 px-2 py-0.5 rounded-full shrink-0">✕</span>
        </div>
      </div>

      {/* MASCOT CONTAINER - Centered between sticky header and question card */}
      <div
        className="flex-1 flex flex-col items-center justify-center w-full min-h-0 my-auto py-1 sm:py-2 z-10 overflow-visible"
        title="Tap Kibo!"
      >
        <div className="relative flex items-center justify-center overflow-visible p-1.5 sm:p-3 w-full h-full max-h-[35vh] sm:max-h-[46vh] md:max-h-[50vh]">
          <Mascot
            mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'}
            state={mascotState}
            equipped={equippedItems}
            className="h-full w-auto max-h-[35vh] max-w-[35vh] sm:max-h-[46vh] sm:max-w-[46vh] md:max-h-[50vh] md:max-w-[50vh] aspect-square filter drop-shadow-xl object-contain shrink-0"
          />
        </div>
      </div>

      {/* PROBLEM CARD CONTAINER */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center my-1 space-y-2">
        {!hasStartedClimb ? (
          /* PRE-CLIMB START SCREEN HERO CARD */
          <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-4 text-center shadow-xl space-y-3 relative overflow-hidden animate-pop flex flex-col justify-center max-h-[42vh]">
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block shadow-2xs">
                {savedClimbState && savedClimbState.sessionQuestionIndex <= 12
                  ? `🏔️ Mountain Climb • Question ${savedClimbState.sessionQuestionIndex || 1} of 12`
                  : '🏔️ Mountain Climb • 12 Problems'}
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? 'Climb in Progress!' : 'Ready for the Climb?'}
              </h2>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {savedClimbState && savedClimbState.sessionQuestionIndex <= 12
                  ? 'You have a climb in progress! Click Resume Climb to continue where you left off.'
                  : 'Click Start Climb when you are ready! Your timer will begin as soon as you start.'}
              </p>
            </div>

            {/* PRE-CLIMB POWERUPS & CONSUMABLES SELECTOR */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-1">
              {(() => {
                const owned = consumables?.doubleSparksPotionCount ?? consumables?.doubleCoinPotionCount ?? 0;
                if (isDoubleSparksActive) {
                  return (
                    <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 animate-pulse shadow-xs flex items-center gap-1">
                      ⚡ 2x Sparks Active!
                    </span>
                  );
                }
                if (owned > 0) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleDoubleSparksPotion) {
                          onToggleDoubleSparksPotion();
                          triggerToastBanner({
                            type: 'success',
                            text: 'Double Sparks Potion Activated for this climb! ⚡'
                          }, 1400);
                        }
                      }}
                      className="text-xs font-black uppercase px-3 py-1 rounded-full border transition-all active:scale-95 flex items-center gap-1 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border-amber-500 hover:from-amber-400 hover:to-yellow-500 shadow-sm animate-pulse cursor-pointer"
                    >
                      ⚡ Activate 2x Potion ({owned})
                    </button>
                  );
                }
                return null;
              })()}

              {((consumables?.shieldCount || 0) > 0 || (consumables?.streakSaverCount || 0) > 0) && (
                <span className="text-xs font-black uppercase text-sky-950 bg-sky-100 px-3 py-1 rounded-full border border-sky-300 shadow-2xs flex items-center gap-1">
                  🛡️ Shields ({consumables.shieldCount || consumables.streakSaverCount})
                </span>
              )}
            </div>

            {/* START / RESUME CLIMB MAIN CTA BUTTON */}
            <div className="w-full space-y-1.5">
              <button
                type="button"
                onClick={savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? handleResumeClimb : handleStartClimb}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xl py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
              >
                <Play className="w-7 h-7 fill-current" />
                <span>{savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? 'RESUME CLIMB 🏔️' : 'START CLIMB 🏔️'}</span>
              </button>

            </div>
          </div>
        ) : (
          /* ACTIVE ADAPTIVE MATH QUESTION CARD */
          (() => {
            const streakCfg = getStreakTierConfig(inSessionStreak);

            return (
              <div
                className={`w-full max-w-sm shrink-0 flex flex-col justify-center bg-white border-4 rounded-3xl p-3 text-center transition-all duration-500 space-y-2 relative max-h-[32vh] ${
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

                <div className="w-full flex flex-wrap items-center justify-center gap-1.5 py-0.5">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0 shadow-2xs">
                    🎯 Q #{currentQuestionNum}/12
                  </span>
                  {isNearTierThreshold(competenceRank) && !currentProblem.isProbe && (
                    <span className="text-[10px] font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-2.5 py-0.5 rounded-full border border-amber-500 shrink-0 shadow-md animate-pulse flex items-center gap-1" title="1 question away from entering the next Tier!">
                      ⚡ TIER GATEKEEPER
                    </span>
                  )}
                  {currentProblem.isProbe && (
                    <span className="text-[10px] font-black uppercase text-white bg-gradient-to-r from-amber-500 to-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-300 shrink-0 shadow-md animate-pulse flex items-center gap-1">
                      🚀 SKILL PROBE (+120)
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 transition-all duration-300 shadow-2xs ${streakCfg.pillClass}`}
                  >
                    {streakCfg.label}
                  </span>

                  {/* NON-PUNITIVE PASS / TRY ANOTHER BUTTON */}
                  <button
                    type="button"
                    onClick={handlePassQuestion}
                    disabled={consecutiveSkips >= 2}
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
                      consecutiveSkips >= 2
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 border-slate-300 hover:border-purple-300 shadow-2xs cursor-pointer'
                    }`}
                    title={
                      consecutiveSkips >= 2
                        ? 'Cap of 2 consecutive skips reached. Give this question a try!'
                        : 'Try another problem'
                    }
                  >
                    {consecutiveSkips >= 2 ? '🔒 Attempt Required' : '🔄 Pass'}
                  </button>

                  {/* MANUAL WISDOM HINT BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setShouldPulseHint(false);
                      if (showFrustrationCard) return;
                      const owned = consumables?.hintScrollCount ?? 0;
                      if (owned > 0 && onConsumeHintScroll) {
                        onConsumeHintScroll();
                        setShowFrustrationCard(true);
                        triggerToastBanner({
                          type: 'success',
                          text: 'Kibo Wisdom Hint Unlocked! 💡'
                        }, 1200);
                      } else if (onOpenWorkshop) {
                        onOpenWorkshop();
                      }
                    }}
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                      showFrustrationCard
                        ? 'bg-indigo-200 text-indigo-950 border-indigo-400'
                        : shouldPulseHint
                        ? 'bg-amber-300 text-amber-950 border-amber-500 animate-pulse ring-4 ring-amber-400/80 shadow-md scale-105'
                        : (consumables?.hintScrollCount ?? 0) > 0
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                    title={
                      (consumables?.hintScrollCount ?? 0) > 0
                        ? 'Use Wisdom Scroll to reveal a hint!'
                        : 'Get Hint Scrolls in Kibo\'s Corner'
                    }
                  >
                    💡 {showFrustrationCard ? 'Hint Active' : (consumables?.hintScrollCount ?? 0) > 0 ? `Hint (${consumables.hintScrollCount})` : 'Hint'}
                  </button>

                  {isDoubleSparksActive && (
                    <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400 animate-pulse shrink-0 shadow-xs flex items-center gap-1">
                      ⚡ 2x Active!
                    </span>
                  )}

                  {/* KIBO SHIELD ACTIVE PILL */}
                  {((consumables?.shieldCount || 0) > 0 || (consumables?.streakSaverCount || 0) > 0) && (
                    <span
                      className="text-[10px] font-black uppercase text-sky-950 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300 shrink-0 shadow-2xs flex items-center gap-1 cursor-help"
                      title="Kibo Shield Active: Your climb & streak are protected!"
                    >
                      🛡️ Shields ({consumables.shieldCount || consumables.streakSaverCount})
                    </span>
                  )}
                </div>

            {(() => {
              const rawDisplay = currentProblem.displayString || `${currentProblem.num1} ${currentProblem.operatorSymbol} ${currentProblem.num2}`;
              const cleanDisplay = rawDisplay.replace(/\s*=\s*\?\s*¢?/gi, '').replace(/\s*=\s*\?\s*cents?/gi, '').trim();
              const hasQuestionSuffix = cleanDisplay.endsWith('?') || cleanDisplay.includes('Change?') || cleanDisplay.includes('Leftover?') || cleanDisplay.includes('End time?');
              const isLongText = cleanDisplay.length > 22;

              return (
                <div className="space-y-1.5 w-full">
                  <div className={`w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-1 ${
                    isLongText ? 'text-sm sm:text-base leading-tight font-bold' : 'text-2xl sm:text-3xl font-extrabold'
                  } text-slate-800`}>
                    <span className="max-w-full text-center leading-tight">{cleanDisplay}</span>
                    {!hasQuestionSuffix && <span className="text-slate-400 font-bold">=</span>}

                    {/* Answer Display */}
                    <span className="inline-block min-w-[60px] px-3 py-0.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-kibo-teal font-black text-2xl sm:text-3xl shadow-inner shrink-0">
                      {inputVal ? inputVal : <span className="text-slate-300 animate-pulse font-normal">?</span>}
                    </span>
                  </div>

                  {/* INTEGRATED KIBO HINT */}
                  {showFrustrationCard && (
                    <div className="w-full pt-1.5 border-t border-indigo-100 text-[11px] font-bold text-indigo-900 bg-indigo-50/90 p-2 rounded-2xl animate-pop text-center space-y-0.5 mt-1">
                      <span className="block font-black text-indigo-950">💪 Kibo Wisdom Hint:</span>
                      <span className="italic block text-indigo-800">{currentProblem.hint || "Take your time! Break the problem into simple steps."}</span>
                    </div>
                  )}
                </div>
              );
            })()}
            </div>
          );
        })()
        )}
      </div>

      {/* NUMERIC KEYPAD (AUTO-DETECTING & TYPE AWARE) */}
      {hasStartedClimb && (
        <div className="w-full max-w-sm shrink-0 animate-pop mt-0.5 sm:mt-2 max-h-[35vh]">
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
      )}
      </div>
    </div>
  );
}
