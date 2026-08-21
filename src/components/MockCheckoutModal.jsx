import React from "react";
import { Zap, X, CheckCircle2 } from "lucide-react";
import ItemThumbnail from "./ItemThumbnail";

export default function MockCheckoutModal({ isOpen, onClose, packageInfo, onConfirm }) {
  if (!isOpen || !packageInfo) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-slate-200 rounded-3xl p-5 text-center shadow-2xl relative max-h-[85vh] overflow-y-auto cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <ItemThumbnail
          itemId={packageInfo.id}
          rarity={packageInfo.rarity || 'legendary'}
          className="w-16 h-16 mx-auto mb-4 shadow-md"
        />

        <h3 className="text-xl font-extrabold text-slate-800 mb-1">Confirm Purchase</h3>
        <p className="text-sm text-slate-500 font-medium mb-4">
          Do you want to buy the <strong>{packageInfo.name}</strong> for <strong>{packageInfo.price}</strong>?
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Item</span>
            <span className="block text-sm font-black text-slate-800">{packageInfo.name}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Price</span>
            <span className="block text-sm font-black text-slate-800">{packageInfo.price}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm(packageInfo)}
            className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Pay {packageInfo.price}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 font-extrabold text-sm hover:text-slate-800"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4 px-4 leading-tight font-medium">
          This is a simulated in-app purchase. No real money will be charged.
        </p>
      </div>
    </div>
  );
}
