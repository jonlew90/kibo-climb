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
    expect(wordsGenerator.calculateRevealedLetterCount(4, 2)).toBe(2);
  });

  it('calculateRevealedLetterCount provides balanced scaffolding across tiers leaving at least 2 blanks', () => {
    expect(wordsGenerator.calculateRevealedLetterCount(6, 1)).toBe(2);
    expect(wordsGenerator.calculateRevealedLetterCount(8, 4)).toBe(4);
    expect(wordsGenerator.calculateRevealedLetterCount(12, 6)).toBe(6);
    expect(wordsGenerator.calculateRevealedLetterCount(14, 7)).toBe(8);
    // Always leaves at least 2 blanks
    expect(wordsGenerator.calculateRevealedLetterCount(4, 3)).toBe(2);
    expect(wordsGenerator.calculateRevealedLetterCount(5, 5)).toBe(2);
  });

  it('generateProblems generates an array of problems', () => {
    const problems = wordsGenerator.generateProblems(3, 2);
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBe(3);
    expect(problems[0].type).toBeDefined();
  });
});
