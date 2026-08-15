export function getTierFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 1; // Tier 1: CVC & Sight Words
  if (numRating < 1400) return 2; // Tier 2: 4-Letter & Basic Blends
  if (numRating < 1600) return 3; // Tier 3: 5-Letter & Common Digraphs
  if (numRating < 1800) return 4; // Tier 4: Compound Words & Syllables
  if (numRating < 2000) return 5; // Tier 5: Prefixes & Suffixes
  if (numRating < 2200) return 6; // Tier 6: Advanced Vocabulary & Spelling
  if (numRating < 2400) return 7; // Tier 7: Complex Multisyllabic Words
  return 8;                       // Tier 8: Elite Vocabulary Master
}

export const WORDS_CURRICULUM_TIERS = [
  {
    tier: 1,
    id: 1,
    name: 'CVC & Sight Words',
    title: 'Sight Words & CVC',
    subtitle: 'Beginner Spelling',
    location: 'Alphabet Meadow',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master consonant-vowel-consonant (CVC) words and basic sight words.',
    problemCount: 15,
    targetSpeedPerQuestion: 3.0,
    targetSprintDuration: 45,
    targetSpeed: '≤ 3.0s / question'
  },
  {
    tier: 2,
    id: 2,
    name: '4-Letter & Blends',
    title: '4-Letter Words',
    subtitle: 'Consonant Blends',
    location: 'Consonant Forest',
    icon: '🌲',
    color: 'from-amber-400 to-orange-500',
    description: 'Learn common 4-letter words and basic consonant blends.',
    problemCount: 15,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 60,
    targetSpeed: '≤ 4.0s / question'
  },
  {
    tier: 3,
    id: 3,
    name: '5-Letter & Digraphs',
    title: '5-Letter Words',
    subtitle: 'Common Digraphs',
    location: 'Vowel River',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    description: 'Master 5-letter words and common digraphs (sh, ch, th).',
    problemCount: 15,
    targetSpeedPerQuestion: 4.5,
    targetSprintDuration: 68,
    targetSpeed: '≤ 4.5s / question'
  },
  {
    tier: 4,
    id: 4,
    name: 'Compound Words',
    title: 'Compound Words',
    subtitle: 'Word Combinations',
    location: 'Syllable Canyon',
    icon: '🏜️',
    color: 'from-purple-400 to-indigo-500',
    description: 'Learn how to combine words to form compound words.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.0,
    targetSprintDuration: 75,
    targetSpeed: '≤ 5.0s / question'
  },
  {
    tier: 5,
    id: 5,
    name: 'Prefixes & Suffixes',
    title: 'Prefixes & Suffixes',
    subtitle: 'Root Word Modifiers',
    location: 'Prefix Falls',
    icon: '🧩',
    color: 'from-sky-400 to-blue-600',
    description: 'Understand how prefixes and suffixes change root words.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.5,
    targetSprintDuration: 82,
    targetSpeed: '≤ 5.5s / question'
  },
  {
    tier: 6,
    id: 6,
    name: 'Advanced Vocabulary',
    title: 'Advanced Vocabulary',
    subtitle: 'Complex Spelling',
    location: 'Synonym Ridge',
    icon: '⛰️',
    color: 'from-amber-500 to-stone-600',
    description: 'Expand vocabulary with advanced words and tricky spellings.',
    problemCount: 15,
    targetSpeedPerQuestion: 6.0,
    targetSprintDuration: 90,
    targetSpeed: '≤ 6.0s / question'
  },
  {
    tier: 7,
    id: 7,
    name: 'Multisyllabic Words',
    title: 'Multisyllabic Words',
    subtitle: 'Complex Structures',
    location: 'Grammar Glacier',
    icon: '❄️',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Master long, multisyllabic words and complex phonetic structures.',
    problemCount: 15,
    targetSpeedPerQuestion: 6.5,
    targetSprintDuration: 97,
    targetSpeed: '≤ 6.5s / question'
  },
  {
    tier: 8,
    id: 8,
    name: 'Elite Vocabulary Master',
    title: 'Elite Vocabulary Master',
    subtitle: 'Peak Language Skills',
    location: 'Mount Word Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master the most challenging vocabulary at the peak of Mount Word!',
    problemCount: 15,
    targetSpeedPerQuestion: 7.0,
    targetSprintDuration: 105,
    targetSpeed: '≤ 7.0s / question'
  }
];

export function isNearTierThreshold(currentRating) {
  const boundaries = [500, 750, 1000, 1250, 1500, 1750, 2000];
  return boundaries.some((threshold) => currentRating >= threshold - 35 && currentRating < threshold);
}

export function calculateStars(accuracyPct, durationInSeconds, tierConfig = null, totalQuestions = 15) {
  const accuracy = Number(accuracyPct) || 0;
  const rawSec = Number(durationInSeconds) || 0;
  const durationSec = rawSec > 1000 ? Math.floor(rawSec / 1000) : rawSec;

  const targetSpeed = tierConfig?.targetSpeedPerQuestion || 4.0;
  const questionsCount = Number(totalQuestions || 15);

  const targetTime3Star = questionsCount * targetSpeed;
  const targetTime2Star = targetTime3Star * 1.5;

  if (accuracy >= 95 && durationSec <= targetTime3Star) {
    return 3;
  }
  if (accuracy >= 90 && durationSec <= targetTime2Star) {
    return 2;
  }
  if (accuracy >= 80) {
    return 1;
  }

  return 0;
}
