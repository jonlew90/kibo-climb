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

      case 'perfect_sprint':
        if (lastSprintResult) {
          const accuracy = Number(lastSprintResult.accuracyPct ?? lastSprintResult.accuracyPercentage ?? 0);
          if (accuracy === 100) {
            unlocked = true;
          }
        }
        break;

      case 'speed_demon':
        if (lastSprintResult) {
          const sprintTierId = Number(lastSprintResult.tier || lastSprintResult.tierId || userState.tier || 1);
          const tierMeta = CURRICULUM_TIERS.find((t) => t.tier === sprintTierId) || CURRICULUM_TIERS[0];
          const targetSpeed = tierMeta?.targetSpeedPerQuestion || 2.0;

          const totalQuestions = Number(lastSprintResult.totalQuestions || lastSprintResult.answers?.length || 0);
          const durationSeconds = Number(lastSprintResult.totalTimeSec ?? lastSprintResult.durationInSeconds ?? 0);
          const accuracy = Number(lastSprintResult.accuracyPct ?? lastSprintResult.accuracyPercentage ?? 0);

          const avgTimePerQuestion = totalQuestions > 0
            ? (durationSeconds / totalQuestions)
            : Number(lastSprintResult.avgLatencySec) || 999;

          // Qualifies if accuracy >= 90% and average speed meets or beats THAT tier's dynamic target speed
          const qualifiesForSpeedBadge =
            totalQuestions >= 10 &&
            avgTimePerQuestion <= targetSpeed &&
            accuracy >= 90;

          if (qualifiesForSpeedBadge) {
            unlocked = true;
          }
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
