import React, { useState } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles } from 'lucide-react';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, requestNotificationPermission } from '../utils/notifications';

const DAYS_OF_WEEK = [
  { idx: 0, label: 'Su' },
  { idx: 1, label: 'M' },
  { idx: 2, label: 'T' },
  { idx: 3, label: 'W' },
  { idx: 4, label: 'Th' },
  { idx: 5, label: 'F' },
  { idx: 6, label: 'Sa' }
];

export default function ParentDashboardModal({
  isOpen,
  onClose,
  currentPin,
  onUpdatePin,
  tier,
  onSetTier,
  streak,
  sparks,
  practiceQueueCount,
  practiceQueue = [],
  sprintHistory,
  practiceDays = [1, 2, 3, 4, 5],
  onUpdatePracticeDays
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  const handleToggleNotifPref = (key) => {
    soundFx.playKeyTap();
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
    if (key === 'dailyReminderEnabled' && updated.dailyReminderEnabled) {
      requestNotificationPermission();
    }
  };

  const handleTimeChange = (newTime) => {
    const updated = { ...notifPrefs, reminderTime: newTime };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
  };

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
            <Settings className="w-4 h-4 stroke-[2.5]" /> PIN & Schedule Settings
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
                <span className="text-xl font-black text-slate-800">{pluralize(streak, 'Day')}</span>
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

            {/* Manual Tier Selector Dropdown (All 8 Tiers) */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Layers className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Manual Skill Tier Override</h4>
              </div>

              <select
                value={tier}
                onChange={(e) => {
                  soundFx.playKeyTap();
                  onSetTier(parseInt(e.target.value, 10));
                }}
                className="w-full p-3 bg-white border-2 border-purple-300 rounded-xl text-xs sm:text-sm font-extrabold text-purple-950 focus:border-purple-600 focus:outline-none shadow-sm cursor-pointer"
              >
                {CURRICULUM_TIERS.map((t) => (
                  <option key={t.tier} value={t.tier}>
                    Tier {t.tier}: {t.title} ({t.subtitle})
                  </option>
                ))}
              </select>

              <p className="text-[11px] font-medium text-slate-500 italic leading-snug">
                Manually set your child's current practice tier at any time.
              </p>
            </div>

            {/* Target Facts for Review Section */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                  <Target className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">Target Facts for Review</h4>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {pluralize(practiceQueue ? practiceQueue.length : practiceQueueCount, 'Queued Fact')}
                </span>
              </div>

              {!practiceQueue || practiceQueue.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold leading-relaxed flex items-center gap-2">
                  <span className="text-base">🎉</span>
                  <span>No problem facts queued! Your child is mastering their current tier facts with high speed and accuracy.</span>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {practiceQueue.slice(0, 5).map((item, idx) => {
                    const isError = item.reason === 'ERROR' || !item.reason;
                    const eqStr = item.displayString || `${item.num1} ${item.operatorSymbol || '×'} ${item.num2} = ${item.answer}`;

                    return (
                      <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm">{eqStr}</span>
                          {item.tier && (
                            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              T{item.tier}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isError ? (
                            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                              🔴 Needs Accuracy
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                              🟡 Building Speed
                            </span>
                          )}

                          {item.latencyMs && (
                            <span className="font-mono text-[10px] text-slate-400">
                              {(item.latencyMs / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skill Domain Breakdown */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Skill Domain Breakdown</h4>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'add_sub',
                    name: 'Addition & Subtraction',
                    icon: '🌱',
                    subtitle: 'Single-digit fluency & crossing tens boundary',
                    acc: tier >= 2 ? 92 : 78,
                    speed: tier >= 2 ? 1.8 : 2.4,
                    recommendation: tier >= 2
                      ? 'Great single-digit fluency! Keep building speed crossing tens.'
                      : 'Tip: Use the Plus 9 Hop (+10 then -1) for fast regrouping.'
                  },
                  {
                    id: 'mult_div',
                    name: 'Multiplication & Division',
                    icon: '🌊',
                    subtitle: 'Fact tables 2-12 & division fact families',
                    acc: tier >= 5 ? 88 : tier >= 3 ? 74 : 50,
                    speed: tier >= 5 ? 2.1 : tier >= 3 ? 2.9 : 3.8,
                    recommendation: tier >= 5
                      ? 'Solid multiplication mastery! Focus on instant recall for division families.'
                      : 'Tip: Practice the 10-Finger Magic trick for 9s.'
                  },
                  {
                    id: 'money_time',
                    name: 'Money & Time',
                    icon: '🪙',
                    subtitle: 'Coin combinations, change & clock jumps',
                    acc: tier >= 6 ? 90 : tier >= 3 ? 80 : 65,
                    speed: tier >= 6 ? 2.2 : tier >= 3 ? 3.1 : 4.0,
                    recommendation: tier >= 6
                      ? 'Excellent money & time skills! Handles dollar change with high accuracy.'
                      : 'Tip: Use the Quarter Rhythm (25¢, 50¢, 75¢, $1.00) for fast coin counting.'
                  },
                  {
                    id: 'multi_digit',
                    name: 'Multi-Digit Mental Math',
                    icon: '⛰️',
                    subtitle: '2-digit mental addition & subtraction',
                    acc: tier >= 6 ? 85 : 55,
                    speed: tier >= 6 ? 2.5 : 3.6,
                    recommendation: tier >= 6
                      ? 'Strong double-digit mental math capacity.'
                      : 'Tip: Break double digits into tens first, then add ones.'
                  },
                  {
                    id: 'number_theory',
                    name: 'Number Theory & Logic',
                    icon: '📐',
                    subtitle: 'LCM, GCF & divisibility rules',
                    acc: tier >= 7 ? 86 : tier >= 5 ? 70 : 45,
                    speed: tier >= 7 ? 2.6 : 3.5,
                    recommendation: tier >= 7
                      ? 'Mastered LCM Summit Sync and GCF Difference Trick!'
                      : 'Tip: For GCF(12, 18), subtract the numbers first (18 - 12 = 6).'
                  },
                  {
                    id: 'adv_math',
                    name: 'Exponents, Roots & PEMDAS',
                    icon: '🏔️',
                    subtitle: 'Powers of 10, square roots & order of operations',
                    acc: tier >= 8 ? 94 : 40,
                    speed: tier >= 8 ? 1.9 : 4.2,
                    recommendation: tier >= 8
                      ? 'Summit Peak Mastered! Exceptional speed on exponents and roots.'
                      : 'Complete lower tiers to unlock Mount Kibo Summit challenges.'
                  }
                ].map((domain) => {
                  const score = Math.round(domain.acc * 0.6 + (domain.speed <= 2.5 ? 40 : domain.speed <= 3.5 ? 25 : 10));
                  const isMastered = score >= 85;
                  const isInProgress = score >= 60 && score < 85;

                  return (
                    <div key={domain.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{domain.icon}</span>
                          <div>
                            <h5 className="font-extrabold text-slate-800 text-xs">{domain.name}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold">{domain.subtitle}</p>
                          </div>
                        </div>

                        {isMastered ? (
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            🟢 Mastered
                          </span>
                        ) : isInProgress ? (
                          <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            🟡 In Progress
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                            🔵 Needs Practice
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMastered
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : isInProgress
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                        />
                      </div>

                      {/* Metrics & Recommendation Row */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-1.5">
                        <span className="text-slate-700">🎯 Accuracy: <strong className="text-slate-900">{domain.acc}%</strong></span>
                        <span className="text-slate-700">⚡ Speed: <strong className="text-slate-900">{domain.speed}s / Q</strong></span>
                      </div>

                      <div className="p-1.5 bg-purple-50/70 border border-purple-200 rounded-lg text-[10px] text-purple-900 font-medium leading-tight">
                        <strong className="text-purple-800 font-bold block mb-0.5">💡 Parent Recommendation:</strong>
                        {domain.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sprint Performance History */}
            <div className="space-y-1.5 text-left">
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

        {/* TAB 2: PIN & SCHEDULE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
            {/* Custom 7-Day Practice Schedule */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Calendar className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Custom 7-Day Practice Schedule</h4>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isActive = practiceDays.includes(d.idx);
                  return (
                    <button
                      key={d.idx}
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        let newDays;
                        if (isActive) {
                          if (practiceDays.length === 1) return;
                          newDays = practiceDays.filter((idx) => idx !== d.idx);
                        } else {
                          newDays = [...practiceDays, d.idx].sort();
                        }
                        onUpdatePracticeDays(newDays);
                      }}
                      className={`py-2 text-xs font-black rounded-xl border-2 transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-700 shadow-sm scale-[1.02]'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-medium text-slate-500 italic leading-snug">
                Unselected rest days automatically protect your child's streak without consuming a Kibo Shield.
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Bell className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Notification Preferences</h4>
              </div>

              {/* Daily Kid Reminder */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Daily Streak Reminder</span>
                  <span className="text-[10px] text-slate-500 font-medium">Alert child if sprint is incomplete</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={notifPrefs.reminderTime || '17:00'}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={!notifPrefs.dailyReminderEnabled}
                    className="py-1 px-2 text-xs font-extrabold bg-slate-100 border border-slate-300 rounded-lg cursor-pointer disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleNotifPref('dailyReminderEnabled')}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifPrefs.dailyReminderEnabled ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifPrefs.dailyReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Weekly Progress Summary</span>
                  <span className="text-[10px] text-slate-500 font-medium">Weekly mastery breakdown digest</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotifPref('weeklyDigestEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    notifPrefs.weeklyDigestEnabled ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    notifPrefs.weeklyDigestEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Struggle / Target Fact Alerts */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Struggle & Review Alerts</span>
                  <span className="text-[10px] text-slate-500 font-medium">Alert when accuracy or speed drops on target facts</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotifPref('struggleAlertsEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    notifPrefs.struggleAlertsEnabled ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    notifPrefs.struggleAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Change 4-Digit PIN */}
            <form onSubmit={handleChangePin} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
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
