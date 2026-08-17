import React, { useState, useEffect, useRef } from 'react';
import { Award, Lock, Sparkles, ArrowLeft, CheckCircle2, Trophy, Flame, Zap, Target, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { BADGES_CATALOG, BADGE_CATEGORIES } from '../data/badges';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';

export default function BadgesModal({
  activeSubject = 'math',
  isOpen,
  onClose,
  unlockedBadges = [],
  personalRecords = {},
  userState = {},
  renderFooter
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(checkScroll, 100);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleScrollLeft = () => {
    soundFx.playKeyTap();
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    soundFx.playKeyTap();
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  const handleCategoryWheel = (e) => {
    if (categoryScrollRef.current && e.deltaY !== 0) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  if (!isOpen) return null;

  const unlockedSet = new Set(unlockedBadges);
  const totalBadges = BADGES_CATALOG.length;
  const unlockedCount = unlockedSet.size;
  const progressPct = Math.round((unlockedCount / totalBadges) * 100);

  const userRating = userState.competenceRank || userState.adaptiveCompetenceRating || 1000;
  const bestStreak = personalRecords?.highestCorrectStreak || userState.cumulativeCorrectStreak || 0;
  const fastestTime = personalRecords?.fastest12QuestionsTime || personalRecords?.fastest10QuestionsTime || null;
  const perfectRuns = personalRecords?.mostPerfectSessions || 0;

  const recentUnlockedBadges = BADGES_CATALOG.filter((b) => unlockedSet.has(b.id)).slice(-3).reverse();
  const username = storageService.getUsername() || storageService.getActiveProfile()?.name || '';

  const filteredBadges = activeCategory === 'all'
    ? BADGES_CATALOG
    : BADGES_CATALOG.filter((b) => b.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800">
          <Trophy className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">My Trophies & Records</h2>
        </div>

        <div className="flex items-center gap-2">
          {username && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <User className="w-3 h-3" />{username}
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-black shadow-xs">
            <Award className="w-4 h-4 text-amber-700 stroke-[2.5]" />
            <span>{unlockedCount}/{totalBadges}</span>
          </div>
        </div>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Compact rating + progress bar */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-3xl p-4 space-y-2 shrink-0 text-left">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-300" />
              Trail Badges
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {getCompetenceRankTier(userRating, activeSubject)} · {userRating} pts
              </span>
              <span className="bg-amber-200 px-3 py-0.5 rounded-full border border-amber-300">
                {progressPct}% unlocked
              </span>
            </div>
          </div>

          <div className="w-full bg-amber-200/60 h-3.5 rounded-full overflow-hidden border border-amber-300">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>


        {/* Filter Category Bar */}
        <div className="relative flex items-center shrink-0">
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              className="absolute left-0 z-20 p-1 bg-white/90 text-slate-700 rounded-full shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
          )}

          <div
            ref={categoryScrollRef}
            onScroll={checkScroll}
            onWheel={handleCategoryWheel}
            style={{
              maskImage: canScrollRight ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'none',
              WebkitMaskImage: canScrollRight ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'none'
            }}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 shrink-0 w-full touch-pan-x"
          >
            <button
              onClick={() => {
                soundFx.playKeyTap();
                setActiveCategory('all');
              }}
              className={`py-2 px-4 text-xs font-extrabold rounded-2xl shrink-0 transition-colors ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🌟 All Badges ({unlockedCount}/{totalBadges})
            </button>

            {Object.entries(BADGE_CATEGORIES).map(([key, cat]) => {
              const catBadges = BADGES_CATALOG.filter((b) => b.category === key);
              const catUnlocked = catBadges.filter((b) => unlockedSet.has(b.id)).length;

              return (
                <button
                  key={key}
                  onClick={() => {
                    soundFx.playKeyTap();
                    setActiveCategory(key);
                  }}
                  className={`py-2 px-4 text-xs font-extrabold rounded-2xl shrink-0 transition-colors ${
                    activeCategory === key
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.icon} {cat.label} ({catUnlocked}/{catBadges.length})
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={handleScrollRight}
              className="absolute right-0 z-20 p-1 bg-white/90 text-slate-700 rounded-full shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>


        {/* Badge Grid Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-3.5 relative ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 shadow-inner ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-amber-600 text-amber-950 shadow-clay-amber'
                      : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex-1 text-left min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base truncate">{badge.title || badge.name}</h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-snug">
                    {badge.description}
                  </p>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border inline-block mt-0.5 ${
                    isUnlocked
                      ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                      : 'text-amber-800 bg-amber-100 border-amber-300'
                  }`}>
                    {isUnlocked ? `🎯 Earned: ${badge.reqText}` : `Target: ${badge.reqText}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
