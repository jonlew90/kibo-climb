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
    <div className="fixed inset-0 z-[999] h-screen max-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 overflow-hidden text-white select-none animate-pop">
      <ConfettiCanvas />

      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between py-2 relative z-10 text-center">
        {/* Fullscreen Banner Header */}
        <div className="space-y-1 shrink-0">
          <span className="text-[10px] font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3.5 py-1 rounded-full border border-amber-400 shadow-xs inline-block tracking-wider animate-pulse">
            🏔️ Welcome to Kibo Climb
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            The 3-Minute Daily Ascent
          </h1>
          <p className="text-xs font-semibold text-purple-200">
            Build math mastery with adaptive daily climbs!
          </p>
        </div>

        {/* Hero Mascot Welcome Stage */}
        <div className="relative py-1 flex justify-center items-center shrink-0">
          <div className="absolute w-44 h-44 rounded-full bg-purple-500/20 blur-2xl animate-pulse pointer-events-none" />
          <Mascot
            mood="happy"
            state="idle"
            equipped={equippedItems}
            className="w-28 h-28 sm:w-32 sm:h-32 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] animate-bounce-slow"
          />
        </div>

        {/* Feature Cards Matrix */}
        <div className="space-y-2 text-left bg-slate-900/80 border border-purple-400/30 rounded-2xl p-3.5 backdrop-blur-md shadow-xl shrink-0">
          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-white">Adaptive Mastery Engine</h4>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Problems adjust dynamically to your exact skill level as you climb.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-white">Daily Climbing Streaks</h4>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Solve 12 problems a day to build long-term memory & earn Sparks!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <ShoppingBag className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-white">Kibo's Gear Workshop</h4>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Unlock hats, outfits, pets, backgrounds, and power-up consumables!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 shrink-0">
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d-orange w-full py-4 text-base sm:text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Start Kibo Climb! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
