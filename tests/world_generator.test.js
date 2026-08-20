import { describe, it, expect } from 'vitest';
import {
  generateProblems,
  generateTierProblem,
  generateWorldProblem,
  generateWorldSession,
  getNormalizedProblemKey,
  getTierCandidateTemplates
} from '../src/utils/worldGenerator';
import {
  CONTINENTS,
  OCEANS,
  US_STATES,
  COUNTRIES,
  WORLD_LANDMARKS_AND_WONDERS,
  TRICKY_CAPITALS,
  CARDINAL_DIRECTIONS
} from '../src/data/worldGeography';
import { WORLD_CURRICULUM_TIERS, getTierForRating } from '../src/utils/worldCurriculum';

describe('Kibo World Curriculum & Deduplication Engine', () => {
  it('should have complete and valid static geography dataset', () => {
    // Continents
    expect(CONTINENTS.length).toBe(7);
    CONTINENTS.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(c.areaRank).toBeGreaterThanOrEqual(1);
    });

    // Oceans
    expect(OCEANS.length).toBe(5);
    OCEANS.forEach(o => {
      expect(o.name).toBeTruthy();
      expect(o.fullName).toBeTruthy();
    });

    // US States
    expect(US_STATES.length).toBe(50);
    const stateCapitals = new Set();
    US_STATES.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(s.capital).toBeTruthy();
      expect(s.region).toBeTruthy();
      stateCapitals.add(s.capital);
    });
    expect(stateCapitals.size).toBe(50);

    // Countries
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(50);
    COUNTRIES.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(c.capital).toBeTruthy();
      expect(c.continent).toBeTruthy();
    });

    // Landmarks
    expect(WORLD_LANDMARKS_AND_WONDERS.length).toBeGreaterThanOrEqual(10);
    WORLD_LANDMARKS_AND_WONDERS.forEach(w => {
      expect(w.name).toBeTruthy();
      expect(w.fact).toBeTruthy();
    });

    // Tricky Capitals
    expect(TRICKY_CAPITALS.length).toBeGreaterThanOrEqual(10);
    TRICKY_CAPITALS.forEach(tc => {
      expect(tc.country).toBeTruthy();
      expect(tc.capital).toBeTruthy();
      expect(tc.commonConfusion).toBeTruthy();
    });
  });

  it('should generate a 15-problem session with 0 duplicates in Tier 1', () => {
    const seen = new Set();
    const batch = generateProblems(15, 1, [], seen);

    expect(batch.length).toBe(15);
    const keys = batch.map(p => getNormalizedProblemKey(p));
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(15);

    batch.forEach(p => {
      expect(p.prompt).toBeTruthy();
      expect(p.correctAnswer).toBeTruthy();
      expect(p.options.length).toBe(4);
      expect(p.options).toContain(p.correctAnswer);
      const uniqueOptions = new Set(p.options);
      expect(uniqueOptions.size).toBe(4);
    });
  });

  it('should generate 15-problem sessions with 0 duplicates across Tiers 1 through 5', () => {
    for (let tier = 1; tier <= 5; tier++) {
      const seen = new Set();
      const batch = generateProblems(15, tier, [], seen);

      expect(batch.length).toBe(15);
      const keys = batch.map(p => getNormalizedProblemKey(p));
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(15);

      batch.forEach(p => {
        expect(p.prompt).toBeTruthy();
        expect(p.correctAnswer).toBeTruthy();
        expect(p.options.length).toBe(4);
        expect(p.options).toContain(p.correctAnswer);
      });
    }
  });

  it('should respect history exclusion during primary pass', () => {
    const history = ['Asia', 'Pacific Ocean', 'North'];
    const seen = new Set();
    const batch = generateProblems(8, 1, history, seen);

    const answers = batch.map(p => p.correctAnswer);
    expect(answers).not.toContain('Asia');
    expect(answers).not.toContain('Pacific Ocean');
    expect(answers).not.toContain('North');
  });

  it('should provide valid SVG paths for shape questions', () => {
    const tier2Shapes = getTierCandidateTemplates(2).filter(t => t.type === 'state_shape');
    expect(tier2Shapes.length).toBeGreaterThanOrEqual(5);
    tier2Shapes.forEach(t => {
      expect(t.shapeSvg).toBeTruthy();
      expect(typeof t.shapeSvg).toBe('string');
      expect(t.shapeSvg.startsWith('M')).toBe(true);
    });

    const tier4Shapes = getTierCandidateTemplates(4).filter(t => t.type === 'country_shape');
    expect(tier4Shapes.length).toBeGreaterThanOrEqual(8);
    tier4Shapes.forEach(t => {
      expect(t.shapeSvg).toBeTruthy();
      expect(typeof t.shapeSvg).toBe('string');
      expect(t.shapeSvg.startsWith('M')).toBe(true);
    });
  });

  it('should support legacy generateWorldProblem and generateWorldSession aliases', () => {
    const single = generateWorldProblem(1000);
    expect(single).toBeDefined();
    expect(single.prompt).toBeTruthy();
    expect(single.correctAnswer).toBeTruthy();

    const session = generateWorldSession(12, 1000);
    expect(session.length).toBe(12);
  });
});