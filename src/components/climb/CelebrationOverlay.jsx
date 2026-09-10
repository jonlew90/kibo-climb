import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap } from 'lucide-react';
import ConfettiCanvas from '../ConfettiCanvas';
import { storageService } from '../../services/storageService';

export default function CelebrationOverlay({
  celebrationEvent,
  onDismiss,
  profileId
}) {
  if (!celebrationEvent || typeof document === 'undefined') return null;


  const hasVIP = Boolean(storageService?.hasClubMembership?.(profileId));
  const finalSparks = hasVIP ? Math.round(celebrationEvent.bonusSparks * 1.25) : celebrationEvent.bonusSparks;

  return createPortal(
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <ConfettiCanvas />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-amber-50 via-white to-yellow-50 border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative overflow-hidden text-slate-800 cursor-default"
      >
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 inline-block shadow-xs">
            {celebrationEvent.title}
          </span>
        </div>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-600 flex items-center justify-center text-4xl shadow-clay-amber animate-pulse">
          {celebrationEvent.icon}
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">{celebrationEvent.name}</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {celebrationEvent.description}
          </p>
        </div>

        <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-amber-950 font-black text-xs sm:text-sm shadow-xs animate-pulse">
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5]" />
            {hasVIP && (
              <span className="line-through text-amber-900/50 text-xs">
                +{celebrationEvent.bonusSparks} ⚡
              </span>
            )}
            <span>
              +{finalSparks} Bonus Sparks Awarded! ⚡
            </span>
          </div>
          {hasVIP && (
            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-1.5 py-0.2 rounded-md font-black border border-amber-300">
              👑 1.25x VIP
            </span>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm sm:text-base py-3 px-6 rounded-2xl shadow-md border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 transition-all cursor-pointer"
        >
          Keep Climbing 🚀
        </button>
      </div>
    </div>,
    document.body
  );
}
