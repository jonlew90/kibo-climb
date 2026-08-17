// Badge Manager Engine for Kibo Math & Kibo Words
import { BADGES_CATALOG } from '../data/badges';
import { storageService } from '../services/storageService';

export function evaluateBadges(userState = {}, lastSprintResult = null) {
  const currentUnlocked = new Set(userState.unlockedBadges || []);
  const newlyUnlocked = [];

  const {
    streak = 0,
    sparks = 0,
    purchasedItemsCount = 0,
    purchasedRarities = [],
    hasBoughtGemsWithRealMoney = false,
    hasSetPersonalRecord = false,
    isNewSpeedRecord = false,
    perfectClimbsCount = 0,
    consecutivePerfectClimbsCount = 0,
    cumulativeCorrectStreak = 0,
    sprintHistory = [],
    personalRecords = {},
    subjectId = 'math'
  } = userState;

  // Derive perfect climbs count from all available sources
  const historyPerfectCount = Array.isArray(sprintHistory)
    ? sprintHistory.filter(
        (s) => s.accuracyPct === 100 || (s.correctCount === s.totalQuestions && s.totalQuestions > 0)
      ).length
    : 0;
  const currentSprintIsPerfect =
    lastSprintResult &&
    (lastSprintResult.accuracyPct === 100 ||
      (lastSprintResult.correctCount === lastSprintResult.totalQuestions && lastSprintResult.totalQuestions > 0));

  const effectivePerfectCount = Math.max(
    perfectClimbsCount,
    personalRecords?.mostPerfectSessions || 0,
    historyPerfectCount + (currentSprintIsPerfect && !sprintHistory.includes(lastSprintResult) ? 1 : 0)
  );

  // Derive consecutive perfect climbs count from sprintHistory
  let maxConsecutivePerfect = 0;
  let runningConsecutivePerfect = 0;
  if (Array.isArray(sprintHistory)) {
    for (const s of sprintHistory) {
      if (s.accuracyPct === 100 || (s.correctCount === s.totalQuestions && s.totalQuestions > 0)) {
        runningConsecutivePerfect++;
        if (runningConsecutivePerfect > maxConsecutivePerfect) {
          maxConsecutivePerfect = runningConsecutivePerfect;
        }
      } else {
        runningConsecutivePerfect = 0;
      }
    }
  }
  const effectiveConsecutivePerfect = Math.max(
    consecutivePerfectClimbsCount,
    maxConsecutivePerfect
  );

  // Check if personal record has been set
  const hasSpeedOrAccRecord =
    !!hasSetPersonalRecord ||
    !!isNewSpeedRecord ||
    (personalRecords?.fastest12QuestionsTime != null && personalRecords.fastest12QuestionsTime > 0) ||
    (personalRecords?.mostPerfectSessions != null && personalRecords.mostPerfectSessions > 0) ||
    effectivePerfectCount > 0;

  BADGES_CATALOG.forEach((badge) => {
    if (currentUnlocked.has(badge.id)) return;

    let unlocked = false;

    switch (badge.id) {
      // 1. Daily Streaks
      case 'streak_3':
        unlocked = streak >= 3;
        break;
      case 'streak_7':
        unlocked = streak >= 7;
        break;
      case 'streak_30':
        unlocked = streak >= 30;
        break;
      case 'comeback_kid':
        if (sprintHistory && sprintHistory.length >= 2) {
          const latestSprint = sprintHistory[0];
          const previousSprint = sprintHistory[1];
          if (latestSprint.date && previousSprint.date) {
            const latestDate = new Date(latestSprint.date);
            const prevDate = new Date(previousSprint.date);
            const diffDays = (latestDate - prevDate) / (1000 * 60 * 60 * 24);
            unlocked = diffDays >= 5;
          }
        }
        break;
      case 'early_bird':
        if (lastSprintResult && lastSprintResult.date) {
          const sprintTime = new Date(lastSprintResult.date);
          unlocked = sprintTime.getHours() < 8;
        } else if (sprintHistory && sprintHistory.length > 0) {
          const sprintTime = new Date(sprintHistory[0].date);
          unlocked = sprintTime.getHours() < 8;
        }
        break;
      case 'night_owl':
        if (lastSprintResult && lastSprintResult.date) {
          const sprintTime = new Date(lastSprintResult.date);
          unlocked = sprintTime.getHours() >= 18;
        } else if (sprintHistory && sprintHistory.length > 0) {
          const sprintTime = new Date(sprintHistory[0].date);
          unlocked = sprintTime.getHours() >= 18;
        }
        break;
      case 'grit':
        if (sprintHistory && sprintHistory.length >= 2) {
          const latestSprint = sprintHistory[0];
          const previousSprint = sprintHistory[1];
          if (previousSprint.accuracyPct < 70 && latestSprint.accuracyPct >= 85) {
            unlocked = true;
          }
        }
        break;

      // 2. Personal Records
      case 'personal_record':
        unlocked = hasSpeedOrAccRecord;
        break;

      // 3. Shop Purchases & Rarities
      case 'shop_buyer_1':
        unlocked = purchasedItemsCount >= 1;
        break;
      case 'shop_buyer_5':
        unlocked = purchasedItemsCount >= 5;
        break;
      case 'rare_collector':
        unlocked = purchasedRarities.includes('rare');
        break;
      case 'epic_collector':
        unlocked = purchasedRarities.includes('epic');
        break;
      case 'legendary_collector':
        unlocked = purchasedRarities.includes('legendary');
        break;
      case 'gem_supporter':
        unlocked = !!hasBoughtGemsWithRealMoney;
        break;

      // 4. Sparks Accumulation
      case 'sparks_100':
        unlocked = sparks >= 100;
        break;
      case 'sparks_500':
        unlocked = sparks >= 500;
        break;
      case 'sparks_1000':
        unlocked = sparks >= 1000;
        break;

      // 5. Perfect Climbs & Consecutives
      case 'perfect_climb_single':
        unlocked = effectivePerfectCount >= 1 || !!currentSprintIsPerfect;
        break;
      case 'perfect_climb_3':
        unlocked = effectivePerfectCount >= 3;
        break;
      case 'perfect_streak_3':
        unlocked = effectiveConsecutivePerfect >= 3;
        break;

      // 6. Cumulative Correct Answers in a Row
      case 'cumulative_answers_25':
        unlocked = cumulativeCorrectStreak >= 25;
        break;
      case 'cumulative_answers_50':
        unlocked = cumulativeCorrectStreak >= 50;
        break;
      case 'cumulative_answers_100':
        unlocked = cumulativeCorrectStreak >= 100;
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
    const activeSub = subjectId || 'math';
    const userData = storageService.getUserData(activeSub);
    userData.unlockedBadges = updatedUnlocked;
    storageService.saveUserData(userData, activeSub);
  }

  return { newlyUnlocked, updatedUnlocked };
}
