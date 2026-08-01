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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-extrabold text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2 text-slate-800">
          <Compass className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">Skill Map & Curriculum</h2>
        </div>

        <button
          onClick={handlePlacementClick}
          className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 font-black text-xs hover:bg-amber-200 active:scale-95 transition-all shadow-xs flex items-center gap-1"
        >
          <Target className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          <span>Placement Test</span>
        </button>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Hero Placement Test Banner */}
        <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 rounded-3xl p-4 border-3 border-amber-300 shadow-md flex items-center justify-between">
          <div className="space-y-1 text-left max-w-[220px]">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-full inline-block text-amber-950">
              Quick Diagnostic
            </span>
            <h3 className="font-black text-sm sm:text-base leading-snug">
              Find Your Perfect Starting Level! ⚡
            </h3>
            <p className="text-[11px] font-bold text-amber-900 leading-tight">
              Takes 3 minutes • Automatically unlocks matching curriculum levels.
            </p>
          </div>

          <button
            onClick={handlePlacementClick}
            className="btn-3d-teal py-2.5 px-4 text-xs font-black rounded-2xl shadow-lg shrink-0 flex items-center gap-1.5"
          >
            <span>Take Test</span>
            <Play className="w-4 h-4 fill-white stroke-[2.5]" />
          </button>
        </div>

        {/* Level Path Cards */}
        <div className="space-y-3 pb-6">
          {Object.entries(CURRICULUM_TIERS).map(([tierKey, config]) => {
            const tierNum = parseInt(tierKey, 10);
            const isUnlocked = unlockedTiers ? unlockedTiers.includes(tierNum) : tierNum <= 1;
            const isCurrent = currentTier === tierNum;

            return (
              <div
                key={tierNum}
                onClick={() => isUnlocked && handleSelect(tierNum)}
                className={`p-4 rounded-3xl border-3 transition-all flex items-center justify-between relative shadow-sm ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/40 cursor-pointer shadow-md'
                    : isUnlocked
                    ? 'bg-white border-slate-200 hover:border-amber-300 cursor-pointer'
                    : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-inner shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-clay-amber'
                        : isUnlocked
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-slate-200 border-slate-300 text-slate-400'
                    }`}
                  >
                    {tierNum}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                        {config.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse">
                          Active Level
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold max-w-xs">
                      {config.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isCurrent ? (
                    <div className="p-2 bg-amber-400 text-amber-950 rounded-2xl border-2 border-amber-600 shadow-md">
                      <Play className="w-5 h-5 fill-amber-950 stroke-[2.5]" />
                    </div>
                  ) : isUnlocked ? (
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 inline-flex items-center gap-1">
                      Select
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Level {tierNum}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* STICKY BOTTOM ACTION FOOTER */}
      <footer className="w-full bg-white/95 border-t-2 border-slate-200 p-3 sm:p-4 backdrop-blur-md shrink-0 flex items-center justify-center z-10">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onBackToHome();
          }}
          className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base py-3 px-8 rounded-2xl shadow-lg shadow-amber-500/30 border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 transition-all text-center"
        >
          Back to Main Screen 🏔️
        </button>
      </footer>
    </div>
  );
}
