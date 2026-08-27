// Quest Definitions & Catalog for Kibo Climb

export const COMPANION_BUDDIES = [
  { id: 'buddy_asha', name: 'Asha', avatar: '🦁', title: 'Mountain Scout', color: 'from-amber-400 to-orange-500' },
  { id: 'buddy_leo', name: 'Leo', avatar: '🦅', title: 'Ridge Runner', color: 'from-sky-400 to-blue-600' },
  { id: 'buddy_maya', name: 'Maya', avatar: '🐆', title: 'Summit Guide', color: 'from-emerald-400 to-teal-600' },
  { id: 'buddy_tenzing', name: 'Tenzing', avatar: '🐻', title: 'Ice Veteran', color: 'from-indigo-400 to-purple-600' },
  { id: 'buddy_sora', name: 'Sora', avatar: '🦊', title: 'High-Altitude Trailblazer', color: 'from-rose-400 to-pink-600' }
];

export const DAILY_QUEST_POOL = [
  {
    id: 'd_solve_10',
    title: 'Altitude Sprint',
    description: 'Solve 10 problems across any subject',
    icon: 'Zap',
    category: 'daily',
    subject: 'any',
    target: 10,
    unit: 'problems',
    reward: { sparks: 40, altitude: 80 }
  },
  {
    id: 'd_solve_15',
    title: 'Extended Expedition',
    description: 'Solve 15 problems across any subject',
    icon: 'Mountain',
    category: 'daily',
    subject: 'any',
    target: 15,
    unit: 'problems',
    reward: { sparks: 55, altitude: 110 }
  },
  {
    id: 'd_math_8',
    title: 'Peak Number Cruncher',
    description: 'Solve 8 Math problems correctly',
    icon: 'Calculator',
    category: 'daily',
    subject: 'math',
    target: 8,
    unit: 'correct',
    reward: { sparks: 50, altitude: 100 }
  },
  {
    id: 'd_words_8',
    title: 'Vocabulary Ascent',
    description: 'Solve 8 Words problems correctly',
    icon: 'BookOpen',
    category: 'daily',
    subject: 'words',
    target: 8,
    unit: 'correct',
    reward: { sparks: 50, altitude: 100 }
  },
  {
    id: 'd_world_8',
    title: 'Global Explorer',
    description: 'Identify 8 World locations or flags correctly',
    icon: 'Globe',
    category: 'daily',
    subject: 'world',
    target: 8,
    unit: 'correct',
    reward: { sparks: 50, altitude: 100 }
  },
  {
    id: 'd_coding_8',
    title: 'Algorithm Pathfinder',
    description: 'Solve 8 Coding logic problems correctly',
    icon: 'Code',
    category: 'daily',
    subject: 'coding',
    target: 8,
    unit: 'correct',
    reward: { sparks: 50, altitude: 100 }
  },
  {
    id: 'd_streak_5',
    title: 'Precision Climber',
    description: 'Achieve a 5-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 5,
    unit: 'streak',
    reward: { sparks: 45, altitude: 90 }
  },
  {
    id: 'd_streak_8',
    title: 'Mountain Focus',
    description: 'Achieve an 8-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 8,
    unit: 'streak',
    reward: { sparks: 60, altitude: 120 }
  },
  {
    id: 'd_speed_10',
    title: 'Rapid Ascent',
    description: 'Solve 10 problems quickly across any subject',
    icon: 'Zap',
    category: 'daily',
    subject: 'any',
    target: 10,
    unit: 'problems',
    reward: { sparks: 45, altitude: 95 }
  },
  {
    id: 'd_dual_subject',
    title: 'Cross-Country Climber',
    description: 'Solve 12 problems across multiple subjects',
    icon: 'Compass',
    category: 'daily',
    subject: 'any',
    target: 12,
    unit: 'problems',
    reward: { sparks: 50, altitude: 105 }
  }
];

export const WEEKLY_QUEST_POOL = [
  {
    id: 'w_total_50',
    title: 'Grand Mountain Ascent',
    description: 'Solve 50 total problems this week',
    icon: 'Mountain',
    category: 'weekly',
    subject: 'any',
    target: 50,
    unit: 'problems',
    reward: { sparks: 220, altitude: 450, shields: 1 }
  },
  {
    id: 'w_total_75',
    title: 'Colossal Summit Trek',
    description: 'Solve 75 total problems this week',
    icon: 'Mountain',
    category: 'weekly',
    subject: 'any',
    target: 75,
    unit: 'problems',
    reward: { sparks: 300, altitude: 600, shields: 1 }
  },
  {
    id: 'w_all_subjects',
    title: 'Polymath Mountaineer',
    description: 'Solve 40 problems across multiple disciplines',
    icon: 'Compass',
    category: 'weekly',
    subject: 'any',
    target: 40,
    unit: 'problems',
    reward: { sparks: 220, altitude: 440, shields: 1 }
  },
  {
    id: 'w_math_master',
    title: 'Apex Mathematician',
    description: 'Solve 30 Math problems correctly',
    icon: 'Calculator',
    category: 'weekly',
    subject: 'math',
    target: 30,
    unit: 'correct',
    reward: { sparks: 180, altitude: 380, shields: 1 }
  },
  {
    id: 'w_words_master',
    title: 'Lexicon Voyager',
    description: 'Solve 30 Words problems correctly',
    icon: 'BookOpen',
    category: 'weekly',
    subject: 'words',
    target: 30,
    unit: 'correct',
    reward: { sparks: 180, altitude: 380, shields: 1 }
  },
  {
    id: 'w_world_master',
    title: 'Atlas Navigator',
    description: 'Solve 30 World problems correctly',
    icon: 'Globe',
    category: 'weekly',
    subject: 'world',
    target: 30,
    unit: 'correct',
    reward: { sparks: 180, altitude: 380, shields: 1 }
  },
  {
    id: 'w_coding_master',
    title: 'Logic Trailblazer',
    description: 'Solve 30 Coding problems correctly',
    icon: 'Code',
    category: 'weekly',
    subject: 'coding',
    target: 30,
    unit: 'correct',
    reward: { sparks: 180, altitude: 380, shields: 1 }
  },
  {
    id: 'w_accuracy_high',
    title: 'Summit Mastery',
    description: 'Reach a streak of 12 correct answers in any session',
    icon: 'Award',
    category: 'weekly',
    subject: 'any',
    target: 12,
    unit: 'streak',
    reward: { sparks: 180, altitude: 380 }
  },
  {
    id: 'w_endurance_streak',
    title: 'Unbroken Ridge',
    description: 'Reach an 18-question correct streak across your climbs',
    icon: 'Flame',
    category: 'weekly',
    subject: 'any',
    target: 18,
    unit: 'streak',
    reward: { sparks: 240, altitude: 480, shields: 1 }
  }
];

export const TEAM_2P_QUEST_POOL = [
  {
    id: 't2_duo_sprint',
    title: 'Duo Summit Sprint',
    description: 'Solve 40 problems combined with your partner',
    icon: 'Users',
    category: 'team2',
    teamSize: 2,
    target: 40,
    unit: 'problems',
    reward: { sparks: 180, altitude: 360 },
    defaultPartner: 'buddy_asha'
  },
  {
    id: 't2_math_tandem',
    title: 'Tandem Math Expedition',
    description: 'Solve 30 Math problems together with your partner',
    icon: 'Calculator',
    category: 'team2',
    teamSize: 2,
    target: 30,
    unit: 'problems',
    reward: { sparks: 160, altitude: 320 },
    defaultPartner: 'buddy_leo'
  },
  {
    id: 't2_world_scouts',
    title: 'Twin Flag Scouts',
    description: 'Identify 30 World flags or landmarks together with your partner',
    icon: 'Globe',
    category: 'team2',
    teamSize: 2,
    target: 30,
    unit: 'problems',
    reward: { sparks: 160, altitude: 320 },
    defaultPartner: 'buddy_maya'
  },
  {
    id: 't2_words_collab',
    title: 'Word Climber Duo',
    description: 'Solve 30 Words problems collaboratively with your partner',
    icon: 'BookOpen',
    category: 'team2',
    teamSize: 2,
    target: 30,
    unit: 'problems',
    reward: { sparks: 160, altitude: 320 },
    defaultPartner: 'buddy_sora'
  },
  {
    id: 't2_coding_duo',
    title: 'Binary Ridge Pair',
    description: 'Solve 30 Coding logic challenges together with your partner',
    icon: 'Code',
    category: 'team2',
    teamSize: 2,
    target: 30,
    unit: 'problems',
    reward: { sparks: 160, altitude: 320 },
    defaultPartner: 'buddy_tenzing'
  }
];

export const TEAM_3P_QUEST_POOL = [
  {
    id: 't3_all_round_squad',
    title: 'All-Round Ridge Squad',
    description: 'Complete 60 problems combined across squad members',
    icon: 'Compass',
    category: 'team3',
    teamSize: 3,
    target: 60,
    unit: 'problems',
    reward: { sparks: 280, altitude: 560, shields: 1 },
    defaultPartners: ['buddy_maya', 'buddy_sora']
  },
  {
    id: 't3_trio_traverse',
    title: 'Triple Peak Expedition',
    description: 'Solve 75 problems combined across all 3 squad members',
    icon: 'Users',
    category: 'team3',
    teamSize: 3,
    target: 75,
    unit: 'problems',
    reward: { sparks: 340, altitude: 680, shields: 1 },
    defaultPartners: ['buddy_asha', 'buddy_tenzing']
  },
  {
    id: 't3_summit_assault',
    title: 'Kibo Summit Assault',
    description: 'Reach 90 problems combined across all 3 squad members',
    icon: 'Mountain',
    category: 'team3',
    teamSize: 3,
    target: 90,
    unit: 'problems',
    reward: { sparks: 420, altitude: 840, shields: 2 },
    defaultPartners: ['buddy_leo', 'buddy_tenzing']
  },
  {
    id: 't3_quad_domain',
    title: 'Grand Quad Expedition',
    description: 'Conquer 80 problems across subjects as a united trio',
    icon: 'Award',
    category: 'team3',
    teamSize: 3,
    target: 80,
    unit: 'problems',
    reward: { sparks: 380, altitude: 760, shields: 2 },
    defaultPartners: ['buddy_asha', 'buddy_sora']
  }
];

export const ASCENT_MODES = [
  {
    tier: 1,
    name: 'Sunny Trailhead',
    subtitle: 'Standard Expedition',
    icon: '☀️',
    weather: 'Clear Skies',
    color: 'from-amber-500 to-orange-500',
    sparkBonusPct: 0,
    minXp: 0,
    maxXp: 5600,
    summitReward: { sparks: 300, shields: 2 }
  },
  {
    tier: 2,
    name: 'Alpine Gale',
    subtitle: 'High Winds Expedition',
    icon: '💨',
    weather: 'High Winds',
    color: 'from-sky-500 to-indigo-600',
    sparkBonusPct: 10,
    minXp: 5600,
    maxXp: 15000,
    summitReward: { sparks: 500, shields: 3 }
  },
  {
    tier: 3,
    name: 'Glacial Blizzard',
    subtitle: 'Sub-Zero Ice Expedition',
    icon: '❄️',
    weather: 'Freezing Blizzard',
    color: 'from-cyan-500 to-blue-700',
    sparkBonusPct: 20,
    minXp: 15000,
    maxXp: 30000,
    summitReward: { sparks: 750, shields: 3 }
  },
  {
    tier: 4,
    name: 'Midnight Summit',
    subtitle: 'Moonlit Ridge Push',
    icon: '🌙',
    weather: 'Midnight Chill',
    color: 'from-indigo-700 to-purple-900',
    sparkBonusPct: 30,
    minXp: 30000,
    maxXp: 55000,
    summitReward: { sparks: 1000, shields: 4 }
  },
  {
    tier: 5,
    name: 'Cosmic Apex',
    subtitle: 'Infinite Sovereign Master',
    icon: '👑',
    weather: 'Starlight Void',
    color: 'from-purple-600 via-pink-600 to-amber-500',
    sparkBonusPct: 50,
    minXp: 55000,
    maxXp: null,
    summitReward: { sparks: 1500, shields: 5 }
  }
];

export const ASCENT_RANKS = [
  { level: 1, title: 'Basecamp Explorer', icon: '🏕️', reward: null },
  { level: 2, title: 'Trailhead Scout', icon: '🥾', reward: { sparks: 50 } },
  { level: 3, title: 'Forest Wanderer', icon: '🌲', reward: { sparks: 60 } },
  { level: 4, title: 'Ridge Runner', icon: '🧗', reward: { sparks: 75, shields: 1 } },
  { level: 5, title: 'Altitude Pioneer', icon: '⚡', reward: { sparks: 100, shields: 1 } },
  { level: 6, title: 'Moorland Ranger', icon: '🌿', reward: { sparks: 120 } },
  { level: 7, title: 'Highland Navigator', icon: '🧭', reward: { sparks: 140, shields: 1 } },
  { level: 8, title: 'Plateau Pathfinder', icon: '🦅', reward: { sparks: 160 } },
  { level: 9, title: 'Glacier Voyager', icon: '❄️', reward: { sparks: 180, shields: 1 } },
  { level: 10, title: 'Summit Sovereign', icon: '👑', reward: { sparks: 250, shields: 2 } }
];

// Helper: Level XP curves per Ascent Mode
const ASCENT_LEVEL_THRESHOLDS = {
  1: [0, 150, 350, 650, 1050, 1600, 2300, 3200, 4300, 5600],
  2: [5600, 6000, 6600, 7400, 8400, 9600, 10900, 12300, 13700, 15000],
  3: [15000, 15800, 16800, 18100, 19700, 21600, 23700, 25900, 28000, 30000],
  4: [30000, 31500, 33500, 36000, 39000, 42500, 46200, 50000, 53000, 55000]
};

// Backward-compatible export of flattened ranks for legacy references
export const QUEST_RANKS = ASCENT_RANKS.map((r, i) => ({
  ...r,
  minXp: ASCENT_LEVEL_THRESHOLDS[1][i]
}));

export function getQuestLevelInfo(totalXp = 0) {
  const safeXp = Math.max(0, Number(totalXp) || 0);

  // 1. Determine Ascent Mode Tier
  let currentTier = 1;
  let ascentMode = ASCENT_MODES[0];

  if (safeXp >= 55000) {
    currentTier = 5;
    ascentMode = ASCENT_MODES[4];
  } else if (safeXp >= 30000) {
    currentTier = 4;
    ascentMode = ASCENT_MODES[3];
  } else if (safeXp >= 15000) {
    currentTier = 3;
    ascentMode = ASCENT_MODES[2];
  } else if (safeXp >= 5600) {
    currentTier = 2;
    ascentMode = ASCENT_MODES[1];
  }

  // 2. Determine Level 1..10 within the Ascent
  let level = 1;
  let levelStartXp = 0;
  let nextLevelXp = 150;
  let currentRank = ASCENT_RANKS[0];
  let nextRank = ASCENT_RANKS[1];

  if (currentTier <= 4) {
    const thresholds = ASCENT_LEVEL_THRESHOLDS[currentTier];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (safeXp >= thresholds[i]) {
        level = i + 1;
        levelStartXp = thresholds[i];
        currentRank = ASCENT_RANKS[i];
        break;
      }
    }

    if (level < 10) {
      nextLevelXp = thresholds[level];
      nextRank = ASCENT_RANKS[level];
    } else {
      // At Level 10 of current tier: Next milestone is Summit Promotion to next Ascent!
      const nextAscent = ASCENT_MODES[currentTier]; // tier index + 1
      nextLevelXp = nextAscent ? nextAscent.minXp : thresholds[9] + 2500;
      nextRank = {
        title: nextAscent ? `${nextAscent.name} (Ascent ${nextAscent.tier})` : 'Summit Promotion',
        reward: ascentMode.summitReward
      };
    }
  } else {
    // Infinite Cosmic Apex Tier 5+ (Looping every 30,000 XP)
    const baseApexXp = 55000;
    const apexCycleXp = 30000;
    const overflow = safeXp - baseApexXp;
    const cycle = Math.floor(overflow / apexCycleXp);
    const xpInCycle = overflow % apexCycleXp;

    // Distribute 10 levels across 30,000 XP in the cycle (~3,000 XP per level)
    const step = apexCycleXp / 10;
    const lvlIdx = Math.min(9, Math.floor(xpInCycle / step));
    level = lvlIdx + 1;
    currentRank = ASCENT_RANKS[lvlIdx];

    const cycleBaseXp = baseApexXp + cycle * apexCycleXp;
    levelStartXp = cycleBaseXp + lvlIdx * step;
    nextLevelXp = levelStartXp + step;

    if (level < 10) {
      nextRank = ASCENT_RANKS[lvlIdx + 1];
    } else {
      nextRank = {
        title: `Cosmic Summit Loop ⭐${cycle + 2}`,
        reward: ascentMode.summitReward
      };
    }
  }

  const xpRequiredForLevel = Math.max(1, nextLevelXp - levelStartXp);
  const xpIntoLevel = Math.max(0, safeXp - levelStartXp);
  const progressPct = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpRequiredForLevel) * 100)));

  return {
    ascentTier: currentTier,
    ascentMode,
    level,
    title: currentRank.title,
    fullTitle: `[Ascent ${currentTier}: ${ascentMode.name}] Lv. ${level} • ${currentRank.title}`,
    icon: currentRank.icon,
    currentXp: safeXp,
    levelStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpRequiredForLevel,
    progressPct,
    sparkBonusPct: ascentMode.sparkBonusPct,
    sparkBonusMultiplier: 1 + (ascentMode.sparkBonusPct / 100),
    isMaxLevel: false,
    nextRankTitle: nextRank?.title || 'Next Peak',
    nextRankReward: nextRank?.reward || null
  };
}

