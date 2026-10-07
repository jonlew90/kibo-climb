import React, { useState, useEffect, useRef } from 'react';
import { Lock, Sparkles, CheckCircle2, Trophy, Flame, Zap, Target, Compass, ChevronLeft, ChevronRight, Star, Mountain, Award, ArrowLeft } from 'lucide-react';
import { BADGES_CATALOG, BADGE_CATEGORIES } from '../data/badges';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { questService } from '../services/questService';
import { ASCENT_MODES, ASCENT_RANKS } from '../data/questsData';
import AscentRoadmapModal from './AscentRoadmapModal';
import AscentLevelHeroCard from './AscentLevelHeroCard';

function BadgeCategoryRow({
  catKey,
  category,
  badges,
  unlockedSet,
  unseenIdsSet,
  firstUnseenBadge,
  targetBadgeRef
}) {
  const rowScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkRowScroll = () => {
    if (!rowScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkRowScroll();
    const handleResize = () => checkRowScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [badges.length]);

  const handleScrollLeft = () => {
    soundFx?.playKeyTap?.();
    if (rowScrollRef.current) {
      rowScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    soundFx?.playKeyTap?.();
    if (rowScrollRef.current) {
      rowScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const unlockedCount = badges.filter((b) => unlockedSet.has(b.id)).length;
  const totalCount = badges.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // 1. Unlocked/Earned badges at the front, 2. Locked badges after
  const sortedBadges = [...badges].sort((a, b) => {
    const aUnlocked = unlockedSet.has(a.id);
    const bUnlocked = unlockedSet.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <section id={`badge-cat-row-${catKey}`} className="space-y-2 pt-1 scroll-mt-2">
      {/* Category Shelf Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl sm:text-2xl shrink-0">{category.icon}</span>
          <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
            {category.label} Badges
          </h3>
          <span className="text-[11px] sm:text-xs font-black text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs shrink-0">
            {unlockedCount}/{totalCount}
          </span>
          <div className="hidden sm:block w-16 md:w-20 bg-slate-200/80 h-2 rounded-full overflow-hidden border border-slate-300/60 shrink-0">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Desktop / Tablet Shelf Navigation Chevrons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className={`p-1 sm:p-1.5 rounded-full border transition-all ${
              canScrollLeft
                ? 'bg-white text-slate-700 border-slate-300 shadow-xs hover:bg-slate-50 cursor-pointer active:scale-95'
                : 'bg-slate-100/70 text-slate-300 border-slate-200 cursor-not-allowed opacity-40'
            }`}
            aria-label={`Scroll ${category.label} badges left`}
            title="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className={`p-1 sm:p-1.5 rounded-full border transition-all ${
              canScrollRight
                ? 'bg-white text-slate-700 border-slate-300 shadow-xs hover:bg-slate-50 cursor-pointer active:scale-95'
                : 'bg-slate-100/70 text-slate-300 border-slate-200 cursor-not-allowed opacity-40'
            }`}
            aria-label={`Scroll ${category.label} badges right`}
            title="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Netflix-Style Horizontal Shelf Row */}
      <div className="relative">
        <div
          ref={rowScrollRef}
          onScroll={checkRowScroll}
          className="flex items-stretch gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x py-2 px-1"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sortedBadges.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const isUnseen = unseenIdsSet.has(badge.id);
            const isTarget = firstUnseenBadge?.id === badge.id;

            return (
              <div
                key={badge.id}
                ref={isTarget ? targetBadgeRef : null}
                className={`w-[235px] sm:w-[265px] shrink-0 snap-start p-3.5 sm:p-4 rounded-3xl border-2 transition-all flex flex-col justify-between relative select-none ${
                  isUnseen
                    ? 'bg-amber-50/95 border-amber-500 ring-4 ring-amber-400/40 shadow-lg animate-unseen-badge-highlight'
                    : isUnlocked
                    ? 'bg-white border-amber-300 shadow-xs hover:border-amber-400 hover:shadow-sm'
                    : 'bg-slate-100/75 border-slate-200/90 opacity-60 hover:opacity-85'
                }`}
              >
                {/* Card Top: Icon & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 border-2 shadow-inner ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-amber-600 text-amber-950 shadow-clay-amber'
                        : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isUnseen && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse shadow-xs">
                        NEW!
                      </span>
                    )}
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        <span>Earned</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-500 bg-slate-200/70 border border-slate-300/60 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Center: Title & Description */}
                <div className="my-2.5 space-y-1 text-left flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                    {badge.title || badge.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-snug line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Card Bottom: Requirement */}
                <div className="pt-2 border-t border-slate-100 text-left">
                  <span
                    className={`text-[10.5px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border inline-block leading-none truncate max-w-full ${
                      isUnlocked
                        ? 'text-emerald-900 bg-emerald-100/90 border-emerald-300'
                        : 'text-amber-900 bg-amber-100/90 border-amber-300'
                    }`}
                  >
                    {isUnlocked ? `🎯 ${badge.reqText}` : `Target: ${badge.reqText}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function BadgesModal({
  activeSubject = 'math',
  isOpen,
  onClose,
  unlockedBadges = [],
  personalRecords = {},
  userState = {},
  renderFooter,
  onOpenAscentRoadmap,
  highlightBadgeIds = []
}) {
  const contentMainRef = useRef(null);
  const targetBadgeRef = useRef(null);

  // Find topmost unseen badge if any
  const unseenIdsSet = new Set(highlightBadgeIds || []);
  const firstUnseenBadge = highlightBadgeIds && highlightBadgeIds.length > 0
    ? BADGES_CATALOG.find((b) => unseenIdsSet.has(b.id))
    : null;

  const [showAscentRoadmapModal, setShowAscentRoadmapModal] = useState(false);

  useEffect(() => {
    if (isOpen && firstUnseenBadge && targetBadgeRef.current) {
      const timer = setTimeout(() => {
        if (targetBadgeRef.current) {
          targetBadgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, firstUnseenBadge?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedSet = new Set(unlockedBadges);
  const totalBadges = BADGES_CATALOG.length;
  const unlockedCount = unlockedSet.size;
  const progressPct = Math.round((unlockedCount / totalBadges) * 100);

  const activeProfileId = storageService.getActiveProfileId();
  const questState = questService.getQuests(activeProfileId);
  const questLevelInfo = questState?.levelInfo || {
    ascentTier: 1,
    ascentMode: ASCENT_MODES[0],
    level: 1,
    title: 'Basecamp Explorer',
    icon: '🏕️',
    progressPct: 0,
    currentXp: 0,
    xpIntoLevel: 0,
    xpRequiredForLevel: 150,
    sparkBonusPct: 0
  };
  const ascentTier = questLevelInfo.ascentTier || 1;
  const ascentMode = questLevelInfo.ascentMode || ASCENT_MODES[0];
  const questTotalXp = questState?.totalXp || 0;
  const multiSubjectClaims = questState?.multiSubjectBonusClaimsCount || 0;

  const userRating = userState.competenceRank || userState.adaptiveCompetenceRating || 1000;
  const bestStreak = personalRecords?.highestCorrectStreak || userState.cumulativeCorrectStreak || 0;
  const fastestTime = personalRecords?.fastest12QuestionsTime || personalRecords?.fastest10QuestionsTime || null;
  const perfectRuns = personalRecords?.mostPerfectSessions || 0;


  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                soundFx?.playKeyTap?.();
                onClose();
              }}
              className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-100 border border-yellow-300 flex items-center justify-center shrink-0 shadow-2xs">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 stroke-[2.5]" />
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight truncate">Climber Passport & Mountain Records</h2>
        </div>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main ref={contentMainRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full">
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* 1. GLOBAL CLIMBER PASSPORT & ASCENT HERO CARD */}
        <AscentLevelHeroCard
          ascentTier={ascentTier}
          ascentMode={ascentMode}
          levelInfo={questLevelInfo}
          actionButton={
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                if (onOpenAscentRoadmap) {
                  onOpenAscentRoadmap();
                } else {
                  setShowAscentRoadmapModal(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-black text-white border border-white/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>🗺️</span>
              <span>Ascent Roadmap & Perks</span>
            </button>
          }
        />

        {/* 2. SUBJECT COMPETENCE & MASTERY RATINGS */}
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-4 space-y-3 shrink-0 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Star className="w-4 h-4 text-purple-600 fill-purple-300 stroke-[2]" />
              Subject Competence & Skill Mastery
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.keys(SUBJECTS_CONFIG).map((subKey) => {
              const cfg = SUBJECTS_CONFIG[subKey];
              const subData = storageService.getUserData(subKey);
              const subRating = subData.adaptiveCompetenceRating || subData.competenceRank || 1000;
              const rankName = getCompetenceRankTier(subRating, subKey);
              const isCurrentActive = subKey === activeSubject;

              return (
                <div
                  key={subKey}
                  className={`p-3 rounded-2xl border-2 text-left space-y-1 transition-all ${
                    isCurrentActive
                      ? 'bg-purple-50/80 border-purple-300 shadow-xs ring-2 ring-purple-400/20'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="text-xs font-black text-purple-950 bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                      {subRating} pts
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">{cfg.name}</div>
                  <div className="text-[11px] font-black text-purple-700 truncate">{rankName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PERSONAL BESTS & MOUNTAIN STATS GRID */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 space-y-3 shrink-0 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500 stroke-[2.5]" />
              Personal Bests & Mountain Stats
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
            {/* Best Question Streak */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-orange-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400 shrink-0" />
                <span>Best Streak</span>
              </div>
              <span className="text-xl font-black text-orange-600 my-1">
                {bestStreak > 0 ? `${bestStreak} Qs` : '—'}
              </span>
              <span className="text-[10px] font-bold text-orange-800/80 truncate max-w-full">Unbroken correct</span>
            </div>

            {/* Fastest Flawless Climb */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-amber-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                <span>Fastest Flawless</span>
              </div>
              <span className="text-xl font-black text-amber-600 my-1">
                {fastestTime ? `${fastestTime}s` : '—'}
              </span>
              <span className="text-[10px] font-bold text-amber-800/80 truncate max-w-full">12/12 perfect run</span>
            </div>

            {/* Flawless Climbs */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-emerald-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <Target className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
                <span>Flawless Climbs</span>
              </div>
              <span className="text-xl font-black text-emerald-600 my-1">
                {perfectRuns > 0 ? `${perfectRuns}` : '0'}
              </span>
              <span className="text-[10px] font-bold text-emerald-800/80 truncate max-w-full">100% accuracy</span>
            </div>

            {/* Total Questions Conquered */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-sky-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Questions Solved</span>
              </div>
              <span className="text-xl font-black text-sky-700 my-1">
                {userState.totalProblemsSolved || 0}
              </span>
              <span className="text-[10px] font-bold text-sky-800/80 truncate max-w-full">Across mountain</span>
            </div>

            {/* Summits Reached */}
            <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-teal-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <Mountain className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Summits</span>
              </div>
              <span className="text-xl font-black text-teal-700 my-1">
                {userState.sprintHistory?.length || userState.completedClimbsCount || storageService.getUserData(activeSubject)?.sprintHistory?.length || 0}
              </span>
              <span className="text-[10px] font-bold text-teal-800/80 truncate max-w-full">Completed blocks</span>
            </div>

            {/* Cross-Subject Explorer Bonuses */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center shadow-2xs min-w-0">
              <div className="flex items-center justify-center gap-1 text-purple-900 text-[10.5px] sm:text-xs font-black uppercase leading-tight text-center">
                <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Explorer Days</span>
              </div>
              <span className="text-xl font-black text-purple-700 my-1">
                {multiSubjectClaims}
              </span>
              <span className="text-[10px] font-bold text-purple-800/80 truncate max-w-full">Multi-subject days</span>
            </div>
          </div>
        </div>

        {/* 4. TRAIL BADGES HEADER & PROGRESS */}
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
        </div>

        {/* Horizontal Netflix-Style Badge Rows Per Category */}
        <div className="space-y-6 pb-6">
          {Object.entries(BADGE_CATEGORIES).map(([catKey, cat]) => {
            const catBadges = BADGES_CATALOG.filter((b) => b.category === catKey);
            if (catBadges.length === 0) return null;

            return (
              <BadgeCategoryRow
                key={catKey}
                catKey={catKey}
                category={cat}
                badges={catBadges}
                unlockedSet={unlockedSet}
                unseenIdsSet={unseenIdsSet}
                firstUnseenBadge={firstUnseenBadge}
                targetBadgeRef={targetBadgeRef}
              />
            );
          })}
        </div>
        </div>
      </main>

      {/* Unified Ascent Roadmap & Level Perks Modal */}
      <AscentRoadmapModal
        isOpen={showAscentRoadmapModal}
        onClose={() => setShowAscentRoadmapModal(false)}
        profileId={activeProfileId}
      />

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
