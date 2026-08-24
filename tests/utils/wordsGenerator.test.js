import { describe, it, expect } from 'vitest';
import * as wordsGenerator from '../../src/utils/wordsGenerator.js';

describe('wordsGenerator', () => {
  it('generateTierProblem generates a valid problem', () => {
    const problem = wordsGenerator.generateTierProblem(1);
    expect(problem).toBeDefined();
    expect(problem.type).toBeDefined();
    // From manual inspection of wordsGenerator, standard problems return answer
    expect(problem.answer).toBeDefined();
  });

  it('calculateRevealedLetterCount handles small words', () => {
    expect(wordsGenerator.calculateRevealedLetterCount(2, 1)).toBe(0);
    expect(wordsGenerator.calculateRevealedLetterCount(3, 1)).toBe(1);
  });

  it('calculateRevealedLetterCount handles larger words across tiers', () => {
    expect(wordsGenerator.calculateRevealedLetterCount(6, 1)).toBeGreaterThanOrEqual(1);
    expect(wordsGenerator.calculateRevealedLetterCount(8, 4)).toBeGreaterThanOrEqual(1);
  });

  it('generateProblems generates an array of problems', () => {
    const problems = wordsGenerator.generateProblems(3, 2);
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBe(3);
    expect(problems[0].type).toBeDefined();
  });
});
