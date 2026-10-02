import { getAllBlogPosts } from './blogLoader';

/**
 * Built-in Interactive Strategy & Cheat-Sheet definitions.
 * Provides live formula calculators, interactive widgets, and deep links to relevant blog posts.
 */
export const CORE_STRATEGY_CHEATS = [
  {
    id: 'math_make_a_ten',
    subject: 'math',
    subjectName: 'Kibo Math',
    subjectIcon: '🔢',
    title: 'Make a Ten & Compensation',
    shortRule: 'Turn numbers ending in 8 or 9 into friendly 10s by borrowing 1 or 2 from the other number, then subtract the extra.',
    formula: '48 + 37  ➔  (50 + 37) - 2 = 85',
    tier: 1,
    tag: 'Addition Strategy',
    interactiveType: 'addition_slider',
    defaultValues: { a: 48, b: 37, roundTo: 50, diff: 2 },
    blogSlug: 'master-mental-addition-compensation-strategy',
    keyTakeaway: 'Always look for 8s and 9s to quickly round up to the nearest 10 or 100.'
  },
  {
    id: 'math_left_to_right',
    subject: 'math',
    subjectName: 'Kibo Math',
    subjectIcon: '🔢',
    title: 'Left-to-Right Mental Addition',
    shortRule: 'Add the largest place values first (hundreds, then tens, then ones) to avoid keeping regrouping carries in working memory.',
    formula: '65 + 28  ➔  (60 + 20) + (5 + 8) = 80 + 13 = 93',
    tier: 2,
    tag: 'Mental Arithmetic',
    interactiveType: 'left_to_right_stepper',
    defaultValues: { a: 65, b: 28 },
    blogSlug: 'unlocking-mental-math-left-to-right-addition',
    keyTakeaway: 'Calculating left-to-right mirrors how we read numbers aloud and builds instant magnitude estimation.'
  },
  {
    id: 'math_double_halve',
    subject: 'math',
    subjectName: 'Kibo Math',
    subjectIcon: '🔢',
    title: 'Double and Halve Strategy',
    shortRule: 'When multiplying an even number by a number ending in 5 or 25, halve the even number and double the other.',
    formula: '16 × 25  ➔  (16 ÷ 2) × (25 × 2) = 8 × 50 = 400',
    tier: 3,
    tag: 'Multiplication Shortcut',
    interactiveType: 'double_halve_calc',
    defaultValues: { a: 16, b: 25 },
    blogSlug: 'mental-math-shortcuts-for-fast-climbers',
    keyTakeaway: 'Turns tough 2-digit multiplication into simple 1-digit mental math in seconds.'
  },
  {
    id: 'words_magic_e',
    subject: 'words',
    subjectName: 'Kibo Words',
    subjectIcon: '📚',
    title: 'The Silent "Magic E" Vowel Rule',
    shortRule: 'When an "e" sits at the end of a CVC root word, it remains silent and makes the preceding vowel say its long name.',
    formula: 'cap + e ➔ cape  |  pin + e ➔ pine  |  hop + e ➔ hope',
    tier: 2,
    tag: 'Phonics & Spelling',
    interactiveType: 'word_magic_toggle',
    defaultValues: { root: 'cap', longWord: 'cape', vowel: 'a' },
    blogSlug: 'words-tier-2-the-magic-e-rule',
    keyTakeaway: 'Recognizing silent-e patterns instantly boosts reading fluency and eliminates spelling hesitation.'
  },
  {
    id: 'words_chunking',
    subject: 'words',
    subjectName: 'Kibo Words',
    subjectIcon: '📚',
    title: 'Summit Syllable Chunking',
    shortRule: 'Break complex multi-syllable summit words into root bases, prefixes (un-, re-, dis-), and suffixes (-ing, -tion, -ly).',
    formula: 'un + break + able  ➔  unbreakable',
    tier: 8,
    tag: 'Morphology & Fluency',
    interactiveType: 'syllable_chunker',
    defaultValues: { prefix: 'un', root: 'predict', suffix: 'able' },
    blogSlug: 'words-tier-8-summit-chunking',
    keyTakeaway: 'Chunking turns unfamiliar 10-letter summit words into 3 simple, recognizable micro-words.'
  },
  {
    id: 'coding_step_memory',
    subject: 'coding',
    subjectName: 'Kibo Coding',
    subjectIcon: '💻',
    title: 'Step-by-Step Memory Box Tracing',
    shortRule: 'Track variable state changes line by line on your mental scratchpad. Never guess what a loop does all at once.',
    formula: 'x = 3 ➔ x = x + 2 ➔ x is now 5',
    tier: 4,
    tag: 'Algorithms & Variables',
    interactiveType: 'variable_tracer',
    defaultValues: { initial: 3, step: 2, runs: 3 },
    blogSlug: 'coding-tier-4-step-by-step-memory-box',
    keyTakeaway: 'Stepwise variable tracing is the #1 secret used by master programmers to squash logic bugs.'
  },
  {
    id: 'coding_branching',
    subject: 'coding',
    subjectName: 'Kibo Coding',
    subjectIcon: '💻',
    title: 'Branching & True Path Evaluation',
    shortRule: 'Evaluate boolean condition gates (True/False) first before looking at code inside the branch.',
    formula: 'IF (energy > 50) THEN [Climb Peak] ELSE [Rest at Camp]',
    tier: 5,
    tag: 'Conditionals & Logic',
    interactiveType: 'branch_evaluator',
    defaultValues: { energy: 75, threshold: 50 },
    blogSlug: 'coding-tier-5-take-the-true-branch',
    keyTakeaway: 'Conditional evaluation determines the single active path, ignoring unreached else branches.'
  },
  {
    id: 'world_landmark_anchors',
    subject: 'world',
    subjectName: 'Kibo World',
    subjectIcon: '🌍',
    title: 'Geographic Anchor Points & Hemispheres',
    shortRule: 'Use major reference anchors (Equator, Prime Meridian, oceans) to triangulate country locations without memorizing raw coordinates.',
    formula: 'Equator + Andes Mountain Spine ➔ Ecuador & Peru',
    tier: 4,
    tag: 'Map Navigation',
    interactiveType: 'geo_anchor_finder',
    defaultValues: { continent: 'South America', anchor: 'Andes Spine' },
    blogSlug: 'world-tier-4-curriculum-strategy',
    keyTakeaway: 'Anchor geography links physical landmarks to political borders for rapid mental recall.'
  }
];

/**
 * Dynamically synthesizes all tips & cheat-sheets by combining:
 * 1. Curated live interactive strategy widgets (CORE_STRATEGY_CHEATS)
 * 2. Auto-discovered blog posts from src/content/blog/
 * Ensures 100% automated coverage as new blog posts are generated.
 */
export function getAllTipsAndStrategies() {
  const allBlogPosts = getAllBlogPosts();
  const cheatMap = new Map();

  // 1. Ingest Core Curated Interactive Cheats
  CORE_STRATEGY_CHEATS.forEach(cheat => {
    cheatMap.set(cheat.blogSlug, { ...cheat });
  });

  // 2. Automatically ingest newly created blog posts as cards
  allBlogPosts.forEach(post => {
    if (!cheatMap.has(post.slug)) {
      const subject = post.subject || 'math';
      const subjectNames = {
        math: 'Kibo Math',
        words: 'Kibo Words',
        world: 'Kibo World',
        coding: 'Kibo Coding'
      };
      const subjectIcons = {
        math: '🔢',
        words: '📚',
        world: '🌍',
        coding: '💻'
      };

      cheatMap.set(post.slug, {
        id: `auto_${post.slug}`,
        subject: subject,
        subjectName: subjectNames[subject] || 'Kibo Climb',
        subjectIcon: subjectIcons[subject] || '🐾',
        title: post.title,
        shortRule: post.meta_description || post.social_copy?.short_blurb || 'Key strategy guide for young climbers.',
        formula: post.topic ? `Topic Focus: ${post.topic}` : `Tier ${post.tier || 1} Strategy Guide`,
        tier: post.tier || 1,
        tag: (post.tags && post.tags[0]) || 'Mastery Guide',
        interactiveType: 'auto_summary',
        blogSlug: post.slug,
        keyTakeaway: post.social_copy?.short_blurb || post.meta_description,
        isAutoGenerated: true,
        featured_asset: post.featured_asset
      });
    } else {
      // Enhance curated cheat with live blog post metadata if available
      const existing = cheatMap.get(post.slug);
      existing.title = existing.title || post.title;
      existing.featured_asset = post.featured_asset;
      existing.published_at = post.published_at;
    }
  });

  return Array.from(cheatMap.values());
}
