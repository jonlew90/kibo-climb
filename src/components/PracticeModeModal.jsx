import React, { useState, useEffect } from 'react';
import { X, Dumbbell, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { CURRICULUM_TIERS } from '../utils/mathCurriculum';
import { WORDS_CURRICULUM_TIERS } from '../utils/wordsCurriculum';
import { WORLD_CURRICULUM_TIERS } from '../utils/worldCurriculum';
import { CODING_CURRICULUM_TIERS } from '../utils/codingCurriculum';

const SUBJECT_CATALOGS = {
  math: { label: 'Math', tiers: CURRICULUM_TIERS, color: 'from-amber-500 to-orange-500' },
  words: { label: 'Words', tiers: WORDS_CURRICULUM_TIERS, color: 'from-emerald-500 to-teal-500' },
  world: { label: 'World', tiers: WORLD_CURRICULUM_TIERS, color: 'from-cyan-500 to-blue-500' },
  coding: { label: 'Coding', tiers: CODING_CURRICULUM_TIERS, color: 'from-purple-500 to-indigo-500' }
};

export default function PracticeModeModal({
  isOpen,
  onClose,
  activeSubject = 'math',
  userTier = 1,
  onStartPracticeSession
}) {
  const [selectedSubject, setSelectedSubject] = useState(activeSubject);
  const [selectedTier, setSelectedTier] = useState(userTier || 1);
  const [sprintLength, setSprintLength] = useState(12);

  useEffect(() => {
    if (isOpen) {
      setSelectedSubject(activeSubject || 'math');
      setSelectedTier(userTier || 1);
    }
  }, [isOpen, activeSubject, userTier]);

  if (!isOpen) return null;

  const currentSubjectConfig = SUBJECT_CATALOGS[selectedSubject] || SUBJECT_CATALOGS.math;
  const tiersList = currentSubjectConfig.tiers || [];

  const handleStartSession = () => {
    soundFx.playKeyTap();
    if (onStartPracticeSession) {
      onStartPracticeSession({
        subject: selectedSubject,
        tier: selectedTier,
        sprintLength: sprintLength
      });
    }
    onClose();
  };

  const renderSetupStage = () => (
    <div className="space-y-4">
      {/* Subject Tabs */}
      <div>
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">
          Select Subject:
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(SUBJECT_CATALOGS).map(([subjKey, cfg]) => {
            const isSelected = selectedSubject === subjKey;
            return (
              <button
                key={subjKey}
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedSubject(subjKey);
                  setSelectedTier(1);
                }}
                className={`py-2 px-1 rounded-xl border-2 text-xs font-black transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Select Training Tier (1–{tiersList.length}):
          </label>
          <span className="text-[11px] font-extrabold text-indigo-600">
            Tier {selectedTier}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pr-0.5">
          {tiersList.map((t, idx) => {
            const tierNum = t.tier || idx + 1;
            const isSelected = selectedTier === tierNum;
            return (
              <button
                key={tierNum}
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedTier(tierNum);
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400/40'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-black text-slate-800">
                    {t.icon || '🧗'} T{tierNum}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <div className="text-[10px] font-bold text-slate-600 truncate">
                  {t.title || t.name || `Tier ${tierNum}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sprint Length Toggle */}
      <div>
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">
          Climb Length:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[6, 12].map(count => (
            <button
              key={count}
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSprintLength(count);
              }}
              className={`py-2 rounded-xl border-2 font-black text-xs transition-all cursor-pointer ${
                sprintLength === count
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {count} Questions {count === 12 ? ' (Full Climb)' : ' (Quick Sprint)'}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
        <span>100% Streak Safe • Zero Rating Penalty • Mistakes are Recycled for Mastery</span>
      </div>

      <button
        type="button"
        onClick={handleStartSession}
        className="w-full py-3.5 px-4 rounded-2xl font-black text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>Start Training Camp</span>
      </button>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-b from-slate-50 via-white to-sky-50 border-4 border-indigo-400 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-800 space-y-3.5 max-h-[96vh] sm:max-h-[92vh] overflow-y-auto cursor-default flex flex-col justify-between"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Training Camp • {currentSubjectConfig.label.toUpperCase()}
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Targeted Practice • Streak-Safe
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body: Setup & Launch */}
        {renderSetupStage()}
      </div>
    </div>
  );
}
