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
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1100;
        break;
      case 'rank_1300':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1300;
        break;
      case 'rank_1500':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1500;
        break;
      case 'rank_1700':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1700;
        break;

      case 'master_addition':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1150;
        break;
      case 'master_multiplication':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1450;
        break;
      case 'master_time_money':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || 1000) >= 1750;
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
        if (
          (userState.blockRatingGain || 0) >= 40 ||
          (userState.competenceRankGain || 0) >= 40 ||
          (lastSprintResult?.rankGain || 0) >= 40
        ) {
          unlocked = true;
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
        break;

      default:
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(badge);
    }
  });

  if (newlyUnlocked.length > 0) {
    const updatedUnlocked = Array.from(new Set([...currentUnlocked, ...newlyUnlocked.map((b) => b.id)]));
    const userData = storageService.getUserData();
    userData.unlockedBadges = updatedUnlocked;
    storageService.saveUserData(userData);
  }

  return newlyUnlocked;
}
