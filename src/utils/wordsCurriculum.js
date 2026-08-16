export function getTierFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 1; // Tier 1: CVC & Sight Words
  if (numRating < 1400) return 2; // Tier 2: 4-Letter & Basic Blends
  if (numRating < 1600) return 3; // Tier 3: 5-Letter & Common Digraphs
  if (numRating < 1800) return 4; // Tier 4: Compound Words & Syllables
  if (numRating < 2000) return 5; // Tier 5: Prefixes & Suffixes
  if (numRating < 2200) return 6; // Tier 6: Advanced Vocabulary & Academic Words
  if (numRating < 2400) return 7; // Tier 7: Complex Multisyllabic & Greek/Latin Roots
  return 8;                       // Tier 8: Elite Vocabulary Master
}

// Grade-level starting ratings for Kibo Words
export const GRADE_STARTING_RATINGS = {
  'Kindergarten':                   900,   // Tier 1 — basic CVC & letter sounds
  'Grade 1–2':                      1000,  // Tier 1 — CVC & sight words
  'Grade 3–4':                      1200,  // Tier 2 — 4-letter words & consonant blends
  'Grade 5–6':                      1800,  // Tier 5 — prefixes, suffixes & word roots
  'Pre-Algebra / Middle School':    2000,  // Tier 6 — advanced academic vocabulary
  'Grade 7–8':                      2200,  // Tier 7 — multisyllabic & etymology
  'Algebra & Beyond':               2400,  // Tier 8 — peak literary & summit vocabulary
};

export function getStartingRatingForGrade(gradeLevel) {
  return GRADE_STARTING_RATINGS[gradeLevel] ?? 1000;
}

// Maps rating back to grade-level label for parent dashboard
export function getGradeLevelFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 'K–Grade 2';
  if (numRating < 1600) return 'Grade 3–4';
  if (numRating < 2000) return 'Grade 4–5';
  if (numRating < 2200) return 'Grade 5–6';
  if (numRating < 2400) return 'Grade 6–7';
  return 'Grade 7–8+';
}

export const WORDS_CURRICULUM_TIERS = [
  {
    tier: 1,
    id: 1,
    name: 'CVC & Sight Words',
    title: 'Sight Words & CVC',
    subtitle: 'Beginner Spelling & Phonics',
    location: 'Alphabet Meadow',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master consonant-vowel-consonant (CVC) words, short vowel sounds, and high-frequency sight words.',
    problemCount: 15,
    targetSpeedPerQuestion: 3.0,
    targetSprintDuration: 45,
    targetSpeed: '≤ 3.0s / question',
    topics: [
      'Short vowel patterns (a, e, i, o, u)',
      'High-frequency sight words',
      'Word families (-at, -op, -ig, -en, -ug)',
      'Basic phoneme blending'
    ],
    associatedBadge: { id: 'sight_word_scout', name: 'Sight Word Scout', icon: '🌱' },
    trailTrick: {
      title: 'Sounding Out CVC',
      description: 'Tap out the 3 sounds: Beginning consonant, middle vowel, and ending consonant! Listen closely for the short vowel in the middle.',
      summary: 'Tap out the 3 sounds: Beginning consonant, middle vowel, and ending consonant!',
      sampleProblem: {
        question: 'c _ t (A small pet that meows)',
        correctAnswer: 'cat',
        hint: 'The short "a" sound connects c and t!'
      }
    },
    proTip: {
      title: 'Vowel Spotting',
      content: 'Almost every English syllable has a vowel (a, e, i, o, u). Find the middle vowel sound first to unlock the word!',
      summary: 'Find the middle vowel sound first to unlock the word!'
    }
  },
  {
    tier: 2,
    id: 2,
    name: '4-Letter & Consonant Blends',
    title: '4-Letter Words & Blends',
    subtitle: 'Consonant Blends & Magic E',
    location: 'Consonant Forest',
    icon: '🌲',
    color: 'from-amber-400 to-orange-500',
    description: 'Learn common 4-letter words, consonant blends (bl, st, gr, nd), and silent "magic e" patterns.',
    problemCount: 15,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 60,
    targetSpeed: '≤ 4.0s / question',
    topics: [
      'Initial blends (bl, cl, fl, gr, st, sp, tr)',
      'Ending blends (-nd, -mp, -st, -nk, -lt)',
      'Silent "Magic e" long vowel patterns (cake, rope)',
      'Double letter endings (-ll, -ss, -ck)'
    ],
    associatedBadge: { id: 'blend_builder', name: 'Blend Builder', icon: '🌲' },
    trailTrick: {
      title: 'The Magic E Rule',
      description: 'When "e" sits at the end of a 4-letter word, it stays silent and makes the previous vowel say its own name (cap → cape, hop → hope)!',
      summary: 'Silent "e" makes the preceding vowel say its name!',
      sampleProblem: {
        question: 'k _ t e (Flies in the wind)',
        correctAnswer: 'kite',
        hint: 'The magic e makes the "i" say its name!'
      }
    },
    proTip: {
      title: 'Blend Sliding',
      content: 'Blends like "st" or "bl" slide together smoothly into one breath without losing either letter sound.',
      summary: 'Blends slide together smoothly into one breath!'
    }
  },
  {
    tier: 3,
    id: 3,
    name: '5-Letter & Digraphs',
    title: '5-Letter Words & Digraphs',
    subtitle: 'Vowel Teams & R-Controlled Vowels',
    location: 'Vowel River',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    description: 'Master 5-letter vocabulary, consonant digraphs (sh, ch, th, wh), vowel teams (ea, ee, oa, ou), and r-controlled vowels.',
    problemCount: 15,
    targetSpeedPerQuestion: 4.5,
    targetSprintDuration: 68,
    targetSpeed: '≤ 4.5s / question',
    topics: [
      'Consonant digraphs (sh, ch, th, wh, ph)',
      'Vowel teams (ai, ay, ee, ea, oa, oo, ou, ow)',
      'R-controlled vowels (ar, er, ir, or, ur)',
      'Compound syllables in 5-letter words'
    ],
    associatedBadge: { id: 'digraph_diver', name: 'Digraph Diver', icon: '🌊' },
    trailTrick: {
      title: 'Two Vowels Walking',
      description: 'When two vowels go walking (like "ea" in beach or "ai" in train), the first one usually does the talking and says its name!',
      summary: 'When two vowels go walking, the first one does the talking!',
      sampleProblem: {
        question: 'b e _ c h (Sandy ocean shore)',
        correctAnswer: 'beach',
        hint: 'The "ea" team pairs with the "ch" digraph!'
      }
    },
    proTip: {
      title: 'Digraph Distinction',
      content: 'A digraph creates a brand new sound (c + h = ch), unlike a blend where you hear each separate sound.',
      summary: 'Digraphs create one unique combined sound!'
    }
  },
  {
    tier: 4,
    id: 4,
    name: 'Compound Words',
    title: 'Compound Words',
    subtitle: 'Word Combinations & Multisyllable Foundations',
    location: 'Syllable Canyon',
    icon: '🏜️',
    color: 'from-purple-400 to-indigo-500',
    description: 'Master real-world compound words by combining two distinct root words into a new meaningful term.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.0,
    targetSprintDuration: 75,
    targetSpeed: '≤ 5.0s / question',
    topics: [
      'Recognizing base word components',
      'Spelling multi-syllable compound terms',
      'Nature & everyday compound vocabulary',
      'Compound word meanings & inference'
    ],
    associatedBadge: { id: 'compound_crafter', name: 'Compound Crafter', icon: '🏜️' },
    trailTrick: {
      title: 'Compound Splitting',
      description: 'Break the big compound word into its two smaller component words (sun + flower = sunflower) to spell both halves accurately!',
      summary: 'Break big compound words into two smaller base words!',
      sampleProblem: {
        question: 'p a n _ a k e (Breakfast flapjack)',
        correctAnswer: 'pancake',
        hint: 'Combine "pan" with "cake"!'
      }
    },
    proTip: {
      title: 'Check the Seam',
      content: 'Never drop or add extra letters where the two words join together (e.g. fire + place = fireplace).',
      summary: 'Keep both base words intact at the join!'
    }
  },
  {
    tier: 5,
    id: 5,
    name: 'Prefixes & Suffixes',
    title: 'Prefixes & Suffixes',
    subtitle: 'Morphology & Root Word Modifiers',
    location: 'Prefix Falls',
    icon: '🧩',
    color: 'from-sky-400 to-blue-600',
    description: 'Understand how prefixes (un-, re-, pre-, dis-) and suffixes (-ful, -less, -ness, -able) transform root words and meanings.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.5,
    targetSprintDuration: 82,
    targetSpeed: '≤ 5.5s / question',
    topics: [
      'Common prefixes (un-, re-, pre-, dis-, mis-, sub-)',
      'Common suffixes (-ful, -less, -ness, -able, -ment, -ly)',
      'Identifying root base words',
      'Parts of speech transformation (verb → noun / adj)'
    ],
    associatedBadge: { id: 'morphology_master', name: 'Morphology Master', icon: '🧩' },
    trailTrick: {
      title: 'Root Word Isolation',
      description: 'Strip away the prefix at the front and suffix at the back to reveal the root word (un-kind-ness), then assemble step-by-step!',
      summary: 'Strip away prefix and suffix to verify the root word!',
      sampleProblem: {
        question: 'f e a r _ e s s (Brave without fear)',
        correctAnswer: 'fearless',
        hint: 'Root "fear" + suffix "-less" means without fear!'
      }
    },
    proTip: {
      title: 'Suffix Spelling Shifts',
      content: 'Watch out when adding suffixes: words ending in "y" often change to "i" before adding -ness or -ful!',
      summary: 'Look for root spelling shifts when attaching suffixes.'
    }
  },
  {
    tier: 6,
    id: 6,
    name: 'Advanced Academic Vocabulary',
    title: 'Advanced Academic Vocabulary',
    subtitle: 'Descriptive & Scientific Spelling',
    location: 'Synonym Ridge',
    icon: '⛰️',
    color: 'from-amber-500 to-stone-600',
    description: 'Expand vocabulary with advanced descriptive adjectives, dynamic verbs, and cross-curricular academic words.',
    problemCount: 15,
    targetSpeedPerQuestion: 6.0,
    targetSprintDuration: 90,
    targetSpeed: '≤ 6.0s / question',
    topics: [
      'Grade 5–6 cross-curricular academic terms',
      'Rich descriptive adjectives and strong action verbs',
      'Tricky vowel combinations and double consonants',
      'Context clue deduction'
    ],
    associatedBadge: { id: 'vocab_voyager', name: 'Vocab Voyager', icon: '⛰️' },
    trailTrick: {
      title: 'Syllable Clapping',
      description: 'Break long academic words into rhythmic syllables (il-lu-mi-nate, ob-sta-cle) to ensure no vowels are skipped!',
      summary: 'Break long words into rhythmic syllable beats!',
      sampleProblem: {
        question: 'c u r i _ u s (Eager to learn)',
        correctAnswer: 'curious',
        hint: 'Three syllables: cur-i-ous!'
      }
    },
    proTip: {
      title: 'Context Clue Deciphering',
      content: 'Read the hint carefully for definition clues, synonyms, and antonyms that narrow down the exact term.',
      summary: 'Leverage hint keywords to pinpoint the exact spelling.'
    }
  },
  {
    tier: 7,
    id: 7,
    name: 'Complex Multisyllabic & Etymology',
    title: 'Multisyllabic Words & Roots',
    subtitle: 'Greek & Latin Word Stems',
    location: 'Grammar Glacier',
    icon: '❄️',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Master long, multisyllabic words and classical Greek & Latin roots (bio, geo, photo, chrono, tele, graph, struct).',
    problemCount: 15,
    targetSpeedPerQuestion: 6.5,
    targetSprintDuration: 97,
    targetSpeed: '≤ 6.5s / question',
    topics: [
      'Classical Greek & Latin roots and stems',
      '4-to-5 syllable complex spelling patterns',
      'Scientific, historical & literary terminology',
      'Phonetic irregularities & silent letters'
    ],
    associatedBadge: { id: 'etymology_explorer', name: 'Etymology Explorer', icon: '❄️' },
    trailTrick: {
      title: 'Root Stem Decoding',
      description: 'Recognize classical roots: "photo" = light, "bio" = life, "chrono" = time, "graph" = write. Stacking roots reveals spelling!',
      summary: 'Stack classical roots (bio, geo, photo, graph) to build spelling!',
      sampleProblem: {
        question: 'p h o t o s y n _ h e s i s (Plant sunlight energy process)',
        correctAnswer: 'photosynthesis',
        hint: 'Photo (light) + synthesis (combining together)!'
      }
    },
    proTip: {
      title: 'Silent Letter Navigation',
      content: 'Many Greek-derived terms contain silent letters or digraphs like "ph" for /f/ or "ch" for /k/.',
      summary: 'Watch for classical digraphs like "ph" and "ch".'
    }
  },
  {
    tier: 8,
    id: 8,
    name: 'Elite Vocabulary Master',
    title: 'Elite Vocabulary Master',
    subtitle: 'Summit Rhetoric & Precision Language',
    location: 'Mount Word Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master the most challenging, nuanced vocabulary and spelling at the peak summit of Mount Word!',
    problemCount: 15,
    targetSpeedPerQuestion: 7.0,
    targetSprintDuration: 105,
    targetSpeed: '≤ 7.0s / question',
    topics: [
      'Summit-level rhetorical & literary vocabulary',
      'Nuanced philosophical and analytical terminology',
      'High-challenge orthographic & phonetic patterns',
      'Advanced semantic precision & eloquence'
    ],
    associatedBadge: { id: 'peak_lexicon_master', name: 'Peak Lexicon Master', icon: '🏔️' },
    trailTrick: {
      title: 'Summit Chunking',
      description: 'On Mount Word Summit, divide long words into prefix, core stem, and suffix chunks. Anchor the center vowels first!',
      summary: 'Divide into prefix, stem, and suffix chunks!',
      sampleProblem: {
        question: 'm e t i c u _ o u s (Showing extreme attention to detail)',
        correctAnswer: 'meticulous',
        hint: 'Chunk it: me - tic - u - lous!'
      }
    },
    proTip: {
      title: 'Precision in Spelling',
      content: 'Elite words test subtle vowel choices (e.g. -ous vs -ious, -ant vs -ent). Listen for unstressed schwa sounds!',
      summary: 'Take note of subtle unstressed vowel endings.'
    }
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

