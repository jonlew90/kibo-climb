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
    <div className="fixed inset-0 z-[999] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-start items-center p-2 overflow-hidden select-none animate-pop">
      <ConfettiCanvas />

      <div className="w-full max-w-sm mx-auto space-y-1.5 relative z-10 text-center py-1">
        {/* Banner Header */}
        <div className="space-y-0.5">
          <span className="text-[8px] font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">
            Climb Block Complete!
          </h1>
        </div>

        {/* Basecamp Mascot Stage */}
        <div className="relative py-0.5 flex justify-center items-center">
          <div className="absolute w-16 h-16 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-12 h-12 sm:w-14 sm:h-14 filter drop-shadow-md animate-bounce"
          />
        </div>

        {/* 4-Tile Detailed Climb Stats Matrix in 1 Row */}
        <div className="grid grid-cols-4 gap-1 bg-white/95 border border-amber-200/90 rounded-xl p-1 shadow-xs text-center">
          {/* Accuracy Tile */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-lg p-0.5">
            <span className="text-[7.5px] font-black uppercase text-emerald-800 block truncate">Accuracy</span>
            <span className="text-[11px] font-black text-emerald-700 block leading-tight">{correctCount}/{totalCount}</span>
          </div>

          {/* Sparks Earned Tile */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-lg p-0.5">
            <span className="text-[7.5px] font-black uppercase text-amber-800 block truncate">Sparks</span>
            <span className="text-[11px] font-black text-amber-700 block leading-tight">+{sparksEarned}⚡</span>
          </div>

          {/* Streak Boost Tile */}
          <div className="bg-orange-50/90 border border-orange-200/80 rounded-lg p-0.5">
            <span className="text-[7.5px] font-black uppercase text-orange-800 block truncate">Streak</span>
            <span className="text-[11px] font-black text-orange-700 block leading-tight">🔥{streak}</span>
          </div>

          {/* Competence Rank Delta Tile */}
          <div className="bg-cyan-50/90 border border-cyan-200/80 rounded-lg p-0.5">
            <span className="text-[7.5px] font-black uppercase text-cyan-800 block truncate">Rank</span>
            <span className="text-[11px] font-black text-cyan-700 block leading-tight">{blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`}⭐</span>
          </div>
        </div>

        {/* Live Updated Competence Rank Banner */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-xl p-1 px-2 flex items-center justify-between shadow-xs">
          <span className="text-[9px] font-black text-purple-900 flex items-center gap-1 uppercase">
            <Trophy className="w-3 h-3 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
          </span>
          <span className="text-[11px] font-black text-purple-950 bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-inner">
            <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1 pt-0.5 w-full">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-2 text-xs sm:text-sm font-black rounded-lg flex items-center justify-center gap-1.5 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-1.5 text-[10px] sm:text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow-bouncy-purple active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
            Visit Kibo Workshop 🏪
          </button>
        </div>
      </div>
    </div>
  );
}
