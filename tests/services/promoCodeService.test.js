import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We must mock firebase/functions and firebase config before imports
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
  getFunctions: vi.fn()
}));

vi.mock('../../src/config/firebase.js', () => ({
  functions: {},
  auth: { currentUser: null },
  db: {}
}));

// We also mock leaderboardService to prevent it from initializing auth
vi.mock('../../src/services/leaderboardService.js', () => ({
  leaderboardService: {
    syncScore: vi.fn(),
    getLeaderboard: vi.fn(),
  }
}));

import { promoCodeService } from '../../src/services/promoCodeService.js';
import { storageService } from '../../src/services/storageService.js';
import { shopLedgerService } from '../../src/services/shopLedgerService.js';
import * as firebaseFunctions from 'firebase/functions';

describe('promoCodeService', () => {
  beforeEach(() => {
    vi.spyOn(storageService, 'getRedeemedPromoCodes').mockReturnValue(['OLDCODE']);
    vi.spyOn(storageService, 'getActiveProfile').mockReturnValue({ id: 'prof_1' });
    vi.spyOn(storageService, 'getUserData').mockReturnValue({ sparks: 100, consumables: { potion: 1 } });
    vi.spyOn(storageService, 'getShopState').mockReturnValue({ unlockedItems: ['item1'] });


    vi.spyOn(storageService, 'addRedeemedPromoCode').mockReturnValue(['OLDCODE', 'NEWCODE']);
    vi.spyOn(storageService, 'saveShopState').mockImplementation(() => {});
    vi.spyOn(storageService, 'saveUserData').mockImplementation(() => {});
    vi.spyOn(shopLedgerService, 'recordTransactionLedger').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeCode', () => {
    it('normalizes promo code properly (case-insensitive, trims hashes and spaces)', () => {
      expect(promoCodeService.normalizeCode(' #sumMERclimb  ')).toBe('SUMMERCLIMB');
      expect(promoCodeService.normalizeCode('kibo123')).toBe('KIBO123');
      expect(promoCodeService.normalizeCode(null)).toBe('');
    });
  });

  describe('hasRedeemedCode', () => {
    it('returns true if code is already redeemed', () => {
      expect(promoCodeService.hasRedeemedCode('oldCode')).toBe(true);
      expect(promoCodeService.hasRedeemedCode('#OLDCODE')).toBe(true);
    });

    it('returns false if code is not redeemed', () => {
      expect(promoCodeService.hasRedeemedCode('NEWCODE')).toBe(false);
    });
  });

  describe('redeemCode', () => {
    it('fails if code is empty', async () => {
      const res = await promoCodeService.redeemCode('   ');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Please enter a promo code.');
    });

    it('fails if code is already redeemed', async () => {
      const res = await promoCodeService.redeemCode('OLDCODE');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('This promo code has already been redeemed on this profile.');
    });

    it('handles backend validation error', async () => {
      firebaseFunctions.httpsCallable.mockReturnValue(() => {
        return Promise.reject(new Error('Invalid code'));
      });
      const res = await promoCodeService.redeemCode('INVALID');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('Invalid code');
    });

    it('executes code redemption, granting sparks, items and consumables', async () => {
      const mockCallable = vi.fn().mockResolvedValue({
        data: {
          code: 'NEWCODE',
          title: 'Summer Splash',
          description: 'A summer reward',
          badge: 'summer_badge',
          rewards: {
            sparks: 50,
            items: ['item2'],
            consumables: { shield: 2 }
          }
        }
      });
      firebaseFunctions.httpsCallable.mockReturnValue(mockCallable);

      const res = await promoCodeService.redeemCode('newCode');

      expect(mockCallable).toHaveBeenCalledWith({ code: 'NEWCODE' });
      expect(res.success).toBe(true);
      expect(res.reward.sparks).toBe(50);
      expect(res.reward.items).toContain('item2');
      expect(res.reward.consumables.shield).toBe(2);

      expect(storageService.saveUserData).toHaveBeenCalledWith(expect.objectContaining({
        sparks: 150, // 100 + 50
        consumables: { potion: 1, shield: 2 }
      }));
      expect(storageService.saveShopState).toHaveBeenCalledWith(
        expect.any(Array),
        ['item1', 'item2'],
        ['OLDCODE', 'NEWCODE']
      );

      expect(shopLedgerService.recordTransactionLedger).toHaveBeenCalledWith(expect.objectContaining({
        type: 'PROMO_CODE_REDEMPTION',
        code: 'NEWCODE',
        sparksGranted: 50
      }));
    });

    it('handles empty rewards gracefully', async () => {
      const mockCallable = vi.fn().mockResolvedValue({
        data: {
          code: 'EMPTYREWARD',
          title: 'Just a title'
        }
      });
      firebaseFunctions.httpsCallable.mockReturnValue(mockCallable);

      const res = await promoCodeService.redeemCode('emptyreward');
      expect(res.success).toBe(true);
      expect(res.updated.sparks).toBe(100); // Unchanged
    });
  });
});
