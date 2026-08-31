import { describe, it, expect, beforeEach } from 'vitest';
import { parentChildService } from '../src/services/parentChildService.js';
import { validateSafeChildUsername, generateSafeUsername } from '../src/utils/safeNames.js';

describe('COPPA Compliance & Operational Requirements', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Verifiable Parental Consent (VPC)', () => {
    it('initializes with unconsented status by default', () => {
      const status = parentChildService.getCOPPAConsentStatus();
      expect(status.consented).toBe(false);
      expect(status.consentedAt).toBeNull();
    });

    it('records verifiable parental consent with knowledge challenge verification', () => {
      const consent = parentChildService.recordParentalConsent('knowledge_challenge', {
        verifiedAt: new Date().toISOString()
      });

      expect(consent.consented).toBe(true);
      expect(consent.method).toBe('knowledge_challenge');
      expect(consent.consentedAt).toBeTruthy();

      const status = parentChildService.getCOPPAConsentStatus();
      expect(status.consented).toBe(true);
      expect(status.method).toBe('knowledge_challenge');
    });

    it('records verifiable parental consent with parent_pin verification', () => {
      const consent = parentChildService.recordParentalConsent('parent_pin', {
        verifiedAt: new Date().toISOString()
      });

      expect(consent.consented).toBe(true);
      expect(consent.method).toBe('parent_pin');

      const status = parentChildService.getCOPPAConsentStatus();
      expect(status.consented).toBe(true);
    });

    it('revokes parental consent and records revocation timestamp', async () => {
      // First grant consent
      parentChildService.recordParentalConsent('knowledge_challenge');
      expect(parentChildService.getCOPPAConsentStatus().consented).toBe(true);

      // Now revoke consent
      const revoked = await parentChildService.revokeParentalConsent();
      expect(revoked.consented).toBe(false);
      expect(revoked.revokedAt).toBeTruthy();

      const status = parentChildService.getCOPPAConsentStatus();
      expect(status.consented).toBe(false);
      expect(status.revokedAt).toBeTruthy();
    });
  });

  describe('Data Minimization & Safe Child Usernames', () => {
    it('accepts valid safe kid nicknames', () => {
      expect(validateSafeChildUsername('CosmicOtter42')).toBeNull();
      expect(validateSafeChildUsername('BraveFalcon99')).toBeNull();
      expect(validateSafeChildUsername('Sparky_123')).toBeNull();
    });

    it('rejects email addresses to prevent child PII exposure', () => {
      const error1 = validateSafeChildUsername('kid@example.com');
      expect(error1).toMatch(/COPPA notice/);

      const error2 = validateSafeChildUsername('johnny@gmail.com');
      expect(error2).toMatch(/COPPA notice/);
    });

    it('rejects domain suffixes to prevent external contact disclosure', () => {
      const error = validateSafeChildUsername('mywebsite.com');
      expect(error).toMatch(/COPPA notice/);
    });

    it('rejects phone numbers (7+ digits) to protect child privacy', () => {
      const error = validateSafeChildUsername('call5551234567');
      expect(error).toMatch(/phone numbers/);
    });

    it('rejects obvious real first and last names', () => {
      expect(validateSafeChildUsername('JohnSmith')).toMatch(/real first and last name/);
      expect(validateSafeChildUsername('John_Smith')).toMatch(/real first and last name/);
      expect(validateSafeChildUsername('EmilyDavis')).toMatch(/real first and last name/);
      expect(validateSafeChildUsername('MichaelBrown')).toMatch(/real first and last name/);
    });

    it('rejects empty, too short, or too long usernames', () => {
      expect(validateSafeChildUsername('')).toBeTruthy();
      expect(validateSafeChildUsername('ab')).toBeTruthy();
      expect(validateSafeChildUsername('A'.repeat(21))).toBeTruthy();
    });

    it('generated safe usernames always pass COPPA validation', () => {
      for (let i = 0; i < 50; i++) {
        const safeName = generateSafeUsername();
        expect(validateSafeChildUsername(safeName)).toBeNull();
      }
    });
  });

  describe('Parental Access & Data Minimization', () => {
    it('creates child profile containing only minimal learning telemetry', () => {
      const child = parentChildService.createChildProfile('SuperOtter', 'kibo_default');
      expect(child.display_name).toBe('SuperOtter');
      expect(child.stats_json.totalProblemsSolved).toBe(0);
      // Ensure no sensitive fields (real name, location, address, email) are on child profile
      expect(child.email).toBeUndefined();
      expect(child.address).toBeUndefined();
      expect(child.location).toBeUndefined();
      expect(child.real_name).toBeUndefined();
    });
  });
});
