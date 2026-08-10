// Dynamic Challenge Generator for Parental Gate Secondary Fallback
// Generates adult literacy and math multiplication challenges with randomized options.

/**
 * Shuffles array elements in place using Fisher-Yates shuffle.
 */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a random integer between min and max inclusive.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const dynamicChallengeGenerator = {
  /**
   * Generates a dynamic multiplication task (e.g., 14 x 6).
   */
  generateMathChallenge() {
    const num1 = getRandomInt(12, 19);
    const num2 = getRandomInt(4, 9);
    const correctAnswer = num1 * num2;

    // Generate 3 unique, plausible distractor options
    const distractors = new Set();
    while (distractors.size < 3) {
      const offset = getRandomInt(-15, 15);
      const val = correctAnswer + offset;
      if (val !== correctAnswer && val > 0) {
        distractors.add(val);
      }
    }

    const options = shuffleArray([correctAnswer, ...Array.from(distractors)]);

    return {
      type: 'math',
      title: 'Parent Verification Challenge',
      instruction: `Solve the equation to verify:`,
      question: `${num1} × ${num2} = ?`,
      correctAnswer: String(correctAnswer),
      options: options.map(String)
    };
  },

  /**
   * Generates a dynamic number ordering task (e.g. "Select the numbers in ascending order" or largest number).
   */
  generateOrderChallenge() {
    // Generate 4 distinct 2-digit numbers
    const numbers = new Set();
    while (numbers.size < 4) {
      numbers.add(getRandomInt(11, 99));
    }
    const numList = Array.from(numbers);
    const sorted = [...numList].sort((a, b) => a - b);
    const largest = sorted[sorted.length - 1];

    const options = shuffleArray(numList);

    return {
      type: 'largest_number',
      title: 'Adult Literacy Challenge',
      instruction: 'Select the HIGHEST number:',
      question: `Which is the largest value?`,
      correctAnswer: String(largest),
      options: options.map(String)
    };
  },

  /**
   * Generates a fresh random challenge (alternating between math & order tasks).
   */
  generateChallenge() {
    return Math.random() > 0.5 ? this.generateMathChallenge() : this.generateOrderChallenge();
  }
};
