import React from 'react';

/**
 * PET_TYPES classification
 */
export const PET_CONFIGS = {
  snowy_owl: { name: 'Snowy Owl Chick', type: 'flying', yOffset: 22 },
  alpine_fox: { name: 'Alpine Fox Cub', type: 'ground', yOffset: 98 },
  mini_robot: { name: 'Mini Robot Companion', type: 'flying', yOffset: 22 },
  phoenix_pet: { name: 'Phoenix Flame Pet', type: 'flying', yOffset: 22 },
  frost_dragon: { name: 'Frost Dragon Pet', type: 'flying', yOffset: 22 },
  cosmic_griffin: { name: 'Golden Cosmic Griffin', type: 'flying', yOffset: 22 },
  spring_butterfly_pet: { name: 'Monarch Spring Butterfly', type: 'flying', yOffset: 22 },
  autumn_squirrel_pet: { name: 'Acorn Harvester Squirrel', type: 'ground', yOffset: 98 },
  winter_snowman_pet: { name: 'Frosty Snowman Pal', type: 'ground', yOffset: 98 },
  mlk_peace_dove_pet: { name: 'Peace Dove Companion', type: 'flying', yOffset: 22 },
  halloween_ghost_pet: { name: 'Spooky Boo Ghost', type: 'flying', yOffset: 22 },
  holiday_gingerbread_pet: { name: 'Gingerbread Buddy', type: 'ground', yOffset: 98 },
  dragon_pet_premium: { name: 'Crimson Baby Dragon', type: 'flying', yOffset: 22 },
};

export const IS_PET_ID = (id) => Boolean(PET_CONFIGS[id]);

/**
 * PetGraphic
 * Kawaii Chibi SVG Renderer for all 13 Companion Pets.
 * Compatible with both Mascot (companion mode) and ItemThumbnail (card mode).
 */
export default function PetGraphic({ petId, isCompanion = false, className = '' }) {
  if (!petId || !PET_CONFIGS[petId]) return null;

  return (
    <g className={`pet-graphic-root pet-${petId} ${className}`}>
      <defs>
        {/* Soft Glow Filter */}
        <filter id={`petSoftGlow_${petId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* --- Coral/Pink Baby Dragon Gradients --- */}
        <radialGradient id="kawaiiPinkDragon" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FECDD3" />
          <stop offset="55%" stopColor="#FDA4AF" />
          <stop offset="85%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#F43F5E" />
        </radialGradient>
        <radialGradient id="kawaiiCreamBelly" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="65%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>

        {/* --- Frost Dragon Gradients --- */}
        <radialGradient id="kawaiiFrostDragon" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#F0FDFA" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="85%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </radialGradient>

        {/* --- Cosmic Griffin / Starry Dragon Gradients --- */}
        <radialGradient id="kawaiiCosmicNight" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="45%" stopColor="#312E81" />
          <stop offset="85%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
        <radialGradient id="kawaiiCosmicBelly" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="60%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#A78BFA" />
        </radialGradient>

        {/* --- Phoenix Sunbeam Gradients --- */}
        <radialGradient id="kawaiiSunGold" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="45%" stopColor="#FEF08A" />
          <stop offset="85%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>

        {/* --- Autumn Orange Gradients --- */}
        <radialGradient id="kawaiiAutumnOrange" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="45%" stopColor="#FB923C" />
          <stop offset="85%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>

        {/* --- Snowy / Fluffy White Down Gradients --- */}
        <radialGradient id="kawaiiWhiteDown" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>

        {/* --- Ghost Ethereal Gradients --- */}
        <radialGradient id="kawaiiGhostBody" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.8" />
        </radialGradient>

        {/* --- Baked Gingerbread Gradients --- */}
        <radialGradient id="kawaiiGingerBake" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      {/* ==================================================== */}
      {/* 1. SNOWY OWL CHICK (snowy_owl)                       */}
      {/* ==================================================== */}
      {petId === 'snowy_owl' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Drifting Snowflake Crystals */}
          {isCompanion && (
            <g className="pointer-events-none opacity-85">
              <circle cx="20" cy="28" r="1.5" fill="#FFFFFF" className="animate-pet-snow-1" />
              <circle cx="82" cy="30" r="1.4" fill="#E0F2FE" className="animate-pet-snow-2" />
              <circle cx="76" cy="74" r="1.6" fill="#FFFFFF" className="animate-pet-snow-3" />
            </g>
          )}

          {/* Cute Wooden Perch with Green Leaf Sprout */}
          <path d="M 20 83 Q 50 80 80 83" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <path d="M 24 82 Q 50 80 76 82" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <path d="M 66 82 Q 72 75 78 78 Q 75 84 66 82 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="0.8" />

          {/* Chubby Round Talons */}
          <path d="M 40 80 L 40 85 M 44 80 L 44 85 M 56 80 L 56 85 M 60 80 L 60 85" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />

          {/* Plump Spherical Owl Body */}
          <ellipse cx="50" cy="54" rx="25" ry="27" fill="url(#kawaiiWhiteDown)" stroke="#475569" strokeWidth="2.4" />
          {/* Subtle Downy Chest Crescents */}
          <path d="M 45 61 Q 50 64 55 61 M 42 68 Q 50 71 58 68" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Stubby Wing Nubs */}
          <path d="M 26 48 C 18 56, 20 68, 29 72 C 32 64, 32 54, 26 48 Z" fill="#FFFFFF" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 74 48 C 82 56, 80 68, 71 72 C 68 64, 68 54, 74 48 Z" fill="#FFFFFF" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />

          {/* Double Facial Discs */}
          <circle cx="41" cy="42" r="13.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          <circle cx="59" cy="42" r="13.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

          {/* Little Crown Feather Tufts */}
          <path d="M 37 28 Q 34 18 42 23 M 63 28 Q 66 18 58 23" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Giant Glossy Raptor Button Eyes */}
          <circle cx="41" cy="42" r="6" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="59" cy="42" r="6" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="41" cy="42" r="4.6" fill="#0F172A" />
          <circle cx="59" cy="42" r="4.6" fill="#0F172A" />
          {/* Dual White Eye Catchlights */}
          <circle cx="39.5" cy="40" r="1.8" fill="#FFFFFF" />
          <circle cx="57.5" cy="40" r="1.8" fill="#FFFFFF" />
          <circle cx="42.5" cy="44.2" r="0.8" fill="#FFFFFF" />
          <circle cx="60.5" cy="44.2" r="0.8" fill="#FFFFFF" />

          {/* Tiny Triangular Peach Beak */}
          <polygon points="47,44 53,44 50,49" fill="#F97316" stroke="#C2410C" strokeWidth="0.8" strokeLinejoin="round" />

          {/* Big Rosy Blush Cheeks */}
          <ellipse cx="32" cy="48" rx="4.5" ry="3.2" fill="#F472B6" opacity="0.65" />
          <ellipse cx="68" cy="48" rx="4.5" ry="3.2" fill="#F472B6" opacity="0.65" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 2. ALPINE FOX CUB (alpine_fox)                       */}
      {/* ==================================================== */}
      {petId === 'alpine_fox' && (
        <g className={isCompanion ? 'animate-pet-ground' : ''}>
          {/* Mountain Frost Sparkles */}
          {isCompanion && (
            <g className="pointer-events-none opacity-80">
              <polygon points="22,34 23.5,37 26,38 23.5,39 22,42 20.5,39 18,38 20.5,37" fill="#BAE6FD" className="animate-ping" />
              <circle cx="82" cy="52" r="1.5" fill="#E0F2FE" className="animate-pulse" />
            </g>
          )}

          {/* Giant Fluffy Curled Tail with Marshmallow Tip */}
          <path d="M 52 74 C 76 72, 88 56, 82 44 C 76 34, 66 42, 68 56 C 70 66, 62 74, 52 74 Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 82 44 C 80 38, 72 37, 68 44 C 72 48, 76 46, 82 44 Z" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.8" strokeLinejoin="round" />

          {/* Chubby Fox Body */}
          <ellipse cx="48" cy="67" rx="17" ry="18" fill="url(#kawaiiAutumnOrange)" stroke="#7C2D12" strokeWidth="2.4" />
          {/* Snowy White Chest Bib */}
          <path d="M 40 56 Q 48 70 44 77 Q 48 73 52 77 Q 48 70 56 56 Z" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.4" strokeLinejoin="round" />

          {/* Stubby Front Paws Sitting Politely */}
          <ellipse cx="43" cy="78" rx="3.8" ry="3" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.6" />
          <ellipse cx="53" cy="78" rx="3.8" ry="3" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.6" />

          {/* Oversized Kawaii Fox Head */}
          <ellipse cx="48" cy="41" rx="19" ry="17" fill="url(#kawaiiAutumnOrange)" stroke="#7C2D12" strokeWidth="2.4" />
          {/* Snowy White Cheek & Muzzle Fluff */}
          <path d="M 32 46 C 34 53, 42 57, 48 57 C 54 57, 62 53, 64 46 C 58 46, 52 42, 48 44 C 44 42, 38 46, 32 46 Z" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.6" strokeLinejoin="round" />

          {/* Perky Triangular Ears with Cream Fluffy Inner Tufts */}
          <polygon points="34,31 24,11 44,24" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="33,28 28,16 39,24" fill="#FEF3C7" strokeLinejoin="round" />
          <polygon points="62,31 72,11 52,24" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="63,28 68,16 57,24" fill="#FEF3C7" strokeLinejoin="round" />

          {/* Glossy Black Button Eyes with Catchlights */}
          <ellipse cx="39" cy="40" rx="3.6" ry="4.4" fill="#1E1B4B" />
          <ellipse cx="57" cy="40" rx="3.6" ry="4.4" fill="#1E1B4B" />
          <circle cx="38" cy="38.5" r="1.5" fill="#FFFFFF" />
          <circle cx="56" cy="38.5" r="1.5" fill="#FFFFFF" />
          <circle cx="40.2" cy="41.5" r="0.7" fill="#FFFFFF" />
          <circle cx="58.2" cy="41.5" r="0.7" fill="#FFFFFF" />

          {/* Tiny Button Nose & Kitten Smile */}
          <ellipse cx="48" cy="47" rx="2" ry="1.4" fill="#451A03" />
          <path d="M 45 49 Q 48 52 51 49" stroke="#451A03" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Prominent Rosy Blush Cheeks */}
          <ellipse cx="33" cy="45" rx="4.2" ry="3" fill="#FB7185" opacity="0.7" />
          <ellipse cx="63" cy="45" rx="4.2" ry="3" fill="#FB7185" opacity="0.7" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 3. MINI ROBOT COMPANION (mini_robot)                 */}
      {/* ==================================================== */}
      {petId === 'mini_robot' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* High-Tech Sonar & Communication Ping */}
          {isCompanion && (
            <g className="pointer-events-none">
              <circle cx="50" cy="14" r="8" fill="none" stroke="#22D3EE" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
              <circle cx="18" cy="44" r="1.4" fill="#A5F3FC" className="animate-pulse" />
            </g>
          )}

          {/* Round Antenna with Golden Bulb */}
          <line x1="50" y1="26" x2="50" y2="16" stroke="#334155" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="50" cy="14" r="3.5" fill="#FDE047" stroke="#334155" strokeWidth="1.6" />

          {/* Stubby Floating Magnetic Ball Hands */}
          <circle cx="23" cy="51" r="5" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
          <circle cx="77" cy="51" r="5" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />

          {/* Chubby Capsule Bot Body */}
          <rect x="30" y="25" width="40" height="42" rx="19" fill="#F8FAFC" stroke="#334155" strokeWidth="2.4" />

          {/* Glossy Obsidian Visor */}
          <rect x="35" y="32" width="30" height="20" rx="10" fill="#0F172A" stroke="#334155" strokeWidth="1.8" />

          {/* Joyful Curved Cyan LED Eyes */}
          <path d="M 39 42 Q 43 37 47 42" stroke="#22D3EE" strokeWidth="2.6" strokeLinecap="round" fill="none" filter={`url(#petSoftGlow_${petId})`} />
          <path d="M 53 42 Q 57 37 61 42" stroke="#22D3EE" strokeWidth="2.6" strokeLinecap="round" fill="none" filter={`url(#petSoftGlow_${petId})`} />

          {/* Kawaii LED Pink Blush Dots */}
          <circle cx="39" cy="47" r="1.8" fill="#F472B6" opacity="0.9" />
          <circle cx="61" cy="47" r="1.8" fill="#F472B6" opacity="0.9" />

          {/* Chest Heart / Power Light */}
          <circle cx="50" cy="58" r="3.2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <circle cx="49" cy="57" r="1" fill="#FFFFFF" />

          {/* Dual Hover Thrusters */}
          <ellipse cx="43" cy="67" rx="4" ry="2.2" fill="#64748B" stroke="#334155" strokeWidth="1.4" />
          <ellipse cx="57" cy="67" rx="4" ry="2.2" fill="#64748B" stroke="#334155" strokeWidth="1.4" />
          <path d="M 40 69 Q 43 78 46 69 Z" fill="#38BDF8" opacity="0.85" />
          <path d="M 54 69 Q 57 78 60 69 Z" fill="#38BDF8" opacity="0.85" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 4. PHOENIX FLAME PET (phoenix_pet)                   */}
      {/* ==================================================== */}
      {petId === 'phoenix_pet' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Radiant Sunburst Rays (Ref 2 Top-Left) */}
          <g className="pointer-events-none opacity-80">
            <line x1="50" y1="18" x2="50" y2="6" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <line x1="72" y1="26" x2="82" y2="16" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <line x1="78" y1="50" x2="90" y2="50" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <line x1="28" y1="26" x2="18" y2="16" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <line x1="22" y1="50" x2="10" y2="50" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <polygon points="80,24 81.5,27 84,28 81.5,29 80,32 78.5,29 76,28 78.5,27" fill="#FDE047" />
            <polygon points="20,24 21.5,27 24,28 21.5,29 20,32 18.5,29 16,28 18.5,27" fill="#FDE047" />
          </g>

          {/* Curled Tail with Flame Feathers */}
          <path d="M 48 72 Q 40 86 50 92 Q 54 84 50 78" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 52 74 Q 58 88 52 94" stroke="#EF4444" strokeWidth="2.6" strokeLinecap="round" fill="none" />

          {/* Cute Scalloped Baby Flame Wings */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            <path d="M 38 48 C 16 38, 12 50, 22 58 C 28 60, 34 54, 38 50 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 22 45 L 30 54" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 62 48 C 84 38, 88 50, 78 58 C 72 60, 66 54, 62 50 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 78 45 L 70 54" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Chubby Buttercup Body with Soft Belly */}
          <ellipse cx="50" cy="62" rx="18" ry="20" fill="url(#kawaiiSunGold)" stroke="#78350F" strokeWidth="2.4" />
          <path d="M 44 56 Q 50 64 48 74" stroke="#FEF08A" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Stubby Front Paws Clutched Cutely */}
          <ellipse cx="44" cy="64" rx="3.5" ry="2.6" fill="#FDE047" stroke="#78350F" strokeWidth="1.4" />
          <ellipse cx="56" cy="64" rx="3.5" ry="2.6" fill="#FDE047" stroke="#78350F" strokeWidth="1.4" />

          {/* Round Kawaii Head */}
          <circle cx="50" cy="38" rx="18" ry="17" fill="url(#kawaiiSunGold)" stroke="#78350F" strokeWidth="2.4" />

          {/* Soft Flame Crest on Crown */}
          <path d="M 44 24 Q 48 10 52 15 Q 55 9 58 15 Q 56 23 55 25 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.8" strokeLinejoin="round" />

          {/* Oversized Shiny Button Eyes */}
          <ellipse cx="41" cy="38" rx="3.6" ry="4.5" fill="#451A03" />
          <ellipse cx="59" cy="38" rx="3.6" ry="4.5" fill="#451A03" />
          <circle cx="40" cy="36.5" r="1.5" fill="#FFFFFF" />
          <circle cx="58" cy="36.5" r="1.5" fill="#FFFFFF" />
          <circle cx="42.2" cy="39.5" r="0.7" fill="#FFFFFF" />
          <circle cx="60.2" cy="39.5" r="0.7" fill="#FFFFFF" />

          {/* Tiny Golden Beak & Smile */}
          <polygon points="48,43 52,43 50,46" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M 48 45 Q 50 48 52 45" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Rosy Peach Blush Cheeks */}
          <ellipse cx="34" cy="43" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.7" />
          <ellipse cx="66" cy="43" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.7" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 5. FROST DRAGON PET (frost_dragon)                   */}
      {/* ==================================================== */}
      {petId === 'frost_dragon' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Swirling Wind Trails & Snowflakes (Ref 1 Top-Right & Ref 2 Bottom-Left) */}
          <g className="pointer-events-none opacity-85">
            <path d="M 82 24 A 5 5 0 1 1 80 20" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 86 38 A 4 4 0 1 1 84 35" stroke="#7DD3FC" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <polygon points="18,36 19.5,39 22,40 19.5,41 18,44 16.5,41 14,40 16.5,39" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="1.5" fill="#E0F2FE" />
          </g>

          {/* Curled Tail with Playful Swirl Tip */}
          <path d="M 52 70 C 72 72, 82 82, 74 90 C 66 94, 64 84, 70 82" stroke="url(#kawaiiFrostDragon)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 52 70 C 72 72, 82 82, 74 90 C 66 94, 64 84, 70 82" stroke="#0369A1" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Scalloped Baby Frost Wings */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            <path d="M 38 46 C 16 34, 12 48, 22 56 C 28 58, 34 52, 38 48 Z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 22 44 L 32 52" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 62 46 C 84 34, 88 48, 78 56 C 72 58, 66 52, 62 48 Z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 78 44 L 68 52" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Chubby Sky-Blue Body */}
          <ellipse cx="50" cy="62" rx="18" ry="20" fill="url(#kawaiiFrostDragon)" stroke="#0369A1" strokeWidth="2.4" />
          {/* Pure Frost-Cream Belly with Curved Plates */}
          <ellipse cx="48" cy="64" rx="10" ry="14" fill="#F0FDFA" />
          <path d="M 42 59 Q 48 62 54 59 M 41 65 Q 48 68 55 65 M 42 71 Q 48 74 54 71" stroke="#BAE6FD" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Stubby Front Paws */}
          <ellipse cx="43" cy="63" rx="3.5" ry="2.6" fill="#7DD3FC" stroke="#0369A1" strokeWidth="1.4" />
          <ellipse cx="55" cy="63" rx="3.5" ry="2.6" fill="#7DD3FC" stroke="#0369A1" strokeWidth="1.4" />

          {/* Rounded Head with Dorsal Crest Frills */}
          <circle cx="48" cy="38" r="18" fill="url(#kawaiiFrostDragon)" stroke="#0369A1" strokeWidth="2.4" />

          {/* Rounded Ice Horns */}
          <path d="M 37 24 Q 33 12 41 16 Q 41 22 39 25 Z" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 55 24 Q 63 12 65 18 Q 61 22 57 25 Z" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round" />
          {/* Cheek / Head Frills */}
          <path d="M 64 29 Q 71 31 66 36 Q 73 38 67 43" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Joyful Curved Eyes (Ref 2 Bottom-Left) */}
          <path d="M 36 38 Q 40 33 44 38" stroke="#0C4A6E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M 52 38 Q 56 33 60 38" stroke="#0C4A6E" strokeWidth="2.6" strokeLinecap="round" fill="none" />

          {/* Tiny Nostril & Sweet Smile */}
          <circle cx="47" cy="41" r="0.6" fill="#0C4A6E" />
          <path d="M 45 44 Q 48 47 51 44" stroke="#0C4A6E" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Rosy Pink Blush Cheeks */}
          <ellipse cx="32" cy="43" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.75" />
          <ellipse cx="62" cy="43" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.75" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 6. GOLDEN COSMIC GRIFFIN (cosmic_griffin)             */}
      {/* ==================================================== */}
      {petId === 'cosmic_griffin' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Orbiting Starlight Sparkles (Ref 1 Bottom-Right) */}
          {isCompanion && (
            <g className="pointer-events-none animate-pet-orbit">
              <polygon points="16,24 18,27 22,28 18,29 16,33 14,29 10,28 14,27" fill="#FDE047" />
              <polygon points="84,20 85.5,23 88,24 85.5,25 84,28 82.5,25 80,24 82.5,23" fill="#FDE047" />
              <circle cx="82" cy="74" r="2" fill="#A78BFA" />
            </g>
          )}

          {/* Curled Tail Ending in a Golden Star (Exact match to Ref 1 Bottom-Right) */}
          <path d="M 54 70 C 74 72, 82 82, 76 90 C 70 94, 68 86, 74 80" stroke="url(#kawaiiCosmicNight)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 54 70 C 74 72, 82 82, 76 90 C 70 94, 68 86, 74 80" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <polygon points="76,68 78,73 83,73 79,76 81,81 76,78 72,81 74,76 70,73 75,73" fill="#FDE047" stroke="#B45309" strokeWidth="1.2" strokeLinejoin="round" />

          {/* Scalloped Midnight Wings with Stardust */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            <path d="M 38 46 C 14 32, 8 48, 20 58 C 28 60, 34 52, 38 48 Z" fill="#312E81" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
            <polygon points="18,44 19,46 21,46.5 19,47 18,49 17,47 15,46.5 17,46" fill="#FDE047" />
            <path d="M 62 46 C 86 32, 92 48, 80 58 C 72 60, 66 52, 62 48 Z" fill="#312E81" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
            <polygon points="82,44 83,46 85,46.5 83,47 82,49 81,47 79,46.5 81,46" fill="#FDE047" />
          </g>

          {/* Chubby Midnight-Indigo Body */}
          <ellipse cx="50" cy="62" rx="18" ry="20" fill="url(#kawaiiCosmicNight)" stroke="#0F172A" strokeWidth="2.4" />
          {/* Lavender Underbelly */}
          <ellipse cx="48" cy="64" rx="10" ry="14" fill="url(#kawaiiCosmicBelly)" />
          <path d="M 42 59 Q 48 62 54 59 M 41 65 Q 48 68 55 65 M 42 71 Q 48 74 54 71" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Stubby Front Paws */}
          <ellipse cx="43" cy="64" rx="3.5" ry="2.6" fill="#312E81" stroke="#0F172A" strokeWidth="1.4" />
          <ellipse cx="55" cy="64" rx="3.5" ry="2.6" fill="#312E81" stroke="#0F172A" strokeWidth="1.4" />

          {/* Round Head with Swept Royal Horns */}
          <circle cx="48" cy="38" r="18" fill="url(#kawaiiCosmicNight)" stroke="#0F172A" strokeWidth="2.4" />

          <path d="M 36 24 Q 30 10 38 14 Q 40 20 38 25 Z" fill="#1E1B4B" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 56 24 Q 64 10 66 16 Q 62 20 58 25 Z" fill="#1E1B4B" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />

          {/* Golden Starlight Constellation Freckles on Forehead */}
          <polygon points="48,27 49,29 51,29.5 49,30 48,32 47,30 45,29.5 47,29" fill="#FDE047" />
          <polygon points="42,31 42.8,32.2 44,32.5 42.8,33 42,34.2 41.2,33 40,32.5 41.2,32.2" fill="#FDE047" />
          <polygon points="54,31 54.8,32.2 56,32.5 54.8,33 54,34.2 53.2,33 52,32.5 53.2,32.2" fill="#FDE047" />

          {/* Joyful Closed Curved Eyes ^ ^ (Ref 1 Bottom-Right) */}
          <path d="M 37 38 Q 41 33 45 38" stroke="#C7D2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 53 38 Q 57 33 61 38" stroke="#C7D2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Sweet Smile */}
          <path d="M 46 44 Q 49 47 52 44" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Soft Lilac Blush Cheeks */}
          <ellipse cx="33" cy="43" rx="4.5" ry="3.2" fill="#C084FC" opacity="0.65" />
          <ellipse cx="65" cy="43" rx="4.5" ry="3.2" fill="#C084FC" opacity="0.65" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 7. MONARCH SPRING BUTTERFLY (spring_butterfly_pet)   */}
      {/* ==================================================== */}
      {petId === 'spring_butterfly_pet' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Spring Sakura Petals & Pollen Sparkles */}
          {isCompanion && (
            <g className="pointer-events-none">
              <circle cx="20" cy="30" r="1.6" fill="#FDE047" className="animate-pet-pollen-1" />
              <circle cx="82" cy="32" r="1.6" fill="#FDE047" className="animate-pet-pollen-2" />
              <path d="M 80 64 C 84 60, 88 64, 84 68 C 80 68, 78 64, 80 64 Z" fill="#FDA4AF" opacity="0.8" />
            </g>
          )}

          {/* Rounded Scalloped Monarch Wings with Stained Glass Pattern */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            {/* Left Wing */}
            <path d="M 46 46 C 14 16, 8 50, 44 58 Z" fill="#FB923C" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 46 46 C 28 32, 20 44, 40 52" stroke="#1E293B" strokeWidth="1.6" fill="none" />
            <circle cx="16" cy="32" r="1.2" fill="#FFFFFF" />
            <circle cx="22" cy="24" r="1.2" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="1.2" fill="#FFFFFF" />
            <path d="M 46 56 C 22 66, 26 84, 46 68 Z" fill="#F97316" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
            {/* Right Wing */}
            <path d="M 54 46 C 86 16, 92 50, 56 58 Z" fill="#FB923C" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 54 46 C 72 32, 80 44, 60 52" stroke="#1E293B" strokeWidth="1.6" fill="none" />
            <circle cx="84" cy="32" r="1.2" fill="#FFFFFF" />
            <circle cx="78" cy="24" r="1.2" fill="#FFFFFF" />
            <circle cx="70" cy="20" r="1.2" fill="#FFFFFF" />
            <path d="M 54 56 C 78 66, 74 84, 54 68 Z" fill="#F97316" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
          </g>

          {/* Chubby Fairy / Caterpillar Body */}
          <ellipse cx="50" cy="54" rx="9" ry="18" fill="#FDBA74" stroke="#1E293B" strokeWidth="2.2" />

          {/* Curled Antennae with Golden Tips */}
          <path d="M 47 32 Q 40 18 34 20 M 53 32 Q 60 18 66 20" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="20" r="1.8" fill="#FBBF24" />
          <circle cx="66" cy="20" r="1.8" fill="#FBBF24" />

          {/* Holding a Cute Pink Flower Blossom (Ref 2 Bottom-Right) */}
          <path d="M 49 56 Q 51 64 52 72" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="49" cy="54" r="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.8" />
          <circle cx="49" cy="54" r="1" fill="#FDE047" />

          {/* Round Kawaii Face */}
          <circle cx="50" cy="36" r="11" fill="#FED7AA" stroke="#1E293B" strokeWidth="2" />
          <ellipse cx="46" cy="35" rx="2.5" ry="3.2" fill="#0F172A" />
          <ellipse cx="54" cy="35" rx="2.5" ry="3.2" fill="#0F172A" />
          <circle cx="45" cy="34" r="1" fill="#FFFFFF" />
          <circle cx="53" cy="34" r="1" fill="#FFFFFF" />
          <path d="M 48 39 Q 50 41 52 39" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Rosy Pink Blush Cheeks */}
          <circle cx="42" cy="38" r="2.2" fill="#FB7185" opacity="0.7" />
          <circle cx="58" cy="38" r="2.2" fill="#FB7185" opacity="0.7" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 8. ACORN HARVESTER SQUIRREL (autumn_squirrel_pet)   */}
      {/* ==================================================== */}
      {petId === 'autumn_squirrel_pet' && (
        <g className={isCompanion ? 'animate-pet-ground' : ''}>
          {/* Swirling Autumn Leaves (Ref 2 Top-Right) */}
          {isCompanion && (
            <g className="pointer-events-none opacity-80">
              <path d="M 22 42 C 26 38, 30 42, 26 46 C 22 46, 20 42, 22 42 Z" fill="#EA580C" className="animate-spin" style={{ animationDuration: '6s', transformOrigin: '24px 44px' }} />
              <path d="M 80 52 C 84 48, 88 52, 84 56 C 80 56, 78 52, 80 52 Z" fill="#F59E0B" className="animate-pulse" />
            </g>
          )}

          {/* Enormous Arched Bushy Tail */}
          <path d="M 42 78 C 6 72, 2 22, 30 12 C 44 8, 52 22, 38 40 C 30 50, 38 68, 48 72 Z" fill="url(#kawaiiAutumnOrange)" stroke="#78350F" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 26 18 C 16 26, 16 50, 34 60" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />

          {/* Chubby Squirrel Body */}
          <ellipse cx="58" cy="65" rx="17" ry="19" fill="url(#kawaiiAutumnOrange)" stroke="#78350F" strokeWidth="2.4" />
          <ellipse cx="54" cy="67" rx="8.5" ry="13" fill="#FEF3C7" />

          {/* Chubby Head & Tufted Ears */}
          <circle cx="60" cy="42" r="15" fill="url(#kawaiiAutumnOrange)" stroke="#78350F" strokeWidth="2.4" />
          <polygon points="54,34 50,20 58,28" fill="#EA580C" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="62,32 68,18 68,30" fill="#EA580C" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />

          {/* Autumn Red Oak Leaf Resting on Head (Exact match to Ref 2 Top-Right) */}
          <path d="M 45 22 C 39 16, 45 8, 55 10 C 63 12, 67 20, 59 26 C 51 26, 47 24, 45 22 Z" fill="#DC2626" stroke="#78350F" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M 47 20 L 61 14 M 51 18 L 55 14 M 55 17 L 58 13" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Large Glossy Dark Button Eye with Bright Catchlight */}
          <ellipse cx="64" cy="40" rx="3.8" ry="4.5" fill="#1E293B" />
          <circle cx="63" cy="38.5" r="1.6" fill="#FFFFFF" />
          <circle cx="65.5" cy="41.5" r="0.8" fill="#FFFFFF" />

          {/* Snout with Kitten Smile */}
          <ellipse cx="71" cy="45" rx="2" ry="1.4" fill="#451A03" />
          <path d="M 68 47 Q 72 50 75 47" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Rosy Blush Cheek */}
          <ellipse cx="58" cy="46" rx="4" ry="2.8" fill="#FB7185" opacity="0.75" />

          {/* Clutched Golden Acorn */}
          <path d="M 44 56 Q 52 52 60 56 L 58 60 Q 52 57 46 60 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.2" />
          <path d="M 46 59 Q 44 73 52 75 Q 60 73 58 59 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.4" />
          <circle cx="49" cy="64" r="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* Stubby Paws Holding Acorn */}
          <ellipse cx="46" cy="62" rx="3.2" ry="2.4" fill="#FDBA74" stroke="#78350F" strokeWidth="1.2" />
          <ellipse cx="58" cy="62" rx="3.2" ry="2.4" fill="#FDBA74" stroke="#78350F" strokeWidth="1.2" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 9. FROSTY SNOWMAN PAL (winter_snowman_pet)           */}
      {/* ==================================================== */}
      {petId === 'winter_snowman_pet' && (
        <g className={isCompanion ? 'animate-pet-ground' : ''}>
          {/* Swirling Snowflakes */}
          {isCompanion && (
            <g className="pointer-events-none opacity-85">
              <circle cx="18" cy="38" r="1.5" fill="#FFFFFF" className="animate-pet-snow-1" />
              <circle cx="82" cy="44" r="1.8" fill="#E0F2FE" className="animate-pet-snow-2" />
              <polygon points="75,20 76.5,23 79,24 76.5,25 75,28 73.5,25 71,24 73.5,23" fill="#FFFFFF" className="animate-pet-snow-3" />
            </g>
          )}

          {/* Twig Arms Waving Happily */}
          <path d="M 38 52 L 18 44 M 24 46 L 20 40" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 62 52 L 82 42 M 74 45 L 78 39" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />

          {/* Two Chubby Stacked Snowballs */}
          <circle cx="50" cy="70" r="22" fill="url(#kawaiiWhiteDown)" stroke="#64748B" strokeWidth="2.4" />
          <circle cx="50" cy="40" r="17" fill="url(#kawaiiWhiteDown)" stroke="#64748B" strokeWidth="2.4" />

          {/* Striped Cozy Red-and-Green Scarf with Fringe */}
          <path d="M 36 47 Q 50 53 64 47 L 66 54 Q 50 60 34 54 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M 54 51 Q 65 55 63 68 L 57 68 Q 59 57 52 53 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="41" y1="49" x2="42" y2="55" stroke="#22C55E" strokeWidth="2.4" />
          <line x1="56" y1="56" x2="60" y2="60" stroke="#22C55E" strokeWidth="2.4" />
          <path d="M 57 68 L 57 72 M 60 68 L 60 72 M 63 68 L 63 72" stroke="#FEF08A" strokeWidth="1.6" />

          {/* Mini Tilted Black Top Hat with Holly Sprig */}
          <ellipse cx="50" cy="25" rx="16" ry="3.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.4" />
          <rect x="41" y="12" width="18" height="13" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1.4" />
          <rect x="41" y="21" width="18" height="3" fill="#DC2626" />
          <circle cx="43" cy="21" r="1.5" fill="#15803D" />
          <circle cx="41.5" cy="21" r="1.2" fill="#EF4444" />

          {/* Shiny Coal Button Eyes */}
          <circle cx="44" cy="37" r="2.6" fill="#0F172A" />
          <circle cx="43" cy="36" r="0.9" fill="#FFFFFF" />
          <circle cx="56" cy="37" r="2.6" fill="#0F172A" />
          <circle cx="55" cy="36" r="0.9" fill="#FFFFFF" />

          {/* Tiny Cute Carrot Nose Nub */}
          <polygon points="49,39 58,41 49,43" fill="#EA580C" stroke="#9A3412" strokeWidth="0.8" strokeLinejoin="round" />

          {/* Coal Dot Smile */}
          <circle cx="44" cy="46" r="1.1" fill="#0F172A" />
          <circle cx="47" cy="47.5" r="1.1" fill="#0F172A" />
          <circle cx="50" cy="48" r="1.1" fill="#0F172A" />
          <circle cx="53" cy="47.5" r="1.1" fill="#0F172A" />
          <circle cx="56" cy="46" r="1.1" fill="#0F172A" />

          {/* Giant Rosy Pink Blush Cheeks */}
          <circle cx="36" cy="43" r="3.6" fill="#FB7185" opacity="0.75" />
          <circle cx="64" cy="43" r="3.6" fill="#FB7185" opacity="0.75" />

          {/* Coal Body Buttons */}
          <circle cx="50" cy="65" r="2.2" fill="#0F172A" />
          <circle cx="50" cy="74" r="2.2" fill="#0F172A" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 10. PEACE DOVE COMPANION (mlk_peace_dove_pet)        */}
      {/* ==================================================== */}
      {petId === 'mlk_peace_dove_pet' && (
        <g className={isCompanion ? 'animate-pet-hover' : ''}>
          {/* Radiant Golden Peace Halo */}
          {isCompanion && (
            <g className="pointer-events-none">
              <circle cx="50" cy="46" r="32" fill="none" stroke="#FEF08A" strokeWidth="1.6" strokeDasharray="6 3" opacity="0.85" className="animate-spin" style={{ animationDuration: '20s', transformOrigin: '50px 46px' }} />
              <polygon points="20,24 21.5,27 24,28 21.5,29 20,32 18.5,29 16,28 18.5,27" fill="#FEF08A" />
              <polygon points="80,24 81.5,27 84,28 81.5,29 80,32 78.5,29 76,28 78.5,27" fill="#FEF08A" />
            </g>
          )}

          {/* Fan Tail Feathers */}
          <path d="M 32 60 C 14 66, 12 76, 20 82 C 28 80, 34 72, 38 64 Z" fill="url(#kawaiiWhiteDown)" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />

          {/* Chubby Round Dove Body */}
          <ellipse cx="50" cy="56" rx="22" ry="20" fill="url(#kawaiiWhiteDown)" stroke="#64748B" strokeWidth="2.4" />

          {/* Gentle Curved Flight Wings */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            <path d="M 44 48 C 20 22, 38 16, 52 32 Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 52 46 C 46 20, 64 14, 74 30 Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
          </g>

          {/* Round Kawaii Head */}
          <circle cx="68" cy="42" r="14" fill="url(#kawaiiWhiteDown)" stroke="#64748B" strokeWidth="2.4" />

          {/* Big Glossy Dark Eye with Catchlight */}
          <circle cx="70" cy="40" r="3.8" fill="#0F172A" />
          <circle cx="69" cy="38.8" r="1.4" fill="#FFFFFF" />
          <circle cx="71.2" cy="41.2" r="0.7" fill="#FFFFFF" />

          {/* Rosy Blush Cheek */}
          <ellipse cx="64" cy="45" rx="3.5" ry="2.6" fill="#FB7185" opacity="0.7" />

          {/* Golden Beak Holding Fresh Green Olive Branch */}
          <polygon points="79,42 88,44 79,46" fill="#F59E0B" stroke="#D97706" strokeWidth="1" strokeLinejoin="round" />
          <path d="M 76 46 Q 66 58 56 54" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 70 49 Q 70 43 64 46 Q 66 51 70 49 Z" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
          <path d="M 62 54 Q 60 48 54 51 Q 57 56 62 54 Z" fill="#22C55E" stroke="#15803D" strokeWidth="0.8" />
          <circle cx="66" cy="52" r="2" fill="#14532D" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 11. SPOOKY BOO GHOST (halloween_ghost_pet)           */}
      {/* ==================================================== */}
      {petId === 'halloween_ghost_pet' && (
        <g className={isCompanion ? 'animate-pet-hover-fast' : ''}>
          {/* Will-o'-the-Wisp Spirit Orbs */}
          {isCompanion && (
            <g className="pointer-events-none">
              <circle cx="16" cy="36" r="3.5" fill="#67E8F9" opacity="0.5" className="animate-ping" />
              <circle cx="16" cy="36" r="2" fill="#FFFFFF" />
              <circle cx="84" cy="48" r="3" fill="#C084FC" opacity="0.5" className="animate-ping" />
              <circle cx="84" cy="48" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Chubby Floating Ghost Sheet Body */}
          <path
            d="M 28 46 C 28 20, 72 20, 72 46 C 72 68, 78 74, 72 80 C 66 84, 62 76, 56 82 C 50 76, 46 84, 40 78 C 34 84, 30 76, 24 80 C 18 74, 28 68, 28 46 Z"
            fill="url(#kawaiiGhostBody)"
            stroke="#0891B2"
            strokeWidth="2.4"
            strokeLinejoin="round"
            filter={`url(#petSoftGlow_${petId})`}
          />

          {/* Cute Waving Stubby Arms */}
          <path d="M 28 50 Q 14 42 20 34" stroke="url(#kawaiiGhostBody)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 28 50 Q 14 42 20 34" stroke="#0891B2" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 72 50 Q 86 42 80 34" stroke="url(#kawaiiGhostBody)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 72 50 Q 86 42 80 34" stroke="#0891B2" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Big Glossy Black Button Eyes */}
          <ellipse cx="43" cy="42" rx="4.2" ry="5.5" fill="#0F172A" />
          <ellipse cx="57" cy="42" rx="4.2" ry="5.5" fill="#0F172A" />
          <circle cx="41.5" cy="40" r="1.8" fill="#FFFFFF" />
          <circle cx="55.5" cy="40" r="1.8" fill="#FFFFFF" />
          <circle cx="44" cy="43.5" r="0.9" fill="#FFFFFF" />
          <circle cx="58" cy="43.5" r="0.9" fill="#FFFFFF" />

          {/* Big Rosy Pink Blush Cheeks */}
          <circle cx="35" cy="48" r="3.6" fill="#F472B6" opacity="0.7" />
          <circle cx="65" cy="48" r="3.6" fill="#F472B6" opacity="0.7" />

          {/* Open Happy Smile (:D) */}
          <path d="M 46 50 Q 50 57 54 50 Z" fill="#0F172A" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 12. GINGERBREAD BUDDY (holiday_gingerbread_pet)       */}
      {/* ==================================================== */}
      {petId === 'holiday_gingerbread_pet' && (
        <g className={isCompanion ? 'animate-pet-ground' : ''}>
          {/* Sugar Dust Sparkles */}
          {isCompanion && (
            <g className="pointer-events-none opacity-80">
              <circle cx="20" cy="30" r="1.5" fill="#FFFFFF" className="animate-pulse" />
              <polygon points="82,40 83.5,43 86,44 83.5,45 82,48 80.5,45 78,44 80.5,43" fill="#FDE047" className="animate-ping" opacity="0.7" />
            </g>
          )}

          {/* Baked Cookie Body & Limbs */}
          <path
            d="M 44 38 L 22 46 C 18 48, 16 54, 20 58 C 24 62, 30 60, 34 54 L 38 56 L 36 78 C 35 84, 40 88, 46 88 C 50 88, 52 84, 52 78 L 52 70 L 52 78 C 52 84, 54 88, 58 88 C 64 88, 69 84, 68 78 L 66 56 L 70 54 C 74 60, 80 62, 84 58 C 88 54, 86 48, 82 46 L 60 38 Z"
            fill="url(#kawaiiGingerBake)"
            stroke="#78350F"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* Round Gingerbread Head */}
          <circle cx="52" cy="30" r="16" fill="url(#kawaiiGingerBake)" stroke="#78350F" strokeWidth="2.4" />

          {/* Piped Royal Icing Hair Swirl */}
          <path d="M 44 20 Q 52 14 60 20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* White Icing Cuffs on Wrists & Ankles */}
          <path d="M 22 52 L 25 49 L 28 53" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 76 52 L 79 49 L 82 53" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 38 80 L 41 77 L 44 81" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 60 80 L 63 77 L 66 81" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Glossy Dark Button Eyes with Catchlights */}
          <circle cx="47" cy="28" r="3" fill="#0F172A" />
          <circle cx="46" cy="27" r="1.1" fill="#FFFFFF" />
          <circle cx="57" cy="28" r="3" fill="#0F172A" />
          <circle cx="56" cy="27" r="1.1" fill="#FFFFFF" />

          {/* Piped White Icing Smile */}
          <path d="M 47 34 Q 52 38 57 34" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Pink Frosting Blush Cheeks */}
          <circle cx="42" cy="32" r="2.8" fill="#FB7185" opacity="0.75" />
          <circle cx="62" cy="32" r="2.8" fill="#FB7185" opacity="0.75" />

          {/* Jeweled Gumdrop Buttons */}
          <circle cx="52" cy="46" r="3" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
          <circle cx="51" cy="45" r="1" fill="#FFFFFF" />
          <circle cx="52" cy="56" r="3" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
          <circle cx="51" cy="55" r="1" fill="#FFFFFF" />
          <circle cx="52" cy="66" r="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <circle cx="51" cy="65" r="1" fill="#FFFFFF" />

          {/* Mini Striped Candy Cane */}
          <path d="M 16 64 L 16 41 A 4.5 4.5 0 0 1 25 41" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <path d="M 16 64 L 16 41 A 4.5 4.5 0 0 1 25 41" stroke="#DC2626" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="3 3" fill="none" />
        </g>
      )}

      {/* ==================================================== */}
      {/* 13. CRIMSON BABY DRAGON (dragon_pet_premium)         */}
      {/* ==================================================== */}
      {petId === 'dragon_pet_premium' && (
        <g className={isCompanion ? 'animate-pet-hover-fast' : ''}>
          {/* Floating Sakura Blossoms & Petals (Exact match to Ref 1 Top-Left) */}
          <g className="pointer-events-none">
            {/* Sakura Flower 1 */}
            <g transform="translate(18, 30) scale(0.7)">
              <circle cx="-4" cy="-4" r="3.5" fill="#FDA4AF" />
              <circle cx="4" cy="-4" r="3.5" fill="#FDA4AF" />
              <circle cx="-5" cy="3" r="3.5" fill="#FDA4AF" />
              <circle cx="5" cy="3" r="3.5" fill="#FDA4AF" />
              <circle cx="0" cy="5" r="3.5" fill="#FDA4AF" />
              <circle cx="0" cy="0" r="2" fill="#FDE047" stroke="#EA580C" strokeWidth="0.8" />
            </g>
            {/* Sakura Flower 2 */}
            <g transform="translate(82, 22) scale(0.65)">
              <circle cx="-4" cy="-4" r="3.5" fill="#FDA4AF" />
              <circle cx="4" cy="-4" r="3.5" fill="#FDA4AF" />
              <circle cx="-5" cy="3" r="3.5" fill="#FDA4AF" />
              <circle cx="5" cy="3" r="3.5" fill="#FDA4AF" />
              <circle cx="0" cy="5" r="3.5" fill="#FDA4AF" />
              <circle cx="0" cy="0" r="2" fill="#FDE047" stroke="#EA580C" strokeWidth="0.8" />
            </g>
            {/* Floating Petals */}
            <path d="M 20 18 C 24 14, 28 18, 24 22 C 20 22, 18 18, 20 18 Z" fill="#F472B6" opacity="0.85" className="animate-pet-pollen-1" />
            <path d="M 18 48 C 22 44, 26 48, 22 52 C 18 52, 16 48, 18 48 Z" fill="#F472B6" opacity="0.85" className="animate-pet-pollen-2" />
            <path d="M 84 38 C 88 34, 92 38, 88 42 C 84 42, 82 38, 84 38 Z" fill="#F472B6" opacity="0.85" className="animate-pet-pollen-1" />
          </g>

          {/* Curled Chubby Tail with Heart Scale Accents (Ref 1 Top-Left) */}
          <path d="M 54 70 C 74 72, 82 82, 74 90 C 66 94, 62 82, 70 80" stroke="url(#kawaiiPinkDragon)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 54 70 C 74 72, 82 82, 74 90 C 66 94, 62 82, 70 80" stroke="#7F1D1D" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M 72 84 C 74 81, 78 83, 76 86 C 74 88, 70 86, 72 84 Z" fill="#F43F5E" />

          {/* Cute Scalloped Dragon Wings with Cream Webbing */}
          <g className={isCompanion ? 'animate-pet-wing' : ''}>
            <path d="M 38 46 C 16 34, 10 48, 22 56 C 28 58, 34 52, 38 48 Z" fill="#FEF3C7" stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 22 44 L 32 52" stroke="#FDA4AF" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 60 46 C 82 34, 88 48, 76 56 C 70 58, 64 52, 60 48 Z" fill="#FEF3C7" stroke="#7F1D1D" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 76 44 L 66 52" stroke="#FDA4AF" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Chubby Coral-Pink Body */}
          <ellipse cx="48" cy="62" rx="18" ry="20" fill="url(#kawaiiPinkDragon)" stroke="#7F1D1D" strokeWidth="2.4" />
          {/* Soft Cream Underbelly with Curved Segment Lines */}
          <ellipse cx="46" cy="64" rx="10" ry="14" fill="url(#kawaiiCreamBelly)" />
          <path d="M 40 59 Q 46 62 52 59 M 39 65 Q 46 68 53 65 M 40 71 Q 46 74 52 71" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Stubby Front Paws Folded on Belly */}
          <path d="M 40 58 Q 36 63 42 66" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" fill="#FDA4AF" />
          <path d="M 52 58 Q 56 63 50 66" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" fill="#FDA4AF" />

          {/* Stubby Hind Legs with Rounded Claws */}
          <ellipse cx="38" cy="76" rx="4.5" ry="3.5" fill="#FDA4AF" stroke="#7F1D1D" strokeWidth="1.8" />
          <ellipse cx="56" cy="76" rx="4.5" ry="3.5" fill="#FDA4AF" stroke="#7F1D1D" strokeWidth="1.8" />

          {/* Giant Round Kawaii Head */}
          <circle cx="48" cy="38" r="18" fill="url(#kawaiiPinkDragon)" stroke="#7F1D1D" strokeWidth="2.4" />

          {/* Rounded Soft Horns */}
          <path d="M 37 24 Q 31 12 40 14 Q 41 20 39 25 Z" fill="#FB7185" stroke="#7F1D1D" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 55 24 Q 63 12 66 17 Q 62 21 57 25 Z" fill="#FB7185" stroke="#7F1D1D" strokeWidth="2" strokeLinejoin="round" />

          {/* 3 Tiered Cheek / Head Frill Scales on Right (Ref 1 Top-Left) */}
          <path d="M 64 28 Q 72 30 66 35 Q 74 38 67 43 Q 73 46 65 49" stroke="#7F1D1D" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Large Glossy Dark Button Eyes with Double Catchlights */}
          <ellipse cx="38" cy="38" rx="3.6" ry="4.5" fill="#2E1010" />
          <ellipse cx="54" cy="38" rx="3.6" ry="4.5" fill="#2E1010" />
          <circle cx="37" cy="36.5" r="1.5" fill="#FFFFFF" />
          <circle cx="53" cy="36.5" r="1.5" fill="#FFFFFF" />
          <circle cx="39.2" cy="39.5" r="0.7" fill="#FFFFFF" />
          <circle cx="55.2" cy="39.5" r="0.7" fill="#FFFFFF" />

          {/* Tiny Nostril Dots */}
          <circle cx="44.5" cy="41.5" r="0.6" fill="#7F1D1D" />
          <circle cx="47.5" cy="41.5" r="0.6" fill="#7F1D1D" />

          {/* Sweet Low Curved Smile */}
          <path d="M 43 44.5 Q 46 47.5 49 44.5" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Prominent Rosy Pink Circular Blush Cheeks */}
          <ellipse cx="32" cy="42.5" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.75" />
          <ellipse cx="60" cy="42.5" rx="4.5" ry="3.2" fill="#FB7185" opacity="0.75" />
        </g>
      )}
    </g>
  );
}
