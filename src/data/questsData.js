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
    id: 'd_solve_20',
    title: 'Peak Pioneer',
    description: 'Solve 20 problems across any subject',
    icon: 'Mountain',
    category: 'daily',
    subject: 'any',
    target: 20,
    unit: 'problems',
    reward: { sparks: 70, altitude: 140 }
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
    id: 'd_math_12',
    title: 'Arithmetic Ascender',
    description: 'Solve 12 Math problems correctly',
    icon: 'Calculator',
    category: 'daily',
    subject: 'math',
    target: 12,
    unit: 'correct',
    reward: { sparks: 65, altitude: 130 }
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
    id: 'd_words_12',
    title: 'Lexicon Climber',
    description: 'Solve 12 Words problems correctly',
    icon: 'BookOpen',
    category: 'daily',
    subject: 'words',
    target: 12,
    unit: 'correct',
    reward: { sparks: 65, altitude: 130 }
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
    id: 'd_world_12',
    title: 'Atlas Pathfinder',
    description: 'Identify 12 World flags or countries correctly',
    icon: 'Globe',
    category: 'daily',
    subject: 'world',
    target: 12,
    unit: 'correct',
    reward: { sparks: 65, altitude: 130 }
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
    id: 'd_coding_12',
    title: 'Logic Architect',
    description: 'Solve 12 Coding logic challenges correctly',
    icon: 'Code',
    category: 'daily',
    subject: 'coding',
    target: 12,
    unit: 'correct',
    reward: { sparks: 65, altitude: 130 }
  },
  {
    id: 'd_streak_4',
    title: 'Steady Foothold',
    description: 'Achieve a 4-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 4,
    unit: 'streak',
    reward: { sparks: 35, altitude: 70 }
  },
  {
    id: 'd_streak_6',
    title: 'Precision Climber',
    description: 'Achieve a 6-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 6,
    unit: 'streak',
    reward: { sparks: 50, altitude: 100 }
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
    id: 'd_streak_10',
    title: 'Summit Flow',
    description: 'Achieve a 10-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 10,
    unit: 'streak',
    reward: { sparks: 75, altitude: 150 }
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
  },
  {
    id: 'd_tri_subject',
    title: 'Triple Ridge Master',
    description: 'Solve 18 problems across different subjects',
    icon: 'Compass',
    category: 'daily',
    subject: 'any',
    target: 18,
    unit: 'problems',
    reward: { sparks: 65, altitude: 130 }
  },
  {
    id: 'd_rapid_burst',
    title: 'Rapid Ascent Sprint',
    description: 'Solve 10 problems quickly across any subject',
    icon: 'Zap',
    category: 'daily',
    subject: 'any',
    target: 10,
    unit: 'problems',
    reward: { sparks: 45, altitude: 95 }
  },
  {
    id: 'd_math_quick',
    title: 'Quick Calculate',
    description: 'Solve 6 Math problems correctly',
    icon: 'Calculator',
    category: 'daily',
    subject: 'math',
    target: 6,
    unit: 'correct',
    reward: { sparks: 40, altitude: 80 }
  },
  {
    id: 'd_words_quick',
    title: 'Quick Lexicon',
    description: 'Solve 6 Words problems correctly',
    icon: 'BookOpen',
    category: 'daily',
    subject: 'words',
    target: 6,
    unit: 'correct',
    reward: { sparks: 40, altitude: 80 }
  },
  {
    id: 'd_world_quick',
    title: 'Quick Atlas',
    description: 'Identify 6 World locations or flags correctly',
    icon: 'Globe',
    category: 'daily',
    subject: 'world',
    target: 6,
    unit: 'correct',
    reward: { sparks: 40, altitude: 80 }
  },
  {
    id: 'd_coding_quick',
    title: 'Quick Logic',
    description: 'Solve 6 Coding challenges correctly',
    icon: 'Code',
    category: 'daily',
    subject: 'coding',
    target: 6,
    unit: 'correct',
    reward: { sparks: 40, altitude: 80 }
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
    reward: { sparks: 220, altitude: 450, scrolls: 2 }
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
    reward: { sparks: 300, altitude: 600, potions: 1, scrolls: 1 }
  },
  {
    id: 'w_total_100',
    title: 'Everest Ridge Push',
    description: 'Solve 100 total problems this week',
    icon: 'Mountain',
    category: 'weekly',
    subject: 'any',
    target: 100,
    unit: 'problems',
    reward: { sparks: 380, altitude: 760, potions: 1, shields: 1, spyglasses: 1 }
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
    reward: { sparks: 220, altitude: 440, compasses: 2 }
  },
  {
    id: 'w_quad_master',
    title: 'Four Peaks Master',
    description: 'Solve 60 problems across all 4 subjects this week',
    icon: 'Compass',
    category: 'weekly',
    subject: 'any',
    target: 60,
    unit: 'problems',
    reward: { sparks: 280, altitude: 560, potions: 1, scrolls: 2 }
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
    reward: { sparks: 180, altitude: 380, pruners: 2 }
  },
  {
    id: 'w_math_grandmaster',
    title: 'Grandmaster Number Cruncher',
    description: 'Solve 45 Math problems correctly this week',
    icon: 'Calculator',
    category: 'weekly',
    subject: 'math',
    target: 45,
    unit: 'correct',
    reward: { sparks: 260, altitude: 520, spyglasses: 2, potions: 1 }
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
    reward: { sparks: 180, altitude: 380, spyglasses: 2 }
  },
  {
    id: 'w_words_grandmaster',
    title: 'Master of Vocabulary',
    description: 'Solve 45 Words problems correctly this week',
    icon: 'BookOpen',
    category: 'weekly',
    subject: 'words',
    target: 45,
    unit: 'correct',
    reward: { sparks: 260, altitude: 520, spyglasses: 1, scrolls: 2 }
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
    reward: { sparks: 180, altitude: 380, compasses: 2 }
  },
  {
    id: 'w_world_grandmaster',
    title: 'Continental Pathfinder',
    description: 'Solve 45 World geography questions correctly',
    icon: 'Globe',
    category: 'weekly',
    subject: 'world',
    target: 45,
    unit: 'correct',
    reward: { sparks: 260, altitude: 520, compasses: 2, potions: 1 }
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
    reward: { sparks: 180, altitude: 380, scrolls: 2 }
  },
  {
    id: 'w_coding_grandmaster',
    title: 'Algorithm Vanguard',
    description: 'Solve 45 Coding logic challenges correctly',
    icon: 'Code',
    category: 'weekly',
    subject: 'coding',
    target: 45,
    unit: 'correct',
    reward: { sparks: 260, altitude: 520, pruners: 2, potions: 1 }
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
    reward: { sparks: 180, altitude: 380, potions: 1 }
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
    reward: { sparks: 240, altitude: 480, shields: 1, potions: 1 }
  },
  {
    id: 'w_iron_climber',
    title: 'Iron Climber Milestone',
    description: 'Reach a 22-question correct answer streak',
    icon: 'Flame',
    category: 'weekly',
    subject: 'any',
    target: 22,
    unit: 'streak',
    reward: { sparks: 300, altitude: 600, shields: 1, potions: 2, spyglasses: 1 }
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
    reward: { sparks: 180, altitude: 360, scrolls: 1 },
    defaultPartner: 'buddy_asha'
  },
  {
    id: 't2_duo_endurance',
    title: 'Twin Peak Marathon',
    description: 'Solve 60 problems combined with your partner',
    icon: 'Users',
    category: 'team2',
    teamSize: 2,
    target: 60,
    unit: 'problems',
    reward: { sparks: 250, altitude: 500, potions: 1, scrolls: 1 },
    defaultPartner: 'buddy_maya'
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
    reward: { sparks: 160, altitude: 320, pruners: 1 },
    defaultPartner: 'buddy_leo'
  },
  {
    id: 't2_math_surge',
    title: 'Double Formula Climb',
    description: 'Solve 45 Math problems collaboratively with your partner',
    icon: 'Calculator',
    category: 'team2',
    teamSize: 2,
    target: 45,
    unit: 'problems',
    reward: { sparks: 220, altitude: 440, spyglasses: 1, pruners: 1 },
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
    reward: { sparks: 160, altitude: 320, compasses: 1 },
    defaultPartner: 'buddy_maya'
  },
  {
    id: 't2_world_odyssey',
    title: 'Global Tandem Odyssey',
    description: 'Identify 45 World locations together with your partner',
    icon: 'Globe',
    category: 'team2',
    teamSize: 2,
    target: 45,
    unit: 'problems',
    reward: { sparks: 220, altitude: 440, compasses: 2 },
    defaultPartner: 'buddy_asha'
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
    reward: { sparks: 160, altitude: 320, spyglasses: 1 },
    defaultPartner: 'buddy_sora'
  },
  {
    id: 't2_words_summit',
    title: 'Bilingual Ridge Pair',
    description: 'Solve 45 Words problems together with your partner',
    icon: 'BookOpen',
    category: 'team2',
    teamSize: 2,
    target: 45,
    unit: 'problems',
    reward: { sparks: 220, altitude: 440, spyglasses: 1, scrolls: 1 },
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
    reward: { sparks: 160, altitude: 320, scrolls: 1 },
    defaultPartner: 'buddy_tenzing'
  },
  {
    id: 't2_coding_relay',
    title: 'Code Hackathon Duo',
    description: 'Solve 45 Coding logic problems together with your partner',
    icon: 'Code',
    category: 'team2',
    teamSize: 2,
    target: 45,
    unit: 'problems',
    reward: { sparks: 220, altitude: 440, pruners: 1, scrolls: 1 },
    defaultPartner: 'buddy_tenzing'
  },
  {
    id: 't2_cross_climb',
    title: 'Two-Climber Synergy',
    description: 'Solve 50 questions across all subjects with your partner',
    icon: 'Compass',
    category: 'team2',
    teamSize: 2,
    target: 50,
    unit: 'problems',
    reward: { sparks: 210, altitude: 420, potions: 1 },
    defaultPartner: 'buddy_asha'
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
    reward: { sparks: 280, altitude: 560, potions: 1, scrolls: 1 },
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
    reward: { sparks: 340, altitude: 680, spyglasses: 1, scrolls: 2 },
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
    reward: { sparks: 420, altitude: 840, potions: 1, shields: 1, pruners: 1 },
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
    reward: { sparks: 380, altitude: 760, compasses: 2, potions: 1 },
    defaultPartners: ['buddy_asha', 'buddy_sora']
  },
  {
    id: 't3_century_push',
    title: 'Century Ridge Trio',
    description: 'Solve 100 problems combined across all 3 squad members',
    icon: 'Mountain',
    category: 'team3',
    teamSize: 3,
    target: 100,
    unit: 'problems',
    reward: { sparks: 480, altitude: 960, potions: 2, spyglasses: 2 },
    defaultPartners: ['buddy_maya', 'buddy_tenzing']
  },
  {
    id: 't3_blitz_squad',
    title: 'High-Altitude Strike Team',
    description: 'Solve 70 problems across subjects with your 3-player squad',
    icon: 'Zap',
    category: 'team3',
    teamSize: 3,
    target: 70,
    unit: 'problems',
    reward: { sparks: 320, altitude: 640, potions: 1, scrolls: 2 },
    defaultPartners: ['buddy_leo', 'buddy_sora']
  },
  {
    id: 't3_apex_conquest',
    title: 'Apex Tri-Summit Conquest',
    description: 'Conquer 120 problems combined as a powerhouse trio',
    icon: 'Award',
    category: 'team3',
    teamSize: 3,
    target: 120,
    unit: 'problems',
    reward: { sparks: 550, altitude: 1100, potions: 2, shields: 1, spyglasses: 2, pruners: 2 },
    defaultPartners: ['buddy_asha', 'buddy_maya']
  },
  {
    id: 't3_logic_nexus',
    title: 'Trio Knowledge Crucible',
    description: 'Solve 85 problems across multiple disciplines together',
    icon: 'Compass',
    category: 'team3',
    teamSize: 3,
    target: 85,
    unit: 'problems',
    reward: { sparks: 400, altitude: 800, potions: 1, pruners: 2, scrolls: 2 },
    defaultPartners: ['buddy_leo', 'buddy_tenzing']
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
    summitReward: { sparks: 300, potions: 1, scrolls: 2, shields: 1 }
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
    summitReward: { sparks: 500, potions: 2, spyglasses: 2, scrolls: 2 }
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
    summitReward: { sparks: 750, potions: 2, pruners: 2, spyglasses: 2, shields: 1 }
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
    summitReward: { sparks: 1000, potions: 3, spyglasses: 3, pruners: 3, compasses: 2 }
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
    summitReward: { sparks: 1500, potions: 4, spyglasses: 4, pruners: 4, compasses: 4, shields: 1 }
  }
];

export const ASCENT_RANKS = [
  { level: 1, title: 'Basecamp Explorer', icon: '🏕️', reward: null },
  { level: 2, title: 'Trailhead Scout', icon: '🥾', reward: { sparks: 50, scrolls: 1 } },
  { level: 3, title: 'Forest Wanderer', icon: '🌲', reward: { sparks: 60, spyglasses: 1 } },
  { level: 4, title: 'Ridge Runner', icon: '🧗', reward: { sparks: 75, potions: 1 } },
  { level: 5, title: 'Altitude Pioneer', icon: '⚡', reward: { sparks: 100, shields: 1, scrolls: 1 } },
  { level: 6, title: 'Moorland Ranger', icon: '🌿', reward: { sparks: 120, pruners: 1 } },
  { level: 7, title: 'Highland Navigator', icon: '🧭', reward: { sparks: 140, compasses: 2 } },
  { level: 8, title: 'Plateau Pathfinder', icon: '🦅', reward: { sparks: 160, potions: 1, spyglasses: 1 } },
  { level: 9, title: 'Glacier Voyager', icon: '❄️', reward: { sparks: 180, pruners: 2, scrolls: 2 } },
  { level: 10, title: 'Summit Sovereign', icon: '👑', reward: { sparks: 250, potions: 2, shields: 1, spyglasses: 1 } }
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

