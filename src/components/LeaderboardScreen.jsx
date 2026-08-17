import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Crown, Medal, User, Info, Activity, Zap, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { getCompetenceRankTier } from '../utils/GameEconomyModel';
import { storageService } from '../services/storageService';
import { leaderboardService } from '../services/leaderboardService';
import { SUBJECTS_CONFIG } from '../config/subjects';

const MOCK_COMPETITORS_BY_SUBJECT = {
  math: [
    { id: 'mock_math_1', name: 'Maya Matrix', score: 1680, subjectsMastered: 8, equipped: ['crown', 'cape'] },
    { id: 'mock_math_2', name: 'Leo Apex', score: 1490, subjectsMastered: 6, equipped: ['party_hat', 'scarf'] },
    { id: 'mock_math_3', name: 'Sam Numerator', score: 1380, subjectsMastered: 5, equipped: ['cap', 'boots'] },
    { id: 'mock_math_4', name: 'Zoe Cipher', score: 1260, subjectsMastered: 4, equipped: ['headband'] },
    { id: 'mock_math_5', name: 'Lucas Vector', score: 1180, subjectsMastered: 3, equipped: ['astronaut_helmet'] },
    { id: 'mock_math_6', name: 'Elena Prime', score: 1110, subjectsMastered: 2, equipped: [] },
    { id: 'mock_math_7', name: 'Oliver Tangent', score: 1040, subjectsMastered: 2, equipped: [] }
  ],
  words: [
    { id: 'mock_words_1', name: 'Emma Lexicon', score: 1620, subjectsMastered: 7, equipped: ['crown', 'cape'] },
    { id: 'mock_words_2', name: 'Liam Speller', score: 1470, subjectsMastered: 6, equipped: ['party_hat', 'scarf'] },
    { id: 'mock_words_3', name: 'Sophia Bard', score: 1350, subjectsMastered: 5, equipped: ['cap', 'boots'] },
    { id: 'mock_words_4', name: 'Noah Syntax', score: 1250, subjectsMastered: 4, equipped: ['headband'] },
    { id: 'mock_words_5', name: 'Ava Rhyme', score: 1170, subjectsMastered: 3, equipped: ['astronaut_helmet'] },
    { id: 'mock_words_6', name: 'Ethan Vocab', score: 1100, subjectsMastered: 2, equipped: [] },
    { id: 'mock_words_7', name: 'Chloe Prose', score: 1030, subjectsMastered: 1, equipped: [] }
  ]
};

export default function LeaderboardScreen({
  activeSubject = 'math',
  userState,
  renderFooter,
  equippedItems = []
}) {
  const [selectedSubject, setSelectedSubject] = useState(activeSubject || 'math');
  const [liveStandings, setLiveStandings] = useState([]);

  // Sync selected subject if active subject prop changes
  useEffect(() => {
    if (activeSubject) {
      setSelectedSubject(activeSubject);
    }
  }, [activeSubject]);

  const activeProfile = storageService.getActiveProfile();
  const username = storageService.getUsername() || activeProfile?.username || activeProfile?.name || 'You';

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

    return {
      id: p.id,
      profileId: p.id,
      isCurrentUser: isCurrent,
      isAccountProfile: true,
      name: pName,
      score: pScore,
      subjectsMastered: pSubjects,
      equipped: pEquipped,
      subject: selectedSubject
    };
  });

  // Subscribe to Firestore real-time updates and sync all account profiles for selected subject
  useEffect(() => {
    accountPlayers.forEach(p => {
      leaderboardService.syncUserScore({
        profileId: p.id,
        subject: selectedSubject,
        name: p.name,
        score: p.score,
        subjectsMastered: p.subjectsMastered,
        equipped: p.equipped
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

  const accountNames = new Set(accountPlayers.map(p => p.name));
  const accountIds = new Set(accountPlayers.map(p => p.id));

  // Combine live data with all account profiles and fallback mock competitors
  const baseStandings = liveStandings;
  const filteredRemote = baseStandings.filter(p => 
    !accountNames.has(p.name) && 
    !accountIds.has(p.profileId) && 
    !accountIds.has(p.id)
  );

  let mergedList = [...filteredRemote, ...accountPlayers];

  // If we have fewer than 3 players, supplement with mock competitors for a lively top 3 experience
  if (mergedList.length < 3) {
    const mockList = MOCK_COMPETITORS_BY_SUBJECT[selectedSubject] || MOCK_COMPETITORS_BY_SUBJECT.math;
    const existingNames = new Set(mergedList.map(p => p.name));
    for (const mock of mockList) {
      if (!existingNames.has(mock.name)) {
        mergedList.push({
          id: mock.id,
          name: mock.name,
          score: mock.score,
          subjectsMastered: mock.subjectsMastered,
          equipped: mock.equipped,
          isCurrentUser: false,
          isAccountProfile: false
        });
        if (mergedList.length >= 7) break;
      }
    }
  }

  const combinedStandings = mergedList.sort((a, b) => b.score - a.score);

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

  // Helper to get title based on score & selected subject
  const getRankTitle = (score) => {
    return getCompetenceRankTier(score, selectedSubject);
  };

  const subjectConfig = SUBJECTS_CONFIG[selectedSubject] || SUBJECTS_CONFIG.math;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 via-stone-50 to-slate-100 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">

      {/* HEADER & CONTROLS */}
      <div className="bg-white border-b-2 border-slate-200 z-10 shrink-0 shadow-sm relative pb-3">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Trophy className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
            <h2 className="text-lg font-black tracking-tight">Global Standings</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>{subjectConfig.name} Competence</span>
          </div>
        </div>

        {/* SUBJECT SELECTION TABS */}
        <div className="px-4 pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setSelectedSubject('math');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 ${
              selectedSubject === 'math'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-[1.02]'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70 hover:text-slate-800'
            }`}
          >
            <span>🔢</span>
            <span>Kibo Math</span>
            {selectedSubject === 'math' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setSelectedSubject('words');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 ${
              selectedSubject === 'words'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm scale-[1.02]'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70 hover:text-slate-800'
            }`}
          >
            <span>📚</span>
            <span>Kibo Words</span>
            {selectedSubject === 'words' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Fairness Banner */}
        <div className="mx-4 mt-2.5 bg-indigo-50/90 border border-indigo-200 text-indigo-900 rounded-xl px-3 py-2 text-[10px] font-semibold flex items-center gap-2 shadow-inner">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="leading-tight">
            {selectedSubject === 'words'
              ? 'Words competence is dynamically measured based on spelling accuracy, vocabulary fluency, and speed.'
              : 'Math competence is dynamically measured based on problem accuracy, mental math fluency, and speed.'}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-6">

        {/* HERO PODIUM (Top 3) */}
        {top3.length >= 3 && (
          <div className="pt-8 pb-10 px-4 flex justify-center items-end gap-2 sm:gap-6 relative">

            {/* 2nd Place */}
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[125px] sm:max-w-[155px] mb-4 relative z-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[1].isCurrentUser ? 'bg-indigo-100 border-indigo-500 ring-4 ring-indigo-400/40' : 'bg-slate-200 border-slate-300'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.85] sm:scale-95">
                  <Mascot size={56} mood={top3[1].isCurrentUser ? "excited" : "happy"} equipped={top3[1].equipped} className="w-full h-full" />
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
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[145px] sm:max-w-[175px] relative z-20 animate-fade-in-up">
              <div className="absolute -top-6 text-amber-500 z-30 animate-bounce">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 shadow-xl flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[0].isCurrentUser ? 'bg-amber-100 border-amber-400 ring-4 ring-indigo-500/60' : 'bg-amber-100 border-amber-400'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.88] sm:scale-95">
                  <Mascot size={72} mood="excited" equipped={top3[0].equipped} className="w-full h-full" />
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
            <div className="flex flex-col items-center flex-1 min-w-0 max-w-[125px] sm:max-w-[155px] mb-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 shadow-inner flex items-center justify-center mb-2 overflow-hidden relative shrink-0 ${
                top3[2].isCurrentUser ? 'bg-orange-100 border-orange-400 ring-4 ring-indigo-400/40' : 'bg-orange-100 border-orange-300'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-[0.85] sm:scale-95">
                  <Mascot size={56} mood={top3[2].isCurrentUser ? "excited" : "happy"} equipped={top3[2].equipped} className="w-full h-full" />
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

              {/* Avatar Mascot */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center shrink-0 overflow-hidden relative ${
                player.isCurrentUser ? 'bg-indigo-100 border-indigo-300 ring-2 ring-indigo-400/30' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                  <Mascot size={44} mood={player.isCurrentUser ? "happy" : "neutral"} equipped={player.equipped} className="w-full h-full" />
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
                  {player.subjectsMastered} Skills Mastered
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
              #{currentUserRank}
            </div>

            {/* User Avatar (Actual Mascot + Items) */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-full border-2 border-indigo-300 flex items-center justify-center shrink-0 overflow-hidden z-10 relative">
               <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                 <Mascot size={48} mood="happy" equipped={equippedItems} className="w-full h-full" />
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
                <span className="text-indigo-200 font-bold text-xs">{userScore} pts ({subjectConfig.name})</span>
              </div>

              {/* Contextual progress message */}
              <p className="text-[10px] text-indigo-300 mt-1 leading-tight font-medium">
                {currentUserRank > 1
                  ? `+${pointsNeeded} pts needed to rank up in ${subjectConfig.name}`
                  : `You are currently holding 1st place in ${subjectConfig.name}! Keep it up!`}
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
