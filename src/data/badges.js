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
    description: 'Completed daily climbs for 7 days in a row! Unstoppable momentum.',
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
    id: 'rank_1100',
    title: 'Beginner Mathlete',
    description: 'Reached Competence Rank 1100+ in Adaptive Mastery Sessions!',
    category: 'skill_mastery',
    icon: '🌱',
    reqText: 'Reach Competence Rank 1100'
  },
  {
    id: 'rank_1300',
    title: 'Peak Navigator',
    description: 'Reached Competence Rank 1300+ across adaptive math strands!',
    category: 'skill_mastery',
    icon: '🧭',
    reqText: 'Reach Competence Rank 1300'
  },
  {
    id: 'rank_1500',
    title: 'Summit Master',
    description: 'Reached Competence Rank 1500+ across all adaptive math strands!',
    category: 'skill_mastery',
    icon: '🏆',
    reqText: 'Reach Competence Rank 1500'
  },
  {
    id: 'rank_1700',
    title: 'Kibo Legend',
    description: 'Reached Competence Rank 1700+! A true Mount Kibo legend.',
    category: 'skill_mastery',
    icon: '🏔️',
    reqText: 'Reach Competence Rank 1700'
  },
  {
    id: 'master_addition',
    title: 'Addition & Subtraction Ace',
    description: 'Mastered Sums & Differences to 20 by reaching Competence Rating 1150+!',
    category: 'skill_mastery',
    icon: '🖐️',
    reqText: 'Reach Competence Rating 1150'
  },
  {
    id: 'master_multiplication',
    title: 'Multiplication Master',
    description: 'Mastered Multiplication Foundations & Facts by reaching Competence Rating 1450+!',
    category: 'skill_mastery',
    icon: '⚡',
    reqText: 'Reach Competence Rating 1450'
  },
  {
    id: 'master_time_money',
    title: 'Trail Merchant & Timekeeper',
    description: 'Mastered Money & Elapsed Time Calculations by reaching Competence Rating 1750+!',
    category: 'skill_mastery',
    icon: '🪙',
    reqText: 'Reach Competence Rating 1750'
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
    title: 'Flawless Climb Streak',
    description: 'Achieved a 12-question perfect streak in a single climb block!',
    category: 'resilience',
    icon: '🎯',
    reqText: 'Achieve a 12-Question Correct Streak'
  },
  {
    id: 'competence_surge',
    title: 'Competence Surge',
    description: 'Gained +40 Competence Rank points in a single climb block!',
    category: 'resilience',
    icon: '🚀',
    reqText: 'Gain +40 Competence Rank in a Climb Block'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed an adaptive session block with an average speed under 5s per question!',
    category: 'resilience',
    icon: '🏆',
    reqText: 'Average speed <5s per question in a session'
  },
  {
    id: 'flawless_execution',
    title: 'Flawless Execution',
    description: 'Completed 3 Perfect Runs with 100% accuracy!',
    category: 'skill_mastery',
    icon: '🎯',
    reqText: 'Complete 3 Perfect Runs'
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Reached a 50-answer cumulative correct streak across adaptive climbs!',
    category: 'resilience',
    icon: '⚡',
    reqText: 'Reach a 50-answer cumulative streak'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
