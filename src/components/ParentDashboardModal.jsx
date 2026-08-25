import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles, Award, RotateCcw, Trophy, ArrowLeft, Users, Cloud, Plus, Download, Trash2, Unplug, Fingerprint, BarChart3 } from 'lucide-react';
import { CURRICULUM_TIERS, getTierFromRating, getGradeLevelFromRating, GRADE_STARTING_RATINGS } from '../utils/mathCurriculum';
import { WORDS_CURRICULUM_TIERS } from '../utils/wordsCurriculum';
import { BADGES_CATALOG } from '../data/badges';
import { soundFx } from '../utils/audio';
import { pluralize, formatTime } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, saveProfileReminderPrefs, requestNotificationPermission } from '../utils/notifications';
import { calculateDomainMastery, calculateAdaptiveCompetenceProfile } from '../utils/domainStats';
import { calculateConceptBreakdown, generateParentInsightCards } from '../utils/skipDiagnosticEngine';
import { getCompetenceRankTier, getCompetenceDescription } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { communicationsService } from '../services/communicationsService';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { generateWeeklyDigestData, formatWeeklyDigestText } from '../utils/weeklyDigest';
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
  activeSubject = 'math',
  initialTab = 'overview',
  highlightSection = null,
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
  const [activeTab, setActiveTab] = useState(initialTab || 'overview'); // 'overview' | 'schedule' | 'verification'
  const [selectedSubject, setSelectedSubject] = useState(activeSubject || 'math');

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [profilesList, setProfilesList] = useState(() => storageService.getAllProfiles());
  const [viewingProfileId, setViewingProfileId] = useState(() => storageService.getActiveProfileId());
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [overviewTimeframe, setOverviewTimeframe] = useState('7d'); // '7d' | '30d' | 'all'

  // Weekly digest preview & test sending states
  const [showWeeklyPreview, setShowWeeklyPreview] = useState(false);
  const [isSendingTestDigest, setIsSendingTestDigest] = useState(false);
  const [digestStatusMsg, setDigestStatusMsg] = useState('');

  // Helper to extract a profile's subject specific data
  const getProfileSubjectData = (profileId, subId) => {
    const p = storageService.getProfileById(profileId);
    if (!p || !p.userData) return storageService.getUserData(subId);
    const uData = p.userData;
    const subData = uData.subjects?.[subId] || (subId === 'math' ? uData : {}) || {};
    return {
      ...uData,
      ...subData,
      name: p.name || uData.name || 'Child',
      streak: uData.streak ?? 0,
      lastSprintDate: uData.lastSprintDate ?? null,
      adaptiveCompetenceRating: subData.adaptiveCompetenceRating || (subId === 'math' ? uData.adaptiveCompetenceRating : 1000) || 1000,
      competenceRank: subData.competenceRank || (subId === 'math' ? uData.competenceRank : 1000) || 1000,
      totalProblemsSolved: subData.totalProblemsSolved ?? (subId === 'math' ? (uData.totalProblemsSolved ?? 0) : 0),
      cumulativeCorrectStreak: subData.cumulativeCorrectStreak ?? (subId === 'math' ? (uData.cumulativeCorrectStreak ?? 0) : 0),
      personalRecords: subData.personalRecords || (subId === 'math' ? (uData.personalRecords || {}) : {}),
      tier: subData.tier ?? (subId === 'math' ? (uData.tier ?? 1) : 1),
      sprintHistory: subData.sprintHistory || (subId === 'math' ? (uData.sprintHistory || []) : []),
      skipLogs: subData.skipLogs || (subId === 'math' ? (uData.skipLogs || []) : [])
    };
  };

  const [liveUserData, setLiveUserData] = useState(() => getProfileSubjectData(storageService.getActiveProfileId(), selectedSubject));
  const realMoneySectionRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'verification' && highlightSection === 'real_money_purchases' && realMoneySectionRef.current) {
      setTimeout(() => {
        realMoneySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen, activeTab, highlightSection]);

  useEffect(() => {
    setSelectedSubject(activeSubject || 'math');
  }, [activeSubject]);

  useEffect(() => {
    setLiveUserData(getProfileSubjectData(viewingProfileId, selectedSubject));
  }, [selectedSubject, viewingProfileId, isOpen]);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const activeId = storageService.getActiveProfileId();
      setViewingProfileId(activeId);
      setLiveUserData(getProfileSubjectData(activeId, selectedSubject));
      setProfilesList(storageService.getAllProfiles());
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editChildName, setEditChildName] = useState('');

  // Data Privacy Confirmation States
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSwitchProfile = (pId) => {
    soundFx.playKeyTap();
    setViewingProfileId(pId);
    storageService.setActiveProfileId(pId);
    setLiveUserData(getProfileSubjectData(pId, selectedSubject));
    setShowEditProfile(false);
    if (onProfileSwitch) onProfileSwitch();
  };

  const handleSelectSubject = (subId) => {
    soundFx.playKeyTap();
    setSelectedSubject(subId);
    setLiveUserData(getProfileSubjectData(viewingProfileId, subId));
  };

  const handleOpenEditProfile = () => {
    soundFx.playKeyTap();
    const activeProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getActiveProfile();
    setEditChildName(activeProf.name || 'Kibo Climber');
    setShowEditProfile((prev) => !prev);
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    if (!editChildName.trim()) return;
    soundFx.playVictory();
    storageService.updateProfile(viewingProfileId, { name: editChildName.trim() });
    setProfilesList(storageService.getAllProfiles());
    setLiveUserData(getProfileSubjectData(viewingProfileId, selectedSubject));
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
      setViewingProfileId(newActive);
      setLiveUserData(getProfileSubjectData(newActive, selectedSubject));
      setShowEditProfile(false);
      if (onProfileSwitch) onProfileSwitch();
    }
  };

  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    return storageService.getUserData(selectedSubject).dismissedAlerts || [];
  });

  const handleDismissAlert = (alertId) => {
    soundFx.playKeyTap();
    const updated = [...dismissedAlerts, alertId];
    setDismissedAlerts(updated);
    storageService.saveUserData({ dismissedAlerts: updated }, selectedSubject);
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchUserData = () => {
      setLiveUserData(getProfileSubjectData(viewingProfileId, selectedSubject));
    };
    fetchUserData();
    const interval = setInterval(fetchUserData, 3000);
    return () => clearInterval(interval);
  }, [isOpen, viewingProfileId, selectedSubject]);

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

  // Notification & Schedule Preferences State
  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  const handleToggleNotifPref = (key) => {
    soundFx.playKeyTap();
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
  };


  const handleToggleChildReminder = () => {
    soundFx.playKeyTap();
    const currentProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
    const isCurrentlyEnabled = currentProf.dailyReminderEnabled ?? true;
    const updatedEnabled = !isCurrentlyEnabled;

    saveProfileReminderPrefs(viewingProfileId, {
      dailyReminderEnabled: updatedEnabled,
      reminderTime: currentProf.reminderTime || '17:00'
    });
    setProfilesList(storageService.getAllProfiles());

    if (updatedEnabled) {
      requestNotificationPermission();
    }
  };

  const handleChildReminderTimeChange = (newTime) => {
    const currentProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
    saveProfileReminderPrefs(viewingProfileId, {
      dailyReminderEnabled: currentProf.dailyReminderEnabled ?? true,
      reminderTime: newTime
    });
    setProfilesList(storageService.getAllProfiles());
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    setPinErrorMsg('');
    setPinSuccessMsg('');

    if (currentPin && oldPinInput !== currentPin) {
      setPinErrorMsg('Current PIN is incorrect.');
      soundFx.playIncorrect();
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinErrorMsg('New PIN must be exactly 4 digits.');
      soundFx.playIncorrect();
      return;
    }

    if (newPinInput === '1234') {
      setPinErrorMsg('Default 1234 PIN is deprecated. Please choose a unique custom 4-digit PIN.');
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
    setPinSuccessMsg('Custom fallback PIN updated successfully!');
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-purple-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-purple-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playKeyTap();
              onClose();
            }}
            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Exit Parent Zone"
            title="Exit Parent Zone"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">Parent Dashboard</h2>
          </div>
        </div>

        <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
          🔒 PIN Protected
        </span>
      </header>

      {/* CHILD PROFILE SELECTOR BAR */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-3 pb-1 shrink-0">
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-3 shadow-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-800">
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Viewing Child Profile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="text-xs font-extrabold text-slate-700 hover:text-purple-900 bg-slate-100 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
              >
                ✏️ {showEditProfile ? 'Cancel Edit' : 'Rename / Edit'}
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
                maxLength={20}
                required
                className="flex-1 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600"
              />
              <button type="submit" className="btn-3d-purple px-3.5 py-1.5 text-xs rounded-xl font-black">
                Save Name
              </button>
              {profilesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(viewingProfileId)}
                  className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-300 transition-colors shrink-0"
                  title="Delete this profile"
                >
                  🗑️ Delete
                </button>
              )}
            </form>
          )}

          {/* Profile Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none touch-pan-x">
            {profilesList.map((p) => {
              const isActive = p.id === viewingProfileId;
              const childRating = p.userData?.adaptiveCompetenceRating || p.userData?.competenceRank || 1000;
              const displayGrade = getGradeLevelFromRating(childRating);
              const profileStreak = p.userData?.streak ?? 0;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchProfile(p.id)}
                  className={`px-3.5 py-1.5 rounded-full border-2 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>{p.name || 'Child'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-600'}`}>
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
        <div className="flex bg-slate-200/80 p-1 rounded-2xl font-extrabold text-xs sm:text-sm shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">Child Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'schedule'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">Schedule & Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'verification'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">Verification & Controls</span>
          </button>
        </div>
      </div>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 space-y-4 my-1">

            {/* CHILD GLOBAL HABIT BANNER */}
            {(() => {
              const currentProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
              const profileStreak = currentProf.userData?.streak ?? 0;
              const childName = currentProf.name || 'Your Climber';
              return (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 text-left shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Flame className="w-6 h-6 fill-white stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wider">Overall Daily Practice Streak</span>
                        <span className="bg-amber-200/80 text-amber-900 text-xs font-extrabold px-2 py-0.5 rounded-full">All Subjects</span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        {childName} has practiced for <strong className="text-amber-950 font-black">{pluralize(profileStreak, 'Day')}</strong> in a row across Math, Words & World.
                      </p>
                    </div>
                  </div>
                  <div className="text-center shrink-0 bg-white/80 border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xl font-black text-amber-600 tracking-tight leading-none block">{profileStreak}</span>
                    <span className="text-xs font-black uppercase text-amber-800 tracking-wider block mt-0.5">{profileStreak === 1 ? 'Day' : 'Days'}</span>
                  </div>
                </div>
              );
            })()}

            {/* SUBJECT SELECTOR BAR (TOGGLE BETWEEN ALL ACTIVE SUBJECTS PER PROFILE) */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2 flex-wrap text-left">
              <div className="flex items-center gap-1.5 text-purple-900">
                <Layers className="w-4 h-4 stroke-[2.5] text-purple-600" />
                <span className="text-xs font-black uppercase tracking-wider">Subject Focus</span>
              </div>

              {/* Subject Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none touch-pan-x">
                {Object.keys(SUBJECTS_CONFIG || { math: {}, words: {} }).map((subKey) => {
                  const subConfig = SUBJECTS_CONFIG[subKey] || {};
                  const isSelected = selectedSubject === subKey;
                  const subData = getProfileSubjectData(viewingProfileId, subKey);
                  const subRating = subData.adaptiveCompetenceRating || 1000;
                  const subIcon = subConfig.icon || (subKey === 'words' ? '📚' : subKey === 'world' ? '🌍' : (subKey === 'science' ? '🧪' : (subKey === 'coding' ? '💻' : '🔢')));

                  return (
                    <button
                      key={subKey}
                      type="button"
                      onClick={() => handleSelectSubject(subKey)}
                      className={`px-3.5 py-1.5 rounded-full border-2 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? (subKey === 'words' ? 'bg-teal-600 text-white border-teal-700 shadow-sm ring-2 ring-teal-400/30' : subKey === 'world' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/30' : subKey === 'coding' ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-400/30' : 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/30')
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <span>{subIcon}</span>
                      <span>{subConfig.name || subKey}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? (subKey === 'words' ? 'bg-teal-800 text-teal-100' : subKey === 'world' ? 'bg-emerald-800 text-emerald-100' : subKey === 'coding' ? 'bg-rose-800 text-rose-100' : 'bg-purple-800 text-purple-100') : 'bg-slate-200 text-slate-600'}`}>
                        {subRating}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAT SUMMARY & TIMEFRAME FILTER */}
            {(() => {
              const activeUserData = getProfileSubjectData(viewingProfileId, selectedSubject);
              const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG['math'];
              const historyList = activeUserData.sprintHistory || [];
              const now = new Date();

              // Calculate start date based on selected timeframe
              let cutoffDate = null;
              if (overviewTimeframe === '7d') {
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              } else if (overviewTimeframe === '30d') {
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              }

              // Filter sprints
              const filteredSprints = cutoffDate
                ? historyList.filter((s) => s.timestamp ? new Date(s.timestamp) >= cutoffDate : (s.date ? new Date(s.date) >= cutoffDate : true))
                : historyList;

              // Aggregate stats
              let activeLearningTimeSec = 0;
              let effectiveTotalQs = 0;
              let effectiveTotalCorrect = 0;
              let bestAnswerStreak = activeUserData.personalRecords?.highestCorrectStreak || 0;

              filteredSprints.forEach((s) => {
                const dur = s.totalTimeSec || s.durationInSeconds || 0;
                activeLearningTimeSec += dur;

                const qCount = Number(s.totalQuestions || (s.answers ? s.answers.length : 12));
                const cCount = Number(s.correctCount || s.score || 0);
                effectiveTotalQs += qCount;
                effectiveTotalCorrect += cCount;

                if (s.streak && s.streak > bestAnswerStreak) {
                  bestAnswerStreak = s.streak;
                }
              });

              // Fallback to all-time totals if no sprints in timeframe but all-time selected
              let solvedCount = overviewTimeframe === 'all'
                ? (activeUserData.totalProblemsSolved || effectiveTotalCorrect)
                : effectiveTotalCorrect;

              const avgPaceSec = solvedCount > 0 && activeLearningTimeSec > 0
                ? Number((activeLearningTimeSec / solvedCount).toFixed(1))
                : null;

              const accuracyVal = effectiveTotalQs > 0
                ? `${Math.round((effectiveTotalCorrect / effectiveTotalQs) * 100)}%`
                : (overviewTimeframe === 'all' && activeUserData.accuracy !== undefined ? `${activeUserData.accuracy}%` : '—');

              const childRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const rankTitle = getCompetenceRankTier(childRating, selectedSubject);
              const unitLabel = subjectConfig.unitsLabel || 'Items Solved';
              const paceUnit = subjectConfig.paceUnit || 'per item';
              const ratingLabel = subjectConfig.ratingLabel || 'Rank Rating';

              const timeLabel = overviewTimeframe === '7d' ? 'Past 7 Days' : (overviewTimeframe === '30d' ? 'Past 30 Days' : 'All-Time Total');
              const timeframeSubtitle = overviewTimeframe === '7d' ? 'Last 7 days' : (overviewTimeframe === '30d' ? 'Last 30 days' : 'All-time practice');

              return (
                <div className="space-y-3 text-left">
                  {/* Timeframe selector header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-700 stroke-[2.5]" />
                      <h3 className="text-sm font-black text-slate-800">
                        {subjectConfig.name} Performance Overview
                      </h3>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 text-xs font-black">
                      <button
                        type="button"
                        onClick={() => setOverviewTimeframe('7d')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          overviewTimeframe === '7d'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewTimeframe('30d')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          overviewTimeframe === '30d'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewTimeframe('all')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          overviewTimeframe === 'all'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Time
                      </button>
                    </div>
                  </div>

                  {/* 6 Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                    {/* Practice Time */}
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <Clock className="w-5 h-5 text-sky-600 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-sky-900 block truncate">{timeLabel}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-sky-950 block">{formatTime(activeLearningTimeSec)}</span>
                        <span className="text-xs font-bold text-sky-700/80 block truncate">{timeframeSubtitle}</span>
                      </div>
                    </div>

                    {/* Avg Pace */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-amber-900 block truncate">Avg Pace</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-amber-950 block">
                          {avgPaceSec ? `${avgPaceSec}s` : '—'}
                        </span>
                        <span className="text-xs font-bold text-amber-800/80 block truncate">
                          {avgPaceSec ? paceUnit : 'No sessions'}
                        </span>
                      </div>
                    </div>

                    {/* Problems / Words Solved */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-emerald-900 block truncate">{unitLabel}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-slate-800 block">{solvedCount}</span>
                        <span className="text-xs font-bold text-emerald-700/80 block truncate">
                          {overviewTimeframe === 'all' ? 'All-time total' : 'In period'}
                        </span>
                      </div>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <Target className="w-5 h-5 text-fuchsia-600 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-fuchsia-900 block truncate">Accuracy</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-fuchsia-900 block">{accuracyVal}</span>
                        <span className="text-xs font-bold text-fuchsia-700/80 block truncate">
                          {effectiveTotalQs > 0 ? `${effectiveTotalCorrect}/${effectiveTotalQs} correct` : 'No attempts'}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <Award className="w-5 h-5 text-indigo-600 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-indigo-900 block truncate">{ratingLabel}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-indigo-900 block">{childRating}</span>
                        <span className="text-xs font-bold text-indigo-700/80 block truncate">{rankTitle}</span>
                      </div>
                    </div>

                    {/* Best Streak */}
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-400 mx-auto mb-1 stroke-[2.5]" />
                        <span className="text-xs uppercase font-black text-orange-900 block truncate">Best Streak</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-slate-800 block">{bestAnswerStreak} {bestAnswerStreak === 1 ? 'Q' : 'Qs'}</span>
                        <span className="text-xs font-bold text-orange-700/80 block truncate">Personal best</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RECENT ACTIVITY LOG */}
            {(() => {
              const activeUserData = getProfileSubjectData(viewingProfileId, selectedSubject);
              const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG['math'];
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
                    <h2 className="text-sm font-black text-slate-800">Recent {subjectConfig.name} Activity</h2>
                    {takingBreak && (
                        <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                          Taking a Break
                        </span>
                    )}
                  </div>
                  {recentList.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-500 italic">No recent {subjectConfig.name.toLowerCase()} climbs yet.</p>
                  ) : (
                      <div className="space-y-2">
                          {recentList.map((sprint, i) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-extrabold text-slate-700">{formatShortDate(sprint.date)}</span>
                                      <span className="text-xs text-slate-500">
                                          {(() => {
                                              const totalSeconds = sprint.totalTimeSec ? Math.round(sprint.totalTimeSec) : (sprint.durationInSeconds ? Math.round(sprint.durationInSeconds) : null);
                                              if (totalSeconds === null) return '—';
                                              const m = Math.floor(totalSeconds / 60);
                                              const s = totalSeconds % 60;
                                              return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                          })()}
                                      </span>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                      <span className={`text-xs font-black ${sprint.accuracyPct >= 80 ? 'text-emerald-600' : (sprint.accuracyPct >= 60 ? 'text-amber-600' : 'text-rose-600')}`}>
                                          {sprint.accuracyPct ?? Math.round((Number(sprint.correctCount||sprint.score||0)/Number(sprint.totalQuestions||(sprint.answers?sprint.answers.length:12)))*100)}% Accuracy
                                      </span>
                                      <span className="text-xs text-slate-500 font-bold">{sprint.ratingGain > 0 ? `+${sprint.ratingGain} rating` : (sprint.ratingGain < 0 ? `${sprint.ratingGain} rating` : '=')}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
                </section>
              );
            })()}

            {/* SUBJECT MASTERY SNAPSHOT */}
            {(() => {
              const activeUserData = getProfileSubjectData(viewingProfileId, selectedSubject);
              const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG['math'];
              const actualRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentTier = activeUserData.tier ?? getTierFromRating(actualRating);
              const childTotalSolved = activeUserData.totalProblemsSolved ?? 0;
              const rankTitle = getCompetenceRankTier(actualRating, selectedSubject);
              const gradeLvl = getGradeLevelFromRating(actualRating);

              return (
                <section className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-sm font-black text-slate-800">{subjectConfig.name} Mastery</h2>
                      <span className="text-xs text-indigo-600 font-bold block">{gradeLvl} level · Tier {currentTier} Climber</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {childTotalSolved < 15 && (
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse">⏳ Calibrating</span>
                      )}
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />{rankTitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 leading-relaxed">
                    {getCompetenceDescription(actualRating, childTotalSolved, selectedSubject)}
                  </p>
                </section>
              );
            })()}

            {/* PARENT DIAGNOSTIC INSIGHTS & BOTTLENECK CARDS */}
            {(() => {
              const activeUserData = getProfileSubjectData(viewingProfileId, selectedSubject);
              const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG['math'];
              const profileName = activeUserData.name || 'Child';
              const skipLogs = activeUserData.skipLogs || [];
              const sprintHistory = activeUserData.sprintHistory || [];

              const actualRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
              const currentTier = activeUserData.tier ?? getTierFromRating(actualRating);
              const adaptiveProfile = calculateAdaptiveCompetenceProfile(sprintHistory, currentTier, actualRating, activeUserData.ratingHistory || [], selectedSubject);
              const { skillStrandBreakdown } = adaptiveProfile;

              const insightCards = generateParentInsightCards(skipLogs, sprintHistory, profileName, selectedSubject);
              const conceptBreakdown = calculateConceptBreakdown(sprintHistory, skipLogs, selectedSubject);

              return (
                <section className="bg-white rounded-2xl p-4 border-2 border-purple-200 text-left space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                      <h2 className="text-sm font-black text-slate-800">Parent Diagnostic Insights ({subjectConfig.name})</h2>
                    </div>
                    <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Adaptive Tracking
                    </span>
                  </div>

                  {/* ACTIONABLE INSIGHT CARDS */}
                  <div className="space-y-2">
                    {insightCards.map((card) => (
                      <div key={card.id} className="bg-gradient-to-r from-slate-50 to-purple-50/40 rounded-xl p-3 border border-purple-100 flex items-start gap-3 shadow-2xs">
                        <span className="text-2xl shrink-0 mt-0.5">{card.icon}</span>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="text-xs font-black text-slate-900">{card.title}</h3>
                            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border ${card.badgeClass}`}>
                              {card.badge}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* VISUAL BREAKDOWN: CORRECT VS INCORRECT VS SKIPPED PER CONCEPT */}
                  <div className="pt-2 border-t border-purple-100 space-y-3">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {subjectConfig.name} Concept Breakdown (Correct vs. Incorrect vs. Skipped)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.values(conceptBreakdown).map((concept) => {
                        const strand = Object.values(skillStrandBreakdown).find(s => s.id === concept.id) || skillStrandBreakdown[concept.name];
                        const isSkipped = strand?.status === 'Skipped' || (concept.total === 0 && strand?.status === 'Skipped');
                        const calculatedAcc = concept.total > 0 ? Math.round((concept.correct / concept.total) * 100) : (strand?.accuracy || 0);
                        const showAccuracy = strand?.status !== 'Skipped' && (concept.total > 0 || (strand?.accuracy && strand.accuracy > 0));

                        return (
                          <div key={concept.id || concept.name} className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-base shrink-0">{concept.icon}</span>
                                <div className="min-w-0">
                                  <span className="font-extrabold text-slate-800 block truncate">{concept.name}</span>
                                  {showAccuracy && (
                                    <span className="text-xs text-purple-700 font-bold block">{calculatedAcc}% accuracy</span>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                {isSkipped ? (
                                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full border bg-sky-100 text-sky-800 border-sky-300">
                                    Skipped
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-slate-500">
                                    {concept.total > 0 ? `${concept.total} Total` : 'No data'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* STACKED PROGRESS BAR */}
                            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                              {concept.total > 0 ? (
                                <>
                                  <div
                                    style={{ width: `${concept.correctPct}%` }}
                                    className="bg-emerald-500 h-full transition-all"
                                    title={`Correct: ${concept.correct} (${concept.correctPct}%)`}
                                  />
                                  <div
                                    style={{ width: `${concept.incorrectPct}%` }}
                                    className="bg-rose-500 h-full transition-all"
                                    title={`Incorrect: ${concept.incorrect} (${concept.incorrectPct}%)`}
                                  />
                                  <div
                                    style={{ width: `${concept.skippedPct}%` }}
                                    className="bg-sky-400 h-full transition-all"
                                    title={`Skipped: ${concept.skipped} (${concept.skippedPct}%)`}
                                  />
                                </>
                              ) : isSkipped ? (
                                <div className="w-full h-full bg-sky-200/60" title="Skipped topic" />
                              ) : (
                                <div className="w-full h-full bg-slate-200" />
                              )}
                            </div>

                            {/* COUNTS LEGEND */}
                            {!isSkipped && (
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-0.5">
                                <span className="text-emerald-700">✓ {concept.correct} Correct</span>
                                <span className="text-rose-700">✕ {concept.incorrect} Incorrect</span>
                                <span className="text-sky-700">🔄 {concept.skipped} Skipped</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })()}

          </div>
        )}

        {/* TAB 2: SCHEDULE & NOTIFICATIONS */}
        {activeTab === 'schedule' && (() => {
          const viewingProfile = profilesList.find((p) => p.id === viewingProfileId) || storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
          const profileDays = viewingProfile?.practiceDays || [1, 2, 3, 4, 5];
          const childReminderEnabled = viewingProfile?.dailyReminderEnabled ?? true;
          const childReminderTime = viewingProfile?.reminderTime || '17:00';
          const childName = viewingProfile?.name || 'Child';

          return (
            <div className="flex-1 space-y-4 my-1">

              {/* Scope Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex items-start gap-2.5 text-left">
                <span className="text-xl shrink-0">✨</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-purple-900 block">Hybrid Schedule & Notifications</span>
                    <span className="text-xs font-black uppercase tracking-wider bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                      Smart Scoping
                    </span>
                  </div>
                  <span className="text-xs font-medium text-purple-700 leading-snug block mt-0.5">
                    Practice days and daily streak alarms are <strong>customized per child profile</strong>, while weekly email digests and diagnostic alerts remain <strong>global for parents</strong>.
                  </span>
                </div>
              </div>

              {/* SECTION 1: CHILD-SPECIFIC PRACTICE SCHEDULE & ALARM */}
              <div className="bg-gradient-to-b from-purple-50/70 to-slate-50 border-2 border-purple-200 rounded-2xl p-3.5 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Calendar className="w-5 h-5 stroke-[2.5]" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>👤</span>
                        <span>{childName}'s Practice Schedule & Alarm</span>
                      </h4>
                      <span className="text-xs text-purple-700 font-bold block">
                        Child-Specific Setting
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-lg truncate max-w-[120px]">
                    {childName}
                  </span>
                </div>

                {/* 7-Day Practice Schedule Matrix */}
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Weekly Practice Days:
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map((d) => {
                      const isActive = profileDays.includes(d.idx);
                      return (
                        <button
                          key={d.idx}
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            let newDays;
                            if (isActive) {
                              if (profileDays.length === 1) return;
                              newDays = profileDays.filter((idx) => idx !== d.idx);
                            } else {
                              newDays = [...profileDays, d.idx].sort((a, b) => a - b);
                            }
                            storageService.saveProfilePracticeDays(viewingProfileId, newDays);
                            setProfilesList(storageService.getAllProfiles());
                            if (viewingProfileId === storageService.getActiveProfileId() && onUpdatePracticeDays) {
                              onUpdatePracticeDays(newDays);
                            }
                          }}
                          className={`py-2 text-xs font-black rounded-xl border-2 transition-all ${
                            isActive
                              ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/20'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium text-slate-500 italic leading-snug">
                    Unselected rest days automatically protect {childName}'s streak without consuming a Kibo Shield.
                  </p>
                </div>

                {/* Child-Specific Daily Streak Alarm */}
                <div className="flex items-center justify-between bg-white border border-purple-100 p-2.5 rounded-xl shadow-xs">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">
                      Daily Streak Reminder for {childName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Alert child on device if daily practice is incomplete
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={childReminderTime}
                      onChange={(e) => handleChildReminderTimeChange(e.target.value)}
                      disabled={!childReminderEnabled}
                      className="py-1 px-2 text-xs font-extrabold bg-slate-100 border border-slate-300 rounded-lg cursor-pointer disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleToggleChildReminder}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        childReminderEnabled ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                      title={`Toggle daily reminder for ${childName}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        childReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FAMILY & PARENT COMMUNICATIONS (GLOBAL) */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Bell className="w-5 h-5 stroke-[2.5]" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">Family & Parent Communications</h4>
                      <span className="text-xs text-slate-500 font-medium block">
                        Account-Wide Delivery Channels
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    All Profiles
                  </span>
                </div>

                {/* Weekly Digest */}
                <div className="flex flex-col bg-white border border-slate-200 p-3 rounded-xl gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Weekly Progress Summary (Per Profile)</span>
                      <span className="text-xs text-slate-500 font-medium">Individual weekly mastery & topics digest sent per child</span>
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
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <p className="text-xs text-purple-900 font-medium bg-purple-50/80 p-2.5 rounded-lg border border-purple-200 leading-snug">
                        📅 <strong>Schedule:</strong> Sent every <strong>Sunday at 6:00 PM</strong>.<br />
                        👤 <strong>Sent Per Profile:</strong> Each child profile receives a dedicated report with the <strong>🐾 Kibo mascot</strong> in the subject line.<br />
                        📚 <strong>All Played Topics Included:</strong> Full list of all topics tackled across Math, Words, World, and active subjects with mastery status, accuracy, and links back to the game.
                      </p>

                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowWeeklyPreview((prev) => !prev);
                          }}
                          className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl border border-purple-300 transition-all active:scale-95"
                        >
                          {showWeeklyPreview ? 'Hide Preview' : `👁️ Preview Digest for ${childName}`}
                        </button>

                        {authService.getAuthState().email && (
                          <>
                            <button
                              type="button"
                              disabled={isSendingTestDigest}
                              onClick={async () => {
                                soundFx.playKeyTap();
                                setIsSendingTestDigest(true);
                                setDigestStatusMsg('');
                                const currentProf = storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
                                const res = await communicationsService.sendWeeklyDigest({
                                  email: authService.getAuthState().email,
                                  profile: currentProf,
                                  subjectsConfig: SUBJECTS_CONFIG
                                });
                                setIsSendingTestDigest(false);
                                if (res.success) {
                                  soundFx.playVictory();
                                  setDigestStatusMsg(`Test weekly summary sent for ${currentProf.name || childName}! Check inbox.`);
                                } else {
                                  soundFx.playIncorrect();
                                  setDigestStatusMsg(res.error || 'Failed to send test email.');
                                }
                                setTimeout(() => setDigestStatusMsg(''), 4000);
                              }}
                              className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-xs rounded-xl border border-sky-300 transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isSendingTestDigest ? 'Sending...' : `✉️ Send Test Digest for ${childName}`}
                            </button>

                            {profilesList.length > 1 && (
                              <button
                                type="button"
                                disabled={isSendingTestDigest}
                                onClick={async () => {
                                  soundFx.playKeyTap();
                                  setIsSendingTestDigest(true);
                                  setDigestStatusMsg('');
                                  const allProfs = storageService.getAllProfiles();
                                  const res = await communicationsService.sendAllWeeklyDigests({
                                    email: authService.getAuthState().email,
                                    profiles: allProfs,
                                    subjectsConfig: SUBJECTS_CONFIG
                                  });
                                  setIsSendingTestDigest(false);
                                  if (res.success) {
                                    soundFx.playVictory();
                                    setDigestStatusMsg(`Dispatched ${res.totalSent} individual weekly digests for all profiles!`);
                                  } else {
                                    soundFx.playIncorrect();
                                    setDigestStatusMsg(res.error || 'Failed to dispatch digests.');
                                  }
                                  setTimeout(() => setDigestStatusMsg(''), 4000);
                                }}
                                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {isSendingTestDigest ? 'Sending All...' : `✉️ Send For All (${profilesList.length}) Profiles`}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {digestStatusMsg && (
                        <p className="text-xs font-extrabold text-purple-700 animate-pop">
                          {digestStatusMsg}
                        </p>
                      )}

                      {/* Interactive Preview Drawer */}
                      {showWeeklyPreview && (() => {
                        const currentProf = storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
                        const digest = generateWeeklyDigestData(currentProf, SUBJECTS_CONFIG);

                        return (
                          <div className="bg-slate-50 border border-purple-200 rounded-xl p-3 space-y-3 animate-pop text-left">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <span>🐾 🏔️</span> Summary Preview for {digest.childName} ({digest.childGrade})
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                Streak: {digest.streak}d · {digest.totalProblemsThisWeek} items this week
                              </span>
                            </div>

                            <div className="space-y-2">
                              {digest.subjects.map((sub) => (
                                <div key={sub.subjectId} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                      <span>{sub.icon}</span> {sub.name} Progress
                                    </span>
                                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                      Rating: {sub.rating} ({sub.rankTitle})
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs font-medium text-slate-600">
                                    <div>Solved: <strong>{sub.solvedThisWeek}</strong> ({sub.totalSolved} total)</div>
                                    <div>Accuracy: <strong>{sub.accuracyPct !== null ? `${sub.accuracyPct}%` : '—'}</strong></div>
                                    <div>Avg Latency: <strong>{sub.avgLatencySec !== null ? `${sub.avgLatencySec}s` : '—'}</strong></div>
                                    <div>Tier: <strong>Tier {sub.tier}</strong></div>
                                  </div>

                                  {/* Played Topics Pill List */}
                                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                                    <strong className="block text-slate-800 text-xs uppercase">
                                      All Topics Played ({sub.allPlayedTopics.length}):
                                    </strong>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {sub.allPlayedTopics.map((t) => (
                                        <span
                                          key={t.id || t.name}
                                          className={`px-1.5 py-0.5 rounded-md text-xs font-extrabold border ${
                                            t.status === 'Mastered'
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                              : (t.status === 'Needs Review' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-purple-50 text-purple-800 border-purple-200')
                                          }`}
                                        >
                                          {t.status === 'Mastered' ? '✅' : '🎯'} {t.name} {t.accuracyPct !== null ? `(${t.accuracyPct}%)` : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {digest.unstartedSubjects.length > 0 && (
                                <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-xs text-sky-900">
                                  <strong>🌟 Unstarted Subjects:</strong> {digest.unstartedSubjects.map(s => s.name).join(', ')} — included in email with invite to begin climb!
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Struggle / Target Fact Alerts */}
                <div className="flex flex-col bg-white border border-slate-200 p-2.5 rounded-xl gap-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Struggle & Review Alerts</span>
                      <span className="text-xs text-slate-500 font-medium">Real-time alerts when accuracy drops or frustration triggers</span>
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
                    <p className="text-xs text-purple-900 font-medium bg-purple-50/80 p-2 rounded-lg border border-purple-200 mt-1 leading-snug">
                      🛡️ <strong>Child-Safe Privacy:</strong> Displayed exclusively inside <strong>🔒 Parent Zone Dashboard</strong> (never shown on child's screen!).<br />
                      ⚠️ <strong>Triggers:</strong> Accuracy &lt; 65%, 3+ consecutive misses, or frustration triggers with actionable review tips.
                    </p>
                  )}
                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB 3: VERIFICATION & CONTROLS */}
        {activeTab === 'verification' && (
          <div className="flex-1 space-y-4 my-1">

            {/* Verification Scope Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-left space-y-1">
              <div className="flex items-center gap-2 text-purple-900">
                <ShieldCheck className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-purple-950">Verification & Controls</h4>
              </div>
              <p className="text-xs text-purple-800 leading-snug">
                Manage how parent verification is enforced across the app, including biometric authentication, dynamic challenges, and real-money purchase permissions.
              </p>
            </div>

            {/* In-App Purchases & Real-Money Security */}
            <div
              ref={realMoneySectionRef}
              className={`border-2 rounded-2xl p-3.5 space-y-3 text-left transition-all duration-300 ${
                highlightSection === 'real_money_purchases'
                  ? 'bg-purple-50/90 border-purple-500 ring-4 ring-purple-400/40 shadow-xl scale-[1.01]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">In-App Purchase Verification</h4>
                </div>
                {highlightSection === 'real_money_purchases' && (
                  <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                    Enable Here
                  </span>
                )}
              </div>

              <div className="flex flex-col bg-white border border-slate-200 p-3 rounded-xl gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">Allow Real-Money Purchases</span>
                    <span className="text-xs text-slate-500 font-medium">Allow kids to buy Sparks with real money</span>
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
                  <p className="text-xs text-amber-900 font-medium bg-amber-50/80 p-2 rounded-lg border border-amber-200 mt-1 leading-snug">
                    ⚠️ <strong>Note:</strong> Biometric verification or dynamic challenges will be required before any actual payment can be processed.
                  </p>
                )}
              </div>
            </div>

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
                      {authService.getAuthState().isAnonymous 
                        ? '☁️ Anonymous Guest Account' 
                        : `✅ Account Linked (${(() => {
                            const p = authService.getAuthState().provider || authService.getAuthState().authProvider || '';
                            if (p.includes('google')) return 'Google';
                            if (p.includes('apple')) return 'Apple';
                            return 'Email';
                          })()})`}
                    </span>
                    {authService.getAuthState().isAnonymous && (
                      <span className="text-xs text-slate-500 font-medium block">
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
                          <p className="text-xs font-bold text-amber-900">Are you sure you want to unlink your account? Your local progress will remain on this device, but it will no longer sync to the cloud. You will also permanently lose access to any real-money purchases on this device if local data is cleared.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                soundFx.playKeyTap();
                                await authService.unlinkAccount();
                                setLiveUserData(storageService.getUserData(activeSubject));
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
          setLiveUserData(storageService.getUserData(activeSubject));
          if (onAccountLinked) onAccountLinked(user, newSparks);
        }}
      />
    </div>
  );
}
