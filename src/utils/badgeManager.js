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

      case 'rank_1100':
        if (!isCalibrating) {
          unlocked = currentRating >= 1100 && (baselineRating <= 1100 || currentRating >= baselineRating + 50);
        }
        break;
      case 'rank_1300':
        if (!isCalibrating) {
          unlocked = currentRating >= 1300 && (baselineRating <= 1300 || currentRating >= baselineRating + 50);
        }
        break;
      case 'rank_1500':
        if (!isCalibrating) {
          unlocked = currentRating >= 1500 && (baselineRating <= 1500 || currentRating >= baselineRating + 50);
        }
        break;
      case 'rank_1700':
        if (!isCalibrating) {
          unlocked = currentRating >= 1700 && (baselineRating <= 1700 || currentRating >= baselineRating + 50);
        }
        break;

      case 'master_addition':
        if (!isCalibrating) {
          unlocked = currentRating >= 1150 && (baselineRating <= 1150 || currentRating >= baselineRating + 50);
        }
        break;
      case 'master_multiplication':
        if (!isCalibrating) {
          unlocked = currentRating >= 1450 && (baselineRating <= 1450 || currentRating >= baselineRating + 50);
        }
        break;
      case 'master_time_money':
        if (!isCalibrating) {
          unlocked = currentRating >= 1750 && (baselineRating <= 1750 || currentRating >= baselineRating + 50);
        }
        break;

      case 'sparks_100':
        unlocked = sparks >= 100;
        break;
      case 'fashionista':
        unlocked = unlockedItems.length >= 3;
        break;
      case 'shield_pro':
        unlocked = streakShields >= 2 || unlockedItems.includes('kibo_shield');
        break;

      case 'adaptive_streak_20':
        if (
          (userState.inSessionStreak || 0) >= 12 ||
          (userState.maxSessionStreak || 0) >= 12 ||
          (userState.cumulativeCorrectStreak || 0) >= 12 ||
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

      case 'streak_legend':
        if ((userState.cumulativeCorrectStreak || 0) >= 50 || (userState.personalRecords?.highestCorrectStreak || 0) >= 50) {
          unlocked = true;
        }
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
