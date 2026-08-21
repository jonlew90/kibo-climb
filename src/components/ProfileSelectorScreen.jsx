import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Flame, Star, Zap, CheckCircle2, User, X, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { GRADE_STARTING_RATINGS } from '../utils/mathCurriculum';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { GRADE_CURRICULUM_DETAILS } from './FirstLaunchOnboardingModal';

const GRADE_OPTIONS = Object.keys(GRADE_STARTING_RATINGS);

const SUBJECT_THEMES = {
  math: {
    id: 'math',
    name: 'Math',
    icon: '🔢',
    border: 'border-amber-300/70',
    bg: 'bg-amber-500/10',
    activeBg: 'bg-amber-500 text-white',
    text: 'text-amber-950',
    star: 'fill-amber-500 text-amber-500',
    solvedUnit: 'q'
  },
  words: {
    id: 'words',
    name: 'Words',
    icon: '📚',
    border: 'border-teal-300/70',
    bg: 'bg-teal-500/10',
    activeBg: 'bg-teal-600 text-white',
    text: 'text-teal-950',
    star: 'fill-teal-500 text-teal-500',
    solvedUnit: 'w'
  },
  world: {
    id: 'world',
    name: 'World',
    icon: '🌍',
    border: 'border-emerald-300/70',
    bg: 'bg-emerald-500/10',
    activeBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-950',
    star: 'fill-emerald-500 text-emerald-500',
    solvedUnit: 'q'
  },
  geography: {
    id: 'geography',
    name: 'Geography',
    icon: '🌍',
    border: 'border-emerald-300/70',
    bg: 'bg-emerald-500/10',
    activeBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-950',
    star: 'fill-emerald-500 text-emerald-500',
    solvedUnit: 'q'
  },
  science: {
    id: 'science',
    name: 'Science',
    icon: '🧪',
    border: 'border-sky-300/70',
    bg: 'bg-sky-500/10',
    activeBg: 'bg-sky-600 text-white',
    text: 'text-sky-950',
    star: 'fill-sky-500 text-sky-500',
    solvedUnit: 'q'
  },
  coding: {
    id: 'coding',
    name: 'Coding',
    icon: '💻',
    border: 'border-purple-300/70',
    bg: 'bg-purple-500/10',
    activeBg: 'bg-purple-600 text-white',
    text: 'text-purple-950',
    star: 'fill-purple-500 text-purple-500',
    solvedUnit: 'q'
  }
};

const getSubjectMeta = (subjectKey) => {
  const config = SUBJECTS_CONFIG[subjectKey] || {};
  const theme = SUBJECT_THEMES[subjectKey] || {
    id: subjectKey,
    name: config.name || subjectKey,
    icon: config.icon || '🌍',
    border: 'border-indigo-300/70',
    bg: 'bg-indigo-500/10',
    activeBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-950',
    star: 'fill-indigo-500 text-indigo-500',
    solvedUnit: 'q'
  };
  return { ...config, ...theme, icon: config.icon || theme.icon, name: config.name || theme.name };
};

const formatGradeDisplay = (grade) => {
  if (!grade) return '';
  if (grade === 'Pre-Algebra / Middle School' || grade === 'Pre-Algebra') return 'Grade 7–8';
  if (grade === 'Algebra & Beyond' || grade === 'Algebra+') return 'High School+';
  if (grade === 'High School & Beyond') return 'High School+';
  return grade;
};

function ProfileCard({ profile, onSelect, isSelected }) {
  const userData = profile.userData || {};
  const streak = userData.streak ?? 0;
  const sparks = userData.sparks ?? 0;
  const equipped = profile.shopState?.equippedItems || [];
  const displayName = profile.username || profile.name || 'Kibo Climber';
  const lastSubjectKey = profile.lastActiveSubject || 'math';
  const lastSubjectMeta = getSubjectMeta(lastSubjectKey);

  return (
    <button
      type="button"
      onClick={() => onSelect(profile)}
      className={`group relative flex flex-col items-center gap-2 p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center w-full
        ${isSelected
          ? 'border-amber-400 bg-amber-50/90 scale-[1.02] shadow-md shadow-amber-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.01] shadow-xs'
        }`}
    >
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-400/40 ring-offset-2 ring-offset-transparent pointer-events-none" />
          <div className="absolute -top-2.5 bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active
          </div>
        </>
      )}

      {/* Mascot Avatar */}
      <div className="relative p-0.5 overflow-visible my-1">
        <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-300 ${isSelected ? 'bg-amber-400/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`} />
        <Mascot
          mood="happy"
          state="idle"
          equipped={equipped}
          disableInteractive={true}
          className="w-14 h-14 sm:w-16 sm:h-16 aspect-square relative z-10 drop-shadow-md"
        />
      </div>

      {/* Profile Name & Grade */}
      <div className="space-y-1 text-center w-full">
        <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-tight truncate max-w-[160px] mx-auto">
          {displayName}
        </h3>
        {profile.gradeLevel && (
          <span
            title={profile.gradeLevel}
            className="inline-block text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md leading-tight"
          >
            {formatGradeDisplay(profile.gradeLevel)}
          </span>
        )}
      </div>

      {/* Badges / Stats: Streak, Sparks, & Last Active Subject */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 w-full">
        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-lg shadow-2xs">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
          {streak}d
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50/70 border border-amber-200/70 px-2 py-0.5 rounded-lg shadow-2xs">
          <Zap className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
          {sparks}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-black ${lastSubjectMeta.text} ${lastSubjectMeta.bg} border ${lastSubjectMeta.border} px-2 py-0.5 rounded-lg shadow-2xs`}>
          <span>{lastSubjectMeta.icon}</span>
          <span>{lastSubjectMeta.name}</span>
        </span>
      </div>

      <ChevronRight className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${isSelected ? 'text-amber-500 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-slate-600'}`} />
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
    if (childName.trim().length > 20) { setNameError('Must be 20 characters or fewer.'); return; }
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

    const selectedCurriculum = GRADE_CURRICULUM_DETAILS[childGrade] || { math: '', words: '', world: '', summary: '' };

  return (
    <div className="w-full max-w-sm bg-white border-2 border-amber-200/80 shadow-lg rounded-2xl p-4 sm:p-5 space-y-3.5 text-center animate-pop">
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-amber-600">
          <GraduationCap className="w-4 h-4 stroke-[2.5]" />
          <span className="text-xs font-black uppercase tracking-wide">Create Climber Profile</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Calibrates starting skill levels across <strong className="text-slate-700">Math 🔢, Words 📚 & World 🌍</strong>
        </p>
      </div>

      <form onSubmit={handleCreateSubmit} className="space-y-2.5 text-left">
        {/* Name */}
        <div>
          <label className="text-xs font-black uppercase tracking-wide text-slate-500 block mb-1">
            Climber Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.5]" />
            <input
              ref={nameRef}
              type="text"
              value={childName}
              onChange={(e) => { setChildName(e.target.value); setNameError(''); }}
              placeholder="e.g. Alex"
              maxLength={20}
              className={`w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50 border rounded-xl focus:outline-none transition-colors placeholder:text-slate-400 ${
                nameError ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-amber-500 focus:bg-white'
              }`}
            />
          </div>
          {nameError && <p className="text-xs text-rose-500 font-bold mt-1">{nameError}</p>}
        </div>

        {/* Grade */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-black uppercase tracking-wide text-slate-500">
              Grade Level
            </label>
            <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
              Multi-Subject
            </span>
          </div>
          <select
            value={childGrade}
            onChange={(e) => setChildGrade(e.target.value)}
            className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Live Subject Curriculum Preview Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 space-y-1 text-left">
          <div className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Starting Calibration:</span>
            <span className="text-slate-700 font-black">{childGrade}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 sm:py-1 rounded-lg">
              <span className="text-xs">🔢</span>
              <span className="font-bold">Math:</span>
              <span className="text-slate-600 truncate">{selectedCurriculum.math}</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-900 bg-teal-50/80 border border-teal-200/60 px-2 py-0.5 sm:py-1 rounded-lg">
              <span className="text-xs">📚</span>
              <span className="font-bold">Words:</span>
              <span className="text-slate-600 truncate">{selectedCurriculum.words}</span>
            </div>
            {selectedCurriculum.world && (
              <div className="flex items-center gap-1.5 text-emerald-900 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 sm:py-1 rounded-lg">
                <span className="text-xs">🌍</span>
                <span className="font-bold">World:</span>
                <span className="text-slate-600 truncate">{selectedCurriculum.world}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={reset}
            className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 border border-amber-500 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
            Create Profile
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileSelectorScreen({
  onSelectProfile,
  onOpenParentZone,
  canClose = false,
  onClose
}) {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const loadProfiles = () => {
    const list = storageService.getAllProfiles();
    setProfiles(list);
    const active = storageService.getActiveProfile();
    setSelectedId(active?.id || (list.length > 0 ? list[0].id : null));
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSelect = (profile) => {
    setSelectedId(profile.id);
    storageService.setActiveProfileId(profile.id);
    if (onSelectProfile) {
      onSelectProfile(profile);
    }
  };

  const handleProfileCreated = (newProfile) => {
    setShowAddPanel(false);
    loadProfiles();
    handleSelect(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* Top Header Bar */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="text-lg">🏔️</span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">Select Climber Profile</h2>
        </div>

        {/* Dismiss / Close button if canClose */}
        {canClose && onClose && (
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              onClose();
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </header>

      {/* Main Fullscreen Content */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto px-4 py-3 sm:py-4 flex flex-col justify-between items-center gap-3 sm:gap-4">
        {/* Top Section: Header Title */}
        <div className="w-full flex flex-col items-center space-y-1 shrink-0">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-600">
              Kibo Climb
            </span>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {profiles.length === 1
                ? `Ready to climb, ${profiles[0].username || profiles[0].name}?`
                : "Who's climbing today?"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {profiles.length === 1 ? 'Tap your card to continue your ascent' : 'Pick your profile to jump right back into your ascent'}
            </p>
          </div>
        </div>

        {/* Middle Section: Profiles Grid OR Add Profile Panel */}
        <div className="w-full flex-1 flex flex-col justify-center items-center my-auto min-h-0">
          {!showAddPanel ? (
            <div className="w-full flex flex-col items-center gap-3 sm:gap-4">
              {/* Profile grid */}
              <div className={`w-full grid gap-3 sm:gap-4 ${
                profiles.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                profiles.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
                'grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto'
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

              {/* Add Profile button */}
              {profiles.length < 6 && (
                <div className="flex justify-center w-full pt-1">
                  <button
                    type="button"
                    onClick={() => { soundFx.playKeyTap(); setShowAddPanel(true); }}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors py-1 group shrink-0 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full border border-slate-400 group-hover:border-slate-600 flex items-center justify-center transition-colors bg-white/60">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Add a climber profile</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-center items-center">
              <AddProfilePanel
                onCancel={() => setShowAddPanel(false)}
                onCreated={handleProfileCreated}
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="w-full shrink-0 pb-1">
          <p className="text-xs text-slate-500 font-medium text-center">
            Manage profiles, schedule, and settings in the{' '}
            {onOpenParentZone ? (
              <button
                type="button"
                onClick={() => { soundFx.playKeyTap(); onOpenParentZone(); }}
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
              >
                Parent Zone
              </button>
            ) : (
              <span className="font-bold text-slate-700">Parent Zone</span>
            )}.
          </p>
        </div>
      </main>
    </div>
  );
}
