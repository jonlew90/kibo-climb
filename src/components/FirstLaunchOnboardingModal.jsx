import React, { useState, useEffect, useRef } from 'react';
import { Play, Zap, Flame, ShoppingBag, ArrowRight, User, CheckCircle2, GraduationCap, BookOpen, Calculator, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import ConfettiCanvas from './ConfettiCanvas';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { leaderboardService } from '../services/leaderboardService';
import { GRADE_STARTING_RATINGS } from '../utils/mathCurriculum';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { Dices, ShieldCheck, RefreshCw, AlertCircle, Lock } from 'lucide-react';
import { parentChildService } from '../services/parentChildService';
import PinGateModal from './PinGateModal';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';

const GRADE_OPTIONS = Object.keys(GRADE_STARTING_RATINGS);

import { SAFE_ADJECTIVES, SAFE_NOUNS, generateSafeUsername, validateSafeChildUsername } from '../utils/safeNames';
export { SAFE_ADJECTIVES, SAFE_NOUNS, generateSafeUsername, validateSafeChildUsername };

export const GRADE_CURRICULUM_DETAILS = {
  'Kindergarten': {
    math: 'Counting, single-digit + / -',
    words: 'Alphabet & basic phonics',
    world: 'Continents & major oceans',
    coding: 'Visual patterns & sequence order',
    summary: 'Numbers, shapes, letters & logic'
  },
  'Grade 1–2': {
    math: 'Sums & differences to 20, making 10s',
    words: 'Sight words & basic spelling',
    world: 'Continents, oceans & cardinal directions',
    coding: 'Step algorithms & repeat patterns',
    summary: 'Addition/subtraction, reading roots & logic'
  },
  'Grade 3–4': {
    math: 'Multiplication (0s–9s) & time math',
    words: 'Vocabulary & compound words',
    world: 'US states, shapes & state capitals',
    coding: 'Grid navigation & boolean logic',
    summary: 'Multiplication, vocabulary & computational thinking'
  },
  'Grade 5–6': {
    math: 'Money decimals, fractions & division',
    words: 'Advanced spelling & prefixes/suffixes',
    world: 'Major world countries & sovereign capitals',
    coding: 'Variables, binary & conditionals',
    summary: 'Decimal arithmetic, fractions & state tracing'
  },
  'Grade 7–8': {
    math: 'Multi-digit arithmetic, fractions & PEMDAS',
    words: 'Complex grammar, parts of speech & word roots',
    world: 'Country shapes, hemispheres & physical geography',
    coding: 'Loops, functions & stack data structures',
    summary: 'Multi-step arithmetic, grammar & functions'
  },
  'High School & Beyond': {
    math: 'Linear equations, negatives & powers',
    words: 'Advanced verbal & language mastery',
    world: 'Global straits, tricky capitals & extreme geography',
    coding: 'Recursion, algorithms & Big-O complexity',
    summary: 'Advanced equations, verbal mastery & algorithmic logic'
  },
  // Backwards compatibility aliases
  'Pre-Algebra / Middle School': {
    math: 'Multi-digit arithmetic, fractions & PEMDAS',
    words: 'Complex grammar, parts of speech & word roots',
    world: 'Country shapes, hemispheres & physical geography',
    coding: 'Loops, functions & stack data structures',
    summary: 'Multi-step arithmetic, grammar & functions'
  },
  'Algebra & Beyond': {
    math: 'Linear equations, negatives & powers',
    words: 'Advanced verbal & language mastery',
    world: 'Global straits, tricky capitals & extreme geography',
    coding: 'Recursion, algorithms & Big-O complexity',
    summary: 'Advanced equations, verbal mastery & algorithmic logic'
  },
};

export default function FirstLaunchOnboardingModal({
  isOpen,
  equippedItems = [],
  onOpenParentZone,
  onStartAdaptiveClimb = () => {},
  onStartPlacementTest,
  onStartAtTier1,
  onUsernameSet,
  hasVisitedParentZone = false,
  onRequestLogin
}) {
  // step: 0 = welcome/about, 1 = username, 2 = grade selection, 'coppa_consent' = parent consent, 3 = welcome splash
  const [step, setStep] = useState(0);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameConfirmed, setUsernameConfirmed] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStartingSubject, setSelectedStartingSubject] = useState('math');
  const inputRef = useRef(null);
  const checkedUsernameRef = useRef('');
  const inFlightPromiseRef = useRef(null);

  // Background cloud claim / availability pre-check
  const verifyUsernameWithCloud = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: 'Please enter a username.' };
    const err = validateSafeChildUsername(trimmed);
    if (err) return { success: false, error: err };
    if (checkedUsernameRef.current === trimmed.toLowerCase()) {
      return { success: true, username: trimmed };
    }

    const promise = (async () => {
      try {
        const res = await leaderboardService.claimUsername(trimmed, storageService.getActiveProfileId());
        if (res.success) {
          checkedUsernameRef.current = trimmed.toLowerCase();
        }
        return res;
      } catch (err) {
        return { success: true, username: trimmed, isFallback: true };
      }
    })();

    inFlightPromiseRef.current = promise;
    const res = await promise;
    if (inFlightPromiseRef.current === promise) {
      inFlightPromiseRef.current = null;
    }
    return res;
  };

  // Debounced cloud check while typing
  useEffect(() => {
    const trimmed = usernameInput.trim();
    const validationErr = validateSafeChildUsername(trimmed);
    if (!trimmed || validationErr) return;
    if (checkedUsernameRef.current === trimmed.toLowerCase()) return;

    const timer = setTimeout(() => {
      verifyUsernameWithCloud(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [usernameInput]);

  // COPPA & Privacy Policy state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPinGateModal, setShowPinGateModal] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');

  // Pre-fill if username already set (e.g. returning to this screen)
  useEffect(() => {
    const existing = storageService.getUsername();
    if (existing) {
      setUsernameInput(existing);
      checkedUsernameRef.current = existing.trim().toLowerCase();
      const existingGrade = storageService.getActiveProfile()?.gradeLevel;
      if (existingGrade) {
        setSelectedGrade(existingGrade);
        setStep(3);
      } else {
        setStep(2);
      }
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
      if (e.key === 'Escape' && step === 3 && onStartAdaptiveClimb) {
        onStartAdaptiveClimb(selectedStartingSubject);
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
  }, [isOpen, step, selectedStartingSubject, onStartAdaptiveClimb]);

  if (!isOpen) return null;

  const handleGenerateSafeName = () => {
    soundFx.playKeyTap();
    const safeName = generateSafeUsername();
    setUsernameInput(safeName);
    setUsernameError('');
    // Pre-verify immediately on generation
    verifyUsernameWithCloud(safeName);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const error = validateSafeChildUsername(usernameInput);
    if (error) { setUsernameError(error); return; }
    const cleaned = usernameInput.trim();
    const normalized = cleaned.toLowerCase();

    // If already verified with the cloud, proceed immediately
    if (checkedUsernameRef.current === normalized) {
      soundFx.playVictory();
      setStep(2);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const res = inFlightPromiseRef.current
        ? await inFlightPromiseRef.current
        : await verifyUsernameWithCloud(cleaned);

      if (!res.success) {
        setUsernameError(res.error || 'This username is already taken. Please choose another one.');
        setIsCheckingUsername(false);
        return;
      }
      soundFx.playVictory();
      setIsCheckingUsername(false);
      setStep(2);
    } catch (err) {
      console.warn('Username claim error', err);
      soundFx.playVictory();
      setIsCheckingUsername(false);
      setStep(2);
    }
  };

  const handleGradeSelect = (grade) => {
    soundFx.playKeyTap();
    setSelectedGrade(grade);
  };

  const finalizeProfile = () => {
    const cleaned = usernameInput.trim();
    storageService.saveUsername(cleaned, selectedGrade);
    storageService.setOnboarded(true);
    if (onUsernameSet) onUsernameSet(cleaned);
    soundFx.playVictory();
    setStep(3);
  };

  const handleGradeConfirm = () => {
    if (!selectedGrade) return;
    const coppaStatus = parentChildService.getCOPPAConsentStatus();
    if (!coppaStatus.consented) {
      setConsentAgreed(false);
      setConsentError('');
      setStep('coppa_consent');
      return;
    }
    finalizeProfile();
  };

  const handleConsentSubmit = (e) => {
    if (e) e.preventDefault();
    if (!consentAgreed) {
      setConsentError('Please check the box to confirm adult status and agree to COPPA consent.');
      return;
    }
    setConsentError('');
    soundFx.playKeyTap();
    setShowPinGateModal(true);
  };

  const handlePinGateSuccess = () => {
    setShowPinGateModal(false);
    parentChildService.recordParentalConsent('parent_gate', {
      verifiedAt: new Date().toISOString()
    });
    finalizeProfile();
  };

  const handleStart = (subjectToStart = selectedStartingSubject) => {
    soundFx.playVictory();
    storageService.setOnboarded(true);
    if (typeof onStartAdaptiveClimb === 'function') onStartAdaptiveClimb(subjectToStart);
    else if (typeof onStartAtTier1 === 'function') onStartAtTier1();
    else if (typeof onStartPlacementTest === 'function') onStartPlacementTest();
  };

  // ─── STEP 0: Welcome & Overview ──────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[1000] h-[100dvh] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-pop overflow-y-auto">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center gap-4 sm:gap-5 text-center my-auto py-2">
          {/* Badge with Pronunciation */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              🏔️ Meet Kibo <span className="text-amber-200/90 font-bold lowercase tracking-normal text-[11px] sm:text-xs">(pronounced KEE-boh)</span>
            </span>
          </div>

          {/* Mascot Animation */}
          <div className="relative flex justify-center p-1 overflow-visible">
            <div className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none" />
            <Mascot mood="happy" state="idle" equipped={equippedItems}
              className="w-24 h-24 sm:w-28 sm:h-28 aspect-square filter drop-shadow-xl animate-bounce relative z-10" />
          </div>

          {/* Value Prop & Headline */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              The Daily Climb<br />to Mastery
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              Bite-sized daily challenges that adapt to every learner — building confidence one peak at a time.
            </p>
          </div>

          {/* 3 Core Subjects Card */}
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl mb-0.5">🔢</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">Math</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Numbers & logic</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-1">
              <span className="text-xl sm:text-2xl mb-0.5">📚</span>
              <span className="text-xs sm:text-sm font-black text-teal-300">Words</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Reading & vocab</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl mb-0.5">🌍</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300">World</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Maps & capitals</span>
            </div>
          </div>

          {/* Pronunciation & Kilimanjaro Fun Fact */}
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-full">
            <span>💡</span>
            <span>Fun fact: <strong>Kibo</strong> (KEE-boh) is the summit of Mt. Kilimanjaro!</span>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setStep(1);
            }}
            className="w-full h-13 sm:h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 border-b-4 border-orange-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Adventure</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Secondary Actions */}
          <div className="flex flex-col items-center gap-2 pt-0.5">
            {onRequestLogin && (
              <p className="text-xs text-slate-300 font-medium">
                Already have a Kibo account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    onRequestLogin();
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}
            {onOpenParentZone && (
              <button
                type="button"
                onClick={() => { soundFx.playKeyTap(); onOpenParentZone(); }}
                className="text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                {hasVisitedParentZone ? '🔒 Parent Zone' : '🔒 Parent Zone Setup'}
              </button>
            )}
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); setShowPrivacyModal(true); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>COPPA Notice & Privacy Policy</span>
            </button>
          </div>
        </div>

        {showPrivacyModal && (
          <PrivacyPolicyScreen onBack={() => setShowPrivacyModal(false)} />
        )}
      </div>
    );
  }

  // ─── STEP 1: Username ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[1000] h-[100dvh] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-pop overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 sm:gap-5 text-center">
          {/* Step indicator with back button */}
          <div className="flex items-center justify-between w-full text-xs font-black uppercase tracking-widest text-slate-500">
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setStep(0);
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">Step 1</span>
              <span>/</span>
              <span>2</span>
            </div>
            <div className="w-12" aria-hidden="true" />
          </div>

          <div className="relative flex justify-center p-1 overflow-visible">
            <div className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none" />
            <Mascot mood="happy" state="idle" equipped={equippedItems}
              className="w-24 h-24 sm:w-28 sm:h-28 aspect-square filter drop-shadow-xl animate-bounce relative z-10" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                🏔️ Kibo Climb
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                🔢 Math, 📚 Words & 🌍 World
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              What should we<br />call you, Climber?
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Choose a fun nickname for your climber profile.
            </p>
          </div>

          <form onSubmit={handleUsernameSubmit} className="w-full space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.5]" />
              <input
                ref={inputRef}
                type="text"
                value={usernameInput}
                onChange={(e) => { setUsernameInput(e.target.value); setUsernameError(''); }}
                placeholder="e.g. CosmicOtter42"
                maxLength={20}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isCheckingUsername}
                className={`w-full pl-10 pr-4 py-3.5 bg-white/10 border-2 rounded-2xl text-white font-extrabold text-base placeholder:text-slate-500 focus:outline-none transition-all ${
                  usernameError ? 'border-rose-500 bg-rose-500/10'
                  : usernameConfirmed ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/20 focus:border-purple-400 focus:bg-white/15'
                }`}
              />
              {usernameConfirmed && (
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 stroke-[2.5]" />
              )}
            </div>

            {/* Quick Safe Name Generator Button */}
            <button
              type="button"
              onClick={handleGenerateSafeName}
              className="w-full py-2.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-xl text-purple-200 text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Dices className="w-4 h-4 text-amber-300" />
              <span>🎲 Generate Kid-Safe Tag</span>
            </button>

            {usernameError && <p className="text-xs font-bold text-rose-400 text-left px-1">{usernameError}</p>}
            
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>3–20 characters · No spaces</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Kid Safe
              </span>
            </div>

            <button type="submit"
              disabled={isCheckingUsername}
              className="w-full h-13 sm:h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 border-b-4 border-orange-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {isCheckingUsername ? (
                <span className="animate-pulse">Checking availability...</span>
              ) : usernameConfirmed ? (
                <><CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Confirmed!</>
              ) : (
                <>Next <ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
              )}
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 pt-1">
            {onRequestLogin && (
              <p className="text-xs text-slate-300 font-medium">
                Already have a Kibo account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    onRequestLogin();
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}
            {onOpenParentZone && (
              <button type="button" onClick={() => { soundFx.playKeyTap(); onOpenParentZone(); }}
                className="text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer">
                {hasVisitedParentZone ? '🔒 Parent Zone' : '🔒 Parent Zone Setup'}
              </button>
            )}
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); setShowPrivacyModal(true); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>COPPA Notice & Privacy Policy</span>
            </button>
          </div>
        </div>
        {showPrivacyModal && (
          <PrivacyPolicyScreen onBack={() => setShowPrivacyModal(false)} />
        )}
      </div>
    );
  }

  // ─── STEP 2: Grade Selection ──────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[1000] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-pop overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center gap-3.5 sm:gap-4.5 text-center max-h-[96dvh] overflow-hidden py-1 sm:py-2">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 shrink-0">
            <span className="text-slate-600">Step 1</span>
            <span>/</span>
            <span className="text-amber-400">Step 2</span>
          </div>

          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              <span className="text-xs font-black uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-full">
                Multi-Subject Grade Level
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              What grade is<br />{usernameInput || 'the climber'} in?
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Calibrates starting difficulty for <strong className="text-amber-300">Math, Words & World</strong> so challenges feel just right.
            </p>
          </div>

          {/* Bounded Vertically Scrollable Grade Option Tiles */}
          <div className="w-full max-h-[48dvh] sm:max-h-[52dvh] overflow-y-auto space-y-2 pr-1 custom-scrollbar shrink">
            {GRADE_OPTIONS.map((grade) => {
              const details = GRADE_CURRICULUM_DETAILS[grade] || { math: '', words: '', world: '', summary: '' };
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleGradeSelect(grade)}
                  className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 shadow-md shadow-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                    isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm sm:text-base font-black text-white truncate">{grade}</span>
                      {isSelected && (
                        <span className="text-xs font-black uppercase text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded-md">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs">
                      <div className="flex items-center gap-1 text-amber-200/90 font-medium truncate">
                        <span className="text-xs shrink-0">🔢</span>
                        <span className="truncate">{details.math}</span>
                      </div>
                      <div className="flex items-center gap-1 text-teal-200/90 font-medium truncate">
                        <span className="text-xs shrink-0">📚</span>
                        <span className="truncate">{details.words}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-200/90 font-medium truncate">
                        <span className="text-xs shrink-0">🌍</span>
                        <span className="truncate">{details.world}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full flex items-center gap-2 pt-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setStep(1);
              }}
              className="px-4 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-sm sm:text-base rounded-2xl shrink-0 transition-all cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleGradeConfirm}
              disabled={!selectedGrade}
              className={`flex-1 py-3 sm:py-3.5 font-black text-sm sm:text-base rounded-2xl border-b-4 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1.5 ${
                selectedGrade
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 border-orange-700 cursor-pointer'
                  : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'
              }`}
            >
              Parent Verification 🔒
            </button>
          </div>
        </div>
        {showPrivacyModal && (
          <PrivacyPolicyScreen onBack={() => setShowPrivacyModal(false)} />
        )}
      </div>
    );
  }

  // ─── STEP: Verifiable Parental Consent (COPPA) ───────────────────────────
  if (step === 'coppa_consent') {
    return (
      <div className="fixed inset-0 z-[1000] h-[100dvh] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-3 sm:p-5 select-none animate-pop overflow-y-auto">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 text-center my-auto py-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 shrink-0">
            <span className="text-slate-600">Step 1</span>
            <span>/</span>
            <span className="text-slate-600">Step 2</span>
            <span>/</span>
            <span className="text-amber-400">Parent Consent</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-teal-300">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Parental Verification & Consent (COPPA)
            </h2>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 text-left space-y-2 text-xs sm:text-sm text-slate-200">
            <p className="font-medium leading-relaxed">
              Under the Children's Online Privacy Protection Act (COPPA), verifiable consent from an adult parent or legal guardian is required before collecting any educational practice data or username for children under 13.
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { soundFx.playKeyTap(); setShowPrivacyModal(true); }}
                className="text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 underline cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Read COPPA Privacy Policy
              </button>
            </div>
          </div>

          {/* Adult Verification Info Card */}
          <div className="w-full bg-white/5 border border-purple-400/30 rounded-2xl p-3.5 sm:p-4 text-left flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white">
                Parental Gate Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Verify adulthood via <strong>Face ID / Touch ID</strong>, device PIN, or dynamic adult challenge.
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="w-full flex items-start gap-2.5 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => {
                setConsentAgreed(e.target.checked);
                setConsentError('');
              }}
              className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 shrink-0 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-200 font-medium leading-normal">
              I confirm I am an adult parent or legal guardian. I consent to the collection and use of educational practice progress and safe climber tag under Kibo Climb's Privacy Policy.
            </span>
          </label>

          {consentError && (
            <div className="w-full p-2.5 bg-rose-500/20 border border-rose-400 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-1.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{consentError}</span>
            </div>
          )}

          <div className="w-full flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setStep(2);
              }}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-sm rounded-xl shrink-0 transition-all cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConsentSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 border-b-4 border-orange-700 active:translate-y-0.5 active:border-b-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Verify as Parent</span>
            </button>
          </div>
        </div>
        {showPrivacyModal && (
          <PrivacyPolicyScreen onBack={() => setShowPrivacyModal(false)} />
        )}
        <PinGateModal
          isOpen={showPinGateModal}
          onClose={() => setShowPinGateModal(false)}
          onUnlockSuccess={handlePinGateSuccess}
          title="Parental Verification"
          subtitle="Verify adult status to provide COPPA consent."
        />
      </div>
    );
  }

  // ─── STEP 3: Welcome Splash ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-hidden overflow-x-hidden select-none animate-pop border-none">
      <ConfettiCanvas />

      <div className="w-full max-w-2xl mx-auto min-h-full flex flex-col justify-between p-3.5 sm:p-5 md:p-6 box-border relative z-10 text-center gap-3">

        <div className="shrink-0 flex flex-col items-center text-center space-y-1.5 pt-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs sm:text-sm font-black uppercase text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3.5 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block tracking-wider animate-pulse">
              🏔️ Welcome to Kibo Climb
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Ready, <span className="text-purple-700">{usernameInput || storageService.getUsername()}</span>? 🚀
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-purple-900 max-w-lg mx-auto leading-normal">
            Bite-Sized Daily Climbs — Adaptive Multi-Subject Training (Math, Words, World & More) That Evolves With Your Mind
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 py-1 my-auto">
          <div className="relative py-1 flex justify-center items-center shrink-0 p-1 overflow-visible">
            <div className="absolute w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
            <Mascot mood="happy" state="idle" equipped={equippedItems}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 aspect-square filter drop-shadow-xl animate-bounce" />
          </div>

          {/* Multi-Subject Showcase Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 bg-white/95 border-2 border-amber-200/90 rounded-3xl p-3 sm:p-4 shadow-xl shrink-0 text-left">
            {/* Math Subject Card */}
            <div className="flex flex-col items-start gap-1 sm:gap-2 bg-amber-50/90 border border-amber-200 rounded-2xl p-2 sm:p-2.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1 w-full">
                <span className="text-base sm:text-lg">🔢</span>
                <h4 className="text-xs sm:text-sm font-black text-amber-950">Math</h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight">
                Arithmetic, fractions, algebra, geometry & more.
              </p>
            </div>

            {/* Words Subject Card */}
            <div className="flex flex-col items-start gap-1 sm:gap-2 bg-teal-50/90 border border-teal-200 rounded-2xl p-2 sm:p-2.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1 w-full">
                <span className="text-base sm:text-lg">📚</span>
                <h4 className="text-xs sm:text-sm font-black text-teal-950">Words</h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight">
                Phonics, spelling, vocabulary, reading & more.
              </p>
            </div>

            {/* World Subject Card */}
            <div className="flex flex-col items-start gap-1 sm:gap-2 bg-emerald-50/90 border border-emerald-200 rounded-2xl p-2 sm:p-2.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1 w-full">
                <span className="text-base sm:text-lg">🌍</span>
                <h4 className="text-xs sm:text-sm font-black text-emerald-950">World</h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight">
                Geography, countries, capitals, history & more.
              </p>
            </div>

            {/* Daily Streaks & Shop Card */}
            <div className="flex flex-col items-start gap-1 sm:gap-2 bg-purple-50/90 border border-purple-200 rounded-2xl p-2 sm:p-2.5 transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-400" />
                  <h4 className="text-xs sm:text-sm font-black text-purple-950">Shop</h4>
                </div>
                <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-1 py-0.5 rounded">
                  🐾 Kibo's
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight">
                Earn Sparks for outfits and companion pets!
              </p>
            </div>
          </div>
        </div>

        {/* Subject Start Actions */}
        <div className="shrink-0 space-y-2 pt-1 pb-2 w-full">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleStart('math')}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm md:text-base rounded-2xl border-b-4 border-orange-700 shadow-md shadow-amber-500/20 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🔢</span>
              <span className="truncate">Math</span>
            </button>
            <button
              type="button"
              onClick={() => handleStart('words')}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm md:text-base rounded-2xl border-b-4 border-teal-800 shadow-md shadow-teal-600/20 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>📚</span>
              <span className="truncate">Words</span>
            </button>
            <button
              type="button"
              onClick={() => handleStart('world')}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm md:text-base rounded-2xl border-b-4 border-emerald-800 shadow-md shadow-emerald-600/20 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🌍</span>
              <span className="truncate">World</span>
            </button>
          </div>

          {onOpenParentZone && (
            <button type="button"
              onClick={() => { soundFx.playKeyTap(); onOpenParentZone(); }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer">
              {hasVisitedParentZone ? '🔒 Parent Zone' : '🔒 Parent Zone (Optional Setup)'}
            </button>
          )}

          <div className="text-center space-y-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 block">
              Kibo Climb • Multi-Subject Daily Climbs • Math, Words & World
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">
              💡 Fun fact: "Kibo" (KEE-boh) is the highest peak of Mount Kilimanjaro!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
