import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { generateProblems as generateMathProblems } from '../src/utils/mathGenerator';
import { generateProblems as generateWorldProblems } from '../src/utils/worldGenerator';
import { generateProblems as generateWordsProblems } from '../src/utils/wordsGenerator';

describe('Subject Isolation & Active Climb State Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should cleanly isolate active climb states between math, words, and world', () => {
    const profile = storageService.getActiveProfile();
    const pid = profile.id;

    const mathProblems = generateMathProblems(15, 1);
    const worldProblems = generateWorldProblems(15, 1);
    const wordsProblems = generateWordsProblems(15, 1);

    storageService.saveActiveClimbState({
      subject: 'world',
      problemQueue: worldProblems,
      sessionQuestionIndex: 3,
      correctCount: 2
    }, pid, 'world');

    storageService.saveActiveClimbState({
      subject: 'words',
      problemQueue: wordsProblems,
      sessionQuestionIndex: 5,
      correctCount: 4
    }, pid, 'words');

    storageService.saveActiveClimbState({
      subject: 'math',
      problemQueue: mathProblems,
      sessionQuestionIndex: 2,
      correctCount: 1
    }, pid, 'math');

    const mathClimb = storageService.getActiveClimbState(pid, 'math');
    const worldClimb = storageService.getActiveClimbState(pid, 'world');
    const wordsClimb = storageService.getActiveClimbState(pid, 'words');

    expect(mathClimb).not.toBeNull();
    expect(mathClimb.subject).toBe('math');
    expect(mathClimb.sessionQuestionIndex).toBe(2);
    expect(mathClimb.problemQueue.every(p => p.subject !== 'world' && p.type !== 'world')).toBe(true);

    expect(worldClimb).not.toBeNull();
    expect(worldClimb.subject).toBe('world');
    expect(worldClimb.sessionQuestionIndex).toBe(3);

    expect(wordsClimb).not.toBeNull();
    expect(wordsClimb.subject).toBe('words');
    expect(wordsClimb.sessionQuestionIndex).toBe(5);
  });

  it('should reject and clear legacy or corrupted active climb states when subject mismatch occurs', () => {
    const profile = storageService.getActiveProfile();
    const pid = profile.id;

    const worldProblems = generateWorldProblems(15, 1);
    storageService.saveActiveClimbState({
      subject: 'world',
      problemQueue: worldProblems,
      sessionQuestionIndex: 4
    }, pid, 'math');

    const mathClimb = storageService.getActiveClimbState(pid, 'math');
    expect(mathClimb).toBeNull();
  });

  it('should ensure math generator never creates world geography questions', () => {
    for (let tier = 1; tier <= 8; tier++) {
      const mathProblems = generateMathProblems(20, tier);
      mathProblems.forEach(p => {
        expect(p.type).not.toBe('world');
        expect(p.type).not.toBe('geography');
        expect(p.subject).not.toBe('world');
        expect(p.missingLetters).toBeUndefined();
      });
    }
  });
});
