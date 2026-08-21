import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService.js';
import { generateSafeUsername, SAFE_ADJECTIVES, SAFE_NOUNS } from '../src/components/FirstLaunchOnboardingModal.jsx';
import { leaderboardService } from '../src/services/leaderboardService.js';

describe('Friend System & COPPA Safe Username Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Kid-Safe Username Generator', () => {
    it('generates a valid, COPPA-safe username adhering to format standards', () => {
      for (let i = 0; i < 20; i++) {
        const username = generateSafeUsername();
        expect(username).toBeDefined();
        expect(username.length).toBeGreaterThanOrEqual(3);
        expect(username.length).toBeLessThanOrEqual(20);
        // Must contain only letters and numbers, no spaces or special symbols
        expect(/^[a-zA-Z0-9_]+$/.test(username)).toBe(true);
        expect(username.includes(' ')).toBe(false);
        expect(username.includes('@')).toBe(false);
      }
    });

    it('uses curated adjectives and nouns from safe word lists', () => {
      const username = generateSafeUsername();
      const hasSafePrefix = SAFE_ADJECTIVES.some(adj => username.startsWith(adj));
      expect(hasSafePrefix).toBe(true);
    });
  });

  describe('StorageService Friend Management (Max 25)', () => {
    it('initializes with an empty friends list for a new profile', () => {
      const friends = storageService.getFriends();
      expect(Array.isArray(friends)).toBe(true);
      expect(friends.length).toBe(0);
    });

    it('adds a friend and retrieves them correctly', () => {
      const newFriend = {
        id: 'user_123_default_child',
        username: 'CosmicOtter42',
        score: 1250,
        equipped: ['holiday_santa_hat'],
        subjectsMastered: 8
      };

      const updated = storageService.addFriend(newFriend);
      expect(updated.length).toBe(1);
      expect(updated[0].username).toBe('CosmicOtter42');
      expect(updated[0].score).toBe(1250);
      expect(storageService.isFriend('CosmicOtter42')).toBe(true);
      expect(storageService.isFriend('user_123_default_child')).toBe(true);
    });

    it('prevents adding duplicate friends by ID or username', () => {
      const friendA = { id: 'friend_1', username: 'StarFalcon99', score: 1100 };
      storageService.addFriend(friendA);
      // Attempt to add duplicate
      storageService.addFriend({ id: 'friend_1', username: 'StarFalcon99', score: 1150 });
      const friends = storageService.getFriends();
      expect(friends.length).toBe(1);
    });

    it('enforces maximum friend cap of 25 friends', () => {
      for (let i = 1; i <= 25; i++) {
        storageService.addFriend({
          id: `friend_${i}`,
          username: `ClimberFriend${i}`,
          score: 1000 + i * 10
        });
      }

      expect(storageService.getFriends().length).toBe(25);

      // 26th friend should throw an error
      expect(() => {
        storageService.addFriend({
          id: 'friend_26',
          username: 'ExtraClimber26',
          score: 1500
        });
      }).toThrow(/Maximum friend limit reached/i);

      expect(storageService.getFriends().length).toBe(25);
    });

    it('removes a friend by ID or username', () => {
      storageService.addFriend({ id: 'friend_x', username: 'SwiftPanda11', score: 1300 });
      storageService.addFriend({ id: 'friend_y', username: 'NovaWolf77', score: 1400 });

      expect(storageService.getFriends().length).toBe(2);
      expect(storageService.isFriend('SwiftPanda11')).toBe(true);

      storageService.removeFriend('SwiftPanda11');
      expect(storageService.getFriends().length).toBe(1);
      expect(storageService.isFriend('SwiftPanda11')).toBe(false);
      expect(storageService.isFriend('NovaWolf77')).toBe(true);
    });
  });

  describe('Leaderboard Service Friend Operations', () => {
    it('gracefully handles search queries shorter than 2 chars', async () => {
      const result = await leaderboardService.searchUsername('a');
      expect(result).toEqual({ results: [] });
    });

    it('handles empty friend scores fetch safely', async () => {
      const result = await leaderboardService.fetchFriendScores('math', []);
      expect(result).toEqual({ standings: [] });
    });
  });
});
