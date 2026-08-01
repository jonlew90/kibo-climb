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
    <div className="fixed inset-0 z-[999] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden select-none animate-pop">
      <ConfettiCanvas />

      <div className="w-full max-w-sm sm:max-w-md mx-auto h-full flex flex-col justify-between py-1 relative z-10 text-center">
        {/* Banner Header */}
        <div className="space-y-0.5 shrink-0">
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight drop-shadow-xs">
            Climb Block Complete!
          </h1>
        </div>

        {/* Basecamp Mascot Stage */}
        <div className="relative py-0.5 flex justify-center items-center shrink-0">
          <div className="absolute w-20 h-20 rounded-full bg-amber-400/25 blur-lg animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-md animate-bounce"
          />
        </div>

        {/* 4-Tile Detailed Climb Stats Matrix */}
        <div className="grid grid-cols-2 gap-1 bg-white/95 border-2 border-amber-200/90 rounded-xl p-1.5 backdrop-blur-md shadow-xs text-left shrink-0">
          {/* Accuracy Tile */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-1.5 space-y-0.5">
            <span className="text-[8px] font-black uppercase text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Accuracy
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs sm:text-sm font-black text-emerald-700">{correctCount} / {totalCount}</span>
              <span className="text-[9px] font-extrabold text-emerald-600">{accuracyPct}%</span>
            </div>
          </div>

          {/* Sparks Earned Tile */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-1.5 space-y-0.5">
            <span className="text-[8px] font-black uppercase text-amber-800 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-400" /> Sparks Earned
            </span>
            <div className="text-xs sm:text-sm font-black text-amber-700 flex items-center gap-1">
              +{sparksEarned} ⚡
            </div>
          </div>

          {/* Streak Boost Tile */}
          <div className="bg-orange-50/80 border border-orange-200/80 rounded-lg p-1.5 space-y-0.5">
            <span className="text-[8px] font-black uppercase text-orange-800 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-400" /> Answer Streak
            </span>
            <div className="text-xs sm:text-sm font-black text-orange-700">
              🔥 {streak} Qs
            </div>
          </div>

          {/* Competence Rank Delta Tile */}
          <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-xl p-1.5 space-y-0.5">
            <span className="text-[8px] font-black uppercase text-cyan-800 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-cyan-600" /> Rank Delta
            </span>
            <div className="text-xs sm:text-sm font-black text-cyan-700">
              {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
            </div>
          </div>
        </div>

        {/* Live Updated Competence Rank Banner */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-xl p-1 px-2.5 flex items-center justify-between shadow-xs shrink-0">
          <span className="text-[10px] font-black text-purple-900 flex items-center gap-1 uppercase">
            <Trophy className="w-3 h-3 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
          </span>
          <span className="text-xs font-black text-purple-950 bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-inner">
            <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
          </span>
        </div>

        {/* Full-Width Stacked Action Buttons */}
        <div className="space-y-1.5 shrink-0 pt-0.5 w-full">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-2.5 text-xs sm:text-sm font-black rounded-lg flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-1.5 text-[11px] sm:text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            Visit Kibo Workshop 🏪
          </button>
        </div>
      </div>
    </div>
  );
}
