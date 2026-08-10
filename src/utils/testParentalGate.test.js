import { dynamicChallengeGenerator } from './dynamicChallengeGenerator.js';
import { nativeAuthService } from '../services/nativeAuthService.js';

console.log('=== TESTING PARENTAL GATE REFACTORING ===');

// 1. Test Math Challenge Generation
const mathChallenge = dynamicChallengeGenerator.generateMathChallenge();
console.log('Math Challenge Generated:', mathChallenge.question);
console.log('Options:', mathChallenge.options, 'Correct Answer:', mathChallenge.correctAnswer);

if (!mathChallenge.options.includes(mathChallenge.correctAnswer)) {
  console.error('❌ FAIL: Options do not include correct answer!');
  process.exit(1);
}
if (mathChallenge.options.length !== 4) {
  console.error('❌ FAIL: Options array length must be 4!');
  process.exit(1);
}
console.log('✅ PASSED: Math Challenge generation and option shuffling verified!');

// 2. Test Order Challenge Generation
const orderChallenge = dynamicChallengeGenerator.generateOrderChallenge();
console.log('\nOrder Challenge Generated:', orderChallenge.question);
console.log('Options:', orderChallenge.options, 'Correct Answer:', orderChallenge.correctAnswer);

if (!orderChallenge.options.includes(orderChallenge.correctAnswer)) {
  console.error('❌ FAIL: Order challenge options do not include correct answer!');
  process.exit(1);
}
console.log('✅ PASSED: Order Challenge generation verified!');

// 3. Test Mock Native Authentication Service
console.log('\nTesting Native Auth Service...');
nativeAuthService.setMockConfig({ enabled: true, available: true, success: true });
const authRes = await nativeAuthService.authenticate();
console.log('Auth Result:', authRes);

if (!authRes.success) {
  console.error('❌ FAIL: Expected mock native auth to succeed!');
  process.exit(1);
}
console.log('✅ PASSED: Mock Native Auth Service verified!');

console.log('\n🎉 ALL PARENTAL GATE REFACTORING TESTS PASSED PERFECTLY!');
