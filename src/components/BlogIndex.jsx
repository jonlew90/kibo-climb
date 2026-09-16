import React, { useState, useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { getAllBlogPosts, getBlogCategories, getFeaturedPost } from '../utils/blogLoader';
import { updateBlogIndexSeo } from '../utils/seoMetadata';
import { KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { Sparkles, BookOpen, ArrowRight, FileText, Compass, ChevronRight } from 'lucide-react';
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
    <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B] flex flex-col selection:bg-orange-200">
      {/* Global Nav Bar (Consistent with Worksheets Hub & App) */}
      <header className="border-b border-orange-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a
            href="/"
            onClick={(e) => navigateTo('/', e)}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
            />
            <span className="font-heading font-black text-lg sm:text-xl text-[#1E293B] tracking-tight whitespace-nowrap group-hover:text-orange-600 transition-colors">
              Kibo Climb
            </span>
          </a>

          <nav className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <a
              href="/worksheets"
              onClick={handleWorksheetCta}
              className="text-sm font-bold text-slate-600 hover:text-orange-600 px-2 py-1.5 rounded-xl transition-colors"
            >
              Worksheets
            </a>
            <a
              href="/blog"
              onClick={(e) => navigateTo('/blog', e)}
              className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              Blog
            </a>
            <a
              href="/"
              onClick={handlePlayCta}
              className="ml-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Play Free
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Banner (Compact on mobile, matching WorksheetHubScreen) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white p-4 sm:p-10 shadow-lg border border-orange-500/30">
          <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/15 backdrop-blur-xs text-amber-100 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200" />
              <span>Kibo Learning Hub</span>
            </div>
            <h1 className="text-xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
              Math Strategies, Mental Tricks &amp; Parent Guides
            </h1>
            <p className="hidden sm:block text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed">
              Discover expert mental math shortcuts, adaptive learning strategies, and printable resources designed to turn everyday arithmetic into an exciting mountain adventure.
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-10 sm:opacity-20 translate-x-12 translate-y-8 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <div dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }} />
          </div>
        </div>

        {/* Quick Category Filter Pills - Wrapped on desktop, scrollable rail on mobile */}
        <div className="flex items-center overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center gap-2 py-1 pb-2 sm:pb-0" role="tablist" aria-label="Article categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category}
              className={`text-xs sm:text-sm font-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
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
