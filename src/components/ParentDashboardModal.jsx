import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles, Award, RotateCcw, Trophy, ArrowLeft, Users, Cloud, Plus, UserPlus, Download, Trash2, Unplug } from 'lucide-react';
import { CURRICULUM_TIERS, getTierFromRating, getGradeLevelFromRating, GRADE_STARTING_RATINGS } from '../utils/curriculum';
import { BADGES_CATALOG } from '../data/badges';
import { soundFx } from '../utils/audio';
import { pluralize } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, requestNotificationPermission } from '../utils/notifications';
import { calculateDomainMastery, calculateAdaptiveCompetenceProfile } from '../utils/domainStats';
import { getCompetenceRankTier, getCompetenceDescription } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { communicationsService } from '../services/communicationsService';
import AccountLinkModal from './AccountLinkModal';

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
  onProfileSwitch,
  preferences = { hideSprintTimer: false },
  onUpdatePreferences,
  unlockedBadges = [],
  totalProblemsSolved = 0,
  personalRecords = {},
  onAccountLinked
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  const [liveUserData, setLiveUserData] = useState(() => storageService.getUserData());
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [profilesList, setProfilesList] = useState(() => storageService.getAllProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => storageService.getActiveProfileId());
  const [showNewChildInput, setShowNewChildInput] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState('Grade 1–2');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editChildName, setEditChildName] = useState('');

  // Data Privacy Confirmation States
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSwitchProfile = (pId) => {
    soundFx.playKeyTap();
    storageService.setActiveProfileId(pId);
    setActiveProfileId(pId);
    setLiveUserData(storageService.getUserData());
    setShowEditProfile(false);
    if (onProfileSwitch) onProfileSwitch();
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    soundFx.playVictory();
    const newProf = storageService.createProfile(newChildName.trim(), newChildGrade);
    setProfilesList(storageService.getAllProfiles());
    setActiveProfileId(newProf.id);
    setLiveUserData(storageService.getUserData());
    setNewChildName('');
    setShowNewChildInput(false);
  };

  const handleOpenEditProfile = () => {
    soundFx.playKeyTap();
    const activeProf = profilesList.find((p) => p.id === activeProfileId) || storageService.getActiveProfile();
    setEditChildName(activeProf.name || 'Kibo Climber');
    setShowEditProfile((prev) => !prev);
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    if (!editChildName.trim()) return;
    soundFx.playVictory();
    storageService.updateProfile(activeProfileId, { name: editChildName.trim() });
    setProfilesList(storageService.getAllProfiles());
    setLiveUserData(storageService.getUserData());
    setShowEditProfile(false);
  };

  const handleDeleteProfile = (pId) => {
    if (profilesList.length <= 1) {
      alert('Cannot delete sole profile. Create another profile first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this child profile and its progress?')) {
      soundFx.playIncorrect();
      storageService.deleteProfile(pId);
      const updatedList = storageService.getAllProfiles();
      setProfilesList(updatedList);
      const newActive = storageService.getActiveProfileId();
      setActiveProfileId(newActive);
      setLiveUserData(storageService.getUserData());
      setShowEditProfile(false);
    }
  };

  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    return storageService.getUserData().dismissedAlerts || [];
  });

  const handleDismissAlert = (alertId) => {
    soundFx.playKeyTap();
    const updated = [...dismissedAlerts, alertId];
    setDismissedAlerts(updated);
    storageService.saveUserData({ dismissedAlerts: updated });
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-purple-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
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
            <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">Parent Dashboard</h2>
          </div>
        </div>
      </header>

      {/* CHILD PROFILE SELECTOR BAR */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-3 pb-1 shrink-0">
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-3 shadow-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-800">
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Active Child Profile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="text-[11px] font-extrabold text-slate-700 hover:text-purple-900 bg-slate-100 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
              >
                ✏️ {showEditProfile ? 'Cancel Edit' : 'Rename / Edit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditProfile(false);
                  setShowNewChildInput((prev) => !prev);
                }}
                className="text-[11px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showNewChildInput ? 'Cancel' : '+ Add Profile'}
              </button>
            </div>
          </div>

          {/* Edit / Rename Active Profile Form */}
          {showEditProfile && (
            <form onSubmit={handleSaveEditProfile} className="flex items-center gap-2 pt-2 border-t border-purple-100 bg-purple-50/60 p-2 rounded-xl">
              <span className="text-xs font-black text-purple-900 shrink-0">Rename:</span>
              <input
                type="text"
                value={editChildName}
                onChange={(e) => setEditChildName(e.target.value)}
                placeholder="Enter Child's Name (e.g. Leo)"
                required
                className="flex-1 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600"
              />
              <button type="submit" className="btn-3d-purple px-3.5 py-1.5 text-xs rounded-xl font-black">
                Save Name
              </button>
              {profilesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(activeProfileId)}
                  className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-300 transition-colors shrink-0"
                  title="Delete this profile"
                >
                  🗑️ Delete
                </button>
              )}
            </form>
          )}

          {/* New Profile Input Form */}
          {showNewChildInput && (
            <form onSubmit={handleCreateProfile} className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <input
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Child's Name (e.g. Leo)"
                required
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-500"
              />
              <select
                value={newChildGrade}
                onChange={(e) => setNewChildGrade(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold focus:outline-none"
              >
                {Object.keys(GRADE_STARTING_RATINGS).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <button type="submit" className="btn-3d-purple px-3 py-1.5 text-xs rounded-xl font-black">
                Save
              </button>
            </form>
          )}

          {/* Profile Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {profilesList.map((p) => {
              const isActive = p.id === activeProfileId;
              const childRating = p.userData?.adaptiveCompetenceRating || p.userData?.competenceRank || 1000;
              const displayGrade = getGradeLevelFromRating(childRating);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchProfile(p.id)}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>{p.name || 'Child'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-600'}`}>
                    {displayGrade}
                  </span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
      <main className="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">

            {/* STAT SUMMARY ROW */}
            {(() => {
              const activeUserData = liveUserData || storageService.getUserData();
              const historyList = activeUserData.sprintHistory || [];
              const activeLearningTimeSec = historyList.reduce((acc, curr) => acc + (Number(curr.totalTimeSec) || 0), 0);
              const childStreak = activeUserData.streak ?? streak ?? 1;
              const childTotalSolved = activeUserData.totalProblemsSolved ?? totalProblemsSolved ?? 0;
              const childRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentMathTier = getTierFromRating(childRating);
              const rankTitle = getCompetenceRankTier(childRating);

              const formatTime = (sec) => {
                if (!sec || sec <= 0) return '0m';
                const mins = Math.floor(sec / 60);
                if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                return mins > 0 ? `${mins}m` : `${sec}s`;
              };

              const now = new Date();
              const recentSprints = historyList.filter(s => {
                  if (!s.date) return false;
                  return (now - new Date(s.date)) / (1000 * 60 * 60 * 24) <= 14;
              });
              let recentAccuracy = 'N/A';
              if (recentSprints.length > 0) {
                  let totalCorrect = 0;
                  let totalQs = 0;
                  recentSprints.forEach(s => {
                      totalCorrect += Number(s.correctCount || s.score || 0);
                      totalQs += Number(s.totalQuestions || (s.answers ? s.answers.length : 12));
                  });
                  recentAccuracy = totalQs > 0 ? `${Math.round((totalCorrect / totalQs) * 100)}%` : 'N/A';
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <Flame className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-black text-amber-900 block">Streak</span>
                    <span className="text-lg font-black text-slate-800">{pluralize(childStreak, 'Day')}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-black text-emerald-900 block">Problems Solved</span>
                    <span className="text-lg font-black text-slate-800">{childTotalSolved}</span>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3">
                    <Clock className="w-5 h-5 text-sky-600 mx-auto mb-1 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-black text-sky-900 block">Math Time</span>
                    <span className="text-lg font-black text-sky-950">{formatTime(activeLearningTimeSec)}</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3">
                    <Award className="w-5 h-5 text-indigo-600 mx-auto mb-1 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-black text-indigo-900 block">Skill Rating</span>
                    <span className="text-lg font-black text-indigo-900">{childRating}</span>
                  </div>
                  <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-3">
                    <CheckCircle2 className="w-5 h-5 text-fuchsia-600 mx-auto mb-1 stroke-[2.5]" />
                    <span className="text-[9px] uppercase font-black text-fuchsia-900 block">Recent Acc.</span>
                    <span className="text-lg font-black text-fuchsia-900">{recentAccuracy}</span>
                  </div>
                </div>
              );
            })()}

            {/* RECENT ACTIVITY LOG */}
            {(() => {
              const activeUserData = liveUserData || storageService.getUserData();
              const historyList = activeUserData.sprintHistory || [];
              const recentList = historyList.slice(0, 3);

              const formatShortDate = (dateString) => {
                  if (!dateString) return 'Unknown Date';
                  const d = new Date(dateString);
                  const today = new Date();
                  const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                  if (diffDays === 0) return 'Today';
                  if (diffDays === 1) return 'Yesterday';
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              };

              const takingBreak = recentList.length > 0 && recentList[0].date && ((new Date() - new Date(recentList[0].date)) / (1000 * 60 * 60 * 24) > 7);

              return (
                <section className="bg-white rounded-2xl p-4 border-2 border-slate-200 text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-800">Recent Activity</h2>
                    {takingBreak && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                          Taking a Break
                        </span>
                    )}
                  </div>
                  {recentList.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-500 italic">No recent climbs yet.</p>
                  ) : (
                      <div className="space-y-2">
                          {recentList.map((sprint, i) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-extrabold text-slate-700">{formatShortDate(sprint.date)}</span>
                                      <span className="text-[10px] text-slate-500">{sprint.totalTimeSec ? `${Math.round(sprint.totalTimeSec)}s` : (sprint.durationInSeconds ? `${Math.round(sprint.durationInSeconds)}s` : '—')}</span>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                      <span className={`text-xs font-black ${sprint.accuracyPct >= 80 ? 'text-emerald-600' : (sprint.accuracyPct >= 60 ? 'text-amber-600' : 'text-rose-600')}`}>
                                          {sprint.accuracyPct ?? Math.round((Number(sprint.correctCount||sprint.score||0)/Number(sprint.totalQuestions||(sprint.answers?sprint.answers.length:12)))*100)}% Acc
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-bold">{sprint.ratingGain > 0 ? `+${sprint.ratingGain} rating` : (sprint.ratingGain < 0 ? `${sprint.ratingGain} rating` : '=')}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
                </section>
              );
            })()}

            {/* MATH MASTERY SNAPSHOT */}
            {(() => {
              const activeUserData = liveUserData || storageService.getUserData();
              const actualRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentMathTier = getTierFromRating(actualRating);
              const childTotalSolved = activeUserData.totalProblemsSolved ?? totalProblemsSolved ?? 0;
              const rankTitle = getCompetenceRankTier(actualRating);
              const gradeLvl = getGradeLevelFromRating(actualRating);

              return (
                <section className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-sm font-black text-slate-800">Math Mastery</h2>
                      <span className="text-[10px] text-indigo-600 font-bold block">{gradeLvl} level · Tier {currentMathTier} Climber</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {childTotalSolved < 15 && (
                        <span className="text-[9px] font-black uppercase text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse">⏳ Calibrating</span>
                      )}
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />{rankTitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 leading-relaxed">
                    {getCompetenceDescription(actualRating, childTotalSolved)}
                  </p>
                </section>
              );
            })()}

            {/* MATH TOPICS — compact strand list */}
            {(() => {
              const activeUserData = liveUserData || storageService.getUserData();
              const actualRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentMathTier = getTierFromRating(actualRating);
              const adaptiveProfile = calculateAdaptiveCompetenceProfile(sprintHistory, currentMathTier, actualRating, activeUserData.ratingHistory || []);
              const { skillStrandBreakdown } = adaptiveProfile;

              const statusColor = (status) => {
                if (status === 'Mastered') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (status === 'Skipped') return 'bg-sky-100 text-sky-800 border-sky-300';
                if (status === 'Practicing') return 'bg-amber-100 text-amber-900 border-amber-300';
                if (status === 'Locked') return 'bg-slate-100 text-slate-500 border-slate-300';
                return 'bg-indigo-100 text-indigo-800 border-indigo-300';
              };

              return (
                <section className="text-left space-y-2">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Math Topics</h3>
                  <div className="space-y-2">
                    {Object.entries(skillStrandBreakdown).map(([strandName, data]) => (
                      <div key={strandName} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{data.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-slate-800 block truncate">{strandName}</span>
                            {data.accuracy > 0 && data.status !== 'Skipped' && (
                              <span className="text-[10px] text-slate-500 font-medium">{data.accuracy}% accuracy</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ml-2 ${statusColor(data.status)}`}>
                            {data.status === 'Locked' ? '🔒 Locked' : data.status}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ml-2 ${statusColor(data.status)}`}>
                          {data.status === 'Locked' ? '🔒 Locked' : data.status === 'Skipped' ? '⏭️ Skipped' : data.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

          </div>
        )}

        {/* TAB 2: PIN & SCHEDULE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">

            {/* Scope Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex flex-col sm:flex-row gap-2 text-left">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-base shrink-0">👤</span>
                <div>
                  <span className="text-xs font-black text-purple-900 block">Practice Schedule & Notifications</span>
                  <span className="text-[10px] font-medium text-purple-700 leading-snug">
                    Applies to the <strong>currently selected child profile</strong> — switching profiles above will apply these settings to a different child.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 flex-1 sm:border-l sm:border-purple-200 sm:pl-3">
                <span className="text-base shrink-0">🔒</span>
                <div>
                  <span className="text-xs font-black text-purple-900 block">Parent PIN</span>
                  <span className="text-[10px] font-medium text-purple-700 leading-snug">
                    Shared across <strong>all child profiles</strong> on this device — one PIN protects the entire Parent Zone.
                  </span>
                </div>
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
              <div className="flex flex-col bg-white border border-slate-200 p-2.5 rounded-xl gap-1">
                <div className="flex items-center justify-between">
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
                {notifPrefs.weeklyDigestEnabled && (
                  <p className="text-[10px] text-purple-900 font-medium bg-purple-50/80 p-2 rounded-lg border border-purple-200 mt-1 leading-snug">
                    📅 <strong>Schedule:</strong> Sent every <strong>Sunday at 6:00 PM</strong>.<br />
                    📊 <strong>Includes:</strong> Weekly problems solved, rating gain, recall latency breakdown, mastered topics & unlocked badges.
                  </p>
                )}
              </div>

              {/* Struggle / Target Fact Alerts */}
              <div className="flex flex-col bg-white border border-slate-200 p-2.5 rounded-xl gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">Struggle & Review Alerts</span>
                    <span className="text-[10px] text-slate-500 font-medium">Real-time alerts when accuracy drops or frustration triggers</span>
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
                {notifPrefs.struggleAlertsEnabled && (
                  <p className="text-[10px] text-purple-900 font-medium bg-purple-50/80 p-2 rounded-lg border border-purple-200 mt-1 leading-snug">
                    🛡️ <strong>Child-Safe Privacy:</strong> Displayed exclusively inside <strong>🔒 Parent Zone Dashboard</strong> (never shown on child's screen!).<br />
                    ⚠️ <strong>Triggers:</strong> Accuracy &lt; 65%, 3+ consecutive misses, or frustration triggers with actionable review tips.
                  </p>
                )}
              </div>

              {/* Allow Real-Money Purchases */}
              <div className="flex flex-col bg-white border border-slate-200 p-2.5 rounded-xl gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">Allow Real-Money Purchases</span>
                    <span className="text-[10px] text-slate-500 font-medium">Allow kids to buy Sparks with real money</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotifPref('allowRealMoneyPurchases')}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      notifPrefs.allowRealMoneyPurchases ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifPrefs.allowRealMoneyPurchases ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                {notifPrefs.allowRealMoneyPurchases && (
                  <p className="text-[10px] text-amber-900 font-medium bg-amber-50/80 p-2 rounded-lg border border-amber-200 mt-1 leading-snug">
                    ⚠️ <strong>Note:</strong> A 4-digit Parent PIN will still be required before any actual payment can be made.
                  </p>
                )}
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

            {/* Account & Data Privacy Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Cloud className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Account & Data Privacy</h4>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">
                      {authService.getAuthState().isAnonymous ? '☁️ Anonymous Guest Account' : `✅ Account Linked (${authService.getAuthState().provider || 'Email'})`}
                    </span>
                    {authService.getAuthState().isAnonymous && (
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Link with Google, Apple, or Email to back up progress across devices
                      </span>
                    )}
                  </div>

                  {authService.getAuthState().isAnonymous && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowAccountLinkModal(true);
                      }}
                      className="btn-3d-purple px-3 py-1.5 text-xs rounded-xl font-extrabold shrink-0"
                    >
                      🔗 Link Account
                    </button>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      soundFx.playKeyTap();
                      authService.exportUserData();
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data (JSON)</span>
                  </button>

                  {!authService.getAuthState().isAnonymous && (
                    <>
                      {!showUnlinkConfirm ? (
                        <button
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowUnlinkConfirm(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-xs transition-colors text-left"
                        >
                          <Unplug className="w-4 h-4" />
                          <span>Unlink Account</span>
                        </button>
                      ) : (
                        <div className="bg-amber-100 p-3 rounded-xl border border-amber-300 space-y-2">
                          <p className="text-xs font-bold text-amber-900">Are you sure you want to unlink your account? Your local progress will remain on this device, but it will no longer sync to the cloud.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                soundFx.playKeyTap();
                                await authService.unlinkAccount();
                                setLiveUserData(storageService.getUserData());
                                setShowUnlinkConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs"
                            >
                              Yes, Unlink
                            </button>
                            <button
                              onClick={() => {
                                soundFx.playKeyTap();
                                setShowUnlinkConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account & Data</span>
                    </button>
                  ) : (
                    <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 space-y-2">
                      <p className="text-xs font-bold text-rose-900">WARNING: This will permanently delete all local and cloud data, resetting the app entirely. Type <strong>DELETE</strong> below to confirm.</p>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-sm font-bold text-rose-900 focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (deleteInput === 'DELETE') {
                              soundFx.playKeyTap();
                              await authService.deleteAccount();
                              window.location.reload();
                            }
                          }}
                          disabled={deleteInput !== 'DELETE'}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs disabled:opacity-50"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowDeleteConfirm(false);
                            setDeleteInput('');
                          }}
                          className="px-3 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => setShowAccountLinkModal(false)}
        milestoneName="Parent Zone Request"
        onAccountLinked={(user, newSparks) => {
          setShowAccountLinkModal(false);
          setLiveUserData(storageService.getUserData());
          if (onAccountLinked) onAccountLinked(user, newSparks);
        }}
      />

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
