import { describe, it, expect } from 'vitest';
import { antiCheatService } from '../../src/services/antiCheatService.js';

describe('antiCheatService', () => {
  describe('validateSessionPayload', () => {
    it('returns valid for a normal payload', () => {
      const payload = {
        totalTimeSec: 60,
        totalQuestions: 10,
        correctCount: 8,
        sparksEarned: 16,
        ratingGain: 30
      };
      const result = antiCheatService.validateSessionPayload(payload);
      expect(result.valid).toBe(true);
      expect(result.reason).toBe(null);
    });

    it('fails if payload is not an object', () => {
      expect(antiCheatService.validateSessionPayload(null).valid).toBe(false);
      expect(antiCheatService.validateSessionPayload('string').valid).toBe(false);
    });

    it('fails on invalid bounds', () => {
      // 0 questions
      let res = antiCheatService.validateSessionPayload({ totalQuestions: 0, correctCount: 0 });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Invalid question count');

      // Negative correct count
      res = antiCheatService.validateSessionPayload({ totalQuestions: 10, correctCount: -1 });
      expect(res.valid).toBe(false);

      // More correct than total
      res = antiCheatService.validateSessionPayload({ totalQuestions: 10, correctCount: 11 });
      expect(res.valid).toBe(false);
    });

    it('fails on implausible speed (botting)', () => {
      // 1 second for 10 questions = 0.1s/q
      const res = antiCheatService.validateSessionPayload({
        totalTimeSec: 1,
        totalQuestions: 10,
        correctCount: 10
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Implausible solving speed');
    });

    it('fails if sparks exceed max allowed', () => {
      // max allowed is questions * 35 = 10 * 35 = 350
      const res = antiCheatService.validateSessionPayload({
        totalTimeSec: 60,
        totalQuestions: 10,
        correctCount: 10,
        sparksEarned: 351 // 1 over max
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('exceeds maximum allowable threshold');
    });

    it('fails if rating gain exceeds limit', () => {
      // max rating delta is +60 or -60
      const res = antiCheatService.validateSessionPayload({
        totalTimeSec: 60,
        totalQuestions: 10,
        correctCount: 10,
        sparksEarned: 20,
        ratingGain: 61
      });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('exceeds max single-run rating delta limit');

      const resNeg = antiCheatService.validateSessionPayload({
        totalTimeSec: 60,
        totalQuestions: 10,
        correctCount: 10,
        sparksEarned: 20,
        ratingGain: -61
      });
      expect(resNeg.valid).toBe(false);
    });
  });

  describe('validateSparksTransaction', () => {
    it('returns valid if balance is sufficient', () => {
      const res = antiCheatService.validateSparksTransaction(100, 50);
      expect(res.valid).toBe(true);
    });

    it('fails if requested deduction is zero or negative', () => {
      expect(antiCheatService.validateSparksTransaction(100, 0).valid).toBe(false);
      expect(antiCheatService.validateSparksTransaction(100, -10).valid).toBe(false);
    });

    it('fails if balance is insufficient', () => {
      const res = antiCheatService.validateSparksTransaction(50, 100);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('Insufficient Sparks balance for transaction');
    });

    it('handles string inputs', () => {
      const res = antiCheatService.validateSparksTransaction('100', '50');
      expect(res.valid).toBe(true);
    });
  });
});
