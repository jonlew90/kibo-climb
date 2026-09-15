import React, { useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { WORKSHEET_CATALOG, getBestWorksheetForTier } from '../utils/worksheetGenerator.js';
import { getBlogPostBySlug, formatDate } from '../utils/blogLoader';
import { updateBlogPostSeo } from '../utils/seoMetadata';
import '../../public/css/blog.css';

function formatInlineMarkdown(text, onNavigate) {
  if (!text) return '';
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isInternal = href.startsWith('/');
      return (
        <a
          key={index}
          href={href}
          onClick={(e) => {
            if (isInternal) {
              e.preventDefault();
              soundFx?.playKeyTap?.();
              if (onNavigate) {
                onNavigate(href);
              } else {
                window.history.pushState({}, '', href);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }
          }}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

function renderMarkdown(mdText, onNavigate) {
  if (!mdText) return null;
  const blocks = mdText.split(/\n\n+/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx}>{formatInlineMarkdown(trimmed.replace(/^###\s+/, ''), onNavigate)}</h3>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx}>{formatInlineMarkdown(trimmed.replace(/^##\s+/, ''), onNavigate)}</h2>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n/).map(line => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={idx}>
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{formatInlineMarkdown(item, onNavigate)}</li>
          ))}
        </ul>
      );
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split(/\n/).map(line => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
      return (
        <ol key={idx}>
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{formatInlineMarkdown(item, onNavigate)}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={idx}>{formatInlineMarkdown(trimmed, onNavigate)}</p>
    );
  });
}

export default function BlogPost({ slug, onBack, onNavigate }) {
  // Find article dynamically
  const post = useMemo(() => {
    return getBlogPostBySlug(slug);
  }, [slug]);

  useEffect(() => {
    if (post) {
      updateBlogPostSeo(post);
    } else {
      document.title = 'Kibo Climb Blog – Math Strategies & Adaptive Learning';
    }
  }, [post]);

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleNavigateTo = (path, e) => {
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

  if (!post) {
    return (
      <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B]">
        <nav className="nav-bar">
          <a href="/" onClick={(e) => handleNavigateTo('/', e)} className="nav-logo">
            <img src="/favicon.svg" alt="Kibo Red Panda" width="28" height="28" />
            <span>Kibo Climb</span>
          </a>
          <a href="/" onClick={handlePlayCta} className="nav-cta">
            Play Free
          </a>
        </nav>

        <main className="article-container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <h1>Article Not Found</h1>
          <p>We couldn't find the article you were looking for. It may have been moved or updated.</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/blog" onClick={(e) => handleNavigateTo('/blog', e)} className="blog-filter-pill active">
              ← Return to Blog
            </a>
            <a href="/" onClick={handlePlayCta} className="cta-button">
              Start the Climb
            </a>
          </div>
        </main>
      </div>
    );
  }

  const featuredImg = post.featured_asset ? `/images/blog/${post.featured_asset}` : '/images/blog/kibo-climbing.jpeg';

  const relatedWorksheet = useMemo(() => {
    if (post.worksheet_slug) {
      const match = WORKSHEET_CATALOG.find(w => w.slug === post.worksheet_slug);
      if (match) return match;
    }
    const subject = post.subject || 'math';
    const tier = Number(post.tier) || 1;
    return getBestWorksheetForTier(subject, tier);
  }, [post]);

  const handleWorksheetClick = (e, worksheet) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    const url = `/worksheets/${worksheet.subject}/${worksheet.slug}`;
    if (onNavigate) {
      onNavigate(url);
    } else {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B]">
      <nav className="nav-bar">
        <a href="/" onClick={(e) => handleNavigateTo('/', e)} className="nav-logo">
          <img src="/favicon.svg" alt="Kibo Red Panda" width="28" height="28" />
          <span>Kibo Climb</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/worksheets"
            onClick={(e) => handleNavigateTo('/worksheets', e)}
            className="hidden sm:inline-flex text-sm font-bold text-[#64748B] hover:text-[#FF6B35] transition-colors"
          >
            Worksheets
          </a>
          <a
            href="/blog"
            onClick={(e) => handleNavigateTo('/blog', e)}
            className="hidden sm:inline-flex text-sm font-bold text-[#64748B] hover:text-[#FF6B35] transition-colors"
          >
            All Articles
          </a>
          <a href="/" onClick={handlePlayCta} className="nav-cta">
            Play Free
          </a>
        </div>
      </nav>

      <main className="article-container">
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="blog-breadcrumbs">
          <a href="/" onClick={(e) => handleNavigateTo('/', e)}>
            <span>Home</span>
          </a>
          <span className="crumb-separator" aria-hidden="true">&gt;</span>
          <a href="/blog" onClick={(e) => handleNavigateTo('/blog', e)}>
            <span>Blog</span>
          </a>
          <span className="crumb-separator" aria-hidden="true">&gt;</span>
          <span className="current-crumb truncate max-w-[240px] sm:max-w-none">{post.title}</span>
        </nav>

        <h1>{post.title}</h1>
        <div className="date">Published {formatDate(post.published_at)} • {post.topic || 'Adaptive Math Strategies'}</div>

        <img src={featuredImg} alt={post.title} className="hero-img" />

        <article>
          {renderMarkdown(post.content_markdown, onNavigate)}

          {relatedWorksheet && (
            <div className="worksheet-callout-card">
              <div className="worksheet-callout-header">
                <span>🎯 Free Printable Practice</span>
                <span>•</span>
                <span>{relatedWorksheet.gradeLabel || 'Grades K–6'}</span>
              </div>
              <h3>Practice This Skill: {relatedWorksheet.title}</h3>
              <p>{relatedWorksheet.desc || 'Reinforce this strategy offline with 16 targeted curriculum problems and a complete parent answer key.'}</p>
              <a
                href={`/worksheets/${relatedWorksheet.subject}/${relatedWorksheet.slug}`}
                onClick={(e) => handleWorksheetClick(e, relatedWorksheet)}
                className="worksheet-cta-button"
              >
                Download Printable Worksheet &amp; Key →
              </a>
            </div>
          )}
        </article>

        <section className="cta-card">
          <h3>Turn Math Practice Into a Mountain Adventure</h3>
          <p>Help Kibo summit Mount Kilimanjaro by tackling mental math shortcuts, adaptive levels, and skill-building challenges tailored directly to your student.</p>
          <a href="/" onClick={handlePlayCta} className="cta-button">Start the Climb - Free to Play</a>
        </section>
      </main>
    </div>
  );
}

