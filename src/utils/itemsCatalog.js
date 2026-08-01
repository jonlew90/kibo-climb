// Expanded Workshop Catalog with Categories & Rarity Tiers for Kibo Math

export const ITEM_CATEGORIES = [
  { id: 'powerups', label: 'Power-Ups' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'gear', label: 'Gear' },
  { id: 'outfits', label: 'Outfits' },
  { id: 'effects', label: 'Companions & FX' },
  { id: 'background', label: 'Backgrounds' }
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
    id: 'badge_booster',
    name: 'Badge Booster',
    category: 'powerups',
    cost: 45,
    rarity: 'rare',
    isConsumable: true,
    icon: '🚀',
    description: 'Accelerates competence rank gains during active climbs.'
  },
  {
    id: 'kibo_shield',
    name: 'Kibo Shield',
    category: 'powerups',
    cost: 90,
    rarity: 'epic',
    isConsumable: true,
    icon: '🛡️',
    description: 'Absorbs 1 incorrect answer per climb streak without breaking accuracy.'
  },
  {
    id: 'streak_saver',
    name: 'Daily Streak Saver',
    category: 'powerups',
    cost: 200,
    rarity: 'legendary',
    isConsumable: true,
    icon: '🔥',
    description: 'Protects 1 missed calendar day of climbing from resetting your daily streak.'
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
    description: 'Classic leather safari explorer hat for peak summits. Requires Competence Rank 1200.'
  },
  {
    id: 'crown',
    name: 'Gold Crown',
    category: 'headwear',
    cost: 1500,
    rarity: 'legendary',
    requiredRank: 1600,
    description: 'Royal jeweled golden crown for math royalty! Requires Competence Rank 1600.'
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
    description: 'Sturdy mountain climbing pack.'
  },
  {
    id: 'lantern',
    name: 'Glimmer Lantern',
    category: 'gear',
    cost: 450,
    rarity: 'epic',
    description: 'Glowing warm lantern for night climbs.'
  },
  {
    id: 'jetpack',
    name: 'Rocket Jetpack',
    category: 'gear',
    cost: 750,
    rarity: 'epic',
    requiredRank: 1350,
    description: 'Futuristic jetpack with fiery thrusters! Requires Competence Rank 1350.'
  },
  {
    id: 'golden_compass',
    name: '24K Golden Compass',
    category: 'gear',
    cost: 1600,
    rarity: 'legendary',
    requiredRank: 1550,
    description: 'Enchanted solid 24k gold navigational compass. Requires Competence Rank 1550.'
  },

  // OUTFITS (Slot: outfits)
  {
    id: 'bowtie',
    name: 'Red Bowtie',
    category: 'outfits',
    cost: 25,
    rarity: 'common',
    description: 'Dapper crimson bowtie.'
  },
  {
    id: 'vest',
    name: 'Padded Vest',
    category: 'outfits',
    cost: 140,
    rarity: 'rare',
    description: 'Warm mountain puffer vest.'
  },
  {
    id: 'summit_scarf',
    name: 'Summit Scarf',
    category: 'outfits',
    cost: 350,
    rarity: 'epic',
    requiredRank: 1100,
    description: 'Cozy knitted mountain scarf for high altitude winds. Requires Competence Rank 1100.'
  },
  {
    id: 'royal_cape',
    name: 'Royal Velvet Cape',
    category: 'outfits',
    cost: 1400,
    rarity: 'legendary',
    requiredRank: 1500,
    description: 'Majestic purple velvet cape with golden trim. Requires Competence Rank 1500.'
  },

  // COMPANIONS & EFFECTS (Slot: effects)
  {
    id: 'sparkle_dust',
    name: 'Trail Sparkle Dust',
    category: 'effects',
    cost: 75,
    rarity: 'common',
    description: 'Magical sparkle dust floating around Kibo.'
  },
  {
    id: 'starlight_aura',
    name: 'Starlight Cosmic Halo',
    category: 'effects',
    cost: 300,
    rarity: 'rare',
    description: 'Shimmering orbital starlight halo around Kibo.'
  },
  {
    id: 'phoenix_pet',
    name: 'Phoenix Flame Pet',
    category: 'effects',
    cost: 650,
    rarity: 'epic',
    description: 'A mythical fiery phoenix companion floating beside Kibo!'
  },
  {
    id: 'frost_dragon',
    name: 'Frost Dragon Pet',
    category: 'effects',
    cost: 900,
    rarity: 'epic',
    requiredRank: 1300,
    description: 'Mystic ice dragon companion floating beside Kibo with frost sparkles!'
  },
  {
    id: 'golden_skin',
    name: 'Golden 24K Skin',
    category: 'effects',
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
    description: 'Royal golden palace floating in the clouds! Requires Competence Rank 1650.'
  }
];

export function getItemById(id) {
  return WORKSHOP_ITEMS.find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category || category === 'all') return WORKSHOP_ITEMS;
  return WORKSHOP_ITEMS.filter((item) => item.category === category);
}
