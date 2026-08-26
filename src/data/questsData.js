// Quest Definitions & Catalog for Kibo Climb

export const COMPANION_BUDDIES = [
  { id: 'buddy_asha', name: 'Asha', avatar: '🦁', title: 'Mountain Scout', color: 'from-amber-400 to-orange-500' },
  { id: 'buddy_leo', name: 'Leo', avatar: '🦅', title: 'Ridge Runner', color: 'from-sky-400 to-blue-600' },
  { id: 'buddy_maya', name: 'Maya', avatar: '🐆', title: 'Summit Guide', color: 'from-emerald-400 to-teal-600' },
  { id: 'buddy_tenzing', name: 'Tenzing', avatar: '🏔️', title: 'Ice Veteran', color: 'from-indigo-400 to-purple-600' },
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
    description: 'Solve 10 problems with strong rhythm and focus',
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
    description: 'Complete 12 problems across any subject',
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
    description: 'Solve 40 problems combined with your partner (shared team total)',
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
    description: 'Solve 30 Math problems together with your partner (shared team total)',
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
    description: 'Identify 30 World flags or landmarks together with your partner (shared team total)',
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
    description: 'Solve 30 Words problems collaboratively with your partner (shared team total)',
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
    description: 'Solve 30 Coding logic challenges together with your partner (shared team total)',
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
    description: 'Complete 60 problems combined across squad members (shared team total)',
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
    description: 'Solve 75 problems combined across all 3 squad members (shared team total)',
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
    description: 'Reach 90 problems combined across all 3 squad members (shared team total)',
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
    description: 'Conquer 80 problems across subjects as a united trio (shared team total)',
    icon: 'Award',
    category: 'team3',
    teamSize: 3,
    target: 80,
    unit: 'problems',
    reward: { sparks: 380, altitude: 760, shields: 2 },
    defaultPartners: ['buddy_asha', 'buddy_sora']
  }
];

export const QUEST_RANKS = [
  { level: 1, title: 'Basecamp Explorer', minXp: 0, icon: '🏕️', reward: null },
  { level: 2, title: 'Trailhead Scout', minXp: 150, icon: '🥾', reward: { sparks: 50 } },
  { level: 3, title: 'Ridge Runner', minXp: 350, icon: '🌲', reward: { sparks: 75, shields: 1 } },
  { level: 4, title: 'Alpine Climber', minXp: 650, icon: '🧗', reward: { sparks: 100 } },
  { level: 5, title: 'Altitude Pioneer', minXp: 1050, icon: '⚡', reward: { sparks: 150, shields: 1 } },
  { level: 6, title: 'Glacier Voyager', minXp: 1600, icon: '❄️', reward: { sparks: 175 } },
  { level: 7, title: 'Highland Navigator', minXp: 2300, icon: '🧭', reward: { sparks: 200, shields: 1 } },
  { level: 8, title: 'Summit Vanguard', minXp: 3200, icon: '🦅', reward: { sparks: 250 } },
  { level: 9, title: 'Peak Master', minXp: 4300, icon: '👑', reward: { sparks: 300, shields: 2 } },
  { level: 10, title: 'Kibo Summit Legend', minXp: 5600, icon: '🏔️', reward: { sparks: 500, shields: 3 } }
];

export function getQuestLevelInfo(totalXp = 0) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  let currentRankIndex = 0;

  for (let i = QUEST_RANKS.length - 1; i >= 0; i--) {
    if (safeXp >= QUEST_RANKS[i].minXp) {
      currentRankIndex = i;
      break;
    }
  }

  const currentRank = QUEST_RANKS[currentRankIndex];
  const nextRank = QUEST_RANKS[currentRankIndex + 1] || null;

  if (!nextRank) {
    return {
      level: currentRank.level,
      title: currentRank.title,
      icon: currentRank.icon,
      currentXp: safeXp,
      levelStartXp: currentRank.minXp,
      nextLevelXp: currentRank.minXp,
      xpIntoLevel: 0,
      xpRequiredForLevel: 0,
      progressPct: 100,
      isMaxLevel: true,
      reward: currentRank.reward
    };
  }

  const levelStartXp = currentRank.minXp;
  const nextLevelXp = nextRank.minXp;
  const xpRequiredForLevel = nextLevelXp - levelStartXp;
  const xpIntoLevel = safeXp - levelStartXp;
  const progressPct = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpRequiredForLevel) * 100)));

  return {
    level: currentRank.level,
    title: currentRank.title,
    icon: currentRank.icon,
    currentXp: safeXp,
    levelStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpRequiredForLevel,
    progressPct,
    isMaxLevel: false,
    nextRankTitle: nextRank.title,
    nextRankReward: nextRank.reward
  };
}

