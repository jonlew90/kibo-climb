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
            <rect x="25" y="25" width="50" height="55" rx="12" fill="#B45309" stroke="#78350F" strokeWidth="4" />
            <rect x="33" y="45" width="34" height="25" rx="6" fill="#D97706" stroke="#78350F" strokeWidth="3" />
          </g>
        )}

        {itemId === 'lantern' && (
          <g>
            <rect x="35" y="30" width="30" height="42" rx="6" fill="#D97706" stroke="#78350F" strokeWidth="4" />
            <rect x="42" y="38" width="16" height="26" rx="4" fill="#FEF08A" />
            <path d="M 40 22 C 40 10 60 10 60 22" stroke="#78350F" strokeWidth="4" fill="none" />
          </g>
        )}

        {itemId === 'jetpack' && (
          <g>
            <rect x="25" y="25" width="22" height="50" rx="8" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3" />
            <rect x="53" y="25" width="22" height="50" rx="8" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="3" />
            <path d="M 30 75 L 42 75 L 36 85 Z" fill="#FF4500" />
            <path d="M 58 75 L 70 75 L 64 85 Z" fill="#FF4500" />
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
            <polygon points="50,50 25,35 25,65" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <polygon points="50,50 75,35 75,65" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <circle cx="50" cy="50" r="7" fill="#DC2626" />
          </g>
        )}

        {itemId === 'vest' && (
          <g>
            <path d="M 25 25 L 40 25 L 50 45 L 60 25 L 75 25 L 75 75 L 25 75 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="4" />
          </g>
        )}

        {itemId === 'summit_scarf' && (
          <g>
            <ellipse cx="50" cy="45" rx="32" ry="14" fill="#E11D48" stroke="#9F1239" strokeWidth="4" />
            <path d="M 60 50 L 72 80 L 50 80 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="3" />
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
            <path d="M 50 30 C 35 15, 15 35, 30 60 C 40 75, 60 75, 70 60 C 85 35, 65 15, 50 30 Z" fill="url(#thumbLavaGrad)" stroke="#9A3412" strokeWidth="3" />
            <circle cx="45" cy="38" r="3" fill="#FFFFFF" />
            <polygon points="50,42 62,45 50,48" fill="#FBBF24" />
          </g>
        )}

        {itemId === 'frost_dragon' && (
          <g>
            <path d="M 50 25 C 30 10, 10 30, 25 60 C 35 80, 65 80, 75 60 C 90 30, 70 10, 50 25 Z" fill="url(#thumbAuroraGrad)" stroke="#065F46" strokeWidth="3" />
            <circle cx="45" cy="35" r="3" fill="#FFFFFF" />
            <polygon points="50,38 60,40 50,44" fill="#A7F3D0" />
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
