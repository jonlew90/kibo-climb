import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, FlaskConical, ScrollText, Check, ChevronRight, Crown } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import ConfettiCanvas from './ConfettiCanvas';

export default function DailyBonusRewardModal({
  isOpen,
  onClose,
  activeProfileId,
  isKiboClub = false,
  onRewardClaimed
}) {
  const [phase, setPhase] = useState('closed'); // 'closed' | 'opening' | 'revealed'
  const [rewardData, setRewardData] = useState(null);

  const hasClub = isKiboClub || storageService.hasClubMembership(activeProfileId);

  useEffect(() => {
    if (isOpen) {
      setPhase('closed');
      setRewardData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    soundFx.playKeyTap();
    setPhase('opening');

    setTimeout(() => {
      const claimResult = storageService.claimDailyVault(activeProfileId, hasClub);
      setRewardData(claimResult);
      setPhase('revealed');
      soundFx.playVictory();
      soundFx.playSparkCollect();

      if (onRewardClaimed) {
        onRewardClaimed(claimResult);
      }
    }, 650);
  };

  const handleFinish = () => {
    soundFx.playKeyTap();
    onClose();
  };

  return (
    <div
      onClick={phase === 'revealed' ? handleFinish : undefined}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in cursor-default overflow-hidden select-none"
    >
      {/* Cinematic Rotating Golden Sunburst Rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-orange-500/10 blur-3xl animate-pulse" />
        <div
          className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] opacity-25 animate-spin-slow pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(251,191,36,0.5) 0deg 20deg, transparent 20deg 40deg, rgba(251,191,36,0.5) 40deg 60deg, transparent 60deg 80deg, rgba(251,191,36,0.5) 80deg 100deg, transparent 100deg 120deg, rgba(251,191,36,0.5) 120deg 140deg, transparent 140deg 160deg, rgba(251,191,36,0.5) 160deg 180deg, transparent 180deg 200deg, rgba(251,191,36,0.5) 200deg 220deg, transparent 220deg 240deg, rgba(251,191,36,0.5) 240deg 260deg, transparent 260deg 280deg, rgba(251,191,36,0.5) 280deg 300deg, transparent 300deg 320deg, rgba(251,191,36,0.5) 320deg 340deg, transparent 340deg 360deg)'
          }}
        />
      </div>

      {phase === 'revealed' && <ConfettiCanvas />}

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-3 border-amber-400/80 rounded-3xl p-5 sm:p-6 text-center shadow-2xl space-y-4 relative z-10 animate-pop text-white"
      >
        {/* Header Tag */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
            Daily Spark Vault
          </span>
          {hasClub && (
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs border border-purple-400 flex items-center gap-1">
              <Crown className="w-3 h-3 fill-amber-300 text-amber-300" />
              VIP Member
            </span>
          )}
        </div>

        {/* Phase 1: Closed Chest State */}
        {phase === 'closed' && (
          <div className="space-y-4 py-2">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center group cursor-pointer" onClick={handleOpenChest}>
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-ping opacity-75" />
              <div className="w-28 h-28 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl border-4 border-amber-200 shadow-2xl flex flex-col items-center justify-center relative transform hover:scale-105 active:scale-95 transition-all">
                <span className="text-5xl drop-shadow-md animate-bounce">🎁</span>
                <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest mt-1 bg-amber-200/90 px-2 py-0.2 rounded-md">
                  Locked
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Your Daily Vault is Ready!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xs mx-auto">
                {hasClub
                  ? 'Unlock today\'s VIP chest packed with 3.3x bonus Sparks, shields, and potions!'
                  : 'Tap below to claim your daily Sparks and power-up rewards!'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenChest}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-b-4 border-orange-600 active:border-b-0"
            >
              <span>Unlock Vault</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}

        {/* Phase 2: Opening Animation */}
        {phase === 'opening' && (
          <div className="py-8 space-y-3">
            <div className="w-28 h-28 mx-auto flex items-center justify-center animate-spin">
              <span className="text-6xl">✨</span>
            </div>
            <p className="text-sm font-black text-amber-300 tracking-wide animate-pulse">
              Unlocking your rewards...
            </p>
          </div>
        )}

        {/* Phase 3: Revealed Loot Grid */}
        {phase === 'revealed' && rewardData && (
          <div className="space-y-4 animate-fade-in pt-1">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-amber-300 tracking-tight flex items-center justify-center gap-1.5">
                <span>Vault Unlocked!</span>
                <span>🎉</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Here are your daily rewards for climbing today:
              </p>
            </div>

            {/* Staggered Loot Cards */}
            <div className="grid grid-cols-2 gap-2.5 text-left">
              {/* Sparks Card */}
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                  <Zap className="w-6 h-6 fill-amber-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-black text-amber-300 block leading-tight">
                    +{rewardData.sparks} Sparks
                  </span>
                  <span className="text-[10px] text-amber-200 font-bold block">
                    {hasClub ? '3.3x VIP Boost' : 'Daily Grant'}
                  </span>
                </div>
              </div>

              {/* Potion Card */}
              {rewardData.potions > 0 && (
                <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 border-2 border-purple-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-purple-400 text-purple-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                    <FlaskConical className="w-6 h-6 fill-purple-950" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-purple-300 block leading-tight">
                      +{rewardData.potions} 2x Potion{rewardData.potions > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-purple-200 font-bold block">Double Sparks</span>
                  </div>
                </div>
              )}

              {/* Streak Shields Card (if granted) */}
              {rewardData.shields > 0 && (
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-2 border-blue-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '150ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-blue-400 text-blue-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                    <Shield className="w-6 h-6 fill-blue-950" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-blue-300 block leading-tight">
                      +{rewardData.shields} Shield{rewardData.shields > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-blue-200 font-bold block">Streak Protection</span>
                  </div>
                </div>
              )}

              {/* Hint Scrolls */}
              {rewardData.scrolls > 0 && (
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '200ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                    <ScrollText className="w-6 h-6 text-emerald-950" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-emerald-300 block leading-tight">
                      +{rewardData.scrolls} Hint Scroll{rewardData.scrolls > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-emerald-200 font-bold block">Climb Assistance</span>
                  </div>
                </div>
              )}

              {/* Climber Spyglass */}
              {rewardData.spyglasses > 0 && (
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-2 border-cyan-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '250ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-cyan-400 text-cyan-950 flex items-center justify-center font-black shrink-0 text-xl shadow-sm">
                    🔍
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-cyan-300 block leading-tight">
                      +{rewardData.spyglasses} Spyglass{rewardData.spyglasses > 1 ? 'es' : ''}
                    </span>
                    <span className="text-[10px] text-cyan-200 font-bold block">Letter / Digit Reveal</span>
                  </div>
                </div>
              )}

              {/* Climber Pruner */}
              {rewardData.pruners > 0 && (
                <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/10 border-2 border-rose-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '300ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-rose-400 text-rose-950 flex items-center justify-center font-black shrink-0 text-xl shadow-sm">
                    ✂️
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-rose-300 block leading-tight">
                      +{rewardData.pruners} Pruner{rewardData.pruners > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-rose-200 font-bold block">Eliminate Choices</span>
                  </div>
                </div>
              )}

              {/* Explorer Compass */}
              {rewardData.compasses > 0 && (
                <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border-2 border-teal-400 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md animate-scale-in" style={{ animationDelay: '350ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-teal-400 text-teal-950 flex items-center justify-center font-black shrink-0 text-xl shadow-sm">
                    🧭
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black text-teal-300 block leading-tight">
                      +{rewardData.compasses} Compass{rewardData.compasses > 1 ? 'es' : ''}
                    </span>
                    <span className="text-[10px] text-teal-200 font-bold block">World Navigation</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:border-b-0"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Collect & Climb!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
