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

  // SKILL MASTERY BADGES
  {
    id: 'master_9s',
    title: '10-Finger Magic',
    description: 'Mastered 9s multiplication using Kibo’s 10-Finger trick!',
    category: 'skill_mastery',
    icon: '🖐️',
    reqText: 'Reach Tier 4 Multiplication'
  },
  {
    id: 'clock_master',
    title: 'Clock Master',
    description: 'Mastered reading clock times and elapsed time jumps on the trail.',
    category: 'skill_mastery',
    icon: '⏰',
    reqText: 'Complete Tier 2 & Tier 6 Time Problems'
  },
  {
    id: 'coin_counter',
    title: 'Trail Merchant',
    description: 'Mastered coin counting and making change under $1.00 and $10.00.',
    category: 'skill_mastery',
    icon: '🪙',
    reqText: 'Complete Tier 3 & Tier 6 Money Problems'
  },
  {
    id: 'summit_sync',
    title: 'Summit Sync (LCM/GCF)',
    description: 'Found Least Common Multiples and Greatest Common Factors like a pro!',
    category: 'skill_mastery',
    icon: '📐',
    reqText: 'Master Tier 7 Number Theory'
  },
  {
    id: 'exponent_peak',
    title: 'Power Peak',
    description: 'Mastered exponents, powers of 10, and square roots at Kibo Summit!',
    category: 'skill_mastery',
    icon: '⚡',
    reqText: 'Reach Tier 8 Summit Peak'
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

  // RESILIENCE BADGES
  {
    id: 'perfect_sprint',
    title: 'Accuracy Ace',
    description: 'Achieved 100% accuracy on a 10-problem daily sprint!',
    category: 'resilience',
    icon: '🎯',
    reqText: 'Get 100% Accuracy on a Sprint'
  },
  {
    id: 'speed_demon',
    title: 'Lightning Climber',
    description: 'Averaged under 2.0s per problem on a completed sprint!',
    category: 'resilience',
    icon: '🏃',
    reqText: 'Achieve <2.0s Avg Latency'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
