import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, Flag } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function ClimbHeader({
  currentQuestionNum,
  inSessionStreak,
  consumables,
  onExitOrPause,
  onOpenFeedback,
  onTriggerToastBanner
}) {
  const shieldCount = (consumables?.shieldCount || 0) + (consumables?.streakSaverCount || 0);
  const [activeTooltip, setActiveTooltip] = useState(null); // 'streak' | 'shield' | null
  const headerRef = useRef(null);

  // Close tooltip when clicking anywhere outside
  useEffect(() => {
    if (!activeTooltip) return;
    const handlePointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveTooltip(null);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [activeTooltip]);

  return (
    <div ref={headerRef} className="relative w-full max-w-xl mx-auto flex items-center justify-between gap-2 px-2 py-1.5 mb-1 z-30 shrink-0">
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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setActiveTooltip(prev => (prev === 'streak' ? null : 'streak'));
              }}
              className="flex items-center gap-0.5 text-xs font-black bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 text-rose-600 px-2 py-1 rounded-full shadow-2xs cursor-pointer transition-all"
              title="In-session Streak"
              aria-label={`Streak: ${inSessionStreak}. Click for details.`}
              aria-expanded={activeTooltip === 'streak'}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
              <span>{inSessionStreak}</span>
            </button>

            {activeTooltip === 'streak' && (
              <div className="absolute right-0 top-full mt-2 w-56 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-orange-400">
                    <Flame className="w-4 h-4 fill-orange-400" />
                    <span>{inSessionStreak} Answer Streak</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    aria-label="Close streak tooltip"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-slate-200">
                  Solve consecutive questions correctly to boost your streak and earn bonus sparks!
                </p>
                {/* Speech arrow pointing up */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900 border-t border-l border-slate-700/80 rotate-45" />
              </div>
            )}
          </div>
        )}

        {shieldCount > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setActiveTooltip(prev => (prev === 'shield' ? null : 'shield'));
              }}
              className="flex items-center gap-0.5 text-xs font-black bg-sky-50 hover:bg-sky-100 active:scale-95 border border-sky-200 text-sky-700 px-1.5 py-1 rounded-full shadow-2xs cursor-pointer transition-all"
              title="Streak Shield"
              aria-label={`Streak Shield Active: ${shieldCount}. Click for details.`}
              aria-expanded={activeTooltip === 'shield'}
            >
              🛡️ <span className="text-[10px]">{shieldCount}</span>
            </button>

            {activeTooltip === 'shield' && (
              <div className="absolute right-0 top-full mt-2 w-60 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-sky-400">
                    <span>🛡️ Streak Shield</span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-800">
                      {shieldCount} active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(null);
                    }}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    aria-label="Close streak shield tooltip"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-slate-200">
                  Protects your streak if you miss a question! One shield will be consumed instead of resetting your streak to zero.
                </p>
                {/* Speech arrow pointing up */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900 border-t border-l border-slate-700/80 rotate-45" />
              </div>
            )}
          </div>
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
