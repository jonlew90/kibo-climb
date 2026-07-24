import React from 'react';
import { AlertCircle, Play, Home } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function QuitSprintModal({ isOpen, onKeepPlaying, onQuitToHome }) {
  if (!isOpen) return null;

  const handleKeepPlaying = () => {
    soundFx.playKeyTap();
    onKeepPlaying();
  };

  const handleQuit = () => {
    soundFx.playKeyTap();
    onQuitToHome();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white border-4 border-rose-300 rounded-3xl p-6 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-200 animate-bounce">
          <AlertCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Quit Sprint?</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Your progress on this set will be lost.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Keep Playing (Resume) */}
          <button
            onClick={handleKeepPlaying}
            className="btn-3d-orange w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-orange"
          >
            <Play className="w-5 h-5 fill-white stroke-[2.5]" />
            Keep Playing
          </button>

          {/* Quit to Home */}
          <button
            onClick={handleQuit}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-rose-600 font-extrabold text-sm rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            Quit to Home
          </button>
        </div>
      </div>
    </div>
  );
}
