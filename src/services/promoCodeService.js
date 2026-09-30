import { storageService } from './storageService.js';
import { shopLedgerService } from './shopLedgerService.js';
import { functions } from '../config/firebase.js';
import { httpsCallable } from 'firebase/functions';
import { getActiveBlogPromoDrops, getAllBlogPosts } from '../utils/blogLoader.js';
import { WORKSHOP_ITEMS } from '../utils/itemsCatalog.js';

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
   * Checks if code matches a special promotional campaign (e.g. Reddit launch).
   */
  resolveSpecialCampaignPromo(codeStr) {
    const normalized = this.normalizeCode(codeStr);
    if (!normalized) return null;

    if (normalized === 'REDDIT30') {
      const now = new Date();
      // Redemption window: 30 days from launch (Valid through October 31, 2026 23:59:59 UTC)
      const validUntil = new Date('2026-10-31T23:59:59Z');

      if (now > validUntil) {
        return {
          expired: true,
          message: 'The REDDIT30 launch promotion has ended. Stay tuned for future community drops!'
        };
      }

      return {
        expired: false,
        promo: {
          code: 'REDDIT30',
          title: '30-Day Kibo Club Family Pass',
          description: 'Special Reddit Community Launch Drop: 30 days of full Kibo Club Family access, 250 Sparks, and the Golden Ticket!',
          badge: 'REDDIT_FOUNDER',
          rewards: {
            sparks: 250,
            items: ['golden_ticket'],
            consumables: {
              hintScrollCount: 3,
              letterSpyglassCount: 3
            },
            trial: {
              tier: 'family',
              days: 30
            }
          }
        }
      };
    }

    return null;
  },

  /**
   * Checks if code matches a catalog promo item directly.
   */
  resolveCatalogPromo(codeStr) {
    const normalized = this.normalizeCode(codeStr);
    if (!normalized) return null;

    const matchedItem = WORKSHOP_ITEMS.find(
      (item) => item.promoCodeRequired && item.promoCodeRequired.trim().toUpperCase() === normalized
    );

    if (!matchedItem) return null;

    return {
      code: matchedItem.promoCodeRequired.toUpperCase(),
      title: `${matchedItem.name} Unlocked!`,
      description: matchedItem.description,
      badge: 'PROMO_EXCLUSIVE',
      rewards: {
        sparks: 150,
        items: [matchedItem.id],
        consumables: {}
      }
    };
  },

  /**
   * Checks if code matches an active or expired blog drop locally.
   */
  resolveBlogPromoDrop(codeStr) {
    const normalized = this.normalizeCode(codeStr);
    if (!normalized) return null;

    const allPosts = typeof getAllBlogPosts === 'function' ? getAllBlogPosts() : [];
    const matchedPost = allPosts.find(
      (p) => p.promo_drop && p.promo_drop.code && p.promo_drop.code.trim().toUpperCase() === normalized
    );

    if (!matchedPost) return null;

    const pubTime = new Date(matchedPost.published_at || 0).getTime();
    const validDays = Number(matchedPost.promo_drop.valid_days) || 14;
    const expiresTime = pubTime + validDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now < pubTime || now > expiresTime) {
      return {
        expired: true,
        post: matchedPost,
        message: 'This secret reader promo code has expired. Check our latest blog articles for active drops!'
      };
    }

    return {
      expired: false,
      post: matchedPost,
      promoDrop: matchedPost.promo_drop,
      promo: {
        code: matchedPost.promo_drop.code.toUpperCase(),
        title: matchedPost.promo_drop.headline || 'Secret Reader Reward',
        description: `Unlocked from article: ${matchedPost.title}`,
        badge: 'SECRET_READER',
        rewards: {
          sparks: matchedPost.promo_drop.sparks || 100,
          consumables: matchedPost.promo_drop.consumables || {},
          items: matchedPost.promo_drop.items || []
        }
      }
    };
  },

  /**
   * Executes promo code redemption by validating via Firebase Cloud Function or local catalog/blog fallback,
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

    let promo = null;
    let cloudError = null;

    // 1. Try Firebase Cloud Function validation if available
    try {
      if (functions) {
        const validateFn = httpsCallable(functions, 'validatePromoCode');
        const result = await validateFn({ code: normalized });
        promo = result.data;
      }
    } catch (error) {
      cloudError = error;
    }

    // 2. Check special campaign promo codes (e.g. REDDIT30)
    if (!promo) {
      const campaignResolution = this.resolveSpecialCampaignPromo(normalized);
      if (campaignResolution) {
        if (campaignResolution.expired) {
          return { success: false, reason: campaignResolution.message };
        }
        promo = campaignResolution.promo;
      }
    }

    // 3. Check local catalog promo item fallback (e.g. GOLDENKIBO, CYBERCLIMB)
    if (!promo) {
      const catalogResolution = this.resolveCatalogPromo(normalized);
      if (catalogResolution) {
        promo = catalogResolution;
      }
    }

    // 4. Check local blog promo drop fallback if not found in Cloud Functions or Catalog
    if (!promo) {
      const blogResolution = this.resolveBlogPromoDrop(normalized);
      if (blogResolution) {
        if (blogResolution.expired) {
          return { success: false, reason: blogResolution.message };
        }
        promo = blogResolution.promo;
      }
    }

    if (!promo) {
      const isNetworkOrCors = cloudError?.message && (cloudError.message.includes('CORS') || cloudError.message.includes('network') || cloudError.message.includes('fetch') || cloudError.message.includes('preflight') || cloudError.code === 'unavailable');
      return {
        success: false,
        reason: isNetworkOrCors ? 'Invalid or expired promo code. Please check and try again.' : (cloudError?.message || 'Invalid or expired promo code. Please check and try again.')
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

    // 4. Grant Membership / Trial if included in promo
    let trialResult = null;
    if (rewards.trial && typeof storageService.grantCustomClubTrial === 'function') {
      trialResult = storageService.grantCustomClubTrial({
        tier: rewards.trial.tier || 'family',
        days: rewards.trial.days || 30,
        targetProfileId: activeProf?.id,
        promoCode: validatedCode
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
