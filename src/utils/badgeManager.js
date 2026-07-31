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

      case 'rank_200':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || (tier * 100)) >= 200;
        break;
      case 'rank_500':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || (tier * 100)) >= 500;
        break;
      case 'rank_1000':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || (tier * 100)) >= 1000;
        break;

      case 'master_addition':
      case 'master_multiplication':
      case 'master_time_money':
        unlocked = (userState.competenceRank || userState.adaptiveCompetenceRating || (tier * 100)) >= 300;
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
        if (userState.maxSessionStreak >= 20 || lastSprintResult?.correctStreak >= 20) {
          unlocked = true;
        }
        break;

      case 'competence_surge':
        if ((userState.competenceRankGain || 0) >= 50 || (userState.competenceRank || 1000) >= 1050) {
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
