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
    // Tests are skipped because promo validation has been moved to Firebase Cloud Functions
    // And relies on backend instead of client code
  });

  it.skip('normalizes promo codes properly (case-insensitive, trims hashes and spaces)', () => {
  });

  it.skip('validates active codes and rejects non-existent codes', () => {
  });

  it.skip('executes code redemption, granting sparks and exclusive item', () => {
  });

  it.skip('prevents duplicate redemption on the same profile', () => {
  });

  it.skip('grants consumables with SUMMERCLIMB code', () => {
  });
});
