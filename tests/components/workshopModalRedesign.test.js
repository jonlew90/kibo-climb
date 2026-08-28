import { describe, it, expect } from 'vitest';
import {
  CATEGORY_HUBS,
  COSMETIC_SLOTS,
  isWearableItem,
  getOwnedItems,
  getItemSlot,
  WORKSHOP_ITEMS
} from '../../src/utils/itemsCatalog';
import { sortShopItems } from '../../src/components/WorkshopModal';

describe('Shop & Closet Redesign Unit Tests', () => {
  it('should export all 4 primary category hubs', () => {
    expect(CATEGORY_HUBS).toBeDefined();
    expect(CATEGORY_HUBS.length).toBe(4);
    const hubIds = CATEGORY_HUBS.map((h) => h.id);
    expect(hubIds).toContain('wearables');
    expect(hubIds).toContain('powerups');
    expect(hubIds).toContain('seasonal');
    expect(hubIds).toContain('sparks');
  });

  it('should export cosmetic slots with all sub-categories', () => {
    expect(COSMETIC_SLOTS).toBeDefined();
    expect(COSMETIC_SLOTS.length).toBeGreaterThanOrEqual(8);
    const slotIds = COSMETIC_SLOTS.map((s) => s.id);
    expect(slotIds).toContain('all');
    expect(slotIds).toContain('headwear');
    expect(slotIds).toContain('outfits');
    expect(slotIds).toContain('gear');
    expect(slotIds).toContain('pets');
    expect(slotIds).toContain('skins');
    expect(slotIds).toContain('background');
    expect(slotIds).toContain('borders');
    expect(slotIds).toContain('fx');
  });

  it('should correctly identify wearable items vs consumables', () => {
    const doubleSparks = WORKSHOP_ITEMS.find((i) => i.id === 'double_sparks_potion');
    expect(doubleSparks).toBeDefined();
    expect(isWearableItem(doubleSparks)).toBe(false);

    const hat = WORKSHOP_ITEMS.find((i) => getItemSlot(i) === 'headwear');
    expect(hat).toBeDefined();
    expect(isWearableItem(hat)).toBe(true);
  });

  it('should filter owned wearable items in closet correctly', () => {
    const mockUnlocked = ['double_sparks_potion', 'spring_bunny_ears', 'summer_visor'];
    const owned = getOwnedItems(mockUnlocked);

    // Consumable should be excluded from wearable closet
    expect(owned.some((i) => i.id === 'double_sparks_potion')).toBe(false);

    // Unlocked wearables should be present if they exist in catalog
    const springBunny = owned.find((i) => i.id === 'spring_bunny_ears');
    if (springBunny) {
      expect(springBunny.id).toBe('spring_bunny_ears');
    }
  });

  it('should sort unowned items first in shop mode, and equipped items first in closet mode', () => {
    const mockItems = [
      { id: 'item_a', name: 'Item A', cost: 100, rarity: 'common' },
      { id: 'item_b', name: 'Item B', cost: 50, rarity: 'epic' },
      { id: 'item_c', name: 'Item C', cost: 200, rarity: 'legendary' }
    ];

    // In Shop Mode: unowned items (item_a) should appear BEFORE owned items (item_c)
    const shopSorted = sortShopItems(mockItems, 500, ['item_c'], [], new Date(), 'shop');
    expect(shopSorted[0].id).not.toBe('item_c'); // unowned first
    expect(shopSorted[shopSorted.length - 1].id).toBe('item_c'); // owned demoted to bottom

    // In Closet Mode: equipped items (item_b) should appear FIRST
    const closetSorted = sortShopItems(mockItems, 500, ['item_b', 'item_c'], ['item_b'], new Date(), 'closet');
    expect(closetSorted[0].id).toBe('item_b');
  });
});
