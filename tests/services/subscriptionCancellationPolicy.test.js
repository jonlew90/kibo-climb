import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../../src/services/storageService.js';
import { shopLedgerService } from '../../src/services/shopLedgerService.js';

describe('Subscription Cancel-At-Period-End Policy & Abuse Flagging', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.setSimulatedDate(null);
  });

  it('keeps membership benefits active until currentPeriodEnd when cancelled', () => {
    // 1. Subscribe user to monthly individual plan
    storageService.updateSubscriptionState('kibo_club_sub', 'default_child', true);
    expect(storageService.hasClubMembership()).toBe(true);

    const initialPlan = storageService.getSubscriptionPlan();
    expect(initialPlan.id).toBe('kibo_club_sub');
    expect(initialPlan.cancelAtPeriodEnd).toBe(false);

    // 2. User cancels subscription
    const cancelResult = storageService.cancelSubscription(true);
    expect(cancelResult.success).toBe(true);
    expect(cancelResult.cancelAtPeriodEnd).toBe(true);

    // 3. User REMAINS a club member during the paid period (cancel at period end enforced)
    expect(storageService.hasClubMembership()).toBe(true);
    const postCancelPlan = storageService.getSubscriptionPlan();
    expect(postCancelPlan.cancelAtPeriodEnd).toBe(true);
    expect(postCancelPlan.currentPeriodEnd).toBeDefined();

    // 4. Advance time 31 days into future (past currentPeriodEnd)
    const futureDate = new Date(postCancelPlan.currentPeriodEnd);
    futureDate.setHours(futureDate.getHours() + 1);
    storageService.setSimulatedDate(futureDate);

    // 5. Membership has now expired cleanly
    expect(storageService.hasClubMembership()).toBe(false);
    expect(storageService.getSubscriptionPlan()).toBe(null);
  });

  it('allows resuming an active subscription scheduled to cancel', () => {
    storageService.updateSubscriptionState('kibo_club_family', 'default_child', true);
    storageService.cancelSubscription(true);

    let plan = storageService.getSubscriptionPlan();
    expect(plan.cancelAtPeriodEnd).toBe(true);

    // Resume membership
    const resumeRes = storageService.reactivateSubscription();
    expect(resumeRes.success).toBe(true);

    plan = storageService.getSubscriptionPlan();
    expect(plan.cancelAtPeriodEnd).toBe(false);
    expect(storageService.hasClubMembership()).toBe(true);
  });

  it('flags the account for rapid cancellation abuse after item/currency purchases', () => {
    // 1. Subscribe
    storageService.updateSubscriptionState('kibo_club_sub', 'default_child', true);

    // 2. User bought discounted items / real money packs while member
    storageService.saveUserData({ hasBoughtGemsWithRealMoney: true });
    shopLedgerService.recordTransactionLedger({
      type: 'SHOP_PURCHASE',
      itemId: 'vip_exclusive_hat',
      sparksCost: 100
    });

    // 3. Cancel within 48 hours
    const cancelRes = storageService.cancelSubscription(true);
    expect(cancelRes.success).toBe(true);
    expect(cancelRes.flagged).toBe(true);
    expect(cancelRes.flagReason).toContain('Potential discount arbitrage attempt');

    // 4. Verify account risk flags
    const flags = storageService.getAccountRiskFlags();
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].flagType).toBe('RAPID_CANCEL_AFTER_DISCOUNT_PURCHASE');
    expect(flags[0].severity).toBe('HIGH');

    // 5. Ledger record contains both cancel and risk flag
    const ledger = shopLedgerService.getTransactionLedger();
    const riskEntry = ledger.find(e => e.type === 'ACCOUNT_RISK_FLAGGED');
    const cancelEntry = ledger.find(e => e.type === 'SUBSCRIPTION_CANCEL_SCHEDULED');
    expect(riskEntry).toBeDefined();
    expect(cancelEntry).toBeDefined();
    expect(cancelEntry.isFlaggedAbuse).toBe(true);
  });
});
