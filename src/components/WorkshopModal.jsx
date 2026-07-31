import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Zap, Check, Lock, Sparkles, X, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Mascot from './Mascot';
import ItemThumbnail from './ItemThumbnail';
import { ITEM_CATEGORIES, WORKSHOP_ITEMS, RARITY_TIERS, getItemsByCategory, getItemById } from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';

export function sortShopItems(items, userSparks, sortMode, unlockedItems = [], equippedItems = []) {
  const rarityRank = { legendary: 1, epic: 2, rare: 3, common: 4 };

  // Filter for 'inventory' mode (owned/unlocked items only)
  let filteredItems = items;
  if (sortMode === 'inventory') {
    filteredItems = items.filter((item) => item.isConsumable || unlockedItems.includes(item.id));
  }

  return [...filteredItems].sort((a, b) => {
    if (sortMode === 'rarity') {
      return (rarityRank[a.rarity] || 5) - (rarityRank[b.rarity] || 5);
    }
    if (sortMode === 'inventory') {
      const aEquipped = equippedItems.includes(a.id);
      const bEquipped = equippedItems.includes(b.id);
      if (aEquipped !== bEquipped) return aEquipped ? -1 : 1;
      return a.cost - b.cost;
    }
    // Default: 'recommended' (Affordable First)
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
  onToggleEquip
}) {
  const INITIAL_PREVIEW_SLOTS = {
    headwear: null,
    gear: null,
    outfits: null,
    effects: null,
    background: null
  };

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortMode, setSortMode] = useState('recommended'); // 'recommended' | 'rarity' | 'inventory'
  const [previewSlots, setPreviewSlots] = useState(INITIAL_PREVIEW_SLOTS);

  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
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

  if (!isOpen) return null;

  // Compute active stage items (merges saved equipped items with active preview slots)
  const computeStageEquipped = () => {
    const stageItems = [];

    ['headwear', 'gear', 'outfits', 'effects', 'background'].forEach((cat) => {
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

    setPreviewSlots((prev) => {
      const currentSlotVal = prev[cat];

      // Case A: Currently previewing this item -> Revert to null (default equipped)
      if (currentSlotVal === item.id) {
        return { ...prev, [cat]: null };
      }

      // Case B: Currently equipped in app and not modified in preview -> Toggle OFF in preview
      const isSavedEquipped = equippedItems.includes(item.id);
      if (isSavedEquipped && currentSlotVal === null) {
        return { ...prev, [cat]: false };
      }

      // Case C: Preview this item (replacing any prior preview/equipped item in this category)
      return { ...prev, [cat]: item.id };
    });
  };

  const handleBuy = (item) => {
    if (sparks >= item.cost) {
      soundFx.playVictory();
      if (item.isConsumable && onBuyConsumable) {
        onBuyConsumable(item);
      } else {
        onBuyItem(item);
        if (!item.isConsumable) {
          const cat = item.category;
          setPreviewSlots((prev) => ({
            ...prev,
            [cat]: item.id
          }));
        }
      }
    } else {
      soundFx.playIncorrect();
      if (!item.isConsumable) {
        handlePreviewToggle(item);
      }
    }
  };

  const handleEquipToggle = (item) => {
    soundFx.playKeyTap();
    onToggleEquip(item.id);
  };

  return (
    <div
      onClick={() => {
        soundFx.playKeyTap();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl p-4 sm:p-5 text-slate-800 shadow-2xl space-y-4 max-h-[92vh] flex flex-col relative overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Kibo's Workshop</h2>
              <p className="text-xs text-slate-500 font-semibold">Try on & unlock gear with Sparks!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Spark Balance Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold text-sm shadow-sm">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span>{sparks}</span>
            </div>

            <button
              onClick={() => {
                soundFx.playKeyTap();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close Workshop"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Live Try-On Preview Mascot Stage Header */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex items-center justify-around shrink-0 shadow-inner relative">
          <Mascot mood="happy" equipped={stageEquippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />

          <div className="text-left space-y-1.5 max-w-[195px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {hasUnownedPreview ? (
                <span className="bg-purple-600 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                  <Sparkles className="w-3 h-3 fill-amber-300 stroke-[2.5]" /> Preview Mode
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  Live Stage
                </span>
              )}
              {/* Kibo Shield Inventory Counter */}
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-all ${
                (consumables?.shieldCount ?? 1) === 0
                  ? 'text-slate-500 bg-slate-200 border border-slate-300 opacity-50'
                  : 'text-sky-950 bg-sky-100 border border-sky-300'
              }`}>
                <ShieldCheck className={`w-3 h-3 stroke-[2.5] ${(consumables?.shieldCount ?? 1) === 0 ? 'text-slate-400' : 'text-sky-600'}`} /> {(consumables?.shieldCount ?? 1)}/2
              </span>
            </div>

            <h4 className="font-black text-slate-800 text-sm leading-tight">
              {hasUnownedPreview ? 'Outfit Combination' : 'Equipped Outfit'}
            </h4>

            {hasActivePreview || hasUnownedPreview ? (
              <button
                onClick={handleResetPreview}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[11px] rounded-xl border border-rose-300 flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" /> Reset to Equipped Gear
              </button>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                {equippedItems.length > 0
                  ? `${equippedItems.length} active accessory layer${equippedItems.length > 1 ? 's' : ''}`
                  : 'No items equipped yet'}
              </p>
            )}
          </div>
        </div>

        {/* Controls Bar: Category Filter Tabs & Sort Dropdown */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          {/* Category Tabs Container with Right-Edge Fade Mask & Scroll Chevrons */}
          <div className="relative flex-1 flex items-center min-w-0">
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
              style={{
                maskImage: canScrollRight ? 'linear-gradient(to right, black 82%, transparent 100%)' : 'none',
                WebkitMaskImage: canScrollRight ? 'linear-gradient(to right, black 82%, transparent 100%)' : 'none'
              }}
              className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none w-full scroll-smooth"
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

          {/* Sort Selector Dropdown */}
          <select
            value={sortMode}
            onChange={(e) => {
              soundFx.playKeyTap();
              setSortMode(e.target.value);
            }}
            className="py-1.5 px-2 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-extrabold text-slate-800 focus:outline-none cursor-pointer shrink-0"
          >
            <option value="recommended">Recommended 💡</option>
            <option value="rarity">Highest Rarity 💎</option>
            <option value="inventory">My Inventory 🎒</option>
          </select>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {sortShopItems(currentCategoryItems, sparks, sortMode, unlockedItems, equippedItems).map((item) => {
            const isConsumable = item.isConsumable;
            const shieldOwned = consumables?.shieldCount ?? 1;
            const isShieldFull = isConsumable && item.id === 'kibo_shield' && shieldOwned >= 2;
            const isUnlocked = isConsumable ? false : unlockedItems.includes(item.id);
            const isEquippedInApp = equippedItems.includes(item.id);
            const isPreviewedOnStage = stageEquippedItems.includes(item.id);
            const canAfford = sparks >= item.cost;
            const shortfall = item.cost - sparks;
            const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isConsumable) {
                    handlePreviewToggle(item);
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  !isConsumable && isPreviewedOnStage
                    ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-200 cursor-pointer'
                    : isUnlocked
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300 cursor-pointer'
                    : canAfford
                    ? 'bg-amber-50/40 border-amber-300 shadow-sm hover:border-amber-400 cursor-pointer'
                    : 'bg-slate-50 border-slate-200 opacity-95 hover:border-slate-300 cursor-pointer'
                }`}
              >
                {/* SVG Item Thumbnail Graphic */}
                <ItemThumbnail itemId={item.id} rarity={item.rarity} className="w-12 h-12 shrink-0" />

                {/* Item Details */}
                <div className="space-y-1 text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{item.name}</h4>
                    
                    {/* Status Badges */}
                    {isConsumable ? (
                      <span className="text-[9px] font-black uppercase text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        🎒 OWNED: {item.id === 'kibo_shield' ? shieldOwned : item.id === 'streak_saver' ? (consumables?.streakSaverCount ?? 0) : (consumables?.doubleSparksPotionCount ?? consumables?.doubleCoinPotionCount ?? 0)}
                      </span>
                    ) : isEquippedInApp ? (
                      <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-0.5">
                        🟢 EQUIPPED
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[9px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                        🟦 OWNED
                      </span>
                    ) : canAfford ? (
                      <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400 animate-pulse">
                        ⚡ CAN BUY!
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        🔒 Need {shortfall} ⚡ More
                      </span>
                    )}

                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${rarityInfo.badgeClass}`}>
                      {rarityInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-slate-500 font-medium leading-tight">{item.description}</p>
                    {isConsumable && item.id === 'kibo_shield' && (
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Capacity: {shieldOwned}/2
                      </span>
                    )}
                  </div>
                </div>

                {/* Buy / Equip / Consumable Action Buttons */}
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isConsumable ? (
                    isShieldFull ? (
                      <button
                        type="button"
                        disabled
                        className="bg-slate-200 text-slate-500 border-2 border-slate-300 text-xs px-3 py-2 rounded-xl font-bold cursor-not-allowed"
                      >
                        Inventory Full ({shieldOwned}/2)
                      </button>
                    ) : canAfford ? (
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
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
                        Need {shortfall} More ⚡
                      </button>
                    )
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleEquipToggle(item)}
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
                  ) : isPreviewedOnStage ? (
                    <button
                      type="button"
                      onClick={() => handlePreviewToggle(item)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-900 border-2 border-purple-300 px-3.5 py-2 text-xs rounded-xl font-extrabold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Remove Preview
                    </button>
                  ) : canAfford ? (
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      className="btn-3d-purple px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      Buy for {item.cost} ⚡
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePreviewToggle(item)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 text-[11px] px-3 py-2 rounded-xl font-extrabold"
                    >
                      Try On
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close Button */}
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="btn-3d-teal w-full py-3 text-sm rounded-2xl shrink-0"
        >
          Done Customizing & Return to Map 🗺️
        </button>
      </div>
    </div>
  );
}
