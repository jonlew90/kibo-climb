// Trail Badges Database for Kibo Climb (Math, Words, World)

export const BADGE_CATEGORIES = {
  consistency: { label: 'Streak & Consistency', icon: '🔥' },
  math: { label: 'Kibo Math', icon: '🔢' },
  words: { label: 'Kibo Words', icon: '📚' },
  world: { label: 'Kibo World', icon: '🌍' },
  coding: { label: 'Kibo Coding', icon: '💻' },
  precision: { label: 'Precision & Accuracy', icon: '🎯' },
  shop: { label: 'Workshop & Purchases', icon: '🎒' },
  quests: { label: 'Mountain Quests & Ascent', icon: '📜' }
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
  {
    id: 'multi_subject_2',
    title: 'Dual Scholar',
    description: 'Completed a climb in 2 different subjects!',
    category: 'consistency',
    icon: '🎓',
    reqText: 'Play 2 different subjects'
  },
  {
    id: 'multi_subject_3',
    title: 'Renaissance Explorer',
    description: 'Completed a climb in 3 different subjects!',
    category: 'consistency',
    icon: '🌟',
    reqText: 'Play 3 different subjects'
  },
  {
    id: 'multi_subject_4',
    title: 'Polymath Prodigy',
    description: 'Completed a climb in 4 different subjects!',
    category: 'consistency',
    icon: '🔥',
    reqText: 'Play 4 different subjects'
  },
  {
    id: 'multi_subject_5',
    title: 'Universal Genius',
    description: 'Completed a climb in 5 different subjects!',
    category: 'consistency',
    icon: '🌌',
    reqText: 'Play 5 different subjects'
  },


  // ==========================================
  // PERFECT MONTH BADGES
  // ==========================================
  { id: 'perfect_month_0', title: 'Perfect January', description: 'Completed a climb every single day in January!', category: 'consistency', icon: '❄️', reqText: 'Play every day in January' },
  { id: 'perfect_month_1', title: 'Perfect February', description: 'Completed a climb every single day in February!', category: 'consistency', icon: '💝', reqText: 'Play every day in February' },
  { id: 'perfect_month_2', title: 'Perfect March', description: 'Completed a climb every single day in March!', category: 'consistency', icon: '☘️', reqText: 'Play every day in March' },
  { id: 'perfect_month_3', title: 'Perfect April', description: 'Completed a climb every single day in April!', category: 'consistency', icon: '🌸', reqText: 'Play every day in April' },
  { id: 'perfect_month_4', title: 'Perfect May', description: 'Completed a climb every single day in May!', category: 'consistency', icon: '🌺', reqText: 'Play every day in May' },
  { id: 'perfect_month_5', title: 'Perfect June', description: 'Completed a climb every single day in June!', category: 'consistency', icon: '☀️', reqText: 'Play every day in June' },
  { id: 'perfect_month_6', title: 'Perfect July', description: 'Completed a climb every single day in July!', category: 'consistency', icon: '🎆', reqText: 'Play every day in July' },
  { id: 'perfect_month_7', title: 'Perfect August', description: 'Completed a climb every single day in August!', category: 'consistency', icon: '🏕️', reqText: 'Play every day in August' },
  { id: 'perfect_month_8', title: 'Perfect September', description: 'Completed a climb every single day in September!', category: 'consistency', icon: '🍎', reqText: 'Play every day in September' },
  { id: 'perfect_month_9', title: 'Perfect October', description: 'Completed a climb every single day in October!', category: 'consistency', icon: '🎃', reqText: 'Play every day in October' },
  { id: 'perfect_month_10', title: 'Perfect November', description: 'Completed a climb every single day in November!', category: 'consistency', icon: '🦃', reqText: 'Play every day in November' },
  { id: 'perfect_month_11', title: 'Perfect December', description: 'Completed a climb every single day in December!', category: 'consistency', icon: '🎄', reqText: 'Play every day in December' },

  // ==========================================
  // 2. KIBO MATH BADGES
  // ==========================================
  {
    id: 'math_novice',
    title: 'Math Apprentice',
    description: 'Answered 25 Kibo Math questions correctly!',
    category: 'math',
    icon: '🔢',
    reqText: '25 Correct in Math'
  },
  {
    id: 'math_scholar',
    title: 'Math Scholar',
    description: 'Answered 100 Kibo Math questions correctly!',
    category: 'math',
    icon: '🧮',
    reqText: '100 Correct in Math'
  },
  {
    id: 'math_master',
    title: 'Master of Numbers',
    description: 'Answered 500 Kibo Math questions correctly!',
    category: 'math',
    icon: '👑',
    reqText: '500 Correct in Math'
  },
  {
    id: 'addition_apprentice',
    title: 'Addition Apprentice',
    description: 'Mastered basic addition and number bonds!',
    category: 'math',
    icon: '➕',
    reqText: 'Reach 1200+ Math Rating'
  },
  {
    id: 'subtraction_scout',
    title: 'Subtraction Scout',
    description: 'Mastered subtraction and taking away!',
    category: 'math',
    icon: '➖',
    reqText: 'Reach 1400+ Math Rating'
  },
  {
    id: 'multiplication_master',
    title: 'Multiplication Master',
    description: 'Conquered times tables and repeated addition!',
    category: 'math',
    icon: '✖️',
    reqText: 'Reach 1600+ Math Rating'
  },
  {
    id: 'division_diver',
    title: 'Division Diver',
    description: 'Unlocked division and sharing equally!',
    category: 'math',
    icon: '➗',
    reqText: 'Reach 1800+ Math Rating'
  },
  {
    id: 'fraction_finder',
    title: 'Fraction Finder',
    description: 'Mastered fractions, decimals, and parts of a whole!',
    category: 'math',
    icon: '🍕',
    reqText: 'Reach 2000+ Math Rating'
  },
  {
    id: 'geometry_genius',
    title: 'Geometry Genius',
    description: 'Navigated shapes, angles, and spatial reasoning!',
    category: 'math',
    icon: '📐',
    reqText: 'Reach 2200+ Math Rating'
  },
  {
    id: 'algebra_ace',
    title: 'Algebra Ace',
    description: 'Decoded variables, equations, and algebraic expressions!',
    category: 'math',
    icon: '🔠',
    reqText: 'Reach 2400+ Math Rating'
  },
  {
    id: 'peak_math_legend',
    title: 'Peak Math Legend',
    description: 'Reached the summit of Mount Math with supreme numerical mastery!',
    category: 'math',
    icon: '🏔️',
    reqText: 'Reach 2600+ Math Rating'
  },
  {
    id: 'math_speed_demon',
    title: 'Human Calculator',
    description: 'Completed a 100% accurate Math sprint at lightning-fast recall pace!',
    category: 'math',
    icon: '⚡',
    reqText: 'Fast Perfect Math Climb'
  },

  // ==========================================
  // 3. KIBO WORDS BADGES
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
  // 4. KIBO CODING & LOGIC BADGES
  // ==========================================
  {
    id: 'coding_novice',
    title: 'Logic Cadet',
    description: 'Answered 25 Coding & Logic questions correctly!',
    category: 'coding',
    icon: '🧩',
    reqText: '25 Correct in Coding'
  },
  {
    id: 'coding_coder',
    title: 'Junior Developer',
    description: 'Answered 100 Coding & Logic questions correctly!',
    category: 'coding',
    icon: '💻',
    reqText: '100 Correct in Coding'
  },
  {
    id: 'coding_master',
    title: 'Full-Stack Master',
    description: 'Answered 500 Coding & Logic questions correctly!',
    category: 'coding',
    icon: '🚀',
    reqText: '500 Correct in Coding'
  },
  {
    id: 'pattern_scout',
    title: 'Pattern Pathfinder',
    description: 'Mastered repeating sequences, progressions, and step execution!',
    category: 'coding',
    icon: '🌱',
    reqText: 'Reach 1200+ Coding Rating'
  },
  {
    id: 'grid_navigator',
    title: 'Algorithm Ace',
    description: 'Mastered grid navigation, 2D coordinates, and repeat loop blocks!',
    category: 'coding',
    icon: '🤖',
    reqText: 'Reach 1400+ Coding Rating'
  },
  {
    id: 'boolean_ranger',
    title: 'Boolean Boss',
    description: 'Mastered true/false logic gates (AND, OR, NOT) and comparison tests!',
    category: 'coding',
    icon: '🔀',
    reqText: 'Reach 1600+ Coding Rating'
  },
  {
    id: 'variable_virtuoso',
    title: 'Variable Virtuoso',
    description: 'Mastered variable assignment, state mutability, and 4-bit binary math!',
    category: 'coding',
    icon: '🔢',
    reqText: 'Reach 1800+ Coding Rating'
  },
  {
    id: 'debug_detective',
    title: 'Debug Detective',
    description: 'Mastered if/else branching pathways and spot-the-bug code analysis!',
    category: 'coding',
    icon: '⚡',
    reqText: 'Reach 2000+ Coding Rating'
  },
  {
    id: 'loop_legend',
    title: 'Iteration Specialist',
    description: 'Mastered for-loop accumulators, counters, and while-loop conditions!',
    category: 'coding',
    icon: '🔁',
    reqText: 'Reach 2200+ Coding Rating'
  },
  {
    id: 'code_summit_master',
    title: 'Code Summit Legend',
    description: 'Reached the peak of Mount Kibo Coding with master algorithmic fluency!',
    category: 'coding',
    icon: '🏔️',
    reqText: 'Reach 2400+ Coding Rating'
  },
  {
    id: 'code_speed_demon',
    title: 'Speed Scripter',
    description: 'Completed a 100% accurate Coding climb at lightning-fast recall pace!',
    category: 'coding',
    icon: '⚡',
    reqText: 'Fast Perfect Coding Climb'
  },

  // ==========================================
  // 5. PRECISION & ACCURACY BADGES
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
  // 8. MOUNTAIN QUESTS & ASCENT BADGES
  // ==========================================
  {
    id: 'quest_first_claim',
    title: 'Quest Initiate',
    description: 'Completed and claimed your very first Mountain Quest!',
    category: 'quests',
    icon: '📜',
    reqText: 'Claim your 1st Quest reward'
  },
  {
    id: 'quest_elevation_1000',
    title: 'Kilimanjaro Trailblazer',
    description: 'Gained 1,000+ meters of Elevation XP conquering quests!',
    category: 'quests',
    icon: '🏔️',
    reqText: 'Gain 1,000m Quest Elevation XP'
  },
  {
    id: 'quest_elevation_5000',
    title: 'Summit Trail Master',
    description: 'Conquered 5,000+ meters of Elevation XP on Mount Kibo!',
    category: 'quests',
    icon: '⛰️',
    reqText: 'Gain 5,000m Quest Elevation XP'
  },
  {
    id: 'quest_level_5',
    title: 'Altitude Pioneer',
    description: 'Reached Quest Level 5 on the mountain progression trail!',
    category: 'quests',
    icon: '⚡',
    reqText: 'Reach Quest Level 5'
  },
  {
    id: 'quest_level_10',
    title: 'Kibo Summit Legend',
    description: 'Reached the maximum Quest Level 10! The summit is yours.',
    category: 'quests',
    icon: '👑',
    reqText: 'Reach Quest Level 10'
  },
  {
    id: 'quest_claims_10',
    title: 'Veteran Pathfinder',
    description: 'Successfully completed and claimed 10 total quests!',
    category: 'quests',
    icon: '🧭',
    reqText: 'Claim 10 total Quests'
  },
  {
    id: 'quest_team_first',
    title: 'Expedition Partner',
    description: 'Completed and claimed a collaborative Team Quest!',
    category: 'quests',
    icon: '🤝',
    reqText: 'Complete 1 Team Quest'
  }
];

export function getBadgeById(id) {
  return BADGES_CATALOG.find((b) => b.id === id);
}


