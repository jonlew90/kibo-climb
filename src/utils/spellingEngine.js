/**
 * Spelling Nuance & Multi-Dialect Engine for Kibo Words
 * 
 * Maps regional English spelling differences (US vs. UK/Commonwealth),
 * allowing users to practice their native/taught dialect and flexibly
 * accepting both spellings when appropriate.
 */

// Canonical US -> UK variant mapping
// Includes common patterns: -or/-our, -er/-re, -ize/-ise, -og/-ogue, -se/-ce, double-l variants
export const US_TO_UK_SPELLINGS = {
  // -or / -our
  'color': 'colour',
  'flavor': 'flavour',
  'honor': 'honour',
  'humor': 'humour',
  'labor': 'labour',
  'neighbor': 'neighbour',
  'odor': 'odour',
  'vigor': 'vigour',
  'behavior': 'behaviour',
  'favor': 'favour',
  'glamor': 'glamour',
  'rumor': 'rumour',
  'savior': 'saviour',
  'splendor': 'splendour',
  'valiant': 'valiant',
  'arbor': 'arbour',
  'candor': 'candour',
  'clamor': 'clamour',
  'fervor': 'fervour',
  'harbor': 'harbour',
  'parlor': 'parlour',
  'rancor': 'rancour',
  'rigor': 'rigour',
  'succor': 'succour',
  'tumor': 'tumour',
  'valor': 'valour',

  // -er / -re
  'center': 'centre',
  'fiber': 'fibre',
  'liter': 'litre',
  'meter': 'metre',
  'theater': 'theatre',
  'caliber': 'calibre',
  'luster': 'lustre',
  'meager': 'meagre',
  'saber': 'sabre',
  'sepulcher': 'sepulchre',
  'somber': 'sombre',
  'specter': 'spectre',

  // -ize / -ise
  'organize': 'organise',
  'realize': 'realise',
  'recognize': 'recognise',
  'apologize': 'apologise',
  'authorize': 'authorise',
  'criticize': 'criticise',
  'emphasize': 'emphasise',
  'finalize': 'finalise',
  'memorize': 'memorise',
  'prioritize': 'prioritise',
  'specialize': 'specialise',
  'sympathize': 'sympathise',
  'characterize': 'characterise',
  'dramatize': 'dramatise',
  'colonize': 'colonise',

  // -og / -ogue
  'dialog': 'dialogue',
  'analog': 'analogue',
  'catalog': 'catalogue',
  'monolog': 'monologue',

  // -se / -ce
  'defense': 'defence',
  'offense': 'offence',
  'license': 'licence',
  'pretense': 'pretence',

  // Double 'l' vs Single 'l'
  'traveling': 'travelling',
  'traveled': 'travelled',
  'traveler': 'traveller',
  'canceled': 'cancelled',
  'canceling': 'cancelling',
  'cancellation': 'cancellation',
  'modeling': 'modelling',
  'signaling': 'signalling',
  'fueling': 'fuelling',
  'labeled': 'labelled',
  'marvelous': 'marvellous',
  'jeweler': 'jeweller',
  'jewelry': 'jewellery',
  'woolen': 'woollen',

  // Miscellaneous common words
  'gray': 'grey',
  'check': 'cheque',      // in bank/money context
  'curb': 'kerb',        // street curb
  'cozy': 'cosy',
  'plow': 'plough',
  'draft': 'draught',
  'mustache': 'moustache',
  'donut': 'doughnut',
  'airplane': 'aeroplane',
  'aluminum': 'aluminium',
  'pajamas': 'pyjamas',
  'skeptic': 'sceptic',
  'sulfur': 'sulphur',
  'tire': 'tyre'         // car tyre
};

// Build reverse map (UK -> US)
export const UK_TO_US_SPELLINGS = Object.entries(US_TO_UK_SPELLINGS).reduce((acc, [us, uk]) => {
  acc[uk] = us;
  return acc;
}, {});

/**
 * Returns all valid spelling variants for a given word.
 * @param {string} word
 * @returns {string[]} Lowercase array containing word and any variants
 */
export function getSpellingVariants(word) {
  if (!word || typeof word !== 'string') return [];
  const lower = word.trim().toLowerCase();
  const variants = new Set([lower]);

  if (US_TO_UK_SPELLINGS[lower]) {
    variants.add(US_TO_UK_SPELLINGS[lower]);
  }
  if (UK_TO_US_SPELLINGS[lower]) {
    variants.add(UK_TO_US_SPELLINGS[lower]);
  }

  return Array.from(variants);
}

/**
 * Returns the preferred spelling for a word based on the chosen dialect ('en-US' or 'en-GB').
 * If no specific variant exists, returns the original word.
 * @param {string} word
 * @param {'en-US'|'en-GB'|string} dialect
 * @returns {string}
 */
export function getPreferredSpelling(word, dialect = 'en-US') {
  if (!word || typeof word !== 'string') return word;
  const lower = word.trim().toLowerCase();

  const isUK = dialect && (dialect.startsWith('en-GB') || dialect.startsWith('en-UK') || dialect.startsWith('en-AU') || dialect.startsWith('en-NZ') || dialect.startsWith('en-CA'));

  if (isUK) {
    return US_TO_UK_SPELLINGS[lower] || lower;
  }
  // Default to US spelling
  return UK_TO_US_SPELLINGS[lower] || lower;
}

/**
 * Validates a user guess against the target word, considering dialect variants.
 * @param {string} guess
 * @param {string} targetWord
 * @param {boolean} [acceptAllDialects=true]
 * @returns {{ isCorrect: boolean, isVariant: boolean, matchedVariant: string|null }}
 */
export function checkSpellingAttempt(guess, targetWord, acceptAllDialects = true) {
  if (!guess || !targetWord) {
    return { isCorrect: false, isVariant: false, matchedVariant: null };
  }

  const normGuess = guess.trim().toLowerCase();
  const normTarget = targetWord.trim().toLowerCase();

  if (normGuess === normTarget) {
    return { isCorrect: true, isVariant: false, matchedVariant: normTarget };
  }

  if (acceptAllDialects) {
    const variants = getSpellingVariants(normTarget);
    if (variants.includes(normGuess)) {
      return { isCorrect: true, isVariant: true, matchedVariant: normGuess };
    }
  }

  return { isCorrect: false, isVariant: false, matchedVariant: null };
}
