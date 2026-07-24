import React, { useState } from 'react';
import { ShoppingBag, Zap, Check, Lock, Sparkles, X } from 'lucide-react';
import Mascot from './Mascot';
import { ITEM_CATEGORIES, WORKSHOP_ITEMS, RARITY_TIERS, getItemsByCategory } from '../utils/itemsCatalog';
import { soundFx } from '../utils/audio';

export default function WorkshopModal({
  isOpen,
  onClose,
  sparks,
  unlockedItems,
  equippedItems,
  onBuyItem,
  onToggleEquip
}) {
  const [activeCategory, setActiveCategory] = useState('headwear');

  if (!isOpen) return null;

  const currentCategoryItems = getItemsByCategory(activeCategory);

  const handleCategorySelect = (catId) => {
    soundFx.playKeyTap();
    setActiveCategory(catId);
  };

  const handleBuy = (item) => {
    if (sparks >= item.cost) {
      soundFx.playVictory();
      onBuyItem(item);
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleEquipToggle = (itemId) => {
    soundFx.playKeyTap();
    onToggleEquip(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl p-4 sm:p-5 text-slate-800 shadow-2xl space-y-4 max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Kibo's Workshop</h2>
              <p className="text-xs text-slate-500 font-semibold">Unlock accessories with Sparks!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Spark Balance Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-amber-900 font-extrabold text-sm shadow-sm">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400 stroke-[2.5]" />
              <span>{sparks}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Live Mascot Preview Header */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 flex items-center justify-around shrink-0 shadow-inner">
          <Mascot mood="happy" equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />
          <div className="text-left space-y-1 max-w-[180px]">
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
              Live Preview
            </span>
            <h4 className="font-black text-slate-800 text-sm">Equipped Items</h4>
            <p className="text-xs text-slate-500 font-medium">
              {equippedItems.length > 0
                ? `${equippedItems.length} active accessory layer${equippedItems.length > 1 ? 's' : ''}`
                : 'No items equipped yet'}
            </p>
          </div>
        </div>

        {/* 4 Category Tabs */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`py-2 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-md border-2 border-amber-300 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {currentCategoryItems.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isEquipped = equippedItems.includes(item.id);
            const canAfford = sparks >= item.cost;
            const rarityInfo = RARITY_TIERS[item.rarity] || RARITY_TIERS.common;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isEquipped
                    ? 'bg-amber-50/80 border-amber-400 shadow-md'
                    : isUnlocked
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-90'
                }`}
              >
                {/* Item Details */}
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">{item.name}</h4>
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${rarityInfo.badgeClass}`}>
                      {rarityInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{item.description}</p>
                </div>

                {/* Buy / Equip Button */}
                <div className="shrink-0">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleEquipToggle(item.id)}
                      className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                        isEquipped
                          ? 'btn-3d-orange'
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border-2 border-teal-300'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> Equipped
                        </>
                      ) : (
                        'Equip'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'btn-3d-purple'
                          : 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {item.cost} Sparks
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="btn-3d-teal w-full py-3 text-sm rounded-2xl shrink-0"
        >
          Done Customizing
        </button>
      </div>
    </div>
  );
}
