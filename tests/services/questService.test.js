import { describe, it, expect, beforeEach } from 'vitest';
import { questService } from '../../src/services/questService';
import { COMPANION_BUDDIES } from '../../src/data/questsData';

describe('Quest Service', () => {
  const profileId = 'test_profile_quests';

  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes daily, weekly, and 2p/3p team quests', () => {
    const quests = questService.getQuests(profileId);
    expect(quests).toBeDefined();
    expect(quests.daily.length).toBeGreaterThanOrEqual(3);
    expect(quests.weekly.length).toBeGreaterThanOrEqual(3);
    expect(quests.team2.length).toBeGreaterThanOrEqual(1);
    expect(quests.team3.length).toBeGreaterThanOrEqual(1);

    // 2-person quest has partner
    expect(quests.team2[0].partner).toBeDefined();
    expect(quests.team2[0].teamSize).toBe(2);

    // 3-person quest has partners
    expect(quests.team3[0].partners.length).toBe(2);
    expect(quests.team3[0].teamSize).toBe(3);
  });

  it('records progress on problem solve events', () => {
    questService.getQuests(profileId);

    // Solve problems
    const updated = questService.recordProgress(profileId, {
      subject: 'math',
      isCorrect: true,
      streak: 3
    });

    const anyProgress = [
      ...updated.daily,
      ...updated.weekly,
      ...updated.team2,
      ...updated.team3
    ].some(q => (q.progress || 0) > 0);

    expect(anyProgress).toBe(true);
  });

  it('allows claiming rewards for completed quests and updates unclaimed count', () => {
    const state = questService.getQuests(profileId);
    const targetQuest = state.daily[0];
    targetQuest.progress = targetQuest.target;
    targetQuest.completed = true;
    targetQuest.claimed = false;
    questService.saveRawState(profileId, state);

    expect(questService.getUnclaimedCount(profileId)).toBeGreaterThanOrEqual(1);

    const claimRes = questService.claimReward(profileId, targetQuest.id);
    expect(claimRes.success).toBe(true);
    expect(claimRes.reward).toBeDefined();

    const freshState = questService.getQuests(profileId);
    const updatedQ = freshState.daily.find(q => q.id === targetQuest.id);
    expect(updatedQ.claimed).toBe(true);
  });

  it('supports updating teammates on team quests', () => {
    const state = questService.getQuests(profileId);
    const q2 = state.team2[0];
    const newPartner = COMPANION_BUDDIES[2]; // Maya

    questService.setTeammate(profileId, q2.id, newPartner);

    const fresh = questService.getQuests(profileId);
    expect(fresh.team2[0].partner.id).toBe(newPartner.id);
  });

  it('tracks Elevation XP and handles leveling up upon claiming quests', () => {
    const state = questService.getQuests(profileId);
    expect(state.totalXp).toBe(0);
    expect(state.levelInfo.level).toBe(1);

    // Complete and claim a quest that gives 80m altitude/XP
    const q1 = state.daily[0];
    q1.completed = true;
    q1.claimed = false;
    q1.reward = { sparks: 40, altitude: 80 };
    questService.saveRawState(profileId, state);

    const claim1 = questService.claimReward(profileId, q1.id);
    expect(claim1.success).toBe(true);
    expect(claim1.earnedXp).toBe(80);
    expect(claim1.totalXp).toBe(80);
    expect(claim1.levelInfo.level).toBe(1);
    expect(claim1.leveledUp).toBeNull();

    // Complete another quest with 100m altitude to cross Level 2 threshold (150m minXp)
    const freshState = questService.getQuests(profileId);
    const q2 = freshState.daily[1];
    q2.completed = true;
    q2.claimed = false;
    q2.reward = { sparks: 50, altitude: 100 };
    questService.saveRawState(profileId, freshState);

    const claim2 = questService.claimReward(profileId, q2.id);

    expect(claim2.success).toBe(true);
    expect(claim2.totalXp).toBe(180);
    expect(claim2.levelInfo.level).toBe(2);
    expect(claim2.leveledUp).toBeDefined();
    expect(claim2.leveledUp.newLevel).toBe(2);
  });

  it('correctly tracks Coding quests on coding events', () => {
    const state = questService.getQuests(profileId);
    state.daily = [
      {
        id: 'd_coding_8',
        title: 'Algorithm Pathfinder',
        category: 'daily',
        subject: 'coding',
        target: 8,
        unit: 'correct',
        progress: 0,
        completed: false,
        claimed: false,
        reward: { sparks: 50, altitude: 100 }
      }
    ];
    questService.saveRawState(profileId, state);

    questService.recordProgress(profileId, {
      subject: 'coding',
      isCorrect: true,
      streak: 1
    });

    const updated = questService.getQuests(profileId);
    expect(updated.daily[0].progress).toBe(1);

    // Non-coding event shouldn't increment
    questService.recordProgress(profileId, {
      subject: 'math',
      isCorrect: true,
      streak: 2
    });
    const updated2 = questService.getQuests(profileId);
    expect(updated2.daily[0].progress).toBe(1);
  });

  it('dynamically rotates team quests across different week keys', () => {
    const weekA = '2026-W34';
    const weekB = '2026-W35';

    const team2_A = questService.generateTeam2Quests(weekA);
    const team2_B = questService.generateTeam2Quests(weekB);

    expect(team2_A).toBeDefined();
    expect(team2_B).toBeDefined();
    expect(team2_A.length).toBe(2);
    expect(team2_B.length).toBe(2);

    const team3_A = questService.generateTeam3Quests(weekA);
    const team3_B = questService.generateTeam3Quests(weekB);
    expect(team3_A.length).toBe(2);
    expect(team3_B.length).toBe(2);
  });

  it('generates diverse daily quests with general, subject, and challenge selections', () => {
    const dailyQuests = questService.generateDailyQuests('2026-08-26');
    expect(dailyQuests.length).toBe(3);
    
    // Ensure all 3 generated quests are unique
    const ids = new Set(dailyQuests.map(q => q.id));
    expect(ids.size).toBe(3);

    // Ensure at least one has subject 'any' and at least one is subject-specific
    const hasAny = dailyQuests.some(q => q.subject === 'any');
    const hasSubjectSpecific = dailyQuests.some(q => q.subject !== 'any');
    expect(hasAny).toBe(true);
    expect(hasSubjectSpecific).toBe(true);
  });
});

