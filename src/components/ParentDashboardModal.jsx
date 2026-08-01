import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles, Award, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';
import { CURRICULUM_TIERS } from '../utils/curriculum';
import { BADGES_CATALOG } from '../data/badges';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, requestNotificationPermission } from '../utils/notifications';
import { calculateDomainMastery, calculateAdaptiveCompetenceProfile } from '../utils/domainStats';
import { getCompetenceRankTier, getCompetenceDescription } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';

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
  unlockedBadges = [],
  totalProblemsSolved = 0,
  personalRecords = {}
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  const [liveUserData, setLiveUserData] = useState(() => storageService.getUserData());

  useEffect(() => {
    if (!isOpen) return;

    setLiveUserData(storageService.getUserData());
    const interval = setInterval(() => {
      setLiveUserData(storageService.getUserData());
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

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

  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    soundFx.playKeyTap();
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshedAt(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    if (isOpen) {
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-purple-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-extrabold text-sm px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all active:scale-95 border border-purple-200"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Exit Parent Zone</span>
        </button>

        <div className="flex items-center gap-2 text-slate-800">
          <ShieldCheck className="w-6 h-6 text-purple-600 stroke-[2.5]" />
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Parent Dashboard</h2>
            <span className="text-[9px] font-bold text-slate-400 block hidden sm:block">
              Synced: {lastRefreshedAt}
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className={`flex items-center gap-1 text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs transition-all active:scale-95 ${
            isRefreshing ? 'animate-spin opacity-50' : ''
          }`}
          title="Force Refresh Data"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh</span>
        </button>
      </header>

      {/* TAB SELECTOR HEADER */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-3 shrink-0">
        <div className="flex bg-slate-200/80 p-1 rounded-2xl font-extrabold text-xs sm:text-sm shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.5]" /> Child Overview
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5]" /> PIN & Schedule Settings
          </button>
        </div>
      </div>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[9px] uppercase font-black text-amber-900 block">Streak</span>
                <span className="text-lg font-black text-slate-800">{pluralize(streak, 'Day')}</span>
              </div>

              <div className="bg-amber-100/60 border border-amber-300 rounded-2xl p-2">
                <Zap className="w-5 h-5 text-amber-600 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[9px] uppercase font-black text-amber-900 block">Sparks</span>
                <span className="text-lg font-black text-slate-800">{sparks} ⚡</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[9px] uppercase font-black text-emerald-900 block">Total Solved</span>
                <span className="text-lg font-black text-slate-800">{totalProblemsSolved}</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2">
                <Award className="w-5 h-5 text-purple-600 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[9px] uppercase font-black text-purple-900 block">Skill Rating</span>
                <span className="text-lg font-black text-purple-900">{calculateAdaptiveCompetenceProfile(sprintHistory, tier).adaptiveCompetenceRating} pts</span>
              </div>
            </div>

            {/* Personal Records Summary Card */}
            <section className="bg-purple-50/60 rounded-2xl p-3 border border-purple-200 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                <Trophy className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                <span>Personal Records & High Scores</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[9px] text-slate-500 uppercase block font-black">Longest Streak</span>
                  <span className="text-purple-900 font-black text-xs sm:text-sm">{personalRecords?.highestCorrectStreak || 0} Qs</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[9px] text-slate-500 uppercase block font-black">Fastest 12-Q Block</span>
                  <span className="text-purple-900 font-black text-xs sm:text-sm">{personalRecords?.fastest12QuestionsTime || personalRecords?.fastest10QuestionsTime ? `${personalRecords.fastest12QuestionsTime || personalRecords.fastest10QuestionsTime}s` : 'N/A'}</span>
                  <span className="text-[8px] font-bold text-slate-400 block mt-0.5">Best time for 12 Qs</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[9px] text-slate-500 uppercase block font-black">Perfect Runs</span>
                  <span className="text-purple-900 font-black text-xs sm:text-sm">{personalRecords?.mostPerfectSessions || 0} Runs</span>
                  <span className="text-[8px] font-bold text-slate-400 block mt-0.5">100% Acc Sessions</span>
                </div>
              </div>
            </section>

            {/* Recent Milestones & Badges Summary Card */}
            {(() => {
              const unlockedCount = unlockedBadges ? unlockedBadges.length : 0;
              const totalBadgesCount = BADGES_CATALOG.length;

              const allEarnedBadges = (BADGES_CATALOG || []).filter((b) => unlockedBadges.includes(b.id));

              return (
                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Award className="w-5 h-5 stroke-[2.5]" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">
                          Earned Trail Badges & Requirements ({unlockedCount}/{totalBadgesCount})
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">Review earned badges and their exact achievement criteria</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      {unlockedCount > 0 ? `${Math.round((unlockedCount / totalBadgesCount) * 100)}% Unlocked` : 'Trail Badges'}
                    </span>
                  </div>

                  {allEarnedBadges.length === 0 ? (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold leading-relaxed flex items-center gap-2">
                      <span className="text-base">🏅</span>
                      <span>No milestones unlocked yet. Completing adaptive climb sessions with high accuracy earns trail badges!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {allEarnedBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-amber-50/60 border-2 border-amber-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl filter drop-shadow-xs">{badge.icon}</span>
                            <div>
                              <h5 className="font-black text-xs text-slate-800 leading-tight">
                                {badge.title || badge.name}
                              </h5>
                              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 inline-block mt-0.5">
                                🎯 Required: {badge.reqText || 'Complete math climbs'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] font-medium text-slate-600 leading-snug">
                            {badge.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ADAPTIVE COMPETENCE SNAPSHOT & TOPIC MASTERY */}
            {(() => {
              const activeUserData = liveUserData || storageService.getUserData();
              const actualRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentMathTier = activeUserData.tier || tier || 1;
              const adaptiveProfile = calculateAdaptiveCompetenceProfile(sprintHistory, currentMathTier, actualRating);
              const { adaptiveCompetenceRating, last30DaysGrowthData, masteryDistribution, skillStrandBreakdown } = adaptiveProfile;
              const rankTitle = getCompetenceRankTier(adaptiveCompetenceRating);

              return (
                <div className="space-y-4">
                  {/* ADAPTIVE COMPETENCE RATING SNAPSHOT */}
                  <section className="bg-white p-5 rounded-3xl shadow-sm border-2 border-indigo-200 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2 flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Current Math Mastery</h2>
                        <span className="text-[10px] text-indigo-600 font-bold block">
                          Level {currentMathTier} • {rankTitle} ({adaptiveCompetenceRating} Rating)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-xs flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                          {rankTitle}
                        </span>
                        {totalProblemsSolved < 15 && (
                          <span className="text-[9px] font-black uppercase text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse">
                            ⏳ Calibrating
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50/90 to-purple-50/70 p-4.5 rounded-2xl border border-indigo-100">
                      <div className="text-center shrink-0">
                        <span className="font-black text-5xl sm:text-6xl text-indigo-700 tracking-tighter block">
                          {adaptiveCompetenceRating}
                        </span>
                        <span className="block mt-1 text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                          CURRENT COMPETENCE RATING
                        </span>
                      </div>

                      <div className="flex-1 text-xs text-slate-700 leading-relaxed font-medium space-y-1.5 text-left">
                        <p className="font-bold text-indigo-950 bg-white/80 p-2.5 rounded-xl border border-indigo-100/80 shadow-xs">
                          {getCompetenceDescription(adaptiveCompetenceRating, totalProblemsSolved)}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-bold">
                          <span className="text-emerald-700">🟢 {masteryDistribution.mastered}% Mastered</span>
                          <span className="text-amber-700">🟡 {masteryDistribution.practicing}% Practicing</span>
                          <span className="text-rose-700">🔴 {masteryDistribution.challenged}% Review</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 30-DAY GROWTH CURVE VISUALIZATION */}
                  <section className="bg-white border-2 border-indigo-100 rounded-2xl p-4 text-left space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                        <span>📈</span> 30-Day Mastery Growth Trajectory
                      </h3>
                      <span className="text-[10px] font-extrabold text-indigo-600">
                        +{adaptiveCompetenceRating - (last30DaysGrowthData[0]?.rating || 1000)} pts gained
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3 h-24 pt-4 pb-1 px-2 border-b border-slate-100">
                      {last30DaysGrowthData.map((pt, idx) => {
                        const minRating = 900;
                        const maxRating = 1300;
                        const heightPct = Math.min(100, Math.max(25, Math.round(((pt.rating - minRating) / (maxRating - minRating)) * 100)));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                            <span className="text-[9px] font-black text-indigo-700 opacity-80">
                              {pt.rating}
                            </span>
                            <div
                              className="w-full max-w-[32px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500 shadow-xs"
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="text-[9px] font-extrabold text-slate-500 mt-0.5">{pt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* MATH TOPICS & COMPETENCE STRANDS */}
                  <section className="text-left space-y-3">
                    <h3 className="text-base font-extrabold text-slate-800">Math Topics & Competence</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(skillStrandBreakdown).map(([strandName, data]) => {
                        const isMastered = data.status === 'Mastered';
                        const isPracticing = data.status === 'Practicing';

                        return (
                          <div key={strandName} className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-xs hover:border-indigo-300 transition-colors space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{data.icon}</span>
                                <div>
                                  <h4 className="font-extrabold text-xs text-slate-800">{strandName}</h4>
                                  <p className="text-[10px] font-medium text-slate-500">{data.subtitle}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isMastered
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isPracticing
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}>
                                {data.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-bold">
                              <span className="text-slate-500">Topic Rating:</span>
                              <span className="text-indigo-700 font-black">{data.rating} pts ({data.accuracy}% Acc)</span>
                            </div>

                            {data.challengedFacts && data.challengedFacts.length > 0 && (
                              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-[10px] font-semibold text-rose-900 flex items-center justify-between">
                                <span>🎯 Challenged Facts:</span>
                                <strong className="font-mono text-rose-950 font-black">{data.challengedFacts.join(', ')}</strong>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              );
            })()}

            {/* Recent Skill Mastery Section */}
            {(() => {
              const activeUserData = storageService.getUserData();
              const recentSkillMastery = activeUserData.recentSkillMastery || [];

              return (
                <div className="space-y-2 text-left">
                  <span className="text-xs uppercase font-extrabold text-slate-700 tracking-wider block">
                    Recent Skill Mastery
                  </span>
                  {recentSkillMastery.length === 0 ? (
                    <div className="p-3.5 bg-purple-50/70 border-2 border-purple-200 rounded-2xl text-purple-900 text-xs font-semibold leading-relaxed flex items-center gap-2.5">
                      <span className="text-xl shrink-0">🎯</span>
                      <span>Kibo is currently evaluating skill mastery! Check back after a few adaptive climbing sessions.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentSkillMastery.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-purple-50 via-white to-amber-50 border-2 border-purple-200 rounded-2xl p-3 text-xs shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">🌟</span>
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-tight">{item.skillName}</h5>
                              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-xs text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-300 shrink-0">
                            +{item.currentRating - item.startingRating} Rating ({item.currentRating})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Earned Trail Badges Showcase */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                  <Award className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">Earned Trail Badges</h4>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {unlockedBadges.length} / {BADGES_CATALOG.length} Unlocked
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
                <h4 className="font-extrabold text-sm text-slate-800">Climb Display Preferences</h4>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Hide Live Timer During Climbs</span>
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
                  <span className="text-[10px] text-slate-500 font-medium">Alert child if daily climb is incomplete</span>
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

      </main>

      {/* STICKY BOTTOM ACTION FOOTER */}
      <footer className="w-full bg-white/95 border-t-2 border-purple-200 p-3 sm:p-4 backdrop-blur-md shrink-0 flex items-center justify-center z-10">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base py-3 px-8 rounded-2xl shadow-lg shadow-purple-500/30 border-b-4 border-purple-800 active:translate-y-0.5 active:border-b-0 transition-all text-center"
        >
          Exit Parent Zone 🔒
        </button>
      </footer>
    </div>
  );
}
