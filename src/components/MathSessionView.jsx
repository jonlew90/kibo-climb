import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { analyticsService } from '../services/analyticsService';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame, Flag, Pause, X } from 'lucide-react';
import Mascot from './Mascot';
import Keypad from './Keypad';
import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import FeedbackModal from './FeedbackModal';
import { generateProblems } from '../utils/mathGenerator';
import { getTierFromRating, generateTierProblem, isNearTierThreshold } from '../utils/mathCurriculum';
import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { normalizeTimeAnswer, normalizeDecimal, parseFractionValue, normalizeOperator } from '../utils/formatters';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents, shouldTriggerProbeQuestion } from '../utils/AdaptiveEngine';
import { getProbeTargetTier } from '../utils/SkillTreeConfig';
import KiboBreakOverlay from './KiboBreakOverlay';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateBadges } from '../utils/badgeManager';
import { storageService } from '../services/storageService';
import { getConceptForProblem } from '../utils/skipDiagnosticEngine';
import useInactivityAutoPause from '../hooks/useInactivityAutoPause';
import { getStreakTierConfig } from '../utils/streakTierConfig';
import ClimbHeader from './climb/ClimbHeader';
import ClimbPreCard from './climb/ClimbPreCard';
import CelebrationOverlay from './climb/CelebrationOverlay';
import CompanionsRow from './climb/CompanionsRow';
import ToastBanner from './climb/ToastBanner';
import ChallengeBanner from './climb/ChallengeBanner';
import ItemThumbnail from './ItemThumbnail';


export default function MathSessionView({
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
  onResetDoubleSparks,
  onClimbActiveChange,
  onOpenPracticeMode,
  practiceConfig = null,
  onExitPractice
}) {
  const [competenceRank, setCompetenceRank] = useState(() => {
    return storageService.getUserData('math').adaptiveCompetenceRating || storageService.getUserData('math').competenceRank || 1000;
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
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);

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

  // Freeze background interaction and handle dismiss keys when celebration modal is active
  useEffect(() => {
    if (!celebrationEvent) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleModalKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setCelebrationEvent(null);
      }
    };
    window.addEventListener('keydown', handleModalKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [celebrationEvent]);
  const [incorrectReviewData, setIncorrectReviewData] = useState(null);

  const isMathProblem = (p) => {
    if (!p) return false;
    if (p.subject && p.subject !== 'math') return false;
    if (p.shapeSvg !== undefined && p.shapeSvg !== null) return false;
    if (p.mapData !== undefined && p.mapData !== null) return false;
    if (p.missingLetters !== undefined) return false;
    const MATH_TYPES = new Set(['fill_blank', 'missing_operator', 'money', 'fraction', 'decimal', 'applied', 'signed']);
    return (p.num1 !== undefined && p.num2 !== undefined) || (p.type && MATH_TYPES.has(p.type));
  };

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  useEffect(() => {
    if (onClimbActiveChange) {
      onClimbActiveChange(Boolean(hasStartedClimb && !showBreakOverlay));
    }
  }, [hasStartedClimb, showBreakOverlay, onClimbActiveChange]);

  const [savedClimbState, setSavedClimbState] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isMathProblem) || (saved.subject && saved.subject !== 'math'))) {
      storageService.clearActiveClimbState(profileId, 'math');
      return null;
    }
    return saved;
  });

  const blockSeenKeysRef = useRef(new Set());
  const blockStartTimeRef = useRef(0);

  // Sync saved climb state when active profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isMathProblem) || (saved.subject && saved.subject !== 'math'))) {
      storageService.clearActiveClimbState(profileId, 'math');
      setSavedClimbState(null);
    } else {
      setSavedClimbState(saved);
    }
  }, [profileId]);

  const isPracticeMode = Boolean(practiceConfig);
  const practiceSprintLength = practiceConfig?.sprintLength || 12;

  // Generate adaptive problem queue for active tier based on competence rating (or practiceConfig)
  const [problemQueue, setProblemQueue] = useState(() => {
    if (practiceConfig) {
      const seen = new Set();
      const batch = generateProblems(practiceSprintLength, practiceConfig.tier, [], seen);
      blockSeenKeysRef.current = seen;
      return batch;
    }
    const saved = storageService.getActiveClimbState(profileId, 'math');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isMathProblem)) {
      return saved.problemQueue;
    }
    if (saved) {
      storageService.clearActiveClimbState(profileId, 'math');
    }
    const seen = new Set();
    const currentRating = storageService.getUserData('math').adaptiveCompetenceRating || storageService.getUserData('math').competenceRank || 1000;
    const activeTier = isFTUX ? 1 : getTierFromRating(currentRating);
    const batch = generateProblems(15, activeTier, [], seen);
    blockSeenKeysRef.current = seen;
    return batch;
  });

  // When practiceConfig changes, configure problemQueue and start climb automatically
  useEffect(() => {
    if (practiceConfig) {
      const seen = new Set();
      const batch = generateProblems(practiceSprintLength, practiceConfig.tier, [], seen);
      blockSeenKeysRef.current = seen;
      setProblemQueue(batch);
      setCurrentIndex(0);
      setSessionQuestionIndex(1);
      setQuestionsAnswered(0);
      setBlockAnswers([]);
      setMissedReviewQueue([]);
      setIsReviewPhase(false);
      setBlockCorrectCount(0);
      setBlockSparksEarned(0);
      setBlockRatingGain(0);
      setBlockShieldsUsed(0);
      setInSessionStreak(0);
      setInSessionIncorrectStreak(0);
      setConsecutiveSkips(0);
      setHasStartedClimb(true);
      blockStartTimeRef.current = performance.now();
      problemStartTimeRef.current = performance.now();
    }
  }, [practiceConfig]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPracticeExitConfirm, setShowPracticeExitConfirm] = useState(false);
  const [shouldPulseHint, setShouldPulseHint] = useState(false);

  const [blockAnswers, setBlockAnswers] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    return saved?.blockAnswers || [];
  });
  const [missedReviewQueue, setMissedReviewQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    return saved?.missedReviewQueue || [];
  });
  const [isReviewPhase, setIsReviewPhase] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    return Boolean(saved?.isReviewPhase);
  });

  // Power-up States for Math Climbs
  const [isLetterPrunerActive, setIsLetterPrunerActive] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    return Boolean(saved?.isLetterPrunerActive);
  });
  const [spyglassRevealedAnswer, setSpyglassRevealedAnswer] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'math');
    return saved?.spyglassRevealedAnswer || null;
  });

  // Reset per-question power-up state on question transition (only when index changes during active climb)
  const prevIndexRef = useRef(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setIsLetterPrunerActive(false);
      setSpyglassRevealedAnswer(null);
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  const currentProblem = problemQueue[currentIndex] || {};
  const isMoneyQuestion =
    currentProblem.type === 'money' ||
    currentProblem.operatorSymbol === '🪙' ||
    /quarter|dime|nickel|penny|\$|¢|change|costing/i.test(currentProblem.displayString || '');
  const isTimeQuestion = currentProblem.type === 'time';
  const targetStr = String(currentProblem.answerString || currentProblem.answer || '');

  const isOperatorQuestion = Boolean(
    currentProblem.type === 'missing_operator' ||
    currentProblem.blankPosition === 'operator' ||
    (currentProblem.options && currentProblem.options.some((opt) => ['+', '-', '−', '×', '*', '÷', '/'].includes(opt))) ||
    ['+', '-', '−', '×', '*', '÷', '/'].includes(String(currentProblem.answerString || currentProblem.answer || '').trim())
  );

  // Compute pruned keys when Climber Pruner is active
  const prunedKeys = React.useMemo(() => {
    if (!isLetterPrunerActive) return [];
    if (currentProblem.options && Array.isArray(currentProblem.options)) {
      return currentProblem.options.filter(opt => opt !== targetStr && opt !== currentProblem.answer);
    }
    const targetChars = new Set(targetStr.split(''));
    const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return allDigits.filter(d => !targetChars.has(d));
  }, [isLetterPrunerActive, currentProblem, targetStr]);

  const problemStartTimeRef = useRef(0);
  const pauseStartRef = useRef(null);

  const saveCurrentClimbProgress = () => {
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
      subject: 'math',
      subjectId: 'math',
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
      isLetterPrunerActive,
      spyglassRevealedAnswer,
      showFrustrationCard
    };

    storageService.saveActiveClimbState(climbState, profileId, 'math');
    setSavedClimbState(climbState);
  };

  const handleStartClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId, 'math');
    setSavedClimbState(null);
    setBlockAnswers([]);
    setMissedReviewQueue([]);
    setIsReviewPhase(false);
    setIsLetterPrunerActive(false);
    setSpyglassRevealedAnswer(null);
    setShowFrustrationCard(false);
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    const saved = storageService.getActiveClimbState(profileId, 'math');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isMathProblem)) {
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
      if (Array.isArray(saved.missedReviewQueue)) setMissedReviewQueue(saved.missedReviewQueue);
      setIsReviewPhase(Boolean(saved.isReviewPhase));

      setIsLetterPrunerActive(Boolean(saved.isLetterPrunerActive));
      setSpyglassRevealedAnswer(saved.spyglassRevealedAnswer || null);
      if (saved.spyglassRevealedAnswer) {
        setInputVal(saved.spyglassRevealedAnswer);
      }
      setShowFrustrationCard(Boolean(saved.showFrustrationCard));

      const now = performance.now();
      const blockTime = saved.accumulatedBlockTime || 0;
      const probTime = saved.accumulatedProblemTime || 0;

      blockStartTimeRef.current = now - blockTime;
      problemStartTimeRef.current = now - probTime;
      pauseStartRef.current = null;
    } else {
      if (saved) {
        storageService.clearActiveClimbState(profileId, 'math');
        setSavedClimbState(null);
      }
      blockStartTimeRef.current = performance.now();
      problemStartTimeRef.current = performance.now();
    }
    setHasStartedClimb(true);
  };

  const handleExitOrPauseClimb = () => {
    soundFx.playKeyTap();
    if (isPracticeMode) {
      if (questionsAnswered > 0) {
        setShowPracticeExitConfirm(true);
        return;
      }
      setHasStartedClimb(false);
      if (onExitPractice) onExitPractice();
      return;
    }
    saveCurrentClimbProgress();
    setHasStartedClimb(false);
  };

  const handleConfirmExitPractice = () => {
    soundFx.playKeyTap();
    setShowPracticeExitConfirm(false);
    setHasStartedClimb(false);
    if (onExitPractice) onExitPractice();
  };

  // Inactivity auto-pause mid-climb (ranked sessions only)
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
    isLetterPrunerActive,
    spyglassRevealedAnswer,
    showFrustrationCard,
    incorrectReviewData
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
    isReviewPhase,
    isDoubleSparksActive,
    isLetterPrunerActive,
    spyglassRevealedAnswer,
    showFrustrationCard,
    incorrectReviewData
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
          const saved = storageService.getActiveClimbState(profileId, 'math');
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

    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

    if (targetStr.startsWith('0.')) {
      setInputVal('0.');
    } else {
      setInputVal('');
    }

    return () => clearTimeout(hintTimer);
  }, [currentIndex, currentProblem, targetStr, hasStartedClimb]);

  const bannerTimerRef = useRef(null);

  const triggerToastBanner = (bannerObj, durationMs = 1100) => {
    setFeedbackBanner(bannerObj);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setFeedbackBanner(null);
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasStartedClimb && !isPaused) {
      KiboAudioManager.startBGM();
    } else {
      KiboAudioManager.stopBGM();
    }
    return () => {
      KiboAudioManager.stopBGM();
    };
  }, [hasStartedClimb, isPaused]);

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

    if (!isPracticeMode) {
      setInSessionStreak(0);
      setCompetenceRank(evalResult.nextCompetenceRank);
      if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

      const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
      setBlockRatingGain(nextBlockRatingGain);

      storageService.saveUserData({
        adaptiveCompetenceRating: evalResult.nextCompetenceRank,
        competenceRank: evalResult.nextCompetenceRank
      });
    }

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

    if (!currentProblem.isReviewAttempt) {
      setMissedReviewQueue((prev) => [...prev, { ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 }]);
    }

    const nextQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(nextQuestionsAnswered);
    setSessionQuestionIndex((prev) => prev + 1);
    setInputVal('');

    const nextIdx = currentIndex + 1;
    replenishQueueIfNeeded(nextIdx);
    setCurrentIndex(nextIdx);
  };

  const handleUseLetterSpyglass = () => {
    const owned = consumables?.letterSpyglassCount ?? 0;
    if (owned <= 0) {
      triggerToastBanner({
        type: 'info',
        text: 'Out of Spyglasses! Opening Shop... 🧪'
      }, 1400);
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    const targetAnswer = String(currentProblem.answerString || currentProblem.answer || '');
    if (inputVal === targetAnswer) {
      triggerToastBanner({
        type: 'info',
        text: 'Answer already revealed! Tap Submit.'
      }, 1500);
      return;
    }

    if (onConsumeLetterSpyglass && onConsumeLetterSpyglass()) {
      setInputVal(targetAnswer);
      setSpyglassRevealedAnswer(targetAnswer);
      triggerToastBanner({
        type: 'success',
        text: `Permanent Clue Revealed: "${targetAnswer}"! 🔍`
      }, 1500);

      // Auto-evaluate after 400ms for smooth game feel
      setTimeout(() => {
        processAnswerEvaluation(targetAnswer);
      }, 400);
    }
  };

  const handleUseLetterPruner = () => {
    if (isLetterPrunerActive) return;
    const owned = consumables?.letterPrunerCount ?? 0;
    if (owned <= 0) {
      triggerToastBanner({
        type: 'info',
        text: 'Out of Pruners! Opening Shop... 🧪'
      }, 1400);
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (onConsumeLetterPruner && onConsumeLetterPruner()) {
      setIsLetterPrunerActive(true);
      triggerToastBanner({
        type: 'success',
        text: 'Distractor choices pruned! ✂️'
      }, 1400);
    }
  };

  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString || !userAnsString.trim()) return;

    setInputVal(userAnsString);
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const normUserAns = normalizeTimeAnswer(normalizeDecimal(userAnsString));
    const normTargetAns = normalizeTimeAnswer(normalizeDecimal(currentProblem.answerString || currentProblem.answer?.toString()));

    const normUserOp = normalizeOperator(userAnsString);
    const normTargetOp = normalizeOperator(currentProblem.answerString || currentProblem.answer);
    const isOperatorMatch = normUserOp === normTargetOp && ['+', '−', '×', '÷'].includes(normTargetOp);

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

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch || isFractionMatch || isDecimalImplicitMatch || isOperatorMatch;
    const latencyMs = performance.now() - problemStartTimeRef.current;
    const timeElapsedSec = latencyMs / 1000;
    const concept = getConceptForProblem(currentProblem);
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

      if (!isPracticeMode) {
        setCompetenceRank(evalResult.nextCompetenceRank);
        if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);
      }
      setShowFrustrationCard(false);

      // Rapid initial calibration: inject Probe Challenge during Provisional Phase (<15 solved) on 3+ streak
      if (!isPracticeMode && shouldTriggerProbeQuestion({ totalProblemsSolved: totalProblemsSolved + 1, inSessionStreak: evalResult.nextInSessionStreak })) {
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

      const nextBlockRatingGain = isPracticeMode ? 0 : (blockRatingGain + evalResult.rankDelta);
      if (!isPracticeMode) {
        setBlockRatingGain(nextBlockRatingGain);

        storageService.saveUserData({
          adaptiveCompetenceRating: evalResult.nextCompetenceRank,
          competenceRank: evalResult.nextCompetenceRank
        });
      }

      const activeUserData = storageService.getUserData('math');
      const badgeEvalRes = evaluateBadges({
        ...activeUserData,
        inSessionStreak: evalResult.nextInSessionStreak,
        competenceRank: evalResult.nextCompetenceRank,
        blockRatingGain: nextBlockRatingGain,
        lastProblemType: currentProblem.type,
        lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank)
      });

      if (!isPracticeMode && badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
      }

      // --- CELEBRATION REWARDS (ONLY FOR NEW BADGE UNLOCKS TO PREVENT POPUP FATIGUE) ---
      if (!isPracticeMode && badgeEvalRes?.newlyUnlocked && badgeEvalRes.newlyUnlocked.length > 0) {
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
      if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(true);
      setInputVal('');

      // Check if primary question block is completed
      const reachedBlockEnd = nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;

      if (reachedBlockEnd && missedReviewQueue.length > 0) {
        // Transition into Mistake Review Phase
        setIsReviewPhase(true);
        setProblemQueue((prev) => [...prev, ...missedReviewQueue]);
        setMissedReviewQueue([]);
      } else if (reachedBlockEnd && missedReviewQueue.length === 0) {
        // Full block + reviews completed: Trigger Kibo Break Overlay
        setIsReviewPhase(false);
        KiboAudioManager.playBreakSFX();
        setMascotState('break');
        setShowBreakOverlay(true);

        storageService.clearActiveClimbState(profileId, 'math');
        setSavedClimbState(null);

        const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
        const finalBlockCorrect = Math.min(totalBlockQuestions, blockCorrectCount + 1);
        const finalBlockSparks = isPracticeMode ? (blockSparksEarned + blockEarned + 10) : (blockSparksEarned + blockEarned);
        if (isPracticeMode && onAwardSparks) {
          onAwardSparks(10); // +10 Sparks bonus for completing Training Camp practice sprint
        }
        const isPerfectBlock = finalBlockCorrect === totalBlockQuestions;

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

        const currentRecords = activeUserData.personalRecords || {};
        const isNewSpeedRecord = isPerfectBlock && (!currentRecords.fastest12QuestionsTime || blockTimeSec < currentRecords.fastest12QuestionsTime);
        const isNewStreakRecord = evalResult.nextInSessionStreak > (currentRecords.highestCorrectStreak || 0);
        const updatedRecords = {
          ...currentRecords,
          fastest12QuestionsTime: isNewSpeedRecord ? blockTimeSec : currentRecords.fastest12QuestionsTime,
          highestCorrectStreak: Math.max(currentRecords.highestCorrectStreak || 0, evalResult.nextInSessionStreak),
          mostPerfectSessions: isPerfectBlock
            ? (currentRecords.mostPerfectSessions || 0) + 1
            : (currentRecords.mostPerfectSessions || 0)
        };

        setCompletedBlockStats({
          correctCount: finalBlockCorrect,
          sparksEarned: finalBlockSparks,
          blockRatingGain: nextBlockRatingGain,
          shieldsUsed: blockShieldsUsed,
          blockTimeSec,
          isNewSpeedRecord,
          isNewStreakRecord
        });

        // Immediately reset block counters to 0 for the next 12-question block
        setBlockCorrectCount(0);
        setBlockSparksEarned(0);
        setBlockRatingGain(0);
        setBlockShieldsUsed(0);
        setBlockAnswers([]);

        storageService.saveUserData({
          sprintHistory: updatedHistory,
          personalRecords: updatedRecords
        });
        if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
        if (onRecordDailyPractice) onRecordDailyPractice();

        // Immediately evaluate and claim any newly met badges at block completion (e.g. Flawless Ascent, Trailblazer Record, 3rd Perfect Run)
        const postBlockUserData = storageService.getUserData('math');
        const blockBadgeEval = evaluateBadges({
          ...postBlockUserData,
          inSessionStreak: evalResult.nextInSessionStreak,
          competenceRank: evalResult.nextCompetenceRank,
          blockRatingGain: nextBlockRatingGain,
          isNewSpeedRecord,
          hasSetPersonalRecord: isNewSpeedRecord || isPerfectBlock,
          subjectId: 'math'
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
      setCurrentIndex(nextIdx);

      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = setTimeout(() => {
        setFeedbackBanner(null);
      }, 3500);
    } else {
      if (isPracticeMode) {
        // Training camp is 100% streak-safe: do not drop streak, do not consume shields
        triggerToastBanner({
          type: 'info',
          text: 'Practice Mode: Streak Protected! 🛡️'
        }, 1500);
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
        }

        setCompetenceRank(evalResult.nextCompetenceRank);
        if (onUpdateCompetenceRating) onUpdateCompetenceRating(evalResult.nextCompetenceRank);

        if (evalResult.triggerFrustrationCircuit) {
          setShowFrustrationCard(true);
        }

        const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
        setBlockRatingGain(nextBlockRatingGain);

        storageService.saveUserData({
          adaptiveCompetenceRating: evalResult.nextCompetenceRank,
          competenceRank: evalResult.nextCompetenceRank
        });

        const activeUserData = storageService.getUserData('math');
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

        const existingMastery = activeUserData.recentSkillMastery || [];
        const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
        if (updatedMastery.length !== existingMastery.length) {
          storageService.saveUserData({ recentSkillMastery: updatedMastery });
        }
      }

      const isBlockComplete = (questionsAnswered + 1) % totalBlockQuestions === 0;

      if (isBlockComplete) {
        analyticsService.logLevelUp('math', blockCorrectCount + 1);
      }

      // Duolingo mistake recycling:
      if (!currentProblem.isReviewAttempt) {
        setMissedReviewQueue((prev) => [...prev, { ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 }]);
      } else {
        // Second attempt failure in review: seamlessly persist to practiceQueue for spaced repetition
        storageService.addToPracticeQueue(currentProblem, 'math');
      }

      // Allow the user to see and review the correct answer before moving on
      setIncorrectReviewData({
        problem: currentProblem,
        userAnswer: userAnsString,
        correctAnswer: normTargetAns || currentProblem.answerString || currentProblem.answer?.toString(),
        isProbe: !!currentProblem.isProbe,
        evalResult,
        nextQuestionsAnswered: questionsAnswered + 1,
        nextBlockAnswers,
        nextBlockRatingGain,
        isShieldAbsorbed,
        isBlockComplete: isBlockComplete && missedReviewQueue.length === 0 && (!currentProblem.isReviewAttempt ? 1 : 0) === 0
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

    // If questions reached but missed questions remain, transition to review phase
    const reachedBlockEnd = nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
    if (reachedBlockEnd && missedReviewQueue.length > 0) {
      setIsReviewPhase(true);
      setProblemQueue((prev) => [...prev, ...missedReviewQueue]);
      setMissedReviewQueue([]);
      const nextIdx = currentIndex + 1;
      replenishQueueIfNeeded(nextIdx);
      setCurrentIndex(nextIdx);
      problemStartTimeRef.current = performance.now();
    } else if (data.isBlockComplete) {
      setIsReviewPhase(false);
      KiboAudioManager.playBreakSFX();
      setMascotState('break');
      setShowBreakOverlay(true);

      storageService.clearActiveClimbState(profileId, 'math');
      setSavedClimbState(null);

      const blockTimeSec = Math.max(1, Math.round((performance.now() - blockStartTimeRef.current) / 1000));
      const finalBlockCorrect = blockCorrectCount;
      const finalBlockSparks = isPracticeMode ? (blockSparksEarned + 10) : blockSparksEarned;
      if (isPracticeMode && onAwardSparks) {
        onAwardSparks(10);
      }
      const isPerfectBlock = false;

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
        answers: data.nextBlockAnswers
      };

      const activeUserData = storageService.getUserData('math');
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
      });
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (onRecordDailyPractice) onRecordDailyPractice();

      const postBlockUserData = storageService.getUserData('math');
      const blockBadgeEval = evaluateBadges({
        ...postBlockUserData,
        inSessionStreak: data.evalResult.nextInSessionStreak,
        competenceRank: data.evalResult.nextCompetenceRank,
        blockRatingGain: data.nextBlockRatingGain,
        isNewSpeedRecord: false,
        hasSetPersonalRecord: false,
        subjectId: 'math'
      }, newSessionRecord);

      if (blockBadgeEval?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(blockBadgeEval.updatedUnlocked);
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

  const handleDigitInput = (val) => {
    if (incorrectReviewData) return;
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    soundFx.playKeyTap();

    if (isOperatorQuestion || ['+', '−', '×', '÷'].includes(normalizeOperator(val))) {
      const normOp = normalizeOperator(val);
      const targetOp = normalizeOperator(targetStr);
      if (isOperatorQuestion || ['+', '−', '×', '÷'].includes(targetOp)) {
        const matchedOpt = currentProblem?.options?.find((o) => normalizeOperator(o) === normOp) || normOp;
        processAnswerEvaluation(matchedOpt);
        return;
      }
    }

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
      if (targetStr.startsWith('0.')) {
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
    const normUserOp = normalizeOperator(newInput);
    const normTargetOp = normalizeOperator(targetStr);
    const isOperatorMatch = normUserOp === normTargetOp && ['+', '−', '×', '÷'].includes(normTargetOp);

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

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch || isFractionMatch || isDecimalImplicitMatch || isOperatorMatch;

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

  const totalBlockQuestions = isPracticeMode ? practiceSprintLength : 12;
  const currentQuestionNum = ((sessionQuestionIndex - 1) % totalBlockQuestions) + 1;

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
      } else if (
        isOperatorQuestion &&
        (
          e.key === '+' || e.key === '=' ||
          e.key === '-' || e.key === '_' || e.key === '−' ||
          e.key === '*' || e.key.toLowerCase() === 'x' || e.key === '×' ||
          e.key === '/' || e.key === '÷'
        )
      ) {
        e.preventDefault();
        const normOp = normalizeOperator(e.key);
        const matchedOpt = currentProblem?.options?.find((o) => normalizeOperator(o) === normOp) || normOp;
        processAnswerEvaluation(matchedOpt);
      } else if (/^[0-9]$/.test(e.key) || e.key === '.' || e.key === ':' || e.key === '/' || e.key === '-' || e.key === '+' || e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleDigitInput(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        processAnswerEvaluation('Yes');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        processAnswerEvaluation('No');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputVal, currentProblem, competenceRank, hasStartedClimb, isOperatorQuestion, incorrectReviewData]);

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
        totalCount={totalBlockQuestions}
        streak={inSessionStreak}
        sparksEarned={completedBlockStats.sparksEarned}
        blockRatingGain={completedBlockStats.blockRatingGain}
        shieldsUsed={completedBlockStats.shieldsUsed}
        competenceRating={competenceRank}
        equippedItems={equippedItems}
        blockTimeSec={completedBlockStats.blockTimeSec}
        isNewSpeedRecord={completedBlockStats.isNewSpeedRecord}
        isNewStreakRecord={completedBlockStats.isNewStreakRecord}
        profileId={profileId}
        activeSubject="math"
        onOpenWorkshop={() => {
          setShowBreakOverlay(false);
          if (isPracticeMode && onExitPractice) {
            onExitPractice();
            return;
          }
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId, 'math');
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
          if (isPracticeMode && onExitPractice) {
            onExitPractice();
            return;
          }
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId, 'math');
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
      {!isPaused && (
        <CelebrationOverlay
          celebrationEvent={celebrationEvent}
          onDismiss={() => setCelebrationEvent(null)}
          profileId={profileId}
        />
      )}

      {/* DUOLINGO-STYLE CLIMB FOCUS TOP BAR (Active during climb) */}
      {hasStartedClimb && (
        <ClimbHeader
          currentQuestionNum={currentQuestionNum}
          totalQuestions={totalBlockQuestions}
          isReviewPhase={isReviewPhase}
          isPracticeMode={isPracticeMode}
          practiceTitle={`Tier ${practiceConfig?.tier || userTier} Practice`}
          inSessionStreak={inSessionStreak}
          consumables={consumables}
          onExitOrPause={handleExitOrPauseClimb}
          onOpenFeedback={() => setShowQuestionFeedback(true)}
          onTriggerToastBanner={triggerToastBanner}
        />
      )}

      {/* MECHANICAL TRANSIENT FEEDBACK TOAST (SLIDES DOWN FROM TOP HUD) */}
      <ToastBanner
        feedbackBanner={feedbackBanner}
        hasStartedClimb={hasStartedClimb}
        onDismiss={() => {
          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
          setFeedbackBanner(null);
        }}
      />

      {/* MASCOT CONTAINER - Centered between sticky header and question card */}
      <CompanionsRow
        profileId={profileId}
        equippedItems={equippedItems}
        mascotMood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'}
        mascotState={mascotState}
      />

      {/* DEDICATED CHALLENGE BANNER (Probe / Gatekeeper / 2x Sparks / Practice) */}
      {hasStartedClimb && currentProblem && (
        <ChallengeBanner
          isProbe={Boolean(currentProblem.isProbe)}
          isGatekeeper={Boolean(isNearTierThreshold(competenceRank))}
          isDoubleSparks={Boolean(isDoubleSparksActive)}
          isPracticeMode={isPracticeMode}
        />
      )}

      {/* PROBLEM CARD CONTAINER */}
      <div className="w-full shrink-0 flex flex-col items-center justify-center my-1 space-y-2">
        {!hasStartedClimb ? (
          <ClimbPreCard
            isAutoPaused={isAutoPaused}
            savedClimbState={savedClimbState}
            consumables={consumables}
            isDoubleSparksActive={isDoubleSparksActive}
            onToggleDoubleSparksPotion={onToggleDoubleSparksPotion}
            onTriggerToastBanner={triggerToastBanner}
            onOpenWorkshop={onOpenWorkshop}
            onStartClimb={handleStartClimb}
            onResumeClimb={handleResumeClimb}
            onOpenPracticeMode={onOpenPracticeMode}
          />
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

                {/* TIER 2: ACTION DOCK / ASSISTS BAR (Clean, wrapped, no horizontal scroll) */}
                <div className="w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-0.5 max-w-full">
                  {incorrectReviewData ? (
                    <span className="text-[10px] sm:text-xs font-black uppercase text-rose-800 bg-rose-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-rose-300 shadow-2xs font-extrabold flex items-center gap-1 animate-pulse shrink-0">
                      ❌ Reviewing Solution
                    </span>
                  ) : (
                    <>
                      {/* NON-PUNITIVE PASS BUTTON */}
                      <button
                        type="button"
                        onClick={handlePassQuestion}
                        disabled={consecutiveSkips >= 2}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
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
                        {consecutiveSkips >= 2 ? '🔒 Attempt' : '🔄 Pass'}
                      </button>

                      {/* WISDOM HINT BUTTON */}
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
                              text: 'Kibo Wisdom Hint Unlocked! 📜'
                            }, 1200);
                          } else if (onOpenWorkshop) {
                            triggerToastBanner({
                              type: 'info',
                              text: 'Out of Hint Scrolls! Opening Shop... 📜'
                            }, 1400);
                            onOpenWorkshop();
                          }
                        }}
                        className={`text-[10px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          showFrustrationCard
                            ? 'bg-indigo-200 text-indigo-950 border-indigo-400'
                            : shouldPulseHint
                            ? 'bg-amber-300 text-amber-950 border-amber-500 animate-pulse ring-2 ring-amber-400 shadow-md scale-105'
                            : (consumables?.hintScrollCount ?? 0) > 0
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-dashed border-slate-300 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-400'
                        }`}
                        title={
                          (consumables?.hintScrollCount ?? 0) > 0
                            ? 'Use Wisdom Scroll to reveal a hint!'
                            : 'Out of Hint Scrolls • Tap to get in Shop!'
                        }
                      >
                        <ItemThumbnail itemId="hint_scroll" borderless className="w-4 h-4 shrink-0" />
                        <span>{showFrustrationCard ? 'Active' : (consumables?.hintScrollCount ?? 0) > 0 ? `Hint (${consumables.hintScrollCount})` : 'Hint +'}</span>
                      </button>

                      {/* CLIMBER SPYGLASS BUTTON (Only when owned or active) */}
                      {((consumables?.letterSpyglassCount ?? 0) > 0 || spyglassRevealedAnswer) && (
                        <button
                          type="button"
                          onClick={handleUseLetterSpyglass}
                          className="text-[10px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs"
                          title="Use Spyglass to reveal & fill 1 missing blank slot or answer!"
                        >
                          <ItemThumbnail itemId="letter_spyglass" borderless className="w-4 h-4 shrink-0" />
                          <span>Spyglass ({consumables?.letterSpyglassCount ?? 0})</span>
                        </button>
                      )}

                      {/* CLIMBER PRUNER BUTTON (Only when owned or active) */}
                      {((consumables?.letterPrunerCount ?? 0) > 0 || isLetterPrunerActive) && (
                        <button
                          type="button"
                          onClick={handleUseLetterPruner}
                          className={`text-[10px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                            isLetterPrunerActive
                              ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                          }`}
                          title={isLetterPrunerActive ? 'Distractors pruned for this problem!' : 'Prune distractor options / keys!'}
                        >
                          <ItemThumbnail itemId="letter_pruner" borderless className="w-4 h-4 shrink-0" />
                          <span>{isLetterPrunerActive ? 'Pruned' : `Prune (${consumables?.letterPrunerCount ?? 0})`}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

            {(() => {
              const rawDisplay = currentProblem.displayString || currentProblem.prompt || (
                currentProblem.num1 !== undefined && currentProblem.num2 !== undefined
                  ? `${currentProblem.num1} ${currentProblem.operatorSymbol || '+'} ${currentProblem.num2}`
                  : ''
              ) || 'Solve the problem';
              const hasUnderscoreBlank = rawDisplay.includes('_');
              const cleanDisplay = rawDisplay.replace(/\s*=\s*\?\s*¢?/gi, '').replace(/\s*=\s*\?\s*cents?/gi, '').trim();
              const hasQuestionSuffix = cleanDisplay.endsWith('?') || cleanDisplay.includes('Change?') || cleanDisplay.includes('Leftover?') || cleanDisplay.includes('End time?');
              const isLongText = cleanDisplay.length > 24;

              return (
                <div className="space-y-1.5 w-full">
                  <div className={`w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-1 ${
                    isLongText ? 'text-base sm:text-lg leading-tight font-bold' : 'text-3xl sm:text-4xl font-extrabold'
                  } text-slate-800`}>
                    {hasUnderscoreBlank ? (
                      (() => {
                        const parts = rawDisplay.split('_');
                        return (
                          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full">
                            {parts[0] && <span className="text-center leading-tight">{parts[0]}</span>}
                            <span className={`inline-block min-w-[60px] px-3 py-0.5 rounded-2xl font-black text-3xl sm:text-4xl shadow-inner shrink-0 ${
                              incorrectReviewData
                                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 ring-2 ring-emerald-300 animate-pop'
                                : 'bg-amber-50 border-2 border-amber-300 text-kibo-teal animate-pop'
                            }`}>
                              {incorrectReviewData ? incorrectReviewData.correctAnswer : (inputVal ? inputVal : <span className="text-slate-300 animate-pulse font-normal">?</span>)}
                            </span>
                            {parts[1] && <span className="text-center leading-tight">{parts[1]}</span>}
                          </div>
                        );
                      })()
                    ) : (
                      <>
                        <span className="max-w-full text-center leading-tight">{cleanDisplay}</span>
                        {!hasQuestionSuffix && <span className="text-slate-400 font-bold">=</span>}

                        {/* Answer Display */}
                        <span className={`inline-block min-w-[60px] px-3 py-0.5 rounded-2xl font-black text-3xl sm:text-4xl shadow-inner shrink-0 ${
                          incorrectReviewData
                            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 ring-2 ring-emerald-300 animate-pop'
                            : 'bg-amber-50 border-2 border-amber-300 text-kibo-teal'
                        }`}>
                          {incorrectReviewData ? incorrectReviewData.correctAnswer : (inputVal ? inputVal : <span className="text-slate-300 animate-pulse font-normal">?</span>)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* INCORRECT ANSWER REVIEW BANNER */}
                  {incorrectReviewData && (
                    <div className="w-full bg-rose-50 border-2 border-rose-200 rounded-2xl p-2 sm:p-2.5 text-center space-y-1 animate-pop">
                      <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
                        <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                          ✕ Your answer: <span className="line-through font-extrabold">{incorrectReviewData.userAnswer || '—'}</span>
                        </span>
                        <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold flex items-center gap-1">
                          ✓ Correct: {incorrectReviewData.correctAnswer}
                        </span>
                      </div>
                      {currentProblem.hint && (
                        <p className="text-xs text-indigo-900 font-medium italic pt-0.5">
                          💡 {currentProblem.hint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* INTEGRATED KIBO HINT */}
                  {!incorrectReviewData && showFrustrationCard && (
                    <div className="w-full pt-1.5 border-t border-indigo-100 text-xs sm:text-sm font-bold text-indigo-900 bg-indigo-50/90 p-2.5 rounded-2xl animate-pop text-center space-y-0.5 mt-1">
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

      {/* NUMERIC KEYPAD OR INCORRECT ANSWER REVIEW ACTION */}
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
            <Keypad
              onDigit={handleDigitInput}
              onDelete={handleDeleteDigit}
              onClear={handleClearInput}
              onSubmit={(val) => {
                const answerToSubmit = typeof val === 'string' && val.trim() ? val : inputVal;
                processAnswerEvaluation(answerToSubmit);
              }}
              problemType={currentProblem.type || (isMoneyQuestion ? 'money' : isTimeQuestion ? 'time' : '')}
              answerString={currentProblem.answerString || currentProblem.answer?.toString()}
              displayString={currentProblem.displayString}
              operatorSymbol={currentProblem.operatorSymbol}
              options={currentProblem.options}
              prunedKeys={prunedKeys}
            />
          )}
        </div>
      )}

      {/* QUESTION SPECIFIC FEEDBACK MODAL */}
      <FeedbackModal
        isOpen={showQuestionFeedback}
        onClose={() => setShowQuestionFeedback(false)}
        questionContext={{
          subject: 'math',
          prompt: currentProblem?.displayString || currentProblem?.prompt || (currentProblem?.num1 !== undefined ? `${currentProblem.num1} ${currentProblem.operatorSymbol || '+'} ${currentProblem.num2}` : ''),
          expectedAnswer: currentProblem?.answerString || currentProblem?.answer,
          userAnswer: incorrectReviewData?.userAttempt || inputVal,
          tier: currentProblem?.tier || userTier,
          questionNumber: currentQuestionNum,
          problemType: currentProblem?.type || 'math',
          rawProblem: currentProblem
        }}
      />

      {/* TRAINING CAMP EXIT CONFIRMATION MODAL */}
      {showPracticeExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border-4 border-amber-200 text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
              🏕️
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Leave Practice?</h3>
              <p className="text-sm font-medium text-slate-600 mt-1.5 leading-relaxed">
                Your current practice progress will be reset.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPracticeExitConfirm(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md hover:from-emerald-600 hover:to-teal-700 active:scale-98 transition-all cursor-pointer"
              >
                Keep Practicing
              </button>
              <button
                type="button"
                onClick={handleConfirmExitPractice}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Exit Camp
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
