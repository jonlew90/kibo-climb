import React, { useEffect } from 'react';
import { Target, Play, Compass, Zap, Flame, Trophy, ShoppingBag, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';

export default function FirstLaunchOnboardingModal({
  isOpen,
  equippedItems = [],
  onOpenParentZone,
  onStartAdaptiveClimb = () => {},
  onStartPlacementTest,
  onStartAtTier1
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onStartAdaptiveClimb) {
        onStartAdaptiveClimb();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onStartAdaptiveClimb]);

  if (!isOpen) return null;

  const handleStart = () => {
    soundFx.playVictory();
    if (typeof onStartAdaptiveClimb === 'function') onStartAdaptiveClimb();
    else if (typeof onStartAtTier1 === 'function') onStartAtTier1();
    else if (typeof onStartPlacementTest === 'function') onStartPlacementTest();
  };

  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      {/* EXPANDED CONTENT FRAME FOR MAXIMUM SCREEN REAL ESTATE */}
      <div className="w-full max-w-2xl mx-auto min-h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 box-border relative z-10 text-center gap-4">
        
        {/* ZONE 1: HEADER & BRANDING (flex-shrink: 0) */}
        <div className="shrink-0 flex flex-col items-center text-center space-y-2 pt-2">
          <span className="text-xs sm:text-sm font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-1 rounded-full border border-amber-500 shadow-sm inline-block tracking-wider animate-pulse">
            🏔️ Welcome to Kibo Climb
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            Strategic Mental Math Puzzles for Adults & Students
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-purple-900 max-w-lg mx-auto leading-normal">
            Bite-Sized Daily Ascents (~3 Mins) — Adaptive Math Training That Evolves With Your Mind
          </p>
        </div>

        {/* ZONE 2: HERO MASCOT & EXPANDED FEATURE MATRIX */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 py-2 my-auto">
          {/* Hero Mascot Stage */}
          <div className="relative py-2 flex justify-center items-center shrink-0">
            <div className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
            <Mascot
              mood="happy"
              state="idle"
              equipped={equippedItems}
              className="w-auto max-h-[26vh] h-28 sm:h-36 md:h-44 filter drop-shadow-xl animate-bounce object-contain"
            />
          </div>

          {/* Feature Cards Matrix (Responsive 1-col on mobile, 3-col grid on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/95 border-2 border-amber-200/90 rounded-3xl p-3.5 sm:p-5 shadow-xl shrink-0 text-left">
            <div className="flex sm:flex-col items-start gap-3 bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 fill-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Adaptive Engine</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Problems adjust dynamically to your exact skill level as you climb.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start gap-3 bg-orange-50/90 border border-orange-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 fill-orange-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Daily Streaks</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Solve 12 problems daily to build long-term memory & earn Sparks!
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start gap-3 bg-purple-50/90 border border-purple-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Kibo's Corner 🐾</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Unlock hats, outfits, pets, backgrounds, and power-up items!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 3: CALL TO ACTION BUTTON & FOOTER (flex-shrink: 0) */}
        <div className="shrink-0 space-y-2 pt-2 pb-2 w-full">
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d-orange w-full h-16 min-h-[64px] py-4 text-lg sm:text-xl font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-bouncy-orange active:scale-95 transition-all tracking-wide cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white stroke-[2.5]" />
            Start Kibo Climb! 🚀
          </button>

          {onOpenParentZone && (
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                onOpenParentZone();
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              🔒 Parent Zone (Optional Setup)
            </button>
          )}

          <span className="text-xs sm:text-sm font-extrabold text-slate-500 block text-center pt-1">
            Kibo Math by Kibo Climb • Bite-Sized Daily Ascents (~3 Mins)
          </span>
        </div>

      </div>
    </div>
  );
}
