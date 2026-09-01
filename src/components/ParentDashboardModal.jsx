import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Key, Settings, Layers, Flame, Zap, CheckCircle2, AlertCircle, Calendar, Target, Bell, Clock, Sparkles, Award, RotateCcw, Trophy, ArrowLeft, Users, Cloud, Plus, Download, Trash2, Unplug, Fingerprint, BarChart3, Star, Compass, Lock } from 'lucide-react';
import { CURRICULUM_TIERS, getTierFromRating, GRADE_STARTING_RATINGS } from '../utils/mathCurriculum';
import { WORDS_CURRICULUM_TIERS } from '../utils/wordsCurriculum';
import { BADGES_CATALOG } from '../data/badges';
import { soundFx } from '../utils/audio';
import { pluralize, formatTime } from '../utils/formatters';
import { getNotificationPrefs, saveNotificationPrefs, saveProfileReminderPrefs, requestNotificationPermission } from '../utils/notifications';
import { promptForPushPermissions } from '../config/onesignal';
import { calculateDomainMastery, calculateAdaptiveCompetenceProfile } from '../utils/domainStats';
import { calculateConceptBreakdown, generateParentInsightCards } from '../utils/skipDiagnosticEngine';
import { getCompetenceRankTier, getCompetenceDescription } from '../utils/GameEconomyModel';
import { getGradeLevelForSubject } from '../utils/SkillTreeConfig';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { communicationsService } from '../services/communicationsService';
import { questService } from '../services/questService';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { generateWeeklyDigestData, formatWeeklyDigestText } from '../utils/weeklyDigest';
import { requestAppReview } from '../utils/AppReview';
import AccountLinkModal from './AccountLinkModal';
import FamilyPlanUpgradeModal from './FamilyPlanUpgradeModal';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import { parentChildService } from '../services/parentChildService';
import { validateSafeChildUsername } from '../utils/safeNames';

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
  onAccountLinked,
  onOpenSubscription,
  onOpenFamilyUpgrade,
  onOpenWorkshop,
  onBack,
  renderFooter
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

  const [showWeeklyPreview, setShowWeeklyPreview] = useState(false);
  const [isSendingTestDigest, setIsSendingTestDigest] = useState(false);
  const [digestStatusMsg, setDigestStatusMsg] = useState('');
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [subActionMsg, setSubActionMsg] = useState('');
  const [subRefreshKey, setSubRefreshKey] = useState(0);

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
  const [activeHighlight, setActiveHighlight] = useState(highlightSection);
  const realMoneySectionRef = useRef(null);
  const familyPlanSectionRef = useRef(null);

  useEffect(() => {
    setActiveHighlight(highlightSection);
  }, [highlightSection]);

  useEffect(() => {
    if (isOpen && activeTab === 'verification') {
      if (activeHighlight === 'real_money_purchases' && realMoneySectionRef.current) {
        setTimeout(() => {
          realMoneySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if ((activeHighlight === 'family_plan' || activeHighlight === 'upgrade_plan') && familyPlanSectionRef.current) {
        setTimeout(() => {
          familyPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [isOpen, activeTab, activeHighlight]);

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
  const [editProfileError, setEditProfileError] = useState('');
  const [showFamilyUpgradeModal, setShowFamilyUpgradeModal] = useState(false);

  // Data Privacy Confirmation States
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [coppaStatus, setCoppaStatus] = useState(() => parentChildService.getCOPPAConsentStatus());
  const [showRevokeConsentConfirm, setShowRevokeConsentConfirm] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);

  const handleSwitchProfile = (pId) => {
    soundFx.playKeyTap();
    if (storageService.isProfileLocked(pId)) {
      setActiveTab('verification');
      setActiveHighlight('family_plan');
      return;
    }
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
    setEditProfileError('');
    setShowEditProfile((prev) => !prev);
  };

  const handleSaveEditProfile = (e) => {
    e.preventDefault();
    const error = validateSafeChildUsername(editChildName);
    if (error) {
      setEditProfileError(error);
      return;
    }
    soundFx.playVictory();
    storageService.updateProfile(viewingProfileId, { name: editChildName.trim() });
    setProfilesList(storageService.getAllProfiles());
    setLiveUserData(getProfileSubjectData(viewingProfileId, selectedSubject));
    setEditProfileError('');
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

  const [ratingPromptDismissed, setRatingPromptDismissed] = useState(false);
  const [appRatingStatus, setAppRatingStatus] = useState(() => storageService.getAppRatingStatus());

  const handleDismissRatingPrompt = () => {
    soundFx.playKeyTap();
    setRatingPromptDismissed(true);
    storageService.dismissAppRatingPrompt();
    setAppRatingStatus(storageService.getAppRatingStatus());
  };

  const handleRequestRating = async () => {
    soundFx.playVictory();
    setRatingPromptDismissed(true);
    storageService.setAppRated(true);
    setAppRatingStatus(storageService.getAppRatingStatus());
    await requestAppReview();
  };

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
      promptForPushPermissions();
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

  const handleClose = () => {
    soundFx.playKeyTap();
    if (onBack) {
      onBack();
    } else if (onClose) {
      onClose();
    }
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 w-vw h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-purple-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-purple-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-purple-800">
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Viewing Child Profile</span>
            </div>
            
            {/* Child-level Global Badges: Streak & Quest Level */}
            {(() => {
              const currentProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getProfileById(viewingProfileId) || storageService.getActiveProfile();
              const profileStreak = currentProf.userData?.streak ?? 0;
              const questState = questService.getQuests(viewingProfileId);
              const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer', icon: '🏕️', ascentTier: 1, ascentMode: { name: 'Sunny Trailhead' } };
              const ascentTier = questLevelInfo.ascentTier || 1;
              const ascentName = questLevelInfo.ascentMode?.name || 'Sunny Trailhead';

              return (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shadow-xs" title={`Daily streak: ${profileStreak} days across all subjects`}>
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-950">{profileStreak}d</span>
                  </div>
                  <div 
                    className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg shadow-xs" 
                    title={`Quest Rank: Ascent ${ascentTier} (${ascentName}) • Level ${questLevelInfo.level} (${questLevelInfo.title}) • ${questState?.totalXp || 0} XP`}
                  >
                    <span className="text-xs">{questLevelInfo.icon || '🏕️'}</span>
                    <span className="text-xs font-black text-indigo-950">
                      Ascent {ascentTier} · Lv {questLevelInfo.level}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="text-xs font-extrabold text-slate-700 hover:text-purple-900 bg-slate-100 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
                  >
                    ✏️ {showEditProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Edit / Rename Active Profile Form */}
          {showEditProfile && (
            <form onSubmit={handleSaveEditProfile} className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-100 bg-purple-50/60 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                <span className="text-xs font-black text-purple-900 shrink-0">Rename:</span>
                <input
                  type="text"
                  value={editChildName}
                  onChange={(e) => setEditChildName(e.target.value)}
                  placeholder="Enter Child's Name (e.g. Leo)"
                  maxLength={20}
                  required
                  className="w-full min-w-0 px-2.5 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <button type="submit" className="btn-3d-purple px-3 py-1.5 text-xs rounded-xl font-black shrink-0 cursor-pointer">
                  Save Name
                </button>
                {profilesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(viewingProfileId)}
                    className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    title="Delete this profile"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                )}
              </div>
              {editProfileError && (
                <p className="w-full text-left text-xs font-bold text-rose-600 px-1 pt-1">
                  ⚠️ {editProfileError}
                </p>
              )}
            </form>
          )}

          {/* Profile Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none touch-pan-x">
            {profilesList.map((p) => {
              const isLocked = storageService.isProfileLocked(p.id);
              const isActive = p.id === viewingProfileId;
              const isMember = storageService.hasClubMembership(p.id);
              const subData = p.userData?.subjects?.[selectedSubject] || (selectedSubject === 'math' ? p.userData : {}) || {};
              const childRating = subData.adaptiveCompetenceRating || subData.competenceRank || p.userData?.adaptiveCompetenceRating || 1000;
              const displayGrade = getGradeLevelForSubject(childRating, selectedSubject);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchProfile(p.id)}
                  title={isLocked ? `${p.name || 'Child'} (Locked - Family Plan required)` : `${p.name || 'Child'}${isMember ? ' (Kibo Club Member)' : ''}`}
                  className={`px-3.5 py-1.5 rounded-full border-2 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isLocked
                      ? 'bg-slate-100 text-slate-400 border-slate-300 opacity-75 hover:opacity-100 hover:border-amber-400 hover:bg-amber-50/50'
                      : isActive
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {isLocked && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                  <span>{p.name || 'Child'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isLocked 
                      ? 'bg-amber-100 text-amber-800' 
                      : isActive 
                      ? 'bg-purple-800 text-purple-100' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isLocked ? '🔒 Upgrade' : displayGrade}
                  </span>
                  {isActive && !isLocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB SELECTOR HEADER */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-2 sm:pt-3 shrink-0">
        <div className="flex bg-slate-200/80 p-1 rounded-2xl font-extrabold text-xs sm:text-sm shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span className="truncate">
              <span className="hidden sm:inline">Child </span>Overview
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span className="truncate">
              <span className="hidden sm:inline">Schedule & Notifications</span>
              <span className="sm:hidden">Schedule</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span className="truncate">
              <span className="hidden sm:inline">Verification & Controls</span>
              <span className="sm:hidden">Controls</span>
            </span>
          </button>
        </div>
      </div>

      {/* SUBJECT SELECTOR BAR (PINNED TO FIXED TOP SECTION WHEN IN OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-2 shrink-0">
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-2 sm:p-2.5 shadow-xs text-left">
            <div className="flex items-center justify-between gap-2 mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5 text-purple-900">
                <Layers className="w-4 h-4 stroke-[2.5] text-purple-600" />
                <span className="text-xs font-black uppercase tracking-wider">Select Subject Focus</span>
              </div>
              <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <span>↔</span> Swipe to explore
              </span>
            </div>

            {/* Scrollable Subjects Container with Subtle Fade Hint on Mobile */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent touch-pan-x overscroll-x-contain">
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
                      className={`px-3 sm:px-3.5 py-1.5 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? (subKey === 'words' ? 'bg-teal-600 text-white border-teal-700 shadow-sm ring-2 ring-teal-400/30' : subKey === 'world' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/30' : subKey === 'coding' ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-400/30' : 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-400/30')
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                      aria-pressed={isSelected}
                      title={`Switch subject focus to ${subConfig.name || subKey}`}
                    >
                      <span className="text-sm">{subIcon}</span>
                      <span>{subConfig.name || subKey}</span>
                      <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? (subKey === 'words' ? 'bg-teal-800 text-teal-100' : subKey === 'world' ? 'bg-emerald-800 text-emerald-100' : subKey === 'coding' ? 'bg-rose-800 text-rose-100' : 'bg-purple-800 text-purple-100')
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {subRating}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent rounded-r-2xl sm:hidden" />
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 space-y-4 my-1">

            {/* KIBO CLUB MEMBERSHIP STATUS CARD */}
            {(() => {
              const hasFamily = storageService.hasFamilyPlan();
              const hasSingle = storageService.hasSinglePlan(viewingProfileId);
              const isSubscribed = hasFamily || hasSingle;

              return (
                <div className={`rounded-2xl p-4 border-2 shadow-sm text-left relative overflow-hidden transition-all ${
                  hasFamily
                    ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-300'
                    : hasSingle
                    ? 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-purple-300'
                    : 'bg-gradient-to-br from-amber-50 via-white to-orange-50/60 border-amber-200'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          hasFamily
                            ? 'bg-amber-500 text-white shadow-xs'
                            : hasSingle
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          <Sparkles className="w-3 h-3 fill-current" />
                          {hasFamily ? 'Kibo Club Family Plan' : hasSingle ? 'Kibo Club Member' : 'Kibo Club Membership'}
                        </span>
                        {isSubscribed && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                        {isSubscribed
                          ? '1.25x Spark Multiplier & VIP Club Perks Active'
                          : 'Accelerate learning with 1.25x Sparks & Multi-Profile Access'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-snug">
                        {hasFamily
                          ? 'All child profiles enjoy 1.25x Sparks, 15% VIP store discounts, 3.3x Daily Vault bonuses, golden tags, and multi-child tracking.'
                          : hasSingle
                          ? 'This profile receives 1.25x Sparks, 15% VIP store discounts, 3.3x Daily Vault bonuses, and golden tags. Upgrade to Family for up to 6 siblings!'
                          : 'Unlock 1.25x Sparks on all climbs, 15% VIP store discounts, 3.3x Daily Vault bonuses, up to 6 sibling profiles, and golden tags.'}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                      {!isSubscribed ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setActiveTab('verification');
                            setActiveHighlight('family_plan');
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-white" />
                          <span>View Membership Plans</span>
                        </button>
                      ) : !hasFamily ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setActiveTab('verification');
                            setActiveHighlight('family_plan');
                          }}
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white text-xs font-black rounded-xl shadow-sm transform active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Manage / Upgrade</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setActiveTab('verification');
                            setActiveHighlight('family_plan');
                          }}
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Manage Subscription</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

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

            {/* GLOBAL CLIMBER ASCENT & MULTI-SUBJECT BALANCE CARD */}
            {(() => {
              const questState = questService.getQuests(viewingProfileId);
              const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer', icon: '🏕️', ascentTier: 1, progressPct: 0, currentXp: 0, nextLevelXp: 150 };
              const dailySubjects = questService.getDailySubjectsCompleted(viewingProfileId);
              const isMultiClaimed = questService.isDailyMultiSubjectBonusClaimed(viewingProfileId);

              return (
                <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-200 rounded-2xl p-4 text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{questLevelInfo.icon || '🏕️'}</span>
                      <div>
                        <h3 className="text-sm font-black text-teal-950">
                          Global Climber Progression: Ascent {questLevelInfo.ascentTier} • Lv. {questLevelInfo.level}
                        </h3>
                        <span className="text-xs text-teal-700 font-bold">
                          {questLevelInfo.title} • {questState?.totalXp || 0}m Total Altitude XP
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-teal-600 text-white px-2.5 py-1 rounded-full shadow-2xs">
                      {questLevelInfo.progressPct || 0}% to Level {(questLevelInfo.level || 1) + 1}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-teal-200/80 rounded-full overflow-hidden border border-teal-300/50">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${questLevelInfo.progressPct || 0}%` }}
                    />
                  </div>

                  {/* Multi-Subject Daily Balance */}
                  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-1.5 pt-1 border-t border-teal-200/60 text-[11px] sm:text-xs font-black">
                    <div className="flex items-center gap-1 text-teal-900 truncate">
                      <span>🌟</span>
                      <span className="hidden sm:inline">Today's Exploration:</span>
                      <span className="font-extrabold text-teal-700 truncate">
                        {dailySubjects.length > 0 ? dailySubjects.map(s => (SUBJECTS_CONFIG[s]?.name || s)).join(', ') : 'No climbs yet today'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs shrink-0 whitespace-nowrap ${
                      isMultiClaimed || dailySubjects.length >= 2
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {isMultiClaimed
                        ? '✅ Bonus Claimed (+75 ⚡)'
                        : dailySubjects.length === 1
                        ? '1/2 subjects (play 1 more for +75 ⚡)'
                        : 'Play 2 subjects for +75 ⚡'}
                    </span>
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
              const gradeLvl = getGradeLevelForSubject(actualRating, selectedSubject);

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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                      <h2 className="text-sm font-black text-slate-800">Parent Diagnostic Insights ({subjectConfig.name})</h2>
                    </div>
                    <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-center">
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
                      {Object.values(conceptBreakdown).map((concept, idx) => {
                        const strand = Object.values(skillStrandBreakdown).find(s => s.id === concept.id) || skillStrandBreakdown[concept.name];
                        const isSkipped = strand?.status === 'Skipped' || (concept.total === 0 && strand?.status === 'Skipped');
                        const calculatedAcc = concept.total > 0 ? Math.round((concept.correct / concept.total) * 100) : (strand?.accuracy || 0);
                        const showAccuracy = strand?.status !== 'Skipped' && (concept.total > 0 || (strand?.accuracy && strand.accuracy > 0));

                        return (
                          <div key={concept.id ? `${concept.id}_${concept.name || idx}` : (concept.name || `concept_${idx}`)} className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 space-y-1.5">
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
                  <span className="hidden sm:inline-block text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-lg truncate max-w-[120px]">
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
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-extrabold text-xs text-slate-800 block">
                        Daily Streak Reminder for {childName}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md border border-purple-200">
                        🔔 Push Notification
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Sends a device push notification if daily practice is incomplete
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
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-extrabold text-xs text-slate-800 block">Weekly Progress Summary (Per Profile)</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-md border border-sky-200">
                          ✉️ Email Report
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Individual weekly mastery & topics digest emailed to parent account</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleNotifPref('weeklyDigestEnabled')}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        notifPrefs.weeklyDigestEnabled ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                      title="Toggle weekly progress summary"
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
                                Streak: {digest.streak}d · Quest Lvl {digest.questLevel || 1} ({digest.questTotalXp || 0} XP) · {digest.totalProblemsThisWeek} items this week
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-extrabold text-xs text-slate-800 block">Struggle & Review Alerts</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-300">
                          🔒 In-App Only
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Real-time alerts displayed in Parent Dashboard when accuracy drops</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleNotifPref('struggleAlertsEnabled')}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        notifPrefs.struggleAlertsEnabled ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                      title="Toggle struggle & review alerts"
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        notifPrefs.struggleAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  {notifPrefs.struggleAlertsEnabled && (
                    <p className="text-xs text-purple-900 font-medium bg-purple-50/80 p-2 rounded-lg border border-purple-200 mt-1 leading-snug">
                      🛡️ <strong>Child-Safe Privacy:</strong> Displayed exclusively inside <strong>🔒 Parent Zone Dashboard</strong> (never shown on child's screen and never sent over public notifications).<br />
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

            {/* Family Plan & Subscriptions Card */}
            {(() => {
              const currentPlan = storageService.getSubscriptionPlan();
              const hasFam = currentPlan?.tier === 'family';
              const hasSingle = currentPlan?.tier === 'single';
              const activeCycle = currentPlan?.cycle;
              const isHighlight = activeHighlight === 'family_plan' || activeHighlight === 'upgrade_plan';

              const isCurrentPlanIndividual = hasSingle && !hasFam && billingCycle === activeCycle;
              const isCurrentPlanFamily = hasFam && billingCycle === activeCycle;
              const isSwitchCycleIndividual = hasSingle && !hasFam && billingCycle !== activeCycle;
              const isSwitchCycleFamily = hasFam && billingCycle !== activeCycle;

              return (
                <div
                  ref={familyPlanSectionRef}
                  className={`border-2 rounded-2xl p-4 space-y-4 text-left transition-all duration-300 ${
                    isHighlight
                      ? 'bg-amber-50/90 border-amber-500 ring-4 ring-amber-400/40 shadow-xl scale-[1.01]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-600 w-full sm:w-auto">
                      <Sparkles className="w-5 h-5 stroke-[2.5]" />
                      <h4 className="font-extrabold text-sm text-slate-800">Kibo Club & Subscriptions</h4>
                    </div>

                    <div className="flex items-center justify-center w-full sm:w-auto">
                      {/* Monthly / Annual Toggle Switch */}
                      <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center gap-1 border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            billingCycle === 'monthly'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('annual')}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                            billingCycle === 'annual'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>Annual</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase font-black">
                            Save ~35%
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Choose or manage your membership below. Memberships unlock permanent 1.25x Spark multipliers, sibling profiles, golden tags, and 100% offline-ready practice.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Individual Plan Card */}
                    <div className={`bg-white border-2 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${
                      isCurrentPlanIndividual
                        ? 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-400/30'
                        : isSwitchCycleIndividual
                        ? 'border-purple-400 bg-purple-50/10 hover:border-purple-500 shadow-xs'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Single Profile
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {billingCycle === 'annual' ? '$39.99/yr' : '$4.99/mo'}
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900">Kibo Club Individual</h5>
                        <span className="text-[10px] text-purple-700 font-extrabold block">
                          {billingCycle === 'annual' ? 'Equivalent to $3.33/mo (Billed annually)' : 'Billed monthly • Cancel anytime'}
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600 font-bold">
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>1.25x Sparks & 15% VIP store discounts</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Daily Vault 3.3x bonus Sparks & shields</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Golden profile tag & summit gear</span>
                          </li>
                        </ul>
                      </div>

                      {isCurrentPlanIndividual ? (
                        <div className="w-full py-2 bg-purple-100 text-purple-900 font-black text-xs rounded-xl text-center border border-purple-200 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                          <span>Current Active Plan ({billingCycle === 'annual' ? 'Annual' : 'Monthly'})</span>
                        </div>
                      ) : isSwitchCycleIndividual ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (onOpenSubscription) {
                              onOpenSubscription(billingCycle === 'annual' ? 'kibo_club_sub_annual' : 'kibo_club_sub');
                            }
                          }}
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-white" />
                          <span>Switch to {billingCycle === 'annual' ? 'Annual ($39.99/yr)' : 'Monthly ($4.99/mo)'}</span>
                        </button>
                      ) : hasFam ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (onOpenSubscription) {
                              onOpenSubscription(billingCycle === 'annual' ? 'kibo_club_sub_annual' : 'kibo_club_sub');
                            }
                          }}
                          className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-xs rounded-xl border border-purple-200 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>Downgrade to Individual ({billingCycle === 'annual' ? '$39.99/yr' : '$4.99/mo'})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (onOpenSubscription) {
                              onOpenSubscription(billingCycle === 'annual' ? 'kibo_club_sub_annual' : 'kibo_club_sub');
                            }
                          }}
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transform active:scale-95 transition-all cursor-pointer"
                        >
                          Select Individual ({billingCycle === 'annual' ? '$39.99/yr' : '$4.99/mo'})
                        </button>
                      )}
                    </div>

                    {/* Family Plan Card */}
                    <div className={`bg-white border-2 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${
                      isCurrentPlanFamily
                        ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-400/30'
                        : isSwitchCycleFamily
                        ? 'border-amber-400 bg-amber-50/10 hover:border-amber-500 shadow-xs'
                        : 'border-amber-300 hover:border-amber-400 shadow-xs'
                    }`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                            ⭐️ Best For Families
                          </span>
                          <span className="text-sm font-black text-amber-950">
                            {billingCycle === 'annual' ? '$59.99/yr' : '$7.99/mo'}
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900">Kibo Club Family</h5>
                        <span className="text-[10px] text-amber-900 font-extrabold block">
                          {billingCycle === 'annual' ? 'Equivalent to $5.00/mo (Billed annually)' : 'Billed monthly • Cancel anytime'}
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600 font-bold">
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Up to 6 sibling profiles</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>1.25x Sparks & 15% VIP discounts for ALL</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Daily Vault 3.3x rewards & golden tags</span>
                          </li>
                        </ul>
                      </div>

                      {isCurrentPlanFamily ? (
                        <div className="w-full py-2 bg-amber-100 text-amber-900 font-black text-xs rounded-xl text-center border border-amber-200 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Current Active Plan ({billingCycle === 'annual' ? 'Annual' : 'Monthly'})</span>
                        </div>
                      ) : isSwitchCycleFamily ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (onOpenSubscription) {
                              onOpenSubscription(billingCycle === 'annual' ? 'kibo_club_family_annual' : 'kibo_club_family');
                            }
                          }}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-white" />
                          <span>Switch to {billingCycle === 'annual' ? 'Annual ($59.99/yr)' : 'Monthly ($7.99/mo)'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (onOpenSubscription) {
                              onOpenSubscription(billingCycle === 'annual' ? 'kibo_club_family_annual' : 'kibo_club_family');
                            }
                          }}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-white" />
                          <span>
                            {hasSingle
                              ? `Upgrade to Family (${billingCycle === 'annual' ? '$59.99/yr' : '$7.99/mo'})`
                              : `Select Family (${billingCycle === 'annual' ? '$59.99/yr' : '$7.99/mo'})`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancellation & Retention Notice */}
                  {currentPlan?.cancelAtPeriodEnd ? (
                    <div className="bg-amber-500/10 border border-amber-400/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-950">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-black text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Subscription Scheduled to Cancel</span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed">
                          Your membership will end on{' '}
                          <span className="font-bold text-slate-900">
                            {new Date(currentPlan.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          . Full perks and multipliers remain active until then with no further charges.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playKeyTap();
                          storageService.reactivateSubscription();
                          setSubActionMsg('Subscription resumed! Automatic renewal is re-enabled.');
                          setSubRefreshKey(k => k + 1);
                        }}
                        className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        Keep Membership
                      </button>
                    </div>
                  ) : (hasFam || hasSingle) ? (
                    <div className="pt-2 border-t border-slate-200/80">
                      {!showCancelSubConfirm ? (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Auto-renews at end of period. Need to stop renewal?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playKeyTap();
                              setShowCancelSubConfirm(true);
                            }}
                            className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                          >
                            Cancel Membership
                          </button>
                        </div>
                      ) : (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 font-black text-rose-900">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Confirm Subscription Cancellation</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            Per our Terms of Service, cancellations take effect at the conclusion of your active billing period ({currentPlan.currentPeriodEnd ? new Date(currentPlan.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'current cycle'}). <strong>No prorated cash returns are issued for partial periods.</strong> You retain full VIP access until that date.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playKeyTap();
                                storageService.cancelSubscription(true);
                                setShowCancelSubConfirm(false);
                                setSubActionMsg('Membership scheduled to cancel at period end. Access remains active.');
                                setSubRefreshKey(k => k + 1);
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              Confirm Cancellation
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playKeyTap();
                                setShowCancelSubConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-transform active:scale-95 cursor-pointer"
                            >
                              Never Mind
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {subActionMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{subActionMsg}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* In-App Purchases & Real-Money Security */}
            <div
              ref={realMoneySectionRef}
              className={`border-2 rounded-2xl p-3.5 space-y-3 text-left transition-all duration-300 ${
                activeHighlight === 'real_money_purchases'
                  ? 'bg-purple-50/90 border-purple-500 ring-4 ring-purple-400/40 shadow-xl scale-[1.01]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">In-App Purchase Verification</h4>
                </div>
                {activeHighlight === 'real_money_purchases' && (
                  <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                    Enable Here
                  </span>
                )}
              </div>

              <div className="flex flex-col bg-white border border-slate-200 p-3 rounded-xl gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">Allow Real-Money Purchases</span>
                    <span className="text-xs text-slate-500 font-medium">Allow kids to buy Sparks and items with real money</span>
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
                  <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 mt-1 text-xs space-y-2">
                    <p className="text-amber-900 font-medium leading-snug">
                      ⚠️ <strong>Note:</strong> Biometric verification or dynamic challenges will be required before any actual payment can be processed.
                    </p>
                    {onOpenWorkshop && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playKeyTap();
                          onClose();
                          onOpenWorkshop('sparks', 'shop');
                        }}
                        className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Return to Sparks & Club Shop</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COPPA Parental Rights & Data Privacy Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <h4 className="font-extrabold text-sm text-slate-800">COPPA Parental Rights & Data Privacy</h4>
                </div>
                <button
                  type="button"
                  onClick={() => { soundFx.playKeyTap(); setShowPrivacyPolicyModal(true); }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </button>
              </div>

              {/* Consent Status Badge */}
              <div className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${
                coppaStatus?.consented
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5">
                    {coppaStatus?.consented ? '✅ Verifiable Parental Consent Active' : '⚠️ Parental Consent Inactive / Revoked'}
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/70">
                    COPPA Compliant
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {coppaStatus?.consented
                    ? `Consent granted on ${coppaStatus.consentedAt ? new Date(coppaStatus.consentedAt).toLocaleDateString() : 'initial setup'} via adult verification.`
                    : 'Personal data synchronization is restricted. Practice operates in local offline mode only.'}
                </p>
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
                    <span className="text-xs text-slate-500 font-medium block">
                      {authService.getAuthState().isAnonymous
                        ? 'Link with Google, Apple, or Email to back up progress across devices'
                        : 'Cloud backup active with parent authentication'}
                    </span>
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
                  {/* Parental Review & Data Export */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        soundFx.playKeyTap();
                        authService.exportUserData();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-purple-600" />
                      <span>Review & Export Child Data (JSON)</span>
                    </button>
                    <span className="text-[10px] text-slate-400 block px-1">
                      Download all practice answers, streaks, mastery ratings, and friend codes.
                    </span>
                  </div>

                  {/* Revoke Consent Control */}
                  {coppaStatus?.consented && (
                    <div className="pt-1">
                      {!showRevokeConsentConfirm ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowRevokeConsentConfirm(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs transition-colors text-left border border-amber-200 cursor-pointer"
                        >
                          <Unplug className="w-4 h-4 text-amber-600" />
                          <span>Revoke Parental Consent</span>
                        </button>
                      ) : (
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 space-y-2 text-left">
                          <p className="text-xs font-bold text-amber-900">
                            Revoking parental consent will immediately stop cloud data synchronization, disconnect linked parent accounts, and purge remote child records under COPPA. Local progress will remain on this device only.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                soundFx.playKeyTap();
                                await parentChildService.revokeParentalConsent();
                                setCoppaStatus(parentChildService.getCOPPAConsentStatus());
                                setShowRevokeConsentConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                            >
                              Confirm Revoke Consent
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playKeyTap();
                                setShowRevokeConsentConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!authService.getAuthState().isAnonymous && (
                    <>
                      {!showUnlinkConfirm ? (
                        <button
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowUnlinkConfirm(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors text-left"
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

                  {/* Permanent Account & Data Deletion */}
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete Account & Child Data</span>
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

            {/* App Rating & Feedback Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-purple-700">
                <Star className="w-5 h-5 stroke-[2.5]" />
                <h4 className="font-extrabold text-sm text-slate-800">Support & Feedback</h4>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-800 block">Loving Kibo Climb?</span>
                  <p className="text-xs text-slate-500 font-medium">
                    Your rating helps us keep building wholesome, ad-free learning games for kids.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestRating}
                  className="btn-3d-purple px-3.5 py-1.5 text-xs rounded-xl font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{appRatingStatus?.hasRated ? 'Rate Again' : 'Rate App'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => setShowAccountLinkModal(false)}
        onOpenFamilyPlan={(targetTab = 'verification', targetHighlight = 'family_plan') => {
          setShowAccountLinkModal(false);
          setActiveTab(targetTab);
          setActiveHighlight(targetHighlight);
        }}
        milestoneName="Parent Zone Request"
        onAccountLinked={(user, newSparks) => {
          setShowAccountLinkModal(false);
          setLiveUserData(storageService.getUserData(activeSubject));
          if (onAccountLinked) onAccountLinked(user, newSparks);
        }}
      />

      {/* Family Plan Upgrade Modal */}
      <FamilyPlanUpgradeModal
        isOpen={showFamilyUpgradeModal}
        onClose={() => setShowFamilyUpgradeModal(false)}
        onOpenParentZone={(targetTab = 'verification', targetHighlight = 'family_plan') => {
          setShowFamilyUpgradeModal(false);
          setActiveTab(targetTab);
          setActiveHighlight(targetHighlight);
        }}
      />

      {/* COPPA Privacy Policy Modal */}
      {showPrivacyPolicyModal && (
        <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicyModal(false)} />
      )}

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
