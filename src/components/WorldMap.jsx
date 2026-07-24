import React, { useState } from 'react';
import { ArrowLeft, Target, Lock, CheckCircle2, Play, Compass, Award, Star, Zap, X, ShieldAlert } from 'lucide-react';
import Mascot from './Mascot';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';

export default function WorldMap({
  currentTier,
  unlockedTiers,
  equippedItems = [],
  sprintHistory = [],
  onSelectTierAndStartSprint,
  onStartTestOut,
  onStartPlacementTest,
  onBackToHome
}) {
  const [selectedNodeTier, setSelectedNodeTier] = useState(null);

  const handleNodeClick = (tierNum) => {
    soundFx.playKeyTap();
    setSelectedNodeTier(tierNum);
  };

  const handleStartSelectedSprint = () => {
    if (selectedNodeTier) {
      soundFx.playVictory();
      onSelectTierAndStartSprint(selectedNodeTier);
    }
  };

  const handleStartTestOutChallenge = () => {
    if (selectedNodeTier) {
      soundFx.playVictory();
      onStartTestOut(selectedNodeTier);
      setSelectedNodeTier(null);
    }
  };

  const selectedTierMeta = selectedNodeTier
    ? CURRICULUM_TIERS.find((t) => t.tier === selectedNodeTier)
    : null;

  const isSelectedUnlocked = selectedNodeTier ? unlockedTiers.includes(selectedNodeTier) : false;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-3 px-2 sm:px-4 max-w-lg mx-auto animate-pop relative">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b-2 border-slate-200 shrink-0">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-extrabold text-sm"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Home
        </button>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
          <Compass className="w-6 h-6 text-kibo-orange stroke-[2.5]" /> World Map
        </h2>

        <button
          onClick={onStartPlacementTest}
          className="px-3 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold text-xs hover:bg-amber-200 active:scale-95 transition-all shadow-sm flex items-center gap-1"
        >
          <Target className="w-4 h-4 text-amber-600 stroke-[2.5]" /> Placement
        </button>
      </div>

      {/* Winding Mount Kibo Trail Container */}
      <div className="w-full flex-1 overflow-y-auto pr-1 my-2 py-4 relative flex flex-col items-center">
        {/* Summit Peak Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-sm">
            🏔️ Mount Kibo Peak Trail 🏔️
          </span>
        </div>

        {/* 8-Tier Path Nodes */}
        <div className="w-full max-w-sm space-y-6 relative px-4">
          {CURRICULUM_TIERS.slice().reverse().map((tierItem) => {
            const isUnlocked = unlockedTiers.includes(tierItem.tier);
            const isActiveNode = currentTier === tierItem.tier;

            // Determine X offset alignment for winding path (left, center, right)
            const windPositions = ['justify-center', 'justify-start pl-6', 'justify-center', 'justify-end pr-6'];
            const windClass = windPositions[(tierItem.tier - 1) % windPositions.length];

            return (
              <div key={tierItem.tier} className={`w-full flex ${windClass} relative my-2`}>
                {/* Node Button */}
                <div className="relative flex flex-col items-center">
                  {/* Mascot Standing directly on the Active Node */}
                  {isActiveNode && (
                    <div className="absolute -top-16 z-20 animate-bounce flex flex-col items-center">
                      <Mascot mood="happy" equipped={equippedItems} className="w-16 h-16" />
                      <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                        You Are Here
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleNodeClick(tierItem.tier)}
                    className={`w-20 h-20 rounded-3xl border-4 flex flex-col items-center justify-center transition-all relative ${
                      isActiveNode
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-300 shadow-xl ring-4 ring-purple-200 scale-110'
                        : isUnlocked
                        ? 'bg-white text-slate-800 border-teal-400 shadow-lg hover:border-teal-500 active:scale-95'
                        : 'bg-slate-100 text-slate-500 border-slate-300 hover:border-amber-400 active:scale-95 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl">{tierItem.icon}</span>
                    <span className="text-[11px] font-black leading-tight">Tier {tierItem.tier}</span>

                    {/* Lock / Mastered Badge */}
                    {!isUnlocked ? (
                      <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-700 p-1 rounded-full border border-amber-300 shadow-sm">
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-100 text-emerald-700 p-1 rounded-full border border-emerald-300 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </button>

                  {/* Node Label */}
                  <div className="text-center mt-1">
                    <span className="text-xs font-black text-slate-800 block leading-tight">
                      {tierItem.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {tierItem.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NODE MODAL PREVIEW (UNLOCKED & LOCKED STATES) */}
      {selectedNodeTier && selectedTierMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedNodeTier(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="text-4xl p-3 bg-amber-50 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border-2 border-amber-200">
              {selectedTierMeta.icon}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs uppercase font-black text-purple-600 tracking-wider">
                  Station Node • Tier {selectedTierMeta.tier}
                </span>
                {!isSelectedUnlocked && (
                  <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    🔒 Locked
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">{selectedTierMeta.title}</h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedTierMeta.location}</p>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {selectedTierMeta.description}
            </p>

            <div className="space-y-2 pt-1">
              {isSelectedUnlocked ? (
                <button
                  onClick={handleStartSelectedSprint}
                  className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
                >
                  <Play className="w-5 h-5 fill-white stroke-[2.5]" />
                  Start Sprint on Tier {selectedTierMeta.tier}
                </button>
              ) : (
                <button
                  onClick={handleStartTestOutChallenge}
                  className="btn-3d-purple w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300 stroke-[2.5]" />
                  Test Out of Tier {selectedTierMeta.tier} ⚡
                </button>
              )}

              <button
                onClick={() => setSelectedNodeTier(null)}
                className="w-full py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800"
              >
                Back to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Back Button */}
      <button
        onClick={onBackToHome}
        className="btn-3d-teal w-full py-3 mt-2 text-sm rounded-2xl shrink-0 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back to Main Screen
      </button>
    </div>
  );
}
