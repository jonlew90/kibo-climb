// Skill Tree Configuration & Rating Band Mapping for Kibo Climb Math

export const SKILL_STRANDS = [
  {
    tier: 1,
    id: 'sums_differences_20',
    name: 'Sums & Differences to 20',
    ratingBand: { min: 1000, max: 1150 },
    probeTargetTier: 3
  },
  {
    tier: 2,
    id: 'multiplication_0_5',
    name: 'Multiplication Foundations (0s–5s)',
    ratingBand: { min: 1150, max: 1300 },
    probeTargetTier: 4
  },
  {
    tier: 3,
    id: 'advanced_multiplication_time',
    name: 'Advanced Multiplication (6s–9s) & Time Math',
    ratingBand: { min: 1300, max: 1450 },
    probeTargetTier: 5
  },
  {
    tier: 4,
    id: 'multi_digit_11s',
    name: 'Multi-Digit & 11s Trick',
    ratingBand: { min: 1450, max: 1600 },
    probeTargetTier: 6
  },
  {
    tier: 5,
    id: 'money_elapsed_time',
    name: 'Money & Elapsed Time Jumps',
    ratingBand: { min: 1600, max: 1750 },
    probeTargetTier: 7
  },
  {
    tier: 6,
    id: 'divisibility_fractions',
    name: 'Divisibility Rules & Equivalent Fractions',
    ratingBand: { min: 1750, max: 1900 },
    probeTargetTier: 8
  },
  {
    tier: 7,
    id: 'order_operations_percents',
    name: 'Order of Operations & Percentages',
    ratingBand: { min: 1900, max: 2100 },
    probeTargetTier: 8
  },
  {
    tier: 8,
    id: 'exponents_square_roots',
    name: 'Exponents, Square Roots & Pre-Algebra',
    ratingBand: { min: 2100, max: 2500 },
    probeTargetTier: 8
  }
];

/**
 * Returns dynamic K-factor based on user's total lifetime problems solved.
 * - Provisional Phase (<15): K = 60 (large initial jumps)
 * - Calibration Phase (15–49): K = 32
 * - Established Phase (>=50): K = 16 (fine-tuned adjustments)
 */
export function getKFactor(totalProblemsSolved = 0) {
  if (totalProblemsSolved < 15) return 60;
  if (totalProblemsSolved < 50) return 32;
  return 16;
}

/**
 * Gets corresponding skill strand for a given Competence Rating (Elo).
 */
export function getStrandForRating(rating = 1000) {
  const strand = SKILL_STRANDS.find(s => rating >= s.ratingBand.min && rating < s.ratingBand.max);
  return strand || SKILL_STRANDS[SKILL_STRANDS.length - 1];
}

/**
 * Returns higher target strand for probe questions.
 */
export function getProbeTargetTier(currentTier = 1) {
  const currentStrand = SKILL_STRANDS.find(s => s.tier === currentTier);
  return currentStrand ? currentStrand.probeTargetTier : Math.min(8, currentTier + 2);
}
