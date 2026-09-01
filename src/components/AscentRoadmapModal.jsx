import React, { useState, useEffect } from 'react';
import { Mountain, Sparkles, Check, X } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { questService } from '../services/questService';
import { storageService } from '../services/storageService';
import { ASCENT_MODES, ASCENT_RANKS } from '../data/questsData';

export default function AscentRoadmapModal({
  isOpen,
  onClose,
  profileId,
  initialTab = 'levels'
}) {
  const [levelRoadmapTab, setLevelRoadmapTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setLevelRoadmapTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const activeProfileId = profileId || storageService.getActiveProfileId();
  const questState = questService.getQuests(activeProfileId);

  const levelInfo = questState?.levelInfo || {
    level: 1,
    title: 'Basecamp Explorer',
    icon: '🏕️',
    ascentTier: 1,
    ascentMode: ASCENT_MODES[0],
    currentXp: 0,
    xpIntoLevel: 0,
    xpRequiredForLevel: 150,
    progressPct: 0,
    sparkBonusPct: 0
  };

  const ascentTier = levelInfo.ascentTier || 1;
  const ascentMode = levelInfo.ascentMode || ASCENT_MODES[0];
  const currentTotalXp = questState?.totalXp || levelInfo.currentXp || 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-fade-in text-slate-800"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-emerald-200 overflow-hidden cursor-default flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-scaleIn"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Mountain className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                Expedition Ascents & Level Roadmap
              </h3>
              <p className="text-[11px] text-teal-100">
                Conquer 10 levels per Ascent to unlock harder weather & permanent perks!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="bg-emerald-100/70 p-1.5 flex items-center gap-1 border-b border-emerald-200">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setLevelRoadmapTab('levels');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              levelRoadmapTab === 'levels'
                ? 'bg-white text-teal-950 shadow-xs ring-1 ring-emerald-300'
                : 'text-teal-800 hover:bg-white/40'
            }`}
          >
            <span>🧗</span>
            <span>Ascent Levels (1–10)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setLevelRoadmapTab('tiers');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              levelRoadmapTab === 'tiers'
                ? 'bg-white text-teal-950 shadow-xs ring-1 ring-emerald-300'
                : 'text-teal-800 hover:bg-white/40'
            }`}
          >
            <span>🏔️</span>
            <span>Ascent Tiers (1–5)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 custom-scrollbar flex-1">
          
          {/* TAB 1: The 10 Core Mountain Levels per Ascent */}
          {levelRoadmapTab === 'levels' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Top Hero Card */}
              <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                      <span>{ascentMode.icon}</span>
                      <span>Ascent {ascentTier}: {ascentMode.name}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                      Lv. {levelInfo.level}
                    </span>
                    {levelInfo.sparkBonusPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{levelInfo.sparkBonusPct}% Permanent Sparks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 pt-1.5">
                    <span className="text-3xl sm:text-4xl drop-shadow-xs">{levelInfo.icon || '🏕️'}</span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {levelInfo.title}
                      </h3>
                      <p className="text-teal-100 text-xs sm:text-sm font-bold">
                        {currentTotalXp}m Total Mountain Altitude XP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-black/25 h-3.5 rounded-full overflow-hidden border border-white/20">
                    <div
                      className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${levelInfo.progressPct || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs font-black text-teal-100">
                    <span>{levelInfo.xpIntoLevel || 0}m / {levelInfo.xpRequiredForLevel || 150}m in Level {levelInfo.level}</span>
                    <span>{levelInfo.progressPct || 0}% to Lv. {(levelInfo.level || 1) + 1} ({levelInfo.nextRankTitle || 'Next Rank'})</span>
                  </div>
                </div>
              </div>

              {/* 10 Level Track Cards */}
              <div className="space-y-1.5">
                {ASCENT_RANKS.map((rank) => {
                  const currentLvl = levelInfo.level || 1;
                  const isCurrent = currentLvl === rank.level;
                  const isReached = currentLvl >= rank.level;

                  return (
                    <div
                      key={rank.level}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 text-left ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                          : isReached
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{rank.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              isCurrent ? 'bg-amber-400 text-amber-950' : isReached ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                            }`}>
                              Lv. {rank.level}
                            </span>
                            <span className="font-black text-xs text-slate-800">
                              {rank.title}
                            </span>
                          </div>

                          {rank.reward && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5 flex-wrap">
                              {rank.reward.sparks && (
                                <span className="inline-flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                  +{rank.reward.sparks}
                                </span>
                              )}
                              {rank.reward.potions ? ` • 🧪+${rank.reward.potions}` : ''}
                              {rank.reward.scrolls ? ` • 📜+${rank.reward.scrolls}` : ''}
                              {rank.reward.spyglasses ? ` • 🔍+${rank.reward.spyglasses}` : ''}
                              {rank.reward.pruners ? ` • ✂️+${rank.reward.pruners}` : ''}
                              {rank.reward.compasses ? ` • 🧭+${rank.reward.compasses}` : ''}
                              {rank.reward.shields ? ` • 🛡️+${rank.reward.shields}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          Active
                        </span>
                      ) : isReached ? (
                        <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" /> Conquered
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-medium shrink-0">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Ascent Difficulty Tiers Section */}
          {levelRoadmapTab === 'tiers' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-950 font-medium">
                Each Ascent features 10 levels. Completing Level 10 unlocks the next Ascent weather zone with permanent Spark boosts!
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-left">
                {ASCENT_MODES.map((mode) => {
                  const isCurrentTier = ascentTier === mode.tier;
                  const isUnlocked = ascentTier >= mode.tier;

                  return (
                    <div
                      key={mode.tier}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isCurrentTier
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                          : isUnlocked
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{mode.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-800">
                              Ascent {mode.tier}: {mode.name}
                            </span>
                            {isCurrentTier && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {mode.subtitle} • {mode.weather}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md block">
                          +{mode.sparkBonusPct}% Sparks
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          {mode.minXp.toLocaleString()}m Altitude
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
