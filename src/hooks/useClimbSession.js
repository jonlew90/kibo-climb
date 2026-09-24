import { useState, useEffect, useRef, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { analyticsService } from '../services/analyticsService';
import { soundFx } from '../utils/audio';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents } from '../utils/AdaptiveEngine';
import { evaluateBadges } from '../utils/badgeManager';
import { classifyLatency } from '../utils/latencyEngine';
import { getConceptForProblem } from '../utils/skipDiagnosticEngine';
import useInactivityAutoPause from './useInactivityAutoPause';

/**
 * useClimbSession - Unified Hook for Climb Lifecycle, Block Boundaries, Review Recycling, and State Persistence
 */
export function useClimbSession({
  subjectId = 'math',
  profileId,
  generateBatch,
  getTierFromRating,
  validateProblem = () => true,
  checkAnswerCorrectness, // optional custom function: (problem, userAns) => boolean
  normalizeAnswer, // optional custom answer normalizer
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
  onConsumeShield,
  onResetDoubleSparks,
  onClimbActiveChange,
  isPracticeMode = false,
  practiceConfig = null,
  isWeakAreasMode = false,
  practiceSprintLength = 12,
  practiceTitle = 'Training Camp',
  onExitPractice
}) {
  const totalBlockQuestions = isPracticeMode ? practiceSprintLength : 12;

  const [competenceRank, setCompetenceRank] = useState(() => {
    const data = storageService.getUserData(subjectId);
    return data.adaptiveCompetenceRating || data.competenceRank || 1000;
  });

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [blockCorrectCount, setBlockCorrectCount] = useState(0);
  const [blockSparksEarned, setBlockSparksEarned] = useState(0);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);
  const [blockRatingGain, setBlockRatingGain] = useState(0);
  const [blockShieldsUsed, setBlockShieldsUsed] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  const [inSessionStreak, setInSessionStreak] = useState(0);
  const [inSessionIncorrectStreak, setInSessionIncorrectStreak] = useState(0);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const bannerTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [incorrectReviewData, setIncorrectReviewData] = useState(null);
  const [showFrustrationCard, setShowFrustrationCard] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    return Boolean(saved?.showFrustrationCard);
  });

  const [completedBlockStats, setCompletedBlockStats] = useState({
    correctCount: 12,
    sparksEarned: 0,
    blockRatingGain: 0,
    shieldsUsed: 0,
    blockTimeSec: 0,
    isNewSpeedRecord: false,
    isNewStreakRecord: false,
    newlyUnlockedBadges: []
  });

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(0);
  const problemStartTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  const prevIndexRef = useRef(0);

  const [savedClimbState, setSavedClimbState] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    if (saved && saved.problemQueue && (!saved.problemQueue.every(validateProblem) || (saved.subject && saved.subject !== subjectId))) {
      storageService.clearActiveClimbState(profileId, subjectId);
      return null;
    }
    return saved;
  });

  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [hasStartedClimb, setHasStartedClimb] = useState(() => Boolean(savedClimbState));

  // Problem Queue Setup
  const [problemQueue, setProblemQueue] = useState(() => {
    if (isPracticeMode) {
      const activePracticeTier = practiceConfig?.tier || userTier;
      const seen = new Set();
      const queuedItems = isWeakAreasMode ? storageService.getPracticeQueue(subjectId) : [];
      const batch = generateBatch(practiceSprintLength, activePracticeTier, queuedItems, seen);
      blockSeenKeysRef.current = seen;
      return batch;
    }
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(validateProblem)) {
      return saved.problemQueue;
    }
    if (saved) {
      storageService.clearActiveClimbState(profileId, subjectId);
    }
    const startRating = storageService.getUserData(subjectId).adaptiveCompetenceRating || 1000;
    const startTier = getTierFromRating(startRating);
    const seen = new Set();
    const batch = generateBatch(15, startTier, [], seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    return saved?.currentIndex || 0;
  });

  const [blockAnswers, setBlockAnswers] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    return saved?.blockAnswers || [];
  });

  const [missedReviewQueue, setMissedReviewQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    return saved?.missedReviewQueue || [];
  });

  const [isReviewPhase, setIsReviewPhase] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    return Boolean(saved?.isReviewPhase);
  });

  const [blockUnlockedBadges, setBlockUnlockedBadges] = useState([]);

  // Sync saved climb state when profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    if (saved && saved.problemQueue && (!saved.problemQueue.every(validateProblem) || (saved.subject && saved.subject !== subjectId))) {
      storageService.clearActiveClimbState(profileId, subjectId);
      setSavedClimbState(null);
    } else {
      setSavedClimbState(saved);
    }
  }, [profileId, subjectId]);

  // Sync climb active status to parent layout
  useEffect(() => {
    if (onClimbActiveChange) {
      onClimbActiveChange(Boolean(hasStartedClimb && !showBreakOverlay));
    }
  }, [hasStartedClimb, showBreakOverlay, onClimbActiveChange]);

  // Ensure new problems generated dynamically when queue gets low (deduplicated across active block)
  const replenishQueueIfNeeded = (nextIndex) => {
    if (isPracticeMode || isReviewPhase) return;
    if (nextIndex >= problemQueue.length - 3) {
      const nextTier = getTierFromRating(competenceRank);
      const newBatch = generateBatch(6, nextTier, [], blockSeenKeysRef.current);
      setProblemQueue((prev) => [...prev, ...newBatch]);
    }
  };

  const triggerToastBanner = (bannerObj, durationMs = 1200) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setFeedbackBanner(bannerObj);
    toastTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, durationMs);
  };

  // State Persistence
  const saveCurrentClimbProgress = (extraState = {}) => {
    if (isPracticeMode) return;
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

    const effectiveCurrentIndex = incorrectReviewData ? currentIndex + 1 : currentIndex;
    const effectiveSessionQuestionIndex = incorrectReviewData ? sessionQuestionIndex + 1 : sessionQuestionIndex;
    const effectiveQuestionsAnswered = incorrectReviewData ? incorrectReviewData.nextQuestionsAnswered : questionsAnswered;
    const effectiveBlockAnswers = incorrectReviewData ? incorrectReviewData.nextBlockAnswers : blockAnswers;
    const effectiveBlockRatingGain = incorrectReviewData ? incorrectReviewData.nextBlockRatingGain : blockRatingGain;

    const climbState = {
      subject: subjectId,
      subjectId,
      version: 1,
      savedAt: Date.now(),
      problemQueue,
      currentIndex: effectiveCurrentIndex,
      sessionQuestionIndex: effectiveSessionQuestionIndex,
      questionsAnswered: effectiveQuestionsAnswered,
      correctCount,
      blockCorrectCount,
      blockSparksEarned,
      sessionSparksEarned,
      blockRatingGain: effectiveBlockRatingGain,
      mistakeCount,
      inSessionStreak,
      inSessionIncorrectStreak,
      consecutiveSkips,
      competenceRank,
      blockAnswers: effectiveBlockAnswers,
      missedReviewQueue,
      isReviewPhase,
      accumulatedBlockTime,
      accumulatedProblemTime,
      isDoubleSparksActive,
      showFrustrationCard,
      ...extraState
    };

    storageService.saveActiveClimbState(climbState, profileId, subjectId);
    setSavedClimbState(climbState);
  };

  const handleStartClimb = (onCustomStart) => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setFeedbackBanner(null);
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId, subjectId);
    setSavedClimbState(null);
    setBlockAnswers([]);
    setMissedReviewQueue([]);
    setBlockUnlockedBadges([]);
    setIsReviewPhase(false);
    setShowFrustrationCard(false);
    setHasStartedClimb(true);
    if (onCustomStart) onCustomStart();
  };

  const handleResumeClimb = (onCustomResume) => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setFeedbackBanner(null);
    const saved = storageService.getActiveClimbState(profileId, subjectId);
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(validateProblem)) {
      prevIndexRef.current = saved.currentIndex || 0;
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
      setCompetenceRank(saved.competenceRank || storageService.getUserData(subjectId).adaptiveCompetenceRating || 1000);
      setBlockAnswers(saved.blockAnswers || []);
      setMissedReviewQueue(saved.missedReviewQueue || []);
      setIsReviewPhase(Boolean(saved.isReviewPhase));
      setShowFrustrationCard(Boolean(saved.showFrustrationCard));

      const now = performance.now();
      const prevBlockElapsed = saved.accumulatedBlockTime || 0;
      const prevProblemElapsed = saved.accumulatedProblemTime || 0;
      blockStartTimeRef.current = now - prevBlockElapsed;
      problemStartTimeRef.current = now - prevProblemElapsed;
      pauseStartRef.current = null;
      if (onCustomResume) onCustomResume(saved);
    } else {
      blockStartTimeRef.current = performance.now();
      problemStartTimeRef.current = performance.now();
      pauseStartRef.current = null;
    }
    setHasStartedClimb(true);
  };

  // Inactivity auto-pause
  useInactivityAutoPause({
    isActive: hasStartedClimb && !isPracticeMode && !isPaused && !showBreakOverlay,
    timeoutMs: 60000,
    onAutoPause: () => {
      if (hasStartedClimb) {
        saveCurrentClimbProgress();
        setHasStartedClimb(false);
        setIsAutoPaused(true);
      }
    }
  });

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
    missedReviewQueue,
    isReviewPhase,
    isDoubleSparksActive,
    showFrustrationCard
  ]);

  // Window unload saving
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
  }, [hasStartedClimb, profileId, subjectId]);

  // Pause / Resume listener
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

  // Tab visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || !document.hasFocus()) {
        if (!pauseStartRef.current) {
          pauseStartRef.current = performance.now();
        }
        if (hasStartedClimb && !isPracticeMode) {
          saveCurrentClimbProgress();
          setHasStartedClimb(false);
        }
      } else {
        if (!isPracticeMode) {
          const saved = storageService.getActiveClimbState(profileId, subjectId);
          setSavedClimbState(saved);
        }
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
    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [hasStartedClimb, isPracticeMode, isPaused, profileId, subjectId]);

  const currentProblem = problemQueue[currentIndex] || {};

  // Standardized Skip / Pass Question
  const handlePassQuestion = ({ onBeforePass } = {}) => {
    if (consecutiveSkips >= 2) return;
    soundFx.playKeyTap();
    const nextSkips = consecutiveSkips + 1;
    setConsecutiveSkips(nextSkips);

    const timeElapsedSec = problemStartTimeRef.current > 0 ? (performance.now() - problemStartTimeRef.current) / 1000 : 1.0;
    const concept = getConceptForProblem(currentProblem);

    storageService.logSkipEvent({
      problemId: currentProblem?.id || `prob_${currentIndex}`,
      concept,
      timeElapsedSec: Number(timeElapsedSec.toFixed(1)),
      consecutiveSkipCount: nextSkips
    }, subjectId);

    const evalResult = evaluateAdaptiveAttempt({
      isCorrect: false,
      latencyMs: timeElapsedSec * 1000,
      currentCompetenceRank: competenceRank,
      inSessionStreak: 0,
      inSessionIncorrectStreak: 1,
      totalProblemsSolved,
      isProbeQuestion: !!currentProblem.isProbe,
      problemTier: currentProblem.tier || getTierFromRating(competenceRank)
    });

    if (!isPracticeMode) {
      setInSessionStreak(0);
      setCompetenceRank(evalResult.nextCompetenceRank);
      if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

      const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
      setBlockRatingGain(nextBlockRatingGain);

      storageService.saveUserData({
        adaptiveCompetenceRating: evalResult.nextCompetenceRank,
        competenceRank: evalResult.nextCompetenceRank
      }, subjectId);
    }

    const answerRecord = {
      problemId: currentProblem.id || `prob_${currentIndex}`,
      tier: currentProblem.tier || getTierFromRating(competenceRank),
      concept,
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

    const skippedProblem = currentProblem;
    const isAlreadyReview = !!skippedProblem.isReviewAttempt;
    if (!isAlreadyReview) {
      setMissedReviewQueue((prev) => [...prev, { ...skippedProblem, isReviewAttempt: true, reviewAttempts: 1 }]);
    } else {
      storageService.addToPracticeQueue(skippedProblem, subjectId);
    }

    const nextQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);

    if (onBeforePass) onBeforePass();

    const effectiveReviewQueue = !isAlreadyReview
      ? [...missedReviewQueue, { ...skippedProblem, isReviewAttempt: true, reviewAttempts: 1 }]
      : missedReviewQueue;

    const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
    const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

    if (reachedBlockEnd && effectiveReviewQueue.length > 0) {
      setIsReviewPhase(true);
      const nextIdx = currentIndex + 1;
      setProblemQueue((prev) => [...prev.slice(0, nextIdx), ...effectiveReviewQueue]);
      setMissedReviewQueue([]);
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    } else if ((reachedBlockEnd && effectiveReviewQueue.length === 0) || isReviewComplete) {
      setIsReviewPhase(false);
      KiboAudioManager.playBreakSFX();
      setShowBreakOverlay(true);

      storageService.clearActiveClimbState(profileId, subjectId);
      setSavedClimbState(null);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = blockCorrectCount;
      const finalBlockSparks = blockSparksEarned;

      const newSessionRecord = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        tier: getTierFromRating(evalResult.nextCompetenceRank),
        totalTimeSec: blockTimeSec,
        correctCount: finalBlockCorrect,
        totalQuestions: totalBlockQuestions,
        sparksEarned: finalBlockSparks,
        accuracyPct: Math.round((finalBlockCorrect / totalBlockQuestions) * 100),
        ratingGain: isPracticeMode ? 0 : blockRatingGain,
        answers: [...blockAnswers, answerRecord],
        isPractice: isPracticeMode
      };

      const activeUserData = storageService.getUserData(subjectId);
      const existingHistory = activeUserData.sprintHistory || [];
      const updatedHistory = isPracticeMode ? existingHistory : [newSessionRecord, ...existingHistory];

      setCompletedBlockStats({
        correctCount: finalBlockCorrect,
        sparksEarned: finalBlockSparks,
        blockRatingGain: isPracticeMode ? 0 : blockRatingGain,
        shieldsUsed: blockShieldsUsed
      });

      setBlockCorrectCount(0);
      setBlockSparksEarned(0);
      setBlockRatingGain(0);
      setBlockShieldsUsed(0);
      setBlockAnswers([]);

      const currentRecords = activeUserData.personalRecords || {};
      const updatedRecords = { ...currentRecords };

      storageService.saveUserData({
        sprintHistory: updatedHistory,
        personalRecords: updatedRecords,
        ...(isPracticeMode ? {} : { completedClimbsCount: (activeUserData.completedClimbsCount || 0) + 1 })
      }, subjectId);
      if (!isPracticeMode && onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (!isPracticeMode && onRecordDailyPractice) onRecordDailyPractice();
    } else {
      const nextIdx = currentIndex + 1;
      replenishQueueIfNeeded(nextIdx);
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    }
  };

  // Standardized Answer Evaluation
  const processAnswerEvaluation = (rawInput, { isCorrectOverride, onCorrectCallback, onIncorrectCallback } = {}) => {
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const latencyMs = Math.round(performance.now() - problemStartTimeRef.current);
    const latencySec = latencyMs / 1000;
    const targetLatency = currentProblem.targetTimeSec || 15;
    const latencyGrade = classifyLatency(latencySec, targetLatency);

    const isCorrect = typeof isCorrectOverride === 'boolean'
      ? isCorrectOverride
      : (checkAnswerCorrectness
          ? checkAnswerCorrectness(currentProblem, rawInput)
          : (normalizeAnswer ? normalizeAnswer(rawInput) === normalizeAnswer(currentProblem.answer) : String(rawInput).trim().toLowerCase() === String(currentProblem.answer).trim().toLowerCase()));

    const concept = getConceptForProblem(currentProblem);

    if (isCorrect) {
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      if (!isReviewPhase) {
        setBlockCorrectCount((prev) => prev + 1);
      }
      setMistakeCount(0);
      setShowFrustrationCard(false);

      let earnedSparks = isPracticeMode ? 0 : 5;
      if (!isPracticeMode && isDoubleSparksActive) {
        earnedSparks *= 2;
      }

      let currentBlockBadges = [...blockUnlockedBadges];

      const evalResult = evaluateAdaptiveAttempt({
        isCorrect: true,
        latencyMs,
        currentCompetenceRank: competenceRank,
        inSessionStreak: inSessionStreak + 1,
        inSessionIncorrectStreak: 0,
        totalProblemsSolved,
        isProbeQuestion: !!currentProblem.isProbe,
        problemTier: currentProblem.tier || getTierFromRating(competenceRank)
      });

      let nextBlockRatingGain = blockRatingGain;

      if (!isPracticeMode) {
        setInSessionStreak(evalResult.nextInSessionStreak);
        setInSessionIncorrectStreak(0);
        setCompetenceRank(evalResult.nextCompetenceRank);
        if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

        nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
        setBlockRatingGain(nextBlockRatingGain);

        storageService.saveUserData({
          adaptiveCompetenceRating: evalResult.nextCompetenceRank,
          competenceRank: evalResult.nextCompetenceRank
        }, subjectId);

        const activeUserData = storageService.getUserData(subjectId);
        const badgeEvalRes = evaluateBadges({
          ...activeUserData,
          inSessionStreak: evalResult.nextInSessionStreak,
          competenceRank: evalResult.nextCompetenceRank,
          blockRatingGain: nextBlockRatingGain,
          lastProblemType: currentProblem.type,
          lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank),
          subjectId
        });

        if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
          onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
        }

        if (badgeEvalRes?.newlyUnlocked && badgeEvalRes.newlyUnlocked.length > 0) {
          const bonusSparks = 25 * badgeEvalRes.newlyUnlocked.length;
          earnedSparks += bonusSparks;
          currentBlockBadges = [...currentBlockBadges, ...badgeEvalRes.newlyUnlocked];
          setBlockUnlockedBadges(currentBlockBadges);
        }

        const existingMastery = activeUserData.recentSkillMastery || [];
        const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
        if (updatedMastery.length !== existingMastery.length) {
          storageService.saveUserData({ recentSkillMastery: updatedMastery }, subjectId);
        }
      }

      if (!isPracticeMode && onAwardSparks) {
        onAwardSparks(earnedSparks);
      }
      setSessionSparksEarned((prev) => prev + earnedSparks);
      const blockEarned = earnedSparks;
      setBlockSparksEarned((prev) => prev + blockEarned);

      const answerRecord = {
        problemId: currentProblem.id || `prob_${currentIndex}`,
        tier: currentProblem.tier || getTierFromRating(competenceRank),
        concept,
        isCorrect: true,
        responseTimeSec: Number(latencySec.toFixed(1)),
        isProbe: !!currentProblem.isProbe
      };
      const nextBlockAnswers = [...blockAnswers, answerRecord];
      setBlockAnswers(nextBlockAnswers);

      const nextQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(nextQuestionsAnswered);
      setSessionQuestionIndex((prev) => prev + 1);
      if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(true, { isPracticeMode });

      if (onCorrectCallback) onCorrectCallback({ earnedSparks, latencyGrade });

      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      if (reachedBlockEnd && missedReviewQueue.length > 0) {
        setIsReviewPhase(true);
        const nextIdx = currentIndex + 1;
        setProblemQueue((prev) => [...prev.slice(0, nextIdx), ...missedReviewQueue]);
        setMissedReviewQueue([]);
        setCurrentIndex(nextIdx);
      } else if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
        setIsReviewPhase(false);
        KiboAudioManager.playBreakSFX();
        setShowBreakOverlay(true);

        storageService.clearActiveClimbState(profileId, subjectId);
        setSavedClimbState(null);

        const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
        const finalBlockCorrect = blockCorrectCount;
        const finalBlockSparks = blockSparksEarned + blockEarned;
        const isPerfectBlock = finalBlockCorrect === totalBlockQuestions && blockShieldsUsed === 0;

        const newSessionRecord = {
          id: `session-${Date.now()}`,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          tier: getTierFromRating(evalResult.nextCompetenceRank),
          totalTimeSec: blockTimeSec,
          correctCount: finalBlockCorrect,
          totalQuestions: totalBlockQuestions,
          sparksEarned: finalBlockSparks,
          accuracyPct: Math.round((finalBlockCorrect / totalBlockQuestions) * 100),
          ratingGain: isPracticeMode ? 0 : nextBlockRatingGain,
          answers: nextBlockAnswers,
          isPractice: isPracticeMode
        };

        const activeUserData = storageService.getUserData(subjectId);
        const existingHistory = activeUserData.sprintHistory || [];
        const updatedHistory = isPracticeMode ? existingHistory : [newSessionRecord, ...existingHistory];

        const currentRecords = activeUserData.personalRecords || {};
        const isNewSpeedRecord = !isPracticeMode && isPerfectBlock && (!currentRecords.fastest12QuestionsTime || blockTimeSec < currentRecords.fastest12QuestionsTime);
        const isNewStreakRecord = !isPracticeMode && evalResult.nextInSessionStreak > (currentRecords.highestCorrectStreak || 0);
        const updatedRecords = isPracticeMode ? currentRecords : {
          ...currentRecords,
          fastest12QuestionsTime: isNewSpeedRecord ? blockTimeSec : currentRecords.fastest12QuestionsTime,
          highestCorrectStreak: Math.max(currentRecords.highestCorrectStreak || 0, evalResult.nextInSessionStreak),
          mostPerfectSessions: isPerfectBlock
            ? (currentRecords.mostPerfectSessions || 0) + 1
            : (currentRecords.mostPerfectSessions || 0)
        };

        setBlockCorrectCount(0);
        setBlockSparksEarned(0);
        setBlockRatingGain(0);
        setBlockShieldsUsed(0);
        setBlockAnswers([]);

        storageService.saveUserData({
          sprintHistory: updatedHistory,
          personalRecords: updatedRecords,
          ...(isPracticeMode ? {} : { completedClimbsCount: (activeUserData.completedClimbsCount || 0) + 1 })
        }, subjectId);
        if (!isPracticeMode && onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
        if (!isPracticeMode && onRecordDailyPractice) onRecordDailyPractice();

        let allBlockUnlockedBadges = [...currentBlockBadges];

        if (!isPracticeMode) {
          const postBlockUserData = storageService.getUserData(subjectId);
          const blockBadgeEval = evaluateBadges({
            ...postBlockUserData,
            inSessionStreak: evalResult.nextInSessionStreak,
            competenceRank: evalResult.nextCompetenceRank,
            blockRatingGain: nextBlockRatingGain,
            isNewSpeedRecord,
            hasSetPersonalRecord: isNewSpeedRecord || isPerfectBlock,
            subjectId
          }, newSessionRecord);

          if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
            onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
          }

          if (blockBadgeEval?.newlyUnlocked && blockBadgeEval.newlyUnlocked.length > 0) {
            const bonusSparks = 25 * blockBadgeEval.newlyUnlocked.length;
            if (onAwardSparks) onAwardSparks(bonusSparks);
            setSessionSparksEarned((prev) => prev + bonusSparks);
            setBlockSparksEarned((prev) => prev + bonusSparks);
            soundFx.playVictory();
            allBlockUnlockedBadges = [...allBlockUnlockedBadges, ...blockBadgeEval.newlyUnlocked];
          }
        }

        setCompletedBlockStats({
          correctCount: finalBlockCorrect,
          sparksEarned: finalBlockSparks,
          blockRatingGain: isPracticeMode ? 0 : nextBlockRatingGain,
          shieldsUsed: blockShieldsUsed,
          blockTimeSec,
          isNewSpeedRecord,
          isNewStreakRecord,
          newlyUnlockedBadges: allBlockUnlockedBadges
        });

        if (isPracticeMode) {
          storageService.recordPracticeSession({
            tier: isWeakAreasMode ? 'weak_areas' : (practiceConfig?.tier || userTier),
            mode: isWeakAreasMode ? 'weak_areas' : 'tier_drill',
            correctCount: finalBlockCorrect,
            totalCount: totalBlockQuestions,
            timeSec: blockTimeSec
          }, subjectId);
        }
      } else {
        const nextIdx = currentIndex + 1;
        replenishQueueIfNeeded(nextIdx);
        setCurrentIndex(nextIdx);
      }

      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = setTimeout(() => {
        setFeedbackBanner(null);
      }, 3500);
    } else {
      let isShieldAbsorbed = false;
      let nextBlockRatingGain = blockRatingGain;

      if (isPracticeMode) {
        triggerToastBanner({
          type: 'info',
          text: 'Practice Mode: Streak Protected! 🛡️'
        }, 1500);
      } else {
        const ownedShields = (consumables?.shieldCount || 0) + (consumables?.streakSaverCount || 0);

        if (ownedShields > 0 && onConsumeShield) {
          isShieldAbsorbed = onConsumeShield();
          if (isShieldAbsorbed) {
            setInSessionStreak(inSessionStreak);
          }
        }
      }

      const nextMistakes = mistakeCount + 1;
      setMistakeCount(nextMistakes);

      const evalResult = evaluateAdaptiveAttempt({
        isCorrect: false,
        latencyMs,
        currentCompetenceRank: competenceRank,
        inSessionStreak: isShieldAbsorbed ? inSessionStreak : 0,
        inSessionIncorrectStreak: inSessionIncorrectStreak + 1,
        totalProblemsSolved,
        isProbeQuestion: !!currentProblem.isProbe,
        problemTier: currentProblem.tier || getTierFromRating(competenceRank)
      });

      const answerRecord = {
        problemId: currentProblem.id || `prob_${currentIndex}`,
        tier: currentProblem.tier || getTierFromRating(competenceRank),
        concept,
        isCorrect: false,
        responseTimeSec: Number(latencySec.toFixed(1)),
        isProbe: !!currentProblem.isProbe
      };
      const nextBlockAnswers = [...blockAnswers, answerRecord];
      setBlockAnswers(nextBlockAnswers);

      if (!isPracticeMode) {
        if (!isShieldAbsorbed) {
          setInSessionStreak(0);
          setInSessionIncorrectStreak(evalResult.nextInSessionIncorrectStreak);
        } else {
          setBlockShieldsUsed((prev) => prev + 1);
        }

        setCompetenceRank(evalResult.nextCompetenceRank);
        if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

        if (evalResult.triggerFrustrationCircuit) {
          setShowFrustrationCard(true);
        }

        nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
        setBlockRatingGain(nextBlockRatingGain);

        storageService.saveUserData({
          adaptiveCompetenceRating: evalResult.nextCompetenceRank,
          competenceRank: evalResult.nextCompetenceRank
        }, subjectId);

        const activeUserData = storageService.getUserData(subjectId);
        const badgeEvalRes = evaluateBadges({
          ...activeUserData,
          inSessionStreak: evalResult.nextInSessionStreak,
          competenceRank: evalResult.nextCompetenceRank,
          blockRatingGain: nextBlockRatingGain,
          lastProblemType: currentProblem.type,
          lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank),
          subjectId
        });

        if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
          onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
        }

        const existingMastery = activeUserData.recentSkillMastery || [];
        const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
        if (updatedMastery.length !== existingMastery.length) {
          storageService.saveUserData({ recentSkillMastery: updatedMastery }, subjectId);
        }
      }

      const isBlockComplete = (questionsAnswered + 1) % totalBlockQuestions === 0;

      if (isBlockComplete) {
        analyticsService.logLevelUp(subjectId, blockCorrectCount);
      }

      if (!currentProblem.isReviewAttempt) {
        setMissedReviewQueue((prev) => [...prev, { ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 }]);
      } else {
        storageService.addToPracticeQueue(currentProblem, subjectId);
      }

      setIncorrectReviewData({
        problem: currentProblem,
        userAnswer: String(rawInput),
        correctAnswer: String(currentProblem.answerString || currentProblem.answer || ''),
        isProbe: !!currentProblem.isProbe,
        evalResult,
        nextQuestionsAnswered: questionsAnswered + 1,
        nextBlockAnswers,
        nextBlockRatingGain,
        isShieldAbsorbed,
        isBlockComplete: isBlockComplete && missedReviewQueue.length === 0 && (!currentProblem.isReviewAttempt ? 1 : 0) === 0
      });

      if (onIncorrectCallback) onIncorrectCallback({ isShieldAbsorbed });
    }
  };

  // Continue after reviewing incorrect answer
  const handleContinueAfterIncorrect = ({ onBeforeContinue } = {}) => {
    if (!incorrectReviewData) return;
    soundFx.playKeyTap();
    const data = incorrectReviewData;
    setIncorrectReviewData(null);

    const nextQuestionsAnswered = data.nextQuestionsAnswered;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);
    if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(false, { isPracticeMode });

    if (onBeforeContinue) onBeforeContinue();

    const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
    const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

    if (reachedBlockEnd && missedReviewQueue.length > 0) {
      setIsReviewPhase(true);
      const nextIdx = currentIndex + 1;
      setProblemQueue((prev) => [...prev.slice(0, nextIdx), ...missedReviewQueue]);
      setMissedReviewQueue([]);
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    } else if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
      setIsReviewPhase(false);
      KiboAudioManager.playBreakSFX();
      setShowBreakOverlay(true);

      storageService.clearActiveClimbState(profileId, subjectId);
      setSavedClimbState(null);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = blockCorrectCount;
      const finalBlockSparks = blockSparksEarned;

      const newSessionRecord = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        tier: getTierFromRating(data.evalResult.nextCompetenceRank),
        totalTimeSec: blockTimeSec,
        correctCount: finalBlockCorrect,
        totalQuestions: totalBlockQuestions,
        sparksEarned: finalBlockSparks,
        accuracyPct: Math.round((finalBlockCorrect / totalBlockQuestions) * 100),
        ratingGain: isPracticeMode ? 0 : data.nextBlockRatingGain,
        answers: data.nextBlockAnswers,
        isPractice: isPracticeMode
      };

      const activeUserData = storageService.getUserData(subjectId);
      const existingHistory = activeUserData.sprintHistory || [];
      const updatedHistory = isPracticeMode ? existingHistory : [newSessionRecord, ...existingHistory];

      setCompletedBlockStats({
        correctCount: finalBlockCorrect,
        sparksEarned: finalBlockSparks,
        blockRatingGain: isPracticeMode ? 0 : data.nextBlockRatingGain,
        shieldsUsed: blockShieldsUsed
      });

      setBlockCorrectCount(0);
      setBlockSparksEarned(0);
      setBlockRatingGain(0);
      setBlockShieldsUsed(0);
      setBlockAnswers([]);

      const currentRecords = activeUserData.personalRecords || {};
      const updatedRecords = { ...currentRecords };

      storageService.saveUserData({
        sprintHistory: updatedHistory,
        personalRecords: updatedRecords,
        ...(isPracticeMode ? {} : { completedClimbsCount: (activeUserData.completedClimbsCount || 0) + 1 })
      }, subjectId);
      if (!isPracticeMode && onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (!isPracticeMode && onRecordDailyPractice) onRecordDailyPractice();

      if (!isPracticeMode) {
        const postBlockUserData = storageService.getUserData(subjectId);
        const blockBadgeEval = evaluateBadges({
          ...postBlockUserData,
          inSessionStreak: data.evalResult.nextInSessionStreak,
          competenceRank: data.evalResult.nextCompetenceRank,
          blockRatingGain: data.nextBlockRatingGain,
          isNewSpeedRecord: false,
          hasSetPersonalRecord: false,
          subjectId
        }, newSessionRecord);

        if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
          onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
        }
      }
    } else {
      const nextIdx = currentIndex + 1;
      replenishQueueIfNeeded(nextIdx);
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    }

    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, 3500);
  };

  // Break Overlay Handlers
  const handleOpenWorkshopFromBreak = () => {
    setShowBreakOverlay(false);
    if (isPracticeMode && onExitPractice) {
      onExitPractice();
      return;
    }
    if (onResetDoubleSparks) onResetDoubleSparks();
    storageService.clearActiveClimbState(profileId, subjectId);
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
    const freshBatch = generateBatch(15, nextTier, [], blockSeenKeysRef.current);
    setProblemQueue(freshBatch);
    setCurrentIndex(0);
    if (onOpenWorkshop) onOpenWorkshop();
  };

  const handleResumeClimbFromBreak = () => {
    setShowBreakOverlay(false);
    soundFx.playKeyTap();
    if (onResetDoubleSparks) onResetDoubleSparks();
    storageService.clearActiveClimbState(profileId, subjectId);
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
    setHasStartedClimb(true);
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    const nextTier = getTierFromRating(competenceRank);
    const freshBatch = generateBatch(15, nextTier, [], blockSeenKeysRef.current);
    setProblemQueue(freshBatch);
    setCurrentIndex(0);
  };

  return {
    competenceRank,
    setCompetenceRank,
    questionsAnswered,
    sessionQuestionIndex,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    blockShieldsUsed,
    mistakeCount,
    inSessionStreak,
    setInSessionStreak,
    inSessionIncorrectStreak,
    consecutiveSkips,
    setConsecutiveSkips,
    showBreakOverlay,
    setShowBreakOverlay,
    feedbackBanner,
    setFeedbackBanner,
    triggerToastBanner,
    incorrectReviewData,
    setIncorrectReviewData,
    showFrustrationCard,
    setShowFrustrationCard,
    completedBlockStats,
    savedClimbState,
    setSavedClimbState,
    isAutoPaused,
    setIsAutoPaused,
    hasStartedClimb,
    setHasStartedClimb,
    problemQueue,
    setProblemQueue,
    currentIndex,
    setCurrentIndex,
    currentProblem,
    blockAnswers,
    missedReviewQueue,
    setMissedReviewQueue,
    isReviewPhase,
    setIsReviewPhase,
    totalBlockQuestions,
    problemStartTimeRef,
    blockStartTimeRef,
    blockSeenKeysRef,
    handleStartClimb,
    handleResumeClimb,
    handlePassQuestion,
    processAnswerEvaluation,
    handleContinueAfterIncorrect,
    handleOpenWorkshopFromBreak,
    handleResumeClimbFromBreak,
    saveCurrentClimbProgress,
    replenishQueueIfNeeded
  };
}

export default useClimbSession;
