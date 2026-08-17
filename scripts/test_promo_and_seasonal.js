// Verification Test Script for Seasonal/Promo Items and Promo Code Redemption

import { getItemAvailabilityStatus, isItemVisibleInShop, getItemsByCategory, getItemById } from '../src/utils/itemsCatalog.js';

// Setup Mock LocalStorage for node environment
const storageStore = {};
globalThis.localStorage = {
  getItem: (key) => storageStore[key] || null,
  setItem: (key, val) => { storageStore[key] = String(val); },
  removeItem: (key) => { delete storageStore[key]; },
  clear: () => { Object.keys(storageStore).forEach((k) => delete storageStore[k]); }
};

import { storageService } from '../src/services/storageService.js';
import { promoCodeService } from '../src/services/promoCodeService.js';

function runTests() {
  console.log('--- Starting Seasonal & Promo Engine Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Availability Status Calculation
  const testNow = new Date('2026-08-17T12:00:00Z');

  const summerItem = {
    id: 'summer_visor',
    availableFrom: '2026-06-01T00:00:00Z',
    availableUntil: '2026-08-31T23:59:59Z'
  };
  const summerStatus = getItemAvailabilityStatus(summerItem, testNow);
  assert(summerStatus.status === 'active' && summerStatus.daysRemaining === 15, 'Summer item is active with 15 days remaining');

  const autumnItem = {
    id: 'pumpkin_hat',
    availableFrom: '2026-09-01T00:00:00Z',
    availableUntil: '2026-11-15T23:59:59Z',
    previewFrom: '2026-08-01T00:00:00Z'
  };
  const autumnStatus = getItemAvailabilityStatus(autumnItem, testNow);
  assert(autumnStatus.status === 'upcoming' && autumnStatus.isWithinPreview === true && autumnStatus.startsInDays === 15, 'Autumn item is upcoming and within preview window');

  const expiredItem = {
    id: 'spring_blossom',
    availableFrom: '2026-03-01T00:00:00Z',
    availableUntil: '2026-05-31T23:59:59Z'
  };
  const expiredStatus = getItemAvailabilityStatus(expiredItem, testNow);
  assert(expiredStatus.status === 'expired' && expiredStatus.isExpired === true, 'Expired item is identified as expired');

  // 2. Test Shop Visibility Rules
  // Expired unowned item should be hidden
  assert(isItemVisibleInShop(expiredItem, [], testNow) === false, 'Unowned expired item is hidden from shop');
  // Expired OWNED item should ALWAYS be visible
  assert(isItemVisibleInShop(expiredItem, ['spring_blossom'], testNow) === true, 'OWNED expired item remains visible in shop');
  // Upcoming preview item is visible
  assert(isItemVisibleInShop(autumnItem, [], testNow) === true, 'Upcoming item in preview window is visible in shop');

  // 3. Test Promo Code Service Normalization & Validation
  assert(promoCodeService.normalizeCode(' #goldenKIBO ') === 'GOLDENKIBO', 'Normalizes messy code string to uppercase');

  const initialVal = promoCodeService.validateCode('GOLDENKIBO', testNow);
  assert(initialVal.valid === true && initialVal.promoData.code === 'GOLDENKIBO', 'Validates active code GOLDENKIBO');

  const invalidVal = promoCodeService.validateCode('NOTAREALCODE', testNow);
  assert(invalidVal.valid === false, 'Rejects non-existent promo code');

  // 4. Test Promo Code Redemption Execution
  storageService.saveUserData({ sparks: 50, consumables: { streakSaverCount: 1 } });
  storageService.saveShopState([], []);

  const redeemRes = promoCodeService.redeemCode('GOLDENKIBO', testNow);
  assert(redeemRes.success === true, 'GOLDENKIBO redeemed successfully');
  assert(redeemRes.updated.sparks === 200, 'Sparks increased by 150 (from 50 to 200)');
  assert(redeemRes.updated.unlockedItems.includes('golden_ticket'), 'golden_ticket added to unlocked items');

  // 5. Test Duplicate Prevention
  const duplicateRes = promoCodeService.redeemCode('GOLDENKIBO', testNow);
  assert(duplicateRes.success === false && duplicateRes.reason.includes('already been redeemed'), 'Duplicate redemption is blocked');

  // 6. Test Consumables Promo Code (SUMMERCLIMB)
  const summerRedeem = promoCodeService.redeemCode('SUMMERCLIMB', testNow);
  assert(summerRedeem.success === true, 'SUMMERCLIMB redeemed successfully');
  assert(summerRedeem.updated.consumables.streakSaverCount === 3, 'Streak saver count increased by 2 (1 to 3)');
  assert(summerRedeem.updated.consumables.hintScrollCount === 2, 'Hint scroll count increased by 2');
  assert(summerRedeem.updated.sparks === 300, 'Sparks increased by 100 (from 200 to 300)');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
