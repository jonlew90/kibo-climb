/**
 * SEO & Meta Tags Manager
 * Dynamically updates document title, description, Open Graph, Twitter cards,
 * and canonical links when navigating routes or switching subjects.
 */

export const SUBJECT_SEO_CONFIG = {
  math: {
    title: 'Kibo Math – Daily Mental Math & Arithmetic Climb for Kids',
    description: 'Master addition, subtraction, multiplication, fractions, and pre-algebra with gamified daily math climbs and instant feedback.',
    path: '/math'
  },
  words: {
    title: 'Kibo Words – Fun Vocabulary, Phonics & Spelling Practice for Kids',
    description: 'Climb through vocabulary, spelling fluency, phonics, and grammar with fast-paced word challenges on Mount Kibo.',
    path: '/words'
  },
  world: {
    title: 'Kibo World – Geography, Maps & Global Knowledge for Kids',
    description: 'Explore world geography, country capitals, flags, continents, and cultural landmarks through fun daily expeditions.',
    path: '/world'
  },
  coding: {
    title: 'Kibo Coding – Logic, Algorithms & Computational Thinking for Kids',
    description: 'Learn foundational programming logic, sequence algorithms, conditionals, variables, and loops with interactive puzzles.',
    path: '/coding'
  }
};

export const ROUTE_SEO_CONFIG = {
  settings: {
    title: 'Settings – Kibo Climb',
    description: 'Manage audio, display, climber preferences, and gameplay settings in Kibo Climb.'
  },
  privacy: {
    title: 'Privacy Policy – Kibo Climb',
    description: 'Learn how Kibo Climb protects child privacy, COPPA compliance, and account security.'
  },
  terms: {
    title: 'Terms of Service – Kibo Climb',
    description: 'Terms and conditions for using Kibo Climb educational apps.'
  },
  leaderboard: {
    title: 'Climber Leaderboards – Kibo Climb',
    description: 'View top climber rankings, friend leagues, and subject mastery standings.'
  },
  quests: {
    title: 'Daily & Weekly Quests – Kibo Climb',
    description: 'Complete daily learning quests, level up your ascent rank, and collect Sparks.'
  },
  parent_dashboard: {
    title: 'Parent Zone & Progress Dashboard – Kibo Climb',
    description: 'Review weekly progress digests, topic mastery breakdowns, and family subscription settings.'
  }
};

/**
 * Updates document meta tags according to the active route and subject.
 * @param {Object} options
 * @param {string} options.route - Active route identifier ('adaptive_session', 'settings', etc.)
 * @param {string} [options.subject='math'] - Active subject identifier ('math', 'words', 'world', 'coding')
 */
export function updateDocumentSeo({ route, subject = 'math' } = {}) {
  if (typeof document === 'undefined') return;

  let title = 'Kibo Climb – Fun Daily Math, Words & Geography Practice for Kids';
  let description = 'The Daily Climb to Mastery. Fast, engaging Math, Words, World geography, and Coding practice app for children with instant feedback, streak rewards, and stats tracking.';
  let relativePath = '/';

  if (route && route !== 'adaptive_session' && ROUTE_SEO_CONFIG[route]) {
    title = ROUTE_SEO_CONFIG[route].title;
    description = ROUTE_SEO_CONFIG[route].description;
    relativePath = `/${route.replace('_', '-')}`;
  } else if (subject && SUBJECT_SEO_CONFIG[subject]) {
    title = SUBJECT_SEO_CONFIG[subject].title;
    description = SUBJECT_SEO_CONFIG[subject].description;
    relativePath = SUBJECT_SEO_CONFIG[subject].path;
  }

  // Update <title>
  document.title = title;

  // Helper to set or create meta tag
  const setMeta = (selector, attr, val) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      const cleanSelector = selector.replace(/[\[\]']/g, '');
      const eqIdx = cleanSelector.indexOf('=');
      if (eqIdx !== -1) {
        const key = cleanSelector.substring(0, eqIdx);
        const name = cleanSelector.substring(eqIdx + 1);
        el.setAttribute(key, name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, val);
  };

  // Standard Meta
  setMeta('meta[name="description"]', 'content', description);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = `https://kiboclimb.com${relativePath === '/' ? '' : relativePath}`;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);

  // Twitter Card
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
}
