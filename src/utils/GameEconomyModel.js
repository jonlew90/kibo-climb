// Game Economy Model & Competence Rating Tier Scale for Kibo Climb
import { SUBJECTS_CONFIG } from '../config/subjects.js';

export const INITIAL_COMPETENCE_RATING = 1000;

export function getCompetenceTierObj(rating = 1000, subjectId = 'math') {
  const numRating = Number(rating) || 1000;
  const config = SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math'];
  const tiers = config.COMPETENCE_RANK_TIERS;

  const tier = tiers.find(t => numRating >= t.min && numRating <= t.max);
  return tier || tiers[0];
}

export function getCompetenceRankTier(rating = 1000, subjectId = 'math') {
  const tier = getCompetenceTierObj(rating, subjectId);
  return tier ? tier.name : 'Meadow Scout';
}

export function getCompetenceDescription(rating = 1000, totalProblemsSolved = 0, subjectId = 'math') {
  const config = SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math'];
  if (config.getCompetenceDescription) {
    return config.getCompetenceDescription(rating, totalProblemsSolved);
  }
  return 'Mastering new skills...';
}

// Backward compatibility export
export const COMPETENCE_RANK_TIERS = SUBJECTS_CONFIG['math'].COMPETENCE_RANK_TIERS;
