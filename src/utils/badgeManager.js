// Badge Manager Engine for Kibo Math
import { BADGES_CATALOG } from '../data/badges';
import { CURRICULUM_TIERS } from './curriculum';
import { storageService } from '../services/storageService';

export function evaluateBadges(userState, lastSprintResult = null) {
  const currentUnlocked = new Set(userState.unlockedBadges || []);
  const newlyUnlocked = [];

  const {
    streak = 0,
    tier = 1,
    sparks = 0,
    unlockedItems = [],
    streakShields = 1
  } = userState;

  const totalSolved = userState.totalProblemsSolved || 0;
  const isCalibrating = totalSolved < 15;
  const currentRating = userState.competenceRank || userState.adaptiveCompetenceRating || 1000;
  const baselineRating = userState.baselineRating || 1000;

  BADGES_CATALOG.forEach((badge) => {
    if (currentUnlocked.has(badge.id)) return;

    let unlocked = false;

    switch (badge.id) {
      case 'streak_3':
        unlocked = streak >= 3;
        break;
      case 'streak_7':
        unlocked = streak >= 7;
        break;
      case 'streak_30':
        unlocked = streak >= 30;
        break;

      // CURRICULUM RANK & TIER BADGES
      case 'rank_tier1':
      case 'rank_1100':
        if (!isCalibrating) {
          unlocked = currentRating >= 1000;
        }
        break;
      case 'rank_tier2':
      case 'rank_1300':
        if (!isCalibrating) {
          unlocked = currentRating >= 1200;
        }
        break;
      case 'rank_tier3':
        if (!isCalibrating) {
          unlocked = currentRating >= 1400;
        }
        break;
      case 'rank_tier4':
      case 'rank_1500':
        if (!isCalibrating) {
          unlocked = currentRating >= 1600;
        }
        break;
      case 'rank_tier5':
        if (!isCalibrating) {
          unlocked = currentRating >= 1800;
        }
        break;
      case 'rank_tier6':
      case 'rank_1700':
        if (!isCalibrating) {
          unlocked = currentRating >= 2000;
        }
        break;
      case 'rank_tier7':
        if (!isCalibrating) {
          unlocked = currentRating >= 2200;
        }
        break;
      case 'rank_tier8':
        if (!isCalibrating) {
          unlocked = currentRating >= 2400;
        }
        break;

      // DOMAIN MASTERY BADGES (Prerequisite domain badges unlock automatically post-calibration)
      case 'master_addition':
        if (!isCalibrating) {
          unlocked = currentRating >= 1000 && (totalSolved >= 15 || userState.lastProblemTier === 1 || userState.lastProblemTier === 2 || userState.lastProblemType === 'addition');
        }
        break;
      case 'master_multiplication':
        if (!isCalibrating) {
          unlocked = currentRating >= 1200 && (totalSolved >= 15 || userState.lastProblemTier === 3 || userState.lastProblemTier === 4 || userState.lastProblemType === 'multiplication');
        }
        break;
      case 'master_time_money':
        if (!isCalibrating) {
          unlocked = currentRating >= 1800 && (totalSolved >= 15 || userState.lastProblemTier === 5 || ['money', 'time'].includes(userState.lastProblemType));
        }
        break;
      case 'master_fractions':
        if (!isCalibrating) {
          unlocked = currentRating >= 2200 && (totalSolved >= 15 || userState.lastProblemTier === 7 || ['fraction', 'rational'].includes(userState.lastProblemType));
        }
        break;
      case 'master_prealgebra':
        if (!isCalibrating) {
          unlocked = currentRating >= 2400 && (userState.lastProblemTier === 8 || ['prealgebra', 'signed', 'exponent'].includes(userState.lastProblemType));
        }
        break;

      // WORKSHOP & SHOPPING BADGES
      case 'sparks_100':
        unlocked = sparks >= 100;
        break;
      case 'sparks_500':
        unlocked = sparks >= 500;
        break;
      case 'sparks_1000':
        unlocked = sparks >= 1000;
        break;
      case 'fashionista':
        unlocked = unlockedItems.length >= 3;
        break;
      case 'pet_owner':
        unlocked = (unlockedItems || []).some((id) => ['snowy_owl', 'alpine_fox', 'summit_husky', 'cosmic_dragon'].includes(id));
        break;
      case 'shield_pro':
        unlocked = streakShields >= 2 || (unlockedItems || []).includes('kibo_shield');
        break;

      // RESILIENCE, PROBE & SPEED BADGES
      case 'probe_master':
        unlocked = !!userState.hasMasteredProbe || !!lastSprintResult?.isProbeCorrect;
        break;

      case 'adaptive_streak_20':
        if (
          (userState.inSessionStreak || 0) >= 12 ||
          (lastSprintResult?.correctStreak || 0) >= 12
        ) {
          unlocked = true;
        }
        break;

      case 'competence_surge':
        if (!isCalibrating) {
          if (
            (userState.blockRatingGain || 0) >= 40 ||
            (userState.competenceRankGain || 0) >= 40 ||
            (lastSprintResult?.rankGain || 0) >= 40
          ) {
            unlocked = true;
          }
        }
        break;

      case 'speed_demon':
        if ((userState.sessionAverageTime && userState.sessionAverageTime < 5.0) || lastSprintResult?.averageTime < 5.0) {
          unlocked = true;
        }
        break;

      case 'flawless_execution':
        if ((userState.personalRecords?.mostPerfectSessions || 0) >= 3) {
          unlocked = true;
        }
        break;

      case 'flawless_10':
        if ((userState.personalRecords?.mostPerfectSessions || 0) >= 10) {
          unlocked = true;
        }
        break;

      case 'streak_legend':
        if ((userState.cumulativeCorrectStreak || 0) >= 50 || (userState.personalRecords?.highestCorrectStreak || 0) >= 50) {
          unlocked = true;
        }
        break;
      default:
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(badge);
    }
  });

  const updatedUnlocked = Array.from(new Set([...currentUnlocked, ...newlyUnlocked.map((b) => b.id)]));

  if (newlyUnlocked.length > 0) {
    const userData = storageService.getUserData();
    userData.unlockedBadges = updatedUnlocked;
    storageService.saveUserData(userData);
  }

  return { newlyUnlocked, updatedUnlocked };
}
