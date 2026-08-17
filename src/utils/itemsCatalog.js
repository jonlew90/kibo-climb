// Workshop Catalog with Categories & Rarity Tiers for Kibo Math

export const ITEM_CATEGORIES = [
  { id: 'powerups', label: 'Power-Ups' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'gear', label: 'Gear' },
  { id: 'outfits', label: 'Outfits' },
  { id: 'pets', label: 'Pets' },
  { id: 'fx', label: 'Visual FX' },
  { id: 'skins', label: 'Kibo Skins' },
  { id: 'background', label: 'Backgrounds' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'promo', label: 'Promo Exclusives' },
  { id: 'get_sparks', label: 'Get Sparks' },
  { id: 'premium', label: 'Premium & Bundles' }
];

export const RARITY_TIERS = {
  common: {
    label: 'Common',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  rare: {
    label: 'Rare',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  epic: {
    label: 'Epic',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  legendary: {
    label: 'Legendary',
    badgeClass: 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-950 border-amber-400 font-black'
  }
};

export const WORKSHOP_ITEMS = [
  // CONSUMABLE POWER-UPS (Category: powerups)
  {
    id: 'double_sparks_potion',
    name: 'Double Sparks Potion',
    category: 'powerups',
    cost: 12,
    rarity: 'common',
    isConsumable: true,
    icon: '🧪',
    badgeTag: '2x Profit!',
    description: 'Costs 12 Sparks. Doubles all Sparks earned in your next climb session!'
  },

  {
    id: 'hint_scroll',
    name: 'Wisdom Hint Scroll',
    category: 'powerups',
    cost: 8,
    rarity: 'common',
    isConsumable: true,
    icon: '📜',
    badgeTag: 'Instant Hint!',
    description: 'Costs 8 Sparks. Instantly reveals a helpful step-by-step Kibo hint for any active problem!'
  },

  {
    id: 'kibo_shield',
    name: 'Kibo Shield',
    category: 'powerups',
    cost: 50,
    rarity: 'epic',
    isConsumable: true,
    icon: '🛡️',
    description: 'Costs 50 Sparks. Absorbs 1 incorrect answer to protect your in-session answer streak and multipliers (does not alter accuracy %).'
  },
  {
    id: 'streak_saver',
    name: 'Daily Streak Saver',
    category: 'powerups',
    cost: 100,
    rarity: 'legendary',
    isConsumable: true,
    icon: '🔥',
    description: 'Costs 100 Sparks. Protects 1 missed calendar day of climbing from resetting your daily streak.'
  },

  // HEADWEAR (Slot: headwear)
  {
    id: 'cap',
    name: 'Baseball Cap',
    category: 'headwear',
    cost: 30,
    rarity: 'common',
    description: 'Cool blue forward-facing baseball cap.'
  },
  {
    id: 'bandana',
    name: 'Climber Bandana',
    category: 'headwear',
    cost: 50,
    rarity: 'common',
    description: 'Crimson adventurer bandana.'
  },
  {
    id: 'goggles',
    name: 'Aviator Goggles',
    category: 'headwear',
    cost: 85,
    rarity: 'rare',
    description: 'Retro golden aviator flight goggles.'
  },
  {
    id: 'headphones_neon',
    name: 'Neon Headphones',
    category: 'headwear',
    cost: 150,
    rarity: 'rare',
    description: 'Keep the math beats going while climbing Mount Kibo!'
  },
  {
    id: 'ninja_headband',
    name: 'Ninja Headband',
    category: 'headwear',
    cost: 250,
    rarity: 'rare',
    description: 'A sleek black shinobi headband for stealthy climbs.'
  },
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    category: 'headwear',
    cost: 350,
    rarity: 'epic',
    description: 'Mystical starry purple archmage wizard hat.'
  },
  {
    id: 'explorer_hat',
    name: 'Explorer Fedora',
    category: 'headwear',
    cost: 550,
    rarity: 'epic',
    requiredRank: 1200,
    description: 'Classic leather safari explorer hat for peak summits.'
  },
  {
    id: 'crown',
    name: 'Gold Crown',
    category: 'headwear',
    cost: 1500,
    rarity: 'legendary',
    requiredRank: 1600,
    description: 'Royal jeweled golden crown for math royalty!'
  },

  // GEAR (Slot: gear)
  {
    id: 'canteen',
    name: 'Water Canteen',
    category: 'gear',
    cost: 45,
    rarity: 'common',
    description: 'Hydrating trail canteen for long climb sprints.'
  },
  {
    id: 'backpack',
    name: 'Explorer Backpack',
    category: 'gear',
    cost: 160,
    rarity: 'rare',
    description: 'Heavy duty expedition climbing backpack.'
  },
  {
    id: 'grappling_hook',
    name: 'Grappling Hook',
    category: 'gear',
    cost: 250,
    rarity: 'rare',
    description: 'Essential climbing gear for reaching those high peaks faster.'
  },
  {
    id: 'lantern',
    name: 'Glimmer Lantern',
    category: 'gear',
    cost: 450,
    rarity: 'epic',
    description: 'Glowing warm oil lantern held for night climbs.'
  },
  {
    id: 'jetpack',
    name: 'Rocket Jetpack',
    category: 'gear',
    cost: 750,
    rarity: 'epic',
    requiredRank: 1350,
    description: 'Futuristic twin rocket thruster jetpack!'
  },
  {
    id: 'climbing_poles',
    name: 'Climbing Poles',
    category: 'gear',
    cost: 1600,
    rarity: 'legendary',
    requiredRank: 1550,
    description: 'Pro-tier telescopic carbon fiber climbing & trekking poles.'
  },

  // OUTFITS (Slot: outfits)
  {
    id: 'bowtie',
    name: 'Red Bowtie',
    category: 'outfits',
    cost: 25,
    rarity: 'common',
    description: 'Classy crimson 3D bowtie.'
  },
  {
    id: 'vest',
    name: 'Padded Vest',
    category: 'outfits',
    cost: 140,
    rarity: 'rare',
    description: 'Quilted sky-blue puffer vest with climber crest.'
  },
  {
    id: 'summit_scarf',
    name: 'Summit Scarf',
    category: 'outfits',
    cost: 350,
    rarity: 'epic',
    requiredRank: 1100,
    description: 'Cozy knitted winter scarf with gold stripes.'
  },
  {
    id: 'astronaut_suit',
    name: 'Astronaut Suit',
    category: 'outfits',
    cost: 800,
    rarity: 'epic',
    requiredRank: 1250,
    description: 'A stellar spacesuit for climbing beyond the atmosphere!'
  },
  {
    id: 'royal_cape',
    name: 'Royal Velvet Cape',
    category: 'outfits',
    cost: 1400,
    rarity: 'legendary',
    requiredRank: 1500,
    description: 'Majestic purple velvet cape with golden trim.'
  },

  // PETS (Category: pets)
  {
    id: 'snowy_owl',
    name: 'Snowy Owl Chick',
    category: 'pets',
    cost: 50,
    rarity: 'common',
    description: 'Adorable snowy owl companion resting by Kibo.'
  },
  {
    id: 'alpine_fox',
    name: 'Alpine Fox Cub',
    category: 'pets',
    cost: 180,
    rarity: 'rare',
    description: 'Playful arctic mountain fox cub companion.'
  },
  {
    id: 'mini_robot',
    name: 'Mini Robot Companion',
    category: 'pets',
    cost: 350,
    rarity: 'rare',
    description: 'A friendly floating robot companion to beep and boop by your side.'
  },
  {
    id: 'phoenix_pet',
    name: 'Phoenix Flame Pet',
    category: 'pets',
    cost: 650,
    rarity: 'epic',
    description: 'Mythical fiery phoenix companion floating beside Kibo!'
  },
  {
    id: 'frost_dragon',
    name: 'Frost Dragon Pet',
    category: 'pets',
    cost: 900,
    rarity: 'epic',
    requiredRank: 1300,
    description: 'Mystic ice dragon companion floating with frost sparkles!'
  },
  {
    id: 'cosmic_griffin',
    name: 'Golden Cosmic Griffin',
    category: 'pets',
    cost: 1800,
    rarity: 'legendary',
    requiredRank: 1500,
    description: 'Royal golden celestial griffin companion!'
  },

  // VISUAL FX (Category: fx)
  {
    id: 'sparkle_dust',
    name: 'Rain Shower Drop',
    category: 'fx',
    cost: 45,
    rarity: 'common',
    description: 'Refreshing raindrops gently falling around Kibo.'
  },
  {
    id: 'fx_float_bounce',
    name: 'Cloud Levitator Float',
    category: 'fx',
    cost: 160,
    rarity: 'rare',
    description: 'Causes Kibo to gently levitate and float up and down on a fluffy cloud!'
  },
  {
    id: 'starlight_aura',
    name: 'Starlight Cosmic Halo',
    category: 'fx',
    cost: 220,
    rarity: 'rare',
    description: 'Shimmering orbital starlight halo around Kibo.'
  },
  {
    id: 'fx_spin_dance',
    name: 'Victory Spin & Twirl',
    category: 'fx',
    cost: 480,
    rarity: 'epic',
    requiredRank: 1150,
    description: 'Kibo performs joyful victory 3D twirls and spins!'
  },
  {
    id: 'lightning_sparks',
    name: 'Cosmic Bubble Floating',
    category: 'fx',
    cost: 550,
    rarity: 'epic',
    requiredRank: 1200,
    description: 'Iridescent glowing pastel bubbles gently floating and popping around Kibo!'
  },
  {
    id: 'fx_hyper_speed',
    name: 'Disco Fever Spotlight',
    category: 'fx',
    cost: 750,
    rarity: 'epic',
    requiredRank: 1350,
    description: 'Groovy spinning disco ball illuminating Kibo with multi-color sparkling dance floor spotlights!'
  },
  {
    id: 'rainbow_nebula',
    name: 'Rainbow Fireworks Burst',
    category: 'fx',
    cost: 1450,
    rarity: 'legendary',
    requiredRank: 1550,
    description: 'Spectacular multi-color rainbow fireworks exploding around Kibo!'
  },
  {
    id: 'fx_orbit_moons',
    name: 'Silly Boogie Dance Move',
    category: 'fx',
    cost: 1600,
    rarity: 'legendary',
    requiredRank: 1600,
    description: 'Silly boogie dance move with joyful body wiggles, side-steps, and hip bops!'
  },

  // KIBO SKINS (Category: skins)
  {
    id: 'snow_white_skin',
    name: 'Winter Frost White',
    category: 'skins',
    cost: 60,
    rarity: 'common',
    description: 'Pure arctic snow-white fur skin for high peak climbs.'
  },
  {
    id: 'midnight_shadow_skin',
    name: 'Midnight Obsidian',
    category: 'skins',
    cost: 250,
    rarity: 'rare',
    description: 'Sleek dark obsidian night fur skin.'
  },
  {
    id: 'emerald_jade_skin',
    name: 'Mystic Emerald Jade',
    category: 'skins',
    cost: 700,
    rarity: 'epic',
    requiredRank: 1250,
    description: 'Enchanted shimmering emerald jade fur skin!'
  },
  {
    id: 'golden_skin',
    name: 'Golden 24K Skin',
    category: 'skins',
    cost: 2500,
    rarity: 'legendary',
    requiredRank: 1700,
    description: 'Shimmering solid 24k gold metallic Kibo skin!'
  },

  // SPRINT BACKGROUNDS (Slot: background)
  {
    id: 'bg_alpine',
    name: 'Alpine Meadow',
    category: 'background',
    cost: 40,
    rarity: 'common',
    description: 'Classic sunlit alpine mountain meadow.'
  },
  {
    id: 'bg_sunset',
    name: 'Sunset Horizon',
    category: 'background',
    cost: 90,
    rarity: 'common',
    description: 'Warm golden sunset backdrop over mountain peaks.'
  },
  {
    id: 'bg_aurora',
    name: 'Emerald Aurora',
    category: 'background',
    cost: 220,
    rarity: 'rare',
    description: 'Shimmering northern emerald aurora borealis.'
  },
  {
    id: 'bg_volcano',
    name: 'Mount Lava Summit',
    category: 'background',
    cost: 380,
    rarity: 'rare',
    description: 'Fiery volcano peak with molten lava glow.'
  },
  {
    id: 'bg_concert_stage',
    name: 'Concert Stage',
    category: 'background',
    cost: 520,
    rarity: 'epic',
    description: 'Electric live concert stage with blazing spotlights, laser trusses, and rockstar vibes!'
  },
  {
    id: 'bg_cosmic',
    name: 'Cosmic Galaxy',
    category: 'background',
    cost: 650,
    rarity: 'epic',
    description: 'Deep space galaxy backdrop with twinkling stars.'
  },
  {
    id: 'bg_crystal_cave',
    name: 'Crystal Cavern',
    category: 'background',
    cost: 880,
    rarity: 'epic',
    description: 'Glowing amethyst and sapphire crystal cavern.'
  },
  {
    id: 'bg_golden_palace',
    name: 'Golden Citadel Peak',
    category: 'background',
    cost: 1800,
    rarity: 'legendary',
    requiredRank: 1650,
    description: 'Royal golden palace floating in the clouds!'
  },

  // SEASONAL (Category: seasonal)
  {
    id: 'summer_visor',
    name: 'Sunny Sun Visor',
    category: 'seasonal',
    slot: 'headwear',
    cost: 120,
    rarity: 'rare',
    seasonName: 'Summer Splash',
    availableFrom: '2026-06-01T00:00:00Z',
    availableUntil: '2026-08-31T23:59:59Z',
    description: 'Bright sun-shielding visor for sunny mountain peak climbs! (Summer Exclusive)'
  },
  {
    id: 'pumpkin_hat',
    name: 'Jack-o\'-Lantern Head',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonName: 'Autumn Harvest',
    availableFrom: '2026-09-01T00:00:00Z',
    availableUntil: '2026-11-15T23:59:59Z',
    previewFrom: '2026-08-01T00:00:00Z',
    description: 'Spooky glowing pumpkin hat for autumn climbing! (Autumn Exclusive)'
  },
  {
    id: 'winter_beanie',
    name: 'Cozy Snowflake Beanie',
    category: 'seasonal',
    slot: 'headwear',
    cost: 180,
    rarity: 'rare',
    seasonName: 'Winter Frost',
    availableFrom: '2026-12-01T00:00:00Z',
    availableUntil: '2027-02-28T23:59:59Z',
    previewFrom: '2026-11-01T00:00:00Z',
    description: 'Warm knitted wool beanie with a fluffy pom-pom for chilly summits! (Winter Exclusive)'
  },

  // PROMO EXCLUSIVES (Category: promo)
  {
    id: 'golden_ticket',
    name: 'Golden Ticket',
    category: 'promo',
    slot: 'gear',
    cost: 0,
    rarity: 'legendary',
    promoCodeRequired: 'GOLDENKIBO',
    description: 'A very special golden ticket unlocked with an exclusive promo code!'
  },
  {
    id: 'cyber_shades',
    name: 'Cyber Neon Shades',
    category: 'promo',
    slot: 'headwear',
    cost: 0,
    rarity: 'rare',
    promoCodeRequired: 'CYBERCLIMB',
    description: 'Futuristic glowing cyber shades unlocked with an exclusive promo code!'
  },

  // PREMIUM EXCLUSIVES & BUNDLES (Category: premium)
  {
    id: 'starter_bundle',
    name: 'Kibo Starter Bundle',
    category: 'premium',
    slot: 'headwear',
    realMoneyPrice: '$4.99',
    rarity: 'epic',
    description: 'Includes 1000 Sparks, 5 Streak Savers, and the exclusive Explorer Fedora!',
    sparksIncluded: 1000,
    bundleItems: ['explorer_hat'],
    bundleConsumables: { streakSaverCount: 5 }
  },
  {
    id: 'dragon_pet_premium',
    name: 'Dragon Whelp Pet',
    category: 'premium',
    slot: 'pets',
    realMoneyPrice: '$2.99',
    rarity: 'epic',
    description: 'A tiny fire-breathing dragon companion that flies beside Kibo. Real money exclusive.'
  },
  {
    id: 'galaxy_skin_premium',
    name: 'Nebula Galaxy Skin',
    category: 'premium',
    slot: 'skins',
    realMoneyPrice: '$3.99',
    rarity: 'legendary',
    description: 'An animated shimmering galaxy skin for Kibo! Real money exclusive.'
  },
  {
    id: 'kibo_club_sub',
    name: 'Kibo Club Subscription',
    category: 'premium',
    slot: 'fx',
    realMoneyPrice: '$4.99/mo',
    isSubscription: true,
    rarity: 'legendary',
    description: 'Join the Kibo Club! Enjoy a permanent 1.25x Spark Multiplier, a golden username tag, and 100 daily Sparks.'
  }
];

export function getItemById(id) {
  return WORKSHOP_ITEMS.find((item) => item.id === id);
}

export function getItemSlot(item) {
  if (!item) return null;
  if (item.slot) return item.slot;
  if (item.category === 'seasonal') {
    if (item.id === 'pumpkin_hat' || item.id === 'summer_visor' || item.id === 'winter_beanie') return 'headwear';
  }
  if (item.category === 'promo') {
    if (item.id === 'golden_ticket') return 'gear';
    if (item.id === 'cyber_shades') return 'headwear';
  }
  if (item.category === 'premium') {
    if (item.id === 'dragon_pet_premium') return 'pets';
    if (item.id === 'galaxy_skin_premium') return 'skins';
    if (item.id === 'starter_bundle') return 'headwear';
  }
  return item.category;
}

/**
 * Computes availability status for limited-time / seasonal / promo items.
 * @param {object} item
 * @param {Date|string|number} [currentDate=new Date()]
 * @returns {{ status: 'permanent'|'active'|'upcoming'|'expired', isAvailable: boolean, isUpcoming: boolean, isExpired: boolean, daysRemaining?: number, startsInDays?: number, formattedDate?: string }}
 */
export function getItemAvailabilityStatus(item, currentDate = new Date()) {
  if (!item) return { status: 'permanent', isAvailable: true, isUpcoming: false, isExpired: false };
  
  if (!item.availableFrom && !item.availableUntil && !item.previewFrom) {
    return { status: 'permanent', isAvailable: true, isUpcoming: false, isExpired: false };
  }

  const now = (currentDate instanceof Date ? currentDate : new Date(currentDate)).getTime();
  const availFrom = item.availableFrom ? new Date(item.availableFrom).getTime() : null;
  const availUntil = item.availableUntil ? new Date(item.availableUntil).getTime() : null;
  const prevFrom = item.previewFrom ? new Date(item.previewFrom).getTime() : (availFrom ? availFrom - (14 * 86400000) : null);

  // 1. Expired check
  if (availUntil && now > availUntil) {
    return {
      status: 'expired',
      isAvailable: false,
      isUpcoming: false,
      isExpired: true,
      expiredAt: item.availableUntil
    };
  }

  // 2. Upcoming check (before availableFrom)
  if (availFrom && now < availFrom) {
    const daysUntilStart = Math.max(1, Math.ceil((availFrom - now) / (1000 * 60 * 60 * 24)));
    const isWithinPreview = !prevFrom || now >= prevFrom;
    
    // Format human-friendly launch date (e.g. "Sept 1")
    const d = new Date(availFrom);
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      status: 'upcoming',
      isAvailable: false,
      isUpcoming: true,
      isExpired: false,
      isWithinPreview,
      startsInDays: daysUntilStart,
      availableFrom: item.availableFrom,
      formattedDate
    };
  }

  // 3. Active rotation check
  let daysRemaining = null;
  let formattedEndDate = null;
  if (availUntil) {
    daysRemaining = Math.max(0, Math.ceil((availUntil - now) / (1000 * 60 * 60 * 24)));
    const d = new Date(availUntil);
    formattedEndDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return {
    status: 'active',
    isAvailable: true,
    isUpcoming: false,
    isExpired: false,
    daysRemaining,
    availableUntil: item.availableUntil,
    formattedEndDate
  };
}

/**
 * Determines if an item should be shown in the workshop list.
 * Note: If an item is already unlocked/purchased by the player, it is ALWAYS visible!
 */
export function isItemVisibleInShop(item, unlockedItems = [], currentDate = new Date()) {
  if (!item) return false;
  // If player owns it, it ALWAYS remains visible in their shop & wardrobe
  if (unlockedItems && unlockedItems.includes(item.id)) {
    return true;
  }

  const availability = getItemAvailabilityStatus(item, currentDate);
  if (availability.status === 'permanent' || availability.status === 'active') {
    return true;
  }
  if (availability.status === 'upcoming') {
    return !!availability.isWithinPreview;
  }
  // Expired unowned items are hidden
  return false;
}

/**
 * Returns filtered shop items by category, taking ownership and rotation schedules into account.
 */
export function getItemsByCategory(category, unlockedItems = [], currentDate = new Date()) {
  const items = (!category || category === 'all')
    ? WORKSHOP_ITEMS
    : WORKSHOP_ITEMS.filter((item) => item.category === category);

  return items.filter((item) => isItemVisibleInShop(item, unlockedItems, currentDate));
}
