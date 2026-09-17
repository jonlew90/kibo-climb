// Centralized Brand Configuration for Kibo Math / Kibo Climb

export const BRAND_CONFIG = {
  rootBrand: "Kibo Climb",
  appName: "Kibo Math",
  tagline: "The Daily Climb to Mastery",
  urls: {
    app: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MATH_APP_URL) || "https://github.com/jonlew90/kibo-climb",
    parent: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PARENT_PORTAL_URL) || "https://github.com/jonlew90/kibo-climb"
  },
  socials: {
    pinterest: "https://www.pinterest.com/kiboclimb/kibo-climb-education/",
    facebook: "https://www.facebook.com/profile.php?id=61594522407493",
    x: "https://x.com/kiboclimbapp",
    linkedin: "https://www.linkedin.com/company/kiboclimb",
    threads: "https://www.threads.com/@kiboclimb",
    rss: "/feed.xml"
  }
};
