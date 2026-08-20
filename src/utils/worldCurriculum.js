// World Curriculum Curriculum Tiers
export const WORLD_CURRICULUM_TIERS = [
  {
    tier: 1,
    title: 'Continent Basecamp',
    subtitle: 'Continents & Oceans',
    description: 'Learn to identify the 7 continents and 5 major oceans of the world.',
    topics: [
      'Identifying Continents',
      'Identifying Oceans'
    ],
    hintText: {
      description: 'The earth has 7 large landmasses called continents and 5 huge bodies of water called oceans!',
      content: 'Remember: Asia is the largest, and Australia is the smallest continent.',
      summary: 'Learn the major landmasses and bodies of water.'
    }
  },
  {
    tier: 2,
    title: 'State Trails',
    subtitle: 'US States & Shapes',
    description: 'Master the 50 United States and recognize their unique shapes.',
    topics: [
      'US State Identification',
      'US State Shapes'
    ],
    hintText: {
      description: 'Look at the shape closely! Some states are very square, while others have squiggly borders from rivers or coastlines.',
      content: 'Texas is huge and has a panhandle. California is long and hugs the west coast.',
      summary: 'Identify states by name or shape.'
    }
  },
  {
    tier: 3,
    title: 'Country Crossings',
    subtitle: 'Major Countries & Capitals',
    description: 'Learn the names and capitals of the most well-known countries around the globe.',
    topics: [
      'Major Countries',
      'Major Capitals'
    ],
    hintText: {
      description: 'Many famous countries have well-known capitals. Like Paris in France, or Tokyo in Japan!',
      content: 'A capital city is the center of government for that country.',
      summary: 'Match major countries with their capital cities.'
    }
  },
  {
    tier: 4,
    title: 'Hemisphere Heights',
    subtitle: 'Country Shapes & Locations',
    description: 'Identify countries by their geographic shapes and locations on the map.',
    topics: [
      'Country Shapes',
      'Country Locations'
    ],
    hintText: {
      description: 'Look at the borders! Italy looks like a boot. Japan is a string of islands.',
      content: 'Recognizing shapes helps you build a mental map of the world.',
      summary: 'Identify countries just by looking at their shape.'
    }
  },
  {
    tier: 5,
    title: 'World Summit',
    subtitle: 'Global Geography Expert',
    description: 'Master advanced global geography, lesser-known capitals, and tricky shapes.',
    topics: [
      'Global Geography',
      'Obscure Capitals'
    ],
    hintText: {
      description: 'You are now tackling the hardest geography challenges! Pay close attention to subtle differences in shapes.',
      content: 'Take your time. Some of these are very tricky!',
      summary: 'Become a true World Geography Expert.'
    }
  }
];

export const WORLD_TIER_RATING_THRESHOLDS = {
  'Pre-K / K': 1000,
  'Grade 1–2': 1200,
  'Grade 3–4': 1400,
  'Grade 5–6': 1600,
  'Grade 7–8+': 1800,
};

export const getTierForRating = (rating) => {
  if (rating < 1200) return 1;
  if (rating < 1400) return 2;
  if (rating < 1600) return 3;
  if (rating < 1800) return 4;
  return 5;
};

export const isNearTierThreshold = (rating) => {
  const thresholds = [1200, 1400, 1600, 1800];
  return thresholds.some(t => Math.abs(rating - t) <= 25);
};
