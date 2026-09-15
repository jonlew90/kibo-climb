import React, { useState, useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { getAllBlogPosts, getBlogCategories, getFeaturedPost } from '../utils/blogLoader';
import { updateBlogIndexSeo } from '../utils/seoMetadata';
import { Sparkles, BookOpen, ArrowRight, FileText, Compass } from 'lucide-react';
import '../../public/css/blog.css';

const POSTS_PER_PAGE = 12;

export default function BlogIndex({ onBack, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Ingest all posts dynamically and sort chronologically
  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const categories = useMemo(() => getBlogCategories(allPosts), [allPosts]);
  const featuredPost = useMemo(() => getFeaturedPost(allPosts), [allPosts]);

  // Filter posts based on selected category pill
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') {
      return allPosts;
    }
    const catLower = selectedCategory.toLowerCase();
    return allPosts.filter(p => {
      const tagMatch = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(catLower) || catLower.includes(t.toLowerCase()));
      const topicMatch = p.topic && (p.topic.toLowerCase().includes(catLower) || catLower.includes(p.topic.toLowerCase()));
      const subjectMatch = p.subject && p.subject.toLowerCase() === catLower;
      return tagMatch || topicMatch || subjectMatch;
    });
  }, [allPosts, selectedCategory]);

  // Feed posts for the grid
  const gridPosts = useMemo(() => {
    if (selectedCategory === 'All' && featuredPost) {
      // Exclude featured post from grid to avoid immediate duplicate on default view
      return filteredPosts.filter(p => p.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, selectedCategory, featuredPost]);

  // Paginated/Visible slice of grid posts
  const visiblePosts = useMemo(() => {
    return gridPosts.slice(0, visibleCount);
  }, [gridPosts, visibleCount]);

  // Update SEO Meta and JSON-LD structured data on mount
  useEffect(() => {
    updateBlogIndexSeo(allPosts);
  }, [allPosts]);

  // Helper for internal navigation
  const navigateTo = (path, e) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handlePlayCta = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    if (onNavigate) {
      onNavigate('/', 'adaptive_session');
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleWorksheetCta = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    const targetUrl = '/worksheets';
    if (onNavigate) {
      onNavigate(targetUrl);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleCategorySelect = (category) => {
    soundFx?.playKeyTap?.();
    setSelectedCategory(category);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleLoadMore = () => {
    soundFx?.playKeyTap?.();
    setVisibleCount(prev => prev + POSTS_PER_PAGE);
  };

  return (
    <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B]">
      {/* Top Global Navigation Bar */}
      <nav className="nav-bar">
        <a href="/" onClick={(e) => navigateTo('/', e)} className="nav-logo">
          <img src="/favicon.svg" alt="Kibo Red Panda" width="28" height="28" />
          <span>Kibo Climb</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/worksheets"
            onClick={handleWorksheetCta}
            className="hidden sm:inline-flex text-sm font-bold text-[#0F766E] hover:text-[#0D9488] transition-colors"
          >
            Worksheets
          </a>
          <a href="/" onClick={handlePlayCta} className="nav-cta">
            Play Free
          </a>
        </div>
      </nav>

      <main className="blog-index-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="blog-breadcrumbs">
          <a href="/" onClick={(e) => navigateTo('/', e)}>
            <span>Home</span>
          </a>
          <span className="crumb-separator" aria-hidden="true">&gt;</span>
          <span className="current-crumb">Blog</span>
          {selectedCategory !== 'All' && (
            <>
              <span className="crumb-separator" aria-hidden="true">&gt;</span>
              <span className="text-[#0F766E] font-bold">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Hero Header Section */}
        <header className="blog-header-section">
          <div className="blog-header-badge">
            <Sparkles size={14} className="text-[#FF6B35]" />
            <span>Kibo Learning Hub</span>
          </div>
          <h1 className="blog-main-title font-heading">
            Math Strategies, Mental Tricks &amp; Parent Guides
          </h1>
          <p className="blog-sub-title">
            Discover expert mental math shortcuts, adaptive learning strategies, and printable resources designed to turn everyday arithmetic into an exciting mountain adventure.
          </p>
        </header>

        {/* Quick Category Filter Pills */}
        <div className="blog-filter-bar" role="tablist" aria-label="Article categories">
          {categories.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={selectedCategory === category}
              className={`blog-filter-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article Hero (Top Hero - shown on "All" view) */}
        {selectedCategory === 'All' && featuredPost && (
          <section aria-label="Featured Article">
            <a
              href={`/blog/${featuredPost.slug}`}
              onClick={(e) => navigateTo(`/blog/${featuredPost.slug}`, e)}
              className="blog-featured-card group"
            >
              <div className="featured-img-container">
                <img
                  src={featuredPost.featured_asset ? `/images/blog/${featuredPost.featured_asset}` : '/images/blog/kibo-climbing.jpeg'}
                  alt={featuredPost.title}
                  className="featured-cover-img"
                  loading="eager"
                />
                <span className="featured-card-badge">
                  ⭐ Featured Guide
                </span>
              </div>
              <div className="featured-content">
                <div className="featured-meta">
                  <span>{featuredPost.topic || (featuredPost.tags && featuredPost.tags[0]) || 'Mental Math'}</span>
                  <span>•</span>
                  <span>{featuredPost.readTime || '3 min read'}</span>
                </div>
                <h2 className="featured-title font-heading">
                  {featuredPost.title}
                </h2>
                <p className="featured-excerpt">
                  {featuredPost.excerpt}
                </p>
                <div className="featured-footer">
                  <span className="featured-author-meta">
                    Published {featuredPost.formattedDate}
                  </span>
                  <span className="featured-cta-link">
                    Read Article <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </a>
          </section>
        )}

        {/* Article Grid / Feed Section */}
        <section aria-label="Article Feed">
          <div className="blog-grid-header">
            <h2 className="blog-grid-title font-heading">
              {selectedCategory === 'All' ? 'Latest Articles & Guides' : `${selectedCategory} Articles`}
            </h2>
            <span className="blog-grid-count">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {gridPosts.length === 0 ? (
            <div className="blog-empty-state">
              <BookOpen size={40} className="mx-auto text-[#94A3B8] mb-3" />
              <h3 className="font-heading">No articles found in this category</h3>
              <p>Try selecting "All" or choosing a different filter above.</p>
              <button
                onClick={() => handleCategorySelect('All')}
                className="blog-filter-pill active"
              >
                Show All Articles
              </button>
            </div>
          ) : (
            <div className="blog-grid">
              {visiblePosts.map((post) => {
                const coverImg = post.featured_asset ? `/images/blog/${post.featured_asset}` : '/images/blog/kibo-climbing.jpeg';
                const categoryBadge = (post.tags && post.tags[0]) || post.topic || 'Math Strategies';

                return (
                  <article key={post.slug} className="flex">
                    <a
                      href={`/blog/${post.slug}`}
                      onClick={(e) => navigateTo(`/blog/${post.slug}`, e)}
                      className="blog-card w-full group"
                    >
                      <div className="blog-card-img-wrap">
                        <img
                          src={coverImg}
                          alt={post.title}
                          className="blog-card-img"
                          loading="lazy"
                        />
                      </div>
                      <div className="blog-card-body">
                        <div className="blog-card-meta">
                          <span className="blog-category-badge">
                            {categoryBadge}
                          </span>
                          <span className="blog-card-date">
                            {post.formattedDate}
                          </span>
                        </div>
                        <h3 className="blog-card-title font-heading">
                          {post.title}
                        </h3>
                        <p className="blog-card-excerpt">
                          {post.excerpt}
                        </p>
                        <div className="blog-card-footer">
                          <span className="blog-read-time">
                            {post.readTime || '2 min read'}
                          </span>
                          <span className="blog-card-read-link">
                            Read Guide <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination / Load More */}
          {gridPosts.length > visibleCount && (
            <div className="blog-pagination-wrapper">
              <button
                onClick={handleLoadMore}
                className="blog-load-more-btn"
              >
                Load More Articles ({gridPosts.length - visibleCount} remaining)
              </button>
              <span className="blog-pagination-info">
                Showing {visibleCount} of {gridPosts.length} articles
              </span>
            </div>
          )}
        </section>

        {/* Worksheet Center Conversion Banner */}
        <section className="blog-worksheet-banner" aria-label="Printable Worksheets Promotion">
          <div className="worksheet-banner-icon" aria-hidden="true">
            📄
          </div>
          <div className="worksheet-banner-text">
            <h3 className="font-heading">Looking for Hands-On Practice?</h3>
            <p>
              Explore our free and printable math worksheets for all grade levels. Reinforce mental math, multiplication, and problem-solving with targeted offline practice and parent answer keys.
            </p>
          </div>
          <div>
            <a
              href="/worksheets"
              onClick={handleWorksheetCta}
              className="worksheet-banner-btn"
            >
              <FileText size={18} />
              <span>Visit Worksheet Center</span>
            </a>
          </div>
        </section>

        {/* Footer / Global Bridge to Core Learning App */}
        <section className="cta-card" aria-label="Start Learning Adventure">
          <div className="inline-flex items-center gap-2 bg-[#FFF0EB] text-[#E0531F] px-4 py-1.5 rounded-full font-bold text-sm mb-3">
            <Compass size={16} />
            <span>Interactive Learning Adventure</span>
          </div>
          <h3 className="font-heading">Turn Math Practice Into a Kilimanjaro Quest</h3>
          <p>
            Help Kibo the red panda summit Mount Kilimanjaro! Tackling adaptive math prompts, mental arithmetic shortcuts, and daily streak quests tailored directly to your student.
          </p>
          <a
            href="/"
            onClick={handlePlayCta}
            className="cta-button"
          >
            Start the Climb - Free to Play
          </a>
        </section>
      </main>
    </div>
  );
}
