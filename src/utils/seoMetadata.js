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
  },
  blog: {
    title: 'Kibo Climb Blog – Math Strategies, Mental Math Shortcuts & Parent Guides',
    description: 'Discover expert mental math shortcuts, adaptive learning strategies, and parent/teacher tips to make math practice exciting with Kibo Climb.'
  },
  blog_index: {
    title: 'Kibo Climb Blog – Math Strategies, Mental Math Shortcuts & Parent Guides',
    description: 'Discover expert mental math shortcuts, adaptive learning strategies, and parent/teacher tips to make math practice exciting with Kibo Climb.'
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
  const setMeta = (attrName, attrValue, val) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  // Standard Meta
  setMeta('name', 'description', description);

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
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);

  // Twitter Card
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
};

/**
 * Sets document meta tags for a specific printable worksheet page.
 * Replaces the manual document.title assignment in WorksheetViewerScreen.
 * @param {Object} worksheet - Worksheet catalog entry (must have slug, subject, title, gradeLabel, desc)
 * @param {number|string} [seed=0] - Active seed; 0 means default set
 */
export function updateWorksheetSeo(worksheet, seed = 0) {
  if (typeof document === 'undefined' || !worksheet) return;

  const setNum = seed && seed !== 0 && seed !== '0' ? ` (Set #${seed})` : '';
  const subjectLabel = worksheet.subject.charAt(0).toUpperCase() + worksheet.subject.slice(1);
  const title = `${worksheet.title}${setNum} – Free Printable ${subjectLabel} Worksheet (${worksheet.gradeLabel}) | Kibo Climb`;
  const description = `Free printable ${worksheet.gradeLabel} ${subjectLabel} worksheet: ${worksheet.desc} 16 problems + parent answer key. Print or share instantly — no account required.`;
  const canonicalUrl = `https://kiboclimb.com/worksheets/${worksheet.subject}/${worksheet.slug}`;

  document.title = title;

  const setMeta = (attrName, attrValue, val) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  setMeta('name', 'description', description);

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
}

/**
 * Sets document meta tags and JSON-LD structured data for the main Blog Index page.
 * @param {Array} posts - Array of normalized blog post objects
 */
export function updateBlogIndexSeo(posts = []) {
  if (typeof document === 'undefined') return;

  const title = 'Kibo Climb Blog – Math Strategies, Mental Math Shortcuts & Parent Guides';
  const description = 'Explore expert mental math shortcuts, adaptive learning strategies, and printable resources to make math exciting with Kibo Climb.';
  const canonicalUrl = 'https://kiboclimb.com/blog';
  const imageUrl = 'https://kiboclimb.com/images/blog/kibo-climbing.jpeg';

  document.title = title;

  const setMeta = (attrName, attrValue, val) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  setMeta('name', 'description', description);

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // Open Graph
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', imageUrl);

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', imageUrl);

  // JSON-LD Structured Data for Blog & CollectionPage
  let scriptEl = document.getElementById('blog-index-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'blog-index-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'Kibo Climb Learning Blog',
    'url': canonicalUrl,
    'description': description,
    'publisher': {
      '@type': 'Organization',
      'name': 'Kibo Climb',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://kiboclimb.com/favicon.png'
      }
    },
    'blogPost': posts.slice(0, 20).map(post => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'url': `https://kiboclimb.com/blog/${post.slug}`,
      'datePublished': post.published_at,
      'description': post.excerpt || post.meta_description,
      'image': post.featured_asset ? `https://kiboclimb.com/images/blog/${post.featured_asset}` : imageUrl,
      'author': {
        '@type': 'Organization',
        'name': 'Kibo Climb Team'
      }
    }))
  };

  scriptEl.textContent = JSON.stringify(jsonLdData);
}

/**
 * Sets document meta tags and JSON-LD structured data for a single Blog Post page.
 * @param {Object} post - Blog post data object
 */
export function updateBlogPostSeo(post) {
  if (typeof document === 'undefined' || !post) return;

  const title = `${post.title} | Kibo Climb Blog`;
  const description = post.meta_description || post.social_copy?.short_blurb || 'Adaptive math strategies and parent tips from Kibo Climb.';
  const canonicalUrl = `https://kiboclimb.com/blog/${post.slug}`;
  const asset = post.featured_asset ? `/images/blog/${post.featured_asset}` : '/images/blog/kibo-climbing.jpeg';
  const imageUrl = `https://kiboclimb.com${asset}`;

  document.title = title;

  const setMeta = (attrName, attrValue, val) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  };

  setMeta('name', 'description', description);

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // Open Graph
  setMeta('property', 'og:type', 'article');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', imageUrl);

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', imageUrl);

  // JSON-LD Structured Data for Article
  let scriptEl = document.getElementById('blog-post-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'blog-post-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': description,
    'datePublished': post.published_at,
    'url': canonicalUrl,
    'image': imageUrl,
    'author': {
      '@type': 'Organization',
      'name': 'Kibo Climb Team'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Kibo Climb',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://kiboclimb.com/favicon.png'
      }
    }
  };

  scriptEl.textContent = JSON.stringify(jsonLdData);
}

