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
  currentCompetenceRank = 1000
}) {
  const responseTimeSec = latencyMs / 1000;

  // 1. Check for rapid button mashing outlier (< 0.8 seconds)
  const isOutlierGuess = responseTimeSec < 0.8;

  // 2. Secondary Response Time Fluency Score Metadata
  const isFluent = isCorrect && responseTimeSec < 3.0;
  const fluencyLabel = isFluent ? 'High Fluency (<3s)' : responseTimeSec < 6.0 ? 'Steady Recall' : 'Deliberate Solve';

  // 3. Competence Rank delta (100% driven by correctness, not response time)
  let rankDelta = 0;

  if (isOutlierGuess && !isCorrect) {
    // Ignore rapid accidental button mash from regression
    rankDelta = 0;
  } else if (isCorrect) {
    // Full +10 rating increase for any correct answer, even 20s+ slow answers
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
    nextCompetenceRank
  };
}
