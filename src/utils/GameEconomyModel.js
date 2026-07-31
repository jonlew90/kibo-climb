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
