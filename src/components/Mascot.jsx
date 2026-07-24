import React from 'react';

export default function Mascot({ mood = 'happy', equipped = [], className = 'w-24 h-24' }) {
  // Normalize equipped to an array of item IDs
  const isEquipped = (itemId) => Array.isArray(equipped) ? equipped.includes(itemId) : false;

  return (
    <div className={`relative inline-block ${className} animate-pulse-glow`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="kiboBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7E47" />
            <stop offset="100%" stopColor="#E0531F" />
          </linearGradient>
          <linearGradient id="kiboEars" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#F7B801" />
          </linearGradient>
          <linearGradient id="capeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4757" />
            <stop offset="100%" stopColor="#C0392B" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A896" />
            <stop offset="100%" stopColor="#028090" />
          </linearGradient>
        </defs>

        {/* --- BACK LAYER: SUPERHERO CAPE --- */}
        {isEquipped('cape') && (
          <g id="accessory-cape">
            {/* Left Cape Fold */}
            <path d="M 40 120 Q 15 150 10 185 Q 45 175 60 145 Z" fill="url(#capeGrad)" />
            {/* Right Cape Fold */}
            <path d="M 160 120 Q 185 150 190 185 Q 155 175 140 145 Z" fill="url(#capeGrad)" />
            {/* Cape Collar Strap */}
            <path d="M 50 130 Q 100 145 150 130" fill="none" stroke="#FFD700" strokeWidth="5" />
            {/* Cape Crest Gem */}
            <circle cx="100" cy="138" r="6" fill="#00A896" stroke="#FFD700" strokeWidth="2" />
          </g>
        )}

        {/* Outer Head background circle */}
        <circle cx="100" cy="108" r="76" fill="url(#kiboBody)" />

        {/* Left Ear */}
        <polygon points="35,65 15,10 65,35" fill="url(#kiboBody)" />
        <polygon points="37,58 24,20 58,38" fill="url(#kiboEars)" />

        {/* Right Ear */}
        <polygon points="165,65 185,10 135,35" fill="url(#kiboBody)" />
        <polygon points="163,58 176,20 142,38" fill="url(#kiboEars)" />

        {/* Cream Face patch */}
        <ellipse cx="100" cy="120" rx="54" ry="46" fill="#FFFDF9" />

        {/* Cute Eyes based on mood */}
        {mood === 'celebrate' || mood === 'correct' ? (
          <>
            {/* Excited Happy Eyes ^ ^ */}
            <path d="M 68 100 Q 80 82 92 100" fill="none" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
            <path d="M 108 100 Q 120 82 132 100" fill="none" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
          </>
        ) : mood === 'incorrect' ? (
          <>
            {/* Oops Eyes > < */}
            <path d="M 72 92 L 88 108 M 88 92 L 72 108" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
            <path d="M 112 92 L 128 108 M 128 92 L 112 108" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Standard Big Sparkly Eyes */}
            <circle cx="78" cy="100" r="11" fill="#1E293B" />
            <circle cx="122" cy="100" r="11" fill="#1E293B" />
            <circle cx="81" cy="96" r="4.5" fill="#FFFFFF" />
            <circle cx="125" cy="96" r="4.5" fill="#FFFFFF" />
          </>
        )}

        {/* Cute Rosy Cheeks */}
        <ellipse cx="60" cy="116" rx="9" ry="6" fill="#FF4081" opacity="0.6" />
        <ellipse cx="140" cy="116" rx="9" ry="6" fill="#FF4081" opacity="0.6" />

        {/* Cute Button Nose */}
        <ellipse cx="100" cy="114" rx="7" ry="5" fill="#1E293B" />

        {/* Smiling Mouth */}
        <path d="M 90 123 Q 100 134 110 123" fill="none" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />

        {/* Star Badge on forehead (hidden if wearing cap or crown) */}
        {!isEquipped('cap') && !isEquipped('crown') && (
          <path d="M 100 52 L 103 60 L 111 60 L 105 65 L 107 73 L 100 68 L 93 73 L 95 65 L 89 60 L 97 60 Z" fill="#F7B801" />
        )}

        {/* --- EYES ACCESSORY: AVIATOR GOGGLES --- */}
        {isEquipped('goggles') && (
          <g id="accessory-goggles">
            {/* Goggles Leather Strap */}
            <path d="M 26 88 Q 100 78 174 88" fill="none" stroke="#5D4037" strokeWidth="8" />
            {/* Left Lens Frame */}
            <circle cx="76" cy="94" r="19" fill="#1E293B" stroke="#D4AF37" strokeWidth="4" />
            <circle cx="76" cy="94" r="14" fill="#00C9A7" opacity="0.75" />
            <circle cx="72" cy="90" r="4" fill="#FFFFFF" opacity="0.8" />

            {/* Right Lens Frame */}
            <circle cx="124" cy="94" r="19" fill="#1E293B" stroke="#D4AF37" strokeWidth="4" />
            <circle cx="124" cy="94" r="14" fill="#00C9A7" opacity="0.75" />
            <circle cx="120" cy="90" r="4" fill="#FFFFFF" opacity="0.8" />

            {/* Bridge */}
            <rect x="92" y="90" width="16" height="6" rx="3" fill="#D4AF37" />
          </g>
        )}

        {/* --- HEAD ACCESSORY: BASEBALL CAP --- */}
        {isEquipped('cap') && (
          <g id="accessory-cap">
            {/* Dome of Cap */}
            <path d="M 46 65 Q 100 20 154 65 Z" fill="url(#capGrad)" stroke="#01626E" strokeWidth="3" />
            {/* Visor Brim */}
            <path d="M 40 64 Q 100 48 160 64 Q 130 82 40 64 Z" fill="#FF6B35" stroke="#E0531F" strokeWidth="3" />
            {/* Front Star Logo */}
            <circle cx="100" cy="48" r="9" fill="#FFFDF9" />
            <path d="M 100 43 L 102 47 L 106 47 L 103 50 L 104 54 L 100 51 L 96 54 L 97 50 L 94 47 L 98 47 Z" fill="#FF6B35" />
          </g>
        )}

        {/* --- HEAD ACCESSORY: ROYAL CROWN --- */}
        {isEquipped('crown') && (
          <g id="accessory-crown">
            {/* Base Band */}
            <path d="M 52 50 L 148 50 L 144 58 L 56 58 Z" fill="#DAA520" />
            <rect x="52" y="52" width="96" height="7" rx="3.5" fill="url(#crownGrad)" stroke="#B8860B" strokeWidth="2" />
            {/* 3 Crown Spikes */}
            <polygon points="56,52 46,18 78,38 100,12 122,38 154,18 144,52" fill="url(#crownGrad)" stroke="#B8860B" strokeWidth="2.5" />
            {/* Jewels on tips */}
            <circle cx="46" cy="18" r="4.5" fill="#FF4757" />
            <circle cx="100" cy="12" r="6" fill="#00A896" />
            <circle cx="154" cy="18" r="4.5" fill="#FF4757" />
            {/* Center Band Ruby */}
            <polygon points="100,47 104,52 100,57 96,52" fill="#FF4757" />
          </g>
        )}
      </svg>
    </div>
  );
}
