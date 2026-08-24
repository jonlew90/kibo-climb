import React, { useState, useEffect } from 'react';
import { X, Wrench, Zap, Trophy, ShoppingBag, RotateCcw, AlertTriangle, CheckCircle2, Mail, Fingerprint, Lock, ShieldAlert, Calendar } from 'lucide-react';
import { storageService } from '../services/storageService';
import { communicationsService } from '../services/communicationsService';
import { nativeAuthService } from '../services/nativeAuthService';
import { calculateAdaptiveCompetenceProfile } from '../utils/domainStats';
import { getTierFromRating } from '../utils/mathCurriculum';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { SEASONAL_EVENTS } from '../utils/itemsCatalog';

export default function DevControlPanel({
  isOpen,
  onClose,
  onResetAllStats,
  onSetRating,
  onAdjustSparks,
  onUnlockAllWorkshopItems,
  onStateRefresh
}) {
  const [ratingInput, setRatingInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('');

  const currentData = storageService.getUserData('math');
  const currentRating = currentData.adaptiveCompetenceRating || currentData.competenceRank || 1000;
  const currentSparks = currentData.sparks || 0;
  const activeProfile = storageService.getActiveProfile() || {};
  const childName = activeProfile.name || 'Your Child';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden max-h-[85vh] overflow-y-auto cursor-default"
      >
        {/* Glow Background Accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-2">
                Developer Control Panel
                <span className="text-xs font-black uppercase text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-700">
                  kibodev
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Quick state overrides for debugging & testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
<button onClick={() => window.testRecordDailyPractice && window.testRecordDailyPractice()} className="w-full py-1.5 px-3 bg-fuchsia-50 text-fuchsia-700 border-2 border-fuchsia-200 rounded-xl font-bold hover:bg-fuchsia-100">Trigger Daily Practice</button>
        </div>

        {/* Success Toast Banner */}
        {successMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-pop">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* SECTION 1: COMPETENCE RATING EDITOR */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-indigo-400" />
                Competence Rating ({currentRating} pts)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={ratingInput}
                onChange={(e) => setRatingInput(e.target.value)}
                placeholder={`Current: ${currentRating}`}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={() => {
                  if (ratingInput) {
                    onSetRating(ratingInput);
                    showToast(`Competence rating updated to ${ratingInput}!`);
                    setRatingInput('');
                    if (onStateRefresh) onStateRefresh();
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0 active:scale-95"
              >
                Apply
              </button>
            </div>

            {/* Quick Rating Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[800, 1000, 1250, 1500, 1750].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onSetRating(preset);
                    showToast(`Rating set to ${preset}!`);
                    if (onStateRefresh) onStateRefresh();
                  }}
                  className="text-xs font-bold bg-slate-900 hover:bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2.5 py-1 rounded-lg transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: SPARKS CURRENCY EDITOR */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              Sparks Balance ({currentSparks} ⚡)
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  onAdjustSparks(100);
                  showToast('+100 Sparks added!');
                  if (onStateRefresh) onStateRefresh();
                }}
                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 text-center"
              >
                +100 ⚡
              </button>
              <button
                onClick={() => {
                  onAdjustSparks(1000);
                  showToast('+1,000 Sparks added!');
                  if (onStateRefresh) onStateRefresh();
                }}
                className="flex-1 bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/50 text-amber-200 font-extrabold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 text-center"
              >
                +1,000 ⚡
              </button>
              <button
                onClick={() => {
                  onAdjustSparks('clear');
                  showToast('Sparks cleared to 0!');
                  if (onStateRefresh) onStateRefresh();
                }}
                className="bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-400 font-bold text-xs py-2 px-3 rounded-xl transition-all shrink-0"
              >
                Clear ⚡
              </button>
            </div>
          </div>

          {/* SECTION 3: WORKSHOP GEAR UNLOCKER */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              Workshop Items
            </span>

            <button
              onClick={() => {
                onUnlockAllWorkshopItems();
                showToast('Unlocked all Workshop accessories & cosmetics!');
                if (onStateRefresh) onStateRefresh();
              }}
              className="w-full bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 text-center"
            >
              🔓 Unlock All Workshop Accessories & Gear
            </button>
          </div>

          {/* SECTION 3.5: SEASON & HOLIDAY SIMULATOR */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              Season & Holiday Simulator
            </span>

            <p className="text-xs text-slate-400 leading-snug">
              Simulate any holiday or season to test recurring catalog rotation, shop items, and countdown timers.
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  storageService.setSimulatedDate(null);
                  showToast('Reset to Live Real-Time Date');
                  if (onStateRefresh) onStateRefresh();
                }}
                className={`text-xs font-extrabold py-1.5 px-2 rounded-xl border text-center transition-all ${
                  !storageService.getSimulatedDate()
                    ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                🕒 Live Real Time
              </button>

              {SEASONAL_EVENTS.filter((e) => e.id !== 'all_active').map((evt) => {
                const isSelected = storageService.getSimulatedDate() && evt.sampleDate && storageService.getSimulatedDate().toISOString().startsWith(evt.sampleDate);
                return (
                  <button
                    key={evt.id}
                    onClick={() => {
                      if (evt.sampleDate) {
                        storageService.setSimulatedDate(new Date(evt.sampleDate));
                        showToast(`Simulating ${evt.label}`);
                        if (onStateRefresh) onStateRefresh();
                      }
                    }}
                    className={`text-xs font-extrabold py-1.5 px-2 rounded-xl border text-left truncate transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {evt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
              />
              <button
                disabled={!customDateInput}
                onClick={() => {
                  if (customDateInput) {
                    storageService.setSimulatedDate(new Date(customDateInput));
                    showToast(`Simulating ${customDateInput}`);
                    if (onStateRefresh) onStateRefresh();
                  }
                }}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
              >
                Set Date
              </button>
            </div>
          </div>

          {/* SECTION 4: COMMUNICATIONS / NOTIFICATIONS */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400" />
              Test Communications (Per Profile & Mascot Subject)
            </span>

            <p className="text-xs text-slate-400 leading-snug">
              Send a test weekly progress digest with mascot subject line (🐾 🏔️) and played topics breakdown.
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="flex gap-2">
                <button
                  disabled={isSendingEmail || !testEmail.includes('@')}
                  onClick={async () => {
                    setIsSendingEmail(true);
                    const activeProf = storageService.getActiveProfile();
                    const result = await communicationsService.sendWeeklyDigest({
                      email: testEmail,
                      profile: activeProf
                    });
                    setIsSendingEmail(false);

                    if (result.success) {
                      showToast(`Weekly Digest sent for ${activeProf.name || childName}!`);
                    } else {
                      alert('Failed to send notification: ' + result.error);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  {isSendingEmail ? 'Sending...' : `Send for ${childName}`}
                </button>

                <button
                  disabled={isSendingEmail || !testEmail.includes('@')}
                  onClick={async () => {
                    setIsSendingEmail(true);
                    const allProfs = storageService.getAllProfiles();
                    const result = await communicationsService.sendAllWeeklyDigests({
                      email: testEmail,
                      profiles: allProfs
                    });
                    setIsSendingEmail(false);

                    if (result.success) {
                      showToast(`Dispatched ${result.totalSent} individual digests for all profiles!`);
                    } else {
                      alert('Failed to send notification: ' + result.error);
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  {isSendingEmail ? 'Sending...' : 'Send All Profiles'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: PARENTAL GATE & BIOMETRICS DEBUGGER */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              Parental Gate & Biometrics Debugger
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const cfg = nativeAuthService.getMockConfig();
                  nativeAuthService.setMockConfig({ available: !cfg.available });
                  showToast(`Mock Biometrics Available: ${!cfg.available}`);
                  if (onStateRefresh) onStateRefresh();
                }}
                className={`py-2 px-3 rounded-xl border text-left font-bold transition-all ${
                  nativeAuthService.getMockConfig().available
                    ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                Mock Bio: {nativeAuthService.getMockConfig().available ? 'Available ✅' : 'Unavailable ❌'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const cfg = nativeAuthService.getMockConfig();
                  nativeAuthService.setMockConfig({ success: !cfg.success });
                  showToast(`Mock Bio Auth Result: ${!cfg.success ? 'FORCE PASS' : 'FORCE FAIL'}`);
                  if (onStateRefresh) onStateRefresh();
                }}
                className={`py-2 px-3 rounded-xl border text-left font-bold transition-all ${
                  nativeAuthService.getMockConfig().success
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-600 text-rose-200'
                }`}
              >
                Bio Result: {nativeAuthService.getMockConfig().success ? 'Pass ✅' : 'Fail ❌'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  storageService.resetFailedAttempts();
                  showToast('Parental Gate lockout timer & failed count reset!');
                  if (onStateRefresh) onStateRefresh();
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-700/60 font-bold text-xs py-2 px-3 rounded-xl transition-all"
              >
                Reset Lockout & Attempts
              </button>

              <button
                type="button"
                onClick={() => {
                  storageService.saveParentSettings(null);
                  showToast('Custom PIN cleared (Default 1234 deprecated)');
                  if (onStateRefresh) onStateRefresh();
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-700/60 font-bold text-xs py-2 px-3 rounded-xl transition-all"
              >
                Clear Custom PIN
              </button>
            </div>
          </div>

          {/* SECTION 6: FULL DATA RESET */}
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Danger Zone
            </span>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset ALL user data, stats, and progress? This cannot be undone.')) {
                  onResetAllStats();
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 text-center shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              Reset All Stats & Progress (Full Wipe)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
