import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';

import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import { generateProblems, generateTierProblem } from '../utils/wordsGenerator';
import { getTierFromRating, isNearTierThreshold, getClueHintMessage, selectSpyglassSlot } from '../utils/wordsCurriculum';
import QwertyKeyboard from './QwertyKeyboard';
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

export default function WordsSessionView({
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
    return storageService.getUserData('words').adaptiveCompetenceRating || storageService.getUserData('words').competenceRank || 1000;
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

  // Friends on Main
  const displayedFriends = storageService.getFriends(profileId).filter(f => f.isDisplayedOnMain).slice(0, 2);
  const [friend1State, setFriend1State] = useState('idle');
  const [friend2State, setFriend2State] = useState('idle');
  const [friend1Tooltip, setFriend1Tooltip] = useState(false);
  const [friend2Tooltip, setFriend2Tooltip] = useState(false);

  // Manage timeouts to avoid memory leaks
  const friend1TimeoutRef = useRef(null);
  const friend1TooltipTimeoutRef = useRef(null);
  const friend2TimeoutRef = useRef(null);
  const friend2TooltipTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (friend1TimeoutRef.current) clearTimeout(friend1TimeoutRef.current);
      if (friend1TooltipTimeoutRef.current) clearTimeout(friend1TooltipTimeoutRef.current);
      if (friend2TimeoutRef.current) clearTimeout(friend2TimeoutRef.current);
      if (friend2TooltipTimeoutRef.current) clearTimeout(friend2TooltipTimeoutRef.current);
    };
  }, []);

  const handleFriendClick = (friendIndex) => {
    soundFx.playKeyTap();
    if (friendIndex === 0) {
      if (friend1TimeoutRef.current) clearTimeout(friend1TimeoutRef.current);
      if (friend1TooltipTimeoutRef.current) clearTimeout(friend1TooltipTimeoutRef.current);
      setFriend1State('streak');
      setFriend1Tooltip(true);
      friend1TimeoutRef.current = setTimeout(() => setFriend1State('idle'), 700);
      friend1TooltipTimeoutRef.current = setTimeout(() => setFriend1Tooltip(false), 2000);
    } else {
      if (friend2TimeoutRef.current) clearTimeout(friend2TimeoutRef.current);
      if (friend2TooltipTimeoutRef.current) clearTimeout(friend2TooltipTimeoutRef.current);
      setFriend2State('streak');
      setFriend2Tooltip(true);
      friend2TimeoutRef.current = setTimeout(() => setFriend2State('idle'), 700);
      friend2TooltipTimeoutRef.current = setTimeout(() => setFriend2Tooltip(false), 2000);
    }
  };

  // In-session Streaks & Overlays
  const [inSessionStreak, setInSessionStreak] = useState(0);
  const [inSessionIncorrectStreak, setInSessionIncorrectStreak] = useState(0);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showFrustrationCard, setShowFrustrationCard] = useState(false);
  const [celebrationEvent, setCelebrationEvent] = useState(null);
  const [incorrectReviewData, setIncorrectReviewData] = useState(null);

  const isWordsProblem = (p) => {
    if (!p) return false;
    if (p.subject && p.subject !== 'words') return false;
    if (p.type === 'world' || p.type === 'geography' || (p.num1 !== undefined && p.num2 !== undefined && p.type !== 'words')) return false;
    return true;
  };

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [savedClimbState, setSavedClimbState] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'words');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isWordsProblem) || (saved.subject && saved.subject !== 'words'))) {
      storageService.clearActiveClimbState(profileId, 'words');
      return null;
    }
    return saved;
  });

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(0);

  // Sync saved climb state when active profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId, 'words');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isWordsProblem) || (saved.subject && saved.subject !== 'words'))) {
      storageService.clearActiveClimbState(profileId, 'words');
      setSavedClimbState(null);
    } else {
      setSavedClimbState(saved);
    }
  }, [profileId]);

  // Generate adaptive problem queue for active tier based on competence rating
  const [problemQueue, setProblemQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'words');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isWordsProblem)) {
      return saved.problemQueue;
    }
    if (saved) {
      storageService.clearActiveClimbState(profileId, 'words');
    }
    const seen = new Set();
    const currentRating = storageService.getUserData('words').adaptiveCompetenceRating || storageService.getUserData('words').competenceRank || 1000;
    const activeTier = isFTUX ? 1 : getTierFromRating(currentRating);
    const recentWords = storageService.getUserData('words').recentWords || [];
    const batch = generateProblems(15, activeTier, recentWords, seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blockAnswers, setBlockAnswers] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'words');
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
  const effectiveWordSlots = useMemo(() => {
    const displayStr = currentProblem.displayString || '';
    const displayParts = displayStr.split(' ').filter((c) => c.length > 0);
    const baseSlots = displayParts.length > 0 ? displayParts : displayStr.split('');
    return baseSlots.map((char, idx) => (char === '_' && spyglassRevealedSlots[idx] ? spyglassRevealedSlots[idx] : char));
  }, [currentProblem.displayString, spyglassRevealedSlots]);

  const blankSlotIndices = useMemo(() => {
    const indices = [];
    effectiveWordSlots.forEach((slot, idx) => {
      if (slot === '_') indices.push(idx);
    });
    return indices;
  }, [effectiveWordSlots]);

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

    // Pick the optimal blank slot position (avoiding letters/slots already revealed by Clue)
    const answerStr = (currentProblem.answerString || currentProblem.answer || '').toString();
    const targetPos = selectSpyglassSlot({
      targetStr: answerStr,
      effectiveWordSlots,
      isClueActive: showFrustrationCard,
      blankSlotIndices
    });

    if (targetPos < 0) return;
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
      subject: 'words',
      subjectId: 'words',
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

    storageService.saveActiveClimbState(climbState, profileId, 'words');
    setSavedClimbState(climbState);
  };

  const handleStartClimb = () => {
    soundFx.playKeyTap();
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId, 'words');
    setSavedClimbState(null);
    setBlockAnswers([]);
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    const saved = storageService.getActiveClimbState(profileId, 'words');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isWordsProblem)) {
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
        storageService.clearActiveClimbState(profileId, 'words');
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
        const saved = storageService.getActiveClimbState(profileId, 'words');
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
      const recentWords = storageService.getUserData('words').recentWords || [];
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
    }, 'words');

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
    }, 'words');

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

  const getFullWordFromInput = (input) => {
    let fullWord = '';
    let inputIdx = 0;

    for (let i = 0; i < effectiveWordSlots.length; i++) {
      if (effectiveWordSlots[i] === '_') {
        if (inputIdx < input.length) {
          fullWord += input[inputIdx];
          inputIdx++;
        } else {
          fullWord += '_'; // missing input
        }
      } else {
        fullWord += effectiveWordSlots[i];
      }
    }
    return fullWord.toLowerCase();
  };

  const processAnswerEvaluation = (userAnsString = inputVal) => {
    const rawInput = typeof userAnsString === 'string' ? userAnsString : inputVal;
    setInputVal(rawInput);
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
    const fullWordGuess = getFullWordFromInput(rawInput);

    const isCorrect = fullWordGuess === normTargetAns;
    const latencyMs = performance.now() - problemStartTimeRef.current;
    const timeElapsedSec = latencyMs / 1000;
    const concept = currentProblem.concept || currentProblem.type || currentProblem.hint || 'Vocabulary';
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
        const recentWords = storageService.getUserData('words').recentWords || [];
        const probeData = generateTierProblem(probeTier, recentWords, blockSeenKeysRef.current);
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

      const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
      setBlockRatingGain(nextBlockRatingGain);

      const activeWord = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
      const existingRecent = storageService.getUserData('words').recentWords || [];
      const updatedRecent = activeWord ? [activeWord, ...existingRecent.filter(w => w !== activeWord)].slice(0, 60) : existingRecent;

      storageService.saveUserData({
        adaptiveCompetenceRating: evalResult.nextCompetenceRank,
        competenceRank: evalResult.nextCompetenceRank,
        recentWords: updatedRecent
      }, 'words');

      const activeUserData = storageService.getUserData('words');
      const badgeEvalRes = evaluateBadges({
        ...activeUserData,
        subjectId: 'words',
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
      if (badgeEvalRes?.newlyUnlocked && badgeEvalRes.newlyUnlocked.length > 0) {
        const priorityOrder = [
          'peak_lexicon_master', 'etymology_explorer', 'vocab_voyager',
          'morphology_master', 'compound_crafter', 'digraph_diver',
          'blend_builder', 'sight_word_scout',
          'words_lexicon_master', 'words_scholar', 'words_novice', 'word_speed_demon'
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
        storageService.saveUserData({ recentSkillMastery: updatedMastery }, 'words');
      }

      const nextQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(nextQuestionsAnswered);
      setSessionQuestionIndex((prev) => prev + 1);
      if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(true);
      setInputVal('');

      // Trigger Kibo Break Overlay every 12 problems solved & record personal bests
      if (nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0) {
        KiboAudioManager.playBreakSFX();
        setMascotState('break');
        setShowBreakOverlay(true);

        storageService.clearActiveClimbState(profileId, 'words');
        setSavedClimbState(null);

        const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
        const finalBlockCorrect = Math.min(12, blockCorrectCount + 1);
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
        }, 'words');
        if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
        if (onRecordDailyPractice) onRecordDailyPractice();

        // Immediately evaluate and claim any newly met badges at block completion (e.g. Flawless Ascent, Trailblazer Record, 3rd Perfect Run)
        const postBlockUserData = storageService.getUserData('words');
        const blockBadgeEval = evaluateBadges({
          ...postBlockUserData,
          inSessionStreak: evalResult.nextInSessionStreak,
          competenceRank: evalResult.nextCompetenceRank,
          blockRatingGain: nextBlockRatingGain,
          isNewSpeedRecord,
          hasSetPersonalRecord: isNewSpeedRecord || isPerfectBlock,
          subjectId: 'words'
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

      const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
      setBlockRatingGain(nextBlockRatingGain);

      const activeWord = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
      const existingRecent = storageService.getUserData('words').recentWords || [];
      const updatedRecent = activeWord ? [activeWord, ...existingRecent.filter(w => w !== activeWord)].slice(0, 60) : existingRecent;

      storageService.saveUserData({
        adaptiveCompetenceRating: evalResult.nextCompetenceRank,
        competenceRank: evalResult.nextCompetenceRank,
        recentWords: updatedRecent
      }, 'words');

      const activeUserData = storageService.getUserData('words');
      const badgeEvalRes = evaluateBadges({
        ...activeUserData,
        subjectId: 'words',
        inSessionStreak: evalResult.nextInSessionStreak,
        competenceRank: evalResult.nextCompetenceRank,
        blockRatingGain: nextBlockRatingGain,
        lastProblemType: currentProblem.type,
        lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank)
      });

      if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
      }

      const existingMastery = activeUserData.recentSkillMastery || [];
      const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
      if (updatedMastery.length !== existingMastery.length) {
        storageService.saveUserData({ recentSkillMastery: updatedMastery }, 'words');
      }

      const isBlockComplete = (questionsAnswered + 1) % 12 === 0;

      // Allow the user to see and review the correct spelling before moving on
      setIncorrectReviewData({
        problem: currentProblem,
        userAnswer: userAnsString,
        correctAnswer: normTargetAns || (currentProblem.answerString || currentProblem.answer || '').toString(),
        isProbe: !!currentProblem.isProbe,
        evalResult,
        nextQuestionsAnswered: questionsAnswered + 1,
        nextBlockAnswers,
        nextBlockRatingGain,
        isShieldAbsorbed,
        isBlockComplete
      });
    }
  };

  const handleContinueAfterIncorrect = () => {
    if (!incorrectReviewData) return;
    soundFx.playKeyTap();
    const data = incorrectReviewData;
    setIncorrectReviewData(null);
    setInputVal('');

    const nextQuestionsAnswered = data.nextQuestionsAnswered;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);
    if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(false);

    if (data.isBlockComplete) {
      KiboAudioManager.playBreakSFX();
      setMascotState('break');
      setShowBreakOverlay(true);

      storageService.clearActiveClimbState(profileId, 'words');
      setSavedClimbState(null);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = blockCorrectCount;
      const finalBlockSparks = blockSparksEarned;
      const isPerfectBlock = false;

      const newSessionRecord = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        tier: getTierFromRating(data.evalResult.nextCompetenceRank),
        totalTimeSec: blockTimeSec,
        correctCount: finalBlockCorrect,
        totalQuestions: 12,
        sparksEarned: finalBlockSparks,
        accuracyPct: Math.round((finalBlockCorrect / 12) * 100),
        ratingGain: data.nextBlockRatingGain,
        answers: data.nextBlockAnswers
      };

      const activeUserData = storageService.getUserData('words');
      const existingHistory = activeUserData.sprintHistory || [];
      const updatedHistory = [newSessionRecord, ...existingHistory];

      setCompletedBlockStats({
        correctCount: finalBlockCorrect,
        sparksEarned: finalBlockSparks,
        blockRatingGain: data.nextBlockRatingGain,
        shieldsUsed: blockShieldsUsed
      });

      // Immediately reset block counters to 0 for the next 12-question block
      setBlockCorrectCount(0);
      setBlockSparksEarned(0);
      setBlockRatingGain(0);
      setBlockShieldsUsed(0);
      setBlockAnswers([]);

      const currentRecords = activeUserData.personalRecords || {};
      const updatedRecords = {
        ...currentRecords
      };

      storageService.saveUserData({
        sprintHistory: updatedHistory,
        personalRecords: updatedRecords
      }, 'words');
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (onRecordDailyPractice) onRecordDailyPractice();

      const postBlockUserData = storageService.getUserData('words');
      const blockBadgeEval = evaluateBadges({
        ...postBlockUserData,
        inSessionStreak: data.evalResult.nextInSessionStreak,
        competenceRank: data.evalResult.nextCompetenceRank,
        blockRatingGain: data.nextBlockRatingGain,
        isNewSpeedRecord: false,
        hasSetPersonalRecord: false,
        subjectId: 'words'
      }, newSessionRecord);

      if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
      }
    } else {
      const nextIdx = currentIndex + 1;
      replenishQueueIfNeeded(nextIdx);
      setAcknowledgedGivenIndices(new Set());
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    }

    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, 3500);
  };

  const handleCharInput = (val) => {
    if (incorrectReviewData) return;
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    if (!val || typeof val !== 'string') return;
    const charInput = val.toLowerCase().trim();
    if (!charInput) return;

    soundFx.playKeyTap();

    const filledCount = inputVal.length;

    // Check if player is typing a pre-filled/given letter for the current segment
    if (filledCount < blankSlotIndices.length) {
      const activeBlankSlotIndex = blankSlotIndices[filledCount];
      const prevBlankSlotIndex = filledCount === 0 ? -1 : blankSlotIndices[filledCount - 1];

      // Check given letters in the interval (prevBlankSlotIndex, activeBlankSlotIndex)
      let matchedGivenIdx = -1;
      for (let i = prevBlankSlotIndex + 1; i < activeBlankSlotIndex; i++) {
        if (!acknowledgedGivenIndices.has(i)) {
          // Check if all prior given letters in this chunk were acknowledged
          let priorGivenAllAcked = true;
          for (let j = prevBlankSlotIndex + 1; j < i; j++) {
            if (!acknowledgedGivenIndices.has(j)) {
              priorGivenAllAcked = false;
              break;
            }
          }
          if (priorGivenAllAcked && effectiveWordSlots[i].toLowerCase() === charInput) {
            matchedGivenIdx = i;
            break;
          }
          // If the very next unacknowledged given letter in order does not match, break out
          // so input can directly fill the active blank
          break;
        }
      }

      if (matchedGivenIdx !== -1) {
        // Mark this given slot as acknowledged so repeated presses of the same letter fill the blank!
        setAcknowledgedGivenIndices((prev) => {
          const next = new Set(prev);
          next.add(matchedGivenIdx);
          return next;
        });
        triggerGivenHighlight(matchedGivenIdx);
        return;
      }
    } else if (blankSlotIndices.length > 0) {
      // All blanks are already filled. Check trailing given letters (after the last blank)
      const lastBlankSlotIndex = blankSlotIndices[blankSlotIndices.length - 1];
      let matchedTrailingIdx = -1;
      for (let i = lastBlankSlotIndex + 1; i < effectiveWordSlots.length; i++) {
        if (effectiveWordSlots[i].toLowerCase() === charInput) {
          matchedTrailingIdx = i;
          break;
        }
      }

      if (matchedTrailingIdx !== -1) {
        triggerGivenHighlight(matchedTrailingIdx);
        const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
        const fullWordGuess = getFullWordFromInput(inputVal);
        if (fullWordGuess === normTargetAns) {
          processAnswerEvaluation(inputVal);
        }
        return;
      }
    }

    // Otherwise, fill the active blank
    const newInput = inputVal + charInput;
    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
    const fullWordGuess = getFullWordFromInput(newInput);
    const blanksCount = blankSlotIndices.length;

    const isCorrect = fullWordGuess === normTargetAns;

    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    if (newInput.length >= blanksCount) {
      processAnswerEvaluation(newInput);
      return;
    }

    setInputVal(newInput);
  };


  const handleDeleteDigit = () => {
    soundFx.playKeyTap();
    setInputVal((prev) => {
      const nextVal = prev.slice(0, -1);
      if (nextVal.length === 0) {
        setAcknowledgedGivenIndices(new Set());
      }
      return nextVal;
    });
  };

  const handleClearInput = () => {
    soundFx.playKeyTap();
    setInputVal('');
    setAcknowledgedGivenIndices(new Set());
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

      if (incorrectReviewData) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContinueAfterIncorrect();
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key.toLowerCase());
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputVal, currentProblem, competenceRank, hasStartedClimb, incorrectReviewData]);

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
          storageService.clearActiveClimbState(profileId, 'words');
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
          const recentWords = storageService.getUserData('words').recentWords || [];
          const freshBatch = generateProblems(15, nextTier, recentWords, blockSeenKeysRef.current);
          setProblemQueue(freshBatch);
          setCurrentIndex(0);
          if (onOpenWorkshop) onOpenWorkshop();
        }}
        onResumeClimb={() => {
          setShowBreakOverlay(false);
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId, 'words');
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
          const recentWords = storageService.getUserData('words').recentWords || [];
          const freshBatch = generateProblems(15, nextTier, recentWords, blockSeenKeysRef.current);
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
        <div
          onClick={() => setCelebrationEvent(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <ConfettiCanvas />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-amber-50 via-white to-yellow-50 border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative overflow-hidden text-slate-800 cursor-default"
          >
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
        className="flex-1 flex flex-row items-center justify-center w-full min-h-0 my-auto py-1 sm:py-2 z-10 overflow-visible gap-2 sm:gap-4 md:gap-8"
      >
        {/* Left Friend */}
        {displayedFriends[0] ? (
          <div
            className="relative flex items-center justify-center overflow-visible w-1/4 h-3/4 max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={() => handleFriendClick(0)}
            title={`Tap ${displayedFriends[0].username}!`}
          >
            {friend1Tooltip && (
              <div className="absolute -top-8 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce">
                Hi, I'm {displayedFriends[0].username}!
              </div>
            )}
            <Mascot
              mood="happy"
              state={friend1State}
              equipped={displayedFriends[0].equipped || []}
              className="h-full w-auto max-h-[25vh] max-w-[25vh] sm:max-h-[30vh] sm:max-w-[30vh] md:max-h-[35vh] md:max-w-[35vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90 scale-x-[-1]"
            />
          </div>
        ) : (
          <div className="w-1/4 shrink-0" />
        )}

        {/* Main Mascot */}
        <div
          className="relative flex items-center justify-center overflow-visible p-1.5 sm:p-3 w-1/2 h-full max-h-[35vh] sm:max-h-[46vh] md:max-h-[50vh]"
          title="Tap Kibo!"
        >
          <Mascot
            mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'}
            state={mascotState}
            equipped={equippedItems}
            className="h-full w-auto max-h-[35vh] max-w-[35vh] sm:max-h-[46vh] sm:max-w-[46vh] md:max-h-[50vh] md:max-w-[50vh] aspect-square filter drop-shadow-xl object-contain shrink-0"
          />
        </div>

        {/* Right Friend */}
        {displayedFriends[1] ? (
          <div
            className="relative flex items-center justify-center overflow-visible w-1/4 h-3/4 max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={() => handleFriendClick(1)}
            title={`Tap ${displayedFriends[1].username}!`}
          >
            {friend2Tooltip && (
              <div className="absolute -top-8 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce">
                Hi, I'm {displayedFriends[1].username}!
              </div>
            )}
            <Mascot
              mood="happy"
              state={friend2State}
              equipped={displayedFriends[1].equipped || []}
              className="h-full w-auto max-h-[25vh] max-w-[25vh] sm:max-h-[30vh] sm:max-w-[30vh] md:max-h-[35vh] md:max-w-[35vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90"
            />
          </div>
        ) : (
          <div className="w-1/4 shrink-0" />
        )}
      </div>

      {/* PROBLEM CARD CONTAINER */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center my-1 space-y-2">
        {!hasStartedClimb ? (
          /* PRE-CLIMB START SCREEN HERO CARD */
          <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-4 sm:p-5 text-center shadow-xl space-y-3 relative overflow-hidden animate-pop flex flex-col justify-center max-h-[42vh]">
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
          /* ACTIVE ADAPTIVE MATH QUESTION CARD */
          (() => {
            const streakCfg = getStreakTierConfig(inSessionStreak);

            return (
              <div
                className={`w-full max-w-sm sm:max-w-md shrink-0 flex flex-col justify-center bg-white border-4 rounded-3xl p-2.5 sm:p-3 text-center transition-all duration-500 space-y-1.5 relative ${
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

                <div className="w-full flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-0.5">
                  <span className="text-[10px] sm:text-xs font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-purple-200 shrink-0 shadow-2xs">
                    🎯 Q #{currentQuestionNum}/12
                  </span>
                  {isNearTierThreshold(competenceRank) && !currentProblem.isProbe && (
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-500 shrink-0 shadow-md animate-pulse flex items-center gap-1" title="1 question away from entering the next Tier!">
                      ⚡ TIER GATEKEEPER
                    </span>
                  )}
                  {currentProblem.isProbe && (
                    <span className="text-[10px] sm:text-xs font-black uppercase text-white bg-gradient-to-r from-amber-500 to-indigo-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-indigo-300 shrink-0 shadow-md animate-pulse flex items-center gap-1">
                      🚀 SKILL PROBE (+120)
                    </span>
                  )}
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all duration-300 shadow-2xs ${streakCfg.pillClass}`}
                  >
                    {streakCfg.label}
                  </span>

                  {incorrectReviewData ? (
                    <span className="text-[10px] sm:text-xs font-black uppercase text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-300 shadow-2xs font-extrabold flex items-center gap-1">
                      ❌ Reviewing Solution
                    </span>
                  ) : (
                    <>
                      {/* NON-PUNITIVE PASS / TRY ANOTHER BUTTON */}
                      <button
                        type="button"
                        onClick={handlePassQuestion}
                        disabled={consecutiveSkips >= 2}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
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
                              text: 'Kibo Wisdom Clue Unlocked! 📜'
                            }, 1200);
                          } else if (onOpenWorkshop) {
                            onOpenWorkshop();
                          }
                        }}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
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
                            ? 'Use Wisdom Scroll for phonics & word structure clues!'
                            : 'Get Hint Scrolls in Kibo\'s Corner'
                        }
                      >
                        📜 {showFrustrationCard ? 'Clue Active' : (consumables?.hintScrollCount ?? 0) > 0 ? `Clue (${consumables.hintScrollCount})` : 'Clue'}
                      </button>

                      {/* LETTER SPYGLASS BUTTON */}
                      <button
                        type="button"
                        onClick={handleUseLetterSpyglass}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          (consumables?.letterSpyglassCount ?? 0) > 0
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={
                          (consumables?.letterSpyglassCount ?? 0) > 0
                            ? 'Use Letter Spyglass to reveal & fill 1 missing letter slot!'
                            : 'Get Letter Spyglass in Kibo\'s Corner'
                        }
                      >
                        🔍 {(consumables?.letterSpyglassCount ?? 0) > 0 ? `Spyglass (${consumables.letterSpyglassCount})` : 'Spyglass'}
                      </button>

                      {/* LETTER PRUNER BUTTON */}
                      <button
                        type="button"
                        onClick={handleUseLetterPruner}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          isLetterPrunerActive
                            ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                            : (consumables?.letterPrunerCount ?? 0) > 0
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={
                          isLetterPrunerActive
                            ? 'Distractors pruned for this word!'
                            : (consumables?.letterPrunerCount ?? 0) > 0
                            ? 'Prune unused keyboard keys!'
                            : 'Get Letter Pruner in Kibo\'s Corner'
                        }
                      >
                        ✂️ {isLetterPrunerActive ? 'Pruned' : (consumables?.letterPrunerCount ?? 0) > 0 ? `Prune (${consumables.letterPrunerCount})` : 'Prune'}
                      </button>
                    </>
                  )}

                  {isDoubleSparksActive && (
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-amber-200 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-400 animate-pulse shrink-0 shadow-xs flex items-center gap-1">
                      ⚡ 2x Active!
                    </span>
                  )}

                  {/* KIBO SHIELD ACTIVE PILL */}
                  {((consumables?.shieldCount || 0) > 0 || (consumables?.streakSaverCount || 0) > 0) && (
                    <span
                      className="text-[10px] sm:text-xs font-black uppercase text-sky-950 bg-sky-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-sky-300 shrink-0 shadow-2xs flex items-center gap-1 cursor-help"
                      title="Kibo Shield Active: Your climb & streak are protected!"
                    >
                      🛡️ Shields ({consumables.shieldCount || consumables.streakSaverCount})
                    </span>
                  )}
                </div>

            {(() => {
              const displayStr = currentProblem.displayString || '';
              const targetStr = (currentProblem.answerString || currentProblem.answer || '').toString();

              // Dynamic slot sizing based on letter count
              const wordLen = effectiveWordSlots.length;
              let slotSizeClass = 'min-w-[2.25rem] sm:min-w-[2.75rem] h-11 sm:h-12 px-1.5 sm:px-2 rounded-xl';
              let textSizeClass = 'text-xl sm:text-2xl';
              let pingSizeClass = 'w-2.5 h-0.5';
              let spyglassBadgeClass = 'w-4 h-4 text-xs -top-1.5 -right-1';
              let containerGapClass = 'gap-1.5 sm:gap-2';

              if (wordLen >= 13) {
                slotSizeClass = 'min-w-[1.125rem] sm:min-w-[1.375rem] h-7 sm:h-8 px-0.5 rounded-md';
                textSizeClass = 'text-[10px] sm:text-xs md:text-sm';
                pingSizeClass = 'w-1.5 h-0.5';
                spyglassBadgeClass = 'w-3 h-3 text-[7.5px] -top-1 -right-0.5';
                containerGapClass = 'gap-0.5';
              } else if (wordLen >= 9) {
                slotSizeClass = 'min-w-[1.375rem] sm:min-w-[1.75rem] h-8 sm:h-9 px-0.5 sm:px-1 rounded-md sm:rounded-lg';
                textSizeClass = 'text-xs sm:text-sm md:text-base';
                pingSizeClass = 'w-2 h-0.5';
                spyglassBadgeClass = 'w-3.5 h-3.5 text-[8.5px] -top-1 -right-0.5';
                containerGapClass = 'gap-0.5 sm:gap-1';
              } else if (wordLen >= 6) {
                slotSizeClass = 'min-w-[1.75rem] sm:min-w-[2.25rem] h-9 sm:h-10 px-1 sm:px-1.5 rounded-lg sm:rounded-xl';
                textSizeClass = 'text-base sm:text-xl';
                pingSizeClass = 'w-2 h-0.5';
                spyglassBadgeClass = 'w-3.5 h-3.5 text-[9px] -top-1 -right-1';
                containerGapClass = 'gap-1 sm:gap-1.5';
              }

              // Helper to interleave the input with the blanks and highlight given letters
              const renderWordDisplay = () => {
                let inputIndex = 0;
                const activeBlankOrderIndex = inputVal.length;

                return (
                  <div className={`flex items-center justify-center flex-wrap ${containerGapClass} max-w-full`}>
                    {effectiveWordSlots.map((char, index) => {
                      if (char === '_') {
                        const thisBlankOrder = inputIndex;
                        const typedChar = inputVal[inputIndex];
                        const isCurrentActiveBlank = thisBlankOrder === activeBlankOrderIndex;
                        inputIndex++;

                        return (
                          <span
                            key={index}
                            className={`relative inline-flex items-center justify-center font-black transition-all duration-150 ${slotSizeClass} ${textSizeClass} ${
                              typedChar
                                ? 'bg-teal-50 text-teal-800 border-2 border-teal-500 shadow-xs'
                                : isCurrentActiveBlank
                                ? 'bg-white text-teal-600 border-2 border-dashed border-teal-400 shadow-inner ring-2 ring-teal-200/70 animate-pulse'
                                : 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-300'
                            }`}
                          >
                            {typedChar ? typedChar.toUpperCase() : isCurrentActiveBlank ? (
                              <span className={`${pingSizeClass} bg-teal-400 rounded-full animate-ping`} />
                            ) : '\u00A0'}
                          </span>
                        );
                      } else {
                        const isSpyglassRevealed = !!spyglassRevealedSlots[index];
                        const isPulsing = highlightedGivenIndex === index;
                        return (
                          <span
                            key={index}
                            className={`relative inline-flex items-center justify-center font-black select-none transition-all duration-200 ${slotSizeClass} ${textSizeClass} ${
                              isPulsing
                                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 ring-4 ring-emerald-300/80 scale-110 shadow-md'
                                : isSpyglassRevealed
                                ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 ring-2 ring-amber-300 shadow-xs scale-105'
                                : 'bg-slate-100/90 text-slate-700 border-2 border-slate-200/90 shadow-xs'
                            }`}
                          >
                            {char.toUpperCase()}
                            {isSpyglassRevealed && (
                              <span className={`absolute bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-xs font-bold ring-1 ring-white ${spyglassBadgeClass}`}>
                                🔍
                              </span>
                            )}
                          </span>
                        );
                      }
                    })}
                  </div>
                );
              };

              const getWordHintMessage = () => {
                return getClueHintMessage({
                  targetStr,
                  effectiveWordSlots,
                  problemHint: currentProblem.hint
                });
              };

              return (
                <div className="space-y-1 sm:space-y-1.5 w-full">
                  <div className="w-full text-center my-0.5 sm:my-1 text-xs sm:text-sm md:text-base leading-tight font-bold text-slate-600">
                     {currentProblem.hint || "Spell the word!"}
                  </div>
                  <div className="w-full flex items-center justify-center flex-wrap my-1 sm:my-1.5 font-extrabold uppercase">
                     {incorrectReviewData ? (
                       <div className={`flex items-center justify-center flex-wrap ${containerGapClass} max-w-full`}>
                         {targetStr.split('').map((char, index) => (
                           <span
                             key={index}
                             className={`relative inline-flex items-center justify-center font-black transition-all duration-150 ${slotSizeClass} ${textSizeClass} bg-emerald-100 text-emerald-900 border-2 border-emerald-400 ring-2 ring-emerald-300 shadow-xs scale-105 animate-pop`}
                           >
                             {char.toUpperCase()}
                           </span>
                         ))}
                       </div>
                     ) : (
                       renderWordDisplay()
                     )}
                  </div>

                  {/* INCORRECT ANSWER REVIEW BANNER */}
                  {incorrectReviewData && (
                    <div className="w-full bg-rose-50 border-2 border-rose-200 rounded-2xl p-2 sm:p-2.5 text-center space-y-1 animate-pop">
                      <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
                        <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                          ✕ Your spelling: <span className="line-through font-extrabold">{incorrectReviewData.userAnswer || '—'}</span>
                        </span>
                        <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold flex items-center gap-1">
                          ✓ Correct: {targetStr.toUpperCase()}
                        </span>
                      </div>
                      {currentProblem.hint && (
                        <p className="text-xs text-indigo-900 font-medium italic pt-0.5">
                          📜 {currentProblem.hint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* INTEGRATED KIBO HINT */}
                  {!incorrectReviewData && showFrustrationCard && (
                    <div className="w-full pt-1 border-t border-indigo-100 text-[11px] sm:text-xs font-bold text-indigo-900 bg-indigo-50/90 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl animate-pop text-center space-y-0.5 mt-1 shadow-2xs">
                      <span className="block font-black text-indigo-950 flex items-center justify-center gap-1 text-xs">
                        <span>📜</span> Kibo Wisdom Clue:
                      </span>
                      <span className="font-semibold block text-indigo-800 text-[11px] sm:text-xs">{getWordHintMessage()}</span>
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

      {/* QWERTY KEYBOARD OR REVIEW ACTION */}
      {hasStartedClimb && (
        <div className="w-full max-w-sm shrink-0 animate-pop mt-0.5 sm:mt-2 max-h-[35vh]">
          {incorrectReviewData ? (
            <div className="space-y-2 py-2">
              <button
                type="button"
                autoFocus
                onClick={handleContinueAfterIncorrect}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-lg sm:text-xl py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer select-none"
              >
                <span>{incorrectReviewData.isBlockComplete ? 'Finish Climb 🏔️' : 'Next Question ➔'}</span>
              </button>
              <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                Press Enter or Space ↵
              </p>
            </div>
          ) : (
            <QwertyKeyboard
              prunedKeys={prunedKeys}
              onChar={handleCharInput}
              onDelete={handleDeleteDigit}
              onClear={handleClearInput}
              onSubmit={(val) => {
                const answerToSubmit = typeof val === 'string' && val.trim() ? val : inputVal;
                processAnswerEvaluation(answerToSubmit);
              }}
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
