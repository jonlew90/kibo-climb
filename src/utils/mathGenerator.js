// Generates 20 arithmetic problems based on Tier (1, 2, 3) and practice queue items

export function generate20Problems(tier = 1, practiceQueue = []) {
  const problems = [];
  const maxPracticeToInject = Math.min(6, practiceQueue.length);
  const injectedIds = new Set();

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
        isPracticeItem: true
      });
      injectedIds.add(`${item.num1}${item.operatorSymbol}${item.num2}`);
    }
  }

  // 2. Fill remaining set up to 20 based on Tier
  const remainingCount = 20 - problems.length;

  for (let i = 0; i < remainingCount; i++) {
    let num1, num2, answer, operatorSymbol, type;

    if (tier === 1) {
      // Tier 1: Single-Digit Addition & Subtraction (1 to 9)
      type = Math.random() > 0.5 ? 'add' : 'sub';
      if (type === 'add') {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 + num2;
        operatorSymbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        operatorSymbol = '−';
      }
    } else if (tier === 2) {
      // Tier 2: Crossing the Tens (e.g. 8+7=15, 15-8=7)
      type = Math.random() > 0.5 ? 'add' : 'sub';
      if (type === 'add') {
        // sum between 11 and 20, crossing 10
        num1 = Math.floor(Math.random() * 5) + 5; // 5 to 9
        num2 = Math.floor(Math.random() * 5) + 6; // 6 to 10
        answer = num1 + num2;
        operatorSymbol = '+';
      } else {
        // minuend between 11 and 19
        num1 = Math.floor(Math.random() * 9) + 11; // 11 to 19
        num2 = Math.floor(Math.random() * 8) + 3;  // 3 to 10
        answer = num1 - num2;
        operatorSymbol = '−';
      }
    } else {
      // Tier 3: Multiplication Tables (2x, 5x, 10x, single-digit mul)
      type = 'mul';
      const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
      operatorSymbol = '×';
    }

    problems.push({
      id: `gen-${i + 1}-${Date.now()}`,
      num1,
      num2,
      operatorSymbol,
      type,
      answer,
      answerString: answer.toString(),
      isPracticeItem: false
    });
  }

  return problems;
}
