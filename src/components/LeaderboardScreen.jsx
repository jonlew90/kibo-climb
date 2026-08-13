import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Crown, Medal, User, Info, Activity, Zap } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';
import { leaderboardService } from '../services/leaderboardService';

const MOCK_LEADERBOARD_DATA = [
  { rank: 1, name: "Alex P.", score: 1450, subjectsMastered: 8, equipped: ['golden_skin', 'crown', 'royal_cape'] },
  { rank: 2, name: "Jordan M.", score: 1380, subjectsMastered: 7, equipped: ['emerald_jade_skin', 'goggles', 'vest'] },
  { rank: 3, name: "Sam K.", score: 1320, subjectsMastered: 7, equipped: ['snow_white_skin', 'wizard_hat', 'summit_scarf'] },
  { rank: 4, name: "Taylor R.", score: 1250, subjectsMastered: 6, equipped: ['midnight_shadow_skin', 'explorer_hat', 'backpack'] },
  { rank: 5, name: "Casey B.", score: 1210, subjectsMastered: 6, equipped: ['headphones_neon', 'vest'] },
  { rank: 6, name: "Riley D.", score: 1180, subjectsMastered: 5, equipped: ['cap', 'canteen', 'bowtie'] },
  { rank: 7, name: "Jamie L.", score: 1150, subjectsMastered: 5, equipped: ['bandana', 'summit_scarf'] },
  { rank: 8, name: "Morgan W.", score: 1120, subjectsMastered: 4, equipped: ['goggles', 'canteen'] },
  { rank: 9, name: "Quinn C.", score: 1090, subjectsMastered: 4, equipped: ['cap', 'bowtie'] },
  { rank: 10, name: "Avery H.", score: 1060, subjectsMastered: 3, equipped: ['bandana'] }
];

export default function LeaderboardScreen({ userState, renderFooter, equippedItems = [] }) {
  const [liveStandings, setLiveStandings] = useState([]);

  const activeProfile = storageService.getActiveProfile();
  const username = storageService.getUsername() || activeProfile?.username || activeProfile?.name || 'You';
  const userScore = userState?.competenceRank || activeProfile?.userData?.adaptiveCompetenceRating || activeProfile?.userData?.competenceRank || 1000;
  const userEquippedItems = (equippedItems && equippedItems.length > 0)
    ? equippedItems
    : (activeProfile?.shopState?.equippedItems || []);
  const userSubjectsMastered = (
    activeProfile?.userData?.subjectsMastered
    ?? Object.keys(activeProfile?.userData?.masteredTricks || {}).length
    ?? Math.min(10, Math.max(1, Math.floor((userState?.totalProblemsSolved || 0) / 10)))
  ) || 5;

  const allAccountProfiles = storageService.getAllProfiles();
  const accountPlayers = allAccountProfiles.map(p => {
    const isCurrent = p.id === activeProfile?.id;
    const pName = isCurrent ? username : (p.username || p.name || 'Climber');
    const pScore = isCurrent 
      ? userScore 
      : (p.userData?.adaptiveCompetenceRating || p.userData?.competenceRank || 1000);
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
      score: pScore,
      subjectsMastered: pSubjects,
      equipped: pEquipped
    };
  });

  // Subscribe to Firestore real-time updates and sync all account profiles
  useEffect(() => {
    accountPlayers.forEach(p => {
      leaderboardService.syncUserScore({
        profileId: p.id,
        name: p.name,
        score: p.score,
        subjectsMastered: p.subjectsMastered,
        equipped: p.equipped
      });
    });

    const unsubscribe = leaderboardService.subscribeToLeaderboard(20, (remoteData) => {
      if (remoteData && remoteData.length > 0) {
        setLiveStandings(remoteData);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userScore, username, activeProfile?.id]);

  const accountNames = new Set(accountPlayers.map(p => p.name));
  const accountIds = new Set(accountPlayers.map(p => p.id));

  // Combine live/mock data with all account profiles and sort descending by score
  const baseStandings = liveStandings.length > 0 ? liveStandings : MOCK_LEADERBOARD_DATA;
  const filteredRemote = baseStandings.filter(p => 
    !accountNames.has(p.name) && 
    !accountIds.has(p.profileId) && 
    !accountIds.has(p.id)
  );

  const combinedStandings = [...filteredRemote, ...accountPlayers]
    .sort((a, b) => b.score - a.score);

  // Assign ranks
  const rankedStandings = combinedStandings.map((player, index) => ({
    ...player,
    rank: index + 1
  }));

  const userRankObj = rankedStandings.find(p => p.isCurrentUser);
  const currentUserRank = userRankObj ? userRankObj.rank : rankedStandings.length;

  let pointsNeeded = 0;
  if (currentUserRank > 1) {
    const playerAbove = rankedStandings[currentUserRank - 2];
    pointsNeeded = playerAbove ? Math.max(1, playerAbove.score - userScore + 1) : 1;
  }

  // Top standings display
  const top3 = rankedStandings.slice(0, 3);
  const others = rankedStandings.slice(3, 20);

  // Helper to get title based on score
  const getRankTitle = (score) => {
    return getCompetenceRankTier(score);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 via-stone-50 to-slate-100 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">

      {/* HEADER & CONTROLS */}
      <div className="bg-white border-b-2 border-slate-200 z-10 shrink-0 shadow-sm relative pb-2">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Trophy className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
            <h2 className="text-lg font-black tracking-tight">Global Standings</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            <Activity className="w-3.5 h-3.5" />
            Competence Score
          </div>
        </div>

        {/* Fairness Banner */}
        <div className="mx-4 mt-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl px-3 py-2 text-[10px] font-semibold flex items-start gap-2 shadow-inner">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-tight">
            Competence is dynamically measured based on mastery accuracy and speed across active subjects. Standings update daily.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-6">

        {/* HERO PODIUM (Top 3) */}
        {top3.length >= 3 && (
          <div className="pt-8 pb-10 px-4 flex justify-center items-end gap-2 sm:gap-6 relative">

            {/* 2nd Place */}
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[120px] sm:max-w-[150px] mb-4 relative z-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[1].isCurrentUser ? 'bg-indigo-100 border-indigo-500 ring-4 ring-indigo-400/40' : 'bg-slate-200 border-slate-300'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.6]">
                  <Mascot size={48} mood={top3[1].isCurrentUser ? "excited" : "happy"} equipped={top3[1].equipped} />
                </div>
              </div>
              <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[1].name}>
                <span className="font-bold text-xs truncate min-w-0 text-center">
                  {top3[1].name}
                </span>
                {top3[1].isCurrentUser && (
                  <span className="bg-indigo-600 text-white text-[8px] px-1 py-0.2 rounded-full font-black shrink-0">YOU</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mb-2">{top3[1].score} pts</span>
              <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 border-x border-t border-slate-400 rounded-t-lg h-24 flex justify-center pt-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-xl font-black text-slate-500 drop-shadow-sm">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[140px] sm:max-w-[170px] relative z-20 animate-fade-in-up">
              <div className="absolute -top-6 text-amber-500 z-30 animate-bounce">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 shadow-xl flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[0].isCurrentUser ? 'bg-amber-100 border-amber-400 ring-4 ring-indigo-500/60' : 'bg-amber-100 border-amber-400'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.6]">
                  <Mascot size={64} mood="excited" equipped={top3[0].equipped} />
                </div>
              </div>
              <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[0].name}>
                <span className="font-black text-sm text-amber-900 truncate min-w-0 text-center">
                  {top3[0].name}
                </span>
                {top3[0].isCurrentUser && (
                  <span className="bg-indigo-600 text-white text-[8px] px-1 py-0.2 rounded-full font-black shrink-0">YOU</span>
                )}
              </div>
              <span className="text-xs text-amber-700 font-bold mb-2 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5 border border-amber-200">{top3[0].score} pts</span>
              <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 border-x border-t border-amber-500 rounded-t-lg h-32 flex justify-center pt-3 shadow-[0_-10px_20px_rgba(251,191,36,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                <span className="text-3xl font-black text-amber-700 drop-shadow-md">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[120px] sm:max-w-[150px] mb-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[2].isCurrentUser ? 'bg-orange-100 border-orange-400 ring-4 ring-indigo-400/40' : 'bg-orange-100 border-orange-300'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.6]">
                  <Mascot size={48} mood={top3[2].isCurrentUser ? "excited" : "happy"} equipped={top3[2].equipped} />
                </div>
              </div>
              <div className="w-full flex items-center justify-center gap-1 px-0.5" title={top3[2].name}>
                <span className="font-bold text-xs truncate min-w-0 text-center">
                  {top3[2].name}
                </span>
                {top3[2].isCurrentUser && (
                  <span className="bg-indigo-600 text-white text-[8px] px-1 py-0.2 rounded-full font-black shrink-0">YOU</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mb-2">{top3[2].score} pts</span>
              <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 border-x border-t border-orange-400 rounded-t-lg h-16 flex justify-center pt-1.5 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-lg font-black text-orange-700 drop-shadow-sm">3</span>
              </div>
            </div>
          </div>
        )}

        {/* SCROLLABLE LIST (Ranks 4+) */}
        <div className="px-4 space-y-2 pb-6">
          {others.map((player) => (
            <div
              key={player.isCurrentUser ? 'current-user-row' : `${player.id || player.name}-${player.rank}`}
              className={`rounded-2xl p-3 flex items-center gap-3 transition-all ${
                player.isCurrentUser
                  ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Rank Number */}
              <div className={`w-6 text-center font-black shrink-0 ${player.isCurrentUser ? 'text-indigo-700' : 'text-slate-400'}`}>
                {player.rank}
              </div>

              {/* Avatar Placeholder */}
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 overflow-hidden relative ${
                player.isCurrentUser ? 'bg-indigo-100 border-indigo-300' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.7]">
                  <Mascot size={32} mood={player.isCurrentUser ? "happy" : "neutral"} equipped={player.equipped} />
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-800 truncate">{player.name}</span>
                  {player.isCurrentUser && (
                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-400" />
                  {player.subjectsMastered} Subjects Qualified
                </span>
              </div>

              {/* Score / Rank Badge */}
              <div className="flex flex-col items-end shrink-0">
                <span className="font-black text-indigo-700 text-sm">{player.score}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  {getRankTitle(player.score)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PINNED CURRENT USER CARD */}
      <div className="shrink-0 px-3 py-2 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent pt-3 z-30 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-indigo-900 border-2 border-indigo-500 rounded-2xl p-3 flex items-center gap-3 shadow-[0_10px_25px_rgba(67,56,202,0.3)] relative overflow-hidden">
            {/* Subtle glow effect inside */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />

            {/* User Rank */}
            <div className="w-8 h-8 rounded-full bg-indigo-800/80 border border-indigo-400 flex items-center justify-center font-black text-white shrink-0 shadow-inner z-10">
              {currentUserRank > MOCK_LEADERBOARD_DATA.length ? '-' : currentUserRank}
            </div>

            {/* User Avatar (Actual Mascot + Items) */}
            <div className="w-12 h-12 bg-white rounded-full border-2 border-indigo-300 flex items-center justify-center shrink-0 overflow-hidden z-10 relative">
               <div className="absolute inset-0 flex items-center justify-center scale-[0.7]">
                 <Mascot size={40} mood="happy" equipped={equippedItems} />
               </div>
            </div>

            {/* User Info & Progress */}
            <div className="flex-1 min-w-0 flex flex-col z-10">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-sm truncate">You ({username})</span>
                <span className="bg-indigo-500 text-indigo-50 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">
                  {getRankTitle(userScore)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-indigo-200 font-bold text-xs">{userScore} pts</span>
              </div>

              {/* Contextual progress message */}
              <p className="text-[10px] text-indigo-300 mt-1 leading-tight font-medium">
                {currentUserRank > 1
                  ? `+${pointsNeeded} pts needed to rank up`
                  : "You are currently holding 1st place! Keep it up!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}

    </div>
  );
}
