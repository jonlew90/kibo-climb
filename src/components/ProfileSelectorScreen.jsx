import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Flame, Star, Zap, CheckCircle2, User, X } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { GRADE_STARTING_RATINGS } from '../utils/curriculum';

const GRADE_OPTIONS = Object.keys(GRADE_STARTING_RATINGS);

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
      className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center w-full
        ${isSelected
          ? 'border-amber-400 bg-amber-50 scale-[1.02] shadow-md shadow-amber-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.01] shadow-xs'
        }`}
    >
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-400/40 ring-offset-2 ring-offset-transparent pointer-events-none" />
          <div className="absolute -top-2.5 bg-amber-400 text-amber-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active
          </div>
        </>
      )}

      <div className="relative p-0.5 overflow-visible">
        <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-300 ${isSelected ? 'bg-amber-400/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`} />
        <Mascot
          mood="happy"
          state="idle"
          equipped={equipped}
          className="w-12 h-12 sm:w-14 sm:h-14 aspect-square relative z-10 drop-shadow-md"
        />
      </div>

      <div className="space-y-0 text-center">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-tight truncate max-w-[120px]">
          {displayName}
        </h3>
        {profile.gradeLevel && (
          <span className="text-[9px] font-bold text-slate-500 block leading-tight">{profile.gradeLevel}</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[9px] font-black">
        <span className="flex items-center gap-0.5 text-amber-500">
          <Flame className="w-2.5 h-2.5 fill-amber-500" />{streak}d
        </span>
        <span className="flex items-center gap-0.5 text-purple-500">
          <Star className="w-2.5 h-2.5 fill-purple-500" />{rating}
        </span>
        <span className="flex items-center gap-0.5 text-emerald-500">
          <Zap className="w-2.5 h-2.5 fill-emerald-500" />{solved}
        </span>
      </div>

      <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-all duration-200 ${isSelected ? 'text-amber-500 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-slate-600'}`} />
    </button>
  );
}

// ─── Add Profile Flow ─────────────────────────────────────────────────────────
function AddProfilePanel({ onCancel, onCreated }) {
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('Grade 1–2');
  const [nameError, setNameError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!childName.trim()) { setNameError('Please enter a name.'); return; }
    if (childName.trim().length < 2) { setNameError('Must be at least 2 characters.'); return; }
    const newProfile = storageService.createProfile(childName.trim(), childGrade);
    if (!newProfile) {
      setNameError('Maximum profile limit of 6 reached.');
      return;
    }
    soundFx.playVictory();
    onCreated(newProfile);
  };

  const reset = () => {
    setChildName(''); setNameError('');
    onCancel();
  };

  return (
    <div className="w-full max-w-xs bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-3 text-center">
      <div className="space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 text-emerald-500">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-xs font-black uppercase tracking-wide">New Climber</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium">Set up the new profile</p>
      </div>

      <form onSubmit={handleCreateSubmit} className="space-y-2.5 text-left">
        {/* Name */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block mb-0.5">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
            <input
              ref={nameRef}
              type="text"
              value={childName}
              onChange={(e) => { setChildName(e.target.value); setNameError(''); }}
              placeholder="e.g. Alex"
              maxLength={24}
              className={`w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-white border rounded-xl focus:outline-none transition-colors placeholder:text-slate-400 ${
                nameError ? 'border-rose-500' : 'border-slate-300 focus:border-purple-400'
              }`}
            />
          </div>
          {nameError && <p className="text-[10px] text-rose-500 font-bold mt-0.5">{nameError}</p>}
        </div>

        {/* Grade */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block mb-0.5">Grade Level</label>
          <select
            value={childGrade}
            onChange={(e) => setChildGrade(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-0.5">
          <button type="button" onClick={reset}
            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all shadow-md shadow-amber-500/20">
            Create Profile 🚀
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileSelectorScreen({ onSelectProfile, onClose, onOpenParentZone }) {
  const [profiles, setProfiles] = useState(() => storageService.getAllProfiles());
  const [selectedId, setSelectedId] = useState(() => storageService.getActiveProfileId());
  const [showAddPanel, setShowAddPanel] = useState(false);

  const handleSelect = (profile) => {
    soundFx.playKeyTap();
    setSelectedId(profile.id);
    setTimeout(() => {
      storageService.setActiveProfileId(profile.id);
      onSelectProfile(profile);
    }, 220);
  };

  const handleProfileCreated = (newProfile) => {
    // Go directly to the game — no need to flash the updated grid
    storageService.setActiveProfileId(newProfile.id);
    onSelectProfile(newProfile);
  };

  return (
    <div className="fixed inset-0 z-[900] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 select-none overflow-hidden flex items-center justify-center p-2 sm:p-4">
      {onClose && (
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="absolute top-3 right-3 z-50 p-2 text-slate-500 hover:text-slate-800 bg-white/50 hover:bg-white/80 rounded-full transition-all border border-slate-200"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-2 sm:gap-4 p-2 sm:p-4 my-auto">

        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
            🏔️ Kibo Climb
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {profiles.length === 1
              ? `Ready to climb, ${profiles[0].username || profiles[0].name}?`
              : "Who's climbing today?"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {profiles.length === 1 ? 'Tap your card to start' : 'Pick your profile to continue your ascent'}
          </p>
        </div>

        {/* Profile grid */}
        <div className={`w-full p-1 grid gap-2 sm:gap-3 shrink-0 ${
          profiles.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
          profiles.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
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

        {/* Add Profile — toggle inline panel */}
        {profiles.length < 6 && (
          !showAddPanel ? (
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); setShowAddPanel(true); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 group"
            >
              <div className="w-6 h-6 rounded-full border border-slate-400 group-hover:border-slate-600 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3" />
              </div>
              Add a profile
            </button>
          ) : (
            <AddProfilePanel
              onCancel={() => setShowAddPanel(false)}
              onCreated={handleProfileCreated}
            />
          )
        )}

        <p className="text-[10px] text-slate-500 font-medium text-center">
          Manage profiles, schedule, and settings in the{' '}
          {onOpenParentZone ? (
            <button
              type="button"
              onClick={() => { soundFx.playKeyTap(); onOpenParentZone(); }}
              className="font-bold text-amber-600 hover:text-amber-700 hover:underline"
            >
              Parent Zone
            </button>
          ) : (
            <span className="font-bold text-slate-700">Parent Zone</span>
          )}.
        </p>
      </div>
    </div>
  );
}
