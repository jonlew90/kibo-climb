// Adaptive Engine for Kibo Math: pure correctness-driven difficulty scaling + secondary fluency tracking

/**
 * Evaluates an adaptive math question attempt.
 * - Competence Rank progression/regression (+/- Elo) is driven 100% strictly by correctness.
 * - Response time is evaluated purely as a secondary "Fluency Score" metadata metric.
 * - Button mashing outliers (<0.8s) are ignored from streak/rank gains.
 * 
 * @param {Object} params
 * @param {boolean} params.isCorrect - Whether the user's answer was correct
 * @param {number} params.latencyMs - Response time in milliseconds
 * @param {number} params.currentCompetenceRank - Current Elo/Competence rating
 * @returns {Object} Evaluation results
 */
export function evaluateAdaptiveAttempt({
  isCorrect,
  latencyMs = 0,
  currentCompetenceRank = 1000,
  inSessionStreak = 0,
  inSessionIncorrectStreak = 0
}) {
  const responseTimeSec = latencyMs / 1000;

  // 1. Check for rapid button mashing outlier (< 0.8 seconds)
  const isOutlierGuess = responseTimeSec < 0.8;

  // 2. Secondary Response Time Fluency Score Metadata
  const isFluent = isCorrect && responseTimeSec < 3.0;
  const fluencyLabel = isFluent ? 'High Fluency (<3s)' : responseTimeSec < 6.0 ? 'Steady Recall' : 'Deliberate Solve';

  // 3. In-Session Correct & Incorrect Streak calculations
  const nextInSessionStreak = isCorrect ? inSessionStreak + 1 : 0;
  const nextInSessionIncorrectStreak = isCorrect ? 0 : inSessionIncorrectStreak + 1;

  // 4. In-Session Bonus Multipliers & Rewards
  let baseSparks = isCorrect ? 2 : 0;
  let bonusSparks = 0;
  let multiplier = 1.0;
  let streakBannerText = null;

  if (isCorrect) {
    if (nextInSessionStreak >= 5) {
      multiplier = 1.5;
    }
    if (nextInSessionStreak === 3) {
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

  // 5. Competence Rank delta (100% driven by correctness, not response time)
  let rankDelta = 0;

  if (isOutlierGuess && !isCorrect) {
    // Ignore rapid accidental button mash from regression
    rankDelta = 0;
  } else if (isCorrect) {
    // Full +10 rating increase for any correct answer
    rankDelta = 10;
  } else {
    // -5 regression for incorrect answers
    rankDelta = -5;
  }

  const nextCompetenceRank = Math.max(50, currentCompetenceRank + rankDelta);

  return {
    isCorrect,
    isFluent,
    isOutlierGuess,
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
