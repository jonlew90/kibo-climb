import React from 'react';

export default function ItemThumbnail({ itemId, rarity = 'common', className = "w-12 h-12" }) {
  const containerClasses = {
    common: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-700',
    rare: 'bg-gradient-to-br from-sky-100 via-teal-100 to-teal-200 border-teal-300 text-teal-800',
    epic: 'bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-200 border-purple-300 text-purple-800',
    legendary: 'bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 border-amber-400 text-amber-950 shadow-md'
  };

  const currentClass = containerClasses[rarity] || containerClasses.common;

  return (
    <div className={`relative flex items-center justify-center rounded-2xl border-2 shadow-inner shrink-0 overflow-hidden p-1.5 ${currentClass} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xs overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="thumbNeonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="thumbGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="thumbMetalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <linearGradient id="thumbLavaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>

          <linearGradient id="thumbAuroraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* --- POWER-UPS --- */}
        {(itemId === 'double_sparks_potion' || itemId === 'double_coin_potion') && (
          <g>
            <rect x="42" y="16" width="16" height="12" rx="3" fill="#D97706" stroke="#B45309" strokeWidth="3" />
            <path d="M 38 28 L 62 28 L 78 72 A 10 10 0 0 1 68 85 L 32 85 A 10 10 0 0 1 22 72 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="4" />
            <path d="M 28 58 L 72 58 L 75 70 A 8 8 0 0 1 67 80 L 33 80 A 8 8 0 0 1 25 70 Z" fill="#FEF08A" opacity="0.9" />
            <text x="50" y="74" textAnchor="middle" fontSize="22" fontWeight="900" fill="#B45309">2x</text>
          </g>
        )}

        {itemId === 'hint_scroll' && (
          <g>
            <rect x="25" y="25" width="50" height="50" rx="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" />
            <path d="M 32 38 L 68 38 M 32 50 L 68 50 M 32 62 L 54 62" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            <circle cx="64" cy="62" r="7" fill="#F59E0B" />
            <text x="64" y="65" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">💡</text>
          </g>
        )}



        {itemId === 'kibo_shield' && (
          <g>
            <path d="M 50 15 C 70 15, 80 25, 80 45 C 80 70, 50 88, 50 88 C 50 88, 20 70, 20 45 C 20 25, 30 15, 50 15 Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="4" />
            <path d="M 50 22 C 65 22, 73 30, 73 45 C 73 64, 50 78, 50 78 C 50 78, 27 64, 27 45 C 27 30, 35 22, 50 22 Z" fill="#38BDF8" />
            <path d="M 42 48 L 48 54 L 60 40" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}

        {itemId === 'streak_saver' && (
          <g>
            <path d="M 50 15 Q 70 35 68 55 A 20 20 0 1 1 32 55 Q 30 35 50 15 Z" fill="#F97316" stroke="#EA580C" strokeWidth="4" />
            <path d="M 50 32 Q 62 48 60 60 A 12 12 0 1 1 40 60 Q 38 48 50 32 Z" fill="#FACC15" />
            <path d="M 50 48 Q 55 56 54 62 A 5 5 0 1 1 46 62 Q 45 56 50 48 Z" fill="#FFFFFF" />
          </g>
        )}

        {/* --- HEADWEAR --- */}
        {itemId === 'cap' && (
          <g>
            <path d="M 20 65 Q 50 35 80 65 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="4" />
            <path d="M 50 65 Q 80 60 92 68" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        )}

        {itemId === 'bandana' && (
          <g>
            <path d="M 15 50 Q 50 25 85 50 L 80 62 Q 50 40 20 62 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <polygon points="78,54 94,62 84,72" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          </g>
        )}

        {itemId === 'goggles' && (
          <g>
            <rect x="18" y="40" width="28" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" opacity="0.9" />
            <rect x="54" y="40" width="28" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" opacity="0.9" />
            <line x1="46" y1="50" x2="54" y2="50" stroke="#0284C7" strokeWidth="5" />
          </g>
        )}

        {itemId === 'headphones_neon' && (
          <g>
            <path d="M 20 55 A 30 30 0 0 1 80 55" stroke="url(#thumbNeonGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
            <rect x="14" y="45" width="16" height="30" rx="8" fill="url(#thumbNeonGrad)" stroke="#0369A1" strokeWidth="3" />
            <circle cx="22" cy="60" r="3" fill="#A5F3FC" />
            <rect x="70" y="45" width="16" height="30" rx="8" fill="url(#thumbNeonGrad)" stroke="#0369A1" strokeWidth="3" />
            <circle cx="78" cy="60" r="3" fill="#A5F3FC" />
          </g>
        )}

        {itemId === 'wizard_hat' && (
          <g>
            <path d="M 50 12 L 20 70 L 80 70 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
            <ellipse cx="50" cy="70" rx="40" ry="10" fill="#6D28D9" stroke="#5B21B6" strokeWidth="3" />
            <polygon points="50,28 53,35 60,37 55,42 56,49 50,45 44,49 45,42 40,37 47,35" fill="#FBBF24" />
          </g>
        )}

        {itemId === 'explorer_hat' && (
          <g>
            <path d="M 30 60 Q 50 25 70 60 Z" fill="#92400E" stroke="#451A03" strokeWidth="4" />
            <path d="M 28 56 Q 50 48 72 56" stroke="#F59E0B" strokeWidth="6" fill="none" />
            <ellipse cx="50" cy="62" rx="45" ry="10" fill="#78350F" stroke="#451A03" strokeWidth="4" />
          </g>
        )}

        {itemId === 'crown' && (
          <g>
            <path d="M 20 68 L 26 35 L 42 50 L 50 25 L 58 50 L 74 35 L 80 68 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />
            <circle cx="26" cy="33" r="4" fill="#EF4444" />
            <circle cx="50" cy="23" r="5" fill="#3B82F6" />
            <circle cx="74" cy="33" r="4" fill="#10B981" />
          </g>
        )}

        {/* --- GEAR --- */}
        {itemId === 'canteen' && (
          <g>
            <ellipse cx="50" cy="55" rx="22" ry="26" fill="#0284C7" stroke="#075985" strokeWidth="4" />
            <rect x="44" y="22" width="12" height="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          </g>
        )}

        {itemId === 'backpack' && (
          <g>
            <rect x="25" y="16" width="50" height="16" rx="6" fill="#15803D" stroke="#166534" strokeWidth="3" />
            <rect x="36" y="14" width="5" height="20" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <rect x="59" y="14" width="5" height="20" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <rect x="18" y="28" width="64" height="58" rx="16" fill="#B45309" stroke="#78350F" strokeWidth="4" />
            <rect x="28" y="52" width="44" height="26" rx="8" fill="#D97706" stroke="#78350F" strokeWidth="3" />
          </g>
        )}

        {itemId === 'lantern' && (
          <g>
            <circle cx="50" cy="52" r="32" fill="#FDE047" opacity="0.3" />
            <path d="M 36 26 C 36 12 64 12 64 26" stroke="#78350F" strokeWidth="4" fill="none" />
            <rect x="30" y="26" width="40" height="52" rx="10" fill="#D97706" stroke="#78350F" strokeWidth="4" />
            <rect x="38" y="34" width="24" height="36" rx="6" fill="#FEF08A" stroke="#B45309" strokeWidth="2.5" />
            <path d="M 50 60 Q 58 48 50 40 Q 42 48 50 60 Z" fill="#EF4444" />
            <path d="M 50 57 Q 55 49 50 43 Q 45 49 50 57 Z" fill="#FBBF24" />
          </g>
        )}

        {itemId === 'jetpack' && (
          <g>
            <rect x="18" y="18" width="28" height="58" rx="10" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
            <rect x="24" y="26" width="16" height="42" rx="5" fill="#E2E8F0" opacity="0.4" />
            <circle cx="32" cy="47" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <rect x="54" y="18" width="28" height="58" rx="10" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3.5" />
            <rect x="60" y="26" width="16" height="42" rx="5" fill="#E2E8F0" opacity="0.4" />
            <circle cx="68" cy="47" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <path d="M 23 76 Q 32 94 41 76 Z" fill="#FF4500" />
            <path d="M 59 76 Q 68 94 77 76 Z" fill="#FF4500" />
          </g>
        )}

        {itemId === 'golden_compass' && (
          <g>
            <circle cx="50" cy="50" r="30" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="4" />
            <polygon points="50,26 56,50 50,74 44,50" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <polygon points="50,50 74,50 50,56 26,50" fill="#0EA5E9" />
          </g>
        )}

        {/* --- OUTFITS --- */}
        {itemId === 'bowtie' && (
          <g>
            <polygon points="50,50 20,32 18,68" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <polygon points="50,50 80,32 82,68" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <polygon points="50,50 28,38 26,62" fill="#F87171" />
            <polygon points="50,50 72,38 74,62" fill="#F87171" />
            <rect x="42" y="42" width="16" height="16" rx="5" fill="#DC2626" stroke="#7F1D1D" strokeWidth="3" />
          </g>
        )}

        {itemId === 'vest' && (
          <g>
            <path d="M 22 24 C 22 24, 50 32, 78 24 L 78 78 C 78 78, 50 86, 22 78 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="4" />
            <path d="M 23 42 Q 50 50 77 42" stroke="#0284C7" strokeWidth="3.5" fill="none" />
            <path d="M 22 60 Q 50 68 78 60" stroke="#0284C7" strokeWidth="3.5" fill="none" />
            <line x1="50" y1="28" x2="50" y2="82" stroke="#38BDF8" strokeWidth="3.5" />
            <circle cx="36" cy="48" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'summit_scarf' && (
          <g>
            <path d="M 18 32 Q 50 52 82 32 L 78 48 Q 50 68 22 48 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="3.5" />
            <path d="M 20 28 Q 50 48 80 28 Q 50 40 20 28 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
            <path d="M 38 36 L 42 48 M 62 36 L 66 48" stroke="#FBBF24" strokeWidth="3" />
            <path d="M 60 48 L 74 88 L 52 88 L 46 50 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="3.5" />
            <rect x="50" y="74" width="22" height="6" fill="#FBBF24" />
            <line x1="54" y1="88" x2="54" y2="94" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="62" y1="88" x2="62" y2="94" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="70" y1="88" x2="70" y2="94" stroke="#F59E0B" strokeWidth="2.5" />
          </g>
        )}

        {itemId === 'royal_cape' && (
          <g>
            <path d="M 25 30 Q 50 20 75 30 L 85 85 Q 50 95 15 85 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
            <path d="M 25 30 L 75 30" stroke="#F59E0B" strokeWidth="6" />
          </g>
        )}

        {/* --- COMPANIONS & FX --- */}
        {itemId === 'sparkle_dust' && (
          <g>
            <circle cx="35" cy="35" r="5" fill="#FBBF24" />
            <circle cx="65" cy="30" r="7" fill="#38BDF8" />
            <circle cx="50" cy="65" r="6" fill="#F472B6" />
            <path d="M 30 65 L 35 60 L 40 65 L 35 70 Z" fill="#FBBF24" />
          </g>
        )}

        {itemId === 'starlight_aura' && (
          <g>
            <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#FDE047" strokeWidth="4" strokeDasharray="6 4" />
            <circle cx="20" cy="45" r="4" fill="#38BDF8" />
            <circle cx="80" cy="55" r="5" fill="#F472B6" />
          </g>
        )}

        {itemId === 'phoenix_pet' && (
          <g>
            {/* Phoenix Tail */}
            <path d="M 40 60 Q 22 80 32 94 Q 44 82 46 65 Z" fill="#EF4444" />
            {/* Phoenix Body */}
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbLavaGrad)" stroke="#9A3412" strokeWidth="3" />
            {/* Head & Crest */}
            <circle cx="50" cy="36" r="14" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
            <polygon points="50,22 55,8 48,18 42,10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            {/* Wing */}
            <path d="M 50 48 Q 82 36 75 70 Q 55 70 50 58 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            {/* Beak & Eye */}
            <polygon points="58,36 74,40 58,45" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <circle cx="46" cy="34" r="3.5" fill="#FFFFFF" />
            <circle cx="46" cy="34" r="2" fill="#451A03" />
          </g>
        )}

        {itemId === 'frost_dragon' && (
          <g>
            {/* Dragon Tail */}
            <path d="M 60 60 Q 78 80 68 94 Q 56 82 54 65 Z" fill="#0EA5E9" />
            {/* Dragon Body */}
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbAuroraGrad)" stroke="#065F46" strokeWidth="3" />
            {/* Head & Horns */}
            <circle cx="50" cy="36" r="14" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="42,26 34,8 47,20" fill="#A5F3FC" stroke="#0891B2" strokeWidth="2" />
            <polygon points="55,26 63,8 57,20" fill="#A5F3FC" stroke="#0891B2" strokeWidth="2" />
            {/* Crystal Wing */}
            <path d="M 50 48 Q 18 36 25 70 Q 45 70 50 58 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.5" />
            {/* Snout & Eye */}
            <ellipse cx="38" cy="40" rx="7" ry="4" fill="#E0F2FE" />
            <circle cx="52" cy="34" r="3.5" fill="#FFFFFF" />
            <circle cx="52" cy="34" r="2" fill="#0C4A6E" />
          </g>
        )}

        {itemId === 'golden_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="4" />
            <polygon points="50,22 53,30 60,32 55,37 56,45 50,41 44,45 45,37 40,32 47,30" fill="#FFFBEB" />
          </g>
        )}

        {/* --- BACKGROUNDS --- */}
        {itemId === 'bg_alpine' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#ECFDF5" stroke="#10B981" strokeWidth="3" />
            <polygon points="20,75 40,45 60,75" fill="#059669" />
            <polygon points="45,75 65,35 85,75" fill="#047857" />
          </g>
        )}

        {itemId === 'bg_sunset' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#thumbGoldGrad)" stroke="#D97706" strokeWidth="3" />
            <circle cx="50" cy="50" r="18" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}

        {itemId === 'bg_aurora' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#thumbAuroraGrad)" stroke="#047857" strokeWidth="3" />
            <path d="M 20 40 Q 50 20 80 40" stroke="#A7F3D0" strokeWidth="6" fill="none" opacity="0.8" />
          </g>
        )}

        {itemId === 'bg_volcano' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#thumbLavaGrad)" stroke="#7C2D12" strokeWidth="3" />
            <polygon points="25,85 50,45 75,85" fill="#7C2D12" />
            <circle cx="50" cy="45" r="6" fill="#FACC15" />
          </g>
        )}

        {itemId === 'bg_cosmic' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#1E1B4B" stroke="#4338CA" strokeWidth="3" />
            <circle cx="30" cy="30" r="3" fill="#FFFFFF" />
            <circle cx="70" cy="40" r="2" fill="#FDE047" />
            <circle cx="40" cy="70" r="2.5" fill="#67E8F9" />
          </g>
        )}

        {itemId === 'bg_crystal_cave' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#312E81" stroke="#4338CA" strokeWidth="3" />
            <polygon points="30,80 40,40 50,80" fill="#A855F7" />
            <polygon points="55,80 65,30 75,80" fill="#38BDF8" />
          </g>
        )}

        {itemId === 'bg_golden_palace' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="3" />
            <rect x="35" y="45" width="30" height="35" fill="#FFFBEB" stroke="#B45309" strokeWidth="3" />
            <polygon points="50,20 30,45 70,45" fill="#FEF08A" stroke="#B45309" strokeWidth="3" />
          </g>
        )}
      </svg>
    </div>
  );
}
