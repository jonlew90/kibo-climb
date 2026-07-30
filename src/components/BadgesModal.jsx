import React, { useState, useEffect } from 'react';
import { Award, Lock, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { BADGES_CATALOG, BADGE_CATEGORIES } from '../data/badges';
import { soundFx } from '../utils/audio';

export default function BadgesModal({
  isOpen,
  onClose,
  unlockedBadges = []
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedSet = new Set(unlockedBadges);
  const totalBadges = BADGES_CATALOG.length;
  const unlockedCount = unlockedSet.size;
  const progressPct = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = activeCategory === 'all'
    ? BADGES_CATALOG
    : BADGES_CATALOG.filter((b) => b.category === activeCategory);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl p-4 sm:p-5 text-slate-800 shadow-2xl space-y-4 max-h-[92vh] flex flex-col relative overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Trail Badges</h2>
              <p className="text-xs text-slate-500 font-semibold">Earn badges as you conquer Mount Kibo!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-3 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-300" />
              Badge Showcase Progress
            </span>
            <span className="bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300">
              {unlockedCount} / {totalBadges} Badges ({progressPct}%)
            </span>
          </div>

          <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden border border-amber-300">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Filter Category Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 shrink-0">
          <button
            onClick={() => {
              soundFx.playKeyTap();
              setActiveCategory('all');
            }}
            className={`py-1.5 px-3 text-[11px] font-extrabold rounded-xl shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌟 All Badges
          </button>

          {Object.entries(BADGE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                soundFx.playKeyTap();
                setActiveCategory(key);
              }}
              className={`py-1.5 px-3 text-[11px] font-extrabold rounded-xl shrink-0 transition-all ${
                activeCategory === key
                  ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 relative ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-50/80 via-white to-yellow-50/80 border-amber-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 shadow-inner ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-amber-600 text-amber-950 shadow-clay-amber'
                      : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Badge Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-800 text-sm truncate">{badge.title}</h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    {badge.description}
                  </p>
                  {!isUnlocked && (
                    <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 inline-block mt-1">
                      Target: {badge.reqText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
