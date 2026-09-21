import React from 'react';
import { ShoppingBag, Play, Trophy, Zap, Flame, TrendingUp, CheckCircle2, ShieldAlert, FileText, Printer, Dumbbell } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import RollingNumberTicker from './RollingNumberTicker';
import { questService } from '../services/questService';
import { storageService } from '../services/storageService';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { getBestWorksheetForTier } from '../utils/worksheetGenerator';

export default function KiboBreakOverlay({
  correctCount = 12,
  totalCount = 12,
  streak = 0,
  sparksEarned = 0,
  blockRatingGain = 0,
  shieldsUsed = 0,
  competenceRating = 1000,
  equippedItems = [],
  blockTimeSec = null,
  isNewSpeedRecord = false,
  isNewStreakRecord = false,
  newlyUnlockedBadges = [],
  profileId,
  activeSubject = 'math',
  isPracticeMode = false,
  practiceTitle = 'Training Camp',
  practiceTier = null,
  onExitPractice,
  onOpenPracticeMode,
  onOpenWorkshop,
  onViewWorksheet,
  onResumeClimb
}) {
  const displayCorrect = Math.min(12, Math.max(0, correctCount));
  const accuracyPct = Math.round((displayCorrect / Math.max(1, totalCount)) * 100);
  const isPerfectBlock = displayCorrect === totalCount && shieldsUsed === 0;
  const activeProfileId = profileId || storageService.getActiveProfileId();
  const questState = questService.getQuests(activeProfileId);
  const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer', icon: '🏕️', ascentTier: 1, progressPct: 0 };
  const dailySubjects = questService.getDailySubjectsCompleted(activeProfileId);
  const isMultiSubjectClaimed = questService.isDailyMultiSubjectBonusClaimed(activeProfileId);
  const altitudeEarned = (displayCorrect * 10) + (Math.max(0, totalCount - displayCorrect) * 2);

  const effectivePracticeTier = practiceTier || (practiceTitle ? parseInt(practiceTitle.replace(/\D+/g, ''), 10) || 1 : 1);
  const subjectStrands = SUBJECTS_CONFIG[activeSubject]?.SKILL_STRANDS || SUBJECTS_CONFIG.math.SKILL_STRANDS || [];
  const practicedStrand = subjectStrands.find((s) => s.tier === effectivePracticeTier);
  const strandLabel = practicedStrand ? practicedStrand.name : `Tier ${effectivePracticeTier}`;
  const recommendedWorksheet = isPracticeMode ? getBestWorksheetForTier(activeSubject, effectivePracticeTier) : null;

  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      {/* CENTERED CONTENT FRAME WITH FLEX DISTRIBUTION */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-4 sm:p-5 box-border relative z-10 text-center">
        {/* TOP CONTAINER (flex-shrink: 0) */}
        <div className="shrink-0 flex flex-col items-center text-center space-y-1">
          <span className={`text-xs sm:text-sm font-black uppercase px-3.5 py-1 rounded-full border shadow-xs inline-block tracking-wider animate-pulse ${
            isPracticeMode
              ? 'text-indigo-950 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-300 border-indigo-400'
              : 'text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 border-amber-500'
          }`}>
            {isPracticeMode ? '🏋️ Training Camp Complete' : '🏔️ Ascent Checkpoint Reached'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            {isPracticeMode ? 'Training Sprint Complete!' : 'Climb Block Complete!'}
          </h1>
          {!isPracticeMode && isNewSpeedRecord && (
            <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-2 border-amber-500 rounded-2xl py-1.5 px-3 shadow-md animate-bounce">
              <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center justify-center gap-1.5">
                🏆 NEW PR! Fastest Flawless Climb: {blockTimeSec ? `${blockTimeSec}s` : 'Speed Record'} ⚡
              </span>
            </div>
          )}

          {!isPracticeMode && !isNewSpeedRecord && isNewStreakRecord && (
            <div className="w-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 border-2 border-orange-500 rounded-2xl py-1.5 px-3 shadow-md animate-bounce">
              <span className="text-xs sm:text-sm font-black text-orange-950 flex items-center justify-center gap-1.5">
                🔥 NEW RECORD! Longest Flawless Streak: {streak} in a row! ⚡
              </span>
            </div>
          )}

          {/* NEWLY UNLOCKED BADGES SHOWCASE */}
          {newlyUnlockedBadges && newlyUnlockedBadges.length > 0 && (
            <div className="w-full bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-2 border-amber-400 rounded-2xl p-2.5 shadow-md flex flex-col gap-1.5 text-center animate-pop">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-black uppercase text-amber-950 bg-amber-300/80 px-2.5 py-0.5 rounded-full border border-amber-500 shadow-2xs">
                  🏆 {newlyUnlockedBadges.length === 1 ? 'New Badge Unlocked!' : `${newlyUnlockedBadges.length} New Badges Unlocked!`}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {newlyUnlockedBadges.map((badge, bIdx) => (
                  <div
                    key={badge.id || `badge_${bIdx}`}
                    className="flex items-center gap-2 bg-white/95 border border-amber-300 rounded-xl px-2.5 py-1.5 shadow-xs text-left"
                  >
                    <span className="text-2xl">{badge.icon || '🏅'}</span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                        {badge.title || badge.name}
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold truncate max-w-[180px]">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MASCOT HERO ANIMATION (flex-shrink: 0) */}
        <div className="shrink-0 flex items-center justify-center py-1 select-none">
          <div className="relative">
            <Mascot
              mood={isPerfectBlock ? 'happy' : 'idle'}
              state="break"
              equipped={equippedItems}
              className="w-24 h-24 sm:w-32 sm:h-32 aspect-square filter drop-shadow-md animate-bounce"
            />
          </div>
        </div>

        {/* MIDDLE CONTAINER (flex: 1, display: flex, flex-direction: column, justify-content: center) */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 py-2">
          {/* Detailed Climb Stats Matrix */}
          <div className={`grid ${isPracticeMode ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5 bg-white border-2 border-amber-200/90 rounded-2xl p-3 sm:p-4 shadow-md text-center flex-1 min-h-0 flex flex-col justify-center`}>
            {/* Accuracy Tile */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center space-y-0.5 text-center relative overflow-hidden">
              <span className="text-xs font-black uppercase text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accuracy
              </span>
              <div className="flex items-baseline justify-center gap-1.5 w-full">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">{displayCorrect} / {totalCount}</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-600">({accuracyPct}%)</span>
              </div>
              {shieldsUsed > 0 && (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 border border-sky-300 rounded-full text-xs font-black text-sky-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
                  <span>{shieldsUsed} Shield{shieldsUsed > 1 ? 's' : ''} Consumed</span>
                </div>
              )}
            </div>

            {/* Sparks Earned Tile */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center space-y-0.5 text-center">
              <span className="text-xs font-black uppercase text-amber-800 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Sparks Earned
              </span>
              {storageService.hasClubMembership(activeProfileId) ? (
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                  <div className="text-2xl sm:text-3xl font-black text-amber-700 flex items-center justify-center gap-1">
                    +{sparksEarned} ⚡
                  </div>
                  <span className="text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-1.5 py-0.2 rounded-md shadow-2xs border border-amber-300">
                    👑 1.25x VIP
                  </span>
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-black text-amber-700 flex items-center justify-center gap-1">
                  +{sparksEarned} ⚡
                </div>
              )}
            </div>

            {/* Streak Boost Tile */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center space-y-0.5 text-center">
              <span className="text-xs font-black uppercase text-orange-800 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> Answer Streak
              </span>
              <div className="text-2xl sm:text-3xl font-black text-orange-700 flex items-center justify-center">
                🔥 {streak} Qs
              </div>
            </div>

            {/* Competence Rank Delta Tile (Hidden in practice mode) */}
            {!isPracticeMode && (
              <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center space-y-0.5 text-center">
                <span className="text-xs font-black uppercase text-cyan-800 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Rank Delta
                </span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-700 flex items-center justify-center">
                  {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
                </div>
              </div>
            )}
          </div>

          {/* Competence Rank Banner (Climb Mode) / Tier Practiced Banner (Practice Mode) */}
          {!isPracticeMode ? (
            <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-4 flex items-center justify-between shadow-xs shrink-0">
              <span className="text-xs sm:text-sm font-black text-purple-900 flex items-center gap-1.5 uppercase">
                <Trophy className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
              </span>
              <span className="text-sm sm:text-base font-black text-purple-950 bg-white px-2.5 py-0.5 sm:py-1 rounded-xl border border-purple-200 shadow-inner">
                <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 border border-indigo-300 rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-4 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base sm:text-lg shrink-0">🎯</span>
                <div className="text-left min-w-0">
                  <span className="text-[10px] sm:text-xs font-black text-indigo-800 uppercase tracking-wider block">
                    Tier Practiced
                  </span>
                  <span className="text-xs sm:text-sm font-black text-indigo-950 truncate block">
                    Tier {effectivePracticeTier} • {strandLabel}
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-indigo-950 bg-white px-2.5 py-0.5 sm:py-1 rounded-xl border border-indigo-200 shadow-inner shrink-0 ml-2">
                Tier {effectivePracticeTier}
              </span>
            </div>
          )}

          {/* In Climb Mode: Global Climber Ascent & Altitude XP Progress + Multi-Subject Bonus */}
          {!isPracticeMode ? (
            <>
              <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-100 border border-teal-300 rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-4 flex flex-col gap-1.5 shadow-xs shrink-0 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{questLevelInfo.icon || '🏕️'}</span>
                    <span className="text-xs sm:text-sm font-black text-teal-950">
                      Ascent {questLevelInfo.ascentTier} • Lv. {questLevelInfo.level} ({questLevelInfo.title})
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-teal-700 bg-white/80 px-2 py-0.5 rounded-full border border-teal-200">
                    +{altitudeEarned}m Altitude
                  </span>
                </div>
                <div className="w-full h-2 bg-teal-200/80 rounded-full overflow-hidden border border-teal-300/50">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${questLevelInfo.progressPct || 0}%` }}
                  />
                </div>
              </div>

              {/* Multi-Subject Daily Bonus Status */}
              <div className={`rounded-xl py-2 px-3 border text-xs font-black flex items-center justify-center shrink-0 gap-1.5 whitespace-nowrap overflow-hidden shadow-2xs ${
                isMultiSubjectClaimed || dailySubjects.length >= 2
                  ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                  : 'bg-slate-100/90 border-slate-200 text-slate-700'
              }`}>
                <span className="text-xs shrink-0">🌟</span>
                <span className="font-extrabold truncate">
                  {isMultiSubjectClaimed
                    ? 'Bonus Claimed (+75 ⚡)'
                    : dailySubjects.length === 1
                    ? '1/2 subjects (play another for +75 ⚡)'
                    : dailySubjects.length >= 2
                    ? '2/2 ready to claim!'
                    : '0/2 subjects (play 2 for +75 ⚡)'}
                </span>
              </div>
            </>
          ) : (
            /* In Practice Mode: Targeted Practice Completion Card with Offline Worksheet CTA */
            <div className="space-y-2 shrink-0">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 border border-indigo-300 rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-4 flex items-center justify-between shadow-xs text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏋️</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-indigo-950 block">
                      {practiceTitle}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700">
                      Streak Protected • Free Hints
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-indigo-900 bg-white/90 px-2.5 py-1 rounded-full border border-indigo-200">
                  Practice Complete
                </span>
              </div>

              {recommendedWorksheet && (
                <div className="bg-white/95 border border-indigo-200 rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs text-left gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-slate-800 truncate block">
                        📄 Print offline drill: {recommendedWorksheet.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        16 problems + parent answer key
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onViewWorksheet) {
                        onViewWorksheet(recommendedWorksheet.id);
                      }
                    }}
                    className="shrink-0 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Printer className="w-3 h-3 text-indigo-700" />
                    <span>Print Sheet</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CONTAINER (flex-shrink: 0) */}
        <div className="shrink-0 space-y-2 pt-1 w-full">
          {isPracticeMode ? (
            <>
              {/* PRIMARY: Train Again */}
              <button
                type="button"
                onClick={onOpenPracticeMode}
                className="w-full h-14 min-h-[56px] py-3.5 text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg cursor-pointer"
              >
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                Train Again 🏋️
              </button>

              {/* SECONDARY: Done / Back to Climb */}
              <button
                type="button"
                onClick={onExitPractice}
                className="w-full h-12 min-h-[48px] py-3 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-600 stroke-[2.5]" />
                Done — Back to Climb 🏔️
              </button>

              {/* TERTIARY: Shop */}
              <button
                type="button"
                onClick={onOpenWorkshop}
                className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer transition-colors text-center block"
              >
                Visit Kibo's Corner 🐾
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onResumeClimb}
                className="w-full h-14 min-h-[56px] py-3.5 text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform btn-3d-orange shadow-bouncy-orange"
              >
                <Play className="w-5 h-5 fill-white stroke-[2.5]" />
                Keep Climbing! 🏔️
              </button>

              <button
                type="button"
                onClick={onOpenWorkshop}
                className="btn-3d-purple w-full h-12 min-h-[48px] py-3 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                Visit Kibo's Corner 🐾
              </button>
            </>
          )}

          <span className="text-xs sm:text-sm font-bold text-slate-500 block text-center pt-1">
            {isPracticeMode
              ? 'Training Camp • Targeted Skill Building'
              : 'Kibo Math by Kibo Climb • Bite-Sized Daily Climbs'}
          </span>
        </div>
      </div>
    </div>
  );
}
