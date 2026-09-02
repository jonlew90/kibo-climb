// Dynamic Challenge Generator for Parental Gate Secondary Fallback
// Generates COPPA-compliant word-form arithmetic and adult comprehension challenges.

/**
 * Generates a random integer between min and max inclusive.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
];

const TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

function numberToWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const rem = n % 10;
    return rem === 0 ? TENS[Math.floor(n / 10)] : `${TENS[Math.floor(n / 10)]}-${ONES[rem]}`;
  }
  if (n < 1000) {
    const rem = n % 100;
    return rem === 0 
      ? `${ONES[Math.floor(n / 100)]} hundred`
      : `${ONES[Math.floor(n / 100)]} hundred and ${numberToWords(rem)}`;
  }
  return String(n);
}

export const dynamicChallengeGenerator = {
  /**
   * Worded multi-step math problem (e.g. "What is seventeen multiplied by six plus twelve?").
   */
  generateWordMathChallenge() {
    const a = getRandomInt(12, 19);
    const b = getRandomInt(4, 8);
    const addVal = getRandomInt(11, 29);
    const correctAnswer = a * b + addVal;

    const wordsA = numberToWords(a);
    const wordsB = numberToWords(b);
    const wordsAdd = numberToWords(addVal);

    const question = `What is ${wordsA} times ${wordsB} plus ${wordsAdd}?`;

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
   * Adult general knowledge / literacy challenge.
   */
  generateAdultLiteracyChallenge() {
    const currentYear = new Date().getFullYear();
    const age = getRandomInt(32, 54);
    const birthYear = currentYear - age;

    const question = `If an adult is ${numberToWords(age)} years old today, what year were they born?`;

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
