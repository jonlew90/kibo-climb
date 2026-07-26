import React from 'react';

export default function Mascot({ mood = 'happy', equipped = [], className = "w-36 h-36" }) {
  // Equipped item checks
  const isEquipped = (itemId) => equipped.includes(itemId);

  // Background Themes
  const hasCosmicBg = isEquipped('bg_cosmic');
  const hasSunsetBg = isEquipped('bg_sunset');

  // Auras & FX
  const hasRainbowAura = isEquipped('rainbow_aura');
  const hasGoldenAura = isEquipped('golden_aura');
  const hasGoldenSkin = isEquipped('golden_skin');

  // Headwear
  const hasCap = isEquipped('cap');
  const hasPartyHat = isEquipped('party_hat');
  const hasGoggles = isEquipped('goggles');
  const hasWizardHat = isEquipped('wizard_hat');
  const hasCrown = isEquipped('crown');

  // Body Accessories
  const hasBowtie = isEquipped('bowtie');
  const hasCape = isEquipped('cape');
  const hasHeadphones = isEquipped('headphones');
  const hasJetpack = isEquipped('jetpack');

  return (
    <div className={`relative flex items-center justify-center rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
      {/* 1. BACKGROUND THEME LAYER */}
      {hasCosmicBg && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center pointer-events-none">
          <div className="absolute w-2 h-2 bg-white rounded-full top-3 left-4 animate-ping opacity-75" />
          <div className="absolute w-1.5 h-1.5 bg-amber-200 rounded-full top-8 right-6 animate-pulse" />
          <div className="absolute w-1 h-1 bg-cyan-200 rounded-full bottom-4 left-8 animate-pulse" />
        </div>
      )}
      {hasSunsetBg && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-orange-400 to-rose-500 pointer-events-none" />
      )}

      {/* 2. AURA / FX GLOW LAYER */}
      {hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 opacity-90 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasRainbowAura && !hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-300 via-sky-300 to-purple-400 opacity-60 blur-md animate-pulse pointer-events-none scale-110" />
      )}
      {hasGoldenAura && !hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 opacity-70 blur-lg animate-pulse pointer-events-none scale-110" />
      )}

      {/* 3. BASE 3D VOLUMETRIC KIBO SVG */}
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

          {/* LEGENDARY 24K GOLD METALLIC GRADIENT */}
          <linearGradient id="goldBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FCD34D" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="goldEarsGrad" x1="30" y1="10" x2="170" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <linearGradient id="jetpackMetalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Tactile 3D Soft Clay Ambient Shadow & Rim Light Filters */}
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#3F1400" floodOpacity="0.35" />
          </filter>

          <filter id="claySpecular" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* LEGENDARY ORBITING SPARKLE STARS */}
        {hasGoldenSkin && (
          <g className="animate-spin" style={{ transformOrigin: '100px 110px', animationDuration: '12s' }}>
            <polygon points="100,10 102,17 109,19 104,24 105,31 100,27 95,31 96,24 91,19 98,17" fill="#FEF08A" />
            <polygon points="180,100 182,107 189,109 184,114 185,121 180,117 175,121 176,114 171,109 178,107" fill="#FBBF24" />
            <polygon points="20,100 22,107 29,109 24,114 25,121 20,117 15,121 16,114 11,109 18,107" fill="#FEF08A" />
            <polygon points="100,190 102,197 109,199 104,204 105,211 100,207 95,211 96,204 91,199 98,197" fill="#FBBF24" />
          </g>
        )}

        {/* --- BACK ACCESSORIES LAYER --- */}
        {hasCape && (
          <path
            d="M 55 105 C 30 115 20 160 35 175 C 65 180 80 170 85 140 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="3.5"
            filter="url(#clayShadow)"
          />
        )}

        {hasJetpack && (
          <g filter="url(#clayShadow)">
            {/* Left Jetpack Tank */}
            <rect x="18" y="75" width="28" height="68" rx="10" fill="url(#jetpackMetalGrad)" stroke="#0F172A" strokeWidth="3" />
            <rect x="22" y="85" width="20" height="8" fill="#EF4444" rx="2" />
            <ellipse cx="32" cy="75" rx="14" ry="7" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
            <path d="M 24 143 L 40 143 L 36 153 L 28 153 Z" fill="#334155" />
            <path d="M 26 153 Q 32 178 38 153 Z" fill="#FF4500" className="animate-pulse" />

            {/* Right Jetpack Tank */}
            <rect x="154" y="75" width="28" height="68" rx="10" fill="url(#jetpackMetalGrad)" stroke="#0F172A" strokeWidth="3" />
            <rect x="158" y="85" width="20" height="8" fill="#EF4444" rx="2" />
            <ellipse cx="168" cy="75" rx="14" ry="7" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
            <path d="M 160 143 L 176 143 L 172 153 L 164 153 Z" fill="#334155" />
            <path d="M 162 153 Q 168 178 174 153 Z" fill="#FF4500" className="animate-pulse" />
          </g>
        )}

        {/* --- BASE 3D VOLUMETRIC KIBO BODY GEOMETRY --- */}
        {/* Left Ear */}
        <g filter="url(#clayShadow)">
          <path
            d="M 60 65 Q 25 35 48 20 Q 75 35 68 62"
            fill={hasGoldenSkin ? "url(#goldEarsGrad)" : "url(#kibo3DBodyGrad)"}
            stroke={hasGoldenSkin ? "#78350F" : "#7A2000"}
            strokeWidth="4"
          />
          <path
            d="M 54 55 Q 38 38 48 30 Q 62 38 58 53"
            fill={hasGoldenSkin ? "#FFFBEB" : "url(#kibo3DEarInner)"}
          />
        </g>

        {/* Right Ear */}
        <g filter="url(#clayShadow)">
          <path
            d="M 140 65 Q 175 35 152 20 Q 125 35 132 62"
            fill={hasGoldenSkin ? "url(#goldEarsGrad)" : "url(#kibo3DBodyGrad)"}
            stroke={hasGoldenSkin ? "#78350F" : "#7A2000"}
            strokeWidth="4"
          />
          <path
            d="M 146 55 Q 162 38 152 30 Q 138 38 142 53"
            fill={hasGoldenSkin ? "#FFFBEB" : "url(#kibo3DEarInner)"}
          />
        </g>

        {/* Main Volumetric Body/Head Sphere */}
        <g filter="url(#clayShadow)">
          <ellipse
            cx="100"
            cy="110"
            rx="64"
            ry="60"
            fill={hasGoldenSkin ? "url(#goldBodyGrad)" : "url(#kibo3DBodyGrad)"}
            stroke={hasGoldenSkin ? "#78350F" : "#6E1B00"}
            strokeWidth="4.5"
          />
          {/* Volumetric Top Highlight Rim */}
          <ellipse cx="92" cy="74" rx="38" ry="16" fill="#FFFFFF" fillOpacity="0.25" />
        </g>

        {/* Tactile 3D Muzzle */}
        <g filter="url(#claySpecular)">
          <ellipse
            cx="100"
            cy="124"
            rx="36"
            ry="26"
            fill="url(#kibo3DSnoutGrad)"
            stroke="#D6A785"
            strokeWidth="2.5"
          />
          {/* Muzzle Top Highlight */}
          <ellipse cx="98" cy="106" rx="20" ry="8" fill="#FFFFFF" fillOpacity="0.4" />

          {/* Cute 3D Button Nose */}
          <ellipse cx="100" cy="112" rx="8" ry="6" fill="#2D1204" />
          <ellipse cx="98" cy="110" rx="3" ry="2" fill="#FFFFFF" fillOpacity="0.8" />
        </g>

        {/* Expressive 3D Eyes */}
        <g>
          {/* Left Eye */}
          <ellipse cx="78" cy="98" rx="8" ry="11" fill="#2B1507" />
          <ellipse cx="76" cy="94" rx="3.5" ry="4.5" fill="#FFFFFF" />
          <ellipse cx="80" cy="102" rx="1.5" ry="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* Right Eye */}
          <ellipse cx="122" cy="98" rx="8" ry="11" fill="#2B1507" />
          <ellipse cx="120" cy="94" rx="3.5" ry="4.5" fill="#FFFFFF" />
          <ellipse cx="124" cy="102" rx="1.5" ry="1.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Mood Expressions */}
        {mood === 'happy' && (
          <path d="M 92 124 Q 100 134 108 124" stroke="#2B1507" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {mood === 'correct' && (
          <path d="M 88 122 Q 100 138 112 122" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mood === 'incorrect' && (
          <path d="M 94 130 Q 100 122 106 130" stroke="#2B1507" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {mood === 'celebrate' && (
          <g>
            <path d="M 88 120 Q 100 140 112 120 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" />
            <path d="M 72 98 Q 78 92 84 98" stroke="#2B1507" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 116 98 Q 122 92 128 98" stroke="#2B1507" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Soft Rosy Cheeks */}
        <ellipse cx="64" cy="112" rx="7" ry="4.5" fill="#FF4D6D" opacity="0.45" />
        <ellipse cx="136" cy="112" rx="7" ry="4.5" fill="#FF4D6D" opacity="0.45" />

        {/* --- FRONT HEADWEAR ACCESSORIES LAYER --- */}
        {hasCap && (
          <g filter="url(#clayShadow)">
            <path d="M 52 70 Q 100 48 148 70 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="3" />
            <path d="M 100 70 Q 148 64 165 72" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" fill="none" />
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

        {hasHeadphones && (
          <g filter="url(#clayShadow)">
            <path d="M 52 95 A 50 50 0 0 1 148 95" stroke="#0EA5E9" strokeWidth="7" fill="none" strokeLinecap="round" />
            <rect x="44" y="84" width="16" height="30" rx="8" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
            <rect x="140" y="84" width="16" height="30" rx="8" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
          </g>
        )}

        {hasBowtie && (
          <g filter="url(#claySpecular)">
            <polygon points="100,136 82,126 82,146" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <polygon points="100,136 118,126 118,146" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <circle cx="100" cy="136" r="4" fill="#DC2626" />
          </g>
        )}
      </svg>
    </div>
  );
}
