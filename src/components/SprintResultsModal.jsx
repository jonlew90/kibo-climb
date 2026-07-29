import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Compass, ShoppingBag, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { calculateStars } from '../utils/curriculum';

export default function SprintResultsModal({
  isOpen,
  stats,
  earnedSparksInfo,
  streak,
  equippedItems = [],
  isBossMode = false,
  isNewSpeedRecord = false,
  onContinueClimbing,
  onVisitWorkshop
}) {
  const [summaryStep, setSummaryStep] = useState(1);

  // Reset to Step 1 upon modal open
  useEffect(() => {
    if (isOpen) {
      setSummaryStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    soundFx.playVictory();
    onContinueClimbing();
  };

  const handleWorkshop = () => {
    soundFx.playKeyTap();
    onVisitWorkshop();
  };

  const formatTotalTime = (totalSec) => {
    const sec = Math.round(totalSec || 0);
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    return mins > 0 ? `${mins}m ${remainderSec}s` : `${sec}s`;
  };

  const totalStars = stats?.starsEarned !== undefined
    ? stats.starsEarned
    : calculateStars(stats?.accuracyPct, stats?.totalTimeSec);

  const star1 = totalStars >= 1;
  const star2 = totalStars >= 2;
  const star3 = totalStars >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[92vh] overflow-y-auto">
        <ConfettiCanvas />

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between px-2 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          <span className={summaryStep === 1 ? 'text-amber-600 font-extrabold' : 'text-slate-400'}>
            Step 1: Stats & Accuracy
          </span>
          <span className={summaryStep === 2 ? 'text-amber-600 font-extrabold' : 'text-slate-400'}>
            Step 2: Rewards & Stars
          </span>
        </div>

        {/* Mascot Header */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <Mascot mood="celebrate" equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1.5 rounded-full border-2 border-white shadow-lg animate-bounce">
            <Trophy className="w-5 h-5 text-amber-900 fill-amber-300 stroke-[2.5]" />
          </div>
        </div>

        {/* STEP 1: STATS & ACCURACY PAGE */}
        {summaryStep === 1 && (
          <div className="space-y-3.5 animate-pop">
            {/* Headline */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
                {isBossMode ? '⚡ Boss Challenge Complete!' : isNewSpeedRecord ? '⚡ New Speed Record!' : 'Sprint Complete! 🎉'}
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Great Job Ascending! 🏔️
              </h2>
            </div>

            {/* Speed Record Alert Banner */}
            {isNewSpeedRecord && (
              <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-2 text-xs font-black text-amber-950 animate-pulse">
                ⚡ New Personal Best Completion Time Recorded!
              </div>
            )}

            {/* Performance Cards */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-2 flex-wrap gap-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600 stroke-[2.5]" /> Time: <strong className="text-amber-900 font-extrabold">{formatTotalTime(stats.totalTimeSec)}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.5]" /> Acc: <strong className="text-slate-900">{stats.accuracyPct}%</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-kibo-teal stroke-[2.5]" /> Speed: <strong className="text-slate-900">{stats.avgVelocitySec}s/Q</strong>
                </span>
              </div>

              {/* Speed Breakdown Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-1.5">
                  <span className="font-extrabold text-amber-900 block text-xs">⚡ {stats.superFastCount}</span>
                  <span className="font-bold text-amber-700">Instant Recall</span>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-1.5">
                  <span className="font-extrabold text-yellow-900 block text-xs">🟡 {stats.fluentCount}</span>
                  <span className="font-bold text-yellow-700">Worked Out</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-1.5">
                  <span className="font-extrabold text-blue-900 block text-xs">🔵 {stats.practiceCount}</span>
                  <span className="font-bold text-blue-700">Focus Area</span>
                </div>
              </div>
            </div>

            {/* Step 1 Primary Action Button */}
            <button
              onClick={() => {
                soundFx.playKeyTap();
                setSummaryStep(2);
              }}
              className="btn-3d-emerald w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Claim Rewards!</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* STEP 2: STARS & REWARDS PAGE */}
        {summaryStep === 2 && (
          <div className="space-y-3.5 animate-pop">
            {/* Headline */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                🌟 Rewards Unlocked!
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Star Mastery & Loot 🎁
              </h2>
            </div>

            {/* Star Milestones Unlocked Card */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-3 text-left space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                  ⭐ Star Mastery: {totalStars} / 3 Stars
                </span>
                <span className="text-sm">{'⭐'.repeat(totalStars)}</span>
              </div>

              <div className="text-xs font-bold space-y-1 pt-1 border-t border-amber-200">
                <div className={`flex items-center justify-between p-1.5 rounded-xl border transition-all ${star1 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>⭐ 1 Star: Pass Sprint (≥80% Acc)</span>
                  {star1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <span className="text-[10px]">Incomplete</span>}
                </div>

                <div className={`flex items-center justify-between p-1.5 rounded-xl border transition-all ${star2 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>⭐⭐ 2 Stars: Flawless (100% Acc)</span>
                  {star2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <span className="text-[10px]">Incomplete</span>}
                </div>

                <div className={`flex items-center justify-between p-1.5 rounded-xl border transition-all ${star3 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>⭐⭐⭐ 3 Stars: Summit Speed (100% in &lt;60s)</span>
                  {star3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <span className="text-[10px]">Incomplete</span>}
                </div>
              </div>
            </div>

            {/* Streak & Spark Earnings Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 p-3 rounded-2xl space-y-1.5 shadow-sm text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full font-extrabold text-amber-950 text-xs">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-400 stroke-[2.5]" />
                  <span>{pluralize(streak, 'Day')} Streak!</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full font-extrabold text-amber-950 text-xs">
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5] animate-pulse" />
                  <span>+{pluralize(earnedSparksInfo?.total || 0, 'Spark')} ⚡</span>
                </div>
              </div>

              {earnedSparksInfo && (
                <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-2 flex-wrap border-t border-amber-200/70 pt-1.5">
                  <span>Base: +{earnedSparksInfo.base}⚡</span>
                  {earnedSparksInfo.accuracyBonus > 0 && <span className="text-emerald-700 font-bold">+10 100% Acc</span>}
                  {earnedSparksInfo.speedBonus > 0 && <span className="text-amber-700 font-bold">+5 Lightning</span>}
                  {earnedSparksInfo.multiplier > 1 && <span className="text-purple-700 font-black bg-purple-100 px-1.5 rounded">1.5x Streak Boost!🔥</span>}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleContinue}
                className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
              >
                <Compass className="w-5 h-5 stroke-[2.5]" />
                World Map 🗺️
              </button>

              <button
                onClick={handleWorkshop}
                className="btn-3d-purple w-full py-3 text-sm rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                Visit Kibo's Workshop 🎒
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
