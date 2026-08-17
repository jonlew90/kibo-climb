import { describe, it, expect, beforeEach } from 'vitest';
import { getItemAvailabilityStatus, isItemVisibleInShop, getItemsByCategory, getItemById } from '../src/utils/itemsCatalog';
import { storageService } from '../src/services/storageService';
import { promoCodeService } from '../src/services/promoCodeService';

describe('Seasonal & Promo Rotation Engine', () => {
  const testNow = new Date('2026-08-17T12:00:00Z');

  it('calculates active seasonal item status correctly', () => {
    const summerItem = {
      id: 'summer_visor',
      availableFrom: '2026-06-01T00:00:00Z',
      availableUntil: '2026-08-31T23:59:59Z'
    };
    const status = getItemAvailabilityStatus(summerItem, testNow);
    expect(status.status).toBe('active');
    expect(status.isAvailable).toBe(true);
    expect(status.daysRemaining).toBe(15);
  });

  it('calculates upcoming seasonal preview status correctly', () => {
    const autumnItem = {
      id: 'pumpkin_hat',
      availableFrom: '2026-09-01T00:00:00Z',
      availableUntil: '2026-11-15T23:59:59Z',
      previewFrom: '2026-08-01T00:00:00Z'
    };
    const status = getItemAvailabilityStatus(autumnItem, testNow);
    expect(status.status).toBe('upcoming');
    expect(status.isAvailable).toBe(false);
    expect(status.isWithinPreview).toBe(true);
    expect(status.startsInDays).toBe(15);
  });

  it('identifies expired items correctly', () => {
    const expiredItem = {
      id: 'spring_blossom',
      availableFrom: '2026-03-01T00:00:00Z',
      availableUntil: '2026-05-31T23:59:59Z'
    };
    const status = getItemAvailabilityStatus(expiredItem, testNow);
    expect(status.status).toBe('expired');
    expect(status.isAvailable).toBe(false);
    expect(status.isExpired).toBe(true);
  });

  it('ensures purchased/owned items ALWAYS remain visible in shop even if expired', () => {
    const expiredItem = {
      id: 'spring_blossom',
      availableFrom: '2026-03-01T00:00:00Z',
      availableUntil: '2026-05-31T23:59:59Z'
    };
    // Unowned: hidden
    expect(isItemVisibleInShop(expiredItem, [], testNow)).toBe(false);
    // Owned: visible
    expect(isItemVisibleInShop(expiredItem, ['spring_blossom'], testNow)).toBe(true);
  });
});

describe('Promo Code Service & Redemption', () => {
  const testNow = new Date('2026-08-17T12:00:00Z');

  beforeEach(() => {
    localStorage.clear();
    storageService.saveUserData({ sparks: 50, consumables: { streakSaverCount: 1 } });
    storageService.saveShopState([], [], []);
  });

  it('normalizes promo codes properly (case-insensitive, trims hashes and spaces)', () => {
    expect(promoCodeService.normalizeCode(' #goldenKIBO ')).toBe('GOLDENKIBO');
    expect(promoCodeService.normalizeCode('kibosparks')).toBe('KIBOSPARKS');
  });

  it('validates active codes and rejects non-existent codes', () => {
    const valGood = promoCodeService.validateCode('GOLDENKIBO', testNow);
    expect(valGood.valid).toBe(true);
    expect(valGood.promoData.code).toBe('GOLDENKIBO');

    const valBad = promoCodeService.validateCode('FAKESTUFF', testNow);
    expect(valBad.valid).toBe(false);
  });

  it('executes code redemption, granting sparks and exclusive item', () => {
    const res = promoCodeService.redeemCode('GOLDENKIBO', testNow);
    expect(res.success).toBe(true);
    expect(res.updated.sparks).toBe(200);
    expect(res.updated.unlockedItems).toContain('golden_ticket');
    expect(storageService.getRedeemedPromoCodes()).toContain('GOLDENKIBO');
  });

  it('prevents duplicate redemption on the same profile', () => {
    const res1 = promoCodeService.redeemCode('GOLDENKIBO', testNow);
    expect(res1.success).toBe(true);

    const res2 = promoCodeService.redeemCode('GOLDENKIBO', testNow);
    expect(res2.success).toBe(false);
    expect(res2.reason).toMatch(/already been redeemed/i);
  });

  it('grants consumables with SUMMERCLIMB code', () => {
    const res = promoCodeService.redeemCode('SUMMERCLIMB', testNow);
    expect(res.success).toBe(true);
    expect(res.updated.sparks).toBe(150); // 50 + 100
    expect(res.updated.consumables.streakSaverCount).toBe(3); // 1 + 2
    expect(res.updated.consumables.hintScrollCount).toBe(2);
  });
});
