import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, FileText, X } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { parentChildService } from '../services/parentChildService';
import PinGateModal from './PinGateModal';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import CoppaPrivacyPolicyScreen from './CoppaPrivacyPolicyScreen';
import TermsOfServiceScreen from './TermsOfServiceScreen';

export default function CoppaConsentModal({
  isOpen,
  onClose,
  onConsentGranted
}) {
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [showPinGateModal, setShowPinGateModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCoppaModal, setShowCoppaModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  if (!isOpen) return null;

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
    if (onConsentGranted) {
      onConsentGranted();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border-2 border-purple-500/40 text-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto animate-pop cursor-default select-none"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 text-teal-300 pt-1">
          <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Parental Verification & Consent (COPPA)
          </h2>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 text-left space-y-2 text-xs sm:text-sm text-slate-200">
          <p className="font-medium leading-relaxed">
            Under the Children's Online Privacy Protection Act (COPPA), verifiable consent from an adult parent or legal guardian is required before linking an account to enable cloud sync, progress backup, and multi-device access.
          </p>
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); setShowCoppaModal(true); }}
              className="text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Read COPPA Policy
            </button>
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); setShowPrivacyModal(true); }}
              className="text-xs sm:text-sm font-bold text-indigo-300 hover:text-indigo-200 underline cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> Privacy Policy
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
              Verify adulthood via device PIN or adult challenge before linking your parent account.
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
            I confirm I am an adult parent or legal guardian. I consent to linking a parent account and syncing learning progress to the cloud under Kibo Climb's Privacy and COPPA Policies.
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
              onClose();
            }}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-sm rounded-xl shrink-0 transition-all cursor-pointer"
          >
            Cancel
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

        {showPrivacyModal && (
          <PrivacyPolicyScreen
            onBack={() => setShowPrivacyModal(false)}
            onNavigateCoppa={() => {
              setShowPrivacyModal(false);
              setShowCoppaModal(true);
            }}
          />
        )}
        {showCoppaModal && (
          <CoppaPrivacyPolicyScreen
            onBack={() => setShowCoppaModal(false)}
            onNavigatePrivacy={() => {
              setShowCoppaModal(false);
              setShowPrivacyModal(true);
            }}
          />
        )}
        {showTermsModal && (
          <TermsOfServiceScreen onBack={() => setShowTermsModal(false)} />
        )}
        <PinGateModal
          isOpen={showPinGateModal}
          onClose={() => setShowPinGateModal(false)}
          onUnlockSuccess={handlePinGateSuccess}
          title="Parental Verification"
          subtitle="Verify adult status to provide COPPA consent."
        />
      </div>
    </div>
  );
}
