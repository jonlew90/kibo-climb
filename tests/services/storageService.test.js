import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storageService, DEFAULT_PROFILE_ID } from '../../src/services/storageService.js';

describe('storageService', () => {
  // Mock localStorage as state caching may interfere across tests
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { mockStorage[key] = val; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });

    // reset module state cache by artificially invoking something that creates fresh state if local storage is clear.
    // Given state is cached in a closure `cachedProfilesState`, we will clear localstorage so that safeGetProfilesState will return fresh defaults
    storageService.setActiveProfileId('__reset__');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Profiles Management', () => {
    it('returns default profile id if not set', () => {
      // Force empty
      mockStorage = {};
      expect(storageService.getActiveProfileId()).toBe('default_child');
    });

    it('sets and gets active profile id if profile exists', () => {
      const mockProfiles = {
        activeProfileId: 'prof_1',
        profiles: {
          prof_2: { id: 'prof_2', name: 'Other User' }
        }
      };
      mockStorage['kibo_profiles_data'] = JSON.stringify(mockProfiles);

      // Need to re-trigger cache load if there was one
      storageService.setActiveProfileId('prof_2');
      expect(storageService.getActiveProfileId()).toBe('prof_2');
    });

    it('gets active profile details', () => {
      const mockProfiles = {
        activeProfileId: 'prof_1',
        profiles: {
          prof_1: { id: 'prof_1', name: 'Test User' },
          prof_2: { id: 'prof_2', name: 'Other User' }
        }
      };
      mockStorage['kibo_profiles_data'] = JSON.stringify(mockProfiles);

      const profile = storageService.getActiveProfile();
      expect(profile).not.toBeNull();
      expect(profile.id).toBe('prof_1');
      expect(profile.name).toBe('Test User');
    });
  });

  describe('User Data', () => {
    beforeEach(() => {
      const defaultData = {
        activeProfileId: 'default_child',
        profiles: {
          default_child: {
            id: 'default_child',
            name: 'Default',
            subjects: {
              math: { sparks: 0, rating: 1000, tier: 1 }
            }
          }
        }
      };
      mockStorage['kibo_profiles_data'] = JSON.stringify(defaultData);

      // trigger cache reload by mutating something safe
      storageService.setActiveProfileId('default_child');
    });

    it('saves and retrieves user data', () => {
      storageService.saveUserData({
        sparks: 50,
        rating: 1200,
        tier: 2
      }, 'math');

      const data = storageService.getUserData('math');
      expect(data.sparks).toBe(50);
      expect(data.rating).toBe(1200);
      expect(data.tier).toBe(2);
    });

    it('handles global (legacy) data correctly when saving', () => {
      storageService.saveUserData({
        onboarded: true,
      });

      const data = storageService.getUserData('math');
      expect(data.onboarded).toBe(true);
    });
  });

  describe('Shop State', () => {
    beforeEach(() => {
      mockStorage = {};
    });

    it('gets default shop state', () => {
      const state = storageService.getShopState();
      expect(state.equippedItems).toEqual([]);
      expect(state.unlockedItems).toEqual([]);
    });

    it('saves and retrieves shop state', () => {
      storageService.saveShopState(['item1'], ['item1', 'item2']);
      const state = storageService.getShopState();
      expect(state.equippedItems).toEqual(['item1']);
      expect(state.unlockedItems).toEqual(['item1', 'item2']);
    });
  });

  describe('Promo Codes', () => {
    beforeEach(() => {
      mockStorage = {};
    });

    it('gets empty array for unredeemed codes', () => {
      expect(storageService.getRedeemedPromoCodes()).toEqual([]);
    });

    it('adds and retrieves redeemed codes', () => {
      const updated = storageService.addRedeemedPromoCode('SUMMER');
      expect(updated).toEqual(['SUMMER']);
      expect(storageService.getRedeemedPromoCodes()).toEqual(['SUMMER']);
    });
  });

  describe('Settings / Preferences', () => {
    beforeEach(() => {
      mockStorage = {};
    });

    it('gets default notification settings', () => {
      const prefs = storageService.getNotificationSettings();
      expect(prefs).toBeDefined();
    });
  });
});
