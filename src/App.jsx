import React, { useState, useEffect, useRef } from 'react';
import { Flame, Settings, Trophy, Crown, Zap, ArrowLeft, ShoppingBag, Sparkles, Award, Info, X, Lock, ShieldCheck, Users, Mountain, ChevronDown, Star, Scroll, WifiOff, Compass, LogIn, LogOut, Gift, Share2, Cloud, Check, Loader2 } from 'lucide-react';
import Mascot from './components/Mascot';
import { initOneSignal } from './config/onesignal';

import ConfettiCanvas from './components/ConfettiCanvas';
import WorkshopModal from './components/WorkshopModal';
import PinGateModal from './components/PinGateModal';
import ParentDashboardModal from './components/ParentDashboardModal';
import StreakSavedModal from './components/StreakSavedModal';
import DailyStreakIncreasedModal from './components/DailyStreakIncreasedModal';
import PerfectMonthProgressModal from './components/PerfectMonthProgressModal';
import FirstLaunchOnboardingModal from './components/FirstLaunchOnboardingModal';
import ProfileSelectorScreen from './components/ProfileSelectorScreen';
import MathSessionView from './components/MathSessionView';
import WordsSessionView from './components/WordsSessionView';
import WorldSessionView from './components/WorldSessionView';
import CodingSessionView from './components/CodingSessionView';
import BadgesModal from './components/BadgesModal';
import AscentRoadmapModal from './components/AscentRoadmapModal';
import DevControlPanel from './components/DevControlPanel';
import RollingNumberTicker from './components/RollingNumberTicker';
import { checkAndPromptLinkAccount } from './utils/linkPromptLogic';
import { useDevState } from './hooks/useDevState';
import { evaluateBadges } from './utils/badgeManager';
import { BADGES_CATALOG } from './data/badges';
import { CURRICULUM_TIERS } from './utils/mathCurriculum';
import { getItemById, getItemSlot, getEffectiveSubscriptionPricing, getEffectiveSparksPackage } from './utils/itemsCatalog';
import { soundFx } from './utils/audio';
import { BRAND_CONFIG } from './config/brand';
import { pluralize } from './utils/formatters';
import { storageService } from './services/storageService';
import { questService } from './services/questService';
import { getCompetenceRankTier } from './utils/GameEconomyModel';
import {
  getTodayStr,
  getYesterdayStr,
  calculateStreakFromHistory,
  getCurrentTimezone,
  isWithinTravelGracePeriod
} from './utils/dateUtils';
import { authService } from './services/authService';
import { syncService } from './services/syncService';
import { userSyncService } from './services/userSyncService';
import { shopLedgerService } from './services/shopLedgerService';
import { leaderboardService } from './services/leaderboardService';
import { analyticsService } from './services/analyticsService';
import AccountLinkModal from './components/AccountLinkModal';
import { getNotificationPrefs, scheduleAllProfileReminders, updateAppBadge } from './utils/notifications';
import MockCheckoutModal from './components/MockCheckoutModal';
import StripeCheckoutModal from './components/StripeCheckoutModal';
import FamilyPlanUpgradeModal from './components/FamilyPlanUpgradeModal';
import DailyBonusRewardModal from './components/DailyBonusRewardModal';
import SettingsScreen from './components/SettingsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import ShareModal from './components/ShareModal';
import ReferralRewardModal from './components/ReferralRewardModal';
import NewsModal from './components/NewsModal';
import { getNewsItems } from './utils/newsManager';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './config/firebase';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import LeaderboardIcon from './components/LeaderboardIcon';
import LeaderboardScreen from './components/LeaderboardScreen';
import QuestsScreen from './components/QuestsScreen';
import FeedbackModal from './components/FeedbackModal';
import AddFriendModal from './components/AddFriendModal';
import SubjectWallpaper from './components/SubjectWallpaper';
import CinematicSplash from './components/CinematicSplash';
import { setHapticsEnabled } from './utils/audio';
import { navigationHistory, VIEWS, VIEW_TYPES, getPathForId, SUBJECT_ROUTES } from './utils/navigationHistory';
import { updateDocumentSeo } from './utils/seoMetadata';

export default function App() {
  // App State: 'adaptive_session' | 'settings' | 'privacy' | 'terms' | 'leaderboard'
  const [activeProfileId, setActiveProfileId] = useState(() => {
    return storageService.getActiveProfileId();
  });
  const [activeSubject, setActiveSubject] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      if (['math', 'words', 'world', 'coding'].includes(path)) {
        return path;
      }
      try {
        const params = new URLSearchParams(window.location.search || '');
        const sub = params.get('subject');
        if (sub && ['math', 'words', 'world', 'coding'].includes(sub)) {
          return sub;
        }
      } catch (e) {}
    }
    return storageService.getLastActiveSubject();
  });

  const [showCinematicSplash, setShowCinematicSplash] = useState(() => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test') {
        return false;
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return !window.sessionStorage.getItem('kibo_splash_shown');
      }
    } catch (e) {
      // Fallback
    }
    return true;
  });

  useEffect(() => {
    initOneSignal();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('kibo_splash_shown', 'true');
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [appState, setAppState] = useState(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path === '/privacy' || path === '/privacy/') return 'privacy';
    if (path === '/terms' || path === '/terms/') return 'terms';
    if (path === '/settings' || path === '/settings/') return 'settings';
    if (path === '/leaderboard' || path === '/leaderboard/') return 'leaderboard';
    if (path === '/quests' || path === '/quests/') return 'quests';
    if (path === '/parent' || path === '/parent/' || path === '/parents' || path === '/parents/' || path === '/parent-dashboard' || path === '/parent-dashboard/') return 'parent_dashboard';
    return 'adaptive_session';
  });

  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [workshopHub, setWorkshopHub] = useState('wearables');
  const [workshopViewMode, setWorkshopViewMode] = useState('shop');

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSpeedInfoModal, setShowSpeedInfoModal] = useState(false);
  const [showPinGateModal, setShowPinGateModal] = useState(false);
  const [pinGateSource, setPinGateSource] = useState(null);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [parentDashboardTab, setParentDashboardTab] = useState('overview');
  const [parentDashboardHighlight, setParentDashboardHighlight] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingReward, setPendingReward] = useState(null);
  const profileDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
        setShowSavedTooltip(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setShowSubjectDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [pendingSparksPurchase, setPendingSparksPurchase] = useState(null);
  const [showMockCheckoutModal, setShowMockCheckoutModal] = useState(false);
  const [showStripeCheckoutModal, setShowStripeCheckoutModal] = useState(false);
  const [showFamilyUpgradeModal, setShowFamilyUpgradeModal] = useState(false);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState(false);
  const [showStreakSavedModal, setShowStreakSavedModal] = useState(false);
  const [showDailyStreakIncreasedModal, setShowDailyStreakIncreasedModal] = useState(false);
  const [showMultiSubjectBonusModal, setShowMultiSubjectBonusModal] = useState(false);
  const [multiSubjectBonusData, setMultiSubjectBonusData] = useState(null);
  const [globalAscentLevelUpEvent, setGlobalAscentLevelUpEvent] = useState(null);
  const [perfectMonthData, setPerfectMonthData] = useState(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showAscentRoadmapModal, setShowAscentRoadmapModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(() => storageService.getFriends(activeProfileId).length);
  const [pendingFriendRequestsCount, setPendingFriendRequestsCount] = useState(() =>
    storageService.getFriendRequests(activeProfileId).filter(r => r.type === 'received').length
  );
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [linkModalMilestone, setLinkModalMilestone] = useState('Milestone');
  const [currentAuthState, setCurrentAuthState] = useState(() => authService.getAuthState());
  const [syncStatus, setSyncStatus] = useState('synced');
  const [showSavedTooltip, setShowSavedTooltip] = useState(false);

  useEffect(() => {
    const unsubAuth = authService.subscribeAuthState?.((user) => {
      setCurrentAuthState(authService.getAuthState());
    });
    const unsubSync = userSyncService.subscribeSyncStatus?.((status) => {
      if (status === 'syncing') {
        setSyncStatus('syncing');
      } else if (status === 'synced') {
        setSyncStatus('pulse');
        const timer = setTimeout(() => {
          setSyncStatus('synced');
        }, 1000);
        return () => clearTimeout(timer);
      }
    });
    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubSync) unsubSync();
    };
  }, []);

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    return storageService.getUserData(activeSubject).unlockedBadges || [];
  });
  const [seenBadges, setSeenBadges] = useState(() => {
    return storageService.getSeenBadges(activeProfileId);
  });
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState([]);
  const [highlightBadgeIds, setHighlightBadgeIds] = useState([]);

  const unseenBadgesCount = (unlockedBadges || []).filter(
    (b) => !seenBadges.includes(typeof b === 'string' ? b : b?.id)
  ).length;

  useEffect(() => {
    const activeUserData = storageService.getUserData(activeSubject);
    const evalRes = evaluateBadges({ ...activeUserData, subjectId: activeSubject });
    if (evalRes?.updatedUnlocked) {
      setUnlockedBadges(evalRes.updatedUnlocked);
    }
  }, [activeSubject]);

  // Synchronize dynamic SEO meta tags and canonical URLs on route or subject change
  useEffect(() => {
    updateDocumentSeo({ route: appState, subject: activeSubject });
  }, [appState, activeSubject]);

  // Sync outstanding alerts & notifications to mobile home screen app badge
  useEffect(() => {
    const unclaimedQuests = questService.getUnclaimedCount(activeProfileId) || 0;
    const pendingFriendReqs = pendingFriendRequestsCount || 0;
    const unseenBadges = unseenBadgesCount || 0;
    const totalOutstanding = unclaimedQuests + pendingFriendReqs + unseenBadges;

    updateAppBadge(totalOutstanding);
  }, [activeProfileId, pendingFriendRequestsCount, unseenBadgesCount]);

  // First-Time User Onboarding Modal State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsItems, setNewsItems] = useState([]);

  const [showFirstLaunchOnboardingModal, setShowFirstLaunchOnboardingModal] = useState(() => {
    return !storageService.isOnboarded();
  });

  const [showProfileSelector, setShowProfileSelector] = useState(() => {
    return storageService.isOnboarded() && (storageService.getAllProfiles().length >= 2);
  });

  const [showManualProfileSwitcher, setShowManualProfileSwitcher] = useState(false);

  const applyNavState = (current, stack, baseRoute) => {
    if (!current) return;
    const targetRoute = baseRoute?.id || 'adaptive_session';
    setAppState(targetRoute);

    if (current.type === VIEW_TYPES.MODAL) {
      const modalId = current.id;
      const params = current.params || {};

      setIsWorkshopOpen(modalId === VIEWS.WORKSHOP);
      if (modalId === VIEWS.WORKSHOP) {
        if (params.hub) setWorkshopHub(params.hub);
        if (params.viewMode) setWorkshopViewMode(params.viewMode);
      }

      setShowBadgesModal(modalId === VIEWS.BADGES);
      if (modalId === VIEWS.BADGES) {
        if (params.highlightBadgeIds) {
          setHighlightBadgeIds(params.highlightBadgeIds);
        } else {
          setHighlightBadgeIds([]);
        }
      }
      setShowAscentRoadmapModal(modalId === VIEWS.ASCENT_ROADMAP);

      setShowPinGateModal(modalId === VIEWS.PIN_GATE);
      if (modalId === VIEWS.PIN_GATE) {
        if (params.source) setPinGateSource(params.source);
      }

      setShowManualProfileSwitcher(modalId === VIEWS.PROFILE_SWITCHER);
      setShowFeedbackModal(modalId === VIEWS.FEEDBACK);
      setShowNewsModal(modalId === VIEWS.NEWS);
      setShowFriendsModal(modalId === VIEWS.FRIENDS);
      setShowFamilyUpgradeModal(modalId === VIEWS.FAMILY_UPGRADE);
      setShowAccountLinkModal(modalId === VIEWS.ACCOUNT_LINK);
      if (modalId === VIEWS.ACCOUNT_LINK && params.milestone) {
        setLinkModalMilestone(params.milestone);
      }
      setShowMockCheckoutModal(modalId === VIEWS.MOCK_CHECKOUT);
      setShowStripeCheckoutModal(modalId === VIEWS.STRIPE_CHECKOUT);
      setShowShareModal(modalId === VIEWS.SHARE);
    } else {
      setIsWorkshopOpen(false);
      setShowBadgesModal(false);
      setShowAscentRoadmapModal(false);
      setShowPinGateModal(false);
      setShowManualProfileSwitcher(false);
      setShowFeedbackModal(false);
      setShowNewsModal(false);
      setShowFriendsModal(false);
      setShowFamilyUpgradeModal(false);
      setShowAccountLinkModal(false);
      setShowMockCheckoutModal(false);
      setShowStripeCheckoutModal(false);
      setShowShareModal(false);

      if (current.id === VIEWS.PARENT_DASHBOARD || current.id === 'parent_dashboard') {
        const params = current.params || {};
        if (params.tab) setParentDashboardTab(params.tab);
        if (params.highlight !== undefined) setParentDashboardHighlight(params.highlight);
      }

      if (typeof window !== 'undefined' && window.location.pathname !== current.path) {
        window.history.pushState({}, '', current.path);
      }

      let screenName = 'Home';
      if (current.id === 'settings') screenName = 'Settings';
      else if (current.id === 'privacy') screenName = 'PrivacyPolicy';
      else if (current.id === 'terms') screenName = 'TermsOfService';
      else if (current.id === 'leaderboard') screenName = 'Leaderboard';
      else if (current.id === 'quests') screenName = 'Quests';
      else if (current.id === 'parent_dashboard' || current.id === VIEWS.PARENT_DASHBOARD) screenName = 'ParentDashboard';
      else if (current.id === VIEWS.ADAPTIVE_SESSION || current.id === 'adaptive_session') {
        const sub = current.params?.subject || activeSubject || 'math';
        screenName = `Climb_${sub.charAt(0).toUpperCase() + sub.slice(1)}`;
      }
      analyticsService?.logScreenView?.(screenName);
    }
  };

  const handleGoBack = () => {
    soundFx.playKeyTap();
    const prevCurrent = navigationHistory.getCurrent();
    const nextEntry = navigationHistory.pop();
    const stack = navigationHistory.getStack();
    const baseRoute = navigationHistory.getBaseRoute();

    // If navigating back to parent dashboard from a child-accessible modal, require PIN verification
    if (
      (nextEntry?.id === VIEWS.PARENT_DASHBOARD || baseRoute?.id === VIEWS.PARENT_DASHBOARD) &&
      prevCurrent?.id !== VIEWS.PIN_GATE &&
      prevCurrent?.id !== VIEWS.PARENT_DASHBOARD
    ) {
      applyNavState(nextEntry, stack, baseRoute);
      const targetTab = nextEntry?.params?.tab || parentDashboardTab || 'overview';
      const targetHighlight = nextEntry?.params?.highlight || parentDashboardHighlight || null;
      handleOpenPinGate('back_navigation', targetTab, targetHighlight);
      return;
    }

    applyNavState(nextEntry, stack, baseRoute);
  };

  const handleNavigateTo = (path, stateName) => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);
    const entry = navigationHistory.push({
      type: VIEW_TYPES.ROUTE,
      id: stateName || VIEWS.ADAPTIVE_SESSION,
      path: path || getPathForId(stateName || VIEWS.ADAPTIVE_SESSION)
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const handleOpenWorkshop = (overrideOrigin = null, initialHubParam = 'wearables', initialViewModeParam = 'shop') => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);
    const entry = navigationHistory.push({
      type: VIEW_TYPES.MODAL,
      id: VIEWS.WORKSHOP,
      params: { hub: initialHubParam, viewMode: initialViewModeParam }
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
  };

  const handleCloseWorkshop = () => {
    handleGoBack();
  };

  const handleOpenBadgesModal = (badgeHighlightOptions = null) => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);

    let badgesToHighlight = [];
    if (Array.isArray(badgeHighlightOptions)) {
      badgesToHighlight = badgeHighlightOptions;
    } else if (badgeHighlightOptions && Array.isArray(badgeHighlightOptions.highlightBadgeIds)) {
      badgesToHighlight = badgeHighlightOptions.highlightBadgeIds;
    } else {
      const currentSeen = storageService.getSeenBadges(activeProfileId) || [];
      const currentUnlockedIds = (unlockedBadges || []).map((b) => (typeof b === 'string' ? b : b?.id)).filter(Boolean);
      badgesToHighlight = currentUnlockedIds.filter((id) => !currentSeen.includes(id));
    }

    const entry = navigationHistory.push({
      type: VIEW_TYPES.MODAL,
      id: VIEWS.BADGES,
      params: badgesToHighlight.length > 0 ? { highlightBadgeIds: badgesToHighlight } : {}
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());

    const currentUnlockedIds = (unlockedBadges || []).map((b) => (typeof b === 'string' ? b : b?.id)).filter(Boolean);
    if (currentUnlockedIds.length > 0) {
      storageService.markBadgesAsSeen(currentUnlockedIds, activeProfileId);
      setSeenBadges(storageService.getSeenBadges(activeProfileId));
    }
  };

  const handleOpenAscentRoadmapModal = () => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);
    const entry = navigationHistory.push({
      type: VIEW_TYPES.MODAL,
      id: VIEWS.ASCENT_ROADMAP
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
  };

  const handleOpenPinGate = (source = null, tab = 'overview', highlight = null) => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);
    setParentDashboardTab(tab);
    setParentDashboardHighlight(highlight);
    const entry = navigationHistory.push({
      type: VIEW_TYPES.MODAL,
      id: VIEWS.PIN_GATE,
      params: { source, tab, highlight }
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
  };

  const handlePinUnlockSuccess = () => {
    setShowPinGateModal(false);
    setShowProfileSelector(false);
    setPinGateSource(null);

    if (pendingSparksPurchase) {
      if (authService.getAuthState().isAnonymous) {
        setLinkModalMilestone('Real-Money Purchase Backup');
        const entry = navigationHistory.replace({
          type: VIEW_TYPES.MODAL,
          id: VIEWS.ACCOUNT_LINK,
          params: { milestone: 'Real-Money Purchase Backup' }
        });
        applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      } else {
        const checkoutId = pendingSparksPurchase.realMoneyPrice ? VIEWS.STRIPE_CHECKOUT : VIEWS.MOCK_CHECKOUT;
        const entry = navigationHistory.replace({
          type: VIEW_TYPES.MODAL,
          id: checkoutId
        });
        applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      }
    } else {
      const entry = navigationHistory.replace({
        type: VIEW_TYPES.ROUTE,
        id: VIEWS.PARENT_DASHBOARD,
        path: '/parent',
        params: { tab: parentDashboardTab, highlight: parentDashboardHighlight }
      });
      applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      if (!hasVisitedParentZone) {
        setHasVisitedParentZone(true);
        storageService.saveUserData({ hasVisitedParentZone: true });
      }
    }
  };

  const handleOpenModal = (modalId, params = {}) => {
    soundFx.playKeyTap();
    setShowProfileDropdown(false);
    setShowSubjectDropdown(false);
    const entry = navigationHistory.push({
      type: VIEW_TYPES.MODAL,
      id: modalId,
      params
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
  };

  const processDeepLink = (search = typeof window !== 'undefined' ? window.location.search : '') => {
    let savedContext = null;
    if (typeof window !== 'undefined') {
      try {
        const savedStr = window.sessionStorage?.getItem('kibo_stripe_return_context') || window.localStorage?.getItem('kibo_pending_stripe_return');
        if (savedStr) {
          savedContext = JSON.parse(savedStr);
          window.sessionStorage?.removeItem('kibo_stripe_return_context');
          window.localStorage?.removeItem('kibo_pending_stripe_return');
        }
      } catch (e) {}
    }

    if (!search && !savedContext) return;
    try {
      const params = new URLSearchParams(search || '');
      const action = params.get('action') || savedContext?.action;
      const profile = params.get('profile');
      const subject = params.get('subject');
      const tab = params.get('tab') || savedContext?.tab;
      const hub = params.get('hub') || savedContext?.hub;
      const mode = params.get('mode') || savedContext?.mode;
      const highlight = params.get('highlight') || savedContext?.highlight;
      const sessionId = params.get('session_id');

      if (profile) {
        const allProfiles = storageService.getAllProfiles();
        if (allProfiles && allProfiles.some(p => p.id === profile)) {
          storageService.setActiveProfileId(profile);
          setActiveProfileId(profile);
        }
      }

      if (subject && ['math', 'words', 'world', 'coding'].includes(subject)) {
        setActiveSubject(subject);
        storageService.setLastActiveSubject(subject);
      }

      if (action === 'shop' || action === 'workshop' || action === 'store' || action === 'closet') {
        const targetMode = mode || (action === 'closet' ? 'closet' : 'shop');
        const targetHub = hub || tab || 'wearables';
        handleOpenWorkshop(null, targetHub, targetMode);
      } else if (action === 'parent-settings' || action === 'parent-dashboard' || action === 'parent' || action === 'parents') {
        if (sessionId) {
          setParentDashboardTab(tab || 'verification');
          setParentDashboardHighlight(highlight || 'family_plan');
          const entry = navigationHistory.push({
            type: VIEW_TYPES.ROUTE,
            id: VIEWS.PARENT_DASHBOARD,
            path: '/parent',
            params: { tab: tab || 'verification', highlight: highlight || 'family_plan' }
          });
          applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
        } else {
          handleOpenPinGate('deep_link', tab || 'overview', highlight || null);
        }
      } else if (sessionId && !action) {
        // Fallback for returning from Stripe session if action parameter was not retained
        handleOpenWorkshop(null, 'sparks', 'shop');
      } else if (action === 'settings') {
        handleNavigateTo('/settings', 'settings');
      } else if (action === 'leaderboard') {
        handleNavigateTo('/leaderboard', 'leaderboard');
      } else if (action === 'quests') {
        handleNavigateTo('/quests', 'quests');
      } else if (action === 'badges') {
        handleOpenBadgesModal();
      } else if (action === 'ascent' || action === 'roadmap') {
        handleOpenAscentRoadmapModal();
      } else if (action === 'feedback') {
        handleOpenModal(VIEWS.FEEDBACK);
      } else if (action === 'play') {
        const targetSub = subject || activeSubject || 'math';
        const targetPath = SUBJECT_ROUTES[targetSub] || `/${targetSub}`;
        const entry = navigationHistory.replace({
          type: VIEW_TYPES.ROUTE,
          id: VIEWS.ADAPTIVE_SESSION,
          path: targetPath,
          params: { subject: targetSub }
        });
        applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      }

      // Handle Stripe return redirect (session_id in URL)
      if (sessionId) {
        soundFx.playSparkCollect();
        setShowStripeCheckoutModal(false);
        setPendingSparksPurchase(null);
        // Clean URL to remove query parameters without full page reload
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    } catch (e) {
      // Ignore deep link parse errors
    }
  };

  useEffect(() => {
    const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const path = rawPath.replace(/\/+$/, '') || '/';
    const cleanSlug = path.replace(/^\//, '').toLowerCase();

    let initialRoute = VIEWS.ADAPTIVE_SESSION;
    let initialSubject = activeSubject;

    if (['math', 'words', 'world', 'coding'].includes(cleanSlug)) {
      initialSubject = cleanSlug;
      storageService.setLastActiveSubject(cleanSlug);
      setActiveSubject(cleanSlug);
      syncAppStateWithStorage(cleanSlug);
      analyticsService?.logSubjectChange?.(cleanSlug);
    } else if (path === '/privacy') initialRoute = VIEWS.PRIVACY;
    else if (path === '/terms') initialRoute = VIEWS.TERMS;
    else if (path === '/settings') initialRoute = VIEWS.SETTINGS;
    else if (path === '/leaderboard') initialRoute = VIEWS.LEADERBOARD;
    else if (path === '/quests') initialRoute = VIEWS.QUESTS;
    else if (path === '/parent' || path === '/parents' || path === '/parent-dashboard') {
      initialRoute = VIEWS.PARENT_DASHBOARD;
    }

    const routeParams = initialRoute === VIEWS.ADAPTIVE_SESSION ? { subject: initialSubject } : {};
    navigationHistory.reset({
      type: VIEW_TYPES.ROUTE,
      id: initialRoute,
      path: getPathForId(initialRoute, routeParams),
      params: routeParams
    });
    applyNavState(navigationHistory.getCurrent(), navigationHistory.getStack(), navigationHistory.getBaseRoute());

    if (initialRoute === VIEWS.PARENT_DASHBOARD) {
      handleOpenPinGate('direct_url', 'overview', null);
    }

    processDeepLink();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (navigationHistory.getStack().length > 1) {
        handleGoBack();
      } else {
        const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        const path = rawPath.replace(/\/+$/, '') || '/';
        const cleanSlug = path.replace(/^\//, '').toLowerCase();

        let targetRoute = VIEWS.ADAPTIVE_SESSION;
        if (['math', 'words', 'world', 'coding'].includes(cleanSlug)) {
          storageService.setLastActiveSubject(cleanSlug);
          setActiveSubject(cleanSlug);
          syncAppStateWithStorage(cleanSlug);
          analyticsService?.logSubjectChange?.(cleanSlug);
          const entry = navigationHistory.replace({
            type: VIEW_TYPES.ROUTE,
            id: VIEWS.ADAPTIVE_SESSION,
            path: SUBJECT_ROUTES[cleanSlug] || `/${cleanSlug}`,
            params: { subject: cleanSlug }
          });
          applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
          return;
        } else if (path === '/privacy') targetRoute = VIEWS.PRIVACY;
        else if (path === '/terms') targetRoute = VIEWS.TERMS;
        else if (path === '/settings') targetRoute = VIEWS.SETTINGS;
        else if (path === '/leaderboard') targetRoute = VIEWS.LEADERBOARD;
        else if (path === '/quests') targetRoute = VIEWS.QUESTS;
        else if (path === '/parent' || path === '/parents' || path === '/parent-dashboard') targetRoute = VIEWS.PARENT_DASHBOARD;
        handleNavigateTo(path, targetRoute);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Consecutive problem miss tracking for Micro-Hints
  const [consecutiveProblemMisses, setConsecutiveProblemMisses] = useState(0);

  // Test-Out State
  const [isTestOut, setIsTestOut] = useState(false);
  const [testOutTargetTier, setTestOutTargetTier] = useState(null);
  const [hasVisitedParentZone, setHasVisitedParentZone] = useState(() => {
    return storageService.getUserData(activeSubject).hasVisitedParentZone || false;
  });
  const [showTestOutPassModal, setShowTestOutPassModal] = useState(false);
  const [showTestOutFailModal, setShowTestOutFailModal] = useState(false);



  const [levelUpReason, setLevelUpReason] = useState('');
  const [isBossMode, setIsBossMode] = useState(false);
  const [isPlacementTest, setIsPlacementTest] = useState(false);
  const [placementResultInfo, setPlacementResultInfo] = useState(null);
  const [showPlacementRevealModal, setShowPlacementRevealModal] = useState(false);

  // Aggregate sprint history across subjects and calculate streak with dateUtils
  const getCombinedSprintHistory = (sprintHistory = []) => {
    const activeProf = storageService.getActiveProfile();
    const allSubjects = activeProf?.userData?.subjects || {};
    const combinedHistory = [
      ...(Array.isArray(sprintHistory) ? sprintHistory : []),
      ...(Array.isArray(activeProf?.userData?.sprintHistory) ? activeProf.userData.sprintHistory : [])
    ];
    Object.values(allSubjects).forEach(sub => {
      if (Array.isArray(sub?.sprintHistory)) {
        combinedHistory.push(...sub.sprintHistory);
      }
    });
    return combinedHistory;
  };

  const getActiveStreakFromHistory = (sprintHistory = [], practiceDays = [1, 2, 3, 4, 5]) => {
    const combined = getCombinedSprintHistory(sprintHistory);
    return calculateStreakFromHistory(combined, practiceDays);
  };

  // Persistent Kibo Shields (Streak Freezes: max capacity 2, default 1)
  const [streakShields, setStreakShields] = useState(() => {
    return storageService.getUserData(activeSubject).streakShields ?? 1;
  });

  // Persistent Custom 7-Day Practice Schedule (per child profile)
  const [practiceDays, setPracticeDays] = useState(() => {
    return storageService.getProfilePracticeDays();
  });

  // Check for pending referral rewards on load
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted || !currentUser || currentUser.isAnonymous || !currentUser.uid) return;

      try {
        const rewardsRef = collection(db, 'users', currentUser.uid, 'pendingRewards');
        const q = query(rewardsRef, where('status', '==', 'pending'));
        const snap = await getDocs(q);

        if (isMounted && !snap.empty) {
          const firstReward = snap.docs[0];
          setPendingReward({ id: firstReward.id, ...firstReward.data() });
        }
      } catch (e) {
        console.warn("Could not fetch rewards:", e);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeProfileId]);

  // Persistent Daily Streak
  const [streak, setStreak] = useState(() => {
    return storageService.getUserData(activeSubject).streak;
  });

  // Persistent Sparks Currency (⚡)
  const [sparks, setSparks] = useState(() => {
    return storageService.getUserData(activeSubject).sparks;
  });

  const [isKiboClub, setIsKiboClub] = useState(() => {
    return storageService.hasClubMembership(activeProfileId);
  });

  // Persistent Active Skill Tier (1 through 8)
  const [tier, setTier] = useState(() => {
    return storageService.getUserData(activeSubject).tier;
  });

  // Persistent Unlocked Curriculum Tiers
  const [unlockedTiers, setUnlockedTiers] = useState(() => {
    return storageService.getUserData(activeSubject).unlockedTiers;
  });

  // Persistent Tier Mastery Percent (0, 25, 50, 75, 100)
  const [tierMasteryPercent, setTierMasteryPercent] = useState(() => {
    return storageService.getUserData(activeSubject).tierMasteryPercent || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  });

  const [liveCompetenceRating, setLiveCompetenceRating] = useState(() => {
    const uData = storageService.getUserData(activeSubject);
    return uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
  });

  // Persistent Tier Best Completion Times in Seconds
  const [tierBestTimes, setTierBestTimes] = useState(() => {
    return storageService.getUserData(activeSubject).tierBestTimes || {};
  });

  const [isNewSpeedRecord, setIsNewSpeedRecord] = useState(false);

  // Persistent Parent PIN (Optional secondary fallback; default 1234 deprecated)
  const [parentPin, setParentPin] = useState(() => {
    return storageService.getParentSettings().pin;
  });

  // Persistent Sprint History (last 3 sprints)
  const [sprintHistory, setSprintHistory] = useState(() => {
    return storageService.getUserData(activeSubject).sprintHistory;
  });

  // Persistent Re-queued Practice Problems
  const [practiceQueue, setPracticeQueue] = useState(() => {
    return storageService.getUserData(activeSubject).practiceQueue;
  });

  // Persistent Inventory & Equipped Accessories
  const [unlockedItems, setUnlockedItems] = useState(() => {
    return storageService.getShopState().unlockedItems;
  });

  const [equippedItems, setEquippedItems] = useState(() => {
    return storageService.getShopState().equippedItems;
  });

  // Persistent Lifetime Problems Solved Tracker
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(() => {
    return storageService.getUserData(activeSubject).totalProblemsSolved || 0;
  });

  const [cumulativeCorrectStreak, setCumulativeCorrectStreak] = useState(() => {
    return storageService.getUserData(activeSubject).cumulativeCorrectStreak || 0;
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    return storageService.getUserData(activeSubject).personalRecords || {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    };
  });

  const [lastSprintDate, setLastSprintDate] = useState(() => {
    return storageService.getUserData(activeSubject).lastSprintDate;
  });

  const isStreakCompletedToday = lastSprintDate === getTodayStr();

  const [isSparksBouncing, setIsSparksBouncing] = useState(false);
  const sparksBounceTimerRef = useRef(null);

  const prevSparksRef = useRef(sparks);
  useEffect(() => {
    if (sparks > prevSparksRef.current) {
      setIsSparksBouncing(true);
      if (sparksBounceTimerRef.current) clearTimeout(sparksBounceTimerRef.current);
      sparksBounceTimerRef.current = setTimeout(() => {
        setIsSparksBouncing(false);
      }, 1000);
    }
    prevSparksRef.current = sparks;
  }, [sparks]);

  const recordDailyPractice = () => {

    const todayStr = getTodayStr();
    const uData = storageService.getUserData(activeSubject);
    const lastDateStr = uData.lastSprintDate;
    const lastTimestamp = uData.lastSprintTimestamp;
    let currentStreak = uData.streak ?? streak ?? 0;

    const historyStreak = getActiveStreakFromHistory(uData.sprintHistory || [], storageService.getProfilePracticeDays());
    if (historyStreak > currentStreak) {
      currentStreak = historyStreak;
    }

    if (lastDateStr === todayStr) {
      if (currentStreak !== streak) {
        setStreak(currentStreak);
        storageService.saveUserData({
          streak: currentStreak,
          lastSprintDate: todayStr,
          lastSprintTimestamp: new Date().toISOString(),
          lastSprintTimezone: getCurrentTimezone()
        }, activeSubject);
      }
      return;
    }

    let nextStreak = currentStreak;
    const yesterdayStr = getYesterdayStr();
    const isTravelGrace = isWithinTravelGracePeriod(lastTimestamp, new Date(), 36);

    if (!lastDateStr) {
      nextStreak = Math.max(1, historyStreak);
    } else if (lastDateStr === yesterdayStr || isTravelGrace) {
      nextStreak = currentStreak + 1;
    } else {
      const savedDays = storageService.getProfilePracticeDays() || [1, 2, 3, 4, 5];
      const [y, m, d] = lastDateStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);
      curr.setDate(curr.getDate() + 1);

      let missedActiveDays = 0;
      while (true) {
        const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        if (dateStr >= todayStr) break;

        const dayIdx = curr.getDay();
        if (savedDays.includes(dayIdx)) {
          missedActiveDays++;
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (missedActiveDays === 0) {
        nextStreak = currentStreak + 1;
      } else {
        nextStreak = 1;
      }
    }

    if (nextStreak > currentStreak && lastDateStr !== todayStr) {
      setShowDailyStreakIncreasedModal(true);
    }

    // Also display PerfectMonthProgressModal if it is the first climb of the day
    if (lastDateStr !== todayStr) {
      const combinedHistory = getCombinedSprintHistory(uData.sprintHistory || []);

      const monthlyActiveDays = new Set();
      // Calculate how many distinct days they've played this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      combinedHistory.forEach(item => {
        if (!item) return;
        let d = null;
        if (item.date) {
           d = new Date(item.date + 'T00:00:00'); // simple parse
        } else if (item.timestamp) {
           d = new Date(item.timestamp);
        }
        if (d && !isNaN(d.getTime())) {
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyActiveDays.add(d.getDate());
          }
        }
      });
      // Add today since they just played it
      monthlyActiveDays.add(new Date().getDate());

      setPerfectMonthData({ daysPlayedThisMonth: monthlyActiveDays.size });
    }

    setStreak(nextStreak);
    setLastSprintDate(todayStr);
    storageService.saveUserData({
      streak: nextStreak,
      lastSprintDate: todayStr,
      lastSprintTimestamp: new Date().toISOString(),
      lastSprintTimezone: getCurrentTimezone()
    }, activeSubject);

    // Record subject climb for Multi-Subject Daily Bonus
    const multiBonusRes = questService.recordDailySubjectClimb(activeProfileId, activeSubject);
    if (multiBonusRes?.awarded) {
      const bonusSparks = multiBonusRes.bonus?.sparks || 75;
      const currentSparks = storageService.getUserData(activeSubject).sparks || 0;
      const updatedSparks = currentSparks + bonusSparks;
      setSparks(updatedSparks);
      storageService.saveUserData({ sparks: updatedSparks }, activeSubject);
      setMultiSubjectBonusData(multiBonusRes);
      setShowMultiSubjectBonusModal(true);
      soundFx.playVictory?.();

      // Evaluate badges
      const activeUserData = storageService.getUserData(activeSubject);
      const evalRes = evaluateBadges({
        ...activeUserData,
        subjectId: activeSubject,
        multiSubjectBonusClaimsCount: multiBonusRes.multiSubjectBonusClaimsCount || 1
      });
      if (evalRes.newlyUnlocked && evalRes.newlyUnlocked.length > 0) {
        setNewlyUnlockedBadges(evalRes.newlyUnlocked);
        setUnlockedBadges(evalRes.updatedUnlocked);
      }
    }
  };

  const handleIncrementLifetimeProblems = (isCorrect = true) => {
    const nextTotal = (totalProblemsSolved || 0) + 1;
    setTotalProblemsSolved(nextTotal);

    let nextStreak = isCorrect ? cumulativeCorrectStreak + 1 : 0;
    setCumulativeCorrectStreak(nextStreak);

    const nextRecords = {
      ...personalRecords,
      highestCorrectStreak: Math.max(personalRecords?.highestCorrectStreak || 0, nextStreak)
    };
    setPersonalRecords(nextRecords);

    const uData = storageService.getUserData(activeSubject);
    const currentRating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
    
    let extraSparks = 0;
    analyticsService.logQuestionAnswered(activeSubject, isCorrect, currentRating, 'unknown');

    let newBaseline = uData.baselineRating;
    let newlyCalibrated = uData.isCalibrated || false;

    if (nextTotal >= 15 && !uData.isCalibrated) {
      newBaseline = currentRating;
      newlyCalibrated = true;
      extraSparks = 30;
      setSparks((prev) => prev + extraSparks);
      soundFx.playVictory();
    }

    const questProg = questService.recordProgress(activeProfileId, {
      subject: activeSubject,
      isCorrect,
      streak: nextStreak
    });

    if (questProg?.leveledUp) {
      soundFx.playVictory?.();
      setGlobalAscentLevelUpEvent(questProg.leveledUp);
    }

    storageService.saveUserData({
      totalProblemsSolved: nextTotal,
      cumulativeCorrectStreak: nextStreak,
      personalRecords: nextRecords,
      ...(extraSparks > 0 ? { sparks: (sparks || 0) + extraSparks } : {}),
      ...(newlyCalibrated ? { baselineRating: newBaseline, isCalibrated: true } : {})
    }, activeSubject);
  };

  // Persistent Consumable Power-Ups Inventory
  const [consumables, setConsumables] = useState(() => {
    const saved = storageService.getUserData(activeSubject).consumables;
    return {
      shieldCount: saved?.shieldCount ?? 1,
      streakSaverCount: saved?.streakSaverCount ?? 0,
      doubleSparksPotionCount: saved?.doubleSparksPotionCount ?? saved?.doubleCoinPotionCount ?? 0,
      hintScrollCount: saved?.hintScrollCount ?? 2,
      letterSpyglassCount: saved?.letterSpyglassCount ?? 2,
      letterPrunerCount: saved?.letterPrunerCount ?? 2,
      explorerCompassCount: saved?.explorerCompassCount ?? 2
    };
  });

  const [durationInSeconds, setDurationInSeconds] = useState(0);

  const [preferences, setPreferences] = useState(() => {
    const defaultPrefs = { hideSprintTimer: false, isMuted: false, isMusicMuted: false, isHapticsEnabled: true };
    return { ...defaultPrefs, ...(storageService.getUserData(activeSubject).preferences || {}) };
  });

  // Apply preferences to audio engine and initialize multi-profile reminders on load
  useEffect(() => {
    soundFx.setMuted(preferences.isMuted);
    if (soundFx.setMusicMuted) {
      soundFx.setMusicMuted(preferences.isMusicMuted);
    }
    setHapticsEnabled(preferences.isHapticsEnabled);
    scheduleAllProfileReminders();
  }, []);

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    storageService.saveUserData({ preferences: newPrefs });

    if (newPrefs.isMuted !== undefined) {
      soundFx.setMuted(newPrefs.isMuted);
    }
    if (newPrefs.isMusicMuted !== undefined && soundFx.setMusicMuted) {
      soundFx.setMusicMuted(newPrefs.isMusicMuted);
    }
    if (newPrefs.isHapticsEnabled !== undefined) {
      setHapticsEnabled(newPrefs.isHapticsEnabled);
    }
  };

  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  useEffect(() => {
    setNotifPrefs(getNotificationPrefs());
  }, [showParentDashboard]);



  const [isShieldProtected, setIsShieldProtected] = useState(false);
  const [doubleSparksActiveBySubject, setDoubleSparksActiveBySubject] = useState({
    math: false,
    words: false,
    world: false,
    coding: false
  });
  const isDoubleSparksActive = Boolean(doubleSparksActiveBySubject[activeSubject]);

  const devState = useDevState(() => {
    const uData = storageService.getUserData(activeSubject);
    const sData = storageService.getShopState();
    setSparks(uData.sparks || 0);
    setUnlockedItems(sData.unlockedItems || ['cap']);
  });

  const syncAppStateWithStorage = (subjectOverride) => {
    const sub = subjectOverride || activeSubject;
    const uData = storageService.getUserData(sub);
    const sData = storageService.getShopState();
    const cRating = Number(uData.adaptiveCompetenceRating) || Number(uData.competenceRank) || 1000;

    setActiveProfileId(storageService.getActiveProfileId());
    setLiveCompetenceRating(cRating);
    setTier(uData.tier || 1);
    setUnlockedTiers(uData.unlockedTiers || [1]);
    setTierMasteryPercent(uData.tierMasteryPercent || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 });
    setTierBestTimes(uData.tierBestTimes || {});
    setStreak(uData.streak ?? 1);
    setSparks(uData.sparks ?? 0);
    setIsKiboClub(uData.isKiboClub ?? false);
    setTotalProblemsSolved(uData.totalProblemsSolved ?? 0);
    setCumulativeCorrectStreak(uData.cumulativeCorrectStreak ?? 0);
    setPersonalRecords(uData.personalRecords || {
      fastest12QuestionsTime: null,
      highestCorrectStreak: 0,
      mostPerfectSessions: 0
    });
    setSprintHistory(uData.sprintHistory || []);
    setPracticeQueue(uData.practiceQueue || []);
    setLastSprintDate(uData.lastSprintDate ?? null);
    const badgeEval = evaluateBadges({ ...uData, subjectId: sub });
    setUnlockedBadges(badgeEval?.updatedUnlocked || uData.unlockedBadges || []);
    setSeenBadges(storageService.getSeenBadges(storageService.getActiveProfileId()));
    setPracticeDays(storageService.getProfilePracticeDays());
    setEquippedItems(sData.equippedItems ?? []);
    setUnlockedItems(sData.unlockedItems ?? ['cap']);
    setHasVisitedParentZone(uData.hasVisitedParentZone || false);

    const currentPid = storageService.getActiveProfileId();
    setFriendsCount(storageService.getFriends(currentPid).length);
    setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);

    // Sync Audio & Haptics preferences
    const prefs = {
      hideSprintTimer: false,
      isMuted: false,
      isMusicMuted: false,
      isHapticsEnabled: true,
      ...(uData.preferences || {})
    };
    soundFx.setMuted(prefs.isMuted);
    if (soundFx.setMusicMuted) {
      soundFx.setMusicMuted(prefs.isMusicMuted);
    }
    setHapticsEnabled(prefs.isHapticsEnabled);
    setPreferences(prefs);
    const activeClimb = storageService.getActiveClimbState(currentPid, sub);
    setDoubleSparksActiveBySubject(prev => ({
      ...prev,
      [sub]: Boolean(activeClimb?.isDoubleSparksActive || prev[sub])
    }));
  };

  const handleSubjectChange = (newSubject) => {
    soundFx.playKeyTap();
    storageService.setLastActiveSubject(newSubject);
    setActiveSubject(newSubject);
    setAppState('adaptive_session');
    syncAppStateWithStorage(newSubject);
    analyticsService?.logSubjectChange?.(newSubject);

    const targetPath = SUBJECT_ROUTES[newSubject] || `/${newSubject}`;
    const entry = navigationHistory.replace({
      type: VIEW_TYPES.ROUTE,
      id: VIEWS.ADAPTIVE_SESSION,
      path: targetPath,
      params: { subject: newSubject }
    });
    applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
  };

  useEffect(() => {
    syncAppStateWithStorage(activeSubject);

    // Check for incoming cloud friend requests in background
    const currentPid = activeProfileId || storageService.getActiveProfileId();
    leaderboardService.fetchCloudFriendRequests(currentPid).then(({ received }) => {
      if (Array.isArray(received) && received.length > 0) {
        let changed = false;
        received.forEach(req => {
          const targetPid = req.receiverProfileId || currentPid;
          storageService.receiveFriendRequest({
            id: req.id,
            senderId: `${req.senderUid}_${req.senderProfileId || 'default_child'}`,
            senderUid: req.senderUid,
            senderProfileId: req.senderProfileId || 'default_child',
            senderUsername: req.senderUsername,
            name: req.senderUsername,
            score: req.senderScore,
            equipped: req.senderEquipped,
            subjectsMastered: req.senderSubjectsMastered,
            createdAt: req.createdAt
          }, targetPid);
          changed = true;
        });
        if (changed) {
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
        }
      }
    }).catch(() => {});
  }, [activeSubject, activeProfileId]);

  // Initialize Auth (including OAuth redirect resolution) & Offline Background Sync Queue on Launch
  useEffect(() => {
    const initAppAuth = async () => {
      const authRes = await authService.initAnonymousGuest();
      syncAppStateWithStorage();
      syncService.initBackgroundSync();

      // Check URL query parameters for ?friend=KIBO-XXXX and ?ref=UID from QR scans or invite links
      try {
        if (typeof window !== 'undefined' && window.location.search) {
          const urlParams = new URLSearchParams(window.location.search);
          const friendParam = urlParams.get('friend') || urlParams.get('code');
          const refParam = urlParams.get('ref');

          if (refParam) {
            // Save referrer UID for pending welcome bonus processing
            try {
              if (!localStorage.getItem('kibo_applied_referral')) {
                localStorage.setItem('kibo_pending_referral_uid', refParam.trim());
              }
            } catch (e) {}
          }

          if (friendParam) {
            const cleanCode = friendParam.trim().toUpperCase();
            const currentPid = storageService.getActiveProfileId();
            const activeProf = storageService.getActiveProfile();
            const myCode = storageService.getFriendCode(currentPid);

            if (cleanCode && cleanCode !== myCode) {
              leaderboardService.connectMutualFriendByCode(cleanCode, activeProf).then((res) => {
                if (res.success) {
                  soundFx.playVictory();
                  setFriendsCount(storageService.getFriends(currentPid).length);
                }
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('URL param parse error', e);
      }

      // If returning from OAuth redirect flow, preserve and restore original route
      if (authRes && authRes.returnUrl && authRes.returnUrl !== window.location.pathname) {
        let targetState = 'adaptive_session';
        if (authRes.returnUrl.includes('/settings')) targetState = 'settings';
        else if (authRes.returnUrl.includes('/privacy')) targetState = 'privacy';
        else if (authRes.returnUrl.includes('/terms')) targetState = 'terms';
        else if (authRes.returnUrl.includes('/leaderboard')) targetState = 'leaderboard';

        window.history.replaceState({}, '', authRes.returnUrl);
        setAppState(targetState);
      }
    };
    initAppAuth();
  }, []);

  const handleBuyConsumable = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item || sparks < item.cost) return;

    const newSparks = sparks - item.cost;
    let nextShieldCount = consumables.shieldCount || 0;
    let nextStreakSaverCount = consumables.streakSaverCount || 0;
    let nextPotionCount = consumables.doubleSparksPotionCount || consumables.doubleCoinPotionCount || 0;
    let nextHintScrollCount = consumables.hintScrollCount || 0;
    let nextLetterSpyglassCount = consumables.letterSpyglassCount || 0;
    let nextLetterPrunerCount = consumables.letterPrunerCount || 0;
    let nextExplorerCompassCount = consumables.explorerCompassCount || 0;

    if (item.id === 'kibo_shield') {
      nextShieldCount += 1;
    } else if (item.id === 'streak_saver') {
      nextStreakSaverCount += 1;
    } else if (item.id === 'double_sparks_potion' || item.id === 'double_coin_potion') {
      nextPotionCount += 1;
    } else if (item.id === 'hint_scroll') {
      nextHintScrollCount += 1;
    } else if (item.id === 'letter_spyglass') {
      nextLetterSpyglassCount += 1;
    } else if (item.id === 'explorer_compass') {
      nextExplorerCompassCount += 1;
    } else if (item.id === 'letter_pruner') {
      nextLetterPrunerCount += 1;
    }

    const nextConsumables = {
      shieldCount: nextShieldCount,
      streakSaverCount: nextStreakSaverCount,
      doubleSparksPotionCount: nextPotionCount,
      doubleCoinPotionCount: nextPotionCount,
      hintScrollCount: nextHintScrollCount,
      letterSpyglassCount: nextLetterSpyglassCount,
      letterPrunerCount: nextLetterPrunerCount,
      explorerCompassCount: nextExplorerCompassCount
    };

    setSparks(newSparks);
    setConsumables(nextConsumables);

    const activeData = storageService.getUserData(activeSubject);
    const newPurchasesCount = (activeData.shopPurchasesCount || 0) + 1;
    const currentRarities = Array.isArray(activeData.purchasedRarities) ? activeData.purchasedRarities : [];
    const itemRarity = item.rarity || 'common';
    const newRarities = Array.from(new Set([...currentRarities, itemRarity]));

    storageService.saveUserData({
      sparks: newSparks,
      consumables: nextConsumables,
      shopPurchasesCount: newPurchasesCount,
      purchasedRarities: newRarities
    });

    const refreshedUserData = storageService.getUserData(activeSubject);
    checkAndPromptLinkAccount(
      { purchasesCount: newPurchasesCount },
      setLinkModalMilestone,
      setShowAccountLinkModal
    );

    const userStateForBadges = {
      streak,
      sparks: newSparks,
      purchasedItemsCount: newPurchasesCount,
      purchasedRarities: newRarities,
      hasBoughtGemsWithRealMoney: refreshedUserData.hasBoughtGemsWithRealMoney || false,
      perfectClimbsCount: refreshedUserData.perfectClimbsCount || 0,
      consecutivePerfectClimbsCount: refreshedUserData.consecutivePerfectClimbsCount || 0,
      cumulativeCorrectStreak: refreshedUserData.cumulativeCorrectStreak || 0,
      unlockedBadges
    };
    const badgeEvalRes = evaluateBadges(userStateForBadges);
    if ((badgeEvalRes.newlyUnlocked || []).length > 0) {
      setUnlockedBadges(badgeEvalRes.updatedUnlocked);
      setNewlyUnlockedBadges(badgeEvalRes.newlyUnlocked);
    }

    soundFx.playVictory();
  };

  const handleConsumeHintScroll = () => {
    const owned = consumables.hintScrollCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playKeyTap();
    const nextConsumables = {
      ...consumables,
      hintScrollCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeLetterSpyglass = () => {
    const owned = consumables.letterSpyglassCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playSparkCollect();
    const nextConsumables = {
      ...consumables,
      letterSpyglassCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeExplorerCompass = () => {
    const owned = consumables.explorerCompassCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playSparkCollect();
    const nextConsumables = {
      ...consumables,
      explorerCompassCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeLetterPruner = () => {
    const owned = consumables.letterPrunerCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playKeyTap();
    const nextConsumables = {
      ...consumables,
      letterPrunerCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleConsumeShield = () => {
    const owned = consumables.shieldCount ?? 0;
    if (owned <= 0) return false;
    soundFx.playVictory();
    const nextConsumables = {
      ...consumables,
      shieldCount: owned - 1
    };
    setConsumables(nextConsumables);
    storageService.saveUserData({ consumables: nextConsumables });
    return true;
  };

  const handleToggleDoubleSparksPotion = () => {
    if (isDoubleSparksActive) {
      setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: false }));
    } else {
      const owned = consumables.doubleSparksPotionCount ?? consumables.doubleCoinPotionCount ?? 0;
      if (owned <= 0) return;
      soundFx.playSparkCollect();
      const nextPotionCount = owned - 1;
      const nextConsumables = {
        ...consumables,
        doubleSparksPotionCount: nextPotionCount,
        doubleCoinPotionCount: nextPotionCount
      };
      setConsumables(nextConsumables);
      storageService.saveUserData({ consumables: nextConsumables });
      setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: true }));
      analyticsService.logSpendVirtualCurrency('double_sparks_potion', 0);
    }
  };

  // Schedule-Aware & Timezone-Resilient Streak Validation per Profile
  const validateStreakForActiveProfile = (subjectOverride) => {
    const sub = subjectOverride || activeSubject;
    const uData = storageService.getUserData(sub);
    const lastDateStr = uData.lastSprintDate;
    const lastTimestamp = uData.lastSprintTimestamp;
    const savedDays = storageService.getProfilePracticeDays() || [1, 2, 3, 4, 5];
    const historyStreak = getActiveStreakFromHistory(uData.sprintHistory || [], savedDays);
    const storedStreak = uData.streak ?? 0;
    const savedStreak = Math.max(storedStreak, historyStreak);
    const savedShields = uData.streakShields ?? 1;

    if (savedStreak > storedStreak) {
      setStreak(savedStreak);
      storageService.saveUserData({ streak: savedStreak }, sub);
    }

    if (!lastDateStr || savedStreak === 0) return;

    const todayStr = getTodayStr();
    // Intact if already played today or yesterday
    if (lastDateStr === todayStr || lastDateStr === getYesterdayStr()) return;

    // Check if within travel / elapsed time grace period (e.g. traveling eastward across time zones)
    if (isWithinTravelGracePeriod(lastTimestamp, new Date(), 36)) {
      return;
    }

    const [y, m, d] = lastDateStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    let missedActiveDays = 0;

    if (!isNaN(curr.getTime())) {
      curr.setDate(curr.getDate() + 1);
      let safetyLimit = 3650;
      while (safetyLimit-- > 0) {
        const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        if (dateStr >= todayStr) break;

        const dayIdx = curr.getDay();
        if (savedDays.includes(dayIdx)) {
          missedActiveDays++;
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    if (missedActiveDays >= 1) {
      const activeConsumables = storageService.getConsumables();
      const currentStreakSaverCount = activeConsumables.streakSaverCount || 0;
      if (currentStreakSaverCount > 0 || savedShields > 0) {
        if (currentStreakSaverCount > 0) {
          const nextStreakSavers = Math.max(0, currentStreakSaverCount - 1);
          const nextConsumables = { ...activeConsumables, streakSaverCount: nextStreakSavers };
          setConsumables(nextConsumables);
          storageService.saveUserData({ consumables: nextConsumables });
        } else {
          const newShields = Math.max(0, savedShields - 1);
          setStreakShields(newShields);
          storageService.saveUserData({ streakShields: newShields });
          localStorage.setItem('kibo_math_shields', newShields.toString());
        }
        setShowStreakSavedModal(true);
      } else {
        setStreak(0);
        localStorage.setItem('kibo_math_streak', '0');
        storageService.saveUserData({ streak: 0 }, sub);
      }
    }
  };

  useEffect(() => {
    // Only run on startup if profile selector is NOT shown (e.g. single profile / direct mode)
    if (!showProfileSelector) {
      validateStreakForActiveProfile(activeSubject);
    }
  }, []);

  // First-Time Launch Handlers
  const handleStartAtTier1FromOnboarding = () => {
    setTier(1);
    setUnlockedTiers([1]);
    storageService.setOnboarded(true);
    localStorage.setItem('kibo_math_tier', '1');
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify([1]));
    syncAppStateWithStorage();
    setShowFirstLaunchOnboardingModal(false);
  };

  const handleStartPlacementFromOnboarding = () => {
    storageService.setOnboarded(true);
    syncAppStateWithStorage();
    setShowFirstLaunchOnboardingModal(false);
    startPlacementDiagnostic();
  };

  const handleCompletePlacementTest = (placedTier) => {
    const newUnlocked = [];
    for (let i = 1; i <= Math.max(1, placedTier); i++) newUnlocked.push(i);

    const updatedSparks = sparks + 50;

    setTier(placedTier);
    setUnlockedTiers(newUnlocked);
    setSparks(updatedSparks);

    storageService.setOnboarded(true);
    localStorage.setItem('kibo_math_tier', placedTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(newUnlocked));
    localStorage.setItem('kibo_math_sparks', updatedSparks.toString());

    setShowPlacementRevealModal(true);
  };

  const handleOpenQuitModal = () => {
    pauseStartTimeRef.current = performance.now();
    setShowQuitModal(true);
  };

  const handleKeepPlaying = () => {
    const pausedDuration = performance.now() - pauseStartTimeRef.current;
    problemStartTimeRef.current += pausedDuration;
    setShowQuitModal(false);
  };

  const handleQuitToHome = () => {
    setShowQuitModal(false);
    setCurrentIndex(0);
    setProblems([]);
    setResults([]);
    setInputVal('');
    setIsBossMode(false);
    setIsPlacementTest(false);
    setIsTestOut(false);
    setConsecutiveProblemMisses(0);
    setAppState('adaptive_session');
  };

  const handleQuitToMap = () => {
    setShowQuitModal(false);
    setCurrentIndex(0);
    setProblems([]);
    setResults([]);
    setInputVal('');
    setIsBossMode(false);
    setIsPlacementTest(false);
    setIsTestOut(false);
    setConsecutiveProblemMisses(0);
    setAppState('adaptive_session');
  };

  const handleLevelUp = () => {
    if (tier < 8) {
      const nextTier = tier + 1;
      const updatedUnlocked = Array.from(new Set([...unlockedTiers, nextTier]));
      setTier(nextTier);
      setUnlockedTiers(updatedUnlocked);
      localStorage.setItem('kibo_math_tier', nextTier.toString());
      localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
      setSprintHistory([]);
      localStorage.setItem('kibo_math_sprint_history', JSON.stringify([]));
      setShowLevelUpModal(false);
      soundFx.playVictory();
    }
  };

  const handleSelectTierFromMap = (selectedTier) => {
    const updatedUnlocked = Array.from(new Set([...unlockedTiers, selectedTier]));
    setTier(selectedTier);
    setUnlockedTiers(updatedUnlocked);
    localStorage.setItem('kibo_math_tier', selectedTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
    startNewSprint(false, selectedTier);
  };


  const handleBuyItem = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item) {
      console.warn('Purchase rejected: Invalid item passed', itemInput);
      return;
    }
    const res = shopLedgerService.purchaseItem(item.id, item.cost);
    if (!res.success) {
      console.warn('Purchase rejected by authoritative ledger:', res.reason);
      return;
    }

    analyticsService.logSpendVirtualCurrency(item.id, item.cost || 0);

    setSparks(res.newSparks);
    setUnlockedItems(res.unlockedItems);

    const currentSlotCat = item.category;
    const filteredSameSlot = equippedItems.filter((id) => {
      const equippedItem = getItemById(id);
      return equippedItem ? equippedItem.category !== currentSlotCat : true;
    });

    const updatedEquipped = [...filteredSameSlot, item.id];
    setEquippedItems(updatedEquipped);

    storageService.saveShopState(updatedEquipped, res.unlockedItems);

    const activeData = storageService.getUserData(activeSubject);
    const newPurchasesCount = (activeData.shopPurchasesCount || 0) + 1;
    const currentRarities = Array.isArray(activeData.purchasedRarities) ? activeData.purchasedRarities : [];
    const itemRarity = item.rarity || 'common';
    const newRarities = Array.from(new Set([...currentRarities, itemRarity]));

    storageService.saveUserData({
      sparks: res.newSparks,
      shopPurchasesCount: newPurchasesCount,
      purchasedRarities: newRarities
    });

    // Per-profile check for Save Progress Across All Devices modal (2 items purchased)
    const refreshedUserData = storageService.getUserData(activeSubject);

    checkAndPromptLinkAccount(
      { purchasesCount: newPurchasesCount },
      setLinkModalMilestone,
      setShowAccountLinkModal
    );

    // Evaluate shop badges
    const userStateForBadges = {
      streak,
      sparks: res.newSparks,
      purchasedItemsCount: newPurchasesCount,
      purchasedRarities: newRarities,
      hasBoughtGemsWithRealMoney: refreshedUserData.hasBoughtGemsWithRealMoney || false,
      perfectClimbsCount: refreshedUserData.perfectClimbsCount || 0,
      consecutivePerfectClimbsCount: refreshedUserData.consecutivePerfectClimbsCount || 0,
      cumulativeCorrectStreak: refreshedUserData.cumulativeCorrectStreak || 0,
      unlockedBadges
    };
    const badgeEvalRes = evaluateBadges(userStateForBadges);
    if ((badgeEvalRes.newlyUnlocked || []).length > 0) {
      setUnlockedBadges(badgeEvalRes.updatedUnlocked);
      setNewlyUnlockedBadges(badgeEvalRes.newlyUnlocked);
    }

    soundFx.playVictory();
  };

  const handleSellItem = (itemInput) => {
    const item = typeof itemInput === 'string' ? getItemById(itemInput) : itemInput;
    if (!item) return;

    if (item.isConsumable) {
      // Handle consumable sell
      const sellPrice = Math.floor(item.cost * 0.5);
      const newSparks = sparks + sellPrice;

      let nextConsumables = { ...consumables };
      if (item.id === 'kibo_shield' && nextConsumables.shieldCount > 0) {
        nextConsumables.shieldCount -= 1;
      } else if (item.id === 'streak_saver' && nextConsumables.streakSaverCount > 0) {
        nextConsumables.streakSaverCount -= 1;
      } else if (item.id === 'double_sparks_potion' && nextConsumables.doubleSparksPotionCount > 0) {
        nextConsumables.doubleSparksPotionCount -= 1;
      } else if (item.id === 'double_coin_potion' && nextConsumables.doubleCoinPotionCount > 0) {
        nextConsumables.doubleCoinPotionCount -= 1;
      } else if (item.id === 'hint_scroll' && nextConsumables.hintScrollCount > 0) {
        nextConsumables.hintScrollCount -= 1;
      } else if (item.id === 'letter_spyglass' && nextConsumables.letterSpyglassCount > 0) {
        nextConsumables.letterSpyglassCount -= 1;
      } else if (item.id === 'letter_pruner' && nextConsumables.letterPrunerCount > 0) {
        nextConsumables.letterPrunerCount -= 1;
      } else if (item.id === 'explorer_compass' && nextConsumables.explorerCompassCount > 0) {
        nextConsumables.explorerCompassCount -= 1;
      } else {
        return; // Nothing to sell
      }

      setConsumables(nextConsumables);
      setSparks(newSparks);

      storageService.saveUserData({
        sparks: newSparks,
        streakShields: nextConsumables.shieldCount,
        streakSaverCount: nextConsumables.streakSaverCount,
        hintScrollCount: nextConsumables.hintScrollCount,
        doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
        doubleCoinPotionCount: nextConsumables.doubleCoinPotionCount,
        letterSpyglassCount: nextConsumables.letterSpyglassCount,
        letterPrunerCount: nextConsumables.letterPrunerCount,
        explorerCompassCount: nextConsumables.explorerCompassCount
      });

      soundFx.playKeyTap();

    } else {
      // Handle non-consumable sell using shopLedgerService
      const res = shopLedgerService.sellItem(item.id, item.cost);
      if (!res.success) {
        console.warn('Sell rejected by ledger:', res.reason);
        return;
      }

      setSparks(res.newSparks);
      setUnlockedItems(res.unlockedItems);
      setEquippedItems(res.equippedItems);

      soundFx.playKeyTap();
    }
  };

  const handleToggleEquip = (itemId) => {
    const targetItem = getItemById(itemId);
    let updatedEquipped;

    if (equippedItems.includes(itemId)) {
      updatedEquipped = equippedItems.filter((id) => id !== itemId);
    } else {
      const currentSlot = getItemSlot(targetItem);
      const filteredSameSlot = equippedItems.filter((id) => {
        const item = getItemById(id);
        return item ? getItemSlot(item) !== currentSlot : true;
      });
      updatedEquipped = [...filteredSameSlot, itemId];
    }

    setEquippedItems(updatedEquipped);
    storageService.saveShopState(updatedEquipped, unlockedItems);
  };

  const handleRedeemPromoCode = (res) => {
    if (!res || !res.updated) return;
    if (typeof res.updated.sparks === 'number') {
      setSparks(res.updated.sparks);
    }
    if (Array.isArray(res.updated.unlockedItems)) {
      setUnlockedItems(res.updated.unlockedItems);
    }
    if (res.updated.consumables) {
      setConsumables(res.updated.consumables);
    }
  };

  const handleUpdatePin = (newPin) => {
    setParentPin(newPin);
    storageService.saveParentSettings(newPin);
  };

  const handleUpdatePracticeDays = (newDays) => {
    setPracticeDays(newDays);
    storageService.saveProfilePracticeDays(newDays);
  };

  const handleSetTierManual = (newTier) => {
    const updatedUnlocked = [];
    for (let i = 1; i <= Math.max(1, newTier); i++) updatedUnlocked.push(i);
    setTier(newTier);
    setUnlockedTiers(updatedUnlocked);
    localStorage.setItem('kibo_math_tier', newTier.toString());
    localStorage.setItem('kibo_math_unlocked_tiers', JSON.stringify(updatedUnlocked));
  };

  const getTierMeta = (t) => {
    return CURRICULUM_TIERS.find((item) => item.tier === t) || CURRICULUM_TIERS[0];
  };

  const currentTierMeta = getTierMeta(tier);
  const activeProfile = storageService.getActiveProfile();
  const allProfiles = storageService.getAllProfiles();

  const isAppPaused = isWorkshopOpen || showProfileDropdown || showFriendsModal || showLevelUpModal || showSpeedInfoModal || showPinGateModal || showParentDashboard || showMockCheckoutModal || showStripeCheckoutModal || showFamilyUpgradeModal || showStreakSavedModal || showDailyStreakIncreasedModal || showMultiSubjectBonusModal || !!globalAscentLevelUpEvent || !!perfectMonthData || showBadgesModal || showShareModal || showAccountLinkModal || showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher || showFeedbackModal || showNewsModal;

  // Check for News and Daily Spark Vault (Sequenced: News first, then Daily Vault on close or if no news)
  useEffect(() => {
    // Only check if we are on the main game screen and not in onboarding
    if (showFirstLaunchOnboardingModal || showProfileSelector || showManualProfileSwitcher || appState !== 'adaptive_session') return;

    const currentPid = activeProfileId || storageService.getActiveProfileId();
    if (!currentPid) return;

    const activeNews = getNewsItems(new Date());
    let hasUnseenNews = false;

    if (activeNews && activeNews.length > 0) {
      const seenNewsIds = storageService.getSeenNews(currentPid);
      const unseenNews = activeNews.filter(item => !seenNewsIds.includes(item.id));

      if (unseenNews.length > 0) {
        hasUnseenNews = true;
        setNewsItems(unseenNews);
        storageService.markNewsAsSeen(unseenNews.map(n => n.id), currentPid);
        handleOpenModal(VIEWS.NEWS);
      }
    }

    // If no unseen news to show, check and auto-open Daily Spark Vault if available
    if (!hasUnseenNews && !showNewsModal && storageService.canClaimDailyVault(currentPid)) {
      const timer = setTimeout(() => {
        setShowDailyBonusModal(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [appState, activeProfileId, showFirstLaunchOnboardingModal, showProfileSelector, showManualProfileSwitcher, showNewsModal]);

  const handleBuySparksPackage = (pack, skipPinGate = false, source = 'shop') => {
    const enrichedPack = {
      ...pack,
      source: pack.source || (pack.isSubscription ? 'parent_dashboard' : source),
      hub: pack.hub || (pack.source === 'shop' || source === 'shop' ? 'sparks' : undefined),
      mode: pack.mode || 'shop'
    };
    setPendingSparksPurchase(enrichedPack);
    if (skipPinGate) {
      if (authService.getAuthState().isAnonymous) {
        setLinkModalMilestone('Real-Money Purchase Backup');
        const entry = navigationHistory.push({
          type: VIEW_TYPES.MODAL,
          id: VIEWS.ACCOUNT_LINK,
          params: { milestone: 'Real-Money Purchase Backup' }
        });
        applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      } else {
        const checkoutId = enrichedPack.realMoneyPrice ? VIEWS.STRIPE_CHECKOUT : VIEWS.MOCK_CHECKOUT;
        const entry = navigationHistory.push({
          type: VIEW_TYPES.MODAL,
          id: checkoutId
        });
        applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
      }
    } else {
      handleOpenPinGate(source || 'buy_sparks');
    }
  };

  const closeAllNavModals = (except = null) => {
    if (!except) {
      handleNavigateTo('/', 'adaptive_session');
    } else if (except === 'workshop') {
      handleOpenWorkshop();
    } else if (except === 'badges') {
      handleOpenBadgesModal();
    } else if (except === 'ascentRoadmap') {
      handleOpenAscentRoadmapModal();
    } else if (except === 'parents') {
      handleOpenPinGate();
    } else if (except === 'profile') {
      handleOpenModal(VIEWS.PROFILE_SWITCHER);
    }
  };

  const renderNavigationFooter = () => (
    <footer className="sticky bottom-0 z-50 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-xs shrink-0 safe-pb">
      <div className="w-full safe-px px-3 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between sm:justify-around gap-1.5 sm:gap-3 max-w-4xl mx-auto">
        {/* 0. Climb (Main Session) Button: Emerald / Green */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            handleNavigateTo('/', 'adaptive_session');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-100 text-emerald-950 border-2 border-emerald-400 rounded-xl hover:from-emerald-200 hover:to-teal-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'adaptive_session' ? 'ring-2 ring-emerald-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Return to Main Climb Session"
          title="Main Mountain Climb"
        >
          <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 stroke-[2.5]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Climb</span>
        </button>

        {/* 1. Shop Button: Warm Orange */}
        <button
          type="button"
          onClick={() => {
            handleOpenWorkshop(appState === 'adaptive_session' ? 'adaptive_session' : null);
          }}
          className={`relative flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-orange-100 via-orange-50 to-orange-100 text-orange-950 border-2 border-orange-400 rounded-xl hover:from-orange-200 hover:to-orange-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] ${
            isWorkshopOpen ? 'ring-2 ring-orange-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Open Kibo's Shop"
          title="Kibo's Workshop & Shop"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 stroke-[2.5]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Shop</span>
        </button>

        {/* 2. Passport Button: Golden Yellow */}
        <button
          type="button"
          onClick={handleOpenBadgesModal}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-yellow-100 via-yellow-50 to-yellow-100 text-yellow-950 border-2 border-yellow-400 rounded-xl hover:from-yellow-200 hover:to-yellow-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] relative ${
            showBadgesModal ? 'ring-2 ring-yellow-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          title="View Climber Passport & Mountain Records"
          aria-label="Climber Passport"
        >
          <div className="relative">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 stroke-[2.5]" />
            {unseenBadgesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[0.95rem] h-3.5 px-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full border border-white flex items-center justify-center animate-pulse leading-none shadow-xs">
                {unseenBadgesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Passport</span>
        </button>

        {/* 3. Leaderboard Button: Sapphire Blue */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            handleNavigateTo('/leaderboard', 'leaderboard');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-indigo-100 via-blue-50 to-indigo-100 text-indigo-950 border-2 border-indigo-400 rounded-xl hover:from-indigo-200 hover:to-blue-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] relative ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'leaderboard' ? 'ring-2 ring-indigo-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Leaderboard"
          title="Leaderboard"
        >
          <div className="relative">
            <Crown className={`w-4 h-4 sm:w-5 sm:h-5 text-indigo-700 stroke-[2.5] ${!isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'leaderboard' ? 'fill-indigo-300' : ''}`} />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Rank</span>
        </button>

        {/* 4. Quests Button: Royal Purple / Violet (Direct 1-Tap) */}
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            handleNavigateTo('/quests', 'quests');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-1 bg-gradient-to-b from-purple-100 via-fuchsia-50 to-purple-100 text-purple-950 border-2 border-purple-400 rounded-xl hover:from-purple-200 hover:to-fuchsia-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer flex-1 min-w-0 max-w-[5rem] sm:max-w-[5.5rem] relative ${
            !isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'quests' ? 'ring-2 ring-purple-500 scale-[1.02] sm:scale-105 font-bold' : ''
          }`}
          aria-label="Mountain Quests"
          title="Mountain Quests"
        >
          <div className="relative">
            <Scroll className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-700 stroke-[2.5] ${!isWorkshopOpen && !showBadgesModal && !showManualProfileSwitcher && !showPinGateModal && !showParentDashboard && appState === 'quests' ? 'fill-purple-300' : ''}`} />
            {questService.getUnclaimedCount(activeProfileId) > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[0.95rem] h-3.5 px-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full border border-white flex items-center justify-center animate-bounce leading-none">
                {questService.getUnclaimedCount(activeProfileId)}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-wide truncate">Quests</span>
        </button>
      </div>
    </footer>
  );

  if (showCinematicSplash) {
    return <CinematicSplash onComplete={() => setShowCinematicSplash(false)} />;
  }

  return (
    <div className="app-viewport-root w-full h-full relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col">
      {/* Subject Background Wallpaper */}
      <SubjectWallpaper activeSubject={activeSubject} />
      {isOffline && (
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white border-b border-teal-800 px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-black z-50 shadow-xs">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>✈️ Offline Practice Active: All climbs work without Wi-Fi. Progress will sync to cloud when connected.</span>
        </div>
      )}
      {/* Sticky Top HUD Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between shadow-xs shrink-0">
        {/* Brand Logo, User Profile & Stats */}
        <div className="flex items-center gap-2 w-full justify-between max-w-4xl mx-auto min-w-0">
          {/* 1. Active Profile Username / Avatar Dropdown (Top Left) */}
          <div className="relative shrink-0" ref={profileDropdownRef}>
            {(() => {
              const userPlanTier = storageService.getPlanTier(activeProfileId);
              return (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 text-white border-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer group shrink-0 ${
                    userPlanTier === 'family'
                      ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 border-amber-200 ring-2 ring-purple-400/80 shadow-[0_0_22px_rgba(245,158,11,0.6),0_0_35px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8),0_0_45px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95'
                      : userPlanTier === 'solo'
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 border-amber-200 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.45)] hover:shadow-[0_0_20px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95'
                      : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 border-sky-300 shadow-2xs hover:scale-105 active:scale-95'
                  }`}
                  title={`Climber Profile: ${activeProfile?.username || activeProfile?.name || 'Climber'}${userPlanTier === 'family' ? ' (Kibo Club Family Plan)' : userPlanTier === 'solo' ? ' (Kibo Club Solo Plan)' : ' (Free Plan)'}`}
                  aria-expanded={showProfileDropdown}
                >
                  <div className="relative">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 text-white uppercase shadow-2xs ${
                      userPlanTier === 'family'
                        ? 'bg-gradient-to-tr from-purple-700 via-pink-500 to-amber-300 border-2 border-amber-100 ring-2 ring-purple-300/90 shadow-[0_0_10px_rgba(236,72,153,0.8)]'
                        : userPlanTier === 'solo'
                        ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-amber-100 ring-2 ring-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                        : 'bg-white/25 border-white/40'
                    }`}>
                      {(activeProfile?.username || activeProfile?.name || 'C')[0].toUpperCase()}
                    </div>
                    {pendingFriendRequestsCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"
                        title={`${pendingFriendRequestsCount} notification${pendingFriendRequestsCount > 1 ? 's' : ''}`}
                      />
                    )}
                  </div>
                  <span className={`hidden md:inline truncate tracking-tight font-black max-w-[140px] lg:max-w-[180px] ${
                    userPlanTier === 'family'
                      ? 'text-yellow-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                      : userPlanTier === 'solo'
                      ? 'text-amber-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                      : ''
                  }`}>
                    {activeProfile?.username || activeProfile?.name || 'Climber'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-white/80 group-hover:text-white transition-transform duration-200 shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
              );
            })()}

            {showProfileDropdown && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Current Active Profile Card */}
                {(() => {
                  const userPlanTier = storageService.getPlanTier(activeProfileId);
                  return (
                    <div className={`p-3 border-b border-slate-200 ${
                      userPlanTier === 'family'
                        ? 'bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-amber-50/80 border-b-purple-200'
                        : userPlanTier === 'solo'
                        ? 'bg-gradient-to-br from-amber-50/70 to-orange-50/50'
                        : 'bg-gradient-to-br from-slate-50 to-sky-50/50'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-base font-black shadow-xs border-2 border-white shrink-0 ${
                          userPlanTier === 'family'
                            ? 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 ring-2 ring-purple-300 shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                            : userPlanTier === 'solo'
                            ? 'bg-gradient-to-tr from-amber-500 to-orange-600 ring-2 ring-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'bg-gradient-to-tr from-sky-500 to-indigo-600'
                        }`}>
                          {(activeProfile?.username || activeProfile?.name || 'C')[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-sm font-black text-slate-800 truncate leading-tight" title={activeProfile?.username || activeProfile?.name || 'Kibo Climber'}>
                              {activeProfile?.username || activeProfile?.name || 'Kibo Climber'}
                            </span>
                            {userPlanTier === 'family' ? (
                              <span className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-purple-300">
                                👑 FAMILY
                              </span>
                            ) : userPlanTier === 'solo' ? (
                              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-amber-300">
                                ⭐ CLUB
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                              <Star className="w-3 h-3 fill-sky-500 text-sky-500 inline shrink-0" />
                              {liveCompetenceRating} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Switch Profiles List */}
                <div className="p-2 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Switch Climber
                  </div>
                  {allProfiles
                    .filter((p) => p.id !== activeProfileId)
                    .map((profile) => {
                      const isLocked = storageService.isProfileLocked(profile.id);
                      const profilePlanTier = storageService.getPlanTier(profile.id);
                      const pRating = profile.userData?.subjects?.[activeSubject]?.competenceRank ||
                        profile.userData?.competenceRank ||
                        1000;
                      const pName = profile.username || profile.name || 'Climber';
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            if (isLocked) {
                              setShowProfileDropdown(false);
                              handleOpenModal(VIEWS.FAMILY_UPGRADE);
                              return;
                            }
                            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile.id) || 'math';
                            storageService.setLastActiveSubject(targetSubject, profile.id);
                            storageService.setActiveProfileId(profile.id);
                            setActiveProfileId(profile.id);
                            setActiveSubject(targetSubject);
                            syncAppStateWithStorage(targetSubject);
                            setShowProfileDropdown(false);
                            const targetPath = SUBJECT_ROUTES[targetSubject] || `/${targetSubject}`;
                            navigationHistory.reset({
                              type: VIEW_TYPES.ROUTE,
                              id: VIEWS.ADAPTIVE_SESSION,
                              path: targetPath,
                              params: { subject: targetSubject }
                            });
                            applyNavState(navigationHistory.getCurrent(), navigationHistory.getStack(), navigationHistory.getBaseRoute());
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors text-left cursor-pointer group w-full ${
                            isLocked
                              ? 'opacity-60 bg-slate-50/50 hover:bg-slate-100 hover:opacity-80 border border-slate-200'
                              : 'hover:bg-slate-100 active:bg-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                            <div className="relative shrink-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center text-xs font-black border border-white/60 shadow-2xs group-hover:scale-105 transition-transform">
                                {pName[0].toUpperCase()}
                              </div>
                              {isLocked && (
                                <div className="absolute -top-1 -right-1 bg-slate-700 rounded-full p-0.5 border border-white shadow-xs">
                                  <Lock className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="text-xs font-black text-slate-700 truncate group-hover:text-slate-900" title={pName}>
                                  {pName}
                                </span>
                                {profilePlanTier === 'family' ? (
                                  <span className="text-[9px] bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black px-1 py-0.2 rounded shrink-0">
                                    👑
                                  </span>
                                ) : profilePlanTier === 'solo' ? (
                                  <span className="text-[9px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1 py-0.2 rounded shrink-0">
                                    ⭐
                                  </span>
                                ) : null}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 shrink-0">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 inline shrink-0" />
                                {pRating} pts
                              </span>
                            </div>
                          </div>
                          {isLocked && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                              Locked
                            </span>
                          )}
                        </button>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleOpenModal(VIEWS.PROFILE_SWITCHER);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-amber-50 text-amber-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                      <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>Manage Profiles</span>
                  </button>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Kibo Club / Membership Status in Dropdown */}
                <div className="p-2 bg-amber-50/60 border-y border-amber-100/60 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleOpenModal(VIEWS.FAMILY_UPGRADE);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>{isKiboClub ? 'Kibo Club Active (1.25x)' : 'Join Kibo Club'}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">
                      {isKiboClub ? 'Perks' : 'Upgrade'}
                    </span>
                  </button>

                  {/* Share & Earn 500 Sparks Quick Link */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowProfileDropdown(false);
                      handleOpenModal(VIEWS.SHARE);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-black text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Share & Earn Sparks</span>
                    </div>
                    <span className="flex items-center gap-0.5 text-[10px] bg-amber-500 text-amber-950 font-black px-1.5 py-0.5 rounded-md shadow-xs border border-amber-600">
                      <span>+500</span>
                      <Zap className="w-3 h-3 text-amber-950 fill-amber-300 stroke-[2.5]" />
                    </span>
                  </button>
                </div>


                <div className="h-px bg-slate-100 w-full" />

                {/* Parent Zone & Settings Quick Links */}
                <div className="p-2 bg-slate-50/50 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleOpenPinGate('profile_dropdown', 'overview', null);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-50 text-purple-800 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                    <span>Parent Zone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleNavigateTo('/settings', 'settings');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
                    <span>Settings</span>
                  </button>

                  {!currentAuthState.isAnonymous ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playKeyTap();
                          setShowSavedTooltip(!showSavedTooltip);
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer w-full text-left font-black text-xs ${
                          showSavedTooltip ? 'bg-emerald-100/80 text-emerald-800' : 'hover:bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          {syncStatus === 'syncing' ? (
                            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          ) : (
                            <Cloud className={`w-3.5 h-3.5 text-emerald-600 stroke-[2.2] transition-transform duration-300 ${
                              syncStatus === 'pulse' ? 'scale-125 text-emerald-500' : ''
                            }`} />
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow-xs border border-white flex items-center justify-center">
                            <Check className="w-2 h-2 text-white stroke-[3.5]" />
                          </div>
                        </div>
                        <span className="truncate">
                          {syncStatus === 'syncing' ? 'Syncing...' : 'Saved'}
                        </span>
                      </button>

                      {showSavedTooltip && (
                        <div className="mt-1.5 p-2.5 bg-slate-900 text-white rounded-xl shadow-inner text-[11px] font-bold border border-slate-700 animate-in fade-in duration-150">
                          <p className="text-slate-200 leading-snug">
                            All badges and progress are saved to{' '}
                            <span className="text-emerald-400 font-extrabold underline decoration-emerald-500/50 break-all">
                              {currentAuthState.email || 'your account'}
                            </span>.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playKeyTap();
                              setShowSavedTooltip(false);
                              setShowProfileDropdown(false);
                              handleOpenPinGate('profile_dropdown', 'overview', null);
                            }}
                            className="mt-2 flex items-center text-teal-300 hover:text-teal-200 font-black text-xs transition-colors cursor-pointer"
                          >
                            <span>Manage in Parent Zone →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowProfileDropdown(false);
                        handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Save Progress' });
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-sky-50 text-sky-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                    >
                      <Cloud className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" />
                      <span>Save Progress</span>
                    </button>
                  )}

                  {currentAuthState.isAnonymous ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowProfileDropdown(false);
                        handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Restore Account' });
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 text-indigo-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                    >
                      <LogIn className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                      <span>Log In</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowProfileDropdown(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 text-rose-700 font-black text-xs transition-colors cursor-pointer w-full text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Brand Anchor: Logo + Name (Top Center) */}
          <button
            type="button"
            onClick={() => {
              handleNavigateTo('/', 'adaptive_session');
            }}
            className="flex items-center px-1.5 sm:px-2.5 py-1 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer group select-none shrink-0"
            title="Kibo Climb Home"
          >
            <span className="flex items-center font-black text-base sm:text-lg tracking-tight text-slate-800 group-hover:text-amber-600 transition-colors uppercase">
              KIB
              <img
                src="/favicon.svg"
                alt="O"
                className="w-5 h-5 sm:w-6 sm:h-6 mx-0.5 object-contain group-hover:scale-110 transition-transform drop-shadow-xs inline-block"
              />
              <span className="hidden sm:inline ml-1">CLIMB</span>
            </span>
          </button>

          {/* 3. Right HUD Stats & Shortcuts */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Global Climber Ascent & Level Button (Visible on all devices) */}
            {(() => {
              const questState = questService.getQuests(activeProfileId);
              const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer', icon: '🏕️', ascentTier: 1, progressPct: 0 };
              return (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAscentRoadmapModal();
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white border-2 border-teal-300 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                  title={`Expedition Level Roadmap: Ascent ${questLevelInfo.ascentTier} • Lv. ${questLevelInfo.level} (${questLevelInfo.title}) • ${questLevelInfo.progressPct || 0}% to next level`}
                >
                  <span className="text-xs sm:text-sm leading-none select-none">{questLevelInfo.icon || '🏕️'}</span>
                  <span className="font-black truncate">Lv. {questLevelInfo.level}</span>
                  <div className="hidden sm:block w-8 sm:w-10 h-1.5 bg-black/25 rounded-full overflow-hidden shrink-0 border border-white/20">
                    <div
                      className="h-full bg-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${questLevelInfo.progressPct || 0}%` }}
                    />
                  </div>
                </button>
              );
            })()}

            {/* Competence Rank Button (Visible on all devices) */}
            {(() => {
              const rankTitle = getCompetenceRankTier(liveCompetenceRating, activeSubject);
              return (
                <button
                  type="button"
                  onClick={handleOpenBadgesModal}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-200 text-purple-950 border-2 border-purple-400 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 relative overflow-visible cursor-pointer hover:border-purple-500"
                  title={`Competence Rank: ${liveCompetenceRating} pts (${rankTitle})`}
                >
                  <RollingNumberTicker
                    value={liveCompetenceRating}
                    profileId={activeProfileId}
                    subjectId={activeSubject}
                    icon={<Star className="w-3.5 h-3.5 text-purple-700 fill-purple-300 stroke-[2]" />}
                  />
                </button>
              );
            })()}

            {/* Sparks Counter Button (Visible on all devices) */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                handleOpenWorkshop('adaptive_session', 'sparks', 'shop');
              }}
              className="flex items-center gap-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-950 border-2 border-yellow-500 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all relative shrink-0 overflow-visible cursor-pointer"
              title="Open Kibo Workshop"
            >
              <RollingNumberTicker
                value={sparks}
                icon={<Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 fill-amber-500 stroke-[2.5] ${isSparksBouncing ? 'animate-bounce' : ''}`} />}
                profileId={activeProfileId}
                subjectId={activeSubject}
              />
            </button>

            {/* Streak Badge Button */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-2 border-rose-300 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 relative overflow-visible cursor-pointer"
              title={(consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0 ? "Daily Streak & Shield Active! 🛡️" : `Daily Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
              onClick={handleOpenBadgesModal}
            >
              <RollingNumberTicker
                value={streak}
                suffix={` ${streak === 1 ? 'd' : 'd'}`}
                profileId={activeProfileId}
                subjectId={activeSubject}
                icon={<Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 shrink-0 ${!isStreakCompletedToday ? 'animate-pulse' : ''}`} />}
              />
              {((consumables?.streakSaverCount || 0) > 0 || (consumables?.shieldCount || 0) > 0) && (
                <span className="inline-flex items-center justify-center bg-white/95 rounded-full w-3.5 h-3.5 text-[10px] ml-0.5 animate-pulse shadow-2xs border border-rose-200 leading-none shrink-0" title="Kibo Shield Active">
                  🛡️
                </span>
              )}
            </button>

            {/* Friends Button (Available on all screen sizes) */}
            <button
              type="button"
              onClick={() => {
                handleOpenModal(VIEWS.FRIENDS);
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white border-2 border-sky-300 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer relative mr-1 sm:mr-0"
              title={`Friends (${friendsCount})${pendingFriendRequestsCount > 0 ? ` • ${pendingFriendRequestsCount} pending request${pendingFriendRequestsCount > 1 ? 's' : ''}` : ''}`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              {friendsCount > 0 && (
                <span className="inline-flex items-center justify-center bg-white text-sky-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs leading-tight">
                  {friendsCount}
                </span>
              )}
              {pendingFriendRequestsCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-4.5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-md flex items-center justify-center animate-bounce leading-none"
                  title={`${pendingFriendRequestsCount} new friend request${pendingFriendRequestsCount > 1 ? 's' : ''}!`}
                >
                  {pendingFriendRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-1 sm:p-2 relative min-h-0 overflow-y-auto hide-scrollbar">

      {/* In-Content Subject Selector Bar */}
      {appState === 'adaptive_session' && (
        <div className="w-full mb-2 sm:mb-3 flex items-center justify-center gap-2 px-1 shrink-0">
          {/* Mobile Subject Dropdown (< sm) */}
          <div className="relative sm:hidden w-48 max-w-[220px]" ref={subjectDropdownRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowSubjectDropdown(!showSubjectDropdown);
              }}
              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs border-2 ${
                activeSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50'
                  : activeSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50'
                  : activeSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50'
              }`}
              title="Switch Subject"
              aria-expanded={showSubjectDropdown}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none select-none">
                  {activeSubject === 'math' ? '🔢' : activeSubject === 'words' ? '📚' : activeSubject === 'world' ? '🌍' : '💻'}
                </span>
                <span className="tracking-tight capitalize">{activeSubject}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Subject Roll-down Menu */}
            {showSubjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Math Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('math');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'math'
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔢</span>
                    <span>Kibo Math</span>
                  </div>
                  {activeSubject === 'math' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                </button>

                {/* Words Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('words');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'words'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📚</span>
                    <span>Kibo Words</span>
                  </div>
                  {activeSubject === 'words' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>

                {/* World Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('world');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'world'
                      ? 'bg-teal-100 border-teal-300 text-teal-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span>Kibo World</span>
                  </div>
                  {activeSubject === 'world' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </button>

                {/* Coding Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleSubjectChange('coding');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    activeSubject === 'coding'
                      ? 'bg-rose-100 border-rose-300 text-rose-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💻</span>
                    <span>Kibo Coding</span>
                  </div>
                  {activeSubject === 'coding' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                </button>

                {/* Coming Soon Teasers (Money & Music in Mobile Menu) */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black bg-slate-50/80 border border-dashed border-emerald-300 text-slate-700 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💰</span>
                    <span>Kibo Money</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 leading-none">
                    Coming Soon
                  </span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black bg-slate-50/80 border border-dashed border-purple-300 text-slate-700 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎵</span>
                    <span>Kibo Music</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 leading-none">
                    Coming Soon
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Subject Bar (>= sm) */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 w-full sm:w-auto">
            {/* Kibo Math */}
            <button
              type="button"
              onClick={() => handleSubjectChange('math')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-white/90 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-200'
              }`}
              title="Switch to Kibo Math"
            >
              <span className="text-sm sm:text-base leading-none select-none">🔢</span>
              <span className="tracking-tight">Math</span>
              {activeSubject === 'math' && <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse" />}
            </button>

            {/* Kibo Words */}
            <button
              type="button"
              onClick={() => handleSubjectChange('words')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50 scale-105'
                  : 'bg-white/90 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200'
              }`}
              title="Switch to Kibo Words"
            >
              <span className="text-sm sm:text-base leading-none select-none">📚</span>
              <span className="tracking-tight">Words</span>
              {activeSubject === 'words' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo World */}
            <button
              type="button"
              onClick={() => handleSubjectChange('world')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50 scale-105'
                  : 'bg-white/90 hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-200'
              }`}
              title="Switch to Kibo World"
            >
              <span className="text-sm sm:text-base leading-none select-none">🌍</span>
              <span className="tracking-tight">World</span>
              {activeSubject === 'world' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo Coding */}
            <button
              type="button"
              onClick={() => handleSubjectChange('coding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                activeSubject === 'coding'
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50 scale-105'
                  : 'bg-white/90 hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-200'
              }`}
              title="Switch to Kibo Coding"
            >
              <span className="text-sm sm:text-base leading-none select-none">💻</span>
              <span className="tracking-tight">Coding</span>
              {activeSubject === 'coding' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Coming Soon Teasers (Money & Music) */}
            <button
              type="button"
              disabled
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-white/90 border-2 border-dashed border-emerald-300 text-slate-700 shadow-2xs shrink-0 select-none cursor-not-allowed"
              title="Kibo Money - Coming Soon"
            >
              <span className="text-sm sm:text-base leading-none select-none">💰</span>
              <span className="tracking-tight">Money</span>
              <span className="absolute -top-2 -right-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs leading-none whitespace-nowrap">
                Coming Soon
              </span>
            </button>
            <button
              type="button"
              disabled
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-white/90 border-2 border-dashed border-purple-300 text-slate-700 shadow-2xs shrink-0 select-none cursor-not-allowed"
              title="Kibo Music - Coming Soon"
            >
              <span className="text-sm sm:text-base leading-none select-none">🎵</span>
              <span className="tracking-tight">Music</span>
              <span className="absolute -top-2 -right-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs leading-none whitespace-nowrap">
                Coming Soon
              </span>
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS SCREEN */}
      {appState === 'settings' && (
        <SettingsScreen
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          renderFooter={renderNavigationFooter}
          onNavigate={handleNavigateTo}
          onBack={handleGoBack}
          onOpenFeedback={() => handleOpenModal(VIEWS.FEEDBACK)}
          onOpenParentZone={(targetTab = 'overview') => {
            handleOpenPinGate('settings_screen', targetTab, null);
          }}
          onSwitchProfile={() => {
            handleOpenModal(VIEWS.PROFILE_SWITCHER);
          }}
        />
      )}

      {/* PRIVACY POLICY SCREEN */}
      {appState === 'privacy' && (
        <PrivacyPolicyScreen
          onBack={handleGoBack}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* TERMS OF SERVICE SCREEN */}
      {appState === 'terms' && (
        <TermsOfServiceScreen
          onBack={handleGoBack}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* PARENT DASHBOARD SCREEN */}
      {(appState === 'parent_dashboard' || appState === VIEWS.PARENT_DASHBOARD) && (
        <ParentDashboardModal
          initialTab={parentDashboardTab}
          highlightSection={parentDashboardHighlight}
          activeSubject={activeSubject}
          isOpen={true}
          onBack={() => {
            setParentDashboardTab('overview');
            setParentDashboardHighlight(null);
            handleGoBack();
          }}
          onClose={() => {
            setParentDashboardTab('overview');
            setParentDashboardHighlight(null);
            handleGoBack();
          }}
          currentPin={parentPin}
          onUpdatePin={handleUpdatePin}
          tier={tier}
          onSetTier={handleSetTierManual}
          streak={streak}
          sparks={sparks}
          practiceQueueCount={practiceQueue.length}
          practiceQueue={practiceQueue}
          sprintHistory={[]}
          practiceDays={practiceDays}
          onUpdatePracticeDays={handleUpdatePracticeDays}
          onProfileSwitch={() => syncAppStateWithStorage()}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          unlockedBadges={unlockedBadges}
          totalProblemsSolved={totalProblemsSolved}
          personalRecords={personalRecords}
          onAccountLinked={(user, newSparks) => {
            if (newSparks !== undefined) {
              setSparks(newSparks);
            }
            syncAppStateWithStorage();
          }}
          onOpenSubscription={(planId) => {
            const item = getItemById(planId);
            const pricing = getEffectiveSubscriptionPricing(planId, new Date());
            const activePrice = pricing.price;

            if (item) {
              handleBuySparksPackage({
                ...item,
                price: activePrice || item.realMoneyPrice || item.price,
                realMoneyPrice: activePrice || item.realMoneyPrice || item.price,
                source: 'parent_dashboard',
                tab: parentDashboardTab || 'verification',
                highlight: parentDashboardHighlight || 'family_plan'
              }, true);
            } else if (planId?.includes('family')) {
              handleBuySparksPackage({
                id: planId,
                name: planId.includes('annual') ? 'Kibo Club Family (Annual)' : 'Kibo Club Family',
                realMoneyPrice: activePrice || (planId.includes('annual') ? '$59.99/yr' : '$7.99/mo'),
                price: activePrice || (planId.includes('annual') ? '$59.99/yr' : '$7.99/mo'),
                isSubscription: true,
                isFamilyPlan: true,
                source: 'parent_dashboard',
                tab: parentDashboardTab || 'verification',
                highlight: parentDashboardHighlight || 'family_plan',
                description: 'Kibo Club for the whole family! ALL child profiles get the 1.25x Spark Multiplier, golden tag, and 100 daily Sparks.'
              }, true);
            } else {
              handleBuySparksPackage({
                id: planId || 'kibo_club_sub',
                name: planId?.includes('annual') ? 'Kibo Club Solo (Annual)' : 'Kibo Club Solo',
                realMoneyPrice: activePrice || (planId?.includes('annual') ? '$39.99/yr' : '$4.99/mo'),
                price: activePrice || (planId?.includes('annual') ? '$39.99/yr' : '$4.99/mo'),
                isSubscription: true,
                isFamilyPlan: false,
                source: 'parent_dashboard',
                tab: parentDashboardTab || 'verification',
                highlight: parentDashboardHighlight || 'family_plan',
                description: 'Permanent 1.25x Spark Multiplier + Exclusive Daily Rewards for this profile!'
              }, true);
            }
          }}
          onOpenFamilyUpgrade={() => {
            const pricing = getEffectiveSubscriptionPricing('kibo_club_family_annual', new Date());
            handleBuySparksPackage({
              id: 'kibo_club_family_annual',
              name: 'Kibo Club Family (Annual)',
              realMoneyPrice: pricing.price || '$59.99/yr',
              price: pricing.price || '$59.99/yr',
              isSubscription: true,
              isFamilyPlan: true,
              source: 'parent_dashboard',
              tab: 'verification',
              highlight: 'family_plan',
              description: 'Kibo Club for the whole family! ALL child profiles get the 1.25x Spark Multiplier, golden tag, and 100 daily Sparks.'
            }, true);
          }}
          onOpenWorkshop={(targetHub = 'wearables', targetMode = 'shop') => {
            handleOpenWorkshop(null, targetHub, targetMode);
          }}
          onRedeemPromoCode={handleRedeemPromoCode}
          renderFooter={renderNavigationFooter}
        />
      )}

      {/* LEADERBOARD SCREEN */}
      {appState === 'leaderboard' && (
        <LeaderboardScreen
          activeSubject={activeSubject}
          userState={{
            competenceRank: liveCompetenceRating,
            adaptiveCompetenceRating: liveCompetenceRating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak
          }}
          renderFooter={renderNavigationFooter}
          equippedItems={equippedItems}
          onBack={handleGoBack}
        />
      )}

      {/* QUESTS SCREEN */}
      {appState === 'quests' && (
        <QuestsScreen
          activeSubject={activeSubject}
          sparks={sparks}
          userState={{
            competenceRank: liveCompetenceRating,
            adaptiveCompetenceRating: liveCompetenceRating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak
          }}
          onNavigate={handleNavigateTo}
          onBack={handleGoBack}
          renderFooter={renderNavigationFooter}
          onAwardReward={(reward = {}) => {
            if (reward.sparks) {
              const clubMultiplier = isKiboClub ? 1.25 : 1;
              const finalEarned = Math.round(reward.sparks * clubMultiplier);
              const updated = (sparks || 0) + finalEarned;
              setSparks(updated);
              storageService.saveUserData({ sparks: updated }, activeSubject);
            }
            const curConsumables = consumables || storageService.getConsumables(activeProfileId);
            let nextShieldCount = curConsumables.shieldCount ?? 1;
            let overflowSparksBonus = 0;
            if (reward.shields) {
              const totalShields = nextShieldCount + reward.shields;
              if (totalShields > 2) {
                const overflow = totalShields - 2;
                nextShieldCount = 2;
                overflowSparksBonus = overflow * 25; // Bonus sparks for overflow shields
              } else {
                nextShieldCount = totalShields;
              }
            }
            const nextConsumables = {
              ...curConsumables,
              shieldCount: nextShieldCount,
              doubleSparksPotionCount: (curConsumables.doubleSparksPotionCount || 0) + (reward.potions || 0),
              hintScrollCount: (curConsumables.hintScrollCount || 0) + (reward.scrolls || 0),
              letterSpyglassCount: (curConsumables.letterSpyglassCount || 0) + (reward.spyglasses || 0),
              letterPrunerCount: (curConsumables.letterPrunerCount || 0) + (reward.pruners || 0),
              explorerCompassCount: (curConsumables.explorerCompassCount || 0) + (reward.compasses || 0)
            };
            setConsumables(nextConsumables);
            setStreakShields(nextShieldCount);
            storageService.saveConsumables(nextConsumables, activeProfileId);
            storageService.saveUserData({ consumables: nextConsumables, streakShields: nextShieldCount }, activeSubject);

            if (overflowSparksBonus > 0) {
              const updatedSparks = (sparks || 0) + overflowSparksBonus;
              setSparks(updatedSparks);
              storageService.saveUserData({ sparks: updatedSparks }, activeSubject);
            }

            if (reward.newlyUnlockedBadges && reward.newlyUnlockedBadges.length > 0) {
              const newBadgeIds = reward.newlyUnlockedBadges.map(b => (typeof b === 'string' ? b : b.id)).filter(Boolean);
              setUnlockedBadges(prev => Array.from(new Set([...(prev || []), ...newBadgeIds])));
              setNewlyUnlockedBadges(reward.newlyUnlockedBadges);
            }
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = (sparks || 0) + finalEarned;
            setSparks(updated);
            storageService.saveUserData({ sparks: updated }, activeSubject);
          }}
        />
      )}

      {/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {appState === 'adaptive_session' && activeSubject === 'math' && (
        <MathSessionView
          key={activeProfileId + '-math'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeLetterSpyglass={handleConsumeLetterSpyglass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: false }))}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'words' && (
        <WordsSessionView
          key={activeProfileId + '-words'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeLetterSpyglass={handleConsumeLetterSpyglass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: false }))}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'world' && (
        <WorldSessionView
          key={activeProfileId + '-world'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeExplorerCompass={handleConsumeExplorerCompass}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: false }))}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'coding' && (
        <CodingSessionView
          key={activeProfileId + '-coding'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeLetterPruner={handleConsumeLetterPruner}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setDoubleSparksActiveBySubject(prev => ({ ...prev, [activeSubject]: false }))}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => {
            const newBadges = newList.filter(b => !unlockedBadges.find(ub => ub.id === b.id));
            newBadges.forEach(b => analyticsService.logBadgeUnlocked(b.id, activeSubject));
            setUnlockedBadges(newList);
          }}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const clubMultiplier = isKiboClub ? 1.25 : 1;
            const finalEarned = Math.round(earned * clubMultiplier);
            const updated = sparks + finalEarned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
            analyticsService.logEarnVirtualCurrency(finalEarned, 'session_reward');
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {/* PROFILE SELECTOR — shown on every load when 2+ profiles exist */}
      {showProfileSelector && (
        <ProfileSelectorScreen
          onSelectProfile={(profile) => {
            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile?.id) || 'math';
            storageService.setLastActiveSubject(targetSubject, profile?.id);
            setActiveSubject(targetSubject);
            syncAppStateWithStorage(targetSubject);
            setShowProfileSelector(false);
            const targetPath = SUBJECT_ROUTES[targetSubject] || `/${targetSubject}`;
            navigationHistory.reset({
              type: VIEW_TYPES.ROUTE,
              id: VIEWS.ADAPTIVE_SESSION,
              path: targetPath,
              params: { subject: targetSubject }
            });
            applyNavState(navigationHistory.getCurrent(), navigationHistory.getStack(), navigationHistory.getBaseRoute());
            validateStreakForActiveProfile(targetSubject);
          }}
          onOpenParentZone={(targetTab = 'overview', targetHighlight = 'family_plan') => {
            handleOpenPinGate('profile_selector', targetTab, targetHighlight);
          }}
          onRequestLogin={() => {
            handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Account Sync' });
          }}
        />
      )}

      {/* MANUAL PROFILE SELECTOR */}
      {showManualProfileSwitcher && (
        <ProfileSelectorScreen
          canClose={true}
          onSelectProfile={(profile) => {
            const targetSubject = profile?.lastActiveSubject || storageService.getLastActiveSubject(profile?.id) || 'math';
            storageService.setLastActiveSubject(targetSubject, profile?.id);
            setActiveSubject(targetSubject);
            syncAppStateWithStorage(targetSubject);
            const targetPath = SUBJECT_ROUTES[targetSubject] || `/${targetSubject}`;
            navigationHistory.reset({
              type: VIEW_TYPES.ROUTE,
              id: VIEWS.ADAPTIVE_SESSION,
              path: targetPath,
              params: { subject: targetSubject }
            });
            applyNavState(navigationHistory.getCurrent(), navigationHistory.getStack(), navigationHistory.getBaseRoute());
            validateStreakForActiveProfile(targetSubject);
          }}
          onRequestLogin={() => {
            handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Account Sync' });
          }}
          onClose={handleGoBack}
          onOpenParentZone={(targetTab = 'overview', targetHighlight = 'family_plan') => {
            handleOpenPinGate('manual_profile_switcher', targetTab, targetHighlight);
          }}
        />
      )}

      {/* FIRST LAUNCH ONBOARDING MODAL */}
      <FirstLaunchOnboardingModal
        isOpen={showFirstLaunchOnboardingModal}
        equippedItems={equippedItems}
        hasVisitedParentZone={hasVisitedParentZone}
        onUsernameSet={(username) => {
          storageService.updateProfile(storageService.getActiveProfileId(), { name: username });
          syncAppStateWithStorage();
        }}
        onOpenParentZone={(targetTab = 'overview') => {
          syncAppStateWithStorage();
          storageService.setOnboarded(true);
          setShowFirstLaunchOnboardingModal(false);
          handleOpenPinGate('onboarding', targetTab, null);
        }}
        onStartAdaptiveClimb={(startingSubject = 'math') => {
          const validSubject = (startingSubject === 'words' || startingSubject === 'math' || startingSubject === 'world' || startingSubject === 'coding') ? startingSubject : 'math';
          storageService.setLastActiveSubject(validSubject);
          setActiveSubject(validSubject);
          syncAppStateWithStorage(validSubject);
          setShowFirstLaunchOnboardingModal(false);
          const targetPath = SUBJECT_ROUTES[validSubject] || `/${validSubject}`;
          navigationHistory.reset({
            type: VIEW_TYPES.ROUTE,
            id: VIEWS.ADAPTIVE_SESSION,
            path: targetPath,
            params: { subject: validSubject }
          });
          applyNavState(navigationHistory.getCurrent(), navigationHistory.getStack(), navigationHistory.getBaseRoute());
        }}
        onRequestLogin={() => {
          handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Restore Account' });
        }}
      />

      {/* STREAK SAVED MODAL */}
      <StreakSavedModal
        isOpen={showStreakSavedModal}
        onClose={() => setShowStreakSavedModal(false)}
        streak={streak}
        remainingShields={streakShields}
      />

      {/* DAILY STREAK INCREASED MODAL */}
      <DailyStreakIncreasedModal
        isOpen={showDailyStreakIncreasedModal && !perfectMonthData && !showMultiSubjectBonusModal}
        onClose={() => setShowDailyStreakIncreasedModal(false)}
        streak={streak}
      />

      {/* MULTI-SUBJECT DAILY BONUS CHEST MODAL */}
      {showMultiSubjectBonusModal && (
        <div
          onClick={() => setShowMultiSubjectBonusModal(false)}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <ConfettiCanvas />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-b from-amber-50 via-white to-yellow-50 border-4 border-amber-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 relative overflow-hidden text-slate-800 cursor-default"
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 px-3 py-1 rounded-full border border-amber-400 inline-block shadow-xs">
                🌟 Multi-Subject Daily Bonus!
              </span>
              <h3 className="text-2xl font-black text-slate-900">Well-Rounded Explorer!</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                You conquered climbs across 2+ different subjects today! Mount Kibo rewards your broad curiosity.
              </p>
            </div>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-600 flex items-center justify-center text-4xl shadow-md animate-bounce">
              🎁
            </div>

            <div className="space-y-2">
              <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-amber-950 font-black text-sm shadow-xs">
                <Zap className="w-5 h-5 text-amber-600 fill-amber-400 stroke-[2.5]" />
                <span>+{multiSubjectBonusData?.bonus?.sparks || 75} Bonus Sparks! ⚡</span>
              </div>
              <div className="bg-teal-100 border-2 border-teal-300 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-teal-950 font-black text-sm shadow-xs">
                <span>🏔️ +{multiSubjectBonusData?.bonus?.altitude || 100}m Altitude XP!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMultiSubjectBonusModal(false)}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 transition-all cursor-pointer"
            >
              Claim Daily Chest! 🚀
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL ASCENT LEVEL UP MODAL */}
      {globalAscentLevelUpEvent && (
        <div
          onClick={() => setGlobalAscentLevelUpEvent(null)}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <ConfettiCanvas />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-b from-teal-50 via-white to-emerald-50 border-4 border-teal-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 relative overflow-hidden text-slate-800 cursor-default"
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-teal-950 bg-teal-200 px-3 py-1 rounded-full border border-teal-400 inline-block shadow-xs">
                {globalAscentLevelUpEvent.isSummit ? '👑 Summit Promotion!' : '🏔️ Climber Level Up!'}
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {globalAscentLevelUpEvent.isSummit
                  ? `Ascent ${globalAscentLevelUpEvent.newTier}: ${globalAscentLevelUpEvent.newAscentMode?.name || 'Summit'}!`
                  : `Level ${globalAscentLevelUpEvent.newLevel} Reached!`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                {globalAscentLevelUpEvent.isSummit
                  ? 'Incredible milestone! You conquered the summit and promoted to a higher Ascent tier with increased Spark multipliers!'
                  : `Congratulations! You reached ${globalAscentLevelUpEvent.rank?.title || 'a new mountain rank'}!`}
              </p>
            </div>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-teal-400 via-emerald-400 to-teal-500 border-2 border-teal-600 flex items-center justify-center text-4xl shadow-md animate-bounce">
              {globalAscentLevelUpEvent.rank?.icon || (globalAscentLevelUpEvent.isSummit ? '👑' : '🧗')}
            </div>

            {globalAscentLevelUpEvent.reward && (
              <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-amber-950 font-black text-sm shadow-xs">
                <Zap className="w-5 h-5 text-amber-600 fill-amber-400 stroke-[2.5]" />
                <span>+{globalAscentLevelUpEvent.reward.sparks || 50} Sparks Awarded! ⚡</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (globalAscentLevelUpEvent.reward?.sparks) {
                  const currentSparks = storageService.getUserData(activeSubject).sparks || 0;
                  const updatedSparks = currentSparks + globalAscentLevelUpEvent.reward.sparks;
                  setSparks(updatedSparks);
                  storageService.saveUserData({ sparks: updatedSparks }, activeSubject);
                }
                setGlobalAscentLevelUpEvent(null);
              }}
              className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-black text-base py-3.5 px-6 rounded-2xl shadow-lg border-b-4 border-teal-700 active:translate-y-0.5 active:border-b-0 transition-all cursor-pointer"
            >
              Keep Climbing! 🏔️
            </button>
          </div>
        </div>
      )}

      {/* PERFECT MONTH PROGRESS MODAL */}
      <PerfectMonthProgressModal
        isOpen={!!perfectMonthData}
        onClose={() => {
          setPerfectMonthData(null);
          // If the streak modal was queued, let it show after closing this
        }}
        daysPlayedThisMonth={perfectMonthData?.daysPlayedThisMonth || 1}
      />

      {/* PARENT PIN GATE MODAL */}
      <PinGateModal
        isOpen={showPinGateModal}
        onClose={() => {
          setPendingSparksPurchase(null);
          handleGoBack();
        }}
        currentPin={parentPin}
        onUnlockSuccess={handlePinUnlockSuccess}
      />

      {/* TRAIL BADGES SHOWCASE MODAL */}
      <BadgesModal
        activeSubject={activeSubject}
        isOpen={showBadgesModal}
        onClose={handleGoBack}
        unlockedBadges={unlockedBadges}
        personalRecords={personalRecords}
        userState={(() => {
          const uData = storageService.getUserData(activeSubject);
          const rating = uData.adaptiveCompetenceRating || uData.competenceRank || 1000;
          return {
            ...uData,
            competenceRank: rating,
            adaptiveCompetenceRating: rating,
            tier: tier,
            totalProblemsSolved: totalProblemsSolved,
            streak: streak,
            cumulativeCorrectStreak: cumulativeCorrectStreak,
            sprintHistory: sprintHistory || uData.sprintHistory || [],
            completedClimbsCount: uData.completedClimbsCount || (sprintHistory || uData.sprintHistory || []).length
          };
        })()}
        renderFooter={renderNavigationFooter}
        onOpenAscentRoadmap={handleOpenAscentRoadmapModal}
        highlightBadgeIds={highlightBadgeIds}
      />

      {/* EXPEDITION ASCENTS & LEVEL ROADMAP MODAL */}
      <AscentRoadmapModal
        isOpen={showAscentRoadmapModal}
        onClose={handleGoBack}
        profileId={activeProfileId}
      />

      {/* PARENT SPEED INFO MODAL (ℹ️) */}
      {showSpeedInfoModal && (
        <div
          onClick={() => setShowSpeedInfoModal(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 text-left shadow-2xl space-y-3 relative cursor-default"
          >
            <button
              onClick={() => setShowSpeedInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2">
              <Info className="w-6 h-6 text-kibo-teal stroke-[2.5]" />
              <h3 className="text-xl font-extrabold text-slate-800">How Recall Latency Works</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kibo Math measures millisecond latency from the instant a problem appears until the user completes their answer.
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="font-extrabold text-amber-900">⚡ Instant Recall (&lt;1.5s / &lt;2.2s):</span>
                <p className="text-amber-800 font-normal">Direct memory retrieval without needing scratchpad calculation.</p>
              </div>

              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                <span className="font-extrabold text-yellow-900">🟡 Worked It Out (1.5s–4.0s / 2.2s–4.5s):</span>
                <p className="text-yellow-800 font-normal">Active calculation in working memory. Fluent and correct!</p>
              </div>

              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-extrabold text-blue-900">🔵 Focus Area (&gt;4.0s / &gt;4.5s or Incorrect):</span>
                <p className="text-blue-800 font-normal">Automatically re-queued into future daily sessions to reinforce memory!</p>
              </div>
            </div>

            <button
              onClick={() => setShowSpeedInfoModal(false)}
              className="btn-3d-teal w-full py-2.5 text-sm rounded-xl"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Tier Level-Up Celebration Modal */}
      {showLevelUpModal && (
        <div
          onClick={() => setShowLevelUpModal(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-purple-400 rounded-3xl p-6 text-center shadow-2xl space-y-4 cursor-default"
          >
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto border-2 border-purple-300 animate-bounce">
              <Award className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-black text-purple-600 tracking-wider">Level-Up Unlocked!</span>
              <h3 className="text-2xl font-black text-slate-800">Advance to Tier {tier + 1}?</h3>
              <p className="text-xs text-slate-600 font-medium">
                {levelUpReason}
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-purple-900 font-extrabold text-sm">
              Unlock Tier {tier + 1}: {getTierMeta(tier + 1).title}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleLevelUp}
                className="btn-3d-purple w-full py-3.5 text-lg rounded-2xl flex items-center justify-center gap-2 shadow-bouncy-purple"
              >
                Advance to Tier {tier + 1}! 🎉
              </button>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full py-2 text-slate-500 font-extrabold text-sm hover:text-slate-800"
              >
                Stay in Tier {tier} for Now
              </button>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* Bottom Navigation Bar */}
      {appState !== 'settings' && appState !== 'privacy' && appState !== 'terms' && appState !== 'leaderboard' && appState !== 'quests' && renderNavigationFooter()}

      {/* Workshop Modal */}
      <WorkshopModal
        isOpen={isWorkshopOpen}
        onClose={handleGoBack}
        sparks={sparks}
        streakShields={streakShields}
        consumables={consumables}
        unlockedItems={unlockedItems}
        equippedItems={equippedItems}
        onBuyItem={handleBuyItem}
        onBuyConsumable={handleBuyConsumable}
        onSellItem={handleSellItem}
        onToggleEquip={handleToggleEquip}
        onRedeemPromoCode={handleRedeemPromoCode}
        allowRealMoneyPurchases={notifPrefs.allowRealMoneyPurchases}
        initialHub={workshopHub}
        initialViewMode={workshopViewMode}
        isKiboClub={isKiboClub}
        activeProfileId={activeProfileId}
        onOpenDailyVault={() => setShowDailyBonusModal(true)}
        onOpenParentZone={(targetTab = 'verification', highlight = 'real_money_purchases') => {
          handleOpenPinGate('shop', targetTab, highlight);
        }}
        onBuySparksPackage={(pack) => {
          handleBuySparksPackage({ ...pack, source: 'shop', hub: 'sparks', mode: 'shop' }, false, 'shop');
        }}
        onRequestAccountLink={() => {
          handleOpenModal(VIEWS.ACCOUNT_LINK, { milestone: 'Shop Rewards' });
        }}
        renderFooter={renderNavigationFooter}
      />

      <MockCheckoutModal
        isOpen={showMockCheckoutModal}
        onClose={() => {
          setPendingSparksPurchase(null);
          handleGoBack();
        }}
        packageInfo={pendingSparksPurchase}
        onConfirm={(pack) => {
          let newSparks = sparks + (pack.sparks || pack.sparksIncluded || 0);

          let nextConsumables = { ...consumables };
          if (pack.bundleConsumables) {
            Object.keys(pack.bundleConsumables).forEach((key) => {
              nextConsumables[key] = (nextConsumables[key] || 0) + pack.bundleConsumables[key];
            });
            setConsumables(nextConsumables);
            storageService.saveUserData({
              streakShields: nextConsumables.shieldCount,
              streakSaverCount: nextConsumables.streakSaverCount,
              hintScrollCount: nextConsumables.hintScrollCount,
              doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
            });
          }

          let nextUnlocked = [...unlockedItems];
          if (pack.bundleItems) {
            pack.bundleItems.forEach(itemId => {
               if (!nextUnlocked.includes(itemId)) {
                 nextUnlocked.push(itemId);
               }
            });
            if (pack.id && !nextUnlocked.includes(pack.id)) {
              nextUnlocked.push(pack.id);
            }
            setUnlockedItems(nextUnlocked);
            storageService.saveShopState(equippedItems, nextUnlocked);
          } else if (pack.realMoneyPrice && !pack.isSubscription && !pack.sparks && !pack.bundleItems && !pack.bundleConsumables) {
             // For single premium items
             if (!nextUnlocked.includes(pack.id)) {
                 nextUnlocked.push(pack.id);
             }
             setUnlockedItems(nextUnlocked);
             storageService.saveShopState(equippedItems, nextUnlocked);
          }

          if (pack.isSubscription) {
             setIsKiboClub(true);
             storageService.updateSubscriptionState(pack.id, activeProfileId, true);
             const activeProf = storageService.getActiveProfile();
             setUnlockedItems(activeProf?.shopState?.unlockedItems || []);
          }

          setSparks(newSparks);
          storageService.saveUserData({ sparks: newSparks });
          localStorage.setItem('kibo_math_sparks', newSparks.toString());

          soundFx.playSparkCollect();
          setPendingSparksPurchase(null);
          handleGoBack();
        }}
      />

      <StripeCheckoutModal
        isOpen={showStripeCheckoutModal}
        onClose={() => {
          setPendingSparksPurchase(null);
          handleGoBack();
        }}
        packageInfo={pendingSparksPurchase}
        onConfirm={(pack) => {
          let newSparks = sparks + (pack.sparks || pack.sparksIncluded || 0);

          let nextConsumables = { ...consumables };
          if (pack.bundleConsumables) {
            Object.keys(pack.bundleConsumables).forEach((key) => {
              nextConsumables[key] = (nextConsumables[key] || 0) + pack.bundleConsumables[key];
            });
            setConsumables(nextConsumables);
            storageService.saveUserData({
              streakShields: nextConsumables.shieldCount,
              streakSaverCount: nextConsumables.streakSaverCount,
              hintScrollCount: nextConsumables.hintScrollCount,
              doubleSparksPotionCount: nextConsumables.doubleSparksPotionCount,
            });
          }

          let nextUnlocked = [...unlockedItems];
          if (pack.bundleItems) {
            pack.bundleItems.forEach((id) => {
              if (!nextUnlocked.includes(id)) {
                nextUnlocked.push(id);
              }
            });
            if (pack.id && !nextUnlocked.includes(pack.id)) {
              nextUnlocked.push(pack.id);
            }
            setUnlockedItems(nextUnlocked);
            storageService.saveShopState(equippedItems, nextUnlocked);
          } else if (pack.realMoneyPrice && !pack.isSubscription && !pack.sparks && !pack.bundleItems && !pack.bundleConsumables) {
            if (!nextUnlocked.includes(pack.id)) {
              nextUnlocked.push(pack.id);
            }
            setUnlockedItems(nextUnlocked);
            storageService.saveShopState(equippedItems, nextUnlocked);
          }

          if (pack.isSubscription) {
            setIsKiboClub(true);
            storageService.updateSubscriptionState(pack.id, activeProfileId, true);
            const activeProf = storageService.getActiveProfile();
            setUnlockedItems(activeProf?.shopState?.unlockedItems || []);
          }

          setSparks(newSparks);
          storageService.saveUserData({ sparks: newSparks });
          localStorage.setItem('kibo_math_sparks', newSparks.toString());

          soundFx.playSparkCollect();
          setPendingSparksPurchase(null);
          handleGoBack();
        }}
      />

      {/* Daily Bonus Reward Vault Modal */}
      <DailyBonusRewardModal
        isOpen={showDailyBonusModal}
        onClose={() => setShowDailyBonusModal(false)}
        activeProfileId={activeProfileId}
        isKiboClub={isKiboClub}
        onRewardClaimed={(claimResult) => {
          if (claimResult && claimResult.totalSparks !== undefined) {
            setSparks(claimResult.totalSparks);
          }
          const updatedConsumables = storageService.getConsumables(activeProfileId);
          setConsumables(updatedConsumables);
          if (updatedConsumables.shieldCount !== undefined) {
            setStreakShields(updatedConsumables.shieldCount);
          }
        }}
      />

      {/* Family Plan Upgrade Modal */}
      <FamilyPlanUpgradeModal
        isOpen={showFamilyUpgradeModal}
        onClose={handleGoBack}
        onOpenParentZone={(targetTab = 'verification', targetHighlight = 'family_plan') => {
          handleOpenPinGate('family_plan', targetTab, targetHighlight);
        }}
      />

      {/* News Modal */}
      <NewsModal
        isOpen={showNewsModal}
        onClose={handleGoBack}
        newsItems={newsItems}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleGoBack}
      />

      {/* Friends Modal */}
      <AddFriendModal
        isOpen={showFriendsModal}
        onClose={() => {
          const currentPid = storageService.getActiveProfileId();
          setFriendsCount(storageService.getFriends(currentPid).length);
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
          handleGoBack();
        }}
        activeSubject={activeSubject}
        onFriendAdded={() => {
          const currentPid = storageService.getActiveProfileId();
          setFriendsCount(storageService.getFriends(currentPid).length);
          setPendingFriendRequestsCount(storageService.getFriendRequests(currentPid).filter(r => r.type === 'received').length);
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={handleGoBack}
      />

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => {
          if (pendingSparksPurchase) {
            setPendingSparksPurchase(null);
          }
          handleGoBack();
        }}
        onOpenFamilyPlan={(targetTab = 'verification', targetHighlight = 'family_plan') => {
          handleOpenPinGate('family_plan', targetTab, targetHighlight);
        }}
        triggerMilestone={linkModalMilestone}
        onAccountLinked={(user, newSparks) => {
          if (newSparks !== undefined) {
            setSparks(newSparks);
          }
          setCurrentAuthState(authService.getAuthState());
          syncAppStateWithStorage();
          if (pendingSparksPurchase) {
            if (pendingSparksPurchase.realMoneyPrice) {
              const entry = navigationHistory.replace({
                type: VIEW_TYPES.MODAL,
                id: VIEWS.STRIPE_CHECKOUT
              });
              applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
            } else {
              const entry = navigationHistory.replace({
                type: VIEW_TYPES.MODAL,
                id: VIEWS.MOCK_CHECKOUT
              });
              applyNavState(entry, navigationHistory.getStack(), navigationHistory.getBaseRoute());
            }
          } else {
            handleGoBack();
          }
        }}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div
          onClick={() => setShowLogoutConfirmModal(false)}
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-pop cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-800">
              <LogOut className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Log Out of Account?</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {authService.getAuthState().email ? (
                  <>You are signed in as <strong className="text-slate-800">{authService.getAuthState().email}</strong>. Your climber profiles and progress will remain safe in the cloud.</>
                ) : (
                  <>Your climber profiles and progress will remain safe in the cloud.</>
                )}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  soundFx.playKeyTap();
                  setShowLogoutConfirmModal(false);
                  await authService.unlinkAccount();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs transition-colors shadow-xs cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEV CONTROL PANEL (TRIGGERED BY SECRET KEYSTROKE CODE 'kibodev') */}
      <DevControlPanel
        isOpen={devState.isDevPanelOpen}
        onClose={() => devState.setIsDevPanelOpen(false)}
        onResetAllStats={devState.resetAllStats}
        onSetRating={devState.setRating}
        onAdjustSparks={devState.adjustSparks}
        onUnlockAllWorkshopItems={devState.unlockAllWorkshopItems}
        onStateRefresh={() => {
          const uData = storageService.getUserData(activeSubject);
          const sData = storageService.getShopState();
          setSparks(uData.sparks || 0);
          setUnlockedItems(sData.unlockedItems || ['cap']);
        }}
      />
    </div>
  );
}
