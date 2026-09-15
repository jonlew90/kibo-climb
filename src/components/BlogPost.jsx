import React, { useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { WORKSHEET_CATALOG, getBestWorksheetForTier } from '../utils/worksheetGenerator.js';
import '../../public/css/blog.css';

// Dynamically glob all JSON articles in src/content/blog/
const blogModules = import.meta.glob('../content/blog/*.json', { eager: true });

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
  // Find article by matching slug or filename
  const post = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
    for (const path in blogModules) {
      const data = blogModules[path]?.default || blogModules[path];
      if (data) {
        if (data.slug === cleanSlug) return data;
        const fileMatch = path.match(/([^/]+)\.json$/);
        if (fileMatch && fileMatch[1].toLowerCase() === cleanSlug) return data;
      }
    }
    return null;
  }, [slug]);

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} | Kibo Climb Blog`;
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

  const formatDate = (isoString) => {
    if (!isoString) return 'September 14, 2026';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return isoString.slice(0, 10);
    }
  };

  if (!post) {
    return (
      <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B]">
        <nav className="nav-bar">
          <a href="/" onClick={handleBack} className="nav-logo">
            <img src="/favicon.svg" alt="Kibo" width="28" height="28" />
            <span>Kibo Climb</span>
          </a>
          <a href="/" onClick={handlePlayCta} className="nav-cta">
            Play Free
          </a>
        </nav>

        <main className="article-container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <h1>Article Not Found</h1>
          <p>We couldn't find the article you were looking for. It may have been moved or updated.</p>
          <div style={{ marginTop: '2rem' }}>
            <a href="/" onClick={handlePlayCta} className="cta-button">
              Start the Climb - Free to Play
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
        <a href="/" onClick={handleBack} className="nav-logo">
          <img src="/favicon.svg" alt="Kibo" width="28" height="28" />
          <span>Kibo Climb</span>
        </a>
        <a href="/" onClick={handlePlayCta} className="nav-cta">
          Play Free
        </a>
      </nav>

      <main className="article-container">
        <h1>{post.title}</h1>
        <div className="date">Published {formatDate(post.published_at)} • Adaptive Math Strategies</div>

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
                Download Printable Worksheet & Key →
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
