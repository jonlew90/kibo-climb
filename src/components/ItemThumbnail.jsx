import React from 'react';
import { WORKSHOP_ITEMS } from '../utils/itemsCatalog';

export default function ItemThumbnail({ itemId, rarity = 'common', className = "w-12 h-12", saleDiscount = 0 }) {
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
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        strokeLinecap="round"
        strokeLinejoin="round"
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

          <linearGradient id="thumbGalaxyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="50%" stopColor="#581C87" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="thumbPurpleGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="60%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="thumbSakuraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCE7F3" />
            <stop offset="50%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>

          <linearGradient id="thumbShamrockGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          <linearGradient id="thumbPatriotGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="thumbRainbowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="75%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="thumbEarthGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          {/* Jack-o'-Lantern Pumpkin Gradients */}
          <linearGradient id="thumbPumpkinOuterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id="thumbPumpkinMidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="thumbPumpkinCenterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="35%" stopColor="#FB923C" />
            <stop offset="80%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <radialGradient id="thumbPumpkinCarveGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>
          <linearGradient id="thumbPumpkinStemGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Summer Visor and Splash FX Gradients */}
          <linearGradient id="thumbVisorBrimGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#0284C7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="thumbWaveSplashGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Cyber Neon Gradients & Filter */}
          <linearGradient id="thumbCyberCyanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="60%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="thumbCyberPinkGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="60%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
          <filter id="thumbCyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Treasure Chest & Sparks Gradients */}
          <linearGradient id="thumbTreasureWoodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="thumbTreasureWoodDarkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#290E02" />
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

        {itemId === 'letter_spyglass' && (
          <g>
            {/* Handle */}
            <path d="M 62 62 L 80 80" stroke="#78350F" strokeWidth="9" strokeLinecap="round" />
            <path d="M 63 63 L 78 78" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
            {/* Glass Rim */}
            <circle cx="44" cy="44" r="24" fill="#E0F2FE" stroke="#F59E0B" strokeWidth="6" />
            <circle cx="44" cy="44" r="20" fill="#BAE6FD" opacity="0.6" />
            {/* Glare */}
            <path d="M 32 30 A 18 18 0 0 1 56 30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            {/* Symbol Inside */}
            <text x="44" y="52" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0369A1">?</text>
            <circle cx="58" cy="30" r="3" fill="#FDE047" />
          </g>
        )}

        {itemId === 'explorer_compass' && (
          <g>
            {/* Compass Outer Brass Ring & Loop */}
            <circle cx="50" cy="18" r="8" fill="none" stroke="#D97706" strokeWidth="4" />
            <circle cx="50" cy="54" r="34" fill="#FEF3C7" stroke="#B45309" strokeWidth="6" />
            <circle cx="50" cy="54" r="30" fill="#0F172A" stroke="#F59E0B" strokeWidth="2.5" />
            
            {/* Cardinal Tick Marks */}
            <line x1="50" y1="26" x2="50" y2="32" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="76" x2="50" y2="82" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="54" x2="28" y2="54" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
            <line x1="72" y1="54" x2="78" y2="54" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
            
            {/* Cardinal Letters */}
            <text x="50" y="38" textAnchor="middle" fontSize="9" fontWeight="900" fill="#EF4444">N</text>
            <text x="50" y="74" textAnchor="middle" fontSize="7" fontWeight="900" fill="#94A3B8">S</text>
            <text x="70" y="57" textAnchor="middle" fontSize="7" fontWeight="900" fill="#94A3B8">E</text>
            <text x="30" y="57" textAnchor="middle" fontSize="7" fontWeight="900" fill="#94A3B8">W</text>

            {/* Compass Needle */}
            <polygon points="50,26 44,54 50,50" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
            <polygon points="50,26 56,54 50,50" fill="#F87171" stroke="#B91C1C" strokeWidth="0.8" />
            <polygon points="50,82 44,54 50,58" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
            <polygon points="50,82 56,54 50,58" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />

            {/* Center Pivot Gem */}
            <circle cx="50" cy="54" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="2" fill="#FEF08A" />
          </g>
        )}

        {itemId === 'letter_pruner' && (
          <g>
            {/* Pruner handles */}
            <path d="M 32 72 Q 22 82 28 88 Q 38 88 44 76 L 50 56" fill="#047857" stroke="#065F46" strokeWidth="2.5" />
            <path d="M 68 72 Q 78 82 72 88 Q 62 88 56 76 L 50 56" fill="#047857" stroke="#065F46" strokeWidth="2.5" />
            {/* Blades */}
            <path d="M 50 56 L 36 24 C 36 24 44 26 50 48" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
            <path d="M 50 56 L 64 24 C 64 24 56 26 50 48" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
            {/* Center Pivot Bolt */}
            <circle cx="50" cy="54" r="4.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            {/* Trimmed letter snippets */}
            <text x="30" y="32" fontSize="12" fontWeight="900" fill="#EF4444" opacity="0.75">✕</text>
            <text x="70" y="32" fontSize="12" fontWeight="900" fill="#EF4444" opacity="0.75">✕</text>
            <text x="50" y="22" textAnchor="middle" fontSize="11" fontWeight="900" fill="#10B981">✂️</text>
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

        {itemId === 'ninja_headband' && (
          <g>
            <path d="M 22 52 Q 10 60 14 78 Q 20 72 26 58 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <path d="M 26 50 Q 8 68 18 84 Q 24 76 28 56 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" />
            <path d="M 16 52 Q 50 34 84 52 L 82 62 Q 50 44 18 62 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
            <rect x="36" y="42" width="28" height="15" rx="3" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="2" />
            <circle cx="39" cy="49.5" r="1" fill="#0F172A" />
            <circle cx="61" cy="49.5" r="1" fill="#0F172A" />
            <path d="M 44 53 L 50 45 L 56 53" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="47" y1="50" x2="53" y2="50" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'wizard_hat' && (
          <g>
            <path d="M 20 70 Q 50 10 80 70 C 65 73, 35 73, 20 70 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
            <path d="M 20 68 Q 23 42 26 35 Q 34 44 42 50 Q 46 32 50 25 Q 54 32 58 50 Q 66 44 74 35 Q 77 42 80 68 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
            <rect x="18" y="28" width="64" height="58" rx="16" fill="#0284C7" stroke="#0C4A6E" strokeWidth="4" />
            <rect x="28" y="52" width="44" height="26" rx="8" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="3" />
          </g>
        )}

        {itemId === 'grappling_hook' && (
          <g>
            <ellipse cx="50" cy="68" rx="22" ry="14" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
            <ellipse cx="50" cy="68" rx="14" ry="8" fill="#FDE68A" stroke="#78350F" strokeWidth="1.5" />
            <path d="M 34 64 Q 50 58 66 64 M 32 70 Q 50 64 68 70 M 36 74 Q 50 70 64 74" stroke="#92400E" strokeWidth="2" fill="none" />
            <circle cx="50" cy="48" r="7" fill="none" stroke="#64748B" strokeWidth="3" />
            <line x1="50" y1="42" x2="50" y2="18" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="50" cy="18" r="5" fill="none" stroke="#334155" strokeWidth="3" />
            <path d="M 50 38 Q 24 38 24 22 L 20 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
            <polygon points="24,20 20,27 28,26" fill="#64748B" />
            <path d="M 50 38 Q 76 38 76 22 L 80 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
            <polygon points="76,20 80,27 72,26" fill="#64748B" />
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

        {itemId === 'climbing_poles' && (
          <g>
            <g transform="rotate(-18 38 50)">
              <line x1="38" y1="15" x2="38" y2="85" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
              <line x1="38" y1="45" x2="38" y2="85" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
              <rect x="35" y="42" width="6" height="5" rx="1.5" fill="#0F172A" />
              <rect x="35" y="66" width="6" height="5" rx="1.5" fill="#0F172A" />
              <rect x="34" y="15" width="8" height="24" rx="3.5" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
              <path d="M 34 22 Q 22 28 28 36 Q 35 38 35 28" stroke="#F97316" strokeWidth="2.5" fill="none" />
              <ellipse cx="38" cy="78" rx="9" ry="3.5" fill="#334155" />
              <line x1="38" y1="82" x2="38" y2="88" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g transform="rotate(18 62 50)">
              <line x1="62" y1="15" x2="62" y2="85" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
              <line x1="62" y1="45" x2="62" y2="85" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
              <rect x="59" y="42" width="6" height="5" rx="1.5" fill="#0F172A" />
              <rect x="59" y="66" width="6" height="5" rx="1.5" fill="#0F172A" />
              <rect x="58" y="15" width="8" height="24" rx="3.5" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
              <path d="M 66 22 Q 78 28 72 36 Q 65 38 65 28" stroke="#F97316" strokeWidth="2.5" fill="none" />
              <ellipse cx="62" cy="78" rx="9" ry="3.5" fill="#334155" />
              <line x1="62" y1="82" x2="62" y2="88" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            </g>
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

        {itemId === 'astronaut_suit' && (
          <g>
            <circle cx="50" cy="44" r="28" fill="#F8FAFC" stroke="#64748B" strokeWidth="3.5" />
            <ellipse cx="50" cy="44" rx="20" ry="16" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="2.5" />
            <path d="M 38 34 Q 50 30 62 34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            <rect x="26" y="66" width="48" height="24" rx="8" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
            <rect x="34" y="73" width="12" height="8" rx="2" fill="#0284C7" />
            <polygon points="40,74 41,77 44,77 42,79 43,82 40,80 37,82 38,79 36,77 39,77" fill="#FDE047" />
            <circle cx="56" cy="77" r="2.5" fill="#22C55E" />
            <circle cx="63" cy="77" r="2.5" fill="#EF4444" />
          </g>
        )}

        {itemId === 'royal_cape' && (
          <g>
            <path d="M 25 30 Q 50 20 75 30 L 85 85 Q 50 95 15 85 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
            <path d="M 25 30 L 75 30" stroke="#F59E0B" strokeWidth="6" />
          </g>
        )}

        {/* --- PETS --- */}
        {itemId === 'snowy_owl' && (
          <g>
            <ellipse cx="50" cy="58" rx="20" ry="24" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="50" cy="38" r="16" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
            <polygon points="50,38 56,44 44,44" fill="#F59E0B" />
            <circle cx="43" cy="34" r="4" fill="#FBBF24" />
            <circle cx="57" cy="34" r="4" fill="#FBBF24" />
            <circle cx="43" cy="34" r="2" fill="#000000" />
            <circle cx="57" cy="34" r="2" fill="#000000" />
          </g>
        )}

        {itemId === 'alpine_fox' && (
          <g>
            <ellipse cx="56" cy="62" rx="22" ry="16" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
            <circle cx="38" cy="50" r="14" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
            <polygon points="30,40 25,22 36,34" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <polygon points="44,40 48,22 50,35" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <ellipse cx="32" cy="54" rx="5" ry="3" fill="#FFFFFF" />
            <circle cx="33" cy="48" r="2" fill="#000000" />
          </g>
        )}

        {itemId === 'mini_robot' && (
          <g>
            <ellipse cx="50" cy="84" rx="20" ry="5" fill="#38BDF8" opacity="0.35" />
            <line x1="50" y1="16" x2="50" y2="28" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="14" r="5" fill="#22D3EE" stroke="#0284C7" strokeWidth="2" />
            <rect x="22" y="28" width="56" height="46" rx="16" fill="url(#thumbMetalGrad)" stroke="#1E293B" strokeWidth="3.5" />
            <rect x="29" y="35" width="42" height="24" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <path d="M 37 48 L 41 43 L 45 48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 55 48 L 59 43 L 63 48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}

        {itemId === 'phoenix_pet' && (
          <g>
            <path d="M 40 60 Q 22 80 32 94 Q 44 82 46 65 Z" fill="#EF4444" />
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbLavaGrad)" stroke="#9A3412" strokeWidth="3" />
            <circle cx="50" cy="36" r="14" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
            <polygon points="50,22 55,8 48,18 42,10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <path d="M 50 48 Q 82 36 75 70 Q 55 70 50 58 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <polygon points="58,36 74,40 58,45" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <circle cx="46" cy="34" r="3.5" fill="#FFFFFF" />
            <circle cx="46" cy="34" r="2" fill="#451A03" />
          </g>
        )}

        {itemId === 'frost_dragon' && (
          <g>
            <path d="M 60 60 Q 78 80 68 94 Q 56 82 54 65 Z" fill="#0EA5E9" />
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbAuroraGrad)" stroke="#065F46" strokeWidth="3" />
            <circle cx="50" cy="36" r="14" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="42,26 34,8 47,20" fill="#A5F3FC" stroke="#0891B2" strokeWidth="2" />
            <polygon points="55,26 63,8 57,20" fill="#A5F3FC" stroke="#0891B2" strokeWidth="2" />
            <path d="M 50 48 Q 18 36 25 70 Q 45 70 50 58 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.5" />
          </g>
        )}

        {itemId === 'cosmic_griffin' && (
          <g>
            <path d="M 45 60 Q 72 40 68 85 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="3" />
            <circle cx="50" cy="36" r="14" fill="#FEF08A" stroke="#B45309" strokeWidth="2.5" />
            <polygon points="56,36 74,40 56,45" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          </g>
        )}

        {/* --- FX --- */}
        {itemId === 'sparkle_dust' && (
          <g>
            <ellipse cx="50" cy="25" rx="22" ry="7" fill="#CBD5E1" />
            <path d="M 35 35 L 32 48" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 35 L 47 52" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            <path d="M 65 35 L 62 46" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'fx_float_bounce' && (
          <g>
            <ellipse cx="50" cy="72" rx="30" ry="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
            <circle cx="32" cy="68" r="10" fill="#F8FAFC" />
            <circle cx="68" cy="68" r="10" fill="#F8FAFC" />
            <circle cx="50" cy="65" r="12" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'starlight_aura' && (
          <g>
            <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="#FDE047" strokeWidth="4" strokeDasharray="6 4" />
            <circle cx="20" cy="45" r="4" fill="#38BDF8" />
            <circle cx="80" cy="55" r="5" fill="#F472B6" />
          </g>
        )}

        {itemId === 'fx_spin_dance' && (
          <g>
            <path d="M 25 50 A 25 25 0 1 1 75 50" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="8 4" />
            <polygon points="75,50 68,40 68,60" fill="#F59E0B" />
            <circle cx="50" cy="50" r="14" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
          </g>
        )}

        {itemId === 'lightning_sparks' && (
          <g>
            <circle cx="35" cy="55" r="14" fill="#FDE047" opacity="0.65" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="65" cy="42" r="18" fill="#38BDF8" opacity="0.65" stroke="#0284C7" strokeWidth="1.5" />
            <circle cx="48" cy="70" r="10" fill="#F472B6" opacity="0.65" stroke="#DB2777" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'fx_hyper_speed' && (
          <g>
            <polygon points="50,25 20,85 40,85" fill="#F472B6" opacity="0.3" />
            <polygon points="50,25 60,85 80,85" fill="#38BDF8" opacity="0.3" />
            <circle cx="50" cy="25" r="12" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'rainbow_nebula' && (
          <g>
            <line x1="50" y1="50" x2="20" y2="20" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="50" y1="50" x2="80" y2="20" stroke="#3B82F6" strokeWidth="3" strokeDasharray="4 3" />
            <polygon points="50,35 53,44 62,44 55,50 58,58 50,53 42,58 45,50 38,44 47,44" fill="#FEF08A" />
          </g>
        )}

        {itemId === 'fx_orbit_moons' && (
          <g>
            <circle cx="50" cy="45" r="16" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <path d="M 28 65 Q 38 52 50 65 Q 62 78 72 65" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* --- SKINS --- */}
        {itemId === 'snow_white_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#E0F2FE" />
          </g>
        )}

        {itemId === 'midnight_shadow_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#334155" />
          </g>
        )}

        {itemId === 'emerald_jade_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#10B981" stroke="#047857" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#A7F3D0" />
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
          </g>
        )}

        {itemId === 'bg_concert_stage' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#180B2B" stroke="#A855F7" strokeWidth="3" />
            <polygon points="25,12 48,75 32,75 15,12" fill="#EC4899" opacity="0.5" />
            <polygon points="75,12 52,75 68,75 85,12" fill="#06B6D4" opacity="0.5" />
            <rect x="14" y="72" width="72" height="16" fill="#1E293B" />
          </g>
        )}

        {itemId === 'bg_cosmic' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#1E1B4B" stroke="#4338CA" strokeWidth="3" />
            <circle cx="30" cy="30" r="3" fill="#FFFFFF" />
            <circle cx="70" cy="40" r="2" fill="#FDE047" />
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

        {/* --- BORDERS --- */}
        {itemId === 'border_wood' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="none" stroke="url(#thumbWoodGrad)" strokeWidth="6" />
          </g>
        )}

        {itemId === 'border_stone' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="#64748B" strokeWidth="8" />
          </g>
        )}

        {itemId === 'border_silver' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="20" fill="none" stroke="#CBD5E1" strokeWidth="5" />
            <rect x="13" y="13" width="74" height="74" rx="18" fill="none" stroke="#F1F5F9" strokeWidth="1" opacity="0.8" />
          </g>
        )}

        {itemId === 'border_gold' && (
          <g>
            <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="url(#thumbGoldGrad)" strokeWidth="7" />
            <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.6" />
          </g>
        )}

        {itemId === 'border_diamond' && (
          <g>
            <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="#22D3EE" strokeWidth="9" />
            <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="5 7" opacity="0.9" />
          </g>
        )}

        {itemId === 'border_fire' && (
          <g>
            <rect x="6" y="6" width="88" height="88" rx="44" fill="none" stroke="#F97316" strokeWidth="12" opacity="0.9" />
          </g>
        )}

        {itemId === 'border_neon' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="#A855F7" strokeWidth="4" />
            <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="#D8B4FE" strokeWidth="1" opacity="0.8" />
            <rect x="7" y="7" width="86" height="86" rx="15" fill="none" stroke="#38BDF8" strokeWidth="2" />
          </g>
        )}

        {/* ================================================================= */}
        {/* RECURRING SEASONAL & HOLIDAY THUMBNAILS                           */}
        {/* ================================================================= */}

        {/* 1. SPRING ITEMS */}
        {itemId === 'spring_sakura_halo' && (
          <g>
            <ellipse cx="50" cy="50" rx="34" ry="16" stroke="url(#thumbSakuraGrad)" strokeWidth="4" strokeDasharray="6 4" fill="none" />
            <circle cx="24" cy="44" r="5" fill="#F472B6" />
            <circle cx="76" cy="56" r="5" fill="#F472B6" />
            <circle cx="50" cy="34" r="4" fill="#FBCFE8" />
            <polygon points="50,42 53,49 60,49 55,54 57,61 50,57 43,61 45,54 40,49 47,49" fill="#F472B6" />
          </g>
        )}

        {itemId === 'spring_bunny_ears' && (
          <g>
            {/* Left Ear */}
            <path d="M 30 70 C 15 20, 35 10, 42 40 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
            <path d="M 32 64 C 22 30, 34 22, 38 44 Z" fill="#FBCFE8" />
            {/* Right Ear (Curled) */}
            <path d="M 70 70 C 85 20, 65 10, 58 40 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
            <path d="M 68 64 C 78 30, 66 22, 62 44 Z" fill="#FBCFE8" />
            <ellipse cx="50" cy="74" rx="28" ry="6" fill="#F472B6" />
          </g>
        )}

        {itemId === 'spring_butterfly_pet' && (
          <g>
            <ellipse cx="50" cy="50" rx="4" ry="18" fill="#1E293B" />
            {/* Upper Wings */}
            <path d="M 48 45 C 15 15, 10 50, 46 54 Z" fill="url(#thumbLavaGrad)" stroke="#7C2D12" strokeWidth="2" />
            <path d="M 52 45 C 85 15, 90 50, 54 54 Z" fill="url(#thumbLavaGrad)" stroke="#7C2D12" strokeWidth="2" />
            {/* Lower Wings */}
            <path d="M 48 55 C 20 65, 25 85, 48 65 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 52 55 C 80 65, 75 85, 52 65 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            {/* Antennae */}
            <path d="M 48 34 Q 40 22 34 24 M 52 34 Q 60 22 66 24" stroke="#0F172A" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* 2. SUMMER ITEMS */}
        {itemId === 'summer_visor' && (
          <g>
            {/* Back strap */}
            <path d="M 20 44 Q 50 32 80 44 L 78 52 Q 50 40 22 52 Z" fill="#0369A1" stroke="#0C4A6E" strokeWidth="1.5" />
            <path d="M 22 45 Q 50 34 78 45" stroke="#38BDF8" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Visor Brim Base Depth Layer */}
            <path
              d="M 12 48 Q 50 38 88 48 Q 84 76 50 78 Q 16 76 12 48 Z"
              fill="url(#thumbVisorBrimGrad)"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Translucent tinted UV shield inner depth */}
            <path
              d="M 16 51 Q 50 42 84 51 Q 80 72 50 74 Q 20 72 16 51 Z"
              fill="#0284C7"
              opacity="0.35"
            />
            {/* High-gloss curved specular highlight reflection */}
            <path
              d="M 22 56 Q 50 66 78 56"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 30 62 Q 50 69 70 62"
              stroke="#E0F2FE"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Front Athletic Headband */}
            <path
              d="M 16 46 Q 50 34 84 46 L 82 56 Q 50 44 18 56 Z"
              fill="url(#thumbGoldGrad)"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Contrast Stitched Edges */}
            <path d="M 17 48 Q 50 36 83 48" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
            <path d="M 19 54 Q 50 42 81 54" stroke="#D97706" strokeWidth="1" fill="none" />

            {/* Side Hinges */}
            <circle cx="17" cy="51" r="3.5" fill="#64748B" stroke="#0F172A" strokeWidth="1.2" />
            <circle cx="17" cy="51" r="1.2" fill="#E2E8F0" />
            <circle cx="83" cy="51" r="3.5" fill="#64748B" stroke="#0F172A" strokeWidth="1.2" />
            <circle cx="83" cy="51" r="1.2" fill="#E2E8F0" />

            {/* Center Radiant 3D Sun Crest */}
            <circle cx="50" cy="45" r="5.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="50" cy="45" r="3.5" fill="#F59E0B" />
            <line x1="50" y1="36" x2="50" y2="38.5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="50" y1="51.5" x2="50" y2="54" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="41" y1="45" x2="43.5" y2="45" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="56.5" y1="45" x2="59" y2="45" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'summer_snorkel_mask' && (
          <g>
            <rect x="20" y="36" width="60" height="28" rx="10" fill="#0284C7" stroke="#0C4A6E" strokeWidth="3" />
            <rect x="26" y="42" width="48" height="16" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" opacity="0.9" />
            {/* Snorkel Tube */}
            <path d="M 72 48 L 84 48 L 84 15 Q 84 10 78 10" stroke="#FACC15" strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="70" y="8" width="10" height="4" rx="1" fill="#EF4444" />
          </g>
        )}

        {itemId === 'summer_ice_cream_cone' && (
          <g>
            <polygon points="50,88 34,48 66,48" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
            <line x1="38" y1="58" x2="62" y2="58" stroke="#D97706" strokeWidth="2" />
            <line x1="44" y1="72" x2="56" y2="72" stroke="#D97706" strokeWidth="2" />
            <circle cx="50" cy="46" r="14" fill="#34D399" stroke="#059669" strokeWidth="2.5" />
            <circle cx="50" cy="30" r="13" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
            <circle cx="50" cy="16" r="5" fill="#DC2626" />
          </g>
        )}

        {(itemId === 'summer_splash_aura' || itemId === 'summer_sunshine_aura') && (
          <g>
            {/* Ambient Water Pool Base */}
            <ellipse cx="50" cy="76" rx="38" ry="14" fill="#38BDF8" opacity="0.35" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="5 3" />
            <ellipse cx="50" cy="76" rx="26" ry="8" fill="#67E8F9" opacity="0.45" />

            {/* Dynamic Swirling Ocean Waves */}
            <path
              d="M 14 74 C 12 44, 28 20, 56 18 C 76 16, 86 30, 78 40 C 70 50, 56 42, 54 34 C 42 42, 32 58, 34 76 Z"
              fill="url(#thumbWaveSplashGrad)"
              stroke="#0369A1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Rising Counter Wave on Right */}
            <path
              d="M 86 74 C 88 52, 78 36, 64 36 C 68 44, 66 52, 60 56 C 72 60, 76 68, 76 76 Z"
              fill="url(#thumbWaveSplashGrad)"
              stroke="#0284C7"
              strokeWidth="1.5"
              opacity="0.85"
            />
            {/* Frothing White Seafoam Wave Crest */}
            <path
              d="M 50 18 C 66 16, 82 24, 80 36 C 76 42, 68 40, 60 34 C 54 28, 48 24, 50 18 Z"
              fill="#F0F9FF"
              stroke="#BAE6FD"
              strokeWidth="1.5"
            />
            {/* Wave Curl Specular Highlights */}
            <path d="M 24 64 C 26 48, 38 32, 54 22" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M 32 72 C 34 60, 44 48, 56 42" stroke="#E0F2FE" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />

            {/* Splashing Droplets with Specular Highlights */}
            <circle cx="82" cy="18" r="4.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
            <circle cx="80.5" cy="16.5" r="1.5" fill="#FFFFFF" />

            <circle cx="22" cy="30" r="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
            <circle cx="21" cy="29" r="1" fill="#FFFFFF" />

            <circle cx="88" cy="38" r="3" fill="#67E8F9" stroke="#0284C7" strokeWidth="1" />
            <circle cx="12" cy="50" r="2.5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1" />
            <circle cx="68" cy="62" r="2.5" fill="#BAE6FD" />

            {/* Radiant Sparkle Stars */}
            <polygon points="46,12 47.5,16 52,17.5 47.5,19 46,23 44.5,19 40,17.5 44.5,16" fill="#FFFFFF" opacity="0.95" />
            <polygon points="76,46 77,49 80,50 77,51 76,54 75,51 72,50 75,49" fill="#FFFFFF" opacity="0.85" />
          </g>
        )}

        {/* 3. AUTUMN ITEMS */}
        {itemId === 'autumn_leaf_crown' && (
          <g>
            <ellipse cx="50" cy="52" rx="34" ry="14" fill="none" stroke="#78350F" strokeWidth="3" />
            <polygon points="50,22 42,34 50,38 58,34" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <polygon points="30,32 24,44 32,46 38,40" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="70,32 62,40 68,46 76,44" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
            <circle cx="50" cy="52" r="3" fill="#FBBF24" />
          </g>
        )}

        {itemId === 'autumn_cozy_sweater' && (
          <g>
            <path d="M 24 28 C 24 28, 50 36, 76 28 L 76 78 C 76 78, 50 86, 24 78 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="3.5" />
            <line x1="38" y1="28" x2="38" y2="82" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="62" y1="28" x2="62" y2="82" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="24" y1="52" x2="76" y2="52" stroke="#F59E0B" strokeWidth="2.5" />
          </g>
        )}

        {itemId === 'autumn_squirrel_pet' && (
          <g>
            {/* Bushy Tail */}
            <path d="M 45 75 C 15 70, 10 30, 35 20 C 45 15, 55 35, 45 55 Z" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            {/* Body */}
            <ellipse cx="60" cy="62" rx="16" ry="18" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="62" cy="42" r="12" fill="#D97706" stroke="#78350F" strokeWidth="2" />
            <circle cx="66" cy="40" r="2.5" fill="#000000" />
            {/* Acorn */}
            <ellipse cx="52" cy="62" rx="7" ry="9" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
            <rect x="47" y="52" width="10" height="5" rx="2" fill="#451A03" />
          </g>
        )}

        {/* 4. WINTER ITEMS */}
        {itemId === 'winter_beanie' && (
          <g>
            <path d="M 22 64 C 18 36, 32 20, 50 20 C 68 20, 82 36, 78 64 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
            <rect x="18" y="58" width="64" height="14" rx="5" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2.5" />
            <circle cx="50" cy="18" r="9" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          </g>
        )}

        {itemId === 'winter_snowman_pet' && (
          <g>
            <circle cx="50" cy="68" r="20" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="50" cy="42" r="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
            {/* Coal eyes */}
            <circle cx="45" cy="38" r="2" fill="#0F172A" />
            <circle cx="55" cy="38" r="2" fill="#0F172A" />
            {/* Carrot */}
            <polygon points="50,42 66,45 50,46" fill="#EA580C" />
            {/* Top Hat */}
            <rect x="36" y="26" width="28" height="6" fill="#1E293B" />
            <rect x="42" y="14" width="16" height="14" fill="#1E293B" />
            <rect x="42" y="24" width="16" height="3" fill="#EF4444" />
          </g>
        )}

        {itemId === 'winter_ice_skates' && (
          <g>
            {/* Boot */}
            <path d="M 32 30 L 48 30 L 48 58 L 68 64 L 68 74 L 28 74 L 28 40 Z" fill="#F8FAFC" stroke="#475569" strokeWidth="3" />
            <path d="M 34 38 L 44 38 M 34 46 L 44 46 M 34 54 L 46 54" stroke="#DC2626" strokeWidth="2" />
            {/* Blade */}
            <line x1="20" y1="84" x2="76" y2="84" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <line x1="32" y1="74" x2="32" y2="84" stroke="#64748B" strokeWidth="3" />
            <line x1="64" y1="74" x2="64" y2="84" stroke="#64748B" strokeWidth="3" />
            <path d="M 76 84 Q 82 82 82 76" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 5. NEW YEAR CELEBRATION */}
        {itemId === 'new_year_top_hat' && (
          <g>
            <ellipse cx="50" cy="74" rx="42" ry="10" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
            <path d="M 28 72 L 32 25 L 68 25 L 72 72 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
            <rect x="30" y="60" width="40" height="12" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="50,66 52,62 56,62 53,68 55,72 50,69 45,72 47,68 44,62 48,62" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'new_year_sparkler' && (
          <g>
            <line x1="28" y1="78" x2="62" y2="44" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
            {/* Sparkler Head */}
            <circle cx="68" cy="38" r="8" fill="#FEF08A" opacity="0.8" />
            <line x1="68" y1="20" x2="68" y2="56" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 2" />
            <line x1="50" y1="38" x2="86" y2="38" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 2" />
            <line x1="55" y1="25" x2="81" y2="51" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="81" y1="25" x2="55" y2="51" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        )}

        {/* 6. MLK DAY OF SERVICE */}
        {itemId === 'mlk_peace_dove_pet' && (
          <g>
            <path d="M 35 60 C 20 40, 45 20, 65 35 C 75 42, 85 45, 80 60 C 65 65, 50 75, 35 60 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
            <path d="M 45 42 Q 25 15 55 25 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            <polygon points="78,42 90,44 78,48" fill="#F59E0B" />
            {/* Olive branch */}
            <path d="M 76 48 Q 65 60 55 56" stroke="#16A34A" strokeWidth="2" fill="none" />
            <circle cx="68" cy="52" r="3" fill="#22C55E" />
            <circle cx="58" cy="57" r="3" fill="#22C55E" />
          </g>
        )}

        {itemId === 'mlk_dream_sash' && (
          <g>
            <path d="M 20 20 L 36 16 L 80 80 L 64 84 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="28" y1="18" x2="72" y2="82" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="50" cy="50" r="7" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
            <text x="50" y="53" textAnchor="middle" fontSize="6" fontWeight="900" fill="#78350F">★</text>
          </g>
        )}

        {/* 7. VALENTINE'S DAY */}
        {itemId === 'valentines_cupid_wings' && (
          <g>
            {/* Left Wing */}
            <path d="M 48 55 C 10 25, 10 75, 48 70 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
            <path d="M 46 58 C 22 36, 22 70, 46 66 Z" fill="#FCE7F3" />
            {/* Right Wing */}
            <path d="M 52 55 C 90 25, 90 75, 52 70 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
            <path d="M 54 58 C 78 36, 78 70, 54 66 Z" fill="#FCE7F3" />
            <path d="M 50 62 Q 44 48 38 52 A 4 4 0 0 1 50 60 A 4 4 0 0 1 62 52 Q 56 48 50 62 Z" fill="#EF4444" />
          </g>
        )}

        {itemId === 'valentines_heart_shades' && (
          <g>
            {/* Left Heart Lens */}
            <path d="M 34 60 L 22 46 A 8 8 0 0 1 34 36 A 8 8 0 0 1 46 46 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="3" />
            {/* Right Heart Lens */}
            <path d="M 66 60 L 54 46 A 8 8 0 0 1 66 36 A 8 8 0 0 1 78 46 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="3" />
            <line x1="44" y1="46" x2="56" y2="46" stroke="#DB2777" strokeWidth="3" />
          </g>
        )}

        {itemId === 'valentines_love_sparks' && (
          <g>
            <path d="M 50 45 L 36 28 A 9 9 0 0 1 50 16 A 9 9 0 0 1 64 28 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
            <path d="M 26 68 L 18 58 A 5 5 0 0 1 26 50 A 5 5 0 0 1 34 58 Z" fill="#F472B6" />
            <path d="M 74 68 L 66 58 A 5 5 0 0 1 74 50 A 5 5 0 0 1 82 58 Z" fill="#F472B6" />
          </g>
        )}

        {/* 8. PRESIDENTS' DAY */}
        {itemId === 'presidents_tricorne' && (
          <g>
            <polygon points="50,22 18,65 82,65" fill="#1E293B" stroke="#0F172A" strokeWidth="3.5" />
            <ellipse cx="50" cy="65" rx="34" ry="8" fill="#334155" />
            <circle cx="50" cy="50" r="7" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="3" fill="#DC2626" />
          </g>
        )}

        {itemId === 'presidents_eagle_shield' && (
          <g>
            <circle cx="50" cy="50" r="34" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="3.5" />
            <circle cx="50" cy="50" r="26" fill="#1E3A8A" stroke="#78350F" strokeWidth="2" />
            <path d="M 50 32 L 56 44 L 68 44 L 58 52 L 62 64 L 50 56 L 38 64 L 42 52 L 32 44 L 44 44 Z" fill="#FACC15" />
          </g>
        )}

        {/* 9. ST. PATRICK'S DAY */}
        {itemId === 'st_patricks_leprechaun_hat' && (
          <g>
            <ellipse cx="50" cy="74" rx="40" ry="10" fill="#15803D" stroke="#14532D" strokeWidth="2.5" />
            <path d="M 28 72 L 30 26 L 70 26 L 72 72 Z" fill="url(#thumbShamrockGrad)" stroke="#14532D" strokeWidth="3" />
            <rect x="29" y="58" width="42" height="12" fill="#0F172A" stroke="#020617" strokeWidth="1" />
            <rect x="42" y="55" width="16" height="18" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="2" />
            <rect x="46" y="59" width="8" height="10" fill="#0F172A" />
          </g>
        )}

        {itemId === 'st_patricks_pot_of_gold' && (
          <g>
            <ellipse cx="50" cy="42" rx="26" ry="10" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="2" />
            <path d="M 24 42 C 16 65, 24 86, 50 86 C 76 86, 84 65, 76 42 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3.5" />
            <circle cx="42" cy="38" r="4" fill="#FACC15" />
            <circle cx="58" cy="38" r="4" fill="#FACC15" />
            <circle cx="50" cy="34" r="4" fill="#FDE047" />
          </g>
        )}

        {itemId === 'st_patricks_rainbow_trail' && (
          <g>
            <path d="M 14 78 A 38 38 0 0 1 86 78" stroke="#EF4444" strokeWidth="4" fill="none" />
            <path d="M 18 78 A 34 34 0 0 1 82 78" stroke="#F59E0B" strokeWidth="4" fill="none" />
            <path d="M 22 78 A 30 30 0 0 1 78 78" stroke="#10B981" strokeWidth="4" fill="none" />
            <path d="M 26 78 A 26 26 0 0 1 74 78" stroke="#3B82F6" strokeWidth="4" fill="none" />
            <path d="M 30 78 A 22 22 0 0 1 70 78" stroke="#8B5CF6" strokeWidth="4" fill="none" />
            <circle cx="16" cy="78" r="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="84" cy="78" r="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}

        {/* 10. EARTH DAY */}
        {itemId === 'earth_day_sprout_cap' && (
          <g>
            <path d="M 24 68 Q 50 56 76 68" stroke="#78350F" strokeWidth="4" fill="none" />
            <path d="M 50 62 L 50 36" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
            <path d="M 50 36 C 30 30, 30 15, 50 30 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
            <path d="M 50 36 C 70 30, 70 15, 50 30 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          </g>
        )}

        {itemId === 'earth_day_globe_balloon' && (
          <g>
            <line x1="50" y1="72" x2="50" y2="88" stroke="#64748B" strokeWidth="2" />
            <circle cx="50" cy="44" r="28" fill="url(#thumbEarthGrad)" stroke="#0C4A6E" strokeWidth="3" />
            <path d="M 36 34 Q 48 30 46 44 Q 42 54 34 50 Z" fill="#22C55E" opacity="0.9" />
            <path d="M 54 36 Q 66 40 64 56 Q 52 58 56 46 Z" fill="#22C55E" opacity="0.9" />
          </g>
        )}

        {/* 11. MEMORIAL DAY */}
        {itemId === 'memorial_poppy_wreath' && (
          <g>
            <circle cx="50" cy="50" r="14" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            <circle cx="36" cy="44" r="12" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="64" cy="44" r="12" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="40" cy="62" r="12" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="60" cy="62" r="12" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="7" fill="#0F172A" />
          </g>
        )}

        {itemId === 'memorial_courage_cape' && (
          <g>
            <path d="M 25 25 L 75 25 L 85 85 L 15 85 Z" fill="#1E3A8A" stroke="#172554" strokeWidth="3" />
            <line x1="38" y1="25" x2="32" y2="85" stroke="#DC2626" strokeWidth="6" />
            <line x1="62" y1="25" x2="68" y2="85" stroke="#DC2626" strokeWidth="6" />
            <circle cx="50" cy="40" r="6" fill="#FACC15" />
          </g>
        )}

        {/* 12. JUNETEENTH */}
        {itemId === 'juneteenth_liberty_torch' && (
          <g>
            <polygon points="44,52 56,52 52,88 48,88" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
            <ellipse cx="50" cy="52" rx="10" ry="4" fill="#B45309" />
            {/* Blazing Flame in Juneteenth Red, Yellow, Green */}
            <path d="M 50 14 Q 68 32 58 48 Q 50 54 42 48 Q 32 32 50 14 Z" fill="#EF4444" />
            <path d="M 50 24 Q 60 36 54 48 Q 50 52 46 48 Q 40 36 50 24 Z" fill="#FACC15" />
            <path d="M 50 34 Q 55 42 52 48 Q 50 50 48 48 Q 45 42 50 34 Z" fill="#22C55E" />
          </g>
        )}

        {itemId === 'juneteenth_unity_beanie' && (
          <g>
            <path d="M 22 64 C 18 36, 32 20, 50 20 C 68 20, 82 36, 78 64 Z" fill="#15803D" stroke="#14532D" strokeWidth="3" />
            <rect x="18" y="58" width="64" height="14" rx="4" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            <line x1="18" y1="50" x2="82" y2="50" stroke="#FACC15" strokeWidth="4" />
            <polygon points="50,30 52,36 58,36 53,40 55,46 50,42 45,46 47,40 42,36 48,36" fill="#FACC15" />
          </g>
        )}

        {/* 13. 4TH OF JULY */}
        {itemId === 'july4_uncle_sam_hat' && (
          <g>
            <ellipse cx="50" cy="74" rx="42" ry="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
            <path d="M 28 72 L 32 22 L 68 22 L 72 72 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="3" />
            <line x1="40" y1="22" x2="38" y2="60" stroke="#DC2626" strokeWidth="5" />
            <line x1="60" y1="22" x2="62" y2="60" stroke="#DC2626" strokeWidth="5" />
            <rect x="29" y="58" width="42" height="14" fill="#1E3A8A" stroke="#172554" strokeWidth="1.5" />
            <circle cx="36" cy="65" r="2" fill="#FFFFFF" />
            <circle cx="50" cy="65" r="2" fill="#FFFFFF" />
            <circle cx="64" cy="65" r="2" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'july4_liberty_fireworks' && (
          <g>
            <line x1="50" y1="50" x2="20" y2="20" stroke="#EF4444" strokeWidth="4" strokeDasharray="5 3" />
            <line x1="50" y1="50" x2="80" y2="20" stroke="#3B82F6" strokeWidth="4" strokeDasharray="5 3" />
            <line x1="50" y1="50" x2="20" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="5 3" />
            <line x1="50" y1="50" x2="80" y2="80" stroke="#EF4444" strokeWidth="4" strokeDasharray="5 3" />
            <circle cx="50" cy="50" r="10" fill="#FACC15" />
          </g>
        )}

        {itemId === 'july4_sparkler_pinwheel' && (
          <g>
            <line x1="50" y1="50" x2="50" y2="88" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <polygon points="50,50 30,25 50,35" fill="#EF4444" />
            <polygon points="50,50 75,30 65,50" fill="#3B82F6" />
            <polygon points="50,50 70,75 50,65" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <polygon points="50,50 25,70 35,50" fill="#EF4444" />
            <circle cx="50" cy="50" r="5" fill="#FACC15" />
          </g>
        )}

        {/* 14. LABOR DAY */}
        {itemId === 'laborday_builder_hardhat' && (
          <g>
            <path d="M 20 62 C 18 34, 34 22, 50 22 C 66 22, 82 34, 80 62 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="3.5" />
            <ellipse cx="50" cy="62" rx="42" ry="8" fill="#EAB308" stroke="#CA8A04" strokeWidth="2.5" />
            <rect x="42" y="32" width="16" height="10" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <circle cx="50" cy="37" r="3" fill="#38BDF8" />
          </g>
        )}

        {itemId === 'laborday_pioneer_toolbelt' && (
          <g>
            <rect x="16" y="44" width="68" height="14" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="3" />
            <rect x="42" y="40" width="16" height="22" rx="3" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="2" />
            {/* Mini hammer & wrench */}
            <line x1="28" y1="54" x2="28" y2="78" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <rect x="22" y="74" width="12" height="6" fill="#475569" />
            <line x1="72" y1="54" x2="72" y2="78" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* 15. HALLOWEEN */}
        {itemId === 'pumpkin_hat' && (
          <g id="thumb-pumpkin-hat">
            <path d="M 50 20 C 56 12, 66 8, 72 12 C 76 16, 71 22, 66 20" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <ellipse cx="28" cy="55" rx="16" ry="24" fill="url(#thumbPumpkinOuterGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="72" cy="55" rx="16" ry="24" fill="url(#thumbPumpkinOuterGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="38" cy="56" rx="17" ry="26" fill="url(#thumbPumpkinMidGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="62" cy="56" rx="17" ry="26" fill="url(#thumbPumpkinMidGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="50" cy="57" rx="18" ry="28" fill="url(#thumbPumpkinCenterGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <path d="M 46 32 C 44 21, 52 16, 56 11 L 60 12.5 C 57 18, 53 23, 53 32 Z" fill="url(#thumbPumpkinStemGrad)" stroke="#14532D" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="32,50 42,47 39,55" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" />
            <polygon points="68,50 58,47 61,55" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" />
            <polygon points="47,56 53,56 50,51" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" />
            <path d="M 30 63 Q 50 81 70 63 L 67 66 L 63 64 L 60 68 L 50 65 L 40 68 L 37 64 L 33 66 Z" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" />
          </g>
        )}

        {itemId === 'halloween_vampire_cape' && (
          <g>
            <path d="M 25 32 Q 50 18 75 32 L 85 86 Q 50 96 15 86 Z" fill="#0F172A" stroke="#020617" strokeWidth="3" />
            <path d="M 28 34 Q 50 24 72 34 L 80 84 Q 50 92 20 84 Z" fill="#991B1B" />
            {/* High collar */}
            <polygon points="25,32 15,12 35,28" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
            <polygon points="75,32 85,12 65,28" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
          </g>
        )}

        {itemId === 'halloween_ghost_pet' && (
          <g>
            <path d="M 30 45 C 30 20, 70 20, 70 45 C 70 70, 78 80, 68 85 C 60 82, 55 86, 50 82 C 45 86, 40 82, 32 85 C 22 80, 30 70, 30 45 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
            <ellipse cx="44" cy="42" rx="3.5" ry="5" fill="#0F172A" />
            <ellipse cx="56" cy="42" rx="3.5" ry="5" fill="#0F172A" />
            <ellipse cx="50" cy="54" rx="4" ry="6" fill="#0F172A" />
            {/* Waving Little Arm */}
            <path d="M 70 48 Q 84 42 80 34" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {itemId === 'halloween_witch_broom' && (
          <g>
            <line x1="20" y1="20" x2="68" y2="68" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
            {/* Twig bristles */}
            <polygon points="68,68 88,72 82,88" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <rect x="64" y="64" width="8" height="8" rx="2" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
          </g>
        )}

        {/* 16. VETERANS DAY */}
        {itemId === 'veterans_valor_beret' && (
          <g>
            <path d="M 22 56 C 20 38, 40 25, 68 28 C 84 30, 86 48, 76 56 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="3" />
            <ellipse cx="48" cy="56" rx="30" ry="7" fill="#0F172A" />
            <polygon points="40,36 42,42 48,42 43,46 45,52 40,48 35,52 37,46 32,42 38,42" fill="#FACC15" />
          </g>
        )}

        {itemId === 'veterans_medal_ribbon' && (
          <g>
            <polygon points="36,20 64,20 58,50 42,50" fill="#1E3A8A" stroke="#172554" strokeWidth="2.5" />
            <line x1="50" y1="20" x2="50" y2="50" stroke="#DC2626" strokeWidth="5" />
            <circle cx="50" cy="64" r="16" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="2.5" />
            <polygon points="50,54 53,61 60,61 54,65 57,72 50,68 43,72 46,65 40,61 47,61" fill="#FFFFFF" />
          </g>
        )}

        {/* 17. THANKSGIVING */}
        {itemId === 'thanksgiving_turkey_hat' && (
          <g>
            {/* Fan Feathers */}
            <ellipse cx="50" cy="30" rx="8" ry="20" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <ellipse cx="36" cy="34" rx="8" ry="18" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" transform="rotate(-20 36 34)" />
            <ellipse cx="64" cy="34" rx="8" ry="18" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" transform="rotate(20 64 34)" />
            <ellipse cx="24" cy="42" rx="8" ry="16" fill="#15803D" stroke="#166534" strokeWidth="1.5" transform="rotate(-40 24 42)" />
            <ellipse cx="76" cy="42" rx="8" ry="16" fill="#15803D" stroke="#166534" strokeWidth="1.5" transform="rotate(40 76 42)" />
            {/* Turkey Body / Beanie */}
            <circle cx="50" cy="62" r="18" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
            <polygon points="50,58 56,64 44,64" fill="#FACC15" />
            <circle cx="44" cy="56" r="2" fill="#FFFFFF" />
            <circle cx="56" cy="56" r="2" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'thanksgiving_cornucopia' && (
          <g>
            <path d="M 25 75 C 10 65, 30 35, 65 35 C 75 35, 85 45, 80 65 C 75 80, 50 82, 25 75 Z" fill="#92400E" stroke="#451A03" strokeWidth="3" />
            <ellipse cx="74" cy="52" rx="10" ry="16" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            <circle cx="70" cy="52" r="7" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <circle cx="78" cy="46" r="5" fill="#EF4444" />
            <circle cx="76" cy="58" r="5" fill="#FACC15" />
          </g>
        )}

        {/* 18. WINTER HOLIDAYS & CHRISTMAS */}
        {itemId === 'holiday_santa_hat' && (
          <g>
            <path d="M 25 64 Q 50 20 80 40 L 76 64 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
            <rect x="20" y="60" width="60" height="14" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
            <circle cx="82" cy="42" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </g>
        )}

        {itemId === 'holiday_reindeer_antlers' && (
          <g>
            <path d="M 24 64 Q 50 56 76 64" stroke="#78350F" strokeWidth="4" fill="none" />
            {/* Left Antler */}
            <path d="M 34 60 L 30 25 M 30 38 L 18 28 M 30 48 L 20 44" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="18" cy="28" r="3" fill="#FACC15" />
            {/* Right Antler */}
            <path d="M 66 60 L 70 25 M 70 38 L 82 28 M 70 48 L 80 44" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="82" cy="28" r="3" fill="#FACC15" />
          </g>
        )}

        {itemId === 'holiday_gingerbread_pet' && (
          <g>
            <ellipse cx="50" cy="62" rx="18" ry="20" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="50" cy="36" r="14" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            {/* Icing smile & eyes */}
            <circle cx="45" cy="34" r="2" fill="#FFFFFF" />
            <circle cx="55" cy="34" r="2" fill="#FFFFFF" />
            <path d="M 45 42 Q 50 46 55 42" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            {/* Gumdrop buttons */}
            <circle cx="50" cy="54" r="3" fill="#EF4444" />
            <circle cx="50" cy="64" r="3" fill="#22C55E" />
          </g>
        )}

        {itemId === 'holiday_candy_cane_staff' && (
          <g>
            <path d="M 38 85 L 38 35 A 16 16 0 0 1 70 35 L 70 45" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M 38 85 L 38 35 A 16 16 0 0 1 70 35 L 70 45" stroke="#DC2626" strokeWidth="12" strokeLinecap="round" strokeDasharray="8 8" fill="none" />
            <circle cx="50" cy="50" r="5" fill="#15803D" />
            <circle cx="46" cy="48" r="3" fill="#EF4444" />
            <circle cx="54" cy="48" r="3" fill="#EF4444" />
          </g>
        )}

        {itemId === 'holiday_twinkle_lights' && (
          <g>
            <path d="M 18 35 Q 50 55 82 35 M 22 65 Q 50 85 78 65" stroke="#1E293B" strokeWidth="2.5" fill="none" />
            <circle cx="30" cy="42" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
            <circle cx="50" cy="47" r="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
            <circle cx="70" cy="42" r="5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
            <circle cx="34" cy="71" r="5" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
            <circle cx="64" cy="72" r="5" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
          </g>
        )}

        {itemId === 'holiday_wreath_border' && (
          <g>
            <rect x="8" y="8" width="84" height="84" rx="42" fill="none" stroke="#15803D" strokeWidth="8" />
            <rect x="8" y="8" width="84" height="84" rx="42" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="50" cy="8" r="6" fill="#EF4444" />
            <circle cx="8" cy="50" r="6" fill="#EF4444" />
            <circle cx="92" cy="50" r="6" fill="#EF4444" />
            <circle cx="50" cy="92" r="6" fill="#EF4444" />
          </g>
        )}

        {/* --- PROMO EXCLUSIVES --- */}
        {itemId === 'golden_ticket' && (
          <g>
            <rect x="8" y="24" width="84" height="52" rx="8" fill="#FEF08A" opacity="0.35" />
            <rect x="10" y="26" width="80" height="48" rx="6" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="3" />
            <circle cx="10" cy="50" r="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
            <circle cx="90" cy="50" r="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
            <rect x="18" y="32" width="64" height="36" rx="4" fill="#FDE047" stroke="#92400E" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350F" letterSpacing="1">GOLDEN</text>
            <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350F" letterSpacing="2">TICKET</text>
          </g>
        )}

        {itemId === 'cyber_shades' && (
          <g>
            {/* Cyberpunk Neon Glow Aura Behind */}
            <polygon points="10,40 90,40 84,66 58,72 50,62 42,72 16,66" fill="#06B6D4" opacity="0.25" filter="url(#thumbCyberGlow)" />

            {/* Outer Matte Black Cyber Frame */}
            <polygon
              points="10,38 90,38 84,66 58,72 50,62 42,72 16,66"
              fill="#0F172A"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinejoin="bevel"
            />

            {/* Top Neon Brow Accent Bar */}
            <path d="M 12 39 L 88 39" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />

            {/* Left Holographic Cyan Visor Lens */}
            <polygon
              points="15,43 47,43 43,65 20,61"
              fill="url(#thumbCyberCyanGrad)"
              stroke="#06B6D4"
              strokeWidth="1.2"
              strokeLinejoin="bevel"
            />
            {/* Right Holographic Magenta Visor Lens */}
            <polygon
              points="53,43 85,43 80,61 57,65"
              fill="url(#thumbCyberPinkGrad)"
              stroke="#EC4899"
              strokeWidth="1.2"
              strokeLinejoin="bevel"
            />

            {/* Cyberpunk HUD Laser Scanlines & Grid Marks */}
            <line x1="18" y1="48" x2="44" y2="48" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
            <line x1="22" y1="54" x2="41" y2="54" stroke="#A5F3FC" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
            <line x1="56" y1="48" x2="82" y2="48" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
            <line x1="59" y1="54" x2="78" y2="54" stroke="#FBCFE8" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />

            {/* Laser Specular Diagonal Flare */}
            <polygon points="26,43 32,43 22,62 16,62" fill="#FFFFFF" opacity="0.45" />
            <polygon points="68,43 74,43 64,62 58,62" fill="#FFFFFF" opacity="0.45" />

            {/* Status LED Indicator Nodes */}
            <circle cx="13" cy="41" r="1.8" fill="#22D3EE" />
            <circle cx="87" cy="41" r="1.8" fill="#F472B6" />
            <circle cx="50" cy="41" r="1.5" fill="#FEF08A" />

            {/* Angular Wrap-Around Temple Arms */}
            <path d="M 10 40 L 4 48 L 4 56" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 90 40 L 96 48 L 96 56" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* --- GET SPARKS PACKAGES --- */}
        {itemId === 'sparks_pack_1' && (
          <g>
            {/* Glowing Handful of Sparks */}
            <circle cx="50" cy="50" r="34" fill="#FEF08A" opacity="0.25" />
            {/* Open Palm / Hand Cradle */}
            <path
              d="M 24 74 C 28 66, 36 64, 46 68 L 54 68 C 64 64, 72 66, 76 74 C 70 84, 30 84, 24 74 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            <path d="M 28 72 Q 50 80 72 72" stroke="#FEF08A" strokeWidth="2" fill="none" />
            {/* Floating Sparks & Starbursts */}
            <polygon points="50,20 54,34 68,38 54,42 50,56 46,42 32,38 46,34" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="32,40 34,48 42,50 34,52 32,60 30,52 22,50 30,48" fill="#FDE047" stroke="#D97706" strokeWidth="1.2" />
            <polygon points="68,40 70,48 78,50 70,52 68,60 66,52 58,50 66,48" fill="#FDE047" stroke="#D97706" strokeWidth="1.2" />
            <circle cx="50" cy="38" r="4" fill="#FFFFFF" />
            <circle cx="32" cy="50" r="2.5" fill="#FFFFFF" />
            <circle cx="68" cy="50" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'sparks_pack_2' && (
          <g>
            {/* Pouch of Sparks - Drawstring adventurer coin pouch bursting with sparks */}
            <circle cx="50" cy="52" r="35" fill="#F59E0B" opacity="0.2" />
            {/* Pouch Body */}
            <path
              d="M 32 38 C 22 42, 18 58, 22 74 C 26 86, 74 86, 78 74 C 82 58, 78 42, 68 38 Z"
              fill="#92400E"
              stroke="#451A03"
              strokeWidth="3"
            />
            {/* Pouch Front Highlight */}
            <path
              d="M 30 46 C 24 58, 24 72, 32 78 C 42 84, 58 84, 68 78 C 76 72, 76 58, 70 46 Z"
              fill="#B45309"
            />
            {/* Tied Drawstring Neck */}
            <rect x="30" y="34" width="40" height="8" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="2" />
            <ellipse cx="50" cy="34" rx="14" ry="4" fill="#78350F" />
            {/* Drawstring Rope & Golden Beads */}
            <path d="M 38 40 Q 34 52 30 58 M 62 40 Q 66 52 70 58" stroke="#FDE047" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="30" cy="58" r="3" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="1" />
            <circle cx="70" cy="58" r="3" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="1" />
            {/* Sparks Bursting Out from the Pouch Top */}
            <polygon points="50,10 54,22 66,25 54,28 50,40 46,28 34,25 46,22" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="34,22 36,28 42,30 36,32 34,38 32,32 26,30 32,28" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
            <polygon points="66,22 68,28 74,30 68,32 66,38 64,32 58,30 64,28" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
            <circle cx="50" cy="25" r="3.5" fill="#FFFFFF" />
          </g>
        )}

        {(itemId === 'sparks_pack_3' || itemId === 'chest_of_sparks') && (
          <g>
            {/* Chest of Sparks - 3D Open Treasure Chest Overflowing with Sparks */}
            {/* Ambient Energy Glow Behind Chest */}
            <ellipse cx="50" cy="50" rx="38" ry="34" fill="#F59E0B" opacity="0.3" />
            <circle cx="50" cy="42" r="22" fill="#FEF08A" opacity="0.45" />

            {/* Chest Base Box */}
            <path
              d="M 18 50 L 82 50 L 78 84 A 6 6 0 0 1 72 90 L 28 90 A 6 6 0 0 1 22 84 Z"
              fill="url(#thumbTreasureWoodGrad)"
              stroke="#451A03"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Inner Dark Void Behind Open Lid */}
            <ellipse cx="50" cy="50" rx="30" ry="10" fill="#451A03" />

            {/* Open Chest Lid (Swung Upward & Tilted Back) */}
            <path
              d="M 16 48 C 16 26, 84 26, 84 48 L 78 36 C 78 20, 22 20, 22 36 Z"
              fill="url(#thumbTreasureWoodDarkGrad)"
              stroke="#451A03"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 22 36 C 22 18, 78 18, 78 36 L 82 46 C 82 24, 18 24, 18 46 Z"
              fill="url(#thumbTreasureWoodGrad)"
              stroke="#451A03"
              strokeWidth="2"
            />

            {/* Gold Corner Brackets & Trim Bands on Lid */}
            <path d="M 20 46 C 20 25, 30 22, 30 38" stroke="url(#thumbGoldGrad)" strokeWidth="3.5" fill="none" />
            <path d="M 80 46 C 80 25, 70 22, 70 38" stroke="url(#thumbGoldGrad)" strokeWidth="3.5" fill="none" />

            {/* Gold Corner Brackets & Trim Bands on Base */}
            <path d="M 19 50 L 23 85" stroke="url(#thumbGoldGrad)" strokeWidth="4" />
            <path d="M 81 50 L 77 85" stroke="url(#thumbGoldGrad)" strokeWidth="4" />
            <path d="M 40 50 L 40 88" stroke="url(#thumbGoldGrad)" strokeWidth="3.5" />
            <path d="M 60 50 L 60 88" stroke="url(#thumbGoldGrad)" strokeWidth="3.5" />
            <path d="M 20 52 L 80 52" stroke="url(#thumbGoldGrad)" strokeWidth="3" />
            <path d="M 24 86 L 76 86" stroke="url(#thumbGoldGrad)" strokeWidth="3" />

            {/* Golden Keyhole Lock Plate */}
            <rect x="44" y="52" width="12" height="15" rx="3" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="50" cy="57" r="2" fill="#451A03" />
            <polygon points="49,57 51,57 52,63 48,63" fill="#451A03" />

            {/* MASSIVE GLOWING SPARKS & GOLDEN COINS OVERFLOWING INSIDE */}
            {/* Glowing Golden Coins Pile */}
            <ellipse cx="38" cy="48" rx="7" ry="4" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            <ellipse cx="62" cy="48" rx="7" ry="4" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            <ellipse cx="50" cy="49" rx="8" ry="4.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />

            {/* Electric Glowing Sparks ⚡ Shooting Out of the Chest */}
            <polygon points="50,14 55,28 72,32 56,38 52,54 46,38 30,32 46,28" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="2" />
            <polygon points="32,24 35,32 44,35 35,38 32,46 29,38 20,35 29,32" fill="#FEF08A" stroke="#B45309" strokeWidth="1.2" />
            <polygon points="68,24 71,32 80,35 71,38 68,46 65,38 56,35 65,32" fill="#FEF08A" stroke="#B45309" strokeWidth="1.2" />

            {/* Center Pure White Hot Sparks Flare */}
            <circle cx="50" cy="33" r="5" fill="#FFFFFF" />
            <circle cx="32" cy="35" r="3" fill="#FFFFFF" />
            <circle cx="68" cy="35" r="3" fill="#FFFFFF" />

            {/* Electric Arc Bolts */}
            <path d="M 28 20 L 34 26 L 30 30" stroke="#FDE047" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 72 20 L 66 26 L 70 30" stroke="#FDE047" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {itemId === 'sparks_pack_4' && (
          <g>
            {/* Mountain of Sparks - Colossal Hoard Vault overflowing with Sparks & Diamonds */}
            <circle cx="50" cy="48" r="36" fill="#F59E0B" opacity="0.25" />
            {/* Mountain Base of Golden Treasure */}
            <path
              d="M 12 88 Q 50 62 88 88 Z"
              fill="url(#thumbGoldGrad)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Master Vault Chest Nestled in the Summit */}
            <path
              d="M 24 54 L 76 54 L 72 82 L 28 82 Z"
              fill="url(#thumbTreasureWoodGrad)"
              stroke="#451A03"
              strokeWidth="2.5"
            />
            <path d="M 22 52 C 22 34, 78 34, 78 52 Z" fill="url(#thumbTreasureWoodDarkGrad)" stroke="#451A03" strokeWidth="2" />
            <path d="M 24 54 L 76 54" stroke="url(#thumbGoldGrad)" strokeWidth="4" />
            <path d="M 40 54 L 40 82 M 60 54 L 60 82" stroke="url(#thumbGoldGrad)" strokeWidth="3" />

            {/* Glowing Diamonds on the Treasure Mountain */}
            <polygon points="20,74 26,68 32,74 26,82" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
            <polygon points="74,72 80,66 86,72 80,80" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />

            {/* Radiant Giant Sparks Explosion Above Mountain */}
            <polygon points="50,6 56,24 78,28 58,36 54,54 46,36 24,28 46,24" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="2.5" />
            <polygon points="28,18 31,28 42,32 31,35 28,45 25,35 14,32 25,28" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="72,18 75,28 86,32 75,35 72,45 69,35 58,32 69,28" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />

            <circle cx="50" cy="30" r="6" fill="#FFFFFF" />
            <circle cx="28" cy="32" r="3.5" fill="#FFFFFF" />
            <circle cx="72" cy="32" r="3.5" fill="#FFFFFF" />
          </g>
        )}

        {/* --- PREMIUM & BUNDLES --- */}
        {itemId === 'starter_bundle' && (
          <g>
            {/* Royal Purple & Gold Bundle Chest with Explorer Fedora & Sparks Included */}
            <rect x="14" y="36" width="72" height="50" rx="10" fill="url(#thumbPurpleGrad)" stroke="#4C1D95" strokeWidth="3" />
            <rect x="10" y="28" width="80" height="16" rx="5" fill="#9333EA" stroke="#4C1D95" strokeWidth="2.5" />
            {/* Gold Ribbon Crossing */}
            <rect x="44" y="36" width="12" height="50" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            <rect x="10" y="32" width="80" height="7" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            {/* Large Gold Bow Tie */}
            <ellipse cx="36" cy="22" rx="11" ry="8" fill="#FBBF24" stroke="#B45309" strokeWidth="2" transform="rotate(-20 36 22)" />
            <ellipse cx="64" cy="22" rx="11" ry="8" fill="#FBBF24" stroke="#B45309" strokeWidth="2" transform="rotate(20 64 22)" />
            <circle cx="50" cy="23" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

            {/* Explorer Hat Badge on Bundle */}
            <ellipse cx="50" cy="62" rx="18" ry="6" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
            <path d="M 38 62 C 38 48, 62 48, 62 62 Z" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
            <rect x="38" y="58" width="24" height="3" fill="#D97706" />

            {/* Spark Tag Badge */}
            <circle cx="72" cy="44" r="8" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
            <text x="72" y="47" textAnchor="middle" fontSize="9" fontWeight="900" fill="#B45309">⚡</text>
          </g>
        )}

        {itemId === 'dragon_pet_premium' && (
          <g>
            {/* Fiery Dragon Whelp Pet */}
            {/* Dragon Wings */}
            <path d="M 40 48 Q 10 24 16 62 Q 32 58 42 52 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <path d="M 20 36 L 36 52 M 22 48 L 38 54" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M 60 48 Q 90 24 84 62 Q 68 58 58 52 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
            <path d="M 80 36 L 64 52 M 78 48 L 62 54" stroke="#F59E0B" strokeWidth="1.5" />

            {/* Curled Dragon Tail with Flame Tip */}
            <path d="M 44 68 Q 20 88 32 94 Q 46 84 50 72 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            <polygon points="26,90 20,96 32,96" fill="#F59E0B" />

            {/* Dragon Body */}
            <ellipse cx="50" cy="60" rx="18" ry="22" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
            {/* Golden Belly Scales */}
            <ellipse cx="50" cy="64" rx="10" ry="14" fill="#FEF08A" stroke="#D97706" strokeWidth="1.2" />
            <line x1="42" y1="58" x2="58" y2="58" stroke="#D97706" strokeWidth="1.2" />
            <line x1="42" y1="66" x2="58" y2="66" stroke="#D97706" strokeWidth="1.2" />

            {/* Dragon Head */}
            <circle cx="50" cy="36" r="16" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
            {/* Horns */}
            <path d="M 40 26 Q 30 10 38 6 Q 44 12 45 22 Z" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 60 26 Q 70 10 62 6 Q 56 12 55 22 Z" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1.5" />

            {/* Cute Expressive Dragon Eyes */}
            <ellipse cx="44" cy="34" rx="4" ry="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
            <circle cx="44" cy="34" r="2.5" fill="#78350F" />
            <circle cx="43" cy="33" r="1" fill="#FFFFFF" />

            <ellipse cx="56" cy="34" rx="4" ry="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
            <circle cx="56" cy="34" r="2.5" fill="#78350F" />
            <circle cx="55" cy="33" r="1" fill="#FFFFFF" />

            {/* Snout with Nostril Smoke Puffs */}
            <ellipse cx="50" cy="42" rx="7" ry="4" fill="#DC2626" />
            <circle cx="48" cy="42" r="1" fill="#7F1D1D" />
            <circle cx="52" cy="42" r="1" fill="#7F1D1D" />
            {/* Little Flame Puff */}
            <polygon points="50,44 48,50 52,50" fill="#F59E0B" />
          </g>
        )}

        {itemId === 'galaxy_skin_premium' && (
          <g>
            {/* Nebula Galaxy Cosmic Skin */}
            <circle cx="50" cy="50" r="38" fill="#1E1B4B" opacity="0.4" />
            <circle cx="50" cy="50" r="34" fill="url(#thumbGalaxyGrad)" stroke="#A855F7" strokeWidth="3.5" />

            {/* Swirling Nebula Spiral Arms */}
            <path
              d="M 22 54 C 28 72, 68 76, 76 54 C 82 38, 60 22, 42 30 C 28 36, 32 54, 48 54 C 60 54, 66 44, 62 36"
              stroke="#EC4899"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 28 48 C 32 64, 64 66, 70 50"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />

            {/* Twinkling Cosmic Stars */}
            <polygon points="50,18 52,24 58,26 53,30 55,36 50,32 45,36 47,30 42,26 48,24" fill="#FEF08A" />
            <circle cx="28" cy="30" r="2" fill="#FFFFFF" />
            <circle cx="72" cy="68" r="2" fill="#FFFFFF" />
            <circle cx="76" cy="28" r="1.5" fill="#A5F3FC" />
            <circle cx="24" cy="70" r="1.5" fill="#FBCFE8" />
          </g>
        )}

        {(itemId === 'kibo_club_sub' || itemId === 'kibo_club_family') && (
          <g>
            {/* Kibo Club VIP Pass - Golden Crown & Permanent Sparks Multiplier Card */}
            <rect x="10" y="16" width="80" height="68" rx="14" fill="url(#thumbPurpleGrad)" stroke="url(#thumbGoldGrad)" strokeWidth="3.5" />
            {/* Card Inner Gold Border */}
            <rect x="14" y="20" width="72" height="60" rx="10" fill="none" stroke="#FDE047" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />

            {/* Floating Royal Golden VIP Crown */}
            <path
              d="M 32 44 L 36 28 L 44 37 L 50 22 L 56 37 L 64 28 L 68 44 Z"
              fill="url(#thumbGoldGrad)"
              stroke="#78350F"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Crown Jewels */}
            <circle cx="36" cy="28" r="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
            <circle cx="50" cy="22" r="2.5" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
            <circle cx="64" cy="28" r="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
            <circle cx="50" cy="38" r="2" fill="#FDE047" />

            {/* VIP Multiplier Ribbon */}
            <rect x="20" y="52" width="60" height="14" rx="4" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="1.5" />
            <text x="50" y="62" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350F" letterSpacing="0.8">1.25x VIP CLUB</text>

            {/* Sparkle Glints */}
            <polygon points="22,26 23,29 26,30 23,31 22,34 21,31 18,30 21,29" fill="#FEF08A" />
            <polygon points="78,26 79,29 82,30 79,31 78,34 77,31 74,30 77,29" fill="#FEF08A" />
          </g>
        )}

        {/* SALE BADGE OVERLAY */}
        {saleDiscount > 0 && (
          <g transform="translate(68, -4) rotate(15)">
            <rect x="0" y="0" width="36" height="18" rx="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.5" />
            <text x="18" y="12" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" letterSpacing="0.5">
              -{saleDiscount}%
            </text>
          </g>
        )}

        {/* Fallback for unmapped IDs */}
        {!WORKSHOP_ITEMS.some((i) => i.id === itemId) && !['sparks_pack_1', 'sparks_pack_2', 'sparks_pack_3', 'sparks_pack_4', 'chest_of_sparks'].includes(itemId) && (
          <g>
            <circle cx="50" cy="50" r="30" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2.5" />
            <polygon points="50,30 55,42 68,44 58,54 61,66 50,60 39,66 42,54 32,44 45,42" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
