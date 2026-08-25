import { describe, it, expect } from 'vitest';
import * as codingCurriculum from '../../src/utils/codingCurriculum.js';
import * as codingGenerator from '../../src/utils/codingGenerator.js';
import { evaluateBadges } from '../../src/utils/badgeManager.js';
import { SUBJECTS_CONFIG } from '../../src/config/subjects.js';

describe('Coding Curriculum & Generator', () => {
  it('has valid SUBJECTS_CONFIG entry for coding', () => {
    expect(SUBJECTS_CONFIG.coding).toBeDefined();
    expect(SUBJECTS_CONFIG.coding.name).toBe('Coding');
    expect(SUBJECTS_CONFIG.coding.icon).toBe('💻');
    expect(SUBJECTS_CONFIG.coding.COMPETENCE_RANK_TIERS.length).toBe(8);
    expect(SUBJECTS_CONFIG.coding.SKILL_STRANDS.length).toBe(8);
    expect(SUBJECTS_CONFIG.coding.DOMAIN_DEFINITIONS.length).toBe(4);
  });

  it('maps rating to correct coding tier and grade level', () => {
    expect(codingCurriculum.getTierFromRating(1000)).toBe(1);
    expect(codingCurriculum.getTierFromRating(1300)).toBe(2);
    expect(codingCurriculum.getTierFromRating(1500)).toBe(3);
    expect(codingCurriculum.getTierFromRating(1700)).toBe(4);
    expect(codingCurriculum.getTierFromRating(1900)).toBe(5);
    expect(codingCurriculum.getTierFromRating(2100)).toBe(6);
    expect(codingCurriculum.getTierFromRating(2300)).toBe(7);
    expect(codingCurriculum.getTierFromRating(2500)).toBe(8);

    expect(codingCurriculum.getGradeLevelFromRating(1000)).toBe('K–Grade 2');
    expect(codingCurriculum.getGradeLevelFromRating(2500)).toBe('Grade 7–8+');
  });

  it('generates valid problems for each tier (1-8)', () => {
    for (let tier = 1; tier <= 8; tier++) {
      const prob = codingGenerator.generateCodingProblem(tier);
      expect(prob).toBeDefined();
      expect(prob.tier).toBe(tier);
      expect(prob.displayString).toBeDefined();
      expect(prob.answer).toBeDefined();
      expect(prob.options).toBeDefined();
      expect(prob.options.length).toBeGreaterThanOrEqual(2);
      expect(prob.options).toContain(prob.answer);
    }
  });

  it('generates a full deduplicated session of coding problems', () => {
    const session = codingGenerator.generateCodingSession(15, 3);
    expect(session.length).toBe(15);
    expect(session.every(p => p.type === 'coding')).toBe(true);
  });

  it('evaluates coding-specific badges', () => {
    const userState = {
      subjectId: 'coding',
      competenceRank: 1650,
      totalProblemsSolved: 120,
      unlockedBadges: []
    };

    const evalResult = evaluateBadges(userState);
    expect(evalResult.newlyUnlocked).toBeDefined();
    // At 1650 rating & 120 solved, should unlock coding_novice, coding_coder, pattern_scout, grid_navigator, boolean_ranger
    expect(evalResult.updatedUnlocked).toContain('coding_novice');
    expect(evalResult.updatedUnlocked).toContain('coding_coder');
    expect(evalResult.updatedUnlocked).toContain('pattern_scout');
    expect(evalResult.updatedUnlocked).toContain('grid_navigator');
    expect(evalResult.updatedUnlocked).toContain('boolean_ranger');
  });
});
