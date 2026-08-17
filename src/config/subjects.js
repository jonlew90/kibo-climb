export const SUBJECTS_CONFIG = {
  math: {
    id: 'math',
    name: 'Math',
    icon: '🔢',
    COMPETENCE_RANK_TIERS: [
      { min: 0, max: 1199, tier: 1, name: 'Meadow Scout', location: 'Sunny Meadow' },
      { min: 1200, max: 1399, tier: 2, name: 'Trail Navigator', location: 'Forest Trail' },
      { min: 1400, max: 1599, tier: 3, name: 'River Mathlete', location: 'Multiplication River' },
      { min: 1600, max: 1799, tier: 4, name: 'Canyon Strategist', location: 'Factor Canyon' },
      { min: 1800, max: 1999, tier: 5, name: 'Falls Decimalist', location: 'Division Falls' },
      { min: 2000, max: 2199, tier: 6, name: 'Ridge Divisionist', location: 'Boulder Ridge' },
      { min: 2200, max: 2399, tier: 7, name: 'Fraction Specialist', location: 'Fraction Falls' },
      { min: 2400, max: 9999, tier: 8, name: 'Kibo Summit Legend', location: 'Mount Kibo Summit' }
    ],
    getCompetenceDescription: (rating = 1000, totalProblemsSolved = 0) => {
      if (totalProblemsSolved < 15) {
        return 'Calibrating baseline... Kibo is actively measuring initial speed and accuracy across math topics to pinpoint exact skill placement.';
      }

      const numRating = Number(rating) || 1000;
      if (numRating < 1200) return 'Mastering single-digit addition, subtraction, making-10s regrouping, and foundational number sense. (K–Grade 2)';
      if (numRating < 1400) return 'Building core multiplication fluency (0s–5s), 5s clock tricks, and quarter-hour analog time reading. (Grade 3)';
      if (numRating < 1600) return 'Mastering advanced multiplication tables (6s–9s), 9s finger shortcuts, coin counting, and elapsed time jumps. (Grade 3–4)';
      if (numRating < 1800) return 'Executing multi-step division, fraction foundations (equal parts, simple equivalents), and fact family relationships. (Grade 4–5)';
      if (numRating < 2000) return 'Calculating money decimals ($1.00 bridge & change under $1.00), general decimal addition/subtraction, and divisibility rules. (Grade 4–5)';
      if (numRating < 2200) return 'Mastering multi-digit mental arithmetic, long division (e.g. 168 ÷ 7), and left-to-right tens addition strategies. (Grade 5–6)';
      if (numRating < 2400) return 'Solving fraction reduction to lowest terms, fraction multiplication/division (× / ÷), percentages, LCM, GCF, and order of operations (PEMDAS). (Grade 6–7)';
      return 'Demonstrating peak summit mastery in 2-step pre-algebra equations (3x + 5 = 20), signed negative numbers (-/+), exponents (2⁴), square roots (√81), and PEMDAS. (Grade 7–8+)';
    },
    SKILL_STRANDS: [
      { tier: 1, id: 'sums_differences_20', name: 'Sums & Differences to 20 (Making 10s)', ratingBand: { min: 0, max: 1199 }, probeTargetTier: 3 },
      { tier: 2, id: 'multiplication_0_5', name: 'Multiplication Foundations (0s–5s) & Clock Math', ratingBand: { min: 1200, max: 1399 }, probeTargetTier: 4 },
      { tier: 3, id: 'advanced_multiplication_time', name: 'Advanced Multiplication (6s–9s) & Coins', ratingBand: { min: 1400, max: 1599 }, probeTargetTier: 5 },
      { tier: 4, id: 'multi_digit_11s', name: 'Multi-Digit Tens & 11s Split Shortcut', ratingBand: { min: 1600, max: 1799 }, probeTargetTier: 6 },
      { tier: 5, id: 'money_decimals', name: 'Money Decimals & Decimal Arithmetic', ratingBand: { min: 1800, max: 1999 }, probeTargetTier: 7 },
      { tier: 6, id: 'long_division_time', name: 'Explicit Long Division & Elapsed Time', ratingBand: { min: 2000, max: 2199 }, probeTargetTier: 8 },
      { tier: 7, id: 'fractions_lcm_gcf', name: 'Fraction Reduction, × / ÷, %, LCM & GCF', ratingBand: { min: 2200, max: 2399 }, probeTargetTier: 8 },
      { tier: 8, id: 'prealgebra_signed_exponents', name: '2-Step Linear Equations, Signed (+/-) & Exponents', ratingBand: { min: 2400, max: 9999 }, probeTargetTier: 8 }
    ],
    MASTERY_THRESHOLDS: [
      { threshold: 1150, skillName: 'Sums & Differences to 20' },
      { threshold: 1300, skillName: 'Multiplication Facts (0s-12s)' },
      { threshold: 1450, skillName: 'Money & Elapsed Time' },
      { threshold: 1600, skillName: 'Multi-Digit Mental Math' },
      { threshold: 1700, skillName: 'Number Theory & Logic' },
      { threshold: 1750, skillName: 'Exponents, Roots & PEMDAS' }
    ],
    DOMAIN_DEFINITIONS: [
      { id: 'add_sub', name: 'Addition & Subtraction', icon: '🌱', subtitle: 'Sums & Differences to 20 (Making 10s)', minUnlockRating: 0, tiers: [1], defaultAcc: 90, defaultSpeed: 1.8 },
      { id: 'mult_foundations', name: 'Multiplication Foundations', icon: '🌲', subtitle: 'Multiplication Facts (0s–5s) & Clock Math', minUnlockRating: 1200, tiers: [2], defaultAcc: 85, defaultSpeed: 2.2 },
      { id: 'adv_multiplication', name: 'Advanced Multiplication & Coins', icon: '🌊', subtitle: 'Multiplication Facts (6s–9s) & Coin Counting', minUnlockRating: 1400, tiers: [3], defaultAcc: 80, defaultSpeed: 2.5 },
      { id: 'multi_digit', name: 'Multi-Digit Mental Math', icon: '⛰️', subtitle: 'Multi-Digit Tens & 11s Split Shortcut', minUnlockRating: 1600, tiers: [4], defaultAcc: 75, defaultSpeed: 3.0 },
      { id: 'decimals_division', name: 'Decimals & Division', icon: '🏔️', subtitle: 'Money Decimals & Explicit Long Division', minUnlockRating: 1800, tiers: [5, 6], defaultAcc: 70, defaultSpeed: 4.0 },
      { id: 'fractions_prealgebra', name: 'Fractions & Pre-Algebra', icon: '🌋', subtitle: 'Fractions, Equations, & Exponents', minUnlockRating: 2200, tiers: [7, 8], defaultAcc: 65, defaultSpeed: 5.0 }
    ]
  },
  words: {
    id: 'words',
    name: 'Words',
    icon: '📚',
    COMPETENCE_RANK_TIERS: [
      { min: 0, max: 1199, tier: 1, name: 'Letter Scout', location: 'Alphabet Meadow' },
      { min: 1200, max: 1399, tier: 2, name: 'Word Builder', location: 'Phonics Forest' },
      { min: 1400, max: 1599, tier: 3, name: 'Spelling Master', location: 'Vocab Valley' },
      { min: 1600, max: 9999, tier: 4, name: 'Grammar Legend', location: 'Syntax Summit' }
    ],
    getCompetenceDescription: (rating = 1000, totalProblemsSolved = 0) => {
      if (totalProblemsSolved < 15) return 'Calibrating baseline for Words...';
      const numRating = Number(rating) || 1000;
      if (numRating < 1200) return 'Mastering alphabet and basic phonics.';
      if (numRating < 1400) return 'Building sight words and simple spelling.';
      if (numRating < 1600) return 'Expanding vocabulary and compound words.';
      return 'Mastering complex spelling and grammar rules.';
    },
    SKILL_STRANDS: [
      { tier: 1, id: 'letters', name: 'Alphabet & Phonics', ratingBand: { min: 0, max: 1199 }, probeTargetTier: 2 },
      { tier: 2, id: 'sight_words', name: 'Sight Words & Basic Spelling', ratingBand: { min: 1200, max: 1399 }, probeTargetTier: 3 },
      { tier: 3, id: 'vocab', name: 'Vocabulary & Compound Words', ratingBand: { min: 1400, max: 1599 }, probeTargetTier: 4 },
      { tier: 4, id: 'grammar', name: 'Complex Spelling & Grammar', ratingBand: { min: 1600, max: 9999 }, probeTargetTier: 4 }
    ],
    MASTERY_THRESHOLDS: [
      { threshold: 1150, skillName: 'Alphabet & Phonics' },
      { threshold: 1300, skillName: 'Sight Words' },
      { threshold: 1450, skillName: 'Vocabulary' }
    ],
    DOMAIN_DEFINITIONS: [
      { id: 'letters', name: 'Letters', icon: '🅰️', subtitle: 'Alphabet', minUnlockRating: 0, tiers: [1], defaultAcc: 90, defaultSpeed: 2.0 },
      { id: 'spelling', name: 'Spelling', icon: '📝', subtitle: 'Sight Words', minUnlockRating: 1200, tiers: [2], defaultAcc: 85, defaultSpeed: 3.0 },
      { id: 'grammar', name: 'Grammar', icon: '📚', subtitle: 'Sentence Structure', minUnlockRating: 1400, tiers: [3, 4], defaultAcc: 80, defaultSpeed: 4.0 }
    ]
  }
};
