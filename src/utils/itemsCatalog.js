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
  { id: 'get_sparks', label: 'Get Sparks' }
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
    id: 'pumpkin_hat',
    name: 'Jack-o\'-Lantern Head',
    category: 'seasonal',
    cost: 150,
    rarity: 'rare',
    description: 'Spooky scary pumpkin hat for autumn climbing!'
  },

  // PROMO EXCLUSIVES (Category: promo)
  {
    id: 'golden_ticket',
    name: 'Golden Ticket',
    category: 'promo',
    cost: 0,
    rarity: 'legendary',
    description: 'A very special ticket unlocked via an exclusive promo code!'
  }
];

export function getItemById(id) {
  return WORKSHOP_ITEMS.find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category || category === 'all') return WORKSHOP_ITEMS;
  return WORKSHOP_ITEMS.filter((item) => item.category === category);
}
