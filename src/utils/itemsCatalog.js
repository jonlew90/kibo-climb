// Expanded Workshop Catalog with Categories & Rarity Tiers for Kibo Math

export const ITEM_CATEGORIES = [
  { id: 'headwear', label: 'Headwear 🧢' },
  { id: 'accessory', label: 'Accessories 🎒' },
  { id: 'aura', label: 'Auras & FX ✨' },
  { id: 'background', label: 'Backgrounds 🌌' }
];

export const RARITY_TIERS = {
  common: {
    label: 'Common',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  rare: {
    label: 'Rare',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300'
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
    id: 'party_hat',
    name: 'Party Hat',
    category: 'headwear',
    cost: 40,
    rarity: 'common',
    description: 'Festive polka-dot cone party hat!'
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
    id: 'wizard_hat',
    name: 'Wizard Hat',
    category: 'headwear',
    cost: 120,
    rarity: 'rare',
    description: 'Mystical starry purple wizard hat.'
  },
  {
    id: 'crown',
    name: 'Gold Crown',
    category: 'headwear',
    cost: 500,
    rarity: 'legendary',
    description: 'Royal jeweled golden crown for math royalty!'
  },

  // ACCESSORIES (Slot: accessory)
  {
    id: 'bowtie',
    name: 'Red Bowtie',
    category: 'accessory',
    cost: 25,
    rarity: 'common',
    description: 'Dapper crimson bowtie.'
  },
  {
    id: 'cape',
    name: 'Superhero Cape',
    category: 'accessory',
    cost: 90,
    rarity: 'rare',
    description: 'Flowing vibrant red superhero cape.'
  },
  {
    id: 'headphones',
    name: 'Neon Headphones',
    category: 'accessory',
    cost: 110,
    rarity: 'rare',
    description: 'Sleek neon cyan music headphones.'
  },
  {
    id: 'jetpack',
    name: 'Rocket Jetpack',
    category: 'accessory',
    cost: 250,
    rarity: 'epic',
    description: 'Futuristic jetpack with fiery thrusters!'
  },

  // AURAS & FX (Slot: aura)
  {
    id: 'rainbow_aura',
    name: 'Rainbow Trail Aura',
    category: 'aura',
    cost: 200,
    rarity: 'epic',
    description: 'Glowing rainbow energy aura.'
  },
  {
    id: 'golden_aura',
    name: 'Sparkle Glow Aura',
    category: 'aura',
    cost: 350,
    rarity: 'epic',
    description: 'Radiant golden sparkle energy ring.'
  },
  {
    id: 'golden_skin',
    name: 'Golden Kibo Skin',
    category: 'aura',
    cost: 500,
    rarity: 'legendary',
    description: 'Shimmering solid gold metallic Kibo skin!'
  },

  // SPRINT BACKGROUNDS (Slot: background)
  {
    id: 'bg_cosmic',
    name: 'Cosmic Space',
    category: 'background',
    cost: 300,
    rarity: 'epic',
    description: 'Deep space galaxy background with twinkling stars.'
  },
  {
    id: 'bg_sunset',
    name: 'Sunset Meadow',
    category: 'background',
    cost: 250,
    rarity: 'epic',
    description: 'Warm golden sunset backdrop.'
  }
];

export function getItemById(id) {
  return WORKSHOP_ITEMS.find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  return WORKSHOP_ITEMS.filter((item) => item.category === category);
}
