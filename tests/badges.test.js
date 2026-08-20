import { describe, it, expect, beforeEach } from 'vitest';
import { BADGES_CATALOG, BADGE_CATEGORIES, getBadgeById } from '../src/data/badges.js';
import { evaluateBadges } from '../src/utils/badgeManager.js';
import { storageService } from '../src/services/storageService.js';

describe('Badges System & Expansion Tests', () => {
  beforeEach(() => {
    // Clear storage mock state if needed
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Badge Catalog and Categories Integrity', () => {
    it('has all required badge categories defined with label and icon', () => {
      expect(BADGE_CATEGORIES.consistency).toBeDefined();
      expect(BADGE_CATEGORIES.words).toBeDefined();
      expect(BADGE_CATEGORIES.world).toBeDefined();
      expect(BADGE_CATEGORIES.precision).toBeDefined();
      expect(BADGE_CATEGORIES.shop).toBeDefined();
      expect(BADGE_CATEGORIES.records).toBeDefined();

      Object.entries(BADGE_CATEGORIES).forEach(([catKey, catVal]) => {
        expect(catVal.label).toBeTruthy();
        expect(catVal.icon).toBeTruthy();
      });
    });

    it('contains valid badge structures for all catalog items', () => {
      expect(BADGES_CATALOG.length).toBeGreaterThanOrEqual(35);

      const uniqueIds = new Set();
      BADGES_CATALOG.forEach((badge) => {
        expect(badge.id).toBeTruthy();
        expect(badge.title).toBeTruthy();
        expect(badge.description).toBeTruthy();
        expect(badge.category).toBeTruthy();
        expect(BADGE_CATEGORIES[badge.category]).toBeDefined();
        expect(badge.icon).toBeTruthy();
        expect(badge.reqText).toBeTruthy();

        expect(uniqueIds.has(badge.id)).toBe(false);
        uniqueIds.add(badge.id);
      });
    });

    it('retrieves badge by ID correctly', () => {
      const wordsBadge = getBadgeById('sight_word_scout');
      expect(wordsBadge).toBeDefined();
      expect(wordsBadge.title).toBe('Sight Word Scout');
      expect(wordsBadge.category).toBe('words');

      const worldBadge = getBadgeById('continent_navigator');
      expect(worldBadge).toBeDefined();
      expect(worldBadge.title).toBe('Continent Conqueror');
      expect(worldBadge.category).toBe('world');
    });
  });

  describe('Kibo Words Badges Evaluation', () => {
    it('unlocks Words problem count milestones', () => {
      const res25 = evaluateBadges({
        subjectId: 'words',
        totalProblemsSolved: 25,
        unlockedBadges: []
      });
      expect(res25.updatedUnlocked).toContain('words_novice');

      const res100 = evaluateBadges({
        subjectId: 'words',
        totalProblemsSolved: 100,
        unlockedBadges: res25.updatedUnlocked
      });
      expect(res100.updatedUnlocked).toContain('words_scholar');

      const res500 = evaluateBadges({
        subjectId: 'words',
        totalProblemsSolved: 500,
        unlockedBadges: res100.updatedUnlocked
      });
      expect(res500.updatedUnlocked).toContain('words_lexicon_master');
    });

    it('unlocks Words curriculum tier rating badges', () => {
      const resTiers = evaluateBadges({
        subjectId: 'words',
        competenceRank: 2650,
        unlockedBadges: []
      });

      expect(resTiers.updatedUnlocked).toContain('sight_word_scout');
      expect(resTiers.updatedUnlocked).toContain('blend_builder');
      expect(resTiers.updatedUnlocked).toContain('digraph_diver');
      expect(resTiers.updatedUnlocked).toContain('compound_crafter');
      expect(resTiers.updatedUnlocked).toContain('morphology_master');
      expect(resTiers.updatedUnlocked).toContain('vocab_voyager');
      expect(resTiers.updatedUnlocked).toContain('etymology_explorer');
      expect(resTiers.updatedUnlocked).toContain('peak_lexicon_master');
    });

    it('unlocks word_speed_demon on fast perfect sprint', () => {
      const res = evaluateBadges({
        subjectId: 'words',
        unlockedBadges: []
      }, {
        accuracyPct: 100,
        correctCount: 12,
        totalQuestions: 12,
        totalTimeSec: 38
      });

      expect(res.updatedUnlocked).toContain('word_speed_demon');
      expect(res.updatedUnlocked).toContain('perfect_climb_single');
    });
  });

  describe('Kibo World Badges Evaluation', () => {
    it('unlocks World problem count milestones', () => {
      const res25 = evaluateBadges({
        subjectId: 'world',
        totalProblemsSolved: 25,
        unlockedBadges: []
      });
      expect(res25.updatedUnlocked).toContain('world_novice');

      const res100 = evaluateBadges({
        subjectId: 'world',
        totalProblemsSolved: 100,
        unlockedBadges: res25.updatedUnlocked
      });
      expect(res100.updatedUnlocked).toContain('world_traveler');

      const res500 = evaluateBadges({
        subjectId: 'world',
        totalProblemsSolved: 500,
        unlockedBadges: res100.updatedUnlocked
      });
      expect(res500.updatedUnlocked).toContain('world_expert');
    });

    it('unlocks World curriculum rating badges', () => {
      const resWorld = evaluateBadges({
        subjectId: 'world',
        competenceRank: 2100,
        unlockedBadges: []
      });

      expect(resWorld.updatedUnlocked).toContain('continent_navigator');
      expect(resWorld.updatedUnlocked).toContain('state_cartographer');
      expect(resWorld.updatedUnlocked).toContain('country_diplomat');
      expect(resWorld.updatedUnlocked).toContain('hemisphere_voyager');
      expect(resWorld.updatedUnlocked).toContain('world_summit_master');
    });

    it('unlocks capital_collector badge with capital answers history', () => {
      const sprintHistory = [
        {
          answers: Array.from({ length: 20 }, (_, i) => ({
            type: 'state_capital',
            isCorrect: true
          }))
        }
      ];

      const res = evaluateBadges({
        subjectId: 'world',
        sprintHistory,
        unlockedBadges: []
      });

      expect(res.updatedUnlocked).toContain('capital_collector');
    });

    it('unlocks capital_collector badge via capitalQuestionsSolved counter', () => {
      const res = evaluateBadges({
        subjectId: 'world',
        capitalQuestionsSolved: 20,
        unlockedBadges: []
      });

      expect(res.updatedUnlocked).toContain('capital_collector');
    });

    it('does NOT unlock capital_collector with only 1 capital question or 40 general questions', () => {
      const resOnly1 = evaluateBadges({
        subjectId: 'world',
        capitalQuestionsSolved: 1,
        unlockedBadges: []
      });
      expect(resOnly1.updatedUnlocked).not.toContain('capital_collector');

      const res40General = evaluateBadges({
        subjectId: 'world',
        totalProblemsSolved: 40,
        capitalQuestionsSolved: 1,
        unlockedBadges: []
      });
      expect(res40General.updatedUnlocked).not.toContain('capital_collector');
    });
  });

  describe('Streak, Precision, and Shop Badges Evaluation', () => {
    it('evaluates streak and perfect climb badges properly', () => {
      const res = evaluateBadges({
        streak: 7,
        cumulativeCorrectStreak: 50,
        unlockedBadges: []
      }, {
        accuracyPct: 100,
        correctCount: 10,
        totalQuestions: 10
      });

      expect(res.updatedUnlocked).toContain('streak_3');
      expect(res.updatedUnlocked).toContain('streak_7');
      expect(res.updatedUnlocked).toContain('cumulative_answers_25');
      expect(res.updatedUnlocked).toContain('cumulative_answers_50');
      expect(res.updatedUnlocked).toContain('perfect_climb_single');
    });

    it('evaluates shop and sparks accumulation badges', () => {
      const res = evaluateBadges({
        sparks: 1200,
        purchasedItemsCount: 5,
        purchasedRarities: ['rare', 'epic', 'legendary'],
        hasBoughtGemsWithRealMoney: true,
        unlockedBadges: []
      });

      expect(res.updatedUnlocked).toContain('shop_buyer_1');
      expect(res.updatedUnlocked).toContain('shop_buyer_5');
      expect(res.updatedUnlocked).toContain('rare_collector');
      expect(res.updatedUnlocked).toContain('epic_collector');
      expect(res.updatedUnlocked).toContain('legendary_collector');
      expect(res.updatedUnlocked).toContain('gem_supporter');
      expect(res.updatedUnlocked).toContain('sparks_100');
      expect(res.updatedUnlocked).toContain('sparks_500');
      expect(res.updatedUnlocked).toContain('sparks_1000');
    });
  });
});
