import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';

export default function Mascot({ mood = 'happy', state = 'idle', equipped = [], className = "w-36 h-36" }) {
  // Equipped item checks
  const isEquipped = (itemId) => equipped.includes(itemId);

  // Background Themes
  const hasAlpineBg = isEquipped('bg_alpine');
  const hasSunsetBg = isEquipped('bg_sunset');
  const hasAuroraBg = isEquipped('bg_aurora');
  const hasVolcanoBg = isEquipped('bg_volcano');
  const hasCosmicBg = isEquipped('bg_cosmic');
  const hasCrystalCaveBg = isEquipped('bg_crystal_cave');
  const hasGoldenPalaceBg = isEquipped('bg_golden_palace');

  // Auras & FX
  const hasSparkleDust = isEquipped('sparkle_dust');
  const hasStarlightAura = isEquipped('starlight_aura');
  const hasPhoenixPet = isEquipped('phoenix_pet');
  const hasFrostDragon = isEquipped('frost_dragon');
  const hasGoldenSkin = isEquipped('golden_skin');

  // Headwear
  const hasCap = isEquipped('cap');
  const hasBandana = isEquipped('bandana');
  const hasPartyHat = isEquipped('party_hat');
  const hasGoggles = isEquipped('goggles');
  const hasWizardHat = isEquipped('wizard_hat');
  const hasExplorerHat = isEquipped('explorer_hat');
  const hasCrown = isEquipped('crown');

  // Body & Gear Accessories
  const hasBowtie = isEquipped('bowtie');
  const hasNeonHeadphones = isEquipped('headphones_neon') || isEquipped('headphones');
  const hasJetpack = isEquipped('jetpack');
  const hasBackpack = isEquipped('backpack');
  const hasCanteen = isEquipped('canteen');
  const hasLantern = isEquipped('lantern');
  const hasGoldenCompass = isEquipped('golden_compass');
  const hasVest = isEquipped('vest');
  const hasSummitScarf = isEquipped('summit_scarf');
  const hasRoyalCape = isEquipped('royal_cape');

  // --- LIVING MASCOT ANIMATION STATES ---
  const [isBlinking, setIsBlinking] = useState(false);
  const [isEarTwitching, setIsEarTwitching] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [sparkParticles, setSparkParticles] = useState([]);

  // Random Idle Blinks & Ear Twitches Loop (every 4-7 seconds)
  useEffect(() => {
    let timeoutId;

    const scheduleMicroAction = () => {
      const delay = Math.floor(Math.random() * 3000) + 4000;
      timeoutId = setTimeout(() => {
        const actionType = Math.random() > 0.5 ? 'blink' : 'twitch';

        if (actionType === 'blink') {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 220);
        } else {
          setIsEarTwitching(true);
          setTimeout(() => setIsEarTwitching(false), 350);
        }

        scheduleMicroAction();
      }, delay);
    };

    scheduleMicroAction();
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle Interactive Mascot Tap Reaction
  const handleMascotTap = () => {
    soundFx.playKeyTap();
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 450);

    const newSparks = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: `${Math.floor(Math.random() * 60) + 20}%`,
      top: `${Math.floor(Math.random() * 40) + 20}%`
    }));

    setSparkParticles((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparkParticles((prev) => prev.filter((p) => !newSparks.includes(p)));
    }, 900);
  };

  const getMoodEyeTransform = () => {
    if (mood === 'sad') return 'scaleY-75 translate-y-1';
    if (mood === 'celebrate') return 'scale-110';
    return '';
  };

  return (
    <div
      onClick={handleMascotTap}
      className={`relative select-none cursor-pointer transition-transform duration-300 ${
        isTapped ? 'scale-110 rotate-3' : 'hover:scale-105'
      } ${state === 'climbing' ? 'animate-bounce-slow' : ''} ${className}`}
    >
      {/* 1. DYNAMIC BACKGROUND THEME OVERLAY */}
      {hasAlpineBg && (
        <div className="absolute inset-0 rounded-3xl bg-emerald-100/90 border-2 border-emerald-300 -z-10 shadow-inner overflow-hidden flex items-end justify-center">
          <span className="text-4xl opacity-30">⛰️</span>
        </div>
      )}
      {hasSunsetBg && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-amber-500 via-orange-400 to-rose-400 -z-10 shadow-inner opacity-90" />
      )}
      {hasAuroraBg && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-emerald-600 via-teal-700 to-slate-900 -z-10 shadow-inner opacity-90 animate-pulse" />
      )}
      {hasVolcanoBg && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-red-700 via-orange-600 to-slate-900 -z-10 shadow-inner opacity-90" />
      )}
      {hasCosmicBg && (
        <div className="absolute inset-0 rounded-3xl bg-slate-950 border border-purple-500/40 -z-10 shadow-inner opacity-95 overflow-hidden flex items-center justify-center">
          <span className="text-3xl opacity-40 animate-pulse">🪐</span>
        </div>
      )}
      {hasCrystalCaveBg && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-purple-900 via-indigo-900 to-slate-900 -z-10 shadow-inner opacity-90 border border-purple-400/40" />
      )}
      {hasGoldenPalaceBg && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-amber-300 via-yellow-200 to-amber-100 -z-10 shadow-inner opacity-95 border-2 border-amber-400" />
      )}

      {/* 2. AURAS & FX */}
      {hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 opacity-90 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasStarlightAura && !hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 opacity-70 blur-lg animate-pulse pointer-events-none scale-110" />
      )}
      {hasSparkleDust && !hasGoldenSkin && (
        <div className="absolute inset-0 pointer-events-none z-20 flex justify-between animate-bounce">
          <span className="text-xs text-yellow-300">✨</span>
          <span className="text-xs text-sky-300">✨</span>
        </div>
      )}

      {/* 3. REACTIVE FLOATING SPARK ⚡ PARTICLES */}
      {sparkParticles.map((spark) => (
        <div
          key={spark.id}
          className="absolute z-30 font-black text-amber-400 text-lg pointer-events-none animate-spark-float drop-shadow-md"
          style={{ left: spark.left, top: spark.top }}
        >
          ⚡
        </div>
      ))}

      {/* 4. BASE 3D VOLUMETRIC KIBO SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-lg overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Volumetric 3D Clay Body Gradients */}
          <radialGradient id="kibo3DBodyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFAA68" />
            <stop offset="45%" stopColor="#FF7026" />
            <stop offset="85%" stopColor="#D94100" />
            <stop offset="100%" stopColor="#9E2A00" />
          </radialGradient>

          <radialGradient id="kibo3DSnoutGrad" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF3EA" />
            <stop offset="100%" stopColor="#F5D0B6" />
          </radialGradient>

          <radialGradient id="kibo3DEarInner" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFD3BD" />
            <stop offset="70%" stopColor="#FF9B6C" />
            <stop offset="100%" stopColor="#D65B27" />
          </radialGradient>

          {/* Striped 3D Tail Gradient */}
          <linearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8A48" />
            <stop offset="50%" stopColor="#E04D00" />
            <stop offset="100%" stopColor="#872200" />
          </linearGradient>

          {/* LEGENDARY 24K GOLD METALLIC GRADIENT */}
          <linearGradient id="goldBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FCD34D" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Neon Headphones Gradient */}
          <linearGradient id="neonHeadphoneGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* 3D Clay Soft Drop Shadows */}
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#3E1500" floodOpacity="0.35" />
          </filter>

          <filter id="claySpecular" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#FFFFFF" floodOpacity="0.6" />
            <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ==================================================== */}
        {/* COMPANION PETS (Phoenix / Dragon)                    */}
        {/* ==================================================== */}
        {hasPhoenixPet && (
          <g className="animate-bounce" style={{ animationDuration: '2s' }}>
            <ellipse cx="165" cy="70" rx="14" ry="10" fill="#EF4444" stroke="#9A3412" strokeWidth="2" />
            <circle cx="160" cy="65" r="2" fill="#FFFFFF" />
            <polygon points="168,70 178,72 168,76" fill="#FBBF24" />
            <path d="M 155 75 Q 145 85 150 95" stroke="#F97316" strokeWidth="3" fill="none" />
          </g>
        )}

        {hasFrostDragon && (
          <g className="animate-pulse">
            <ellipse cx="35" cy="70" rx="14" ry="10" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
            <circle cx="40" cy="65" r="2" fill="#FFFFFF" />
            <polygon points="32,70 22,72 32,76" fill="#A7F3D0" />
            <path d="M 45 75 Q 55 85 50 95" stroke="#38BDF8" strokeWidth="3" fill="none" />
          </g>
        )}

        {/* ==================================================== */}
        {/* LAYER 1: BACKPACK & JETPACK                          */}
        {/* ==================================================== */}
        <g id="layer-back">
          {hasJetpack && (
            <g filter="url(#clayShadow)">
              <rect x="42" y="75" width="22" height="52" rx="8" fill="url(#tailGrad)" stroke="#521300" strokeWidth="3" />
              <rect x="136" y="75" width="22" height="52" rx="8" fill="url(#tailGrad)" stroke="#521300" strokeWidth="3" />
              <path d="M 46 127 L 60 127 L 53 145 Z" fill="#FF4500" className="animate-pulse" />
              <path d="M 140 127 L 154 127 L 147 145 Z" fill="#FF4500" className="animate-pulse" />
            </g>
          )}

          {hasBackpack && (
            <g filter="url(#clayShadow)">
              <rect x="45" y="80" width="110" height="70" rx="20" fill="#B45309" stroke="#78350F" strokeWidth="4" />
              <rect x="65" y="110" width="70" height="35" rx="10" fill="#D97706" stroke="#78350F" strokeWidth="3" />
            </g>
          )}
        </g>

        {/* ==================================================== */}
        {/* LAYER 2: BASE KIBO BODY & TAIL                       */}
        {/* ==================================================== */}
        <g id="layer-body">
          {/* Animated 3D Tail */}
          <path
            d="M 155 125 C 185 105, 195 145, 175 165 C 160 178, 145 155, 148 142 Z"
            fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#tailGrad)'}
            stroke={hasGoldenSkin ? '#B45309' : '#872200'}
            strokeWidth="3.5"
            filter="url(#clayShadow)"
            className="transition-transform duration-300 origin-bottom-left"
          />

          {/* Left Foot */}
          <ellipse
            cx="72"
            cy="165"
            rx="18"
            ry="12"
            fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#kibo3DBodyGrad)'}
            stroke={hasGoldenSkin ? '#B45309' : '#9E2A00'}
            strokeWidth="3"
            filter="url(#clayShadow)"
          />

          {/* Right Foot */}
          <ellipse
            cx="128"
            cy="165"
            rx="18"
            ry="12"
            fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#kibo3DBodyGrad)'}
            stroke={hasGoldenSkin ? '#B45309' : '#9E2A00'}
            strokeWidth="3"
            filter="url(#clayShadow)"
          />

          {/* Main 3D Volumetric Body Sphere */}
          <circle
            cx="100"
            cy="115"
            r="54"
            fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#kibo3DBodyGrad)'}
            stroke={hasGoldenSkin ? '#B45309' : '#8A2500'}
            strokeWidth="4"
            filter="url(#clayShadow)"
          />

          {/* Cream Tummy Patch */}
          {!hasGoldenSkin && (
            <ellipse cx="100" cy="126" rx="34" ry="26" fill="url(#kibo3DSnoutGrad)" opacity="0.95" />
          )}

          {/* Ears with Micro Twitching */}
          <g className={`transition-transform duration-200 ${isEarTwitching ? '-rotate-6 translate-y-0.5' : ''}`}>
            {/* Left Ear */}
            <path
              d="M 58 78 C 38 42, 68 28, 76 60 Z"
              fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#kibo3DBodyGrad)'}
              stroke={hasGoldenSkin ? '#B45309' : '#9E2A00'}
              strokeWidth="3.5"
              filter="url(#clayShadow)"
            />
            <path d="M 62 72 C 48 48, 68 38, 73 62 Z" fill={hasGoldenSkin ? '#FDE047' : 'url(#kibo3DEarInner)'} />

            {/* Right Ear */}
            <path
              d="M 142 78 C 162 42, 132 28, 124 60 Z"
              fill={hasGoldenSkin ? 'url(#goldBodyGrad)' : 'url(#kibo3DBodyGrad)'}
              stroke={hasGoldenSkin ? '#B45309' : '#9E2A00'}
              strokeWidth="3.5"
              filter="url(#clayShadow)"
            />
            <path d="M 138 72 C 152 48, 132 38, 127 62 Z" fill={hasGoldenSkin ? '#FDE047' : 'url(#kibo3DEarInner)'} />
          </g>
        </g>

        {/* ==================================================== */}
        {/* LAYER 3: OUTFITS (Vest, Scarf, Bowtie, Cape)         */}
        {/* ==================================================== */}
        <g id="layer-outfits">
          {hasRoyalCape && (
            <g filter="url(#clayShadow)">
              <path d="M 60 100 Q 100 90 140 100 L 155 160 Q 100 175 45 160 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3" />
              <path d="M 60 100 L 140 100" stroke="#F59E0B" strokeWidth="5" />
            </g>
          )}

          {hasVest && (
            <g filter="url(#clayShadow)">
              <path d="M 60 98 L 80 98 L 100 120 L 120 98 L 140 98 L 140 145 L 60 145 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3" />
            </g>
          )}

          {hasSummitScarf && (
            <g filter="url(#clayShadow)">
              <ellipse cx="100" cy="98" rx="42" ry="16" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
              <path d="M 115 102 L 132 140 L 105 140 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="2.5" />
            </g>
          )}

          {hasBowtie && (
            <g filter="url(#clayShadow)">
              <polygon points="100,105 75,90 75,120" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
              <polygon points="100,105 125,90 125,120" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
              <circle cx="100" cy="105" r="7" fill="#DC2626" />
            </g>
          )}
        </g>

        {/* ==================================================== */}
        {/* LAYER 4: FACE (Eyes, Nose, Expressive Expressions)   */}
        {/* ==================================================== */}
        <g id="layer-face">
          {/* Snout Area */}
          <ellipse cx="100" cy="108" rx="22" ry="16" fill="url(#kibo3DSnoutGrad)" />

          {/* Nose */}
          <ellipse cx="100" cy="99" rx="7" ry="5" fill="#4A1500" />
          <ellipse cx="98" cy="97" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* Expressive Mouth */}
          {mood === 'sad' ? (
            <path d="M 92 114 Q 100 108 108 114" stroke="#4A1500" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M 90 108 Q 100 122 110 108" stroke="#4A1500" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}

          {/* Eyes with Blinking State */}
          <g className={`transition-transform duration-150 ${getMoodEyeTransform()}`}>
            {isBlinking ? (
              <>
                <path d="M 76 96 Q 84 96 92 96" stroke="#4A1500" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 108 96 Q 116 96 124 96" stroke="#4A1500" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="84" cy="94" rx="7" ry="9" fill="#290B00" />
                <circle cx="82" cy="91" r="3" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="116" cy="94" rx="7" ry="9" fill="#290B00" />
                <circle cx="114" cy="91" r="3" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Cheeks */}
          <circle cx="72" cy="104" r="7" fill="#FF8080" opacity="0.4" />
          <circle cx="128" cy="104" r="7" fill="#FF8080" opacity="0.4" />
        </g>

        {/* ==================================================== */}
        {/* LAYER 5: HAND-HELD GEAR & CANTEEN / LANTERN          */}
        {/* ==================================================== */}
        <g id="layer-gear">
          {hasGoldenCompass && (
            <g filter="url(#clayShadow)">
              <circle cx="60" cy="140" r="12" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
              <polygon points="60,132 63,140 60,148 57,140" fill="#EF4444" />
            </g>
          )}

          {hasCanteen && (
            <g filter="url(#clayShadow)">
              <ellipse cx="138" cy="145" rx="10" ry="14" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
              <rect x="135" y="128" width="6" height="5" fill="#CBD5E1" />
            </g>
          )}

          {hasLantern && (
            <g filter="url(#clayShadow)" className="animate-pulse">
              <rect x="54" y="140" width="16" height="22" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
              <rect x="58" y="144" width="8" height="14" rx="2" fill="#FEF08A" />
            </g>
          )}
        </g>

        {/* ==================================================== */}
        {/* LAYER 6: HEADWEAR (Hats, Bandanas, Headphones)       */}
        {/* ==================================================== */}
        <g id="layer-head">
          {hasCap && (
            <g filter="url(#clayShadow)">
              <path d="M 52 70 Q 100 48 148 70 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="3" />
              <path d="M 100 70 Q 148 64 165 72" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {hasBandana && (
            <g filter="url(#clayShadow)">
              <path d="M 50 68 Q 100 46 150 68 L 146 78 Q 100 58 54 78 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
              <polygon points="144,72 165,82 152,90" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            </g>
          )}

          {hasPartyHat && (
            <g filter="url(#clayShadow)">
              <polygon points="100,20 70,70 130,70" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
              <circle cx="100" cy="18" r="8" fill="#EF4444" />
            </g>
          )}

          {hasGoggles && (
            <g filter="url(#claySpecular)">
              <rect x="65" y="86" width="30" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" opacity="0.9" />
              <rect x="105" y="86" width="30" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" opacity="0.9" />
              <line x1="95" y1="96" x2="105" y2="96" stroke="#0284C7" strokeWidth="4" />
            </g>
          )}

          {hasExplorerHat && (
            <g filter="url(#clayShadow)">
              <path d="M 70 65 Q 100 32 130 65 Z" fill="#92400E" stroke="#451A03" strokeWidth="3" />
              <path d="M 68 62 Q 100 55 132 62" stroke="#F59E0B" strokeWidth="5" fill="none" />
              <ellipse cx="100" cy="66" rx="54" ry="10" fill="#78350F" stroke="#451A03" strokeWidth="3" />
            </g>
          )}

          {hasWizardHat && (
            <g filter="url(#clayShadow)">
              <path d="M 100 10 L 60 72 L 140 72 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3" />
              <ellipse cx="100" cy="72" rx="48" ry="10" fill="#6D28D9" stroke="#5B21B6" strokeWidth="3" />
              <polygon points="100,25 103,32 110,34 105,39 106,46 100,42 94,46 95,39 90,34 97,32" fill="#FBBF24" />
            </g>
          )}

          {hasCrown && (
            <g filter="url(#clayShadow)">
              <path d="M 65 68 L 72 38 L 86 52 L 100 30 L 114 52 L 128 38 L 135 68 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
              <circle cx="72" cy="36" r="4" fill="#EF4444" />
              <circle cx="100" cy="28" r="5" fill="#3B82F6" />
              <circle cx="128" cy="36" r="4" fill="#10B981" />
            </g>
          )}

          {hasNeonHeadphones && (
            <g filter="url(#clayShadow)">
              <path d="M 52 95 A 50 50 0 0 1 148 95" stroke="url(#neonHeadphoneGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 54 94 A 48 48 0 0 1 146 94" stroke="#67E8F9" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
              
              <rect x="42" y="82" width="18" height="34" rx="9" fill="url(#neonHeadphoneGrad)" stroke="#0369A1" strokeWidth="3" />
              <rect x="46" y="86" width="10" height="26" rx="5" fill="#38BDF8" opacity="0.9" />
              <circle cx="51" cy="99" r="3" fill="#A5F3FC" className="animate-pulse" />

              <rect x="140" y="82" width="18" height="34" rx="9" fill="url(#neonHeadphoneGrad)" stroke="#0369A1" strokeWidth="3" />
              <rect x="144" y="86" width="10" height="26" rx="5" fill="#38BDF8" opacity="0.9" />
              <circle cx="149" cy="99" r="3" fill="#A5F3FC" className="animate-pulse" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
