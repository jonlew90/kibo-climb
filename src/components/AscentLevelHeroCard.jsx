import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Reusable Hero Card displaying the climber's current Ascent tier, level,
 * title icon, and progress bar with inset meter metrics.
 */
export default function AscentLevelHeroCard({
  ascentTier = 1,
  ascentMode,
  levelInfo,
  actionButton = null,
  className = '',
}) {
  const safeAscentMode = ascentMode || { name: 'Sunny Trailhead', icon: '☀️' };
  const safeLevelInfo = levelInfo || {
    level: 1,
    title: 'Basecamp Explorer',
    icon: '🏕️',
    progressPct: 0,
    xpIntoLevel: 0,
    xpRequiredForLevel: 150,
    sparkBonusPct: 0,
  };

  return (
    <div className={`bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden text-left ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
              <span>{safeAscentMode.icon}</span>
              <span>Ascent {ascentTier}: {safeAscentMode.name}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
              Lv. {safeLevelInfo.level}
            </span>
            {safeLevelInfo.sparkBonusPct > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{safeLevelInfo.sparkBonusPct}% Permanent Sparks
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-1.5">
            <span className="text-3xl sm:text-4xl drop-shadow-xs">{safeLevelInfo.icon || '🏕️'}</span>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {safeLevelInfo.title}
              </h3>
            </div>
          </div>
        </div>

        {actionButton}
      </div>

      {/* Progress Bar with Inset Stats */}
      <div className="mt-4 relative w-full bg-black/30 h-5 sm:h-5.5 rounded-full overflow-hidden border border-white/20 flex items-center shadow-inner">
        <div
          className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${safeLevelInfo.progressPct || 0}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] sm:text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] pointer-events-none select-none">
          <span>{safeLevelInfo.xpIntoLevel || 0}m / {safeLevelInfo.xpRequiredForLevel || 150}m</span>
          <span>{safeLevelInfo.progressPct || 0}%</span>
        </div>
      </div>
    </div>
  );
}
