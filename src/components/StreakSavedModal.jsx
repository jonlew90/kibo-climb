import React, { useEffect } from 'react';
import { ShieldCheck, Flame, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function StreakSavedModal({ isOpen, onClose, streak, remainingShields }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundFx.playKeyTap();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-amber-300 rounded-3xl p-6 text-center shadow-2xl space-y-4 cursor-default"
      >
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border-3 border-amber-300 animate-bounce shadow-md">
          <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase text-amber-600 tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Streak Protection Active
          </span>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Streak Saved by Kibo Shield! 🛡️
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            You missed a practice day, but your <strong>Kibo Shield</strong> absorbed the hit and kept your streak alive!
          </p>
        </div>

        {/* Streak & Shields Info Box */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center justify-around text-xs">
          <div className="flex items-center gap-1.5 font-black text-amber-900">
            <Flame className="w-5 h-5 fill-amber-400 stroke-[2.5]" />
            <span>{streak} Day Streak Intact!</span>
          </div>
          <div className="font-extrabold text-slate-600">
            🛡️ {remainingShields}/2 Shields Left
          </div>
        </div>

        <button
          onClick={handleClose}
          className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Keep Up the Great Work!
        </button>
      </div>
    </div>
  );
}
