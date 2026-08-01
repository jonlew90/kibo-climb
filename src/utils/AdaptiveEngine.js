import { getKFactor, getProbeTargetTier } from './SkillTreeConfig.js';

/**
 * Determines whether a probe question should be served.
 * - Triggered during Provisional Phase (totalProblemsSolved < 15) when consecutive correct answers >= 3.
 */
export function shouldTriggerProbeQuestion({ totalProblemsSolved = 0, inSessionStreak = 0 }) {
  return totalProblemsSolved < 15 && inSessionStreak >= 3;
}

/**
 * Evaluates an adaptive math question attempt.
 * - Dynamic K-Factor volatility scaling:
 *   - Provisional (<15 problems solved): K = 60
 *   - Calibration (15–49 problems solved): K = 32
 *   - Established (>=50 problems solved): K = 16
 * - Probe Question Triggers:
 *   - Correct Probe: Teleports user directly (+120 points) into higher topic's rating band.
 *   - Incorrect Probe: Applies minimal penalty (-10 points) without harsh regression.
 * 
 * @param {Object} params
 * @returns {Object} Evaluation results
 */
export function evaluateAdaptiveAttempt({
  isCorrect,
  latencyMs = 0,
  currentCompetenceRank = 1000,
  inSessionStreak = 0,
  inSessionIncorrectStreak = 0,
  totalProblemsSolved = 0,
  isProbeQuestion = false
}) {
  const responseTimeSec = latencyMs / 1000;

  // 1. Dynamic K-Factor & Phase Determination
  const kFactor = getKFactor(totalProblemsSolved);
  const phase = totalProblemsSolved < 15 ? 'Provisional' : totalProblemsSolved < 50 ? 'Calibration' : 'Established';

  // 2. Check for rapid button mashing outlier (< 0.8 seconds)
  const isOutlierGuess = responseTimeSec < 0.8;

  // 3. Secondary Response Time Fluency Score Metadata
  const isFluent = isCorrect && responseTimeSec < 3.0;
  const fluencyLabel = isFluent ? 'High Fluency (<3s)' : responseTimeSec < 6.0 ? 'Steady Recall' : 'Deliberate Solve';

  // 4. In-Session Correct & Incorrect Streak calculations
  const nextInSessionStreak = isCorrect ? inSessionStreak + 1 : 0;
  const nextInSessionIncorrectStreak = isCorrect ? 0 : inSessionIncorrectStreak + 1;

  // 5. In-Session Bonus Multipliers & Rewards
  let baseSparks = isCorrect ? 2 : 0;
  let bonusSparks = 0;
  let multiplier = 1.0;
  let streakBannerText = null;

  if (isCorrect) {
    if (nextInSessionStreak >= 5) {
      multiplier = 1.5;
    }
    if (isProbeQuestion) {
      bonusSparks = 10;
      streakBannerText = '🚀 Probe Mastered! Skill Jump Unlocked (+120 Competence!)';
    } else if (nextInSessionStreak === 3) {
      bonusSparks = 5;
      streakBannerText = '🔥 On Fire! 3 In-a-Row (+5 Bonus Sparks!)';
    } else if (nextInSessionStreak === 5) {
      bonusSparks = 5;
      streakBannerText = '⚡ 5 Streak! 1.5x Sparks Multiplier Activated!';
    } else if (nextInSessionStreak === 10) {
      bonusSparks = 10;
      streakBannerText = '🏆 Precision Streak! 10 Correct in a Row!';
    }
  }

  const totalSparksEarned = Math.round(baseSparks * multiplier) + bonusSparks;

  // 6. Competence Rank delta (Driven 100% strictly by correctness + dynamic K-Factor)
  let rankDelta = 0;

  if (isOutlierGuess && !isCorrect) {
    // Ignore rapid accidental button mash from regression
    rankDelta = 0;
  } else if (isProbeQuestion) {
    if (isCorrect) {
      // Immediate rating teleport (+120 points) into higher skill strand
      rankDelta = 120;
    } else {
      // Minimal rating penalty for probe challenge miss
      rankDelta = -10;
    }
  } else if (isCorrect) {
    // Standard gain scaled by K-Factor (e.g. +30 for Provisional K=60, +16 for Calibration K=32, +8 for Established K=16)
    rankDelta = Math.round(kFactor * 0.5);
  } else {
    // Standard loss scaled by K-Factor (e.g. -21 for Provisional, -11 for Calibration, -5 for Established)
    rankDelta = Math.round(-kFactor * 0.35);
  }

  const nextCompetenceRank = Math.max(50, currentCompetenceRank + rankDelta);

  return {
    isCorrect,
    isFluent,
    isOutlierGuess,
    isProbeQuestion,
    isProbeSuccess: isProbeQuestion && isCorrect,
    phase,
    kFactor,
    fluencyLabel,
    responseTimeSec,
    rankDelta,
    nextCompetenceRank,
    nextInSessionStreak,
    nextInSessionIncorrectStreak,
    totalSparksEarned,
    multiplier,
    streakBannerText,
    triggerFrustrationCircuit: nextInSessionIncorrectStreak >= 3
  };
}

/**
 * Evaluates session-wrap bonus rewards and personal records upon Break Overlay or Session End.
 * - Perfect Run Bonus: 100% accuracy awards +15 Sparks & increments mostPerfectSessions.
 * - Speed Run Bonus: average speed < 5s per question awards +10 Sparks.
 * - Cumulative Streak Milestones: 25, 50, 100 streaks award +25, +50, +100 Sparks.
 */
export function evaluateAdaptiveSessionEnd({
  questionsAnswered = 0,
  correctCount = 0,
  totalSessionTimeMs = 0,
  cumulativeCorrectStreak = 0,
  personalRecords = {}
}) {
  const sessionAccuracy = questionsAnswered > 0 ? (correctCount / questionsAnswered) * 100 : 0;
  const sessionAverageTimeSec = questionsAnswered > 0 ? (totalSessionTimeMs / 1000) / questionsAnswered : 0;

  let bonusSparks = 0;
  let isPerfectRun = false;
  let isSpeedRun = false;
  let milestonesUnlocked = [];

  const records = {
    fastest12QuestionsTime: personalRecords?.fastest12QuestionsTime ?? personalRecords?.fastest10QuestionsTime ?? null,
    highestCorrectStreak: Math.max(personalRecords?.highestCorrectStreak || 0, cumulativeCorrectStreak),
    mostPerfectSessions: personalRecords?.mostPerfectSessions || 0
  };

  // 1. Perfect Run Bonus (100% accuracy for 5+ questions)
  if (questionsAnswered >= 5 && sessionAccuracy === 100) {
    isPerfectRun = true;
    bonusSparks += 15;
    records.mostPerfectSessions += 1;
  }

  // 2. Speed Run Bonus (< 5.0s average response time for 5+ questions)
  if (questionsAnswered >= 5 && sessionAverageTimeSec > 0 && sessionAverageTimeSec < 5.0) {
    isSpeedRun = true;
    bonusSparks += 10;
    const sessionTimeSec = Math.round(totalSessionTimeMs / 1000);
    if (!records.fastest12QuestionsTime || sessionTimeSec < records.fastest12QuestionsTime) {
      records.fastest12QuestionsTime = sessionTimeSec;
    }
  }

  // 3. Cumulative Cross-Session Streak Milestones
  if (cumulativeCorrectStreak >= 100) {
    bonusSparks += 100;
    milestonesUnlocked.push('100-Answer Legend (+100 ⚡)');
  } else if (cumulativeCorrectStreak >= 50) {
    bonusSparks += 50;
    milestonesUnlocked.push('50-Answer Master (+50 ⚡)');
  } else if (cumulativeCorrectStreak >= 25) {
    bonusSparks += 25;
    milestonesUnlocked.push('25-Answer Streak (+25 ⚡)');
  }

  return {
    sessionAccuracy,
    sessionAverageTimeSec,
    bonusSparks,
    isPerfectRun,
    isSpeedRun,
    milestonesUnlocked,
    updatedPersonalRecords: records
  };
}
