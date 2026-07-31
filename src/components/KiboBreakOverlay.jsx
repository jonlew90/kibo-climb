import React from 'react';
import { Coffee, ShoppingBag, Play, Trophy, Zap, Flame } from 'lucide-react';
import Mascot from './Mascot';

export default function KiboBreakOverlay({
  problemsSolved = 0,
  sparksEarned = 0,
  competenceRating = 1000,
  equippedItems = [],
  onOpenWorkshop,
  onResumeClimb
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-pop">
      <div className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        {/* Header Icon */}
        <div className="flex items-center justify-center gap-2 text-amber-800">
          <Coffee className="w-7 h-7 stroke-[2.5]" />
          <h2 className="text-2xl font-black tracking-tight">Time for a Breather!</h2>
        </div>

        {/* Resting Mascot */}
        <div className="flex justify-center py-1">
          <Mascot mood="happy" equipped={equippedItems} className="w-28 h-28 filter drop-shadow-xl animate-bounce" />
        </div>

        <p className="text-sm font-bold text-slate-700 leading-relaxed px-2">
          "Great climbing! Taking a quick break helps your brain build long-term memory." 🏔️✨
        </p>

        {/* Mini Session Stats */}
        <div className="grid grid-cols-3 gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Solved</span>
            <span className="text-lg font-black text-slate-800">{problemsSolved}</span>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-amber-900 block">Earned</span>
            <span className="text-lg font-black text-amber-600">+{sparksEarned} ⚡</span>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-purple-900 block">Rating</span>
            <span className="text-lg font-black text-purple-900">{competenceRating}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onResumeClimb}
            className="btn-3d-orange w-full py-3.5 text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Climbing! 🏔️
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="btn-3d-purple w-full py-3 text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            Visit Workshop 🏪
          </button>
        </div>
      </div>
    </div>
  );
}
