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
  const accuracyPct = Math.round((correctCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="fixed inset-0 z-[999] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 p-3 sm:p-4 overflow-hidden select-none animate-pop box-border">
      <ConfettiCanvas />

      {/* FRACTIONAL CSS GRID CONTAINER (auto auto 1fr auto auto) */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto h-full grid grid-rows-[auto_auto_1fr_auto_auto] gap-2 sm:gap-2.5 box-border text-center relative z-10 py-1">
        {/* ROW 1: Top Header (auto height) */}
        <div className="space-y-0.5">
          <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            Climb Block Complete!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-purple-900">
            You completed 12 adaptive problems on Mount Kibo!
          </p>
        </div>

        {/* ROW 2: Kibo Mascot Stage (auto height, min-h-[120px]) */}
        <div className="relative flex items-center justify-center min-h-[110px] sm:min-h-[130px] my-0.5">
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/30 blur-xl animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-auto h-24 sm:h-32 max-h-[20vh] filter drop-shadow-md animate-bounce object-contain"
          />
        </div>

        {/* ROW 3: Stat Cards & Competence Rank (1fr row - fills middle space) */}
        <div className="flex flex-col justify-center gap-2 min-h-0">
          {/* 4-Tile Detailed Climb Stats Matrix (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 bg-white/95 border-2 border-amber-200/90 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md shadow-md text-left flex-1 min-h-0">
            {/* Accuracy Tile */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2 sm:p-2.5 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accuracy
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg sm:text-2xl font-black text-emerald-700">{correctCount} / {totalCount}</span>
                <span className="text-xs font-extrabold text-emerald-600">{accuracyPct}%</span>
              </div>
            </div>

            {/* Sparks Earned Tile */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2 sm:p-2.5 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-400" /> Sparks Earned
              </span>
              <div className="text-lg sm:text-2xl font-black text-amber-700 flex items-center gap-1">
                +{sparksEarned} ⚡
              </div>
            </div>

            {/* Streak Boost Tile */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-2 sm:p-2.5 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-orange-800 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-400" /> Answer Streak
              </span>
              <div className="text-lg sm:text-2xl font-black text-orange-700">
                🔥 {streak} Qs
              </div>
            </div>

            {/* Competence Rank Delta Tile */}
            <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-xl p-2 sm:p-2.5 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-cyan-800 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-600" /> Rank Delta
              </span>
              <div className="text-lg sm:text-2xl font-black text-cyan-700">
                {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
              </div>
            </div>
          </div>

          {/* Live Updated Competence Rank Banner */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-2xl p-2 sm:p-2.5 px-3.5 flex items-center justify-between shadow-xs shrink-0">
            <span className="text-xs sm:text-sm font-black text-purple-900 flex items-center gap-1.5 uppercase">
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
            </span>
            <span className="text-sm sm:text-base font-black text-purple-950 bg-white px-3 py-0.5 rounded-xl border border-purple-200 shadow-inner">
              <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
            </span>
          </div>
        </div>

        {/* ROW 4: Action Buttons (auto height, shrink-0) */}
        <div className="space-y-1.5 sm:space-y-2 w-full pt-0.5">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-3 sm:py-3.5 text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform min-h-[48px]"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform min-h-[42px]"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            Visit Kibo Workshop 🏪
          </button>
        </div>

        {/* ROW 5: Footer / Parent Zone Tagline (auto height) */}
        <div className="pt-0.5">
          <span className="text-[10px] font-bold text-slate-500 block">
            Kibo Math by Kibo Climb • The 3-Minute Daily Ascent
          </span>
        </div>
      </div>
    </div>
  );
}
