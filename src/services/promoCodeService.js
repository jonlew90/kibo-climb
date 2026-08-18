// Promo Code Redemption & Validation Service for Kibo Climb
// Handles authoritative code redemption, expiration checking, duplicate prevention, and item/spark grants.

import { storageService } from './storageService.js';
import { shopLedgerService } from './shopLedgerService.js';
import { functions } from '../config/firebase.js';
import { httpsCallable } from 'firebase/functions';

export const promoCodeService = {
  /**
   * Normalizes a promo code string (trims whitespace, removes hashes, uppercase).
   */
  normalizeCode(codeStr) {
    if (!codeStr || typeof codeStr !== 'string') return '';
    return codeStr.trim().replace(/^#/, '').toUpperCase();
  },

  /**
   * Returns whether a promo code has already been redeemed on the active profile.
   */
  hasRedeemedCode(codeStr) {
    const normalized = this.normalizeCode(codeStr);
    const redeemed = storageService.getRedeemedPromoCodes();
    return redeemed.includes(normalized);
  },

  /**
   * Executes promo code redemption by validating via Firebase Cloud Function,
   * modifies storage, records transaction audit, and returns results.
   */
  async redeemCode(codeStr) {
    const normalized = this.normalizeCode(codeStr);
    if (!normalized) {
      return { success: false, reason: 'Please enter a promo code.' };
    }

    if (this.hasRedeemedCode(normalized)) {
      return { success: false, reason: 'This promo code has already been redeemed on this profile.' };
    }

    let promo;
    try {
      const validateFn = httpsCallable(functions, 'validatePromoCode');
      const result = await validateFn({ code: normalized });
      promo = result.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        success: false,
        reason: error.message || 'Failed to validate promo code. Please try again.'
      };
    }

    // Use the normalized code from the server to be safe, or fallback to local normalized
    const validatedCode = promo.code || normalized;

    // Load active profile data
    const activeProf = storageService.getActiveProfile();
    const activeSubject = storageService.getActiveSubject ? storageService.getActiveSubject() : 'math';
    const userData = storageService.getUserData(activeSubject);
    const shopState = storageService.getShopState();

    let currentSparks = userData.sparks || 0;
    let nextSparks = currentSparks;
    let unlocked = Array.isArray(shopState.unlockedItems) ? [...shopState.unlockedItems] : [];
    let currentConsumables = { ...(userData.consumables || {}) };

    const grantedItems = [];
    const rewards = promo.rewards || {};

    // 1. Grant Sparks
    if (typeof rewards.sparks === 'number' && rewards.sparks > 0) {
      nextSparks += rewards.sparks;
    }

    // 2. Grant Items
    if (Array.isArray(rewards.items)) {
      rewards.items.forEach((itemId) => {
        if (!unlocked.includes(itemId)) {
          unlocked.push(itemId);
          grantedItems.push(itemId);
        }
      });
    }

    // 3. Grant Consumables
    if (rewards.consumables && typeof rewards.consumables === 'object') {
      Object.keys(rewards.consumables).forEach((key) => {
        const count = Number(rewards.consumables[key]) || 0;
        currentConsumables[key] = (currentConsumables[key] || 0) + count;
      });
    }

    // 4. Save state & record redeemed code
    const updatedRedeemed = storageService.addRedeemedPromoCode(validatedCode);
    storageService.saveShopState(shopState.equippedItems || [], unlocked, updatedRedeemed);
    storageService.saveUserData({
      sparks: nextSparks,
      consumables: currentConsumables
    });

    // 5. Audit log
    shopLedgerService.recordTransactionLedger({
      type: 'PROMO_CODE_REDEMPTION',
      code: validatedCode,
      rewardTitle: promo.title,
      sparksGranted: rewards.sparks || 0,
      itemsGranted: grantedItems,
      previousBalance: currentSparks,
      newBalance: nextSparks
    });

    return {
      success: true,
      promo,
      reward: {
        title: promo.title,
        description: promo.description,
        badge: promo.badge,
        sparks: rewards.sparks || 0,
        items: rewards.items || [],
        newlyUnlockedItems: grantedItems,
        consumables: rewards.consumables || {}
      },
      updated: {
        sparks: nextSparks,
        unlockedItems: unlocked,
        consumables: currentConsumables
      },
      message: `Code redeemed successfully! Enjoy your ${promo.title}.`
    };
  },

};
