import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService.js';
import { leaderboardService } from '../src/services/leaderboardService.js';

describe('COPPA Climber Friend Code & Exact Search', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate a valid Climber Friend Code for active profile', () => {
    const code = storageService.getFriendCode();
    expect(code).toMatch(/^KIBO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it('should maintain the same Climber Friend Code across multiple calls', () => {
    const code1 = storageService.getFriendCode();
    const code2 = storageService.getFriendCode();
    expect(code1).toBe(code2);
  });

  it('should generate distinct Climber Friend Codes for different child profiles', () => {
    const prof1 = storageService.createProfile('KidOne', 'Grade 1–2');
    const code1 = storageService.getFriendCode(prof1.id);

    const prof2 = storageService.createProfile('KidTwo', 'Grade 3–4');
    const code2 = storageService.getFriendCode(prof2.id);

    expect(code1).not.toBe(code2);
    expect(code1).toMatch(/^KIBO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(code2).toMatch(/^KIBO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it('should perform exact match search by Climber Code on local profiles', async () => {
    const prof = storageService.createProfile('TargetClimber', 'Grade 1–2');
    const targetCode = storageService.getFriendCode(prof.id);

    // Exact search by code
    const resExact = await leaderboardService.searchUsername(targetCode);
    expect(resExact.results.length).toBe(1);
    expect(resExact.results[0].profileId).toBe(prof.id);

    // Partial/prefix search should return no matches (COPPA compliant)
    const resPartial = await leaderboardService.searchUsername(targetCode.slice(0, 5));
    expect(resPartial.results.length).toBe(0);
  });

  it('should reject search by username string to protect child privacy under COPPA', async () => {
    storageService.createProfile('UniqueHero99', 'Grade 1–2');

    // Searching by username should return no results as friend codes are required
    const resUsername = await leaderboardService.searchUsername('UniqueHero99');
    expect(resUsername.results.length).toBe(0);
  });
});
