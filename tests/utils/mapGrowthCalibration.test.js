import { describe, it, expect } from 'vitest';
import {
  ratingToEstimatedRIT,
  getRITBandDetails,
  ritToStartingRating,
  calculateMapDomainBreakdown,
  MAP_MATH_DOMAINS
} from '../../src/utils/mapGrowthCalibration.js';

describe('MAP Growth Calibration Utilities', () => {
  it('converts rating to estimated RIT across normative scale', () => {
    expect(ratingToEstimatedRIT(900)).toBe(145);
    expect(ratingToEstimatedRIT(1000)).toBe(165);
    expect(ratingToEstimatedRIT(1200)).toBe(185);
    expect(ratingToEstimatedRIT(1400)).toBe(198);
    expect(ratingToEstimatedRIT(2400)).toBe(234);
  });

  it('produces valid RIT band details and grade labels', () => {
    const band = getRITBandDetails(1400);
    expect(band.estimatedRIT).toBe(198);
    expect(band.bandString).toBe('193–203');
    expect(band.gradeBand).toBe('Grade 3–4');
  });

  it('converts entered RIT score to starting rating and grade', () => {
    const low = ritToStartingRating(150);
    expect(low.rating).toBe(900);
    expect(low.gradeLevel).toBe('Kindergarten');

    const mid = ritToStartingRating(198);
    expect(mid.rating).toBe(1200);
    expect(mid.gradeLevel).toBe('Grade 3–4');

    const high = ritToStartingRating(225);
    expect(high.rating).toBe(2200);
    expect(high.gradeLevel).toBe('Grade 7–8');
  });

  it('calculates domain breakdown across 4 MAP math clusters', () => {
    const mockSprints = [
      { tier: 1, totalQuestions: 10, correctCount: 9 },
      { tier: 2, totalQuestions: 10, correctCount: 8 }
    ];
    const domains = calculateMapDomainBreakdown(mockSprints, 1400);
    expect(domains.length).toBe(4);
    expect(MAP_MATH_DOMAINS.length).toBe(4);

    const opDomain = domains.find(d => d.id === 'operations_algebra');
    expect(opDomain).toBeDefined();
    expect(opDomain.attempted).toBe(20);
    expect(opDomain.correct).toBe(17);
    expect(opDomain.accuracyPct).toBe(85);
  });
});
