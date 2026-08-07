// Badge Manager Engine for Kibo Math
import { BADGES_CATALOG } from '../data/badges';
import { storageService } from '../services/storageService';

export function evaluateBadges(userState, lastSessionResult = null) {
  const currentUnlocked = new Set(userState.unlockedBadges || []);
  const newlyUnlocked = [];

  const {
    streak = 0,
    sparks = 0,
    purchasedItemsCount = 0,
    purchasedRarities = [],
    hasBoughtGemsWithRealMoney = false,
    hasSetPersonalRecord = false,
    perfectClimbsCount = 0,
    consecutivePerfectClimbsCount = 0,
    cumulativeCorrectStreak = 0,
    sessionHistory = []
  } = userState;

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
        if (sessionHistory && sessionHistory.length >= 2) {
          const latestSession = sessionHistory[0];
          const previousSession = sessionHistory[1];
          if (latestSession.date && previousSession.date) {
            const latestDate = new Date(latestSession.date);
            const prevDate = new Date(previousSession.date);
            const diffDays = (latestDate - prevDate) / (1000 * 60 * 60 * 24);
            unlocked = diffDays >= 5;
          }
        }
        break;
      case 'early_bird':
        if (lastSessionResult && lastSessionResult.date) {
          const sessionTime = new Date(lastSessionResult.date);
          unlocked = sessionTime.getHours() < 8;
        } else if (sessionHistory && sessionHistory.length > 0) {
           const sessionTime = new Date(sessionHistory[0].date);
           unlocked = sessionTime.getHours() < 8;
        }
        break;
      case 'night_owl':
        if (lastSessionResult && lastSessionResult.date) {
          const sessionTime = new Date(lastSessionResult.date);
          unlocked = sessionTime.getHours() >= 18;
        } else if (sessionHistory && sessionHistory.length > 0) {
           const sessionTime = new Date(sessionHistory[0].date);
           unlocked = sessionTime.getHours() >= 18;
        }
        break;
      case 'grit':
        if (sessionHistory && sessionHistory.length >= 2) {
           const latestSession = sessionHistory[0];
           const previousSession = sessionHistory[1];
           if (previousSession.accuracyPct < 70 && latestSession.accuracyPct >= 85) {
               unlocked = true;
           }
        }
        break;

      // 2. Personal Records
      case 'personal_record':
        unlocked = !!hasSetPersonalRecord || !!userState.isNewSpeedRecord;
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
        unlocked = perfectClimbsCount >= 1 || (lastSessionResult && lastSessionResult.accuracyPct === 100);
        break;
      case 'perfect_climb_3':
        unlocked = perfectClimbsCount >= 3;
        break;
      case 'perfect_streak_3':
        unlocked = consecutivePerfectClimbsCount >= 3;
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
    const userData = storageService.getUserData();
    userData.unlockedBadges = updatedUnlocked;
    storageService.saveUserData(userData);
  }

  return { newlyUnlocked, updatedUnlocked };
}
