import React, { useState } from 'react';
import { Plus, Lock, ChevronRight, Flame, Star, Zap } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';

function ProfileCard({ profile, onSelect, isSelected }) {
  const userData = profile.userData || {};
  const streak = userData.streak ?? 0;
  const rating = userData.adaptiveCompetenceRating || userData.competenceRank || 1000;
  const solved = userData.totalProblemsSolved ?? 0;
  const equipped = profile.shopState?.equippedItems || [];
  const displayName = profile.username || profile.name || 'Kibo Climber';

  return (
    <button
      type="button"
      onClick={() => onSelect(profile)}
      className={`group relative flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-center w-full
        ${isSelected
          ? 'border-amber-400 bg-amber-400/10 scale-[1.03] shadow-xl shadow-amber-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-[1.02]'
        }`}
    >
      {/* Glow ring on selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-amber-400/40 ring-offset-2 ring-offset-transparent pointer-events-none" />
      )}

      {/* Mascot */}
      <div className="relative">
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${isSelected ? 'bg-amber-400/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`} />
        <Mascot
          mood="happy"
          state="idle"
          equipped={equipped}
          className="h-20 w-auto object-contain relative z-10 drop-shadow-lg"
        />
      </div>

      {/* Name */}
      <div className="space-y-0.5">
        <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight truncate max-w-[140px]">
          {displayName}
        </h3>
        {profile.gradeLevel && (
          <span className="text-[10px] font-bold text-slate-400 block">{profile.gradeLevel}</span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px] font-black">
        <span className="flex items-center gap-0.5 text-amber-400">
          <Flame className="w-3 h-3 fill-amber-400" />{streak}d
        </span>
        <span className="flex items-center gap-0.5 text-purple-300">
          <Star className="w-3 h-3 fill-purple-300" />{rating}
        </span>
        <span className="flex items-center gap-0.5 text-emerald-400">
          <Zap className="w-3 h-3 fill-emerald-400" />{solved}
        </span>
      </div>

      {/* Play chevron */}
      <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${isSelected ? 'text-amber-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-slate-300'}`} />
    </button>
  );
}

export default function ProfileSelectorScreen({ onSelectProfile, onAddProfile }) {
  const [profiles] = useState(() => storageService.getAllProfiles());
  const [selectedId, setSelectedId] = useState(null);
  const [addPinInput, setAddPinInput] = useState('');
  const [showAddPin, setShowAddPin] = useState(false);
  const [addPinError, setAddPinError] = useState('');

  const handleSelect = (profile) => {
    soundFx.playKeyTap();
    setSelectedId(profile.id);
    // Small delay for the selection animation to register before transition
    setTimeout(() => {
      storageService.setActiveProfileId(profile.id);
      onSelectProfile(profile);
    }, 220);
  };

  const handleAddPinSubmit = (e) => {
    e.preventDefault();
    const { pin } = storageService.getParentSettings();
    if (addPinInput === pin) {
      soundFx.playVictory();
      setShowAddPin(false);
      setAddPinInput('');
      setAddPinError('');
      onAddProfile();
    } else {
      soundFx.playError?.();
      setAddPinError('Incorrect PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-[900] h-[100dvh] bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between overflow-y-auto select-none">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-6 py-10">

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
            🏔️ Kibo Climb
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Who's climbing today?
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Pick your profile to continue your ascent
          </p>
        </div>

        {/* Profile grid — 1 col on mobile, 2 on sm, 3 on md+ */}
        <div className={`w-full grid gap-3 ${
          profiles.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
          profiles.length === 2 ? 'grid-cols-2' :
          'grid-cols-2 sm:grid-cols-3'
        }`}>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelect={handleSelect}
              isSelected={selectedId === profile.id}
            />
          ))}
        </div>

        {/* Add Profile */}
        {!showAddPin ? (
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setShowAddPin(true);
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mt-2 group"
          >
            <div className="w-7 h-7 rounded-full border border-slate-600 group-hover:border-slate-400 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Add a profile
            <Lock className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        ) : (
          <form
            onSubmit={handleAddPinSubmit}
            className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-center"
          >
            <p className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Enter Parent PIN to add a profile
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={addPinInput}
              onChange={(e) => { setAddPinInput(e.target.value); setAddPinError(''); }}
              placeholder="PIN"
              autoFocus
              className="w-full text-center tracking-[0.4em] text-white font-black text-lg bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-400 placeholder:tracking-normal placeholder:text-slate-600"
            />
            {addPinError && <p className="text-xs text-rose-400 font-bold">{addPinError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAddPin(false); setAddPinInput(''); setAddPinError(''); }}
                className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-black text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </form>
        )}

        {/* Footer hint */}
        <p className="text-[10px] text-slate-600 font-medium text-center mt-2">
          Manage profiles · schedule · settings in the Parent Zone
        </p>
      </div>
    </div>
  );
}
