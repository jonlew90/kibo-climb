import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storageService } from '../src/services/storageService';

describe('Per-Profile Streak Validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('isolates streak data and shields across multiple profiles', () => {
    // Setup Profile 1: active climber with streak
    const p1 = storageService.createProfile('Climber 1', 'Grade 1–2');
    vi.advanceTimersByTime(100);
    storageService.setActiveProfileId(p1.id);
    storageService.saveUserData({
      streak: 5,
      streakShields: 2,
      lastSprintDate: '2026-08-20'
    }, 'math');

    // Setup Profile 2: brand new climber
    const p2 = storageService.createProfile('Climber 2', 'Grade 1–2');
    vi.advanceTimersByTime(100);
    storageService.setActiveProfileId(p2.id);
    storageService.saveUserData({
      streak: 1,
      streakShields: 1,
      lastSprintDate: '2026-08-25'
    }, 'math');

    // Validate that reading data for p1 and p2 are isolated
    storageService.setActiveProfileId(p1.id);
    const p1Data = storageService.getUserData('math');
    expect(p1Data.streak).toBe(5);
    expect(p1Data.streakShields).toBe(2);
    expect(p1Data.lastSprintDate).toBe('2026-08-20');

    storageService.setActiveProfileId(p2.id);
    const p2Data = storageService.getUserData('math');
    expect(p2Data.streak).toBe(1);
    expect(p2Data.streakShields).toBe(1);
    expect(p2Data.lastSprintDate).toBe('2026-08-25');
  });

  it('does not consume shields or alter streaks across profiles until selected', () => {
    // Profile 1 missed active days
    const p1 = storageService.createProfile('Alex', 'Grade 1–2');
    vi.advanceTimersByTime(100);
    storageService.setActiveProfileId(p1.id);
    storageService.saveUserData({
      streak: 10,
      streakShields: 1,
      lastSprintDate: '2026-08-10',
      consumables: { streakSaverCount: 1 }
    }, 'math');

    // Profile 2 is up-to-date
    const p2 = storageService.createProfile('Sam', 'Grade 1–2');
    vi.advanceTimersByTime(100);
    storageService.setActiveProfileId(p2.id);
    storageService.saveUserData({
      streak: 3,
      streakShields: 1,
      lastSprintDate: '2026-08-24'
    }, 'math');

    // Switch active profile to Sam (p2)
    storageService.setActiveProfileId(p2.id);
    const samData = storageService.getUserData('math');
    expect(samData.streak).toBe(3);
    expect(samData.streakShields).toBe(1);

    // Verify Alex (p1) untouched
    storageService.setActiveProfileId(p1.id);
    const alexData = storageService.getUserData('math');
    expect(alexData.streak).toBe(10);
    expect(alexData.streakShields).toBe(1);
    expect(alexData.consumables.streakSaverCount).toBe(1);
  });
});
