import React, { useState, useEffect, useRef, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame, Terminal, Code2, HelpCircle, Shield, Compass, Flag, X } from 'lucide-react';
import Mascot from './Mascot';
import FeedbackModal from './FeedbackModal';
import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import { generateCodingSession as generateProblems, generateCodingProblem as generateTierProblem, getNormalizedProblemKey, shuffleArray } from '../utils/codingGenerator';
import { getTierForRating as getTierFromRating, isNearTierThreshold, CODING_CURRICULUM_TIERS } from '../utils/codingCurriculum';
import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents, shouldTriggerProbeQuestion } from '../utils/AdaptiveEngine';
import { getProbeTargetTier } from '../utils/SkillTreeConfig';
import KiboBreakOverlay from './KiboBreakOverlay';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateBadges } from '../utils/badgeManager';
import { storageService } from '../services/storageService';
import useInactivityAutoPause from '../hooks/useInactivityAutoPause';
import { getStreakTierConfig } from '../utils/streakTierConfig';
import ClimbHeader from './climb/ClimbHeader';
import ClimbPreCard from './climb/ClimbPreCard';
import CompanionsRow from './climb/CompanionsRow';
import ToastBanner from './climb/ToastBanner';
import ItemThumbnail from './ItemThumbnail';


export default function CodingSessionView({
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
  onConsumeLetterPruner,
  onConsumeShield,
  onResetDoubleSparks,
  onClimbActiveChange
}) {
  const [competenceRank, setCompetenceRank] = useState(() => {
    const data = storageService.getUserData('coding');
    return Number(data?.adaptiveCompetenceRating) || Number(data?.competenceRank) || 1000;
  });
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(1);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
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

  const [isShaking, setIsShaking] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);

  // Character Animation State
  const [mascotState, setMascotState] = useState('idle');

  // Friends on Main
  const displayedFriends = storageService.getFriends(profileId).filter(f => f.isDisplayedOnMain).slice(0, 2);
  const [friend1State, setFriend1State] = useState('idle');
  const [friend2State, setFriend2State] = useState('idle');
  const [friend1Tooltip, setFriend1Tooltip] = useState(false);
  const [friend2Tooltip, setFriend2Tooltip] = useState(false);

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

  const isCodingProblem = (p) => {
    if (!p) return false;
    if (p.subject && p.subject !== 'coding') return false;
    return true;
  };

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  // Break overlay
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (onClimbActiveChange) {
      onClimbActiveChange(Boolean(hasStartedClimb && !showBreakOverlay));
    }
  }, [hasStartedClimb, showBreakOverlay, onClimbActiveChange]);

  const [savedClimbState, setSavedClimbState] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isCodingProblem) || (saved.subject && saved.subject !== 'coding'))) {
      storageService.clearActiveClimbState(profileId, 'coding');
      return null;
    }
    return saved;
  });

  // Sync saved climb state when active profile changes
  useEffect(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    if (saved && saved.problemQueue && (!saved.problemQueue.every(isCodingProblem) || (saved.subject && saved.subject !== 'coding'))) {
      storageService.clearActiveClimbState(profileId, 'coding');
      setSavedClimbState(null);
    } else {
      setSavedClimbState(saved);
    }
  }, [profileId]);

  const activeTier = getTierFromRating(competenceRank);
  const streakConfig = getStreakTierConfig(streak);

  // Session & Question Queues
  const [problemQueue, setProblemQueue] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isCodingProblem)) {
      return saved.problemQueue;
    }
    if (saved) {
      storageService.clearActiveClimbState(profileId, 'coding');
    }
    return generateProblems(15, activeTier);
  });
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    return saved?.eliminatedOptions || [];
  });
  const [revealedHint, setRevealedHint] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    return saved?.revealedHint || null;
  });
  const [isClueActive, setIsClueActive] = useState(() => {
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    return Boolean(saved?.isClueActive);
  });

  // Reset per-question power-up state on question transition (only when index changes during active climb)
  const prevIndexRef = useRef(currentProblemIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentProblemIndex) {
      setEliminatedOptions([]);
      setRevealedHint(null);
      setIsClueActive(false);
      prevIndexRef.current = currentProblemIndex;
    }
  }, [currentProblemIndex]);

  // Timing
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [sessionAnswers, setSessionAnswers] = useState([]);

  const saveCurrentClimbProgress = () => {
    const climbState = {
      subject: 'coding',
      problemQueue,
      currentProblemIndex,
      sessionQuestionIndex,
      questionsAnswered,
      correctCount,
      blockCorrectCount,
      blockSparksEarned,
      sessionSparksEarned,
      blockRatingGain,
      mistakeCount,
      competenceRank,
      sessionAnswers,
      eliminatedOptions,
      isLetterPrunerActive: Boolean(eliminatedOptions && eliminatedOptions.length > 0),
      revealedHint,
      isClueActive,
      isDoubleSparksActive
    };
    storageService.saveActiveClimbState(climbState, profileId, 'coding');
    setSavedClimbState(climbState);
  };

  const handleStartClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    storageService.clearActiveClimbState(profileId, 'coding');
    setSavedClimbState(null);
    setQuestionsAnswered(0);
    setSessionQuestionIndex(1);
    setCorrectCount(0);
    setBlockCorrectCount(0);
    setBlockSparksEarned(0);
    setSessionSparksEarned(0);
    setBlockRatingGain(0);
    setBlockShieldsUsed(0);
    setMistakeCount(0);
    setCurrentProblemIndex(0);
    setEliminatedOptions([]);
    setRevealedHint(null);
    setIsClueActive(false);

    const freshBatch = generateProblems(15, activeTier);
    setProblemQueue(freshBatch);
    setProblemStartTime(Date.now());
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    if (saved) {
      setProblemQueue(saved.problemQueue);
      setCurrentProblemIndex(saved.currentProblemIndex || 0);
      setSessionQuestionIndex(saved.sessionQuestionIndex || 1);
      setQuestionsAnswered(saved.questionsAnswered || 0);
      setCorrectCount(saved.correctCount || 0);
      setBlockCorrectCount(saved.blockCorrectCount || 0);
      setBlockSparksEarned(saved.blockSparksEarned || 0);
      setSessionSparksEarned(saved.sessionSparksEarned || 0);
      setBlockRatingGain(saved.blockRatingGain || 0);
      setMistakeCount(saved.mistakeCount || 0);
      setCompetenceRank(saved.competenceRank || 1000);
      setSessionAnswers(saved.sessionAnswers || []);
      setEliminatedOptions(saved.eliminatedOptions || []);
      setRevealedHint(saved.revealedHint || null);
      setIsClueActive(Boolean(saved.isClueActive));
    } else {
      setEliminatedOptions([]);
      setRevealedHint(null);
      setIsClueActive(false);
    }
    setProblemStartTime(Date.now());
    setHasStartedClimb(true);
  };

  const handleExitOrPauseClimb = () => {
    soundFx.playKeyTap();
    saveCurrentClimbProgress();
    setHasStartedClimb(false);
  };

  // Window unload / unmount saving & auto-pause
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
    currentProblemIndex,
    sessionQuestionIndex,
    questionsAnswered,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    mistakeCount,
    competenceRank,
    sessionAnswers,
    eliminatedOptions,
    revealedHint,
    isClueActive,
    isDoubleSparksActive
  ]);

  // Handle modal pausing logic
  useEffect(() => {
    if (isPaused && hasStartedClimb) {
      saveCurrentClimbProgress();
      setHasStartedClimb(false);
      setIsAutoPaused(true);
    }
  }, [isPaused, hasStartedClimb]);

  useEffect(() => {
    if (hasStartedClimb && !isPaused && !isAutoPaused) {
      KiboAudioManager.startBGM();
    } else {
      KiboAudioManager.stopBGM();
    }
    return () => {
      KiboAudioManager.stopBGM();
    };
  }, [hasStartedClimb, isPaused, isAutoPaused]);

  // Handle Tab Visibility & Navigating Away pausing/resume logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || !document.hasFocus()) {
        if (hasStartedClimb) {
          saveCurrentClimbProgress();
          setHasStartedClimb(false);
          setIsAutoPaused(true);
        }
      } else {
        const saved = storageService.getActiveClimbState(profileId, 'coding');
        setSavedClimbState(saved);
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
    currentProblemIndex,
    sessionQuestionIndex,
    questionsAnswered,
    correctCount,
    blockCorrectCount,
    blockSparksEarned,
    sessionSparksEarned,
    blockRatingGain,
    mistakeCount,
    competenceRank,
    sessionAnswers,
    eliminatedOptions,
    revealedHint,
    isClueActive
  ]);

  // Current active problem
  const currentProblem = problemQueue[currentProblemIndex] || null;

  // Answer submission handler
  const handleAnswerOption = (selectedOption) => {
    if (!hasStartedClimb || !currentProblem || showBreakOverlay) return;

    // Drop active DOM focus so no button stays highlighted on the next problem
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    const latencyMs = Date.now() - problemStartTime;
    const isCorrect = String(selectedOption).trim().toLowerCase() === String(currentProblem.answer).trim().toLowerCase();

    // Sound FX & Mascot State
    if (isCorrect) {
      soundFx.playCorrect();
      setMascotState('happy');
    } else {
      soundFx.playIncorrect();
      setMascotState('sad');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    setTimeout(() => setMascotState('idle'), 1500);

    // Adaptive attempt evaluation
    const evalResult = evaluateAdaptiveAttempt({
      isCorrect,
      latencyMs,
      currentCompetenceRank: competenceRank,
      inSessionStreak: streak,
      inSessionIncorrectStreak: mistakeCount,
      totalProblemsSolved,
      isProbeQuestion: !!currentProblem.isProbeQuestion,
      problemTier: currentProblem.tier || activeTier,
      problemSubjectId: 'coding'
    });

    const nextRating = evalResult.nextCompetenceRank;
    const earnedSparks = isDoubleSparksActive ? evalResult.totalSparksEarned * 2 : evalResult.totalSparksEarned;

    // Update state
    setCompetenceRank(nextRating);
    setQuestionsAnswered(prev => prev + 1);
    setSessionQuestionIndex(prev => prev + 1);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setBlockCorrectCount(prev => prev + 1);
      setMistakeCount(0);
    } else {
      setMistakeCount(prev => prev + 1);
    }

    setBlockSparksEarned(prev => prev + earnedSparks);
    setSessionSparksEarned(prev => prev + earnedSparks);
    setBlockRatingGain(prev => prev + evalResult.rankDelta);

    // Callbacks to parent App
    if (earnedSparks > 0 && onAwardSparks) {
      onAwardSparks(earnedSparks);
    }
    if (onIncrementLifetimeProblems) {
      onIncrementLifetimeProblems(isCorrect);
    }
    if (onUpdateCompetenceRating) {
      onUpdateCompetenceRating(nextRating);
    }



    // Record answer in session history
    const record = {
      problemId: currentProblem.id,
      concept: currentProblem.concept,
      isCorrect,
      latencyMs,
      tier: currentProblem.tier,
      selected: selectedOption,
      answer: currentProblem.answer
    };

    const nextAnswers = [...sessionAnswers, record];
    setSessionAnswers(nextAnswers);

    // Save climb state
    const nextIndex = currentProblemIndex + 1;
    const nextSessionQNum = sessionQuestionIndex + 1;
    if (nextSessionQNum > 12 || nextIndex >= problemQueue.length) {
      storageService.clearActiveClimbState(profileId, 'coding');
      setSavedClimbState(null);
      analyticsService.logLevelUp('coding', blockCorrectCount + (isCorrect ? 1 : 0));
      // Trigger Break Overlay
      setCompletedBlockStats({
        correctCount: blockCorrectCount + (isCorrect ? 1 : 0),
        sparksEarned: blockSparksEarned + earnedSparks,
        blockRatingGain: blockRatingGain + evalResult.rankDelta,
        shieldsUsed: blockShieldsUsed
      });
      setShowBreakOverlay(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setCurrentProblemIndex(nextIndex);
      setEliminatedOptions([]);
      setRevealedHint(null);
      setIsClueActive(false);
      setProblemStartTime(Date.now());

      const climbState = {
        problemQueue,
        currentProblemIndex: nextIndex,
        sessionQuestionIndex: nextSessionQNum,
        questionsAnswered: questionsAnswered + 1,
        correctCount: isCorrect ? correctCount + 1 : correctCount,
        blockCorrectCount: isCorrect ? blockCorrectCount + 1 : blockCorrectCount,
        blockSparksEarned: blockSparksEarned + earnedSparks,
        sessionSparksEarned: sessionSparksEarned + earnedSparks,
        blockRatingGain: blockRatingGain + evalResult.rankDelta,
        mistakeCount: isCorrect ? 0 : mistakeCount + 1,
        competenceRank: nextRating,
        sessionAnswers: nextAnswers
      };
      storageService.saveActiveClimbState(climbState, profileId, 'coding');
      setSavedClimbState(climbState);
    }
  };

  // Keyboard shortcut listener (A, B, C, D / 1, 2, 3, 4 / True, False)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showBreakOverlay) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContinueClimb();
        }
        return;
      }

      if (!currentProblem) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const options = currentProblem.options || ['true', 'false'];

      let selectedIndex = -1;
      if (key === 'a' || key === '1') selectedIndex = 0;
      else if (key === 'b' || key === '2') selectedIndex = 1;
      else if (key === 'c' || key === '3') selectedIndex = 2;
      else if (key === 'd' || key === '4') selectedIndex = 3;
      else if (key === 't') {
        selectedIndex = options.findIndex(o => String(o).trim().toLowerCase() === 'true');
      } else if (key === 'f') {
        selectedIndex = options.findIndex(o => String(o).trim().toLowerCase() === 'false');
      }

      if (selectedIndex >= 0 && selectedIndex < options.length) {
        const chosen = options[selectedIndex];
        if (!eliminatedOptions.includes(chosen)) {
          e.preventDefault();
          handleAnswerOption(chosen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProblem, showBreakOverlay, eliminatedOptions, currentProblemIndex, problemStartTime, streak, mistakeCount, competenceRank, isDoubleSparksActive, blockCorrectCount, blockSparksEarned, blockRatingGain, blockShieldsUsed, sessionAnswers]);

  // Pass / Skip question
  const handlePassQuestion = () => {
    if (consecutiveSkips >= 2) return;
    soundFx.playKeyTap();
    const nextSkips = consecutiveSkips + 1;
    setConsecutiveSkips(nextSkips);

    const timeElapsedSec = problemStartTime > 0 ? (Date.now() - problemStartTime) / 1000 : 1.0;

    storageService.logSkipEvent({
      problemId: currentProblem?.id || `coding_${currentProblemIndex}`,
      concept: currentProblem?.concept || 'Logic',
      timeElapsedSec: Number(timeElapsedSec.toFixed(1)),
      consecutiveSkipCount: nextSkips
    }, 'coding');

    setFeedbackBanner({
      type: 'success',
      text: 'Trying another problem 🔄'
    });

    setQuestionsAnswered(prev => prev + 1);
    setSessionQuestionIndex(prev => prev + 1);
    setEliminatedOptions([]);
    setRevealedHint(null);
    setCurrentProblemIndex(prev => prev + 1);
    setProblemStartTime(Date.now());
  };

  // Use 50:50 Distractor Pruner Power-up (Eliminate 2 wrong answers)
  const handleUsePruner = () => {
    if (!currentProblem || !currentProblem.options || currentProblem.options.length <= 2) return;
    if (eliminatedOptions.length > 0) return;

    const owned = consumables?.letterPrunerCount ?? 0;
    if (owned <= 0) {
      setFeedbackBanner({
        type: 'info',
        text: 'Out of 50:50 Pruners! Opening Shop... 🧪'
      });
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (onConsumeLetterPruner) {
      onConsumeLetterPruner();
    }

    const wrongOptions = currentProblem.options.filter(
      opt => String(opt).trim().toLowerCase() !== String(currentProblem.answer).trim().toLowerCase()
    );
    const toEliminate = shuffleArray(wrongOptions).slice(0, 2);
    setEliminatedOptions(toEliminate);
    soundFx.playSparkCollect();
    setFeedbackBanner({
      type: 'success',
      text: '50:50 Distractors pruned! ✂️'
    });
  };

  // Use Wisdom Hint Scroll
  const handleUseHint = () => {
    if (!currentProblem) return;
    if (revealedHint) return;

    const owned = consumables?.hintScrollCount ?? 0;
    if (owned <= 0) {
      setFeedbackBanner({
        type: 'info',
        text: 'Out of Hint Scrolls! Opening Shop... 📜'
      });
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (onConsumeHintScroll) {
      onConsumeHintScroll();
    }
    setRevealedHint(currentProblem.hint || 'Carefully step through each line of code.');
    setIsClueActive(true);
    soundFx.playPowerUp();
    setFeedbackBanner({
      type: 'success',
      text: 'Logic Trace Hint Revealed! 📜'
    });
  };

  // Continue climb after break
  const handleContinueClimb = () => {
    setShowBreakOverlay(false);
    if (onResetDoubleSparks) onResetDoubleSparks();
    storageService.clearActiveClimbState(profileId, 'coding');
    setSavedClimbState(null);
    setQuestionsAnswered(0);
    setSessionQuestionIndex(1);
    setCorrectCount(0);
    setBlockCorrectCount(0);
    setBlockSparksEarned(0);
    setSessionSparksEarned(0);
    setBlockRatingGain(0);
    setMistakeCount(0);
    setBlockShieldsUsed(0);
    setSessionAnswers([]);
    const freshProblems = generateProblems(15, activeTier);
    setProblemQueue(freshProblems);
    setCurrentProblemIndex(0);
    setEliminatedOptions([]);
    setRevealedHint(null);
    setIsClueActive(false);
    setProblemStartTime(Date.now());
  };

  if (showBreakOverlay) {
    return (
      <KiboBreakOverlay
        correctCount={completedBlockStats.correctCount}
        totalCount={12}
        streak={streak}
        sparksEarned={completedBlockStats.sparksEarned}
        blockRatingGain={completedBlockStats.blockRatingGain}
        shieldsUsed={completedBlockStats.shieldsUsed}
        competenceRating={competenceRank}
        equippedItems={equippedItems}
        blockTimeSec={completedBlockStats.blockTimeSec}
        isNewSpeedRecord={completedBlockStats.isNewSpeedRecord}
        isNewStreakRecord={completedBlockStats.isNewStreakRecord}
        profileId={profileId}
        activeSubject="coding"
        onOpenWorkshop={() => {
          setShowBreakOverlay(false);
          if (onResetDoubleSparks) onResetDoubleSparks();
          storageService.clearActiveClimbState(profileId, 'coding');
          setSavedClimbState(null);
          setQuestionsAnswered(0);
          setSessionQuestionIndex(1);
          setCorrectCount(0);
          setBlockCorrectCount(0);
          setBlockSparksEarned(0);
          setSessionSparksEarned(0);
          setBlockRatingGain(0);
          setMistakeCount(0);
          setBlockShieldsUsed(0);
          setSessionAnswers([]);
          setHasStartedClimb(false);
          const freshProblems = generateProblems(15, activeTier);
          setProblemQueue(freshProblems);
          setCurrentProblemIndex(0);
          if (onOpenWorkshop) onOpenWorkshop();
        }}
        onResumeClimb={handleContinueClimb}
      />
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 relative overflow-visible animate-pop flex flex-col">
      <div className="w-full h-full flex flex-col items-center justify-between sm:justify-end pb-1 sm:pb-2 pt-1 px-1.5 sm:px-3 max-w-4xl mx-auto relative overflow-visible flex-1 min-h-0">
        {showConfetti && <ConfettiCanvas />}

        {/* FEEDBACK TOAST */}
        <ToastBanner
          feedbackBanner={feedbackBanner}
          hasStartedClimb={hasStartedClimb}
          onDismiss={() => setFeedbackBanner(null)}
        />

        {/* DUOLINGO-STYLE CLIMB FOCUS TOP BAR (Active during climb) */}
        {hasStartedClimb && (
          <ClimbHeader
            currentQuestionNum={sessionQuestionIndex}
            inSessionStreak={streak}
            consumables={consumables}
            onExitOrPause={handleExitOrPauseClimb}
            onOpenFeedback={() => setShowQuestionFeedback(true)}
          />
        )}

        {/* MASCOT CONTAINER - Centered between sticky header and question card */}
        <CompanionsRow
          profileId={profileId}
          equippedItems={equippedItems}
          mascotMood={feedbackBanner && !feedbackBanner.isCorrect ? 'sad' : 'happy'}
          mascotState={mascotState}
        />

        {/* PROBLEM CARD CONTAINER */}
        <div className="w-full shrink-0 flex flex-col items-center justify-center my-1 space-y-2">
          {!hasStartedClimb ? (
            <ClimbPreCard
              isAutoPaused={isAutoPaused}
              savedClimbState={savedClimbState}
              consumables={consumables}
              isDoubleSparksActive={isDoubleSparksActive}
              onToggleDoubleSparksPotion={onToggleDoubleSparksPotion}
              onTriggerToastBanner={setFeedbackBanner}
              onStartClimb={handleStartClimb}
              onResumeClimb={handleResumeClimb}
            />
          ) : (
            /* ACTIVE CODING QUESTION CARD */
            currentProblem && (
              <div className={`w-full max-w-md shrink-0 flex flex-col justify-between bg-white border-3 sm:border-4 rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-center transition-all duration-300 space-y-2 relative shadow-lg ${streakConfig.cardGlow} ${isShaking ? 'animate-shake border-rose-400 bg-rose-50/50' : 'border-purple-200'}`}>

                {/* Concept Tag */}
                <div className="w-full flex items-center justify-center px-1 py-0.5 text-xs">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    <Terminal className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span>{currentProblem.concept || 'Logic Drill'}</span>
                  </div>
                </div>

                {/* ACTION DOCK (Pass, Hint, plus 50:50 if owned or active) */}
                <div className="w-full flex items-center justify-center gap-1.5 py-0.5 max-w-full overflow-x-auto no-scrollbar">
                  {/* NON-PUNITIVE PASS BUTTON */}
                  <button
                    type="button"
                    onClick={handlePassQuestion}
                    disabled={consecutiveSkips >= 2}
                    className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
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
                    {consecutiveSkips >= 2 ? '🔒 Pass' : '🔄 Pass'}
                  </button>

                  {/* MANUAL WISDOM HINT BUTTON */}
                  <button
                    type="button"
                    onClick={handleUseHint}
                    className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                      revealedHint
                        ? 'bg-indigo-200 text-indigo-950 border-indigo-400'
                        : (consumables?.hintScrollCount ?? 0) > 0
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200 shadow-2xs'
                        : 'bg-slate-100 text-slate-500 border-dashed border-slate-300 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-400'
                    }`}
                    title={
                      (consumables?.hintScrollCount ?? 0) > 0
                        ? 'Use Wisdom Scroll to reveal a logic clue!'
                        : 'Out of Hint Scrolls • Tap to get in Shop!'
                    }
                  >
                    <ItemThumbnail itemId="hint_scroll" borderless className="w-4 h-4 shrink-0" />
                    <span>{revealedHint ? 'Active' : (consumables?.hintScrollCount ?? 0) > 0 ? `Hint (${consumables.hintScrollCount})` : 'Hint'}</span>
                  </button>

                  {/* 50:50 DISTRACTOR PRUNER BUTTON (Shown when active or count > 0) */}
                  {(eliminatedOptions.length > 0 || (consumables?.letterPrunerCount ?? 0) > 0) && (
                    <button
                      type="button"
                      onClick={handleUsePruner}
                      className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                        eliminatedOptions.length > 0
                          ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                      }`}
                      title="Prune 2 wrong choices (50:50)!"
                    >
                      <ItemThumbnail itemId="letter_pruner" borderless className="w-4 h-4 shrink-0" />
                      <span>{eliminatedOptions.length > 0 ? 'Active' : `50:50 (${consumables?.letterPrunerCount ?? 0})`}</span>
                    </button>
                  )}
                </div>

                {/* Question Display Text */}
                <div className="text-sm sm:text-base font-extrabold text-slate-800 text-center mb-1 whitespace-pre-line leading-snug">
                  {currentProblem.displayString}
                </div>

                {/* Code Snippet Box */}
                {currentProblem.codeSnippet && (
                  <div className="w-full mb-2 bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-2.5 sm:p-3 text-left shadow-inner font-mono text-xs sm:text-sm text-purple-200 overflow-x-auto max-h-[18vh]">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1.5 text-[10px] sm:text-xs font-sans uppercase font-bold tracking-wider">
                      <span className="flex items-center gap-1"><Code2 className="w-3 h-3 text-purple-400" /> logic_drill.py</span>
                      <span className="text-emerald-400">● Live Trace</span>
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      <code>{currentProblem.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Revealed Wisdom Hint */}
                {revealedHint && (
                  <div className="w-full mb-2 p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-amber-900 flex items-start gap-2 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{revealedHint}</span>
                  </div>
                )}

                {/* Multiple Choice Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {(currentProblem.options || ['true', 'false']).map((option, idx) => {
                    const isEliminated = eliminatedOptions.includes(option);
                    const label = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                    return (
                      <button
                        key={`${currentProblem.id}_opt_${idx}`}
                        type="button"
                        disabled={isEliminated}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          handleAnswerOption(option);
                        }}
                        className={`py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl border-2 text-sm sm:text-base font-black transition-all cursor-pointer shadow-sm text-left flex items-center justify-between group focus:outline-none ${
                          isEliminated
                            ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                            : 'bg-gradient-to-b from-white to-slate-50 hover:to-purple-50 border-purple-200 hover:border-purple-400 text-slate-800 active:scale-98'
                        }`}
                      >
                        <span className="truncate">{String(option)}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition-colors">
                            {label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* QUESTION SPECIFIC FEEDBACK MODAL */}
        <FeedbackModal
          isOpen={showQuestionFeedback}
          onClose={() => setShowQuestionFeedback(false)}
          questionContext={{
            subject: 'coding',
            prompt: currentProblem ? `${currentProblem.displayString || ''}${currentProblem.codeSnippet ? `\n\nCode:\n${currentProblem.codeSnippet}` : ''}` : '',
            expectedAnswer: currentProblem?.answer,
            userAnswer: '',
            tier: currentProblem?.tier || userTier,
            questionNumber: sessionQuestionIndex,
            problemType: currentProblem?.type || 'coding',
            rawProblem: currentProblem
          }}
        />
      </div>
    </div>
  );
}
