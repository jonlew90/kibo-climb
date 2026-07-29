// Badge Manager Engine for Kibo Math
import { BADGES_CATALOG } from '../data/badges';
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

      case 'master_9s':
        unlocked = tier >= 4;
        break;
      case 'clock_master':
        unlocked = tier >= 6;
        break;
      case 'coin_counter':
        unlocked = tier >= 6;
        break;
      case 'summit_sync':
        unlocked = tier >= 7;
        break;
      case 'exponent_peak':
        unlocked = tier >= 8;
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
          const totalQuestions = Number(lastSprintResult.totalQuestions || lastSprintResult.answers?.length || 0);
          const durationSeconds = Number(lastSprintResult.totalTimeSec ?? lastSprintResult.durationInSeconds ?? 0);
          const accuracy = Number(lastSprintResult.accuracyPct ?? lastSprintResult.accuracyPercentage ?? 0);

          const avgTimePerQuestion = totalQuestions > 0
            ? (durationSeconds / totalQuestions)
            : Number(lastSprintResult.avgLatencySec) || 999;

          // STRICT RULE: Must be a full sprint (>= 20 questions), avg time <= 2.0s, and >= 90% accuracy
          const qualifiesForSpeedBadge =
            totalQuestions >= 20 &&
            avgTimePerQuestion <= 2.0 &&
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
