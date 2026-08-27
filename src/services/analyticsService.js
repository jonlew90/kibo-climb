import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Safely logs an event to Firebase Analytics if it is initialized.
 * @param {string} eventName - The name of the event.
 * @param {Object} [eventParams] - Optional parameters to send with the event.
 */
const safeLogEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error(`Failed to log analytics event: ${eventName}`, error);
    }
  }
};

export const analyticsService = {
  /**
   * Log when a user views a specific screen or modal.
   * @param {string} screenName - The name of the screen (e.g., 'Settings', 'Shop', 'ParentDashboard').
   */
  logScreenView: (screenName) => {
    safeLogEvent('screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenName
    });
  },

  /**
   * Log when a user changes the active subject.
   * @param {string} subjectId - The ID of the selected subject (e.g., 'math', 'words', 'world').
   */
  logSubjectChange: (subjectId) => {
    safeLogEvent('select_content', {
      content_type: 'subject',
      item_id: subjectId
    });
  },

  /**
   * Log when a user views a subscription upsell screen.
   * @param {string} placement - Where the upsell was shown (e.g., 'ParentDashboard', 'ProfileSelector').
   */
  logSubscriptionUpsellView: (placement) => {
    safeLogEvent('view_promotion', {
      promotion_name: 'subscription_upsell',
      location_id: placement
    });
  },

  /**
   * Log when a user begins the checkout process.
   * @param {string} planId - The subscription plan ID (e.g., 'kibo_club_sub', 'kibo_club_family').
   */
  logBeginCheckout: (planId) => {
    safeLogEvent('begin_checkout', {
      items: [
        {
          item_id: planId,
          item_name: planId === 'kibo_club_family' ? 'Family Plan' : 'Single Plan',
          item_category: 'Subscription'
        }
      ]
    });
  },

  /**
   * Log when a user successfully completes a purchase or subscription checkout.
   * @param {string} planId - The subscription plan ID.
   */
  logPurchase: (planId) => {
    safeLogEvent('purchase', {
      currency: 'USD',
      items: [
        {
          item_id: planId,
          item_name: planId === 'kibo_club_family' ? 'Family Plan' : 'Single Plan',
          item_category: 'Subscription'
        }
      ]
    });
  },

  /**
   * Log custom events
   * @param {string} eventName
   * @param {Object} [params]
   */

  /**
   * Log when a user answers a question.
   * @param {string} subjectId - The subject (e.g. 'math').
   * @param {boolean} isCorrect - Whether the answer was correct.
   * @param {number} tier - The tier of the question.
   * @param {string} concept - The concept tested (optional).
   */
  logQuestionAnswered: (subjectId, isCorrect, tier, concept) => {
    safeLogEvent('question_answered', {
      subject: subjectId,
      is_correct: isCorrect,
      tier: tier,
      concept: concept || 'unknown'
    });
  },

  /**
   * Log when a badge is unlocked.
   * @param {string} badgeId - The ID of the badge.
   * @param {string} subjectId - The subject where it was unlocked.
   */
  logBadgeUnlocked: (badgeId, subjectId) => {
    safeLogEvent('unlock_achievement', {
      achievement_id: badgeId,
      subject: subjectId
    });
  },

  /**
   * Log when virtual currency (sparks) is spent.
   * @param {string} itemId - The ID of the item purchased.
   * @param {number} value - The cost in sparks.
   */
  logSpendVirtualCurrency: (itemId, value) => {
    safeLogEvent('spend_virtual_currency', {
      item_name: itemId,
      value: value,
      virtual_currency_name: 'sparks'
    });
  },

  /**
   * Log when virtual currency (sparks) is earned.
   * @param {number} value - The amount of sparks earned.
   * @param {string} source - Where the sparks came from (e.g. 'question_correct', 'daily_streak').
   */
  logEarnVirtualCurrency: (value, source) => {
    safeLogEvent('earn_virtual_currency', {
      virtual_currency_name: 'sparks',
      value: value,
      source: source || 'unknown'
    });
  },

  /**
   * Log when a user completes a block/level.
   * @param {string} subjectId - The subject.
   * @param {number} correctCount - Number of correct answers in the block.
   */
  logLevelUp: (subjectId, correctCount) => {
    safeLogEvent('level_up', {
      character: subjectId,
      level: correctCount // using level property to store correct count for simplicity
    });
  },

  /**
   * Log custom events
   * @param {string} eventName
   * @param {Object} [params]
   */
  logCustomEvent: (eventName, params) => {
    safeLogEvent(eventName, params);
  }
};
