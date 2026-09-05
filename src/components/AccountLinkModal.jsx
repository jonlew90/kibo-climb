import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, X, ArrowRight, Mail, Zap, AlertTriangle, Lock, Cloud, Smartphone } from 'lucide-react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { parentChildService } from '../services/parentChildService';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import CoppaPrivacyPolicyScreen from './CoppaPrivacyPolicyScreen';
import CoppaConsentModal from './CoppaConsentModal';
import PinGateModal from './PinGateModal';
import FamilyPlanUpgradeModal from './FamilyPlanUpgradeModal';

export default function AccountLinkModal({
  isOpen,
  onClose,
  onAccountLinked,
  triggerMilestone,
  milestoneName,
  onOpenFamilyPlan
}) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [conflictData, setConflictData] = useState(null);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showCoppaPolicyModal, setShowCoppaPolicyModal] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [showFamilyUpgrade, setShowFamilyUpgrade] = useState(false);
  const [showCoppaConsentModal, setShowCoppaConsentModal] = useState(false);
  const [pendingLinkParams, setPendingLinkParams] = useState(null);

  const initialMilestone = triggerMilestone || milestoneName || 'Cloud Account Sync';
  const isInitialRestore = initialMilestone.toLowerCase().includes('restore') || initialMilestone.toLowerCase().includes('log in');
  const [activeMode, setActiveMode] = useState(isInitialRestore ? 'restore' : 'save');

  React.useEffect(() => {
    if (isOpen) {
      setLoadingProvider(null);
      setEmailInput('');
      setShowEmailInput(false);
      setSuccessMessage('');
      setErrorMessage('');
      setConflictData(null);
      setShowPrivacyPolicyModal(false);
      setShowCoppaPolicyModal(false);
      setShowPinGate(false);
      setShowFamilyUpgrade(false);
      setShowCoppaConsentModal(false);
      setPendingLinkParams(null);
      const shouldRestore = (triggerMilestone || milestoneName || '').toLowerCase().includes('restore') || 
                            (triggerMilestone || milestoneName || '').toLowerCase().includes('log in');
      setActiveMode(shouldRestore ? 'restore' : 'save');
    }
  }, [isOpen, triggerMilestone, milestoneName]);

  if (!isOpen) return null;

  const milestone = triggerMilestone || milestoneName || (activeMode === 'restore' ? 'Account Login' : 'Cloud Account Sync');
  const badgeText = activeMode === 'restore'
    ? 'Restore Existing Account'
    : (milestone.toLowerCase().includes('milestone') || milestone.toLowerCase().includes('unlocked')
      ? (milestone.toLowerCase().includes('unlocked') ? milestone : `${milestone} Unlocked!`)
      : (milestone.toLowerCase().includes('save') ? 'Save Your Climber' : milestone));

  const handleLinkProvider = (provider, useRedirect = false) => {
    const coppaStatus = parentChildService.getCOPPAConsentStatus();
    if (!coppaStatus.consented) {
      setPendingLinkParams({ provider, useRedirect });
      setShowCoppaConsentModal(true);
      return;
    }
    executeLinkProvider(provider, useRedirect);
  };

  const handleCoppaConsentGranted = () => {
    setShowCoppaConsentModal(false);
    if (pendingLinkParams) {
      const { provider, useRedirect } = pendingLinkParams;
      setPendingLinkParams(null);
      executeLinkProvider(provider, useRedirect);
    }
  };

  const executeLinkProvider = async (provider, useRedirect = false) => {
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

      if (res.requires_conflict_resolution) {
        setConflictData({
          linkedUser: res.linkedUser,
          cloudProfiles: res.cloudProfiles || {},
          localProfiles: res.localProfiles || [],
          cloudHasFamilyPlan: res.cloudHasFamilyPlan,
          localHasFamilyPlan: res.localHasFamilyPlan
        });
        return;
      }

      if (res.emailSent) {
        setSuccessMessage(`Magic link sent! Please check your email inbox at ${emailInput} and click the link to finish signing in.`);
        return;
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

  const handleConflictResolution = async (action) => {
    setLoadingProvider('resolving');
    try {
      const res = await authService.resolveLinkConflict(action, conflictData.linkedUser);
      if (res.success) {
        if (res.reload) {
          window.location.reload();
        } else {
          setSuccessMessage('Cloud account synced successfully!');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setErrorMessage(res.reason || 'Failed to resolve sync conflict.');
        setConflictData(null);
      }
    } catch(e) {
      setErrorMessage(e.message);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border-4 border-indigo-500 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3.5 text-center relative overflow-hidden max-h-[88vh] overflow-y-auto animate-pop cursor-default"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Toggle Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMode('save')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'save'
                ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeMode === 'save' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Save Progress</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('restore')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'restore'
                ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className={`w-3.5 h-3.5 ${activeMode === 'restore' ? 'text-sky-500' : 'text-slate-400'}`} />
            <span>Log In</span>
          </button>
        </div>

        {/* Dynamic Context Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
          activeMode === 'restore' 
            ? 'bg-sky-100 text-sky-950 border border-sky-300' 
            : 'bg-amber-100 text-amber-950 border border-amber-300'
        }`}>
          {activeMode === 'restore' ? (
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>{badgeText}</span>
        </div>

        {/* Title & Headline */}
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {activeMode === 'restore' ? 'Log In to Your Account' : 'Save Progress Across Devices'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
            {activeMode === 'restore'
              ? 'Restore your climber, cloud sparks, and math progress.'
              : 'Link your guest account so outfits, streaks, and stats are never lost.'}
          </p>
        </div>

        {/* Reassurance Notice for Log In Mode */}
        {activeMode === 'restore' && !successMessage && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-2.5 py-1.5 text-left text-sky-950 text-xs flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <p className="font-medium text-[11px] leading-snug">
              Differences with local device progress can be reviewed before syncing.
            </p>
          </div>
        )}

        {/* Incentive Badge (Only for Save Mode) */}
        {!successMessage && activeMode === 'save' && (
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
        ) : conflictData ? (
          <div className="space-y-4 animate-pop text-left">
            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Save Conflict: Profile Limit Reached</span>
              </div>
              <p className="text-slate-600 font-medium">
                This cloud account already has saved progress. Review the profiles on each side:
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Cloud Account Card */}
              <div className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-700 font-black text-[11px] uppercase tracking-wide">
                  <Cloud className="w-3.5 h-3.5 shrink-0" />
                  <span>Cloud Account</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {Object.values(conflictData.cloudProfiles || {}).map((p, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs">
                      <div className="font-black text-xs text-slate-800 truncate">{p.name || p.username || 'Climber'}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{p.gradeLevel || 'Grade 1–2'}</div>
                      <div className="text-[10px] text-indigo-600 font-extrabold mt-0.5">
                        ⚡ {p.userData?.sparks || 0} • Rating {p.userData?.adaptiveCompetenceRating || p.userData?.competenceRank || 1000}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* This Device Card */}
              <div className="bg-slate-50 border-2 border-amber-200 rounded-2xl p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 font-black text-[11px] uppercase tracking-wide">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>This Device</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(conflictData.localProfiles && conflictData.localProfiles.length > 0
                    ? conflictData.localProfiles
                    : [storageService.getActiveProfile()]
                  ).map((p, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs">
                      <div className="font-black text-xs text-slate-800 truncate">{p?.name || p?.username || 'Guest'}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{p?.gradeLevel || 'Grade 1–2'}</div>
                      <div className="text-[10px] text-amber-600 font-extrabold mt-0.5">
                        ⚡ {p?.userData?.sparks || 0} • Rating {p?.userData?.adaptiveCompetenceRating || p?.userData?.competenceRank || 1000}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {/* 1. Safe Primary Action: Keep Cloud */}
              <button
                type="button"
                onClick={() => handleConflictResolution('keep_cloud')}
                disabled={!!loadingProvider}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>{loadingProvider === 'resolving' ? 'Syncing Cloud Account...' : 'Load Cloud Account (Recommended)'}</span>
              </button>

              {/* 2. Upgrade to Family Plan (Keep Both) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenFamilyPlan) {
                    onClose();
                    onOpenFamilyPlan();
                  } else {
                    setShowFamilyUpgrade(true);
                  }
                }}
                disabled={!!loadingProvider}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Upgrade to Family Plan (Keep Both)</span>
              </button>

              {/* 3. Destructive Action (Parent PIN Gated) */}
              <button
                type="button"
                onClick={() => setShowPinGate(true)}
                disabled={!!loadingProvider}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Overwrite Cloud with This Device (Parent PIN)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Link Options */
          <div className="space-y-2 pt-1">
            {/* Google 1-Tap Popup Link */}
            <button
              onClick={() => handleLinkProvider('google', false)}
              disabled={!!loadingProvider}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>
                {loadingProvider === 'google'
                  ? (activeMode === 'restore' ? 'Signing in with Google...' : 'Linking Google Account...')
                  : (activeMode === 'restore' ? 'Log in with Google (Popup)' : 'Save with Google (Popup)')}
              </span>
            </button>

            {/* Google Full Redirect Option (No COOP warning) */}
            <button
              onClick={() => handleLinkProvider('google', true)}
              disabled={!!loadingProvider}
              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {activeMode === 'restore' ? 'Log in via Full Redirect (No Popups)' : 'Save via Full Redirect (No Popups)'}
              </span>
            </button>

            {/* Apple 1-Tap Link */}
            <button
              onClick={() => handleLinkProvider('apple')}
              disabled={!!loadingProvider}
              className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-700" />
                <span>{activeMode === 'restore' ? 'Log in with Email Magic Link' : 'Save with Email Magic Link'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ) : (
              <div className="space-y-2 pt-1 animate-pop">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleLinkProvider('magic_link')}
                  disabled={!emailInput || !emailInput.includes('@') || !!loadingProvider}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{loadingProvider === 'magic_link' ? 'Sending Magic Link...' : (activeMode === 'restore' ? 'Send Login Magic Link' : 'Send 1-Click Magic Link')}</span>
                </button>
              </div>
            )}

            {/* Mode Switch Helper Prompt */}
            <div className="pt-0.5 text-center">
              {activeMode === 'save' ? (
                <p className="text-[11px] text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMode('restore')}
                    className="text-indigo-600 hover:text-indigo-800 font-black underline cursor-pointer"
                  >
                    Log In to restore
                  </button>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium">
                  First time playing on this device?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMode('save')}
                    className="text-indigo-600 hover:text-indigo-800 font-black underline cursor-pointer"
                  >
                    Save progress instead
                  </button>
                </p>
              )}
            </div>
          </div>
        )}


        {/* Security & COPPA Footer Note */}
        <div className="space-y-0.5 pt-1.5 border-t border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Passwordless Security • COPPA Compliant Sync</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            Parental use only. Encrypted under our{' '}
            <button
              type="button"
              onClick={() => setShowCoppaPolicyModal(true)}
              className="text-teal-600 hover:text-teal-800 underline font-bold cursor-pointer"
            >
              COPPA
            </button>{' '}
            &{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyPolicyModal(true)}
              className="text-purple-600 hover:text-purple-800 underline font-bold cursor-pointer"
            >
              Privacy Policy
            </button>.
          </p>
        </div>
      </div>

      {showPrivacyPolicyModal && (
        <PrivacyPolicyScreen
          onBack={() => setShowPrivacyPolicyModal(false)}
          onNavigateCoppa={() => {
            setShowPrivacyPolicyModal(false);
            setShowCoppaPolicyModal(true);
          }}
        />
      )}

      {showCoppaPolicyModal && (
        <CoppaPrivacyPolicyScreen
          onBack={() => setShowCoppaPolicyModal(false)}
          onNavigatePrivacy={() => {
            setShowCoppaPolicyModal(false);
            setShowPrivacyPolicyModal(true);
          }}
        />
      )}

      {/* Parental PIN Gate for Destructive Cloud Overwrite */}
      <PinGateModal
        isOpen={showPinGate}
        onClose={() => setShowPinGate(false)}
        onUnlockSuccess={() => {
          setShowPinGate(false);
          handleConflictResolution('overwrite_cloud');
        }}
        title="Parent Verification"
        subtitle="Parental verification required to permanently overwrite cloud progress."
      />

      {/* Family Plan Upgrade Flow to Keep Both Profiles */}
      <FamilyPlanUpgradeModal
        isOpen={showFamilyUpgrade}
        onClose={() => setShowFamilyUpgrade(false)}
        onOpenParentZone={(targetTab = 'verification', targetHighlight = 'family_plan') => {
          setShowFamilyUpgrade(false);
          if (onOpenFamilyPlan) {
            onClose();
            onOpenFamilyPlan(targetTab, targetHighlight);
          }
        }}
      />

      {/* COPPA Consent Modal presented right before linking */}
      <CoppaConsentModal
        isOpen={showCoppaConsentModal}
        onClose={() => {
          setShowCoppaConsentModal(false);
          setPendingLinkParams(null);
        }}
        onConsentGranted={handleCoppaConsentGranted}
      />
    </div>
  );
}
