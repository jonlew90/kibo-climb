import React from 'react';

export default function Mascot({ mood = 'happy', className = 'w-24 h-24' }) {
  // Energetic & cute fox/panda mascot Kibo
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
          <linearGradient id="kiboCheeks" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9F1C" />
            <stop offset="100%" stopColor="#FF4081" />
          </linearGradient>
        </defs>

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

        {/* Star Badge on forehead */}
        <path d="M 100 52 L 103 60 L 111 60 L 105 65 L 107 73 L 100 68 L 93 73 L 95 65 L 89 60 L 97 60 Z" fill="#F7B801" />
      </svg>
    </div>
  );
}
