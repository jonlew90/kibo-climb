// Centralized Brand Configuration for Kibo Math / Kibo Climb

export const BRAND_CONFIG = {
  rootBrand: "Kibo Climb",
  appName: "Kibo Math",
  tagline: "The 3-Minute Daily Ascent to Mastery",
  urls: {
    app: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MATH_APP_URL) || "https://math.kiboclimb.com",
    parent: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PARENT_PORTAL_URL) || "https://parent.kiboclimb.com"
  }
};
