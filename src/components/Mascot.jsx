import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/audio';

export default function Mascot({ mood = 'happy', state = 'idle', equipped = [], equippedItems, className = "w-36 h-36", size, overrideColor, onClick, disableInteractive = false }) {
  const activeEquipped = equippedItems || equipped || [];
  // Equipped item checks
  const isEquipped = (itemId) => activeEquipped.includes(itemId);

  // Background Themes
  const hasAlpineBg = isEquipped('bg_alpine');
  const hasSunsetBg = isEquipped('bg_sunset');
  const hasAuroraBg = isEquipped('bg_aurora');
  const hasVolcanoBg = isEquipped('bg_volcano');
  const hasConcertStageBg = isEquipped('bg_concert_stage');
  const hasCosmicBg = isEquipped('bg_cosmic');
  const hasCrystalCaveBg = isEquipped('bg_crystal_cave');
  const hasGoldenPalaceBg = isEquipped('bg_golden_palace');

  // Borders
  const hasWoodBorder = isEquipped('border_wood');
  const hasStoneBorder = isEquipped('border_stone');
  const hasSilverBorder = isEquipped('border_silver');
  const hasGoldBorder = isEquipped('border_gold');
  const hasDiamondBorder = isEquipped('border_diamond');
  const hasFireBorder = isEquipped('border_fire');
  const hasNeonBorder = isEquipped('border_neon');
  const hasHolidayWreathBorder = isEquipped('holiday_wreath_border');

  // Skins
  const hasGoldenSkin = isEquipped('golden_skin');
  const hasSnowWhiteSkin = isEquipped('snow_white_skin');
  const hasMidnightSkin = isEquipped('midnight_shadow_skin');
  const hasJadeSkin = isEquipped('emerald_jade_skin');
  const hasGalaxySkin = isEquipped('galaxy_skin_premium');

  const hasCustomSkin = hasGoldenSkin || hasSnowWhiteSkin || hasMidnightSkin || hasJadeSkin || hasGalaxySkin;

  const bodyFill = hasGalaxySkin
    ? 'url(#galaxyBodyGrad)'
    : hasGoldenSkin
    ? 'url(#goldBodyGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteBodyGrad)'
    : hasMidnightSkin
    ? 'url(#midnightBodyGrad)'
    : hasJadeSkin
    ? 'url(#jadeBodyGrad)'
    : 'url(#kibo3DBodyGrad)';

  const secondaryFill = hasGalaxySkin
    ? 'url(#galaxyDarkGrad)'
    : hasGoldenSkin
    ? 'url(#goldDarkGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteDarkGrad)'
    : hasMidnightSkin
    ? 'url(#midnightDarkGrad)'
    : hasJadeSkin
    ? 'url(#jadeDarkGrad)'
    : 'url(#kibo3DDarkGrad)';

  const tailFill = hasGalaxySkin
    ? 'url(#galaxyBodyGrad)'
    : hasGoldenSkin
    ? 'url(#goldBodyGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteBodyGrad)'
    : hasMidnightSkin
    ? 'url(#midnightBodyGrad)'
    : hasJadeSkin
    ? 'url(#jadeBodyGrad)'
    : 'url(#tailGrad)';

  const bodyStroke = hasGalaxySkin
    ? '#4338CA'
    : hasGoldenSkin
    ? '#B45309'
    : hasSnowWhiteSkin
    ? '#0284C7'
    : hasMidnightSkin
    ? '#0F172A'
    : hasJadeSkin
    ? '#047857'
    : '#8A2500';

  const secondaryStroke = hasGalaxySkin
    ? '#312E81'
    : hasGoldenSkin
    ? '#78350F'
    : hasSnowWhiteSkin
    ? '#0369A1'
    : hasMidnightSkin
    ? '#020617'
    : hasJadeSkin
    ? '#064E3B'
    : '#5c3021';

  const earInnerFill = hasGalaxySkin
    ? 'url(#galaxyEarInnerGrad)'
    : hasGoldenSkin
    ? 'url(#goldEarInnerGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteEarInnerGrad)'
    : hasMidnightSkin
    ? 'url(#midnightEarInnerGrad)'
    : hasJadeSkin
    ? 'url(#jadeEarInnerGrad)'
    : 'url(#kibo3DEarInner)';

  const facePatchFill = hasGalaxySkin
    ? 'url(#galaxyFaceGrad)'
    : hasGoldenSkin
    ? 'url(#goldFaceGrad)'
    : hasSnowWhiteSkin
    ? 'url(#snowWhiteFaceGrad)'
    : hasMidnightSkin
    ? 'url(#midnightFaceGrad)'
    : hasJadeSkin
    ? 'url(#jadeFaceGrad)'
    : 'url(#kibo3DWhiteGrad)';

  const pawPadFill = hasGalaxySkin
    ? '#F472B6'
    : hasGoldenSkin
    ? '#FEF08A'
    : hasSnowWhiteSkin
    ? '#7DD3FC'
    : hasMidnightSkin
    ? '#38BDF8'
    : hasJadeSkin
    ? '#A7F3D0'
    : '#fca4a9';

  const eyebrowFill = hasGalaxySkin
    ? '#E0E7FF'
    : hasGoldenSkin
    ? '#FEF08A'
    : hasSnowWhiteSkin
    ? '#E0F2FE'
    : hasMidnightSkin
    ? '#94A3B8'
    : hasJadeSkin
    ? '#A7F3D0'
    : '#ffffff';

  const whiskerStroke = hasGalaxySkin
    ? '#A5B4FC'
    : hasGoldenSkin
    ? '#78350F'
    : hasSnowWhiteSkin
    ? '#0284C7'
    : hasMidnightSkin
    ? '#475569'
    : hasJadeSkin
    ? '#047857'
    : '#5c3021';

  const eyeFill = hasGalaxySkin
    ? '#6366F1'
    : hasGoldenSkin
    ? '#78350F'
    : hasSnowWhiteSkin
    ? '#0C4A6E'
    : hasMidnightSkin
    ? '#020617'
    : hasJadeSkin
    ? '#064E3B'
    : '#4a271d';

  const eyeLineStroke = eyeFill;
  const noseFill = eyeFill;
  const mouthStroke = eyeFill;

  const blushFill = hasGalaxySkin
    ? '#F472B6'
    : hasGoldenSkin
    ? '#FCD34D'
    : hasSnowWhiteSkin
    ? '#F472B6'
    : hasMidnightSkin
    ? '#38BDF8'
    : hasJadeSkin
    ? '#F472B6'
    : '#ff99a1';

  // Pets
  const hasSnowyOwl = isEquipped('snowy_owl');
  const hasAlpineFox = isEquipped('alpine_fox');
  const hasMiniRobot = isEquipped('mini_robot');
  const hasPhoenixPet = isEquipped('phoenix_pet');
  const hasFrostDragon = isEquipped('frost_dragon');
  const hasCosmicGriffin = isEquipped('cosmic_griffin');
  const hasDragonPet = isEquipped('dragon_pet_premium');
  const hasSpringButterfly = isEquipped('spring_butterfly_pet');
  const hasAutumnSquirrel = isEquipped('autumn_squirrel_pet');
  const hasWinterSnowman = isEquipped('winter_snowman_pet');
  const hasMlkDove = isEquipped('mlk_peace_dove_pet');
  const hasHalloweenGhost = isEquipped('halloween_ghost_pet');
  const hasHolidayGingerbread = isEquipped('holiday_gingerbread_pet');

  // Visual FX
  const hasSparkleDust = isEquipped('sparkle_dust');
  const hasStarlightAura = isEquipped('starlight_aura');
  const hasLightningSparks = isEquipped('lightning_sparks');
  const hasRainbowNebula = isEquipped('rainbow_nebula');
  const hasSpringSakuraHalo = isEquipped('spring_sakura_halo');
  const hasSummerSplashAura = isEquipped('summer_splash_aura') || isEquipped('summer_sunshine_aura');
  const hasValentinesLoveSparks = isEquipped('valentines_love_sparks');
  const hasStPatricksRainbow = isEquipped('st_patricks_rainbow_trail');
  const hasJuly4Fireworks = isEquipped('july4_liberty_fireworks');
  const hasHolidayTwinkleLights = isEquipped('holiday_twinkle_lights');
  const hasKiboClub = isEquipped('kibo_club_sub') || isEquipped('kibo_club_family');

  // Headwear
  const hasCap = isEquipped('cap');
  const hasBandana = isEquipped('bandana');
  const hasPartyHat = isEquipped('party_hat');
  const hasGoggles = isEquipped('goggles');
  const hasNinjaHeadband = isEquipped('ninja_headband');
  const hasWizardHat = isEquipped('wizard_hat');
  const hasExplorerHat = isEquipped('explorer_hat');
  const hasPumpkinHat = isEquipped('pumpkin_hat');
  const hasSummerVisor = isEquipped('summer_visor');
  const hasSummerSnorkel = isEquipped('summer_snorkel_mask');
  const hasWinterBeanie = isEquipped('winter_beanie');
  const hasCyberShades = isEquipped('cyber_shades');
  const hasCrown = isEquipped('crown');
  const hasSpringBunnyEars = isEquipped('spring_bunny_ears');
  const hasAutumnLeafCrown = isEquipped('autumn_leaf_crown');
  const hasNewYearTopHat = isEquipped('new_year_top_hat');
  const hasValentinesHeartShades = isEquipped('valentines_heart_shades');
  const hasPresidentsTricorne = isEquipped('presidents_tricorne');
  const hasStPatricksLeprechaunHat = isEquipped('st_patricks_leprechaun_hat');
  const hasEarthDaySprout = isEquipped('earth_day_sprout_cap');
  const hasMemorialPoppy = isEquipped('memorial_poppy_wreath');
  const hasJuneteenthUnityBeanie = isEquipped('juneteenth_unity_beanie');
  const hasJuly4UncleSamHat = isEquipped('july4_uncle_sam_hat');
  const hasLaborDayHardhat = isEquipped('laborday_builder_hardhat');
  const hasVeteransBeret = isEquipped('veterans_valor_beret');
  const hasThanksgivingTurkeyHat = isEquipped('thanksgiving_turkey_hat');
  const hasHolidaySantaHat = isEquipped('holiday_santa_hat');
  const hasHolidayReindeerAntlers = isEquipped('holiday_reindeer_antlers');

  // Body & Gear Accessories
  const hasBowtie = isEquipped('bowtie');
  const hasNeonHeadphones = isEquipped('headphones_neon') || isEquipped('headphones');
  const hasJetpack = isEquipped('jetpack');
  const hasBackpack = isEquipped('backpack');
  const hasGrapplingHook = isEquipped('grappling_hook');
  const hasCanteen = isEquipped('canteen');
  const hasLantern = isEquipped('lantern');
  const hasClimbingPoles = isEquipped('climbing_poles') || isEquipped('golden_compass');
  const hasVest = isEquipped('vest');
  const hasSummitScarf = isEquipped('summit_scarf');
  const hasAstronautSuit = isEquipped('astronaut_suit');
  const hasGoldenTicket = isEquipped('golden_ticket');
  const hasRoyalCape = isEquipped('royal_cape');
  const hasAutumnSweater = isEquipped('autumn_cozy_sweater');
  const hasMlkSash = isEquipped('mlk_dream_sash');
  const hasValentinesWings = isEquipped('valentines_cupid_wings');
  const hasMemorialCape = isEquipped('memorial_courage_cape');
  const hasHalloweenVampireCape = isEquipped('halloween_vampire_cape');
  const hasVeteransMedal = isEquipped('veterans_medal_ribbon');
  const hasSummerIceCream = isEquipped('summer_ice_cream_cone');
  const hasWinterIceSkates = isEquipped('winter_ice_skates');
  const hasNewYearSparkler = isEquipped('new_year_sparkler');
  const hasPresidentsShield = isEquipped('presidents_eagle_shield');
  const hasStPatricksPotOfGold = isEquipped('st_patricks_pot_of_gold');
  const hasEarthDayGlobe = isEquipped('earth_day_globe_balloon');
  const hasJuneteenthTorch = isEquipped('juneteenth_liberty_torch');
  const hasJuly4Pinwheel = isEquipped('july4_sparkler_pinwheel');
  const hasLaborDayToolbelt = isEquipped('laborday_pioneer_toolbelt');
  const hasHalloweenBroom = isEquipped('halloween_witch_broom');
  const hasThanksgivingCornucopia = isEquipped('thanksgiving_cornucopia');
  const hasHolidayCandyCane = isEquipped('holiday_candy_cane_staff');

  // Consumable Power-Ups Stage Previews
  const hasKiboShield = isEquipped('kibo_shield');
  const hasDoubleSparksPotion = isEquipped('double_sparks_potion') || isEquipped('double_coin_potion');
  const hasHintScroll = isEquipped('hint_scroll');

  // --- LIVING MASCOT ANIMATION STATES ---
  const [isBlinking, setIsBlinking] = useState(false);
  const [isEarTwitching, setIsEarTwitching] = useState(false);
  const [isSniffing, setIsSniffing] = useState(false);
  const [isTwirling, setIsTwirling] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [sparkParticles, setSparkParticles] = useState([]);
  const isReactingRef = useRef(false);

  // Advanced Movement Visual FX items
  const hasCloudFloat = isEquipped('fx_float_bounce');
  const hasSpinDance = isEquipped('fx_spin_dance');
  const hasSpeedTrail = isEquipped('fx_hyper_speed');
  const hasOrbitMoons = isEquipped('fx_orbit_moons');

  // Periodic Victory Twirl for Victory Spin FX
  useEffect(() => {
    if (!hasSpinDance) return;
    const interval = setInterval(() => {
      setIsTwirling(true);
      setTimeout(() => setIsTwirling(false), 850);
    }, 5500);
    return () => clearInterval(interval);
  }, [hasSpinDance]);

  // Random Natural Micro-Actions Loop (Blinks, Ear Twitches, Nose Sniffs)
  useEffect(() => {
    let timeoutId;

    const scheduleMicroAction = () => {
      const delay = Math.floor(Math.random() * 2500) + 3000;
      timeoutId = setTimeout(() => {
        const rand = Math.random();

        if (rand < 0.4) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 200);
        } else if (rand < 0.75) {
          setIsEarTwitching(true);
          setTimeout(() => setIsEarTwitching(false), 380);
        } else {
          setIsSniffing(true);
          setTimeout(() => setIsSniffing(false), 420);
        }

        scheduleMicroAction();
      }, delay);
    };

    scheduleMicroAction();
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle Interactive Mascot Tap Reaction
  const handleMascotTap = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (disableInteractive) return;
    if (!onClick && e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (isReactingRef.current || isTapped) return;

    isReactingRef.current = true;
    soundFx.playKeyTap();
    setIsTapped(true);

    const newSparks = Array.from({ length: 4 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: `${Math.floor(Math.random() * 60) + 20}%`,
      top: `${Math.floor(Math.random() * 40) + 20}%`
    }));

    setSparkParticles((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setIsTapped(false);
      isReactingRef.current = false;
    }, 600);

    setTimeout(() => {
      setSparkParticles((prev) => prev.filter((p) => !newSparks.includes(p)));
    }, 900);
  };

  const getMoodEyeTransform = () => {
    if (mood === 'thinking') return '-translate-y-1';
    if (mood === 'sad') return 'translate-y-1';
    return '';
  };

  return (
    <div
      onClick={handleMascotTap}
      className={`relative select-none cursor-pointer aspect-square shrink-0 transition-all duration-300 ${
        isTapped
          ? 'animate-mascot-squash'
          : isTwirling
          ? 'animate-victory-spin'
          : hasCloudFloat
          ? 'animate-cloud-float'
          : 'animate-mascot-breathe'
      } ${state === 'climbing' ? 'animate-bounce-slow' : ''} ${className}`}
    >
      {/* AURAS & FX OUTER GLOW */}
      {hasGoldenSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 opacity-90 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasSnowWhiteSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 opacity-80 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasMidnightSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-slate-900 opacity-85 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasJadeSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-600 opacity-85 blur-xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasSummerSplashAura && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-400 opacity-80 blur-2xl animate-pulse pointer-events-none scale-125" />
      )}
      {hasStarlightAura && !hasCustomSkin && (
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 opacity-70 blur-lg animate-pulse pointer-events-none scale-110" />
      )}

      {/* REACTIVE FLOATING SPARK ⚡ PARTICLES */}
      {sparkParticles.map((spark) => (
        <div
          key={spark.id}
          className="absolute z-30 font-black text-amber-400 text-lg pointer-events-none animate-spark-float drop-shadow-md"
          style={{ left: spark.left, top: spark.top }}
        >
          ⚡
        </div>
      ))}

      {/* BORDERS SVG LAYER (Rendered Behind Mascot to act as frame) */}
      <svg
        viewBox="-40 -40 280 280"
        className="absolute inset-0 w-full h-full z-0 drop-shadow-lg overflow-visible pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="borderWoodGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <linearGradient id="borderStoneGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="borderSilverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="borderGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="borderDiamondGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <radialGradient id="borderFireGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#FACC15" stopOpacity="0" />
            <stop offset="85%" stopColor="#F97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#DC2626" />
          </radialGradient>
        </defs>

        {hasWoodBorder && (
          <rect x="-10" y="-10" width="220" height="220" rx="32" fill="none" stroke="url(#borderWoodGrad)" strokeWidth="12" />
        )}
        {hasStoneBorder && (
          <rect x="-10" y="-10" width="220" height="220" rx="16" fill="none" stroke="url(#borderStoneGrad)" strokeWidth="16" />
        )}
        {hasSilverBorder && (
          <g>
            <rect x="-10" y="-10" width="220" height="220" rx="40" fill="none" stroke="url(#borderSilverGrad)" strokeWidth="10" />
            <rect x="-4" y="-4" width="208" height="208" rx="36" fill="none" stroke="#F1F5F9" strokeWidth="2" opacity="0.8" />
          </g>
        )}
        {hasGoldBorder && (
          <g>
            <rect x="-15" y="-15" width="230" height="230" rx="48" fill="none" stroke="url(#borderGoldGrad)" strokeWidth="14" />
            <rect x="-15" y="-15" width="230" height="230" rx="48" fill="none" stroke="#FEF08A" strokeWidth="4" opacity="0.6" />
          </g>
        )}
        {hasDiamondBorder && (
          <g>
            <rect x="-15" y="-15" width="230" height="230" rx="48" fill="none" stroke="url(#borderDiamondGrad)" strokeWidth="18" />
            <rect x="-15" y="-15" width="230" height="230" rx="48" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="10 15" opacity="0.9" />
          </g>
        )}
        {hasFireBorder && (
          <g className="animate-pulse">
            <rect x="-20" y="-20" width="240" height="240" rx="120" fill="none" stroke="url(#borderFireGrad)" strokeWidth="24" opacity="0.9" />
          </g>
        )}
        {hasNeonBorder && (
          <g>
            <rect x="-10" y="-10" width="220" height="220" rx="24" fill="none" stroke="#A855F7" strokeWidth="8" />
            <rect x="-10" y="-10" width="220" height="220" rx="24" fill="none" stroke="#D8B4FE" strokeWidth="2" opacity="0.8" className="animate-pulse" />
            <rect x="-15" y="-15" width="230" height="230" rx="30" fill="none" stroke="#38BDF8" strokeWidth="4" />
          </g>
        )}
        {hasHolidayWreathBorder && (
          <g>
            <rect x="-20" y="-20" width="240" height="240" rx="120" fill="none" stroke="#064E3B" strokeWidth="24" />
            <rect x="-20" y="-20" width="240" height="240" rx="120" fill="none" stroke="#059669" strokeWidth="8" strokeDasharray="20 15" />
            <circle cx="100" cy="-20" r="15" fill="#DC2626" />
            <circle cx="-20" cy="100" r="15" fill="#DC2626" />
            <circle cx="220" cy="100" r="15" fill="#DC2626" />
            <circle cx="100" cy="220" r="15" fill="#DC2626" />
            <path d="M 85 -20 Q 100 -40 115 -20" stroke="#FBBF24" strokeWidth="4" fill="none" />
            <path d="M -20 85 Q -40 100 -20 115" stroke="#FBBF24" strokeWidth="4" fill="none" />
            <path d="M 220 85 Q 240 100 220 115" stroke="#FBBF24" strokeWidth="4" fill="none" />
            <path d="M 85 220 Q 100 240 115 220" stroke="#FBBF24" strokeWidth="4" fill="none" />
          </g>
        )}
      </svg>

      {/* MAIN 3D MASCOT SVG WITH INTEGRATED BACKGROUND & PET LAYERS */}
      <svg
        viewBox="-35 -35 270 270"
        className="w-full h-full relative z-10 drop-shadow-lg overflow-visible mascot-container"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          {/* Volumetric 3D Clay Body Gradients */}
          <radialGradient id="kibo3DBodyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffb997" />
            <stop offset="60%" stopColor="#f58c63" />
            <stop offset="100%" stopColor="#d96236" />
          </radialGradient>

          <radialGradient id="kibo3DSnoutGrad" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#f2e8e3" />
          </radialGradient>

          {/* White Face Patches */}
          <radialGradient id="kibo3DWhiteGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f2e8e3" />
          </radialGradient>

          {/* Dark Brown/Mauve Belly & Paws */}
          <radialGradient id="kibo3DDarkGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ad7562" />
            <stop offset="100%" stopColor="#824c3a" />
          </radialGradient>

          <radialGradient id="kibo3DEarInner" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f7f2f0" />
          </radialGradient>

          {/* Background Theme Gradients */}
          <linearGradient id="svgSunsetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id="svgAuroraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="svgLavaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          <linearGradient id="svgConcertGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E0A3C" />
            <stop offset="50%" stopColor="#2E0854" />
            <stop offset="100%" stopColor="#0B0217" />
          </linearGradient>

          <linearGradient id="concertBeamLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="concertBeamRight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="concertBeamCenter" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FACC15" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="svgCosmicGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="svgCaveGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#581C87" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="svgPalaceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Striped 3D Tail Gradient */}
          <linearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f58c63" />
            <stop offset="25%" stopColor="#d96236" />
            <stop offset="50%" stopColor="#824c3a" />
            <stop offset="75%" stopColor="#d96236" />
            <stop offset="100%" stopColor="#824c3a" />
          </linearGradient>

          {/* Special Custom Skins (Gold, Snow White, Midnight Shadow, Jade, Galaxy) */}
          <linearGradient id="goldBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FCD34D" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="goldDarkGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="goldEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>
          <radialGradient id="goldFaceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF08A" />
          </radialGradient>

          <linearGradient id="snowWhiteBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="snowWhiteDarkGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="snowWhiteEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <radialGradient id="snowWhiteFaceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F9FF" />
          </radialGradient>

          <linearGradient id="midnightBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="55%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="midnightDarkGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="midnightEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <radialGradient id="midnightFaceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
          </radialGradient>

          <linearGradient id="jadeBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="jadeDarkGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <linearGradient id="jadeEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
          <radialGradient id="jadeFaceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>

          <linearGradient id="galaxyBodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="galaxyDarkGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="50%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="galaxyEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <radialGradient id="galaxyFaceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.75" />
          </radialGradient>

          {/* Neon Headphones Gradients */}
          <linearGradient id="neonHeadphoneGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Pumpkin Hat Gradients */}
          <linearGradient id="pumpkinOuterLobeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id="pumpkinMidLobeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="pumpkinCenterLobeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="35%" stopColor="#FB923C" />
            <stop offset="80%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <radialGradient id="pumpkinCarveGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>
          <linearGradient id="pumpkinStemGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Summer Visor & Splash Gradients */}
          <linearGradient id="summerVisorBrimGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#0284C7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="summerWaveSplashGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Cyber Neon Gradients & Filter */}
          <linearGradient id="cyberVisorGradCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="60%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="cyberVisorGradPink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="60%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
          <filter id="cyberNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* VIP Kibo Club Crown Gradient */}
          <linearGradient id="vipCrownGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* ==================================================== */}
        {/* LAYER 0: BACKGROUND THEME GRAPHICS                    */}
        {/* ==================================================== */}
        {hasAlpineBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
            <polygon points="20,180 70,90 120,180" fill="#059669" opacity="0.85" />
            <polygon points="80,180 135,70 190,180" fill="#047857" opacity="0.9" />
            <circle cx="150" cy="45" r="16" fill="#FACC15" />
          </g>
        )}

        {hasSunsetBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgSunsetGrad)" stroke="#D97706" strokeWidth="4" />
            <circle cx="100" cy="95" r="38" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}

        {hasAuroraBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgAuroraGrad)" stroke="#047857" strokeWidth="4" />
            <path d="M 20 80 Q 100 35 180 80" stroke="#A7F3D0" strokeWidth="12" fill="none" opacity="0.75" />
          </g>
        )}

        {hasVolcanoBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgLavaGrad)" stroke="#7C2D12" strokeWidth="4" />
            <polygon points="30,185 100,85 170,185" fill="#7C2D12" />
            <circle cx="100" cy="85" r="14" fill="#FACC15" />
          </g>
        )}

        {hasConcertStageBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgConcertGrad)" stroke="#A855F7" strokeWidth="4" />
            <polygon points="30,8 100,180 60,180 10,8" fill="#EC4899" opacity="0.5" />
            <polygon points="170,8 100,180 140,180 190,8" fill="#06B6D4" opacity="0.5" />
            <rect x="15" y="150" width="170" height="35" rx="8" fill="#1E293B" />
          </g>
        )}

        {hasCosmicBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgCosmicGrad)" stroke="#4338CA" strokeWidth="4" />
            <circle cx="45" cy="45" r="5" fill="#FFFFFF" />
            <circle cx="150" cy="65" r="4" fill="#FDE047" />
          </g>
        )}

        {hasCrystalCaveBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgCaveGrad)" stroke="#7C3AED" strokeWidth="4" />
            <polygon points="20,185 45,95 70,185" fill="#C084FC" />
            <polygon points="130,185 155,80 180,185" fill="#38BDF8" />
          </g>
        )}

        {hasGoldenPalaceBg && (
          <g>
            <rect x="5" y="5" width="190" height="190" rx="32" fill="url(#svgPalaceGrad)" stroke="#B45309" strokeWidth="4" />
            <rect x="50" y="90" width="100" height="95" fill="#FFFBEB" opacity="0.9" stroke="#B45309" strokeWidth="3" />
            <polygon points="100,40 50,90 150,90" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
          </g>
        )}

        {/* ==================================================== */}
        {/* COMPANION PETS                                       */}
        {/* ==================================================== */}
        {hasSnowyOwl && (
          <g className="animate-bounce" style={{ animationDuration: '3s' }} >
            <ellipse cx="165" cy="58" rx="11" ry="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="165" cy="44" r="9" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <polygon points="165,44 169,48 161,48" fill="#F59E0B" />
            <circle cx="161" cy="42" r="2.5" fill="#FBBF24" />
            <circle cx="169" cy="42" r="2.5" fill="#FBBF24" />
            <circle cx="161" cy="42" r="1" fill="#000000" />
            <circle cx="169" cy="42" r="1" fill="#000000" />
          </g>
        )}

        {hasAlpineFox && (
          <g className="animate-pulse" style={{ animationDuration: '2.8s' }} >
            <ellipse cx="36" cy="148" rx="14" ry="10" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <circle cx="26" cy="142" r="8" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
            <polygon points="22,136 20,126 27,133" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <polygon points="29,136 32,126 33,134" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <ellipse cx="23" cy="145" rx="3" ry="2" fill="#FFFFFF" />
            <circle cx="23" cy="142" r="1" fill="#000000" />
          </g>
        )}

        {hasPhoenixPet && (
          <g className="animate-bounce" style={{ animationDuration: '2.2s' }} >
            <path d="M 158 65 Q 142 82 148 95 Q 160 86 162 70 Z" fill="#EF4444" />
            <path d="M 160 68 Q 148 84 154 95" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="165" cy="58" rx="14" ry="18" fill="url(#svgLavaGrad)" stroke="#9A3412" strokeWidth="2.5" />
            <circle cx="165" cy="44" r="11" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
            <polygon points="165,33 169,20 163,29 158,22" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <path d="M 165 52 Q 192 42 186 70 Q 168 70 165 59 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <polygon points="172,44 184,48 172,51" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="162" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="162" cy="42" r="1.5" fill="#451A03" />
          </g>
        )}

        {hasFrostDragon && (
          <g className="animate-pulse" style={{ animationDuration: '2.5s' }} >
            <path d="M 172 21 Q 188 34 180 46 Q 170 38 168 26 Z" fill="#0EA5E9" />
            <ellipse cx="165" cy="14" rx="14" ry="18" fill="url(#svgAuroraGrad)" stroke="#065F46" strokeWidth="2.5" />
            <circle cx="165" cy="0" r="11" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <polygon points="160,-8 154,-22 164,-12" fill="#A5F3FC" stroke="#0891B2" strokeWidth="1.5" />
            <polygon points="168,-8 174,-22 169,-12" fill="#A5F3FC" stroke="#0891B2" strokeWidth="1.5" />
            <path d="M 165 8 Q 138 -2 144 26 Q 162 26 165 15 Z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2" />
            <ellipse cx="157" cy="3" rx="5" ry="3.5" fill="#E0F2FE" />
            <circle cx="167" cy="-2" r="3" fill="#FFFFFF" />
            <circle cx="167" cy="-2" r="1.5" fill="#0C4A6E" />
          </g>
        )}

        {hasCosmicGriffin && (
          <g className="animate-bounce" style={{ animationDuration: '2.6s' }} >
            <path d="M 162 65 Q 185 45 178 85 Q 165 82 162 70 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <ellipse cx="165" cy="58" rx="13" ry="16" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="165" cy="44" r="10" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
            <polygon points="170,44 184,48 170,51" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="161" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="161" cy="42" r="1.5" fill="#78350F" />
          </g>
        )}

        {hasMiniRobot && (
          <g className="animate-bounce" style={{ animationDuration: '2.4s' }}>
            <ellipse cx="165" cy="74" rx="10" ry="3" fill="#38BDF8" opacity="0.35" />
            <line x1="165" y1="32" x2="165" y2="40" stroke="#64748B" strokeWidth="2" />
            <circle cx="165" cy="30" r="3" fill="#22D3EE" stroke="#0284C7" strokeWidth="1.5" />
            <rect x="151" y="40" width="28" height="24" rx="8" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
            <rect x="154" y="44" width="22" height="12" rx="4" fill="#0F172A" />
            <circle cx="160" cy="50" r="1.5" fill="#38BDF8" />
            <circle cx="170" cy="50" r="1.5" fill="#38BDF8" />
            <rect x="148" y="48" width="3" height="6" rx="1" fill="#64748B" />
            <rect x="179" y="48" width="3" height="6" rx="1" fill="#64748B" />
            <polygon points="160,64 170,64 165,70" fill="#0EA5E9" />
          </g>
        )}

        {hasDragonPet && (
          <g className="animate-bounce" style={{ animationDuration: '2.1s' }}>
            <path d="M 158 66 Q 140 84 146 96 Q 158 87 160 72 Z" fill="#DC2626" />
            <ellipse cx="165" cy="60" rx="13" ry="16" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <ellipse cx="162" cy="62" rx="6" ry="10" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
            <circle cx="165" cy="44" r="10" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <polygon points="158,36 153,24 162,33" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <polygon points="168,36 173,24 165,33" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <path d="M 166 52 Q 192 38 188 64 Q 174 62 166 58 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="162" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="162" cy="42" r="1.5" fill="#451A03" />
            <circle cx="154" cy="46" r="2.5" fill="#F97316" className="animate-ping" />
          </g>
        )}

        {hasSpringButterfly && (
          <g className="animate-bounce" style={{ animationDuration: '2.2s' }}>
            <ellipse cx="165" cy="54" rx="3" ry="12" fill="#1E293B" />
            <path d="M 163 50 C 140 25, 135 55, 162 58 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <path d="M 167 50 C 190 25, 195 55, 168 58 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <path d="M 163 58 C 145 68, 148 80, 163 65 Z" fill="#F59E0B" />
            <path d="M 167 58 C 185 68, 182 80, 167 65 Z" fill="#F59E0B" />
          </g>
        )}

        {hasAutumnSquirrel && (
          <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
            <path d="M 160 70 C 185 65, 188 35, 168 25 C 158 20, 150 38, 160 55 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <ellipse cx="150" cy="62" rx="12" ry="14" fill="#D97706" stroke="#78350F" strokeWidth="2" />
            <circle cx="148" cy="46" r="9" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="145" cy="44" r="2" fill="#000000" />
            <ellipse cx="140" cy="60" rx="5" ry="7" fill="#78350F" />
          </g>
        )}

        {hasWinterSnowman && (
          <g className="animate-bounce" style={{ animationDuration: '3.2s' }}>
            <circle cx="165" cy="65" r="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="165" cy="45" r="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="162" cy="42" r="1.5" fill="#0F172A" />
            <circle cx="168" cy="42" r="1.5" fill="#0F172A" />
            <polygon points="165,45 176,47 165,48" fill="#EA580C" />
            <rect x="157" y="34" width="16" height="4" fill="#1E293B" />
            <rect x="160" y="24" width="10" height="10" fill="#1E293B" />
          </g>
        )}

        {hasMlkDove && (
          <g className="animate-pulse" style={{ animationDuration: '2.6s' }}>
            <path d="M 155 55 C 142 40, 160 25, 175 35 C 182 40, 190 42, 185 55 C 172 60, 162 68, 155 55 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <path d="M 162 40 Q 148 18 170 26 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
            <polygon points="184,42 192,44 184,46" fill="#F59E0B" />
            <circle cx="178" cy="50" r="2.5" fill="#22C55E" />
          </g>
        )}

        {hasHalloweenGhost && (
          <g className="animate-bounce" style={{ animationDuration: '2.3s' }}>
            <path d="M 152 45 C 152 25, 178 25, 178 45 C 178 62, 185 70, 178 74 C 172 71, 168 74, 165 71 C 162 74, 158 71, 152 74 C 145 70, 152 62, 152 45 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" opacity="0.9" />
            <circle cx="160" cy="42" r="2.5" fill="#0F172A" />
            <circle cx="170" cy="42" r="2.5" fill="#0F172A" />
            <ellipse cx="165" cy="50" rx="3" ry="4" fill="#0F172A" />
          </g>
        )}

        {hasHolidayGingerbread && (
          <g className="animate-bounce" style={{ animationDuration: '2.8s' }}>
            <ellipse cx="165" cy="62" rx="12" ry="14" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <circle cx="165" cy="44" r="10" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <circle cx="162" cy="42" r="1.5" fill="#FFFFFF" />
            <circle cx="168" cy="42" r="1.5" fill="#FFFFFF" />
            <circle cx="165" cy="56" r="2" fill="#EF4444" />
            <circle cx="165" cy="64" r="2" fill="#22C55E" />
          </g>
        )}

        {/* VISUAL FX (Cloud Levitator, Speed Trail, Orbit Moons) */}
        {hasCloudFloat && (
          <g>
            <ellipse cx="100" cy="182" rx="64" ry="18" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="50" cy="176" r="22" fill="#F8FAFC" />
            <circle cx="150" cy="176" r="22" fill="#F8FAFC" />
            <circle cx="80" cy="168" r="26" fill="#FFFFFF" />
            <circle cx="120" cy="168" r="26" fill="#FFFFFF" />
            <circle cx="100" cy="162" r="28" fill="#FFFFFF" />
            <circle cx="45" cy="160" r="3" fill="#FCD34D" className="animate-ping" />
            <circle cx="155" cy="160" r="3" fill="#38BDF8" className="animate-ping" />
          </g>
        )}

        {/* --- BACK VISUAL FX (Behind Kibo) --- */}
        {hasSparkleDust && (
          <g>
            <path d="M 45 40 L 41 55" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-1" />
            <path d="M 155 35 L 151 50" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-2" />
            <path d="M 75 25 L 71 40" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" className="animate-rain-drop-3" />
            <path d="M 125 30 L 121 45" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" className="animate-rain-drop-4" />
          </g>
        )}

        {hasLightningSparks && (
          <g id="cosmic-bubble-floating-back">
            <g className="animate-bubble-float-1"><circle cx="45" cy="130" r="10" fill="#FDE047" opacity="0.6" stroke="#FACC15" strokeWidth="1.5" /><circle cx="42" cy="127" r="3" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-2"><circle cx="155" cy="140" r="14" fill="#38BDF8" opacity="0.6" stroke="#0284C7" strokeWidth="1.5" /><circle cx="151" cy="136" r="4" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-3"><circle cx="65" cy="155" r="8" fill="#F472B6" opacity="0.6" stroke="#DB2777" strokeWidth="1.5" /><circle cx="63" cy="153" r="2.5" fill="#FFFFFF" opacity="0.8" /></g>
            <g className="animate-bubble-float-4"><circle cx="135" cy="150" r="11" fill="#C084FC" opacity="0.6" stroke="#7C3AED" strokeWidth="1.5" /><circle cx="132" cy="147" r="3.5" fill="#FFFFFF" opacity="0.8" /></g>
          </g>
        )}

        {hasSpeedTrail && (
          <g id="disco-fever-spotlight-back">
            <g className="animate-disco-spotlight">
              <polygon points="100,-13 30,190 70,190" fill="#F472B6" opacity="0.25" />
              <polygon points="100,-13 130,190 170,190" fill="#38BDF8" opacity="0.25" />
              <polygon points="100,-13 70,190 130,190" fill="#FDE047" opacity="0.2" />
            </g>
            <line x1="100" y1="-35" x2="100" y2="-23" stroke="#94A3B8" strokeWidth="2" />
            <rect x="94" y="-25" width="12" height="6" rx="2" fill="#64748B" />
            <g className="animate-disco-ball">
              <circle cx="100" cy="-10" r="13" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
              <line x1="87" y1="-10" x2="113" y2="-10" stroke="#94A3B8" strokeWidth="1" />
              <line x1="89" y1="-15" x2="111" y2="-15" stroke="#94A3B8" strokeWidth="1" />
              <line x1="89" y1="-5" x2="111" y2="-5" stroke="#94A3B8" strokeWidth="1" />
              <line x1="100" y1="-23" x2="100" y2="3" stroke="#94A3B8" strokeWidth="1" />
              <line x1="95" y1="-22" x2="95" y2="2" stroke="#94A3B8" strokeWidth="1" />
              <line x1="105" y1="-22" x2="105" y2="2" stroke="#94A3B8" strokeWidth="1" />
              <circle cx="96" cy="-14" r="1.5" fill="#FFFFFF" />
              <circle cx="104" cy="-8" r="1.5" fill="#FFFFFF" />
              <circle cx="102" cy="-17" r="1.2" fill="#FFFFFF" />
            </g>
          </g>
        )}

        {hasRainbowNebula && (
          <g id="background-fireworks-show">
            <g className="animate-fireworks-burst" style={{ animationDuration: '2.4s', transformOrigin: '40px 45px' }}>
              <line x1="40" y1="45" x2="40" y2="20" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="60" y2="35" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="60" y2="55" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="40" y2="70" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="20" y2="55" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="40" y1="45" x2="20" y2="35" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="40" cy="20" r="3" fill="#FEF08A" />
              <circle cx="60" cy="35" r="3" fill="#FEF08A" />
              <circle cx="60" cy="55" r="3" fill="#FEF08A" />
              <circle cx="40" cy="70" r="3" fill="#FEF08A" />
              <circle cx="20" cy="55" r="3" fill="#FEF08A" />
              <circle cx="20" cy="35" r="3" fill="#FEF08A" />
            </g>
            <g className="animate-fireworks-burst" style={{ animationDuration: '2.8s', animationDelay: '0.6s', transformOrigin: '160px 40px' }}>
              <line x1="160" y1="40" x2="160" y2="15" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="182" y2="28" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="182" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="160" y2="65" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="138" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="160" y1="40" x2="138" y2="28" stroke="#C084FC" strokeWidth="2.5" strokeDasharray="5 3" />
              <circle cx="160" cy="15" r="3.5" fill="#E0F2FE" />
              <circle cx="182" cy="28" r="3.5" fill="#F3E8FF" />
              <circle cx="182" cy="52" r="3.5" fill="#E0F2FE" />
              <circle cx="160" cy="65" r="3.5" fill="#F3E8FF" />
              <circle cx="138" cy="52" r="3.5" fill="#E0F2FE" />
              <circle cx="138" cy="28" r="3.5" fill="#F3E8FF" />
            </g>
            <g className="animate-fireworks-burst" style={{ animationDuration: '3.2s', animationDelay: '1.2s', transformOrigin: '100px 30px' }}>
              <line x1="100" y1="30" x2="100" y2="5" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="125" y2="15" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="125" y2="45" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="100" y2="55" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="75" y2="45" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="100" y1="30" x2="75" y2="15" stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" />
              <polygon points="100,18 103,26 111,26 105,31 107,39 100,34 93,39 95,31 89,26 97,26" fill="#FDE047" opacity="0.9" />
            </g>
          </g>
        )}

        {hasStPatricksRainbow && (
          <g>
            <path d="M 20 180 A 80 80 0 0 1 180 180" stroke="#EF4444" strokeWidth="6" fill="none" />
            <path d="M 26 180 A 74 74 0 0 1 174 180" stroke="#F59E0B" strokeWidth="6" fill="none" />
            <path d="M 32 180 A 68 68 0 0 1 168 180" stroke="#10B981" strokeWidth="6" fill="none" />
            <path d="M 38 180 A 62 62 0 0 1 162 180" stroke="#3B82F6" strokeWidth="6" fill="none" />
            <path d="M 44 180 A 56 56 0 0 1 156 180" stroke="#8B5CF6" strokeWidth="6" fill="none" />
          </g>
        )}

        {hasJuly4Fireworks && (
          <g className="animate-pulse">
            <line x1="40" y1="40" x2="15" y2="15" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="160" y1="40" x2="185" y2="15" stroke="#3B82F6" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="100" y1="20" x2="100" y2="-5" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="4 3" />
          </g>
        )}

        {/* ==================================================== */}
        {/* KIBO CHARACTER GROUP                                 */}
        {/* ==================================================== */}
        <g className={`${hasOrbitMoons ? 'animate-silly-boogie' : ''} ${hasSpinDance ? 'animate-victory-twirl-body' : ''}`}>
          {/* ==================================================== */}
          {/* LAYER 1: BACKPACK & JETPACK & CAPES                  */}
          {/* ==================================================== */}
          <g id="layer-back">
            {hasJetpack && (
              <g>
                <rect x="20" y="80" width="30" height="70" rx="12" fill="#64748B" stroke="#0F172A" strokeWidth="3.5" />
                <rect x="26" y="90" width="18" height="50" rx="6" fill="#E2E8F0" opacity="0.4" />
                <circle cx="35" cy="115" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                <rect x="150" y="80" width="30" height="70" rx="12" fill="#64748B" stroke="#0F172A" strokeWidth="3.5" />
                <rect x="156" y="90" width="18" height="50" rx="6" fill="#E2E8F0" opacity="0.4" />
                <circle cx="165" cy="115" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                <path d="M 25 150 Q 35 193 45 150 Z" fill="#FF4500" className="animate-pulse" />
                <path d="M 29 150 Q 35 178 41 150 Z" fill="#FBBF24" className="animate-pulse" />
                <path d="M 155 150 Q 165 193 175 150 Z" fill="#FF4500" className="animate-pulse" />
                <path d="M 159 150 Q 165 178 171 150 Z" fill="#FBBF24" className="animate-pulse" />
              </g>
            )}

            {hasBackpack && (
              <g>
                <rect x="50" y="75" width="100" height="24" rx="10" fill="#15803D" stroke="#166534" strokeWidth="3" />
                <rect x="72" y="73" width="7" height="28" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <rect x="121" y="73" width="7" height="28" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <rect x="34" y="94" width="132" height="82" rx="24" fill="#0284C7" stroke="#0C4A6E" strokeWidth="4" />
                <rect x="25" y="98" width="16" height="44" rx="6" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
                <rect x="159" y="98" width="16" height="44" rx="6" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
              </g>
            )}

            {hasRoyalCape && (
              <g className="animate-cape-sway">
                <path d="M 64 96 L 44 165 Q 100 180 156 165 L 136 96 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3.5" />
                <path d="M 64 96 Q 100 90 136 96" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
              </g>
            )}

            {hasHalloweenVampireCape && (
              <g className="animate-cape-sway">
                <path d="M 62 94 L 40 172 Q 100 185 160 172 L 138 94 Z" fill="#0F172A" stroke="#020617" strokeWidth="3.5" />
                <polygon points="62,94 48,60 76,88" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
                <polygon points="138,94 152,60 124,88" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
              </g>
            )}

            {hasMemorialCape && (
              <g className="animate-cape-sway">
                <path d="M 64 96 L 44 165 Q 100 180 156 165 L 136 96 Z" fill="#1E3A8A" stroke="#172554" strokeWidth="3.5" />
                <line x1="75" y1="96" x2="68" y2="168" stroke="#DC2626" strokeWidth="8" />
                <line x1="125" y1="96" x2="132" y2="168" stroke="#DC2626" strokeWidth="8" />
              </g>
            )}

            {hasValentinesWings && (
              <g className="animate-pulse">
                <path d="M 60 110 C 10 70, 10 140, 60 135 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
                <path d="M 140 110 C 190 70, 190 140, 140 135 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
              </g>
            )}
          </g>

          {/* ==================================================== */}
          {/* LAYER 2: BASE KIBO BODY & TAIL                       */}
          {/* ==================================================== */}
          <g id="layer-body">
            {/* Animated 3D Tail */}
            <path
              d="M 60 140 C 20 160, -20 130, -5 90 C 10 50, 40 100, 60 110 Z"
              fill={tailFill}
              stroke={hasCustomSkin ? secondaryStroke : '#5c3021'}
              strokeWidth="2.5"
              className="transition-transform duration-300 origin-bottom"
            />

            {/* Main 3D Volumetric Body Sphere */}
            <ellipse
              cx="100"
              cy="140"
              rx="45"
              ry="40"
              fill={bodyFill}
              stroke={bodyStroke}
              strokeWidth="2.5"
            />

            {/* Dark/Secondary Belly */}
            <path
              d="M 65 140 C 65 110, 135 110, 135 140 C 135 175, 65 175, 65 140 Z"
              fill={secondaryFill}
              stroke={hasCustomSkin ? secondaryStroke : '#5c3021'}
              strokeWidth="2"
            />

            {/* Left Foot */}
            <g>
              <ellipse cx="75" cy="170" rx="14" ry="16" fill={secondaryFill} stroke={hasCustomSkin ? secondaryStroke : '#5c3021'} strokeWidth="2.5" />
              <circle cx="75" cy="174" r="5" fill={pawPadFill} />
              <circle cx="67" cy="164" r="2.5" fill={pawPadFill} />
              <circle cx="75" cy="161" r="2.5" fill={pawPadFill} />
              <circle cx="83" cy="164" r="2.5" fill={pawPadFill} />
            </g>

            {/* Right Foot */}
            <g>
              <ellipse cx="125" cy="170" rx="14" ry="16" fill={secondaryFill} stroke={hasCustomSkin ? secondaryStroke : '#5c3021'} strokeWidth="2.5" />
              <circle cx="125" cy="174" r="5" fill={pawPadFill} />
              <circle cx="117" cy="164" r="2.5" fill={pawPadFill} />
              <circle cx="125" cy="161" r="2.5" fill={pawPadFill} />
              <circle cx="133" cy="164" r="2.5" fill={pawPadFill} />
            </g>

            {/* Arms */}
            <path d="M 60 120 C 60 160, 85 160, 95 155 C 90 145, 80 130, 75 110 Z" fill={secondaryFill} stroke={hasCustomSkin ? secondaryStroke : '#5c3021'} strokeWidth="2" />
            <path d="M 140 120 C 140 160, 115 160, 105 155 C 110 145, 120 130, 125 110 Z" fill={secondaryFill} stroke={hasCustomSkin ? secondaryStroke : '#5c3021'} strokeWidth="2" />

            {/* Ears with Micro Twitching */}
            <g className={`transition-transform duration-200 ${isEarTwitching ? '-rotate-6 translate-y-0.5' : ''}`}>
              {/* Left Ear */}
              <path
                d="M 65 60 C 50 30, 40 15, 60 15 C 80 15, 85 30, 90 45 Z"
                fill={bodyFill}
                stroke={bodyStroke}
                strokeWidth="2.5"
              />
              <path d="M 65 55 C 55 35, 50 25, 62 25 C 75 25, 80 35, 85 45 Z" fill={earInnerFill} />

              {/* Right Ear */}
              <path
                d="M 135 60 C 150 30, 160 15, 140 15 C 120 15, 115 30, 110 45 Z"
                fill={bodyFill}
                stroke={bodyStroke}
                strokeWidth="2.5"
              />
              <path d="M 135 55 C 145 35, 150 25, 138 25 C 125 25, 120 35, 115 45 Z" fill={earInnerFill} />
            </g>

            {/* Head Base */}
            <ellipse cx="100" cy="80" rx="65" ry="45" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />

            {/* Cheeks Fluff */}
            <path d="M 36 80 L 25 85 L 35 90 L 20 100 L 42 105 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 164 80 L 175 85 L 165 90 L 180 100 L 158 105 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" strokeLinejoin="round" />
          </g>

          {/* ==================================================== */}
          {/* LAYER 3: OUTFITS (Vest, Scarf, Bowtie, Sweater)     */}
          {/* ==================================================== */}
          <g id="layer-outfits">
            {hasVest && (
              <g >
                <path d="M 62 115 C 62 115, 100 125, 138 115 L 138 155 C 138 155, 100 170, 62 155 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3.5" />
                <path d="M 63 128 Q 100 138 137 128" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                <path d="M 62 142 Q 100 152 138 142" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                <line x1="100" y1="115" x2="100" y2="162" stroke="#38BDF8" strokeWidth="3" />
                <circle cx="100" cy="122" r="3" fill="#FFFFFF" />
                <circle cx="80" cy="134" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              </g>
            )}

            {hasAutumnSweater && (
              <g>
                <path d="M 62 115 C 62 115, 100 125, 138 115 L 138 158 C 138 158, 100 172, 62 158 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="3" />
                <line x1="80" y1="118" x2="80" y2="165" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="120" y1="118" x2="120" y2="165" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="62" y1="138" x2="138" y2="138" stroke="#F59E0B" strokeWidth="2.5" />
              </g>
            )}

            {hasMlkSash && (
              <g>
                <path d="M 72 108 L 86 104 L 132 165 L 118 169 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                <line x1="79" y1="106" x2="125" y2="167" stroke="#F59E0B" strokeWidth="3.5" />
                <circle cx="102" cy="136" r="5" fill="#FEF08A" />
              </g>
            )}

            {hasVeteransMedal && (
              <g>
                <polygon points="90,118 110,118 106,134 94,134" fill="#1E3A8A" stroke="#172554" strokeWidth="1.5" />
                <line x1="100" y1="118" x2="100" y2="134" stroke="#DC2626" strokeWidth="3" />
                <circle cx="100" cy="142" r="8" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="1.5" />
                <polygon points="100,137 101.5,140.5 105,140.5 102,143 103.5,147 100,145 96.5,147 98,143 95,140.5 98.5,140.5" fill="#FFFFFF" />
              </g>
            )}

            {hasSummitScarf && (
              <g >
                <path d="M 62 118 Q 100 136 138 118 L 136 130 Q 100 148 64 130 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="3" />
                <path d="M 64 116 Q 100 132 136 116 Q 100 126 64 116 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" />
                <path d="M 80 122 L 84 132 M 116 122 L 120 132" stroke="#FBBF24" strokeWidth="3" />
                <path d="M 114 130 L 130 170 L 110 170 L 102 132 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
                <rect x="108" y="158" width="22" height="5" fill="#FBBF24" />
                <line x1="112" y1="170" x2="112" y2="176" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="118" y1="170" x2="118" y2="176" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="124" y1="170" x2="124" y2="176" stroke="#F59E0B" strokeWidth="2.5" />
              </g>
            )}

            {hasBowtie && (
              <g >
                <polygon points="100,130 74,118 72,142" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <polygon points="100,130 126,118 128,142" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <polygon points="100,130 80,122 78,138" fill="#F87171" />
                <polygon points="100,130 120,122 122,138" fill="#F87171" />
                <rect x="94" y="124" width="12" height="12" rx="4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2.5" />
              </g>
            )}

            {hasAstronautSuit && (
              <g>
                <path d="M 60 115 C 60 115, 100 122, 140 115 L 140 162 C 140 162, 100 172, 60 162 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="3" />
                <line x1="100" y1="118" x2="100" y2="166" stroke="#94A3B8" strokeWidth="2.5" />
                <rect x="74" y="126" width="14" height="10" rx="2" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
                <circle cx="81" cy="131" r="2.5" fill="#FDE047" />
                <circle cx="120" cy="130" r="3" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
                <circle cx="128" cy="130" r="3" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
              </g>
            )}
          </g>

          {/* ==================================================== */}
          {/* LAYER 4: FACE (Eyes, Nose, Expressive Expressions)   */}
          {/* ==================================================== */}
          <g id="layer-face">
            {/* Face Patches */}
            <g>
              <ellipse cx="75" cy="85" rx="20" ry="25" fill={facePatchFill} />
              <ellipse cx="125" cy="85" rx="20" ry="25" fill={facePatchFill} />
              <ellipse cx="100" cy="100" rx="22" ry="18" fill={facePatchFill} />
            </g>

            {/* Blush */}
            <ellipse cx="70" cy="98" rx="8" ry="4" fill={blushFill} opacity="0.6" />
            <ellipse cx="130" cy="98" rx="8" ry="4" fill={blushFill} opacity="0.6" />

            {/* Whiskers */}
            <path d="M 35 95 L 15 90 M 35 100 L 10 100 M 38 105 L 15 110" stroke={whiskerStroke} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 165 95 L 185 90 M 165 100 L 190 100 M 162 105 L 185 110" stroke={whiskerStroke} strokeWidth="1.5" strokeLinecap="round" />

            {/* Eyebrows */}
            <ellipse cx="70" cy="62" rx="6" ry="4" fill={eyebrowFill} transform="rotate(-15 70 62)" />
            <ellipse cx="130" cy="62" rx="6" ry="4" fill={eyebrowFill} transform="rotate(15 130 62)" />

            {/* Eyes with Blinking State */}
            <g className={`transition-transform duration-150 ${getMoodEyeTransform()}`}>
              {isBlinking ? (
                <>
                  <path d="M 68 83 Q 78 83 88 83" stroke={eyeLineStroke} strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 112 83 Q 122 83 132 83" stroke={eyeLineStroke} strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye */}
                  <ellipse cx="78" cy="83" rx="11" ry="14" fill={eyeFill} />
                  <circle cx="75" cy="77" r="4" fill="#ffffff" />
                  <path d="M 83 78 Q 83 81 86 81 Q 83 81 83 84 Q 83 81 80 81 Q 83 81 83 78 Z" fill="#ffffff" />
                  <circle cx="79" cy="89" r="1.5" fill="#ffffff" />

                  {/* Right Eye */}
                  <ellipse cx="122" cy="83" rx="11" ry="14" fill={eyeFill} />
                  <circle cx="119" cy="77" r="4" fill="#ffffff" />
                  <path d="M 127 78 Q 127 81 130 81 Q 127 81 127 84 Q 127 81 124 81 Q 127 81 127 78 Z" fill="#ffffff" />
                  <circle cx="123" cy="89" r="1.5" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Nose */}
            <ellipse cx="100" cy="94" rx="5" ry="3.5" fill={noseFill} />

            {/* Expressive Mouth */}
            {mood === 'sad' ? (
              <path d="M 94 105 Q 97 100 100 105 Q 103 100 106 105" stroke={mouthStroke} strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M 94 100 Q 97 105 100 100 Q 103 105 106 100" stroke={mouthStroke} strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* ==================================================== */}
          {/* LAYER 5: HAND-HELD GEAR & CANTEEN / LANTERN          */}
          {/* ==================================================== */}
          <g id="layer-gear">
            {hasClimbingPoles && (
              <g id="gear-climbing-poles">
                {/* Left Pole */}
                <g transform="rotate(-12 55 145)">
                  <line x1="55" y1="105" x2="55" y2="175" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="55" y1="130" x2="55" y2="175" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="53" y="128" width="4" height="4" rx="1" fill="#0F172A" />
                  <rect x="53" y="150" width="4" height="4" rx="1" fill="#0F172A" />
                  <rect x="52" y="105" width="6" height="18" rx="2.5" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                  <ellipse cx="55" cy="105" rx="4" ry="2.5" fill="#78350F" />
                  <path d="M 52 110 Q 44 116 48 122 Q 53 124 53 115" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <ellipse cx="55" cy="168" rx="7" ry="2.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                  <line x1="55" y1="172" x2="55" y2="177" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Right Pole */}
                <g transform="rotate(12 145 145)">
                  <line x1="145" y1="105" x2="145" y2="175" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="145" y1="130" x2="145" y2="175" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="143" y="128" width="4" height="4" rx="1" fill="#0F172A" />
                  <rect x="143" y="150" width="4" height="4" rx="1" fill="#0F172A" />
                  <rect x="142" y="105" width="6" height="18" rx="2.5" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                  <ellipse cx="145" cy="105" rx="4" ry="2.5" fill="#78350F" />
                  <path d="M 148 110 Q 156 116 152 122 Q 147 124 147 115" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <ellipse cx="145" cy="168" rx="7" ry="2.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                  <line x1="145" y1="172" x2="145" y2="177" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>
            )}

            {hasGrapplingHook && (
              <g id="gear-grappling-hook" transform="rotate(18 145 142)">
                <ellipse cx="145" cy="142" rx="5" ry="7" fill="#64748B" stroke="#334155" strokeWidth="2" />
                <path d="M 145 135 L 145 118" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 145 118 Q 135 110 137 98" stroke="#64748B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <polygon points="137,98 133,103 140,103" fill="#334155" />
                <path d="M 145 118 Q 155 110 153 98" stroke="#64748B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <polygon points="153,98 149,103 156,103" fill="#334155" />
                <path d="M 145 118 L 145 96" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
                <polygon points="145,96 141,101 149,101" fill="#334155" />
                <path d="M 145 149 Q 148 162 144 172" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="3 2" />
              </g>
            )}

            {hasCanteen && (
              <g id="gear-canteen">
                <path d="M 52 110 Q 72 135 88 152" stroke="#78350F" strokeWidth="2.5" fill="none" />
                <ellipse cx="50" cy="148" rx="12" ry="15" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
                <ellipse cx="47" cy="145" rx="9" ry="11" fill="#38BDF8" />
                <rect x="47" y="130" width="6" height="5" rx="1" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
                <line x1="50" y1="130" x2="50" y2="126" stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx="50" cy="125" r="2.5" fill="#DC2626" />
                <ellipse cx="50" cy="148" rx="5" ry="5" fill="#0369A1" opacity="0.5" />
              </g>
            )}

            {hasLantern && (
              <g id="gear-lantern">
                <circle cx="56" cy="148" r="26" fill="#FDE047" opacity="0.35" className="animate-pulse" />
                <circle cx="56" cy="148" r="16" fill="#FEF08A" opacity="0.5" className="animate-pulse" />
                <path d="M 56 122 Q 50 114 56 108" stroke="#B45309" strokeWidth="2" fill="none" />
                <polygon points="46,128 66,128 62,122 50,122" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
                <rect x="46" y="128" width="20" height="26" rx="3" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" opacity="0.9" />
                <line x1="46" y1="135" x2="66" y2="135" stroke="#B45309" strokeWidth="1" />
                <line x1="46" y1="147" x2="66" y2="147" stroke="#B45309" strokeWidth="1" />
                <path d="M 56 148 Q 60 142 56 137 Q 52 142 56 148 Z" fill="#EF4444" className="animate-pulse" />
                <circle cx="56" cy="144" r="2.5" fill="#FBBF24" />
                <polygon points="44,154 68,154 66,160 46,160" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
              </g>
            )}

            {hasSummerIceCream && (
              <g transform="rotate(15 145 140)">
                <polygon points="145,165 136,135 154,135" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
                <circle cx="145" cy="130" r="9" fill="#34D399" />
                <circle cx="145" cy="118" r="8" fill="#F472B6" />
                <circle cx="145" cy="108" r="3.5" fill="#DC2626" />
              </g>
            )}

            {hasWinterIceSkates && (
              <g transform="rotate(-10 50 145)">
                <path d="M 42 135 L 54 135 L 54 155 L 68 158 L 68 166 L 38 166 L 38 142 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
                <line x1="32" y1="172" x2="74" y2="172" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {hasNewYearSparkler && (
              <g className="animate-pulse">
                <line x1="45" y1="160" x2="45" y2="110" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="45" cy="105" r="7" fill="#FEF08A" />
                <line x1="45" y1="92" x2="45" y2="118" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                <line x1="32" y1="105" x2="58" y2="105" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
              </g>
            )}

            {hasPresidentsShield && (
              <g>
                <circle cx="50" cy="145" r="22" fill="url(#goldBodyGrad)" stroke="#78350F" strokeWidth="2.5" />
                <circle cx="50" cy="145" r="16" fill="#1E3A8A" />
                <polygon points="50,134 53,142 61,142 55,147 57,155 50,150 43,155 45,147 39,142 47,142" fill="#FACC15" />
              </g>
            )}

            {hasStPatricksPotOfGold && (
              <g>
                <ellipse cx="50" cy="140" rx="18" ry="7" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="1.5" />
                <path d="M 34 140 C 28 156, 34 170, 50 170 C 66 170, 72 156, 66 140 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="45" cy="138" r="3" fill="#FACC15" />
                <circle cx="55" cy="138" r="3" fill="#FACC15" />
              </g>
            )}

            {hasEarthDayGlobe && (
              <g className="animate-bounce" style={{ animationDuration: '3.5s' }}>
                <line x1="145" y1="135" x2="160" y2="85" stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx="165" cy="70" r="18" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2" />
                <path d="M 155 64 Q 163 60 162 70 Q 158 78 154 74 Z" fill="#22C55E" />
              </g>
            )}

            {hasJuneteenthTorch && (
              <g>
                <polygon points="46,135 54,135 52,168 48,168" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                <path d="M 50 110 Q 62 122 56 132 Q 50 136 44 132 Q 38 122 50 110 Z" fill="#EF4444" className="animate-pulse" />
                <path d="M 50 116 Q 58 124 53 132 Q 50 134 47 132 Q 42 124 50 116 Z" fill="#FACC15" />
              </g>
            )}

            {hasJuly4Pinwheel && (
              <g className="animate-spin" style={{ animationDuration: '4s', transformOrigin: '50px 135px' }}>
                <polygon points="50,135 36,118 50,125" fill="#EF4444" />
                <polygon points="50,135 67,121 60,135" fill="#3B82F6" />
                <polygon points="50,135 64,152 50,145" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                <polygon points="50,135 33,149 40,135" fill="#EF4444" />
                <circle cx="50" cy="135" r="3.5" fill="#FACC15" />
              </g>
            )}

            {hasLaborDayToolbelt && (
              <g>
                <rect x="64" y="145" width="72" height="10" rx="3" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                <rect x="94" y="142" width="12" height="16" rx="2" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="1.5" />
              </g>
            )}

            {hasHalloweenBroom && (
              <g transform="rotate(-30 45 135)">
                <line x1="15" y1="135" x2="85" y2="135" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
                <polygon points="85,135 105,124 105,146" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <rect x="82" y="130" width="5" height="10" fill="#7C3AED" />
              </g>
            )}

            {hasThanksgivingCornucopia && (
              <g>
                <path d="M 35 155 C 22 148, 38 128, 62 128 C 70 128, 76 136, 72 150 C 68 160, 52 162, 35 155 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
                <circle cx="64" cy="140" r="5" fill="#F97316" />
                <circle cx="70" cy="136" r="4" fill="#EF4444" />
              </g>
            )}

            {hasHolidayCandyCane && (
              <g transform="rotate(18 145 135)">
                <path d="M 140 165 L 140 125 A 10 10 0 0 1 160 125 L 160 132" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 140 165 L 140 125 A 10 10 0 0 1 160 125 L 160 132" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="6 6" fill="none" />
              </g>
            )}

            {hasGoldenTicket && (
              <g id="gear-golden-ticket" transform="rotate(-15 48 140)">
                <rect x="26" y="124" width="42" height="24" rx="3" fill="url(#goldBodyGrad)" stroke="#78350F" strokeWidth="1.5" />
                <rect x="28" y="126" width="38" height="20" rx="2" fill="none" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2 1.5" />
                <text x="47" y="135" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#78350F" letterSpacing="0.5">VIP PASS</text>
                <text x="47" y="142" textAnchor="middle" fontSize="3.5" fontWeight="700" fill="#92400E">KIBO CLIMB</text>
                <circle cx="31" cy="136" r="1.5" fill="#FEF08A" />
                <circle cx="63" cy="136" r="1.5" fill="#FEF08A" />
              </g>
            )}

            {hasKiboShield && (
              <g id="consumable-shield-stage" className="animate-pulse">
                <path d="M 160 115 C 172 115, 178 122, 178 135 C 178 152, 160 165, 160 165 C 160 165, 142 152, 142 135 C 142 122, 148 115, 160 115 Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2.5" />
                <path d="M 160 120 C 168 120, 172 125, 172 134 C 172 147, 160 157, 160 157 C 160 157, 148 147, 148 134 C 148 125, 152 120, 160 120 Z" fill="#38BDF8" />
                <path d="M 155 137 L 159 141 L 167 131" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            )}
          </g>

          {/* ==================================================== */}
          {/* LAYER 6: HEADWEAR (Hats, Caps, Helmets, Glasses)    */}
          {/* ==================================================== */}
          <g id="layer-head">
            {hasCap && (
              <g id="cap-headwear">
                <path d="M 52 50 Q 100 28 148 50 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="3" />
                <path d="M 100 50 Q 148 44 165 52" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" fill="none" />
                <circle cx="100" cy="38" r="3" fill="#1E40AF" />
              </g>
            )}

            {hasBandana && (
              <g id="bandana-headwear">
                <path d="M 50 48 Q 100 26 150 48 L 146 58 Q 100 38 54 58 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <polygon points="144,52 165,62 152,70" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                <circle cx="80" cy="46" r="1.5" fill="#FFFFFF" />
                <circle cx="100" cy="42" r="1.5" fill="#FFFFFF" />
                <circle cx="120" cy="46" r="1.5" fill="#FFFFFF" />
              </g>
            )}

            {hasPartyHat && (
              <g id="party-hat-headwear">
                <polygon points="100,6 68,54 132,54" fill="#EC4899" stroke="#BE185D" strokeWidth="2.5" />
                <line x1="74" y1="45" x2="126" y2="45" stroke="#FBBF24" strokeWidth="3" />
                <line x1="82" y1="32" x2="118" y2="32" stroke="#38BDF8" strokeWidth="3" />
                <line x1="90" y1="20" x2="110" y2="20" stroke="#34D399" strokeWidth="3" />
                <circle cx="100" cy="4" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              </g>
            )}

            {hasGoggles && (
              <g id="goggles-headwear">
                <path d="M 45 78 Q 100 70 155 78" stroke="#1E293B" strokeWidth="4" fill="none" />
                <rect x="65" y="70" width="30" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" opacity="0.9" />
                <rect x="105" y="70" width="30" height="20" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" opacity="0.9" />
                <line x1="95" y1="80" x2="105" y2="80" stroke="#0284C7" strokeWidth="4" />
                <line x1="70" y1="74" x2="80" y2="74" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <line x1="110" y1="74" x2="120" y2="74" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {hasNinjaHeadband && (
              <g id="ninja-headband-headwear">
                <path d="M 48 48 Q 28 54 32 74 Q 40 66 48 54 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                <path d="M 52 46 Q 30 62 42 78 Q 48 70 54 52 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" />
                <path d="M 48 48 Q 100 28 152 48 L 148 58 Q 100 38 52 58 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
                <rect x="84" y="38" width="32" height="15" rx="3" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
                <circle cx="87" cy="45.5" r="1" fill="#0F172A" />
                <circle cx="113" cy="45.5" r="1" fill="#0F172A" />
                <path d="M 94 49 L 100 41 L 106 49" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            )}

            {hasExplorerHat && (
              <g id="explorer-hat-headwear">
                <path d="M 70 45 Q 100 12 130 45 Z" fill="#92400E" stroke="#451A03" strokeWidth="3" />
                <ellipse cx="100" cy="46" rx="54" ry="10" fill="#78350F" stroke="#451A03" strokeWidth="3" />
                <rect x="74" y="38" width="52" height="6" fill="#15803D" stroke="#166534" strokeWidth="1" />
              </g>
            )}

            {hasPumpkinHat && (
              <g id="jack-o-lantern-head">
                <path d="M 100 19 C 106 11, 116 7, 122 11 C 126 15, 121 21, 116 19" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 100 17 C 94 9, 84 5, 78 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
                <ellipse cx="66" cy="46" rx="16" ry="24" fill="url(#pumpkinOuterLobeGrad)" stroke="#9A3412" strokeWidth="2.5" />
                <ellipse cx="134" cy="46" rx="16" ry="24" fill="url(#pumpkinOuterLobeGrad)" stroke="#9A3412" strokeWidth="2.5" />
                <ellipse cx="79" cy="47" rx="18" ry="26" fill="url(#pumpkinMidLobeGrad)" stroke="#9A3412" strokeWidth="2.5" />
                <ellipse cx="121" cy="47" rx="18" ry="26" fill="url(#pumpkinMidLobeGrad)" stroke="#9A3412" strokeWidth="2.5" />
                <ellipse cx="100" cy="48" rx="19" ry="28" fill="url(#pumpkinCenterLobeGrad)" stroke="#9A3412" strokeWidth="2.5" />
                <path d="M 87 23 Q 84 48 88 74" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                <path d="M 113 23 Q 116 48 112 74" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                <path d="M 86 24 Q 100 21 114 24" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
                <path d="M 93 23 Q 100 18 107 23 L 104 27 L 96 27 Z" fill="#15803D" stroke="#14532D" strokeWidth="1" />
                <path d="M 96 23 C 94 12, 102 7, 106 2 L 110 3.5 C 107 9, 103 14, 103 23 Z" fill="url(#pumpkinStemGrad)" stroke="#14532D" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="76,43 90,39 86,49" fill="url(#pumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="78,44 88,41 85,48" fill="#FEF08A" opacity="0.9" />
                <polygon points="124,43 110,39 114,49" fill="url(#pumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="122,44 112,41 115,48" fill="#FEF08A" opacity="0.9" />
                <polygon points="96,49 104,49 100,43" fill="url(#pumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M 74 55 Q 100 75 126 55 L 122 59 L 117 56 L 113 62 L 100 58 L 87 62 L 83 56 L 78 59 Z" fill="url(#pumpkinCarveGlow)" stroke="#7C2D12" strokeWidth="1.5" strokeLinejoin="round" />
              </g>
            )}

            {hasSummerVisor && (
              <g id="summer-visor-headwear">
                {/* Back strap around the crown */}
                <path d="M 60 50 Q 100 36 140 50 L 138 58 Q 100 44 62 58 Z" fill="#0369A1" stroke="#0C4A6E" strokeWidth="2" />
                <path d="M 64 52 Q 100 38 136 52" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.6" />

                {/* 3D Visor Brim projecting forward over the brow with translucent aqua-blue sun shield */}
                <path
                  d="M 54 52 Q 100 36 146 52 Q 152 74 100 78 Q 48 74 54 52 Z"
                  fill="url(#summerVisorBrimGrad)"
                  stroke="#0284C7"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Visor brim underside contour */}
                <path
                  d="M 58 55 Q 100 40 142 55 Q 146 72 100 75 Q 54 72 58 55 Z"
                  fill="#0284C7"
                  opacity="0.35"
                />
                {/* Specular gloss reflection curve */}
                <path
                  d="M 66 60 Q 100 70 134 60"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.88"
                />
                <path
                  d="M 76 66 Q 100 73 124 66"
                  stroke="#E0F2FE"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />

                {/* Front Structured Padded Headband */}
                <path
                  d="M 58 48 Q 100 34 142 48 L 140 58 Q 100 44 60 58 Z"
                  fill="url(#vipCrownGrad)"
                  stroke="#B45309"
                  strokeWidth="2.5"
                />
                {/* Contrast stitched headband top & bottom trim */}
                <path d="M 60 50 Q 100 36 140 50" stroke="#FEF08A" strokeWidth="2" fill="none" />
                <path d="M 62 56 Q 100 42 138 56" stroke="#D97706" strokeWidth="1.2" fill="none" />

                {/* Side Pivot Clasps / Metallic Rivets */}
                <circle cx="56" cy="53" r="4" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="56" cy="53" r="1.5" fill="#E2E8F0" />
                <circle cx="144" cy="53" r="4" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="144" cy="53" r="1.5" fill="#E2E8F0" />

                {/* Embroidered Sun Emblem Badge */}
                <circle cx="100" cy="46" r="6" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
                <circle cx="100" cy="46" r="4" fill="#F59E0B" />
                <line x1="100" y1="37" x2="100" y2="39.5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="100" y1="52.5" x2="100" y2="55" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="91" y1="46" x2="93.5" y2="46" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="106.5" y1="46" x2="109" y2="46" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {hasSummerSnorkel && (
              <g>
                <rect x="65" y="70" width="70" height="24" rx="8" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2.5" />
                <rect x="70" y="74" width="60" height="16" rx="5" fill="#38BDF8" opacity="0.9" />
                <path d="M 135 82 L 148 82 L 148 35 Q 148 26 138 26" stroke="#FACC15" strokeWidth="6" fill="none" strokeLinecap="round" />
                <rect x="132" y="22" width="10" height="6" rx="1" fill="#EF4444" />
              </g>
            )}

            {hasWinterBeanie && (
              <g id="winter-beanie-headwear">
                <path d="M 66 62 C 60 26, 80 12, 100 12 C 120 12, 140 26, 134 62 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
                <path d="M 72 44 Q 100 38 128 44" stroke="#DBEAFE" strokeWidth="3" strokeDasharray="4 3" fill="none" />
                <rect x="62" y="56" width="76" height="14" rx="5" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2.5" />
                <circle cx="100" cy="10" r="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
              </g>
            )}

            {hasCyberShades && (
              <g id="cyber-shades-headwear" className="animate-cyber-pulse">
                {/* Cyberpunk Neon Glow Aura */}
                <polygon points="62,74 138,74 134,96 108,100 100,90 92,100 66,96" fill="#06B6D4" opacity="0.3" filter="url(#cyberNeonGlow)" />

                {/* Outer Matte Black Cyber Frame */}
                <polygon
                  points="62,74 138,74 134,96 108,100 100,90 92,100 66,96"
                  fill="#0F172A"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinejoin="bevel"
                />

                {/* Top Neon Brow Accent Bar */}
                <path d="M 64 75 L 136 75" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />

                {/* Left Holographic Cyan Visor Lens */}
                <polygon
                  points="66,78 97,78 93,95 69,92"
                  fill="url(#cyberVisorGradCyan)"
                  stroke="#06B6D4"
                  strokeWidth="1.2"
                  strokeLinejoin="bevel"
                />
                {/* Right Holographic Magenta Visor Lens */}
                <polygon
                  points="103,78 134,78 131,92 107,95"
                  fill="url(#cyberVisorGradPink)"
                  stroke="#EC4899"
                  strokeWidth="1.2"
                  strokeLinejoin="bevel"
                />

                {/* Cyberpunk HUD Laser Scanlines */}
                <line x1="69" y1="83" x2="94" y2="83" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
                <line x1="72" y1="88" x2="91" y2="88" stroke="#A5F3FC" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
                <line x1="106" y1="83" x2="131" y2="83" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
                <line x1="109" y1="88" x2="128" y2="88" stroke="#FBCFE8" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />

                {/* Laser Specular Diagonal Flare */}
                <polygon points="74,78 80,78 72,93 68,93" fill="#FFFFFF" opacity="0.45" />
                <polygon points="118,78 124,78 116,93 112,93" fill="#FFFFFF" opacity="0.45" />

                {/* Status LED Indicator Nodes */}
                <circle cx="64" cy="76" r="1.8" fill="#22D3EE" />
                <circle cx="136" cy="76" r="1.8" fill="#F472B6" />
                <circle cx="100" cy="76" r="1.5" fill="#FEF08A" />

                {/* Sleek Temple Arms Wrapping to Kibo's Ears */}
                <path d="M 62 76 L 52 82 L 50 88" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 138 76 L 148 82 L 150 88" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {hasWizardHat && (
              <g id="wizard-hat-headwear">
                <path d="M 60 52 Q 100 -12 140 52 C 120 56, 80 56, 60 52 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="100" cy="52" rx="48" ry="10" fill="#6D28D9" stroke="#5B21B6" strokeWidth="3" />
                <polygon points="100,5 103,12 110,14 105,19 106,26 100,22 94,26 95,19 90,14 97,12" fill="#FBBF24" />
                <polygon points="85,30 87,34 91,35 88,38 89,42 85,40 82,42 83,38 80,35 84,34" fill="#FBBF24" />
                <polygon points="115,30 117,34 121,35 118,38 119,42 115,40 112,42 113,38 110,35 114,34" fill="#FBBF24" />
              </g>
            )}

            {hasCrown && (
              <g id="crown-headwear">
                <path d="M 65 48 Q 68 25 72 18 Q 79 28 86 32 Q 93 15 100 10 Q 107 15 114 32 Q 121 28 128 18 Q 132 25 135 48 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 65 48 Q 100 42 135 48 L 133 54 Q 100 48 67 54 Z" fill="#D97706" stroke="#B45309" strokeWidth="2" />
                <circle cx="72" cy="16" r="4" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
                <circle cx="100" cy="8" r="5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
                <circle cx="128" cy="16" r="4" fill="#10B981" stroke="#047857" strokeWidth="1" />
                <circle cx="86" cy="46" r="2.5" fill="#EF4444" />
                <circle cx="100" cy="45" r="3" fill="#FFFFFF" />
                <circle cx="114" cy="46" r="2.5" fill="#10B981" />
              </g>
            )}

            {hasNeonHeadphones && (
              <g id="headphones-headwear">
                <path d="M 47 75 A 55 55 0 0 1 153 75" stroke="url(#neonHeadphoneGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M 49 74 A 53 53 0 0 1 151 74" stroke="#67E8F9" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
                <rect x="37" y="62" width="18" height="34" rx="9" fill="url(#neonHeadphoneGrad)" stroke="#0369A1" strokeWidth="3" />
                <rect x="41" y="66" width="10" height="26" rx="5" fill="#38BDF8" opacity="0.9" />
                <circle cx="46" cy="79" r="3" fill="#A5F3FC" className="animate-pulse" />
                <rect x="145" y="62" width="18" height="34" rx="9" fill="url(#neonHeadphoneGrad)" stroke="#0369A1" strokeWidth="3" />
                <rect x="149" y="66" width="10" height="26" rx="5" fill="#38BDF8" opacity="0.9" />
                <circle cx="154" cy="79" r="3" fill="#A5F3FC" className="animate-pulse" />
              </g>
            )}

            {hasSpringBunnyEars && (
              <g>
                <path d="M 72 50 C 50 -10, 80 -25, 86 35 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
                <path d="M 74 42 C 58 0, 78 -10, 82 30 Z" fill="#FBCFE8" />
                <path d="M 128 50 C 150 -10, 120 -25, 114 35 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
                <path d="M 126 42 C 142 0, 122 -10, 118 30 Z" fill="#FBCFE8" />
                <ellipse cx="100" cy="54" rx="34" ry="7" fill="#F472B6" />
              </g>
            )}

            {hasAutumnLeafCrown && (
              <g>
                <ellipse cx="100" cy="52" rx="46" ry="12" fill="none" stroke="#78350F" strokeWidth="3" />
                <polygon points="100,20 90,34 100,38 110,34" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <polygon points="76,28 68,42 78,44 86,38" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <polygon points="124,28 114,38 122,44 132,42" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
              </g>
            )}

            {hasNewYearTopHat && (
              <g>
                <ellipse cx="100" cy="52" rx="48" ry="10" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <path d="M 74 50 L 78 5 L 122 5 L 126 50 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
                <rect x="76" y="38" width="48" height="12" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="1.5" />
              </g>
            )}

            {hasValentinesHeartShades && (
              <g>
                <path d="M 78 78 L 65 64 A 8 8 0 0 1 78 54 A 8 8 0 0 1 91 64 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
                <path d="M 122 78 L 109 64 A 8 8 0 0 1 122 54 A 8 8 0 0 1 135 64 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
                <line x1="90" y1="64" x2="110" y2="64" stroke="#DB2777" strokeWidth="3" />
              </g>
            )}

            {hasPresidentsTricorne && (
              <g>
                <polygon points="100,10 55,54 145,54" fill="#1E293B" stroke="#0F172A" strokeWidth="3.5" />
                <ellipse cx="100" cy="54" rx="46" ry="10" fill="#334155" />
                <circle cx="100" cy="38" r="7" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="1.5" />
              </g>
            )}

            {hasStPatricksLeprechaunHat && (
              <g>
                <ellipse cx="100" cy="54" rx="46" ry="10" fill="#15803D" stroke="#14532D" strokeWidth="2.5" />
                <path d="M 75 52 L 77 8 L 123 8 L 125 52 Z" fill="#16A34A" stroke="#14532D" strokeWidth="3" />
                <rect x="76" y="38" width="48" height="12" fill="#0F172A" />
                <rect x="92" y="35" width="16" height="18" fill="url(#goldBodyGrad)" stroke="#B45309" strokeWidth="2" />
              </g>
            )}

            {hasEarthDaySprout && (
              <g>
                <path d="M 100 48 L 100 20" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 100 20 C 80 14, 80 -2, 100 14 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
                <path d="M 100 20 C 120 14, 120 -2, 100 14 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
              </g>
            )}

            {hasMemorialPoppy && (
              <g>
                <circle cx="70" cy="48" r="14" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                <circle cx="70" cy="48" r="6" fill="#0F172A" />
              </g>
            )}

            {hasJuneteenthUnityBeanie && (
              <g>
                <path d="M 66 62 C 60 26, 80 12, 100 12 C 120 12, 140 26, 134 62 Z" fill="#15803D" stroke="#14532D" strokeWidth="3" />
                <rect x="62" y="56" width="76" height="14" rx="4" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                <line x1="62" y1="46" x2="138" y2="46" stroke="#FACC15" strokeWidth="4" />
              </g>
            )}

            {hasJuly4UncleSamHat && (
              <g>
                <ellipse cx="100" cy="54" rx="48" ry="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
                <path d="M 74 52 L 78 5 L 122 5 L 126 52 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="3" />
                <line x1="90" y1="5" x2="88" y2="38" stroke="#DC2626" strokeWidth="6" />
                <line x1="110" y1="5" x2="112" y2="38" stroke="#DC2626" strokeWidth="6" />
                <rect x="75" y="38" width="50" height="14" fill="#1E3A8A" />
              </g>
            )}

            {hasLaborDayHardhat && (
              <g>
                <path d="M 64 54 C 60 22, 80 10, 100 10 C 120 10, 140 22, 136 54 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="3.5" />
                <ellipse cx="100" cy="54" rx="48" ry="10" fill="#EAB308" stroke="#CA8A04" strokeWidth="2.5" />
                <rect x="92" y="24" width="16" height="10" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
              </g>
            )}

            {hasVeteransBeret && (
              <g>
                <path d="M 64 54 C 60 28, 90 15, 126 20 C 146 22, 148 44, 134 54 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="3" />
                <ellipse cx="96" cy="54" rx="38" ry="8" fill="#0F172A" />
                <polygon points="86,32 88,38 94,38 89,42 91,48 86,44 81,48 83,42 78,38 84,38" fill="#FACC15" />
              </g>
            )}

            {hasThanksgivingTurkeyHat && (
              <g>
                <ellipse cx="100" cy="18" rx="8" ry="20" fill="#EF4444" />
                <ellipse cx="82" cy="22" rx="8" ry="18" fill="#F59E0B" transform="rotate(-20 82 22)" />
                <ellipse cx="118" cy="22" rx="8" ry="18" fill="#F59E0B" transform="rotate(20 118 22)" />
                <circle cx="100" cy="50" r="20" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
                <polygon points="100,48 106,54 94,54" fill="#FACC15" />
              </g>
            )}

            {hasHolidaySantaHat && (
              <g>
                <path d="M 68 56 Q 100 5 142 30 L 136 56 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
                <rect x="62" y="52" width="76" height="14" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
                <circle cx="145" cy="32" r="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
              </g>
            )}

            {hasHolidayReindeerAntlers && (
              <g>
                <path d="M 76 48 L 70 8 M 70 24 L 54 12 M 70 36 L 56 32" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
                <circle cx="54" cy="12" r="3.5" fill="#FACC15" />
                <path d="M 124 48 L 130 8 M 130 24 L 146 12 M 130 36 L 144 32" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
                <circle cx="146" cy="12" r="3.5" fill="#FACC15" />
              </g>
            )}
          </g>
        </g>

        {/* ==================================================== */}
        {/* LAYER 7: FRONT VISUAL FX (Overhead Halos, Sparks)    */}
        {/* ==================================================== */}
        <g id="layer-front-fx">
          {hasSpringSakuraHalo && (
            <g className="animate-pulse">
              <ellipse cx="100" cy="30" rx="45" ry="16" stroke="#F472B6" strokeWidth="3" strokeDasharray="6 4" fill="none" />
              <circle cx="65" cy="24" r="5" fill="#FBCFE8" />
              <circle cx="135" cy="36" r="5" fill="#FBCFE8" />
            </g>
          )}

          {hasSummerSplashAura && (
            <g id="summer-splash-fx">
              {/* Base swirling ocean ripple waves under Kibo */}
              <g className="animate-pulse">
                <ellipse cx="100" cy="182" rx="72" ry="20" fill="#38BDF8" opacity="0.35" stroke="#0284C7" strokeWidth="2" strokeDasharray="8 4" />
                <ellipse cx="100" cy="182" rx="52" ry="14" fill="#67E8F9" opacity="0.45" stroke="#06B6D4" strokeWidth="1.5" />
              </g>

              {/* Swirling wave splash curves around Kibo with smooth bobbing */}
              <g className="animate-wave-bob">
                <path
                  d="M 26 178 C 24 142, 44 116, 68 118 C 78 119, 82 130, 74 138 C 66 146, 54 138, 52 130 C 42 138, 38 156, 42 178 Z"
                  fill="url(#summerWaveSplashGrad)"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* White foamy wave crest on left */}
                <path
                  d="M 48 124 C 60 120, 78 126, 74 136 C 70 142, 62 138, 56 132 Z"
                  fill="#F0F9FF"
                  stroke="#BAE6FD"
                  strokeWidth="1.5"
                />

                <path
                  d="M 174 178 C 176 142, 156 116, 132 118 C 122 119, 118 130, 126 138 C 134 146, 146 138, 148 130 C 158 138, 162 156, 158 178 Z"
                  fill="url(#summerWaveSplashGrad)"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* White foamy wave crest on right */}
                <path
                  d="M 152 124 C 140 120, 122 126, 126 136 C 130 142, 138 138, 144 132 Z"
                  fill="#F0F9FF"
                  stroke="#BAE6FD"
                  strokeWidth="1.5"
                />
              </g>

              {/* Floating animated splashing water droplets and bubbles */}
              <g className="animate-bounce">
                <circle cx="38" cy="110" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                <circle cx="36.5" cy="108.5" r="1.5" fill="#FFFFFF" />

                <circle cx="162" cy="108" r="5.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                <circle cx="160" cy="106" r="1.8" fill="#FFFFFF" />

                <circle cx="100" cy="14" r="4.5" fill="#67E8F9" stroke="#0284C7" strokeWidth="1.2" />
                <circle cx="98.5" cy="12.5" r="1.5" fill="#FFFFFF" />
              </g>

              <g className="animate-pulse">
                <circle cx="26" cy="136" r="3.5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1" />
                <circle cx="174" cy="134" r="3.5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1" />
                <circle cx="56" cy="36" r="4" fill="#A5F3FC" opacity="0.85" stroke="#06B6D4" strokeWidth="1" />
                <circle cx="144" cy="34" r="4" fill="#A5F3FC" opacity="0.85" stroke="#06B6D4" strokeWidth="1" />

                {/* Ocean sparkle stars */}
                <polygon points="100,2 101.5,6 106,7.5 101.5,9 100,13 98.5,9 94,7.5 98.5,6" fill="#E0F2FE" />
                <polygon points="42,90 43.5,93 46.5,94 43.5,95 42,98 40.5,95 37.5,94 40.5,93" fill="#E0F2FE" />
                <polygon points="158,90 159.5,93 162.5,94 159.5,95 158,98 156.5,95 153.5,94 156.5,93" fill="#E0F2FE" />
              </g>
            </g>
          )}

          {hasKiboClub && (
            <g id="kibo-club-vip-fx" className="animate-vip-glow">
              {/* Radiant VIP Glow Halo behind crown */}
              <circle cx="100" cy="24" r="28" fill="#FBBF24" opacity="0.3" filter="url(#cyberNeonGlow)" />

              {/* Floating Royal Golden Kibo Club Crown */}
              <path
                d="M 72 34 L 78 14 L 88 24 L 100 8 L 112 24 L 122 14 L 128 34 Z"
                fill="url(#vipCrownGrad)"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Embossed Crown Base Ribbon */}
              <path d="M 73 30 Q 100 38 127 30" stroke="#78350F" strokeWidth="2.5" fill="none" />
              <path d="M 74 32 Q 100 40 126 32" stroke="#FEF08A" strokeWidth="1.5" fill="none" />

              {/* Royal Crown Jewels */}
              <circle cx="78" cy="14" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
              <circle cx="100" cy="8" r="3.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <circle cx="122" cy="14" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
              <circle cx="100" cy="24" r="3" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />

              {/* Floating Golden Sparks & Starbursts */}
              <polygon points="62,18 63.5,22 67,23 63.5,24 62,28 60.5,24 57,23 60.5,22" fill="#FEF08A" />
              <polygon points="138,18 139.5,22 143,23 139.5,24 138,28 136.5,24 133,23 136.5,22" fill="#FEF08A" />
              <polygon points="100,-2 101.5,2 105,3 101.5,4 100,8 98.5,4 95,3 98.5,2" fill="#FFFFFF" />
            </g>
          )}

          {hasValentinesLoveSparks && (
            <g className="animate-bounce">
              <path d="M 50 35 L 40 22 A 6 6 0 0 1 50 14 A 6 6 0 0 1 60 22 Z" fill="#EF4444" />
              <path d="M 150 35 L 140 22 A 6 6 0 0 1 150 14 A 6 6 0 0 1 160 22 Z" fill="#F472B6" />
            </g>
          )}

          {hasHolidayTwinkleLights && (
            <g className="animate-pulse">
              <path d="M 55 55 Q 100 75 145 55 M 50 120 Q 100 150 150 120" stroke="#1E293B" strokeWidth="2" fill="none" />
              <circle cx="70" cy="62" r="4" fill="#EF4444" />
              <circle cx="100" cy="68" r="4" fill="#FACC15" />
              <circle cx="130" cy="62" r="4" fill="#3B82F6" />
              <circle cx="75" cy="132" r="4" fill="#22C55E" />
              <circle cx="125" cy="132" r="4" fill="#EC4899" />
            </g>
          )}

          {hasSparkleDust && (
            <g>
              <path d="M 60 20 L 56 38" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" className="animate-rain-drop-1" />
              <path d="M 140 25 L 136 43" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" className="animate-rain-drop-2" />
              <path d="M 90 15 L 86 33" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-5" />
              <path d="M 110 35 L 106 53" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop-4" />
            </g>
          )}

          {hasLightningSparks && (
            <g id="cosmic-bubble-floating-front">
              <g className="animate-bubble-float-2"><circle cx="85" cy="145" r="16" fill="#A5F3FC" opacity="0.6" stroke="#0284C7" strokeWidth="1.5" /><circle cx="80" cy="140" r="4.5" fill="#FFFFFF" opacity="0.85" /></g>
              <g className="animate-bubble-float-4"><circle cx="115" cy="155" r="12" fill="#FBCFE8" opacity="0.6" stroke="#DB2777" strokeWidth="1.5" /><circle cx="112" cy="152" r="3.5" fill="#FFFFFF" opacity="0.85" /></g>
            </g>
          )}

          {hasSpeedTrail && (
            <g id="disco-fever-spotlight-front" className="animate-disco-spotlight">
              <circle cx="50" cy="175" r="3" fill="#FDE047" className="animate-ping" />
              <circle cx="150" cy="175" r="3" fill="#38BDF8" className="animate-ping" />
              <polygon points="100,165 103,172 110,172 104,176 106,183 100,178 94,183 96,176 90,172 97,172" fill="#F472B6" opacity="0.8" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
