import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Zap, CheckCircle2, XCircle, Sparkles, Award, Play, RotateCcw, Flame } from 'lucide-react';
import Mascot from './Mascot';
import WorldMapViewer from './WorldMapViewer';
import WorldMediaViewer from './WorldMediaViewer';
import { getRegionalMap } from '../data/worldMaps';
import { getFlagForCountry } from '../data/worldFlags';
import { getLandmarkVisual } from '../data/worldLandmarks';

import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import { generateWorldSession as generateProblems, generateWorldProblem as generateTierProblem, getNormalizedProblemKey, shuffleArray } from '../utils/worldGenerator';
import { getTierForRating as getTierFromRating, isNearTierThreshold } from '../utils/worldCurriculum';
import { selectSpyglassSlot } from '../utils/wordsCurriculum';

import { soundFx } from '../utils/audio';
import { classifyLatency } from '../utils/latencyEngine';
import { normalizeTimeAnswer, normalizeDecimal, parseFractionValue } from '../utils/formatters';
import { evaluateAdaptiveAttempt, checkSkillMasteryEvents, shouldTriggerProbeQuestion } from '../utils/AdaptiveEngine';
import { getProbeTargetTier } from '../utils/SkillTreeConfig';
import KiboBreakOverlay from './KiboBreakOverlay';
import { KiboAudioManager } from '../utils/KiboAudioManager';
import { evaluateBadges } from '../utils/badgeManager';
import { storageService } from '../services/storageService';
import useInactivityAutoPause from '../hooks/useInactivityAutoPause';
import {
  CONTINENTS,
  OCEANS,
  CARDINAL_DIRECTIONS,
  US_STATES,
  COUNTRIES,
  WORLD_LANDMARKS_AND_WONDERS
} from '../data/worldGeography';

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
  onConsumeExplorerCompass,
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

  const isWorldProblem = (p) => {
    if (!p) return false;
    if (p.subject && p.subject !== 'world') return false;
    if (p.type === 'words' || (p.num1 !== undefined && p.num2 !== undefined && p.type !== 'applied')) return false;
    return true;
  };

  const [hasStartedClimb, setHasStartedClimb] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
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
      const seen = new Set();
      saved.problemQueue.forEach(p => {
        const normKey = getNormalizedProblemKey(p);
        const ansKey = (p.correctAnswer || p.answerString || p.answer || '').toString().toLowerCase();
        if (normKey) seen.add(normKey);
        if (ansKey) seen.add(ansKey);
      });
      blockSeenKeysRef.current = seen;
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

  // Kibo World Specialized Power-Up States
  const [isLetterPrunerActive, setIsLetterPrunerActive] = useState(false);
  const [prunedOptions, setPrunedOptions] = useState(new Set());
  const [showHintCard, setShowHintCard] = useState(false);
  const [isCompassActive, setIsCompassActive] = useState(false);

  // Reset per-question power-up state on question transition
  useEffect(() => {
    setIsLetterPrunerActive(false);
    setPrunedOptions(new Set());
    setShowHintCard(false);
    setIsCompassActive(false);
    setShouldPulseHint(false);
  }, [currentIndex]);

  const compassClue = useMemo(() => {
    if (!isCompassActive || !currentProblem) return null;
    const ans = String(currentProblem.correctAnswer || currentProblem.answer || '').trim();
    
    // Check if cardinal direction
    const matchedDir = CARDINAL_DIRECTIONS.find(d => d.direction.toLowerCase() === ans.toLowerCase());
    if (matchedDir) {
      return `🧭 Compass orientation: Points toward the ${matchedDir.mapPosition} of a standard orientation map.`;
    }

    // Check if country (either answer is country name or capital)
    const matchedCountry = COUNTRIES.find(c => c.name.toLowerCase() === ans.toLowerCase() || c.capital.toLowerCase() === ans.toLowerCase());
    if (matchedCountry) {
      return `🧭 Located on the continent of ${matchedCountry.continent}.`;
    }

    // Check if US state (either answer is state name or capital)
    const matchedState = US_STATES.find(s => s.name.toLowerCase() === ans.toLowerCase() || s.capital.toLowerCase() === ans.toLowerCase());
    if (matchedState) {
      return `🧭 Located in the ${matchedState.region} region of the United States.`;
    }

    // Check if continent
    const matchedContinent = CONTINENTS.find(c => c.name.toLowerCase() === ans.toLowerCase());
    if (matchedContinent) {
      return `🧭 Hemisphere orientation: ${matchedContinent.hemispheres.join(' & ')} Hemisphere${matchedContinent.hemispheres.length > 1 ? 's' : ''}.`;
    }

    // Check if ocean
    const matchedOcean = OCEANS.find(o => o.name.toLowerCase() === ans.toLowerCase() || o.fullName.toLowerCase() === ans.toLowerCase());
    if (matchedOcean) {
      return `🧭 Global Waterway: Bordered by ${matchedOcean.notableFeature.split(',').pop()?.trim() || 'major world continents'}.`;
    }

    // Check if landmark
    const matchedWonder = WORLD_LANDMARKS_AND_WONDERS.find(w => w.name.toLowerCase() === ans.toLowerCase());
    if (matchedWonder) {
      return `🧭 Geographic Location: Situated in ${matchedWonder.continent || 'the world'}.`;
    }

    // Fallback: concept or continent/regional context
    if (currentProblem.concept) {
      return `🧭 Geographic Domain: ${currentProblem.concept}.`;
    }

    return '🧭 Geographic Compass active!';
  }, [isCompassActive, currentProblem]);

  const handleUseHintScroll = () => {
    setShouldPulseHint(false);
    if (showHintCard || showFrustrationCard) return;
    const owned = consumables?.hintScrollCount ?? 0;
    if (owned > 0 && onConsumeHintScroll) {
      if (onConsumeHintScroll()) {
        setShowHintCard(true);
        soundFx.playSparkCollect();
        triggerToastBanner({
          type: 'success',
          text: 'Kibo Explorer Hint Unlocked! 💡'
        }, 1400);
      }
    } else if (onOpenWorkshop) {
      onOpenWorkshop();
    }
  };

  const handleUseExplorerCompass = () => {
    if (isCompassActive) return;
    const owned = consumables?.explorerCompassCount ?? 0;
    if (owned <= 0) {
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (onConsumeExplorerCompass && onConsumeExplorerCompass()) {
      setIsCompassActive(true);
      soundFx.playSparkCollect();
      triggerToastBanner({
        type: 'success',
        text: "🧭 Explorer's Compass Activated!"
      }, 1500);
    }
  };

  const handleUseLetterPruner = () => {
    if (isLetterPrunerActive) return;
    const owned = consumables?.letterPrunerCount ?? 0;
    if (owned <= 0) {
      if (onOpenWorkshop) onOpenWorkshop();
      return;
    }

    if (!currentProblem.options || currentProblem.options.length <= 2) {
      triggerToastBanner({
        type: 'info',
        text: 'Only 2 options remaining!'
      }, 1500);
      return;
    }

    const normCorrect = String(currentProblem.correctAnswer || currentProblem.answer || '').trim().toLowerCase();
    const distractors = currentProblem.options.filter(
      opt => String(opt).trim().toLowerCase() !== normCorrect
    );

    if (distractors.length === 0) return;

    // Prune up to 2 distractors (50:50)
    const shuffledDistractors = shuffleArray(distractors);
    const toPrune = shuffledDistractors.slice(0, Math.min(2, distractors.length));

    if (onConsumeLetterPruner && onConsumeLetterPruner()) {
      setIsLetterPrunerActive(true);
      setPrunedOptions(new Set(toPrune.map(opt => String(opt))));
      soundFx.playSparkCollect();
      triggerToastBanner({
        type: 'success',
        text: '50:50 Distractors Pruned! ✂️'
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
    setIsAutoPaused(false);
    blockStartTimeRef.current = performance.now();
    problemStartTimeRef.current = performance.now();
    storageService.clearActiveClimbState(profileId, 'world');
    setSavedClimbState(null);
    setBlockAnswers([]);
    setHasStartedClimb(true);
  };

  const handleResumeClimb = () => {
    soundFx.playKeyTap();
    setIsAutoPaused(false);
    const saved = storageService.getActiveClimbState(profileId, 'world');
    if (saved && saved.problemQueue && saved.problemQueue.length > 0 && saved.problemQueue.every(isWorldProblem)) {
      setProblemQueue(saved.problemQueue);
      const seen = new Set();
      saved.problemQueue.forEach(p => {
        const normKey = getNormalizedProblemKey(p);
        const ansKey = (p.correctAnswer || p.answerString || p.answer || '').toString().toLowerCase();
        if (normKey) seen.add(normKey);
        if (ansKey) seen.add(ansKey);
      });
      blockSeenKeysRef.current = seen;
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

  // Inactivity auto-pause mid-climb
  useInactivityAutoPause({
    isActive: hasStartedClimb && !isPaused && !showBreakOverlay,
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
      if (document.hidden || !document.hasFocus()) {
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
        const probeKey = getNormalizedProblemKey(probeData);
        if (probeWord) {
          blockSeenKeysRef.current.add(probeWord);
        }
        if (probeKey) {
          blockSeenKeysRef.current.add(probeKey);
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

      const nextBlockRatingGain = blockRatingGain + evalResult.rankDelta;
      setBlockRatingGain(nextBlockRatingGain);

      const activeWord = (normTargetAns || '').toString().toLowerCase();
      const existingRecent = storageService.getUserData('world').recentWords || [];
      const updatedRecent = activeWord ? [activeWord, ...existingRecent.filter(w => w !== activeWord)].slice(0, 60) : existingRecent;

      const isCapitalQuestion = ['state_capital', 'country_capital', 'capital_state', 'capital_country', 'tricky_capital'].includes(currentProblem.type) ||
        currentProblem.concept?.includes('Capitals');
      const prevCapitalSolved = Number(storageService.getUserData('world').capitalQuestionsSolved) || 0;
      const nextCapitalSolved = isCapitalQuestion ? prevCapitalSolved + 1 : prevCapitalSolved;

      storageService.saveUserData({
        adaptiveCompetenceRating: evalResult.nextCompetenceRank,
        competenceRank: evalResult.nextCompetenceRank,
        recentWords: updatedRecent,
        ...(isCapitalQuestion ? { capitalQuestionsSolved: nextCapitalSolved } : {})
      }, 'world');

      const activeUserData = storageService.getUserData('world');
      const badgeEvalRes = evaluateBadges({
        ...activeUserData,
        subjectId: 'world',
        inSessionStreak: evalResult.nextInSessionStreak,
        competenceRank: evalResult.nextCompetenceRank,
        blockRatingGain: nextBlockRatingGain,
        lastProblemType: currentProblem.type,
        lastProblemTier: currentProblem.tier || getTierFromRating(evalResult.nextCompetenceRank),
        capitalQuestionsSolved: nextCapitalSolved
      });

      if (badgeEvalRes?.updatedUnlocked && onUnlockedBadgesChange) {
        onUnlockedBadgesChange(badgeEvalRes.updatedUnlocked);
      }

      // --- CELEBRATION REWARDS (ONLY FOR NEW BADGE UNLOCKS TO PREVENT POPUP FATIGUE) ---
      if (badgeEvalRes?.newlyUnlocked && badgeEvalRes.newlyUnlocked.length > 0) {
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
      if (onIncrementLifetimeProblems) onIncrementLifetimeProblems(true);
      setInputVal('');

      // Trigger Kibo Break Overlay every 12 problems solved & record personal bests
      if (nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0) {
        KiboAudioManager.playBreakSFX();
        setMascotState('break');
        setShowBreakOverlay(true);

        storageService.clearActiveClimbState(profileId, 'world');
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

      const existingMastery = activeUserData.recentSkillMastery || [];
      const updatedMastery = checkSkillMasteryEvents(competenceRank, evalResult.nextCompetenceRank, existingMastery);
      if (updatedMastery.length !== existingMastery.length) {
        storageService.saveUserData({ recentSkillMastery: updatedMastery }, 'world');
      }

      const isBlockComplete = (questionsAnswered + 1) % 12 === 0;

      // Allow the user to see and review the correct answer before moving on
      setIncorrectReviewData({
        problem: currentProblem,
        userAnswer: userAnsString,
        correctAnswer: normTargetAns || currentProblem.correctAnswer || currentProblem.answer || '',
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

      storageService.clearActiveClimbState(profileId, 'world');
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

      const activeUserData = storageService.getUserData('world');
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
      }, 'world');
      if (onUpdatePersonalRecords) onUpdatePersonalRecords(updatedRecords);
      if (onRecordDailyPractice) onRecordDailyPractice();

      const postBlockUserData = storageService.getUserData('world');
      const blockBadgeEval = evaluateBadges({
        ...postBlockUserData,
        inSessionStreak: data.evalResult.nextInSessionStreak,
        competenceRank: data.evalResult.nextCompetenceRank,
        blockRatingGain: data.nextBlockRatingGain,
        isNewSpeedRecord: false,
        hasSetPersonalRecord: false,
        subjectId: 'world'
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

      if (e.key === 'Enter') {
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
        blockTimeSec={completedBlockStats.blockTimeSec}
        isNewSpeedRecord={completedBlockStats.isNewSpeedRecord}
        isNewStreakRecord={completedBlockStats.isNewStreakRecord}
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
            mood={feedbackBanner?.type === 'error' ? 'sad' : 'happy'}
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
                  : savedClimbState && savedClimbState.sessionQuestionIndex <= 12
                  ? 'Climb in Progress!'
                  : 'Ready for the Climb?'}
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

                  {incorrectReviewData ? (
                    <span className="text-xs font-black uppercase text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-300 shadow-2xs font-extrabold flex items-center gap-1">
                      ❌ Reviewing Solution
                    </span>
                  ) : (
                    <>
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

                      {/* MANUAL WISDOM HINT SCROLL BUTTON */}
                      <button
                        type="button"
                        onClick={handleUseHintScroll}
                        className={`text-xs font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          showHintCard || showFrustrationCard
                            ? 'bg-indigo-200 text-indigo-950 border-indigo-400'
                            : shouldPulseHint
                            ? 'bg-amber-300 text-amber-950 border-amber-500 animate-pulse ring-4 ring-amber-400/80 shadow-md scale-105'
                            : (consumables?.hintScrollCount ?? 0) > 0
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={
                          (consumables?.hintScrollCount ?? 0) > 0
                            ? 'Use Wisdom Scroll to reveal a geography clue!'
                            : "Get Hint Scrolls in Kibo's Corner"
                        }
                      >
                        💡 {showHintCard || showFrustrationCard ? 'Hint Active' : (consumables?.hintScrollCount ?? 0) > 0 ? `Hint (${consumables.hintScrollCount})` : 'Hint'}
                      </button>

                      {/* EXPLORER'S COMPASS BUTTON (Kibo World Bespoke Item) */}
                      <button
                        type="button"
                        onClick={handleUseExplorerCompass}
                        className={`text-xs font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          isCompassActive
                            ? 'bg-amber-200 text-amber-950 border-amber-400'
                            : (consumables?.explorerCompassCount ?? 0) > 0
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={
                          isCompassActive
                            ? 'Compass orientation clue active!'
                            : (consumables?.explorerCompassCount ?? 0) > 0
                            ? "Use Explorer's Compass to reveal regional orientation!"
                            : "Get Explorer's Compasses in Kibo's Corner"
                        }
                      >
                        🧭 {isCompassActive ? 'Compass Active' : (consumables?.explorerCompassCount ?? 0) > 0 ? `Compass (${consumables.explorerCompassCount})` : 'Compass'}
                      </button>

                      {/* 50:50 DISTRACTOR PRUNER BUTTON */}
                      <button
                        type="button"
                        onClick={handleUseLetterPruner}
                        className={`text-xs font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0 transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                          isLetterPrunerActive
                            ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                            : (consumables?.letterPrunerCount ?? 0) > 0
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={
                          isLetterPrunerActive
                            ? '50:50 Distractors pruned for this problem!'
                            : (consumables?.letterPrunerCount ?? 0) > 0
                            ? 'Prune 2 wrong choices (50:50)!'
                            : "Get Pruners in Kibo's Corner"
                        }
                      >
                        ✂️ {isLetterPrunerActive ? '50:50 Active' : (consumables?.letterPrunerCount ?? 0) > 0 ? `50:50 (${consumables.letterPrunerCount})` : '50:50'}
                      </button>
                    </>
                  )}

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

                  {/* ZERO-LOAD GEOGRAPHIC / FLAG / LANDMARK VISUALIZER */}
                  {(() => {
                    const isMapType = currentProblem.type === 'country_shape' || currentProblem.type === 'us_state_shape';
                    const isFlagType = currentProblem.type === 'country_flag';
                    const isLandmarkType = currentProblem.type === 'landmark_visual' || currentProblem.type === 'world_wonder' || currentProblem.type === 'country_landmark';

                    const resolvedMapData = isMapType ? (getRegionalMap(currentProblem.correctAnswer) || currentProblem.mapData) : currentProblem.mapData;
                    const resolvedShapeSvg = resolvedMapData?.targetPath || currentProblem.shapeSvg;
                    const resolvedFlagData = currentProblem.flagData || (isFlagType ? getFlagForCountry(currentProblem.correctAnswer) : null);
                    const resolvedLandmarkData = currentProblem.landmarkData || (isLandmarkType ? getLandmarkVisual(currentProblem.correctAnswer || currentProblem.landmark) : null);

                    if (!resolvedMapData && !resolvedShapeSvg && !resolvedFlagData && !resolvedLandmarkData) return null;

                    return (
                      <div className="w-full flex items-center justify-center my-0.5 sm:my-1 h-28 sm:h-32 md:h-36 max-w-[280px] sm:max-w-[340px] mx-auto">
                        <WorldMediaViewer
                          mapData={resolvedMapData}
                          shapeSvg={resolvedShapeSvg}
                          flagData={resolvedFlagData}
                          landmarkData={resolvedLandmarkData}
                          className="h-full w-full"
                        />
                      </div>
                    );
                  })()}

                  {/* ACTIVE HINT BANNER */}
                  {(showHintCard || showFrustrationCard) && currentProblem.hint && !incorrectReviewData && (
                    <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-2 sm:p-2.5 text-center space-y-1 animate-pop my-1">
                      <p className="text-xs sm:text-sm text-indigo-950 font-bold flex items-center justify-center gap-1.5">
                        <span>💡</span>
                        <span>{currentProblem.hint}</span>
                      </p>
                    </div>
                  )}

                  {/* EXPLORER COMPASS CLUE BANNER */}
                  {isCompassActive && compassClue && !incorrectReviewData && (
                    <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-2 sm:p-2.5 text-center space-y-0.5 animate-pop my-1">
                      <p className="text-xs sm:text-sm text-amber-950 font-black flex items-center justify-center gap-1.5">
                        <span>{compassClue}</span>
                      </p>
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

                          const isUserChoice = incorrectReviewData && (optStr.toLowerCase() === String(incorrectReviewData.userAnswer || '').toLowerCase());
                          const isCorrectAnswer = incorrectReviewData && (optStr.toLowerCase() === String(incorrectReviewData.correctAnswer || '').toLowerCase());
                          const isPruned = prunedOptions.has(optStr);

                          let buttonStyle = 'btn-3d-teal';
                          if (incorrectReviewData) {
                            if (isCorrectAnswer) {
                              buttonStyle = 'bg-emerald-500 hover:bg-emerald-500 border-b-4 border-emerald-700 text-white ring-4 ring-emerald-300/80 scale-[1.02] shadow-md animate-pulse';
                            } else if (isUserChoice) {
                              buttonStyle = 'bg-rose-500 border-b-4 border-rose-700 text-white opacity-90 shadow-sm';
                            } else {
                              buttonStyle = 'opacity-30 grayscale cursor-default';
                            }
                          } else if (isPruned) {
                            buttonStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-30 grayscale cursor-not-allowed line-through';
                          } else if (inputVal !== '' && inputVal !== opt) {
                            buttonStyle += ' opacity-40 grayscale';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (inputVal === '' && !incorrectReviewData && !isPruned) {
                                  setInputVal(opt);
                                  processAnswerEvaluation(opt);
                                }
                              }}
                              className={`${buttonStyle} w-full pt-1 pb-2 sm:pt-1.5 sm:pb-2.5 px-1.5 sm:px-2.5 rounded-xl sm:rounded-2xl transition-all active:scale-95 flex items-center justify-center min-h-[46px] sm:min-h-[50px] shadow-sm select-none cursor-pointer`}
                              disabled={inputVal !== '' || !!incorrectReviewData || isPruned}
                            >
                              <span className={`w-full max-w-full text-center font-bold break-words [overflow-wrap:anywhere] hyphens-auto px-0.5 ${fontClass} ${isUserChoice && !isCorrectAnswer ? 'line-through' : ''}`}>
                                {isCorrectAnswer ? `✓ ${opt}` : isUserChoice ? `✕ ${opt}` : opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* INCORRECT ANSWER REVIEW BANNER */}
                  {incorrectReviewData && (
                    <div className="w-full bg-rose-50 border-2 border-rose-200 rounded-2xl p-2 sm:p-2.5 text-center space-y-1 animate-pop mt-1">
                      <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
                        <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 text-xs">
                          ✕ Your answer: <span className="line-through font-extrabold">{incorrectReviewData.userAnswer || '—'}</span>
                        </span>
                        <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold text-xs flex items-center gap-1">
                          ✓ Correct: {incorrectReviewData.correctAnswer}
                        </span>
                      </div>
                      {currentProblem.hint && (
                        <p className="text-xs text-indigo-900 font-medium italic pt-0.5">
                          {currentProblem.type === 'tricky_capital' ? '⚠️ Common misconception: ' : '💡 '}{currentProblem.hint}
                        </p>
                      )}
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

      {/* NEXT QUESTION / FINISH CLIMB CTA BUTTON */}
      {hasStartedClimb && incorrectReviewData && (
        <div className="w-full max-w-md shrink-0 animate-pop mt-1 sm:mt-2 space-y-1.5">
          <button
            type="button"
            autoFocus
            onClick={handleContinueAfterIncorrect}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-lg sm:text-xl py-3 px-6 rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer select-none"
          >
            <span>{incorrectReviewData.isBlockComplete ? 'Finish Climb 🏔️' : 'Next Question ➔'}</span>
          </button>
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            Press Enter or Space ↵
          </p>
        </div>
      )}

      </div>
    </div>
  );
}
