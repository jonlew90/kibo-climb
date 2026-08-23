import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Zap, Check, Lock, Sparkles, X, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, ArrowLeft, User, Ticket, Gift, Clock, AlertCircle } from 'lucide-react';
import Mascot from './Mascot';
import ItemThumbnail from './ItemThumbnail';
import { ITEM_CATEGORIES, WORKSHOP_ITEMS, SPARKS_PACKAGES, RARITY_TIERS, SEASONAL_EVENTS, getAvailableSeasonalEvents, isSeasonalEventAvailableOrUpcoming, getItemsByCategory, getItemById, getItemSlot, getItemAvailabilityStatus, isItemVisibleInShop, getItemSalePrice } from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { promoCodeService } from '../services/promoCodeService';

export function sortShopItems(items, userSparks, unlockedItems = [], equippedItems = [], currentDate = new Date()) {
  return [...items].sort((a, b) => {
    const aEquipped = equippedItems.includes(a.id);
    const bEquipped = equippedItems.includes(b.id);
    if (aEquipped !== bEquipped) return aEquipped ? -1 : 1;

    const aUnlocked = unlockedItems.includes(a.id);
    const bUnlocked = unlockedItems.includes(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;

    const aAvail = getItemAvailabilityStatus(a, currentDate);
    const bAvail = getItemAvailabilityStatus(b, currentDate);
    if (aAvail.isUpcoming !== bAvail.isUpcoming) {
      return aAvail.isUpcoming ? 1 : -1;
    }

    const aSale = getItemSalePrice(a, currentDate);
    const aCost = aSale.isSale ? aSale.salePrice : a.cost;
    const bSale = getItemSalePrice(b, currentDate);
    const bCost = bSale.isSale ? bSale.salePrice : b.cost;

    const aCanAfford = userSparks >= aCost;
    const bCanAfford = userSparks >= bCost;
    if (aCanAfford !== bCanAfford) return aCanAfford ? -1 : 1;

    return aCost - bCost;
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
  onSellItem,
  onToggleEquip,
  onRedeemPromoCode,
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
  const [seasonalEventFilter, setSeasonalEventFilter] = useState('all_active');
  const [previewSlots, setPreviewSlots] = useState(INITIAL_PREVIEW_SLOTS);
  const [recentlyPurchasedId, setRecentlyPurchasedId] = useState(null);

  // Sell Confirmation Modal State
  const [itemToSell, setItemToSell] = useState(null);

  // Promo Code Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const categoryScrollRef = useRef(null);
  const seasonalEventScrollRef = useRef(null);
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
      if (e.key === 'Escape' && isOpen) {
        if (showPromoModal) {
          setShowPromoModal(false);
        } else if (onClose) {
          onClose();
        }
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
  }, [isOpen, onClose, showPromoModal]);

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

  const handleRedeemPromo = async (codeOverride) => {
    const targetCode = promoCodeService.normalizeCode(codeOverride || promoInput);
    if (!targetCode) {
      soundFx.playIncorrect();
      setPromoFeedback({ type: 'error', message: 'Please enter a promo code.' });
      return;
    }

    soundFx.playKeyTap();
    setIsRedeeming(true);
    setPromoFeedback(null);

    const res = await promoCodeService.redeemCode(targetCode);
    setIsRedeeming(false);

    if (res.success) {
      soundFx.playVictory();
      setPromoFeedback({
        type: 'success',
        message: res.message,
        reward: res.reward
      });
      setPromoInput('');

      // Auto-preview newly unlocked item on stage if an item was unlocked
      if (res.reward.items && res.reward.items.length > 0) {
        const firstItemId = res.reward.items[0];
        const itemObj = getItemById(firstItemId);
        if (itemObj) {
          const slot = getItemSlot(itemObj);
          setPreviewSlots((prev) => ({ ...prev, [slot]: firstItemId }));
        }
      }

      if (onRedeemPromoCode) {
        onRedeemPromoCode(res);
      }
    } else {
      soundFx.playIncorrect();
      setPromoFeedback({
        type: 'error',
        message: res.reason || 'Failed to redeem promo code.'
      });
    }
  };

  const openPromoDialogWithCode = (code = '') => {
    soundFx.playKeyTap();
    setPromoInput(code);
    setPromoFeedback(null);
    setShowPromoModal(true);
  };

  if (!isOpen) return null;

  const currentDate = storageService.getCurrentDate();
  const availableSeasonalEvents = getAvailableSeasonalEvents(currentDate);

  // If currently selected seasonal event filter is not among available/upcoming filters, fall back to 'all_active'
  const effectiveSeasonalEventFilter = availableSeasonalEvents.some((e) => e.id === seasonalEventFilter)
    ? seasonalEventFilter
    : 'all_active';

  // Compute active stage items (merges saved equipped items with active preview slots)
  const computeStageEquipped = () => {
    const stageItems = [];
    const SLOTS = ['headwear', 'gear', 'outfits', 'pets', 'fx', 'skins', 'effects', 'background'];

    SLOTS.forEach((slot) => {
      if (previewSlots[slot] !== null && previewSlots[slot] !== undefined) {
        if (previewSlots[slot]) {
          stageItems.push(previewSlots[slot]);
        }
      } else {
        const savedItemInSlot = equippedItems.find((id) => {
          const item = getItemById(id);
          return item ? getItemSlot(item) === slot : false;
        });
        if (savedItemInSlot) {
          stageItems.push(savedItemInSlot);
        }
      }
    });

    return stageItems;
  };

  const stageEquippedItems = computeStageEquipped();

  const getDisplayItems = () => {
    if (activeCategory === 'seasonal') {
      if (effectiveSeasonalEventFilter === 'all_active') {
        return getItemsByCategory('seasonal', unlockedItems, currentDate);
      }
      return WORKSHOP_ITEMS.filter(
        (item) => item.category === 'seasonal' && item.seasonId === effectiveSeasonalEventFilter && isItemVisibleInShop(item, unlockedItems, currentDate)
      );
    }
    return getItemsByCategory(activeCategory, unlockedItems, currentDate);
  };

  const currentCategoryItems = getDisplayItems();

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
    const slot = getItemSlot(item);
    const previewId = (item.bundleItems && item.bundleItems.length > 0) ? item.bundleItems[0] : item.id;

    if (previewSlots[slot] === previewId) {
      setPreviewSlots((prev) => ({ ...prev, [slot]: null }));
    } else {
      setPreviewSlots((prev) => ({ ...prev, [slot]: previewId }));
    }
  };

  const handleSellConfirm = () => {
    if (itemToSell && onSellItem) {
      soundFx.playKeyTap();
      onSellItem(itemToSell);
    }
    setItemToSell(null);
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

    const saleInfo = getItemSalePrice(item, currentDate);
    const effectiveCost = saleInfo.isSale ? saleInfo.salePrice : item.cost;

    if (sparks >= effectiveCost) {
      soundFx.playVictory();
      onBuyItem(item);
      setRecentlyPurchasedId(item.id);
      setTimeout(() => setRecentlyPurchasedId(null), 1200);

      // Auto-equip into preview slot upon purchase
      if (!item.isConsumable) {
        const slot = getItemSlot(item);
        const previewId = (item.bundleItems && item.bundleItems.length > 0) ? item.bundleItems[0] : item.id;
        setPreviewSlots((prev) => ({
          ...prev,
          [slot]: previewId
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
          <button
            type="button"
            onClick={() => openPromoDialogWithCode()}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-full shadow-xs active:scale-95 transition-all border border-amber-600"
          >
            <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Redeem</span> Code
          </button>

          {(() => {
            const username = storageService.getUsername() || storageService.getActiveProfile()?.name || '';
            return username ? (
              <span className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
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
                <span className="bg-purple-600 text-white font-black text-xs uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                  <Sparkles className="w-3 h-3 fill-amber-300 stroke-[2.5]" /> Preview Mode
                </span>
              ) : (
                <span className="bg-emerald-600 text-white font-black text-xs uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Active Look
                </span>
              )}

              {hasActivePreview && (
                <button
                  onClick={handleResetPreview}
                  className="text-xs font-extrabold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition-all border border-slate-200"
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

        {/* Holiday Sale Banner */}
        {getAvailableSeasonalEvents(currentDate).length > 1 && (
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-center shadow-inner relative z-10">
            <p className="text-white font-black text-xs sm:text-sm tracking-wide">
              🎄 HOLIDAY SALE! 25% OFF ALL ITEMS 🎄
            </p>
          </div>
        )}

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
              className="flex items-center gap-2 p-1 bg-slate-100 rounded-full overflow-x-auto scrollbar-none w-full touch-pan-x"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`py-1.5 px-3 text-xs font-extrabold rounded-full shrink-0 transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-white text-slate-900 shadow-sm border border-amber-300 ring-2 ring-amber-400/20'
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

          {/* Dedicated Promo Redemption Card inside Promo Exclusives category */}
          {activeCategory === 'promo' && (
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                    <Ticket className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black leading-tight">Have a Secret Promo Code?</h3>
                    <p className="text-xs font-bold text-amber-100">Redeem exclusive gear, companions, and bonus Sparks!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPromoDialogWithCode()}
                  className="bg-white text-amber-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow hover:bg-amber-50 active:scale-95 transition-all whitespace-nowrap"
                >
                  Enter Code
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Seasonal Events Explorer Bar inside Seasonal category */}
          {activeCategory === 'seasonal' && (
            <div className="space-y-2 mb-2">
              <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/40 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black leading-tight">
                      {effectiveSeasonalEventFilter === 'all_active'
                        ? '🐾 Recurring Seasonal Catalog'
                        : (availableSeasonalEvents.find((e) => e.id === effectiveSeasonalEventFilter)?.label || 'Seasonal Event')}
                    </h3>
                    <p className="text-xs font-bold text-teal-100 leading-snug">
                      Items rotate automatically throughout the year for seasons & holidays! Unlocked items stay forever.
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Sub-Navigation Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-0.5 touch-pan-x">
                {availableSeasonalEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      soundFx.playKeyTap();
                      setSeasonalEventFilter(event.id);
                    }}
                    className={`py-1 px-3 text-xs font-extrabold rounded-full shrink-0 transition-all cursor-pointer ${
                      effectiveSeasonalEventFilter === event.id
                        ? 'bg-teal-700 text-white shadow-xs border border-teal-800 ring-2 ring-teal-400/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  <p className="text-xs font-bold text-indigo-100 leading-snug">
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
                  <p className="text-xs font-bold text-amber-800 leading-snug">
                    Save your progress and get free Sparks instantly!
                  </p>
                </div>
              </div>
              <button className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md border-b-2 border-amber-700 whitespace-nowrap shrink-0 ml-2">
                Link Now
              </button>
            </div>
          )}

          {(activeCategory === 'get_sparks' || activeCategory === 'premium') && !allowRealMoneyPurchases ? (
            <div className="py-8 text-center text-slate-500 font-bold space-y-3 bg-white/80 rounded-2xl border-2 border-dashed border-slate-300 p-4">
              <Lock className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
              <p className="text-sm font-black text-slate-700">Real-Money Purchases Disabled</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Ask your parent to enable this feature in the <strong>Parent Zone</strong> dashboard.
              </p>
            </div>
          ) : activeCategory === 'get_sparks' ? (
            <div className="space-y-2.5">
              {SPARKS_PACKAGES.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-amber-300 transition-all flex items-center justify-between gap-3"
                >
                  <ItemThumbnail itemId={pack.id} rarity={pack.rarity || 'legendary'} className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{pack.name}</h4>
                    <span className="text-xs font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-500 shadow-xs inline-block">
                      ⚡ {pack.sparks} Sparks
                    </span>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{pack.description}</p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => onBuySparksPackage(pack)}
                      className="btn-3d-orange px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-extrabold"
                    >
                      Buy for {pack.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : currentCategoryItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-bold space-y-2 bg-white/80 rounded-2xl border-2 border-dashed border-slate-300 p-4">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
              <p className="text-sm font-black text-slate-700">No seasonal items available right now!</p>
              <p className="text-xs text-slate-500">Pick another holiday or season above to explore upcoming items.</p>
            </div>
          ) : (
            sortShopItems(currentCategoryItems, sparks, unlockedItems, equippedItems, currentDate).map((item) => {
              const isConsumable = item.isConsumable;
              const shieldOwned = consumables?.shieldCount ?? 1;
              const isShieldFull = isConsumable && item.id === 'kibo_shield' && shieldOwned >= 2;
              const isUnlocked = isConsumable ? false : unlockedItems.includes(item.id);
              const isEquippedInApp = equippedItems.includes(item.id);
              const isPreviewedOnStage = stageEquippedItems.includes(item.id) || (item.bundleItems && item.bundleItems.some((id) => stageEquippedItems.includes(id)));
              const isRealMoney = !!item.realMoneyPrice;
              if (isRealMoney && !allowRealMoneyPurchases) return null;

              const saleInfo = getItemSalePrice(item, currentDate);
              const activeCost = saleInfo.isSale ? saleInfo.salePrice : item.cost;

              const canAfford = isRealMoney ? true : sparks >= activeCost;
              const shortfall = isRealMoney ? 0 : activeCost - sparks;
              const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;

              const isJustPurchased = recentlyPurchasedId === item.id;
              const availability = getItemAvailabilityStatus(item, currentDate);

              // Calculate sell availability and price
              const sellPrice = item.cost ? Math.floor(item.cost * 0.5) : 0;
              let canSell = false;

              if (activeCost && !isRealMoney) {
                if (isConsumable) {
                  if (item.id === 'kibo_shield' && (consumables?.shieldCount || 0) > 0) canSell = true;
                  if (item.id === 'streak_saver' && (consumables?.streakSaverCount || 0) > 0) canSell = true;
                  if (item.id === 'double_sparks_potion' && (consumables?.doubleSparksPotionCount || 0) > 0) canSell = true;
                  if (item.id === 'double_coin_potion' && (consumables?.doubleCoinPotionCount || 0) > 0) canSell = true;
                  if (item.id === 'hint_scroll' && (consumables?.hintScrollCount || 0) > 0) canSell = true;
                  if (item.id === 'letter_spyglass' && (consumables?.letterSpyglassCount || 0) > 0) canSell = true;
                  if (item.id === 'letter_pruner' && (consumables?.letterPrunerCount || 0) > 0) canSell = true;
                  if (item.id === 'explorer_compass' && (consumables?.explorerCompassCount || 0) > 0) canSell = true;
                } else if (isUnlocked) {
                  canSell = true;
                }
              }

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
                      : availability.isUpcoming
                      ? 'bg-slate-100/80 border-slate-300 opacity-90'
                      : canAfford
                      ? 'bg-amber-50/40 border-amber-300 shadow-sm hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 opacity-95 hover:border-slate-300'
                  }`}
                >
                  {/* Floating +1 Purchase Notification Badge */}
                  {isJustPurchased && (
                    <span className="absolute -top-3 right-6 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-0.5 rounded-full border-2 border-white shadow-lg animate-bounce flex items-center gap-1 z-30">
                      ✨ +1 Purchased!
                    </span>
                  )}

                  {/* SVG Item Thumbnail Graphic */}
                  <ItemThumbnail itemId={item.id} rarity={item.rarity} className="w-12 h-12 shrink-0" saleDiscount={!isUnlocked && saleInfo.isSale ? saleInfo.discountPercent : 0} />

                  {/* Item Details */}
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{item.name}</h4>
                      
                      {!isUnlocked && saleInfo.isSale && (
                        <span className="text-[10px] font-black uppercase text-white bg-rose-500 px-1.5 py-0.5 rounded-sm border-b border-rose-700 shadow-sm shadow-rose-200">
                          SALE
                        </span>
                      )}

                      {item.badgeTag && (
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full border border-amber-500 animate-pulse shadow-xs">
                          🚀 {item.badgeTag}
                        </span>
                      )}

                      {/* Subject Compatibility Tag */}
                      {item.subjectLabel && (
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs ${
                          item.id === 'explorer_compass'
                            ? 'text-teal-950 bg-teal-100 border-teal-300'
                            : item.id === 'letter_spyglass'
                            ? 'text-sky-950 bg-sky-100 border-sky-300'
                            : 'text-purple-950 bg-purple-100 border-purple-300'
                        }`}>
                          {item.id === 'explorer_compass' ? '🌍 ' : item.id === 'letter_spyglass' ? '📐 ' : '🌐 '}
                          {item.subjectLabel}
                        </span>
                      )}

                      {/* Rotation / Expiration Countdown Pill */}
                      {!isUnlocked && availability.status === 'active' && availability.daysRemaining !== null && (
                        <span className="text-xs font-black uppercase text-orange-950 bg-orange-200/90 border border-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-2xs">
                          <Clock className="w-2.5 h-2.5 text-orange-700" />
                          Leaves in {availability.daysRemaining}d
                        </span>
                      )}

                      {/* Upcoming Preview Badge */}
                      {!isUnlocked && availability.status === 'upcoming' && (
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Lock className="w-2.5 h-2.5 text-amber-800" />
                          Coming Soon ({availability.formattedDate})
                        </span>
                      )}

                      {/* Promo Code Required Badge */}
                      {!isUnlocked && item.promoCodeRequired && (
                        <span className="text-xs font-black uppercase text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Ticket className="w-2.5 h-2.5 text-amber-700" />
                          Promo Exclusive
                        </span>
                      )}

                      {/* Status Badges */}
                      {isConsumable ? (
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border transition-all duration-300 ${
                          isJustPurchased
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 scale-110 ring-4 ring-emerald-300 shadow-md animate-pulse'
                            : 'text-amber-950 bg-amber-100 border-amber-300'
                        }`}>
                          {item.id === 'kibo_shield'
                            ? `🛡️ CAPACITY: ${shieldOwned}/2`
                            : item.id === 'streak_saver'
                            ? `🎒 OWNED: ${consumables?.streakSaverCount ?? 0}`
                            : item.id === 'hint_scroll'
                            ? `🎒 OWNED: ${consumables?.hintScrollCount ?? 0}`
                            : item.id === 'letter_spyglass'
                            ? `🎒 OWNED: ${consumables?.letterSpyglassCount ?? 0}`
                            : item.id === 'explorer_compass'
                            ? `🎒 OWNED: ${consumables?.explorerCompassCount ?? 0}`
                            : item.id === 'letter_pruner'
                            ? `🎒 OWNED: ${consumables?.letterPrunerCount ?? 0}`
                            : `🎒 OWNED: ${consumables?.doubleSparksPotionCount ?? consumables?.doubleCoinPotionCount ?? 0}`}
                        </span>
                      ) : isEquippedInApp ? (
                        <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-0.5">
                          🟢 EQUIPPED
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-xs font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                          🟦 OWNED
                        </span>
                      ) : !canAfford && !isRealMoney && !item.promoCodeRequired && !availability.isUpcoming ? (
                        <span className="text-xs font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          🔒 Need {shortfall} ⚡ More
                        </span>
                      ) : isRealMoney && !isUnlocked ? (
                         <span className="text-xs font-black uppercase text-purple-900 bg-purple-200 px-2 py-0.5 rounded-full border border-purple-400">
                          💎 PREMIUM
                        </span>
                      ) : null}

                      {/* CLEAR PREVIEW TAP INDICATOR */}
                      {!isUnlocked && !isConsumable && (
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs transition-all ${
                          isPreviewedOnStage
                            ? 'bg-purple-600 text-white border border-purple-700'
                            : 'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}>
                          👁️ {isPreviewedOnStage ? 'Previewing on Stage' : 'Tap to try on'}
                        </span>
                      )}

                      <span className={`text-xs uppercase px-2 py-0.5 rounded-full border ${rarityInfo.badgeClass}`}>
                        {rarityInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-slate-500 font-medium leading-tight">{item.description}</p>
                    </div>
                  </div>

                  {/* Buy / Sell / Equip Action Buttons */}
                  <div className="shrink-0 flex flex-col gap-1 items-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 items-center">
                      {canSell && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playKeyTap();
                            setItemToSell(item);
                          }}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 border-2 border-rose-300 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          Sell ({sellPrice} ⚡)
                        </button>
                      )}
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
                            className="btn-3d-orange px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-extrabold"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            Buy for {saleInfo.isSale && (
                              <span className="line-through opacity-75 font-semibold mr-0.5">
                                {item.cost}
                              </span>
                            )}{activeCost} ⚡
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="bg-slate-100 text-rose-600 border-2 border-slate-300 text-xs px-3 py-2 rounded-xl font-bold cursor-not-allowed"
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
                      ) : availability.isUpcoming ? (
                        <button
                          type="button"
                          disabled
                          className="bg-slate-100 text-slate-400 border-2 border-slate-200 text-xs px-3 py-2 rounded-xl font-bold cursor-not-allowed flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" /> Coming Soon
                        </button>
                      ) : item.promoCodeRequired ? (
                        <button
                          type="button"
                          onClick={() => openPromoDialogWithCode()}
                          className="btn-3d-orange px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 font-extrabold shadow-sm"
                        >
                          <Ticket className="w-3.5 h-3.5" /> Redeem Code
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
                          Buy for {saleInfo.isSale && (
                            <span className="line-through opacity-75 font-semibold mr-0.5">
                              {item.cost}
                            </span>
                          )}{activeCost} ⚡
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="bg-slate-100 text-slate-400 border-2 border-slate-200 text-xs px-3 py-2 rounded-xl font-bold cursor-not-allowed"
                        >
                          Need {shortfall} ⚡ More
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* PROMO CODE REDEMPTION MODAL DIALOG */}
      {showPromoModal && (
        <div
          onClick={() => setShowPromoModal(false)}
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-in relative text-slate-800 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Redeem Promo Code</h3>
                  <p className="text-xs text-slate-500 font-medium">Unlock exclusive gear & bonus Sparks!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setShowPromoModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wide">Enter Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRedeemPromo();
                      }
                    }}
                    placeholder="ENTER PROMO CODE"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono font-bold text-sm tracking-wider uppercase text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    disabled={isRedeeming || !promoInput.trim()}
                    onClick={() => handleRedeemPromo()}
                    className="btn-3d-orange px-4 py-2.5 text-xs rounded-xl font-black whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedeeming ? 'Checking...' : 'Redeem'}
                  </button>
                </div>
              </div>

              {/* Feedback Message */}
              {promoFeedback && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-bold space-y-1.5 animate-fade-in text-left ${
                    promoFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black">
                    {promoFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                    )}
                    <span>{promoFeedback.message}</span>
                  </div>

                  {/* If reward breakdown exists */}
                  {promoFeedback.reward && (
                    <div className="pt-1.5 border-t border-emerald-200/60 flex items-center gap-2 flex-wrap text-xs">
                      {promoFeedback.reward.sparks > 0 && (
                        <span className="bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded-md border border-amber-300">
                          ⚡ +{promoFeedback.reward.sparks} Sparks
                        </span>
                      )}
                      {promoFeedback.reward.newlyUnlockedItems?.map((id) => {
                        const item = getItemById(id);
                        return item ? (
                          <span key={id} className="bg-purple-100 text-purple-950 font-black px-2 py-0.5 rounded-md border border-purple-300">
                            🎁 {item.name}
                          </span>
                        ) : null;
                      })}
                      {Object.keys(promoFeedback.reward.consumables || {}).map((cKey) => (
                        <span key={cKey} className="bg-sky-100 text-sky-950 font-black px-2 py-0.5 rounded-md border border-sky-300">
                          🎒 +{promoFeedback.reward.consumables[cKey]} {cKey === 'streakSaverCount' ? 'Streak Savers' : 'Hint Scrolls'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Promo Code Info Tip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Looking for Promo Codes?</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Promo codes are announced during special learning challenges, seasonal events, and community milestones!
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITEM SELL CONFIRMATION MODAL */}
      {itemToSell && (
        <div
          onClick={() => setItemToSell(null)}
          className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scale-in text-center relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center border-4 border-rose-200">
              <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Sell Item</h3>
              <p className="text-sm font-bold text-slate-500 leading-tight">
                Are you sure you want to sell <span className="text-slate-700">{itemToSell.name}</span> for <span className="text-amber-600">{Math.floor(itemToSell.cost * 0.5)} ⚡</span>?
              </p>
              {!itemToSell.isConsumable && (
                <p className="text-xs text-rose-500 font-bold mt-2">
                  You will have to buy it again at full price if you want it back!
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setItemToSell(null);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSellConfirm}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
