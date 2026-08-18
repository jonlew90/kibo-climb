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

  // =========================================================================
  // RECURRING SEASONAL & HOLIDAY CATALOG
  // Automatically rotates for the 4 seasons and major popular/federal holidays!
  // =========================================================================

  // 1. SPRING SEASON (March 1 – May 31)
  {
    id: 'spring_sakura_halo',
    name: 'Spring Sakura Halo',
    category: 'seasonal',
    slot: 'fx',
    cost: 160,
    rarity: 'rare',
    seasonId: 'spring',
    seasonName: 'Spring Bloom',
    seasonType: 'season',
    recurringSchedule: { startMonth: 3, startDay: 1, endMonth: 5, endDay: 31, previewDays: 14 },
    description: 'Floating cherry blossom petals & pastel floral aura dancing around Kibo! (Spring Exclusive)'
  },
  {
    id: 'spring_bunny_ears',
    name: 'Fluffy Bunny Ears',
    category: 'seasonal',
    slot: 'headwear',
    cost: 110,
    rarity: 'rare',
    seasonId: 'spring',
    seasonName: 'Spring Bloom',
    seasonType: 'season',
    recurringSchedule: { startMonth: 3, startDay: 1, endMonth: 5, endDay: 31, previewDays: 14 },
    description: 'Soft pink and white twitching bunny ears for springtime climbs! (Spring Exclusive)'
  },
  {
    id: 'spring_butterfly_pet',
    name: 'Monarch Butterfly Pet',
    category: 'seasonal',
    slot: 'pets',
    cost: 175,
    rarity: 'epic',
    seasonId: 'spring',
    seasonName: 'Spring Bloom',
    seasonType: 'season',
    recurringSchedule: { startMonth: 3, startDay: 1, endMonth: 5, endDay: 31, previewDays: 14 },
    description: 'A sparkling monarch butterfly floating gracefully alongside Kibo! (Spring Exclusive)'
  },

  // 2. SUMMER SEASON (June 1 – August 31)
  {
    id: 'summer_visor',
    name: 'Sunny Sun Visor',
    category: 'seasonal',
    slot: 'headwear',
    cost: 120,
    rarity: 'rare',
    seasonId: 'summer',
    seasonName: 'Summer Splash',
    seasonType: 'season',
    recurringSchedule: { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, previewDays: 14 },
    description: 'Bright sun-shielding visor for sunny mountain peak climbs! (Summer Exclusive)'
  },
  {
    id: 'summer_snorkel_mask',
    name: 'Lagoon Snorkel Goggles',
    category: 'seasonal',
    slot: 'headwear',
    cost: 130,
    rarity: 'rare',
    seasonId: 'summer',
    seasonName: 'Summer Splash',
    seasonType: 'season',
    recurringSchedule: { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, previewDays: 14 },
    description: 'Crystal-clear diving goggles with a bright neon snorkel breathing tube! (Summer Exclusive)'
  },
  {
    id: 'summer_ice_cream_cone',
    name: 'Triple-Scoop Ice Cream',
    category: 'seasonal',
    slot: 'gear',
    cost: 90,
    rarity: 'common',
    seasonId: 'summer',
    seasonName: 'Summer Splash',
    seasonType: 'season',
    recurringSchedule: { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, previewDays: 14 },
    description: 'A giant waffle cone with strawberry, mint, and vanilla scoops! (Summer Exclusive)'
  },
  {
    id: 'summer_splash_aura',
    name: 'Summer Splash Wave Aura',
    category: 'seasonal',
    slot: 'fx',
    cost: 180,
    rarity: 'epic',
    seasonId: 'summer',
    seasonName: 'Summer Splash',
    seasonType: 'season',
    recurringSchedule: { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, previewDays: 14 },
    description: 'Cascading ocean waves, sparkling seafoam, and tropical water splash rings dancing around Kibo! (Summer Exclusive)'
  },

  // 3. AUTUMN / FALL SEASON (September 1 – November 30)
  {
    id: 'autumn_leaf_crown',
    name: 'Golden Maple Wreath',
    category: 'seasonal',
    slot: 'headwear',
    cost: 130,
    rarity: 'rare',
    seasonId: 'autumn',
    seasonName: 'Autumn Harvest',
    seasonType: 'season',
    recurringSchedule: { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30, previewDays: 14 },
    description: 'A regal wreath woven from crisp crimson and golden autumn maple leaves! (Autumn Exclusive)'
  },
  {
    id: 'autumn_cozy_sweater',
    name: 'Flannel Mountain Vest',
    category: 'seasonal',
    slot: 'outfits',
    cost: 160,
    rarity: 'rare',
    seasonId: 'autumn',
    seasonName: 'Autumn Harvest',
    seasonType: 'season',
    recurringSchedule: { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30, previewDays: 14 },
    description: 'Warm crimson and plaid flannel vest for crisp mountain hikes! (Autumn Exclusive)'
  },
  {
    id: 'autumn_squirrel_pet',
    name: 'Acorn Squirrel Pal',
    category: 'seasonal',
    slot: 'pets',
    cost: 190,
    rarity: 'epic',
    seasonId: 'autumn',
    seasonName: 'Autumn Harvest',
    seasonType: 'season',
    recurringSchedule: { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30, previewDays: 14 },
    description: 'A bushy-tailed woodland squirrel friend holding a shiny golden acorn! (Autumn Exclusive)'
  },

  // 4. WINTER SEASON (December 1 – February 28/29)
  {
    id: 'winter_beanie',
    name: 'Cozy Snowflake Beanie',
    category: 'seasonal',
    slot: 'headwear',
    cost: 140,
    rarity: 'rare',
    seasonId: 'winter',
    seasonName: 'Winter Frost',
    seasonType: 'season',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 2, endDay: 28, previewDays: 14 },
    description: 'Warm knitted wool beanie with a fluffy pom-pom for chilly summits! (Winter Exclusive)'
  },
  {
    id: 'winter_snowman_pet',
    name: 'Mini Snowman Pal',
    category: 'seasonal',
    slot: 'pets',
    cost: 210,
    rarity: 'epic',
    seasonId: 'winter',
    seasonName: 'Winter Frost',
    seasonType: 'season',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 2, endDay: 28, previewDays: 14 },
    description: 'A cute mini snowman companion with a carrot nose and little top hat! (Winter Exclusive)'
  },
  {
    id: 'winter_ice_skates',
    name: 'Silver Ice Skates',
    category: 'seasonal',
    slot: 'gear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'winter',
    seasonName: 'Winter Frost',
    seasonType: 'season',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 2, endDay: 28, previewDays: 14 },
    description: 'Gleaming steel ice skates with crimson laces for frozen summit lakes! (Winter Exclusive)'
  },

  // 5. NEW YEAR CELEBRATION (December 28 – January 6)
  {
    id: 'new_year_top_hat',
    name: 'Midnight Countdown Top Hat',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'new_year',
    seasonName: 'New Year Party',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 28, endMonth: 1, endDay: 6, previewDays: 7 },
    description: 'Sparkling midnight silk top hat with gold glitter ribbon for ringing in the new year! (New Year Exclusive)'
  },
  {
    id: 'new_year_sparkler',
    name: 'Golden Sparkler Wand',
    category: 'seasonal',
    slot: 'gear',
    cost: 120,
    rarity: 'rare',
    seasonId: 'new_year',
    seasonName: 'New Year Party',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 28, endMonth: 1, endDay: 6, previewDays: 7 },
    description: 'A crackling golden holiday sparkler wand shooting out celebration starbursts! (New Year Exclusive)'
  },

  // 6. MARTIN LUTHER KING JR. DAY (January 10 – January 25)
  {
    id: 'mlk_peace_dove_pet',
    name: 'Harmony Dove Companion',
    category: 'seasonal',
    slot: 'pets',
    cost: 180,
    rarity: 'epic',
    seasonId: 'mlk_day',
    seasonName: 'MLK Day of Service',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 1, startDay: 10, endMonth: 1, endDay: 25, previewDays: 7 },
    description: 'A peaceful white dove companion carrying a green olive branch! (MLK Day Exclusive)'
  },
  {
    id: 'mlk_dream_sash',
    name: 'Dreamer\'s Ribbon Sash',
    category: 'seasonal',
    slot: 'outfits',
    cost: 130,
    rarity: 'rare',
    seasonId: 'mlk_day',
    seasonName: 'MLK Day of Service',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 1, startDay: 10, endMonth: 1, endDay: 25, previewDays: 7 },
    description: 'Commemorative ribbon sash honoring dreams of equality and peace! (MLK Day Exclusive)'
  },

  // 7. VALENTINE'S DAY (February 1 – February 18)
  {
    id: 'valentines_cupid_wings',
    name: 'Sweetheart Cupid Wings',
    category: 'seasonal',
    slot: 'outfits',
    cost: 220,
    rarity: 'epic',
    seasonId: 'valentines',
    seasonName: 'Valentine\'s Heart',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 2, startDay: 1, endMonth: 2, endDay: 18, previewDays: 7 },
    description: 'Feathered pink and crimson cupid wings fluttering with sweet love! (Valentine\'s Exclusive)'
  },
  {
    id: 'valentines_heart_shades',
    name: 'Rose Tinted Heart Shades',
    category: 'seasonal',
    slot: 'headwear',
    cost: 110,
    rarity: 'rare',
    seasonId: 'valentines',
    seasonName: 'Valentine\'s Heart',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 2, startDay: 1, endMonth: 2, endDay: 18, previewDays: 7 },
    description: 'Cute candy-pink heart shaped glasses with tinted lenses! (Valentine\'s Exclusive)'
  },
  {
    id: 'valentines_love_sparks',
    name: 'Floating Heart Sparkles',
    category: 'seasonal',
    slot: 'fx',
    cost: 160,
    rarity: 'rare',
    seasonId: 'valentines',
    seasonName: 'Valentine\'s Heart',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 2, startDay: 1, endMonth: 2, endDay: 18, previewDays: 7 },
    description: 'Glowing pastel pink & red hearts floating joyfully around Kibo! (Valentine\'s Exclusive)'
  },

  // 8. PRESIDENTS' DAY (February 12 – February 26)
  {
    id: 'presidents_tricorne',
    name: 'Patriot Tricorne Hat',
    category: 'seasonal',
    slot: 'headwear',
    cost: 160,
    rarity: 'rare',
    seasonId: 'presidents_day',
    seasonName: 'Presidents\' Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 2, startDay: 12, endMonth: 2, endDay: 26, previewDays: 7 },
    description: 'Distinguished colonial three-cornered hat with a golden cockade! (Presidents\' Day Exclusive)'
  },
  {
    id: 'presidents_eagle_shield',
    name: 'Liberty Eagle Buckler',
    category: 'seasonal',
    slot: 'gear',
    cost: 180,
    rarity: 'epic',
    seasonId: 'presidents_day',
    seasonName: 'Presidents\' Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 2, startDay: 12, endMonth: 2, endDay: 26, previewDays: 7 },
    description: 'Polished bronze buckler emblazoned with a proud golden eagle! (Presidents\' Day Exclusive)'
  },

  // 9. ST. PATRICK'S DAY (March 8 – March 22)
  {
    id: 'st_patricks_leprechaun_hat',
    name: 'Lucky Clover Top Hat',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'st_patricks',
    seasonName: 'St. Patrick\'s Luck',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 3, startDay: 8, endMonth: 3, endDay: 22, previewDays: 7 },
    description: 'Emerald green top hat with a golden buckle and lucky four-leaf clover! (St. Patrick\'s Exclusive)'
  },
  {
    id: 'st_patricks_pot_of_gold',
    name: 'Pot of Golden Sparks',
    category: 'seasonal',
    slot: 'gear',
    cost: 190,
    rarity: 'epic',
    seasonId: 'st_patricks',
    seasonName: 'St. Patrick\'s Luck',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 3, startDay: 8, endMonth: 3, endDay: 22, previewDays: 7 },
    description: 'A cast-iron cauldron overflowing with gleaming Sparks coins! (St. Patrick\'s Exclusive)'
  },
  {
    id: 'st_patricks_rainbow_trail',
    name: 'Lucky Rainbow Arc',
    category: 'seasonal',
    slot: 'fx',
    cost: 220,
    rarity: 'legendary',
    seasonId: 'st_patricks',
    seasonName: 'St. Patrick\'s Luck',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 3, startDay: 8, endMonth: 3, endDay: 22, previewDays: 7 },
    description: 'A vibrant full-spectrum rainbow arching behind Kibo with lucky shamrock sparkles! (St. Patrick\'s Exclusive)'
  },

  // 10. EARTH DAY / ARBOR DAY (April 15 – April 30)
  {
    id: 'earth_day_sprout_cap',
    name: 'Little Sprout Headband',
    category: 'seasonal',
    slot: 'headwear',
    cost: 95,
    rarity: 'common',
    seasonId: 'earth_day',
    seasonName: 'Earth & Arbor Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 4, startDay: 15, endMonth: 4, endDay: 30, previewDays: 7 },
    description: 'A fresh leafy green seedling budding from Kibo\'s head with morning dew! (Earth Day Exclusive)'
  },
  {
    id: 'earth_day_globe_balloon',
    name: 'Mini Earth Balloon',
    category: 'seasonal',
    slot: 'gear',
    cost: 140,
    rarity: 'rare',
    seasonId: 'earth_day',
    seasonName: 'Earth & Arbor Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 4, startDay: 15, endMonth: 4, endDay: 30, previewDays: 7 },
    description: 'A floating blue-marble planet balloon tethered to Kibo\'s pack! (Earth Day Exclusive)'
  },

  // 11. MEMORIAL DAY (May 20 – June 2)
  {
    id: 'memorial_poppy_wreath',
    name: 'Remembrance Poppy Pin',
    category: 'seasonal',
    slot: 'headwear',
    cost: 90,
    rarity: 'common',
    seasonId: 'memorial_day',
    seasonName: 'Memorial Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 5, startDay: 20, endMonth: 6, endDay: 2, previewDays: 7 },
    description: 'A vibrant crimson poppy flower pin honoring courageous climbers! (Memorial Day Exclusive)'
  },
  {
    id: 'memorial_courage_cape',
    name: 'Valor Banner Cape',
    category: 'seasonal',
    slot: 'outfits',
    cost: 175,
    rarity: 'rare',
    seasonId: 'memorial_day',
    seasonName: 'Memorial Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 5, startDay: 20, endMonth: 6, endDay: 2, previewDays: 7 },
    description: 'A majestic navy and scarlet banner cape with golden stars! (Memorial Day Exclusive)'
  },

  // 12. JUNETEENTH NATIONAL INDEPENDENCE DAY (June 12 – June 26)
  {
    id: 'juneteenth_liberty_torch',
    name: 'Freedom Jubilee Torch',
    category: 'seasonal',
    slot: 'gear',
    cost: 180,
    rarity: 'epic',
    seasonId: 'juneteenth',
    seasonName: 'Juneteenth Jubilee',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 6, startDay: 12, endMonth: 6, endDay: 26, previewDays: 7 },
    description: 'A blazing celebratory torch with radiant red, yellow, and green flames! (Juneteenth Exclusive)'
  },
  {
    id: 'juneteenth_unity_beanie',
    name: 'Jubilee Heritage Crown',
    category: 'seasonal',
    slot: 'headwear',
    cost: 140,
    rarity: 'rare',
    seasonId: 'juneteenth',
    seasonName: 'Juneteenth Jubilee',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 6, startDay: 12, endMonth: 6, endDay: 26, previewDays: 7 },
    description: 'A beautifully patterned heritage crown celebrating freedom and triumph! (Juneteenth Exclusive)'
  },

  // 13. 4TH OF JULY / INDEPENDENCE DAY (June 28 – July 10)
  {
    id: 'july4_uncle_sam_hat',
    name: 'Stars & Stripes Top Hat',
    category: 'seasonal',
    slot: 'headwear',
    cost: 160,
    rarity: 'rare',
    seasonId: 'independence_day',
    seasonName: '4th of July Jubilee',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 6, startDay: 28, endMonth: 7, endDay: 10, previewDays: 7 },
    description: 'Patriotic red and white striped tall hat with a starry blue band! (4th of July Exclusive)'
  },
  {
    id: 'july4_liberty_fireworks',
    name: 'Liberty Skyrockets FX',
    category: 'seasonal',
    slot: 'fx',
    cost: 240,
    rarity: 'legendary',
    seasonId: 'independence_day',
    seasonName: '4th of July Jubilee',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 6, startDay: 28, endMonth: 7, endDay: 10, previewDays: 7 },
    description: 'Spectacular red, white, and blue firework rockets bursting over Kibo! (4th of July Exclusive)'
  },
  {
    id: 'july4_sparkler_pinwheel',
    name: 'Patriot Star Pinwheel',
    category: 'seasonal',
    slot: 'gear',
    cost: 110,
    rarity: 'common',
    seasonId: 'independence_day',
    seasonName: '4th of July Jubilee',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 6, startDay: 28, endMonth: 7, endDay: 10, previewDays: 7 },
    description: 'A whirling tri-color wind pinwheel spinning with sparkling glitter! (4th of July Exclusive)'
  },

  // 14. LABOR DAY (August 25 – September 10)
  {
    id: 'laborday_builder_hardhat',
    name: 'Master Builder Hardhat',
    category: 'seasonal',
    slot: 'headwear',
    cost: 120,
    rarity: 'rare',
    seasonId: 'labor_day',
    seasonName: 'Labor Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 8, startDay: 25, endMonth: 9, endDay: 10, previewDays: 7 },
    description: 'Canary yellow industrial hardhat with safety headlamp for mountain engineers! (Labor Day Exclusive)'
  },
  {
    id: 'laborday_pioneer_toolbelt',
    name: 'Expedition Toolbelt',
    category: 'seasonal',
    slot: 'gear',
    cost: 140,
    rarity: 'rare',
    seasonId: 'labor_day',
    seasonName: 'Labor Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 8, startDay: 25, endMonth: 9, endDay: 10, previewDays: 7 },
    description: 'Heavy-duty leather belt packed with miniature climbing wrenches and hammers! (Labor Day Exclusive)'
  },

  // 15. HALLOWEEN / SPOOKY SUMMIT (October 1 – November 5)
  {
    id: 'pumpkin_hat',
    name: 'Jack-o\'-Lantern Head',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'halloween',
    seasonName: 'Spooky Summit',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 10, startDay: 1, endMonth: 11, endDay: 5, previewDays: 14 },
    description: 'Spooky glowing pumpkin hat with warm candlelight smile! (Halloween Exclusive)'
  },
  {
    id: 'halloween_vampire_cape',
    name: 'Midnight Vampire Cape',
    category: 'seasonal',
    slot: 'outfits',
    cost: 200,
    rarity: 'epic',
    seasonId: 'halloween',
    seasonName: 'Spooky Summit',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 10, startDay: 1, endMonth: 11, endDay: 5, previewDays: 14 },
    description: 'Dark obsidian velvet cape with crimson silk lining and flared high collar! (Halloween Exclusive)'
  },
  {
    id: 'halloween_ghost_pet',
    name: 'Spooky Boo Ghost',
    category: 'seasonal',
    slot: 'pets',
    cost: 220,
    rarity: 'epic',
    seasonId: 'halloween',
    seasonName: 'Spooky Summit',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 10, startDay: 1, endMonth: 11, endDay: 5, previewDays: 14 },
    description: 'A cute, friendly glowing ghost companion floating and waving by Kibo! (Halloween Exclusive)'
  },
  {
    id: 'halloween_witch_broom',
    name: 'Enchanted Twig Broom',
    category: 'seasonal',
    slot: 'gear',
    cost: 175,
    rarity: 'rare',
    seasonId: 'halloween',
    seasonName: 'Spooky Summit',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 10, startDay: 1, endMonth: 11, endDay: 5, previewDays: 14 },
    description: 'Flying witch broomstick with a glowing purple star ribbon and tail sparkles! (Halloween Exclusive)'
  },

  // 16. VETERANS DAY (November 5 – November 18)
  {
    id: 'veterans_valor_beret',
    name: 'Hero\'s Maroon Beret',
    category: 'seasonal',
    slot: 'headwear',
    cost: 140,
    rarity: 'rare',
    seasonId: 'veterans_day',
    seasonName: 'Veterans Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 11, startDay: 5, endMonth: 11, endDay: 18, previewDays: 7 },
    description: 'Distinguished maroon paratrooper beret with an engraved golden star! (Veterans Day Exclusive)'
  },
  {
    id: 'veterans_medal_ribbon',
    name: 'Summit Medal of Honor',
    category: 'seasonal',
    slot: 'outfits',
    cost: 160,
    rarity: 'rare',
    seasonId: 'veterans_day',
    seasonName: 'Veterans Day',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 11, startDay: 5, endMonth: 11, endDay: 18, previewDays: 7 },
    description: 'Shining golden summit medallion pinned to a ribbon of honor! (Veterans Day Exclusive)'
  },

  // 17. THANKSGIVING / HARVEST FEAST (November 12 – November 30)
  {
    id: 'thanksgiving_turkey_hat',
    name: 'Gobbler Feathered Cap',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'thanksgiving',
    seasonName: 'Harvest Feast',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 11, startDay: 12, endMonth: 11, endDay: 30, previewDays: 7 },
    description: 'Fun autumn harvest hat decorated with colorful fan feathers! (Thanksgiving Exclusive)'
  },
  {
    id: 'thanksgiving_cornucopia',
    name: 'Bountiful Harvest Horn',
    category: 'seasonal',
    slot: 'gear',
    cost: 160,
    rarity: 'rare',
    seasonId: 'thanksgiving',
    seasonName: 'Harvest Feast',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 11, startDay: 12, endMonth: 11, endDay: 30, previewDays: 7 },
    description: 'Woven horn of plenty filled to the brim with pumpkins, apples, and golden corn! (Thanksgiving Exclusive)'
  },

  // 18. WINTER HOLIDAYS & CHRISTMAS (December 1 – January 3)
  {
    id: 'holiday_santa_hat',
    name: 'Festive Santa Cap',
    category: 'seasonal',
    slot: 'headwear',
    cost: 130,
    rarity: 'rare',
    seasonId: 'holiday_season',
    seasonName: 'Holiday Wonderland',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 3, previewDays: 14 },
    description: 'Plush crimson velvet hat with soft snowy white trim and a bouncy pom-pom! (Holiday Exclusive)'
  },
  {
    id: 'holiday_reindeer_antlers',
    name: 'Jingle Reindeer Antlers',
    category: 'seasonal',
    slot: 'headwear',
    cost: 150,
    rarity: 'rare',
    seasonId: 'holiday_season',
    seasonName: 'Holiday Wonderland',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 3, previewDays: 14 },
    description: 'Cute velvety reindeer antlers decorated with little jingling golden bells! (Holiday Exclusive)'
  },
  {
    id: 'holiday_gingerbread_pet',
    name: 'Gingerbread Buddy Pet',
    category: 'seasonal',
    slot: 'pets',
    cost: 200,
    rarity: 'epic',
    seasonId: 'holiday_season',
    seasonName: 'Holiday Wonderland',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 3, previewDays: 14 },
    description: 'A sweet gingerbread friend iced with frosting and candy gumdrop buttons! (Holiday Exclusive)'
  },
  {
    id: 'holiday_candy_cane_staff',
    name: 'Peppermint Candy Staff',
    category: 'seasonal',
    slot: 'gear',
    cost: 120,
    rarity: 'common',
    seasonId: 'holiday_season',
    seasonName: 'Holiday Wonderland',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 3, previewDays: 14 },
    description: 'Giant twisted red and white peppermint candy cane tied with a green holly bow! (Holiday Exclusive)'
  },
  {
    id: 'holiday_twinkle_lights',
    name: 'Festive Holiday Lights',
    category: 'seasonal',
    slot: 'fx',
    cost: 220,
    rarity: 'legendary',
    seasonId: 'holiday_season',
    seasonName: 'Holiday Wonderland',
    seasonType: 'holiday',
    recurringSchedule: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 3, previewDays: 14 },
    description: 'Glowing multi-colored festive holiday fairy lights twinkling around Kibo! (Holiday Exclusive)'
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

export const SPARKS_PACKAGES = [
  {
    id: 'sparks_pack_1',
    name: 'Handful of Sparks',
    sparks: 500,
    price: '$1.99',
    realMoneyPrice: '$1.99',
    rarity: 'common',
    description: 'A glowing handful of 500 Sparks to grab that special cosmetic or power-up!'
  },
  {
    id: 'sparks_pack_2',
    name: 'Pouch of Sparks',
    sparks: 1200,
    price: '$3.99',
    realMoneyPrice: '$3.99',
    rarity: 'rare',
    description: 'An adventurer coin pouch packed with 1,200 crackling Sparks for your journey!'
  },
  {
    id: 'sparks_pack_3',
    name: 'Chest of Sparks',
    sparks: 3000,
    price: '$7.99',
    realMoneyPrice: '$7.99',
    rarity: 'epic',
    description: 'A heavy treasure chest overflowing with 3,000 glowing Sparks & golden energy!'
  },
  {
    id: 'sparks_pack_4',
    name: 'Mountain of Sparks',
    sparks: 10000,
    price: '$19.99',
    realMoneyPrice: '$19.99',
    rarity: 'legendary',
    description: 'A colossal hoard vault of 10,000 Sparks to unlock everything on Mount Kibo!'
  }
];

export function getItemById(id) {
  const found = WORKSHOP_ITEMS.find((item) => item.id === id);
  if (found) return found;
  return SPARKS_PACKAGES.find((pack) => pack.id === id);
}

export function getItemSlot(item) {
  if (!item) return null;
  if (item.slot) return item.slot;
  if (item.category === 'promo') {
    if (item.id === 'golden_ticket') return 'gear';
    if (item.id === 'cyber_shades') return 'headwear';
  }
  if (item.category === 'premium') {
    if (item.id === 'dragon_pet_premium') return 'pets';
    if (item.id === 'galaxy_skin_premium') return 'skins';
    if (item.id === 'starter_bundle') return 'headwear';
    if (item.id === 'kibo_club_sub') return 'fx';
  }
  return item.category;
}

/**
 * Calculates current and upcoming active windows for a recurring item schedule.
 * Handles month/day year boundary rollovers (e.g. Dec 1 -> Feb 28 or Dec 28 -> Jan 6).
 */
export function calculateRecurringWindow(recurringSchedule, currentDate = new Date()) {
  if (!recurringSchedule) return null;
  const now = (currentDate instanceof Date ? currentDate : new Date(currentDate));
  const currentYear = now.getFullYear();

  const { startMonth, startDay, endMonth, endDay, previewDays = 14 } = recurringSchedule;
  const isSpanningYear = startMonth > endMonth || (startMonth === endMonth && startDay > endDay);

  // Candidate years to test: previous year, current year, next year
  const candidateYears = [currentYear - 1, currentYear, currentYear + 1];

  let bestWindow = null;
  const nowTime = now.getTime();

  for (const year of candidateYears) {
    const startYear = year;
    const endYear = isSpanningYear ? year + 1 : year;

    const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
    // Determine last millisecond of end day in UTC
    const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
    const previewDate = new Date(startDate.getTime() - (previewDays * 86400000));

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const previewTime = previewDate.getTime();

    // 1. If currently inside active window
    if (nowTime >= startTime && nowTime <= endTime) {
      return {
        status: 'active',
        startDate,
        endDate,
        previewDate,
        startTime,
        endTime,
        previewTime,
        daysRemaining: Math.max(0, Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24)))
      };
    }

    // 2. If inside upcoming preview window
    if (nowTime >= previewTime && nowTime < startTime) {
      return {
        status: 'upcoming',
        startDate,
        endDate,
        previewDate,
        startTime,
        endTime,
        previewTime,
        startsInDays: Math.max(1, Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24)))
      };
    }

    // Keep track of the closest upcoming window in the future
    if (nowTime < previewTime) {
      if (!bestWindow || previewTime < bestWindow.previewTime) {
        bestWindow = {
          status: 'future',
          startDate,
          endDate,
          previewDate,
          startTime,
          endTime,
          previewTime,
          startsInDays: Math.max(1, Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24)))
        };
      }
    }
  }

  return bestWindow || { status: 'expired' };
}

/**
 * Computes availability status for limited-time / recurring seasonal / promo items.
 * @param {object} item
 * @param {Date|string|number} [currentDate=new Date()]
 * @returns {{ status: 'permanent'|'active'|'upcoming'|'expired', isAvailable: boolean, isUpcoming: boolean, isExpired: boolean, daysRemaining?: number, startsInDays?: number, formattedDate?: string, formattedEndDate?: string }}
 */
export function getItemAvailabilityStatus(item, currentDate = new Date()) {
  if (!item) return { status: 'permanent', isAvailable: true, isUpcoming: false, isExpired: false };

  // 1. RECURRING SCHEDULED ITEMS
  if (item.recurringSchedule) {
    const window = calculateRecurringWindow(item.recurringSchedule, currentDate);
    if (!window) return { status: 'permanent', isAvailable: true, isUpcoming: false, isExpired: false };

    if (window.status === 'active') {
      const formattedEndDate = window.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        status: 'active',
        isAvailable: true,
        isUpcoming: false,
        isExpired: false,
        daysRemaining: window.daysRemaining,
        availableUntil: window.endDate.toISOString(),
        formattedEndDate
      };
    }

    if (window.status === 'upcoming') {
      const formattedDate = window.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        status: 'upcoming',
        isAvailable: false,
        isUpcoming: true,
        isExpired: false,
        isWithinPreview: true,
        startsInDays: window.startsInDays,
        availableFrom: window.startDate.toISOString(),
        formattedDate
      };
    }

    // Off-season / not in preview
    return {
      status: 'expired',
      isAvailable: false,
      isUpcoming: false,
      isExpired: true
    };
  }

  // 2. FIXED DATE RANGE ITEMS
  if (!item.availableFrom && !item.availableUntil && !item.previewFrom) {
    return { status: 'permanent', isAvailable: true, isUpcoming: false, isExpired: false };
  }

  const now = (currentDate instanceof Date ? currentDate : new Date(currentDate)).getTime();
  const availFrom = item.availableFrom ? new Date(item.availableFrom).getTime() : null;
  const availUntil = item.availableUntil ? new Date(item.availableUntil).getTime() : null;
  const prevFrom = item.previewFrom ? new Date(item.previewFrom).getTime() : (availFrom ? availFrom - (14 * 86400000) : null);

  // Expired check
  if (availUntil && now > availUntil) {
    return {
      status: 'expired',
      isAvailable: false,
      isUpcoming: false,
      isExpired: true,
      expiredAt: item.availableUntil
    };
  }

  // Upcoming check (before availableFrom)
  if (availFrom && now < availFrom) {
    const daysUntilStart = Math.max(1, Math.ceil((availFrom - now) / (1000 * 60 * 60 * 24)));
    const isWithinPreview = !prevFrom || now >= prevFrom;
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

  // Active check
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

/**
 * List of all defined seasonal holiday event profiles for discovery & testing.
 */
export const SEASONAL_EVENTS = [
  { id: 'all_active', label: 'All Active' },
  { id: 'spring', label: '🌸 Spring Bloom', sampleDate: '2026-04-15T12:00:00Z' },
  { id: 'summer', label: '☀️ Summer Splash', sampleDate: '2026-07-15T12:00:00Z' },
  { id: 'autumn', label: '🍂 Autumn Harvest', sampleDate: '2026-10-15T12:00:00Z' },
  { id: 'winter', label: '❄️ Winter Frost', sampleDate: '2026-01-15T12:00:00Z' },
  { id: 'new_year', label: '🎆 New Year', sampleDate: '2026-12-31T20:00:00Z' },
  { id: 'mlk_day', label: '🕊️ MLK Day', sampleDate: '2026-01-19T12:00:00Z' },
  { id: 'valentines', label: '💖 Valentine\'s', sampleDate: '2026-02-14T12:00:00Z' },
  { id: 'presidents_day', label: '🇺🇸 Presidents\' Day', sampleDate: '2026-02-16T12:00:00Z' },
  { id: 'st_patricks', label: '☘️ St. Patrick\'s', sampleDate: '2026-03-17T12:00:00Z' },
  { id: 'earth_day', label: '🌍 Earth Day', sampleDate: '2026-04-22T12:00:00Z' },
  { id: 'memorial_day', label: '🎖️ Memorial Day', sampleDate: '2026-05-25T12:00:00Z' },
  { id: 'juneteenth', label: '✊ Juneteenth', sampleDate: '2026-06-19T12:00:00Z' },
  { id: 'independence_day', label: '🎇 4th of July', sampleDate: '2026-07-04T12:00:00Z' },
  { id: 'labor_day', label: '🛠️ Labor Day', sampleDate: '2026-09-07T12:00:00Z' },
  { id: 'halloween', label: '🎃 Halloween', sampleDate: '2026-10-31T18:00:00Z' },
  { id: 'veterans_day', label: '🎖️ Veterans Day', sampleDate: '2026-11-11T12:00:00Z' },
  { id: 'thanksgiving', label: '🦃 Thanksgiving', sampleDate: '2026-11-26T12:00:00Z' },
  { id: 'holiday_season', label: '🎄 Holiday Wonderland', sampleDate: '2026-12-25T12:00:00Z' }
];

/**
 * Checks whether a seasonal event is currently active or upcoming within its preview window.
 * @param {string|object} eventOrId - The event object or event id
 * @param {Date|string|number} [currentDate=new Date()]
 * @returns {boolean}
 */
export function isSeasonalEventAvailableOrUpcoming(eventOrId, currentDate = new Date()) {
  const eventId = typeof eventOrId === 'string' ? eventOrId : eventOrId?.id;
  if (!eventId || eventId === 'all_active') return true;

  const eventItems = WORKSHOP_ITEMS.filter((item) => item.category === 'seasonal' && item.seasonId === eventId);
  if (eventItems.length === 0) return false;

  return eventItems.some((item) => {
    const availability = getItemAvailabilityStatus(item, currentDate);
    return availability.status === 'active' || availability.status === 'upcoming';
  });
}

/**
 * Returns the list of seasonal event filters that are currently active or upcoming.
 * 'all_active' is always included at the beginning.
 * @param {Date|string|number} [currentDate=new Date()]
 * @returns {Array<object>}
 */
export function getAvailableSeasonalEvents(currentDate = new Date()) {
  return SEASONAL_EVENTS.filter((event) => {
    if (event.id === 'all_active') return true;
    return isSeasonalEventAvailableOrUpcoming(event, currentDate);
  });
}

