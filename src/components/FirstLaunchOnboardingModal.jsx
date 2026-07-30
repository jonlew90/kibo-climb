import React, { useEffect } from 'react';
import { Target, Play, Compass, Zap, Flame } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';

export default function FirstLaunchOnboardingModal({
  isOpen,
  equippedItems = [],
  onStartPlacementTest,
  onStartAtTier1
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onStartAtTier1) {
        onStartAtTier1();
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
  }, [isOpen, onStartAtTier1]);

  if (!isOpen) return null;

  const handlePlacement = () => {
    soundFx.playVictory();
    onStartPlacementTest();
  };

  const handleTier1 = () => {
    soundFx.playKeyTap();
    onStartAtTier1();
  };

  return (
    <div
      onClick={handleTier1}
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
            Welcome to Kibo Math! 🏔️
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Find Your Skill Starting Point
          </h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            The 3-minute daily ascent to mental math mastery. Where would you like to start?
          </p>
        </div>

        {/* Feature Teaser Cards */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-left space-y-1.5 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600 stroke-[2.5]" />
            <span><strong>Quick Placement Test:</strong> 10 questions to jump to your level (+50⚡)</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600 stroke-[2.5]" />
            <span><strong>Start at Tier 1:</strong> Begin from the foundation (Single-Digit Math)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handlePlacement}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Target className="w-5 h-5 stroke-[2.5]" />
            Take Placement Test (2 min) 🎯
          </button>

          <button
            onClick={handleTier1}
            className="btn-3d-purple w-full py-3 text-sm rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
          >
            <Play className="w-4 h-4 fill-white stroke-[2.5]" />
            Start at Tier 1 🌱
          </button>
        </div>
      </div>
    </div>
  );
}
