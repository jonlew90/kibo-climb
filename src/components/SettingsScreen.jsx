import React from 'react';
import { Settings, Volume2, VolumeX, Smartphone, FileText, ShieldAlert, Mail, ArrowLeft, Music } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function SettingsScreen({ preferences, onUpdatePreferences, renderFooter, onNavigate, onBack, onOpenFeedback, onOpenParentZone, onSwitchProfile }) {
  const isMuted = preferences?.isMuted ?? false;
  const isMusicMuted = preferences?.isMusicMuted ?? false;
  const isHapticsEnabled = preferences?.isHapticsEnabled ?? true;

  const handleBack = () => {
    soundFx.playKeyTap();
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('/', 'adaptive_session');
    }
  };

  const handleToggleMute = () => {
    soundFx.playKeyTap();
    onUpdatePreferences({ ...preferences, isMuted: !isMuted });
  };

  const handleToggleMusic = () => {
    soundFx.playKeyTap();
    onUpdatePreferences({ ...preferences, isMusicMuted: !isMusicMuted });
  };

  const handleToggleHaptics = () => {
    soundFx.playKeyTap();
    onUpdatePreferences({ ...preferences, isHapticsEnabled: !isHapticsEnabled });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5 text-slate-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Settings</h2>
          </div>
        </div>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="w-full bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-200 max-w-lg mx-auto space-y-6">
          {/* Family & Profiles Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-1">Family & Profiles</h3>
            
            {onOpenParentZone && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  onOpenParentZone();
                }}
                className="flex items-center justify-between p-3.5 bg-purple-50/80 hover:bg-purple-100/80 border-2 border-purple-300 rounded-2xl transition-all active:scale-95 w-full text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 text-purple-800 rounded-xl border border-purple-300">
                    <Settings className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-purple-950 block text-sm">Parent Dashboard</span>
                    <span className="text-xs text-purple-700">PIN-protected stats, controls & reports</span>
                  </div>
                </div>
                <span className="text-xs font-black text-purple-700 bg-white/90 border border-purple-200 px-2.5 py-1 rounded-lg">
                  Enter 🔒
                </span>
              </button>
            )}

            {onSwitchProfile && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  onSwitchProfile();
                }}
                className="flex items-center justify-between p-3.5 bg-sky-50/80 hover:bg-sky-100/80 border-2 border-sky-300 rounded-2xl transition-all active:scale-95 w-full text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-200 text-sky-800 rounded-xl border border-sky-300">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sky-950 block text-sm">Manage & Switch Profiles</span>
                    <span className="text-xs text-sky-700">Change climber or create a new profile</span>
                  </div>
                </div>
                <span className="text-xs font-black text-sky-700 bg-white/90 border border-sky-200 px-2.5 py-1 rounded-lg">
                  Switch 👤
                </span>
              </button>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-1">Preferences</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border-2 ${!isMuted ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                  {!isMuted ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5 stroke-[2.5]" />}
                </div>
                <div>
                  <span className="font-extrabold text-slate-700 block text-sm">Sound Effects</span>
                  <span className="text-xs text-slate-500">In-game sound effects</span>
                </div>
              </div>
              <button
                onClick={handleToggleMute}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${!isMuted ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${!isMuted ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border-2 ${!isMusicMuted ? 'bg-purple-100 border-purple-300 text-purple-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                  <Music className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-700 block text-sm">Background Music</span>
                  <span className="text-xs text-slate-500">In-game background music</span>
                </div>
              </div>
              <button
                onClick={handleToggleMusic}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${!isMusicMuted ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${!isMusicMuted ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border-2 ${isHapticsEnabled ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-700 block text-sm">Haptic Feedback</span>
                  <span className="text-xs text-slate-500">Device vibrations</span>
                </div>
              </div>
              <button
                onClick={handleToggleHaptics}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isHapticsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isHapticsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-1">About & Legal</h3>

            <a
              href="/terms"
              className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                soundFx.playKeyTap();
                if (onNavigate) {
                  onNavigate('/terms', 'terms');
                } else {
                  window.history.pushState({}, '', '/terms');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg border border-amber-200">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-slate-700 text-sm">Terms of Service</span>
              </div>
            </a>

            <a
              href="/privacy"
              className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                soundFx.playKeyTap();
                if (onNavigate) {
                  onNavigate('/privacy', 'privacy');
                } else {
                  window.history.pushState({}, '', '/privacy');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                  <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-slate-700 text-sm">Privacy Policy</span>
              </div>
            </a>

            <button
              className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95 w-full text-left"
              onClick={() => {
                soundFx.playKeyTap();
                if (onOpenFeedback) onOpenFeedback();
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                  <Mail className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-slate-700 text-sm">Send Feedback</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
