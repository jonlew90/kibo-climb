import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../../src/services/storageService';

describe('Kibo Club Solo 7-Day Trial & Dev Simulator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('grants 7-day solo trial on initial reward claim', () => {
    const result = storageService.grantAccountLinkTrialReward();
    expect(result.granted).toBe(true);
    expect(result.daysRemaining).toBe(7);

    // Verify trial status
    const status = storageService.getTrialStatus();
    expect(status.isTrial).toBe(true);
    expect(status.dayNumber).toBe(1);
    expect(status.daysRemaining).toBe(7);
    expect(status.isExpired).toBe(false);

    // Verify plan details
    const plan = storageService.getSubscriptionPlan();
    expect(plan.id).toBe('kibo_club_sub');
    expect(plan.tier).toBe('single');
    expect(plan.isTrial).toBe(true);
    expect(storageService.hasClubMembership()).toBe(true);
    expect(storageService.hasFamilyPlan()).toBe(false);
    expect(storageService.hasSinglePlan()).toBe(true);

    // Second claim should be rejected
    const secondClaim = storageService.grantAccountLinkTrialReward();
    expect(secondClaim.granted).toBe(false);
  });

  it('sets profile to Day 1, Day 3, Day 7, and Day 8 (expired) via Dev Simulator', () => {
    // Set Day 1
    storageService.setTrialDay(1);
    let status = storageService.getTrialStatus();
    expect(status.isTrial).toBe(true);
    expect(status.dayNumber).toBe(1);
    expect(status.daysRemaining).toBe(7);
    expect(storageService.hasClubMembership()).toBe(true);

    // Set Day 3
    storageService.setTrialDay(3);
    status = storageService.getTrialStatus();
    expect(status.isTrial).toBe(true);
    expect(status.dayNumber).toBe(3);
    expect(status.daysRemaining).toBe(5);
    expect(storageService.hasClubMembership()).toBe(true);

    // Set Day 7
    storageService.setTrialDay(7);
    status = storageService.getTrialStatus();
    expect(status.isTrial).toBe(true);
    expect(status.dayNumber).toBe(7);
    expect(status.daysRemaining).toBe(1);
    expect(storageService.hasClubMembership()).toBe(true);

    // Set Day 8 (Expired)
    storageService.setTrialDay(8);
    status = storageService.getTrialStatus();
    expect(status.isTrial).toBe(false);
    expect(storageService.hasClubMembership()).toBe(false);
    expect(storageService.getSubscriptionPlan()).toBe(null);
  });

  it('prevents abuse if device has already claimed trial even when local state resets', () => {
    // Grant trial
    const firstAttempt = storageService.grantAccountLinkTrialReward();
    expect(firstAttempt.granted).toBe(true);
    expect(storageService.getTrialStatus().isTrial).toBe(true);

    // Simulate wipe of normal kibo profiles data (like unlinking without full reset)
    localStorage.removeItem('kibo_has_received_club_trial');
    localStorage.removeItem('kibo_profiles_data');

    // kibo_device_trial_claimed is still present on device
    expect(localStorage.getItem('kibo_device_trial_claimed')).toBe('true');

    // Attempting to claim again on the same device should fail
    const secondAttempt = storageService.grantAccountLinkTrialReward();
    expect(secondAttempt.granted).toBe(false);
    expect(secondAttempt.reason).toBe('Trial already claimed');
  });

  it('handles 60-day win-back trial cooldown and active engagement requirement', () => {
    // 1. Initially expired trial (just expired today)
    storageService.setTrialDay(8);
    expect(storageService.getSubscriptionPlan()).toBe(null);

    // 2. Cannot claim immediately (in 60-day cooldown)
    expect(storageService.canClaimWinBackTrial()).toBe(false);

    // 3. Set cooldown to 65 days ago, but streak is 0 -> still cannot claim
    storageService.setWinBackTrialCooldownDays(65);
    storageService.saveUserData({ streak: 2 }, 'math');
    expect(storageService.canClaimWinBackTrial()).toBe(false);

    // 4. Set streak to 7 (active engaged learner) + 65 days since last trial -> eligible!
    storageService.saveUserData({ streak: 7 }, 'math');
    expect(storageService.canClaimWinBackTrial()).toBe(true);

    // 5. Grant win-back trial
    const winBackResult = storageService.grantWinBackTrialReward();
    expect(winBackResult.granted).toBe(true);
    expect(winBackResult.daysRemaining).toBe(7);

    // Verify membership is active under solo trial
    expect(storageService.hasClubMembership()).toBe(true);
    const plan = storageService.getSubscriptionPlan();
    expect(plan.id).toBe('kibo_club_sub');
    expect(plan.isTrial).toBe(true);

    // Cannot claim another while trial is active
    expect(storageService.canClaimWinBackTrial()).toBe(false);
  });
});
