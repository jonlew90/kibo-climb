import React, { useState, useEffect } from 'react';
import { Lock, X, Key } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { parentChildService } from '../services/parentChildService';

const PARENT_VISITED_KEY = 'kibo_parent_visited';

export default function PinGateModal({
  isOpen,
  onClose,
  currentPin,
  onUnlockSuccess
}) {
  const [pinInput, setPinInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const hasVisitedBefore = localStorage.getItem(PARENT_VISITED_KEY) === 'true';
  const isFirstTime = currentPin === '1234' && !hasVisitedBefore;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleDigitTap(e.key);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, pinInput, currentPin, onClose]);

  if (!isOpen) return null;

  const handleDigitTap = (digit) => {
    soundFx.playKeyTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        const challengeRes = parentChildService.verifyParentGateChallenge(nextPin);
        if (challengeRes.granted) {
          soundFx.playVictory();
          localStorage.setItem(PARENT_VISITED_KEY, 'true');
          onUnlockSuccess();
          resetState();
        } else {
          soundFx.playIncorrect();
          setIsShaking(true);
          setErrorMsg(hasVisitedBefore ? 'Incorrect Parent PIN.' : 'Incorrect PIN. Default is 1234.');
          setTimeout(() => {
            setIsShaking(false);
            setPinInput('');
          }, 400);
        }
      }
    }
  };

  const handleDelete = () => {
    soundFx.playKeyTap();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const resetState = () => {
    setPinInput('');
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white border-4 border-purple-200 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative cursor-default transition-transform my-auto ${
          isShaking ? 'animate-shake border-rose-400 bg-rose-50' : ''
        }`}
      >
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
          aria-label="Close PIN gate"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="space-y-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-purple-200 shadow-sm">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parent Zone</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Enter your 4-digit Parent PIN to access settings
            </p>
            {isFirstTime && (
              <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-300 inline-flex items-center gap-1.5 mt-1 shadow-2xs">
                <Key className="w-3.5 h-3.5 text-purple-700 stroke-[2.5]" /> First time? Enter default PIN: 1234
              </span>
            )}
          </div>

          {/* 4 PIN Dots */}
          <div className="flex justify-center gap-3 my-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  idx < pinInput.length
                    ? 'bg-purple-600 border-purple-700 scale-110 shadow-sm'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 animate-pulse">{errorMsg}</p>
          )}

          {/* Touch Keypad (1-9, 0, ⌫) */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto my-3 sm:my-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleDigitTap(num)}
                className="h-12 bg-slate-50 hover:bg-purple-50 text-slate-800 font-extrabold text-xl rounded-xl border-b-3 border-slate-200 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleDigitTap('0')}
              className="h-12 bg-slate-50 hover:bg-purple-50 text-slate-800 font-extrabold text-xl rounded-xl border-b-3 border-slate-200 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-12 bg-amber-50 text-amber-700 font-extrabold text-sm rounded-xl border-b-3 border-amber-200 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
