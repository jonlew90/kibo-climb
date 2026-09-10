import React from 'react';
import { X, Flame, Flag } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function ClimbHeader({
  currentQuestionNum,
  inSessionStreak,
  consumables,
  onExitOrPause,
  onOpenFeedback
}) {
  const shieldCount = (consumables?.shieldCount || 0) + (consumables?.streakSaverCount || 0);

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 px-2 py-1.5 mb-1 z-30 shrink-0">
      {/* Left: Clean Exit / Pause button */}
      <button
        type="button"
        onClick={onExitOrPause}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-slate-100 active:scale-90 text-slate-500 hover:text-slate-800 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer shrink-0"
        title="Pause & Save Climb"
        aria-label="Pause Climb"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
      </button>

      {/* Center: Sleek 12-segment progress bar */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between px-1 text-[10px] sm:text-xs font-black text-slate-500">
          <span className="uppercase tracking-wider">Question {currentQuestionNum} of 12</span>
          <span>{Math.round(((currentQuestionNum - 1) / 12) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 sm:h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-500 shadow-xs"
            style={{ width: `${Math.max(5, (currentQuestionNum / 12) * 100)}%` }}
          />
        </div>
      </div>

      {/* Right: Streak & Shield status + Report */}
      <div className="flex items-center gap-1 shrink-0">
        {inSessionStreak >= 2 && (
          <span className="flex items-center gap-0.5 text-xs font-black bg-rose-50 border border-rose-200 text-rose-600 px-2 py-1 rounded-full shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
            <span>{inSessionStreak}</span>
          </span>
        )}
        {shieldCount > 0 && (
          <span
            className="flex items-center gap-0.5 text-xs font-black bg-sky-50 border border-sky-200 text-sky-700 px-1.5 py-1 rounded-full shadow-2xs"
            title="Streak Shield Active"
          >
            🛡️ <span className="text-[10px]">{shieldCount}</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            if (onOpenFeedback) onOpenFeedback();
          }}
          className="p-1 sm:p-1.5 rounded-full border bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200 hover:border-rose-300 shadow-2xs transition-all active:scale-90 flex items-center justify-center cursor-pointer"
          title="Report Question"
          aria-label="Report Question"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
