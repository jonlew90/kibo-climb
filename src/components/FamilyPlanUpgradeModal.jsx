import React from 'react';
import { X, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function FamilyPlanUpgradeModal({
  isOpen,
  onClose,
  onOpenParentZone
}) {
  if (!isOpen) return null;

  const hasSinglePlan = storageService.hasSinglePlan();
  const hasFamilyPlan = storageService.hasFamilyPlan();

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
            {hasSinglePlan ? 'Upgrade to Family Plan' : hasFamilyPlan ? 'Kibo Club Family Plan' : 'Join Kibo Club'}
          </h3>
          <span className="text-xs font-black text-amber-950 bg-amber-200/90 px-3 py-0.5 rounded-full mt-1.5 inline-block">
            {hasSinglePlan ? '$7.99/mo (Upgrade from $4.99)' : 'Starting at $4.99/mo'}
          </span>
        </div>
        <div className="p-5 text-center bg-amber-50/50 space-y-3">
          <p className="text-slate-600 font-bold text-xs leading-snug">
            {hasSinglePlan
              ? 'Upgrade to the Family Plan in the Parent Zone to add up to 6 profiles and share premium benefits with all siblings!'
              : 'Unlock 1.25x Sparks on all climbs, up to 6 child profiles, and exclusive golden username tags in the Parent Zone!'}
          </p>

          <div className="bg-white border-2 border-amber-100 rounded-xl p-3 text-left shadow-sm">
            <ul className="space-y-2 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Up to 6 child profiles & individual progress</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1.25x Spark multiplier for all climbs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exclusive golden username tags</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Parent-verified billing & controls</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenParentZone) {
                  onOpenParentZone('verification', 'family_plan');
                }
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-black rounded-xl shadow-md transform transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Manage & Choose Plan in Parent Zone</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-bold mt-1">
            Subscriptions are purchased and managed securely inside the Parent Zone.
          </p>
        </div>
      </div>
    </div>
  );
}
