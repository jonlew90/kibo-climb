/**
 * Cross-platform In-App Review Helper for Kibo Climb
 * Safely requests native store review on iOS/Android (via Capacitor / StoreKit / Play In-App Review if available)
 * or falls back gracefully on Web / PWA environments.
 */
export const requestAppReview = async () => {
  try {
    // 1. Check if Capacitor native bridge with InAppReview plugin is present on window
    if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.InAppReview) {
      return await window.Capacitor.Plugins.InAppReview.requestReview();
    }

    // 2. Web / PWA environment fallback
    return { success: true, method: 'web_fallback' };
  } catch (error) {
    console.warn('In-App Review not available in current environment:', error);
    return null;
  }
};
