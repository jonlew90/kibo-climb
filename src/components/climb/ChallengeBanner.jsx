import React from 'react';

export default function ChallengeBanner({
  isProbe = false,
  isGatekeeper = false,
  isDoubleSparks = false,
  concept = null
}) {
  if (!isProbe && !isGatekeeper && !isDoubleSparks && !concept) {
    return null;
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto px-2 mb-1 shrink-0 animate-pop">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-indigo-200/80 shadow-2xs backdrop-blur-xs text-xs font-bold text-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {isProbe && (
            <span className="font-black uppercase text-white bg-gradient-to-r from-amber-500 to-indigo-600 px-2 py-0.5 rounded-full border border-indigo-300 text-[10px] leading-none shrink-0 shadow-2xs animate-pulse">
              🚀 Probe (+120)
            </span>
          )}
          {isGatekeeper && !isProbe && (
            <span className="font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 rounded-full border border-amber-500 text-[10px] leading-none shrink-0 shadow-2xs animate-pulse">
              ⚡ Gatekeeper
            </span>
          )}
          {concept && (
            <span className="font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 text-[10px] leading-none shrink-0">
              {concept}
            </span>
          )}
          <span className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight">
            {isProbe
              ? 'Calibrating skill rating with an advanced challenge!'
              : isGatekeeper
              ? '1 question away from entering the next skill tier!'
              : concept
              ? 'Mastering this topic drill!'
              : 'Special Challenge Active'}
          </span>
        </div>

        {isDoubleSparks && (
          <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md font-black border border-amber-500 leading-none shrink-0 shadow-2xs">
            2x Sparks ⚡
          </span>
        )}
      </div>
    </div>
  );
}
