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

  // Skins
  const hasGoldenSkin = isEquipped('golden_skin');
  const hasSnowWhiteSkin = isEquipped('snow_white_skin');
  const hasMidnightSkin = isEquipped('midnight_shadow_skin');
  const hasJadeSkin = isEquipped('emerald_jade_skin');

  const hasCustomSkin = hasGoldenSkin || hasSnowWhiteSkin || hasMidnightSkin || hasJadeSkin;

  const bodyFill = hasGoldenSkin
    ? 'url(#goldBodyGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteBodyGrad)'
    : hasMidnightSkin
    ? 'url(#midnightBodyGrad)'
    : hasJadeSkin
    ? 'url(#jadeBodyGrad)'
    : 'url(#kibo3DBodyGrad)';

  const bodyStroke = hasGoldenSkin
    ? '#B45309'
    : hasSnowWhiteSkin
    ? '#0284C7'
    : hasMidnightSkin
    ? '#0F172A'
    : hasJadeSkin
    ? '#047857'
    : '#8A2500';

  const footStroke = hasGoldenSkin
    ? '#B45309'
    : hasSnowWhiteSkin
    ? '#0284C7'
    : hasMidnightSkin
    ? '#0F172A'
    : hasJadeSkin
    ? '#047857'
    : '#9E2A00';

  const earInnerFill = hasGoldenSkin
    ? '#FDE047'
    : hasSnowWhiteSkin
    ? '#BAE6FD'
    : hasMidnightSkin
    ? '#334155'
    : hasJadeSkin
    ? '#6EE7B7'
    : 'url(#kibo3DEarInner)';

  // Pets
  const hasSnowyOwl = isEquipped('snowy_owl');
  const hasAlpineFox = isEquipped('alpine_fox');
  const hasPhoenixPet = isEquipped('phoenix_pet');
  const hasFrostDragon = isEquipped('frost_dragon');
  const hasCosmicGriffin = isEquipped('cosmic_griffin');

  // Visual FX
  const hasSparkleDust = isEquipped('sparkle_dust');
  const hasStarlightAura = isEquipped('starlight_aura');
  const hasLightningSparks = isEquipped('lightning_sparks');
  const hasRainbowNebula = isEquipped('rainbow_nebula');

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

  // Consumable Power-Ups Stage Previews
  const hasKiboShield = isEquipped('kibo_shield');
  const hasDoubleSparksPotion = isEquipped('double_sparks_potion') || isEquipped('double_coin_potion');
  const hasHintScroll = isEquipped('hint_scroll');

  // --- LIVING MASCOT ANIMATION STATES ---
  const [isBlinking, setIsBlinking] = useState(false);
  const [isEarTwitching, setIsEarTwitching] = useState(false);
  const [isSniffing, setIsSniffing] = useState(false);
  const [isTwirling, setIsTwirling] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [sparkParticles, setSparkParticles] = useState([]);

  // Advanced Movement Visual FX items
  const hasCloudFloat = isEquipped('fx_float_bounce');
  const hasSpinDance = isEquipped('fx_spin_dance');
  const hasSpeedTrail = isEquipped('fx_hyper_speed');
  const hasOrbitMoons = isEquipped('fx_orbit_moons');

  // Periodic Victory Twirl for Victory Spin FX
  useEffect(() => {
    if (!hasSpinDance) return;
    const interval = setInterval(() => {
      setIsTwirling(true);
      setTimeout(() => setIsTwirling(false), 850);
    }, 5500);
    return () => clearInterval(interval);
  }, [hasSpinDance]);

  // Random Natural Micro-Actions Loop (Blinks, Ear Twitches, Nose Sniffs)
  useEffect(() => {
    let timeoutId;

    const scheduleMicroAction = () => {
      const delay = Math.floor(Math.random() * 2500) + 3000;
      timeoutId = setTimeout(() => {
        const rand = Math.random();

        if (rand < 0.4) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 200);
        } else if (rand < 0.75) {
          setIsEarTwitching(true);
          setTimeout(() => setIsEarTwitching(false), 380);
        } else {
          setIsSniffing(true);
          setTimeout(() => setIsSniffing(false), 420);
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
      className={`relative select-none cursor-pointer aspect-square shrink-0 transition-all duration-300 ${
        isTapped
          ? 'animate-mascot-squash'
          : isTwirling
          ? 'animate-victory-spin'
          : hasCloudFloat
          ? 'animate-cloud-float'
          : 'animate-mascot-breathe'
      } ${state === 'climbing' ? 'animate-bounce-slow' : ''} ${className}`}
    >
      {/* AURAS & FX OUTER GLOW */}
      {hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 opacity-90 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasStarlightAura && !hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 opacity-70 blur-lg animate-pulse pointer-events-none scale-110" />
      )}


      {/* REACTIVE FLOATING SPARK ⚡ PARTICLES */}
      {sparkParticles.map((spark) => (
        <div
          key={spark.id}
          className="absolute z-30 font-black text-amber-400 text-lg pointer-events-none animate-spark-float drop-shadow-md"
          style={{ left: spark.left, top: spark.top }}
        >
          ⚡
        </div>
      ))}

      {/* MAIN 3D MASCOT SVG WITH INTEGRATED BACKGROUND & PET LAYERS */}
      <svg
        viewBox="-35 -35 270 270"
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

          {/* Background Theme Gradients */}
          <linearGradient id="svgSunsetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="svgAuroraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="svgLavaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          <linearGradient id="svgCosmicGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="svgCaveGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#581C87" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="svgPalaceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

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

          {/* WINTER FROST WHITE FUR GRADIENT */}
          <linearGradient id="snowWhiteBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          {/* MIDNIGHT OBSIDIAN FUR GRADIENT */}
          <linearGradient id="midnightBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="55%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* MYSTIC JADE EMERALD FUR GRADIENT */}
          <linearGradient id="jadeBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
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
        {/* LAYER 0: BACKGROUND THEME GRAPHICS                    */}
        {/* ==================================================== */}
        {hasAlpineBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
            <polygon points="20,180 70,90 120,180" fill="#059669" opacity="0.85" />
            <polygon points="80,180 135,70 190,180" fill="#047857" opacity="0.9" />
            <circle cx="150" cy="45" r="16" fill="#FACC15" />
          </g>
        )}

        {hasSunsetBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgSunsetGrad)" stroke="#E11D48" strokeWidth="4" />
            <circle cx="100" cy="115" r="60" fill="#FFFBEB" opacity="0.35" />
            <polygon points="10,185 60,130 110,185" fill="#4C0519" opacity="0.7" />
            <polygon points="80,185 140,110 195,185" fill="#4C0519" opacity="0.8" />
          </g>
        )}

        {hasAuroraBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgAuroraGrad)" stroke="#0D9488" strokeWidth="4" />
            <path d="M 15 60 Q 80 20 185 60" stroke="#5EEAD4" strokeWidth="12" fill="none" opacity="0.75" />
            <circle cx="40" cy="35" r="2" fill="#FFFFFF" />
            <circle cx="160" cy="45" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {hasVolcanoBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgLavaGrad)" stroke="#9A3412" strokeWidth="4" />
            <polygon points="25,190 100,80 175,190" fill="#451A03" />
            <circle cx="100" cy="80" r="12" fill="#F97316" />
          </g>
        )}

        {hasCosmicBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgCosmicGrad)" stroke="#6366F1" strokeWidth="4" />
            <circle cx="35" cy="40" r="3" fill="#FFFFFF" />
            <circle cx="165" cy="55" r="2.5" fill="#FDE047" />
            <circle cx="140" cy="140" r="4" fill="#67E8F9" />
            <ellipse cx="140" cy="140" rx="12" ry="4" fill="none" stroke="#67E8F9" strokeWidth="1.5" />
          </g>
        )}

        {hasCrystalCaveBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgCaveGrad)" stroke="#7C3AED" strokeWidth="4" />
            <polygon points="20,185 45,95 70,185" fill="#C084FC" />
            <polygon points="130,185 155,80 180,185" fill="#38BDF8" />
          </g>
        )}

        {hasGoldenPalaceBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgPalaceGrad)" stroke="#B45309" strokeWidth="4" />
            <rect x="50" y="90" width="100" height="95" fill="#FFFBEB" opacity="0.9" stroke="#B45309" strokeWidth="3" />
            <polygon points="100,40 50,90 150,90" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
          </g>
        )}

        {/* ==================================================== */}
        {/* COMPANION PETS (Owl, Fox, Phoenix, Dragon, Griffin)  */}
        {/* ==================================================== */}
        {hasSnowyOwl && (
          <g className="animate-bounce" style={{ animationDuration: '3s' }} filter="url(#clayShadow)">
            <ellipse cx="165" cy="58" rx="11" ry="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="165" cy="44" r="9" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <polygon points="165,44 169,48 161,48" fill="#F59E0B" />
            <circle cx="161" cy="42" r="2.5" fill="#FBBF24" />
            <circle cx="169" cy="42" r="2.5" fill="#FBBF24" />
            <circle cx="161" cy="42" r="1" fill="#000000" />
            <circle cx="169" cy="42" r="1" fill="#000000" />
          </g>
        )}

        {hasAlpineFox && (
          <g className="animate-pulse" style={{ animationDuration: '2.8s' }} filter="url(#clayShadow)">
            <ellipse cx="36" cy="148" rx="14" ry="10" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <circle cx="26" cy="142" r="8" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <polygon points="22,136 20,126 27,133" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <polygon points="29,136 32,126 33,134" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <ellipse cx="23" cy="145" rx="3" ry="2" fill="#FFFFFF" />
            <circle cx="23" cy="142" r="1" fill="#000000" />
          </g>
        )}

        {hasPhoenixPet && (
          <g className="animate-bounce" style={{ animationDuration: '2.2s' }} filter="url(#clayShadow)">
            <path d="M 158 65 Q 142 82 148 95 Q 160 86 162 70 Z" fill="#EF4444" />
            <path d="M 160 68 Q 148 84 154 95" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="165" cy="58" rx="14" ry="18" fill="url(#thumbLavaGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <circle cx="165" cy="44" r="11" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
            <polygon points="165,33 169,20 163,29 158,22" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <path d="M 165 52 Q 192 42 186 70 Q 168 70 165 59 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <polygon points="172,44 184,48 172,51" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="162" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="162" cy="42" r="1.5" fill="#451A03" />
          </g>
        )}

        {hasFrostDragon && (
          <g className="animate-pulse" style={{ animationDuration: '2.5s' }} filter="url(#clayShadow)">
            <path d="M 172 21 Q 188 34 180 46 Q 170 38 168 26 Z" fill="#0EA5E9" />
            <ellipse cx="165" cy="14" rx="14" ry="18" fill="url(#thumbAuroraGrad)" stroke="#065F46" strokeWidth="2.5" />
            <circle cx="165" cy="0" r="11" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <polygon points="160,-8 154,-22 164,-12" fill="#A5F3FC" stroke="#0891B2" strokeWidth="1.5" />
            <polygon points="168,-8 174,-22 169,-12" fill="#A5F3FC" stroke="#0891B2" strokeWidth="1.5" />
            <path d="M 165 8 Q 138 -2 144 26 Q 162 26 165 15 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2" />
            <ellipse cx="157" cy="3" rx="5" ry="3.5" fill="#E0F2FE" />
            <circle cx="167" cy="-2" r="3" fill="#FFFFFF" />
            <circle cx="167" cy="-2" r="1.5" fill="#0C4A6E" />
          </g>
        )}

        {hasCosmicGriffin && (
          <g className="animate-bounce" style={{ animationDuration: '2.6s' }} filter="url(#clayShadow)">
            <path d="M 162 65 Q 185 45 178 85 Q 165 82 162 70 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <ellipse cx="165" cy="58" rx="13" ry="16" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="165" cy="44" r="10" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
            <polygon points="170,44 184,48 170,51" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="161" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="161" cy="42" r="1.5" fill="#78350F" />
          </g>
        )}

        {/* VISUAL FX (Cloud Levitator, Victory Spin, Speed Trail, Nebula, Orbit Moons) */}
        {hasCloudFloat && (
          <g filter="url(#clayShadow)">
            {/* Fluffy Volumetric 3D Levitating Cloud Platform */}
            <ellipse cx="100" cy="182" rx="64" ry="18" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="50" cy="176" r="22" fill="#F8FAFC" />
            <circle cx="150" cy="176" r="22" fill="#F8FAFC" />
            <circle cx="80" cy="168" r="26" fill="#FFFFFF" />
            <circle cx="120" cy="168" r="26" fill="#FFFFFF" />
            <circle cx="100" cy="162" r="28" fill="#FFFFFF" />

            {/* Glowing Cloud Embers */}
            <circle cx="45" cy="160" r="3" fill="#FCD34D" className="animate-ping" />
            <circle cx="155" cy="160" r="3" fill="#38BDF8" className="animate-ping" />
          </g>
        )}

        {/* --- BACK VISUAL FX (Behind Kibo) --- */}
        {hasSparkleDust && (
          <g>
            {/* Falling Raindrops (Back Layer) */}
            <path d="M 45 40 L 41 55" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-1" />
            <path d="M 155 35 L 151 50" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-2" />
            <path d="M 75 25 L 71 40" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" className="animate-rain-drop-3" />
            <path d="M 125 30 L 121 45" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" className="animate-rain-drop-4" />
          </g>
        )}

        {hasLightningSparks && (
          <g id="cosmic-bubble-floating-back">
            {/* Iridescent Pastel Bubbles (Back Layer) */}
            <g className="animate-bubble-float-1"><circle cx="45" cy="130" r="10" fill="#FDE047" opacity="0.6" stroke="#FACC15" strokeWidth="1.5" /><circle cx="42" cy="127" r="3" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-2"><circle cx="155" cy="140" r="14" fill="#38BDF8" opacity="0.6" stroke="#0284C7" strokeWidth="1.5" /><circle cx="151" cy="136" r="4" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-3"><circle cx="65" cy="155" r="8" fill="#F472B6" opacity="0.6" stroke="#DB2777" strokeWidth="1.5" /><circle cx="63" cy="153" r="2.5" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-4"><circle cx="135" cy="150" r="11" fill="#C084FC" opacity="0.6" stroke="#7C3AED" strokeWidth="1.5" /><circle cx="132" cy="147" r="3.5" fill="#FFFFFF" opacity="0.8" /></g>
          </g>
        )}

        {hasSpeedTrail && (
          <g id="disco-fever-spotlight-back">
            {/* Multi-Color Disco Dance Floor Spotlights */}
            <g className="animate-disco-spotlight">
              <polygon points="100,25 30,190 70,190" fill="#F472B6" opacity="0.25" />
              <polygon points="100,25 130,190 170,190" fill="#38BDF8" opacity="0.25" />
              <polygon points="100,25 70,190 130,190" fill="#FDE047" opacity="0.2" />
            </g>

            {/* Hanging Wire & Top Mount */}
            <line x1="100" y1="0" x2="100" y2="15" stroke="#94A3B8" strokeWidth="2" />
            <rect x="94" y="12" width="12" height="6" rx="2" fill="#64748B" />

            {/* Revolving Mirror Disco Ball */}
            <g className="animate-disco-ball">
              <circle cx="100" cy="28" r="13" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" filter="url(#clayShadow)" />
              {/* Mirror Facet Grid */}
              <line x1="87" y1="28" x2="113" y2="28" stroke="#94A3B8" strokeWidth="1" />
              <line x1="89" y1="23" x2="111" y2="23" stroke="#94A3B8" strokeWidth="1" />
              <line x1="89" y1="33" x2="111" y2="33" stroke="#94A3B8" strokeWidth="1" />
              <line x1="100" y1="15" x2="100" y2="41" stroke="#94A3B8" strokeWidth="1" />
              <line x1="95" y1="16" x2="95" y2="40" stroke="#94A3B8" strokeWidth="1" />
              <line x1="105" y1="16" x2="105" y2="40" stroke="#94A3B8" strokeWidth="1" />
              {/* Sparkling Metallic Highlights */}
              <circle cx="96" cy="24" r="1.5" fill="#FFFFFF" />
              <circle cx="104" cy="30" r="1.5" fill="#FFFFFF" />
              <circle cx="102" cy="21" r="1.2" fill="#FFFFFF" />
            </g>
          </g>
        )}

        {hasRainbowNebula && (
          <g id="background-fireworks-show">
            {/* Firework Burst 1: High Left Golden Sunburst */}
            <g className="animate-fireworks-burst" style={{ animationDuration: '2.4s', transformOrigin: '40px 45px' }}>
              <line x1="40" y1="45" x2="40" y2="20" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="60" y2="35" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="60" y2="55" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="40" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="20" y2="55" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="20" y2="35" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="40" cy="20" r="3" fill="#FEF08A" />
              <circle cx="60" cy="35" r="3" fill="#FEF08A" />
              <circle cx="60" cy="55" r="3" fill="#FEF08A" />
              <circle cx="40" cy="70" r="3" fill="#FEF08A" />
              <circle cx="20" cy="55" r="3" fill="#FEF08A" />
              <circle cx="20" cy="35" r="3" fill="#FEF08A" />
            </g>

            {/* Firework Burst 2: High Right Cyan & Purple Starburst */}
            <g className="animate-fireworks-burst" style={{ animationDuration: '2.8s', animationDelay: '0.6s', transformOrigin: '160px 40px' }}>
              <line x1="160" y1="40" x2="160" y2="15" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="182" y2="28" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="182" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="160" y2="65" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="138" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="138" y2="28" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <circle cx="160" cy="15" r="3.5" fill="#E0F2FE" />
              <circle cx="182" cy="28" r="3.5" fill="#F3E8FF" />
              <circle cx="182" cy="52" r="3.5" fill="#E0F2FE" />
              <circle cx="160" cy="65" r="3.5" fill="#F3E8FF" />
              <circle cx="138" cy="52" r="3.5" fill="#E0F2FE" />
              <circle cx="138" cy="28" r="3.5" fill="#F3E8FF" />
            </g>

            {/* Firework Burst 3: Central High Pink & Emerald Grand Finale */}
            <g className="animate-fireworks-burst" style={{ animationDuration: '3.2s', animationDelay: '1.2s', transformOrigin: '100px 30px' }}>
              <line x1="100" y1="30" x2="100" y2="5" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="125" y2="15" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="125" y2="45" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="100" y2="55" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="75" y2="45" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="75" y2="15" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <polygon points="100,18 103,26 111,26 105,31 107,39 100,34 93,39 95,31 89,26 97,26" fill="#FDE047" opacity="0.9" />
            </g>
          </g>
        )}

        {/* ==================================================== */}
        {/* KIBO CHARACTER GROUP (Body, Face, Outfits, Gear, Headwear) */}
        {/* ==================================================== */}
        <g className={`${hasOrbitMoons ? 'animate-silly-boogie' : ''} ${hasSpinDance ? 'animate-victory-twirl-body' : ''}`}>
          {/* ==================================================== */}
          {/* LAYER 1: BACKPACK & JETPACK                          */}
          {/* ==================================================== */}
          <g id="layer-back">
            {hasJetpack && (
              <g filter="url(#clayShadow)">
                {/* Left Rocket Thruster */}
                <rect x="26" y="62" width="30" height="70" rx="12" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
                <rect x="32" y="72" width="18" height="50" rx="6" fill="#E2E8F0" opacity="0.4" />
                <circle cx="41" cy="97" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                
                {/* Right Rocket Thruster */}
                <rect x="144" y="62" width="30" height="70" rx="12" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
                <rect x="150" y="72" width="18" height="50" rx="6" fill="#E2E8F0" opacity="0.4" />
                <circle cx="159" cy="97" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />

                {/* Fiery Exhaust Flames */}
                <path d="M 31 132 Q 41 175 51 132 Z" fill="#FF4500" className="animate-pulse" />
                <path d="M 35 132 Q 41 160 47 132 Z" fill="#FBBF24" className="animate-pulse" />
                <path d="M 149 132 Q 159 175 169 132 Z" fill="#FF4500" className="animate-pulse" />
                <path d="M 153 132 Q 159 160 165 132 Z" fill="#FBBF24" className="animate-pulse" />
              </g>
            )}

            {hasBackpack && (
              <g filter="url(#clayShadow)">
                {/* Top Sleeping Mat Roll */}
                <rect x="50" y="55" width="100" height="24" rx="10" fill="#15803D" stroke="#166534" strokeWidth="3" />
                <rect x="72" y="53" width="7" height="28" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <rect x="121" y="53" width="7" height="28" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

                {/* Main Heavy Duty Expedition Backpack Body */}
                <rect x="34" y="74" width="132" height="82" rx="24" fill="#B45309" stroke="#78350F" strokeWidth="4" />
                
                {/* Side Water Bottle Pockets */}
                <rect x="25" y="98" width="16" height="44" rx="6" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
                <rect x="159" y="98" width="16" height="44" rx="6" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
              </g>
            )}

            {hasRoyalCape && (
              <g filter="url(#clayShadow)" className="animate-cape-sway">
                <path d="M 64 96 L 44 165 Q 100 180 156 165 L 136 96 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3.5" />
                <path d="M 64 96 Q 100 90 136 96" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
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
              fill={hasCustomSkin ? bodyFill : 'url(#tailGrad)'}
              stroke={hasCustomSkin ? bodyStroke : '#872200'}
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
              fill={bodyFill}
              stroke={footStroke}
              strokeWidth="3"
              filter="url(#clayShadow)"
            />

            {/* Right Foot */}
            <ellipse
              cx="128"
              cy="165"
              rx="18"
              ry="12"
              fill={bodyFill}
              stroke={footStroke}
              strokeWidth="3"
              filter="url(#clayShadow)"
            />

            {/* Main 3D Volumetric Body Sphere */}
            <circle
              cx="100"
              cy="115"
              r="54"
              fill={bodyFill}
              stroke={bodyStroke}
              strokeWidth="4"
              filter="url(#clayShadow)"
            />

            {/* Cream Tummy Patch */}
            {!hasCustomSkin && (
              <ellipse cx="100" cy="126" rx="34" ry="26" fill="url(#kibo3DSnoutGrad)" opacity="0.95" />
            )}

            {/* Ears with Micro Twitching */}
            <g className={`transition-transform duration-200 ${isEarTwitching ? '-rotate-6 translate-y-0.5' : ''}`}>
              {/* Left Ear */}
              <path
                d="M 58 78 C 38 42, 68 28, 76 60 Z"
                fill={bodyFill}
                stroke={footStroke}
                strokeWidth="3.5"
                filter="url(#clayShadow)"
              />
              <path d="M 62 72 C 48 48, 68 38, 73 62 Z" fill={earInnerFill} />

              {/* Right Ear */}
              <path
                d="M 142 78 C 162 42, 132 28, 124 60 Z"
                fill={bodyFill}
                stroke={footStroke}
                strokeWidth="3.5"
                filter="url(#clayShadow)"
              />
              <path d="M 138 72 C 152 48, 132 38, 127 62 Z" fill={earInnerFill} />
            </g>
          </g>

          {/* ==================================================== */}
          {/* LAYER 3: OUTFITS (Vest, Scarf, Bowtie)               */}
          {/* ==================================================== */}
          <g id="layer-outfits">
            {hasVest && (
              <g filter="url(#clayShadow)">
                {/* Padded Climber Vest Body */}
                <path d="M 62 106 C 62 106, 100 116, 138 106 L 138 152 C 138 152, 100 162, 62 152 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3.5" />
                {/* Quilted Puffer Lines */}
                <path d="M 63 120 Q 100 130 137 120" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                <path d="M 62 136 Q 100 146 138 136" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                {/* Zipper & Collar */}
                <line x1="100" y1="110" x2="100" y2="157" stroke="#38BDF8" strokeWidth="3" />
                <circle cx="100" cy="116" r="3" fill="#FFFFFF" />
                {/* Climber Crest Badge */}
                <circle cx="80" cy="126" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              </g>
            )}

            {hasSummitScarf && (
              <g filter="url(#clayShadow)">
                {/* Wrapped Neck Scarf */}
                <path d="M 62 110 Q 100 128 138 110 L 136 122 Q 100 140 64 122 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="3" />
                <path d="M 64 108 Q 100 124 136 108 Q 100 118 64 108 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" />
                <path d="M 80 114 L 84 124 M 116 114 L 120 124" stroke="#FBBF24" strokeWidth="3" />
                {/* Dangling Scarf Tail */}
                <path d="M 114 122 L 130 162 L 110 162 L 102 124 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
                <rect x="108" y="150" width="22" height="5" fill="#FBBF24" />
                <line x1="112" y1="162" x2="112" y2="168" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="118" y1="162" x2="118" y2="168" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="124" y1="162" x2="124" y2="168" stroke="#F59E0B" strokeWidth="2.5" />
              </g>
            )}

            {hasBowtie && (
              <g filter="url(#clayShadow)">
                {/* 3D Red Bowtie on Collar */}
                <polygon points="100,122 74,110 72,134" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <polygon points="100,122 126,110 128,134" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <polygon points="100,122 80,114 78,130" fill="#F87171" />
                <polygon points="100,122 120,114 122,130" fill="#F87171" />
                <rect x="94" y="116" width="12" height="12" rx="4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2.5" />
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
              <g filter="url(#clayShadow)">
                {/* Glowing Ambient Aura */}
                <circle cx="48" cy="138" r="26" fill="#FDE047" opacity="0.35" className="animate-pulse" />
                
                {/* Brass Handle Loop */}
                <path d="M 38 120 C 38 106 58 106 58 120" stroke="#78350F" strokeWidth="3.5" fill="none" />
                
                {/* Main Golden Lantern Housing */}
                <rect x="34" y="120" width="28" height="36" rx="8" fill="#D97706" stroke="#78350F" strokeWidth="3" />
                
                {/* Glass Chamber & Radiant Flame */}
                <rect x="39" y="126" width="18" height="24" rx="4" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
                <path d="M 48 144 Q 53 136 48 130 Q 43 136 48 144 Z" fill="#EF4444" className="animate-pulse" />
                <path d="M 48 142 Q 51 137 48 133 Q 45 137 48 142 Z" fill="#FBBF24" className="animate-pulse" />
              </g>
            )}

            {hasKiboShield && (
              <g filter="url(#clayShadow)">
                <path d="M 160 115 C 172 115, 178 122, 178 135 C 178 152, 160 165, 160 165 C 160 165, 142 152, 142 135 C 142 122, 148 115, 160 115 Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2.5" />
                <path d="M 160 120 C 169 120, 174 125, 174 135 C 174 148, 160 158, 160 158 C 160 158, 146 148, 146 135 C 146 125, 151 120, 160 120 Z" fill="#38BDF8" />
                <path d="M 155 137 L 159 141 L 167 131" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            )}

            {hasDoubleSparksPotion && (
              <g filter="url(#clayShadow)">
                <rect x="156" y="125" width="8" height="6" rx="1.5" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
                <path d="M 154 131 L 166 131 L 173 152 A 5 5 0 0 1 168 158 L 152 158 A 5 5 0 0 1 147 152 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
                <text x="160" y="153" textAnchor="middle" fontSize="9" fontWeight="900" fill="#B45309">2x</text>
              </g>
            )}

            {hasHintScroll && (
              <g filter="url(#clayShadow)">
                <rect x="145" y="130" width="28" height="28" rx="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
                <path d="M 149 138 L 169 138 M 149 144 L 169 144 M 149 150 L 161 150" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
                <text x="166" y="153" textAnchor="middle" fontSize="7" fontWeight="900">💡</text>
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
        </g>

        {/* ==================================================== */}
        {/* LAYER 7: FRONT VISUAL FX (In Front of Kibo)          */}
        {/* ==================================================== */}
        <g id="layer-front-fx">
          {hasSparkleDust && (
            <g>
              {/* Falling Raindrops (Front Layer) */}
              <path d="M 60 20 L 56 38" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" className="animate-rain-drop-1" />
              <path d="M 140 25 L 136 43" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" className="animate-rain-drop-2" />
              <path d="M 90 15 L 86 33" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-5" />
              <path d="M 110 35 L 106 53" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-4" />
            </g>
          )}

          {hasLightningSparks && (
            <g id="cosmic-bubble-floating-front">
              {/* Iridescent Pastel Bubbles (Front Layer) */}
              <g className="animate-bubble-float-2"><circle cx="85" cy="145" r="16" fill="#A5F3FC" opacity="0.6" stroke="#0284C7" strokeWidth="1.5" /><circle cx="80" cy="140" r="4.5" fill="#FFFFFF" opacity="0.85" /></g>
              <g className="animate-bubble-float-4"><circle cx="115" cy="155" r="12" fill="#FBCFE8" opacity="0.6" stroke="#DB2777" strokeWidth="1.5" /><circle cx="112" cy="152" r="3.5" fill="#FFFFFF" opacity="0.85" /></g>
            </g>
          )}

          {hasSpeedTrail && (
            <g id="disco-fever-spotlight-front" className="animate-disco-spotlight">
              {/* Dance Floor Glittering Sparkles */}
              <circle cx="50" cy="175" r="3" fill="#FDE047" className="animate-ping" />
              <circle cx="150" cy="175" r="3" fill="#38BDF8" className="animate-ping" />
              <polygon points="100,165 103,172 110,172 104,176 106,183 100,178 94,183 96,176 90,172 97,172" fill="#F472B6" opacity="0.8" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
