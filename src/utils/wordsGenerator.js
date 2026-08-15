import { isNearTierThreshold } from './wordsCurriculum';

const WORD_LISTS = {
  1: [
    { word: 'cat', hint: 'A small pet that goes meow.' },
    { word: 'dog', hint: 'A pet that barks.' },
    { word: 'sun', hint: 'It shines in the sky during the day.' },
    { word: 'bat', hint: 'A flying animal or something you use to hit a ball.' },
    { word: 'red', hint: 'The color of an apple or a stop sign.' },
    { word: 'run', hint: 'To move fast on your legs.' },
    { word: 'hat', hint: 'You wear it on your head.' },
    { word: 'box', hint: 'A container made of cardboard.' }
  ],
  2: [
    { word: 'bird', hint: 'An animal with feathers that can fly.' },
    { word: 'tree', hint: 'A tall plant with a wooden trunk and leaves.' },
    { word: 'moon', hint: 'You see it in the night sky.' },
    { word: 'blue', hint: 'The color of the sky.' },
    { word: 'play', hint: 'What you do for fun.' },
    { word: 'jump', hint: 'To push yourself into the air.' },
    { word: 'book', hint: 'You read pages in this.' },
    { word: 'fish', hint: 'An animal that swims in water.' }
  ],
  3: [
    { word: 'apple', hint: 'A round, red or green fruit.' },
    { word: 'house', hint: 'A building where people live.' },
    { word: 'train', hint: 'A vehicle that runs on tracks.' },
    { word: 'water', hint: 'A clear liquid you drink.' },
    { word: 'smile', hint: 'The expression on your face when you are happy.' },
    { word: 'clock', hint: 'It tells you the time.' },
    { word: 'plant', hint: 'Something that grows in dirt, like a flower.' },
    { word: 'chair', hint: 'You sit on it.' }
  ],
  4: [
    { word: 'sunflower', hint: 'A tall plant with a large yellow flower.' },
    { word: 'butterfly', hint: 'An insect with colorful wings.' },
    { word: 'rainbow', hint: 'Colors in the sky after it rains.' },
    { word: 'backpack', hint: 'You carry your school books in this.' },
    { word: 'basketball', hint: 'A round orange ball used in a game.' },
    { word: 'strawberry', hint: 'A small, red, sweet fruit.' },
    { word: 'skateboard', hint: 'A board with wheels you ride on.' },
    { word: 'watermelon', hint: 'A large green fruit that is pink inside.' }
  ],
  5: [
    { word: 'unhappy', hint: 'Not happy; sad.' },
    { word: 'rewrite', hint: 'To write something again.' },
    { word: 'careful', hint: 'Taking care; avoiding danger.' },
    { word: 'kindness', hint: 'The quality of being friendly and considerate.' },
    { word: 'preheat', hint: 'To heat an oven before using it.' },
    { word: 'fearless', hint: 'Lacking fear; brave.' },
    { word: 'colorful', hint: 'Full of color.' },
    { word: 'disagree', hint: 'To have a different opinion.' }
  ],
  6: [
    { word: 'adventure', hint: 'An exciting and unusual experience.' },
    { word: 'curious', hint: 'Eager to know or learn something.' },
    { word: 'brilliant', hint: 'Exceptionally clever or talented.' },
    { word: 'discover', hint: 'To find something unexpectedly.' },
    { word: 'enormous', hint: 'Very large in size.' },
    { word: 'fascinating', hint: 'Extremely interesting.' },
    { word: 'generous', hint: 'Showing a readiness to give more of something.' },
    { word: 'hilarious', hint: 'Extremely amusing or funny.' }
  ],
  7: [
    { word: 'imagination', hint: 'The ability of the mind to be creative or resourceful.' },
    { word: 'environment', hint: 'The surroundings or conditions in which a person, animal, or plant lives.' },
    { word: 'courageous', hint: 'Not deterred by danger or pain; brave.' },
    { word: 'magnificent', hint: 'Impressively beautiful, elaborate, or extravagant.' },
    { word: 'mysterious', hint: 'Difficult or impossible to understand, explain, or identify.' },
    { word: 'independent', hint: 'Free from outside control; not depending on another\'s authority.' },
    { word: 'extraordinary', hint: 'Very unusual or remarkable.' },
    { word: 'enthusiastic', hint: 'Showing intense and eager enjoyment, interest, or approval.' }
  ],
  8: [
    { word: 'phenomenon', hint: 'A fact or situation that is observed to exist or happen.' },
    { word: 'meticulous', hint: 'Showing great attention to detail; very careful and precise.' },
    { word: 'resilient', hint: 'Able to withstand or recover quickly from difficult conditions.' },
    { word: 'innovative', hint: 'Featuring new methods; advanced and original.' },
    { word: 'perspective', hint: 'A particular attitude toward or way of regarding something; a point of view.' },
    { word: 'authentic', hint: 'Of undisputed origin; genuine.' },
    { word: 'ambiguous', hint: 'Open to more than one interpretation; having a double meaning.' },
    { word: 'eloquent', hint: 'Fluent or persuasive in speaking or writing.' }
  ]
};

export function generateTierProblem(targetTier, isNearThreshold = false) {
  let effectiveTier = targetTier;
  // If not near threshold, blend in lower tier words occasionally for review
  if (!isNearThreshold && targetTier > 1 && Math.random() < 0.40) {
    effectiveTier = Math.floor(Math.random() * (targetTier - 1)) + 1;
  }

  const list = WORD_LISTS[effectiveTier] || WORD_LISTS[1];
  const item = list[Math.floor(Math.random() * list.length)];

  const answer = item.word.toLowerCase();

  // Decide how many letters to reveal based on tier difficulty
  let revealedIndices = [];
  if (effectiveTier <= 2) {
    // Reveal 1 letter for easy words
    revealedIndices.push(Math.floor(Math.random() * answer.length));
  } else if (effectiveTier >= 3 && effectiveTier <= 5) {
      // Reveal 2 letters for medium words, ensuring they are different
      let idx1 = Math.floor(Math.random() * answer.length);
      let idx2 = Math.floor(Math.random() * answer.length);
      while(idx1 === idx2 && answer.length > 1) {
          idx2 = Math.floor(Math.random() * answer.length);
      }
      revealedIndices.push(idx1, idx2);
  } else {
     // No letters revealed for advanced tiers (only blanks)
  }

  let displayString = answer.split('').map((char, index) => {
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

export function generateProblems(count, targetTier, history = [], seenKeys = new Set()) {
  const problems = [];
  let attempts = 0;

  while (problems.length < count && attempts < count * 3) {
    attempts++;
    const problem = generateTierProblem(targetTier);
    const key = problem.answer; // Use the word itself as the unique key for deduplication

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      problems.push({
        ...problem,
        id: `prob_${Date.now()}_${attempts}`
      });
    }
  }

  // Fallback if we couldn't generate enough unique problems
  while (problems.length < count) {
    const problem = generateTierProblem(targetTier);
    problems.push({
      ...problem,
      id: `prob_${Date.now()}_fallback_${problems.length}`
    });
  }

  return problems;
}
