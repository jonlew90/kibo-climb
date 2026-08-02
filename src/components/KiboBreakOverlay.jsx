import React from 'react';
import { ShoppingBag, Play, Trophy, Zap, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import RollingNumberTicker from './RollingNumberTicker';

export default function KiboBreakOverlay({
  correctCount = 12,
  totalCount = 12,
  streak = 0,
  sparksEarned = 0,
  blockRatingGain = 0,
  competenceRating = 1000,
  equippedItems = [],
  onOpenWorkshop,
  onResumeClimb
}) {
  const displayCorrect = Math.min(12, Math.max(0, correctCount));
  const accuracyPct = Math.round((displayCorrect / Math.max(1, totalCount)) * 100);

  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      {/* CENTERED CONTENT FRAME WITH FLEX DISTRIBUTION */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-4 sm:p-5 box-border relative z-10 text-center">
        {/* TOP CONTAINER (flex-shrink: 0) */}
        <div className="shrink-0 flex flex-col items-center text-center space-y-1">
          <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3.5 py-1 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            Climb Block Complete!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-purple-900">
            You completed 12 adaptive problems on Mount Kibo!
          </p>

          {/* Kibo Mascot Image (max-h-[16vh] w-auto mx-auto object-contain) */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full bg-amber-400/30 blur-xl animate-pulse pointer-events-none" />
            <Mascot
              mood="happy"
              state="break"
              equipped={equippedItems}
              className="w-auto max-h-[16vh] h-24 sm:h-32 filter drop-shadow-md animate-bounce object-contain"
            />
          </div>
        </div>

        {/* MIDDLE CONTAINER (flex: 1, display: flex, flex-direction: column, justify-content: center) */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 py-2">
          {/* 4-Tile Detailed Climb Stats Matrix (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 bg-white border-2 border-amber-200/90 rounded-2xl p-3 sm:p-4 shadow-md text-left flex-1 min-h-0 flex flex-col justify-center">
            {/* Accuracy Tile */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center space-y-0.5">
              <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accuracy
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">{displayCorrect} / {totalCount}</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-600">{accuracyPct}%</span>
              </div>
            </div>

            {/* Sparks Earned Tile */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center space-y-0.5">
              <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Sparks Earned
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 flex items-center gap-1">
                +{sparksEarned} ⚡
              </div>
            </div>

            {/* Streak Boost Tile */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center space-y-0.5">
              <span className="text-[10px] font-black uppercase text-orange-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> Answer Streak
              </span>
              <div className="text-2xl sm:text-3xl font-black text-orange-700">
                🔥 {streak} Qs
              </div>
            </div>

            {/* Competence Rank Delta Tile */}
            <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center space-y-0.5">
              <span className="text-[10px] font-black uppercase text-cyan-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Rank Delta
              </span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-700">
                {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
              </div>
            </div>
          </div>

          {/* Competence Rank Banner */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-2xl p-3 px-4 flex items-center justify-between shadow-xs shrink-0">
            <span className="text-xs sm:text-sm font-black text-purple-900 flex items-center gap-1.5 uppercase">
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
            </span>
            <span className="text-base sm:text-lg font-black text-purple-950 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-inner">
              <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
            </span>
          </div>
        </div>

        {/* BOTTOM CONTAINER (flex-shrink: 0) */}
        <div className="shrink-0 space-y-2 pt-1 w-full">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full h-14 min-h-[56px] py-3.5 text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full h-12 min-h-[48px] py-3 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            Visit Kibo's Corner 🐾
          </button>

          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block text-center pt-1">
            Kibo Math by Kibo Climb • Bite-Sized Daily Ascents (~3 Mins)
          </span>
        </div>
      </div>
    </div>
  );
}
