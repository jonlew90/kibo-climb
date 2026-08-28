import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShoppingBag,
  Zap,
  Check,
  Lock,
  Sparkles,
  X,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Ticket,
  Gift,
  Clock,
  AlertCircle,
  Info,
  Search,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Package
} from 'lucide-react';
import Mascot from './Mascot';
import ItemThumbnail from './ItemThumbnail';
import {
  ITEM_CATEGORIES,
  CATEGORY_HUBS,
  COSMETIC_SLOTS,
  WORKSHOP_ITEMS,
  SPARKS_PACKAGES,
  RARITY_TIERS,
  RARITY_ORDER,
  SEASONAL_EVENTS,
  getAvailableSeasonalEvents,
  getActiveHolidayOrSeasonalSaleEvent,
  isSeasonalEventAvailableOrUpcoming,
  getItemsByCategory,
  getItemById,
  getItemSlot,
  getItemAvailabilityStatus,
  isItemVisibleInShop,
  getItemSalePrice,
  calculateSparksPackageSavings,
  getRealMoneyItemSavings,
  isWearableItem,
  getOwnedItems
} from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { promoCodeService } from '../services/promoCodeService';
import { analyticsService } from '../services/analyticsService';

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

    const aRarity = RARITY_ORDER[a.rarity] || 0;
    const bRarity = RARITY_ORDER[b.rarity] || 0;
    if (aRarity !== bRarity) {
      return aRarity - bRarity;
    }

    const getPriceVal = (item) => {
      const sale = getItemSalePrice(item, currentDate);
      if (sale && sale.isSale) return sale.salePrice;
      if (typeof item.cost === 'number') return item.cost;
      if (typeof item.realMoneyPrice === 'string') {
        const parsed = parseFloat(item.realMoneyPrice.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) return parsed;
      }
      return 0;
    };

    const aCost = getPriceVal(a);
    const bCost = getPriceVal(b);
    if (aCost !== bCost) {
      return aCost - bCost;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
}

export default function WorkshopModal({
  isOpen,
  onClose,
  sparks = 0,
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
  onOpenParentZone,
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
    background: null,
    borders: null
  };

  // View Mode: 'shop' vs 'closet'
  const [viewMode, setViewMode] = useState('shop');

  // Active Category Hub in Shop Mode
  const [activeHub, setActiveHub] = useState('wearables');

  // Sub-slot filter (for Wearables & Closet)
  const [selectedSlot, setSelectedSlot] = useState('all');

  // Seasonal filter
  const [seasonalEventFilter, setSeasonalEventFilter] = useState('all_active');

  // Search & Filter Toggles
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlySale, setFilterOnlySale] = useState(false);
  const [filterOnlyOwned, setFilterOnlyOwned] = useState(false);

  // Mobile Stage Collapse State
  const [mobileStageCollapsed, setMobileStageCollapsed] = useState(false);

  // Detail Modal / Sheet State
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Preview Slots State
  const [previewSlots, setPreviewSlots] = useState(INITIAL_PREVIEW_SLOTS);
  const [recentlyPurchasedId, setRecentlyPurchasedId] = useState(null);

  // Sell Confirmation Modal State
  const [itemToSell, setItemToSell] = useState(null);

  // Promo Code Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const slotScrollRef = useRef(null);
  const hubScrollRef = useRef(null);
  const itemsContainerRef = useRef(null);

  // Log analytics when visiting sparks or subscriptions
  useEffect(() => {
    if (isOpen && activeHub === 'sparks') {
      analyticsService.logSubscriptionUpsellView('Shop');
    }
  }, [isOpen, activeHub]);

  // Handle Escape key listener and reset previews on open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedItemDetail) {
          setSelectedItemDetail(null);
        } else if (showPromoModal) {
          setShowPromoModal(false);
        } else if (itemToSell) {
          setItemToSell(null);
        } else if (onClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setPreviewSlots(INITIAL_PREVIEW_SLOTS);
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, showPromoModal, selectedItemDetail, itemToSell]);

  // Scroll to top of item list on filter/mode change
  useEffect(() => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollTop = 0;
    }
  }, [viewMode, activeHub, selectedSlot, seasonalEventFilter, filterOnlySale, filterOnlyOwned]);

  const currentDate = storageService.getCurrentDate();
  const availableSeasonalEvents = getAvailableSeasonalEvents(currentDate);
  const effectiveSeasonalEventFilter = availableSeasonalEvents.some((e) => e.id === seasonalEventFilter)
    ? seasonalEventFilter
    : 'all_active';

  // Compute active stage items (merges saved equipped items with active preview overrides)
  const SLOTS = ['headwear', 'gear', 'outfits', 'pets', 'fx', 'skins', 'effects', 'background', 'borders'];

  const computeStageEquipped = () => {
    const stageItems = [];

    SLOTS.forEach((slot) => {
      if (previewSlots[slot] !== null && previewSlots[slot] !== undefined) {
        if (previewSlots[slot] && previewSlots[slot] !== '') {
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

  // Active preview states
  const hasActivePreview = Object.values(previewSlots).some((v) => v !== null);
  const hasUnownedPreview = stageEquippedItems.some((id) => !unlockedItems.includes(id));

  // Determine which items to show based on mode, hubs, slots, and search query
  const getCatalogItems = () => {
    let items = [];

    if (viewMode === 'closet') {
      // My Closet: Only wearable items unlocked by user
      items = WORKSHOP_ITEMS.filter((item) => {
        if (item.isConsumable) return false;
        if (!unlockedItems.includes(item.id)) return false;
        if (selectedSlot !== 'all') {
          return getItemSlot(item) === selectedSlot;
        }
        return true;
      });
    } else {
      // Shop Mode: Filter by active hub
      if (activeHub === 'wearables') {
        items = WORKSHOP_ITEMS.filter((item) => {
          if (item.isConsumable || item.category === 'powerups') return false;
          if (item.category === 'seasonal') return false; // seasonal has its own hub
          if (!isItemVisibleInShop(item, unlockedItems, currentDate)) return false;
          if (selectedSlot !== 'all') {
            return getItemSlot(item) === selectedSlot;
          }
          return true;
        });
      } else if (activeHub === 'powerups') {
        items = WORKSHOP_ITEMS.filter((item) => item.isConsumable || item.category === 'powerups');
      } else if (activeHub === 'seasonal') {
        if (effectiveSeasonalEventFilter === 'all_active') {
          items = getItemsByCategory('seasonal', unlockedItems, currentDate);
        } else {
          items = WORKSHOP_ITEMS.filter(
            (item) => item.category === 'seasonal' && item.seasonId === effectiveSeasonalEventFilter && isItemVisibleInShop(item, unlockedItems, currentDate)
          );
        }
      } else if (activeHub === 'sparks') {
        items = []; // Sparks hub renders packages & Kibo Club custom cards
      }
    }

    // Apply Quick Filters
    if (viewMode === 'shop') {
      if (filterOnlySale) {
        items = items.filter((item) => {
          const sale = getItemSalePrice(item, currentDate);
          return sale && sale.isSale;
        });
      }
      if (filterOnlyOwned) {
        items = items.filter((item) => unlockedItems.includes(item.id));
      }
    }

    // Apply Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const slot = (getItemSlot(item) || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || slot.includes(q);
      });
    }

    return sortShopItems(items, sparks, unlockedItems, equippedItems, currentDate);
  };

  const displayedItems = getCatalogItems();

  // Handle preview toggle
  const handlePreviewToggle = (item) => {
    if (item.isConsumable) return;
    soundFx.playKeyTap();
    const slot = getItemSlot(item);
    const previewId = (item.bundleItems && item.bundleItems.length > 0) ? item.bundleItems[0] : item.id;

    if (previewSlots[slot] === previewId) {
      // Revert this slot to default saved look
      setPreviewSlots((prev) => ({ ...prev, [slot]: null }));
    } else {
      setPreviewSlots((prev) => ({ ...prev, [slot]: previewId }));
    }
  };

  // Remove a specific slot from preview or unequip it
  const handleClearSlot = (slot) => {
    soundFx.playKeyTap();
    const currentSavedInSlot = equippedItems.find((id) => {
      const item = getItemById(id);
      return item ? getItemSlot(item) === slot : false;
    });

    if (previewSlots[slot] !== null) {
      // Reset preview override for this slot
      setPreviewSlots((prev) => ({ ...prev, [slot]: null }));
    } else if (currentSavedInSlot) {
      // Unequip currently saved item in slot
      onToggleEquip(currentSavedInSlot);
    }
  };

  // Batch Apply All Previewed Owned Items
  const handleApplyPreviewLook = () => {
    soundFx.playVictory();
    SLOTS.forEach((slot) => {
      const previewId = previewSlots[slot];
      if (previewId !== null) {
        const currentSaved = equippedItems.find((id) => {
          const item = getItemById(id);
          return item ? getItemSlot(item) === slot : false;
        });

        if (previewId === '' && currentSaved) {
          onToggleEquip(currentSaved);
        } else if (previewId && previewId !== currentSaved && unlockedItems.includes(previewId)) {
          onToggleEquip(previewId);
        }
      }
    });
    setPreviewSlots(INITIAL_PREVIEW_SLOTS);
  };

  const handleResetPreview = () => {
    soundFx.playKeyTap();
    setPreviewSlots(INITIAL_PREVIEW_SLOTS);
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

  const handleSellConfirm = () => {
    if (itemToSell && onSellItem) {
      soundFx.playKeyTap();
      onSellItem(itemToSell);
    }
    setItemToSell(null);
    if (selectedItemDetail?.id === itemToSell?.id) {
      setSelectedItemDetail(null);
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

  const unlockedWearablesCount = useMemo(() => {
    return getOwnedItems(unlockedItems).length;
  }, [unlockedItems]);

  const activeSaleEvent = getActiveHolidayOrSeasonalSaleEvent(currentDate);

  // Compute active equipped look details for slot HUD
  const activeSlotDetails = SLOTS.map((slot) => {
    const itemId = stageEquippedItems.find((id) => {
      const item = getItemById(id);
      return item ? getItemSlot(item) === slot : false;
    });
    if (!itemId) return null;
    const item = getItemById(itemId);
    if (!item) return null;
    return {
      slot,
      item,
      isOwned: unlockedItems.includes(item.id),
      isPreview: previewSlots[slot] !== null
    };
  }).filter(Boolean);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      
      {/* 1. TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-xs shrink-0 z-20">
        {/* Title & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingBag className="w-4 h-4 text-orange-600 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
              Kibo's Corner
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 hidden xs:block leading-none">
              Shop & Dressing Room
            </p>
          </div>
        </div>

        {/* Center: Mode Segmented Switcher (Shop vs My Closet) */}
        <div className="flex items-center bg-slate-100 border-2 border-slate-200/80 p-0.5 sm:p-1 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('shop');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              viewMode === 'shop'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🛍️</span>
            <span>Shop</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('closet');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              viewMode === 'closet'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👗</span>
            <span>My Closet</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              viewMode === 'closet' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {unlockedWearablesCount}
            </span>
          </button>
        </div>

        {/* Right: Currency, Promo Code, & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => openPromoDialogWithCode()}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-full border border-amber-300 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Redeem Promo Code"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <div
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('shop');
              setActiveHub('sparks');
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-full text-amber-950 font-black text-xs shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Click to get more Sparks"
          >
            <Zap className="w-3.5 h-3.5 text-amber-900 fill-amber-500 stroke-[2]" />
            <span>{sparks}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-PANE RESPONSIVE CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full max-w-7xl mx-auto overflow-hidden">
        
        {/* LEFT PANE: DRESSING STAGE & ACTIVE LOOK HUD (Sticky on Desktop, Stacked on Mobile) */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 bg-white md:border-r-2 border-b-2 md:border-b-0 border-slate-200 flex flex-col z-10 shadow-xs md:shadow-none overflow-y-auto">
          
          {/* Mobile Stage Toggle Bar */}
          <div className="md:hidden flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700">🐾 Live Preview Stage</span>
              {hasUnownedPreview ? (
                <span className="bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  Preview Mode
                </span>
              ) : (
                <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  Active Look
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileStageCollapsed((prev) => !prev)}
              className="text-xs font-black text-slate-600 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-200"
            >
              <span>{mobileStageCollapsed ? 'Show Stage' : 'Collapse'}</span>
              {mobileStageCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Stage Body */}
          {(!mobileStageCollapsed || window.innerWidth >= 768) && (
            <div className="p-3 sm:p-4 space-y-3 flex flex-col items-center">
              {/* Live Framed Mascot Box */}
              <div className="w-full max-w-xs md:max-w-none h-36 sm:h-44 md:h-52 rounded-3xl bg-gradient-to-b from-sky-100 via-white to-amber-50 border-3 border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-2 group">
                <Mascot mood="happy" equipped={stageEquippedItems} className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 transition-transform duration-300 group-hover:scale-105" />

                {/* Stage Corner Status Badge */}
                <div className="absolute top-2.5 left-2.5">
                  {hasUnownedPreview ? (
                    <span className="bg-purple-700/90 backdrop-blur-xs text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                      <Sparkles className="w-3 h-3 fill-amber-300 stroke-[2.5]" /> Preview Mode
                    </span>
                  ) : (
                    <span className="bg-emerald-700/90 backdrop-blur-xs text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Active Look
                    </span>
                  )}
                </div>

                {/* Reset Preview Button */}
                {hasActivePreview && (
                  <button
                    type="button"
                    onClick={handleResetPreview}
                    className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-700 font-black text-[10px] px-2.5 py-1 rounded-full border border-slate-300 shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    title="Reset to currently saved look"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Stage Actions: Apply Look (If previews differ from saved) */}
              {hasActivePreview && (
                <div className="w-full flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyPreviewLook}
                    disabled={hasUnownedPreview}
                    className={`flex-1 py-2 px-3 text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all ${
                      hasUnownedPreview
                        ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                        : 'btn-3d-orange active:scale-95 cursor-pointer'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{hasUnownedPreview ? 'Buy Items to Apply' : 'Apply Outfit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetPreview}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Active Look Slot HUD: Chips for each equipped item */}
              <div className="w-full space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Equipped Slots ({activeSlotDetails.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Tap × to unequip</span>
                </div>

                {activeSlotDetails.length === 0 ? (
                  <div className="p-2.5 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                    No items equipped on Kibo. Tap any item to try it on!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeSlotDetails.map(({ slot, item, isOwned, isPreview }) => (
                      <div
                        key={slot}
                        onClick={() => setSelectedItemDetail(item)}
                        className={`group flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          isPreview
                            ? 'bg-purple-50 border-purple-300 text-purple-950 ring-1 ring-purple-400'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <ItemThumbnail itemId={item.id} rarity={item.rarity} className="w-4 h-4 rounded-xs shrink-0" />
                        <span className="truncate max-w-[100px] sm:max-w-[120px]">{item.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSlot(slot);
                          }}
                          className="w-4 h-4 rounded-full bg-slate-200/80 hover:bg-rose-200 hover:text-rose-800 text-slate-500 flex items-center justify-center text-[10px] font-black transition-colors"
                          title="Unequip slot"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT PANE: CATALOG & CLOSET CONTROLS & ITEM GRID */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50/50">
          
          {/* STICKY CATALOG NAVIGATION BAR */}
          <div className="bg-white border-b-2 border-slate-200 p-2.5 sm:px-4 sm:py-3 space-y-2.5 shrink-0 z-10 shadow-2xs">
            
            {/* Seasonal Sale Banner (if active) */}
            {activeSaleEvent && viewMode === 'shop' && (
              <div className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-xl shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                  <span className="font-black text-xs sm:text-sm tracking-wide truncate">
                    {activeSaleEvent.label.toUpperCase()} SALE!
                  </span>
                </div>
                <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap">
                  25% OFF ALL ITEMS
                </span>
              </div>
            )}

            {/* Top Toolbar: Search + Category Hubs / Slot Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Search Box */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={viewMode === 'closet' ? 'Search your closet...' : 'Search gear, pets, boosters...'}
                  className="w-full pl-8 pr-8 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-amber-400 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-black text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Filter Badges (Shop Mode Only) */}
              {viewMode === 'shop' && (
                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setFilterOnlySale((prev) => !prev);
                    }}
                    className={`px-2.5 py-1 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      filterOnlySale
                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>On Sale</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setFilterOnlyOwned((prev) => !prev);
                    }}
                    className={`px-2.5 py-1 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      filterOnlyOwned
                        ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Owned</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shop Mode: Primary Category Hubs */}
            {viewMode === 'shop' && (
              <div
                ref={hubScrollRef}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5"
              >
                {CATEGORY_HUBS.map((hub) => {
                  const isSelected = activeHub === hub.id;
                  return (
                    <button
                      key={hub.id}
                      onClick={() => {
                        soundFx.playKeyTap();
                        setActiveHub(hub.id);
                        if (hub.id !== 'wearables') setSelectedSlot('all');
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-full shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{hub.icon}</span>
                      <span>{hub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sub-Filters: Slot Pills for Wearables & Closet */}
            {(viewMode === 'closet' || (viewMode === 'shop' && activeHub === 'wearables')) && (
              <div
                ref={slotScrollRef}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5"
              >
                {COSMETIC_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => {
                        soundFx.playKeyTap();
                        setSelectedSlot(slot.id);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-extrabold rounded-full shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {slot.icon && <span>{slot.icon}</span>}
                      <span>{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sub-Filters: Seasonal Events Bar */}
            {viewMode === 'shop' && activeHub === 'seasonal' && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5">
                {availableSeasonalEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      soundFx.playKeyTap();
                      setSeasonalEventFilter(event.id);
                    }}
                    className={`py-1 px-3 text-xs font-extrabold rounded-full shrink-0 transition-all cursor-pointer border ${
                      effectiveSeasonalEventFilter === event.id
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-2 ring-teal-400/20'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DEDICATED SCROLLABLE ITEM CATALOG GRID */}
          <div
            ref={itemsContainerRef}
            style={{ WebkitOverflowScrolling: 'touch' }}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain p-3 sm:p-4"
          >
            {/* Sparks & Subscription Packages View */}
            {viewMode === 'shop' && activeHub === 'sparks' ? (
              <div className="space-y-4 max-w-3xl mx-auto pb-24 sm:pb-16">
                {/* Kibo Club Subscription Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Individual Plan */}
                  <div
                    onClick={() => {
                      if (allowRealMoneyPurchases) {
                        onBuySparksPackage({
                          id: 'kibo_club_sub',
                          name: 'Kibo Club Individual',
                          realMoneyPrice: '$4.99/mo',
                          price: '$4.99/mo',
                          isSubscription: true,
                          isFamilyPlan: false,
                          description: 'Permanent 1.25x Spark Multiplier + Exclusive Daily Rewards for this profile!'
                        });
                      } else if (onOpenParentZone) {
                        onOpenParentZone('verification', 'real_money_purchases');
                      }
                    }}
                    className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-4 sm:p-5 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          ⭐ Monthly Club
                        </span>
                        <span className="text-sm font-black text-amber-300">$4.99 / mo</span>
                      </div>
                      <h3 className="text-base font-black leading-snug">Join Kibo Club</h3>
                      <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                        1.25x Sparks Forever on all challenges, exclusive golden badge, and daily bonus Sparks!
                      </p>
                    </div>
                    <button
                      type="button"
                      className="w-full bg-white text-indigo-950 font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      {!allowRealMoneyPurchases && <Lock className="w-3.5 h-3.5 text-indigo-900" />}
                      <span>{allowRealMoneyPurchases ? 'Subscribe Now' : 'Enable in Parent Zone'}</span>
                    </button>
                  </div>

                  {/* Family Plan */}
                  <div
                    onClick={() => {
                      if (allowRealMoneyPurchases) {
                        onBuySparksPackage({
                          id: 'kibo_club_family',
                          name: 'Kibo Club Family',
                          realMoneyPrice: '$7.99/mo',
                          price: '$7.99/mo',
                          isSubscription: true,
                          isFamilyPlan: true,
                          description: 'Kibo Club for the whole family! ALL child profiles get the 1.25x Spark Multiplier, golden tag, and 100 daily Sparks.'
                        });
                      } else if (onOpenParentZone) {
                        onOpenParentZone('verification', 'real_money_purchases');
                      }
                    }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-4 sm:p-5 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                          Save 20% • Whole Family
                        </span>
                        <span className="text-sm font-black text-yellow-200">$7.99 / mo</span>
                      </div>
                      <h3 className="text-base font-black leading-snug">Kibo Club Family</h3>
                      <p className="text-xs text-orange-100 font-medium leading-relaxed">
                        Full benefits unlocked for EVERY child profile on your account simultaneously!
                      </p>
                    </div>
                    <button
                      type="button"
                      className="w-full bg-white text-orange-950 font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      {!allowRealMoneyPurchases && <Lock className="w-3.5 h-3.5 text-orange-900" />}
                      <span>{allowRealMoneyPurchases ? 'Subscribe Family' : 'Enable in Parent Zone'}</span>
                    </button>
                  </div>
                </div>

                {/* Account Link Banner */}
                {authService.getAuthState().isAnonymous && onRequestAccountLink && (
                  <div
                    onClick={onRequestAccountLink}
                    className="bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-950">Link Account for +200 ⚡ Free</h4>
                        <p className="text-[11px] sm:text-xs font-bold text-amber-800">Save progress and get Sparks instantly!</p>
                      </div>
                    </div>
                    <button className="bg-amber-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md border-b-2 border-amber-700 whitespace-nowrap">
                      Link Free
                    </button>
                  </div>
                )}

                {/* Sparks Packages Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Spark Bundles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SPARKS_PACKAGES.map((pack) => {
                      const savings = calculateSparksPackageSavings(pack);
                      const displayPrice = pack.realMoneyPrice || pack.price;
                      return (
                        <div
                          key={pack.id}
                          className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-300 shadow-xs flex items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ItemThumbnail itemId={pack.id} rarity={pack.rarity || 'legendary'} className="w-10 h-10 rounded-xl shrink-0 p-0.5" />
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-sm text-slate-800 truncate">{pack.name}</h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-black text-amber-600">⚡ {pack.sparks}</span>
                                {savings !== null && (
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                    Save {savings}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (allowRealMoneyPurchases) {
                                onBuySparksPackage(pack);
                              } else if (onOpenParentZone) {
                                onOpenParentZone('verification', 'real_money_purchases');
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs whitespace-nowrap shrink-0 active:scale-95 transition-all flex items-center gap-1"
                          >
                            {!allowRealMoneyPurchases && <Lock className="w-3 h-3 text-purple-200" />}
                            <span>{displayPrice}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : displayedItems.length === 0 ? (
              /* Empty Catalog State */
              <div className="py-16 text-center text-slate-500 font-bold space-y-3 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 max-w-md mx-auto">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">
                    {viewMode === 'closet'
                      ? 'No items found in your closet'
                      : 'No items matching your search'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {viewMode === 'closet'
                      ? 'Switch to the Shop to discover and unlock hats, outfits, pets, and effects!'
                      : 'Try adjusting your search query, slot filter, or seasonal event tab.'}
                  </p>
                </div>
                {viewMode === 'closet' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setViewMode('shop');
                      setActiveHub('wearables');
                    }}
                    className="btn-3d-orange px-4 py-2 text-xs rounded-xl font-black"
                  >
                    Browse the Shop ➔
                  </button>
                )}
              </div>
            ) : (
              /* RESPONSIVE HIGH-DENSITY VISUAL GRID TILES */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pb-24 sm:pb-16">
                {displayedItems.map((item) => {
                  const isConsumable = item.isConsumable;
                  const shieldOwned = consumables?.shieldCount ?? 1;
                  const isShieldFull = isConsumable && item.id === 'kibo_shield' && shieldOwned >= 2;
                  const isUnlocked = isConsumable ? false : unlockedItems.includes(item.id);
                  const isEquippedInApp = equippedItems.includes(item.id);
                  const isPreviewedOnStage = stageEquippedItems.includes(item.id) || (item.bundleItems && item.bundleItems.some((id) => stageEquippedItems.includes(id)));
                  const isRealMoney = !!item.realMoneyPrice;

                  const saleInfo = getItemSalePrice(item, currentDate);
                  const activeCost = saleInfo.isSale ? saleInfo.salePrice : item.cost;
                  const canAfford = isRealMoney ? true : sparks >= activeCost;
                  const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;
                  const availability = getItemAvailabilityStatus(item, currentDate);
                  const isJustPurchased = recentlyPurchasedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePreviewToggle(item)}
                      className={`group relative bg-white rounded-2xl border-2 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer text-center select-none ${
                        isJustPurchased
                          ? 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-50 scale-[1.02] shadow-lg'
                          : isPreviewedOnStage
                          ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-300'
                          : isUnlocked
                          ? 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                          : availability.isUpcoming
                          ? 'bg-slate-100/80 border-slate-200 opacity-90'
                          : canAfford
                          ? 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                          : 'border-slate-200 opacity-95 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header Row of Tile: Rarity Tag + Info Button */}
                      <div className="w-full flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md border ${rarityInfo.badgeClass}`}>
                          {rarityInfo.label}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playKeyTap();
                            setSelectedItemDetail(item);
                          }}
                          className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] transition-colors"
                          title="View Details & Lore"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Thumbnail with Dynamic Glowing Backdrop */}
                      <div className="relative my-1 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center p-1 relative shadow-inner group-hover:scale-105 transition-transform">
                          <ItemThumbnail
                            itemId={item.id}
                            rarity={item.rarity}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl"
                            saleDiscount={!isUnlocked && saleInfo.isSale ? saleInfo.discountPercent : 0}
                          />

                          {/* Previewing Marker */}
                          {isPreviewedOnStage && !isConsumable && (
                            <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 shadow-sm border border-white">
                              <Eye className="w-3 h-3" />
                            </span>
                          )}

                          {/* Equipped Marker */}
                          {isEquippedInApp && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm border border-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Sale / Countdown Overlay Pill */}
                        {!isUnlocked && saleInfo.isSale && (
                          <span className="absolute top-0 left-0 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs border border-rose-700">
                            -{saleInfo.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Item Name */}
                      <div className="my-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight line-clamp-1" title={item.name}>
                          {item.name}
                        </h4>
                      </div>

                      {/* Bottom Action / Price Bar */}
                      <div className="mt-1 pt-1.5 border-t border-slate-100 w-full" onClick={(e) => e.stopPropagation()}>
                        {isConsumable ? (
                          isShieldFull ? (
                            <div className="text-[10px] font-black text-slate-400 bg-slate-100 py-1 rounded-lg">
                              Full (2/2)
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBuyClick(item)}
                              className="w-full py-1 px-2 text-xs font-black rounded-lg btn-3d-purple active:scale-95 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Buy</span>
                              <span className="inline-flex items-center text-amber-300">{activeCost}⚡</span>
                            </button>
                          )
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className={`w-full py-1 px-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isEquippedInApp
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300'
                            }`}
                          >
                            {isEquippedInApp ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Equipped
                              </>
                            ) : (
                              'Equip'
                            )}
                          </button>
                        ) : availability.isUpcoming ? (
                          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 py-1 rounded-lg flex items-center justify-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Soon
                          </div>
                        ) : item.promoCodeRequired ? (
                          <button
                            type="button"
                            onClick={() => openPromoDialogWithCode()}
                            className="w-full py-1 px-2 text-xs font-black rounded-lg btn-3d-orange shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Ticket className="w-3 h-3" /> Code
                          </button>
                        ) : isRealMoney ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className="w-full py-1 px-2 text-xs font-black rounded-lg btn-3d-purple shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {item.realMoneyPrice}
                          </button>
                        ) : canAfford ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className="w-full py-1 px-2 text-xs font-black rounded-lg btn-3d-purple active:scale-95 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>Buy</span>
                            <span className="inline-flex items-center text-amber-300">{activeCost}⚡</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playKeyTap();
                              setViewMode('shop');
                              setActiveHub('sparks');
                            }}
                            className="w-full py-1 px-1.5 text-[11px] font-black rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-0.5 cursor-pointer"
                          >
                            <span>Need</span>
                            <span>{activeCost - sparks}⚡</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. ITEM DETAIL DIALOG / POPOVER */}
      {selectedItemDetail && (
        <div
          onClick={() => setSelectedItemDetail(null)}
          className="fixed inset-0 z-[65] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scale-in relative text-slate-800 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className={`text-xs uppercase font-black px-2.5 py-0.5 rounded-full border ${(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).badgeClass}`}>
                {(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).label}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedItemDetail(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail & Title */}
            <div className="text-center space-y-2">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-amber-50 to-sky-50 border-2 border-slate-200 flex items-center justify-center p-2 shadow-inner">
                <ItemThumbnail itemId={selectedItemDetail.id} rarity={selectedItemDetail.rarity} className="w-20 h-20" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{selectedItemDetail.name}</h3>
              {selectedItemDetail.subjectLabel && (
                <span className="inline-block text-[10px] font-black text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">
                  {selectedItemDetail.subjectLabel}
                </span>
              )}
            </div>

            {/* Lore / Description */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description & Lore</span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {selectedItemDetail.description}
              </p>
            </div>

            {/* Actions: Try On, Equip, Buy, Sell */}
            <div className="space-y-2 pt-1">
              {!selectedItemDetail.isConsumable && (
                <button
                  type="button"
                  onClick={() => {
                    handlePreviewToggle(selectedItemDetail);
                  }}
                  className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-black text-xs rounded-xl border border-purple-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {stageEquippedItems.includes(selectedItemDetail.id)
                      ? 'Currently on Kibo'
                      : 'Try On Kibo'}
                  </span>
                </button>
              )}

              {/* Unlocked Equip / Sell Controls */}
              {unlockedItems.includes(selectedItemDetail.id) && !selectedItemDetail.isConsumable ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleBuyClick(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      equippedItems.includes(selectedItemDetail.id)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'btn-3d-orange'
                    }`}
                  >
                    {equippedItems.includes(selectedItemDetail.id) ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Equipped
                      </>
                    ) : (
                      'Equip Now'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setItemToSell(selectedItemDetail);
                    }}
                    className="py-2.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 border-2 border-rose-300 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Sell ({Math.floor((selectedItemDetail.cost || 0) * 0.5)}⚡)
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 4. PROMO CODE REDEMPTION MODAL */}
      {showPromoModal && (
        <div
          onClick={() => setShowPromoModal(false)}
          className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-in relative text-slate-800 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* 5. ITEM SELL CONFIRMATION MODAL */}
      {itemToSell && (
        <div
          onClick={() => setItemToSell(null)}
          className="fixed inset-0 z-[75] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
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
                Are you sure you want to sell <span className="text-slate-700">{itemToSell.name}</span> for <span className="text-amber-600">{Math.floor((itemToSell.cost || 0) * 0.5)} ⚡</span>?
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

      {/* 6. BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
