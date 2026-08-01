import React, { useEffect } from 'react';
import { Target, Play, Compass, Zap, Flame, Trophy, ShoppingBag, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';

export default function FirstLaunchOnboardingModal({
  isOpen,
  equippedItems = [],
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
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      {/* CENTERED CONTENT FRAME WITH 3-ZONE FLEX ALLOCATION */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-4 sm:p-5 box-border relative z-10 text-center">
        {/* ZONE 1: HEADER & TOP HUD (flex-shrink: 0) */}
        <div className="shrink-0 flex flex-col items-center text-center space-y-1">
          <span className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Welcome to Kibo Climb
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            The 3-Minute Daily Ascent
          </h1>
          <p className="text-xs sm:text-sm font-bold text-purple-900">
            Build math mastery with adaptive daily climbs!
          </p>
        </div>

        {/* ZONE 2: HERO MASCOT & FEATURE CARDS (flex: 1, display: flex, flex-direction: column, justify-content: center) */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 py-2">
          {/* Hero Mascot Welcome Stage */}
          <div className="relative py-1 flex justify-center items-center shrink-0">
            <div className="absolute w-28 h-28 rounded-full bg-amber-400/25 blur-xl animate-pulse pointer-events-none" />
            <Mascot
              mood="happy"
              state="idle"
              equipped={equippedItems}
              className="w-auto max-h-[22vh] h-24 sm:h-32 filter drop-shadow-md animate-bounce object-contain"
            />
          </div>

          {/* Feature Cards Matrix */}
          <div className="space-y-2 text-left bg-white/95 border-2 border-amber-200 rounded-2xl p-3 sm:p-4 shadow-md shrink-0">
            <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Adaptive Mastery Engine</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  Problems adjust dynamically to your exact skill level as you climb.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-orange-50/80 border border-orange-200/80 rounded-xl p-2.5">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Daily Climbing Streaks</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  Solve 12 problems a day to build long-term memory & earn Sparks!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-purple-50/80 border border-purple-200/80 rounded-xl p-2.5">
              <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Kibo's Gear Workshop</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  Unlock hats, outfits, pets, backgrounds, and power-up consumables!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 3: PRIMARY ACTION BUTTONS & FOOTER (flex-shrink: 0) */}
        <div className="shrink-0 space-y-2 pt-1 w-full">
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d-orange w-full h-14 min-h-[56px] py-3.5 text-base sm:text-lg font-black rounded-xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Start Kibo Climb! 🚀
          </button>

          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block text-center pt-1">
            Kibo Math by Kibo Climb • The 3-Minute Daily Ascent
          </span>
        </div>
      </div>
    </div>
  );
}
