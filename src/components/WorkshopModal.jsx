import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Zap, Check, Lock, Sparkles, X, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, ArrowLeft, User } from 'lucide-react';
import Mascot from './Mascot';
import ItemThumbnail from './ItemThumbnail';
import { ITEM_CATEGORIES, WORKSHOP_ITEMS, RARITY_TIERS, getItemsByCategory, getItemById } from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export function sortShopItems(items, userSparks, unlockedItems = [], equippedItems = []) {
  return [...items].sort((a, b) => {
    const aEquipped = equippedItems.includes(a.id);
    const bEquipped = equippedItems.includes(b.id);
    if (aEquipped !== bEquipped) return aEquipped ? -1 : 1;

    const aUnlocked = unlockedItems.includes(a.id);
    const bUnlocked = unlockedItems.includes(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;

    const aCanAfford = userSparks >= a.cost;
    const bCanAfford = userSparks >= b.cost;
    if (aCanAfford !== bCanAfford) return aCanAfford ? -1 : 1;

    return a.cost - b.cost;
  });
}

export default function WorkshopModal({
  isOpen,
  onClose,
  sparks,
  streakShields = 1,
  consumables = { shieldCount: 1, timeFreezeCount: 0 },
  unlockedItems = [],
  equippedItems = [],
  onBuyItem,
  onBuyConsumable,
  onToggleEquip,
  allowRealMoneyPurchases,
  onBuySparksPackage,
  onRequestAccountLink,
  renderFooter
}) {
  const INITIAL_PREVIEW_SLOTS = {
    headwear: null,
    gear: null,
    outfits: null,
    pets: null,
    fx: null,
    skins: null,
    effects: null,
    background: null
  };

  const [activeCategory, setActiveCategory] = useState('powerups');
  const [previewSlots, setPreviewSlots] = useState(INITIAL_PREVIEW_SLOTS);
  const [recentlyPurchasedId, setRecentlyPurchasedId] = useState(null);

  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!categoryScrollRef.current) return;
    requestAnimationFrame(() => {
      if (!categoryScrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    });
  };

  // Reset preview slots when modal opens and add Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setPreviewSlots(INITIAL_PREVIEW_SLOTS);
      setTimeout(checkScroll, 100);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleScrollLeft = () => {
    soundFx.playKeyTap();
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    soundFx.playKeyTap();
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  const handleCategoryWheel = (e) => {
    if (categoryScrollRef.current && (e.deltaY !== 0 || e.deltaX !== 0)) {
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      categoryScrollRef.current.scrollLeft += delta;
      checkScroll();
    }
  };

  if (!isOpen) return null;

  // Compute active stage items (merges saved equipped items with active preview slots)
  const computeStageEquipped = () => {
    const stageItems = [];

    ['headwear', 'gear', 'outfits', 'pets', 'fx', 'skins', 'effects', 'background'].forEach((cat) => {
      if (previewSlots[cat] !== null && previewSlots[cat] !== undefined) {
        if (previewSlots[cat]) {
          stageItems.push(previewSlots[cat]);
        }
      } else {
        const savedItemInCat = equippedItems.find((id) => {
          const item = getItemById(id);
          return item ? item.category === cat : false;
        });
        if (savedItemInCat) {
          stageItems.push(savedItemInCat);
        }
      }
    });

    return stageItems;
  };

  const stageEquippedItems = computeStageEquipped();
  const currentCategoryItems = getItemsByCategory(activeCategory);

  // Check if any active preview overrides exist
  const hasActivePreview = Object.values(previewSlots).some((v) => v !== null);
  const hasUnownedPreview = stageEquippedItems.some((id) => !unlockedItems.includes(id));

  const handleCategorySelect = (catId) => {
    soundFx.playKeyTap();
    setActiveCategory(catId);
  };

  const handleResetPreview = () => {
    soundFx.playKeyTap();
    setPreviewSlots(INITIAL_PREVIEW_SLOTS);
  };

  const handlePreviewToggle = (item) => {
    if (item.isConsumable) return;
    soundFx.playKeyTap();
    const cat = item.category;

    if (previewSlots[cat] === item.id) {
      setPreviewSlots((prev) => ({ ...prev, [cat]: null }));
    } else {
      setPreviewSlots((prev) => ({ ...prev, [cat]: item.id }));
    }
  };

  const handleBuyClick = (item) => {
    if (item.isConsumable) {
      soundFx.playKeyTap();
      onBuyConsumable(item);
      setRecentlyPurchasedId(item.id);
      setTimeout(() => setRecentlyPurchasedId(null), 1200);
      return;
    }

    const isUnlocked = unlockedItems.includes(item.id);
    if (isUnlocked) {
      soundFx.playKeyTap();
      onToggleEquip(item.id);
      return;
    }

    if (item.realMoneyPrice) {
      soundFx.playKeyTap();
      // Forward the real money purchase up to App.jsx for mock checkout processing
      // Note: `onBuySparksPackage` handles mock checkout natively right now.
      onBuySparksPackage(item);
      return;
    }

    if (sparks >= item.cost) {
      soundFx.playVictory();
      onBuyItem(item);
      setRecentlyPurchasedId(item.id);
      setTimeout(() => setRecentlyPurchasedId(null), 1200);

      // Auto-equip into preview slot upon purchase
      if (!item.isConsumable) {
        const cat = item.category;
        setPreviewSlots((prev) => ({
          ...prev,
          [cat]: item.id
        }));
      }
    } else {
      soundFx.playIncorrect();
      if (!item.isConsumable) {
        handlePreviewToggle(item);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-slate-800">
          <ShoppingBag className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">Kibo's Corner 🐾</h2>
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const username = storageService.getUsername() || storageService.getActiveProfile()?.name || '';
            return username ? (
              <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <User className="w-3 h-3" />{username}
              </span>
            ) : null;
          })()}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border-2 border-amber-300 rounded-full text-amber-900 font-black text-xs shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400 stroke-[2.5]" />
            <span>{sparks}</span>
          </div>
        </div>
      </header>

      {/* PINNED TOP STAGE & CATEGORY FILTERS */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:px-6 sm:pt-4 sm:pb-3 shrink-0 space-y-3 bg-slate-50 border-b border-slate-200 shadow-xs z-10">
        {/* Live Try-On Preview Mascot Stage Header */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-center gap-5 sm:gap-8 shadow-sm relative">
          {/* Locked Fixed Width Mascot Anchor Box */}
          <div className="w-36 h-36 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center relative p-1 overflow-visible">
            <Mascot mood="happy" equipped={stageEquippedItems} className="w-32 h-32 sm:w-44 sm:h-44" />
          </div>

          <div className="text-left space-y-2 flex-1 max-w-[240px] shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {hasUnownedPreview ? (
                <span className="bg-purple-600 text-white font-black text-[9px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                  <Sparkles className="w-3 h-3 fill-amber-300 stroke-[2.5]" /> Preview Mode
                </span>
              ) : (
                <span className="bg-emerald-600 text-white font-black text-[9px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Active Look
                </span>
              )}

              {hasActivePreview && (
                <button
                  onClick={handleResetPreview}
                  className="text-[10px] sm:text-xs font-extrabold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition-all border border-slate-200"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-600 leading-snug">
              {hasUnownedPreview
                ? 'Tap any item to try it on Kibo! Buy items below to unlock.'
                : 'Customize Kibo with outfits, gear, pets, and trail effects!'}
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            {canScrollLeft && (
              <button
                type="button"
                onClick={handleScrollLeft}
                className="absolute left-0 z-20 p-1 bg-white/90 text-slate-700 rounded-full shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>
            )}

            <div
              ref={categoryScrollRef}
              onScroll={checkScroll}
              onWheel={handleCategoryWheel}
              className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none w-full touch-pan-x"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`py-1.5 px-3 text-[11px] font-extrabold rounded-xl shrink-0 transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white text-slate-900 shadow-sm border border-amber-300 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={handleScrollRight}
                className="absolute right-0 z-20 p-1 bg-white/90 text-slate-700 rounded-full shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEDICATED INDEPENDENT ITEM GRID SCROLL CONTAINER */}
      <main className="flex-1 min-h-0 max-h-[48vh] sm:max-h-[52vh] overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-4xl mx-auto p-3 sm:p-5">
        <div className="space-y-2.5 pb-6">

          {/* Kibo Club Subscription Banner */}
          {allowRealMoneyPurchases && (
            <div
              onClick={() => onBuySparksPackage({ id: 'kibo_club_sub', name: 'Kibo Club Subscription', realMoneyPrice: '$4.99/mo', price: '$4.99/mo', isSubscription: true, description: 'Permanent 1.25x Spark Multiplier + Exclusive Daily Rewards!' })}
              className="mb-4 w-full bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-purple-400 rounded-2xl p-3 flex flex-row items-center justify-between shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 shrink-0">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white leading-tight">Join Kibo Club!</h3>
                  <p className="text-[10px] font-bold text-indigo-100 leading-snug">
                    1.25x Sparks Forever & More • $4.99/mo
                  </p>
                </div>
              </div>
              <button className="bg-white text-indigo-900 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap shrink-0 ml-2">
                Join
              </button>
            </div>
          )}

          {/* Promotional Account Link Banner in Shop */}
          {authService.getAuthState().isAnonymous && onRequestAccountLink && (
            <div
              onClick={onRequestAccountLink}
              className="mb-2.5 w-full bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-2xl p-2.5 flex flex-row items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-400 shrink-0 shadow-inner">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-amber-950 leading-tight">Link Account for +200 ⚡</h3>
                  <p className="text-[10px] font-bold text-amber-800 leading-snug">
                    Save your progress and get free Sparks instantly!
                  </p>
                </div>
              </div>
              <button className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md border-b-2 border-amber-700 whitespace-nowrap shrink-0 ml-2">
                Link Now
              </button>
            </div>
          )}

          {activeCategory === 'get_sparks' ? (
            allowRealMoneyPurchases ? (
              <div className="space-y-2.5">
                {[
                  { id: 'sparks_pack_1', name: 'Handful of Sparks', sparks: 500, price: '$1.99', description: 'A nice little boost to get you that special item!', realMoneyPrice: '$1.99' },
                  { id: 'sparks_pack_2', name: 'Pouch of Sparks', sparks: 1200, price: '$3.99', description: 'More than double the sparks for your adventures!', realMoneyPrice: '$3.99' },
                  { id: 'sparks_pack_3', name: 'Chest of Sparks', sparks: 3000, price: '$7.99', description: 'A hefty sum for the serious workshop collector.', realMoneyPrice: '$7.99' },
                  { id: 'sparks_pack_4', name: 'Mountain of Sparks', sparks: 10000, price: '$19.99', description: 'Enough sparks to buy almost anything Kibo has to offer!', realMoneyPrice: '$19.99' },
                ].map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-amber-200 shadow-sm transition-all flex items-center justify-between gap-3"
                  >
                    <div className="w-10 h-10 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center border-2 border-amber-300">
                      <Zap className="w-5 h-5 fill-amber-500 text-amber-600" />
                    </div>
                    <div className="space-y-1 text-left flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{pack.name}</h4>
                      <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block">
                        ⚡ {pack.sparks} Sparks
                      </span>
                      <p className="text-xs text-slate-500 font-medium leading-tight">{pack.description}</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => onBuySparksPackage(pack)}
                        className="btn-3d-orange px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 font-extrabold"
                      >
                        Buy for {pack.price}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 font-bold space-y-3 bg-white/80 rounded-2xl border-2 border-dashed border-slate-300 p-4">
                <Lock className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
                <p className="text-sm font-black text-slate-700">Real-Money Purchases Disabled</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Ask your parent to enable this feature in the <strong>Parent Zone</strong> dashboard.
                </p>
              </div>
            )
          ) : currentCategoryItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-bold space-y-2 bg-white/80 rounded-2xl border-2 border-dashed border-slate-300 p-4">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
              <p className="text-sm font-black text-slate-700">No items available in this category yet!</p>
              <p className="text-xs text-slate-500">Check back soon for new gear and power-ups.</p>
            </div>
          ) : (
            sortShopItems(currentCategoryItems, sparks, unlockedItems, equippedItems).map((item) => {
              const isConsumable = item.isConsumable;
              const shieldOwned = consumables?.shieldCount ?? 1;
              const isShieldFull = isConsumable && item.id === 'kibo_shield' && shieldOwned >= 2;
              const isUnlocked = isConsumable ? false : unlockedItems.includes(item.id);
              const isEquippedInApp = equippedItems.includes(item.id);
              const isPreviewedOnStage = stageEquippedItems.includes(item.id);
              const isRealMoney = !!item.realMoneyPrice;
              if (isRealMoney && !allowRealMoneyPurchases) return null; // Hide premium items if real money purchases disabled

              const canAfford = isRealMoney ? true : sparks >= item.cost;
              const shortfall = isRealMoney ? 0 : item.cost - sparks;
              const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;

              const isJustPurchased = recentlyPurchasedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handlePreviewToggle(item)}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer relative ${
                    isJustPurchased
                      ? 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-50/90 shadow-xl scale-[1.01]'
                      : isPreviewedOnStage
                      ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-200'
                      : isUnlocked
                      ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      : canAfford
                      ? 'bg-amber-50/40 border-amber-300 shadow-sm hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 opacity-95 hover:border-slate-300'
                  }`}
                >
                  {/* Floating +1 Purchase Notification Badge */}
                  {isJustPurchased && (
                    <span className="absolute -top-3 right-6 text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-0.5 rounded-full border-2 border-white shadow-lg animate-bounce flex items-center gap-1 z-30">
                      ✨ +1 Purchased!
                    </span>
                  )}

                  {/* SVG Item Thumbnail Graphic */}
                  <ItemThumbnail itemId={item.id} rarity={item.rarity} className="w-12 h-12 shrink-0" />

                  {/* Item Details */}
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{item.name}</h4>
                      
                      {item.badgeTag && (
                        <span className="text-[9px] font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-500 animate-pulse shadow-xs">
                          🚀 {item.badgeTag}
                        </span>
                      )}

                      {/* Status Badges (DEDUPED SINGLE BADGE PER POWERUP) */}
                      {isConsumable ? (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all duration-300 ${
                          isJustPurchased
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 scale-110 ring-4 ring-emerald-300 shadow-md animate-pulse'
                            : 'text-amber-950 bg-amber-100 border-amber-300'
                        }`}>
                          {item.id === 'kibo_shield'
                            ? `🛡️ CAPACITY: ${shieldOwned}/2`
                            : `🎒 OWNED: ${item.id === 'streak_saver' ? (consumables?.streakSaverCount ?? 0) : item.id === 'hint_scroll' ? (consumables?.hintScrollCount ?? 0) : (consumables?.doubleSparksPotionCount ?? consumables?.doubleCoinPotionCount ?? 0)}`}
                        </span>
                      ) : isEquippedInApp ? (
                        <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-0.5">
                          🟢 EQUIPPED
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[9px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                          🟦 OWNED
                        </span>
                      ) : !canAfford && !isRealMoney ? (
                        <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          🔒 Need {shortfall} ⚡ More
                        </span>
                      ) : isRealMoney && !isUnlocked ? (
                         <span className="text-[9px] font-black uppercase text-purple-900 bg-purple-200 px-2 py-0.5 rounded-full border border-purple-400">
                          💎 PREMIUM
                        </span>
                      ) : null}

                      {/* CLEAR PREVIEW TAP INDICATOR */}
                      {!isUnlocked && !isConsumable && (
                        <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs transition-all ${
                          isPreviewedOnStage
                            ? 'bg-purple-600 text-white border border-purple-700'
                            : 'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}>
                          👁️ {isPreviewedOnStage ? 'Previewing on Stage' : 'Tap to try on'}
                        </span>
                      )}

                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${rarityInfo.badgeClass}`}>
                        {rarityInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-slate-500 font-medium leading-tight">{item.description}</p>
                    </div>
                  </div>

                  {/* Buy / Equip Action Buttons */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isConsumable ? (
                      isShieldFull ? (
                        <button
                          type="button"
                          disabled
                          className="bg-slate-200 text-slate-500 border-2 border-slate-300 text-xs px-3 py-2 rounded-xl font-bold cursor-not-allowed"
                        >
                          Full ({shieldOwned}/2)
                        </button>
                      ) : canAfford ? (
                        <button
                          type="button"
                          onClick={() => handleBuyClick(item)}
                          className="btn-3d-orange px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          Buy for {item.cost} ⚡
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="bg-slate-100 text-rose-600 border-2 border-slate-300 text-[11px] px-3 py-2 rounded-xl font-bold cursor-not-allowed"
                        >
                          Need {shortfall} ⚡ More
                        </button>
                      )
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleBuyClick(item)}
                        className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                          isEquippedInApp
                            ? 'btn-3d-orange'
                            : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border-2 border-teal-300'
                        }`}
                      >
                        {isEquippedInApp ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" /> Equipped
                          </>
                        ) : (
                          'Equip'
                        )}
                      </button>
                    ) : isRealMoney ? (
                       <button
                        type="button"
                        onClick={() => handleBuyClick(item)}
                        className="btn-3d-purple px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-extrabold"
                      >
                        Buy for {item.realMoneyPrice}
                      </button>
                    ) : canAfford ? (
                      <button
                        type="button"
                        onClick={() => handleBuyClick(item)}
                        className="btn-3d-purple px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-extrabold"
                      >
                        <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        Buy for {item.cost} ⚡
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="bg-slate-100 text-slate-400 border-2 border-slate-200 text-[11px] px-3 py-2 rounded-xl font-bold cursor-not-allowed"
                      >
                        Need {shortfall} ⚡ More
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
