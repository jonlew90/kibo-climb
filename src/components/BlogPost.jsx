import React, { useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Tag, Sparkles, Mountain, BookOpen, Clock, ChevronRight, Compass } from 'lucide-react';
import { soundFx } from '../utils/audio';

// Dynamically glob all JSON articles in src/content/blog/
const blogModules = import.meta.glob('../content/blog/*.json', { eager: true });

function renderMarkdown(mdText) {
  if (!mdText) return null;
  const blocks = mdText.split(/\n\n+/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // H2 header
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-8 mb-3 flex items-center gap-2">
          <span className="w-2 h-6 bg-amber-500 rounded-full inline-block"></span>
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }

    // H3 header
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight mt-6 mb-2">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n/).map(line => line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={idx} className="my-4 space-y-2 list-none pl-2">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-sm sm:text-base font-medium">
              <span className="w-2 h-2 mt-2 bg-amber-500 rounded-full shrink-0"></span>
              <span>{formatInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split(/\n/).map(line => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
      return (
        <ol key={idx} className="my-4 space-y-2 pl-2">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-sm sm:text-base font-medium">
              <span className="font-black text-amber-600 shrink-0 w-5">{itemIdx + 1}.</span>
              <span>{formatInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Standard paragraph
    return (
      <p key={idx} className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium my-4">
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  });
}

function formatInlineMarkdown(text) {
  if (!text) return '';
  // Split on bold formatting: **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-black text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
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

  const handleBack = () => {
    soundFx?.playKeyTap?.();
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handlePlayCta = () => {
    soundFx?.playKeyTap?.();
    if (onNavigate) {
      onNavigate('/', 'adaptive_session');
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  if (!post) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
        <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-sm font-bold text-slate-600">Kibo Climb Blog</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-sm border-2 border-slate-200 space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <Compass className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Article Not Found</h1>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              We couldn't find the article you were looking for. It may have been moved or updated.
            </p>
            <button
              type="button"
              onClick={handlePlayCta}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Mountain className="w-5 h-5" />
              <span>Start Climbing</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const featuredImg = post.featured_asset ? `/images/blog/${post.featured_asset}` : null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <BookOpen className="w-5 h-5 text-amber-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight line-clamp-1">Kibo Climb Blog</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePlayCta}
          className="text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-full shadow-xs active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Play</span>
        </button>
      </header>

      {/* FULLSCREEN SCROLLABLE ARTICLE BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ARTICLE HERO CARD */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-slate-200 space-y-6">
          {/* Tags & Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {Array.isArray(post.tags) && post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-extrabold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1"
              >
                <Tag className="w-3 h-3 text-amber-600" />
                {tag}
              </span>
            ))}
            {post.published_at && (
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 ml-auto">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          {/* Featured Image */}
          {featuredImg && (
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner">
              <img
                src={featuredImg}
                alt={post.title}
                className="w-full h-auto max-h-80 object-cover object-center"
                loading="lazy"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-slate max-w-none pt-2 border-t border-slate-100">
            {renderMarkdown(post.content_markdown)}
          </div>

          {/* CALL TO ACTION CARD */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-800 font-black text-base">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Ready to start climbing?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                Join Kibo the red panda for adaptive math practice, daily streaks, and peak summit rewards!
              </p>
            </div>
            <button
              type="button"
              onClick={handlePlayCta}
              className="shrink-0 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2 text-sm"
            >
              <span>Play Kibo Climb</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}
