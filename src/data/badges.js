// Trail Badges Database for Kibo Math

export const BADGE_CATEGORIES = {
  consistency: { label: 'Streak & Consistency', icon: '🔥' },
  skill_mastery: { label: 'Curriculum & Tier Mastery', icon: '🎯' },
  shop: { label: 'Workshop & Customization', icon: '🎒' },
  resilience: { label: 'Climb Speed & Resilience', icon: '⚡' }
};

export const BADGES_CATALOG = [
  // CONSISTENCY BADGES
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

  // CURRICULUM RANK & TIER MILESTONE BADGES (Synced with Tiers 1-8)
  {
    id: 'rank_tier1',
    title: 'Meadow Scout',
    description: 'Completed baseline calibration and reached Sunny Meadow (Rating 1000+)!',
    category: 'skill_mastery',
    icon: '🌱',
    reqText: 'Reach Competence Rating 1000+'
  },
  {
    id: 'rank_tier2',
    title: 'Trail Navigator',
    description: 'Unlocked Forest Trail (Rating 1200+)! Mastered Multiplication 0s–5s & Clock Math.',
    category: 'skill_mastery',
    icon: '🌲',
    reqText: 'Reach Competence Rating 1200+'
  },
  {
    id: 'rank_tier3',
    title: 'River Mathlete',
    description: 'Unlocked Multiplication River (Rating 1400+)! Mastered Tables 6s–9s & Coin Math.',
    category: 'skill_mastery',
    icon: '🌊',
    reqText: 'Reach Competence Rating 1400+'
  },
  {
    id: 'rank_tier4',
    title: 'Canyon Strategist',
    description: 'Unlocked Factor Canyon (Rating 1600+)! Mastered Multi-Digit Tens & 11s Split Shortcut.',
    category: 'skill_mastery',
    icon: '🏜️',
    reqText: 'Reach Competence Rating 1600+'
  },
  {
    id: 'rank_tier5',
    title: 'Falls Decimalist',
    description: 'Unlocked Division Falls (Rating 1800+)! Mastered Money Decimals & $1.00 Change Bridge.',
    category: 'skill_mastery',
    icon: '🪙',
    reqText: 'Reach Competence Rating 1800+'
  },
  {
    id: 'rank_tier6',
    title: 'Ridge Divisionist',
    description: 'Unlocked Boulder Ridge (Rating 2000+)! Mastered Inverse Division & Halving Ladder.',
    category: 'skill_mastery',
    icon: '⛰️',
    reqText: 'Reach Competence Rating 2000+'
  },
  {
    id: 'rank_tier7',
    title: 'Fraction Specialist',
    description: 'Unlocked Fraction Falls (Rating 2200+)! Mastered Fraction Reduction, Fraction × / ÷, %, & GCF/LCM.',
    category: 'skill_mastery',
    icon: '🧩',
    reqText: 'Reach Competence Rating 2200+'
  },
  {
    id: 'rank_tier8',
    title: 'Kibo Summit Legend',
    description: 'Conquered Mount Kibo Summit (Rating 2400+)! Mastered 2-Step Equations, Signed (-/+) Numbers & Exponents.',
    category: 'skill_mastery',
    icon: '🏔️',
    reqText: 'Reach Competence Rating 2400+'
  },

  // DOMAIN MASTERY BADGES
  {
    id: 'master_addition',
    title: 'Sums & Differences Ace',
    description: 'Mastered Sums & Differences to 20 by reaching Rating 1000+!',
    category: 'skill_mastery',
    icon: '🖐️',
    reqText: 'Reach Rating 1000+'
  },
  {
    id: 'master_multiplication',
    title: 'Multiplication Master',
    description: 'Mastered Multiplication Foundations by reaching Rating 1200+!',
    category: 'skill_mastery',
    icon: '⚡',
    reqText: 'Reach Rating 1200+'
  },
  {
    id: 'master_time_money',
    title: 'Trail Merchant & Timekeeper',
    description: 'Mastered Money Decimals & Elapsed Time by reaching Rating 1800+!',
    category: 'skill_mastery',
    icon: '⏰',
    reqText: 'Reach Rating 1800+'
  },
  {
    id: 'master_fractions',
    title: 'Fraction & GCF Master',
    description: 'Mastered Fraction Reduction, Multiplication/Division, %, & GCF/LCM by reaching Rating 2200+!',
    category: 'skill_mastery',
    icon: '🧩',
    reqText: 'Reach Rating 2200+'
  },
  {
    id: 'master_prealgebra',
    title: 'Pre-Algebra & Signed Master',
    description: 'Mastered 2-Step Pre-Algebra Equations, Signed (-/+) Numbers, & Exponents by reaching Rating 2400+!',
    category: 'skill_mastery',
    icon: '👑',
    reqText: 'Reach Rating 2400+'
  },

  // WORKSHOP & CUSTOMIZATION BADGES
  {
    id: 'sparks_100',
    title: 'Sparks Saver',
    description: 'Earned 100+ Sparks climbing Mount Kibo!',
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
    icon: '💎',
    reqText: 'Accumulate 1,000 Sparks'
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
    id: 'pet_owner',
    title: 'Pet Companion',
    description: 'Adopted a loyal pet companion in Kibo’s Workshop!',
    category: 'shop',
    icon: '🐾',
    reqText: 'Adopt any Workshop Pet'
  },
  {
    id: 'shield_pro',
    title: 'Streak Shielded',
    description: 'Purchased a Kibo Shield to safeguard your streak from rest days.',
    category: 'shop',
    icon: '🛡️',
    reqText: 'Equip a Kibo Shield'
  },

  // RESILIENCE, PROBE & SPEED BADGES
  {
    id: 'probe_master',
    title: 'Probe Teleporter',
    description: 'Successfully answered a Skill Probe Challenge during calibration!',
    category: 'resilience',
    icon: '🚀',
    reqText: 'Answer a Skill Probe Challenge correctly'
  },
  {
    id: 'adaptive_streak_20',
    title: 'Flawless Climb Block',
    description: 'Achieved a 12-question perfect streak in a single climb block!',
    category: 'resilience',
    icon: '🎯',
    reqText: 'Achieve a 12-Question Correct Block'
  },
  {
    id: 'competence_surge',
    title: 'Competence Surge',
    description: 'Gained +40 Competence Rank points in a single climb block!',
    category: 'resilience',
    icon: '⚡',
    reqText: 'Gain +40 Competence Rank in a Block'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed a climb block with an average speed under 5s per question!',
    category: 'resilience',
    icon: '🏃',
    reqText: 'Average speed < 5s per question'
  },
  {
    id: 'flawless_execution',
    title: 'Flawless Execution',
    description: 'Completed 3 Perfect Runs with 100% accuracy!',
    category: 'skill_mastery',
    icon: '🏆',
    reqText: 'Complete 3 Perfect Runs'
  },
  {
    id: 'flawless_10',
    title: 'Perfectionist',
    description: 'Completed 10 Perfect Runs with 100% accuracy!',
    category: 'skill_mastery',
    icon: '👑',
    reqText: 'Complete 10 Perfect Runs'
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Reached a 50-answer cumulative correct streak across adaptive climbs!',
    category: 'resilience',
    icon: '🔥',
    reqText: 'Reach a 50-answer cumulative streak'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}
