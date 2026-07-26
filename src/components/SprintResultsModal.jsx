import React, { useState } from 'react';
import { Trophy, Flame, Zap, Compass, ShoppingBag, CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { getTrickForProblem } from '../data/mathTricks';

export default function SprintResultsModal({
  isOpen,
  stats,
  earnedSparksInfo,
  streak,
  equippedItems = [],
  isBossMode = false,
  onContinueClimbing,
  onVisitWorkshop
}) {
  const [showTrick, setShowTrick] = useState(true);

  if (!isOpen) return null;

  const handleContinue = () => {
    soundFx.playVictory();
    onContinueClimbing();
  };

  const handleWorkshop = () => {
    soundFx.playKeyTap();
    onVisitWorkshop();
  };

  const isNewRecord = stats.avgVelocitySec < 2.0;

  // Retrieve relevant math shortcut based on sprint results
  const recommendedTrick = getTrickForProblem(stats.focusEquation || '9 x 6');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[92vh] overflow-y-auto">
        <ConfettiCanvas />

        {/* Mascot Header */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <Mascot mood="celebrate" equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1.5 rounded-full border-2 border-white shadow-lg animate-bounce">
            <Trophy className="w-5 h-5 text-amber-900 fill-amber-300 stroke-[2.5]" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
            {isBossMode ? '⚡ Boss Challenge Complete!' : isNewRecord ? '⚡ New Speed Record!' : 'Sprint Complete! 🎉'}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Great Job Ascending! 🏔️
          </h2>
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
              <span>+{pluralize(earnedSparksInfo.total, 'Spark')} ⚡</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-2 flex-wrap border-t border-amber-200/70 pt-1.5">
            <span>Base: +{earnedSparksInfo.base}⚡</span>
            {earnedSparksInfo.accuracyBonus > 0 && <span className="text-emerald-700 font-bold">+10 100% Acc</span>}
            {earnedSparksInfo.speedBonus > 0 && <span className="text-amber-700 font-bold">+5 Lightning</span>}
            {earnedSparksInfo.multiplier > 1 && <span className="text-purple-700 font-black bg-purple-100 px-1.5 rounded">1.5x Streak Boost!🔥</span>}
          </div>
        </div>

        {/* Collapsible "Kibo's Trail Trick" Math Shortcut Card */}
        {recommendedTrick && (
          <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-3 text-left space-y-1.5 shadow-sm">
            <div
              onClick={() => setShowTrick(!showTrick)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{recommendedTrick.icon}</span>
                <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm flex items-center gap-1">
                  💡 Kibo's Trail Trick: <span className="text-amber-700">{recommendedTrick.title}</span>
                </h4>
              </div>
              <button type="button" className="text-amber-800 p-0.5">
                {showTrick ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showTrick && (
              <div className="space-y-1 pt-1 border-t border-amber-200/80 text-xs">
                <p className="font-bold text-amber-900 leading-snug">{recommendedTrick.summary}</p>
                <div className="p-2 bg-white/80 rounded-xl border border-amber-300 font-medium text-slate-700 text-[11px]">
                  <strong className="text-amber-800 block mb-0.5 font-bold">Pro Tip Example:</strong>
                  {recommendedTrick.example}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Cards */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-inner">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.5]" /> Accuracy: <strong className="text-slate-900">{stats.accuracyPct}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-kibo-teal stroke-[2.5]" /> Avg Speed: <strong className="text-slate-900">{stats.avgVelocitySec}s / Q</strong>
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

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleContinue}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Compass className="w-5 h-5 stroke-[2.5]" />
            Continue Climbing 🏔️
          </button>

          <button
            onClick={handleWorkshop}
            className="btn-3d-purple w-full py-3 text-sm rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            Visit Kibo's Workshop 🛍️
          </button>
        </div>
      </div>
    </div>
  );
}
