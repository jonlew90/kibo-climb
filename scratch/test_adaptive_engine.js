import { evaluateAdaptiveAttempt } from '../src/utils/AdaptiveEngine.js';

console.log('--- Testing AdaptiveEngine Logic ---');

// Test 1: Fast correct answer (2s response time)
const fastAttempt = evaluateAdaptiveAttempt({
  isCorrect: true,
  latencyMs: 2000,
  currentCompetenceRank: 1000
});
console.log('Fast Attempt (2s):', fastAttempt);
if (fastAttempt.rankDelta === 10 && fastAttempt.isFluent === true) {
  console.log('✅ PASS: Fast attempt gained +10 rank and marked as fluent (<3s)');
} else {
  console.error('❌ FAIL: Fast attempt check failed');
}

// Test 2: Slow correct answer (20s response time)
const slowAttempt = evaluateAdaptiveAttempt({
  isCorrect: true,
  latencyMs: 20000,
  currentCompetenceRank: 1000
});
console.log('Slow Attempt (20s):', slowAttempt);
if (slowAttempt.rankDelta === 10 && slowAttempt.nextCompetenceRank === 1010) {
  console.log('✅ PASS: Slow attempt (20s) still gained full +10 difficulty rank!');
} else {
  console.error('❌ FAIL: Slow attempt did not advance difficulty rank');
}

// Test 3: Rapid button mashing outlier (<0.8s) incorrect attempt
const outlierAttempt = evaluateAdaptiveAttempt({
  isCorrect: false,
  latencyMs: 400,
  currentCompetenceRank: 1000
});
console.log('Outlier Attempt (0.4s):', outlierAttempt);
if (outlierAttempt.isOutlierGuess === true && outlierAttempt.rankDelta === 0) {
  console.log('✅ PASS: Rapid button mashing outlier (<0.8s) ignored from rank regression!');
} else {
  console.error('❌ FAIL: Outlier attempt handling failed');
}
