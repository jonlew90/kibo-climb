import React from 'react';
import { Coffee, ShoppingBag, Play, Trophy, Zap, Flame, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[999] bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto text-white select-none animate-pop">
      <ConfettiCanvas />

      <div className="w-full max-w-md mx-auto my-auto space-y-4 relative z-10 py-4 text-center">
        {/* Fullscreen Banner Header */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3.5 py-1 rounded-full border-2 border-amber-500 shadow-md inline-block tracking-wider animate-pulse">
            🏔️ Ascent Checkpoint Reached
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            Climb Block Complete!
          </h1>
          <p className="text-xs font-semibold text-purple-200">
            You completed 12 adaptive problems on Mount Kibo!
          </p>
        </div>

        {/* Basecamp Mascot Stage */}
        <div className="relative py-2 flex justify-center items-center">
          <div className="absolute w-44 h-44 rounded-full bg-purple-500/20 blur-2xl animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="break"
            equipped={equippedItems}
            className="w-32 h-32 sm:w-36 sm:h-36 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] animate-bounce"
          />
        </div>

        <p className="text-xs sm:text-sm font-extrabold text-amber-200 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-inner leading-relaxed">
          "Awesome effort! Taking a brief pause helps encode math strategies into long-term memory." 💡
        </p>

        {/* 4-Tile Detailed Climb Stats Matrix */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-900/80 border-2 border-purple-400/40 rounded-2xl p-3.5 backdrop-blur-md shadow-xl text-left">
          {/* Accuracy Tile */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Accuracy
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-emerald-400">{correctCount} / {totalCount}</span>
              <span className="text-[11px] font-extrabold text-emerald-300">{accuracyPct}%</span>
            </div>
          </div>

          {/* Sparks Earned Tile */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Sparks Earned
            </span>
            <div className="text-lg font-black text-amber-300 flex items-center gap-1">
              +{sparksEarned} ⚡
            </div>
          </div>

          {/* Streak Boost Tile */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> Answer Streak
            </span>
            <div className="text-lg font-black text-orange-300">
              🔥 {streak} Qs
            </div>
          </div>

          {/* Competence Rank Delta Tile */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" /> Rank Delta
            </span>
            <div className="text-lg font-black text-cyan-300">
              {blockRatingGain >= 0 ? `+${blockRatingGain}` : `${blockRatingGain}`} ⭐
            </div>
          </div>
        </div>

        {/* Live Updated Competence Rank Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-400/40 rounded-2xl p-3 flex items-center justify-between shadow-md">
          <span className="text-xs font-black text-amber-200 flex items-center gap-1.5 uppercase">
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 stroke-[2.5]" /> Competence Rank
          </span>
          <span className="text-base font-black text-white bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-300/50 shadow-inner">
            <RollingNumberTicker value={competenceRating} showDeltaBadge={false} suffix=" ⭐" />
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-3.5 text-base sm:text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-3 text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            Visit Kibo Workshop 🏪
          </button>
        </div>
      </div>
    </div>
  );
}
