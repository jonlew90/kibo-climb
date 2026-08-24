import { describe, it, expect } from 'vitest';
import * as mathGenerator from '../../src/utils/mathGenerator.js';
import * as mathCurriculum from '../../src/utils/mathCurriculum.js';

describe('mathGenerator', () => {
  it('generateProblems generates an array of problems', () => {
    const problems = mathGenerator.generateProblems(5, 2);
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBe(5);

    // Check structure of a problem
    const prob = problems[0];
    expect(prob).toBeDefined();
    expect(prob.question || prob.type || prob.answer).toBeDefined();
  });

  it('mathCurriculum generates a problem for specific tier', () => {
    // Generate tier 1 problem
    const probTier1 = mathCurriculum.generateTierProblem(1);
    expect(probTier1).toBeDefined();

    // Generate tier 5 problem
    const probTier5 = mathCurriculum.generateTierProblem(5);
    expect(probTier5).toBeDefined();
  });
});
