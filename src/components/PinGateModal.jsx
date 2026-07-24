import React, { useState } from 'react';
import { Lock, X, KeyRound, HelpCircle, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function PinGateModal({
  isOpen,
  onClose,
  currentPin,
  securityQuestion,
  securityAnswer,
  onUnlockSuccess
}) {
  const [pinInput, setPinInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [secAnswerInput, setSecAnswerInput] = useState('');

  if (!isOpen) return null;

  const handleDigitTap = (digit) => {
    soundFx.playKeyTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === currentPin) {
          soundFx.playVictory();
          onUnlockSuccess();
          resetState();
        } else {
          soundFx.playIncorrect();
          setIsShaking(true);
          setErrorMsg('Incorrect PIN. Default is 1234.');
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

  const handleVerifySecAnswer = (e) => {
    e.preventDefault();
    if (secAnswerInput.trim().toLowerCase() === securityAnswer.trim().toLowerCase()) {
      soundFx.playVictory();
      onUnlockSuccess();
      resetState();
    } else {
      soundFx.playIncorrect();
      setIsShaking(true);
      setErrorMsg('Incorrect answer to security question.');
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const resetState = () => {
    setPinInput('');
    setErrorMsg('');
    setIsForgotMode(false);
    setSecAnswerInput('');
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div
        className={`w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-6 text-center shadow-2xl relative transition-transform ${
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

        {!isForgotMode ? (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-purple-200 shadow-sm">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parent Zone</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Enter your 4-digit Parent PIN to access settings
              </p>
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
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
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

            {/* Forgot PIN Option */}
            {securityQuestion && securityAnswer && (
              <button
                onClick={() => {
                  setErrorMsg('');
                  setIsForgotMode(true);
                }}
                className="text-xs text-purple-600 hover:text-purple-800 font-bold underline mt-2 block mx-auto"
              >
                Forgot PIN? Use Security Question
              </button>
            )}
          </div>
        ) : (
          /* Forgot PIN Security Question Recovery */
          <form onSubmit={handleVerifySecAnswer} className="space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-amber-200">
              <HelpCircle className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-800">Security Verification</h3>
              <p className="text-xs text-slate-500 font-semibold">{securityQuestion}</p>
            </div>

            <input
              type="text"
              value={secAnswerInput}
              onChange={(e) => setSecAnswerInput(e.target.value)}
              placeholder="Your answer..."
              required
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-800 text-sm focus:border-purple-500 focus:outline-none"
            />

            {errorMsg && <p className="text-xs font-bold text-rose-500">{errorMsg}</p>}

            <div className="space-y-2">
              <button
                type="submit"
                className="btn-3d-purple w-full py-2.5 text-sm rounded-xl"
              >
                Verify & Open Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsForgotMode(false);
                }}
                className="text-xs font-extrabold text-slate-500 hover:text-slate-800"
              >
                Back to PIN Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
