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
import { REGIONAL_MAPS } from '../src/data/worldMaps';
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
    const history = ['Asia', 'Pacific', 'North'];
    const seen = new Set();
    const batch = generateProblems(8, 1, history, seen);

    const answers = batch.map(p => p.correctAnswer);
    expect(answers).not.toContain('Asia');
    expect(answers).not.toContain('Pacific');
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

  it('should provide rich regional map contexts with surrounding land, water, and target highlights', () => {
    // Check REGIONAL_MAPS catalogue
    const mapNames = Object.keys(REGIONAL_MAPS);
    expect(mapNames.length).toBeGreaterThanOrEqual(15);

    mapNames.forEach(name => {
      const map = REGIONAL_MAPS[name];
      expect(map.geoType).toBeTruthy();
      expect(map.targetId).toBeTruthy();
      expect(Array.isArray(map.center)).toBe(true);
      expect(typeof map.scale).toBe('number');
      expect(Array.isArray(map.targetCenter)).toBe(true);
      expect(typeof map.targetCenter[0]).toBe('number');
      expect(typeof map.targetCenter[1]).toBe('number');
      if (map.waterBodies) expect(Array.isArray(map.waterBodies)).toBe(true);
    });

    // Check that generated shape problems include mapData or shapeSvg
    const tier2Shapes = getTierCandidateTemplates(2).filter(t => t.type === 'state_shape');
    tier2Shapes.forEach(t => {
      expect(t.shapeSvg || t.mapData).toBeDefined();
    });

    const tier4Shapes = getTierCandidateTemplates(4).filter(t => t.type === 'country_shape');
    tier4Shapes.forEach(t => {
      expect(t.shapeSvg || t.mapData).toBeDefined();
    });
  });

  it('should have at least 100 unique candidate questions in every single tier and over 1,000 total questions', () => {
    let totalUnique = new Set();
    for (let tier = 1; tier <= 5; tier++) {
      const templates = getTierCandidateTemplates(tier);
      expect(templates.length).toBeGreaterThanOrEqual(100);
      const uniqueKeys = new Set(templates.map(getNormalizedProblemKey));
      expect(uniqueKeys.size).toBeGreaterThanOrEqual(100);
      templates.forEach(t => totalUnique.add(getNormalizedProblemKey(t)));
    }
    expect(totalUnique.size).toBeGreaterThanOrEqual(1000);
  });

  it('should ensure all candidate templates have hints and valid 4-option multiple choice answers', () => {
    for (let tier = 1; tier <= 5; tier++) {
      const templates = getTierCandidateTemplates(tier);
      templates.forEach(t => {
        expect(t.prompt).toBeTruthy();
        expect(t.correctAnswer).toBeTruthy();
        expect(t.hint).toBeTruthy();
        expect(t.options.length).toBe(4);
        expect(t.options).toContain(t.correctAnswer);

        // Verify 50:50 pruning logic
        const distractors = t.options.filter(o => o !== t.correctAnswer);
        expect(distractors.length).toBe(3);
        const pruned = distractors.slice(0, 2);
        const remaining = t.options.filter(o => !pruned.includes(o));
        expect(remaining).toContain(t.correctAnswer);
        expect(remaining.length).toBe(2);
      });
    }
  });

  it('should verify power-up catalog includes Explorer Compass and clear subject labeling', async () => {
    const { WORKSHOP_ITEMS } = await import('../src/utils/itemsCatalog.js');
    const powerups = WORKSHOP_ITEMS.filter(i => i.category === 'powerups');
    
    // Check Explorer's Compass
    const compass = powerups.find(i => i.id === 'explorer_compass');
    expect(compass).toBeDefined();
    expect(compass.name).toBe("Explorer's Compass");
    expect(compass.supportedSubjects).toEqual(['world']);
    expect(compass.subjectLabel).toBe('Kibo World Only');

    // Check Spyglass
    const spyglass = powerups.find(i => i.id === 'letter_spyglass');
    expect(spyglass).toBeDefined();
    expect(spyglass.supportedSubjects).toEqual(['math', 'words']);
    expect(spyglass.subjectLabel).toBe('Math & Words Only');

    // Check all powerups have subjectLabel and supportedSubjects
    powerups.forEach(p => {
      expect(p.supportedSubjects).toBeDefined();
      expect(p.subjectLabel).toBeDefined();
      expect(p.isConsumable).toBe(true);
    });
  });

  it('should ensure question hints do not duplicate compass orientation clues', () => {
    for (let tier = 1; tier <= 5; tier++) {
      const templates = getTierCandidateTemplates(tier);
      templates.forEach(t => {
        // Country templates should not have hints purely repeating "This sovereign nation is in <Continent>"
        if (t.type === 'capital_country' || t.type === 'country_flag' || t.type === 'country_landmark') {
          expect(t.hint).not.toMatch(/^This sovereign nation is in/);
          expect(t.hint).not.toMatch(/^It is located on the continent of/);
        }
        // State templates should not have hints purely repeating "It is in the <Region> region"
        if (t.type === 'state_trivia') {
          expect(t.hint).not.toMatch(/^It is in the .* region\.$/);
        }
      });
    }
  });
});