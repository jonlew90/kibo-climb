import React, { useState, useEffect, useRef, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame, Terminal, Code2, HelpCircle, Shield, Compass } from 'lucide-react';
import Mascot from './Mascot';
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
  onConsumeExplorerCompass,
  onConsumeShield,
  onResetDoubleSparks
}) {
  const [competenceRank, setCompetenceRank] = useState(() => {
    const data = storageService.getUserData('coding');
    return Number(data?.adaptiveCompetenceRating) || Number(data?.competenceRank) || 1000;
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

  const [isShaking, setIsShaking] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [sessionSparksEarned, setSessionSparksEarned] = useState(0);

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
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [revealedHint, setRevealedHint] = useState(null);
  const [isClueActive, setIsClueActive] = useState(false);

  // Timing
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [sessionAnswers, setSessionAnswers] = useState([]);

  // Break overlay
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
      sessionAnswers
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
    setMistakeCount(0);
    setSessionAnswers([]);
    const freshBatch = generateProblems(15, activeTier);
    setProblemQueue(freshBatch);
    setCurrentProblemIndex(0);
    setEliminatedOptions([]);
    setRevealedHint(null);
    setIsClueActive(false);
    setProblemStartTime(Date.now());
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    const saved = storageService.getActiveClimbState(profileId, 'coding');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0) {
      setProblemQueue(saved.problemQueue);
      setCurrentProblemIndex(saved.currentProblemIndex || 0);
      setSessionQuestionIndex(saved.sessionQuestionIndex || (saved.currentProblemIndex ? saved.currentProblemIndex + 1 : 1));
      setQuestionsAnswered(saved.questionsAnswered || 0);
      setCorrectCount(saved.correctCount || 0);
      setBlockCorrectCount(saved.blockCorrectCount || 0);
      setBlockSparksEarned(saved.blockSparksEarned || 0);
      setSessionSparksEarned(saved.sessionSparksEarned || 0);
      setBlockRatingGain(saved.blockRatingGain || 0);
      setMistakeCount(saved.mistakeCount || 0);
      if (saved.competenceRank) setCompetenceRank(saved.competenceRank);
      if (Array.isArray(saved.sessionAnswers)) setSessionAnswers(saved.sessionAnswers);
    }
    setEliminatedOptions([]);
    setRevealedHint(null);
    setIsClueActive(false);
    setProblemStartTime(Date.now());
    setHasStartedClimb(true);
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
    sessionAnswers
  ]);

  // Handle modal pausing logic
  useEffect(() => {
    if (isPaused && hasStartedClimb) {
      saveCurrentClimbProgress();
      setHasStartedClimb(false);
      setIsAutoPaused(true);
    }
  }, [isPaused, hasStartedClimb]);

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
    sessionAnswers
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

    // Feedback banner
    setFeedbackBanner({
      isCorrect,
      message: isCorrect
        ? `+${earnedSparks} ⚡ ${evalResult.streakBannerText || 'Great logic!'}`
        : `Keep going! ${currentProblem.hint || 'Review the logic steps.'}`
    });

    setTimeout(() => setFeedbackBanner(null), 2500);

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

  // Use Compass / Letter Pruner Power-up (Eliminate 2 wrong answers)
  const handleUsePruner = () => {
    if (!currentProblem || !currentProblem.options || currentProblem.options.length <= 2) return;
    if (eliminatedOptions.length > 0) return;

    if (onConsumeExplorerCompass) {
      onConsumeExplorerCompass();
    }

    const wrongOptions = currentProblem.options.filter(
      opt => String(opt).trim().toLowerCase() !== String(currentProblem.answer).trim().toLowerCase()
    );
    const toEliminate = shuffleArray(wrongOptions).slice(0, 2);
    setEliminatedOptions(toEliminate);
    soundFx.playSparkCollect();
  };

  // Use Wisdom Clue / Hint Scroll
  const handleUseHint = () => {
    if (!currentProblem) return;
    if (onConsumeHintScroll) {
      onConsumeHintScroll();
    }
    setRevealedHint(currentProblem.hint || 'Carefully step through each line of code.');
    setIsClueActive(true);
    soundFx.playPowerUp();
  };

  // Continue climb after break
  const handleContinueClimb = () => {
    setShowBreakOverlay(false);
    setBlockCorrectCount(0);
    setBlockSparksEarned(0);
    setBlockRatingGain(0);
    setBlockShieldsUsed(0);

    // Generate fresh problems if we finished the queue
    if (currentProblemIndex >= problemQueue.length - 1) {
      const freshProblems = generateProblems(15, activeTier);
      setProblemQueue(freshProblems);
      setCurrentProblemIndex(0);
    } else {
      setCurrentProblemIndex(prev => prev + 1);
    }

    setEliminatedOptions([]);
    setRevealedHint(null);
    setIsClueActive(false);
    setProblemStartTime(Date.now());
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 relative overflow-visible animate-pop flex flex-col">
      <div className="w-full h-full flex flex-col items-center justify-between sm:justify-end pb-1 sm:pb-2 pt-1 px-1.5 sm:px-3 max-w-4xl mx-auto relative overflow-visible flex-1 min-h-0">
        {showConfetti && <ConfettiCanvas />}

        {/* FEEDBACK TOAST */}
        <div
          onClick={() => setFeedbackBanner(null)}
          className={`absolute inset-x-4 z-50 transition-all duration-300 ${
            feedbackBanner ? 'top-0 opacity-100 scale-100 pointer-events-auto cursor-pointer' : '-top-12 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div
            className={`py-2.5 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md border flex items-center justify-between gap-2 ${
              feedbackBanner?.isCorrect
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40'
                : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
            }`}
          >
            <span className="flex-1 text-center leading-snug">{feedbackBanner?.message}</span>
            <span className="text-xs font-black opacity-80 hover:opacity-100 bg-black/20 px-2 py-0.5 rounded-full shrink-0">✕</span>
          </div>
        </div>

        {/* MASCOT CONTAINER - Centered between sticky header and question card */}
        <div
          className="flex-1 flex flex-row items-center justify-center w-full min-h-0 my-auto py-1 sm:py-2 z-10 overflow-visible px-2 sm:px-4"
        >
          {/* Left Friend */}
          {displayedFriends[0] ? (
            <div
              className="relative z-0 flex items-center justify-end sm:justify-center overflow-visible flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] h-3/4 max-h-[22vh] sm:max-h-[28vh] md:max-h-[32vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              onClick={() => handleFriendClick(0)}
              title={`Tap ${displayedFriends[0].username}!`}
            >
              {friend1Tooltip && (
                <div className="absolute -top-8 left-0 sm:left-1/2 sm:-translate-x-1/2 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce pointer-events-none">
                  Hi, I'm {displayedFriends[0].username}!
                </div>
              )}
              <Mascot
                mood="happy"
                state={friend1State}
                equipped={displayedFriends[0].equipped || []}
                className="h-full w-auto max-h-[22vh] max-w-full sm:max-h-[28vh] md:max-h-[32vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90 scale-x-[-1]"
              />
              <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 bg-white/90 text-slate-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm border border-slate-200 z-10 truncate max-w-full pointer-events-none">
                {displayedFriends[0].username}
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] shrink-0" />
          )}

          {/* Main Mascot */}
          <div
            className="relative z-10 flex items-center justify-center overflow-visible p-1 sm:p-2 w-1/2 max-w-[50%] sm:max-w-[240px] md:max-w-[300px] h-full max-h-[32vh] sm:max-h-[44vh] md:max-h-[48vh] shrink-0"
            title="Tap Kibo!"
          >
            <Mascot
              mood={feedbackBanner && !feedbackBanner.isCorrect ? 'sad' : 'happy'}
              state={mascotState}
              equipped={equippedItems}
              className="h-full w-auto max-h-[32vh] max-w-full sm:max-h-[44vh] md:max-h-[48vh] aspect-square filter drop-shadow-xl object-contain shrink-0"
            />
          </div>

          {/* Right Friend */}
          {displayedFriends[1] ? (
            <div
              className="relative z-0 flex items-center justify-start sm:justify-center overflow-visible flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] h-3/4 max-h-[22vh] sm:max-h-[28vh] md:max-h-[32vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              onClick={() => handleFriendClick(1)}
              title={`Tap ${displayedFriends[1].username}!`}
            >
              {friend2Tooltip && (
                <div className="absolute -top-8 right-0 sm:left-1/2 sm:-translate-x-1/2 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce pointer-events-none">
                  Hi, I'm {displayedFriends[1].username}!
                </div>
              )}
              <Mascot
                mood="happy"
                state={friend2State}
                equipped={displayedFriends[1].equipped || []}
                className="h-full w-auto max-h-[22vh] max-w-full sm:max-h-[28vh] md:max-h-[32vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90"
              />
              <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 bg-white/90 text-slate-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm border border-slate-200 z-10 truncate max-w-full pointer-events-none">
                {displayedFriends[1].username}
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] shrink-0" />
          )}
        </div>

        {/* PROBLEM CARD CONTAINER */}
        <div className="w-full shrink-0 flex flex-col items-center justify-center my-1 space-y-2">
          {!hasStartedClimb ? (
            /* PRE-CLIMB START SCREEN HERO CARD */
            <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-4 sm:p-5 text-center shadow-xl space-y-3 relative overflow-hidden animate-pop flex flex-col justify-center max-h-[42vh]">
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block shadow-2xs">
                  {isAutoPaused
                    ? '⏸️ Climb Auto-Paused'
                    : savedClimbState && savedClimbState.sessionQuestionIndex <= 12
                    ? `🏔️ Mountain Climb • Question ${savedClimbState.sessionQuestionIndex || 1} of 12`
                    : '🏔️ Mountain Climb • 12 Problems'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {isAutoPaused
                    ? 'Are you still climbing?'
                    : savedClimbState && savedClimbState.sessionQuestionIndex <= 12 ? 'Climb in Progress!' : 'Ready for the Climb?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  {isAutoPaused
                    ? 'We paused your climb and timer so your speed record and streak stay safe! Click Resume to keep going.'
                    : savedClimbState && savedClimbState.sessionQuestionIndex <= 12
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
            /* ACTIVE CODING QUESTION CARD */
            currentProblem && (
              <div className={`w-full max-w-md shrink-0 flex flex-col justify-between bg-white border-3 sm:border-4 rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-center transition-all duration-300 space-y-2 relative shadow-lg ${streakConfig.cardGlow} ${isShaking ? 'animate-shake border-rose-400 bg-rose-50/50' : 'border-purple-200'}`}>
                {/* Problem Header Badge */}
                <div className="w-full flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{currentProblem.concept || 'Algorithmic Logic'}</span>
                  </div>
                  <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    🎯 Q #{sessionQuestionIndex}/12
                  </span>
                </div>

                {/* Question Display Text */}
                <div className="text-xs sm:text-sm font-extrabold text-slate-800 text-center mb-1 whitespace-pre-line leading-snug">
                  {currentProblem.displayString}
                </div>

                {/* Code Snippet Box */}
                {currentProblem.codeSnippet && (
                  <div className="w-full mb-2 bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-2.5 sm:p-3 text-left shadow-inner font-mono text-xs text-purple-200 overflow-x-auto max-h-[18vh]">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1.5 text-[9px] font-sans uppercase font-bold tracking-wider">
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
                  <div className="w-full mb-2 p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-start gap-2 animate-fade-in">
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
                        className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl border-2 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm text-left flex items-center justify-between group focus:outline-none ${
                          isEliminated
                            ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                            : 'bg-gradient-to-b from-white to-slate-50 hover:to-purple-50 border-purple-200 hover:border-purple-400 text-slate-800 active:scale-98'
                        }`}
                      >
                        <span className="truncate">{String(option)}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition-colors">
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

        {/* BREAK OVERLAY */}
        {showBreakOverlay && (
          <KiboBreakOverlay
            isOpen={showBreakOverlay}
            onContinue={handleContinueClimb}
            onOpenWorkshop={() => {
              setShowBreakOverlay(false);
              setHasStartedClimb(false);
              storageService.clearActiveClimbState(profileId, 'coding');
              setSavedClimbState(null);
              if (onOpenWorkshop) onOpenWorkshop();
            }}
            onResumeClimb={handleContinueClimb}
            subjectId="coding"
            correctCount={completedBlockStats.correctCount}
            totalCount={12}
            sparksEarned={completedBlockStats.sparksEarned}
            ratingGain={completedBlockStats.blockRatingGain}
            currentRating={competenceRank}
          />
        )}
      </div>
    </div>
  );
}
