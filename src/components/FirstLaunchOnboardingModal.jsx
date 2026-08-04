import React, { useState, useEffect, useRef } from 'react';
import { Play, Zap, Flame, ShoppingBag, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validateUsername(val) {
  if (!val || val.trim().length === 0) return 'Please enter a username.';
  if (val.trim().length < 3) return 'Must be at least 3 characters.';
  if (val.trim().length > 20) return 'Must be 20 characters or fewer.';
  if (!USERNAME_RE.test(val.trim())) return 'Letters, numbers, and underscores only.';
  return null;
}

export default function FirstLaunchOnboardingModal({
  isOpen,
  equippedItems = [],
  onOpenParentZone,
  onStartAdaptiveClimb = () => {},
  onStartPlacementTest,
  onStartAtTier1,
  onUsernameSet,
}) {
  const [step, setStep] = useState(1); // 1 = username, 2 = welcome splash
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameConfirmed, setUsernameConfirmed] = useState(false);
  const inputRef = useRef(null);

  // Pre-fill if username already set (e.g. returning to this screen)
  useEffect(() => {
    const existing = storageService.getUsername();
    if (existing) {
      setUsernameInput(existing);
      setStep(2);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 1 && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, step]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && step === 2 && onStartAdaptiveClimb) {
        onStartAdaptiveClimb();
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
  }, [isOpen, step, onStartAdaptiveClimb]);

  if (!isOpen) return null;

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const error = validateUsername(usernameInput);
    if (error) {
      setUsernameError(error);
      return;
    }
    const cleaned = usernameInput.trim();
    storageService.saveUsername(cleaned);
    if (onUsernameSet) onUsernameSet(cleaned);
    soundFx.playVictory();
    setUsernameConfirmed(true);
    setTimeout(() => {
      setUsernameConfirmed(false);
      setStep(2);
    }, 700);
  };

  const handleStart = () => {
    soundFx.playVictory();
    if (typeof onStartAdaptiveClimb === 'function') onStartAdaptiveClimb();
    else if (typeof onStartAtTier1 === 'function') onStartAtTier1();
    else if (typeof onStartPlacementTest === 'function') onStartPlacementTest();
  };

  // ─── STEP 1: Username ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[1000] h-[100dvh] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 select-none animate-pop overflow-hidden">
        {/* Soft glow bg */}
        <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">

          {/* Mascot */}
          <div className="relative flex justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none" />
            <Mascot
              mood="happy"
              state="idle"
              equipped={equippedItems}
              className="h-28 w-auto filter drop-shadow-xl animate-bounce object-contain relative z-10"
            />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full inline-block">
              🏔️ Kibo Climb
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              What should we<br />call you, Climber?
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Pick a username for the <strong className="text-amber-400">global leaderboard</strong>.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleUsernameSubmit} className="w-full space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.5]" />
              <input
                ref={inputRef}
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setUsernameError('');
                }}
                placeholder="e.g. MathKing42"
                maxLength={20}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className={`w-full pl-10 pr-4 py-3.5 bg-white/10 border-2 rounded-2xl text-white font-extrabold text-base placeholder:text-slate-500 focus:outline-none transition-all ${
                  usernameError
                    ? 'border-rose-500 bg-rose-500/10'
                    : usernameConfirmed
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-white/20 focus:border-purple-400 focus:bg-white/15'
                }`}
              />
              {usernameConfirmed && (
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 stroke-[2.5]" />
              )}
            </div>

            {usernameError && (
              <p className="text-xs font-bold text-rose-400 text-left px-1">{usernameError}</p>
            )}

            <p className="text-[10px] text-slate-500 font-medium text-left px-1">
              3–20 characters · Letters, numbers, and underscores only · Your leaderboard name
            </p>

            <button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 border-b-4 border-orange-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2"
            >
              {usernameConfirmed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Confirmed!
                </>
              ) : (
                <>
                  Claim Username <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {onOpenParentZone && (
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                onOpenParentZone();
              }}
              className="text-xs font-bold text-purple-300 hover:text-white transition-colors"
            >
              🔒 Parent Zone Setup
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── STEP 2: Welcome Splash ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      <div className="w-full max-w-2xl mx-auto min-h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 box-border relative z-10 text-center gap-4">

        {/* HEADER */}
        <div className="shrink-0 flex flex-col items-center text-center space-y-2 pt-2">
          <span className="text-xs sm:text-sm font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-1 rounded-full border border-amber-500 shadow-sm inline-block tracking-wider animate-pulse">
            🏔️ Welcome to Kibo Climb
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight drop-shadow-xs leading-tight">
            Ready, <span className="text-purple-700">{usernameInput || storageService.getUsername()}</span>? 🚀
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-purple-900 max-w-lg mx-auto leading-normal">
            Bite-Sized Daily Ascents (~3 Mins) — Adaptive Math Training That Evolves With Your Mind
          </p>
        </div>

        {/* HERO + FEATURES */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 py-2 my-auto">
          <div className="relative py-2 flex justify-center items-center shrink-0">
            <div className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
            <Mascot
              mood="happy"
              state="idle"
              equipped={equippedItems}
              className="w-auto max-h-[26vh] h-28 sm:h-36 md:h-44 filter drop-shadow-xl animate-bounce object-contain"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/95 border-2 border-amber-200/90 rounded-3xl p-3.5 sm:p-5 shadow-xl shrink-0 text-left">
            <div className="flex sm:flex-col items-start gap-3 bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 fill-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Adaptive Engine</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Problems adjust dynamically to your exact skill level as you climb.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start gap-3 bg-orange-50/90 border border-orange-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 fill-orange-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Daily Streaks</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Solve 12 problems daily to build long-term memory & earn Sparks!
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-start gap-3 bg-purple-50/90 border border-purple-200 rounded-2xl p-3 sm:p-3.5 transition-transform hover:scale-[1.02]">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">Kibo's Corner 🐾</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                  Unlock hats, outfits, pets, backgrounds, and power-up items!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 space-y-2 pt-2 pb-2 w-full">
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d-orange w-full h-16 min-h-[64px] py-4 text-lg sm:text-xl font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-bouncy-orange active:scale-95 transition-all tracking-wide cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white stroke-[2.5]" />
            Start Kibo Climb! 🚀
          </button>

          {onOpenParentZone && (
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                onOpenParentZone();
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              🔒 Parent Zone (Optional Setup)
            </button>
          )}

          <span className="text-xs sm:text-sm font-extrabold text-slate-500 block text-center pt-1">
            Kibo Math by Kibo Climb • Bite-Sized Daily Ascents (~3 Mins)
          </span>
        </div>
      </div>
    </div>
  );
}
