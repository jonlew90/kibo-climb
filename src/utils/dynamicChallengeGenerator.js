// Dynamic Challenge Generator for Parental Gate Secondary Fallback
// Generates COPPA-compliant word-form arithmetic and adult comprehension challenges.

/**
 * Generates a random integer between min and max inclusive.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIGIT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'
];

export const dynamicChallengeGenerator = {
  /**
   * Quick single-step multiplication (times tables between 6 and 9).
   * Instant recall for adults (~1-2s), effective barrier for young kids.
   */
  generateWordMathChallenge() {
    const a = getRandomInt(6, 9);
    const b = getRandomInt(6, 9);
    const correctAnswer = a * b;

    const question = `What is ${a} × ${b}?`;

    return {
      type: 'word_math',
      title: 'Challenge Question',
      instruction: 'Enter the answer to continue:',
      question,
      correctAnswer: String(correctAnswer),
      options: [String(correctAnswer)]
    };
  },

  /**
   * Digit reading challenge ("Enter digits: Seven, Three, Eight").
   * Zero mental math, literate adults solve in 1 second.
   */
  generateAdultLiteracyChallenge() {
    const d1 = getRandomInt(1, 9);
    const d2 = getRandomInt(1, 9);
    const d3 = getRandomInt(1, 9);

    const question = `Enter the digits: ${DIGIT_WORDS[d1]}, ${DIGIT_WORDS[d2]}, ${DIGIT_WORDS[d3]}`;
    const correctAnswer = `${d1}${d2}${d3}`;

    return {
      type: 'digit_read',
      title: 'Challenge Question',
      instruction: 'Enter the 3 digits in order to continue:',
      question,
      correctAnswer,
      options: [correctAnswer]
    };
  },

  /**
   * Compatibility method for existing test suites.
   */
  generateMathChallenge() {
    return this.generateWordMathChallenge();
  },

  /**
   * Compatibility method for existing test suites.
   */
  generateOrderChallenge() {
    return this.generateAdultLiteracyChallenge();
  },

  /**
   * Generates a fresh random COPPA-hardened challenge.
   */
  generateChallenge() {
    return Math.random() > 0.5 
      ? this.generateWordMathChallenge() 
      : this.generateAdultLiteracyChallenge();
  }
};
