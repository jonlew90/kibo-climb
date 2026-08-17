// Promo Code Redemption & Validation Service for Kibo Climb
// Handles authoritative code redemption, expiration checking, duplicate prevention, and item/spark grants.

import { storageService } from './storageService.js';
import { shopLedgerService } from './shopLedgerService.js';

export const PROMO_CODES_REGISTRY = {
  GOLDENKIBO: {
    code: 'GOLDENKIBO',
    title: 'Golden Ticket VIP',
    description: 'Unlocks the legendary Golden Ticket gear and 150 bonus Sparks!',
    badge: '🎟️ VIP EXCLUSIVE',
    rewards: {
      sparks: 150,
      items: ['golden_ticket']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  KIBOSPARKS: {
    code: 'KIBOSPARKS',
    title: 'Spark Shower Boost',
    description: 'Grants +300 Sparks directly to your balance to gear up Kibo!',
    badge: '⚡ +300 SPARKS',
    rewards: {
      sparks: 300
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  SUMMERCLIMB: {
    code: 'SUMMERCLIMB',
    title: 'Summer Climber Supply Pack',
    description: 'Grants 2x Streak Savers, 2x Hint Scrolls, and 100 bonus Sparks!',
    badge: '☀️ SUMMER SPECIAL',
    rewards: {
      sparks: 100,
      consumables: {
        streakSaverCount: 2,
        hintScrollCount: 2
      }
    },
    availableFrom: '2026-06-01T00:00:00Z',
    expiresAt: '2026-09-30T23:59:59Z'
  },
  CYBERCLIMB: {
    code: 'CYBERCLIMB',
    title: 'Cyberpunk Headwear Drop',
    description: 'Unlocks Cyber Neon Shades and 150 bonus Sparks!',
    badge: '🕶️ PROMO GEAR',
    rewards: {
      sparks: 150,
      items: ['cyber_shades']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  KIBOFRIEND: {
    code: 'KIBOFRIEND',
    title: 'Robot Buddy Rescue',
    description: 'Unlocks the Mini Robot pet companion and 100 Sparks!',
    badge: '🤖 PET COMPANION',
    rewards: {
      sparks: 100,
      items: ['mini_robot']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  OCTOBERFEST: {
    code: 'OCTOBERFEST',
    title: 'Autumn Harvest Celebration',
    description: 'Unlocks the Jack-o\'-Lantern Headwear and 100 Sparks!',
    badge: '🎃 AUTUMN SPECIAL',
    rewards: {
      sparks: 100,
      items: ['pumpkin_hat']
    },
    availableFrom: '2026-08-01T00:00:00Z',
    expiresAt: '2026-11-30T23:59:59Z'
  }
};

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
   * Validates a code without mutating state.
   * @returns {{ valid: boolean, reason?: string, promoData?: object }}
   */
  validateCode(codeStr, customDate = new Date()) {
    const normalized = this.normalizeCode(codeStr);
    if (!normalized) {
      return { valid: false, reason: 'Please enter a promo code.' };
    }

    const promo = PROMO_CODES_REGISTRY[normalized];
    if (!promo) {
      return { valid: false, reason: 'Invalid promo code. Check your spelling and try again.' };
    }

    if (this.hasRedeemedCode(normalized)) {
      return { valid: false, reason: 'This promo code has already been redeemed on this profile.' };
    }

    const now = (customDate instanceof Date ? customDate : new Date(customDate)).getTime();
    if (promo.availableFrom && now < new Date(promo.availableFrom).getTime()) {
      return { valid: false, reason: 'This promo code is not active yet. Check back soon!' };
    }

    if (promo.expiresAt && now > new Date(promo.expiresAt).getTime()) {
      return { valid: false, reason: 'This promo code has expired.' };
    }

    return { valid: true, promoData: promo };
  },

  /**
   * Executes promo code redemption, modifies storage, records transaction audit, and returns results.
   */
  redeemCode(codeStr, customDate = new Date()) {
    const validation = this.validateCode(codeStr, customDate);
    if (!validation.valid) {
      return {
        success: false,
        reason: validation.reason
      };
    }

    const promo = validation.promoData;
    const normalized = promo.code;

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
    const updatedRedeemed = storageService.addRedeemedPromoCode(normalized);
    storageService.saveShopState(shopState.equippedItems || [], unlocked, updatedRedeemed);
    storageService.saveUserData({
      sparks: nextSparks,
      consumables: currentConsumables
    });

    // 5. Audit log
    shopLedgerService.recordTransactionLedger({
      type: 'PROMO_CODE_REDEMPTION',
      code: normalized,
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

  /**
   * Returns all promo codes in registry for display or hints.
   */
  getAvailableCodesList() {
    return Object.values(PROMO_CODES_REGISTRY);
  }
};
