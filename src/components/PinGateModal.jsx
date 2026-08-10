import React, { useState, useEffect } from 'react';
import { Lock, X, Key, Fingerprint, ShieldAlert, Calculator } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { parentChildService } from '../services/parentChildService';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

// Helper for rate limiting
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ATTEMPTS = 3;

const getLockoutState = () => {
  try {
    const data = JSON.parse(localStorage.getItem('kibo_parent_gate_lockout') || '{}');
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      return { attempts: data.attempts || 0, lockedUntil: data.lockedUntil };
    }
    return { attempts: data.attempts || 0, lockedUntil: null };
  } catch (e) {
    return { attempts: 0, lockedUntil: null };
  }
};

const updateLockoutState = (attempts, lockedUntil) => {
  localStorage.setItem('kibo_parent_gate_lockout', JSON.stringify({ attempts, lockedUntil }));
};

const generateChallenge = () => {
  // Generate random multiplication like 14 x 6 (adult literacy math)
  const a = Math.floor(Math.random() * 10) + 5; // 5 to 14
  const b = Math.floor(Math.random() * 8) + 3;  // 3 to 10
  const correctAnswer = a * b;

  // Generate wrong answers that look plausible
  const answers = new Set([correctAnswer]);
  while (answers.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    if (offset !== 0 && correctAnswer + offset > 0) {
      answers.add(correctAnswer + offset);
    }
  }

  const shuffledAnswers = Array.from(answers).sort(() => Math.random() - 0.5);
  return { a, b, correctAnswer, options: shuffledAnswers };
};

export default function PinGateModal({
  isOpen,
  onClose,
  currentPin,
  onUnlockSuccess
}) {
  const [mode, setMode] = useState('loading'); // 'biometric', 'pin', 'challenge', 'locked'
  const [pinInput, setPinInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [challenge, setChallenge] = useState(null);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  // Initialize gate state
  useEffect(() => {
    if (!isOpen) return;

    const { attempts, lockedUntil } = getLockoutState();
    if (lockedUntil) {
      setMode('locked');
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      setLockoutTimeLeft(left);
      return;
    }

    const checkBiometric = async () => {
      // Allow mocking successful biometric bypass for dev/test
      if (import.meta.env.VITE_MOCK_BIOMETRIC_SUCCESS === 'true' || localStorage.getItem('kibo_mock_biometric') === 'true') {
         console.warn('[DEV] Mocking successful biometric check.');
         handleSuccess();
         return;
      }

      try {
        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          setMode('biometric');
          promptBiometric();
        } else {
          fallbackToSecondary();
        }
      } catch (error) {
        console.warn('Biometric not available, falling back:', error);
        fallbackToSecondary();
      }
    };

    checkBiometric();
  }, [isOpen]);

  // Lockout timer interval
  useEffect(() => {
    if (mode === 'locked' && lockoutTimeLeft > 0) {
      const timer = setInterval(() => {
        setLockoutTimeLeft(prev => {
          if (prev <= 1) {
            updateLockoutState(0, null);
            fallbackToSecondary();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, lockoutTimeLeft]);

  const fallbackToSecondary = () => {
    if (currentPin) {
      setMode('pin');
    } else {
      setMode('challenge');
      setChallenge(generateChallenge());
    }
  };

  const promptBiometric = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Parental verification required to access restricted area.',
        title: 'Parent Zone',
      });
      // Success
      handleSuccess();
    } catch (error) {
      // Failed or canceled
      fallbackToSecondary();
    }
  };

  const handleSuccess = () => {
    soundFx.playVictory();

    // Clear lockout on success
    updateLockoutState(0, null);

    // Grant session using parentChildService token mechanism
    const sessionToken = `parent_gate_grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionStorage.setItem('kibo_parent_gate_session', sessionToken);

    onUnlockSuccess();
    resetState();
  };

  const handleFailure = (msg) => {
    soundFx.playIncorrect();
    setIsShaking(true);
    setErrorMsg(msg);
    setTimeout(() => {
      setIsShaking(false);
      setPinInput('');
    }, 400);

    const { attempts } = getLockoutState();
    const newAttempts = attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      updateLockoutState(newAttempts, lockedUntil);
      setMode('locked');
      setLockoutTimeLeft(LOCKOUT_DURATION_MS / 1000);
    } else {
      updateLockoutState(newAttempts, null);
      if (mode === 'challenge') {
        setChallenge(generateChallenge()); // Generate a new one on fail to prevent guessing
      }
    }
  };

  // PIN mode handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || mode !== 'pin') return;

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
  }, [isOpen, pinInput, mode, onClose]);

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
          handleSuccess();
        } else {
          handleFailure('Incorrect PIN.');
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
    setMode('loading');
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  const renderContent = () => {
    if (mode === 'locked') {
      const minutes = Math.floor(lockoutTimeLeft / 60);
      const seconds = lockoutTimeLeft % 60;
      return (
        <div className="space-y-6 py-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-rose-200 shadow-sm animate-pulse">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Too Many Attempts</h3>
            <p className="text-sm text-slate-600 font-semibold px-4">
              For security, the Parent Zone is temporarily locked.
            </p>
          </div>
          <div className="bg-slate-100 py-3 px-6 rounded-xl inline-block font-mono text-xl font-bold text-slate-700">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
      );
    }

    if (mode === 'challenge' && challenge) {
      return (
        <div className="space-y-5">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-blue-200 shadow-sm">
            <Calculator className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parent Verification</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Please solve this problem to access the Parent Zone
            </p>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 my-2 text-3xl font-black text-slate-700 shadow-inner">
            {challenge.a} &times; {challenge.b} = ?
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 animate-pulse">{errorMsg}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {challenge.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  soundFx.playKeyTap();
                  if (opt === challenge.correctAnswer) {
                    handleSuccess();
                  } else {
                    handleFailure('Incorrect answer.');
                  }
                }}
                className="py-4 bg-white hover:bg-blue-50 text-slate-700 font-extrabold text-xl rounded-xl border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'pin') {
      return (
        <div className="space-y-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-purple-200 shadow-sm">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parent Zone</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Enter your 4-digit Parent PIN to access settings
            </p>
            {currentPin && currentPin !== '1234' && (
              <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md mt-1 border border-amber-200">
                Tip: For faster access, clear this PIN in settings to use Face/Touch ID.
              </p>
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
      );
    }

    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
      </div>
    );
  };

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white border-4 ${
          mode === 'challenge' ? 'border-blue-200' : mode === 'locked' ? 'border-rose-200' : 'border-purple-200'
        } rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative cursor-default transition-transform my-auto ${
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

        {renderContent()}
      </div>
    </div>
  );
}
