// Trail Badges Database for Kibo Climb (Math, Words, World)

export const BADGE_CATEGORIES = {
  consistency: { label: 'Streak & Consistency', icon: '🔥' },
  words: { label: 'Kibo Words', icon: '📚' },
  world: { label: 'Kibo World', icon: '🌍' },
  precision: { label: 'Precision & Accuracy', icon: '🎯' },
  shop: { label: 'Workshop & Purchases', icon: '🎒' },
  records: { label: 'Personal Records', icon: '🏆' }
};

export const BADGES_CATALOG = [
  // ==========================================
  // 1. STREAK & CONSISTENCY BADGES
  // ==========================================
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
    description: '30 days of daily climbs! Truly a Mount Kibo Legend.',
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

  // ==========================================
  // 2. KIBO WORDS BADGES
  // ==========================================
  {
    id: 'words_novice',
    title: 'Word Apprentice',
    description: 'Answered 25 Kibo Words vocabulary questions correctly!',
    category: 'words',
    icon: '🔤',
    reqText: '25 Correct in Words'
  },
  {
    id: 'words_scholar',
    title: 'Spelling Scholar',
    description: 'Answered 100 Kibo Words vocabulary questions correctly!',
    category: 'words',
    icon: '📖',
    reqText: '100 Correct in Words'
  },
  {
    id: 'words_lexicon_master',
    title: 'Master of Lexicon',
    description: 'Answered 500 Kibo Words vocabulary questions correctly!',
    category: 'words',
    icon: '👑',
    reqText: '500 Correct in Words'
  },
  {
    id: 'sight_word_scout',
    title: 'Sight Word Scout',
    description: 'Mastered CVC patterns, short vowel sounds, and foundational sight words!',
    category: 'words',
    icon: '🌱',
    reqText: 'Reach 1200+ Words Rating'
  },
  {
    id: 'blend_builder',
    title: 'Blend Builder',
    description: 'Mastered 4-letter words, consonant blends, and magic-e rules!',
    category: 'words',
    icon: '🌲',
    reqText: 'Reach 1400+ Words Rating'
  },
  {
    id: 'digraph_diver',
    title: 'Digraph Diver',
    description: 'Conquered 5-letter words, vowel teams, and consonant digraphs!',
    category: 'words',
    icon: '🌊',
    reqText: 'Reach 1600+ Words Rating'
  },
  {
    id: 'compound_crafter',
    title: 'Compound Crafter',
    description: 'Unlocked compound word construction and multi-syllable connections!',
    category: 'words',
    icon: '🏜️',
    reqText: 'Reach 1800+ Words Rating'
  },
  {
    id: 'morphology_master',
    title: 'Morphology Master',
    description: 'Mastered prefixes, suffixes, and root word transformations!',
    category: 'words',
    icon: '🧩',
    reqText: 'Reach 2000+ Words Rating'
  },
  {
    id: 'vocab_voyager',
    title: 'Vocab Voyager',
    description: 'Navigated advanced descriptive and cross-curricular academic words!',
    category: 'words',
    icon: '⛰️',
    reqText: 'Reach 2200+ Words Rating'
  },
  {
    id: 'etymology_explorer',
    title: 'Etymology Explorer',
    description: 'Decoded classical Greek and Latin roots and multi-syllabic stems!',
    category: 'words',
    icon: '❄️',
    reqText: 'Reach 2400+ Words Rating'
  },
  {
    id: 'peak_lexicon_master',
    title: 'Peak Lexicon Legend',
    description: 'Reached the summit of Mount Word with supreme vocabulary mastery!',
    category: 'words',
    icon: '🏔️',
    reqText: 'Reach 2600+ Words Rating'
  },
  {
    id: 'word_speed_demon',
    title: 'Rapid Reader',
    description: 'Completed a 100% accurate Words sprint at lightning-fast recall pace!',
    category: 'words',
    icon: '⚡',
    reqText: 'Fast Perfect Words Climb'
  },

  // ==========================================
  // 3. KIBO WORLD BADGES
  // ==========================================
  {
    id: 'world_novice',
    title: 'Compass Cadet',
    description: 'Answered 25 World Geography questions correctly!',
    category: 'world',
    icon: '🧭',
    reqText: '25 Correct in World'
  },
  {
    id: 'world_traveler',
    title: 'World Traveler',
    description: 'Answered 100 World Geography questions correctly!',
    category: 'world',
    icon: '🌍',
    reqText: '100 Correct in World'
  },
  {
    id: 'world_expert',
    title: 'Globe Trotter',
    description: 'Answered 500 World Geography questions correctly!',
    category: 'world',
    icon: '🗺️',
    reqText: '500 Correct in World'
  },
  {
    id: 'continent_navigator',
    title: 'Continent Conqueror',
    description: 'Mastered the 7 continents, 5 oceans, and cardinal directions!',
    category: 'world',
    icon: '🌊',
    reqText: 'Reach 1200+ World Rating'
  },
  {
    id: 'state_cartographer',
    title: '50 States Navigator',
    description: 'Mastered US state capitals, shapes, regions, and landmarks!',
    category: 'world',
    icon: '🦅',
    reqText: 'Reach 1400+ World Rating'
  },
  {
    id: 'country_diplomat',
    title: 'Global Diplomat',
    description: 'Mastered sovereign nations, capital cities, and continental flags!',
    category: 'world',
    icon: '🏛️',
    reqText: 'Reach 1600+ World Rating'
  },
  {
    id: 'hemisphere_voyager',
    title: 'Hemisphere Pioneer',
    description: 'Mastered country map outlines, hemispheres, rivers, and mountain ranges!',
    category: 'world',
    icon: '🛰️',
    reqText: 'Reach 1800+ World Rating'
  },
  {
    id: 'world_summit_master',
    title: 'Master Cartographer',
    description: 'Reached the peak of Mount Kibo World with expert global knowledge!',
    category: 'world',
    icon: '🌐',
    reqText: 'Reach 2000+ World Rating'
  },
  {
    id: 'capital_collector',
    title: 'Capital City Prodigy',
    description: 'Correctly answered 20 capital city challenges across World sessions!',
    category: 'world',
    icon: '🏙️',
    reqText: 'Solve 20 Capital Questions'
  },

  // ==========================================
  // 4. PRECISION & ACCURACY BADGES
  // ==========================================
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
  },

  // ==========================================
  // 5. WORKSHOP & SHOPPING BADGES
  // ==========================================
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

  // ==========================================
  // 6. PERSONAL RECORDS BADGES
  // ==========================================
  {
    id: 'personal_record',
    title: 'Trailblazer Record',
    description: 'Set a new personal record in speed or accuracy!',
    category: 'records',
    icon: '⚡',
    reqText: 'Set a New Personal Record'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}

