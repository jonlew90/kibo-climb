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

export default function BadgesModal({
  activeSubject = 'math',
  isOpen,
  onClose,
  unlockedBadges = [],
  personalRecords = {},
  userState = {},
  renderFooter
}) {
  const [activeCategory, setActiveCategory] = useState(
    BADGE_CATEGORIES[activeSubject] ? activeSubject : Object.keys(BADGE_CATEGORIES)[0]
  );
  const [showAscentRoadmapModal, setShowAscentRoadmapModal] = useState(false);

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
    if (activeSubject && BADGE_CATEGORIES[activeSubject]) {
      setActiveCategory(activeSubject);
    }
  }, [activeSubject]);

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

  const filteredBadges = BADGES_CATALOG.filter((b) => b.category === activeCategory);

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
          <Compass className="w-5 h-5 text-teal-600 stroke-[2.5] shrink-0" />
          <h2 className="text-base sm:text-lg font-black tracking-tight truncate">Climber Passport & Mountain Records</h2>
        </div>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* 1. GLOBAL CLIMBER PASSPORT & ASCENT HERO CARD */}
        <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                  <span>{ascentMode.icon}</span>
                  <span>Ascent {ascentTier}: {ascentMode.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  Lv. {questLevelInfo.level}
                </span>
                {questLevelInfo.sparkBonusPct > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    +{questLevelInfo.sparkBonusPct}% Permanent Sparks
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-1.5">
                <span className="text-3xl sm:text-4xl drop-shadow-xs">{questLevelInfo.icon || '🏕️'}</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {questLevelInfo.title}
                  </h3>
                  <p className="text-teal-100 text-xs sm:text-sm font-bold">
                    {questTotalXp}m Total Mountain Altitude XP
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowAscentRoadmapModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-black text-white border border-white/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>🗺️</span>
              <span>Ascent Roadmap & Perks</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-black/25 h-3.5 rounded-full overflow-hidden border border-white/20">
              <div
                className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${questLevelInfo.progressPct || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs font-black text-teal-100">
              <span>{questLevelInfo.xpIntoLevel || 0}m / {questLevelInfo.xpRequiredForLevel || 150}m in Level {questLevelInfo.level}</span>
              <span>{questLevelInfo.progressPct || 0}% to Lv. {(questLevelInfo.level || 1) + 1} ({questLevelInfo.nextRankTitle || 'Next Rank'})</span>
            </div>
          </div>
        </div>

        {/* 2. SUBJECT COMPETENCE & MASTERY RATINGS */}
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-4 space-y-3 shrink-0 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Star className="w-4 h-4 text-purple-600 fill-purple-300 stroke-[2]" />
              Subject Competence & Skill Mastery
            </span>
            <span className="text-[10px] font-bold text-slate-500">Adaptive Competence Ratings</span>
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
