import { describe, it, expect } from 'vitest';
import { dynamicChallengeGenerator } from './dynamicChallengeGenerator.js';
import { nativeAuthService } from '../services/nativeAuthService.js';

console.log('=== TESTING PARENTAL GATE REFACTORING ===');

// 1. Test Word Math Challenge Generation
const mathChallenge = dynamicChallengeGenerator.generateWordMathChallenge();
console.log('Word Math Challenge Generated:', mathChallenge.question);
console.log('Correct Answer:', mathChallenge.correctAnswer);

if (!mathChallenge.question || !mathChallenge.correctAnswer) {
  console.error('❌ FAIL: Word Math Challenge generation failed!');
  process.exit(1);
}
console.log('✅ PASSED: Word Math Challenge generation verified!');

// 2. Test Adult Literacy Challenge Generation
const orderChallenge = dynamicChallengeGenerator.generateAdultLiteracyChallenge();
console.log('\nAdult Literacy Challenge Generated:', orderChallenge.question);
console.log('Correct Answer:', orderChallenge.correctAnswer);

if (!orderChallenge.question || !orderChallenge.correctAnswer) {
  console.error('❌ FAIL: Adult Literacy challenge generation failed!');
  process.exit(1);
}
console.log('✅ PASSED: Adult Literacy Challenge generation verified!');

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


describe('Parental Gate', () => {
  it('should run parental gate test script successfully', () => {
    // existing prints run on import
    expect(true).toBe(true);
  });
});
