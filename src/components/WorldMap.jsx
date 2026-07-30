import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Target, Lock, CheckCircle2, Play, Compass, Award, Star, Zap, X, Lightbulb } from 'lucide-react';
import Mascot from './Mascot';
import TierIntroModal from './TierIntroModal';
import PlacementIntroModal from './PlacementIntroModal';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';
import { getTrickForTier } from '../data/mathTricks';
import { calculateTierStars } from '../utils/starCalculator';

const TIER_BADGE_MAP = {
  1: { id: 'perfect_sprint', shortName: 'Accuracy Ace', icon: '🎯' },
  2: { id: 'clock_master', shortName: 'Clock Master', icon: '⏰' },
  3: { id: 'coin_counter', shortName: 'Trail Merchant', icon: '🪙' },
  4: { id: 'master_9s', shortName: '10-Finger Magic', icon: '🖐️' },
  5: { id: 'speed_demon', shortName: 'Speed Demon', icon: '🏃' },
  6: { id: 'clock_master', shortName: 'Clock Master', icon: '⏰' },
  7: { id: 'summit_sync', shortName: 'Summit Sync', icon: '📐' },
  8: { id: 'exponent_peak', shortName: 'Power Peak', icon: '⚡' }
};

export default function WorldMap({
  currentTier,
  unlockedTiers,
  tierMasteryPercent = {},
  equippedItems = [],
  sprintHistory = [],
  unlockedBadges = [],
  onSelectTierAndStartSprint,
  onStartTestOut,
  onStartPlacementTest,
  onBackToHome
}) {
  const [selectedNodeTier, setSelectedNodeTier] = useState(null);
  const [showTierIntroModal, setShowTierIntroModal] = useState(false);
  const [showPlacementIntroModal, setShowPlacementIntroModal] = useState(false);
  const [introModalTier, setIntroModalTier] = useState(1);
  const activeNodeRef = useRef(null);

  useEffect(() => {
    if (activeNodeRef.current) {
      const timer = setTimeout(() => {
        activeNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentTier]);

  useEffect(() => {
    if (selectedNodeTier) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedNodeTier(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
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
      const targetTier = selectedNodeTier;
      setSelectedNodeTier(null);
      onSelectTierAndStartSprint(targetTier);
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
          {(() => {
            const activeTierId = Math.min(8, Math.max(currentTier || 1, ...(unlockedTiers || [1])));
            return CURRICULUM_TIERS.slice().reverse().map((tierItem) => {
              const isUnlocked = unlockedTiers.includes(tierItem.tier);
              const isActiveNode = tierItem.tier === activeTierId;
              const isCompleted = tierItem.tier < activeTierId;

              const badgeInfo = TIER_BADGE_MAP[tierItem.tier];
              const isBadgeUnlocked = unlockedBadges && badgeInfo && unlockedBadges.includes(badgeInfo.id);

              const windPositions = ['justify-center', 'justify-start pl-6', 'justify-center', 'justify-end pr-6'];
              const windIdx = (tierItem.tier - 1) % windPositions.length;
              const windClass = windPositions[windIdx];
              const isRightAligned = windIdx === 3;
              const mascotSideClass = isRightAligned ? '-left-16 sm:-left-20' : '-right-16 sm:-right-20';

            return (
              <div
                key={tierItem.tier}
                ref={isActiveNode ? activeNodeRef : null}
                className={`w-full flex ${windClass} relative my-3`}
              >
                <div className="relative flex flex-col items-center group">
                  {/* Tier Icon Wrapper (Relative Anchor Container) */}
                  <div className="relative flex items-center justify-center tier-icon-wrapper">
                    {/* Mascot Floating on Active Node Icon Shoulder */}
                    {isActiveNode && (
                      <div className="absolute -top-8 -right-2 z-30 kibo-active-sprite pointer-events-none flex flex-col items-center select-none">
                        <Mascot mood="happy" equipped={equippedItems} className="w-12 h-12 sm:w-14 sm:h-14 filter drop-shadow-xl" />
                        <span className="bg-purple-600 text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md border border-purple-300 whitespace-nowrap -mt-1">
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
                  </div>

                  {/* 3-Star Rating & Unlocked Topic Badge Row */}
                  <div className="flex flex-col items-center gap-1 mt-1">
                    {isCompleted && (
                      <div className="flex items-center gap-0.5 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      </div>
                    )}

                    {isBadgeUnlocked && badgeInfo && (
                      <div
                        className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 text-amber-950 border border-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm animate-pop"
                        title={`${badgeInfo.shortName} Badge Unlocked!`}
                      >
                        <span className="text-xs">{badgeInfo.icon}</span>
                        <span>{badgeInfo.shortName}</span>
                      </div>
                    )}
                  </div>

                  {/* Node Title Backplate (Clickable for Topics Breakdown) */}
                  <div
                    onClick={() => handleNodeClick(tierItem.tier)}
                    className="text-center mt-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-amber-50/90 transition-colors group/backplate"
                    title={`Click to view topics covered in Tier ${tierItem.tier}`}
                  >
                    <span className="text-xs font-black text-slate-800 block leading-tight group-hover/backplate:text-amber-900">
                      {tierItem.title}
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-600 block mt-0.5 group-hover/backplate:underline">
                      View Topics Covered →
                    </span>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        </div>
      </div>

      {/* NODE MODAL PREVIEW (UNLOCKED & LOCKED STATES) */}
      {selectedNodeTier && selectedTierMeta && createPortal(
        <div
          onClick={() => setSelectedNodeTier(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[85vh] overflow-y-auto cursor-default"
          >
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

            {/* Topics & Concepts Covered Section */}
            {selectedTierMeta.topics && selectedTierMeta.topics.length > 0 && (
              <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-3 text-left space-y-1.5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider block">
                  📚 Math Topics & Concepts Covered
                </span>
                <ul className="space-y-1">
                  {selectedTierMeta.topics.map((tp, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-700 flex items-start gap-1.5 leading-snug">
                      <span className="text-indigo-600 font-black">•</span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Speed & Associated Badge Info */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                ⏱️ Target: <span className="text-purple-700">{selectedTierMeta.targetSpeed || '2.0s or less / question'}</span>
              </span>
              {selectedTierMeta.associatedBadge && (
                <span className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs">
                  <span>{selectedTierMeta.associatedBadge.icon}</span>
                  <span>{selectedTierMeta.associatedBadge.name}</span>
                </span>
              )}
            </div>

            {/* PROMINENT EARNED STARS & MASTERY DISPLAY */}
            {(() => {
              const tierNum = selectedTierMeta.tier;
              let starsEarned = 0;
              if (tierNum < currentTier) {
                starsEarned = 3;
              } else {
                const tierHistory = sprintHistory.filter((s) => s.tier === tierNum);
                if (tierHistory.length > 0) {
                  starsEarned = Math.max(0, ...tierHistory.map((s) => s.stars || calculateTierStars(s, s.totalTimeSec, selectedTierMeta)));
                }
              }

              const p = tierMasteryPercent[tierNum] !== undefined
                ? tierMasteryPercent[tierNum]
                : (tierNum < currentTier ? 100 : Math.round((starsEarned / 3) * 100));

              return (
                <div className="flex flex-col items-center my-2 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 shadow-sm">
                  {/* EARNED STAR DISPLAY */}
                  <div className="flex items-center gap-2 text-3xl mb-1">
                    {[1, 2, 3].map((starNum) => (
                      <span key={starNum} className="transition-transform hover:scale-110">
                        {starNum <= starsEarned ? "⭐" : "⚪"}
                      </span>
                    ))}
                  </div>

                  {/* STAR COUNT TEXT */}
                  <div className="text-sm font-black text-slate-800">
                    {starsEarned} / 3 Stars Earned
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden mt-2 border border-slate-300 p-0.5">
                    <div
                      className="bg-amber-400 h-full transition-all duration-500 rounded-full shadow-xs"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 mt-1">
                    {p}% Tier Mastery
                  </span>

                  {/* DYNAMIC CRITERIA SUBTEXT */}
                  <div className="text-xs font-extrabold text-amber-950 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300 mt-2">
                    {starsEarned === 3
                      ? "🏆 Tier Fully Mastered! 3/3 Stars Earned."
                      : starsEarned === 0
                      ? "Target: Complete 1 sprint to earn your 1st Star! ⭐"
                      : `Target: Achieve ≥90% accuracy on a sprint to earn Star #${starsEarned + 1}! ⭐`}
                  </div>
                </div>
              );
            })()}

            {/* Dynamic Star Criteria Legend Card */}
            {(() => {
              const problemCount = selectedTierMeta.problemCount || 20;
              const targetSpeed = selectedTierMeta.targetSpeedPerQuestion || 2.0;
              const time3Star = problemCount * targetSpeed;
              const time2Star = time3Star * 1.5;

              return (
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-2.5 text-left space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    ⭐ Star Mastery Criteria
                  </span>
                  <div className="text-[11px] font-semibold text-slate-700 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span>⭐ 1 Star</span>
                      <span className="text-slate-500 font-bold">Pass Sprint (≥80% Accuracy)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>⭐⭐ 2 Stars</span>
                      <span className="text-slate-600 font-bold">Proficiency (≥90% in ≤{time2Star}s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>⭐⭐⭐ 3 Stars</span>
                      <span className="text-amber-800 font-extrabold">Mastery (≥95% in ≤{time3Star}s)</span>
                    </div>
                  </div>
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
                  {selectedTierMeta.tier === 8 ? 'Summit Mastered 🏆' : 'Replay Sprint 🔄'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStartSelectedSprint}
                    className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
                  >
                    <Play className="w-5 h-5 fill-white stroke-[2.5]" />
                    Start Sprint ⚡
                  </button>

                  <button
                    onClick={handleStartTestOutChallenge}
                    className="btn-3d-purple w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
                  >
                    <Zap className="w-5 h-5 fill-amber-300 text-amber-300 stroke-[2.5]" />
                    {selectedTierMeta.tier === 8
                      ? 'Take Summit Challenge 🎯'
                      : `Test Out of Tier ${selectedTierMeta.tier} 🎯`}
                  </button>
                </>
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
