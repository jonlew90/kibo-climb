import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';
import WorldMapViewer from './WorldMapViewer';

import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import { generateWorldSession as generateProblems, generateWorldProblem as generateTierProblem } from '../utils/worldGenerator';
import { getTierForRating as getTierFromRating, isNearTierThreshold } from '../utils/worldCurriculum';

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
    cardGlow: ''
  };
}

export default function WorldSessionView({
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
  onConsumeLetterSpyglass,
  onConsumeLetterPruner,
  onConsumeShield,
  onResetDoubleSparks
}) {
  const [competenceRank, setCompetenceRank] = useState(() => {
    return storageService.getUserData('world').adaptiveCompetenceRating || storageService.getUserData('world').competenceRank || 1000;
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

  const isWorldProblem = (p) => {
    if (!p) return false;
    if (p.subject && p.subject !== 'world') return false;
    if (p.type === 'words' || (p.num1 !== undefined && p.num2 !== undefined && p.type !== 'applied')) return false;
    return true;
  };

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [savedClimbState, setSavedClimbState] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'world');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isWorldProblem) || (saved.subject && saved.subject !== 'world'))) {
      storageService.clearActiveClimbState(profileId, 'world');
      return null;
    }
    return saved;
  });

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(0);

  // Sync saved climb state when active profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId, 'world');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isWorldProblem) || (saved.subject && saved.subject !== 'world'))) {
      storageService.clearActiveClimbState(profileId, 'world');
      setSavedClimbState(null);
    } else {
      setSavedClimbState(saved);
    }
  }, [profileId]);

  // Generate adaptive problem queue for active tier based on competence rating
  const [problemQueue, setProblemQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'world');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isWorldProblem)) {
      return saved.problemQueue;
    }
    if (saved) {
      storageService.clearActiveClimbState(profileId, 'world');
    }
    const seen = new Set();
    const currentRating = storageService.getUserData('world').adaptiveCompetenceRating || storageService.getUserData('world').competenceRank || 1000;
    const activeTier = isFTUX ? 1 : getTierFromRating(currentRating);
    const recentWords = storageService.getUserData('world').recentWords || [];
    const batch = generateProblems(15, activeTier, recentWords, seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blockAnswers, setBlockAnswers] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'world');
    return saved?.blockAnswers || [];
  });
  const [shouldPulseHint, setShouldPulseHint] = useState(false);
  const [highlightedGivenIndex, setHighlightedGivenIndex] = useState(null);
  const [acknowledgedGivenIndices, setAcknowledgedGivenIndices] = useState(() => new Set());
  const highlightTimerRef = useRef(null);

  const triggerGivenHighlight = (index) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedGivenIndex(index);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedGivenIndex(null);
    }, 450);
  };

  const currentProblem = problemQueue[currentIndex] || {};
  const isMoneyQuestion =
    currentProblem.type === 'money' ||
    currentProblem.operatorSymbol === '🪙' ||
    /quarter|dime|nickel|penny|\$|¢|change|costing/i.test(currentProblem.displayString || '');
  const isTimeQuestion = currentProblem.type === 'time';
  const targetStr = String(currentProblem.answerString || currentProblem.answer || '');

  const problemStartTimeRef = useRef(0);
  const pauseStartRef = useRef(null);

  // Kibo Words Specialized Power-Up States
  const [isLetterPrunerActive, setIsLetterPrunerActive] = useState(false);
  const [spyglassRevealedSlots, setSpyglassRevealedSlots] = useState({});

  // Reset per-word power-up state on question transition
  useEffect(() => {
    setIsLetterPrunerActive(false);
    setSpyglassRevealedSlots({});
  }, [currentIndex]);

  // Compute base slots and effective slots (including permanent spyglass-revealed letters)
  const wordSlots = useMemo(() => {
    const displayStr = currentProblem.displayString || '';
    const displayParts = displayStr.split(' ').filter((c) => c.length > 0);
    const baseSlots = displayParts.length > 0 ? displayParts : displayStr.split('');
    return baseSlots.map((char, idx) => (char === '_' && spyglassRevealedSlots[idx] ? spyglassRevealedSlots[idx] : char));
  }, [currentProblem.displayString, spyglassRevealedSlots]);

  const blankSlotIndices = useMemo(() => {
    const indices = [];
    wordSlots.forEach((slot, idx) => {
      if (slot === '_') indices.push(idx);
    });
    return indices;
  }, [wordSlots]);

  // Compute pruned keys when Letter Pruner power-up is active
  const prunedKeys = useMemo(() => {
    if (!isLetterPrunerActive || !targetStr) return [];
    const targetLetters = new Set(targetStr.toUpperCase().replace(/[^A-Z]/g, '').split(''));
    const allAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return allAlphabet.filter((char) => !targetLetters.has(char));
  }, [isLetterPrunerActive, targetStr]);

  const handleUseLetterSpyglass = () => {
    const owned = consumables?.letterSpyglassCount ?? 0;
    if (owned <= 0) {
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (blankSlotIndices.length === 0) {
      triggerToastBanner({
        type: 'info',
        text: 'All letters already revealed! Tap Submit (➤).'
      }, 1500);
      return;
    }

    // Pick the first remaining blank slot position to turn into a permanent given letter
    const targetPos = blankSlotIndices[0];
    const answerStr = (currentProblem.answerString || currentProblem.answer || '').toString();
    const letterToReveal = answerStr.charAt(targetPos).toUpperCase();

    if (onConsumeLetterSpyglass && onConsumeLetterSpyglass()) {
      setSpyglassRevealedSlots((prev) => ({
        ...prev,
        [targetPos]: letterToReveal
      }));
      // Reset or adjust typed input so it only fills the remaining blank slots
      setInputVal('');
      setAcknowledgedGivenIndices(new Set());

      triggerToastBanner({
        type: 'success',
        text: `Permanent Letter Revealed: "${letterToReveal}"! 🔍`
      }, 1500);

      // If this was the last remaining blank, celebrate and auto-evaluate!
      if (blankSlotIndices.length === 1) {
        setTimeout(() => {
          processAnswerEvaluation('');
        }, 350);
      }
    }
  };

  const handleUseLetterPruner = () => {
    if (isLetterPrunerActive) return;
    const owned = consumables?.letterPrunerCount ?? 0;
    if (owned <= 0) {
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (onConsumeLetterPruner && onConsumeLetterPruner()) {
      setIsLetterPrunerActive(true);
      triggerToastBanner({
        type: 'success',
        text: 'Distractor Keys Pruned! ✂️'
      }, 1500);
    }
  };

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
      subject: 'world',
      subjectId: 'world',
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
      blockAnswers,
      accumulatedBlockTime,
      accumulatedProblemTime,
      isDoubleSparksActive
    };

    storageService.saveActiveClimbState(climbState, profileId, 'world');
    setSavedClimbState(climbState);
  };

  const handleStartClimb = () => {
    soundFx.playKeyTap();
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId, 'world');
    setSavedClimbState(null);
    setBlockAnswers([]);
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    const saved = storageService.getActiveClimbState(profileId, 'world');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isWorldProblem)) {
      setProblemQueue(saved.problemQueue);
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
      if (Array.isArray(saved.blockAnswers)) setBlockAnswers(saved.blockAnswers);

      const now = performance.now();
      const blockTime = saved.accumulatedBlockTime || 0;
      const probTime = saved.accumulatedProblemTime || 0;

      blockStartTimeRef.current = now - blockTime;
      problemStartTimeRef.current = now - probTime;
      pauseStartRef.current = null;
    } else {
      if (saved) {
        storageService.clearActiveClimbState(profileId, 'world');
        setSavedClimbState(null);
      }
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
    blockAnswers,
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
        const saved = storageService.getActiveClimbState(profileId, 'world');
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
    setShowFrustrationCard(false);

    const hintTimer = setTimeout(() => {
      setShouldPulseHint(true);
    }, 7000);

    setInputVal('');

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
      const recentWords = storageService.getUserData('world').recentWords || [];
      const newBatch = generateProblems(6, nextTier, recentWords, blockSeenKeysRef.current);
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

    const concept = currentProblem.hint || 'Vocabulary';

    storageService.logSkipEvent({
      problemId: currentProblem.id || `prob_${currentIndex}`,
      concept: concept,
      timeElapsedSec: Number(timeElapsedSec.toFixed(1)),
      consecutiveSkipCount: nextConsecutiveSkips
    }, 'world');

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
    }, 'world');

    const answerRecord = {
      problemId: currentProblem.id || `prob_${currentIndex}`,
      tier: currentProblem.tier || getTierFromRating(competenceRank),
      concept: concept,
      isCorrect: false,
      responseTimeSec: Number(timeElapsedSec.toFixed(1)),
      isSkip: true,
      isProbe: !!currentProblem.isProbe
    };
    setBlockAnswers((prev) => [...prev, answerRecord]);

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
    setAcknowledgedGivenIndices(new Set());
    setCurrentIndex(nextIdx);
  };



  const processAnswerEvaluation = (userAnsString = inputVal) => {
    const rawInput = typeof userAnsString === 'string' ? userAnsString : inputVal;
    setInputVal(rawInput);
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const normTargetAns = currentProblem.correctAnswer || currentProblem.answerString || currentProblem.answer || '';
    const isCorrect = rawInput === normTargetAns;
    const latencyMs = performance.now() - problemStartTimeRef.current;
    const timeElapsedSec = latencyMs / 1000;
    const concept = currentProblem.concept || 'Geography';
    const answerRecord = {
      problemId: currentProblem.id || `prob_${currentIndex}`,
      tier: currentProblem.tier || getTierFromRating(competenceRank),
      concept: concept,
      isCorrect: isCorrect,
      responseTimeSec: Number(timeElapsedSec.toFixed(1)),
      isSkip: false,
      isProbe: !!currentProblem.isProbe
    };
    const nextBlockAnswers = [...blockAnswers, answerRecord];
    setBlockAnswers(nextBlockAnswers);

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
        const recentWords = storageService.getUserData('world').recentWords || [];
        const probeExclude = new Set([...blockSeenKeysRef.current, ...recentWords]);
        const probeData = generateTierProblem(probeTier, false, probeExclude);
        const probeWord = (probeData.answerString || probeData.answer || '').toString().toLowerCase();
        if (probeWord) {
          blockSeenKeysRef.current.add(probeWord);
        }
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

    const activeWord = (normTargetAns || '').toString().toLowerCase();
    const existingRecent = storageService.getUserData('world').recentWords || [];
    const updatedRecent = activeWord ? [activeWord, ...existingRecent.filter(w => w !== activeWord)].slice(0, 60) : existingRecent;

    storageService.saveUserData({
      adaptiveCompetenceRating: evalResult.nextCompetenceRank,
      competenceRank: evalResult.nextCompetenceRank,
      recentWords: updatedRecent
    }, 'world');

    const activeUserData = storageService.getUserData('world');
    const badgeEvalRes = evaluateBadges({
      ...activeUserData,
      subjectId: 'world',
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
        'world_summit_master', 'hemisphere_voyager', 'country_diplomat',
        'state_cartographer', 'continent_navigator',
        'world_expert', 'world_traveler', 'capital_collector', 'world_novice'
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
      storageService.saveUserData({ recentSkillMastery: updatedMastery }, 'world');
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

      storageService.clearActiveClimbState(profileId, 'world');
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
        ratingGain: nextBlockRatingGain,
        answers: nextBlockAnswers
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
      setBlockAnswers([]);

      const currentRecords = activeUserData.personalRecords || {};
      const isNewSpeedRecord = isPerfectBlock && (!currentRecords.fastest12QuestionsTime || blockTimeSec < currentRecords.fastest12QuestionsTime);
      const updatedRecords = {
        ...currentRecords,
        fastest12QuestionsTime: isNewSpeedRecord ? blockTimeSec : currentRecords.fastest12QuestionsTime,
        mostPerfectSessions: isPerfectBlock
          ? (currentRecords.mostPerfectSessions || 0) + 1
          : (currentRecords.mostPerfectSessions || 0)
      };

      storageService.saveUserData({
        sprintHistory: updatedHistory,
        personalRecords: updatedRecords
      }, 'world');
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (onRecordDailyPractice) onRecordDailyPractice();

      // Immediately evaluate and claim any newly met badges at block completion (e.g. Flawless Ascent, Trailblazer Record, 3rd Perfect Run)
      const postBlockUserData = storageService.getUserData('world');
      const blockBadgeEval = evaluateBadges({
        ...postBlockUserData,
        inSessionStreak: evalResult.nextInSessionStreak,
        competenceRank: evalResult.nextCompetenceRank,
        blockRatingGain: nextBlockRatingGain,
        isNewSpeedRecord,
        hasSetPersonalRecord: isNewSpeedRecord || isPerfectBlock,
        subjectId: 'world'
      }, newSessionRecord);

      if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
      }

      if (blockBadgeEval?.newlyUnlocked && blockBadgeEval.newlyUnlocked.length > 0) {
        const highestBadge = blockBadgeEval.newlyUnlocked[0];
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
    }

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setAcknowledgedGivenIndices(new Set());
    setCurrentIndex(nextIdx);

    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, 3500);
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

      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
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
          storageService.clearActiveClimbState(profileId, 'world');
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
          const recentWords = storageService.getUserData('world').recentWords || [];
          const freshBatch = generateProblems(15, nextTier, recentWords, blockSeenKeysRef.current);
          setProblemQueue(freshBatch);
          setCurrentIndex(0);
          if (onOpenWorkshop) onOpenWorkshop();
        }}
        onResumeClimb={() => {
          setShowBreakOverlay(false);
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId, 'world');
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
          const recentWords = storageService.getUserData('world').recentWords || [];
          const freshBatch = generateProblems(15, nextTier, recentWords, blockSeenKeysRef.current);
          setProblemQueue(freshBatch);
          setCurrentIndex(0);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 relative overflow-visible animate-pop flex flex-col">
      <div className="w-full h-full flex flex-col items-center justify-between sm:justify-end pb-1 sm:pb-2 pt-1 px-1.5 sm:px-3 max-w-lg mx-auto relative overflow-visible flex-1 min-h-0">

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
        className={`flex-1 flex flex-col items-center justify-center w-full min-h-0 my-auto py-0.5 sm:py-1.5 z-10 overflow-visible ${
          hasStartedClimb ? 'max-h-[14vh] sm:max-h-[20vh] md:max-h-[24vh]' : 'max-h-[26vh] sm:max-h-[35vh]'
        }`}
        title="Tap Kibo!"
      >
        <div className={`relative flex items-center justify-center overflow-visible p-0.5 sm:p-1.5 w-full h-full ${
          hasStartedClimb ? 'max-h-[14vh] sm:max-h-[20vh] md:max-h-[24vh]' : 'max-h-[26vh] sm:max-h-[35vh]'
        }`}>
          <Mascot
            mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'}
            state={mascotState}
            equipped={equippedItems}
            className={`h-full w-auto aspect-square filter drop-shadow-md object-contain shrink-0 ${
              hasStartedClimb ? 'max-h-[14vh] max-w-[14vh] sm:max-h-[20vh] sm:max-w-[20vh] md:max-h-[24vh] md:max-w-[24vh]' : 'max-h-[26vh] max-w-[26vh] sm:max-h-[35vh] sm:max-w-[35vh]'
            }`}
          />
        </div>
      </div>

      {/* PROBLEM CARD CONTAINER */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center my-0.5 sm:my-1 space-y-1.5">
        {!hasStartedClimb ? (
          /* PRE-CLIMB START SCREEN HERO CARD */
          <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-4 sm:p-5 text-center shadow-xl space-y-3 relative overflow-hidden animate-pop flex flex-col justify-center max-h-[48vh]">
            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block shadow-2xs">
                {savedClimbState && savedClimbState.sessionQuestionIndex <= 12
                  ? `🏔️ Mountain Climb • Question ${savedClimbState.sessionQuestionIndex || 1} of 12`
                  : '🏔️ Mountain Climb • 12 Problems'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? 'Climb in Progress!' : 'Ready for the Climb?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
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
                    <span className="text-xs sm:text-sm font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 animate-pulse shadow-xs flex items-center gap-1">
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
                      className="text-xs sm:text-sm font-black uppercase px-3 py-1 rounded-full border transition-all active:scale-95 flex items-center gap-1 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border-amber-500 hover:from-amber-400 hover:to-yellow-500 shadow-sm animate-pulse cursor-pointer"
                    >
                      ⚡ Activate 2x Potion ({owned})
                    </button>
                  );
                }
                return null;
              })()}

              {((consumables?.shieldCount || 0) > 0 || (consumables?.streakSaverCount || 0) > 0) && (
                <span className="text-xs sm:text-sm font-black uppercase text-sky-950 bg-sky-100 px-3 py-1 rounded-full border border-sky-300 shadow-2xs flex items-center gap-1">
                  🛡️ Shields ({consumables.shieldCount || consumables.streakSaverCount})
                </span>
              )}
            </div>

            {/* START / RESUME CLIMB MAIN CTA BUTTON */}
            <div className="w-full space-y-1.5">
              <button
                type="button"
                onClick={savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? handleResumeClimb : handleStartClimb}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xl sm:text-2xl py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
              >
                <Play className="w-7 h-7 fill-current" />
                <span>{savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? 'RESUME CLIMB 🏔️' : 'START CLIMB 🏔️'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE ADAPTIVE WORLD QUESTION CARD */
          (() => {
            const streakCfg = getStreakTierConfig(inSessionStreak);

            return (
              <div
                className={`w-full max-w-md shrink-0 flex flex-col justify-between bg-white border-3 sm:border-4 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 text-center transition-all duration-300 space-y-1.5 sm:space-y-2 relative shadow-lg ${
                  streakCfg.cardGlow
                } ${isShaking ? 'animate-shake border-rose-400 bg-rose-50/50' : 'border-slate-200'}`}
              >
                {/* Floating Ambient Sparkles for High Streaks */}
                {inSessionStreak >= 5 && (
                  <div className="absolute -top-3 left-4 right-4 flex justify-between pointer-events-none z-10">
                    <span className="text-sm animate-bounce text-amber-400 filter drop-shadow-xs">✨</span>
                    <span className="text-sm animate-pulse text-orange-500 filter drop-shadow-xs">🔥</span>
                    <span className="text-sm animate-bounce text-yellow-400 filter drop-shadow-xs">⚡</span>
                  </div>
                )}

                <div className="w-full flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-0.5">
                  <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-purple-200 shrink-0 shadow-2xs">
                    🎯 Q #{currentQuestionNum}/12
                  </span>
                  {isNearTierThreshold(competenceRank) && !currentProblem.isProbe && (
                    <span className="text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-500 shrink-0 shadow-md animate-pulse flex items-center gap-1" title="1 question away from entering the next Tier!">
                      ⚡ TIER GATEKEEPER
                    </span>
                  )}
                  {currentProblem.isProbe && (
                    <span className="text-xs font-black uppercase text-white bg-gradient-to-r from-amber-500 to-indigo-600 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-indigo-300 shrink-0 shadow-md animate-pulse flex items-center gap-1">
                      🚀 SKILL PROBE (+120)
                    </span>
                  )}
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all duration-300 shadow-2xs ${streakCfg.pillClass}`}
                  >
                    {streakCfg.label}
                  </span>

                  {/* NON-PUNITIVE PASS / TRY ANOTHER BUTTON */}
                  <button
                    type="button"
                    onClick={handlePassQuestion}
                    disabled={consecutiveSkips >= 2}
                    className={`text-xs font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
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

                  {isDoubleSparksActive && (
                    <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-400 animate-pulse shrink-0 shadow-xs flex items-center gap-1">
                      ⚡ 2x Active!
                    </span>
                  )}

                  {/* KIBO SHIELD ACTIVE PILL */}
                  {((consumables?.shieldCount || 0) > 0 || (consumables?.streakSaverCount || 0) > 0) && (
                    <span
                      className="text-xs font-black uppercase text-sky-950 bg-sky-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-sky-300 shrink-0 shadow-2xs flex items-center gap-1 cursor-help"
                      title="Kibo Shield Active: Your climb & streak are protected!"
                    >
                      🛡️ Shields ({consumables.shieldCount || consumables.streakSaverCount})
                    </span>
                  )}
                </div>

            {(() => {
              const question = currentProblem.prompt || "Geography Challenge!";

              return (
                <div className="w-full flex flex-col items-center space-y-1 sm:space-y-1.5">
                  <div className="w-full text-center my-0.5 sm:my-1 text-sm sm:text-base font-bold text-slate-800 leading-tight">
                     {question}
                  </div>

                  {/* RICH GEOGRAPHIC MAP VISUALIZER */}
                  {(currentProblem.mapData || currentProblem.shapeSvg) && (
                    <div className="w-full flex items-center justify-center my-0.5 sm:my-1 h-28 sm:h-32 md:h-36 max-w-[280px] sm:max-w-[340px] mx-auto">
                      <WorldMapViewer
                        mapData={currentProblem.mapData}
                        shapeSvg={currentProblem.shapeSvg}
                        className="h-full w-full"
                      />
                    </div>
                  )}

                  {/* 2x2 MULTIPLE CHOICE OPTIONS GRID */}
                  {currentProblem.options && (() => {
                    const optStrings = currentProblem.options.map(o => String(o || ''));
                    const maxOptLen = Math.max(...optStrings.map(s => s.length));
                    const maxOverallWordLen = Math.max(0, ...optStrings.flatMap(s => s.split(/[\s,()/]+/).map(w => w.length)));
                    
                    return (
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full mt-1 sm:mt-1.5 items-stretch">
                        {currentProblem.options.map((opt, idx) => {
                          const optStr = String(opt || '');
                          const optLength = optStr.length;
                          const words = optStr.split(/[\s,()/]+/);
                          const maxWordLen = Math.max(0, ...words.map(w => w.length));
                          
                          // Dynamic per-option responsive typography tailored for clean fit inside 3D tactile borders
                          let fontClass = 'text-xs sm:text-sm leading-snug';
                          if (optLength >= 24 || maxOptLen >= 25) {
                            fontClass = 'text-[9.5px] sm:text-[10.5px] leading-tight tracking-tight';
                          } else if (optLength >= 17 || maxOptLen >= 19 || maxWordLen >= 12 || maxOverallWordLen >= 13) {
                            fontClass = 'text-[10.5px] sm:text-[11.5px] md:text-xs leading-tight tracking-tight';
                          } else if (optLength >= 10 || maxOptLen >= 12 || maxWordLen >= 8) {
                            fontClass = 'text-xs sm:text-xs md:text-sm leading-tight';
                          } else {
                            fontClass = 'text-xs sm:text-sm leading-snug';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (inputVal === '') {
                                  setInputVal(opt);
                                  processAnswerEvaluation(opt);
                                }
                              }}
                              className={`btn-3d-teal w-full pt-1 pb-2 sm:pt-1.5 sm:pb-2.5 px-1.5 sm:px-2.5 rounded-xl sm:rounded-2xl transition-all active:scale-95 flex items-center justify-center min-h-[46px] sm:min-h-[50px] shadow-sm select-none cursor-pointer ${
                                inputVal !== '' && inputVal !== opt ? 'opacity-40 grayscale' : ''
                              }`}
                              disabled={inputVal !== ''}
                            >
                              <span className={`w-full max-w-full text-center font-bold break-words [overflow-wrap:anywhere] hyphens-auto px-0.5 ${fontClass}`}>
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
            </div>
          );
        })()
        )}
      </div>

      </div>
    </div>
  );
}
