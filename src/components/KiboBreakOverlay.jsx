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
    <div className="fixed inset-0 z-[999] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-start items-center p-2.5 sm:p-4 overflow-y-auto select-none animate-pop">
      <ConfettiCanvas />

      <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-2 relative z-10 text-center py-0.5">
        {/* Banner Header */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight drop-shadow-xs">
            Climb Block Complete!
          </h1>
        </div>

        {/* Basecamp Mascot Stage */}
        <div className="relative py-0.5 flex justify-center items-center">
          <div className="absolute w-20 h-20 rounded-full bg-amber-400/25 blur-lg animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-md animate-bounce"
          />
        </div>

        {/* 4-Tile Stats Matrix in 1 Ultra-Compact Horizontal Row */}
        <div className="grid grid-cols-4 gap-1 bg-white/95 border-2 border-amber-200/90 rounded-xl p-1.5 backdrop-blur-md shadow-md text-center">
          {/* Accuracy Tile */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-lg p-1">
            <span className="text-[8px] font-black uppercase text-emerald-800 block truncate">Accuracy</span>
            <span className="text-xs font-black text-emerald-700 block">{correctCount}/{totalCount}</span>
          </div>

          {/* Sparks Earned Tile */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-lg p-1">
            <span className="text-[8px] font-black uppercase text-amber-800 block truncate">Sparks</span>
            <span className="text-xs font-black text-amber-700 block">+{sparksEarned}⚡</span>
          </div>

          {/* Streak Boost Tile */}
          <div className="bg-orange-50/90 border border-orange-200/80 rounded-lg p-1">
            <span className="text-[8px] font-black uppercase text-orange-800 block truncate">Streak</span>
            <span className="text-xs font-black text-orange-700 block">🔥{streak}</span>
          </div>

          {/* Competence Rank Delta Tile */}
          <div className="bg-cyan-50/90 border border-cyan-200/80 rounded-lg p-1">
            <span className="text-[8px] font-black uppercase text-cyan-800 block truncate">Rank</span>
            <span className="text-xs font-black text-cyan-700 block">{blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`}⭐</span>
          </div>
        </div>

        {/* Live Updated Competence Rank Banner */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-xl p-1.5 px-3 flex items-center justify-between shadow-xs">
          <span className="text-[10px] font-black text-purple-900 flex items-center gap-1 uppercase">
            <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
          </span>
          <span className="text-xs sm:text-sm font-black text-purple-950 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shadow-inner">
            <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
          </span>
        </div>

        {/* Full-Width Stacked Action Buttons */}
        <div className="space-y-1.5 pt-0.5">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-2.5 sm:py-3 text-sm sm:text-base font-black rounded-xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-2 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            Visit Kibo Workshop 🏪
          </button>
        </div>
      </div>
    </div>
  );
}
