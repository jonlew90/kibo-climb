import React, { useEffect } from 'react';
import { Target, Zap, Clock, Compass, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function PlacementIntroModal({
  isOpen,
  onClose,
  onStartDiagnostic
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border-2 border-amber-300 shadow-inner">
          <Target className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Modal Title & Explanation */}
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-800 tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block mb-1">
            🎯 Placement Diagnostic
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">Test Out of Levels</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left mt-2">
            Answer a few quick math questions to find your exact skill level and instantly unlock higher mountain tiers!
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 gap-2 text-xs font-extrabold text-slate-700 text-left">
          <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>2 Minutes Only</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-200">
            <Zap className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Instant Unlocks</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              soundFx.playVictory();
              onStartDiagnostic();
            }}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Compass className="w-5 h-5 stroke-[2.5]" />
            Start Diagnostic (2 Min) 🎯
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800"
          >
            Cancel / Back to Map
          </button>
        </div>
      </div>
    </div>
  );
}
