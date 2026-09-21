import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { generateProblems as generateMathProblems } from '../src/utils/mathGenerator';
import { generateProblems as generateWordsProblems } from '../src/utils/wordsGenerator';

describe('Practice Mode / Training Camp Enhancements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records and retrieves lightweight practice session history per subject (Rec #4)', () => {
    const mathInitial = storageService.getPracticeHistory('math');
    expect(mathInitial).toEqual([]);

    storageService.recordPracticeSession({
      tier: 3,
      mode: 'tier_drill',
      correctCount: 10,
      totalCount: 12,
      timeSec: 45
    }, 'math');

    const mathHistory = storageService.getPracticeHistory('math');
    expect(mathHistory.length).toBe(1);
    expect(mathHistory[0].subject).toBe('math');
    expect(mathHistory[0].tier).toBe(3);
    expect(mathHistory[0].mode).toBe('tier_drill');
    expect(mathHistory[0].correctCount).toBe(10);
    expect(mathHistory[0].totalCount).toBe(12);
    expect(mathHistory[0].accuracy).toBe(83);
    expect(mathHistory[0].timeSec).toBe(45);
    expect(mathHistory[0].timestamp).toBeDefined();

    // Verify isolation across subjects
    const wordsHistory = storageService.getPracticeHistory('words');
    expect(wordsHistory).toEqual([]);

    storageService.recordPracticeSession({
      tier: 'weak_areas',
      mode: 'weak_areas',
      correctCount: 3,
      totalCount: 3,
      timeSec: 15
    }, 'words');

    const wordsUpdated = storageService.getPracticeHistory('words');
    expect(wordsUpdated.length).toBe(1);
    expect(wordsUpdated[0].subject).toBe('words');
    expect(wordsUpdated[0].mode).toBe('weak_areas');
    expect(wordsUpdated[0].accuracy).toBe(100);
  });

  it('generates 3-question sprints cleanly for quick warmups (Rec #3)', () => {
    const math3 = generateMathProblems(3, 1, []);
    expect(math3.length).toBe(3);

    const words3 = generateWordsProblems(3, 1, []);
    expect(words3.length).toBe(3);
  });

  it('prioritizes queued weak area items when generating practice problems (Rec #1)', () => {
    const mockWeakItem = {
      num1: 99,
      num2: 1,
      operatorSymbol: '+',
      type: 'addition',
      answer: 100
    };

    const mathProblems = generateMathProblems(6, 2, [mockWeakItem]);
    expect(mathProblems.length).toBe(6);
    expect(mathProblems[0].isPracticeItem).toBe(true);
    expect(mathProblems[0].num1).toBe(99);
    expect(mathProblems[0].num2).toBe(1);
  });
});
