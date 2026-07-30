import React, { useState } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles, Award } from 'lucide-react';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { BADGES_CATALOG } from '../data/badges';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, requestNotificationPermission } from '../utils/notifications';
import { calculateDomainMastery } from '../utils/domainStats';

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
  onUpdatePracticeDays,
  preferences = { hideSprintTimer: false },
  onUpdatePreferences,
  unlockedBadges = []
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border-4 border-purple-300 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default"
      >
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

            {/* Recent Milestones & Badges Summary Card */}
            {(() => {
              const unlockedCount = unlockedBadges ? unlockedBadges.length : 0;
              const totalBadgesCount = BADGES_CATALOG ? BADGES_CATALOG.length : 8;

              const getParentFriendlyDesc = (badge) => {
                switch (badge.id) {
                  case 'perfect_sprint':
                    return '100% Precision: Perfect accuracy on a 20-problem sprint';
                  case 'clock_master':
                    return 'Clock & Time: Reading analog clocks & calculating elapsed time';
                  case 'coin_counter':
                    return 'Money Math: Rapid coin counting and change calculation';
                  case 'master_9s':
                    return 'Multiplication Strategy: 10-finger magic for 9 times tables';
                  case 'speed_demon':
                    return 'High Speed Recall: Solved 20 problems in under 40s (≤2.0s/prob)';
                  case 'streak_3':
                  case 'streak_7':
                    return 'Habit Building: Maintained a multi-day practice streak';
                  case 'summit_sync':
                    return 'Number Theory: LCM & GCF step-by-step logic';
                  case 'exponent_peak':
                    return 'Advanced Algebra: Powers, roots, and order of operations';
                  default:
                    return badge.description || 'Mastered math topic skill badge';
                }
              };

              const recentBadges = (BADGES_CATALOG || []).filter((b) => unlockedBadges.includes(b.id)).slice(0, 3);

              return (
                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Award className="w-5 h-5 stroke-[2.5]" />
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Recent Milestones ({unlockedCount}/{totalBadgesCount})
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      {unlockedCount > 0 ? `${Math.round((unlockedCount / totalBadgesCount) * 100)}% Unlocked` : 'Trail Badges'}
                    </span>
                  </div>

                  {recentBadges.length === 0 ? (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold leading-relaxed flex items-center gap-2">
                      <span className="text-base">🏅</span>
                      <span>No milestones unlocked yet. Completing 20-problem sprints with high accuracy earns trail badges!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {recentBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-slate-50 border border-amber-200/80 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs hover:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl filter drop-shadow-xs">{badge.icon}</span>
                            <h5 className="font-black text-xs text-slate-800 leading-tight">
                              {badge.name}
                            </h5>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-600 leading-snug">
                            {getParentFriendlyDesc(badge)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })()}

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

            {/* Skill Domain Breakdown (Rolling 20-Sprint Window) */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">Skill Domain Breakdown</h4>
                </div>
                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  Rolling 20 Sprints
                </span>
              </div>

              <div className="space-y-2.5">
                {calculateDomainMastery(sprintHistory, tier).map((domain) => {
                  const score = Math.round(domain.accuracy * 0.6 + (domain.speed <= 2.5 ? 40 : domain.speed <= 3.5 ? 25 : 10));
                  const isMastered = score >= 85;
                  const isInProgress = score >= 60 && score < 85;

                  // Diagnostic benchmark check
                  const isDiagnosticVerified = tier > 1 && domain.accuracy >= 85;
                  const daysSinceLastSprint = 0; // Active current sprint session

                  let statusBadge;
                  if (daysSinceLastSprint > 30 && isMastered) {
                    statusBadge = (
                      <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        🟡 Needs Warm-Up
                      </span>
                    );
                  } else if (daysSinceLastSprint >= 14 && daysSinceLastSprint <= 30) {
                    statusBadge = (
                      <span className="text-[9px] font-black uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                        ⏸️ Practice Paused
                      </span>
                    );
                  } else if (isMastered) {
                    statusBadge = (
                      <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        🟢 Mastered {isDiagnosticVerified && <span className="text-[8px] opacity-80">(Benchmark)</span>}
                      </span>
                    );
                  } else if (isInProgress) {
                    statusBadge = (
                      <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        🟡 In Progress
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="text-[9px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                        🔵 Needs Practice
                      </span>
                    );
                  }

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

                        {statusBadge}
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

                      {/* Parent Coaching Pro Tip Box */}
                      {(() => {
                        const tierMap = {
                          add_sub: 1,
                          mult_div: 3,
                          money_time: 5,
                          multi_digit: 4,
                          number_theory: 7,
                          adv_math: 8
                        };
                        const targetTierNum = tierMap[domain.id] || 1;
                        const tierData = CURRICULUM_TIERS.find((t) => t.tier === targetTierNum);
                        const tip = tierData?.proTip;
                        if (!tip) return null;

                        return (
                          <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[10px] text-amber-950 font-medium leading-tight space-y-0.5">
                            <strong className="text-amber-900 font-extrabold flex items-center gap-1">
                              💡 Coaching Pro Tip: {tip.title}
                            </strong>
                            <p>{tip.content || tip.summary}</p>
                          </div>
                        );
                      })()}
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

            {/* Earned Trail Badges Showcase */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                  <Award className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">Earned Trail Badges</h4>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {unlockedBadges.length} Unlocked
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {BADGES_CATALOG.filter((b) => unlockedBadges.includes(b.id)).length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic py-1">No badges unlocked yet. Keep climbing!</p>
                ) : (
                  BADGES_CATALOG.filter((b) => unlockedBadges.includes(b.id)).map((badge) => (
                    <div key={badge.id} className="bg-white border border-amber-300 p-2.5 rounded-xl flex items-center gap-2 shrink-0 shadow-sm">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs block leading-snug">{badge.title}</span>
                        <span className="text-[9px] text-amber-800 font-bold uppercase block">{badge.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIN & SCHEDULE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
            {/* Gameplay & Display Preferences */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Sprint Display Preferences</h4>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Hide Live Timer During Sprints</span>
                  <span className="text-[10px] text-slate-500 font-medium">Zen Mode: hides ticking clock during questions</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    if (onUpdatePreferences) {
                      onUpdatePreferences({
                        ...preferences,
                        hideSprintTimer: !preferences.hideSprintTimer
                      });
                    }
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    preferences?.hideSprintTimer ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    preferences?.hideSprintTimer ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

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
