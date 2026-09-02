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

  it('getNthWeekdayOfMonth and getHolidayDate dynamically compute floating holidays correctly', () => {
    // 2026 Labor Day: 1st Monday of September -> Sep 7, 2026
    const laborDay2026 = itemsCatalog.getHolidayDate(2026, 'labor_day');
    expect(laborDay2026.getUTCFullYear()).toBe(2026);
    expect(laborDay2026.getUTCMonth()).toBe(8); // 0-indexed month: 8 is Sep
    expect(laborDay2026.getUTCDate()).toBe(7);

    // 2026 Memorial Day: Last Monday of May -> May 25, 2026
    const memorialDay2026 = itemsCatalog.getHolidayDate(2026, 'memorial_day');
    expect(memorialDay2026.getUTCDate()).toBe(25);

    // 2026 Thanksgiving: 4th Thursday of Nov -> Nov 26, 2026
    const thanks2026 = itemsCatalog.getHolidayDate(2026, 'thanksgiving');
    expect(thanks2026.getUTCDate()).toBe(26);

    // 2027 Labor Day: Sep 6, 2027
    const laborDay2027 = itemsCatalog.getHolidayDate(2027, 'labor_day');
    expect(laborDay2027.getUTCDate()).toBe(6);
  });

  it('calculateRecurringWindow accurately calculates floating holiday schedule windows', () => {
    // Aug 25, 2026 is 13 days before Labor Day 2026 (Sep 7)
    const aug25 = new Date('2026-08-25T12:00:00Z');
    const schedule = { floatingHoliday: 'labor_day', daysBefore: 13, daysAfter: 3, previewDays: 7 };
    const window = itemsCatalog.calculateRecurringWindow(schedule, aug25);

    expect(window.status).toBe('active');
    expect(window.startDate.toISOString().startsWith('2026-08-25')).toBe(true);
    expect(window.endDate.toISOString().startsWith('2026-09-10')).toBe(true);
  });

  it('getActiveRealMoneySaleEvent detects active sale windows and returns null when no sale is active', () => {
    // Aug 20, 2026 is inside Back to School sale (Aug 15 - Sep 15)
    const backToSchoolDate = new Date('2026-08-20T12:00:00Z');
    const btsEvent = itemsCatalog.getActiveRealMoneySaleEvent(backToSchoolDate);
    expect(btsEvent).not.toBeNull();
    expect(btsEvent.id).toBe('back_to_school_sale');
    expect(btsEvent.sparksBonusPercent).toBe(30);

    // Nov 25, 2026 is inside Black Friday / Cyber Week (Nov 20 - Dec 2)
    const blackFridayDate = new Date('2026-11-25T12:00:00Z');
    const bfEvent = itemsCatalog.getActiveRealMoneySaleEvent(blackFridayDate);
    expect(bfEvent).not.toBeNull();
    expect(bfEvent.id).toBe('black_friday_sale');
    expect(bfEvent.sparksBonusPercent).toBe(50);

    // May 10, 2026 has no scheduled real money sale
    const offSeasonDate = new Date('2026-05-10T12:00:00Z');
    expect(itemsCatalog.getActiveRealMoneySaleEvent(offSeasonDate)).toBeNull();
  });

  it('getEffectiveSparksPackage adds bonus sparks during active sale events and preserves base values outside sales', () => {
    const rawPack = itemsCatalog.SPARKS_PACKAGES[3]; // Mountain of Sparks: 10,000 sparks @ $19.99

    // During Black Friday (+50% bonus)
    const blackFridayDate = new Date('2026-11-25T12:00:00Z');
    const bfPack = itemsCatalog.getEffectiveSparksPackage(rawPack, blackFridayDate);
    expect(bfPack.hasBonus).toBe(true);
    expect(bfPack.bonusPercent).toBe(50);
    expect(bfPack.bonusSparks).toBe(5000);
    expect(bfPack.totalSparks).toBe(15000);
    expect(bfPack.realMoneyPrice).toBe('$19.99'); // Price remains untouched

    // Outside sale
    const offSeasonDate = new Date('2026-05-10T12:00:00Z');
    const standardPack = itemsCatalog.getEffectiveSparksPackage(rawPack, offSeasonDate);
    expect(standardPack.hasBonus).toBe(false);
    expect(standardPack.bonusSparks).toBe(0);
    expect(standardPack.totalSparks).toBe(10000);
  });

  it('getEffectiveSubscriptionPricing computes promotional discounts on annual plans during sales', () => {
    // Back to School: Annual Solo is $29.99/yr (-25%), Annual Family is $44.99/yr (-25%)
    const btsDate = new Date('2026-08-20T12:00:00Z');
    const soloPricing = itemsCatalog.getEffectiveSubscriptionPricing('kibo_club_sub_annual', btsDate);
    expect(soloPricing.isDiscounted).toBe(true);
    expect(soloPricing.price).toBe('$29.99/yr');
    expect(soloPricing.originalPrice).toBe('$39.99/yr');
    expect(soloPricing.discountPercent).toBe(25);

    const familyPricing = itemsCatalog.getEffectiveSubscriptionPricing('kibo_club_family_annual', btsDate);
    expect(familyPricing.isDiscounted).toBe(true);
    expect(familyPricing.price).toBe('$44.99/yr');
    expect(familyPricing.originalPrice).toBe('$59.99/yr');

    // Monthly plans remain full price
    const monthlyPricing = itemsCatalog.getEffectiveSubscriptionPricing('kibo_club_sub', btsDate);
    expect(monthlyPricing.isDiscounted).toBe(false);
    expect(monthlyPricing.price).toBe('$4.99/mo');
  });
});

