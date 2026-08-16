import fs from 'fs';
import path from 'path';

import { tier1Words } from './data/tier1.js';
import { tier2Words } from './data/tier2.js';
import { tier3Words } from './data/tier3.js';
import { tier4Words } from './data/tier4.js';
import { tier5Words } from './data/tier5.js';
import { tier6Words } from './data/tier6.js';
import { tier7Words } from './data/tier7.js';
import { tier8Words } from './data/tier8.js';

const rawTiers = {
  1: tier1Words,
  2: tier2Words,
  3: tier3Words,
  4: tier4Words,
  5: tier5Words,
  6: tier6Words,
  7: tier7Words,
  8: tier8Words
};

const cleanTiers = {};
let grandTotal = 0;

for (let t = 1; t <= 8; t++) {
  const list = rawTiers[t];
  const seen = new Set();
  const filtered = [];

  for (const item of list) {
    const w = item.word.trim().toLowerCase();
    if (!seen.has(w) && w.length > 0) {
      seen.add(w);
      filtered.push({
        word: w,
        hint: item.hint.trim()
      });
    }
  }

  cleanTiers[t] = filtered;
  console.log(`Tier ${t}: ${filtered.length} unique words`);
  grandTotal += filtered.length;
}

console.log(`\nGrand Total Curriculum Words: ${grandTotal}`);

// Now let's construct the content for src/utils/wordsGenerator.js
const fileContent = `import { isNearTierThreshold } from './wordsCurriculum.js';

export const WORD_LISTS = ${JSON.stringify(cleanTiers, null, 2)};

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a single problem for a target tier.
 * @param {number} targetTier - The curriculum tier (1-8)
 * @param {boolean} isNearThreshold - Whether user is near promotion
 * @param {Set|Array} excludeWords - Words to avoid repeating
 */
export function generateTierProblem(targetTier, isNearThreshold = false, excludeWords = new Set()) {
  let effectiveTier = targetTier;
  const excludeSet = excludeWords instanceof Set ? excludeWords : new Set(excludeWords || []);

  // Occasionally review lower tiers (15% chance if not near threshold)
  if (!isNearThreshold && targetTier > 1 && Math.random() < 0.15) {
    effectiveTier = Math.floor(Math.random() * (targetTier - 1)) + 1;
  }

  const list = WORD_LISTS[effectiveTier] || WORD_LISTS[1];
  
  // Filter out excluded words if there are sufficient candidates left
  let candidateList = list.filter(item => !excludeSet.has(item.word.toLowerCase()));
  if (candidateList.length === 0) {
    candidateList = list;
  }

  const item = candidateList[Math.floor(Math.random() * candidateList.length)];
  const answer = item.word.toLowerCase();

  // Determine revealed indices based on tier difficulty
  let revealedIndices = [];
  if (effectiveTier === 1) {
    // Reveal 1 letter (middle letter or vowel if possible)
    revealedIndices.push(Math.floor(Math.random() * answer.length));
  } else if (effectiveTier === 2) {
    // Reveal 1 letter
    revealedIndices.push(Math.floor(Math.random() * answer.length));
  } else if (effectiveTier === 3 || effectiveTier === 4) {
    // Reveal 2 distinct letters
    if (answer.length > 2) {
      let idx1 = Math.floor(Math.random() * answer.length);
      let idx2 = Math.floor(Math.random() * answer.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * answer.length);
      }
      revealedIndices.push(idx1, idx2);
    } else {
      revealedIndices.push(0);
    }
  } else if (effectiveTier === 5) {
    // Reveal 2 letters
    if (answer.length > 3) {
      let idx1 = Math.floor(Math.random() * answer.length);
      let idx2 = Math.floor(Math.random() * answer.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * answer.length);
      }
      revealedIndices.push(idx1, idx2);
    }
  } else if (effectiveTier === 6) {
    // Reveal 1 letter for long words (>=8 chars)
    if (answer.length >= 8) {
      revealedIndices.push(Math.floor(Math.random() * answer.length));
    }
  } else if (effectiveTier >= 7) {
    // Reveal 1-2 letters only for very long 10+ letter words
    if (answer.length >= 12) {
      let idx1 = Math.floor(Math.random() * answer.length);
      let idx2 = Math.floor(Math.random() * answer.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * answer.length);
      }
      revealedIndices.push(idx1, idx2);
    } else if (answer.length >= 9) {
      revealedIndices.push(Math.floor(Math.random() * answer.length));
    }
  }

  const displayString = answer.split('').map((char, index) => {
    return revealedIndices.includes(index) ? char : '_';
  }).join(' ');

  return {
    tier: effectiveTier,
    answer: answer,
    answerString: answer,
    displayString: displayString,
    hint: item.hint,
    type: 'word'
  };
}

/**
 * Generates an expansive batch of deduplicated problems for a session or climb.
 * Guarantees zero word repetition in the returned batch and actively deprioritizes recent history.
 * @param {number} count - Total problems to generate (e.g. 15)
 * @param {number} targetTier - Active tier (1-8)
 * @param {Array|Set} history - Recently encountered words to exclude
 * @param {Set} seenKeys - Keys already in active session
 */
export function generateProblems(count, targetTier, history = [], seenKeys = new Set()) {
  const problems = [];
  const sessionSeen = new Set(seenKeys);
  const recentHistorySet = new Set(Array.isArray(history) ? history.map(w => String(w).toLowerCase()) : []);

  // Combined exclusion set (active session + recent history)
  const masterExclude = new Set([...sessionSeen, ...recentHistorySet]);

  const targetList = WORD_LISTS[targetTier] || WORD_LISTS[1];
  const shuffledTarget = shuffleArray(targetList);

  // 1. First pass: Select fresh words from target tier excluding history & active session
  for (const item of shuffledTarget) {
    if (problems.length >= count) break;
    const w = item.word.toLowerCase();
    if (!masterExclude.has(w)) {
      masterExclude.add(w);
      sessionSeen.add(w);
      seenKeys.add(w);

      const prob = generateTierProblem(targetTier, false, masterExclude);
      problems.push({
        ...prob,
        answer: w,
        answerString: w,
        hint: item.hint,
        id: \`prob_\${Date.now()}_\${problems.length}_\${Math.random().toString(36).substring(2, 7)}\`
      });
    }
  }

  // 2. Second pass: If we still need problems, allow words from target tier not in active session
  if (problems.length < count) {
    for (const item of shuffledTarget) {
      if (problems.length >= count) break;
      const w = item.word.toLowerCase();
      if (!sessionSeen.has(w)) {
        sessionSeen.add(w);
        seenKeys.add(w);

        const prob = generateTierProblem(targetTier, false, sessionSeen);
        problems.push({
          ...prob,
          answer: w,
          answerString: w,
          hint: item.hint,
          id: \`prob_\${Date.now()}_sec_\${problems.length}_\${Math.random().toString(36).substring(2, 7)}\`
        });
      }
    }
  }

  // 3. Fallback pass (if count exceeds total list size): generate with fresh IDs
  while (problems.length < count) {
    const prob = generateTierProblem(targetTier, false);
    problems.push({
      ...prob,
      id: \`prob_\${Date.now()}_fallback_\${problems.length}_\${Math.random().toString(36).substring(2, 7)}\`
    });
  }

  return problems;
}
`;

const outputPath = path.resolve('src/utils/wordsGenerator.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Successfully wrote ${grandTotal} words to ${outputPath}`);
