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
    <div className="fixed inset-0 z-[999] h-[100dvh] w-vw max-w-md mx-auto flex flex-col justify-between p-4 box-border overflow-hidden bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 select-none animate-pop">
      <ConfettiCanvas />

      {/* ZONE 1: HEADER & HERO MASCOT (flex: 0 1 auto, min-h-0) */}
      <div className="flex-none flex flex-col items-center text-center space-y-1 z-10 min-h-0">
        <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
          🏔️ Ascent Checkpoint Reached
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
          Climb Block Complete!
        </h1>
        <p className="text-xs sm:text-sm font-bold text-purple-900">
          You completed 12 adaptive problems on Mount Kibo!
        </p>

        {/* Hero Mascot Stage with clamp(80px, 15vh, 140px) */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/30 blur-xl animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-auto filter drop-shadow-md animate-bounce object-contain"
            style={{ height: 'clamp(80px, 15vh, 140px)' }}
          />
        </div>
      </div>

      {/* ZONE 2: STATS & COMPETENCE CARDS (flex: 1 1 auto, display: flex, flex-direction: column, justify-content: center) */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 z-10 min-h-0 py-2">
        {/* 4-Tile Detailed Climb Stats Matrix (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 bg-white/95 border-2 border-amber-200/90 rounded-2xl p-3 backdrop-blur-md shadow-md text-left flex-1 min-h-0 flex flex-col justify-center">
          {/* Accuracy Tile */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 flex flex-col justify-center space-y-0.5">
            <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accuracy
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">{correctCount} / {totalCount}</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600">{accuracyPct}%</span>
            </div>
          </div>

          {/* Sparks Earned Tile */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 flex flex-col justify-center space-y-0.5">
            <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Sparks Earned
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-700 flex items-center gap-1">
              +{sparksEarned} ⚡
            </div>
          </div>

          {/* Streak Boost Tile */}
          <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-2.5 flex flex-col justify-center space-y-0.5">
            <span className="text-[10px] font-black uppercase text-orange-800 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> Answer Streak
            </span>
            <div className="text-xl sm:text-2xl font-black text-orange-700">
              🔥 {streak} Qs
            </div>
          </div>

          {/* Competence Rank Delta Tile */}
          <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-xl p-2.5 flex flex-col justify-center space-y-0.5">
            <span className="text-[10px] font-black uppercase text-cyan-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Rank Delta
            </span>
            <div className="text-xl sm:text-2xl font-black text-cyan-700">
              {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
            </div>
          </div>
        </div>

        {/* Live Updated Competence Rank Banner */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-purple-100 border border-amber-300 rounded-2xl p-2.5 px-3.5 flex items-center justify-between shadow-xs shrink-0">
          <span className="text-xs sm:text-sm font-black text-purple-900 flex items-center gap-1.5 uppercase">
            <Trophy className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5]" /> Competence Rank
          </span>
          <span className="text-sm sm:text-base font-black text-purple-950 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-inner">
            <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
          </span>
        </div>
      </div>

      {/* ZONE 3: BUTTONS & FOOTER (flex: 0 0 auto, shrink-0) */}
      <div className="flex-none space-y-2 z-10 w-full pt-1">
        <button
          type="button"
          onClick={onResumeClimb}
          className="btn-3d-orange w-full py-3.5 min-h-[52px] text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
        >
          <Play className="w-5 h-5 fill-white stroke-[2.5]" />
          Keep Climbing! 🏔️
        </button>

        <button
          type="button"
          onClick={onOpenWorkshop}
          className="btn-3d-purple w-full py-3 min-h-[48px] text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          Visit Kibo Workshop 🏪
        </button>

        <span className="text-[10px] font-bold text-slate-500 block text-center pt-0.5">
          Kibo Math by Kibo Climb • The 3-Minute Daily Ascent
        </span>
      </div>
    </div>
  );
}
