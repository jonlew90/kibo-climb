import React, { useEffect, useState } from 'react';
import { BRAND_CONFIG } from '../config/brand';
import { soundFx } from '../utils/audio';

export default function CinematicSplash({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Trigger sound chime after brief layout mount
    const audioTimer = setTimeout(() => {
      soundFx.playBrandIntroChime();
    }, 120);

    // Auto-dismiss transition trigger
    const exitTimer = setTimeout(() => {
      handleDismiss();
    }, 2000);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        zIndex: 999999,
        backgroundColor: '#05070e',
        backgroundImage: 'radial-gradient(circle at center, #101935 0%, #080c1a 60%, #03050a 100%)'
      }}
      className={`fixed inset-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer transition-opacity duration-500 ease-out transform-gpu will-change-opacity ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Kibo Climb Splash Screen"
      role="banner"
    >
      {/* Background Subtle Mountain Range Silhouette & Warm Sunrise */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Soft Golden Sunrise Orb Behind Peak */}
        <div
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(234, 88, 12, 0.12) 40%, rgba(99, 102, 241, 0.05) 70%, transparent 100%)'
          }}
          className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-2xl animate-pulse transform-gpu"
        />

        {/* Horizon Golden Lens Flare */}
        <div className="absolute w-[300px] sm:w-[500px] h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent blur-[1px] opacity-75 animate-cinematic-flare transform-gpu" />
      </div>

      {/* Main Brand Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg">
        {/* Crisp Glowing Summit Silhouette + Mascot */}
        <div className="relative mb-6 animate-summit-rise transform-gpu">
          {/* Outer Glowing Emblem Squircle */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-3 bg-gradient-to-b from-amber-500/20 via-slate-900/80 to-slate-950 border-2 border-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <img
              src="/favicon.svg"
              alt="Kibo Climb Logo"
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Glowing Summit Star Sparkle */}
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-300 blur-[2px] animate-ping" />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#F59E0B]" />
        </div>

        {/* Brand Name Kinetic Title */}
        <h1
          style={{
            textShadow: '0 0 25px rgba(245, 158, 11, 0.5), 0 2px 10px rgba(0, 0, 0, 0.8)'
          }}
          className="text-3xl sm:text-5xl font-black tracking-[0.25em] uppercase text-white animate-brand-reveal transform-gpu"
        >
          {BRAND_CONFIG.rootBrand}
        </h1>

        {/* High-Contrast Gold Accent Tagline */}
        <p className="mt-3 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-tagline-reveal transform-gpu">
          {BRAND_CONFIG.tagline}
        </p>
      </div>

      {/* Tap to Skip Prompt */}
      <div className="absolute bottom-8 text-[11px] font-bold tracking-widest text-slate-400 uppercase opacity-70 drop-shadow-sm">
        Tap anywhere to skip
      </div>
    </div>
  );
}
