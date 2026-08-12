import { describe, it, expect } from 'vitest';
import { dynamicChallengeGenerator } from './dynamicChallengeGenerator.js';
import { nativeAuthService } from '../services/nativeAuthService.js';

describe('Parental Gate & Dynamic Challenges', () => {
  it('generateMathChallenge creates valid questions and options', () => {
    const mathChallenge = dynamicChallengeGenerator.generateMathChallenge();
    expect(mathChallenge.options).toContain(mathChallenge.correctAnswer);
    expect(mathChallenge.options.length).toBe(4);
  });

  it('generateOrderChallenge creates valid sorting challenges', () => {
    const orderChallenge = dynamicChallengeGenerator.generateOrderChallenge();
    expect(orderChallenge.options).toContain(orderChallenge.correctAnswer);
    expect(orderChallenge.options.length).toBe(4);
  });

  it('nativeAuthService respects mock configurations', async () => {
    nativeAuthService.setMockConfig({ enabled: true, available: true, success: true });
    const authRes = await nativeAuthService.authenticate();
    expect(authRes.success).toBe(true);

    nativeAuthService.setMockConfig({ enabled: true, available: true, success: false });
    const failRes = await nativeAuthService.authenticate();
    expect(failRes.success).toBe(false);
  });
});
