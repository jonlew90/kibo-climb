import { describe, it, expect } from 'vitest';
import { evaluateAdaptiveAttempt, shouldTriggerProbeQuestion } from './AdaptiveEngine.js';

describe('AdaptiveEngine Simulations', () => {
  it('Proficient student reaches 1400+ rating in under 15 questions', () => {
    let currentRating = 1000;
    let totalProblemsSolved = 0;
    let inSessionStreak = 0;

    for (let i = 1; i <= 15; i++) {
      const isProbe = shouldTriggerProbeQuestion({ totalProblemsSolved, inSessionStreak });

      const evalResult = evaluateAdaptiveAttempt({
        isCorrect: true,
        latencyMs: 1500,
        currentCompetenceRank: currentRating,
        inSessionStreak,
        inSessionIncorrectStreak: 0,
        totalProblemsSolved,
        isProbeQuestion: isProbe
      });

      currentRating = evalResult.nextCompetenceRank;
      inSessionStreak = evalResult.nextInSessionStreak;
      totalProblemsSolved++;
    }

    expect(currentRating).toBeGreaterThanOrEqual(1400);
  });

  it('Beginner smoothly regresses with minimal penalty on probe miss', () => {
    let currentRating = 1000;
    let totalProblemsSolved = 0;
    let inSessionStreak = 0;

    for (let i = 1; i <= 3; i++) {
      const evalResult = evaluateAdaptiveAttempt({
        isCorrect: true,
        latencyMs: 2500,
        currentCompetenceRank: currentRating,
        inSessionStreak,
        inSessionIncorrectStreak: 0,
        totalProblemsSolved,
        isProbeQuestion: false
      });
      currentRating = evalResult.nextCompetenceRank;
      inSessionStreak = evalResult.nextInSessionStreak;
      totalProblemsSolved++;
    }

    const isProbe = shouldTriggerProbeQuestion({ totalProblemsSolved, inSessionStreak });
    expect(isProbe).toBe(true);

    const probeEval = evaluateAdaptiveAttempt({
      isCorrect: false,
      latencyMs: 4000,
      currentCompetenceRank: currentRating,
      inSessionStreak,
      inSessionIncorrectStreak: 0,
      totalProblemsSolved,
      isProbeQuestion: true
    });

    expect(probeEval.rankDelta).toBeGreaterThanOrEqual(-15);
    expect(probeEval.rankDelta).toBeLessThanOrEqual(-5);
    expect(probeEval.nextCompetenceRank).toBeGreaterThanOrEqual(1000);
  });
});
