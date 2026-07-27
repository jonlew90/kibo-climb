import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Target, Lock, CheckCircle2, Play, Compass, Award, Star, Zap, X, Lightbulb } from 'lucide-react';
import Mascot from './Mascot';
import TierIntroModal from './TierIntroModal';
import PlacementIntroModal from './PlacementIntroModal';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';
import { getTrickForTier } from '../data/mathTricks';

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
  const [showTierIntroModal, setShowTierIntroModal] = useState(false);
  const [showPlacementIntroModal, setShowPlacementIntroModal] = useState(false);
  const [introModalTier, setIntroModalTier] = useState(1);

  useEffect(() => {
    if (selectedNodeTier) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedNodeTier]);

  const handleNodeClick = (tierNum) => {
    soundFx.playKeyTap();
    setSelectedNodeTier(tierNum);
  };

  const handleOpenKiboTip = (tierNum) => {
    soundFx.playKeyTap();
    setIntroModalTier(tierNum);
    setShowTierIntroModal(true);
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
  const isSelectedCompleted = selectedNodeTier ? selectedNodeTier < currentTier : false;
  const isSelectedActive = selectedNodeTier ? selectedNodeTier === currentTier : false;
  const isSelectedLocked = selectedNodeTier ? selectedNodeTier > currentTier && !unlockedTiers.includes(selectedNodeTier) : false;

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
          onClick={() => {
            soundFx.playKeyTap();
            setShowPlacementIntroModal(true);
          }}
          className="px-3 py-1.5 bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400 border-2 border-amber-500 rounded-2xl text-amber-950 font-black text-xs hover:from-amber-100 hover:to-amber-300 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          title="Skip levels you've already mastered"
        >
          <Target className="w-4 h-4 text-amber-900 fill-amber-300 stroke-[2.5]" />
          <span>Test Out 🎯</span>
        </button>
      </div>

      {/* Winding Mount Kibo Trail Container */}
      <div className="w-full flex-1 overflow-y-auto pr-1 my-2 py-4 relative flex flex-col items-center">
        {/* Summit Peak Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-sm">
            🏔️ Mount Kibo Ascent 🏔️
          </span>
        </div>

        {/* 8-Tier Path Nodes with 3D Clay Badges */}
        <div className="w-full max-w-sm space-y-7 relative px-4 z-10">
          {CURRICULUM_TIERS.slice().reverse().map((tierItem) => {
            const isUnlocked = unlockedTiers.includes(tierItem.tier);
            const isActiveNode = currentTier === tierItem.tier;
            const isCompleted = tierItem.tier < currentTier || (isUnlocked && !isActiveNode);

            const windPositions = ['justify-center', 'justify-start pl-6', 'justify-center', 'justify-end pr-6'];
            const windIdx = (tierItem.tier - 1) % windPositions.length;
            const windClass = windPositions[windIdx];
            const isRightAligned = windIdx === 3;
            const mascotSideClass = isRightAligned ? '-left-16 sm:-left-20' : '-right-16 sm:-right-20';

            return (
              <div key={tierItem.tier} className={`w-full flex ${windClass} relative my-3`}>
                <div className="relative flex flex-col items-center group">
                  {/* Mascot Standing Beside the Active Node Badge */}
                  {isActiveNode && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${mascotSideClass} z-5 animate-map-bounce pointer-events-none flex flex-col items-center select-none`}>
                      <Mascot mood="happy" equipped={equippedItems} className="w-14 h-14 filter drop-shadow-xl" />
                      <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md border border-purple-300 whitespace-nowrap">
                        Current Base
                      </span>
                    </div>
                  )}

                  {/* 3D Clay Node Badge Container */}
                  <button
                    onClick={() => handleNodeClick(tierItem.tier)}
                    className={`relative z-20 pointer-events-auto w-24 h-24 rounded-3xl border-b-4 flex flex-col items-center justify-center transition-all duration-200 clay-node ${
                      isActiveNode
                        ? 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-amber-950 border-amber-900 shadow-bouncy-orange ring-4 ring-amber-300/90 scale-110'
                        : isUnlocked
                        ? 'bg-gradient-to-b from-emerald-400 via-teal-500 to-teal-700 text-white border-teal-950 shadow-clay-teal hover:scale-105 active:translate-y-1 active:border-b-0'
                        : 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-500 border-slate-600 opacity-60 hover:opacity-100 shadow-sm'
                    }`}
                  >
                    <div className="absolute inset-1 rounded-2xl bg-black/10 backdrop-blur-xs flex flex-col items-center justify-center p-1">
                      <span className="text-3xl filter drop-shadow-md">{tierItem.icon}</span>
                      <span className="text-[11px] font-black tracking-tight leading-none mt-1">Tier {tierItem.tier}</span>
                    </div>

                    {/* Status Badges */}
                    {!isUnlocked ? (
                      <div className="absolute -top-2 -right-2 bg-slate-800 text-slate-200 p-1.5 rounded-full border-2 border-slate-600 shadow-lg">
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : isCompleted ? (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : null}
                  </button>

                  {/* 3-Star Rating Row for Completed Nodes */}
                  {isCompleted && (
                    <div className="flex items-center gap-0.5 mt-1 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    </div>
                  )}

                  {/* Node Title Backplate */}
                  <div className="text-center mt-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-black text-slate-800 block leading-tight">
                      {tierItem.title}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 block">
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
      {selectedNodeTier && selectedTierMeta && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[85vh] overflow-y-auto">
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
                {isSelectedCompleted ? (
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    🟢 Mastered
                  </span>
                ) : isSelectedActive ? (
                  <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    ⚡ Current Station
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                    🔒 Locked
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">
                {isSelectedLocked ? `Tier ${selectedTierMeta.tier}: Locked 🔒` : selectedTierMeta.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedTierMeta.location}</p>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {isSelectedLocked
                ? `Complete Tier ${selectedTierMeta.tier - 1} or pass the Tier ${selectedTierMeta.tier} challenge to jump ahead!`
                : selectedTierMeta.description}
            </p>

            {/* Pro Tip 💡 Box */}
            {(() => {
              const nodeTrick = getTrickForTier(selectedTierMeta.tier);
              if (!nodeTrick) return null;

              return (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-2.5 text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{nodeTrick.icon}</span>
                    <h5 className="font-extrabold text-amber-950 text-xs">
                      Pro Tip: {nodeTrick.title}
                    </h5>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-900 leading-snug">
                    {nodeTrick.summary}
                  </p>
                </div>
              );
            })()}

            {/* Kibo Tip 💡 Button */}
            <button
              onClick={() => handleOpenKiboTip(selectedTierMeta.tier)}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300 stroke-[2.5]" />
              Kibo's Mental Math Tip 💡
            </button>

            <div className="space-y-2 pt-1">
              {isSelectedCompleted ? (
                <button
                  onClick={handleStartSelectedSprint}
                  className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
                >
                  <Play className="w-5 h-5 fill-white stroke-[2.5]" />
                  Replay Sprint 🔄
                </button>
              ) : isSelectedActive || isSelectedUnlocked ? (
                <button
                  onClick={handleStartSelectedSprint}
                  className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
                >
                  <Play className="w-5 h-5 fill-white stroke-[2.5]" />
                  Start Sprint ⚡
                </button>
              ) : (
                <button
                  onClick={handleStartTestOutChallenge}
                  className="btn-3d-purple w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300 stroke-[2.5]" />
                  Test Out of Tier {selectedTierMeta.tier} 🎯
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
        </div>,
        document.body
      )}

      {/* PLACEMENT DIAGNOSTIC INTRO MODAL OVERLAY */}
      <PlacementIntroModal
        isOpen={showPlacementIntroModal}
        onClose={() => setShowPlacementIntroModal(false)}
        onStartDiagnostic={() => {
          setShowPlacementIntroModal(false);
          onStartPlacementTest();
        }}
      />

      {/* TIER INTRO MODAL OVERLAY */}
      <TierIntroModal
        isOpen={showTierIntroModal}
        tierLevel={introModalTier}
        equippedItems={equippedItems}
        onStartSprint={(t) => {
          setShowTierIntroModal(false);
          setSelectedNodeTier(null);
          onSelectTierAndStartSprint(t);
        }}
        onClose={() => setShowTierIntroModal(false)}
      />

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
