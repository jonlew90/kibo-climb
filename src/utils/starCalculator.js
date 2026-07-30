/**
 * Dynamic Star Rating Calculator for Kibo Math
 * Evaluates 1, 2, and 3-star mastery ratings based on each tier's unique target speed and accuracy requirements.
 */

export const calculateTierStars = (sprintResultOrAccuracy, durationInSeconds = 0, tierConfig = null, totalQuestions = 20) => {
  let accuracy = 0;
  let duration = 0;
  let config = tierConfig;
  let questionsCount = totalQuestions;

  if (typeof sprintResultOrAccuracy === 'object' && sprintResultOrAccuracy !== null) {
    accuracy = Number(sprintResultOrAccuracy.accuracyPct ?? sprintResultOrAccuracy.accuracyPercentage ?? 0);
    duration = Number(sprintResultOrAccuracy.totalTimeSec ?? sprintResultOrAccuracy.durationInSeconds ?? 0);
    config = tierConfig || sprintResultOrAccuracy.tierConfig;
    questionsCount = sprintResultOrAccuracy.totalQuestions || totalQuestions;
  } else {
    accuracy = Number(sprintResultOrAccuracy || 0);
    duration = Number(durationInSeconds || 0);
  }

  const durationSec = duration > 1000 ? Math.floor(duration / 1000) : duration;
  const targetSpeed = config?.targetSpeedPerQuestion || 2.0;

  const targetTime3Star = questionsCount * targetSpeed; // e.g., 20 * 4.0s = 80s for Tier 3, 20 * 2.0s = 40s for Tier 1
  const targetTime2Star = targetTime3Star * 1.5;         // e.g., 80s * 1.5 = 120s for Tier 3

  // Star Evaluation Logic
  if (accuracy >= 95 && durationSec <= targetTime3Star) {
    return 3; // Speed & Accuracy Mastery
  }
  if (accuracy >= 90 && durationSec <= targetTime2Star) {
    return 2; // Proficiency
  }
  if (accuracy >= 80) {
    return 1; // Basic Completion
  }

  return 0; // Needs Retry
};
