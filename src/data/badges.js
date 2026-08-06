// Trail Badges Database for Kibo Math

export const BADGE_CATEGORIES = {
  consistency: { label: 'Streak & Consistency', icon: '🔥' },
  records: { label: 'Personal Records & Mastery', icon: '🏆' },
  shop: { label: 'Workshop & Purchases', icon: '🎒' },
  precision: { label: 'Precision & Accuracy', icon: '🎯' }
};

export const BADGES_CATALOG = [
  // STREAK BADGES
  {
    id: 'streak_3',
    title: '3-Day Spark',
    description: 'Maintained a daily climb streak for 3 consecutive days!',
    category: 'consistency',
    icon: '⚡',
    reqText: 'Reach a 3-Day Daily Streak'
  },
  {
    id: 'streak_7',
    title: '7-Day Trail Flame',
    description: 'Completed daily climbs for 7 days in a row! Unstoppable momentum.',
    category: 'consistency',
    icon: '💥',
    reqText: 'Reach a 7-Day Daily Streak'
  },
  {
    id: 'streak_30',
    title: '30-Day Summit Legend',
    description: '30 days of daily math climbs! Truly a Mount Kibo Legend.',
    category: 'consistency',
    icon: '🏔️',
    reqText: 'Reach a 30-Day Daily Streak'
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Returned to the mountain after a break and crushed a climb!',
    category: 'consistency',
    icon: '🔄',
    reqText: 'Play after a 5+ day break'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'The early bird gets the sparks! Completed a climb before 8 AM.',
    category: 'consistency',
    icon: '🌅',
    reqText: 'Play before 8 AM'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Late night problem solving! Completed a climb after 6 PM.',
    category: 'consistency',
    icon: '🦉',
    reqText: 'Play after 6 PM'
  },
  {
    id: 'grit',
    title: 'Grit & Grace',
    description: 'Bounced back strong! Improved accuracy significantly after a tough session.',
    category: 'consistency',
    icon: '💪',
    reqText: 'Improve accuracy after a tough session'
  },

  // PERSONAL RECORDS BADGE
  {
    id: 'personal_record',
    title: 'Trailblazer Record',
    description: 'Set a new personal record in speed or accuracy!',
    category: 'records',
    icon: '⚡',
    reqText: 'Set a New Personal Record'
  },

  // WORKSHOP & SHOPPING BADGES
  {
    id: 'shop_buyer_1',
    title: 'First Haul',
    description: 'Purchased your first item from Kibo’s Corner shop!',
    category: 'shop',
    icon: '🛒',
    reqText: 'Purchase 1 Shop Item'
  },
  {
    id: 'shop_buyer_5',
    title: 'Avid Collector',
    description: 'Purchased 5 items from Kibo’s Corner shop!',
    category: 'shop',
    icon: '🎒',
    reqText: 'Purchase 5 Shop Items'
  },
  {
    id: 'rare_collector',
    title: 'Rare Finder',
    description: 'Purchased your first Rare item from Kibo’s Corner!',
    category: 'shop',
    icon: '💎',
    reqText: 'Buy your 1st Rare item'
  },
  {
    id: 'epic_collector',
    title: 'Epic Treasure',
    description: 'Purchased your first Epic item from Kibo’s Corner!',
    category: 'shop',
    icon: '🔮',
    reqText: 'Buy your 1st Epic item'
  },
  {
    id: 'legendary_collector',
    title: 'Legendary Master',
    description: 'Purchased your first Legendary item from Kibo’s Corner!',
    category: 'shop',
    icon: '👑',
    reqText: 'Buy your 1st Legendary item'
  },
  {
    id: 'gem_supporter',
    title: 'Gem Supporter',
    description: 'Purchased gems with real money for the first time!',
    category: 'shop',
    icon: '💎',
    reqText: '1st time buying gems'
  },
  {
    id: 'sparks_100',
    title: 'Sparks Saver',
    description: 'Accumulated 100+ Sparks climbing Mount Kibo!',
    category: 'shop',
    icon: '⚡',
    reqText: 'Accumulate 100 Sparks'
  },
  {
    id: 'sparks_500',
    title: 'Sparks Collector',
    description: 'Accumulated 500+ Sparks climbing Mount Kibo!',
    category: 'shop',
    icon: '✨',
    reqText: 'Accumulate 500 Sparks'
  },
  {
    id: 'sparks_1000',
    title: 'Sparks Treasure Chest',
    description: 'Accumulated 1,000+ Sparks! A true workshop tycoon.',
    category: 'shop',
    icon: '💰',
    reqText: 'Accumulate 1,000 Sparks'
  },

  // ACCURACY & PERFECT CLIMB BADGES
  {
    id: 'perfect_climb_single',
    title: 'Flawless Ascent',
    description: 'Completed a climb session with 100% accuracy!',
    category: 'precision',
    icon: '🎯',
    reqText: 'Complete 1 Perfect Climb'
  },
  {
    id: 'perfect_climb_3',
    title: 'Triple Perfection',
    description: 'Completed 3 perfect climbs!',
    category: 'precision',
    icon: '🏆',
    reqText: 'Complete 3 Perfect Climbs'
  },
  {
    id: 'perfect_streak_3',
    title: 'Unbroken Focus',
    description: 'Completed 3 perfect climbs in a row!',
    category: 'precision',
    icon: '🔥',
    reqText: '3 Perfect Climbs in a row'
  },
  {
    id: 'cumulative_answers_25',
    title: 'Streak Starter',
    description: 'Reached 25 cumulative correct answers in a row!',
    category: 'precision',
    icon: '⚡',
    reqText: '25 Cumulative Correct Answers in a row'
  },
  {
    id: 'cumulative_answers_50',
    title: 'Streak Master',
    description: 'Reached 50 cumulative correct answers in a row!',
    category: 'precision',
    icon: '🌟',
    reqText: '50 Cumulative Correct Answers in a row'
  },
  {
    id: 'cumulative_answers_100',
    title: 'Streak Legend',
    description: 'Reached 100 cumulative correct answers in a row!',
    category: 'precision',
    icon: '👑',
    reqText: '100 Cumulative Correct Answers in a row'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
