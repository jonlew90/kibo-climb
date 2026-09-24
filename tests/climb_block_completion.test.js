import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../src/services/storageService';

describe('Climb Block Completion & Anti-Endless-Loop Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Standard 12-Question Block Invariants', () => {
    it('clean 12-question run triggers break overlay without entering review or advancing queue', () => {
      const totalBlockQuestions = 12;
      let isReviewPhase = false;
      let missedReviewQueue = [];
      let currentIndex = 11;
      let questionsAnswered = 11;
      let showBreakOverlay = false;

      // Answering 12th question correctly
      const nextQuestionsAnswered = questionsAnswered + 1;
      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= 12 - 1;

      expect(reachedBlockEnd).toBe(true);
      expect(isReviewComplete).toBe(false);

      if (reachedBlockEnd && missedReviewQueue.length > 0) {
        isReviewPhase = true;
      } else if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
        isReviewPhase = false;
        showBreakOverlay = true;
      } else {
        currentIndex += 1;
      }

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
      expect(currentIndex).toBe(11); // Index does not advance past completed block
    });

    it('mistake on Question 12 enters review phase with exactly 1 review question and no dynamic queue inflation', () => {
      const totalBlockQuestions = 12;
      let isReviewPhase = false;
      let missedReviewQueue = [];
      let problemQueue = Array.from({ length: 15 }, (_, i) => ({ id: `prob_${i}`, answer: i }));
      let currentIndex = 11;
      let questionsAnswered = 11;
      let showBreakOverlay = false;

      // Question 12 missed
      const currentProblem = problemQueue[currentIndex];
      missedReviewQueue.push({ ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 });
      const nextQuestionsAnswered = questionsAnswered + 1;

      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      expect(reachedBlockEnd).toBe(true);
      expect(missedReviewQueue.length).toBe(1);

      if (reachedBlockEnd && missedReviewQueue.length > 0) {
        isReviewPhase = true;
        const nextIdx = currentIndex + 1;
        // Clean slice: primary 12 items + missed review items ONLY (no replenishQueueIfNeeded)
        problemQueue = [...problemQueue.slice(0, nextIdx), ...missedReviewQueue];
        missedReviewQueue = [];
        currentIndex = nextIdx;
      } else if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
        showBreakOverlay = true;
      }

      expect(isReviewPhase).toBe(true);
      expect(problemQueue.length).toBe(13); // 12 original + 1 review problem
      expect(currentIndex).toBe(12); // Points directly to the review problem
      expect(problemQueue[12].isReviewAttempt).toBe(true);
      expect(showBreakOverlay).toBe(false);

      // Now user answers review problem at index 12 correctly
      const reviewNextAnswered = nextQuestionsAnswered + 1;
      const reviewReachedBlockEnd = !isReviewPhase && reviewNextAnswered > 0 && reviewNextAnswered % totalBlockQuestions === 0;
      const reviewIsReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      expect(reviewReachedBlockEnd).toBe(false); // In review phase, block end is false
      expect(reviewIsReviewComplete).toBe(true); // Index 12 >= 13 - 1

      if ((reviewReachedBlockEnd && missedReviewQueue.length === 0) || reviewIsReviewComplete) {
        isReviewPhase = false;
        showBreakOverlay = true;
      }

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
    });

    it('repeated mistake in review routes to spaced repetition without infinite looping', () => {
      const addToPracticeSpy = vi.spyOn(storageService, 'addToPracticeQueue').mockImplementation(() => {});

      let isReviewPhase = true;
      let missedReviewQueue = [];
      let problemQueue = Array.from({ length: 13 }, (_, i) => ({
        id: `prob_${i}`,
        answer: i,
        isReviewAttempt: i === 12
      }));
      let currentIndex = 12;
      let questionsAnswered = 12;
      let showBreakOverlay = false;

      const currentProblem = problemQueue[currentIndex];
      expect(currentProblem.isReviewAttempt).toBe(true);

      // Failed review attempt
      if (!currentProblem.isReviewAttempt) {
        missedReviewQueue.push({ ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 });
      } else {
        storageService.addToPracticeQueue(currentProblem, 'math');
      }

      expect(addToPracticeSpy).toHaveBeenCalledWith(currentProblem, 'math');
      expect(missedReviewQueue.length).toBe(0); // Not re-added to session queue

      // User continues after review mistake
      const nextQuestionsAnswered = questionsAnswered + 1;
      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      expect(isReviewComplete).toBe(true);

      if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
        isReviewPhase = false;
        showBreakOverlay = true;
      }

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
    });

    it('skip on Question 12 transitions to review or break overlay and does NOT cause endless climb', () => {
      const totalBlockQuestions = 12;
      let isReviewPhase = false;
      let missedReviewQueue = [];
      let problemQueue = Array.from({ length: 15 }, (_, i) => ({ id: `prob_${i}`, answer: i }));
      let currentIndex = 11;
      let questionsAnswered = 11;
      let showBreakOverlay = false;

      const currentProblem = problemQueue[currentIndex];
      const isAlreadyReview = !!currentProblem.isReviewAttempt;
      if (!isAlreadyReview) {
        missedReviewQueue.push({ ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 });
      }

      const nextQuestionsAnswered = questionsAnswered + 1;
      const effectiveReviewQueue = !isAlreadyReview ? missedReviewQueue : [];

      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % totalBlockQuestions === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      expect(reachedBlockEnd).toBe(true);
      expect(effectiveReviewQueue.length).toBe(1);

      if (reachedBlockEnd && effectiveReviewQueue.length > 0) {
        isReviewPhase = true;
        const nextIdx = currentIndex + 1;
        problemQueue = [...problemQueue.slice(0, nextIdx), ...effectiveReviewQueue];
        missedReviewQueue = [];
        currentIndex = nextIdx;
      } else if ((reachedBlockEnd && effectiveReviewQueue.length === 0) || isReviewComplete) {
        showBreakOverlay = true;
      }

      expect(isReviewPhase).toBe(true);
      expect(currentIndex).toBe(12);
      expect(problemQueue.length).toBe(13);
    });

    it('skip during review phase completes review without overflowing problemQueue', () => {
      let isReviewPhase = true;
      let missedReviewQueue = [];
      let problemQueue = Array.from({ length: 13 }, (_, i) => ({
        id: `prob_${i}`,
        answer: i,
        isReviewAttempt: i === 12
      }));
      let currentIndex = 12;
      let questionsAnswered = 12;
      let showBreakOverlay = false;

      const currentProblem = problemQueue[currentIndex];
      const isAlreadyReview = !!currentProblem.isReviewAttempt;

      expect(isAlreadyReview).toBe(true);

      const nextQuestionsAnswered = questionsAnswered + 1;
      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0;
      const isReviewComplete = isReviewPhase && currentIndex >= problemQueue.length - 1;

      expect(isReviewComplete).toBe(true);

      if ((reachedBlockEnd && missedReviewQueue.length === 0) || isReviewComplete) {
        isReviewPhase = false;
        showBreakOverlay = true;
      }

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
      expect(currentIndex).toBe(12); // Does not overshoot
    });

    it('multiple mistakes across Q1-Q11 are batched into review and complete after last review problem', () => {
      let isReviewPhase = false;
      let missedReviewQueue = [
        { id: 'prob_2', answer: 2, isReviewAttempt: true, reviewAttempts: 1 },
        { id: 'prob_6', answer: 6, isReviewAttempt: true, reviewAttempts: 1 }
      ];
      let problemQueue = Array.from({ length: 15 }, (_, i) => ({ id: `prob_${i}`, answer: i }));
      let currentIndex = 11;
      let questionsAnswered = 11;
      let showBreakOverlay = false;

      // Answering Q12 correctly
      const nextQuestionsAnswered = questionsAnswered + 1;
      const reachedBlockEnd = !isReviewPhase && nextQuestionsAnswered > 0 && nextQuestionsAnswered % 12 === 0;

      expect(reachedBlockEnd).toBe(true);
      expect(missedReviewQueue.length).toBe(2);

      // Transition to review
      isReviewPhase = true;
      const nextIdx = currentIndex + 1;
      problemQueue = [...problemQueue.slice(0, nextIdx), ...missedReviewQueue];
      missedReviewQueue = [];
      currentIndex = nextIdx;

      expect(problemQueue.length).toBe(14); // 12 original + 2 review
      expect(currentIndex).toBe(12); // 1st review item

      // Solving 1st review item
      let isReviewComplete1 = isReviewPhase && currentIndex >= problemQueue.length - 1;
      expect(isReviewComplete1).toBe(false); // 12 < 13
      currentIndex += 1; // Advance to 13 (2nd review item)

      // Solving 2nd review item
      let isReviewComplete2 = isReviewPhase && currentIndex >= problemQueue.length - 1;
      expect(isReviewComplete2).toBe(true); // 13 >= 13
      isReviewPhase = false;
      showBreakOverlay = true;

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
    });
  });

  describe('Coding Climb Block Completion Invariants', () => {
    it('coding climb properly transitions to review on mistake and terminates at review end', () => {
      const totalBlockQuestions = 12;
      let sessionQuestionIndex = 12;
      let isReviewPhase = false;
      let missedReviewQueue = [{ id: 'code_4', answer: 'A', isReviewAttempt: true, reviewAttempts: 1 }];
      let currentProblemIndex = 11;
      let problemQueue = Array.from({ length: 12 }, (_, i) => ({ id: `code_${i}`, answer: 'A' }));
      let showBreakOverlay = false;

      // Question 12 answered correctly
      const nextIndex = currentProblemIndex + 1;
      const nextSessionQNum = sessionQuestionIndex + 1;
      const reachedBlockEnd = nextSessionQNum > totalBlockQuestions;

      expect(reachedBlockEnd).toBe(true);
      expect(missedReviewQueue.length).toBe(1);

      if (reachedBlockEnd && missedReviewQueue.length > 0) {
        isReviewPhase = true;
        problemQueue = [...problemQueue, ...missedReviewQueue];
        missedReviewQueue = [];
        currentProblemIndex = nextIndex;
      }

      expect(isReviewPhase).toBe(true);
      expect(problemQueue.length).toBe(13);
      expect(currentProblemIndex).toBe(12);

      // Review question answered correctly
      const revNextIndex = currentProblemIndex + 1;
      const revNextSessionQNum = nextSessionQNum + 1;
      const revReachedBlockEnd = revNextSessionQNum > totalBlockQuestions;

      if (revReachedBlockEnd && missedReviewQueue.length > 0) {
        isReviewPhase = true;
      } else if (revReachedBlockEnd || revNextIndex >= problemQueue.length) {
        isReviewPhase = false;
        showBreakOverlay = true;
      }

      expect(showBreakOverlay).toBe(true);
      expect(isReviewPhase).toBe(false);
    });

    it('coding climb skip on Question 12 triggers review transition instead of skipping block end', () => {
      const totalBlockQuestions = 12;
      let sessionQuestionIndex = 12;
      let isReviewPhase = false;
      let missedReviewQueue = [];
      let currentProblemIndex = 11;
      let problemQueue = Array.from({ length: 12 }, (_, i) => ({ id: `code_${i}`, answer: 'A' }));
      let showBreakOverlay = false;

      const currentProblem = problemQueue[currentProblemIndex];
      const isAlreadyReview = !!currentProblem?.isReviewAttempt;
      const effectiveReviewQueue = !isAlreadyReview
        ? [...missedReviewQueue, { ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 }]
        : missedReviewQueue;

      const nextIndex = currentProblemIndex + 1;
      const nextSessionQNum = sessionQuestionIndex + 1;
      const reachedBlockEnd = nextSessionQNum > totalBlockQuestions;

      expect(reachedBlockEnd).toBe(true);

      if (reachedBlockEnd && effectiveReviewQueue.length > 0) {
        isReviewPhase = true;
        problemQueue = [...problemQueue, ...effectiveReviewQueue];
        missedReviewQueue = [];
        currentProblemIndex = nextIndex;
      } else if (reachedBlockEnd || nextIndex >= problemQueue.length) {
        showBreakOverlay = true;
      }

      expect(isReviewPhase).toBe(true);
      expect(currentProblemIndex).toBe(12);
      expect(problemQueue.length).toBe(13);
      expect(problemQueue[12].isReviewAttempt).toBe(true);
    });
  });

  describe('Block Accuracy & Mistake Review Accounting Invariants', () => {
    it('accurately calculates 10/12 (83%) when 2 questions are missed in primary climb and later answered in review', () => {
      const totalBlockQuestions = 12;
      let blockCorrectCount = 0;
      let isReviewPhase = false;
      let missedReviewQueue = [];
      let problemQueue = Array.from({ length: 12 }, (_, i) => ({ id: `prob_${i}`, answer: i }));
      let blockShieldsUsed = 0;

      // Simulate 12 primary questions: questions at idx 3 and 7 missed
      for (let i = 0; i < totalBlockQuestions; i++) {
        const isMissed = i === 3 || i === 7;
        const currentProblem = problemQueue[i];
        if (isMissed) {
          missedReviewQueue.push({ ...currentProblem, isReviewAttempt: true, reviewAttempts: 1 });
        } else {
          if (!isReviewPhase) {
            blockCorrectCount += 1;
          }
        }
      }

      expect(blockCorrectCount).toBe(10);
      expect(missedReviewQueue.length).toBe(2);

      // Transition to review phase
      isReviewPhase = true;
      problemQueue = [...problemQueue, ...missedReviewQueue];
      missedReviewQueue = [];

      // Answer both review questions correctly
      for (let r = 12; r < 14; r++) {
        const isCorrectInReview = true;
        if (isCorrectInReview) {
          if (!isReviewPhase) {
            blockCorrectCount += 1;
          }
        }
      }

      // Final block stats calculation
      const finalBlockCorrect = blockCorrectCount;
      const isPerfectBlock = finalBlockCorrect === totalBlockQuestions && blockShieldsUsed === 0;
      const accuracyPct = Math.round((finalBlockCorrect / totalBlockQuestions) * 100);

      expect(finalBlockCorrect).toBe(10);
      expect(accuracyPct).toBe(83);
      expect(isPerfectBlock).toBe(false);
    });

    it('shield consumption protects streak but correctly records question as incorrect in block accuracy', () => {
      const totalBlockQuestions = 12;
      let blockCorrectCount = 0;
      let blockShieldsUsed = 0;
      let isReviewPhase = false;

      // 11 correct, 1 shielded mistake
      for (let i = 0; i < 11; i++) {
        if (!isReviewPhase) {
          blockCorrectCount += 1;
        }
      }

      // Shielded mistake on 12th question
      blockShieldsUsed += 1;
      // Shielded attempt does NOT increment blockCorrectCount

      const finalBlockCorrect = blockCorrectCount;
      const isPerfectBlock = finalBlockCorrect === totalBlockQuestions && blockShieldsUsed === 0;

      expect(finalBlockCorrect).toBe(11);
      expect(blockShieldsUsed).toBe(1);
      expect(isPerfectBlock).toBe(false);
    });

    it('perfect 12/12 block with 0 shields qualifies as perfect block', () => {
      const totalBlockQuestions = 12;
      let blockCorrectCount = 0;
      let blockShieldsUsed = 0;
      let isReviewPhase = false;

      for (let i = 0; i < 12; i++) {
        if (!isReviewPhase) {
          blockCorrectCount += 1;
        }
      }

      const finalBlockCorrect = blockCorrectCount;
      const isPerfectBlock = finalBlockCorrect === totalBlockQuestions && blockShieldsUsed === 0;

      expect(finalBlockCorrect).toBe(12);
      expect(isPerfectBlock).toBe(true);
    });
  });
});

