import React from 'react';
import { Play } from 'lucide-react';
import ItemThumbnail from '../ItemThumbnail';

export default function ClimbPreCard({
  isAutoPaused,
  savedClimbState,
  consumables,
  isDoubleSparksActive,
  onToggleDoubleSparksPotion,
  onTriggerToastBanner,
  onOpenWorkshop,
  onStartClimb,
  onResumeClimb
}) {
  const isResumeAvailable = savedClimbState && savedClimbState.sessionQuestionIndex <= 12;
  const ownedDoubleSparks = consumables?.doubleSparksPotionCount ?? consumables?.doubleCoinPotionCount ?? 0;

  return (
    <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-4 sm:p-5 text-center shadow-xl space-y-3 relative overflow-hidden animate-pop flex flex-col justify-center max-h-[42vh]">
      <div className="space-y-1.5">
        <span className="text-xs sm:text-sm font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block shadow-2xs">
          {isAutoPaused
            ? '⏸️ Climb Auto-Paused'
            : isResumeAvailable
            ? `🏔️ Mountain Climb • Question ${savedClimbState.sessionQuestionIndex || 1} of 12`
            : '🏔️ Mountain Climb • 12 Problems'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          {isAutoPaused
            ? 'Are you still climbing?'
            : isResumeAvailable
            ? 'Climb in Progress!'
            : 'Ready for the Climb?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
          {isAutoPaused
            ? 'We paused your climb and timer so your speed record and streak stay safe! Click Resume to keep going.'
            : isResumeAvailable
            ? 'Click Resume Climb to continue where you left off.'
            : 'Click Start Climb when you are ready! Your timer will begin as soon as you start.'}
        </p>
      </div>

      {/* START / RESUME CLIMB MAIN CTA BUTTON */}
      <div className="w-full space-y-1.5 order-2">
        <button
          type="button"
          onClick={isResumeAvailable ? onResumeClimb : onStartClimb}
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xl sm:text-2xl py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
        >
          <Play className="w-7 h-7 fill-current" />
          <span>{isResumeAvailable ? 'RESUME CLIMB 🏔️' : 'START CLIMB 🏔️'}</span>
        </button>
      </div>

      {/* PRE-CLIMB POWERUPS & CONSUMABLES SELECTOR */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-1 order-1">
        {isDoubleSparksActive ? (
          <span className="text-xs sm:text-sm font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 animate-pulse shadow-xs flex items-center gap-1.5">
            <ItemThumbnail itemId="double_sparks_potion" borderless className="w-4 h-4 shrink-0" />
            <span>2x Sparks Active!</span>
          </span>
        ) : !isResumeAvailable ? (
          ownedDoubleSparks > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (onToggleDoubleSparksPotion) {
                  onToggleDoubleSparksPotion();
                  if (onTriggerToastBanner) {
                    onTriggerToastBanner({
                      type: 'success',
                      text: 'Double Sparks Potion Activated for this climb! 🧪'
                    }, 1400);
                  }
                }
              }}
              className="text-xs sm:text-sm font-black uppercase px-3 py-1 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border-amber-500 hover:from-amber-400 hover:to-yellow-500 shadow-sm animate-pulse cursor-pointer"
            >
              <ItemThumbnail itemId="double_sparks_potion" borderless className="w-4 h-4 shrink-0" />
              <span>Activate 2x Potion ({ownedDoubleSparks})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenWorkshop) {
                  onOpenWorkshop();
                } else if (onTriggerToastBanner) {
                  onTriggerToastBanner({
                    type: 'info',
                    text: 'Opening Shop to get 2x Potions! 🧪'
                  }, 1400);
                }
              }}
              className="text-xs sm:text-sm font-black uppercase px-3 py-1 rounded-full border border-dashed border-amber-400/80 bg-amber-50/70 hover:bg-amber-100 text-amber-900 transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Get 2x Sparks Potion in the Shop to double sparks this climb!"
            >
              <ItemThumbnail itemId="double_sparks_potion" borderless className="w-4 h-4 shrink-0 opacity-80" />
              <span>Get 2x Potion +</span>
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
