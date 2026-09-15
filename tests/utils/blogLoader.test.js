import { describe, it, expect, beforeEach } from 'vitest';
import { getAllBlogPosts, getBlogPostBySlug, getFeaturedPost, getBlogCategories, getReadTime, getExcerpt } from '../../src/utils/blogLoader';
import { updateBlogIndexSeo, updateBlogPostSeo } from '../../src/utils/seoMetadata';
import { VIEWS, getPathForId, normalizeEntry } from '../../src/utils/navigationHistory';

describe('Blog Loader & Dynamic Ingestion', () => {
  it('dynamically ingests and normalizes all blog posts', () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);

    // Verify properties
    posts.forEach(post => {
      expect(post.title).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.published_at).toBeTruthy();
      expect(post.readTime).toMatch(/\d+ min read/);
      expect(post.excerpt).toBeTruthy();
      expect(Array.isArray(post.tags)).toBe(true);
    });

    // Verify chronological order (newest first)
    for (let i = 0; i < posts.length - 1; i++) {
      const timeCurrent = new Date(posts[i].published_at).getTime();
      const timeNext = new Date(posts[i + 1].published_at).getTime();
      expect(timeCurrent).toBeGreaterThanOrEqual(timeNext);
    }
  });

  it('fetches single post by slug correctly', () => {
    const post = getBlogPostBySlug('master-mental-addition-compensation-strategy');
    expect(post).toBeTruthy();
    expect(post.title).toContain('Compensation Strategy');
    expect(post.slug).toBe('master-mental-addition-compensation-strategy');

    const nonExistent = getBlogPostBySlug('non-existent-article-slug');
    expect(nonExistent).toBeNull();
  });

  it('returns a featured post', () => {
    const featured = getFeaturedPost();
    expect(featured).toBeTruthy();
    expect(featured.title).toBeTruthy();
    expect(featured.slug).toBeTruthy();
  });

  it('extracts categories with "All" included', () => {
    const categories = getBlogCategories();
    expect(categories).toContain('All');
    expect(categories.length).toBeGreaterThan(1);
    expect(categories).toContain('Mental Math');
  });

  it('computes read time and excerpt correctly', () => {
    const readTime = getReadTime('word '.repeat(450));
    expect(readTime).toBe('3 min read');

    const excerpt = getExcerpt({
      content_markdown: '## Heading\n\nThis is sentence one. This is sentence two. This is sentence three.'
    });
    expect(excerpt).toBe('This is sentence one. This is sentence two.');
  });
});

describe('Blog SEO & Structured Data', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('updates document SEO and JSON-LD for Blog Index', () => {
    const posts = getAllBlogPosts();
    updateBlogIndexSeo(posts);

    expect(document.title).toContain('Kibo Climb Blog');

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toBe('https://kiboclimb.com/blog');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).toBeTruthy();

    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl.getAttribute('content')).toBe('https://kiboclimb.com/blog');

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard.getAttribute('content')).toBe('summary_large_image');

    const jsonLd = document.getElementById('blog-index-jsonld');
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd.textContent);
    expect(parsed['@type']).toBe('Blog');
    expect(parsed.url).toBe('https://kiboclimb.com/blog');
    expect(Array.isArray(parsed.blogPost)).toBe(true);
    expect(parsed.blogPost.length).toBeGreaterThan(0);
  });

  it('updates document SEO and JSON-LD for single Blog Post', () => {
    const post = getBlogPostBySlug('master-mental-addition-compensation-strategy');
    updateBlogPostSeo(post);

    expect(document.title).toContain(post.title);

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.getAttribute('href')).toBe(`https://kiboclimb.com/blog/${post.slug}`);

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType.getAttribute('content')).toBe('article');

    const jsonLd = document.getElementById('blog-post-jsonld');
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd.textContent);
    expect(parsed['@type']).toBe('BlogPosting');
    expect(parsed.headline).toBe(post.title);
  });
});

describe('Navigation History Blog Routes', () => {
  it('generates path for BLOG_INDEX and BLOG_POST', () => {
    expect(getPathForId(VIEWS.BLOG_INDEX)).toBe('/blog');
    expect(getPathForId(VIEWS.BLOG_POST, { slug: 'test-article' })).toBe('/blog/test-article');
  });

  it('normalizes blog entries correctly', () => {
    const indexEntry = normalizeEntry({ id: VIEWS.BLOG_INDEX, path: '/blog' });
    expect(indexEntry.path).toBe('/blog');
    expect(indexEntry.id).toBe(VIEWS.BLOG_INDEX);

    const postEntry = normalizeEntry({ id: VIEWS.BLOG_POST, path: '/blog/sample-slug' });
    expect(postEntry.params.slug).toBe('sample-slug');
  });
});
