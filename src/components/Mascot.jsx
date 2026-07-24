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

      {/* 3. BASE KIBO SVG & ACCESORIES */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Default Orange Gradient */}
          <linearGradient id="kiboBodyGrad" x1="100" y1="25" x2="100" y2="175" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7E36" />
            <stop offset="1" stopColor="#E04D00" />
          </linearGradient>

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
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <radialGradient id="goldShine" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="goldGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
        {/* Superhero Cape */}
        {hasCape && (
          <path
            d="M 55 105 C 30 115 20 160 35 175 C 65 180 80 170 85 140 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        )}

        {/* Rocket Jetpack (Thruster Tanks visible at sides + flames) */}
        {hasJetpack && (
          <g>
            {/* Left Jetpack Tank (Extends out to the left) */}
            <rect x="18" y="75" width="28" height="68" rx="10" fill="url(#jetpackMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
            <rect x="22" y="85" width="20" height="8" fill="#EF4444" />
            <ellipse cx="32" cy="75" rx="14" ry="7" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2.5" />
            {/* Left Nozzle */}
            <path d="M 24 143 L 40 143 L 36 153 L 28 153 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" />
            {/* Left Flame */}
            <path d="M 26 153 Q 32 178 38 153 Q 32 170 26 153 Z" fill="#FF4500" className="animate-pulse" />
            <path d="M 28 153 Q 32 168 36 153 Z" fill="#FFD700" className="animate-bounce" />

            {/* Right Jetpack Tank (Extends out to the right) */}
            <rect x="154" y="75" width="28" height="68" rx="10" fill="url(#jetpackMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
            <rect x="158" y="85" width="20" height="8" fill="#EF4444" />
            <ellipse cx="168" cy="75" rx="14" ry="7" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2.5" />
            {/* Right Nozzle */}
            <path d="M 160 143 L 176 143 L 172 153 L 164 153 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" />
            {/* Right Flame */}
            <path d="M 162 153 Q 168 178 174 153 Q 168 170 162 153 Z" fill="#FF4500" className="animate-pulse" />
            <path d="M 164 153 Q 168 168 172 153 Z" fill="#FFD700" className="animate-bounce" />
          </g>
        )}

        {/* --- BASE KIBO BODY GEOMETRY --- */}
        {/* Left Ear */}
        <path
          d="M 60 65 Q 25 35 48 20 Q 75 35 68 62"
          fill={hasGoldenSkin ? "url(#goldEarsGrad)" : "url(#kiboBodyGrad)"}
          stroke={hasGoldenSkin ? "#78350F" : "#C23A00"}
          strokeWidth={hasGoldenSkin ? "5" : "4.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 54 55 Q 38 38 48 30 Q 62 38 58 53"
          fill={hasGoldenSkin ? "#FFFBEB" : "#FFAE82"}
        />

        {/* Right Ear */}
        <path
          d="M 140 65 Q 175 35 152 20 Q 125 35 132 62"
          fill={hasGoldenSkin ? "url(#goldEarsGrad)" : "url(#kiboBodyGrad)"}
          stroke={hasGoldenSkin ? "#78350F" : "#C23A00"}
          strokeWidth={hasGoldenSkin ? "5" : "4.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 146 55 Q 162 38 152 30 Q 138 38 142 53"
          fill={hasGoldenSkin ? "#FFFBEB" : "#FFAE82"}
        />

        {/* Main Body/Head Oval */}
        <ellipse
          cx="100"
          cy="110"
          rx="62"
          ry="58"
          fill={hasGoldenSkin ? "url(#goldBodyGrad)" : "url(#kiboBodyGrad)"}
          stroke={hasGoldenSkin ? "#78350F" : "#C23A00"}
          strokeWidth={hasGoldenSkin ? "6" : "5"}
          filter={hasGoldenSkin ? "url(#goldGlowFilter)" : undefined}
        />

        {/* Metallic Gold Specular Highlight Overlay */}
        {hasGoldenSkin && (
          <ellipse cx="100" cy="100" rx="58" ry="50" fill="url(#goldShine)" pointerEvents="none" />
        )}

        {/* Cream / Pearl Muzzle */}
        <ellipse
          cx="100"
          cy="122"
          rx="34"
          ry="24"
          fill={hasGoldenSkin ? "#FFFBEB" : "#FFF7ED"}
          stroke={hasGoldenSkin ? "#D97706" : undefined}
          strokeWidth={hasGoldenSkin ? "2" : undefined}
        />

        {/* Nose */}
        <ellipse cx="100" cy="111" rx="7" ry="5.5" fill={hasGoldenSkin ? "#78350F" : "#292524"} />

        {/* --- EXPRESSIONS (Eyes & Mouth) --- */}
        {mood === 'happy' && (
          <>
            <ellipse cx="78" cy="95" rx="6.5" ry="9" fill={hasGoldenSkin ? "#451A03" : "#1C1917"} />
            <circle cx="80" cy="92" r="2.5" fill="white" />
            <ellipse cx="122" cy="95" rx="6.5" ry="9" fill={hasGoldenSkin ? "#451A03" : "#1C1917"} />
            <circle cx="124" cy="92" r="2.5" fill="white" />
            <path d="M 91 120 Q 100 130 109 120" stroke={hasGoldenSkin ? "#451A03" : "#292524"} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="66" cy="108" r="6" fill="#F43F5E" opacity="0.4" />
            <circle cx="134" cy="108" r="6" fill="#F43F5E" opacity="0.4" />
          </>
        )}

        {mood === 'correct' && (
          <>
            <path d="M 70 94 Q 78 86 86 94" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 114 94 Q 122 86 130 94" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 88 118 Q 100 134 112 118 Z" fill="#F43F5E" stroke={hasGoldenSkin ? "#451A03" : "#292524"} strokeWidth="3" />
            <circle cx="64" cy="108" r="7" fill="#F43F5E" opacity="0.5" />
            <circle cx="136" cy="108" r="7" fill="#F43F5E" opacity="0.5" />
          </>
        )}

        {mood === 'incorrect' && (
          <>
            <path d="M 72 90 L 84 98" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4" strokeLinecap="round" />
            <path d="M 84 90 L 72 98" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4" strokeLinecap="round" />
            <path d="M 116 90 L 128 98" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4" strokeLinecap="round" />
            <path d="M 128 90 L 116 98" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="4" strokeLinecap="round" />
            <path d="M 92 126 Q 100 118 108 126" stroke={hasGoldenSkin ? "#451A03" : "#292524"} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 132 82 Q 138 78 135 70" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === 'celebrate' && (
          <>
            <path d="M 70 92 Q 78 82 86 92" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 114 92 Q 122 82 130 92" stroke={hasGoldenSkin ? "#451A03" : "#1C1917"} strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 86 116 Q 100 136 114 116 Z" fill="#F43F5E" stroke={hasGoldenSkin ? "#451A03" : "#292524"} strokeWidth="3" />
            <polygon points="100,75 103,82 110,83 105,88 106,95 100,91 94,95 95,88 90,83 97,82" fill="#F59E0B" />
          </>
        )}

        {/* --- FRONT BODY ACCESSORIES LAYER --- */}
        {/* Jetpack Harness Straps & Chest Reactor Badge */}
        {hasJetpack && (
          <g>
            <path d="M 45 105 L 80 135 M 155 105 L 120 135" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="136" r="8" fill="#0EA5E9" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="100" cy="136" r="4" fill="#38BDF8" className="animate-ping" />
          </g>
        )}

        {/* Bowtie */}
        {hasBowtie && (
          <g>
            <polygon points="86,134 100,140 86,146" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
            <polygon points="114,134 100,140 114,146" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
            <circle cx="100" cy="140" r="4" fill="#B91C1C" />
          </g>
        )}

        {/* Neon Headphones */}
        {hasHeadphones && (
          <g>
            <path d="M 45 105 C 40 45 160 45 155 105" stroke="#06B6D4" strokeWidth="8" strokeLinecap="round" fill="none" />
            <rect x="38" y="95" width="16" height="30" rx="6" fill="#0891B2" stroke="#164E63" strokeWidth="2.5" />
            <rect x="146" y="95" width="16" height="30" rx="6" fill="#0891B2" stroke="#164E63" strokeWidth="2.5" />
          </g>
        )}

        {/* --- HEADWEAR LAYER --- */}
        {/* Baseball Cap */}
        {hasCap && (
          <g>
            <path d="M 52 75 C 52 42 148 42 148 75 Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="3.5" />
            <path d="M 40 75 Q 100 70 160 78 Q 110 85 40 75 Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="3" />
            <circle cx="100" cy="46" r="4" fill="#F59E0B" />
          </g>
        )}

        {/* Party Hat */}
        {hasPartyHat && (
          <g>
            <polygon points="100,15 70,72 130,72" fill="#EC4899" stroke="#9D174D" strokeWidth="3.5" />
            <circle cx="100" cy="15" r="7" fill="#F59E0B" />
            <circle cx="90" cy="45" r="4" fill="#3B82F6" />
            <circle cx="110" cy="55" r="4" fill="#10B981" />
          </g>
        )}

        {/* Aviator Goggles */}
        {hasGoggles && (
          <g>
            <rect x="52" y="78" width="42" height="24" rx="8" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
            <rect x="106" y="78" width="42" height="24" rx="8" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
            <rect x="56" y="82" width="34" height="16" rx="5" fill="#38BDF8" opacity="0.8" />
            <rect x="110" y="82" width="34" height="16" rx="5" fill="#38BDF8" opacity="0.8" />
            <line x1="94" y1="90" x2="106" y2="90" stroke="#78350F" strokeWidth="5" />
            <line x1="38" y1="90" x2="52" y2="90" stroke="#78350F" strokeWidth="4" />
            <line x1="148" y1="90" x2="162" y2="90" stroke="#78350F" strokeWidth="4" />
          </g>
        )}

        {/* Wizard Hat */}
        {hasWizardHat && (
          <g>
            <path d="M 35 72 Q 100 66 165 72 Q 100 80 35 72 Z" fill="#6B21A8" stroke="#4C1D95" strokeWidth="3" />
            <polygon points="100,10 65,70 135,70" fill="#7E22CE" stroke="#4C1D95" strokeWidth="3.5" />
            <polygon points="100,28 103,34 110,35 105,40 106,47 100,43 94,47 95,40 90,35 97,34" fill="#F59E0B" />
          </g>
        )}

        {/* Gold Crown */}
        {hasCrown && (
          <g filter="url(#glow)">
            <path
              d="M 60 70 L 65 38 L 82 55 L 100 30 L 118 55 L 135 38 L 140 70 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="65" cy="36" r="4.5" fill="#EF4444" />
            <circle cx="100" cy="28" r="5.5" fill="#3B82F6" />
            <circle cx="135" cy="36" r="4.5" fill="#10B981" />
            <rect x="62" y="64" width="76" height="8" rx="2" fill="#D97706" />
          </g>
        )}
      </svg>
    </div>
  );
}
