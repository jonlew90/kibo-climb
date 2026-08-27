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
  logCustomEvent: (eventName, params) => {
    safeLogEvent(eventName, params);
  }
};
