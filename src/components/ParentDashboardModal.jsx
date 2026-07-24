import React, { useState } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function ParentDashboardModal({
  isOpen,
  onClose,
  currentPin,
  onUpdatePin,
  securityQuestion,
  securityAnswer,
  onUpdateSecurityQuestion,
  tier,
  onSetTier,
  streak,
  sparks,
  practiceQueueCount,
  sprintHistory
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Security Question State
  const [secQInput, setSecQInput] = useState(securityQuestion || 'What is your child\'s favorite pet?');
  const [secAInput, setSecAInput] = useState(securityAnswer || '');
  const [secSuccessMsg, setSecSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChangePin = (e) => {
    e.preventDefault();
    setPinErrorMsg('');
    setPinSuccessMsg('');

    if (oldPinInput !== currentPin) {
      setPinErrorMsg('Current PIN is incorrect.');
      soundFx.playIncorrect();
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinErrorMsg('New PIN must be exactly 4 digits.');
      soundFx.playIncorrect();
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinErrorMsg('New PINs do not match.');
      soundFx.playIncorrect();
      return;
    }

    soundFx.playVictory();
    onUpdatePin(newPinInput);
    setPinSuccessMsg('PIN updated successfully!');
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleSaveSecurityQuestion = (e) => {
    e.preventDefault();
    if (!secQInput.trim() || !secAInput.trim()) return;

    soundFx.playVictory();
    onUpdateSecurityQuestion(secQInput.trim(), secAInput.trim());
    setSecSuccessMsg('Security Question updated successfully!');
    setTimeout(() => setSecSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-lg bg-white border-4 border-purple-300 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600 stroke-[2.5]" />
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Parent Dashboard</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            aria-label="Close Parent Dashboard"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-3 font-extrabold text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.5]" /> Child Overview
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5]" /> PIN & Security Settings
          </button>
        </div>

        {/* TAB 1: CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[10px] uppercase font-black text-amber-900 block">Streak</span>
                <span className="text-xl font-black text-slate-800">{streak} Days</span>
              </div>

              <div className="bg-amber-100/60 border border-amber-300 rounded-2xl p-2.5">
                <Zap className="w-5 h-5 text-amber-600 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[10px] uppercase font-black text-amber-900 block">Sparks</span>
                <span className="text-xl font-black text-slate-800">{sparks} ⚡</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5">
                <Layers className="w-5 h-5 text-purple-600 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[10px] uppercase font-black text-purple-900 block">Current Tier</span>
                <span className="text-xl font-black text-purple-900">Tier {tier}</span>
              </div>
            </div>

            {/* Manual Tier Selector */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-xs uppercase font-extrabold text-slate-600 tracking-wider block">
                Manual Skill Tier Override
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { t: 1, label: 'Tier 1', desc: '1–9 Add/Sub' },
                  { t: 2, label: 'Tier 2', desc: 'Regrouping' },
                  { t: 3, label: 'Tier 3', desc: 'Multiplication' }
                ].map((item) => (
                  <button
                    key={item.t}
                    onClick={() => {
                      soundFx.playKeyTap();
                      onSetTier(item.t);
                    }}
                    className={`p-2 rounded-xl border-2 text-center transition-all ${
                      tier === item.t
                        ? 'bg-purple-600 text-white border-purple-700 font-extrabold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-xs font-black block">{item.label}</span>
                    <span className="text-[9px] opacity-80 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Practice Queue Info */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-amber-900 block">Queued Practice Items</span>
                <span className="text-amber-800 font-medium">Problems flagged for targeted recall speed.</span>
              </div>
              <span className="text-lg font-black text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-sm">
                {practiceQueueCount}
              </span>
            </div>

            {/* Sprint Performance History */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase font-extrabold text-slate-600 tracking-wider block">
                Recent Sprints Mastery (Last 3)
              </span>
              {sprintHistory.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic text-center py-2">No completed sprints recorded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {sprintHistory.map((rec, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-2.5 text-xs">
                      <span className="font-bold text-slate-700">Sprint #{sprintHistory.length - idx}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-purple-700">{rec.accuracyPct}% Accuracy</span>
                        <span className="font-mono text-slate-500">{rec.avgLatencySec}s avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PIN & SECURITY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
            {/* Change 4-Digit PIN */}
            <form onSubmit={handleChangePin} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-purple-700">
                <Key className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Change 4-Digit Parent PIN</h4>
              </div>

              {pinErrorMsg && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {pinErrorMsg}
                </div>
              )}

              {pinSuccessMsg && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {pinSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Current PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    placeholder="1234"
                    required
                    className="w-full text-center py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="5678"
                    required
                    className="w-full text-center py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="5678"
                    required
                    className="w-full text-center py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-3d-purple w-full py-2.5 text-xs rounded-xl"
              >
                Update PIN
              </button>
            </form>

            {/* Security Question Settings */}
            <form onSubmit={handleSaveSecurityQuestion} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-purple-700">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Security Recovery Question</h4>
              </div>

              {secSuccessMsg && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {secSuccessMsg}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Security Question</label>
                <input
                  type="text"
                  value={secQInput}
                  onChange={(e) => setSecQInput(e.target.value)}
                  placeholder="e.g. What is your favorite pet's name?"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Answer</label>
                <input
                  type="text"
                  value={secAInput}
                  onChange={(e) => setSecAInput(e.target.value)}
                  placeholder="Answer..."
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-3d-teal w-full py-2.5 text-xs rounded-xl"
              >
                Save Security Question
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="btn-3d-purple w-full py-3 mt-3 text-sm rounded-2xl"
        >
          Exit Parent Dashboard
        </button>
      </div>
    </div>
  );
}
