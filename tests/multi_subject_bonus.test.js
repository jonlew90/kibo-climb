import { describe, it, expect, beforeEach } from 'vitest';
import { questService } from '../src/services/questService.js';
import { evaluateBadges } from '../src/utils/badgeManager.js';
import { storageService } from '../src/services/storageService.js';

describe('Multi-Subject Daily Bonus & Top-Level Ascent Integration', () => {
  const profileId = 'test_multi_subject_integration';

  beforeEach(() => {
    localStorage.clear();
  });

  it('progresses from single subject to multi-subject bonus seamlessly', () => {
    // 1. Initial State: 0 XP, level 1, no subjects completed today
    const state0 = questService.getQuests(profileId);
    expect(state0.totalXp).toBe(0);
    expect(state0.levelInfo.level).toBe(1);
    expect(questService.getDailySubjectsCompleted(profileId)).toEqual([]);
    expect(questService.isDailyMultiSubjectBonusClaimed(profileId)).toBe(false);

    // 2. Solve 5 problems in Math -> accumulates base Altitude XP directly (+10m each = +50m)
    for (let i = 0; i < 5; i++) {
      questService.recordProgress(profileId, {
        subject: 'math',
        isCorrect: true,
        streak: i + 1
      });
    }

    const stateAfterMath = questService.getQuests(profileId);
    expect(stateAfterMath.totalXp).toBe(50);

    // 3. Finish a 12-problem climb in Math
    const resMath = questService.recordDailySubjectClimb(profileId, 'math');
    expect(resMath.awarded).toBe(false);
    expect(resMath.completedSubjects).toEqual(['math']);
    expect(questService.isDailyMultiSubjectBonusClaimed(profileId)).toBe(false);

    // 4. Switch to Words and complete a climb
    const resWords = questService.recordDailySubjectClimb(profileId, 'words');
    expect(resWords.awarded).toBe(true);
    expect(resWords.claimed).toBe(true);
    expect(resWords.bonus.sparks).toBe(75);
    expect(resWords.bonus.altitude).toBe(100);
    expect(resWords.completedSubjects).toContain('math');
    expect(resWords.completedSubjects).toContain('words');
    expect(questService.isDailyMultiSubjectBonusClaimed(profileId)).toBe(true);

    // 5. Total XP is now 50 (from questions) + 100 (from multi-subject bonus) = 150m (Crosses to Level 2!)
    const stateAfterBonus = questService.getQuests(profileId);
    expect(stateAfterBonus.totalXp).toBe(150);
    expect(stateAfterBonus.levelInfo.level).toBe(2);

    // 6. Badges evaluate and unlock daily_multi_subject_first
    const badgeRes = evaluateBadges({
      multiSubjectBonusClaimsCount: stateAfterBonus.multiSubjectBonusClaimsCount,
      questElevation: stateAfterBonus.totalXp,
      unlockedBadges: []
    });
    expect(badgeRes.updatedUnlocked).toContain('daily_multi_subject_first');
  });
});
