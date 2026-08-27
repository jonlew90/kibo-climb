import { describe, it, expect } from 'vitest';
import { calculateDomainMastery, calculateAdaptiveCompetenceProfile } from './domainStats.js';
import { calculateConceptBreakdown } from './skipDiagnosticEngine.js';

describe('Domain Mastery & Question-Level Tier Attribution', () => {
  it('attributes mixed-tier question answers to their respective domain tiers in Math', () => {
    // A sprint completed at Tier 5, but containing 2 Tier 2 review questions and 10 Tier 5 questions
    const sprintWithMixedTiers = {
      id: 'session-1',
      date: new Date().toISOString().split('T')[0],
      tier: 5,
      totalQuestions: 12,
      correctCount: 10,
      answers: [
        // 2 Tier 2 questions (both correct, average 2.0s)
        { problemId: 'q1', tier: 2, concept: 'Multiplication Foundations', isCorrect: true, responseTimeSec: 2.0 },
        { problemId: 'q2', tier: 2, concept: 'Multiplication Foundations', isCorrect: true, responseTimeSec: 2.0 },
        // 10 Tier 5 questions (8 correct, 2 incorrect, average 4.0s)
        { problemId: 'q3', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q4', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q5', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q6', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q7', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q8', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q9', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q10', tier: 5, concept: 'Money & Decimals', isCorrect: true, responseTimeSec: 4.0 },
        { problemId: 'q11', tier: 5, concept: 'Money & Decimals', isCorrect: false, responseTimeSec: 4.0 },
        { problemId: 'q12', tier: 5, concept: 'Money & Decimals', isCorrect: false, responseTimeSec: 4.0 },
      ]
    };

    const mathMastery = calculateDomainMastery([sprintWithMixedTiers], 5, 1850, [], 'math');

    // Tier 2 domain (Multiplication Foundations) should have 2 attempts, 2 correct = 100% accuracy
    const multFoundationsDomain = mathMastery.find((d) => d.id === 'mult_foundations');
    expect(multFoundationsDomain).toBeDefined();
    expect(multFoundationsDomain.totalAttempted).toBe(2);
    expect(multFoundationsDomain.accuracy).toBe(100);

    // Tier 5/6 domain (Decimals & Division) should have 10 attempts, 8 correct = 80% accuracy
    const decimalsDomain = mathMastery.find((d) => d.id === 'decimals_division');
    expect(decimalsDomain).toBeDefined();
    expect(decimalsDomain.totalAttempted).toBe(10);
    expect(decimalsDomain.accuracy).toBe(80);
  });

  it('attributes mixed-tier question answers in Words subject consistently', () => {
    const sprintWithMixedTiersWords = {
      id: 'session-words-1',
      date: new Date().toISOString().split('T')[0],
      tier: 3,
      totalQuestions: 12,
      correctCount: 11,
      answers: [
        // 4 Tier 1 Letter questions (all correct)
        { problemId: 'wq1', tier: 1, concept: 'Letters', isCorrect: true, responseTimeSec: 1.5 },
        { problemId: 'wq2', tier: 1, concept: 'Letters', isCorrect: true, responseTimeSec: 1.5 },
        { problemId: 'wq3', tier: 1, concept: 'Letters', isCorrect: true, responseTimeSec: 1.5 },
        { problemId: 'wq4', tier: 1, concept: 'Letters', isCorrect: true, responseTimeSec: 1.5 },
        // 8 Tier 3 Grammar/Vocab questions (7 correct, 1 incorrect)
        { problemId: 'wq5', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq6', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq7', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq8', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq9', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq10', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq11', tier: 3, concept: 'Grammar', isCorrect: true, responseTimeSec: 3.5 },
        { problemId: 'wq12', tier: 3, concept: 'Grammar', isCorrect: false, responseTimeSec: 3.5 },
      ]
    };

    const wordsMastery = calculateDomainMastery([sprintWithMixedTiersWords], 3, 1450, [], 'words');

    // Phonics & CVC domain (Tier 1)
    const phonicsDomain = wordsMastery.find((d) => d.id === 'phonics_cvc');
    expect(phonicsDomain).toBeDefined();
    expect(phonicsDomain.totalAttempted).toBe(4);
    expect(phonicsDomain.accuracy).toBe(100);

    // Blends & Digraphs domain (Tier 2 & 3)
    const blendsDomain = wordsMastery.find((d) => d.id === 'blends_digraphs');
    expect(blendsDomain).toBeDefined();
    expect(blendsDomain.totalAttempted).toBe(8);
    expect(blendsDomain.accuracy).toBe(88); // 7/8 = 87.5% -> 88%
  });

  it('maintains backwards compatibility for legacy sprint records without answers array', () => {
    const legacySprint = {
      id: 'session-legacy-1',
      date: new Date().toISOString().split('T')[0],
      tier: 2,
      totalQuestions: 12,
      correctCount: 9,
      totalTimeSec: 36
    };

    const mathMastery = calculateDomainMastery([legacySprint], 2, 1300, [], 'math');
    const multFoundationsDomain = mathMastery.find((d) => d.id === 'mult_foundations');
    expect(multFoundationsDomain).toBeDefined();
    expect(multFoundationsDomain.totalAttempted).toBe(12);
    expect(multFoundationsDomain.accuracy).toBe(75);
  });

  it('calculates concept breakdown accurately with question-level answers', () => {
    const sprintWithMixedTiers = {
      id: 'session-concept-1',
      date: new Date().toISOString().split('T')[0],
      tier: 4,
      answers: [
        { problemId: 'q1', tier: 1, isCorrect: true },
        { problemId: 'q2', tier: 1, isCorrect: true },
        { problemId: 'q3', tier: 4, isCorrect: true },
        { problemId: 'q4', tier: 4, isCorrect: false },
        { problemId: 'q5', tier: 4, isSkip: true }
      ]
    };

    const breakdown = calculateConceptBreakdown([sprintWithMixedTiers], [], 'math');
    const addSubConcept = breakdown['Addition & Subtraction'];
    expect(addSubConcept).toBeDefined();
    expect(addSubConcept.correct).toBe(2);

    const multiDigitConcept = breakdown['Multi-Digit Mental Math'];
    expect(multiDigitConcept).toBeDefined();
    expect(multiDigitConcept.correct).toBe(1);
    expect(multiDigitConcept.incorrect).toBe(1);
    expect(multiDigitConcept.skipped).toBe(1);
  });
});
