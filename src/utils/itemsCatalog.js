// Expanded Workshop Catalog with Categories & Rarity Tiers for Kibo Math

export const ITEM_CATEGORIES = [
  { id: 'all', label: 'All Items' },
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
    id: 'kibo_shield',
    name: 'Kibo Shield',
    category: 'powerups',
    cost: 50,
    rarity: 'rare',
    isConsumable: true,
    icon: '🛡️',
    description: 'Absorbs 1 incorrect answer per adaptive session without breaking your accuracy streak.'
  },
  {
    id: 'double_sparks_potion',
    name: 'Double Sparks Potion',
    category: 'powerups',
    cost: 12,
    rarity: 'rare',
    isConsumable: true,
    icon: '🧪',
    badgeTag: 'Profit Booster!',
    description: 'Costs 12 Sparks. Doubles all Sparks earned in your next adaptive session block!'
  },
  {
    id: 'streak_saver',
    name: 'Daily Streak Saver',
    category: 'powerups',
    cost: 75,
    rarity: 'rare',
    isConsumable: true,
    icon: '🛡️',
    description: 'Protects 1 missed calendar day of climbing from resetting your daily streak.'
  },
  {
    id: 'badge_booster',
    name: 'Badge Booster',
    category: 'powerups',
    cost: 60,
    rarity: 'uncommon',
    isConsumable: true,
    icon: '🚀',
    description: 'Accelerates competence rank gains during active climbs.'
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
    cost: 75,
    rarity: 'common',
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
    cost: 120,
    rarity: 'rare',
    description: 'Mystical starry purple wizard hat.'
  },
  {
    id: 'explorer_hat',
    name: 'Explorer Fedora',
    category: 'headwear',
    cost: 350,
    rarity: 'epic',
    requiredRank: 500,
    description: 'Classic leather safari explorer hat for peak summits. Requires Competence Rank 500.'
  },
  {
    id: 'crown',
    name: 'Gold Crown',
    category: 'headwear',
    cost: 1500,
    rarity: 'legendary',
    requiredRank: 1000,
    description: 'Royal jeweled golden crown for math royalty! Requires Competence Rank 1000.'
  },

  // GEAR (Slot: gear)
  {
    id: 'canteen',
    name: 'Water Canteen',
    category: 'gear',
    cost: 75,
    rarity: 'common',
    description: 'Hydrating trail canteen for long climb sprints.'
  },
  {
    id: 'backpack',
    name: 'Explorer Backpack',
    category: 'gear',
    cost: 200,
    rarity: 'rare',
    description: 'Sturdy mountain climbing pack.'
  },
  {
    id: 'jetpack',
    name: 'Rocket Jetpack',
    category: 'gear',
    cost: 250,
    rarity: 'epic',
    requiredRank: 400,
    description: 'Futuristic jetpack with fiery thrusters! Requires Competence Rank 400.'
  },
  {
    id: 'lantern',
    name: 'Glimmer Lantern',
    category: 'gear',
    cost: 450,
    rarity: 'epic',
    description: 'Glowing warm lantern for night climbs.'
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
    cost: 180,
    rarity: 'rare',
    description: 'Warm mountain puffer vest.'
  },
  {
    id: 'summit_scarf',
    name: 'Summit Scarf',
    category: 'outfits',
    cost: 300,
    rarity: 'epic',
    requiredRank: 300,
    description: 'Cozy knitted mountain scarf for high altitude winds. Requires Competence Rank 300.'
  },

  // COMPANIONS & EFFECTS (Slot: effects)
  {
    id: 'firefly',
    name: 'Sparky Firefly Companion',
    category: 'effects',
    cost: 600,
    rarity: 'epic',
    description: 'A friendly glowing firefly that orbits Kibo on the trail.'
  },
  {
    id: 'lightning_aura',
    name: 'Lightning Speed Trail',
    category: 'effects',
    cost: 1000,
    rarity: 'epic',
    description: 'Electrifying speed aura for ultra-fast solvers.'
  },
  {
    id: 'golden_skin',
    name: 'Golden 24K Skin',
    category: 'effects',
    cost: 2500,
    rarity: 'legendary',
    description: 'Shimmering solid 24k gold metallic Kibo skin!'
  },

  // SPRINT BACKGROUNDS (Slot: background)
  {
    id: 'bg_sunset',
    name: 'Sunset Meadow',
    category: 'background',
    cost: 150,
    rarity: 'rare',
    description: 'Warm golden sunset backdrop.'
  },
  {
    id: 'bg_cosmic',
    name: 'Cosmic Galaxy',
    category: 'background',
    cost: 300,
    rarity: 'epic',
    description: 'Deep space galaxy background with twinkling stars.'
  }
];

export function getItemById(id) {
  return WORKSHOP_ITEMS.find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category || category === 'all') return WORKSHOP_ITEMS;
  return WORKSHOP_ITEMS.filter((item) => item.category === category);
}
