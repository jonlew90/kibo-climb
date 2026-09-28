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

  it('should never bleed active climb state from an existing profile to a newly created profile across all subjects', () => {
    const p1 = storageService.getActiveProfile();
    const mathProblems = generateMathProblems(15, 1);
    const wordsProblems = generateWordsProblems(15, 1);
    const worldProblems = generateWorldProblems(15, 1);

    // Give existing profile an in-progress climb in every subject
    storageService.saveActiveClimbState({
      subject: 'math',
      problemQueue: mathProblems,
      sessionQuestionIndex: 5,
      correctCount: 4
    }, p1.id, 'math');

    storageService.saveActiveClimbState({
      subject: 'words',
      problemQueue: wordsProblems,
      sessionQuestionIndex: 3,
      correctCount: 2
    }, p1.id, 'words');

    storageService.saveActiveClimbState({
      subject: 'world',
      problemQueue: worldProblems,
      sessionQuestionIndex: 6,
      correctCount: 5
    }, p1.id, 'world');

    expect(storageService.getActiveClimbState(p1.id, 'math')).not.toBeNull();
    expect(storageService.getActiveClimbState(p1.id, 'words')).not.toBeNull();
    expect(storageService.getActiveClimbState(p1.id, 'world')).not.toBeNull();

    // Create a new profile
    const p2 = storageService.createProfile('NewClimber', 'Grade 3–4');
    expect(p2).not.toBeNull();

    // Verify new profile has null activeClimb across all subjects
    expect(storageService.getActiveClimbState(p2.id, 'math')).toBeNull();
    expect(storageService.getActiveClimbState(p2.id, 'words')).toBeNull();
    expect(storageService.getActiveClimbState(p2.id, 'world')).toBeNull();
    expect(storageService.getActiveClimbState(p2.id, 'coding')).toBeNull();

    // Profile 1 still retains its active climb
    expect(storageService.getActiveClimbState(p1.id, 'math')?.sessionQuestionIndex).toBe(5);
  });

  it('should reset active climb state when saving username/grade during onboarding calibration', () => {
    const p1 = storageService.getActiveProfile();
    const mathProblems = generateMathProblems(15, 1);

    storageService.saveActiveClimbState({
      subject: 'math',
      problemQueue: mathProblems,
      sessionQuestionIndex: 4,
      correctCount: 3
    }, p1.id, 'math');

    expect(storageService.getActiveClimbState(p1.id, 'math')).not.toBeNull();

    // Onboarding saves new username and grade level
    storageService.saveUsername('FreshClimber', 'Grade 1–2');

    // Climb state should now be reset so Start Climb is shown
    expect(storageService.getActiveClimbState(p1.id, 'math')).toBeNull();
  });
});
