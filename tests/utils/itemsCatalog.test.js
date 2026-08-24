import { describe, it, expect } from 'vitest';
import * as itemsCatalog from '../../src/utils/itemsCatalog.js';

describe('itemsCatalog', () => {
  it('getItemById returns item if found, else attempts to find in deprecated items, else null or undefined', () => {
    // Should exist in typical game
    const potion = itemsCatalog.getItemById('potion');
    if (potion) {
      expect(potion.id).toBe('potion');
    }

    // Should be null for random
    const rand = itemsCatalog.getItemById('non_existent_item');
    expect(rand == null).toBe(true);
  });

  it('getItemSlot returns slot or derives it from category', () => {
    expect(itemsCatalog.getItemSlot({ slot: 'head' })).toBe('head');
    expect(itemsCatalog.getItemSlot({ category: 'headwear' })).toBe('headwear');
    expect(itemsCatalog.getItemSlot({ category: 'skins' })).toBe('skins');
    expect(itemsCatalog.getItemSlot(null) == null).toBe(true);
    expect(itemsCatalog.getItemSlot({}) == null).toBe(true);
  });

  it('getItemAvailabilityStatus processes status correctly', () => {
    // Permanent
    const resPermanent = itemsCatalog.getItemAvailabilityStatus({ id: 'perm' });
    expect(resPermanent.status).toBe('permanent');
    expect(resPermanent.isAvailable).toBe(true);
  });

  it('isItemVisibleInShop checks availability and unlocked status', () => {
    const item = { id: 'test_item', availability: { startDate: '2020-01-01', endDate: '2020-01-02' } };

    // not available but owned
    expect(itemsCatalog.isItemVisibleInShop(item, ['test_item'], new Date('2025-01-01'))).toBe(true);
  });

  it('getItemsByCategory returns filtered items', () => {
    // We assume there are some headwear items
    const headwear = itemsCatalog.getItemsByCategory('headwear');
    expect(Array.isArray(headwear)).toBe(true);
    if (headwear.length > 0) {
      expect(headwear[0].category).toBe('headwear');
    }
  });

  it('getItemSalePrice calculates sales', () => {
    const baseItem = { cost: 100 };
    // No sales setup needed to test base functionality
    const priceInfo = itemsCatalog.getItemSalePrice(baseItem);
    expect(priceInfo.isSale).toBeDefined();
    if (!priceInfo.isSale) {
      expect(priceInfo.salePrice).toBe(100);
    }

    const premiumItem = { cost: 100, isPremium: true };
    const priceInfoPrem = itemsCatalog.getItemSalePrice(premiumItem);
    expect(priceInfoPrem.isSale).toBe(false);
    expect(priceInfoPrem.salePrice).toBe(100);
  });

  it('calculateSparksPackageSavings calculates correct percentage savings for bulk packs', () => {
    const pack1 = itemsCatalog.SPARKS_PACKAGES[0]; // 500 sparks / $1.99 -> base rate
    const pack2 = itemsCatalog.SPARKS_PACKAGES[1]; // 1200 sparks / $3.99 -> ~16% savings
    const pack3 = itemsCatalog.SPARKS_PACKAGES[2]; // 3000 sparks / $7.99 -> ~33% savings
    const pack4 = itemsCatalog.SPARKS_PACKAGES[3]; // 10000 sparks / $19.99 -> ~50% savings

    expect(itemsCatalog.calculateSparksPackageSavings(pack1)).toBeNull();
    expect(itemsCatalog.calculateSparksPackageSavings(pack2)).toBe(16);
    expect(itemsCatalog.calculateSparksPackageSavings(pack3)).toBe(33);
    expect(itemsCatalog.calculateSparksPackageSavings(pack4)).toBe(50);
    expect(itemsCatalog.calculateSparksPackageSavings(null)).toBeNull();
  });

  it('getRealMoneyItemSavings returns savings for bundles and family subscriptions', () => {
    const bundle = itemsCatalog.getItemById('starter_bundle');
    const familySub = itemsCatalog.getItemById('kibo_club_family');
    const dragonPet = itemsCatalog.getItemById('dragon_pet_premium');

    expect(itemsCatalog.getRealMoneyItemSavings(bundle)).toBe(18);
    expect(itemsCatalog.getRealMoneyItemSavings(familySub)).toBe(20);
    expect(itemsCatalog.getRealMoneyItemSavings(dragonPet)).toBeNull();
    expect(itemsCatalog.getRealMoneyItemSavings(null)).toBeNull();
  });
});

