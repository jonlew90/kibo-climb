// Generates deduplicated arithmetic problems with commutative protection for Kibo Math

import { generateTierProblem, getNormalizedProblemKey } from './curriculum';

export function generateProblems(count = 20, tier = 1, practiceQueue = []) {
  const problems = [];
  const seenKeys = new Set();

  const maxPracticeToInject = Math.min(6, practiceQueue.length);

  // 1. Inject queued practice items first
  for (let i = 0; i < maxPracticeToInject; i++) {
    const item = practiceQueue[i];
    if (item && item.num1 !== undefined) {
      const normKey = getNormalizedProblemKey(item);
      if (!seenKeys.has(normKey)) {
        seenKeys.add(normKey);
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
  }

  // 2. Fill remaining set up to `count` with deduplicated Tier problems
  const remainingCount = count - problems.length;

  for (let i = 0; i < remainingCount; i++) {
    let probData;
    let normKey;
    let attempts = 0;

    do {
      probData = generateTierProblem(tier);
      normKey = getNormalizedProblemKey(probData);
      attempts++;
    } while (seenKeys.has(normKey) && attempts < 60);

    seenKeys.add(normKey);

    problems.push({
      id: `gen-${i + 1}-${Date.now()}`,
      ...probData,
      isPracticeItem: false
    });
  }

  return problems;
}

// Retain legacy export alias
export const generate20Problems = (tier = 1, practiceQueue = []) => generateProblems(20, tier, practiceQueue);
