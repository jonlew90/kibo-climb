import React from 'react';
import { Target, Zap, MapPin, Compass, Trophy } from 'lucide-react';
import Mascot from './Mascot';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';

export default function PlacementRevealModal({
  isOpen,
  placedTier,
  equippedItems = [],
  onGoToWorldMap
}) {
  if (!isOpen) return null;

  const tierMeta = CURRICULUM_TIERS.find((t) => t.tier === placedTier) || CURRICULUM_TIERS[0];

  const handleGoToMap = () => {
    soundFx.playVictory();
    onGoToWorldMap();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-6 text-center shadow-2xl space-y-4">
        {/* Mascot Header */}
        <div className="relative mx-auto w-28 h-28">
          <Mascot mood="celebrate" equipped={equippedItems} className="w-28 h-28" />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1.5 rounded-full border-2 border-white shadow-lg animate-bounce">
            <Trophy className="w-5 h-5 text-amber-900 fill-amber-300 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Placement Results */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-600 tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Diagnostic Placement Result
          </span>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Tier {placedTier} Unlocked! 🎉
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Based on your speed and accuracy, you are placed in:
          </p>
        </div>

        {/* Station Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-3 text-purple-950 space-y-1 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-purple-700 font-extrabold text-sm">
            <span>{tierMeta.icon}</span>
            <span>{tierMeta.title}</span>
          </div>
          <p className="text-xs font-bold text-slate-600">
            Station: <span className="text-purple-900 font-extrabold">{tierMeta.location}</span>
          </p>
        </div>

        {/* +50 Bonus Sparks Reward Card */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-center gap-2 text-amber-950 shadow-sm">
          <Zap className="w-6 h-6 text-amber-600 fill-amber-400 stroke-[2.5] animate-pulse" />
          <span className="font-black text-base">+50 Diagnostic Bonus Sparks! ⚡</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoToMap}
          className="btn-3d-purple w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
        >
          <Compass className="w-5 h-5 stroke-[2.5]" />
          Go to World Map 🗺️
        </button>
      </div>
    </div>
  );
}
