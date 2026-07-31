import React, { useEffect } from 'react';
import { Target, Play, Compass, Zap, Flame } from 'lucide-react';
import Mascot from './Mascot';
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
    <div
      onClick={handleStart}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 bg-slate-900/70 backdrop-blur-md animate-pop overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-4 sm:p-5 text-center shadow-2xl space-y-3.5 relative my-auto max-h-[92vh] overflow-y-auto cursor-default"
      >
        {/* Mascot Greeting */}
        <Mascot mood="happy" equipped={equippedItems} className="w-28 h-28 mx-auto" />

        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
            Welcome to Kibo Climb! 🏔️
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Adaptive Mastery Engine
          </h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Your personalized math ascent. As you solve, Kibo dynamically adjusts problem difficulty to match your exact skill baseline!
          </p>
        </div>

        {/* Feature Teaser Cards */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-left space-y-1.5 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 stroke-[2.5]" />
            <span><strong>Instant Auto-Detection:</strong> Type answers for continuous flow</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-600 stroke-[2.5]" />
            <span><strong>Organic Baseline:</strong> Dynamic competence scaling (+10⭐/-5⭐)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={handleStart}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Play className="w-5 h-5 fill-current stroke-[2.5]" />
            Start Kibo Climb! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
