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

export function getSubjectTierProgress(rating = 1000, subjectId = 'math') {
  const numRating = Number(rating) || 1000;
  const config = SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math'];
  const tiers = config.COMPETENCE_RANK_TIERS || [];
  const tierObj = getCompetenceTierObj(numRating, subjectId);

  // If at max summit tier (e.g. tier 8 or tier 5 for world)
  const isMaxTier = tierObj.max >= 9000 || tierObj.tier >= tiers.length;
  if (isMaxTier) {
    return {
      tier: tierObj.tier,
      totalTiers: tiers.length,
      tierName: tierObj.name,
      location: tierObj.location,
      progressPct: 100,
      currentPoints: numRating - tierObj.min,
      pointsToNext: 0,
      isMaxTier: true
    };
  }

  const tierSpan = Math.max(1, (tierObj.max - tierObj.min) + 1);
  const progressWithinTier = Math.max(0, Math.min(tierSpan, numRating - tierObj.min));
  const progressPct = Math.min(100, Math.max(0, Math.round((progressWithinTier / tierSpan) * 100)));
  const pointsToNext = Math.max(0, (tierObj.max + 1) - numRating);

  return {
    tier: tierObj.tier,
    totalTiers: tiers.length,
    tierName: tierObj.name,
    location: tierObj.location,
    progressPct,
    currentPoints: progressWithinTier,
    pointsToNext,
    isMaxTier: false
  };
}

// Backward compatibility export
export const COMPETENCE_RANK_TIERS = SUBJECTS_CONFIG['math'].COMPETENCE_RANK_TIERS;
