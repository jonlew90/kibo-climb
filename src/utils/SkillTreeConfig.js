// Skill Tree Configuration & Rating Band Mapping for Kibo Climb
import { SUBJECTS_CONFIG } from '../config/subjects.js';
import { getGradeLevelFromRating as getMathGradeLevel } from './mathCurriculum.js';
import { getGradeLevelFromRating as getWordsGradeLevel } from './wordsCurriculum.js';
import { getGradeLevelFromRating as getWorldGradeLevel } from './worldCurriculum.js';
import { getGradeLevelFromRating as getCodingGradeLevel } from './codingCurriculum.js';

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
export function getStrandForRating(rating = 1000, subjectId = 'math') {
  const config = SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math'];
  const strands = config.SKILL_STRANDS || [];
  const strand = strands.find(s => rating >= s.ratingBand.min && rating < s.ratingBand.max);
  return strand || strands[strands.length - 1];
}

/**
 * Returns higher target strand for probe questions.
 */
export function getProbeTargetTier(currentTier = 1, subjectId = 'math') {
  const config = SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math'];
  const strands = config.SKILL_STRANDS || [];
  const currentStrand = strands.find(s => s.tier === currentTier);
  return currentStrand ? currentStrand.probeTargetTier : Math.min(strands.length, currentTier + 2);
}

export function getSubjectStrands(subjectId = 'math') {
  return (SUBJECTS_CONFIG[subjectId] || SUBJECTS_CONFIG['math']).SKILL_STRANDS;
}

/**
 * Returns the grade level string for a subject and rating.
 */
export function getGradeLevelForSubject(rating = 1000, subjectId = 'math') {
  if (subjectId === 'words') return getWordsGradeLevel(rating);
  if (subjectId === 'world' || subjectId === 'geography') return getWorldGradeLevel(rating);
  if (subjectId === 'coding') return getCodingGradeLevel(rating);
  return getMathGradeLevel(rating);
}

export const getGradeLevelFromRating = getGradeLevelForSubject;

// Backward compatibility export
export const SKILL_STRANDS = SUBJECTS_CONFIG['math'].SKILL_STRANDS;

