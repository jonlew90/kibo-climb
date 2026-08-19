import React, { useState, useEffect, useCallback } from 'react';
import { Lock, X, Fingerprint, ShieldAlert, Sparkles, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { parentChildService } from '../services/parentChildService';
import { storageService } from '../services/storageService';
import { nativeAuthService } from '../services/nativeAuthService';
import { dynamicChallengeGenerator } from '../utils/dynamicChallengeGenerator';

const PARENT_VISITED_KEY = 'kibo_parent_visited';

export default function PinGateModal({
  isOpen,
  onClose,
  onUnlockSuccess
}) {
  const [activeTab, setActiveTab] = useState(() => {
    const prefs = storageService.getNotificationSettings();
    return prefs.primaryVerificationMethod === 'challenge' ? 'challenge' : 'native';
  });
  const [lockoutStatus, setLockoutStatus] = useState(() => storageService.getLockoutStatus());
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Dynamic Challenge state
  const [challenge, setChallenge] = useState(() => dynamicChallengeGenerator.generateChallenge());

  // Custom PIN input state
  const [pinInput, setPinInput] = useState('');

  // UI state
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const hasCustomPin = storageService.hasCustomPin();

  // Reset challenge on view or fresh modal open
  const refreshChallenge = useCallback(() => {
    setChallenge(dynamicChallengeGenerator.generateChallenge());
  }, []);

  // Sync activeTab & state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const prefs = storageService.getNotificationSettings();
      const preferred = prefs.primaryVerificationMethod === 'challenge' ? 'challenge' : 'native';
      setActiveTab(preferred);
      setPinInput('');
      setErrorMsg('');
      setIsShaking(false);
      setIsAuthenticating(false);
      refreshChallenge();
    }
  }, [isOpen, refreshChallenge]);

  // Update lockout countdown
  useEffect(() => {
    let interval = null;

    const checkLockout = () => {
      const status = storageService.getLockoutStatus();
      setLockoutStatus(status);
      if (status.isLocked) {
        setLockoutTimer(status.remainingSeconds);
      } else {
        setLockoutTimer(0);
      }
    };

    if (isOpen) {
      checkLockout();
      interval = setInterval(checkLockout, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // Primary Native Auth Trigger on modal open
  const triggerNativeAuth = useCallback(async () => {
    if (lockoutStatus.isLocked || isAuthenticating) return;

    setIsAuthenticating(true);
    setErrorMsg('');

    try {
      const res = await nativeAuthService.authenticate('Parental verification required to access restricted area.');

      if (res.success) {
        soundFx.playVictory();
        parentChildService.grantParentGateAccess();
        localStorage.setItem(PARENT_VISITED_KEY, 'true');
        onUnlockSuccess();
        resetState();
      } else {
        // Native auth skipped, denied, or failed -> Fallback cleanly to dynamic challenge tab
        if (res.error) {
          setErrorMsg(res.error);
        }
        setActiveTab('challenge');
      }
    } catch (e) {
      console.error('PinGateModal: Error during native auth', e);
      setActiveTab('challenge');
    } finally {
      setIsAuthenticating(false);
    }
  }, [lockoutStatus.isLocked, isAuthenticating, onUnlockSuccess]);

  // Auto-run native auth on open if tab is native
  useEffect(() => {
    if (isOpen && !lockoutStatus.isLocked && activeTab === 'native') {
      const timer = setTimeout(() => {
        triggerNativeAuth();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, lockoutStatus.isLocked, activeTab, triggerNativeAuth]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
      } else if (activeTab === 'pin' && hasCustomPin) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          e.stopPropagation();
          handlePinDelete();
        } else if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          handlePinDigitTap(e.key);
        }
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
  }, [isOpen, activeTab, pinInput, hasCustomPin, onClose]);

  if (!isOpen) return null;

  const resetState = () => {
    setPinInput('');
    setErrorMsg('');
    setIsShaking(false);
    setIsAuthenticating(false);
    refreshChallenge();
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  // Handle Dynamic Challenge Answer selection
  const handleChallengeAnswer = (selectedOption) => {
    soundFx.playKeyTap();

    const res = parentChildService.verifyParentGateChallenge(selectedOption, challenge.correctAnswer);

    if (res.granted) {
      soundFx.playVictory();
      localStorage.setItem(PARENT_VISITED_KEY, 'true');
      onUnlockSuccess();
      resetState();
    } else {
      soundFx.playIncorrect();
      setIsShaking(true);
      setErrorMsg(res.reason || 'Incorrect answer.');
      refreshChallenge(); // Generate fresh equation/order question with reshuffled options

      if (res.isLocked) {
        setLockoutStatus({ isLocked: true, remainingSeconds: res.remainingSeconds });
        setLockoutTimer(res.remainingSeconds);
      }

      setTimeout(() => {
        setIsShaking(false);
      }, 450);
    }
  };

  // Handle Custom PIN entry
  const handlePinDigitTap = (digit) => {
    soundFx.playKeyTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        const res = parentChildService.verifyParentGateChallenge(nextPin);

        if (res.granted) {
          soundFx.playVictory();
          localStorage.setItem(PARENT_VISITED_KEY, 'true');
          onUnlockSuccess();
          resetState();
        } else {
          soundFx.playIncorrect();
          setIsShaking(true);
          setErrorMsg(res.reason || 'Incorrect PIN.');
          setPinInput('');

          if (res.isLocked) {
            setLockoutStatus({ isLocked: true, remainingSeconds: res.remainingSeconds });
            setLockoutTimer(res.remainingSeconds);
          }

          setTimeout(() => {
            setIsShaking(false);
          }, 450);
        }
      }
    }
  };

  const handlePinDelete = () => {
    soundFx.playKeyTap();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white border-4 border-purple-200 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative cursor-default transition-all my-auto ${
          isShaking ? 'animate-shake border-rose-400 bg-rose-50' : ''
        }`}
      >
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close verification gate"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto border-2 border-purple-200 shadow-sm mb-3">
          {lockoutStatus.isLocked ? (
            <ShieldAlert className="w-7 h-7 text-rose-600 stroke-[2.5]" />
          ) : (
            <Lock className="w-7 h-7 stroke-[2.5]" />
          )}
        </div>

        <div className="space-y-1 mb-4">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parent Verification</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Parental verification required to access restricted area.
          </p>
        </div>

        {/* RATE-LIMITER LOCKOUT UI (If 3 failed attempts) */}
        {lockoutStatus.isLocked ? (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 space-y-3 animate-fade-in my-2 text-left">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span>Gate Temporarily Locked</span>
            </div>
            <p className="text-xs text-rose-600 font-medium leading-relaxed">
              Too many consecutive failed attempts. To protect settings and restrict child access, the gate is locked for 2 minutes.
            </p>
            <div className="bg-white border border-rose-300 rounded-xl p-3 text-center shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Try again in</span>
              <span className="text-3xl font-black text-rose-600 font-mono tracking-tight">
                {formatTimer(lockoutTimer)}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* GATE SELECTION TABS */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => { soundFx.playKeyTap(); setActiveTab('native'); setErrorMsg(''); }}
                className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'native'
                    ? 'bg-white text-purple-700 shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Face ID / Passcode</span>
              </button>

              <button
                type="button"
                onClick={() => { soundFx.playKeyTap(); setActiveTab('challenge'); setErrorMsg(''); refreshChallenge(); }}
                className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'challenge'
                    ? 'bg-white text-purple-700 shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dynamic Challenge</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold animate-pulse text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: PRIMARY GATE - NATIVE DEVICE AUTH */}
            {activeTab === 'native' && (
              <div className="space-y-4 py-2 animate-fade-in">
                <div className={`border-2 rounded-2xl p-5 space-y-3 transition-all ${
                  isAuthenticating ? 'bg-purple-100/80 border-purple-400 scale-[1.02]' : 'bg-purple-50/70 border-purple-100'
                }`}>
                  <div className="relative w-16 h-16 mx-auto">
                    {isAuthenticating && (
                      <div className="absolute -inset-2 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    )}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border transition-all ${
                      isAuthenticating ? 'bg-purple-600 text-white border-purple-700 animate-pulse' : 'bg-white text-purple-600 border-purple-200'
                    }`}>
                      <Fingerprint className={`w-8 h-8 ${isAuthenticating ? 'animate-bounce' : 'stroke-[2.2]'}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">
                      {isAuthenticating ? 'Verifying Device Biometrics...' : 'Native Device Authentication'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {isAuthenticating
                        ? 'Follow your device prompt (Face ID, Touch ID, or Passcode)...'
                        : 'Use Face ID, Touch ID, or your phone\'s screen passcode.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isAuthenticating}
                    onClick={triggerNativeAuth}
                    className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-sm rounded-xl border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Fingerprint className="w-5 h-5" />
                    <span>{isAuthenticating ? 'Scanning Biometrics...' : 'Authenticate with Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setActiveTab('challenge');
                      setErrorMsg('');
                      refreshChallenge();
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-purple-600 py-1 transition-colors block mx-auto"
                  >
                    Use Math Challenge instead →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SECONDARY GATE - DYNAMIC CHALLENGE */}
            {activeTab === 'challenge' && (
              <div className="space-y-4 py-1 animate-fade-in">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-left relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase font-black tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                      {challenge.title}
                    </span>
                    <button
                      type="button"
                      onClick={refreshChallenge}
                      className="text-slate-400 hover:text-purple-600 p-1 flex items-center gap-1 text-xs font-bold"
                      title="Generate new challenge"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-bold mb-2">{challenge.instruction}</p>

                  <div className="text-2xl font-black text-slate-900 bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                    {challenge.question}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {challenge.options.map((option, idx) => (
                    <button
                      key={`${option}-${idx}`}
                      type="button"
                      onClick={() => handleChallengeAnswer(option)}
                      className="h-14 bg-slate-50 hover:bg-purple-50 active:bg-purple-100 text-slate-800 font-black text-xl rounded-xl border-2 border-slate-200 hover:border-purple-300 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center shadow-xs"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
