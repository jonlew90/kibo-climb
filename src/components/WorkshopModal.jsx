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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  Ticket,
  Gift,
  Clock,
  AlertCircle,
  Info,
  Search,
  Tag,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Package,
  Sparkle
} from 'lucide-react';
import Mascot from './Mascot';
import ItemThumbnail from './ItemThumbnail';
import FamilyPlanUpgradeModal from './FamilyPlanUpgradeModal';
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
  getActiveRealMoneySaleEvent,
  getEffectiveSubscriptionPricing,
  getEffectiveSparksPackage,
  isSeasonalEventAvailableOrUpcoming,
  getItemsByCategory,
  getItemById,
  getItemSlot,
  getItemAvailabilityStatus,
  isItemVisibleInShop,
  getItemSalePrice,
  calculateSparksPackageSavings,
  getRealMoneyItemSavings,
  getItemEffectivePrice,
  getItemSellBackPrice,
  getRealMoneyItemClubPrice,
  getRealMoneyItemClubSavings,
  isWearableItem,
  getOwnedItems
} from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { promoCodeService } from '../services/promoCodeService';
import { analyticsService } from '../services/analyticsService';

export function sortShopItems(items, userSparks, unlockedItems = [], equippedItems = [], currentDate = new Date(), viewMode = 'shop') {
  return [...items].sort((a, b) => {
    // 1. IN CLOSET MODE:
    // Equipped items first, then by rarity tier, then by name
    if (viewMode === 'closet') {
      const aEquipped = equippedItems.includes(a.id);
      const bEquipped = equippedItems.includes(b.id);
      if (aEquipped !== bEquipped) return aEquipped ? -1 : 1;

      const aRarity = RARITY_ORDER[a.rarity] || 0;
      const bRarity = RARITY_ORDER[b.rarity] || 0;
      if (aRarity !== bRarity) return bRarity - aRarity;

      return (a.name || '').localeCompare(b.name || '');
    }

    // 2. IN SHOP MODE:
    // A. Available items before upcoming/preview items
    const aAvail = getItemAvailabilityStatus(a, currentDate);
    const bAvail = getItemAvailabilityStatus(b, currentDate);
    if (aAvail.isUpcoming !== bAvail.isUpcoming) {
      return aAvail.isUpcoming ? 1 : -1;
    }

    // B. UNOWNED ITEMS FIRST, ALREADY OWNED ITEMS DEMOTED TO BOTTOM
    const aUnlocked = unlockedItems.includes(a.id);
    const bUnlocked = unlockedItems.includes(b.id);
    if (aUnlocked !== bUnlocked) {
      return aUnlocked ? 1 : -1;
    }

    // C. ACTIVE SALES & DEALS FIRST (for unowned items)
    if (!aUnlocked && !bUnlocked) {
      const aSale = getItemSalePrice(a, currentDate);
      const bSale = getItemSalePrice(b, currentDate);
      if (aSale.isSale !== bSale.isSale) {
        return aSale.isSale ? -1 : 1;
      }
    }

    // D. SORT BY RARITY TIER
    const aRarity = RARITY_ORDER[a.rarity] || 0;
    const bRarity = RARITY_ORDER[b.rarity] || 0;
    if (aRarity !== bRarity) {
      return aRarity - bRarity;
    }

    // E. SORT BY PRICE
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
  onOpenDailyVault,
  isKiboClub = false,
  activeProfileId = null,
  initialHub = 'wearables',
  initialViewMode = 'shop',
  renderFooter
}) {
  const isMember = isKiboClub || storageService.hasClubMembership(activeProfileId);

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

  // Search Toggle and Query
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Item for Try-On / Details Drawer (Mobile & Desktop)
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Preview Slots State
  const [previewSlots, setPreviewSlots] = useState(INITIAL_PREVIEW_SLOTS);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [recentlyPurchasedId, setRecentlyPurchasedId] = useState(null);

  // Sell Confirmation Modal State
  const [itemToSell, setItemToSell] = useState(null);

  // Promo Code Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Family Plan Modal State
  const [showFamilyPlanModal, setShowFamilyPlanModal] = useState(false);

  const itemsContainerRef = useRef(null);
  const hubScrollRef = useRef(null);
  const slotScrollRef = useRef(null);
  const seasonalScrollRef = useRef(null);
  const dragStartYRef = useRef(null);

  const [canHubScrollRight, setCanHubScrollRight] = useState(false);
  const [canSlotScrollRight, setCanSlotScrollRight] = useState(false);
  const [canSeasonalScrollRight, setCanSeasonalScrollRight] = useState(false);

  const checkScrollIndicators = () => {
    if (hubScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = hubScrollRef.current;
      setCanHubScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
    if (slotScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = slotScrollRef.current;
      setCanSlotScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
    if (seasonalScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = seasonalScrollRef.current;
      setCanSeasonalScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScrollIndicators();
    const timer = setTimeout(checkScrollIndicators, 120);
    return () => clearTimeout(timer);
  }, [viewMode, activeHub, selectedSlot, seasonalEventFilter, isOpen, showSearch]);

  // Log analytics when visiting sparks or subscriptions
  useEffect(() => {
    if (isOpen && activeHub === 'sparks') {
      analyticsService.logSubscriptionUpsellView('Shop');
    }
  }, [isOpen, activeHub]);

  // Handle modal open/close: body scroll lock and initial reset
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPreviewSlots(INITIAL_PREVIEW_SLOTS);
      if (initialViewMode) setViewMode(initialViewMode);
      if (initialHub) setActiveHub(initialHub);
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialViewMode, initialHub]);

  // Ensure active category hub is scrolled into view in the top navigation strip
  useEffect(() => {
    if (isOpen && viewMode === 'shop' && hubScrollRef.current) {
      const activeEl = hubScrollRef.current.querySelector(`[data-hub="${activeHub}"]`);
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [isOpen, viewMode, activeHub]);

  // Handle Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedItemDetail) {
          setSelectedItemDetail(null);
        } else if (showFamilyPlanModal) {
          setShowFamilyPlanModal(false);
        } else if (showPromoModal) {
          setShowPromoModal(false);
        } else if (itemToSell) {
          setItemToSell(null);
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, showPromoModal, showFamilyPlanModal, selectedItemDetail, itemToSell]);

  // Scroll to top of item list on filter/mode change and clear selected item detail
  useEffect(() => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollTop = 0;
    }
    setSelectedItemDetail(null);
  }, [viewMode, activeHub, selectedSlot, seasonalEventFilter]);

  const unlockedWearablesCount = useMemo(() => {
    return getOwnedItems(unlockedItems).length;
  }, [unlockedItems]);

  const currentDate = useMemo(() => storageService.getCurrentDate(), [isOpen]);
  const availableSeasonalEvents = useMemo(() => getAvailableSeasonalEvents(currentDate), [currentDate]);
  const effectiveSeasonalEventFilter = useMemo(() => {
    return availableSeasonalEvents.some((e) => e.id === seasonalEventFilter)
      ? seasonalEventFilter
      : 'all_active';
  }, [availableSeasonalEvents, seasonalEventFilter]);

  // Compute active stage items (merges saved equipped items with active preview overrides)
  const SLOTS = useMemo(() => ['headwear', 'gear', 'outfits', 'pets', 'fx', 'skins', 'effects', 'background', 'borders'], []);

  const stageEquippedItems = useMemo(() => {
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
  }, [previewSlots, equippedItems, SLOTS]);

  // Active preview states
  const hasActivePreview = Object.values(previewSlots).some((v) => v !== null);
  const hasUnownedPreview = stageEquippedItems.some((id) => !unlockedItems.includes(id));
  const previewedItemsList = useMemo(() => {
    return Object.entries(previewSlots)
      .filter(([, itemId]) => itemId !== null)
      .map(([slot, itemId]) => {
        const item = getItemById(itemId);
        return item ? { ...item, previewSlot: slot } : null;
      })
      .filter(Boolean);
  }, [previewSlots]);

  // Determine which items to show based on mode, hubs, slots, and search query (Memoized for instant rendering)
  const displayedItems = useMemo(() => {
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
          if (item.category === 'seasonal') return false;
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
        items = [];
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

    return sortShopItems(items, sparks, unlockedItems, equippedItems, currentDate, viewMode);
  }, [viewMode, activeHub, selectedSlot, effectiveSeasonalEventFilter, searchQuery, sparks, unlockedItems, equippedItems, currentDate]);

  // Handle preview toggle
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

  // Remove a specific slot from preview or unequip it (Closet only)
  const handleClearSlot = (slot) => {
    soundFx.playKeyTap();
    const currentSavedInSlot = equippedItems.find((id) => {
      const item = getItemById(id);
      return item ? getItemSlot(item) === slot : false;
    });

    if (previewSlots[slot] !== null) {
      setPreviewSlots((prev) => ({ ...prev, [slot]: null }));
    } else if (currentSavedInSlot) {
      onToggleEquip(currentSavedInSlot);
    }
  };

  const handleResetPreview = () => {
    soundFx.playKeyTap();
    setPreviewSlots(INITIAL_PREVIEW_SLOTS);
    setIsMobilePreviewOpen(false);
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

    if (item.requiresKiboClub && !isMember) {
      soundFx.playKeyTap();
      setShowFamilyPlanModal(true);
      return;
    }

    if (item.realMoneyPrice) {
      soundFx.playKeyTap();
      const packToBuy = (isMember && item.clubRealMoneyPrice)
        ? { ...item, realMoneyPrice: item.clubRealMoneyPrice, price: item.clubRealMoneyPrice }
        : item;

      if (allowRealMoneyPurchases) {
        onBuySparksPackage(packToBuy);
      } else if (onOpenParentZone) {
        onOpenParentZone('verification', 'real_money_purchases');
      }
      return;
    }

    const priceInfo = getItemEffectivePrice(item, currentDate, isMember);
    const effectiveCost = priceInfo.cost;

    if (sparks >= effectiveCost) {
      soundFx.playVictory();
      onBuyItem(item);
      setRecentlyPurchasedId(item.id);
      setTimeout(() => setRecentlyPurchasedId(null), 1200);

      // Clear tried/preview state for this item upon purchase so it is marked as owned, not tried
      if (!item.isConsumable) {
        const primarySlot = getItemSlot(item);
        const itemsBought = (item.bundleItems && item.bundleItems.length > 0) ? item.bundleItems : [item.id];
        setPreviewSlots((prev) => {
          const next = { ...prev };
          itemsBought.forEach((id) => {
            const it = getItemById(id);
            const slot = it ? getItemSlot(it) : primarySlot;
            if (slot && next[slot] === id) {
              next[slot] = null;
            }
          });
          return next;
        });
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

  const activeSaleEvent = useMemo(() => getActiveHolidayOrSeasonalSaleEvent(currentDate), [currentDate]);
  const activeRealMoneySale = useMemo(() => getActiveRealMoneySaleEvent(currentDate), [currentDate]);

  // Compute active equipped look details for slot HUD (used in My Closet)
  const activeSlotDetails = useMemo(() => {
    return SLOTS.map((slot) => {
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
  }, [SLOTS, stageEquippedItems, unlockedItems, previewSlots]);

  // Live Try-On items for the drawer / modal: guarantees the selected item (and any bundle contents) is equipped on Kibo
  const tryOnEquippedItems = useMemo(() => {
    if (!selectedItemDetail || selectedItemDetail.isConsumable) return stageEquippedItems;

    const itemsToAdd = (selectedItemDetail.bundleItems && selectedItemDetail.bundleItems.length > 0)
      ? selectedItemDetail.bundleItems
      : [selectedItemDetail.id];

    const targetSlots = itemsToAdd.map((id) => {
      const it = getItemById(id);
      return it ? getItemSlot(it) : getItemSlot(selectedItemDetail);
    }).filter(Boolean);

    const baseItems = stageEquippedItems.filter((id) => {
      const it = getItemById(id);
      const itSlot = it ? getItemSlot(it) : null;
      return !targetSlots.includes(itSlot);
    });

    return [...baseItems, ...itemsToAdd];
  }, [stageEquippedItems, selectedItemDetail]);

  // When clicking an item:
  // In Shop on Mobile -> toggles preview if already previewed, or applies preview & opens detail sheet
  // In Shop on Desktop -> selects item & updates left stage (toggling if already previewed)
  const handleItemCardClick = (item) => {
    soundFx.playKeyTap();
    if (viewMode === 'closet') {
      const slot = getItemSlot(item);
      if (slot && previewSlots[slot] !== null) {
        setPreviewSlots((prev) => ({ ...prev, [slot]: null }));
      }
      onToggleEquip(item.id);
    } else {
      if (!item.isConsumable) {
        const itemsToPreview = (item.bundleItems && item.bundleItems.length > 0) ? item.bundleItems : [item.id];
        const primarySlot = getItemSlot(item);
        const isCurrentlyPreviewed = itemsToPreview.some((id) => {
          const it = getItemById(id);
          const slot = it ? getItemSlot(it) : primarySlot;
          return slot && previewSlots[slot] === id;
        });

        if (isCurrentlyPreviewed) {
          // Un-try: remove from preview slots
          setPreviewSlots((prev) => {
            const next = { ...prev };
            itemsToPreview.forEach((id) => {
              const it = getItemById(id);
              const slot = it ? getItemSlot(it) : primarySlot;
              if (slot && next[slot] === id) {
                next[slot] = null;
              }
            });
            return next;
          });
          if (selectedItemDetail?.id === item.id) {
            setSelectedItemDetail(null);
          }
          return;
        }

        // Apply to preview slots
        setPreviewSlots((prev) => {
          const next = { ...prev };
          itemsToPreview.forEach((id) => {
            const it = getItemById(id);
            const slot = it ? getItemSlot(it) : getItemSlot(item);
            if (slot) {
              next[slot] = id;
            }
          });
          return next;
        });
      }
      // On desktop, selecting an item highlights details/stage; on mobile, keep item detail closed so preview handles it
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setSelectedItemDetail(item);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      
      {/* 1. TOP COMPACT FIXED-HEIGHT HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 shadow-xs shrink-0 z-20">
        {/* Title & Brand + Back Button */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                soundFx.playKeyTap();
                onClose();
              }}
              className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600 stroke-[2.5]" />
          </div>
          <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight truncate">
            Kibo's Corner
          </h2>
        </div>

        {/* Center: Mode Segmented Switcher (Shop vs My Closet) */}
        <div className="flex items-center bg-slate-100 border border-slate-300 p-0.5 rounded-xl shadow-inner mx-1 sm:mx-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('shop');
            }}
            className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
              viewMode === 'shop'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
            className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
              viewMode === 'closet'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👗</span>
            <span>Closet</span>
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
              viewMode === 'closet' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {unlockedWearablesCount}
            </span>
          </button>
        </div>

        {/* Right: Currency */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div
            onClick={() => {
              soundFx.playKeyTap();
              setViewMode('shop');
              setActiveHub('sparks');
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 border-2 border-yellow-500 rounded-full text-amber-950 font-black text-xs shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
            title="Sparks Balance"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 fill-amber-500 stroke-[2.5]" />
            <span>{sparks}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 w-full max-w-7xl mx-auto overflow-hidden">
        
        {/* ========================================================================= */}
        {/* DESKTOP LEFT PANE OR MY CLOSET DRESSING ROOM STAGE */}
        {/* ========================================================================= */}
        <aside className={`w-full md:w-80 lg:w-96 shrink-0 bg-white md:border-r-2 border-b-2 md:border-b-0 border-slate-200 flex flex-col z-10 shadow-xs md:shadow-none overflow-y-auto ${
          viewMode === 'shop' ? 'hidden md:flex' : 'flex'
        }`}>
          
          <div className="p-3 sm:p-4 space-y-3 flex flex-col items-center">
            {/* Dressing Stage Header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">
                  {viewMode === 'closet' ? '✨ Kibo’s Dressing Room' : '🐾 Live Try-On Stage'}
                </span>
              </div>

              {hasActivePreview && (
                <button
                  type="button"
                  onClick={handleResetPreview}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Framed Mascot Stage Box */}
            <div className="w-full h-36 sm:h-44 md:h-52 rounded-3xl bg-gradient-to-b from-sky-100 via-white to-amber-50 border-3 border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-2 group">
              <Mascot mood="happy" equipped={stageEquippedItems} className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 transition-transform duration-300 group-hover:scale-105" />

              {/* Status Indicator */}
              <div className="absolute top-2.5 left-2.5">
                {hasUnownedPreview ? (
                  <span className="bg-purple-700 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                    <Sparkles className="w-3 h-3 fill-amber-300 stroke-[2.5]" /> Preview Mode
                  </span>
                ) : (
                  <span className="bg-emerald-700 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Active Look
                  </span>
                )}
              </div>
            </div>

            {/* CLOSET ONLY: Equipped Slots HUD with 1-Tap Unequip */}
            {viewMode === 'closet' && (
              <div className="w-full space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Equipped Slots ({activeSlotDetails.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Tap × to unequip</span>
                </div>

                {activeSlotDetails.length === 0 ? (
                  <div className="p-2.5 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                    Nothing equipped! Tap any item below to wear it.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeSlotDetails.map(({ slot, item, isPreview }) => (
                      <div
                        key={slot}
                        className={`flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl text-xs font-black border shadow-2xs ${
                          isPreview
                            ? 'bg-purple-50 border-purple-300 text-purple-900 ring-1 ring-purple-200'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <ItemThumbnail itemId={item.id} rarity={item.rarity} className="w-4 h-4 rounded-xs shrink-0" />
                        <span className={`truncate max-w-[100px] sm:max-w-[120px] ${isPreview ? 'text-purple-700 font-extrabold' : ''}`}>
                          {item.name}
                        </span>
                        {isPreview && (
                          <span className="text-[9px] font-black uppercase bg-purple-200/80 text-purple-900 px-1 py-0.2 rounded shrink-0">
                            Tried
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleClearSlot(slot)}
                          className="w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-200 hover:text-rose-800 text-slate-500 flex items-center justify-center text-[10px] font-black transition-colors"
                          title="Unequip slot"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DESKTOP SHOP: Selected Item Quick Summary / Empty Prompt */}
            {viewMode === 'shop' && (
              selectedItemDetail ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-left animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 truncate">{selectedItemDetail.name}</span>
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md border ${(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).badgeClass}`}>
                      {(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {selectedItemDetail.description}
                  </p>
                  <div className="pt-1 space-y-1.5">
                    {unlockedItems.includes(selectedItemDetail.id) ? (
                      <button
                        type="button"
                        onClick={() => handleBuyClick(selectedItemDetail)}
                        className={`w-full py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          equippedItems.includes(selectedItemDetail.id)
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'btn-3d-orange'
                        }`}
                      >
                        {equippedItems.includes(selectedItemDetail.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Equipped
                          </>
                        ) : (
                          'Equip Now'
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyClick(selectedItemDetail)}
                        className="w-full py-1.5 text-xs font-black rounded-xl btn-3d-purple flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Buy for</span>
                        <span className="text-amber-300 font-black">
                          {getItemSalePrice(selectedItemDetail, currentDate).salePrice || selectedItemDetail.cost}⚡
                        </span>
                      </button>
                    )}

                    {!selectedItemDetail.isConsumable && (stageEquippedItems.includes(selectedItemDetail.id) || (selectedItemDetail.bundleItems && selectedItemDetail.bundleItems.some((id) => stageEquippedItems.includes(id)))) && (
                      <button
                        type="button"
                        onClick={() => {
                          handlePreviewToggle(selectedItemDetail);
                          setSelectedItemDetail(null);
                        }}
                        className="w-full py-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Remove from Try-On
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full p-3 bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-bold text-slate-500">✨ Click any item to try it on Kibo!</p>
                  <p className="text-[10px] text-slate-400">Preview hats, outfits, and gear live before unlocking.</p>
                </div>
              )
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT CATALOG / CLOSET GRID CONTAINER */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50/50">
          
          {/* SINGLE CONSOLIDATED NAVIGATION STRIP */}
          <div className="bg-white border-b-2 border-slate-200 px-3 py-2 space-y-2 shrink-0 z-10 shadow-2xs">
            
            {/* Row 1: Primary Category Hubs or Slot Icons with horizontal scroll indicator */}
            <div className="flex items-center justify-between gap-2">
              
              {/* Category Pills (Shop Mode) */}
              {viewMode === 'shop' ? (
                <div className="relative flex items-center min-w-0 flex-1 overflow-hidden">
                  <div
                    ref={hubScrollRef}
                    onScroll={checkScrollIndicators}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5 w-full pr-6"
                  >
                    {CATEGORY_HUBS.map((hub) => {
                      const isSelected = activeHub === hub.id;
                      return (
                        <button
                          key={hub.id}
                          data-hub={hub.id}
                          onClick={() => {
                            soundFx.playKeyTap();
                            setActiveHub(hub.id);
                            if (hub.id !== 'wearables') setSelectedSlot('all');
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-black rounded-full shrink-0 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{hub.icon}</span>
                          <span>{hub.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Horizontal Scroll Hint / Right Fade Indicator */}
                  {canHubScrollRight && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        if (hubScrollRef.current) {
                          hubScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/95 to-transparent flex items-center justify-end pr-0.5 pointer-events-auto cursor-pointer z-10 animate-fade-in"
                      title="Scroll categories"
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-2xs">
                        <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                /* Slot Icons (Closet Mode) */
                <div className="relative flex items-center min-w-0 flex-1 overflow-hidden">
                  <div
                    ref={slotScrollRef}
                    onScroll={checkScrollIndicators}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5 w-full pr-6"
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
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-black rounded-full shrink-0 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot.icon && <span>{slot.icon}</span>}
                          <span>{slot.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {canSlotScrollRight && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playKeyTap();
                        if (slotScrollRef.current) {
                          slotScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/95 to-transparent flex items-center justify-end pr-0.5 pointer-events-auto cursor-pointer z-10 animate-fade-in"
                      title="Scroll slots"
                    >
                      <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center shadow-2xs">
                        <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  if (showSearch) {
                    setShowSearch(false);
                    setSearchQuery('');
                  } else {
                    setShowSearch(true);
                  }
                }}
                className={`p-1.5 rounded-xl border transition-all shrink-0 ${
                  showSearch || searchQuery
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                }`}
                title={showSearch ? "Close Search" : "Open Search"}
                aria-label={showSearch ? "Close search" : "Open search"}
              >
                {showSearch ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Row 2: Secondary Filters (Wearables sub-slots OR Seasonal events OR Search) */}
            {showSearch && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSearch(false);
                        setSearchQuery('');
                      }
                    }}
                    placeholder={viewMode === 'closet' ? 'Search owned items...' : 'Search gear, pets, boosters...'}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-amber-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                      title="Clear search text"
                      aria-label="Clear search text"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold transition-all shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Wearables Sub-Slot Filter with horizontal scroll indicator (Shop mode -> Wearables hub) */}
            {viewMode === 'shop' && activeHub === 'wearables' && !showSearch && (
              <div className="relative flex items-center min-w-0 overflow-hidden h-7">
                <div
                  ref={slotScrollRef}
                  onScroll={checkScrollIndicators}
                  className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5 w-full pr-6"
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
                        className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full shrink-0 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {slot.icon && <span>{slot.icon}</span>}
                        <span>{slot.label}</span>
                      </button>
                    );
                  })}
                </div>

                {canSlotScrollRight && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      if (slotScrollRef.current) {
                        slotScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/95 to-transparent flex items-center justify-end pr-0.5 pointer-events-auto cursor-pointer z-10 animate-fade-in"
                    title="Scroll cosmetic slots"
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center shadow-2xs">
                      <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Seasonal Events Sub-Bar with horizontal scroll indicator */}
            {viewMode === 'shop' && activeHub === 'seasonal' && !showSearch && (
              <div className="relative flex items-center min-w-0 overflow-hidden h-7">
                <div
                  ref={seasonalScrollRef}
                  onScroll={checkScrollIndicators}
                  className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5 w-full pr-6"
                >
                  {availableSeasonalEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        soundFx.playKeyTap();
                        setSeasonalEventFilter(event.id);
                      }}
                      className={`py-0.5 px-2.5 text-[11px] font-extrabold rounded-full shrink-0 transition-all cursor-pointer border ${
                        effectiveSeasonalEventFilter === event.id
                          ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>

                {canSeasonalScrollRight && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      if (seasonalScrollRef.current) {
                        seasonalScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/95 to-transparent flex items-center justify-end pr-0.5 pointer-events-auto cursor-pointer z-10 animate-fade-in"
                    title="Scroll seasonal events"
                  >
                    <div className="w-4 h-4 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center shadow-2xs">
                      <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Power-Ups Sub-Bar */}
            {viewMode === 'shop' && activeHub === 'powerups' && !showSearch && (
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 h-7">
                <span className="flex items-center gap-1">🧪 Use boosters to protect streaks on climbs</span>
                <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">Power-Ups</span>
              </div>
            )}

            {/* Sparks Sub-Bar */}
            {viewMode === 'shop' && activeHub === 'sparks' && !showSearch && (
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 h-7">
                <span className="flex items-center gap-1">⚡ Get Sparks & Join Kibo Club</span>
                <span className="font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.2 rounded-full border border-indigo-200">Kibo Club</span>
              </div>
            )}

            {/* Closet Sub-Bar (Ensures 100% identical height to Shop so there's zero layout shift!) */}
            {viewMode === 'closet' && !showSearch && (
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 h-7">
                <span className="flex items-center gap-1 text-slate-600"><Sparkles className="w-3 h-3 text-purple-600" /> Tap any item to wear or take off</span>
                <span className="font-extrabold text-purple-800 bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">{displayedItems.length} owned</span>
              </div>
            )}
          </div>

          {/* DEDICATED HIGH-DENSITY ITEM GRID */}
          <div
            ref={itemsContainerRef}
            style={{ WebkitOverflowScrolling: 'touch' }}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain p-2.5 sm:p-4"
          >
            {/* Sparks & Subscription Packages Hub */}
            {viewMode === 'shop' && activeHub === 'sparks' ? (
              <div className="space-y-3 max-w-3xl mx-auto pb-24 sm:pb-16">
                {/* Consolidated Kibo Club Hero Banner */}
                {(() => {
                  const soloSubPricing = getEffectiveSubscriptionPricing('kibo_club_sub', currentDate);
                  const soloAnnualPricing = getEffectiveSubscriptionPricing('kibo_club_sub_annual', currentDate);
                  const hasSubDiscount = soloSubPricing.isDiscounted || soloAnnualPricing.isDiscounted;

                  return (
                    <div
                      onClick={() => {
                        soundFx.playKeyTap();
                        setShowFamilyPlanModal(true);
                      }}
                      className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 text-white rounded-3xl p-4 sm:p-5 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer relative overflow-hidden group border-2 border-amber-300/40"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3 fill-amber-950" /> Kibo Club
                            </span>
                            {hasSubDiscount && (
                              <span className="bg-amber-300 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                                Sale Active!
                              </span>
                            )}
                            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Solo & Family ({soloAnnualPricing.isDiscounted ? `Save ${soloAnnualPricing.discountPercent + 30}%` : 'Save ~35%'} Annual)
                            </span>
                            <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                              From {soloSubPricing.price} or {soloAnnualPricing.price}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
                            Unlock 1.25x Sparks Forever, 15% VIP Store Discounts & Daily Vault
                          </h3>
                          <p className="text-xs text-indigo-100 font-medium leading-snug max-w-xl">
                            Supercharge learning with 1.25x Sparks, 15% VIP discounts on gear & packs, 3.3x Daily Vault bonuses, golden tags 👑, and up to 6 siblings on Family Plan!
                          </p>
                        </div>

                    <div className="shrink-0 flex items-center">
                      <button
                        type="button"
                        className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-amber-50 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all group-hover:shadow-lg"
                      >
                        <span>View Plans & Details</span>
                        <ChevronRight className="w-4 h-4 text-indigo-900" />
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })()}

                {/* Account Link Reward Banner */}
                {authService.getAuthState().isAnonymous && onRequestAccountLink && (
                  <div
                    onClick={onRequestAccountLink}
                    className="bg-gradient-to-r from-amber-100 to-yellow-200 border border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-2xs cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-amber-950 truncate">Link Account for +200 ⚡ Free</h4>
                        <p className="text-[10px] font-bold text-amber-800">Save progress and get Sparks!</p>
                      </div>
                    </div>
                    <button className="bg-amber-500 text-white font-black text-[11px] px-3 py-1.5 rounded-xl shadow-xs whitespace-nowrap">
                      Link Free
                    </button>
                  </div>
                )}

                {/* Active Real-Money Sale Event Banner */}
                {activeRealMoneySale && (
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white p-3.5 rounded-2xl shadow-md space-y-1 text-left relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 fill-amber-300 text-amber-200 animate-pulse" />
                        <span>{activeRealMoneySale.name} Active!</span>
                      </div>
                      <span className="text-[10px] bg-white/20 border border-white/30 backdrop-blur-xs px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        +{activeRealMoneySale.sparksBonusPercent}% Bonus Sparks
                      </span>
                    </div>
                    <p className="text-xs text-amber-100 font-medium leading-relaxed">
                      {activeRealMoneySale.description}
                    </p>
                  </div>
                )}

                {/* VIP Pricing & Savings Value Callout */}
                <div className="bg-gradient-to-r from-amber-50 to-purple-50 border border-amber-200 rounded-2xl p-3 text-left space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <span>
                      {storageService.hasFamilyPlan()
                        ? 'Kibo Club Family Pricing: Save 20% on All Spark Bundles'
                        : 'Kibo Club Solo Pricing: Save 15% on All Packs & Bundles'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {storageService.hasFamilyPlan()
                      ? 'Your Family membership provides our maximum 20% discount on Spark top-ups to outfit all sibling profiles.'
                      : 'Your subscription pays for itself with everyday savings on Spark packs, bundles, and exclusive gear.'}
                  </p>
                </div>

                {/* Sparks Packages Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Spark Bundles</h4>
                    {activeRealMoneySale && (
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-tight">
                        ⚡ +{activeRealMoneySale.sparksBonusPercent}% Event Bonus Included
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SPARKS_PACKAGES.map((rawPack) => {
                      const pack = getEffectiveSparksPackage(rawPack, currentDate);
                      const savings = calculateSparksPackageSavings(pack);
                      const isFam = storageService.hasFamilyPlan();
                      const clubPrice = getRealMoneyItemClubPrice(pack, isFam);
                      const displayPrice = isMember && clubPrice ? clubPrice : (pack.realMoneyPrice || pack.price);
                      const clubSavings = getRealMoneyItemClubSavings(pack, isFam);

                      return (
                        <div
                          key={pack.id}
                          className="bg-white p-3 rounded-2xl border-2 border-slate-200 hover:border-amber-300 shadow-2xs flex items-center justify-between gap-2.5 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ItemThumbnail itemId={pack.id} rarity={pack.rarity || 'legendary'} className="w-9 h-9 rounded-xl shrink-0 p-0.5" />
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate">{pack.name}</h5>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="text-xs font-black text-amber-600">⚡ {pack.totalSparks || pack.sparks}</span>
                                {pack.hasBonus && (
                                  <span className="text-[9px] font-black text-amber-800 bg-amber-200 border border-amber-300 px-1 py-0.2 rounded">
                                    +{pack.bonusPercent}% Bonus ({pack.bonusSparks})
                                  </span>
                                )}
                                {savings !== null && !pack.hasBonus && (
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                                    -{savings}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isMember ? (
                              <>
                                {pack.realMoneyPrice && clubPrice && (
                                  <div className="flex flex-col items-end justify-center leading-none pr-0.5">
                                    <span className="text-[10px] text-slate-400 line-through font-bold">
                                      {pack.realMoneyPrice}
                                    </span>
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                                      <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {isFam ? '20% VIP' : 'VIP'}
                                    </span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetPack = clubPrice
                                      ? { ...pack, realMoneyPrice: clubPrice, price: clubPrice }
                                      : pack;
                                    if (allowRealMoneyPurchases) {
                                      onBuySparksPackage(targetPack);
                                    } else if (onOpenParentZone) {
                                      onOpenParentZone('verification', 'real_money_purchases');
                                    }
                                  }}
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-2xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 cursor-pointer border border-amber-400"
                                >
                                  {!allowRealMoneyPurchases && <Lock className="w-3 h-3 text-amber-100" />}
                                  <span>{clubPrice || pack.realMoneyPrice || pack.price}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (allowRealMoneyPurchases) {
                                      onBuySparksPackage(pack);
                                    } else if (onOpenParentZone) {
                                      onOpenParentZone('verification', 'real_money_purchases');
                                    }
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-2xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  {!allowRealMoneyPurchases && <Lock className="w-3 h-3 text-purple-200" />}
                                  <span>{pack.realMoneyPrice || pack.price}</span>
                                </button>
                                {pack.clubRealMoneyPrice && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      soundFx.playKeyTap();
                                      setShowFamilyPlanModal(true);
                                    }}
                                    title={`Join Kibo Club to unlock VIP price ${pack.clubRealMoneyPrice}`}
                                    className="group/club flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-purple-50 hover:from-amber-100 hover:to-purple-100 border border-amber-200 hover:border-amber-300 text-amber-950 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 group-hover/club:rotate-12 transition-transform shrink-0" />
                                    <span className="text-[10px] uppercase font-black tracking-tight text-amber-800">Club</span>
                                    <span className="font-black text-xs text-amber-950">{pack.clubRealMoneyPrice}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Code Redemption Card inside Sparks & Club Hub */}
                <div
                  onClick={() => openPromoDialogWithCode()}
                  className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-200 border border-amber-400 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                      <Ticket className="w-5 h-5 text-amber-800 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-amber-950 truncate flex items-center gap-1">
                        <span>Have a Promo Code?</span>
                      </h4>
                      <p className="text-[11px] font-bold text-amber-800">
                        Redeem creator, event, or gift codes for bonus Sparks & items
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 px-3 py-1.5 bg-amber-500 group-hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all pointer-events-none"
                  >
                    Enter Code
                  </button>
                </div>
              </div>
            ) : displayedItems.length === 0 ? (
              /* Empty Catalog State */
              <div className="py-14 text-center text-slate-500 font-bold space-y-2.5 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 max-w-sm mx-auto my-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">
                    {viewMode === 'closet'
                      ? 'No items found in your closet'
                      : 'No items found'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {viewMode === 'closet'
                      ? 'Switch to the Shop to unlock hats, outfits, pets, and effects!'
                      : 'Try choosing another category or clearing your search.'}
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
                    Browse Shop ➔
                  </button>
                )}
              </div>
            ) : (
              /* RESPONSIVE HIGH-DENSITY VISUAL GRID TILES */
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 pb-24 sm:pb-16">
                {displayedItems.map((item) => {
                  const isConsumable = item.isConsumable;
                  const shieldOwned = consumables?.shieldCount ?? 1;
                  const isShieldFull = isConsumable && item.id === 'kibo_shield' && shieldOwned >= 2;
                  const isUnlocked = isConsumable ? false : unlockedItems.includes(item.id);
                  const isEquippedInApp = equippedItems.includes(item.id);
                  const isPreviewedOnStage = stageEquippedItems.includes(item.id) || (item.bundleItems && item.bundleItems.some((id) => stageEquippedItems.includes(id)));
                  const isRealMoney = !!item.realMoneyPrice;
                  const priceInfo = getItemEffectivePrice(item, currentDate, isMember);
                  const activeCost = priceInfo.cost;
                  const saleInfo = getItemSalePrice(item, currentDate);
                  const canAfford = isRealMoney ? true : sparks >= activeCost;
                  const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;
                  const availability = getItemAvailabilityStatus(item, currentDate);
                  const isJustPurchased = recentlyPurchasedId === item.id;
                  const itemSlotId = getItemSlot(item);
                  const slotMeta = COSMETIC_SLOTS.find((s) => s.id === itemSlotId);
                  const showSlotTag = (selectedSlot === 'all' || activeHub === 'seasonal' || searchQuery.trim().length > 0) && slotMeta && slotMeta.id !== 'all';
                  const isClubExclusive = !!item.requiresKiboClub;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemCardClick(item)}
                      className={`group relative bg-white rounded-2xl border-2 p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer text-center select-none ${
                        isJustPurchased
                          ? 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-50 scale-[1.02] shadow-md'
                          : isEquippedInApp
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                          : isPreviewedOnStage
                          ? 'bg-purple-50 border-purple-400 shadow-xs ring-2 ring-purple-200'
                          : isUnlocked
                          ? 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                          : availability.isUpcoming
                          ? 'bg-slate-100/70 border-slate-200 opacity-90'
                          : canAfford
                          ? 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                          : 'border-slate-200 opacity-95 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Rarity Badge + Category Slot Tag (only in mixed views) + Equipped Indicator */}
                      <div className="w-full flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-wrap">
                          <span className={`text-[8px] sm:text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md border shrink-0 ${rarityInfo.badgeClass}`}>
                            {rarityInfo.label}
                          </span>
                          {isClubExclusive && (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 border border-amber-300 shrink-0">
                              VIP
                            </span>
                          )}
                          {!isUnlocked && priceInfo.isClubDiscount && (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                              -15% VIP
                            </span>
                          )}
                          {showSlotTag && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded-md shrink-0 flex items-center gap-0.5 border border-slate-200" title={slotMeta.label}>
                              <span>{slotMeta.icon}</span>
                              <span className="hidden xxs:inline">{slotMeta.label}</span>
                            </span>
                          )}
                        </div>

                        {isEquippedInApp ? (
                          <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Worn
                          </span>
                        ) : isPreviewedOnStage && !isConsumable ? (
                          <span className="text-[9px] font-black text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                            <Eye className="w-2.5 h-2.5" /> Tried
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[9px] font-black text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded-md shrink-0">
                            Owned
                          </span>
                        ) : null}
                      </div>

                      {/* Thumbnail Box */}
                      <div className="relative my-1 flex items-center justify-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center p-1 relative shadow-inner group-hover:scale-105 transition-transform">
                          <ItemThumbnail
                            itemId={item.id}
                            rarity={item.rarity}
                            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl"
                            saleDiscount={!isUnlocked && saleInfo.isSale ? saleInfo.discountPercent : 0}
                          />
                        </div>

                        {/* Sale Tag */}
                        {!isUnlocked && saleInfo.isSale && (
                          <span className="absolute top-0 left-0 bg-rose-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs">
                            -{saleInfo.discountPercent}%
                          </span>
                        )}

                        {/* Info Button to explicitly open detail modal */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playKeyTap();
                            setSelectedItemDetail(item);
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full shadow-2xs transition-all active:scale-90"
                          title="Item Details"
                        >
                          <Info className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Name */}
                      <div className="my-0.5">
                        <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-900 leading-tight truncate" title={item.name}>
                          {item.name}
                        </h4>
                      </div>

                      {/* Bottom Action Pill */}
                      <div className="mt-1 pt-1 border-t border-slate-100 w-full" onClick={(e) => e.stopPropagation()}>
                        {viewMode === 'closet' ? (
                          <button
                            type="button"
                            onClick={() => onToggleEquip(item.id)}
                            className={`w-full py-1 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isEquippedInApp
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {isEquippedInApp ? 'Unequip' : 'Wear'}
                          </button>
                        ) : isConsumable ? (
                          isShieldFull ? (
                            <div className="text-[10px] font-black text-slate-400 bg-slate-100 py-1 rounded-lg">
                              Full (2/2)
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBuyClick(item)}
                              className="w-full py-1 text-[11px] font-black rounded-lg btn-3d-purple active:scale-95 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>{activeCost}</span>
                              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                            </button>
                          )
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className={`w-full py-1 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isEquippedInApp
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300'
                            }`}
                          >
                            {isEquippedInApp ? 'Worn' : 'Wear'}
                          </button>
                        ) : availability.isUpcoming ? (
                          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 py-1 rounded-lg flex items-center justify-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Soon
                          </div>
                        ) : item.promoCodeRequired ? (
                          <button
                            type="button"
                            onClick={() => openPromoDialogWithCode()}
                            className="w-full py-1 text-[11px] font-black rounded-lg btn-3d-orange shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Ticket className="w-2.5 h-2.5" /> Code
                          </button>
                        ) : isRealMoney ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className="w-full py-1 text-[11px] font-black rounded-lg btn-3d-purple shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {!allowRealMoneyPurchases && <Lock className="w-2.5 h-2.5 text-purple-200" />}
                            <span>{isMember && item.clubRealMoneyPrice ? item.clubRealMoneyPrice : item.realMoneyPrice}</span>
                          </button>
                        ) : canAfford ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            className="w-full py-1 text-[11px] font-black rounded-lg btn-3d-purple active:scale-95 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>{activeCost}</span>
                            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playKeyTap();
                              setActiveHub('sparks');
                            }}
                            className="w-full py-1 text-[10px] font-black rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-0.5 cursor-pointer"
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

            {/* Mobile Slide-Up Try-On Handle Drawer (Mobile screens when try-on is active in shop mode) */}
            {hasActivePreview && viewMode === 'shop' && (
              <div className="md:hidden sticky bottom-0 left-0 right-0 z-30 pointer-events-none -mx-2 -mb-2">
                {/* Backdrop when drawer is expanded */}
                {isMobilePreviewOpen && (
                  <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 pointer-events-auto transition-opacity"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setIsMobilePreviewOpen(false);
                    }}
                  />
                )}

                <div className="relative z-30 pointer-events-auto flex flex-col items-center">
                  {/* Slide-Up / Pull-Down Drawer Container */}
                  <div className="w-full bg-white/95 backdrop-blur-md border-t-2 border-x-2 border-amber-300 rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-out">
                    {/* Pull Handle Header Bar (Always visible when items are previewed) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        soundFx.playKeyTap();
                        setIsMobilePreviewOpen((prev) => !prev);
                      }}
                      onTouchStart={(e) => {
                        dragStartYRef.current = e.touches[0].clientY;
                      }}
                      onTouchEnd={(e) => {
                        if (dragStartYRef.current !== null) {
                          const deltaY = e.changedTouches[0].clientY - dragStartYRef.current;
                          // Swipe up (negative delta) opens; swipe down (positive delta) closes
                          if (deltaY < -25) {
                            soundFx.playKeyTap();
                            setIsMobilePreviewOpen(true);
                          } else if (deltaY > 25) {
                            soundFx.playKeyTap();
                            setIsMobilePreviewOpen(false);
                          }
                          dragStartYRef.current = null;
                        }
                      }}
                      className="w-full px-3 pt-2 pb-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 flex flex-col items-center cursor-pointer select-none active:brightness-95 transition-all"
                    >
                      {/* Visual Pull Pill Indicator */}
                      <div className="w-10 h-1.5 bg-amber-800/30 rounded-full mb-1.5" />

                      <div className="w-full flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-black drop-shadow-2xs">
                          <Sparkles className="w-4 h-4 fill-amber-950 text-amber-950 shrink-0" />
                          <span>Try-On Active ({previewedItemsList.length})</span>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            {isMobilePreviewOpen ? (
                              <>Tap to close <ChevronDown className="w-3 h-3" /></>
                            ) : (
                              <>Drag or tap to preview <ChevronUp className="w-3 h-3" /></>
                            )}
                          </span>
                        </div>

                        {/* Quick Reset Button Accessible directly from the handle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetPreview();
                          }}
                          className="bg-amber-950 hover:bg-black text-amber-100 hover:text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                          title="Reset Try-On"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-300" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Drawer Content (Revealed when pulled up) */}
                    {isMobilePreviewOpen && (
                      <div className="p-3 bg-white space-y-3 animate-fade-in max-h-[55vh] overflow-y-auto">
                        {/* Mascot Stage */}
                        <div className="w-full h-40 rounded-2xl bg-gradient-to-b from-sky-100 via-white to-amber-50 border-2 border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-2">
                          <Mascot mood="happy" equipped={stageEquippedItems} className="w-36 h-36" />
                          <div className="absolute top-2 left-2">
                            <span className="bg-purple-700 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-2.5 h-2.5 fill-amber-300" /> Live Look
                            </span>
                          </div>
                        </div>

                        {/* Previewed Items Chips & Actions */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                            Items in Preview:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {previewedItemsList.map((item) => {
                              const isOwned = unlockedItems.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                                >
                                  <span className="truncate max-w-[130px]">{item.name}</span>
                                  {isOwned ? (
                                    <span className="text-[10px] text-emerald-600 font-extrabold">(Owned)</span>
                                  ) : (
                                    <span className="text-[10px] text-amber-600 font-black">{item.cost ? `${item.cost}⚡` : item.realMoneyPrice}</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleClearSlot(item.previewSlot)}
                                    className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full"
                                    title="Remove from preview"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsMobilePreviewOpen(false)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                          >
                            <span>Done Previewing</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 6. BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE TRY-ON BOTTOM SHEET / DETAILS MODAL (MOBILE ONLY) */}
      {/* ========================================================================= */}
      {selectedItemDetail && (
        <div
          onClick={() => setSelectedItemDetail(null)}
          className="md:hidden fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 safe-pb animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-4 sm:p-5 w-full max-w-sm shadow-2xl space-y-3.5 animate-scale-in relative text-slate-800 cursor-default max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title + Category Slot + Close */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).badgeClass}`}>
                  {(RARITY_TIERS[selectedItemDetail.rarity] || RARITY_TIERS.common).label}
                </span>
                {(() => {
                  const detailSlot = getItemSlot(selectedItemDetail);
                  const slotObj = COSMETIC_SLOTS.find((s) => s.id === detailSlot);
                  return slotObj && slotObj.id !== 'all' ? (
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{slotObj.icon}</span>
                      <span>{slotObj.label}</span>
                    </span>
                  ) : null;
                })()}
                <h3 className="text-sm font-black text-slate-900 truncate max-w-[160px]">{selectedItemDetail.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setSelectedItemDetail(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Try-On Box (Shows Kibo wearing this item!) */}
            {!selectedItemDetail.isConsumable ? (
              <div className="w-full h-32 rounded-2xl bg-gradient-to-b from-sky-100 via-white to-amber-50 border-2 border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-1">
                <Mascot mood="happy" equipped={tryOnEquippedItems} className="w-28 h-28" />
                <span className="absolute bottom-1.5 right-2 bg-purple-700 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 fill-amber-300" /> Live Try-On
                </span>
              </div>
            ) : (
              <div className="w-full h-28 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-orange-50 border-2 border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-2">
                <ItemThumbnail itemId={selectedItemDetail.id} rarity={selectedItemDetail.rarity} className="w-16 h-16" />
              </div>
            )}

            {/* Description & Lore */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left space-y-1">
              {(() => {
                const detailSlot = getItemSlot(selectedItemDetail);
                const replacedItem = stageEquippedItems
                  .map((id) => getItemById(id))
                  .find((it) => it && it.id !== selectedItemDetail.id && getItemSlot(it) === detailSlot);
                return replacedItem ? (
                  <div className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 mb-1">
                    <span>🔄</span>
                    <span>Replaces currently worn <strong>{replacedItem.name}</strong></span>
                  </div>
                ) : null;
              })()}
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {selectedItemDetail.description}
              </p>
              {selectedItemDetail.subjectLabel && (
                <span className="inline-block text-[9px] font-black text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.2 rounded-md">
                  {selectedItemDetail.subjectLabel}
                </span>
              )}
            </div>

              {/* Action Buttons */}
            <div className="space-y-2 pt-1">
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
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'btn-3d-orange'
                    }`}
                  >
                    {equippedItems.includes(selectedItemDetail.id) ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Equipped on Kibo
                      </>
                    ) : (
                      'Wear This Item'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      setItemToSell(selectedItemDetail);
                    }}
                    className="py-2.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Sell ({getItemSellBackPrice(selectedItemDetail, isMember)}⚡)
                  </button>
                </div>
              ) : selectedItemDetail.isConsumable ? (
                <button
                  type="button"
                  onClick={() => {
                    handleBuyClick(selectedItemDetail);
                    setSelectedItemDetail(null);
                  }}
                  className="w-full py-2.5 text-xs font-black rounded-xl btn-3d-purple flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Buy for</span>
                  <span className="text-amber-300 font-black">
                    {getItemEffectivePrice(selectedItemDetail, currentDate, isMember).cost}⚡
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleBuyClick(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="w-full py-2.5 text-xs font-black rounded-xl btn-3d-purple flex items-center justify-center gap-1 cursor-pointer shadow-md active:scale-95"
                  >
                    {selectedItemDetail.requiresKiboClub && !isMember ? (
                      <span className="flex items-center justify-center gap-1">
                        <span>Join Club to Unlock</span>
                        <span className="text-amber-300 font-black">({selectedItemDetail.cost}⚡)</span>
                      </span>
                    ) : selectedItemDetail.realMoneyPrice ? (
                      <span className="flex items-center justify-center gap-1">
                        <span>Buy for</span>
                        <span className="text-amber-300 font-black">
                          {isMember && selectedItemDetail.clubRealMoneyPrice ? selectedItemDetail.clubRealMoneyPrice : selectedItemDetail.realMoneyPrice}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <span>Buy & Wear for</span>
                        <span className="text-amber-300 font-black">
                          {getItemEffectivePrice(selectedItemDetail, currentDate, isMember).cost}⚡
                        </span>
                        {getItemEffectivePrice(selectedItemDetail, currentDate, isMember).isClubDiscount && (
                          <span className="text-[10px] text-amber-200 line-through">
                            ({getItemEffectivePrice(selectedItemDetail, currentDate, isMember).originalCost}⚡)
                          </span>
                        )}
                      </span>
                    )}
                  </button>

                  {!selectedItemDetail.isConsumable && (stageEquippedItems.includes(selectedItemDetail.id) || (selectedItemDetail.bundleItems && selectedItemDetail.bundleItems.some((id) => stageEquippedItems.includes(id)))) && (
                    <button
                      type="button"
                      onClick={() => {
                        handlePreviewToggle(selectedItemDetail);
                        setSelectedItemDetail(null);
                      }}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Remove from Try-On
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROMO CODE REDEMPTION MODAL */}
      {/* ========================================================================= */}
      {showPromoModal && (
        <div
          onClick={() => setShowPromoModal(false)}
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-4 sm:p-5 w-full max-w-sm shadow-2xl space-y-3 animate-scale-in relative text-slate-800 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Redeem Promo Code</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Unlock exclusive gear & bonus Sparks!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setShowPromoModal(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRedeemPromo();
                  }}
                  placeholder="ENTER CODE"
                  className="flex-1 w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono font-bold text-xs tracking-wider uppercase text-slate-800 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all shadow-inner"
                />
              </div>

              {promoFeedback && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold space-y-1 text-left ${
                    promoFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black">
                    {promoFeedback.type === 'success' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                    )}
                    <span>{promoFeedback.message}</span>
                  </div>

                  {promoFeedback.reward && (
                    <div className="pt-1 border-t border-emerald-200/60 flex items-center gap-1.5 flex-wrap text-[11px]">
                      {promoFeedback.reward.sparks > 0 && (
                        <span className="bg-amber-100 text-amber-950 font-black px-1.5 py-0.2 rounded border border-amber-300">
                          ⚡ +{promoFeedback.reward.sparks} Sparks
                        </span>
                      )}
                      {promoFeedback.reward.newlyUnlockedItems?.map((id) => {
                        const item = getItemById(id);
                        return item ? (
                          <span key={id} className="bg-purple-100 text-purple-950 font-black px-1.5 py-0.2 rounded border border-purple-300">
                            🎁 {item.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={isRedeeming || !promoInput.trim()}
                onClick={() => handleRedeemPromo()}
                className="w-full py-2.5 btn-3d-orange text-xs font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1 shadow-md"
              >
                {isRedeeming ? '...' : 'Redeem Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ITEM SELL CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {itemToSell && (
        <div
          onClick={() => setItemToSell(null)}
          className="fixed inset-0 z-[105] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            className="bg-white rounded-3xl border-3 border-amber-300 p-4 sm:p-5 w-full max-w-xs shadow-2xl space-y-3 animate-scale-in text-center relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-200">
              <Zap className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">Sell Item</h3>
              <p className="text-xs font-bold text-slate-500 leading-tight">
                Are you sure you want to sell <strong className="text-slate-800">{itemToSell.name}</strong> for{' '}
                <span className="text-amber-500 font-black">{getItemSellBackPrice(itemToSell, isMember)}⚡</span>?
              </p>
              {isMember && (
                <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  VIP 65% Sell-Back Rate
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  setItemToSell(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSellConfirm}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FAMILY PLAN UPGRADE MODAL */}
      <FamilyPlanUpgradeModal
        isOpen={showFamilyPlanModal}
        onClose={() => setShowFamilyPlanModal(false)}
        onOpenParentZone={onOpenParentZone}
      />
    </div>
  );
}
