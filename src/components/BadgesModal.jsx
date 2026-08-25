import React, { useState, useEffect, useRef } from 'react';
import { Lock, Sparkles, ArrowLeft, CheckCircle2, Trophy, Flame, Zap, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { BADGES_CATALOG, BADGE_CATEGORIES } from '../data/badges';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { SUBJECTS_CONFIG } from '../config/subjects';
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
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Personal Bests & Mountain Stats Grid */}
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-4 space-y-3 shrink-0 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-purple-600 stroke-[2.5]" />
              Personal Bests & Mountain Stats
            </span>
            <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Active Records
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-center">
            {/* Best Question Streak */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-2.5 flex flex-col justify-between items-center shadow-2xs">
              <div className="flex items-center gap-1 text-orange-900 text-xs font-black uppercase">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> Best Streak
              </div>
              <span className="text-xl font-black text-orange-600 my-1">
                {bestStreak > 0 ? `${bestStreak} Qs` : '—'}
              </span>
              <span className="text-[10px] font-bold text-orange-800/80">Unbroken correct</span>
            </div>

            {/* Fastest Flawless Climb */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-2.5 flex flex-col justify-between items-center shadow-2xs">
              <div className="flex items-center gap-1 text-amber-900 text-xs font-black uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Fastest Flawless
              </div>
              <span className="text-xl font-black text-amber-600 my-1">
                {fastestTime ? `${fastestTime}s` : '—'}
              </span>
              <span className="text-[10px] font-bold text-amber-800/80">12/12 perfect run</span>
            </div>

            {/* Flawless Climbs */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 flex flex-col justify-between items-center shadow-2xs">
              <div className="flex items-center gap-1 text-emerald-900 text-xs font-black uppercase">
                <Target className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Flawless Climbs
              </div>
              <span className="text-xl font-black text-emerald-600 my-1">
                {perfectRuns > 0 ? `${perfectRuns}` : '0'}
              </span>
              <span className="text-[10px] font-bold text-emerald-800/80">100% accuracy</span>
            </div>

            {/* Total Questions Conquered */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-2.5 flex flex-col justify-between items-center shadow-2xs">
              <div className="flex items-center gap-1 text-sky-900 text-xs font-black uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Questions Solved
              </div>
              <span className="text-xl font-black text-sky-700 my-1">
                {userState.totalProblemsSolved || 0}
              </span>
              <span className="text-[10px] font-bold text-sky-800/80">Across mountain</span>
            </div>

            {/* Summits Reached */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-2.5 flex flex-col justify-between items-center shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-indigo-900 text-xs font-black uppercase">
                <span>🏔️</span> Summits Reached
              </div>
              <span className="text-xl font-black text-indigo-700 my-1">
                {userState.sprintHistory?.length || userState.completedClimbsCount || 0}
              </span>
              <span className="text-[10px] font-bold text-indigo-800/80">Completed blocks</span>
            </div>
          </div>
        </div>

        {/* Compact rating + progress bar */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-3xl p-4 space-y-3 shrink-0 text-left">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-300" />
              Trail Badges
            </span>
            <span className="bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300 text-xs font-black text-amber-950">
              {unlockedCount} / {totalBadges} <span className="opacity-75 font-bold">({progressPct}%)</span>
            </span>
          </div>

          <div className="w-full bg-amber-200/60 h-3.5 rounded-full overflow-hidden border border-amber-300">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Multi-Subject Competence Ranks */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {Object.keys(SUBJECTS_CONFIG).map((subKey) => {
              const cfg = SUBJECTS_CONFIG[subKey];
              const subData = storageService.getUserData(subKey);
              const subRating = subData.adaptiveCompetenceRating || subData.competenceRank || 1000;
              const rankName = getCompetenceRankTier(subRating, subKey);

              return (
                <span
                  key={subKey}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full border border-amber-200/90 bg-white/90 text-slate-800 shadow-2xs transition-all"
                  title={`${cfg.name} Competence Rank: ${subRating} pts (${rankName})`}
                >
                  <span>{cfg.icon}</span>
                  <span className="text-slate-900 font-extrabold">{cfg.name}:</span>
                  <span className="text-purple-900 font-bold">{rankName}</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">({subRating})</span>
                </span>
              );
            })}
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
              className={`py-1.5 px-3.5 text-xs font-extrabold rounded-full shrink-0 transition-colors cursor-pointer ${
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
                  className={`py-1.5 px-3.5 text-xs font-extrabold rounded-full shrink-0 transition-colors cursor-pointer ${
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
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border inline-block mt-0.5 ${
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
