// Badge Manager Engine for Kibo Math, Kibo Words & Kibo World
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
    subjectId = 'math',
    competenceRank = 1000,
    adaptiveCompetenceRating = 1000,
    totalProblemsSolved = 0
  } = userState;

  const currentRating = Math.max(
    Number(competenceRank) || 0,
    Number(adaptiveCompetenceRating) || 0,
    Number(userState.rating) || 0,
    1000
  );

  // Subject-specific total problems solved fallback
  const subjectSolvedCount = Number(totalProblemsSolved) || 0;

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

  BADGES_CATALOG.forEach((badge) => {
    if (currentUnlocked.has(badge.id)) return;

    let unlocked = false;

    switch (badge.id) {
      // ==========================================
      // 1. Daily Streaks & Consistency
      // ==========================================
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
          const latestDateVal = latestSprint?.timestamp || latestSprint?.date;
          const prevDateVal = previousSprint?.timestamp || previousSprint?.date;
          if (latestDateVal && prevDateVal) {
            const latestDate = new Date(latestDateVal);
            const prevDate = new Date(prevDateVal);
            const diffDays = (latestDate - prevDate) / (1000 * 60 * 60 * 24);
            unlocked = diffDays >= 5;
          }
        }
        break;
      case 'early_bird': {
        const targetRecord = lastSprintResult || (sprintHistory && sprintHistory.length > 0 ? sprintHistory[0] : null);
        const isoString = targetRecord?.timestamp || (typeof targetRecord?.date === 'string' && targetRecord.date.includes('T') ? targetRecord.date : null);
        if (isoString) {
          const sprintTime = new Date(isoString);
          if (!isNaN(sprintTime.getTime())) {
            unlocked = sprintTime.getHours() < 8;
          }
        }
        break;
      }
      case 'night_owl': {
        const targetRecord = lastSprintResult || (sprintHistory && sprintHistory.length > 0 ? sprintHistory[0] : null);
        const isoString = targetRecord?.timestamp || (typeof targetRecord?.date === 'string' && targetRecord.date.includes('T') ? targetRecord.date : null);
        if (isoString) {
          const sprintTime = new Date(isoString);
          if (!isNaN(sprintTime.getTime())) {
            unlocked = sprintTime.getHours() >= 18;
          }
        }
        break;
      }
      case 'grit':
        if (sprintHistory && sprintHistory.length >= 2) {
          const latestSprint = sprintHistory[0];
          const previousSprint = sprintHistory[1];
          if (previousSprint.accuracyPct < 70 && latestSprint.accuracyPct >= 85) {
            unlocked = true;
          }
        }
        break;

      // ==========================================
      // 2. Kibo Words Badges
      // ==========================================
      case 'words_novice':
        if (subjectId === 'words') {
          unlocked = subjectSolvedCount >= 25;
        }
        break;
      case 'words_scholar':
        if (subjectId === 'words') {
          unlocked = subjectSolvedCount >= 100;
        }
        break;
      case 'words_lexicon_master':
        if (subjectId === 'words') {
          unlocked = subjectSolvedCount >= 500;
        }
        break;
      case 'sight_word_scout':
        if (subjectId === 'words') {
          unlocked = currentRating >= 1200;
        }
        break;
      case 'blend_builder':
        if (subjectId === 'words') {
          unlocked = currentRating >= 1400;
        }
        break;
      case 'digraph_diver':
        if (subjectId === 'words') {
          unlocked = currentRating >= 1600;
        }
        break;
      case 'compound_crafter':
        if (subjectId === 'words') {
          unlocked = currentRating >= 1800;
        }
        break;
      case 'morphology_master':
        if (subjectId === 'words') {
          unlocked = currentRating >= 2000;
        }
        break;
      case 'vocab_voyager':
        if (subjectId === 'words') {
          unlocked = currentRating >= 2200;
        }
        break;
      case 'etymology_explorer':
        if (subjectId === 'words') {
          unlocked = currentRating >= 2400;
        }
        break;
      case 'peak_lexicon_master':
        if (subjectId === 'words') {
          unlocked = currentRating >= 2600;
        }
        break;
      case 'word_speed_demon': {
        if (subjectId === 'words') {
          const isFastSprint = lastSprintResult &&
            (lastSprintResult.accuracyPct === 100 || (lastSprintResult.correctCount === lastSprintResult.totalQuestions && lastSprintResult.totalQuestions >= 10)) &&
            (lastSprintResult.totalTimeSec != null && lastSprintResult.totalTimeSec <= 45);
          const hadFastHistory = Array.isArray(sprintHistory) && sprintHistory.some((s) =>
            (s.accuracyPct === 100 || (s.correctCount === s.totalQuestions && s.totalQuestions >= 10)) &&
            s.totalTimeSec != null && s.totalTimeSec <= 45
          );
          unlocked = !!isFastSprint || hadFastHistory;
        }
        break;
      }

      // ==========================================
      // 3. Kibo World Badges
      // ==========================================
      case 'world_novice':
        if (subjectId === 'world') {
          unlocked = subjectSolvedCount >= 25;
        }
        break;
      case 'world_traveler':
        if (subjectId === 'world') {
          unlocked = subjectSolvedCount >= 100;
        }
        break;
      case 'world_expert':
        if (subjectId === 'world') {
          unlocked = subjectSolvedCount >= 500;
        }
        break;
      case 'continent_navigator':
        if (subjectId === 'world') {
          unlocked = currentRating >= 1200;
        }
        break;
      case 'state_cartographer':
        if (subjectId === 'world') {
          unlocked = currentRating >= 1400;
        }
        break;
      case 'country_diplomat':
        if (subjectId === 'world') {
          unlocked = currentRating >= 1600;
        }
        break;
      case 'hemisphere_voyager':
        if (subjectId === 'world') {
          unlocked = currentRating >= 1800;
        }
        break;
      case 'world_summit_master':
        if (subjectId === 'world') {
          unlocked = currentRating >= 2000;
        }
        break;
      case 'capital_collector':
        if (subjectId === 'world') {
          // Check if capital questions solved >= 20
          let capitalCount = Number(userState.capitalQuestionsSolved) || 0;
          if (Array.isArray(sprintHistory)) {
            let sprintCapitals = 0;
            for (const s of sprintHistory) {
              if (Array.isArray(s.answers)) {
                for (const a of s.answers) {
                  if (a.isCorrect && (
                    a.type === 'state_capital' || 
                    a.type === 'country_capital' || 
                    a.type === 'capital_state' || 
                    a.type === 'capital_country' || 
                    a.type === 'tricky_capital' || 
                    a.concept?.includes('Capitals')
                  )) {
                    sprintCapitals++;
                  }
                }
              }
            }
            capitalCount = Math.max(capitalCount, sprintCapitals);
          }
          unlocked = capitalCount >= 20;
        }
        break;

      // ==========================================
      // 5. Shop Purchases & Rarities
      // ==========================================
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

      // ==========================================
      // 6. Sparks Accumulation
      // ==========================================
      case 'sparks_100':
        unlocked = sparks >= 100;
        break;
      case 'sparks_500':
        unlocked = sparks >= 500;
        break;
      case 'sparks_1000':
        unlocked = sparks >= 1000;
        break;

      // ==========================================
      // 7. Perfect Climbs & Consecutives
      // ==========================================
      case 'perfect_climb_single':
        unlocked = effectivePerfectCount >= 1 || !!currentSprintIsPerfect;
        break;
      case 'perfect_climb_3':
        unlocked = effectivePerfectCount >= 3;
        break;
      case 'perfect_streak_3':
        unlocked = effectiveConsecutivePerfect >= 3;
        break;

      // ==========================================
      // 8. Cumulative Correct Answers in a Row
      // ==========================================
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

