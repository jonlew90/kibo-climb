import React, { useState, useEffect, useMemo } from 'react';
import { soundFx } from '../utils/audio';
import { WORKSHEET_CATALOG, getBestWorksheetForTier, KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator.js';
import { getBlogPostBySlug, getAdjacentBlogPosts, formatDate } from '../utils/blogLoader';
import { updateBlogPostSeo } from '../utils/seoMetadata';
import { ChevronRight, ArrowLeft, ArrowRight, Copy, Check, Share2 } from 'lucide-react';
import SocialFollowStrip from './SocialFollowStrip';

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
  // Strip internal SEO guidelines directives & HTML comment placeholders before displaying
  const cleanMd = mdText
    .replace(/:::seo-guidelines:::[\s\S]*?:::seo-guidelines:::/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
  const blocks = cleanMd.split(/\n\n+/);

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

    if (trimmed.startsWith('> ') || trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/gm, '').trim();
      return (
        <blockquote key={idx}>
          <p>{formatInlineMarkdown(quoteText, onNavigate)}</p>
        </blockquote>
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

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (e, code) => {
    if (e) e.stopPropagation();
    soundFx?.playKeyTap?.();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }).catch(() => {});
    }
  };

  const handleShareCode = async (e, postData) => {
    if (e) e.stopPropagation();
    soundFx?.playKeyTap?.();
    const code = postData.promo_drop?.code;
    const shareUrl = `${window.location.origin}/?action=workshop&promo=${encodeURIComponent(code)}`;
    const shareText = `Use secret reader code ${code} on Kibo Climb for +${postData.promo_drop?.sparks || 100} bonus Sparks! 🏔️🐾`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kibo Climb: ${postData.title}`,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback: copy shareable link to clipboard
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }).catch(() => {});
    }
  };

  const { prev: prevPost, next: nextPost } = useMemo(() => {
    return getAdjacentBlogPosts(slug);
  }, [slug]);

  return (
    <div className="blog-page-wrapper fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B] flex flex-col selection:bg-orange-200">
      {/* Global Nav Bar (Consistent with Worksheets Hub & App) */}
      <header className="border-b border-orange-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a
            href="/"
            onClick={(e) => handleNavigateTo('/', e)}
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
              onClick={(e) => handleNavigateTo('/worksheets', e)}
              className="text-sm font-bold text-slate-600 hover:text-orange-600 px-2 py-1.5 rounded-xl transition-colors"
            >
              Worksheets
            </a>
            <a
              href="/blog"
              onClick={(e) => handleNavigateTo('/blog', e)}
              className="text-sm font-bold text-slate-600 hover:text-orange-600 px-2 py-1.5 rounded-xl transition-colors"
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

      <main className="article-container">
        {/* Breadcrumbs Navigation - Starts with Blog Home */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 mb-5">
          <a
            href="/blog"
            onClick={(e) => handleNavigateTo('/blog', e)}
            className="hover:text-orange-600 transition-colors inline-flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Blog</span>
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-orange-600 font-black truncate max-w-[240px] sm:max-w-none">{post.title}</span>
        </nav>

        <h1>{post.title}</h1>
        <div className="date">Published {formatDate(post.published_at)} • {post.topic || 'Adaptive Math Strategies'}</div>

        <img src={featuredImg} alt={post.title} className="hero-img" />

        <article>
          {renderMarkdown(post.content_markdown, onNavigate)}

          {post.promo_drop && post.promo_drop.code && (
            <div className="blog-promo-drop-card my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                      🎁 Secret Reader Reward
                    </span>
                    <span className="text-xs font-bold text-amber-800">
                      ⚡ +{post.promo_drop.sparks || 100} Sparks &amp; Power-Ups
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 m-0">
                    {post.promo_drop.title || 'Claim Your Reader Drop'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-sm text-slate-600 font-medium">Use secret code:</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, post.promo_drop.code)}
                      className="group inline-flex items-center gap-1.5 font-mono font-black text-sm bg-white hover:bg-amber-50 active:scale-95 px-3 py-1 rounded-xl border-2 border-amber-300 hover:border-amber-400 text-amber-950 transition-all cursor-pointer shadow-xs"
                      title="Click to copy code"
                    >
                      <span>{post.promo_drop.code}</span>
                      {copiedCode ? (
                        <span className="inline-flex items-center text-xs font-sans font-bold text-emerald-600 gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleShareCode(e, post)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-amber-50/80 active:scale-95 border-2 border-amber-300 text-amber-900 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex-1 sm:flex-initial"
                    title="Share reward code with friends"
                  >
                    <Share2 className="w-4 h-4 text-amber-600" />
                    <span>Share</span>
                  </button>

                  <a
                    href={`/?action=workshop&promo=${encodeURIComponent(post.promo_drop.code)}`}
                    onClick={handlePlayCta}
                    className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm px-5 sm:px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer no-underline flex-1 sm:flex-initial text-center"
                  >
                    <span>Redeem in Game →</span>
                  </a>
                </div>
              </div>
            </div>
          )}

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
                className="worksheet-cta-button cursor-pointer"
              >
                Download Printable Worksheet &amp; Key →
              </a>
            </div>
          )}
        </article>

        {/* Previous & Next Article Sequential Navigation */}
        {(prevPost || nextPost) && (
          <nav aria-label="Related Articles" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 pt-6 border-t border-orange-100">
            {prevPost ? (
              <a
                href={`/blog/${prevPost.slug}`}
                onClick={(e) => handleNavigateTo(`/blog/${prevPost.slug}`, e)}
                className="group flex flex-col justify-between p-4 bg-white rounded-2xl border-2 border-slate-200/80 hover:border-orange-400 transition-all shadow-2xs hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-orange-500" />
                  <span>Previous Article</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-600 line-clamp-2 transition-colors">
                  {prevPost.title}
                </h4>
              </a>
            ) : <div className="hidden sm:block" />}

            {nextPost && (
              <a
                href={`/blog/${nextPost.slug}`}
                onClick={(e) => handleNavigateTo(`/blog/${nextPost.slug}`, e)}
                className="group flex flex-col justify-between p-4 bg-white rounded-2xl border-2 border-slate-200/80 hover:border-orange-400 transition-all shadow-2xs hover:shadow-md cursor-pointer text-left sm:text-right"
              >
                <div className="flex items-center sm:justify-end gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                  <span>Next Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-orange-500" />
                </div>
                <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-600 line-clamp-2 transition-colors">
                  {nextPost.title}
                </h4>
              </a>
            )}
          </nav>
        )}

        <SocialFollowStrip className="my-8" title="Follow Kibo Climb on Social &amp; RSS" />

        <section className="cta-card">
          <h3>Turn Math Practice Into a Mountain Adventure</h3>
          <p>Help Kibo summit Mount Kilimanjaro by tackling mental math shortcuts, adaptive levels, and skill-building challenges tailored directly to your student.</p>
          <a href="/" onClick={handlePlayCta} className="cta-button">Start the Climb - Free to Play</a>
        </section>
      </main>

      {/* Standard Footer */}
      <footer className="border-t border-orange-100 bg-white py-8 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 Kibo Climb. Adaptive math practice, mental arithmetic strategies &amp; printable worksheets for K–8 learners.</p>
          <div className="flex justify-center gap-4 text-slate-600 font-bold">
            <a href="/" onClick={(e) => handleNavigateTo('/', e)} className="hover:text-orange-600">Game</a>
            <a href="/worksheets" onClick={(e) => handleNavigateTo('/worksheets', e)} className="hover:text-orange-600">Worksheets</a>
            <a href="/blog" onClick={(e) => handleNavigateTo('/blog', e)} className="hover:text-orange-600">Blog</a>
            <a href="/privacy" onClick={(e) => handleNavigateTo('/privacy', e)} className="hover:text-orange-600">Privacy</a>
            <a href="/terms" onClick={(e) => handleNavigateTo('/terms', e)} className="hover:text-orange-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

