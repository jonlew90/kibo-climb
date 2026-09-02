import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, Crown, Medal, User, Info, Activity, Zap, Sparkles, X, Users, UserPlus, ChevronDown, Heart, UserCheck, Scroll, Mountain, Compass, Award, Shield, Flame, Users2, Target, CheckCircle2, Gift } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { getCompetenceRankTier, getCompetenceTierObj } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';
import { leaderboardService } from '../services/leaderboardService';
import { questService } from '../services/questService';
import { getQuestLevelInfo, ASCENT_MODES, COMPANION_BUDDIES } from '../data/questsData';
import { getWeekStr, getPreviousWeekStr } from '../utils/dateUtils';
import { SUBJECTS_CONFIG } from '../config/subjects';
import { getDeterministicAnonymousName } from '../utils/safeNames';
import AddFriendModal from './AddFriendModal';

export default function LeaderboardScreen({
  activeSubject = 'math',
  initialViewMode,
  userState,
  renderFooter,
  equippedItems = [],
  onBack
}) {
  const [selectedSubject, setSelectedSubject] = useState(activeSubject || 'math');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectDropdownRef = useRef(null);
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'my_tier' | number (1..8)
  const [weeklySubTab, setWeeklySubTab] = useState('sparks'); // 'sparks' | 'streaks'
  const [liveStandings, setLiveStandings] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    if (initialViewMode) return initialViewMode;
    try {
      const stored = localStorage.getItem('kibo_leaderboard_initial_view');
      if (stored) {
        localStorage.removeItem('kibo_leaderboard_initial_view');
        return stored;
      }
    } catch (e) {}
    return 'global';
  }); // 'global' | 'weekly' | 'quests' | 'squads' | 'friends'
  const [weeklyStandings, setWeeklyStandings] = useState([]);
  const [questsStandings, setQuestsStandings] = useState([]);
  const [friendsStandings, setFriendsStandings] = useState([]);
  const [friendsList, setFriendsList] = useState(() => storageService.getFriends());
  const [pendingRequestsCount, setPendingRequestsCount] = useState(() => 
    storageService.getFriendRequests().filter(r => r.type === 'received').length
  );
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendModalTab, setFriendModalTab] = useState('friends');
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [friendActionFeedback, setFriendActionFeedback] = useState('');
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [cohortId, setCohortId] = useState(null);
  const [isLoadingCohort, setIsLoadingCohort] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [weeklySettlementReward, setWeeklySettlementReward] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setShowSubjectDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync selected subject if active subject prop changes
  useEffect(() => {
    if (activeSubject) {
      setSelectedSubject(activeSubject);
    }
  }, [activeSubject]);

  const activeProfile = storageService.getActiveProfile();
  const username = storageService.getUsername() || activeProfile?.username || activeProfile?.name || 'You';
  const currentUid = leaderboardService.getCurrentUser?.()?.uid;

  // Get user score for selected subject
  const userScore = (selectedSubject === activeSubject && userState?.competenceRank)
    ? userState.competenceRank
    : storageService.getSubjectRating(activeProfile?.id, selectedSubject);

  const userEquippedItems = (equippedItems && equippedItems.length > 0)
    ? equippedItems
    : (activeProfile?.shopState?.equippedItems || []);

  const userSubjectsMastered = (
    activeProfile?.userData?.subjectsMastered
    ?? Object.keys(activeProfile?.userData?.masteredTricks || {}).length
    ?? Math.min(10, Math.max(1, Math.floor((userState?.totalProblemsSolved || 0) / 10)))
  ) || 5;

  const userProblemsSolved = userState?.totalProblemsSolved
    ?? activeProfile?.userData?.totalProblemsSolved
    ?? activeProfile?.userData?.subjects?.[selectedSubject]?.totalProblemsSolved
    ?? 0;

  const allAccountProfiles = storageService.getAllProfiles();
  const accountPlayers = allAccountProfiles.map(p => {
    const isCurrent = p.id === activeProfile?.id;
    const pName = isCurrent ? username : (p.username || p.name || 'Climber');
    const pScore = isCurrent 
      ? userScore 
      : storageService.getSubjectRating(p.id, selectedSubject);
    const pEquipped = isCurrent 
      ? userEquippedItems 
      : (p.shopState?.equippedItems || []);
    const pSubjects = isCurrent
      ? (userSubjectsMastered || 5)
      : (p.userData?.subjectsMastered ?? Object.keys(p.userData?.masteredTricks || {}).length ?? 5);
    const pProblemsSolved = isCurrent
      ? userProblemsSolved
      : (p.userData?.totalProblemsSolved ?? p.userData?.subjects?.[selectedSubject]?.totalProblemsSolved ?? 0);

    const pStreak = isCurrent
      ? (activeProfile?.userData?.streak || userState?.streak || 0)
      : (p.userData?.streak || 0);

    const pWeeklyMaxStreak = isCurrent
      ? (activeProfile?.userData?.weeklyMaxStreak || activeProfile?.userData?.streak || userState?.streak || 0)
      : (p.userData?.weeklyMaxStreak || p.userData?.streak || 0);

    const pWeeklySparks = isCurrent
      ? (activeProfile?.userData?.weeklySparks || activeProfile?.userData?.sparks || 0)
      : (p.userData?.weeklySparks || p.userData?.sparks || 0);

    const tierObj = getCompetenceTierObj(pScore, selectedSubject);

    return {
      id: p.id,
      profileId: p.id,
      isCurrentUser: isCurrent,
      isAccountProfile: true,
      name: pName,
      score: pScore,
      tier: tierObj.tier,
      tierName: tierObj.name,
      subjectsMastered: pSubjects,
      totalProblemsSolved: pProblemsSolved,
      streak: pStreak,
      weeklyMaxStreak: pWeeklyMaxStreak,
      sparks: Number(pWeeklySparks) || 0,
      equipped: pEquipped,
      planTier: storageService.getPlanTier(p.id),
      subject: selectedSubject
    };
  });

  const refreshFriendsStandings = async () => {
    const stored = storageService.getFriends();
    setFriendsList(stored);
    setPendingRequestsCount(storageService.getFriendRequests().filter(r => r.type === 'received').length);
    if (stored.length === 0) {
      setFriendsStandings([]);
      return;
    }

    setIsLoadingFriends(true);
    const friendIds = stored.map(f => f.id || f.uid || f.username).filter(Boolean);
    try {
      const res = await leaderboardService.fetchFriendScores(selectedSubject, friendIds);
      if (res?.standings && res.standings.length > 0) {
        const merged = stored.map(f => {
          const remote = res.standings.find(r => r.id === f.id || r.name === f.username || r.uid === f.uid);
          const fScore = remote ? (Number(remote.score) || 1000) : (Number(f.score) || 1000);
          const fTierObj = getCompetenceTierObj(fScore, selectedSubject);
          return {
            ...f,
            score: fScore,
            tier: fTierObj.tier,
            tierName: fTierObj.name,
            equipped: (remote && remote.equipped?.length) ? remote.equipped : (f.equipped || []),
            subjectsMastered: remote ? (remote.subjectsMastered || 5) : (f.subjectsMastered || 5),
            totalProblemsSolved: remote ? (remote.totalProblemsSolved || 0) : (f.totalProblemsSolved || 0),
            isFriend: true
          };
        });
        setFriendsStandings(merged);
      } else {
        setFriendsStandings(stored.map(f => {
          const fScore = Number(f.score) || 1000;
          const fTierObj = getCompetenceTierObj(fScore, selectedSubject);
          return {
            ...f,
            score: fScore,
            tier: fTierObj.tier,
            tierName: fTierObj.name,
            isFriend: true
          };
        }));
      }
    } catch (err) {
      setFriendsStandings(stored.map(f => {
        const fScore = Number(f.score) || 1000;
        const fTierObj = getCompetenceTierObj(fScore, selectedSubject);
        return {
          ...f,
          score: fScore,
          tier: fTierObj.tier,
          tierName: fTierObj.name,
          isFriend: true
        };
      }));
    } finally {
      setIsLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'friends') {
      refreshFriendsStandings();
    }
  }, [viewMode, selectedSubject]);

  useEffect(() => {
    if (viewMode !== 'weekly') return;

    let isMounted = true;
    const weekStr = getWeekStr();

    // Attempt to join or fetch cohort via leaderboardService with automatic resilient fallback
    const joinCohort = async () => {
      try {
        setIsLoadingCohort(true);
        const result = await leaderboardService.joinWeeklyLeague({
          profileId: activeProfile?.id || 'default_child',
          weekStr,
          subject: selectedSubject
        });
        if (isMounted && result?.cohortId) {
          setCohortId(result.cohortId);
        }
      } catch (err) {
        console.warn('LeaderboardScreen: Error joining weekly cohort:', err);
      } finally {
        if (isMounted) setIsLoadingCohort(false);
      }
    };

    joinCohort();

    return () => { isMounted = false; };
  }, [viewMode, selectedSubject, activeProfile?.id]);

  useEffect(() => {
    if (viewMode !== 'weekly' || !cohortId) return;

    const weekStr = getWeekStr();

    // Sync active player's weekly stats
    accountPlayers.forEach(p => {
      if (p.isCurrentUser) {
         const sparks = activeProfile?.userData?.weeklySparks || activeProfile?.userData?.sparks || 0;
         const maxStreak = activeProfile?.userData?.weeklyMaxStreak || activeProfile?.userData?.streak || 0;
         leaderboardService.syncWeeklyScore({
            profileId: p.id,
            subject: selectedSubject,
            name: p.name,
            weekStr,
            cohortId,
            sparks,
            maxStreak,
            equipped: p.equipped,
            planTier: p.planTier || storageService.getPlanTier(p.id)
         });
      }
    });

    const unsubscribe = leaderboardService.subscribeToWeeklyLeaderboard(weekStr, cohortId, selectedSubject, 30, (remoteData) => {
      if (remoteData && remoteData.length > 0) {
        setWeeklyStandings(remoteData);
      } else {
        setWeeklyStandings([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [viewMode, cohortId, selectedSubject]);

  // Check and trigger end-of-week settlement rewards for previous completed week
  useEffect(() => {
    const prevWeek = getPreviousWeekStr();
    const pid = activeProfile?.id;
    if (!pid || !prevWeek) return;

    const claimed = storageService.getClaimedWeeklyLeaderboardWeeks(pid);
    const claimKey = `${prevWeek}_sparks`;
    if (!claimed.includes(claimKey)) {
      // Check if user had weekly activity from previous week or simulated rank
      const prevSparks = activeProfile?.userData?.previousWeekSparks || activeProfile?.userData?.weeklySparks || 0;
      if (prevSparks > 0) {
        // Compute user placement (1..10) based on effort
        const rank = prevSparks >= 400 ? 1 : prevSparks >= 200 ? 2 : prevSparks >= 100 ? 3 : prevSparks >= 50 ? 5 : 10;
        const rewardResult = storageService.claimWeeklyLeaderboardReward({
          weekStr: prevWeek,
          rank,
          category: 'sparks',
          profileId: pid
        });
        if (rewardResult && rewardResult.success) {
          soundFx.playCelebration?.();
          setWeeklySettlementReward(rewardResult);
        }
      }
    }
  }, [activeProfile?.id]);

  // Subscribe to Firestore real-time updates for Mountain Quest Standings
  useEffect(() => {
    if (viewMode !== 'quests' && viewMode !== 'squads') return;

    allAccountProfiles.forEach(p => {
      const pQuestState = questService.getQuests(p.id);
      const pTotalXp = pQuestState?.totalXp || 0;
      const pLevelInfo = pQuestState?.levelInfo || getQuestLevelInfo(pTotalXp);
      const pClaims = pQuestState?.claimsCount || 0;
      const isCurrent = p.id === activeProfile?.id;
      const pName = isCurrent ? username : (p.username || p.name || 'Climber');
      const pEquipped = isCurrent ? userEquippedItems : (p.shopState?.equippedItems || []);

      leaderboardService.syncQuestScore({
        profileId: p.id,
        name: pName,
        totalXp: pTotalXp,
        level: pLevelInfo.level,
        ascentTier: pLevelInfo.ascentTier,
        ascentName: pLevelInfo.ascentMode?.name || 'Sunny Trailhead',
        title: pLevelInfo.title,
        claimsCount: pClaims,
        equipped: pEquipped,
        planTier: storageService.getPlanTier(p.id)
      });
    });

    const unsubscribe = leaderboardService.subscribeToQuestLeaderboard(30, (remoteData) => {
      if (remoteData && remoteData.length > 0) {
        setQuestsStandings(remoteData);
      } else {
        setQuestsStandings([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [viewMode, activeProfile?.id]);

  // Subscribe to Firestore real-time updates and sync all account profiles for selected subject
  useEffect(() => {
    accountPlayers.forEach(p => {
      leaderboardService.syncUserScore({
        profileId: p.id,
        subject: selectedSubject,
        name: p.name,
        score: p.score,
        subjectsMastered: p.subjectsMastered,
        totalProblemsSolved: p.totalProblemsSolved,
        equipped: p.equipped,
        planTier: p.planTier || storageService.getPlanTier(p.id)
      });
    });

    const unsubscribe = leaderboardService.subscribeToLeaderboard(selectedSubject, 20, (remoteData) => {
      if (remoteData && remoteData.length > 0) {
        setLiveStandings(remoteData);
      } else {
        setLiveStandings([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [selectedSubject, userScore, username, activeProfile?.id]);

  const accountNamesNormalized = new Set(
    accountPlayers.map(p => (p.name || '').trim().toLowerCase()).filter(Boolean)
  );
  const accountProfileIds = new Set(
    accountPlayers.map(p => p.id).filter(Boolean)
  );

  // Filter remote records to avoid duplicates with local account profiles or the current auth session
  const filteredRemote = liveStandings.filter(p => {
    if (currentUid && p.uid === currentUid) return false;
    if (currentUid && p.id && p.id.startsWith(`${currentUid}_`)) return false;
    if (p.profileId && accountProfileIds.has(p.profileId)) return false;
    const normName = (p.name || '').trim().toLowerCase();
    if (accountNamesNormalized.has(normName)) return false;
    return true;
  }).map(p => {
    const tierObj = getCompetenceTierObj(p.score, selectedSubject);
    return {
      ...p,
      tier: tierObj.tier,
      tierName: tierObj.name
    };
  });

  // Combine filtered remote standings with account profiles
  const mergedList = [...filteredRemote, ...accountPlayers];

  // Comprehensive Tie-Breaker Comparator for Global Standings:
  // 1. Primary: Score / Competence Rating (desc)
  // 2. Secondary: Subjects / Tricks Mastered (desc)
  // 3. Tertiary: Total Problems Solved (desc)
  const compareGlobalRank = (a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;

    const tricksDiff = (Number(b.subjectsMastered) || 0) - (Number(a.subjectsMastered) || 0);
    if (tricksDiff !== 0) return tricksDiff;

    return (Number(b.totalProblemsSolved) || 0) - (Number(a.totalProblemsSolved) || 0);
  };

  mergedList.sort(compareGlobalRank);

  // Deduplicate merged standings so each player / profile appears once with their best score
  const seenPlayerKeys = new Set();
  const uniqueStandings = [];

  for (const player of mergedList) {
    const key = player.isCurrentUser
      ? '__current_active_user__'
      : (player.profileId && player.uid ? `${player.uid}_${player.profileId}` : (player.name || '').trim().toLowerCase() || player.id);

    if (!seenPlayerKeys.has(key)) {
      seenPlayerKeys.add(key);
      uniqueStandings.push(player);
    }
  }

  // Filter by Mountain Tier Sub-Bracket if specified
  const userCurrentTierObj = getCompetenceTierObj(userScore, selectedSubject);
  const activeFilteredGlobalStandings = uniqueStandings.filter(player => {
    if (selectedTier === 'all') return true;
    if (selectedTier === 'my_tier') return (player.tier || 1) === userCurrentTierObj.tier;
    return Number(player.tier || 1) === Number(selectedTier);
  });

  // Handle Weekly Standings (Sparks vs Consistency/Streak)
  const accountPlayersWeekly = allAccountProfiles.map(p => {
    const isCurrent = p.id === activeProfile?.id;
    const pName = isCurrent ? username : (p.username || p.name || 'Climber');
    const pSparks = isCurrent
      ? (activeProfile?.userData?.weeklySparks || activeProfile?.userData?.sparks || 0)
      : (p.userData?.weeklySparks || p.userData?.sparks || 0);
    const pStreak = isCurrent
      ? (activeProfile?.userData?.streak || userState?.streak || 0)
      : (p.userData?.streak || 0);
    const pMaxStreak = isCurrent
      ? (activeProfile?.userData?.weeklyMaxStreak || activeProfile?.userData?.streak || userState?.streak || 0)
      : (p.userData?.weeklyMaxStreak || p.userData?.streak || 0);
    const pEquipped = isCurrent 
      ? userEquippedItems 
      : (p.shopState?.equippedItems || []);
    const pSubjects = isCurrent
      ? (userSubjectsMastered || 5)
      : (p.userData?.subjectsMastered ?? Object.keys(p.userData?.masteredTricks || {}).length ?? 5);

    return {
      id: p.id,
      profileId: p.id,
      isCurrentUser: isCurrent,
      isAccountProfile: true,
      name: pName,
      sparks: Number(pSparks) || 0,
      streak: Number(pStreak) || 0,
      maxStreak: Number(pMaxStreak) || 0,
      score: weeklySubTab === 'streaks' ? Number(pStreak) || 0 : Number(pSparks) || 0,
      subjectsMastered: pSubjects,
      equipped: pEquipped,
      planTier: storageService.getPlanTier(p.id),
      subject: selectedSubject
    };
  });

  const weeklyFilteredRemote = weeklyStandings.filter(p => {
    if (currentUid && p.uid === currentUid) return false;
    if (currentUid && p.id && p.id.startsWith(`${currentUid}_`)) return false;
    if (p.profileId && accountProfileIds.has(p.profileId)) return false;
    const normName = (p.name || '').trim().toLowerCase();
    if (accountNamesNormalized.has(normName)) return false;
    return true;
  });

  const mergedWeeklyList = [...weeklyFilteredRemote, ...accountPlayersWeekly];
  if (weeklySubTab === 'streaks') {
    mergedWeeklyList.sort((a, b) => {
      const streakDiff = (Number(b.streak ?? b.maxStreak) || 0) - (Number(a.streak ?? a.maxStreak) || 0);
      if (streakDiff !== 0) return streakDiff;
      return (Number(b.sparks) || 0) - (Number(a.sparks) || 0);
    });
  } else {
    mergedWeeklyList.sort((a, b) => (Number(b.sparks) || 0) - (Number(a.sparks) || 0));
  }

  const seenWeeklyKeys = new Set();
  const uniqueWeeklyStandings = [];
  for (const player of mergedWeeklyList) {
    const key = player.isCurrentUser
      ? '__current_active_user__'
      : (player.profileId && player.uid ? `${player.uid}_${player.profileId}` : (player.name || '').trim().toLowerCase() || player.id);

    if (!seenWeeklyKeys.has(key)) {
      seenWeeklyKeys.add(key);
      uniqueWeeklyStandings.push(player);
    }
  }

  // Handle Quests Standings merging with account profiles
  const accountPlayersQuests = allAccountProfiles.map(p => {
    const isCurrent = p.id === activeProfile?.id;
    const pName = isCurrent ? username : (p.username || p.name || 'Climber');
    const pQuestState = questService.getQuests(p.id);
    const pTotalXp = pQuestState?.totalXp || 0;
    const pLevelInfo = pQuestState?.levelInfo || getQuestLevelInfo(pTotalXp);
    const pClaims = pQuestState?.claimsCount || 0;
    const pEquipped = isCurrent 
      ? userEquippedItems 
      : (p.shopState?.equippedItems || []);
    const pSubjects = isCurrent
      ? (userSubjectsMastered || 5)
      : (p.userData?.subjectsMastered ?? Object.keys(p.userData?.masteredTricks || {}).length ?? 5);

    return {
      id: p.id,
      profileId: p.id,
      isCurrentUser: isCurrent,
      isAccountProfile: true,
      name: pName,
      totalXp: pTotalXp,
      score: pTotalXp,
      level: pLevelInfo.level,
      ascentTier: pLevelInfo.ascentTier,
      ascentName: pLevelInfo.ascentMode?.name || 'Sunny Trailhead',
      ascentMode: pLevelInfo.ascentMode,
      title: pLevelInfo.title,
      icon: pLevelInfo.icon,
      claimsCount: pClaims,
      subjectsMastered: pSubjects,
      equipped: pEquipped
    };
  });

  const questsFilteredRemote = questsStandings.filter(p => {
    if (currentUid && p.uid === currentUid) return false;
    if (currentUid && p.id && p.id.startsWith(`${currentUid}_`)) return false;
    if (p.profileId && accountProfileIds.has(p.profileId)) return false;
    const normName = (p.name || '').trim().toLowerCase();
    if (accountNamesNormalized.has(normName)) return false;
    return true;
  });

  const mergedQuestsList = [...questsFilteredRemote, ...accountPlayersQuests];
  mergedQuestsList.sort((a, b) => (Number(b.totalXp ?? b.score) || 0) - (Number(a.totalXp ?? a.score) || 0));

  const seenQuestsKeys = new Set();
  const uniqueQuestsStandings = [];
  for (const player of mergedQuestsList) {
    const key = player.isCurrentUser
      ? '__current_active_user__'
      : (player.profileId && player.uid ? `${player.uid}_${player.profileId}` : (player.name || '').trim().toLowerCase() || player.id);

    if (!seenQuestsKeys.has(key)) {
      seenQuestsKeys.add(key);
      uniqueQuestsStandings.push(player);
    }
  }

  // Handle Expedition Squad & Family Team Standings
  const userQuestData = questService.getQuests(activeProfile?.id);
  const userTeamClaims = userQuestData?.teamClaimsCount || 0;
  const userTeam2 = userQuestData?.team2 || [];
  const userTeam3 = userQuestData?.team3 || [];
  const activeSquadBuddies = [
    ...(userTeam2[0]?.teammates || []),
    ...(userTeam3[0]?.teammates || [])
  ].filter((t, i, arr) => t && arr.findIndex(x => x.id === t.id) === i);

  // Build team squads: User's Family/Buddy Squad + Archetype Squads
  const familyProfilesList = allAccountProfiles.map(p => p.username || p.name || 'Climber');
  const familySquadSparks = allAccountProfiles.reduce((sum, p) => sum + (p.userData?.weeklySparks || p.userData?.sparks || 0), 0);
  const familySquadXp = allAccountProfiles.reduce((sum, p) => sum + (questService.getQuests(p.id)?.totalXp || 0), 0);

  const squadStandingsList = [
    {
      id: 'my_family_squad',
      name: allAccountProfiles.length > 1 ? `${username}'s Family Expedition` : `${username}'s Climbing Squad`,
      isCurrentUserSquad: true,
      membersCount: Math.max(allAccountProfiles.length, 1 + activeSquadBuddies.length),
      memberNames: allAccountProfiles.length > 1 ? familyProfilesList : [username, ...activeSquadBuddies.map(b => b.name || 'Companion')],
      teamClaims: userTeamClaims,
      squadScore: familySquadSparks + Math.floor(familySquadXp / 10),
      weeklySparks: familySquadSparks,
      totalXp: familySquadXp,
      icon: '🏔️',
      badge: allAccountProfiles.length > 1 ? 'Family Squad' : 'Ascent Squad'
    },
    {
      id: 'squad_summit_pioneers',
      name: 'Summit Pioneers Squad',
      isCurrentUserSquad: false,
      membersCount: 3,
      memberNames: ['Leo', 'Maya', 'Tenzing'],
      teamClaims: 6,
      squadScore: 3250,
      weeklySparks: 1850,
      totalXp: 14000,
      icon: '🦅',
      badge: 'Expedition Team'
    },
    {
      id: 'squad_alpine_trailblazers',
      name: 'Alpine Trailblazers',
      isCurrentUserSquad: false,
      membersCount: 4,
      memberNames: ['Asha', 'Sora', 'BraveOtter#312', 'QuickFox#884'],
      teamClaims: 5,
      squadScore: 2840,
      weeklySparks: 1640,
      totalXp: 12000,
      icon: '🐆',
      badge: 'Expedition Team'
    },
    {
      id: 'squad_glacier_navigators',
      name: 'Glacier Navigators',
      isCurrentUserSquad: false,
      membersCount: 3,
      memberNames: ['SwiftHawk#102', 'CleverHare#551', 'SolarBear#920'],
      teamClaims: 4,
      squadScore: 2410,
      weeklySparks: 1390,
      totalXp: 10200,
      icon: '🐻',
      badge: 'Expedition Team'
    },
    {
      id: 'squad_ridge_runners',
      name: 'Ridge Runners League',
      isCurrentUserSquad: false,
      membersCount: 2,
      memberNames: ['CosmicWolf#404', 'StarFalcon#711'],
      teamClaims: 3,
      squadScore: 1980,
      weeklySparks: 1120,
      totalXp: 8600,
      icon: '🦊',
      badge: 'Duo Squad'
    }
  ];

  squadStandingsList.sort((a, b) => b.squadScore - a.squadScore);

  // Handle Friends Standings merging with account profiles
  const mergedFriendsList = [...friendsStandings, ...accountPlayers];
  mergedFriendsList.sort(compareGlobalRank);

  const seenFriendsKeys = new Set();
  const uniqueFriendsStandings = [];
  for (const player of mergedFriendsList) {
    const key = player.isCurrentUser
      ? '__current_active_user__'
      : (player.profileId && player.uid ? `${player.uid}_${player.profileId}` : (player.name || player.username || '').trim().toLowerCase() || player.id);

    if (!seenFriendsKeys.has(key)) {
      seenFriendsKeys.add(key);
      uniqueFriendsStandings.push(player);
    }
  }

  const activeStandingsList = viewMode === 'weekly' 
    ? uniqueWeeklyStandings 
    : viewMode === 'quests'
    ? uniqueQuestsStandings
    : viewMode === 'squads'
    ? squadStandingsList
    : viewMode === 'friends' 
    ? uniqueFriendsStandings 
    : activeFilteredGlobalStandings;

  // Build lookup for active friends (by ID, UID, or username)
  const currentFriends = storageService.getFriends(activeProfile?.id) || [];
  const friendIdSet = new Set();
  const friendUsernamesSet = new Set();
  currentFriends.forEach(f => {
    if (f.id) friendIdSet.add(f.id.trim().toLowerCase());
    if (f.uid) friendIdSet.add(f.uid.trim().toLowerCase());
    if (f.profileId && f.uid) friendIdSet.add(`${f.uid}_${f.profileId}`.trim().toLowerCase());
    const uname = (f.username || f.name || '').trim().toLowerCase();
    if (uname) friendUsernamesSet.add(uname);
  });

  // Assign ranks, resolved display names (COPPA safe), and friend indicators
  const rankedStandings = activeStandingsList.map((player, index) => {
    const isCurrent = !!player.isCurrentUser;
    const isAccountProf = !!player.isAccountProfile;
    
    // Check if player is a confirmed friend
    const playerId = (player.id || '').trim().toLowerCase();
    const playerUid = (player.uid || '').trim().toLowerCase();
    const combinedId = (player.uid && player.profileId) ? `${player.uid}_${player.profileId}`.trim().toLowerCase() : '';
    const rawNameLower = (player.name || player.username || '').trim().toLowerCase();
    
    const isFriend = !isCurrent && !isAccountProf && (
      player.isFriend ||
      (playerId && friendIdSet.has(playerId)) ||
      (playerUid && friendIdSet.has(playerUid)) ||
      (combinedId && friendIdSet.has(combinedId)) ||
      (rawNameLower && friendUsernamesSet.has(rawNameLower))
    );

    // COPPA Safe Display Name resolution:
    // - Current user or same-account profiles: show their real chosen name
    // - Confirmed friends: show their real chosen username
    // - Strangers: show deterministic kid-safe anonymous name (e.g. BraveOtter#482)
    let displayName = player.name || player.username || 'Climber';
    if (!isCurrent && !isAccountProf && !isFriend) {
      displayName = player.anonymousName || getDeterministicAnonymousName(player.id || player.uid || player.profileId || player.name || `seed_${index}`);
    }

    let planTier = player.planTier;
    if (!planTier) {
      if (isCurrent || isAccountProf) {
        planTier = storageService.getPlanTier(player.profileId || player.id);
      } else if (player.equipped?.some(id => id.includes('family')) || player.isFamilyPlan) {
        planTier = 'family';
      } else if (player.equipped?.some(id => id.includes('kibo_club')) || player.isClubMember) {
        planTier = 'solo';
      } else {
        planTier = 'free';
      }
    }

    return {
      ...player,
      name: displayName,
      isFriend,
      planTier,
      rank: index + 1
    };
  });

  const userRankObj = rankedStandings.find(p => p.isCurrentUser);
  const currentUserRank = userRankObj ? userRankObj.rank : rankedStandings.length;

  const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG.math;
  const userQuestState = questService.getQuests(activeProfile?.id);
  const userQuestElevation = userQuestState?.totalXp || 0;
  const userLevelInfo = userQuestState?.levelInfo || getQuestLevelInfo(userQuestElevation);

  let pinnedScoreDisplay = userScore;
  let pinnedScoreLabel = `pts (${subjectConfig.name})`;
  if (viewMode === 'weekly') {
    pinnedScoreDisplay = userRankObj ? (userRankObj.sparks || 0) : (activeProfile?.userData?.weeklySparks || activeProfile?.userData?.sparks || 0);
    pinnedScoreLabel = 'Sparks Earned';
  } else if (viewMode === 'quests') {
    pinnedScoreDisplay = userRankObj ? (userRankObj.totalXp ?? userRankObj.score ?? userQuestElevation) : userQuestElevation;
    pinnedScoreLabel = 'XP Elevation';
  }

  let pointsNeeded = 0;
  if (currentUserRank > 1) {
    const playerAbove = rankedStandings[currentUserRank - 2];
    if (viewMode === 'global' || viewMode === 'friends') {
      pointsNeeded = playerAbove ? Math.max(1, playerAbove.score - userScore + 1) : 1;
    } else if (viewMode === 'weekly') {
      pointsNeeded = playerAbove ? Math.max(1, (playerAbove.sparks || playerAbove.score || 0) - pinnedScoreDisplay + 1) : 1;
    } else if (viewMode === 'quests') {
      pointsNeeded = playerAbove ? Math.max(1, (playerAbove.totalXp ?? playerAbove.score ?? 0) - pinnedScoreDisplay + 1) : 1;
    }
  }

  // Top standings display
  const top3 = rankedStandings.slice(0, 3);
  const others = rankedStandings.slice(3, 20);

  // Helper to get title based on score & selected subject
  const getRankTitle = (score) => {
    return getCompetenceRankTier(score, selectedSubject);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 via-stone-50 to-slate-100 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">

      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                soundFx?.playKeyTap?.();
                onBack();
              }}
              className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
          {viewMode === 'quests' ? (
            <Scroll className="w-5 h-5 text-purple-600 stroke-[2.5] shrink-0" />
          ) : (
            <Crown className="w-5 h-5 text-indigo-600 stroke-[2.5] shrink-0" />
          )}
          <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
            {viewMode === 'quests' ? 'Mountain Quest Standings' : viewMode === 'weekly' ? 'Weekly League' : viewMode === 'friends' ? 'Friends Standings' : 'Global Standings'}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Dynamic Reset / Permanent Status Badge in Header */}
          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border shadow-2xs whitespace-nowrap ${
            viewMode === 'weekly'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : viewMode === 'squads'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : viewMode === 'quests'
              ? 'bg-purple-100 text-purple-900 border-purple-300'
              : viewMode === 'friends'
              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            {viewMode === 'weekly' || viewMode === 'squads' ? '⏰ Resets Weekly' : '🔄 Permanent'}
          </span>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setShowInfoModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full border border-slate-200 active:scale-95 transition-all cursor-pointer"
            title="How standings work"
          >
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Info</span>
          </button>

          {viewMode === 'friends' && (
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setFriendModalTab(pendingRequestsCount > 0 ? 'requests' : 'friends');
                setShowAddFriendModal(true);
              }}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-full shadow-xs flex items-center gap-1 cursor-pointer transition-all relative border border-indigo-700"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manage Friends</span>
              {pendingRequestsCount > 0 && (
                <span className="min-w-[1rem] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black ml-0.5 animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* CONTROLS BAR (VIEW MODES & SUBJECTS) */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200 relative z-30 shrink-0 px-4 py-2 space-y-2 shadow-2xs">

        {/* VIEW MODE TABS */}
        <div className="px-4 py-1.5 flex items-center gap-1.5 sm:gap-2 mb-1 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('global');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer shrink-0 ${
              viewMode === 'global'
                ? 'bg-slate-800 text-white border-slate-900 shadow-xs ring-2 ring-slate-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Global</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('weekly');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer shrink-0 ${
              viewMode === 'weekly'
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Weekly</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('quests');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer shrink-0 ${
              viewMode === 'quests'
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Scroll className="w-3.5 h-3.5 shrink-0" />
            <span>Quests</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('squads');
            }}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer shrink-0 ${
              viewMode === 'squads'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Users2 className="w-3.5 h-3.5 shrink-0" />
            <span>Squads</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('friends');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 border-2 cursor-pointer relative shrink-0 ${
              viewMode === 'friends'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/30'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Friends</span>
            {friendsList.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
                viewMode === 'friends' ? 'bg-indigo-400 text-white' : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {friendsList.length}
              </span>
            )}
          </button>
        </div>

        {/* SUB-CONTROLS: WEEKLY SPARKS VS CONSISTENCY STREAK TOGGLE */}
        {viewMode === 'weekly' && (
          <div className="w-full px-4 pt-0.5 flex items-center justify-center gap-2">
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 w-full max-w-xs shadow-inner">
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setWeeklySubTab('sparks');
                }}
                className={`flex-1 py-1 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  weeklySubTab === 'sparks'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Sparks (Effort)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setWeeklySubTab('streaks');
                }}
                className={`flex-1 py-1 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  weeklySubTab === 'streaks'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3 h-3 fill-current text-amber-200" />
                <span>Streak (Consistency)</span>
              </button>
            </div>
          </div>
        )}

        {/* SUB-CONTROLS: GLOBAL MOUNTAIN TIER SUB-BRACKETS */}
        {viewMode === 'global' && (
          <div className="w-full relative group">
            <div className="w-full px-4 pt-0.5 flex items-center gap-1.5 overflow-x-auto scroll-smooth hide-scrollbar py-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-0.5 flex items-center gap-1">
                <span>Tier:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedTier('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-2 ${
                  selectedTier === 'all'
                    ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                All Tiers
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedTier('my_tier');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-2 flex items-center gap-1.5 ${
                  selectedTier === 'my_tier'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs ring-2 ring-indigo-400/40'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <span>⛰️ My Tier</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-200/80 text-indigo-900 font-extrabold">
                  {userCurrentTierObj.name}
                </span>
              </button>
              {(subjectConfig?.COMPETENCE_RANK_TIERS || []).map((t) => (
                <button
                  key={t.tier}
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setSelectedTier(t.tier);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-2 ${
                    Number(selectedTier) === Number(t.tier)
                      ? 'bg-indigo-700 text-white border-indigo-800 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={`${t.name} (${t.min}-${t.max} pts)`}
                >
                  T{t.tier}: {t.name}
                </button>
              ))}
            </div>
            {/* Visual right scroll fade indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none flex items-center justify-end pr-1 text-slate-400">
              <span className="text-xs font-black opacity-60">›</span>
            </div>
          </div>
        )}

        {/* SQUADS BANNER */}
        {viewMode === 'squads' && (
          <div className="w-full px-4 pt-1 flex items-center justify-center shrink-0">
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 w-full shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Users2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-amber-950 block">
                    Squad Standings
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium block leading-tight mt-0.5">
                    Team up with family and friends! Your team score grows as members complete practice quests and earn sparks together.
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-[11px] shrink-0 shadow-2xs">
                <span>🏔️</span>
                <span>{allAccountProfiles.length > 1 ? `${allAccountProfiles.length} Family Climbers` : `${1 + activeSquadBuddies.length} Squad Members`}</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBJECT SELECTION OR QUESTS BANNER */}
        {viewMode === 'quests' ? (
          <div className="w-full px-4 pt-1 flex items-center justify-center shrink-0">
            <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-sky-100 border-2 border-purple-200 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 w-full shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Mountain className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-purple-950 block">
                    Mountain Expedition Elevation
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium block leading-tight mt-0.5">
                    Earn XP across Daily, Weekly, and Squad Quests to conquer Ascent summits
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 text-white font-black text-[11px] shrink-0 shadow-2xs">
                <span>{userLevelInfo.icon}</span>
                <span>Ascent {userLevelInfo.ascentTier}: {userLevelInfo.ascentMode?.name}</span>
              </div>
            </div>
          </div>
        ) : viewMode !== 'squads' ? (
          <div className="w-full px-4 pt-1 flex items-center justify-center gap-2 shrink-0">
            {/* Mobile Subject Dropdown (< sm) */}
            <div className="relative sm:hidden w-48 max-w-[220px]" ref={subjectDropdownRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowSubjectDropdown(!showSubjectDropdown);
              }}
              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs border-2 ${
                selectedSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50'
                  : selectedSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50'
                  : selectedSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50'
              }`}
              title="Switch Subject"
              aria-expanded={showSubjectDropdown}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none select-none">
                  {selectedSubject === 'math' ? '🔢' : selectedSubject === 'words' ? '📚' : selectedSubject === 'world' ? '🌍' : '💻'}
                </span>
                <span className="tracking-tight capitalize">{selectedSubject}</span>
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
                    soundFx.playKeyTap();
                    setSelectedSubject('math');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    selectedSubject === 'math'
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔢</span>
                    <span>Kibo Math</span>
                  </div>
                  {selectedSubject === 'math' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                </button>

                {/* Words Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setSelectedSubject('words');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    selectedSubject === 'words'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📚</span>
                    <span>Kibo Words</span>
                  </div>
                  {selectedSubject === 'words' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>

                {/* World Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setSelectedSubject('world');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    selectedSubject === 'world'
                      ? 'bg-teal-100 border-teal-300 text-teal-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span>Kibo World</span>
                  </div>
                  {selectedSubject === 'world' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </button>

                {/* Coding Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setSelectedSubject('coding');
                    setShowSubjectDropdown(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer w-full text-left border ${
                    selectedSubject === 'coding'
                      ? 'bg-rose-100 border-rose-300 text-rose-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💻</span>
                    <span>Kibo Coding</span>
                  </div>
                  {selectedSubject === 'coding' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
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
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedSubject('math');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                selectedSubject === 'math'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-white/90 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-200'
              }`}
              title="Switch to Kibo Math"
            >
              <span className="text-sm sm:text-base leading-none select-none">🔢</span>
              <span className="tracking-tight">Math</span>
              {selectedSubject === 'math' && <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse" />}
            </button>

            {/* Kibo Words */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedSubject('words');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                selectedSubject === 'words'
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-300 ring-2 ring-indigo-400/50 scale-105'
                  : 'bg-white/90 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200'
              }`}
              title="Switch to Kibo Words"
            >
              <span className="text-sm sm:text-base leading-none select-none">📚</span>
              <span className="tracking-tight">Words</span>
              {selectedSubject === 'words' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo World */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedSubject('world');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                selectedSubject === 'world'
                  ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50 scale-105'
                  : 'bg-white/90 hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-200'
              }`}
              title="Switch to Kibo World"
            >
              <span className="text-sm sm:text-base leading-none select-none">🌍</span>
              <span className="tracking-tight">World</span>
              {selectedSubject === 'world' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* Kibo Coding */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedSubject('coding');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 border-2 ${
                selectedSubject === 'coding'
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50 scale-105'
                  : 'bg-white/90 hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-rose-200'
              }`}
              title="Switch to Kibo Coding"
            >
              <span className="text-sm sm:text-base leading-none select-none">💻</span>
              <span className="tracking-tight">Coding</span>
              {selectedSubject === 'coding' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
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
        ) : null}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-6">

        {/* FRIENDS EMPTY PROMPT BANNER */}
        {viewMode === 'friends' && friendsList.length === 0 && (
          <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 text-indigo-600">
                <Users className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Add Friends & Classmates</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Connect by climber tag to compare practice progress and equipped cosmetics!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setFriendModalTab('search');
                setShowAddFriendModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Friend</span>
            </button>
          </div>
        )}

        {/* EMPTY STATE IF NO PLAYERS */}
        {rankedStandings.length === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
            <Trophy className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
            <p className="text-slate-600 font-bold text-base">No standings recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">Complete a climb to claim 1st place on the board!</p>
          </div>
        )}

        {/* HERO PODIUM (Top 1 to 3) */}
        {top3.length > 0 && (
          <div className="pt-8 pb-10 px-4 flex justify-center items-end gap-2 sm:gap-6 relative">

            {/* 2nd Place */}
            {top3[1] && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedPlayerForModal(top3[1]);
                }}
                className="flex flex-col items-center flex-1 min-w-0 max-w-[125px] sm:max-w-[155px] mb-4 relative z-10 animate-fade-in-up text-left group cursor-pointer"
                style={{ animationDelay: '100ms' }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 transition-transform group-hover:scale-105 ${
                  top3[1].planTier === 'family'
                    ? 'bg-purple-100 border-2 border-purple-400 ring-4 ring-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.55),0_0_10px_rgba(245,158,11,0.4)]'
                    : top3[1].planTier === 'solo'
                    ? 'bg-amber-100 border-2 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : top3[1].isCurrentUser || top3[1].isCurrentUserSquad
                    ? 'bg-indigo-100 border-indigo-500 ring-4 ring-indigo-400/40'
                    : 'bg-slate-200 border-slate-300'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center scale-[0.85] sm:scale-95">
                    {viewMode === 'squads' ? (
                      <span className="text-3xl select-none">{top3[1].icon || '🦊'}</span>
                    ) : (
                      <Mascot size={56} mood={top3[1].isCurrentUser ? "excited" : "happy"} equipped={top3[1].equipped} className="w-full h-full" />
                    )}
                  </div>
                </div>
                <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[1].name}>
                  <span className="font-bold text-xs text-center break-words line-clamp-2 max-w-full leading-tight">
                    {top3[1].name}
                  </span>
                  {top3[1].planTier === 'family' ? (
                    <span className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-purple-300" title="Family VIP">
                      👑 FAMILY
                    </span>
                  ) : top3[1].planTier === 'solo' ? (
                    <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-amber-300" title="Kibo Club">
                      ⭐ CLUB
                    </span>
                  ) : null}
                  {top3[1].isCurrentUser || top3[1].isCurrentUserSquad ? (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0">YOU</span>
                  ) : top3[1].isFriend ? (
                    <span className="bg-rose-500/15 text-rose-700 border border-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5 shrink-0" title="Friend">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-slate-500 font-bold mb-2">
                  {viewMode === 'global'
                    ? top3[1].score + ' pts'
                    : viewMode === 'weekly'
                    ? (weeklySubTab === 'streaks' ? `${top3[1].streak || top3[1].maxStreak || 0} 🔥 days` : `${top3[1].sparks || 0} sparks`)
                    : viewMode === 'squads'
                    ? `${(top3[1].squadScore || 0).toLocaleString()} pts`
                    : (top3[1].totalXp ?? top3[1].score ?? 0).toLocaleString() + ' XP'}
                </span>
                <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 border-x border-t border-slate-400 rounded-t-lg h-24 flex justify-center pt-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                  <span className="text-xl font-black text-slate-500 drop-shadow-sm">2</span>
                </div>
              </button>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedPlayerForModal(top3[0]);
                }}
                className="flex flex-col items-center flex-1 min-w-0 max-w-[145px] sm:max-w-[175px] relative z-20 animate-fade-in-up text-left group cursor-pointer"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 shadow-xl flex items-center justify-center mb-2 overflow-hidden relative shrink-0 transition-transform group-hover:scale-105 ${
                  top3[0].planTier === 'family'
                    ? 'bg-purple-100 border-amber-300 ring-4 ring-purple-500/80 shadow-[0_0_26px_rgba(168,85,247,0.65),0_0_15px_rgba(245,158,11,0.55)]'
                    : top3[0].planTier === 'solo'
                    ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.55)]'
                    : top3[0].isCurrentUser || top3[0].isCurrentUserSquad ? 'bg-amber-100 border-amber-400 ring-4 ring-indigo-500/60' : 'bg-amber-100 border-amber-400'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center scale-[0.88] sm:scale-95">
                    {viewMode === 'squads' ? (
                      <span className="text-4xl select-none">{top3[0].icon || '🏔️'}</span>
                    ) : (
                      <Mascot size={72} mood="excited" equipped={top3[0].equipped} className="w-full h-full" />
                    )}
                  </div>
                </div>
                <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[0].name}>
                  <span className="font-black text-sm text-amber-900 text-center break-words line-clamp-2 max-w-full leading-tight">
                    {top3[0].name}
                  </span>
                  {top3[0].planTier === 'family' ? (
                    <span className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-purple-300" title="Family VIP">
                      👑 FAMILY
                    </span>
                  ) : top3[0].planTier === 'solo' ? (
                    <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-amber-300" title="Kibo Club">
                      ⭐ CLUB
                    </span>
                  ) : null}
                  {top3[0].isCurrentUser || top3[0].isCurrentUserSquad ? (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0">YOU</span>
                  ) : top3[0].isFriend ? (
                    <span className="bg-rose-500/15 text-rose-700 border border-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5 shrink-0" title="Friend">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-amber-700 font-bold mb-2 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5 border border-amber-200">
                  {viewMode === 'global'
                    ? top3[0].score + ' pts'
                    : viewMode === 'weekly'
                    ? (weeklySubTab === 'streaks' ? `${top3[0].streak || top3[0].maxStreak || 0} 🔥 days` : `${top3[0].sparks || 0} sparks`)
                    : viewMode === 'squads'
                    ? `${(top3[0].squadScore || 0).toLocaleString()} pts`
                    : (top3[0].totalXp ?? top3[0].score ?? 0).toLocaleString() + ' XP'}
                </span>
                <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 border-x border-t border-amber-500 rounded-t-lg h-32 flex justify-center pt-3 shadow-[0_-10px_20px_rgba(251,191,36,0.2)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  <span className="text-3xl font-black text-amber-700 drop-shadow-md">1</span>
                </div>
              </button>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedPlayerForModal(top3[2]);
                }}
                className="flex flex-col items-center flex-1 min-w-0 max-w-[125px] sm:max-w-[155px] mb-8 relative z-10 animate-fade-in-up text-left group cursor-pointer"
                style={{ animationDelay: '200ms' }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 transition-transform group-hover:scale-105 ${
                  top3[2].planTier === 'family'
                    ? 'bg-purple-100 border-2 border-purple-400 ring-4 ring-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.55),0_0_10px_rgba(245,158,11,0.4)]'
                    : top3[2].planTier === 'solo'
                    ? 'bg-amber-100 border-2 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : top3[2].isCurrentUser || top3[2].isCurrentUserSquad
                    ? 'bg-orange-100 border-orange-400 ring-4 ring-indigo-400/40'
                    : 'bg-orange-100 border-orange-300'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center scale-[0.85] sm:scale-95">
                    {viewMode === 'squads' ? (
                      <span className="text-3xl select-none">{top3[2].icon || '🐻'}</span>
                    ) : (
                      <Mascot size={56} mood={top3[2].isCurrentUser ? "excited" : "happy"} equipped={top3[2].equipped} className="w-full h-full" />
                    )}
                  </div>
                </div>
                <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[2].name}>
                  <span className="font-bold text-xs text-center break-words line-clamp-2 max-w-full leading-tight">
                    {top3[2].name}
                  </span>
                  {top3[2].planTier === 'family' ? (
                    <span className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-purple-300" title="Family VIP">
                      👑 FAMILY
                    </span>
                  ) : top3[2].planTier === 'solo' ? (
                    <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-amber-300" title="Kibo Club">
                      ⭐ CLUB
                    </span>
                  ) : null}
                  {top3[2].isCurrentUser || top3[2].isCurrentUserSquad ? (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0">YOU</span>
                  ) : top3[2].isFriend ? (
                    <span className="bg-rose-500/15 text-rose-700 border border-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5 shrink-0" title="Friend">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-slate-500 font-bold mb-2">
                  {viewMode === 'global'
                    ? top3[2].score + ' pts'
                    : viewMode === 'weekly'
                    ? (weeklySubTab === 'streaks' ? `${top3[2].streak || top3[2].maxStreak || 0} 🔥 days` : `${top3[2].sparks || 0} sparks`)
                    : viewMode === 'squads'
                    ? `${(top3[2].squadScore || 0).toLocaleString()} pts`
                    : (top3[2].totalXp ?? top3[2].score ?? 0).toLocaleString() + ' XP'}
                </span>
                <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 border-x border-t border-orange-400 rounded-t-lg h-16 flex justify-center pt-1.5 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                  <span className="text-lg font-black text-orange-700 drop-shadow-sm">3</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* SCROLLABLE LIST (Ranks 4+) */}
        <div className="px-4 space-y-2 pb-6">
          {others.map((player) => {
            const playerPlanTier = player.planTier || 'free';
            const isSquadMode = viewMode === 'squads';

            return (
              <div
                key={player.isCurrentUser || player.isCurrentUserSquad ? 'current-user-row' : `${player.id || player.name}-${player.rank}`}
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedPlayerForModal(player);
                }}
                className={`rounded-2xl p-3 flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                  playerPlanTier === 'family'
                    ? player.isCurrentUser || player.isCurrentUserSquad
                      ? 'bg-gradient-to-r from-purple-50 via-pink-50/40 to-amber-50/60 border-2 border-purple-400 ring-2 ring-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.35),0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-gradient-to-r from-purple-50/40 via-white to-amber-50/30 border-2 border-purple-300/80 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                    : playerPlanTier === 'solo'
                    ? player.isCurrentUser || player.isCurrentUserSquad
                      ? 'bg-gradient-to-r from-amber-50/70 via-yellow-50/40 to-amber-50/70 border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                      : 'bg-gradient-to-r from-amber-50/30 via-white to-amber-50/20 border border-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                    : player.isCurrentUser || player.isCurrentUserSquad
                    ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                    : player.isFriend
                    ? 'bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-white border border-rose-200 shadow-sm hover:shadow-md'
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Rank Number */}
                <div className={`w-6 text-center font-black shrink-0 ${player.isCurrentUser || player.isCurrentUserSquad ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {player.rank}
                </div>

                {/* Avatar Mascot or Squad Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center shrink-0 overflow-hidden relative ${
                  isSquadMode
                    ? 'bg-amber-100 border-amber-300 text-2xl'
                    : playerPlanTier === 'family'
                    ? 'bg-gradient-to-br from-purple-100 to-amber-100 border-2 border-purple-300 ring-2 ring-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : playerPlanTier === 'solo'
                    ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 ring-2 ring-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.45)]'
                    : player.isCurrentUser
                    ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-400/30'
                    : player.isFriend
                    ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-300/40'
                    : 'bg-slate-100 border-slate-200'
                }`}>
                  {isSquadMode ? (
                    <span className="select-none">{player.icon || '🏔️'}</span>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                      <Mascot size={44} mood={player.isCurrentUser ? "happy" : "neutral"} equipped={player.equipped} className="w-full h-full" />
                    </div>
                  )}
                </div>

                {/* Player / Squad Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-800 break-words line-clamp-2" title={player.name}>
                      {player.name}
                    </span>
                    {playerPlanTier === 'family' ? (
                      <span className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-purple-300" title="Family VIP">
                        👑 FAMILY
                      </span>
                    ) : playerPlanTier === 'solo' ? (
                      <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 border border-amber-300" title="Kibo Club Solo">
                        ⭐ CLUB
                      </span>
                    ) : null}
                    {(player.isCurrentUser || player.isCurrentUserSquad) && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                    {player.isFriend && (
                      <span className="bg-rose-500/15 text-rose-700 border border-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5 shrink-0">
                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" /> Friend
                      </span>
                    )}
                  </div>
                  {isSquadMode ? (
                    <span className="text-xs text-amber-800 font-medium truncate flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{player.membersCount} Climbers • {(player.memberNames || []).slice(0, 3).join(', ')}</span>
                    </span>
                  ) : viewMode === 'quests' ? (
                    <span className="text-xs text-purple-700 font-medium truncate flex items-center gap-1 mt-0.5">
                      <Mountain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">[Ascent {player.ascentTier || 1}] Lv. {player.level || 1} • {player.title || 'Basecamp Explorer'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {player.subjectsMastered} Skills Mastered
                      {player.tier && (
                        <span className="text-indigo-600 font-bold ml-1">
                          • T{player.tier}
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Score / Rank Badge */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-black text-indigo-700 text-sm">
                    {viewMode === 'global'
                      ? player.score
                      : viewMode === 'weekly'
                      ? (weeklySubTab === 'streaks' ? (player.streak || player.maxStreak || 0) : (player.sparks || 0))
                      : isSquadMode
                      ? (player.squadScore || 0).toLocaleString()
                      : (player.totalXp ?? player.score ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    {viewMode === 'global'
                      ? getRankTitle(player.score)
                      : viewMode === 'weekly'
                      ? (weeklySubTab === 'streaks' ? 'Day Streak 🔥' : 'Sparks')
                      : isSquadMode
                      ? 'Squad Pts'
                      : 'Elevation XP'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PINNED CURRENT USER / SQUAD CARD */}
      <div className="shrink-0 px-3 py-2 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent pt-3 z-30 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto w-full">
          {(() => {
            const userPlanTier = storageService.getPlanTier(activeProfile?.id);
            const mySquad = squadStandingsList.find(s => s.isCurrentUserSquad);
            const isSquadMode = viewMode === 'squads';

            return (
              <div className={`rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden transition-all ${
                userPlanTier === 'family'
                  ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-400 ring-2 ring-purple-400/60 shadow-[0_0_28px_rgba(168,85,247,0.5),0_0_18px_rgba(245,158,11,0.35)]'
                  : userPlanTier === 'solo'
                  ? 'bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_22px_rgba(245,158,11,0.45)]'
                  : 'bg-indigo-900 border-2 border-indigo-500 shadow-[0_10px_25px_rgba(67,56,202,0.3)]'
              }`}>
                {/* Subtle glow effect inside */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />

                {/* User / Squad Rank */}
                <div className="w-8 h-8 rounded-full bg-indigo-800/80 border border-indigo-400 flex items-center justify-center font-black text-white shrink-0 shadow-inner z-10">
                  #{isSquadMode ? (mySquad ? (squadStandingsList.indexOf(mySquad) + 1) : 1) : currentUserRank}
                </div>

                {/* User / Squad Avatar */}
                <div className={`w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-full border-2 flex items-center justify-center shrink-0 overflow-hidden z-10 relative ${
                  userPlanTier === 'family'
                    ? 'border-purple-300 ring-2 ring-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.6)]'
                    : userPlanTier === 'solo'
                    ? 'border-amber-300 ring-2 ring-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'border-indigo-300'
                }`}>
                   {isSquadMode ? (
                     <span className="text-2xl select-none">{mySquad?.icon || '🏔️'}</span>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                       <Mascot size={48} mood="happy" equipped={equippedItems} className="w-full h-full" />
                     </div>
                   )}
                </div>

                {/* User / Squad Info & Progress */}
                <div className="flex-1 min-w-0 flex flex-col z-10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-white text-sm truncate">
                      {isSquadMode ? (mySquad?.name || 'Your Squad') : `You (${username})`}
                    </span>
                    {userPlanTier === 'family' ? (
                      <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs border border-purple-300 flex items-center gap-1">
                        👑 FAMILY VIP
                      </span>
                    ) : userPlanTier === 'solo' ? (
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs font-black px-2 py-0.5 rounded-md shadow-xs border border-amber-300 flex items-center gap-1">
                        ⭐ KIBO CLUB
                      </span>
                    ) : null}
                    {isSquadMode ? (
                      <span className="bg-amber-500 text-amber-950 text-xs uppercase px-2 py-0.5 rounded font-black tracking-wider">
                        {mySquad?.badge || 'Expedition Squad'}
                      </span>
                    ) : viewMode === 'quests' ? (
                      <span className="bg-purple-600 text-purple-100 text-xs uppercase px-2 py-0.5 rounded font-bold tracking-wider">
                        [Ascent {userLevelInfo.ascentTier}] Lv. {userLevelInfo.level} • {userLevelInfo.title}
                      </span>
                    ) : (
                      <span className="bg-indigo-500 text-indigo-50 text-xs uppercase px-2 py-0.5 rounded font-bold tracking-wider">
                        {getRankTitle(userScore)}
                      </span>
                    )}
                  </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isSquadMode ? (
                  <Users2 className="w-3.5 h-3.5 text-amber-400" />
                ) : viewMode === 'quests' ? (
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                )}
                <span className="text-indigo-200 font-bold text-xs">
                  {isSquadMode
                    ? `${(mySquad?.squadScore || 0).toLocaleString()} Squad Points`
                    : viewMode === 'weekly' && weeklySubTab === 'streaks'
                    ? `${userState?.streak || activeProfile?.userData?.streak || 0} Day Consistency Streak 🔥`
                    : `${pinnedScoreDisplay.toLocaleString()} ${pinnedScoreLabel}`}
                </span>
              </div>

              {/* Contextual progress message */}
              <p className="text-xs text-indigo-300 mt-1 leading-tight font-medium">
                {isSquadMode
                  ? 'Play daily practice and squad quests together to raise your team score!'
                  : currentUserRank > 1
                  ? (viewMode === 'quests'
                      ? `+${pointsNeeded.toLocaleString()} XP needed to rank up in Mountain Quests`
                      : `+${pointsNeeded} ${viewMode === 'global' ? 'pts' : 'sparks'} needed to rank up in ${subjectConfig.name}`)
                  : (viewMode === 'quests'
                      ? `You are currently holding 1st place in Mountain Quests Elevation! Keep ascending!`
                      : `You are currently holding 1st place in ${subjectConfig.name}! Keep it up!`)}
              </p>
            </div>
          </div>
            );
          })()}
        </div>
      </div>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}

      {/* INFO MODAL */}
      {showInfoModal && (
        <div
          onClick={() => setShowInfoModal(false)}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-4 border-indigo-500 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden animate-pop flex flex-col cursor-default"
          >
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowInfoModal(false);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                viewMode === 'global' ? 'bg-indigo-100 text-indigo-600' : viewMode === 'weekly' ? 'bg-emerald-100 text-emerald-600' : viewMode === 'squads' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {viewMode === 'global' ? (
                  <Trophy className="w-6 h-6 stroke-[2.5]" />
                ) : viewMode === 'weekly' ? (
                  <Zap className="w-6 h-6 fill-current stroke-[2.5]" />
                ) : viewMode === 'quests' ? (
                  <Scroll className="w-6 h-6 stroke-[2.5]" />
                ) : viewMode === 'squads' ? (
                  <Users2 className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <Users className="w-6 h-6 stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {viewMode === 'global' ? `${subjectConfig.name} Competence & Divisions` : viewMode === 'weekly' ? 'Weekly League & Consistency' : viewMode === 'quests' ? 'Mountain Quest Standings' : viewMode === 'squads' ? 'Squad Standings' : 'Friends Standings'}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {viewMode === 'global' ? 'How Global Divisions Work' : viewMode === 'weekly' ? 'How Weekly Leagues Work' : viewMode === 'squads' ? 'How Squad Standings Work' : 'How Standings Work'}
                </p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border text-xs sm:text-sm font-medium leading-relaxed ${
              viewMode === 'global' ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950' : viewMode === 'weekly' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : viewMode === 'squads' ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-purple-50/80 border-purple-200 text-purple-950'
            }`}>
              <div className="flex items-start gap-2.5">
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${viewMode === 'global' ? 'text-indigo-600' : viewMode === 'weekly' ? 'text-emerald-600' : viewMode === 'squads' ? 'text-amber-600' : 'text-purple-600'}`} />
                <div className="space-y-2">
                  <p>
                    {viewMode === 'global'
                      ? 'Global rankings track your dynamic Elo skill rating across all time. Points update after each practice session.'
                      : viewMode === 'weekly'
                      ? 'Compete in weekly leagues by earning Sparks (effort) or building daily habit Streaks (consistency).'
                      : viewMode === 'squads'
                      ? 'Squads let you team up with family and climbing buddies. Every spark earned and squad quest completed adds points to your shared score.'
                      : viewMode === 'quests'
                      ? 'Climbers earn XP Elevation by completing Daily Expeditions, Weekly Milestones, and Squad Quests.'
                      : `Compare your ${subjectConfig.name} competence ratings directly against your added friends and classmates.`}
                  </p>
                  <div className="pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold">
                    <span className="text-slate-500 uppercase text-[10px] tracking-wider">Reset Schedule:</span>
                    <span className="text-slate-900">
                      {viewMode === 'global'
                        ? '🔄 Never Resets (Continuous Elo Rating)'
                        : viewMode === 'weekly'
                        ? '⏰ Resets Every Sunday at 23:59 UTC'
                        : viewMode === 'squads'
                        ? '⏰ Resets Every Sunday at 23:59 UTC'
                        : viewMode === 'quests'
                        ? '🔄 Never Resets (Permanent Lifetime Elevation XP)'
                        : '🔄 Never Resets (Live Friend Elo Ratings)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center px-1">
              {viewMode === 'global' ? (
                '💡 Keep climbing and answering accurately to raise your division rank!'
              ) : viewMode === 'weekly' ? (
                '💡 Climb every single day to hold the #1 consistency streak spot!'
              ) : viewMode === 'squads' ? (
                '💡 Complete buddy quests in the Quests tab to earn big team bonuses!'
              ) : (
                <span>
                  💡{' '}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowInfoModal(false);
                      setFriendModalTab('search');
                      setShowAddFriendModal(true);
                    }}
                    className="underline font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                  >
                    Add up to 25 friends
                  </button>{' '}
                  using their unique climber tags to follow each other's climb!
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setShowInfoModal(false);
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* PLAYER INSPECTOR MODAL */}
      {selectedPlayerForModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Climber Details"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedPlayerForModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-indigo-100 flex flex-col items-center gap-4 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedPlayerForModal(null);
                setFriendActionFeedback('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mascot / Squad Avatar */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center overflow-hidden relative shadow-md mt-1 ${
              selectedPlayerForModal.planTier === 'family'
                ? 'bg-purple-100 border-purple-400 ring-4 ring-purple-400/80 shadow-[0_0_24px_rgba(168,85,247,0.55),0_0_12px_rgba(245,158,11,0.4)]'
                : selectedPlayerForModal.planTier === 'solo'
                ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_0_18px_rgba(245,158,11,0.5)]'
                : selectedPlayerForModal.isCurrentUser || selectedPlayerForModal.isCurrentUserSquad
                ? 'bg-indigo-100 border-indigo-400 ring-4 ring-indigo-300/40'
                : selectedPlayerForModal.isFriend
                ? 'bg-rose-50 border-rose-300 ring-4 ring-rose-200/50'
                : 'bg-slate-100 border-slate-300'
            }`}>
              {viewMode === 'squads' ? (
                <span className="text-4xl select-none">{selectedPlayerForModal.icon || '🏔️'}</span>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center scale-95">
                  <Mascot size={72} mood="excited" equipped={selectedPlayerForModal.equipped || []} className="w-full h-full" />
                </div>
              )}
            </div>

            {/* Full Username & Badges */}
            <div className="text-center w-full px-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h3 className="font-black text-lg sm:text-xl text-slate-800 break-all select-all">
                  {selectedPlayerForModal.name}
                </h3>
                {selectedPlayerForModal.planTier === 'family' ? (
                  <span className="text-xs bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black px-2 py-0.5 rounded-md shadow-xs border border-purple-300 flex items-center gap-1 shrink-0">
                    👑 FAMILY VIP
                  </span>
                ) : selectedPlayerForModal.planTier === 'solo' ? (
                  <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-2 py-0.5 rounded-md shadow-xs border border-amber-300 flex items-center gap-1 shrink-0">
                    ⭐ KIBO CLUB
                  </span>
                ) : null}
                {(selectedPlayerForModal.isCurrentUser || selectedPlayerForModal.isCurrentUserSquad) ? (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                    YOU
                  </span>
                ) : selectedPlayerForModal.isFriend ? (
                  <span className="bg-rose-500/15 text-rose-700 border border-rose-300 text-xs px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> Friend
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Leaderboard Rank #{selectedPlayerForModal.rank || '—'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {viewMode === 'global' ? 'Rating' : viewMode === 'weekly' ? (weeklySubTab === 'streaks' ? 'Streak' : 'Sparks') : viewMode === 'squads' ? 'Squad Pts' : 'Total XP'}
                </span>
                <span className="text-base font-black text-indigo-700 mt-0.5">
                  {viewMode === 'global'
                    ? selectedPlayerForModal.score
                    : viewMode === 'weekly'
                    ? (weeklySubTab === 'streaks' ? `${selectedPlayerForModal.streak || selectedPlayerForModal.maxStreak || 0} 🔥` : (selectedPlayerForModal.sparks || 0))
                    : viewMode === 'squads'
                    ? (selectedPlayerForModal.squadScore || 0).toLocaleString()
                    : (selectedPlayerForModal.totalXp ?? selectedPlayerForModal.score ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {viewMode === 'quests' ? 'Ascent Tier' : viewMode === 'squads' ? 'Members' : 'Division'}
                </span>
                <span className="text-base font-black text-purple-700 mt-0.5 truncate max-w-full">
                  {viewMode === 'quests'
                    ? `Ascent ${selectedPlayerForModal.ascentTier || 1}`
                    : viewMode === 'squads'
                    ? `${selectedPlayerForModal.membersCount || 1} Climbers`
                    : (selectedPlayerForModal.tierName || `Tier ${selectedPlayerForModal.tier || 1}`)}
                </span>
              </div>
            </div>

            {/* Feedback Message */}
            {friendActionFeedback && (
              <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-3 rounded-xl text-center animate-fade-in">
                {friendActionFeedback}
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setSelectedPlayerForModal(null);
                setFriendActionFeedback('');
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ADD FRIEND MODAL */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        activeSubject={selectedSubject}
        initialTab={friendModalTab}
        onFriendAdded={refreshFriendsStandings}
      />

      {/* WEEKLY LEADERBOARD SETTLEMENT REWARD CELEBRATION MODAL */}
      {weeklySettlementReward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Weekly Leaderboard Rewards"
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in"
        >
          <div
            className="w-full max-w-sm bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden animate-pop flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sparkle Glow FX */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner animate-bounce">
              {weeklySettlementReward.badgeIcon || '🏆'}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 inline-block mb-1">
                Weekly League Finished! ({weeklySettlementReward.weekStr})
              </span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {weeklySettlementReward.tierTitle}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                You finished Rank #{weeklySettlementReward.rank} in your cohort! Here are your rewards:
              </p>
            </div>

            {/* Rewarded Items Grid */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              {/* Sparks Reward */}
              <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-2xs font-black">
                  ⚡
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-black text-amber-950 block">
                    +{weeklySettlementReward.sparksGranted}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold block">
                    Sparks
                  </span>
                </div>
              </div>

              {/* Shields or Converted Bonus */}
              {weeklySettlementReward.shieldsGranted > 0 ? (
                <div className="bg-sky-100/70 border border-sky-300 rounded-2xl p-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-400 text-sky-950 flex items-center justify-center shrink-0 shadow-2xs font-black">
                    🛡️
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-black text-sky-950 block">
                      +{weeklySettlementReward.shieldsGranted}
                    </span>
                    <span className="text-[10px] text-sky-700 font-bold block">
                      Streak Shield
                    </span>
                  </div>
                </div>
              ) : weeklySettlementReward.convertedShieldsToPowerUps > 0 ? (
                <div className="bg-purple-100/70 border border-purple-300 rounded-2xl p-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-400 text-purple-950 flex items-center justify-center shrink-0 shadow-2xs font-black">
                    ✨
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-black text-purple-950 block">
                      +{weeklySettlementReward.convertedShieldsToPowerUps} (Max 2 🛡️)
                    </span>
                    <span className="text-[9px] text-purple-700 font-bold block leading-tight">
                      Bonus Potion
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Rotating Power-Ups Display */}
              {Object.entries(weeklySettlementReward.powerUpsGranted || {}).map(([key, count]) => {
                if (!count) return null;
                const powerUpName = key === 'doubleSparksPotionCount'
                  ? 'Double Potion'
                  : key === 'hintScrollCount'
                  ? 'Hint Scroll'
                  : key === 'letterSpyglassCount'
                  ? 'Spyglass'
                  : key === 'letterPrunerCount'
                  ? 'Pruner'
                  : 'Compass';
                const powerUpIcon = key === 'doubleSparksPotionCount' ? '🧪' : key === 'hintScrollCount' ? '📜' : key === 'letterSpyglassCount' ? '🔍' : key === 'letterPrunerCount' ? '✂️' : '🧭';

                return (
                  <div key={key} className="bg-emerald-100/70 border border-emerald-300 rounded-2xl p-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-2xs text-sm">
                      {powerUpIcon}
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-xs font-black text-emerald-950 block">
                        +{count}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block truncate">
                        {powerUpName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Claim / Close Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setWeeklySettlementReward(null);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Gift className="w-4 h-4" />
              <span>Claim & Continue Climbing</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
