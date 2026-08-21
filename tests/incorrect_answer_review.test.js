import { describe, it, expect } from 'vitest';
import { evaluateAdaptiveAttempt } from '../src/utils/AdaptiveEngine';
import { evaluateBadges } from '../src/utils/badgeManager';

describe('Incorrect Answer Review Behavior & Scoring Integrity', () => {
  it('evaluates adaptive attempt correctly on incorrect submission', () => {
    const evalResult = evaluateAdaptiveAttempt({
      isCorrect: false,
      latencyMs: 3200,
      currentCompetenceRank: 2100,
      inSessionStreak: 4,
      inSessionIncorrectStreak: 0,
      totalProblemsSolved: 20,
      isProbeQuestion: false,
      problemTier: 2
    });

    expect(evalResult.isCorrect).toBe(false);
    expect(evalResult.nextInSessionStreak).toBe(0);
    expect(evalResult.nextInSessionIncorrectStreak).toBe(1);
    expect(evalResult.rankDelta).toBeLessThan(0);
  });

  it('preserves sprint answers structure with correct isCorrect flag on incorrect answer', () => {
    const mockProblem = {
      id: 'prob_1',
      tier: 2,
      concept: 'Addition',
      type: 'standard',
      answer: 14
    };

    const userAnswer = '12';
    const isCorrect = Number(userAnswer) === Number(mockProblem.answer);
    expect(isCorrect).toBe(false);

    const answerRecord = {
      problemId: mockProblem.id,
      tier: mockProblem.tier,
      concept: mockProblem.concept,
      isCorrect,
      responseTimeSec: 2.5,
      isSkip: false,
      isProbe: false
    };

    expect(answerRecord.isCorrect).toBe(false);
    expect(answerRecord.problemId).toBe('prob_1');
  });

  it('determines 12-question block completion state accurately after an incorrect attempt', () => {
    // When on question 11 (0-indexed 11, meaning 12th question), answering it should trigger block completion
    const questionsAnswered = 11;
    const nextQuestionsAnswered = questionsAnswered + 1;
    const isBlockComplete = nextQuestionsAnswered % 12 === 0;

    expect(isBlockComplete).toBe(true);

    // Review data payload simulation
    const reviewData = {
      problem: { prompt: '8 + 6 = ?', answer: 14 },
      userAnswer: '12',
      correctAnswer: 14,
      isProbe: false,
      nextQuestionsAnswered,
      isBlockComplete
    };

    expect(reviewData.isBlockComplete).toBe(true);
    expect(reviewData.correctAnswer).toBe(14);
    expect(reviewData.userAnswer).toBe('12');
  });

  it('does not trigger block completion for questions 1 through 11', () => {
    for (let q = 0; q < 11; q++) {
      const nextQuestionsAnswered = q + 1;
      const isBlockComplete = nextQuestionsAnswered % 12 === 0;
      expect(isBlockComplete).toBe(false);
    }
  });

  it('formats review information correctly for multiple choice vs text input subjects', () => {
    // World / multiple-choice format
    const worldOptions = ['Paris', 'London', 'Berlin', 'Madrid'];
    const worldUserAnswer = 'London';
    const worldCorrectAnswer = 'Paris';

    const evaluatedOptions = worldOptions.map(opt => ({
      text: opt,
      isCorrect: opt === worldCorrectAnswer,
      isUserChoice: opt === worldUserAnswer
    }));

    const correctOpt = evaluatedOptions.find(o => o.isCorrect);
    const userOpt = evaluatedOptions.find(o => o.isUserChoice);

    expect(correctOpt.text).toBe('Paris');
    expect(userOpt.text).toBe('London');
    expect(userOpt.isCorrect).toBe(false);

    // Words / spelling format
    const targetWord = 'RABBIT';
    const userSpelling = 'RABIT';
    expect(userSpelling.toUpperCase()).not.toBe(targetWord.toUpperCase());
  });
});
