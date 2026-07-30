import React from 'react';
import { AlertCircle, Play, Compass, Home } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function QuitSprintModal({ isOpen, isTestOut, onKeepPlaying, onQuitToHome, onQuitToMap }) {
  if (!isOpen) return null;

  const handleKeepPlaying = (e) => {
    if (e) e.preventDefault();
    try {
      soundFx.playKeyTap();
    } catch (err) {}
    onKeepPlaying();
  };

  const handleQuit = (e) => {
    if (e) e.preventDefault();
    try {
      soundFx.playKeyTap();
    } catch (err) {}
    if (isTestOut && onQuitToMap) {
      onQuitToMap();
    } else {
      onQuitToHome();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-rose-300 rounded-3xl p-6 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-200 animate-bounce">
          <AlertCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {isTestOut ? 'Quit Test Out Challenge?' : 'Quit Sprint?'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Your progress on this set will be lost.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Keep Playing (Resume) */}
          <button
            type="button"
            onClick={handleKeepPlaying}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Playing
          </button>

          {/* Quit to World Map or Home */}
          <button
            type="button"
            onClick={handleQuit}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-rose-600 font-extrabold text-sm rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            {isTestOut ? <Compass className="w-4 h-4 stroke-[2.5]" /> : <Home className="w-4 h-4 stroke-[2.5]" />}
            {isTestOut ? 'Quit to World Map 🗺️' : 'Quit to Main Menu 🏠'}
          </button>
        </div>
      </div>
    </div>
  );
}
