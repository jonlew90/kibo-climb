import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Lock, X, ArrowRight, Mail, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

export default function AccountLinkModal({
  isOpen,
  onClose,
  onAccountLinked,
  triggerMilestone,
  milestoneName
}) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setLoadingProvider(null);
      setEmailInput('');
      setShowEmailInput(false);
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const milestone = triggerMilestone || milestoneName || 'Cloud Account Sync';
  const badgeText = milestone.toLowerCase().includes('milestone') || milestone.toLowerCase().includes('unlocked')
    ? (milestone.toLowerCase().includes('unlocked') ? milestone : `${milestone} Unlocked!`)
    : milestone;

  const handleLinkProvider = async (provider, useRedirect = false) => {
    setLoadingProvider(provider);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      let res;
      if (provider === 'magic_link') {
        res = await authService.sendMagicLink(emailInput);
      } else {
        res = await authService.linkAccount({ provider, useRedirect });
      }

      if (res.redirecting) {
        return; // Page will redirect to Google/Apple without COOP popups
      }

      if (res.success) {
        const earnedSparks = res.earnedSparks ?? storageService.grantAccountLinkSparksReward();

        const label = provider === 'google' ? 'Google 1-Tap' : provider === 'apple' ? 'Sign in with Apple' : 'Passwordless Magic Link';

        if (earnedSparks > 0) {
          setSuccessMessage(`Account linked successfully with ${label}! Your progress is now permanently synced. +200 ⚡ Earned!`);
        } else {
          setSuccessMessage(`Account linked successfully with ${label}! Your progress is now permanently synced.`);
        }

        setTimeout(() => {
          // Send the total sparks of the *current* active profile back via callback if needed
          const currentData = storageService.getUserData('math');
          if (onAccountLinked) onAccountLinked(res.user, currentData.sparks || 0);
          onClose();
        }, 1800);
      } else if (!res.cancelled) {
        setErrorMessage(res.reason || 'Failed to link account. Please try again.');
      }
    } catch (e) {
      console.error('Failed to link account', e);
      setErrorMessage(e.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white border-4 border-indigo-500 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden max-h-[85vh] overflow-y-auto animate-pop">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Context Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{badgeText}</span>
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

        {/* Incentive Badge */}
        {!successMessage && (
          <div className="bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-amber-950 shadow-sm animate-pulse">
            <Zap className="w-5 h-5 text-amber-600 fill-amber-400 stroke-[2.5]" />
            <span className="font-black text-sm">Link now for a +200 ⚡ Bonus!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 font-bold text-xs flex items-center justify-center gap-2 animate-pop">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 animate-pop">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          /* Link Options */
          <div className="space-y-3 pt-2">
            {/* Google 1-Tap Popup Link */}
            <button
              onClick={() => handleLinkProvider('google', false)}
              disabled={!!loadingProvider}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingProvider === 'google' ? 'Linking Google Account...' : 'Continue with Google (Popup)'}</span>
            </button>

            {/* Google Full Redirect Option (No COOP warning) */}
            <button
              onClick={() => handleLinkProvider('google', true)}
              disabled={!!loadingProvider}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-2xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Full Page Redirect (No Popups)</span>
            </button>

            {/* Apple 1-Tap Link */}
            <button
              onClick={() => handleLinkProvider('apple')}
              disabled={!!loadingProvider}
              className="w-full py-3 px-4 bg-black hover:bg-slate-900 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.04.24-9.97-1.84-14.79-6.23-3.29-2.87-7.14-7.55-11.55-14.04-6.3-9.29-11.39-19.8-15.26-31.53-3.87-11.73-5.81-22.9-5.81-33.51 0-14.86 3.65-27.18 10.96-36.95 7.3-9.77 16.59-14.78 27.87-15.03 4.87 0 10.15 1.23 15.84 3.69 5.69 2.46 9.61 3.69 11.76 3.69 1.76 0 5.8-1.29 12.13-3.87 6.33-2.58 11.74-3.75 16.23-3.51 12.12.72 21.91 4.97 29.37 12.75-10.84 6.54-16.14 15.58-15.9 27.12.24 9.07 3.65 16.7 10.23 22.89 6.58 6.19 14.52 9.77 23.82 10.74-2.53 7.55-5.96 15.42-10.29 23.61zM119.22 31.09c0-7.39 2.67-14.58 8.01-21.57 5.34-6.99 12.17-11.34 20.49-13.05.5 8.05-1.99 15.44-7.47 22.17-5.48 6.73-12.29 10.87-20.43 12.45-.25-1.58-.6-3.79-.6-6.63z"/>
              </svg>
              <span>{loadingProvider === 'apple' ? 'Signing in with Apple...' : 'Sign in with Apple'}</span>
            </button>

            {/* Passwordless Magic Link Email Option */}
            {!showEmailInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-700" />
                <span>Passwordless Magic Link Email</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ) : (
              <div className="space-y-2 pt-1 animate-pop">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProvider('magic_link')}
                  disabled={!emailInput || !emailInput.includes('@') || !!loadingProvider}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loadingProvider === 'magic_link' ? 'Sending Magic Link...' : 'Send 1-Click Magic Link'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Passwordless Security • No Passwords Required</span>
        </div>
      </div>
    </div>
  );
}
