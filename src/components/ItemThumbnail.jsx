import React from 'react';
import { WORKSHOP_ITEMS } from '../utils/itemsCatalog';

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

        {itemId === 'ninja_headband' && (
          <g>
            {/* Flowing ribbon tails */}
            <path d="M 22 52 Q 10 60 14 78 Q 20 72 26 58 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <path d="M 26 50 Q 8 68 18 84 Q 24 76 28 56 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" />
            {/* Main Band */}
            <path d="M 16 52 Q 50 34 84 52 L 82 62 Q 50 44 18 62 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
            {/* Metal Shinobi Forehead Plate */}
            <rect x="36" y="42" width="28" height="15" rx="3" fill="url(#thumbMetalGrad)" stroke="#0F172A" strokeWidth="2" />
            <circle cx="39" cy="49.5" r="1" fill="#0F172A" />
            <circle cx="61" cy="49.5" r="1" fill="#0F172A" />
            {/* Engraved Mountain Crest Symbol */}
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
            {/* Coiled Climbing Rope */}
            <ellipse cx="50" cy="68" rx="22" ry="14" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
            <ellipse cx="50" cy="68" rx="14" ry="8" fill="#FDE68A" stroke="#78350F" strokeWidth="1.5" />
            <path d="M 34 64 Q 50 58 66 64 M 32 70 Q 50 64 68 70 M 36 74 Q 50 70 64 74" stroke="#92400E" strokeWidth="2" fill="none" />
            {/* Connecting Carabiner Ring */}
            <circle cx="50" cy="48" r="7" fill="none" stroke="#64748B" strokeWidth="3" />
            {/* Grappling Hook Stem */}
            <line x1="50" y1="42" x2="50" y2="18" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
            {/* Top Attachment Eyelet */}
            <circle cx="50" cy="18" r="5" fill="none" stroke="#334155" strokeWidth="3" />
            {/* Left Hook Fluke */}
            <path d="M 50 38 Q 24 38 24 22 L 20 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
            <polygon points="24,20 20,27 28,26" fill="#64748B" />
            {/* Right Hook Fluke */}
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

        {(itemId === 'climbing_poles' || itemId === 'golden_compass') && (
          <g>
            {/* Left Pole */}
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
            {/* Right Pole */}
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
            {/* Bubble Space Helmet Outer */}
            <circle cx="50" cy="44" r="28" fill="#F8FAFC" stroke="#64748B" strokeWidth="3.5" />
            {/* Reflective Golden Visor */}
            <ellipse cx="50" cy="44" rx="20" ry="16" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="2.5" />
            {/* Visor Glare */}
            <path d="M 38 34 Q 50 30 62 34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            {/* Neck Collar & Suit Chest */}
            <rect x="26" y="66" width="48" height="24" rx="8" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
            {/* Mission Patch / Flag */}
            <rect x="34" y="73" width="12" height="8" rx="2" fill="#0284C7" />
            <polygon points="40,74 41,77 44,77 42,79 43,82 40,80 37,82 38,79 36,77 39,77" fill="#FDE047" />
            {/* Controls / Oxygen Indicator */}
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

        {/* --- COMPANIONS & FX --- */}
        {itemId === 'sparkle_dust' && (
          <g>
            <ellipse cx="50" cy="25" rx="22" ry="7" fill="#CBD5E1" />
            <path d="M 35 35 L 32 48" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 35 L 47 52" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            <path d="M 65 35 L 62 46" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 42 55 L 39 68" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 58 55 L 55 70" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'fx_float_bounce' && (
          <g>
            <ellipse cx="50" cy="72" rx="30" ry="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
            <circle cx="32" cy="68" r="10" fill="#F8FAFC" />
            <circle cx="68" cy="68" r="10" fill="#F8FAFC" />
            <circle cx="50" cy="65" r="12" fill="#FFFFFF" />
            <path d="M 50 25 L 45 42 L 55 42 Z" fill="#38BDF8" />
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
            <circle cx="31" cy="51" r="4" fill="#FFFFFF" opacity="0.85" />
            <circle cx="65" cy="42" r="18" fill="#38BDF8" opacity="0.65" stroke="#0284C7" strokeWidth="1.5" />
            <circle cx="60" cy="37" r="5" fill="#FFFFFF" opacity="0.85" />
            <circle cx="48" cy="70" r="10" fill="#F472B6" opacity="0.65" stroke="#DB2777" strokeWidth="1.5" />
            <circle cx="45" cy="67" r="3" fill="#FFFFFF" opacity="0.85" />
          </g>
        )}

        {itemId === 'fx_hyper_speed' && (
          <g>
            <polygon points="50,25 20,85 40,85" fill="#F472B6" opacity="0.3" />
            <polygon points="50,25 60,85 80,85" fill="#38BDF8" opacity="0.3" />
            <line x1="50" y1="5" x2="50" y2="18" stroke="#64748B" strokeWidth="2" />
            <circle cx="50" cy="25" r="12" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
            <circle cx="46" cy="22" r="2" fill="#FFFFFF" />
            <circle cx="54" cy="27" r="2" fill="#FFFFFF" />
          </g>
        )}

        {itemId === 'rainbow_nebula' && (
          <g>
            <line x1="50" y1="50" x2="20" y2="20" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="50" y1="50" x2="80" y2="20" stroke="#3B82F6" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="50" y1="50" x2="15" y2="70" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="50" y1="50" x2="85" y2="70" stroke="#10B981" strokeWidth="3" strokeDasharray="4 3" />
            <polygon points="50,35 53,44 62,44 55,50 58,58 50,53 42,58 45,50 38,44 47,44" fill="#FEF08A" />
            <circle cx="20" cy="20" r="4" fill="#FCA5A5" />
            <circle cx="80" cy="20" r="4" fill="#93C5FD" />
            <circle cx="15" cy="70" r="4" fill="#FDE68A" />
            <circle cx="85" cy="70" r="4" fill="#A7F3D0" />
          </g>
        )}

        {itemId === 'fx_orbit_moons' && (
          <g>
            <circle cx="50" cy="45" r="16" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="45" cy="42" r="3" fill="#FFFFFF" />
            <path d="M 28 65 Q 38 52 50 65 Q 62 78 72 65" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <polygon points="26,62 34,58 32,68" fill="#EF4444" />
            <polygon points="74,68 66,72 68,62" fill="#EF4444" />
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
            {/* Floating Shadow/Aura */}
            <ellipse cx="50" cy="84" rx="20" ry="5" fill="#38BDF8" opacity="0.35" />
            {/* Antenna */}
            <line x1="50" y1="16" x2="50" y2="28" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="14" r="5" fill="#22D3EE" stroke="#0284C7" strokeWidth="2" />
            <circle cx="48" cy="12" r="1.5" fill="#FFFFFF" />
            {/* Side Ear Bolts */}
            <rect x="18" y="44" width="6" height="12" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
            <rect x="76" y="44" width="6" height="12" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
            {/* Main Robot Body/Head */}
            <rect x="22" y="28" width="56" height="46" rx="16" fill="url(#thumbMetalGrad)" stroke="#1E293B" strokeWidth="3.5" />
            {/* Screen / Visor */}
            <rect x="29" y="35" width="42" height="24" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            {/* Visor Beaming Digital Face [ ^ _ ^ ] */}
            <path d="M 37 48 L 41 43 L 45 48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 55 48 L 59 43 L 63 48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 47 52 Q 50 55 53 52" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Chest Light / Badge */}
            <circle cx="50" cy="65" r="3.5" fill="#22D3EE" stroke="#0284C7" strokeWidth="1" />
            {/* Bottom Jet Thruster */}
            <polygon points="42,74 58,74 50,83" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.5" />
            <polygon points="45,74 55,74 50,80" fill="#E0F2FE" />
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

        {itemId === 'cosmic_griffin' && (
          <g>
            <path d="M 45 60 Q 72 40 68 85 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <ellipse cx="50" cy="55" rx="16" ry="20" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="3" />
            <circle cx="50" cy="36" r="14" fill="#FEF08A" stroke="#B45309" strokeWidth="2.5" />
            <polygon points="56,36 74,40 56,45" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="44" cy="34" r="3.5" fill="#FFFFFF" />
            <circle cx="44" cy="34" r="2" fill="#78350F" />
          </g>
        )}

        {/* --- SKINS --- */}
        {itemId === 'snow_white_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#E0F2FE" />
            <circle cx="40" cy="42" r="3" fill="#0284C7" />
            <circle cx="60" cy="42" r="3" fill="#0284C7" />
          </g>
        )}

        {itemId === 'midnight_shadow_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#334155" />
            <circle cx="40" cy="42" r="3" fill="#38BDF8" />
            <circle cx="60" cy="42" r="3" fill="#38BDF8" />
          </g>
        )}

        {itemId === 'emerald_jade_skin' && (
          <g>
            <circle cx="50" cy="50" r="32" fill="#10B981" stroke="#047857" strokeWidth="4" />
            <ellipse cx="50" cy="58" rx="20" ry="14" fill="#A7F3D0" />
            <circle cx="40" cy="42" r="3" fill="#064E3B" />
            <circle cx="60" cy="42" r="3" fill="#064E3B" />
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

        {itemId === 'bg_concert_stage' && (
          <g>
            <rect x="10" y="10" width="80" height="80" rx="16" fill="#180B2B" stroke="#A855F7" strokeWidth="3" />
            <polygon points="25,12 48,75 32,75 15,12" fill="#EC4899" opacity="0.5" />
            <polygon points="75,12 52,75 68,75 85,12" fill="#06B6D4" opacity="0.5" />
            <polygon points="50,12 40,75 60,75 50,12" fill="#FACC15" opacity="0.4" />
            <rect x="14" y="14" width="72" height="4" rx="2" fill="#475569" />
            <circle cx="25" cy="16" r="2.5" fill="#EC4899" />
            <circle cx="50" cy="16" r="2.5" fill="#FACC15" />
            <circle cx="75" cy="16" r="2.5" fill="#06B6D4" />
            <polygon points="14,72 86,72 90,88 10,88" fill="#1E293B" />
            <line x1="14" y1="72" x2="86" y2="72" stroke="#E879F9" strokeWidth="2" />
            <circle cx="30" cy="72" r="1.5" fill="#38BDF8" />
            <circle cx="50" cy="72" r="1.5" fill="#FFFFFF" />
            <circle cx="70" cy="72" r="1.5" fill="#F472B6" />
            <rect x="14" y="56" width="8" height="16" rx="1" fill="#0F172A" />
            <rect x="78" y="56" width="8" height="16" rx="1" fill="#0F172A" />
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

        {/* --- SEASONAL --- */}
        {itemId === 'pumpkin_hat' && (
          <g id="thumb-pumpkin-hat">
            {/* Back Vine Tendril */}
            <path d="M 50 20 C 56 12, 66 8, 72 12 C 76 16, 71 22, 66 20" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 50 18 C 44 10, 34 6, 28 11" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Back Outer Lobes */}
            <ellipse cx="28" cy="55" rx="16" ry="24" fill="url(#thumbPumpkinOuterGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="72" cy="55" rx="16" ry="24" fill="url(#thumbPumpkinOuterGrad)" stroke="#9A3412" strokeWidth="2.5" />

            {/* Mid Lobes */}
            <ellipse cx="38" cy="56" rx="17" ry="26" fill="url(#thumbPumpkinMidGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <ellipse cx="62" cy="56" rx="17" ry="26" fill="url(#thumbPumpkinMidGrad)" stroke="#9A3412" strokeWidth="2.5" />

            {/* Center / Front Lobe */}
            <ellipse cx="50" cy="57" rx="18" ry="28" fill="url(#thumbPumpkinCenterGrad)" stroke="#9A3412" strokeWidth="2.5" />

            {/* Rib Crevices & Top Highlight */}
            <path d="M 40 32 Q 36 57 41 83" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 60 32 Q 64 57 59 83" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 40 33 Q 50 30 60 33" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />

            {/* Top Calyx / Leaf Base */}
            <path d="M 44 32 Q 50 27 56 32 L 53 36 L 47 36 Z" fill="#15803D" stroke="#14532D" strokeWidth="1" />

            {/* Top Wooden Stem */}
            <path d="M 46 32 C 44 21, 52 16, 56 11 L 60 12.5 C 57 18, 53 23, 53 32 Z" fill="url(#thumbPumpkinStemGrad)" stroke="#14532D" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="58" cy="11.8" rx="2.2" ry="1.4" fill="#86EFAC" />

            {/* Glowing Carved Eyes */}
            <polygon points="32,50 42,47 39,55" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="33.5,51 40.5,48.5 38.5,54" fill="#FEF08A" opacity="0.9" />

            <polygon points="68,50 58,47 61,55" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="66.5,51 59.5,48.5 61.5,54" fill="#FEF08A" opacity="0.9" />

            {/* Glowing Carved Nose */}
            <polygon points="47,56 53,56 50,51" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="47.5,55.5 52.5,55.5 50,52" fill="#FEF08A" opacity="0.9" />

            {/* Glowing Carved Smile */}
            <path d="M 30 63 Q 50 81 70 63 L 67 66 L 63 64 L 60 68 L 50 65 L 40 68 L 37 64 L 33 66 Z" fill="url(#thumbPumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 33 64 Q 50 79 67 64 L 65 66 L 62 65 L 59 68 L 50 66 L 41 68 L 38 65 L 35 66 Z" fill="#FEF08A" opacity="0.85" />
          </g>
        )}

        {/* --- PROMO EXCLUSIVES --- */}
        {itemId === 'golden_ticket' && (
          <g>
            {/* Golden Glow Aura */}
            <rect x="8" y="24" width="84" height="52" rx="8" fill="#FEF08A" opacity="0.35" />
            {/* Main Ticket Foil */}
            <rect x="10" y="26" width="80" height="48" rx="6" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="3" />
            {/* Scalloped Notches on Left & Right Edges */}
            <circle cx="10" cy="50" r="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
            <circle cx="90" cy="50" r="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
            {/* Inner Dashed Border */}
            <rect x="18" y="32" width="64" height="36" rx="4" fill="#FDE047" stroke="#92400E" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Glare Sheen Diagonal */}
            <path d="M 26 32 L 40 32 L 20 68 L 18 68 Z" fill="#FFFFFF" opacity="0.4" />
            <path d="M 44 32 L 52 32 L 32 68 L 24 68 Z" fill="#FFFFFF" opacity="0.25" />
            {/* VIP Stars */}
            <polygon points="26,40 27.5,43 31,43.5 28.5,46 29,49.5 26,48 23,49.5 23.5,46 21,43.5 24.5,43" fill="#B45309" />
            <polygon points="74,40 75.5,43 79,43.5 76.5,46 77,49.5 74,48 71,49.5 71.5,46 69,43.5 72.5,43" fill="#B45309" />
            {/* Ticket Text */}
            <text x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350F" letterSpacing="1">GOLDEN</text>
            <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350F" letterSpacing="2">TICKET</text>
            <text x="50" y="64" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#92400E" letterSpacing="1">★ ADMIT ONE ★</text>
          </g>
        )}

        {/* --- PREMIUM & BUNDLES --- */}
        {itemId === 'starter_bundle' && (
          <g>
            {/* Gift Chest / Bundle Box */}
            <rect x="16" y="38" width="68" height="48" rx="8" fill="#7C3AED" stroke="#4C1D95" strokeWidth="3" />
            <rect x="12" y="30" width="76" height="14" rx="4" fill="#9333EA" stroke="#4C1D95" strokeWidth="3" />
            {/* Golden Ribbon Wrap Vertical & Horizontal */}
            <rect x="44" y="38" width="12" height="48" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            <rect x="12" y="34" width="76" height="6" fill="url(#thumbGoldGrad)" stroke="#B45309" strokeWidth="1" />
            {/* Big Ribbon Bow on Top */}
            <ellipse cx="38" cy="24" rx="10" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="2" transform="rotate(-20 38 24)" />
            <ellipse cx="62" cy="24" rx="10" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="2" transform="rotate(20 62 24)" />
            <circle cx="50" cy="25" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            {/* Emerging Content Badges (Sparks Bolt + Flame) */}
            <circle cx="28" cy="62" r="12" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
            <path d="M 29 53 L 23 62 L 28 62 L 27 71 L 34 60 L 29 60 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <circle cx="72" cy="62" r="12" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <path d="M 72 53 Q 78 59 77 64 A 5 5 0 1 1 67 64 Q 66 59 72 53 Z" fill="#F97316" />
            <path d="M 72 58 Q 75 62 74 65 A 2.5 2.5 0 1 1 70 65 Q 69 62 72 58 Z" fill="#FACC15" />
            {/* Bundle Tag Pill */}
            <rect x="32" y="70" width="36" height="12" rx="4" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />
            <text x="50" y="79" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350F">BUNDLE</text>
          </g>
        )}

        {itemId === 'dragon_pet_premium' && (
          <g>
            {/* Dragon Tail */}
            <path d="M 44 64 Q 20 84 30 94 Q 44 82 48 68 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            {/* Left Bat Wing */}
            <path d="M 44 48 Q 12 30 18 64 Q 34 60 44 54 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            <path d="M 28 44 L 26 58 M 38 46 L 36 56" stroke="#EF4444" strokeWidth="1.5" />
            {/* Right Bat Wing */}
            <path d="M 58 48 Q 88 30 82 64 Q 66 60 58 54 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="2" />
            <path d="M 72 44 L 74 58 M 62 46 L 64 56" stroke="#DC2626" strokeWidth="1.5" />
            {/* Dragon Body */}
            <ellipse cx="50" cy="58" rx="18" ry="22" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            {/* Golden Belly Plates */}
            <ellipse cx="50" cy="62" rx="9" ry="14" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
            <line x1="43" y1="56" x2="57" y2="56" stroke="#CA8A04" strokeWidth="1.5" />
            <line x1="42" y1="62" x2="58" y2="62" stroke="#CA8A04" strokeWidth="1.5" />
            <line x1="43" y1="68" x2="57" y2="68" stroke="#CA8A04" strokeWidth="1.5" />
            {/* Dragon Head */}
            <circle cx="50" cy="36" r="16" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            {/* Golden Horns */}
            <path d="M 40 26 Q 30 12 36 8 Q 42 14 44 23 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <path d="M 60 26 Q 70 12 64 8 Q 58 14 56 23 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            {/* Snout & Nostrils */}
            <ellipse cx="50" cy="42" rx="8" ry="5" fill="#DC2626" />
            <circle cx="47" cy="41" r="1" fill="#7F1D1D" />
            <circle cx="53" cy="41" r="1" fill="#7F1D1D" />
            {/* Cute Big Eyes */}
            <circle cx="41" cy="34" r="4.5" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="41" cy="34" r="2.5" fill="#451A03" />
            <circle cx="40" cy="33" r="1" fill="#FFFFFF" />
            <circle cx="59" cy="34" r="4.5" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="59" cy="34" r="2.5" fill="#451A03" />
            <circle cx="58" cy="33" r="1" fill="#FFFFFF" />
            {/* Fire Breath Ember */}
            <circle cx="50" cy="50" r="3.5" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
            <circle cx="50" cy="50" r="1.5" fill="#FEF08A" />
          </g>
        )}

        {itemId === 'galaxy_skin_premium' && (
          <g>
            {/* Outer Cosmic Halo */}
            <circle cx="50" cy="50" r="38" fill="#312E81" opacity="0.3" />
            {/* Main Galaxy Orb */}
            <circle cx="50" cy="50" r="32" fill="url(#thumbGalaxyGrad)" stroke="#A855F7" strokeWidth="3.5" />
            {/* Cosmic Nebula Swirls */}
            <path d="M 24 58 C 30 72 65 74 74 54 C 80 40 60 26 44 32 C 32 36 34 50 48 50 C 58 50 64 42 62 36" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 28 46 C 36 28 66 26 72 44" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
            {/* Constellation Stars & Sparkles */}
            <polygon points="50,22 52,28 58,30 53,34 55,40 50,36 45,40 47,34 42,30 48,28" fill="#FEF08A" />
            <circle cx="30" cy="36" r="2.5" fill="#FFFFFF" />
            <circle cx="68" cy="34" r="2" fill="#A5F3FC" />
            <circle cx="34" cy="64" r="1.5" fill="#FDE047" />
            <circle cx="66" cy="62" r="3" fill="#FFFFFF" />
            <circle cx="48" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="56" cy="68" r="1.5" fill="#A7F3D0" />
            {/* Crescent Light Edge */}
            <path d="M 26 30 A 30 30 0 0 1 70 24" stroke="#E0E7FF" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'kibo_club_sub' && (
          <g>
            {/* VIP Golden & Purple Membership Pass */}
            <rect x="12" y="18" width="76" height="64" rx="12" fill="url(#thumbPurpleGrad)" stroke="#F59E0B" strokeWidth="3.5" />
            <rect x="16" y="22" width="68" height="56" rx="8" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="4 2" />
            {/* Imperial Crown on Top of Card */}
            <path d="M 34 44 L 38 30 L 44 38 L 50 25 L 56 38 L 62 30 L 66 44 Z" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="38" cy="28" r="2" fill="#EF4444" />
            <circle cx="50" cy="23" r="2.5" fill="#3B82F6" />
            <circle cx="62" cy="28" r="2" fill="#10B981" />
            <rect x="34" y="44" width="32" height="4" rx="1" fill="#B45309" />
            {/* Crown Base Jewels */}
            <circle cx="42" cy="46" r="1" fill="#FFFFFF" />
            <circle cx="50" cy="46" r="1" fill="#FFFFFF" />
            <circle cx="58" cy="46" r="1" fill="#FFFFFF" />
            {/* Golden Banner: KIBO CLUB */}
            <rect x="22" y="52" width="56" height="12" rx="4" fill="url(#thumbGoldGrad)" stroke="#78350F" strokeWidth="1.5" />
            <text x="50" y="61" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#78350F" letterSpacing="0.8">KIBO CLUB</text>
            {/* Multiplier Badge 1.25x */}
            <rect x="30" y="66" width="40" height="9" rx="3" fill="#4C1D95" stroke="#A855F7" strokeWidth="1" />
            <text x="50" y="73" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#FACC15">⚡ 1.25x VIP</text>
          </g>
        )}

        {/* Summer Visor */}
        {itemId === 'summer_visor' && (
          <g>
            <ellipse cx="50" cy="50" rx="38" ry="14" fill="#38BDF8" opacity="0.25" />
            {/* Visor Band */}
            <path d="M 16 48 C 16 36, 84 36, 84 48 L 82 54 C 82 44, 18 44, 18 54 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <path d="M 24 45 Q 50 38 76 45" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
            {/* Visor Peak / Brim */}
            <path d="M 18 48 C 22 66, 78 66, 82 48 C 76 60, 24 60, 18 48 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
            <path d="M 26 50 C 32 60, 68 60, 74 50" stroke="#38BDF8" strokeWidth="2" fill="none" opacity="0.8" />
            {/* Sun Emblem */}
            <circle cx="50" cy="43" r="5" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="50" cy="43" r="2.5" fill="#EA580C" />
          </g>
        )}

        {/* Winter Beanie */}
        {itemId === 'winter_beanie' && (
          <g>
            {/* Beanie Dome */}
            <path d="M 22 64 C 18 36, 32 20, 50 20 C 68 20, 82 36, 78 64 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
            {/* Snowflake / Pattern Stripes */}
            <path d="M 26 48 Q 50 42 74 48" stroke="#DBEAFE" strokeWidth="3" strokeDasharray="4 3" fill="none" />
            <path d="M 24 38 Q 50 32 76 38" stroke="#93C5FD" strokeWidth="2.5" fill="none" />
            {/* Folded Brim */}
            <rect x="18" y="58" width="64" height="14" rx="5" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2.5" />
            <line x1="30" y1="58" x2="30" y2="72" stroke="#60A5FA" strokeWidth="1.5" />
            <line x1="42" y1="58" x2="42" y2="72" stroke="#60A5FA" strokeWidth="1.5" />
            <line x1="58" y1="58" x2="58" y2="72" stroke="#60A5FA" strokeWidth="1.5" />
            <line x1="70" y1="58" x2="70" y2="72" stroke="#60A5FA" strokeWidth="1.5" />
            {/* Fluffy Pom Pom on Top */}
            <circle cx="50" cy="18" r="9" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="48" cy="16" r="3" fill="#FFFFFF" />
            <circle cx="53" cy="20" r="2" fill="#E2E8F0" />
          </g>
        )}

        {/* Cyber Neon Shades */}
        {itemId === 'cyber_shades' && (
          <g>
            {/* Glow backing */}
            <rect x="14" y="36" width="72" height="28" rx="6" fill="#06B6D4" opacity="0.3" />
            {/* Frame Body */}
            <polygon points="16,38 84,38 80,60 56,64 50,56 44,64 20,60" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
            {/* Left & Right Visor Lens */}
            <polygon points="20,42 46,42 42,58 24,56" fill="#06B6D4" stroke="#22D3EE" strokeWidth="1.5" />
            <polygon points="54,42 80,42 76,56 58,58" fill="#EC4899" stroke="#F472B6" strokeWidth="1.5" />
            {/* HUD Tech Lines */}
            <line x1="24" y1="48" x2="42" y2="48" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="58" y1="48" x2="76" y2="48" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="33" cy="53" r="1.5" fill="#FFFFFF" />
            <circle cx="67" cy="53" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Generic Fallback Thumbnail */}
        {!WORKSHOP_ITEMS.some((i) => i.id === itemId) && (
          <g>
            <circle cx="50" cy="50" r="30" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2.5" />
            <polygon points="50,30 55,42 68,44 58,54 61,66 50,60 39,66 42,54 32,44 45,42" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
