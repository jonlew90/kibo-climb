import React, { useEffect } from 'react';
import { Flame, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';
import ConfettiCanvas from './ConfettiCanvas';

export default function DailyStreakIncreasedModal({ isOpen, onClose, streak }) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playVictory();
    }
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm cursor-pointer"
    >
      <ConfettiCanvas />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-orange-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 cursor-default relative z-10 animate-pop"
      >
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto border-4 border-orange-400 shadow-md transform hover:scale-110 transition-transform">
          <Flame className="w-14 h-14 fill-orange-400 stroke-[2]" />
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            Streak Increased! 🔥
          </h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed">
            You're on fire! Keep up the daily practice.
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black text-orange-500 drop-shadow-sm">{streak}</span>
          <span className="text-sm font-extrabold text-orange-900 uppercase tracking-widest mt-1">
            Day Streak
          </span>
        </div>

        <button
          onClick={handleClose}
          className="btn-3d-orange w-full py-3.5 text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange mt-2"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          Keep Climbing!
        </button>
      </div>
    </div>
  );
}
