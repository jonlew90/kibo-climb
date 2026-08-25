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
  ArrowLeft,
  Shield,
  Gift,
  UserPlus,
  ChevronRight,
  Star,
  Check,
  Scroll
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { questService } from '../services/questService';
import { COMPANION_BUDDIES } from '../data/questsData';
import { storageService } from '../services/storageService';
import ConfettiCanvas from './ConfettiCanvas';

export default function QuestsScreen({
  activeSubject = 'math',
  userState = {},
  onNavigate,
  onBack,
  renderFooter,
  onAwardSparks
}) {
  const activeProfile = storageService.getActiveProfile();
  const profileId = activeProfile?.id || 'default_child';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'daily' | 'weekly' | 'team2' | 'team3'
  const [questState, setQuestState] = useState(() => questService.getQuests(profileId));
  const [dailyCountdown, setDailyCountdown] = useState(() => questService.getTimeUntilDailyReset());
  const [weeklyCountdown, setWeeklyCountdown] = useState(() => questService.getTimeUntilWeeklyReset());
  const [celebrationReward, setCelebrationReward] = useState(null);
  const [showTeammatePicker, setShowTeammatePicker] = useState(null); // { questId, teamType, slotIndex }
  const [friendsList] = useState(() => storageService.getFriends());

  // Update countdown timers periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyCountdown(questService.getTimeUntilDailyReset());
      setWeeklyCountdown(questService.getTimeUntilWeeklyReset());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = (quest) => {
    if (!quest.completed || quest.claimed) return;
    soundFx.playVictory();
    const result = questService.claimReward(profileId, quest.id);
    if (result.success) {
      setQuestState(questService.getQuests(profileId));
      setCelebrationReward(result.reward);
      if (onAwardSparks && result.reward.sparks) {
        onAwardSparks(result.reward.sparks);
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

    if (activeTab === 'daily') return daily;
    if (activeTab === 'weekly') return weekly;
    if (activeTab === 'team2') return team2;
    if (activeTab === 'team3') return team3;
    return [...daily, ...weekly, ...team2, ...team3];
  };

  const unclaimedCount = questService.getUnclaimedCount(profileId);
  const filteredQuests = getFilteredQuests();

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
          {unclaimedCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-black animate-bounce shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{unclaimedCount} Ready to Claim!</span>
            </div>
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
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Expedition Headquarters</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                Mountain Quests
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-md">
                Complete daily objectives, weekly milestones, and team ascents to earn Sparks, altitude, and shields!
              </p>
            </div>

            {/* Timers Panel */}
            <div className="flex flex-row sm:flex-col gap-2 bg-black/20 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[10px] text-purple-200 block leading-tight">Daily Reset</span>
                  <span className="font-black text-white">{dailyCountdown}</span>
                </div>
              </div>
              <div className="h-full w-px bg-white/10 sm:w-full sm:h-px my-0.5" />
              <div className="flex items-center gap-2 text-xs">
                <Mountain className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <div>
                  <span className="text-[10px] text-purple-200 block leading-tight">Weekly Reset</span>
                  <span className="font-black text-white">{weeklyCountdown}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {[
            { id: 'all', label: 'All Quests', icon: Star },
            { id: 'daily', label: 'Daily Expeditions', icon: Zap, count: questState?.daily?.length },
            { id: 'weekly', label: 'Weekly Ascents', icon: Mountain, count: questState?.weekly?.length },
            { id: 'team2', label: '2-Person Tandem', icon: Users, count: questState?.team2?.length },
            { id: 'team3', label: '3-Person Squad', icon: Compass, count: questState?.team3?.length }
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-purple-200 scale-102'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

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
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            quest.type === 'daily'
                              ? 'bg-sky-100 text-sky-800'
                              : quest.type === 'weekly'
                              ? 'bg-purple-100 text-purple-800'
                              : quest.type === 'team2'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {quest.type === 'daily'
                            ? 'Daily Quest'
                            : quest.type === 'weekly'
                            ? 'Weekly Ascent'
                            : quest.type === 'team2'
                            ? '2-Person Tandem'
                            : '3-Person Squad'}
                        </span>

                        {quest.subject && quest.subject !== 'any' && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {quest.subject}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {quest.description}
                      </p>

                      {/* Team Co-op Breakdown for 2-Person & 3-Person */}
                      {isTeam2 && (
                        <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">🧗</span>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">You</span>
                                <span className="font-black text-slate-800">{quest.userProgress || 0}</span>
                              </div>
                            </div>

                            <span className="text-slate-300 font-bold">+</span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{quest.partner?.avatar || '🦁'}</span>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block truncate max-w-[80px]">
                                  {quest.partner?.name || 'Asha'}
                                </span>
                                <span className="font-black text-slate-800">{quest.partnerProgress || 0}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playKeyTap();
                              setShowTeammatePicker({ questId: quest.id, teamType: 'team2', slotIndex: 0 });
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Partner</span>
                          </button>
                        </div>
                      )}

                      {isTeam3 && (
                        <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5 text-xs flex-wrap">
                            <div className="flex items-center gap-1">
                              <span className="text-base">🧗</span>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">You</span>
                                <span className="font-black text-slate-800">{quest.userProgress || 0}</span>
                              </div>
                            </div>

                            <span className="text-slate-300 font-bold">+</span>

                            <div className="flex items-center gap-1">
                              <span className="text-base">{quest.partners?.[0]?.avatar || '🦁'}</span>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block truncate max-w-[65px]">
                                  {quest.partners?.[0]?.name || 'Asha'}
                                </span>
                                <span className="font-black text-slate-800">{quest.partnerProgresses?.[0] || 0}</span>
                              </div>
                            </div>

                            <span className="text-slate-300 font-bold">+</span>

                            <div className="flex items-center gap-1">
                              <span className="text-base">{quest.partners?.[1]?.avatar || '🦅'}</span>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block truncate max-w-[65px]">
                                  {quest.partners?.[1]?.name || 'Leo'}
                                </span>
                                <span className="font-black text-slate-800">{quest.partnerProgresses?.[1] || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playKeyTap();
                                setShowTeammatePicker({ questId: quest.id, teamType: 'team3', slotIndex: 0 });
                              }}
                              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              P1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playKeyTap();
                                setShowTeammatePicker({ questId: quest.id, teamType: 'team3', slotIndex: 1 });
                              }}
                              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              P2
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>Progress</span>
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
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Rewards & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {quest.reward?.sparks && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>+{quest.reward.sparks}</span>
                        </div>
                      )}

                      {quest.reward?.altitude && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs shadow-2xs">
                          <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+{quest.reward.altitude}m</span>
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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-2 border-slate-200 cursor-default"
          >
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Choose Teammate
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Team up with mountain companions or your friends to climb faster together!
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Mountain Companions
              </span>
              {COMPANION_BUDDIES.map((buddy) => (
                <button
                  key={buddy.id}
                  type="button"
                  onClick={() => handleSelectTeammate(buddy)}
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{buddy.avatar}</span>
                    <div>
                      <span className="font-black text-sm text-slate-800 block group-hover:text-indigo-950">
                        {buddy.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">
                        {buddy.title}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
              ))}

              {friendsList && friendsList.length > 0 && (
                <>
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mt-2">
                    Your Friends
                  </span>
                  {friendsList.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => handleSelectTeammate({
                        id: friend.id,
                        name: friend.username || friend.name || 'Friend',
                        avatar: '🧗',
                        title: 'Climbing Friend'
                      })}
                      className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧗</span>
                        <div>
                          <span className="font-black text-sm text-slate-800 block group-hover:text-purple-950">
                            {friend.username || friend.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            Friend
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                    </button>
                  ))}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTeammatePicker(null)}
              className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
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
              🎁
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Quest Complete!
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Awesome climbing! Your rewards have been added to your inventory.
            </p>

            <div className="flex items-center justify-center gap-2 mb-5">
              {celebrationReward.sparks && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center gap-1 border border-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>+{celebrationReward.sparks} Sparks</span>
                </div>
              )}
              {celebrationReward.altitude && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center gap-1 border border-emerald-300">
                  <Mountain className="w-4 h-4 text-emerald-600" />
                  <span>+{celebrationReward.altitude}m</span>
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

      {/* Render Sticky Bottom Navigation Footer */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
