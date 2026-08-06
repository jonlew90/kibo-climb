import React, { useState, useEffect } from 'react';
import { X, Wrench, Zap, Trophy, ShoppingBag, RotateCcw, AlertTriangle, CheckCircle2, Mail } from 'lucide-react';
import { storageService } from '../services/storageService';
import { communicationsService } from '../services/communicationsService';

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

  const currentData = storageService.getUserData();
  const currentRating = currentData.adaptiveCompetenceRating || currentData.competenceRank || 1000;
  const currentSparks = currentData.sparks || 0;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
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
                <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-700">
                  kibodev
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Quick state overrides for debugging & testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
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
                  className="text-[10px] font-bold bg-slate-900 hover:bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2.5 py-1 rounded-lg transition-all"
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

          {/* SECTION 4: COMMUNICATIONS / NOTIFICATIONS */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400" />
              Test Communications
            </span>

            <p className="text-[10px] text-slate-400 leading-snug">
              Send a test notification to verify the communications pipeline.
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                disabled={isSendingEmail || !testEmail.includes('@')}
                onClick={async () => {
                  setIsSendingEmail(true);
                  const result = await communicationsService.sendParentNotification({
                    email: testEmail,
                    subject: 'Test Notification from Developer Panel',
                    message: 'This is a test notification generated from the kibodev Developer Control Panel to verify the communications pipeline is working correctly.',
                    type: 'email'
                  });
                  setIsSendingEmail(false);

                  if (result.success) {
                    showToast('Test notification sent successfully!');
                  } else {
                    alert('Failed to send notification: ' + result.error);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                {isSendingEmail ? 'Sending...' : 'Send Test Notification'}
              </button>
            </div>
          </div>

          {/* SECTION 5: FULL DATA RESET */}
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
