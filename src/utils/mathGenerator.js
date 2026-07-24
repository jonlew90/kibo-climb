// Generates arithmetic problems based on count (20 or 25 for Boss Challenge), Tier (1 through 8), and practice queue

import { generateTierProblem } from './curriculum';

export function generateProblems(count = 20, tier = 1, practiceQueue = []) {
  const problems = [];
  const maxPracticeToInject = Math.min(6, practiceQueue.length);

  // 1. Inject queued practice items first
  for (let i = 0; i < maxPracticeToInject; i++) {
    const item = practiceQueue[i];
    if (item && item.num1 !== undefined) {
      problems.push({
        id: `practice-${i + 1}-${Date.now()}`,
        num1: item.num1,
        num2: item.num2,
        operatorSymbol: item.operatorSymbol,
        type: item.type,
        answer: item.answer,
        answerString: item.answer.toString(),
        displayString: item.displayString || `${item.num1} ${item.operatorSymbol} ${item.num2}`,
        isPracticeItem: true
      });
    }
  }

  // 2. Fill remaining set up to `count` based on requested Tier (1 through 8)
  const remainingCount = count - problems.length;

  for (let i = 0; i < remainingCount; i++) {
    const probData = generateTierProblem(tier);

    problems.push({
      id: `gen-${i + 1}-${Date.now()}`,
      ...probData,
      isPracticeItem: false
    });
  }

  return problems;
}

// Retain legacy export alias for backwards compatibility
export const generate20Problems = (tier = 1, practiceQueue = []) => generateProblems(20, tier, practiceQueue);
