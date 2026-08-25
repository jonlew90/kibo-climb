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
    id: 'd_streak_5',
    title: 'Precision Climber',
    description: 'Achieve a 5-question correct answer streak',
    icon: 'Flame',
    category: 'daily',
    subject: 'any',
    target: 5,
    unit: 'streak',
    reward: { sparks: 60, altitude: 120 }
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
    reward: { sparks: 250, altitude: 500, shields: 1 }
  },
  {
    id: 'w_all_subjects',
    title: 'Triathlon Mountaineer',
    description: 'Solve at least 15 problems in Math, Words, and World',
    icon: 'Compass',
    category: 'weekly',
    subject: 'multi',
    target: 45,
    unit: 'problems',
    reward: { sparks: 300, altitude: 600, shields: 1 }
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
    reward: { sparks: 200, altitude: 450 }
  },
  {
    id: 'w_fast_climber',
    title: 'Speed Pioneer',
    description: 'Complete 35 problems with high speed and focus',
    icon: 'Zap',
    category: 'weekly',
    subject: 'any',
    target: 35,
    unit: 'problems',
    reward: { sparks: 220, altitude: 480 }
  }
];

export const TEAM_2P_QUEST_POOL = [
  {
    id: 't2_duo_sprint',
    title: 'Duo Summit Sprint',
    description: 'Climb together by solving 40 problems as a 2-person team',
    icon: 'Users',
    category: 'team2',
    teamSize: 2,
    target: 40,
    unit: 'problems',
    reward: { sparks: 180, altitude: 350 },
    defaultPartner: 'buddy_asha'
  },
  {
    id: 't2_math_tandem',
    title: 'Tandem Math Expedition',
    description: 'Solve 30 Math problems collaboratively with your partner',
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
    description: 'Identify 25 World flags or landmarks together',
    icon: 'Globe',
    category: 'team2',
    teamSize: 2,
    target: 25,
    unit: 'problems',
    reward: { sparks: 170, altitude: 340 },
    defaultPartner: 'buddy_maya'
  }
];

export const TEAM_3P_QUEST_POOL = [
  {
    id: 't3_trio_traverse',
    title: 'Triple Peak Expedition',
    description: 'Conquer the mountain range by solving 75 problems as a 3-person team',
    icon: 'Users',
    category: 'team3',
    teamSize: 3,
    target: 75,
    unit: 'problems',
    reward: { sparks: 350, altitude: 750, shields: 1 },
    defaultPartners: ['buddy_asha', 'buddy_tenzing']
  },
  {
    id: 't3_all_round_squad',
    title: 'All-Round Ridge Squad',
    description: 'Complete 60 problems across Math, Words, and World as a trio',
    icon: 'Compass',
    category: 'team3',
    teamSize: 3,
    target: 60,
    unit: 'problems',
    reward: { sparks: 300, altitude: 650 },
    defaultPartners: ['buddy_maya', 'buddy_sora']
  },
  {
    id: 't3_summit_assault',
    title: 'Kibo Summit Assault',
    description: 'Unite your trio to reach 90 total solved challenges',
    icon: 'Mountain',
    category: 'team3',
    teamSize: 3,
    target: 90,
    unit: 'problems',
    reward: { sparks: 400, altitude: 900, shields: 2 },
    defaultPartners: ['buddy_leo', 'buddy_tenzing']
  }
];
