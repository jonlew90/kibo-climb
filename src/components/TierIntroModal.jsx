import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lightbulb, Play, X, Check, Zap } from 'lucide-react';
import Mascot from './Mascot';
import { CURRICULUM_TIERS, generateTierProblem } from '../utils/curriculum';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';

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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      const userData = storageService.getUserData();
      const isAlreadyMastered = Boolean(userData.masteredTricks && userData.masteredTricks[tierLevel]);
      setTryOutInput('');
      setIsTryOutSuccess(isAlreadyMastered);
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, tierLevel, onClose]);

  if (!isOpen) return null;

  const tierMeta = CURRICULUM_TIERS.find((t) => t.tier === tierLevel) || CURRICULUM_TIERS[0];

  const handleStart = () => {
    soundFx.playVictory();
    onStartSprint(tierLevel);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-5 text-center shadow-2xl space-y-3.5 relative max-h-[85vh] overflow-y-auto cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Mascot & Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="p-0.5 shrink-0 overflow-visible flex items-center justify-center">
            <Mascot mood="happy" equipped={equippedItems} className="w-16 h-16" />
          </div>
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

          {(() => {
            const sample = tierMeta.trailTrick?.sampleProblem || {
              question: tryOutProblem.displayString,
              correctAnswer: tryOutProblem.answerString,
              hint: 'Master your facts with speed!'
            };

            const handleSubmit = (e) => {
              e.preventDefault();
              if (tryOutInput.trim().toLowerCase() === sample.correctAnswer.toLowerCase()) {
                soundFx.playVictory();
                setIsTryOutSuccess(true);
                const userData = storageService.getUserData();
                userData.masteredTricks = { ...(userData.masteredTricks || {}), [tierLevel]: true };
                storageService.saveUserData(userData);
              } else {
                soundFx.playIncorrect();
              }
            };

            if (isTryOutSuccess) {
              return (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-2xl text-center space-y-1 animate-pop">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                    <Check className="w-4.5 h-4.5 stroke-[3] text-emerald-600" />
                    <span>Awesome job! You've mastered this trick! 🎉</span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    You're ready to tackle the Tier {tierLevel} Sprint with peak velocity!
                  </p>
                </div>
              );
            }

            return (
              <form onSubmit={handleSubmit} className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base font-extrabold text-slate-800">{sample.question} =</span>
                  <input
                    type="text"
                    value={tryOutInput}
                    onChange={(e) => setTryOutInput(e.target.value)}
                    placeholder="?"
                    className="w-20 text-center py-1 bg-white border-2 border-purple-300 rounded-xl text-base font-black text-purple-900 focus:border-purple-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:bg-purple-700 active:scale-95 transition-all"
                  >
                    Check
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block italic">
                  {sample.hint}
                </span>
              </form>
            );
          })()}
        </div>

        {/* Action Buttons */}
        {isTryOutSuccess ? (
          <div className="space-y-2 pt-1">
            <button
              onClick={handleStart}
              className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
            >
              <Play className="w-5 h-5 fill-white stroke-[2.5]" />
              Start Sprint 🚀
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Back to Map 🗺️
            </button>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Zap className="w-5 h-5 fill-white stroke-[2.5]" />
            Got It! Start Sprint ⚡
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
