import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lightbulb, Play, X, Check, Zap } from 'lucide-react';
import Mascot from './Mascot';
import { CURRICULUM_TIERS, generateTierProblem } from '../utils/curriculum';
import { soundFx } from '../utils/audio';

export default function TierIntroModal({
  isOpen,
  tierLevel,
  equippedItems = [],
  onStartSprint,
  onClose
}) {
  const [tryOutInput, setTryOutInput] = useState('');
  const [isTryOutSuccess, setIsTryOutSuccess] = useState(false);
  const [tryOutProblem] = useState(() => generateTierProblem(tierLevel || 1));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tierMeta = CURRICULUM_TIERS.find((t) => t.tier === tierLevel) || CURRICULUM_TIERS[0];

  const handleTryOutSubmit = (e) => {
    e.preventDefault();
    if (tryOutInput.trim() === tryOutProblem.answerString) {
      soundFx.playVictory();
      setIsTryOutSuccess(true);
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleStart = () => {
    soundFx.playVictory();
    onStartSprint(tierLevel);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Mascot & Header */}
        <div className="flex items-center justify-center gap-2">
          <Mascot mood="happy" equipped={equippedItems} className="w-16 h-16" />
          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 inline-block">
              Mental Math Trick
            </span>
            <h3 className="text-lg font-black text-slate-800 leading-tight">
              Tier {tierMeta.tier}: {tierMeta.title}
            </h3>
          </div>
        </div>

        {/* Trail Trick Description Box */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 text-left space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300 stroke-[2.5]" />
            <span>💡 Kibo's Trail Trick: {tierMeta.trailTrick ? tierMeta.trailTrick.title : "Landmark Numbers"}</span>
          </div>
          <p className="text-xs text-amber-950 font-medium leading-relaxed">
            {tierMeta.trailTrick ? tierMeta.trailTrick.summary : "Master your facts with speed and accuracy!"}
          </p>
        </div>

        {/* Try It Out Practice Widget */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-center space-y-2">
          <span className="text-[11px] font-black uppercase text-purple-700 block">
            🧪 Try It Out Practice!
          </span>

          <form onSubmit={handleTryOutSubmit} className="flex items-center justify-center gap-2">
            <span className="text-base font-extrabold text-slate-800">{tryOutProblem.displayString} =</span>
            <input
              type="text"
              value={tryOutInput}
              onChange={(e) => setTryOutInput(e.target.value)}
              placeholder="?"
              className="w-16 text-center py-1 bg-white border-2 border-purple-300 rounded-xl text-base font-black text-purple-900 focus:border-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:bg-purple-700"
            >
              Check
            </button>
          </form>

          {isTryOutSuccess && (
            <div className="flex items-center justify-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4 stroke-[3]" /> Perfect! You've got the trick!
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleStart}
          className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
        >
          <Zap className="w-5 h-5 fill-white stroke-[2.5]" />
          Got It! Start Sprint ⚡
        </button>
      </div>
    </div>,
    document.body
  );
}
