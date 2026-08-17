import { calculateRevealedLetterCount, generateTierProblem, generateProblems, WORD_LISTS } from './src/utils/wordsGenerator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ Assertion Failed: ${message}`);
  }
}

console.log('--- Testing calculateRevealedLetterCount ---');

// Test 3-letter words
assert(calculateRevealedLetterCount(3, 1) === 1, 'Tier 1 3-letter word reveals 1 letter');
assert(calculateRevealedLetterCount(3, 3) === 1, 'Tier 3 3-letter word reveals 1 letter');

// Test 5-letter words
assert(calculateRevealedLetterCount(5, 1) === 1, 'Tier 1 5-letter word reveals 1 letter');
assert(calculateRevealedLetterCount(5, 3) === 2, 'Tier 3 5-letter word reveals 2 letters');
assert(calculateRevealedLetterCount(5, 5) === 2, 'Tier 5 5-letter word reveals 2 letters');

// Test 8-letter words
assert(calculateRevealedLetterCount(8, 4) === 3, 'Tier 4 8-letter word reveals 3 letters');
assert(calculateRevealedLetterCount(8, 5) === 3, 'Tier 5 8-letter word reveals 3 letters');
assert(calculateRevealedLetterCount(8, 7) === 2, 'Tier 7 8-letter word reveals 2 letters');

// Test 11-13 letter words
assert(calculateRevealedLetterCount(11, 4) === 4, 'Tier 4 11-letter word reveals 4 letters');
assert(calculateRevealedLetterCount(12, 5) === 3, 'Tier 5 12-letter word reveals 3 letters');
assert(calculateRevealedLetterCount(12, 7) === 3, 'Tier 7 12-letter word reveals 3 letters');

// Test 14+ letter words
assert(calculateRevealedLetterCount(14, 4) === 5, 'Tier 4 14-letter word reveals 5 letters');
assert(calculateRevealedLetterCount(14, 6) === 4, 'Tier 6 14-letter word reveals 4 letters');
assert(calculateRevealedLetterCount(14, 7) === 4, 'Tier 7 14-letter word reveals 4 letters');
assert(calculateRevealedLetterCount(16, 8) === 4, 'Tier 8 16-letter word reveals 4 letters');

// Safety: test edge lengths
assert(calculateRevealedLetterCount(2, 1) === 0, '2-letter word reveals 0');
assert(calculateRevealedLetterCount(1, 1) === 0, '1-letter word reveals 0');

console.log('--- Testing Problem Generation & displayString blanks ---');

for (let tier = 1; tier <= 8; tier++) {
  const problems = generateProblems(15, tier);
  assert(problems.length === 15, `Generated 15 problems for tier ${tier}`);
  
  for (const prob of problems) {
    const word = prob.answer;
    const display = prob.displayString;
    const parts = display.split(' ');
    
    assert(parts.length === word.length, `displayString length matches word length for "${word}"`);
    
    const blanks = parts.filter(p => p === '_').length;
    const revealed = parts.filter(p => p !== '_').length;
    
    assert(blanks >= 2 || word.length <= 2, `Word "${word}" has at least 2 blanks (actual blanks: ${blanks}, revealed: ${revealed})`);
    assert(revealed === calculateRevealedLetterCount(word.length, tier), `Revealed count for "${word}" matches formula`);
    
    // Check that revealed letters match the letters in the actual word at their indices
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== '_') {
        assert(parts[i] === word[i], `Revealed char at index ${i} matches '${word[i]}' in '${word}'`);
      }
    }
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
