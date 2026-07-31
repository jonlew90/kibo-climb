// Trail Badges Database for Kibo Math

export const BADGE_CATEGORIES = {
  consistency: { label: 'Streak & Consistency', icon: '🔥' },
  skill_mastery: { label: 'Skill Mastery', icon: '🎯' },
  shop: { label: 'Workshop & Fashion', icon: '🎒' },
  resilience: { label: 'Climb Resilience', icon: '⚡' }
};

export const BADGES_CATALOG = [
  // CONSISTENCY BADGES
  {
    id: 'streak_3',
    title: '3-Day Spark',
    description: 'Maintained a daily climb streak for 3 consecutive days!',
    category: 'consistency',
    icon: '⚡',
    reqText: 'Reach a 3-Day Streak'
  },
  {
    id: 'streak_7',
    title: '7-Day Trail Flame',
    description: 'Completed daily sprints for 7 days in a row! Unstoppable momentum.',
    category: 'consistency',
    icon: '💥',
    reqText: 'Reach a 7-Day Streak'
  },
  {
    id: 'streak_30',
    title: '30-Day Summit Legend',
    description: '30 days of daily math climbs! Truly a Mount Kibo Legend.',
    category: 'consistency',
    icon: '🏔️',
    reqText: 'Reach a 30-Day Streak'
  },

  // COMPETENCE RANK MILESTONE BADGES
  {
    id: 'rank_200',
    title: 'Novice Scholar',
    description: 'Reached Competence Rank 200+ in Adaptive Mastery Sessions!',
    category: 'skill_mastery',
    icon: '🌱',
    reqText: 'Reach Competence Rank 200'
  },
  {
    id: 'rank_500',
    title: 'Mathlete Champion',
    description: 'Reached Competence Rank 500+ across all adaptive math strands!',
    category: 'skill_mastery',
    icon: '🏆',
    reqText: 'Reach Competence Rank 500'
  },
  {
    id: 'rank_1000',
    title: 'Summit Master',
    description: 'Reached Competence Rank 1000+! A true Mount Kibo legend.',
    category: 'skill_mastery',
    icon: '🏔️',
    reqText: 'Reach Competence Rank 1000'
  },
  {
    id: 'master_addition',
    title: 'Addition & Subtraction Ace',
    description: 'Achieved 80%+ accuracy across single and multi-digit addition & subtraction!',
    category: 'skill_mastery',
    icon: '🖐️',
    reqText: 'Master Addition & Subtraction Strand'
  },
  {
    id: 'master_multiplication',
    title: 'Multiplication Master',
    description: 'Achieved 80%+ accuracy across multiplication and division facts!',
    category: 'skill_mastery',
    icon: '⚡',
    reqText: 'Master Multiplication Strand'
  },
  {
    id: 'master_time_money',
    title: 'Trail Merchant & Timekeeper',
    description: 'Mastered clock reading and money change calculations!',
    category: 'skill_mastery',
    icon: '🪙',
    reqText: 'Master Money & Time Strand'
  },

  // WORKSHOP BADGES
  {
    id: 'sparks_100',
    title: 'Sparks Saver',
    description: 'Earned 100+ Sparks climbing Mount Kibo!',
    category: 'shop',
    icon: '⚡',
    reqText: 'Accumulate 100 Sparks'
  },
  {
    id: 'fashionista',
    title: 'Fashionista',
    description: 'Unlocked 3 or more gear accessories in Kibo’s Workshop.',
    category: 'shop',
    icon: '🎒',
    reqText: 'Unlock 3 Workshop Items'
  },
  {
    id: 'shield_pro',
    title: 'Streak Shielded',
    description: 'Purchased a Kibo Shield to safeguard your streak from rest days.',
    category: 'shop',
    icon: '🛡️',
    reqText: 'Equip a Kibo Shield'
  },

  // RESILIENCE & ADAPTIVE STREAK BADGES
  {
    id: 'adaptive_streak_20',
    title: 'Adaptive Streak Master',
    description: 'Answered 20 consecutive adaptive math problems correctly in a single session!',
    category: 'resilience',
    icon: '🎯',
    reqText: 'Achieve a 20-Question Correct Streak'
  },
  {
    id: 'competence_surge',
    title: 'Competence Surge',
    description: 'Gained +50 Competence Rank points in a single adaptive climb session!',
    category: 'resilience',
    icon: '🚀',
    reqText: 'Gain +50 Competence Rank in a Session'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
