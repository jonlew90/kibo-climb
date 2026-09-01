// Badge Manager Engine for Kibo Math, Kibo Words & Kibo World
import { BADGES_CATALOG } from '../data/badges.js';
import { storageService } from '../services/storageService';
import { getDaysInMonth, CUTOFF_HOUR, getLogicalDate } from './dateUtils';

export function evaluateBadges(userState = {}, lastSprintResult = null) {
  const currentUnlocked = new Set(userState.unlockedBadges || []);
  const newlyUnlocked = [];

  const {
    streak = 0,
    sparks = 0,
    purchasedItemsCount = 0,
    shopPurchasesCount = 0,
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
    totalProblemsSolved = 0,
    questElevation = 0,
    questLevel = 1,
    ascentTier = 1,
    questClaimsCount = 0,
    teamQuestsClaimedCount = 0,
    friendCoopClaimsCount = 0,
    multiSubjectBonusClaimsCount = 0
  } = userState;

  const currentRating = Math.max(
    Number(competenceRank) || 0,
    Number(adaptiveCompetenceRating) || 0,
    Number(userState.rating) || 0,
    1000
  );

  // Subject-specific total problems solved fallback
  const subjectSolvedCount = Number(totalProblemsSolved) || 0;

  // Calculate globally completed subjects (at least 1 full climb)
  let playedSubjectsCount = 0;
  const globalProfile = storageService.getActiveProfile();
  if (globalProfile?.userData?.subjects) {
    const subjectsMap = globalProfile.userData.subjects;
    playedSubjectsCount = Object.keys(subjectsMap).filter((key) => {
      const subData = subjectsMap[key];
      return (subData.sprintHistory && subData.sprintHistory.length >= 1) || (subData.totalProblemsSolved && subData.totalProblemsSolved > 0);
    }).length;
  }

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


  // Combine all subjects' sprint history to evaluate perfect month badges globally
  const allSubjects = globalProfile?.userData?.subjects || {};
  let combinedGlobalHistory = [...(Array.isArray(sprintHistory) ? sprintHistory : [])];
  Object.values(allSubjects).forEach((sub) => {
    if (Array.isArray(sub?.sprintHistory)) {
      combinedGlobalHistory.push(...sub.sprintHistory);
    }
  });

  // Calculate unique active days per month
  const monthlyActiveDays = {};
  combinedGlobalHistory.forEach((item) => {
    if (!item) return;
    let logicalDateStr;
    if (item.date) {
      logicalDateStr = item.date; // assuming item.date is already 'YYYY-MM-DD'
    } else if (item.timestamp) {
      const logicalDate = getLogicalDate(new Date(item.timestamp), CUTOFF_HOUR);
      logicalDateStr = `${logicalDate.getFullYear()}-${String(logicalDate.getMonth() + 1).padStart(2, '0')}-${String(logicalDate.getDate()).padStart(2, '0')}`;
    }
    if (logicalDateStr) {
      const [y, m, d] = logicalDateStr.split('-');
      const monthKey = `${y}-${m}`;
      if (!monthlyActiveDays[monthKey]) {
        monthlyActiveDays[monthKey] = new Set();
      }
      monthlyActiveDays[monthKey].add(d);
    }
  });

  const checkPerfectMonth = (monthIndex) => {
    // Check across all years in history for this specific month (0-11)
    for (const [monthKey, daysSet] of Object.entries(monthlyActiveDays)) {
      const [y, m] = monthKey.split('-');
      const yearInt = parseInt(y, 10);
      const monthInt = parseInt(m, 10) - 1; // 0-indexed
      if (monthInt === monthIndex) {
        const totalDays = getDaysInMonth(yearInt, monthInt);
        if (daysSet.size >= totalDays) {
          return true;
        }
      }
    }
    return false;
  };

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

      case 'perfect_month_0': unlocked = checkPerfectMonth(0); break;
      case 'perfect_month_1': unlocked = checkPerfectMonth(1); break;
      case 'perfect_month_2': unlocked = checkPerfectMonth(2); break;
      case 'perfect_month_3': unlocked = checkPerfectMonth(3); break;
      case 'perfect_month_4': unlocked = checkPerfectMonth(4); break;
      case 'perfect_month_5': unlocked = checkPerfectMonth(5); break;
      case 'perfect_month_6': unlocked = checkPerfectMonth(6); break;
      case 'perfect_month_7': unlocked = checkPerfectMonth(7); break;
      case 'perfect_month_8': unlocked = checkPerfectMonth(8); break;
      case 'perfect_month_9': unlocked = checkPerfectMonth(9); break;
      case 'perfect_month_10': unlocked = checkPerfectMonth(10); break;
      case 'perfect_month_11': unlocked = checkPerfectMonth(11); break;

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
      case 'multi_subject_2':
        unlocked = playedSubjectsCount >= 2;
        break;
      case 'multi_subject_3':
        unlocked = playedSubjectsCount >= 3;
        break;
      case 'multi_subject_4':
        unlocked = playedSubjectsCount >= 4;
        break;
      case 'multi_subject_5':
        unlocked = playedSubjectsCount >= 5;
        break;
      case 'daily_multi_subject_first':
        unlocked = Number(multiSubjectBonusClaimsCount) >= 1;
        break;
      case 'daily_multi_subject_5':
        unlocked = Number(multiSubjectBonusClaimsCount) >= 5;
        break;

      // ==========================================
      // 2. Kibo Math Badges
      // ==========================================
      case 'math_novice':
        if (subjectId === 'math') {
          unlocked = subjectSolvedCount >= 25;
        }
        break;
      case 'math_scholar':
        if (subjectId === 'math') {
          unlocked = subjectSolvedCount >= 100;
        }
        break;
      case 'math_master':
        if (subjectId === 'math') {
          unlocked = subjectSolvedCount >= 500;
        }
        break;
      case 'addition_apprentice':
        if (subjectId === 'math') {
          unlocked = currentRating >= 1200;
        }
        break;
      case 'subtraction_scout':
        if (subjectId === 'math') {
          unlocked = currentRating >= 1400;
        }
        break;
      case 'multiplication_master':
        if (subjectId === 'math') {
          unlocked = currentRating >= 1600;
        }
        break;
      case 'division_diver':
        if (subjectId === 'math') {
          unlocked = currentRating >= 1800;
        }
        break;
      case 'fraction_finder':
        if (subjectId === 'math') {
          unlocked = currentRating >= 2000;
        }
        break;
      case 'geometry_genius':
        if (subjectId === 'math') {
          unlocked = currentRating >= 2200;
        }
        break;
      case 'algebra_ace':
        if (subjectId === 'math') {
          unlocked = currentRating >= 2400;
        }
        break;
      case 'peak_math_legend':
        if (subjectId === 'math') {
          unlocked = currentRating >= 2600;
        }
        break;
      case 'math_speed_demon': {
        if (subjectId === 'math') {
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
      // 3. Kibo Words Badges
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
      // 4. Kibo Coding Badges
      // ==========================================
      case 'coding_novice':
        if (subjectId === 'coding') {
          unlocked = subjectSolvedCount >= 25;
        }
        break;
      case 'coding_coder':
        if (subjectId === 'coding') {
          unlocked = subjectSolvedCount >= 100;
        }
        break;
      case 'coding_master':
        if (subjectId === 'coding') {
          unlocked = subjectSolvedCount >= 500;
        }
        break;
      case 'pattern_scout':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 1200;
        }
        break;
      case 'grid_navigator':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 1400;
        }
        break;
      case 'boolean_ranger':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 1600;
        }
        break;
      case 'variable_virtuoso':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 1800;
        }
        break;
      case 'debug_detective':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 2000;
        }
        break;
      case 'loop_legend':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 2200;
        }
        break;
      case 'code_summit_master':
        if (subjectId === 'coding') {
          unlocked = currentRating >= 2400;
        }
        break;
      case 'code_speed_demon': {
        if (subjectId === 'coding') {
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
      // 5. Shop Purchases & Rarities
      // ==========================================
      case 'shop_buyer_1': {
        const totalPurchases = Math.max(Number(purchasedItemsCount) || 0, Number(shopPurchasesCount) || 0);
        unlocked =
          totalPurchases >= 1 ||
          (Array.isArray(purchasedRarities) && purchasedRarities.length > 0) ||
          purchasedRarities.includes('rare') ||
          purchasedRarities.includes('epic') ||
          purchasedRarities.includes('legendary') ||
          currentUnlocked.has('rare_collector') ||
          currentUnlocked.has('epic_collector') ||
          currentUnlocked.has('legendary_collector');
        break;
      }
      case 'shop_buyer_5': {
        const totalPurchases = Math.max(Number(purchasedItemsCount) || 0, Number(shopPurchasesCount) || 0);
        unlocked = totalPurchases >= 5;
        break;
      }
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

      // ==========================================
      // 9. Mountain Quests & Ascent Badges
      // ==========================================
      case 'quest_first_claim':
        unlocked = questClaimsCount >= 1;
        break;
      case 'quest_elevation_1000':
        unlocked = questElevation >= 1000;
        break;
      case 'quest_elevation_5000':
        unlocked = questElevation >= 5000;
        break;
      case 'quest_elevation_20000':
        unlocked = questElevation >= 20000;
        break;
      case 'quest_elevation_60000':
        unlocked = questElevation >= 60000;
        break;
      case 'quest_level_5':
        unlocked = questLevel >= 5;
        break;
      case 'quest_level_10':
        unlocked = questLevel >= 10;
        break;
      case 'quest_level_20':
        unlocked = questLevel >= 20;
        break;
      case 'quest_level_30':
        unlocked = questLevel >= 30;
        break;
      case 'quest_ascent_2':
        unlocked = ascentTier >= 2;
        break;
      case 'quest_ascent_3':
        unlocked = ascentTier >= 3;
        break;
      case 'quest_ascent_4':
        unlocked = ascentTier >= 4;
        break;
      case 'quest_ascent_5':
        unlocked = ascentTier >= 5;
        break;
      case 'quest_friend_duo':
        unlocked = friendCoopClaimsCount >= 1;
        break;
      case 'quest_claims_10':
        unlocked = questClaimsCount >= 10;
        break;
      case 'quest_claims_50':
        unlocked = questClaimsCount >= 50;
        break;
      case 'quest_team_first':
        unlocked = teamQuestsClaimedCount >= 1;
        break;
      case 'quest_team_10':
        unlocked = teamQuestsClaimedCount >= 10;
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

/**
 * Returns an array of badge IDs that correspond to rating-tier milestones
 * for a given starting rating across all supported subjects.
 */
export function getStartingRatingBadges(startingRating = 1000) {
  const rating = Number(startingRating) || 1000;
  const unlocked = new Set();

  const subjects = ['math', 'words', 'world', 'coding'];
  subjects.forEach((subId) => {
    BADGES_CATALOG.forEach((badge) => {
      let shouldUnlock = false;
      switch (badge.id) {
        // Math Rating Badges
        case 'addition_apprentice': if (subId === 'math') shouldUnlock = rating >= 1200; break;
        case 'subtraction_scout': if (subId === 'math') shouldUnlock = rating >= 1400; break;
        case 'multiplication_master': if (subId === 'math') shouldUnlock = rating >= 1600; break;
        case 'division_diver': if (subId === 'math') shouldUnlock = rating >= 1800; break;
        case 'fraction_finder': if (subId === 'math') shouldUnlock = rating >= 2000; break;
        case 'geometry_genius': if (subId === 'math') shouldUnlock = rating >= 2200; break;
        case 'algebra_ace': if (subId === 'math') shouldUnlock = rating >= 2400; break;
        case 'peak_math_legend': if (subId === 'math') shouldUnlock = rating >= 2600; break;

        // Words Rating Badges
        case 'sight_word_scout': if (subId === 'words') shouldUnlock = rating >= 1200; break;
        case 'blend_builder': if (subId === 'words') shouldUnlock = rating >= 1400; break;
        case 'digraph_diver': if (subId === 'words') shouldUnlock = rating >= 1600; break;
        case 'compound_crafter': if (subId === 'words') shouldUnlock = rating >= 1800; break;
        case 'morphology_master': if (subId === 'words') shouldUnlock = rating >= 2000; break;
        case 'vocab_voyager': if (subId === 'words') shouldUnlock = rating >= 2200; break;
        case 'etymology_explorer': if (subId === 'words') shouldUnlock = rating >= 2400; break;
        case 'peak_lexicon_master': if (subId === 'words') shouldUnlock = rating >= 2600; break;

        // World Rating Badges
        case 'continent_navigator': if (subId === 'world') shouldUnlock = rating >= 1200; break;
        case 'state_cartographer': if (subId === 'world') shouldUnlock = rating >= 1400; break;
        case 'country_diplomat': if (subId === 'world') shouldUnlock = rating >= 1600; break;
        case 'hemisphere_voyager': if (subId === 'world') shouldUnlock = rating >= 1800; break;
        case 'world_summit_master': if (subId === 'world') shouldUnlock = rating >= 2000; break;

        // Coding Rating Badges
        case 'pattern_scout': if (subId === 'coding') shouldUnlock = rating >= 1200; break;
        case 'grid_navigator': if (subId === 'coding') shouldUnlock = rating >= 1400; break;
        case 'boolean_ranger': if (subId === 'coding') shouldUnlock = rating >= 1600; break;
        case 'variable_virtuoso': if (subId === 'coding') shouldUnlock = rating >= 1800; break;
        case 'debug_detective': if (subId === 'coding') shouldUnlock = rating >= 2000; break;
        case 'loop_legend': if (subId === 'coding') shouldUnlock = rating >= 2200; break;
        case 'code_summit_master': if (subId === 'coding') shouldUnlock = rating >= 2400; break;

        default:
          break;
      }
      if (shouldUnlock) {
        unlocked.add(badge.id);
      }
    });
  });

  return Array.from(unlocked);
}

