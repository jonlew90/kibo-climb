// Skill Tree Configuration & Rating Band Mapping for Kibo Climb Math

export const SKILL_STRANDS = [
  {
    tier: 1,
    id: 'sums_differences_20',
    name: 'Sums & Differences to 20 (Making 10s)',
    ratingBand: { min: 0, max: 1199 },
    probeTargetTier: 3
  },
  {
    tier: 2,
    id: 'multiplication_0_5',
    name: 'Multiplication Foundations (0s–5s) & Clock Math',
    ratingBand: { min: 1200, max: 1399 },
    probeTargetTier: 4
  },
  {
    tier: 3,
    id: 'advanced_multiplication_time',
    name: 'Advanced Multiplication (6s–9s) & Coins',
    ratingBand: { min: 1400, max: 1599 },
    probeTargetTier: 5
  },
  {
    tier: 4,
    id: 'multi_digit_11s',
    name: 'Multi-Digit Tens & 11s Split Shortcut',
    ratingBand: { min: 1600, max: 1799 },
    probeTargetTier: 6
  },
  {
    tier: 5,
    id: 'money_decimals',
    name: 'Money Decimals & Decimal Arithmetic',
    ratingBand: { min: 1800, max: 1999 },
    probeTargetTier: 7
  },
  {
    tier: 6,
    id: 'long_division_time',
    name: 'Explicit Long Division & Elapsed Time',
    ratingBand: { min: 2000, max: 2199 },
    probeTargetTier: 8
  },
  {
    tier: 7,
    id: 'fractions_lcm_gcf',
    name: 'Fraction Reduction, × / ÷, %, LCM & GCF',
    ratingBand: { min: 2200, max: 2399 },
    probeTargetTier: 8
  },
  {
    tier: 8,
    id: 'prealgebra_signed_exponents',
    name: '2-Step Linear Equations, Signed (+/-) & Exponents',
    ratingBand: { min: 2400, max: 9999 },
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
