import React, { useEffect } from 'react';
import { CalendarCheck, Check, CalendarDays } from 'lucide-react';
import { soundFx } from '../utils/audio';
import ConfettiCanvas from './ConfettiCanvas';
import { getDaysInMonth } from '../utils/dateUtils';

export default function PerfectMonthProgressModal({ isOpen, onClose, currentMonthStr, daysPlayedThisMonth }) {
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

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const totalDaysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());

  const isPerfectMonth = daysPlayedThisMonth >= totalDaysInMonth;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm cursor-pointer"
    >
      {isPerfectMonth && <ConfettiCanvas />}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-indigo-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 cursor-default relative z-10 animate-pop"
      >
        <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-400 shadow-md transform hover:scale-110 transition-transform">
          {isPerfectMonth ? (
            <CalendarCheck className="w-14 h-14 text-indigo-500 stroke-[2]" />
          ) : (
            <CalendarDays className="w-14 h-14 text-indigo-500 stroke-[2]" />
          )}
        </div>

        <div className="space-y-1.5 pt-2">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            {isPerfectMonth ? 'Perfect Month! 🏆' : '1st Climb Today! 📅'}
          </h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed">
            {isPerfectMonth
              ? `You've climbed every single day in ${currentMonthName}!`
              : `You've played ${daysPlayedThisMonth} days in ${currentMonthName} so far.`}
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-end gap-1">
            <span className="text-5xl font-black text-indigo-500 drop-shadow-sm">{daysPlayedThisMonth}</span>
            <span className="text-2xl font-black text-indigo-300 pb-1">/ {totalDaysInMonth}</span>
          </div>
          <span className="text-sm font-extrabold text-indigo-900 uppercase tracking-widest mt-1">
            {currentMonthName} Days
          </span>
        </div>

        <button
          onClick={handleClose}
          className="btn-3d-purple w-full py-3.5 text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-clay-purple mt-2"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          Keep Climbing!
        </button>
      </div>
    </div>
  );
}
