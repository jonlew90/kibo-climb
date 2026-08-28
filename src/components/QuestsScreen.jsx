import React, { useState, useEffect } from 'react';
import {
  Zap,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  Users,
  Mountain,
  Compass,
  Globe,
  Calculator,
  BookOpen,
  Code,
  ArrowLeft,
  Shield,
  Gift,
  UserPlus,
  ChevronRight,
  Star,
  Check,
  Scroll,
  Info,
  Trophy,
  X
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { questService } from '../services/questService';
import { COMPANION_BUDDIES, ASCENT_MODES, ASCENT_RANKS, QUEST_RANKS } from '../data/questsData';
import { storageService } from '../services/storageService';
import RollingNumberTicker from './RollingNumberTicker';
import ConfettiCanvas from './ConfettiCanvas';
import AddFriendModal from './AddFriendModal';
import Mascot from './Mascot';

export default function QuestsScreen({
  activeSubject = 'math',
  sparks,
  userState = {},
  onNavigate,
  onBack,
  renderFooter,
  onAwardReward,
  onAwardSparks
}) {
  const activeProfile = storageService.getActiveProfile();
  const profileId = activeProfile?.id || 'default_child';
  const userEquippedItems = activeProfile?.shopState?.equippedItems || userState?.equippedItems || [];
  const currentSparks = typeof sparks === 'number' ? sparks : (storageService.getUserData(activeSubject).sparks || 0);

  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'team2' | 'team3'
  const [questState, setQuestState] = useState(() => questService.getQuests(profileId));
  const [dailyCountdown, setDailyCountdown] = useState(() => questService.getTimeUntilDailyReset());
  const [weeklyCountdown, setWeeklyCountdown] = useState(() => questService.getTimeUntilWeeklyReset());
  const [celebrationReward, setCelebrationReward] = useState(null);
  const [showTeammatePicker, setShowTeammatePicker] = useState(null); // { questId, teamType, slotIndex }
  const [showLevelInfoModal, setShowLevelInfoModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendsList, setFriendsList] = useState(() => storageService.getFriends());

  const handleOpenQuestLeaderboard = () => {
    soundFx.playKeyTap();
    try {
      localStorage.setItem('kibo_leaderboard_initial_view', 'quests');
    } catch (e) {}
    if (onNavigate) {
      onNavigate('/leaderboard', 'leaderboard');
    }
  };

  // Update countdown timers periodically and refresh quests on date/week rollover
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyCountdown(questService.getTimeUntilDailyReset());
      setWeeklyCountdown(questService.getTimeUntilWeeklyReset());
      setQuestState(prevState => {
        const latestState = questService.getQuests(profileId);
        if (latestState.dateKey !== prevState.dateKey || latestState.weekKey !== prevState.weekKey) {
          return latestState;
        }
        return prevState;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [profileId]);

  const handleClaim = (quest) => {
    if (!quest.completed || quest.claimed) return;
    soundFx.playVictory();
    const result = questService.claimReward(profileId, quest.id);
    if (result.success) {
      setQuestState(questService.getQuests(profileId));
      
      const totalSparksEarned = (result.reward?.sparks || 0) + (result.leveledUp?.reward?.sparks || 0);
      const totalShieldsEarned = (result.reward?.shields || 0) + (result.leveledUp?.reward?.shields || 0);
      const totalAltitudeEarned = result.reward?.altitude || result.earnedXp || 0;

      setCelebrationReward({
        ...result.reward,
        sparks: totalSparksEarned,
        shields: totalShieldsEarned,
        altitude: totalAltitudeEarned,
        leveledUp: result.leveledUp,
        newlyUnlockedBadges: result.newlyUnlockedBadges,
        earnedXp: totalAltitudeEarned
      });
      if (onAwardReward) {
        onAwardReward({
          sparks: totalSparksEarned,
          shields: totalShieldsEarned,
          newlyUnlockedBadges: result.newlyUnlockedBadges
        });
      } else if (onAwardSparks && totalSparksEarned > 0) {
        onAwardSparks(totalSparksEarned);
      }
    }
  };

  const handleSelectTeammate = (teammate) => {
    if (!showTeammatePicker) return;
    soundFx.playKeyTap();
    const { questId, slotIndex } = showTeammatePicker;
    questService.setTeammate(profileId, questId, teammate, slotIndex || 0);
    setQuestState(questService.getQuests(profileId));
    setShowTeammatePicker(null);
  };

  const renderQuestIcon = (iconName, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'Code':
        return <Code className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Mountain':
        return <Mountain className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Zap':
      default:
        return <Zap className={className} />;
    }
  };

  // Filter quests based on tab
  const getFilteredQuests = () => {
    const daily = (questState?.daily || []).map(q => ({ ...q, type: 'daily' }));
    const weekly = (questState?.weekly || []).map(q => ({ ...q, type: 'weekly' }));
    const team2 = (questState?.team2 || []).map(q => ({ ...q, type: 'team2' }));
    const team3 = (questState?.team3 || []).map(q => ({ ...q, type: 'team3' }));

    if (activeTab === 'weekly') return weekly;
    if (activeTab === 'team2') return team2;
    if (activeTab === 'team3') return team3;
    return daily;
  };

  const filteredQuests = getFilteredQuests();
  const allQuestsList = [
    ...(questState?.daily || []).map(q => ({ ...q, type: 'daily' })),
    ...(questState?.weekly || []).map(q => ({ ...q, type: 'weekly' })),
    ...(questState?.team2 || []).map(q => ({ ...q, type: 'team2' })),
    ...(questState?.team3 || []).map(q => ({ ...q, type: 'team3' }))
  ];
  const unclaimedCount = allQuestsList.filter(q => q.completed && !q.claimed).length;

  const scrollToFirstClaimable = () => {
    soundFx.playKeyTap();
    // 1. Check if current filtered list has a claimable quest
    let targetQuest = filteredQuests.find(q => q.completed && !q.claimed);

    // 2. If not visible in current tab, look across all quests
    if (!targetQuest) {
      targetQuest = allQuestsList.find(q => q.completed && !q.claimed);
      if (targetQuest) {
        // Switch tab to the target quest's category
        setActiveTab(targetQuest.type || 'daily');
      }
    }

    if (targetQuest) {
      // Allow state update/render to complete before scrolling
      setTimeout(() => {
        const el = document.getElementById(`quest-card-${targetQuest.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {celebrationReward && (
        <ConfettiCanvas />
      )}

      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800">
          <Scroll className="w-5 h-5 text-purple-600 stroke-[2.5]" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">Mountain Quests</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sparks Counter */}
          <div
            className="flex items-center gap-0.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-950 border-2 border-yellow-500 px-2.5 py-1 rounded-full text-xs font-black shadow-xs shrink-0"
            title={`Sparks Balance: ${currentSparks} ⚡`}
          >
            <RollingNumberTicker
              value={currentSparks}
              icon={<Zap className="w-3.5 h-3.5 text-amber-800 fill-amber-500 stroke-[2.5]" />}
              profileId={profileId}
              subjectId={activeSubject}
            />
          </div>

          {unclaimedCount > 0 && (
            <button
              type="button"
              onClick={scrollToFirstClaimable}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full text-xs font-black animate-bounce shadow-2xs cursor-pointer transition-colors"
              title="Click to jump to claimable quest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{unclaimedCount} Ready to Claim!</span>
              <span className="sm:hidden">{unclaimedCount} Ready!</span>
            </button>
          )}
        </div>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-5">

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden mb-5">
          <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
            <Compass className="w-48 h-48 text-white" />
          </div>
          
          <div className="relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Expedition Headquarters</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                Climber Milestones & Quests
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-md">
                Complete daily objectives, weekly milestones, and team ascents to gain XP, level up your Quest Rank, and earn Sparks & Shields!
              </p>
            </div>
          </div>

          {/* Quest Rank & XP Level Bar */}
          {(() => {
            const levelInfo = questState?.levelInfo || {
              ascentTier: 1,
              ascentMode: ASCENT_MODES[0],
              level: 1,
              title: 'Basecamp Explorer',
              icon: '🏕️',
              currentXp: 0,
              xpIntoLevel: 0,
              xpRequiredForLevel: 150,
              progressPct: 0,
              sparkBonusPct: 0
            };

            const ascentMode = levelInfo.ascentMode || ASCENT_MODES[0];

            return (
              <div className="relative z-10 mt-5 pt-4 border-t border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl drop-shadow-xs">{levelInfo.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Ascent Mode Tag */}
                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                          <span>{ascentMode.icon}</span>
                          <span>Ascent {levelInfo.ascentTier}: {ascentMode.name}</span>
                        </span>

                        {/* Level Tag */}
                        <span className="px-2 py-0.5 rounded-md bg-white/25 text-white text-[10px] font-black uppercase tracking-wider">
                          Lv. {levelInfo.level}
                        </span>

                        <span className="font-black text-sm text-white tracking-wide">
                          {levelInfo.title}
                        </span>

                        {/* Permanent Spark Boost Tag */}
                        {levelInfo.sparkBonusPct > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            +{levelInfo.sparkBonusPct}% Sparks
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setShowLevelInfoModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-[11px] font-bold text-amber-200 border border-amber-300/40 cursor-pointer transition-all shadow-xs"
                          title="View all level XP requirements"
                        >
                          <Info className="w-3 h-3 text-amber-300" />
                          <span>All Levels XP</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenQuestLeaderboard}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-[11px] font-bold text-amber-200 border border-amber-300/40 cursor-pointer transition-all shadow-xs"
                          title="View Mountain Quest Standings"
                        >
                          <Trophy className="w-3 h-3 text-amber-300" />
                          <span>Standings</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-purple-200 block mt-0.5">
                        Total XP: <strong className="text-emerald-300 font-black">{levelInfo.currentXp.toLocaleString()} XP</strong>
                        <span className="text-purple-300/80 ml-1.5 font-medium">({ascentMode.weather})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span className="text-xs font-black text-white block">
                      {levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForLevel} XP <span className="text-purple-200 font-normal">({levelInfo.progressPct}%)</span>
                    </span>
                    {levelInfo.nextRankTitle && (
                      <span className="text-[11px] text-purple-200">
                        Next: <span className="font-bold text-white">{levelInfo.nextRankTitle}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div 
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowLevelInfoModal(true);
                  }}
                  className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20 cursor-pointer hover:border-amber-300/60 transition-colors"
                  title="Click to view all level XP requirements"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 transition-all duration-700 shadow-inner"
                    style={{ width: `${levelInfo.progressPct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
          {[
            {
              id: 'daily',
              label: 'Daily Expeditions',
              shortLabel: 'Daily',
              icon: Zap,
              count: questState?.daily?.length,
              unclaimed: (questState?.daily || []).filter(q => q.completed && !q.claimed).length
            },
            {
              id: 'weekly',
              label: 'Weekly Ascents',
              shortLabel: 'Weekly',
              icon: Mountain,
              count: questState?.weekly?.length,
              unclaimed: (questState?.weekly || []).filter(q => q.completed && !q.claimed).length
            },
            {
              id: 'team2',
              label: '2-Person Tandem',
              shortLabel: '2P Tandem',
              icon: Users,
              count: questState?.team2?.length,
              unclaimed: (questState?.team2 || []).filter(q => q.completed && !q.claimed).length
            },
            {
              id: 'team3',
              label: '3-Person Squad',
              shortLabel: '3P Squad',
              icon: Compass,
              count: questState?.team3?.length,
              unclaimed: (questState?.team3 || []).filter(q => q.completed && !q.claimed).length
            }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 relative ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-purple-200 scale-102'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.unclaimed > 0 && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-amber-400 text-purple-950 animate-pulse' : 'bg-amber-500 text-white'
                  }`}>
                    {tab.unclaimed}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Schedule & Reset Banner */}
        {activeTab === 'daily' && (
          <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-purple-500/10 border-2 border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-800">Daily Expeditions</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wide">
                    Resets Daily at Midnight
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  Complete 3 fresh solo objectives every day to earn elevation XP and Sparks!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs shrink-0 text-amber-950 font-black text-xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Resets in: {dailyCountdown}</span>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border-2 border-purple-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Mountain className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-800">Weekly Ascents</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-200/80 text-purple-950 text-[10px] font-black uppercase tracking-wide">
                    Resets Every Monday
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  High-reward weekly milestones! Complete all 3 before next Monday's reset for big rewards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-2xs shrink-0 text-purple-950 font-black text-xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>Resets in: {weeklyCountdown}</span>
            </div>
          </div>
        )}

        {activeTab === 'team2' && (
          <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-teal-500/10 border-2 border-sky-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-800">2-Person Tandem Quests</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-sky-200/80 text-sky-950 text-[10px] font-black uppercase tracking-wide">
                    Weekly Rotation • Resets Mondays
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  New 2-Player Co-op Quests rotate every Monday! Climb with friends or AI companions. Switch partners anytime.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-sky-200 shadow-2xs shrink-0 text-sky-950 font-black text-xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>New Quests in: {weeklyCountdown}</span>
            </div>
          </div>
        )}

        {activeTab === 'team3' && (
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-purple-500/10 border-2 border-teal-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-300 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Compass className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-800">3-Person Squad Quests</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-teal-200/80 text-teal-950 text-[10px] font-black uppercase tracking-wide">
                    Weekly Rotation • Resets Mondays
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  New 3-Player Squad Quests rotate every Monday! Work together across all subjects for massive rewards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-teal-200 shadow-2xs shrink-0 text-teal-950 font-black text-xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>New Quests in: {weeklyCountdown}</span>
            </div>
          </div>
        )}

        {/* Quest List */}
        <div className="flex flex-col gap-3">
          {filteredQuests.map((quest) => {
            const isCompleted = quest.completed;
            const isClaimed = quest.claimed;
            const progressPercent = Math.min(100, Math.round(((quest.progress || 0) / quest.target) * 100));

            const isTeam2 = quest.type === 'team2';
            const isTeam3 = quest.type === 'team3';

            return (
              <div
                key={quest.id}
                id={`quest-card-${quest.id}`}
                className={`bg-white rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-xs relative overflow-hidden ${
                  isClaimed
                    ? 'border-emerald-200 bg-emerald-50/30 opacity-85'
                    : isCompleted
                    ? 'border-amber-400 ring-2 ring-amber-300/60 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/40'
                    : 'border-slate-200 hover:border-purple-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Icon & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isClaimed
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCompleted
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : quest.type === 'daily'
                          ? 'bg-sky-100 text-sky-700'
                          : quest.type === 'weekly'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {renderQuestIcon(quest.icon, 'w-6 h-6 stroke-[2.2]')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {quest.subject && quest.subject !== 'any' ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {quest.subject}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            All Subjects
                          </span>
                        )}

                        {quest.unit === 'streak' && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            Streak
                          </span>
                        )}

                        {/* Reset / Rotation Timer Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          quest.type === 'daily'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                            : (isTeam2 || isTeam3)
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                            : 'bg-purple-50 text-purple-800 border border-purple-200/80'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {quest.type === 'daily'
                              ? `Daily • ${dailyCountdown}`
                              : (isTeam2 || isTeam3)
                              ? `Weekly Co-op • ${weeklyCountdown}`
                              : `Weekly • ${weeklyCountdown}`}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {quest.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        {quest.description}
                      </p>

                      {/* Team Co-op Breakdown for 2-Person & 3-Person */}
                      {isTeam2 && (() => {
                        const isRealFriend = quest.partner && typeof quest.partner.id === 'string' && !quest.partner.id.startsWith('buddy_');

                        return (
                          <div className={`mt-3 border rounded-2xl p-2.5 flex items-center justify-between gap-2 flex-wrap ${
                            isRealFriend
                              ? 'bg-gradient-to-r from-amber-50/70 via-emerald-50/50 to-teal-50/70 border-emerald-300 ring-1 ring-emerald-300/50'
                              : 'bg-gradient-to-r from-slate-50 to-indigo-50/40 border-indigo-100'
                          }`}>
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              {/* You Slot */}
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                                  <div className="absolute inset-0 flex items-center justify-center scale-90">
                                    <Mascot size={24} equipped={userEquippedItems} className="w-full h-full" />
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold block">You</span>
                                  <span className="font-black text-slate-800">{quest.userProgress || 0}</span>
                                </div>
                              </div>

                              <span className="text-slate-400 font-bold text-xs">+</span>

                              {/* Partner Slot */}
                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playKeyTap();
                                  setShowTeammatePicker({ questId: quest.id, teamType: 'team2', slotIndex: 0, currentPartner: quest.partner, questTitle: quest.title });
                                }}
                                className={`flex items-center gap-1.5 bg-white hover:bg-indigo-50 border px-2.5 py-1 rounded-xl transition-all shadow-2xs group cursor-pointer text-left ${
                                  isRealFriend ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-indigo-200 hover:border-indigo-400'
                                }`}
                                title="Click to choose or change partner"
                              >
                                {isRealFriend ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                                    <div className="absolute inset-0 flex items-center justify-center scale-90">
                                      <Mascot size={24} equipped={quest.partner?.equipped || []} className="w-full h-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs text-sm">
                                    <span>{quest.partner?.avatar || '🦁'}</span>
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-indigo-900 font-black block truncate max-w-[75px]">
                                      {quest.partner?.name || 'Asha'}
                                    </span>
                                    <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">
                                      🔄
                                    </span>
                                  </div>
                                  <span className="font-black text-slate-800 text-xs">
                                    {quest.partnerProgress || 0}
                                  </span>
                                </div>
                              </button>

                              {isRealFriend ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-2xs animate-pulse">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>+25% Friend Synergy</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                                  (Expedition Guide)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {isTeam3 && (() => {
                        const isP1RealFriend = quest.partners?.[0] && typeof quest.partners[0].id === 'string' && !quest.partners[0].id.startsWith('buddy_');
                        const isP2RealFriend = quest.partners?.[1] && typeof quest.partners[1].id === 'string' && !quest.partners[1].id.startsWith('buddy_');
                        const hasRealFriend = isP1RealFriend || isP2RealFriend;

                        return (
                          <div className={`mt-3 border rounded-2xl p-2.5 flex items-center justify-between gap-2 flex-wrap ${
                            hasRealFriend
                              ? 'bg-gradient-to-r from-amber-50/70 via-emerald-50/50 to-teal-50/70 border-emerald-300 ring-1 ring-emerald-300/50'
                              : 'bg-gradient-to-r from-slate-50 to-indigo-50/40 border-indigo-100'
                          }`}>
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              {/* You Slot */}
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                                  <div className="absolute inset-0 flex items-center justify-center scale-90">
                                    <Mascot size={24} equipped={userEquippedItems} className="w-full h-full" />
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold block">You</span>
                                  <span className="font-black text-slate-800">{quest.userProgress || 0}</span>
                                </div>
                              </div>

                              <span className="text-slate-400 font-bold text-xs">+</span>

                              {/* Partner 1 Slot */}
                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playKeyTap();
                                  setShowTeammatePicker({ questId: quest.id, teamType: 'team3', slotIndex: 0, currentPartner: quest.partners?.[0], questTitle: quest.title });
                                }}
                                className={`flex items-center gap-1.5 bg-white hover:bg-indigo-50 border px-2.5 py-1 rounded-xl transition-all shadow-2xs group cursor-pointer text-left ${
                                  isP1RealFriend ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-indigo-200 hover:border-indigo-400'
                                }`}
                                title="Click to choose Partner 1"
                              >
                                {isP1RealFriend ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                                    <div className="absolute inset-0 flex items-center justify-center scale-90">
                                      <Mascot size={24} equipped={quest.partners?.[0]?.equipped || []} className="w-full h-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs text-sm">
                                    <span>{quest.partners?.[0]?.avatar || '🦁'}</span>
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-indigo-900 font-black block truncate max-w-[70px]">
                                      {quest.partners?.[0]?.name || 'Asha'}
                                    </span>
                                    <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">
                                      🔄
                                    </span>
                                  </div>
                                  <span className="font-black text-slate-800 text-xs">
                                    {quest.partnerProgresses?.[0] || 0}
                                  </span>
                                </div>
                              </button>

                              <span className="text-slate-400 font-bold text-xs">+</span>

                              {/* Partner 2 Slot */}
                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playKeyTap();
                                  setShowTeammatePicker({ questId: quest.id, teamType: 'team3', slotIndex: 1, currentPartner: quest.partners?.[1], questTitle: quest.title });
                                }}
                                className={`flex items-center gap-1.5 bg-white hover:bg-indigo-50 border px-2.5 py-1 rounded-xl transition-all shadow-2xs group cursor-pointer text-left ${
                                  isP2RealFriend ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-indigo-200 hover:border-indigo-400'
                                }`}
                                title="Click to choose Partner 2"
                              >
                                {isP2RealFriend ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                                    <div className="absolute inset-0 flex items-center justify-center scale-90">
                                      <Mascot size={24} equipped={quest.partners?.[1]?.equipped || []} className="w-full h-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs text-sm">
                                    <span>{quest.partners?.[1]?.avatar || '🦅'}</span>
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-indigo-900 font-black block truncate max-w-[70px]">
                                      {quest.partners?.[1]?.name || 'Leo'}
                                    </span>
                                    <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">
                                      🔄
                                    </span>
                                  </div>
                                  <span className="font-black text-slate-800 text-xs">
                                    {quest.partnerProgresses?.[1] || 0}
                                  </span>
                                </div>
                              </button>

                              {hasRealFriend && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-2xs animate-pulse">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>+25% Friend Synergy</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                          <span className="flex items-center gap-1">
                            {isTeam2 || isTeam3 ? (
                              <span className="inline-flex items-center gap-1 text-indigo-700 font-black text-[11px] bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                                👥 Combined Team Progress
                              </span>
                            ) : (
                              <span>Progress</span>
                            )}
                          </span>
                          <span className="font-black text-slate-800">
                            {quest.progress || 0} / {quest.target} {quest.unit || ''} ({progressPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isClaimed
                                ? 'bg-emerald-500'
                                : isCompleted
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                : (isTeam2 || isTeam3)
                                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Rewards & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 sm:min-w-[140px]">
                    <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                      {quest.reward?.sparks && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>+{quest.reward.sparks}</span>
                        </div>
                      )}

                      {quest.reward?.altitude && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs shadow-2xs">
                          <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+{quest.reward.altitude} XP</span>
                        </div>
                      )}

                      {quest.reward?.shields && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-900 font-black text-xs shadow-2xs">
                          <Shield className="w-3.5 h-3.5 text-indigo-600" />
                          <span>+{quest.reward.shields}</span>
                        </div>
                      )}
                    </div>

                    {/* Button State */}
                    {isClaimed ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Claimed</span>
                      </div>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(quest)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Claim Reward</span>
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 px-3 py-1.5">
                        In Progress
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Teammate Selection Drawer/Modal */}
      {showTeammatePicker && (
        <div
          onClick={() => setShowTeammatePicker(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-2 border-indigo-200 cursor-default animate-scaleIn"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-black text-slate-900">
                Choose Teammate
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase">
                {showTeammatePicker.teamType === 'team3'
                  ? `Slot ${(showTeammatePicker.slotIndex || 0) + 1} of 2`
                  : 'Partner Slot'}
              </span>
            </div>

            {/* Friend Synergy Announcement Banner */}
            <div className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-3 shadow-xs flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-wide block">
                  Friend Synergy Bonus Active!
                </span>
                <span className="text-xs text-emerald-100 block leading-tight mt-0.5">
                  Climb with a real friend to earn <strong className="text-amber-200 font-black">+25% Extra Sparks</strong> on this quest!
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {/* 1. Real Friends Section */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                  <span>👥 Your Friends</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">+25% Sparks</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    setShowAddFriendModal(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-800 hover:text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-102"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Find Friends</span>
                </button>
              </div>

              {friendsList && friendsList.length > 0 ? (
                friendsList.map((friend) => {
                  const isSelected = showTeammatePicker.currentPartner?.id === friend.id;
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => handleSelectTeammate({
                        id: friend.id,
                        name: friend.username || friend.name || 'Friend',
                        equipped: friend.equipped || [],
                        avatar: '🧗',
                        title: 'Climbing Friend'
                      })}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-300'
                          : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                          <div className="absolute inset-0 flex items-center justify-center scale-90">
                            <Mascot size={36} equipped={friend.equipped || []} className="w-full h-full" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-800 block group-hover:text-emerald-950">
                              {friend.username || friend.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase">
                              +25% Sparks
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-black uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold">
                            Friend
                          </span>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    No friends added yet! Search for friends or share your invite link to earn the <strong className="text-emerald-700 font-bold">+25% Friend Synergy Bonus</strong>!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setShowAddFriendModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Find & Add Friends (+25% Sparks)</span>
                  </button>
                </div>
              )}

              {/* 2. Mountain Companions (Starter Guides) */}
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mt-3">
                Mountain Companions (Starter Guides)
              </span>
              {COMPANION_BUDDIES.map((buddy) => {
                const isSelected = showTeammatePicker.currentPartner?.id === buddy.id;
                return (
                  <button
                    key={buddy.id}
                    type="button"
                    onClick={() => handleSelectTeammate(buddy)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-300'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs text-xl group-hover:scale-105 transition-transform">
                        <span>{buddy.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-800 block group-hover:text-indigo-950">
                            {buddy.name}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 text-[10px] font-black uppercase">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {buddy.title}
                        </span>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 px-3 py-2 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Team quests rotate every Monday ({weeklyCountdown} remaining in current week). You can change teammates anytime!</span>
            </div>

            <button
              type="button"
              onClick={() => setShowTeammatePicker(null)}
              className="mt-3 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Level XP Roadmap Modal */}
      {showLevelInfoModal && (
        <div
          onClick={() => setShowLevelInfoModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-purple-200 overflow-hidden cursor-default flex flex-col max-h-[70vh] sm:max-h-[75vh] animate-scaleIn"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Mountain className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-tight">
                    Expedition Ascents & Level Roadmap
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    Conquer 10 levels per Ascent to unlock harder weather & permanent perks!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelInfoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Player Status Banner */}
            {(() => {
              const currentLvl = questState?.levelInfo?.level || 1;
              const currentTier = questState?.levelInfo?.ascentTier || 1;
              const currentAscent = questState?.levelInfo?.ascentMode || ASCENT_MODES[0];
              const currentXp = questState?.levelInfo?.currentXp || 0;
              const sparkBonus = questState?.levelInfo?.sparkBonusPct || 0;

              return (
                <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-purple-900 block">
                      Total Elevation XP: <strong className="text-purple-700 font-black">{currentXp.toLocaleString()} XP</strong>
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold">
                      Current Boost: <strong className="text-emerald-600 font-black">+{sparkBonus}% Sparks</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 font-black text-[11px] flex items-center gap-1">
                    <span>{currentAscent.icon}</span>
                    <span>Ascent {currentTier} • Lv. {currentLvl}</span>
                  </span>
                </div>
              );
            })()}

            {/* Modal Body: Ascent Modes & 10 Ranks */}
            <div className="p-4 overflow-y-auto space-y-3.5 custom-scrollbar flex-1">
              
              {/* 1. Ascent Difficulty Tiers Section */}
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  Mountain Ascent Difficulty Tiers
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {ASCENT_MODES.map((mode) => {
                    const currentTier = questState?.levelInfo?.ascentTier || 1;
                    const isCurrentTier = currentTier === mode.tier;
                    const isUnlocked = currentTier >= mode.tier;

                    return (
                      <div
                        key={mode.tier}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isCurrentTier
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                            : isUnlocked
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{mode.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-800">
                                Ascent {mode.tier}: {mode.name}
                              </span>
                              {isCurrentTier && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {mode.subtitle} • {mode.weather}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md block">
                            +{mode.sparkBonusPct}% Sparks
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {mode.minXp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. The 10 Core Mountain Levels per Ascent */}
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  10 Mountain Levels in Current Ascent
                </h4>
                <div className="space-y-1.5">
                  {ASCENT_RANKS.map((rank) => {
                    const currentLvl = questState?.levelInfo?.level || 1;
                    const isCurrent = currentLvl === rank.level;
                    const isReached = currentLvl >= rank.level;

                    return (
                      <div
                        key={rank.level}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                            : isReached
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{rank.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                isCurrent ? 'bg-amber-400 text-amber-950' : isReached ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                              }`}>
                                Lv. {rank.level}
                              </span>
                              <span className="font-black text-xs text-slate-800">
                                {rank.title}
                              </span>
                            </div>

                            {rank.reward?.sparks && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 mt-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                +{rank.reward.sparks} Sparks
                                {rank.reward.shields ? ` • +${rank.reward.shields} Shield` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                            Active Level
                          </span>
                        ) : isReached ? (
                          <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> Conquered
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-medium">
                            Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLevelInfoModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {celebrationReward && (
        <div
          onClick={() => setCelebrationReward(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-300 text-center animate-scaleIn cursor-default"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
              {celebrationReward.leveledUp?.isSummit ? '🏔️' : celebrationReward.leveledUp ? '🎉' : '🎁'}
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {celebrationReward.leveledUp?.isSummit
                ? 'Ascent Summit Conquered!'
                : celebrationReward.leveledUp
                ? 'Quest Rank Up!'
                : 'Quest Complete!'}
            </h3>

            {celebrationReward.leveledUp ? (
              <div className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-3 shadow-md">
                <span className="text-xs font-black uppercase tracking-wider block opacity-90">
                  {celebrationReward.leveledUp.isSummit
                    ? `Promoted to Ascent ${celebrationReward.leveledUp.newTier}!`
                    : 'New Level Achieved'}
                </span>
                <span className="text-lg font-black block mt-0.5">
                  {celebrationReward.leveledUp.isSummit
                    ? `${celebrationReward.leveledUp.newAscentMode?.name || 'Next Peak'} ${celebrationReward.leveledUp.newAscentMode?.icon || '👑'}`
                    : `Lv. ${celebrationReward.leveledUp.newLevel} ${celebrationReward.leveledUp.rank?.title || ''} ${celebrationReward.leveledUp.rank?.icon || ''}`}
                </span>
                {celebrationReward.leveledUp.isSummit && (
                  <span className="text-xs font-bold text-amber-100 block mt-1">
                    Permanent Perk: +{celebrationReward.leveledUp.newAscentMode?.sparkBonusPct || 0}% Sparks on all future climbs!
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600 mb-4">
                Awesome climbing! Your rewards have been added to your inventory.
              </p>
            )}

            {/* Real Friend Synergy Bonus Highlight */}
            {celebrationReward.friendSynergySparks > 0 && (
              <div className="mb-3 bg-emerald-50 border border-emerald-300 rounded-2xl p-2 flex items-center justify-center gap-1.5 text-xs font-black text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>Includes +{celebrationReward.friendSynergySparks} Real Friend Synergy Bonus!</span>
              </div>
            )}

            {/* Unlocked Badges announcement if any */}
            {celebrationReward.newlyUnlockedBadges?.length > 0 && (
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-2xl p-2.5">
                <span className="text-[11px] font-black text-purple-900 block mb-1">
                  🎖️ New {celebrationReward.newlyUnlockedBadges.length === 1 ? 'Badge' : 'Badges'} Unlocked!
                </span>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {celebrationReward.newlyUnlockedBadges.map(b => (
                    <span key={b.id} className="text-xs font-bold text-purple-800 bg-white border border-purple-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      {b.icon} {b.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
              {celebrationReward.sparks > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center gap-1 border border-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>+{celebrationReward.sparks} Sparks</span>
                </div>
              )}
              {celebrationReward.altitude > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center gap-1 border border-emerald-300">
                  <Mountain className="w-4 h-4 text-emerald-600" />
                  <span>+{celebrationReward.altitude} XP</span>
                </div>
              )}
              {celebrationReward.shields > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-900 font-black text-sm flex items-center gap-1 border border-indigo-300">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>+{celebrationReward.shields} Shield{celebrationReward.shields > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                setCelebrationReward(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-xl shadow-md cursor-pointer hover:scale-102 active:scale-98 transition-all"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Add / Search Friends Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => {
          setShowAddFriendModal(false);
          setFriendsList(storageService.getFriends());
        }}
        activeSubject={activeSubject}
        onFriendAdded={() => {
          setFriendsList(storageService.getFriends());
        }}
      />

      {/* Render Sticky Bottom Navigation Footer */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
