import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Lock, X, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export default function AccountLinkModal({ isOpen, onClose, onAccountLinked, triggerMilestone = 'Tier 2 Milestone' }) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLinkProvider = async (provider) => {
    setLoadingProvider(provider);
    try {
      const res = await authService.linkAccount({
        provider,
        email: provider === 'email' ? emailInput : null
      });

      if (res.success) {
        setSuccessMessage(`Account linked successfully with ${provider.toUpperCase()}! Your progress is now permanently synced.`);
        setTimeout(() => {
          if (onAccountLinked) onAccountLinked(res.user);
          onClose();
        }, 1800);
      }
    } catch (e) {
      console.error('Failed to link account', e);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white border-4 border-indigo-500 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden animate-pop">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Milestone Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{triggerMilestone} Unlocked!</span>
        </div>

        {/* Title & Headline */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            Save Progress Across All Devices
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Link your anonymous guest account to ensure your Kibo outfits, math streaks, and achievements are never lost.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 animate-pop">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          /* Link Options */
          <div className="space-y-3 pt-2">
            {/* Google 1-Tap Link */}
            <button
              onClick={() => handleLinkProvider('google')}
              disabled={!!loadingProvider}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingProvider === 'google' ? 'Linking Google Account...' : 'Continue with Google'}</span>
            </button>

            {/* Email Option */}
            {!showEmailInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Link with Email Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProvider('email')}
                  disabled={!emailInput || !!loadingProvider}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loadingProvider === 'email' ? 'Linking Email...' : 'Save & Link Progress'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Secure Cloud Sync • No Spam Ever</span>
        </div>
      </div>
    </div>
  );
}
