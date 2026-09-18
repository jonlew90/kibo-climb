/**
 * Dynamic Blog Content Loader & Processor
 * Dynamically ingests all JSON articles in src/content/blog/ via Vite's import.meta.glob.
 * Newly added JSON articles are automatically discovered and sorted chronologically without manual registry updates.
 */

// Dynamically glob all JSON articles in src/content/blog/
const blogModules = import.meta.glob('../content/blog/*.json', { eager: true });

export function getReadTime(content) {
  if (!content) return '2 min read';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatDate(isoString) {
  if (!isoString) return 'September 14, 2026';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(0, 10);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return isoString.slice(0, 10);
  }
}

export function getExcerpt(post) {
  if (post.social_copy?.short_blurb) return post.social_copy.short_blurb;
  if (post.meta_description) return post.meta_description;
  if (!post.content_markdown) return '';
  const clean = post.content_markdown
    .replace(/^#+\s+.*$/gm, '') // remove headings
    .replace(/(\*\*|\*|__|_|`|\[[^\]]+\]\([^)]+\))/g, '') // remove markdown symbols & link targets
    .trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(' ');
}

export const AVAILABLE_BLOG_IMAGES = [
  'kibo_sitting_on_boulder_thinking_20260916125021.jpeg',
  'kibo_rock_climbing_granite_cliff_20260916124919.jpeg',
  'kibo-climbing.jpeg',
  'Kibo_atop_mountain_summit_20260916124858.jpeg',
  'kibo_sitting_on_boulder_20260916124901.jpeg',
  'Kibo_celebrating_at_mountain_summit_20260916124923.jpeg',
  'kibo_solving_stone_pattern.jpeg',
  'Kibo_atop_mountain_summit_20260916124910.jpeg',
  'kibo-summit.jpeg',
  'Kibo_atop_mountain_summit_20260916124937.jpeg',
  'kibo-thinking.jpeg',
  'kibo_solving_stone_pattern2.jpeg'
];

/**
 * Returns all blog posts sorted chronologically (newest first).
 */
export function getAllBlogPosts() {
  const posts = [];
  const entries = Object.entries(blogModules);

  entries.forEach(([path, mod], idx) => {
    const rawData = mod?.default || mod;
    if (rawData && rawData.title) {
      const fileMatch = path.match(/([^/]+)\.json$/);
      const fileSlug = fileMatch ? fileMatch[1] : '';
      const slug = rawData.slug || fileSlug;
      const publishedAt = rawData.published_at || new Date(0).toISOString();
      const readTime = getReadTime(rawData.content_markdown);
      const excerpt = getExcerpt(rawData);
      const formattedDate = formatDate(publishedAt);

      // Fallback cycles through available assets if no unique asset is specified
      const fallbackImage = AVAILABLE_BLOG_IMAGES[idx % AVAILABLE_BLOG_IMAGES.length];
      const featured_asset = rawData.featured_asset || fallbackImage;

      posts.push({
        ...rawData,
        slug,
        readTime,
        excerpt,
        formattedDate,
        published_at: publishedAt,
        tags: Array.isArray(rawData.tags) ? rawData.tags : [],
        featured_asset
      });
    }
  });

  // Sort descending by published_at (newest first)
  posts.sort((a, b) => {
    const timeA = new Date(a.published_at).getTime();
    const timeB = new Date(b.published_at).getTime();
    return timeB - timeA;
  });

  return posts;
}

/**
 * Find a specific post by slug or filename
 */
export function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  const posts = getAllBlogPosts();
  return posts.find(p => p.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Return the featured article: post marked with featured: true, or the latest post
 */
export function getFeaturedPost(posts = getAllBlogPosts()) {
  if (!posts || posts.length === 0) return null;
  return posts.find(p => p.featured === true) || posts[0];
}

/**
 * Return previous and next blog posts for sequential reading
 */
export function getAdjacentBlogPosts(slug, posts = getAllBlogPosts()) {
  if (!slug || !posts || posts.length === 0) return { prev: null, next: null };
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  const currentIndex = posts.findIndex(p => p.slug.toLowerCase() === cleanSlug);
  if (currentIndex === -1) return { prev: null, next: null };

  // Note: posts are sorted newest first (descending).
  // prev = older post (next index), next = newer post (previous index)
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  return { prev: prevPost, next: nextPost };
}

/**
 * Core curated pillar categories for blog navigation.
 * Keeps the category bar clean and focused as new articles and tags are added.
 */
export const BLOG_PILLAR_CATEGORIES = [
  'All',
  'Mental Math',
  'Math Strategies',
  'Elementary Math',
  'Addition',
  'Multiplication',
  'Parent Resources'
];

/**
 * Extract active pillar categories across all available posts.
 * Only returns pillars that have at least one matching article.
 */
export function getBlogCategories(posts = getAllBlogPosts()) {
  if (!posts || posts.length === 0) return ['All'];

  const activeCategories = ['All'];

  for (const pillar of BLOG_PILLAR_CATEGORIES.slice(1)) {
    const pillarLower = pillar.toLowerCase();
    const hasMatchingPost = posts.some(post => {
      const tagMatch = Array.isArray(post.tags) && post.tags.some(t => {
        const tLower = t.toLowerCase();
        return tLower.includes(pillarLower) || pillarLower.includes(tLower);
      });
      const topicMatch = post.topic && (
        post.topic.toLowerCase().includes(pillarLower) || pillarLower.includes(post.topic.toLowerCase())
      );
      const subjectMatch = post.subject && post.subject.toLowerCase() === pillarLower;
      return tagMatch || topicMatch || subjectMatch;
    });

    if (hasMatchingPost) {
      activeCategories.push(pillar);
    }
  }

  return activeCategories;
}
