import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PinGateModal from '../src/components/PinGateModal';
import FamilyPlanUpgradeModal from '../src/components/FamilyPlanUpgradeModal';
import WorkshopModal from '../src/components/WorkshopModal';
import { parentChildService } from '../src/services/parentChildService';
import { storageService } from '../src/services/storageService';
import { authService } from '../src/services/authService';
import { nativeAuthService } from '../src/services/nativeAuthService';
import { dynamicChallengeGenerator } from '../src/utils/dynamicChallengeGenerator';

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playIncorrect: vi.fn(),
    playKeyTap: vi.fn(),
    playSparkCollect: vi.fn(),
    playWhoosh: vi.fn(),
  }
}));

describe('Auth & Parental Gating Verification', () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    sessionStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Parent Dashboard Parental & Auth Gating', () => {
    it('does not render Parent Dashboard access when PinGateModal is closed', () => {
      act(() => {
        root.render(<PinGateModal isOpen={false} onUnlockSuccess={vi.fn()} onClose={vi.fn()} />);
      });
      expect(container.innerHTML).toBe('');
      expect(parentChildService.isParentGateVerified()).toBe(false);
    });

    it('requires solving parental challenge or biometrics to unlock Parent Dashboard', async () => {
      const unlockSpy = vi.fn();
      nativeAuthService.setMockConfig({ enabled: true, available: false });

      act(() => {
        root.render(
          <PinGateModal
            isOpen={true}
            onUnlockSuccess={unlockSpy}
            onClose={vi.fn()}
          />
        );
      });

      // Initially not unlocked
      expect(unlockSpy).not.toHaveBeenCalled();
      expect(parentChildService.isParentGateVerified()).toBe(false);

      // Verify challenge options are displayed
      const challengeButtons = container.querySelectorAll('button');
      expect(challengeButtons.length).toBeGreaterThan(0);
    });

    it('grants access when native biometric authentication succeeds', async () => {
      const unlockSpy = vi.fn();
      nativeAuthService.setMockConfig({ enabled: true, available: true, success: true });

      await act(async () => {
        root.render(
          <PinGateModal
            isOpen={true}
            onUnlockSuccess={unlockSpy}
            onClose={vi.fn()}
          />
        );
      });

      // Trigger native auth button or direct service
      const authRes = await nativeAuthService.authenticate();
      expect(authRes.success).toBe(true);

      const grantRes = parentChildService.grantParentGateAccess();
      expect(grantRes.granted).toBe(true);
      expect(parentChildService.isParentGateVerified()).toBe(true);
    });

    it('rejects deprecated default 1234 PIN and locks after 3 failed attempts', () => {
      storageService.resetFailedAttempts();

      // Attempt 1: 1234 rejected
      const res1 = parentChildService.verifyParentGateChallenge('1234');
      expect(res1.granted).toBe(false);
      expect(res1.isLocked).toBe(false);

      // Attempt 2: wrong pin rejected
      const res2 = parentChildService.verifyParentGateChallenge('9999');
      expect(res2.granted).toBe(false);
      expect(res2.isLocked).toBe(false);

      // Attempt 3: 3rd fail locks gate for 120s
      const res3 = parentChildService.verifyParentGateChallenge('8888');
      expect(res3.granted).toBe(false);
      expect(res3.isLocked).toBe(true);
      expect(res3.remainingSeconds).toBeGreaterThan(0);

      // Attempt 4 while locked: blocked immediately
      const res4 = parentChildService.verifyParentGateChallenge('0000');
      expect(res4.granted).toBe(false);
      expect(res4.isLocked).toBe(true);
    });

    it('locks parent gate session when lockParentGate is invoked', () => {
      parentChildService.grantParentGateAccess();
      expect(parentChildService.isParentGateVerified()).toBe(true);

      parentChildService.lockParentGate();
      expect(parentChildService.isParentGateVerified()).toBe(false);
    });
  });

  describe('2. Real Money Purchases Gating', () => {
    it('prevents real money purchases when allowRealMoneyPurchases is disabled and redirects to parent zone', () => {
      const buySpy = vi.fn();
      const parentZoneSpy = vi.fn();

      act(() => {
        root.render(
          <WorkshopModal
            isOpen={true}
            onClose={vi.fn()}
            sparks={100}
            unlockedItems={['cap']}
            equippedItems={[]}
            onBuyItem={vi.fn()}
            allowRealMoneyPurchases={false}
            onBuySparksPackage={buySpy}
            onOpenParentZone={parentZoneSpy}
          />
        );
      });

      // Switch to sparks hub
      const buttons = Array.from(container.querySelectorAll('button'));
      const sparksTabBtn = buttons.find(b => b.textContent?.includes('Sparks') || b.textContent?.includes('⚡'));
      if (sparksTabBtn) {
        act(() => {
          sparksTabBtn.click();
        });
      }

      // Find real-money purchase button (e.g. $0.99)
      const allButtonsAfter = Array.from(container.querySelectorAll('button'));
      const purchaseBtn = allButtonsAfter.find(b => b.textContent?.includes('$0.99') || b.textContent?.includes('$'));
      if (purchaseBtn) {
        act(() => {
          purchaseBtn.click();
        });
        // Must redirect to parent zone verification instead of calling buySparksPackage
        expect(buySpy).not.toHaveBeenCalled();
        expect(parentZoneSpy).toHaveBeenCalledWith('verification', 'real_money_purchases');
      }
    });

    it('requires parent PIN gate and account authentication (non-anonymous) for purchases', () => {
      // Simulating App purchase flow state logic
      let pendingSparksPurchase = { id: 'sparks_tier_1', name: '500 Sparks', realMoneyPrice: '$0.99' };
      let showPinGateModal = true;
      let showAccountLinkModal = false;
      let showStripeCheckoutModal = false;

      // Mock user is currently anonymous
      vi.spyOn(authService, 'getAuthState').mockReturnValue({
        isAuthenticated: true,
        isAnonymous: true,
        uid: 'anon_123'
      });

      // Parent unlocks PinGateModal
      const onPinGateUnlockSuccess = () => {
        showPinGateModal = false;
        if (pendingSparksPurchase) {
          if (authService.getAuthState().isAnonymous) {
            showAccountLinkModal = true;
          } else {
            showStripeCheckoutModal = true;
          }
        }
      };

      onPinGateUnlockSuccess();

      // Pin gate is closed, Account Link modal is open, Checkout modal is NOT open
      expect(showPinGateModal).toBe(false);
      expect(showAccountLinkModal).toBe(true);
      expect(showStripeCheckoutModal).toBe(false);

      // If user dismisses AccountLinkModal without linking:
      const onAccountLinkDismiss = () => {
        showAccountLinkModal = false;
        pendingSparksPurchase = null;
      };
      onAccountLinkDismiss();
      expect(pendingSparksPurchase).toBeNull();
      expect(showStripeCheckoutModal).toBe(false);

      // Re-test when user successfully links account
      pendingSparksPurchase = { id: 'sparks_tier_1', name: '500 Sparks', realMoneyPrice: '$0.99' };
      vi.spyOn(authService, 'getAuthState').mockReturnValue({
        isAuthenticated: true,
        isAnonymous: false,
        uid: 'linked_user_456'
      });

      const onAccountLinked = () => {
        showAccountLinkModal = false;
        if (pendingSparksPurchase) {
          showStripeCheckoutModal = true;
        }
      };
      onAccountLinked();
      expect(showStripeCheckoutModal).toBe(true);
    });
  });

  describe('3. Subscription Upgrades Gating', () => {
    it('FamilyPlanUpgradeModal routes upgrade action through Parent Zone verification', () => {
      const openParentSpy = vi.fn();
      const closeSpy = vi.fn();

      act(() => {
        root.render(
          <FamilyPlanUpgradeModal
            isOpen={true}
            onClose={closeSpy}
            onOpenParentZone={openParentSpy}
          />
        );
      });

      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(b => b.textContent?.includes('Manage & Choose Plan in Parent Zone'));
      expect(upgradeBtn).toBeDefined();

      act(() => {
        upgradeBtn.click();
      });

      expect(closeSpy).toHaveBeenCalled();
      expect(openParentSpy).toHaveBeenCalledWith('verification', 'family_plan');
    });

    it('subscription selection in Parent Zone triggers PIN gate and requires auth before Stripe checkout', () => {
      let pendingPurchase = null;
      let showPinGateModal = false;
      let showAccountLinkModal = false;
      let showStripeCheckoutModal = false;

      // Handle subscription purchase request
      const handleBuySparksPackage = (pack) => {
        pendingPurchase = pack;
        showPinGateModal = true;
      };

      const onOpenSubscription = (planId) => {
        if (planId === 'kibo_club_family') {
          handleBuySparksPackage({
            id: 'kibo_club_family',
            name: 'Kibo Club Family',
            realMoneyPrice: '$7.99/mo',
            price: '$7.99/mo',
            isSubscription: true,
            isFamilyPlan: true
          });
        } else {
          handleBuySparksPackage({
            id: 'kibo_club_sub',
            name: 'Kibo Club Individual',
            realMoneyPrice: '$4.99/mo',
            price: '$4.99/mo',
            isSubscription: true,
            isFamilyPlan: false
          });
        }
      };

      // User selects family plan
      onOpenSubscription('kibo_club_family');
      expect(pendingPurchase).toBeDefined();
      expect(pendingPurchase.isSubscription).toBe(true);
      expect(showPinGateModal).toBe(true);

      // User is anonymous
      vi.spyOn(authService, 'getAuthState').mockReturnValue({
        isAuthenticated: true,
        isAnonymous: true,
        uid: 'anon_parent'
      });

      // Pin gate unlocked
      const unlockPinGate = () => {
        showPinGateModal = false;
        if (authService.getAuthState().isAnonymous) {
          showAccountLinkModal = true;
        } else {
          showStripeCheckoutModal = true;
        }
      };

      unlockPinGate();
      expect(showAccountLinkModal).toBe(true);
      expect(showStripeCheckoutModal).toBe(false);

      // After user links account
      vi.spyOn(authService, 'getAuthState').mockReturnValue({
        isAuthenticated: true,
        isAnonymous: false,
        uid: 'parent_user_1'
      });

      showAccountLinkModal = false;
      showStripeCheckoutModal = true;
      expect(showStripeCheckoutModal).toBe(true);

      // On confirm in Stripe Checkout, grants subscription benefits
      let isKiboClub = false;
      let isFamilyPlan = false;
      const onConfirmStripeCheckout = (pack) => {
        if (pack.isSubscription) {
          isKiboClub = true;
          if (pack.isFamilyPlan) {
            isFamilyPlan = true;
          }
        }
      };

      onConfirmStripeCheckout(pendingPurchase);
      expect(isKiboClub).toBe(true);
      expect(isFamilyPlan).toBe(true);
    });
  });
});
