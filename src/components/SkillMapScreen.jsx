import React from 'react';
import { ArrowLeft, Target, Lock, CheckCircle2, Play, Compass, Award, Star, Flame } from 'lucide-react';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';

export default function SkillMapScreen({
  currentTier,
  unlockedTiers,
  onSelectTier,
  onStartPlacementTest,
  onBackToHome
}) {
  const handleSelect = (tierNum) => {
    soundFx.playKeyTap();
    onSelectTier(tierNum);
  };

  const handlePlacementClick = () => {
    soundFx.playVictory();
    onStartPlacementTest();
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between py-3 px-2 sm:px-4 max-w-lg mx-auto animate-pop">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b-2 border-slate-200">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-extrabold text-sm"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Home
        </button>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
          <Compass className="w-6 h-6 text-kibo-orange stroke-[2.5]" /> Skill Map
        </h2>

        <button
          onClick={handlePlacementClick}
          className="px-3 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold text-xs hover:bg-amber-200 active:scale-95 transition-all shadow-sm flex items-center gap-1"
        >
          <Target className="w-4 h-4 text-amber-600 stroke-[2.5]" /> Placement
        </button>
      </div>

      {/* Hero Placement Test Banner */}
      <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-kibo-orange text-amber-950 rounded-3xl p-4 my-3 border-3 border-amber-300 shadow-md flex items-center justify-between">
        <div className="space-y-1 text-left max-w-[220px]">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/40 px-2 py-0.5 rounded-full inline-block text-amber-950">
            Quick Diagnostic
          </span>
          <h3 className="text-base font-extrabold leading-tight text-slate-900">Find Your Starting Tier!</h3>
          <p className="text-xs font-semibold opacity-90 text-slate-900">
            Take a 10-problem diagnostic test to auto-place your optimal tier.
          </p>
        </div>

        <button
          onClick={handlePlacementClick}
          className="btn-3d-orange px-4 py-2.5 text-xs rounded-2xl shrink-0 flex items-center gap-1"
        >
          <Target className="w-4 h-4" /> Start Test
        </button>
      </div>

      {/* 8-Station Mountain Trail Map */}
      <div className="w-full flex-1 overflow-y-auto space-y-4 pr-1 my-2 py-2 relative">
        <div className="text-center mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Roadmap to Mount Kibo Peak 🏔️
          </span>
        </div>

        {CURRICULUM_TIERS.map((tierItem) => {
          const isUnlocked = unlockedTiers.includes(tierItem.tier);
          const isActive = currentTier === tierItem.tier;

          return (
            <div
              key={tierItem.tier}
              className={`relative rounded-3xl p-4 border-3 transition-all ${
                isActive
                  ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-100 scale-[1.02]'
                  : isUnlocked
                  ? 'bg-white border-slate-200 shadow-md hover:border-slate-300'
                  : 'bg-slate-100 border-slate-200 opacity-75'
              }`}
            >
              {/* Station Node Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
                    {tierItem.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-purple-600 tracking-wider">
                        Tier {tierItem.tier} • {tierItem.location}
                      </span>
                      {isActive && (
                        <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-base sm:text-lg leading-tight">
                      {tierItem.title}
                    </h4>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <div className="p-2 bg-slate-200 rounded-2xl text-slate-500">
                      <Lock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle & Description */}
              <p className="text-xs text-slate-600 font-medium text-left mb-3">
                {tierItem.description}
              </p>

              {/* Action Area */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  {tierItem.subtitle}
                </span>

                {isUnlocked ? (
                  <button
                    onClick={() => handleSelect(tierItem.tier)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                      isActive
                        ? 'btn-3d-purple'
                        : 'btn-3d-teal'
                    }`}
                  >
                    {isActive ? 'Currently Active' : 'Select & Practice'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">
                    Complete Tier {tierItem.tier - 1} to Unlock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Back Button */}
      <button
        onClick={onBackToHome}
        className="btn-3d-teal w-full py-3 mt-2 text-base rounded-2xl flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back to Main Screen
      </button>
    </div>
  );
}
