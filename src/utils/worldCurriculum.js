// World Curriculum Curriculum Tiers
export const WORLD_CURRICULUM_TIERS = [
  {
    tier: 1,
    title: 'Continent Basecamp',
    subtitle: 'Continents, Oceans & Directions',
    description: 'Master the 7 continents, 5 major oceans, cardinal directions, and foundational global facts.',
    topics: [
      'Identifying Continents',
      'Identifying Oceans',
      'Cardinal Directions',
      'Continent & Ocean Superlatives',
      'Continent Matching'
    ],
    hintText: {
      description: 'The earth has 7 large landmasses called continents and 5 huge bodies of water called oceans!',
      content: 'Remember: Asia is the largest continent, Australia is the smallest, and the Pacific is the largest ocean.',
      summary: 'Learn the major landmasses, oceans, and cardinal directions.'
    }
  },
  {
    tier: 2,
    title: 'State Trails',
    subtitle: 'US States, Capitals & Shapes',
    description: 'Master all 50 United States, their capital cities, recognizable map shapes, and key landmarks.',
    topics: [
      'US State Capitals',
      'Capital to State Matching',
      'US State Shapes',
      'US State Nicknames & Landmarks'
    ],
    hintText: {
      description: 'Look at the shape and region! Some states have straight borders, while others follow coastlines or rivers.',
      content: 'Texas is the Lone Star State with Austin as its capital. California is the Golden State with Sacramento as its capital.',
      summary: 'Identify US states by capital, name, shape, or nickname.'
    }
  },
  {
    tier: 3,
    title: 'Country Crossings',
    subtitle: 'Major Countries, Capitals & Continents',
    description: 'Learn the names, capitals, and continental locations of over 60 sovereign countries around the world.',
    topics: [
      'Country Capitals',
      'Capital to Country Matching',
      'Country Continents',
      'Famous International Landmarks'
    ],
    hintText: {
      description: 'Many famous countries have well-known capitals. Like Paris in France, Tokyo in Japan, or Ottawa in Canada!',
      content: 'A capital city is the official seat of government for that nation.',
      summary: 'Match sovereign nations with their capital cities and continents.'
    }
  },
  {
    tier: 4,
    title: 'Hemisphere Heights',
    subtitle: 'Country Shapes, Hemispheres & Physical Geography',
    description: 'Identify countries by their unique map outlines, understand global hemispheres, and master major rivers, deserts, and mountain ranges.',
    topics: [
      'Country Shapes & Borders',
      'Hemispheres & Latitude/Longitude',
      'Physical Geography (Mountains, Deserts, Rivers)',
      'Canals & Major Straits'
    ],
    hintText: {
      description: 'Look at country borders closely! Italy is shaped like a boot, Japan is an archipelago, and Chile is a long coastal ribbon.',
      content: 'Physical features like the Nile River, Sahara Desert, and Himalayas shape our planet.',
      summary: 'Identify countries by outline and navigate global physical geography.'
    }
  },
  {
    tier: 5,
    title: 'Ridge & River Pass',
    subtitle: 'World Rivers, Mountain Ranges & Deserts',
    description: 'Master major world river systems, high mountain ranges, deserts, and famous physical earth landmarks.',
    topics: [
      'Major World Mountain Ranges',
      'Global River Systems & Basins',
      'Great Deserts & Arid Zones',
      'Physical Geography Superlatives'
    ],
    hintText: {
      description: 'Physical geography covers the natural landforms that cross country boundaries!',
      content: 'The Andes run down South America, the Himalayas tower over Asia, and the Amazon flows through dense rainforest.',
      summary: 'Identify major mountain ranges, rivers, and natural landforms.'
    }
  },
  {
    tier: 6,
    title: 'Archipelago Atolls',
    subtitle: 'Visual Landmarks, Marginal Seas & Regional Maps',
    description: 'Identify iconic architectural monuments, world wonders, regional island chains, and marginal seas.',
    topics: [
      'Visual World Wonders & Architecture',
      'Marginal Seas & Water Bodies',
      'Island Archipelagos & Territory Outlines',
      'Regional Map Recognition'
    ],
    hintText: {
      description: 'Observe architectural details and oceanic water bodies!',
      content: 'Marginal seas like the Mediterranean, Caribbean, and Red Sea border continents and connect to oceans.',
      summary: 'Recognize visual wonders, regional maps, and major seas.'
    }
  },
  {
    tier: 7,
    title: 'Strait of Meridian',
    subtitle: 'Strategic Global Straits, Canals & Enclaves',
    description: 'Master crucial maritime choke points, canals, geopolitical enclaves, and transcontinental territory boundaries.',
    topics: [
      'Strategic Straits (Malacca, Hormuz, Gibraltar)',
      'Man-Made Canals (Panama & Suez)',
      'Geopolitical Enclaves & Anomalies',
      'Hemisphere Latitudes & Prime Meridian'
    ],
    hintText: {
      description: 'Maritime straits and enclaves shape global trade and political boundaries!',
      content: 'The Strait of Gibraltar connects the Atlantic to the Mediterranean, while the Panama Canal links the Atlantic and Pacific.',
      summary: 'Master strategic waterways and geopolitical anomalies.'
    }
  },
  {
    tier: 8,
    title: 'Mount World Summit',
    subtitle: 'Peak Cartography & Tricky Capital Misconceptions',
    description: 'Demonstrate summit mastery over counterintuitive capital cities, deepest ocean trenches, and extreme global geography.',
    topics: [
      'Tricky Capitals & Common Misconceptions',
      'Extreme Earth Geography & Deepest Trenches',
      'Sub-Zero Polar Geography & Coordinates',
      'Summit Cartographer Mastery'
    ],
    hintText: {
      description: 'You have reached the summit! Watch out for common traps and deceptive city names.',
      content: 'Many capital cities were purposefully built away from the largest metropolitan hubs.',
      summary: 'Demonstrate peak global geography mastery.'
    }
  }
];

export const WORLD_TIER_RATING_THRESHOLDS = {
  'Kindergarten': 900,
  'Grade 1–2': 1000,
  'Grade 3–4': 1200,
  'Grade 5–6': 1800,
  'Grade 7–8': 2200,
  'High School & Beyond': 2400,
};

// Grade-level starting ratings for Kibo World
export const GRADE_STARTING_RATINGS = {
  'Kindergarten':                   900,   // Tier 1 — Continents, oceans & earth foundations
  'Grade 1–2':                      1000,  // Tier 1 — Continents, oceans & cardinal directions
  'Grade 3–4':                      1200,  // Tier 2 — US states, shapes & state capitals
  'Grade 5–6':                      1800,  // Tier 5 — Rivers, mountains, deserts & physical geography
  'Grade 7–8':                      2200,  // Tier 7 — Straits, canals & geopolitical enclaves
  'High School & Beyond':           2400,  // Tier 8 — Summit tricky capitals & extreme geography
};

export function getStartingRatingForGrade(gradeLevel) {
  if (GRADE_STARTING_RATINGS[gradeLevel]) {
    return GRADE_STARTING_RATINGS[gradeLevel];
  }
  if (gradeLevel === 'Pre-Algebra / Middle School' || gradeLevel === 'Pre-Algebra') return 2000;
  if (gradeLevel === 'Algebra & Beyond' || gradeLevel === 'Algebra+') return 2400;
  return 1000;
}

// Maps rating back to grade-level label for parent dashboard
export function getGradeLevelFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 'K–Grade 2';   // Tier 1: Continents & Oceans
  if (numRating < 1400) return 'Grade 3–4';   // Tier 2: US States & Capitals
  if (numRating < 1600) return 'Grade 4–5';   // Tier 3: Major Countries & Capitals
  if (numRating < 1800) return 'Grade 5–6';   // Tier 4: Country Shapes & Hemispheres
  if (numRating < 2000) return 'Grade 6–7';   // Tier 5: Mountains, Rivers & Deserts
  if (numRating < 2200) return 'Grade 7–8';   // Tier 6: Visual Landmarks & Seas
  if (numRating < 2400) return 'Grade 8+';    // Tier 7: Straits & Enclaves
  return 'High School+';                      // Tier 8: Mount World Summit
}

export const getTierForRating = (rating = 1000) => {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 1;
  if (numRating < 1400) return 2;
  if (numRating < 1600) return 3;
  if (numRating < 1800) return 4;
  if (numRating < 2000) return 5;
  if (numRating < 2200) return 6;
  if (numRating < 2400) return 7;
  return 8;
};

export const getTierFromRating = getTierForRating;

export const isNearTierThreshold = (rating) => {
  const thresholds = [1200, 1400, 1600, 1800, 2000, 2200, 2400];
  return thresholds.some(t => Math.abs(rating - t) <= 25);
};


