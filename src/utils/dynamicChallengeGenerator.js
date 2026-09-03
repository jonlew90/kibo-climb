// Dynamic Challenge Generator for Parental Gate Secondary Fallback
// Generates COPPA-compliant word-form arithmetic and adult comprehension challenges.

/**
 * Generates a random integer between min and max inclusive.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const dynamicChallengeGenerator = {
  /**
   * Numeric multi-step math problem (e.g. "What is 16 × 6 + 15?").
   */
  generateWordMathChallenge() {
    const a = getRandomInt(12, 19);
    const b = getRandomInt(4, 8);
    const addVal = getRandomInt(11, 29);
    const correctAnswer = a * b + addVal;

    const question = `What is ${a} × ${b} + ${addVal}?`;

    return {
      type: 'word_math',
      title: 'Challenge Question',
      instruction: 'Enter the numeric answer to continue:',
      question,
      correctAnswer: String(correctAnswer),
      options: [String(correctAnswer)]
    };
  },

  /**
   * Adult general knowledge / literacy challenge using standard digits.
   */
  generateAdultLiteracyChallenge() {
    const currentYear = new Date().getFullYear();
    const age = getRandomInt(32, 54);
    const birthYear = currentYear - age;

    const question = `If an adult is ${age} years old today, what year were they born?`;

    return {
      type: 'birth_year',
      title: 'Challenge Question',
      instruction: 'Enter the 4-digit year to continue:',
      question,
      correctAnswer: String(birthYear),
      options: [String(birthYear)]
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
