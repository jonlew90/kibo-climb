import React from 'react';
import { Settings, Volume2, VolumeX, Smartphone, FileText, ShieldAlert, Mail } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function SettingsScreen({ preferences, onUpdatePreferences, renderFooter }) {
  const isMuted = preferences?.isMuted ?? false;
  const isHapticsEnabled = preferences?.isHapticsEnabled ?? true;

  const handleToggleMute = () => {
    soundFx.playKeyTap();
    onUpdatePreferences({ ...preferences, isMuted: !isMuted });
  };

  const handleToggleHaptics = () => {
    soundFx.playKeyTap();
    onUpdatePreferences({ ...preferences, isHapticsEnabled: !isHapticsEnabled });
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 justify-between">
      <main className="w-full flex-1 flex flex-col items-center py-4 px-2 sm:px-4 animate-pop relative z-10 max-w-lg mx-auto overflow-y-auto">
      <div className="w-full bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 border-2 border-slate-200">
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Profile Preferences & Links</p>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border-2 ${!isMuted ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                {!isMuted ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5 stroke-[2.5]" />}
              </div>
              <div>
                <span className="font-extrabold text-slate-700 block text-sm">Sound Effects</span>
                <span className="text-xs text-slate-500">In-game audio and music</span>
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
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95"
            onClick={(e) => { soundFx.playKeyTap(); }}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg border border-amber-200">
                <FileText className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-700 text-sm">Terms of Service</span>
            </div>
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95"
            onClick={(e) => { soundFx.playKeyTap(); }}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-700 text-sm">Privacy Policy</span>
            </div>
          </a>

          <a
            href="mailto:hello@kibomath.com?subject=Kibo%20Math%20Feedback"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors active:scale-95"
            onClick={(e) => { soundFx.playKeyTap(); }}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                <Mail className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-700 text-sm">Send Feedback</span>
            </div>
          </a>
        </div>
      </div>
      </main>
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
