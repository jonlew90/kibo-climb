import React from 'react';
import { X, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function FamilyPlanUpgradeModal({ isOpen, onClose, onOpenParentZone }) {
  if (!isOpen) return null;

  const hasSinglePlan = storageService.hasSinglePlan();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border-4 border-amber-200 animate-pop cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <Sparkles className="w-8 h-8 text-white fill-white" />
          </div>
          <h3 className="text-xl font-black text-white drop-shadow-sm leading-tight">
            {hasSinglePlan ? 'Upgrade to Family Plan' : 'Unlock Family Plan'}
          </h3>
        </div>
        <div className="p-5 text-center bg-amber-50/50">
          <p className="text-slate-600 font-bold text-sm mb-4">
            {hasSinglePlan
              ? 'Upgrade to the Family Plan to add up to 6 profiles and share premium benefits with all siblings!'
              : 'Get the Kibo Club Family Plan to add multiple profiles and unlock 1.25x Sparks and Golden Tags for everyone!'}
          </p>

          <div className="bg-white border-2 border-amber-100 rounded-xl p-3 mb-5 text-left shadow-sm">
            <ul className="space-y-2 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Up to 6 child profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1.25x Spark multiplier for all profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exclusive golden name tags</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenParentZone) {
                onOpenParentZone();
              }
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-black rounded-xl shadow-md transform transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            Go to Parent Zone
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-slate-400 font-bold mt-3">
            Manage subscriptions via the Parent Zone.
          </p>
        </div>
      </div>
    </div>
  );
}
