// Game Economy Model & Competence Rating Tier Scale for Kibo Climb Math

export const INITIAL_COMPETENCE_RATING = 1000;

export const COMPETENCE_RANK_TIERS = [
  { min: 700, max: 890, name: 'Base Climber' },
  { min: 900, max: 1090, name: 'Trail Scout' },
  { min: 1100, max: 1290, name: 'Beginner Mathlete' },
  { min: 1300, max: 1490, name: 'Peak Navigator' },
  { min: 1500, max: 1690, name: 'Summit Master' },
  { min: 1700, max: 9999, name: 'Kibo Legend' }
];

export function getCompetenceRankTier(rating = 1000) {
  const tier = COMPETENCE_RANK_TIERS.find(t => rating >= t.min && rating <= t.max);
  return tier ? tier.name : (rating >= 1700 ? 'Kibo Legend' : 'Base Climber');
}

export function getCompetenceDescription(rating = 1000, totalProblemsSolved = 0) {
  if (totalProblemsSolved < 15) {
    return 'Calibrating... Initial skill baseline is currently being established.';
  }

  if (rating < 900) {
    return 'Building foundational single-digit addition, subtraction, and number sense.';
  }
  if (rating <= 1090) {
    return 'Developing confidence with double-digit mental math, place value, and skip counting.';
  }
  if (rating <= 1290) {
    return 'Mastering regrouping in addition/subtraction and core multiplication facts (0s-12s).';
  }
  if (rating <= 1490) {
    return 'Solving inverse division facts, coin change calculations, and elapsed time jumps.';
  }
  if (rating <= 1690) {
    return 'Handling multi-digit mental arithmetic, LCM/GCF number theory, and divisibility rules.';
  }
  return 'Demonstrating summit mastery in mental calculation speed, exponents, square roots, and PEMDAS order of operations.';
}
