import { WORKSHOP_ITEMS, SEASONAL_EVENTS, calculateRecurringWindow, getItemAvailabilityStatus, getItemsByCategory, isItemVisibleInShop, isSeasonalEventAvailableOrUpcoming, getAvailableSeasonalEvents } from '../src/utils/itemsCatalog.js';

console.log('🧪 Starting Seasonal Catalog Test Suite...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Verify item catalog inventory
const seasonalItems = WORKSHOP_ITEMS.filter((i) => i.category === 'seasonal');
assert(seasonalItems.length >= 35, `Catalog contains at least 35 seasonal items (found ${seasonalItems.length})`);

seasonalItems.forEach((item) => {
  assert(item.cost >= 90 && item.cost <= 250, `Item ${item.id} has reasonable price of ${item.cost} ⚡`);
  assert(!!item.recurringSchedule, `Item ${item.id} has recurringSchedule defined`);
  if (item.recurringSchedule.floatingHoliday) {
    assert(typeof item.recurringSchedule.floatingHoliday === 'string', `Item ${item.id} floatingHoliday is valid`);
  } else {
    assert(item.recurringSchedule.startMonth >= 1 && item.recurringSchedule.startMonth <= 12, `Item ${item.id} startMonth is valid`);
    assert(item.recurringSchedule.endMonth >= 1 && item.recurringSchedule.endMonth <= 12, `Item ${item.id} endMonth is valid`);
  }
});

// 2. Test specific holiday & season rotations
console.log('\n📅 Testing Holiday & Season Date Rotations:');

// Halloween (Oct 28)
const halloweenDate = new Date(2026, 9, 28); // Oct 28
const pumpkinHat = WORKSHOP_ITEMS.find((i) => i.id === 'pumpkin_hat');
const pumpkinStatus = getItemAvailabilityStatus(pumpkinHat, halloweenDate);
assert(pumpkinStatus.status === 'active', `Pumpkin Hat is active on Oct 28 (daysRemaining: ${pumpkinStatus.daysRemaining})`);

// Christmas / Holiday Season (Dec 20)
const christmasDate = new Date(2026, 11, 20); // Dec 20
const santaHat = WORKSHOP_ITEMS.find((i) => i.id === 'holiday_santa_hat');
const santaStatus = getItemAvailabilityStatus(santaHat, christmasDate);
assert(santaStatus.status === 'active', `Santa Hat is active on Dec 20 (daysRemaining: ${santaStatus.daysRemaining})`);

// New Year (Jan 1)
const newYearDate = new Date(2027, 0, 1); // Jan 1, 2027
const newYearHat = WORKSHOP_ITEMS.find((i) => i.id === 'new_year_top_hat');
const newYearStatus = getItemAvailabilityStatus(newYearHat, newYearDate);
assert(newYearStatus.status === 'active', `New Year Top Hat is active on Jan 1 across year boundary (daysRemaining: ${newYearStatus.daysRemaining})`);

// 4th of July (July 4)
const july4Date = new Date(2026, 6, 4); // Jul 4
const uncleSamHat = WORKSHOP_ITEMS.find((i) => i.id === 'july4_uncle_sam_hat');
const july4Status = getItemAvailabilityStatus(uncleSamHat, july4Date);
assert(july4Status.status === 'active', `Uncle Sam Hat is active on July 4 (daysRemaining: ${july4Status.daysRemaining})`);

// Valentine's Day (Feb 14)
const valentinesDate = new Date(2026, 1, 14); // Feb 14
const heartShades = WORKSHOP_ITEMS.find((i) => i.id === 'valentines_heart_shades');
const vStatus = getItemAvailabilityStatus(heartShades, valentinesDate);
assert(vStatus.status === 'active', `Valentine's Heart Shades active on Feb 14 (daysRemaining: ${vStatus.daysRemaining})`);

// St. Patrick's Day (Mar 17)
const stPatDate = new Date(2026, 2, 17); // Mar 17
const leprechaunHat = WORKSHOP_ITEMS.find((i) => i.id === 'st_patricks_leprechaun_hat');
const stPatStatus = getItemAvailabilityStatus(leprechaunHat, stPatDate);
assert(stPatStatus.status === 'active', `Leprechaun Hat is active on Mar 17 (daysRemaining: ${stPatStatus.daysRemaining})`);

// Thanksgiving (Nov 26)
const tDate = new Date(2026, 10, 26); // Nov 26
const turkeyHat = WORKSHOP_ITEMS.find((i) => i.id === 'thanksgiving_turkey_hat');
const tStatus = getItemAvailabilityStatus(turkeyHat, tDate);
assert(tStatus.status === 'active', `Turkey Hat is active on Nov 26 (daysRemaining: ${tStatus.daysRemaining})`);

// Upcoming Preview Check (Oct 15 for Halloween items starting Oct 24 with 14-day preview)
const previewDate = new Date(2026, 9, 15); // Oct 15 (within 14 days preview of Oct 24)
const ghostPet = WORKSHOP_ITEMS.find((i) => i.id === 'halloween_ghost_pet');
const ghostStatus = getItemAvailabilityStatus(ghostPet, previewDate);
assert(ghostStatus.status === 'upcoming', `Halloween Ghost is upcoming on Oct 15 (starts in: ${ghostStatus.startsInDays}d)`);

// 3. Wardrobe retention test: Owned items must ALWAYS be visible even out of season
console.log('\n🎒 Testing Wardrobe Retention for Unlocked Items:');
const outOfSeasonDate = new Date(2026, 4, 15); // May 15 (Halloween is long gone)
const unlockedItems = ['pumpkin_hat'];
const isVisibleOwned = isItemVisibleInShop(pumpkinHat, unlockedItems, outOfSeasonDate);
assert(isVisibleOwned === true, 'Owned Pumpkin Hat is visible in wardrobe even when out of season in May');

const unownedPumpkinVisible = isItemVisibleInShop(pumpkinHat, [], outOfSeasonDate);
assert(unownedPumpkinVisible === false, 'Unowned Pumpkin Hat is hidden from general shop view in May');

// 4. Seasonal filter visibility tests (only currently available or upcoming filters are shown)
console.log('\n🔍 Testing Seasonal Filter Availability:');
const aug17 = new Date('2026-08-17T12:00:00Z');
const aug17Filters = getAvailableSeasonalEvents(aug17);
const aug17Ids = aug17Filters.map((e) => e.id);
assert(aug17Ids.includes('all_active'), 'aug17 filters includes all_active');
assert(aug17Ids.includes('summer'), 'aug17 filters includes summer (active)');
assert(!aug17Ids.includes('winter'), 'aug17 filters excludes winter (far off)');
assert(!aug17Ids.includes('halloween'), 'aug17 filters excludes halloween (far off in August)');
assert(!aug17Ids.includes('holiday_season'), 'aug17 filters excludes holiday_season (far off in August)');

// Test upcoming event inclusion
const oct15 = new Date('2026-10-15T12:00:00Z');
const oct15Filters = getAvailableSeasonalEvents(oct15);
const oct15Ids = oct15Filters.map((e) => e.id);
assert(oct15Ids.includes('autumn'), 'oct15 filters includes autumn (active in Oct)');
assert(oct15Ids.includes('halloween'), 'oct15 filters includes halloween (upcoming preview within 14 days of Oct 24)');
assert(!oct15Ids.includes('spring'), 'oct15 filters excludes spring');

// Test winter holiday inclusion
const dec25 = new Date('2026-12-25T12:00:00Z');
const dec25Filters = getAvailableSeasonalEvents(dec25);
const dec25Ids = dec25Filters.map((e) => e.id);
assert(dec25Ids.includes('winter'), 'dec25 filters includes winter');
assert(dec25Ids.includes('holiday_season'), 'dec25 filters includes holiday_season');
assert(dec25Ids.includes('new_year'), 'dec25 filters includes new_year (upcoming preview for Dec 29)');
assert(!dec25Ids.includes('summer'), 'dec25 filters excludes summer');

console.log(`\n========================================`);
console.log(`Test Results: ${passCount} Passed, ${failCount} Failed`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Seasonal Catalog Tests Passed Successfully!');
}

