import React, { useState, useMemo } from 'react';
import { getAllTipsAndStrategies } from '../utils/tipsCatalog';
import { KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { Sparkles, ArrowRight, ChevronRight, Zap, Lightbulb, BookOpen } from 'lucide-react';
import SocialFollowStrip from './SocialFollowStrip';

export default function TipsHubScreen({ onBack, onNavigate }) {
  const [selectedSubject, setSelectedSubject] = useState('all');

  const allCheats = useMemo(() => getAllTipsAndStrategies(), []);

  const subjects = [
    { id: 'all', name: 'All Strategies', icon: '🌟' },
    { id: 'math', name: 'Mental Math', icon: '🔢' },
    { id: 'words', name: 'Phonics & Words', icon: '📚' },
    { id: 'coding', name: 'Coding Logic', icon: '💻' },
    { id: 'world', name: 'Geography', icon: '🌍' }
  ];

  const filteredCheats = useMemo(() => {
    if (selectedSubject === 'all') return allCheats;
    return allCheats.filter(c => c.subject === selectedSubject);
  }, [allCheats, selectedSubject]);

  const handleNavigate = (path, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handlePlayCta = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onNavigate) {
      onNavigate('/', 'adaptive_session');
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B] flex flex-col selection:bg-orange-200">
      {/* Global Nav Bar (Consistent with /blog & /worksheets) */}
      <header className="border-b border-orange-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-2">
          <a
            href="/"
            onClick={(e) => handleNavigate('/', e)}
            className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer shrink-0 min-w-0"
          >
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
            />
            <span className="font-heading font-black text-sm sm:text-xl text-[#1E293B] tracking-tight whitespace-nowrap group-hover:text-orange-600 transition-colors">
              Kibo Climb
            </span>
          </a>

          <nav className="flex items-center gap-1 sm:gap-4 shrink-0">
            <a
              href="/tips"
              onClick={(e) => handleNavigate('/tips', e)}
              className="text-xs sm:text-sm font-black text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap"
            >
              Tips &amp; Tricks
            </a>
            <a
              href="/worksheets"
              onClick={(e) => handleNavigate('/worksheets', e)}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-orange-600 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap"
            >
              Worksheets
            </a>
            <a
              href="/blog"
              onClick={(e) => handleNavigate('/blog', e)}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-orange-600 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap"
            >
              Blog
            </a>
            <a
              href="/"
              onClick={handlePlayCta}
              className="ml-0.5 sm:ml-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[11px] sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Play Free
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-4 space-y-3 sm:space-y-4">
        {/* Hero Banner (Compact, matching WorksheetHubScreen) */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white p-3 sm:p-5 shadow-md border border-orange-500/30">
          <div className="relative z-10 max-w-3xl space-y-1 sm:space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-amber-100 text-[9px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-200 fill-current" />
                <span>Interactive Ascent Cheat-Sheets</span>
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-heading font-black tracking-tight leading-snug">
              Fast Formulas &amp; Mental Shortcuts
            </h1>
            <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium leading-relaxed">
              Quick interactive strategy cards for Kibo Math, Words, Coding, and World geography. Practice formulas with live shortcuts, then read the complete guide on our blog.
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-10 sm:opacity-15 translate-x-8 translate-y-4 pointer-events-none w-28 h-28 sm:w-36 sm:h-36">
            <div dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }} />
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center gap-2 py-1 pb-2 sm:pb-0" role="tablist" aria-label="Strategy subjects">
          {subjects.map((s) => {
            const isActive = selectedSubject === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedSubject(s.id);
                }}
                className={`text-xs sm:text-sm font-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Strategy Cheat-Sheet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredCheats.map(cheat => {
            const subjectStyles = {
              math: { badge: 'bg-blue-50 text-blue-700 border-blue-200/80', code: 'text-blue-900 bg-blue-50/70 border-blue-200' },
              words: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', code: 'text-emerald-900 bg-emerald-50/70 border-emerald-200' },
              coding: { badge: 'bg-amber-50 text-amber-700 border-amber-200/80', code: 'text-amber-900 bg-amber-50/70 border-amber-200' },
              world: { badge: 'bg-purple-50 text-purple-700 border-purple-200/80', code: 'text-purple-900 bg-purple-50/70 border-purple-200' }
            };
            const currentStyle = subjectStyles[cheat.subject] || { badge: 'bg-orange-50 text-orange-700 border-orange-200/80', code: 'text-orange-900 bg-orange-50/70 border-orange-200' };

            return (
              <article
                key={cheat.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-orange-300/80 relative overflow-hidden group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${currentStyle.badge} flex items-center gap-1.5`}>
                      <span>{cheat.subjectIcon}</span>
                      <span>{cheat.tag || cheat.subjectName}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                      Tier {cheat.tier || 1}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      {cheat.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                      {cheat.shortRule}
                    </p>
                  </div>

                  {/* Formula / Interactive Card Box */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                    <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-500" /> Quick Mental Formula
                    </span>
                    <div className={`font-mono text-xs sm:text-sm font-bold p-2.5 rounded-lg border overflow-x-auto ${currentStyle.code}`}>
                      {cheat.formula}
                    </div>
                    {cheat.keyTakeaway && (
                      <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic pt-0.5">
                        💡 {cheat.keyTakeaway}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer linking directly to the full blog post deep-dive */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Want the full walkthrough?
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleNavigate(`/blog/${cheat.blogSlug}`, e)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Global Social & Newsletter Strip */}
        <div className="pt-6 sm:pt-10">
          <SocialFollowStrip />
        </div>
      </main>
    </div>
  );
}

