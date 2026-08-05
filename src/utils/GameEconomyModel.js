// Game Economy Model & Competence Rating Tier Scale for Kibo Climb Math

export const INITIAL_COMPETENCE_RATING = 1000;

export const COMPETENCE_RANK_TIERS = [
  { min: 0, max: 1199, tier: 1, name: 'Meadow Scout', location: 'Sunny Meadow' },
  { min: 1200, max: 1399, tier: 2, name: 'Trail Navigator', location: 'Forest Trail' },
  { min: 1400, max: 1599, tier: 3, name: 'River Mathlete', location: 'Multiplication River' },
  { min: 1600, max: 1799, tier: 4, name: 'Canyon Strategist', location: 'Factor Canyon' },
  { min: 1800, max: 1999, tier: 5, name: 'Falls Decimalist', location: 'Division Falls' },
  { min: 2000, max: 2199, tier: 6, name: 'Ridge Divisionist', location: 'Boulder Ridge' },
  { min: 2200, max: 2399, tier: 7, name: 'Fraction Specialist', location: 'Fraction Falls' },
  { min: 2400, max: 9999, tier: 8, name: 'Kibo Summit Legend', location: 'Mount Kibo Summit' }
];

export function getCompetenceRankTier(rating = 1000) {
  const numRating = Number(rating) || 1000;
  const tier = COMPETENCE_RANK_TIERS.find(t => numRating >= t.min && numRating <= t.max);
  return tier ? tier.name : 'Meadow Scout';
}

export function getCompetenceDescription(rating = 1000, totalProblemsSolved = 0) {
  if (totalProblemsSolved < 15) {
    return 'Calibrating baseline... Kibo is actively measuring initial speed and accuracy across math topics to pinpoint exact skill placement.';
  }

  const numRating = Number(rating) || 1000;
  if (numRating < 1200) {
    return 'Mastering single-digit addition, subtraction, making-10s regrouping, and foundational number sense. (K–Grade 2)';
  }
  if (numRating < 1400) {
    return 'Building core multiplication fluency (0s–5s), 5s clock tricks, and quarter-hour analog time reading. (Grade 3)';
  }
  if (numRating < 1600) {
    return 'Mastering advanced multiplication tables (6s–9s), 9s finger shortcuts, coin counting, and elapsed time jumps. (Grade 3–4)';
  }
  if (numRating < 1800) {
    return 'Executing multi-step division, fraction foundations (equal parts, simple equivalents), and fact family relationships. (Grade 4–5)';
  }
  if (numRating < 2000) {
    return 'Calculating money decimals ($1.00 bridge & change under $1.00), general decimal addition/subtraction, and divisibility rules. (Grade 4–5)';
  }
  if (numRating < 2200) {
    return 'Mastering multi-digit mental arithmetic, long division (e.g. 168 ÷ 7), and left-to-right tens addition strategies. (Grade 5–6)';
  }
  if (numRating < 2400) {
    return 'Solving fraction reduction to lowest terms, fraction multiplication/division (× / ÷), percentages, LCM, GCF, and order of operations (PEMDAS). (Grade 6–7)';
  }
  return 'Demonstrating peak summit mastery in 2-step pre-algebra equations (3x + 5 = 20), signed negative numbers (-/+), exponents (2⁴), square roots (√81), and PEMDAS. (Grade 7–8+)';
}
