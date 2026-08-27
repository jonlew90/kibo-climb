import { describe, it, expect } from 'vitest';
import { ASCENT_MODES, ASCENT_RANKS, getQuestLevelInfo } from '../src/data/questsData.js';
import { questService } from '../src/services/questService.js';
import { evaluateBadges } from '../src/utils/badgeManager.js';

describe('Ascent Difficulty Loop Engine & Friend Synergy', () => {
  it('should have 5 defined Ascent Difficulty Modes with escalating multipliers', () => {
    expect(ASCENT_MODES.length).toBe(5);
    expect(ASCENT_MODES[0].name).toBe('Sunny Trailhead');
    expect(ASCENT_MODES[0].sparkBonusPct).toBe(0);
    expect(ASCENT_MODES[1].name).toBe('Alpine Gale');
    expect(ASCENT_MODES[1].sparkBonusPct).toBe(10);
    expect(ASCENT_MODES[2].name).toBe('Glacial Blizzard');
    expect(ASCENT_MODES[2].sparkBonusPct).toBe(20);
    expect(ASCENT_MODES[3].name).toBe('Midnight Summit');
    expect(ASCENT_MODES[3].sparkBonusPct).toBe(30);
    expect(ASCENT_MODES[4].name).toBe('Cosmic Apex');
    expect(ASCENT_MODES[4].sparkBonusPct).toBe(50);
  });

  it('should have 10 ranks per Ascent', () => {
    expect(ASCENT_RANKS.length).toBe(10);
    expect(ASCENT_RANKS[0].title).toBe('Basecamp Explorer');
    expect(ASCENT_RANKS[9].title).toBe('Summit Sovereign');
  });

  it('should calculate Ascent 1 (Sunny Trailhead) at 0 XP', () => {
    const info = getQuestLevelInfo(0);
    expect(info.ascentTier).toBe(1);
    expect(info.ascentMode.name).toBe('Sunny Trailhead');
    expect(info.level).toBe(1);
    expect(info.title).toBe('Basecamp Explorer');
    expect(info.sparkBonusPct).toBe(0);
    expect(info.progressPct).toBe(0);
  });

  it('should calculate Ascent 1 Level 4 at 650 XP', () => {
    const info = getQuestLevelInfo(650);
    expect(info.ascentTier).toBe(1);
    expect(info.level).toBe(4);
    expect(info.title).toBe('Ridge Runner');
  });

  it('should promote to Ascent 2 (Alpine Gale) at 5,600 XP with +10% Spark bonus', () => {
    const info = getQuestLevelInfo(5600);
    expect(info.ascentTier).toBe(2);
    expect(info.ascentMode.name).toBe('Alpine Gale');
    expect(info.level).toBe(1);
    expect(info.title).toBe('Basecamp Explorer');
    expect(info.sparkBonusPct).toBe(10);
  });

  it('should promote to Ascent 3 (Glacial Blizzard) at 15,000 XP with +20% Spark bonus', () => {
    const info = getQuestLevelInfo(15000);
    expect(info.ascentTier).toBe(3);
    expect(info.ascentMode.name).toBe('Glacial Blizzard');
    expect(info.level).toBe(1);
    expect(info.sparkBonusPct).toBe(20);
  });

  it('should promote to Ascent 4 (Midnight Summit) at 30,000 XP with +30% Spark bonus', () => {
    const info = getQuestLevelInfo(30000);
    expect(info.ascentTier).toBe(4);
    expect(info.ascentMode.name).toBe('Midnight Summit');
    expect(info.level).toBe(1);
    expect(info.sparkBonusPct).toBe(30);
  });

  it('should promote to Ascent 5 (Cosmic Apex) at 55,000 XP with +50% Spark bonus', () => {
    const info = getQuestLevelInfo(55000);
    expect(info.ascentTier).toBe(5);
    expect(info.ascentMode.name).toBe('Cosmic Apex');
    expect(info.level).toBe(1);
    expect(info.sparkBonusPct).toBe(50);
  });

  it('should calculate +25% Real Friend Synergy in questService.claimReward', () => {
    const profileId = 'test_friend_synergy_profile';
    const state = questService.getQuests(profileId);
    
    // Set a real friend on team2 quest
    state.team2[0].completed = true;
    state.team2[0].claimed = false;
    state.team2[0].partner = { id: 'friend_user_123', name: 'CoolKid42' };
    questService.saveRawState(profileId, state);

    const result = questService.claimReward(profileId, state.team2[0].id);
    expect(result.success).toBe(true);
    expect(result.reward.hasRealFriend).toBe(true);
    expect(result.reward.friendSynergySparks).toBeGreaterThan(0);
    expect(result.reward.sparks).toBe(result.reward.baseSparks + result.reward.ascentBonusSparks + result.reward.friendSynergySparks);
  });

  it('should correctly unlock Ascent & Friend Synergy badges', () => {
    const result = evaluateBadges({
      questElevation: 58000,
      questLevel: 10,
      ascentTier: 5,
      questClaimsCount: 50,
      teamQuestsClaimedCount: 10,
      friendCoopClaimsCount: 1
    });

    const ids = result.newlyUnlocked.map(b => b.id);
    expect(ids).toContain('quest_ascent_2');
    expect(ids).toContain('quest_ascent_3');
    expect(ids).toContain('quest_ascent_4');
    expect(ids).toContain('quest_ascent_5');
    expect(ids).toContain('quest_friend_duo');
    expect(ids).toContain('quest_elevation_1000');
    expect(ids).toContain('quest_claims_50');
    expect(ids).toContain('quest_team_10');
  });
});
