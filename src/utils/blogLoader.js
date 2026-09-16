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

/**
 * Returns all blog posts sorted chronologically (newest first).
 */
export function getAllBlogPosts() {
  const posts = [];

  for (const path in blogModules) {
    const rawData = blogModules[path]?.default || blogModules[path];
    if (rawData && rawData.title) {
      const fileMatch = path.match(/([^/]+)\.json$/);
      const fileSlug = fileMatch ? fileMatch[1] : '';
      const slug = rawData.slug || fileSlug;
      const publishedAt = rawData.published_at || new Date(0).toISOString();
      const readTime = getReadTime(rawData.content_markdown);
      const excerpt = getExcerpt(rawData);
      const formattedDate = formatDate(publishedAt);

      posts.push({
        ...rawData,
        slug,
        readTime,
        excerpt,
        formattedDate,
        published_at: publishedAt,
        tags: Array.isArray(rawData.tags) ? rawData.tags : [],
        featured_asset: rawData.featured_asset || 'kibo-climbing.jpeg'
      });
    }
  }

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
 * Extract distinct categories/tags across all posts
 */
export function getBlogCategories(posts = getAllBlogPosts()) {
  const categorySet = new Set();
  posts.forEach(post => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach(t => {
        if (t && typeof t === 'string') categorySet.add(t.trim());
      });
    }
    if (post.topic && typeof post.topic === 'string') {
      categorySet.add(post.topic.trim());
    }
  });

  // Standardize common top categories
  const topCategories = ['All'];
  const knownTags = ['Mental Math', 'Math Strategies', 'Elementary Math', 'Addition', 'Multiplication', 'Problem Solving'];
  
  knownTags.forEach(kt => {
    if ([...categorySet].some(t => t.toLowerCase() === kt.toLowerCase())) {
      topCategories.push(kt);
    }
  });

  // Add any other categories found
  categorySet.forEach(tag => {
    if (!topCategories.some(kt => kt.toLowerCase() === tag.toLowerCase())) {
      topCategories.push(tag);
    }
  });

  return topCategories;
}
