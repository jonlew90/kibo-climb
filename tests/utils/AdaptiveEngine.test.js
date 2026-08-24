import { describe, it, expect } from 'vitest';
import * as AdaptiveEngine from '../../src/utils/AdaptiveEngine.js';

describe('AdaptiveEngine', () => {
  it('shouldTriggerProbeQuestion triggers on streak >= 3 under 15', () => {
    expect(AdaptiveEngine.shouldTriggerProbeQuestion({ totalProblemsSolved: 5, inSessionStreak: 3 })).toBe(true);
    expect(AdaptiveEngine.shouldTriggerProbeQuestion({ totalProblemsSolved: 5, inSessionStreak: 2 })).toBe(false);
  });

  it('shouldTriggerProbeQuestion triggers on streak >= 4 div 4 if over 15', () => {
    expect(AdaptiveEngine.shouldTriggerProbeQuestion({ totalProblemsSolved: 16, inSessionStreak: 4 })).toBe(true);
    expect(AdaptiveEngine.shouldTriggerProbeQuestion({ totalProblemsSolved: 16, inSessionStreak: 8 })).toBe(true);
    expect(AdaptiveEngine.shouldTriggerProbeQuestion({ totalProblemsSolved: 16, inSessionStreak: 5 })).toBe(false);
  });

  it('getTierTargetRating returns reasonable targets', () => {
    expect(AdaptiveEngine.getTierTargetRating(1)).toBeGreaterThanOrEqual(600);
    expect(AdaptiveEngine.getTierTargetRating(2)).toBeGreaterThan(AdaptiveEngine.getTierTargetRating(1));
  });

  it('evaluateAdaptiveAttempt handles correct answers properly', () => {
    const res = AdaptiveEngine.evaluateAdaptiveAttempt({
      isCorrect: true,
      latencyMs: 5000,
      currentCompetenceRank: 1000,
      problemTier: 1,
      totalProblemsSolved: 5,
      inSessionStreak: 3
    });

    expect(res.isCorrect).toBe(true);
    expect(res.rankDelta).toBeGreaterThan(0);
    expect(res.nextCompetenceRank).toBeGreaterThan(1000);
  });

  it('evaluateAdaptiveAttempt handles incorrect answers properly', () => {
    const res = AdaptiveEngine.evaluateAdaptiveAttempt({
      isCorrect: false,
      latencyMs: 5000,
      currentCompetenceRank: 1000,
      problemTier: 1,
      totalProblemsSolved: 20,
      inSessionStreak: 0
    });

    expect(res.isCorrect).toBe(false);
    expect(res.rankDelta).toBeLessThan(0);
    expect(res.nextCompetenceRank).toBeLessThan(1000);
  });
});
