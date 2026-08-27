// Quest Service for Kibo Climb
import {
  DAILY_QUEST_POOL,
  WEEKLY_QUEST_POOL,
  TEAM_2P_QUEST_POOL,
  TEAM_3P_QUEST_POOL,
  COMPANION_BUDDIES,
  QUEST_RANKS,
  getQuestLevelInfo
} from '../data/questsData.js';
import { getWeekStr } from '../utils/dateUtils.js';
import { evaluateBadges } from '../utils/badgeManager.js';
import { leaderboardService } from './leaderboardService.js';
import { storageService } from './storageService.js';

const STORAGE_PREFIX = 'kibo_quests_state_';

function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBuddyById(id) {
  return COMPANION_BUDDIES.find(b => b.id === id) || COMPANION_BUDDIES[0];
}

class QuestService {
  getStorageKey(profileId = 'default_child') {
    return `${STORAGE_PREFIX}${profileId || 'default_child'}`;
  }

  loadRawState(profileId) {
    try {
      const data = localStorage.getItem(this.getStorageKey(profileId));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading quest state:', e);
    }
    return null;
  }

  saveRawState(profileId, state) {
    try {
      localStorage.setItem(this.getStorageKey(profileId), JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving quest state:', e);
    }
  }

  generateDailyQuests(dateKey) {
    // Deterministic selection based on date string hash so it's consistent all day
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const pool = [...DAILY_QUEST_POOL];
    const selected = [];

    // 1. Pick 1 general or streak quest
    const generalPool = pool.filter(q => q.subject === 'any');
    if (generalPool.length > 0) {
      const gIdx = absHash % generalPool.length;
      const gQuest = generalPool[gIdx];
      selected.push({ ...gQuest, progress: 0, completed: false, claimed: false });
      const pIdx = pool.findIndex(q => q.id === gQuest.id);
      if (pIdx >= 0) pool.splice(pIdx, 1);
    }

    // 2. Pick 1 subject-specific quest (math, words, world, coding)
    const subjectPool = pool.filter(q => q.subject !== 'any');
    if (subjectPool.length > 0) {
      const sIdx = (absHash + 7) % subjectPool.length;
      const sQuest = subjectPool[sIdx];
      selected.push({ ...sQuest, progress: 0, completed: false, claimed: false });
      const pIdx = pool.findIndex(q => q.id === sQuest.id);
      if (pIdx >= 0) pool.splice(pIdx, 1);
    }

    // 3. Pick 1 additional quest from remaining pool
    if (pool.length > 0) {
      const rIdx = (absHash + 13) % pool.length;
      const rQuest = pool.splice(rIdx, 1)[0];
      selected.push({ ...rQuest, progress: 0, completed: false, claimed: false });
    }

    return selected;
  }

  generateWeeklyQuests(weekKey) {
    let hash = 0;
    for (let i = 0; i < weekKey.length; i++) {
      hash = (hash << 5) - hash + weekKey.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const selected = [];
    const pool = [...WEEKLY_QUEST_POOL];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = (absHash + i * 5) % pool.length;
      const quest = pool.splice(idx, 1)[0];
      selected.push({
        ...quest,
        progress: 0,
        completed: false,
        claimed: false
      });
    }
    return selected;
  }

  generateTeam2Quests(weekKey) {
    let hash = 0;
    for (let i = 0; i < weekKey.length; i++) {
      hash = (hash << 5) - hash + weekKey.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const pool = [...TEAM_2P_QUEST_POOL];
    const selected = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const idx = (absHash + i * 3) % pool.length;
      const quest = pool.splice(idx, 1)[0];
      const partner = getBuddyById(quest.defaultPartner || COMPANION_BUDDIES[i % COMPANION_BUDDIES.length].id);
      selected.push({
        ...quest,
        partner,
        userProgress: 0,
        partnerProgress: 0,
        progress: 0,
        completed: false,
        claimed: false
      });
    }
    return selected;
  }

  generateTeam3Quests(weekKey) {
    let hash = 0;
    for (let i = 0; i < weekKey.length; i++) {
      hash = (hash << 5) - hash + weekKey.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const pool = [...TEAM_3P_QUEST_POOL];
    const selected = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const idx = (absHash + i * 3) % pool.length;
      const quest = pool.splice(idx, 1)[0];
      const partners = (quest.defaultPartners || ['buddy_asha', 'buddy_leo']).map(id => getBuddyById(id));
      selected.push({
        ...quest,
        partners,
        userProgress: 0,
        partnerProgresses: partners.map(() => 0),
        progress: 0,
        completed: false,
        claimed: false
      });
    }
    return selected;
  }

  getQuests(profileId = 'default_child') {
    const today = getTodayDateKey();
    const currentWeek = getWeekStr();
    let state = this.loadRawState(profileId);

    let needsSave = false;

    if (!state) {
      state = {
        dateKey: today,
        weekKey: currentWeek,
        totalXp: 0,
        claimsCount: 0,
        teamClaimsCount: 0,
        daily: this.generateDailyQuests(today),
        weekly: this.generateWeeklyQuests(currentWeek),
        team2: this.generateTeam2Quests(currentWeek),
        team3: this.generateTeam3Quests(currentWeek)
      };
      needsSave = true;
    } else {
      if (typeof state.totalXp !== 'number') {
        state.totalXp = 0;
        needsSave = true;
      }
      if (typeof state.claimsCount !== 'number') {
        state.claimsCount = 0;
        needsSave = true;
      }
      if (typeof state.teamClaimsCount !== 'number') {
        state.teamClaimsCount = 0;
        needsSave = true;
      }

      // Check if daily quests need reset
      if (state.dateKey !== today || !state.daily || state.daily.length === 0) {
        state.dateKey = today;
        state.daily = this.generateDailyQuests(today);
        needsSave = true;
      }

      // Check if weekly/team quests need reset
      if (state.weekKey !== currentWeek || !state.weekly || state.weekly.length === 0) {
        state.weekKey = currentWeek;
        state.weekly = this.generateWeeklyQuests(currentWeek);
        state.team2 = this.generateTeam2Quests(currentWeek);
        state.team3 = this.generateTeam3Quests(currentWeek);
        needsSave = true;
      }

      // Ensure all arrays exist
      if (!state.team2) {
        state.team2 = this.generateTeam2Quests(currentWeek);
        needsSave = true;
      }
      if (!state.team3) {
        state.team3 = this.generateTeam3Quests(currentWeek);
        needsSave = true;
      }
    }

    if (needsSave) {
      this.saveRawState(profileId, state);
    }

    state.levelInfo = getQuestLevelInfo(state.totalXp || 0);
    return state;
  }

  recordProgress(profileId, event) {
    const state = this.getQuests(profileId);
    const { subject = 'any', isCorrect = true, streak = 0 } = event;

    // Helper to evaluate and advance a quest
    const updateQuest = (q) => {
      if (q.completed) return false;

      let increment = 0;

      if (q.unit === 'streak') {
        if (streak > q.progress) {
          q.progress = Math.min(q.target, streak);
        }
      } else if (q.unit === 'correct') {
        if (isCorrect && (q.subject === 'any' || q.subject === subject)) {
          increment = 1;
        }
      } else {
        // unit === 'problems'
        if (q.subject === 'any' || q.subject === subject || q.subject === 'multi') {
          increment = 1;
        }
      }

      if (increment > 0) {
        q.progress = Math.min(q.target, (q.progress || 0) + increment);
      }

      if (q.progress >= q.target) {
        q.completed = true;
      }
      return true;
    };

    // Update Daily Quests
    state.daily.forEach(updateQuest);

    // Update Weekly Quests
    state.weekly.forEach(updateQuest);

    // Update 2-Person Team Quests
    state.team2.forEach(q => {
      if (q.completed) return;
      let userIncrement = 0;
      if (isCorrect || q.unit === 'problems') {
        userIncrement = 1;
      }
      q.userProgress = (q.userProgress || 0) + userIncrement;

      // Simulated teammate activity (teammates climb alongside you ~60% probability)
      const teammateIncrement = Math.random() < 0.65 ? 1 : 0;
      q.partnerProgress = (q.partnerProgress || 0) + teammateIncrement;

      q.progress = Math.min(q.target, (q.userProgress || 0) + (q.partnerProgress || 0));
      if (q.progress >= q.target) {
        q.completed = true;
      }
    });

    // Update 3-Person Team Quests
    state.team3.forEach(q => {
      if (q.completed) return;
      let userIncrement = 0;
      if (isCorrect || q.unit === 'problems') {
        userIncrement = 1;
      }
      q.userProgress = (q.userProgress || 0) + userIncrement;

      if (!q.partnerProgresses || !Array.isArray(q.partnerProgresses)) {
        q.partnerProgresses = (q.partners || [{}, {}]).map(() => 0);
      }

      q.partnerProgresses = q.partnerProgresses.map(p => {
        const teamIncr = Math.random() < 0.6 ? 1 : 0;
        return p + teamIncr;
      });

      const partnerSum = q.partnerProgresses.reduce((sum, p) => sum + p, 0);
      q.progress = Math.min(q.target, (q.userProgress || 0) + partnerSum);
      if (q.progress >= q.target) {
        q.completed = true;
      }
    });

    this.saveRawState(profileId, state);
    return state;
  }

  claimReward(profileId, questId) {
    const state = this.getQuests(profileId);
    let targetQuest = null;
    let isTeam = false;

    const findAndClaim = (list, teamFlag = false) => {
      const q = list.find(item => item.id === questId);
      if (q && q.completed && !q.claimed) {
        q.claimed = true;
        targetQuest = q;
        isTeam = teamFlag;
        return true;
      }
      return false;
    };

    findAndClaim(state.daily, false) ||
    findAndClaim(state.weekly, false) ||
    findAndClaim(state.team2, true) ||
    findAndClaim(state.team3, true);

    if (targetQuest) {
      const previousXp = state.totalXp || 0;
      const previousLevelInfo = getQuestLevelInfo(previousXp);

      // Base rewards
      const baseSparks = targetQuest.reward?.sparks || 0;
      const earnedXp = targetQuest.reward?.altitude || targetQuest.reward?.xp || 0;
      const baseShields = targetQuest.reward?.shields || 0;

      // 1. Ascent Multiplier Boost
      const ascentBonusSparks = Math.round(baseSparks * ((previousLevelInfo.sparkBonusPct || 0) / 100));

      // 2. Real Friend Synergy Bonus (+25% Sparks on Team Quests with real friends)
      let friendSynergySparks = 0;
      let hasRealFriend = false;

      if (isTeam) {
        if (targetQuest.partner && typeof targetQuest.partner.id === 'string' && !targetQuest.partner.id.startsWith('buddy_')) {
          hasRealFriend = true;
        } else if (Array.isArray(targetQuest.partners) && targetQuest.partners.some(p => p && typeof p.id === 'string' && !p.id.startsWith('buddy_'))) {
          hasRealFriend = true;
        }

        if (hasRealFriend && baseSparks > 0) {
          friendSynergySparks = Math.max(10, Math.round(baseSparks * 0.25));
        }
      }

      const totalQuestSparks = baseSparks + ascentBonusSparks + friendSynergySparks;
      
      state.totalXp = previousXp + earnedXp;
      state.claimsCount = (state.claimsCount || 0) + 1;
      if (isTeam) {
        state.teamClaimsCount = (state.teamClaimsCount || 0) + 1;
        if (hasRealFriend) {
          state.friendCoopClaimsCount = (state.friendCoopClaimsCount || 0) + 1;
        }
      }

      const newLevelInfo = getQuestLevelInfo(state.totalXp);
      state.levelInfo = newLevelInfo;

      let leveledUp = null;
      if (newLevelInfo.ascentTier > previousLevelInfo.ascentTier) {
        // Ascent Summit Conquered!
        leveledUp = {
          isSummit: true,
          oldTier: previousLevelInfo.ascentTier,
          newTier: newLevelInfo.ascentTier,
          oldAscentMode: previousLevelInfo.ascentMode,
          newAscentMode: newLevelInfo.ascentMode,
          level: newLevelInfo.level,
          reward: previousLevelInfo.ascentMode.summitReward || { sparks: 500, shields: 3 }
        };
      } else if (newLevelInfo.level > previousLevelInfo.level) {
        leveledUp = {
          isSummit: false,
          oldLevel: previousLevelInfo.level,
          newLevel: newLevelInfo.level,
          ascentTier: newLevelInfo.ascentTier,
          rank: newLevelInfo,
          reward: { sparks: 50 + newLevelInfo.level * 15 }
        };
      }

      this.saveRawState(profileId, state);

      // Sync quest elevation and stats to leaderboard
      try {
        const activeProf = storageService.getActiveProfile();
        const profName = activeProf?.username || activeProf?.name || 'Climber';
        const equipped = activeProf?.shopState?.equippedItems || [];
        leaderboardService.syncQuestScore({
          profileId,
          name: profName,
          totalXp: state.totalXp,
          level: newLevelInfo.level,
          ascentTier: newLevelInfo.ascentTier,
          ascentName: newLevelInfo.ascentMode?.name || 'Sunny Trailhead',
          title: newLevelInfo.title,
          claimsCount: state.claimsCount,
          equipped
        });
      } catch (syncErr) {
        console.warn('Error syncing quest stats to leaderboard:', syncErr);
      }

      // Evaluate quest-related badges
      let badgeResult = { newlyUnlocked: [] };
      try {
        badgeResult = evaluateBadges({
          questElevation: state.totalXp,
          questLevel: newLevelInfo.level,
          ascentTier: newLevelInfo.ascentTier,
          questClaimsCount: state.claimsCount,
          teamQuestsClaimedCount: state.teamClaimsCount,
          friendCoopClaimsCount: state.friendCoopClaimsCount || 0
        });
      } catch (err) {
        console.warn('Error evaluating quest badges:', err);
      }

      const finalReward = {
        sparks: totalQuestSparks,
        baseSparks,
        ascentBonusSparks,
        friendSynergySparks,
        hasRealFriend,
        altitude: earnedXp,
        shields: baseShields
      };

      return {
        success: true,
        reward: finalReward,
        quest: targetQuest,
        earnedXp,
        totalXp: state.totalXp,
        levelInfo: newLevelInfo,
        leveledUp,
        newlyUnlockedBadges: badgeResult.newlyUnlocked || []
      };
    }

    return { success: false };
  }

  setTeammate(profileId, questId, teammate, slotIndex = 0) {
    const state = this.getQuests(profileId);

    const q2 = state.team2.find(q => q.id === questId);
    if (q2) {
      q2.partner = teammate;
      this.saveRawState(profileId, state);
      return state;
    }

    const q3 = state.team3.find(q => q.id === questId);
    if (q3 && q3.partners) {
      q3.partners[slotIndex] = teammate;
      this.saveRawState(profileId, state);
      return state;
    }

    return state;
  }

  getUnclaimedCount(profileId) {
    const state = this.getQuests(profileId);
    let count = 0;
    const countList = (list = []) => {
      list.forEach(q => {
        if (q.completed && !q.claimed) {
          count++;
        }
      });
    };
    countList(state.daily);
    countList(state.weekly);
    countList(state.team2);
    countList(state.team3);
    return count;
  }

  getTimeUntilDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diffMs = tomorrow - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  getTimeUntilWeeklyReset() {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday...
    const daysUntilNextMonday = ((7 - day + 1) % 7) || 7;
    const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextMonday);
    const diffMs = nextMonday - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  }
}

export const questService = new QuestService();
