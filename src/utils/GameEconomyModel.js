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
    return 'Building foundational counting, single-digit addition, and number sense.';
  }
  if (rating <= 1090) {
    return 'Developing confidence with double-digit mental math, place value, and skip counting.';
  }
  if (rating <= 1290) {
    return 'Mastering regrouping in addition/subtraction and introducing basic multiplication facts.';
  }
  if (rating <= 1490) {
    return 'Solving multi-digit operations, multi-step word problems, and intro fraction concepts.';
  }
  if (rating <= 1690) {
    return 'Handling unlike fractions, decimals, basic order of operations, and pre-algebra concepts.';
  }
  return 'Demonstrating advanced problem-solving, complex fractions, and pre-algebraic reasoning.';
}
