import React from 'react';
import { Zap, ShoppingBag, Check, Lock, X, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import { SHOP_ITEMS } from '../utils/itemsCatalog';
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
  if (!isOpen) return null;

  const handleBuy = (item) => {
    if (sparks >= item.cost) {
      soundFx.playVictory();
      onBuyItem(item);
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleToggle = (itemId) => {
    soundFx.playKeyTap();
    onToggleEquip(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-lg bg-white border-4 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-kibo-orange stroke-[2.5]" />
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Kibo's Workshop
            </h2>
          </div>

          {/* Spark Balance Badge */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-full shadow-inner">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400 stroke-[2.5] animate-pulse" />
            <span className="font-black text-amber-900 text-lg">{sparks}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            aria-label="Close workshop"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl my-3 p-3 flex items-center justify-around shadow-sm">
          <Mascot mood="happy" equipped={equippedItems} className="w-24 h-24 sm:w-28 sm:h-28" />
          <div className="text-left space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Fitting Room</span>
            <h3 className="text-base font-extrabold text-slate-800">Customize Kibo!</h3>
            <p className="text-xs text-slate-500 font-medium">Buy items with Sparks ⚡ & equip them!</p>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 my-1">
          {SHOP_ITEMS.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isEquipped = equippedItems.includes(item.id);
            const canAfford = sparks >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isEquipped
                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                    : isUnlocked
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-200 opacity-90'
                }`}
              >
                {/* Item Icon & Description */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl p-2 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base sm:text-lg leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Action Area (Buy / Equip / Unequip) */}
                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`px-4 py-2 text-sm font-extrabold rounded-xl border-b-4 transition-all active:translate-y-0.5 active:border-b-0 flex items-center gap-1.5 ${
                        isEquipped
                          ? 'bg-emerald-500 text-white border-emerald-700 shadow-sm'
                          : 'bg-kibo-teal text-white border-kibo-teal-dark shadow-sm'
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
                      className={`px-4 py-2 text-sm font-extrabold rounded-xl border-b-4 transition-all active:translate-y-0.5 active:border-b-0 flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-kibo-orange text-white border-kibo-orange-dark shadow-bouncy-orange'
                          : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Sparkles className="w-4 h-4" /> {item.cost} ⚡
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> {item.cost} ⚡
                        </>
                      )}
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
          className="btn-3d-teal w-full py-3 mt-3 text-lg rounded-2xl flex items-center justify-center gap-2"
        >
          Back to Math
        </button>
      </div>
    </div>
  );
}
