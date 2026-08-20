import { describe, it, expect } from 'vitest';
import { generateTierProblem, getNormalizedProblemKey } from '../src/utils/mathCurriculum';
import { generateProblems } from '../src/utils/mathGenerator';
import { WORKSHOP_ITEMS } from '../src/utils/itemsCatalog';

describe('Fill-in-the-blank Math & Climber Power-Ups', () => {
  it('should generate fill_blank and missing_operator problem types across tiers', () => {
    let hasFillBlank = false;
    let hasMissingOperator = false;

    for (let i = 0; i < 50; i++) {
      const p1 = generateTierProblem(1);
      const p2 = generateTierProblem(2);
      const p3 = generateTierProblem(3);
      const p4 = generateTierProblem(4);

      [p1, p2, p3, p4].forEach((p) => {
        if (p.type === 'fill_blank') hasFillBlank = true;
        if (p.type === 'missing_operator') hasMissingOperator = true;
      });
    }

    expect(hasFillBlank).toBe(true);
    expect(hasMissingOperator).toBe(true);
  });

  it('should generate properly formatted display strings with blanks and options', () => {
    let foundOperatorProb = null;
    let foundBlankProb = null;

    for (let i = 0; i < 100; i++) {
      const p = generateTierProblem(1);
      if (p.type === 'missing_operator' && !foundOperatorProb) {
        foundOperatorProb = p;
      }
      if (p.type === 'fill_blank' && !foundBlankProb) {
        foundBlankProb = p;
      }
    }

    if (foundOperatorProb) {
      expect(foundOperatorProb.displayString).toContain('_');
      expect(foundOperatorProb.options).toBeDefined();
      expect(foundOperatorProb.options.length).toBeGreaterThanOrEqual(2);
      expect(foundOperatorProb.options).toContain(foundOperatorProb.answer);
    }

    if (foundBlankProb) {
      expect(foundBlankProb.displayString).toContain('_');
      expect(foundBlankProb.answerString).toBeDefined();
    }
  });

  it('should generate deduplicated problem queues via generateProblems', () => {
    const queue = generateProblems(15, 1);
    expect(queue.length).toBe(15);

    const keys = queue.map((p) => getNormalizedProblemKey(p));
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(queue.length);
  });

  it('should have Climber Spyglass and Climber Pruner available without Kibo Words restrictions in itemsCatalog', () => {
    const spyglass = WORKSHOP_ITEMS.find((item) => item.id === 'letter_spyglass');
    const pruner = WORKSHOP_ITEMS.find((item) => item.id === 'letter_pruner');

    expect(spyglass).toBeDefined();
    expect(spyglass.name).toBe('Climber Spyglass');
    expect(spyglass.badgeTag).not.toContain('Words Only');

    expect(pruner).toBeDefined();
    expect(pruner.name).toBe('Climber Pruner');
    expect(pruner.badgeTag).not.toContain('Words Only');
  });
});
