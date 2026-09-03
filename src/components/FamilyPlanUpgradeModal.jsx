import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ChevronRight, ShieldCheck, Users } from 'lucide-react';
import { storageService } from '../services/storageService';
import { getActiveRealMoneySaleEvent, getEffectiveSubscriptionPricing } from '../utils/itemsCatalog';

export default function FamilyPlanUpgradeModal({
  isOpen,
  onClose,
  onOpenParentZone
}) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  if (!isOpen) return null;

  const hasSinglePlan = storageService.hasSinglePlan();
  const hasFamilyPlan = storageService.hasFamilyPlan();

  const activeRealMoneySale = getActiveRealMoneySaleEvent(new Date());
  const soloPricing = getEffectiveSubscriptionPricing(
    billingCycle === 'annual' ? 'kibo_club_sub_annual' : 'kibo_club_sub',
    new Date()
  );
  const familyPricing = getEffectiveSubscriptionPricing(
    billingCycle === 'annual' ? 'kibo_club_family_annual' : 'kibo_club_family',
    new Date()
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border-4 border-amber-200 animate-pop cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <Sparkles className="w-7 h-7 text-white fill-white" />
          </div>
          <h3 className="text-xl font-black text-white drop-shadow-sm leading-tight">
            {hasSinglePlan ? 'Upgrade to Family Plan' : hasFamilyPlan ? 'Kibo Club Family Plan' : 'Join Kibo Club'}
          </h3>
          <p className="text-xs text-amber-100 font-bold mt-0.5">
            Supercharge learning with 1.25x Sparks & Golden Tags
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-3 bg-amber-950/30 p-1 rounded-xl flex items-center justify-center gap-1 border border-amber-200/40 mx-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'annual'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full uppercase font-black tracking-wide">
                {familyPricing.isDiscounted ? `Save ${familyPricing.discountPercent + 30}%` : 'Save ~35%'}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 text-center bg-amber-50/40 space-y-3">
          {/* Active Subscription Sale Event Banner */}
          {activeRealMoneySale && (
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 text-white p-2.5 rounded-xl shadow-xs text-left space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
                  <span>{activeRealMoneySale.name} Active</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
                  Special Offer
                </span>
              </div>
              <p className="text-[10px] text-purple-100 font-medium leading-relaxed">
                {activeRealMoneySale.description}
              </p>
            </div>
          )}

          {/* Plan Comparison Summary */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-700 block">Solo</span>
                {soloPricing.isDiscounted && (
                  <span className="text-[8px] font-black uppercase text-purple-700 bg-purple-100 px-1 rounded">
                    -{soloPricing.discountPercent}%
                  </span>
                )}
              </div>
              <div className="text-sm font-black text-slate-900 leading-none">
                {soloPricing.isDiscounted && (
                  <span className="text-[10px] text-slate-400 line-through font-bold block mb-0.5">
                    {soloPricing.originalPrice}
                  </span>
                )}
                {soloPricing.price}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                {billingCycle === 'annual' ? `(${soloPricing.monthlyEquivalent} • 1 Profile)` : '1 Child Profile'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase text-amber-800 truncate">Family</span>
                <span className="text-[8px] font-black uppercase text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                  {familyPricing.isDiscounted ? `-${familyPricing.discountPercent}% Sale` : 'Best Value'}
                </span>
              </div>
              <div className="text-sm font-black text-amber-950 leading-none">
                {familyPricing.isDiscounted && (
                  <span className="text-[10px] text-amber-700/60 line-through font-bold block mb-0.5">
                    {familyPricing.originalPrice}
                  </span>
                )}
                {familyPricing.price}
              </div>
              <span className="text-[10px] text-amber-800 font-medium block">
                {billingCycle === 'annual' ? `(${familyPricing.monthlyEquivalent} • Up to 6)` : 'Up to 6 Sibling Profiles'}
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-100 rounded-xl p-3 text-left shadow-2xs space-y-2">
            <div className="text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />
              <span>Everything in Solo, plus:</span>
            </div>
            <ul className="space-y-1.5 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Up to 6 sibling climber profiles</strong> (vs 1 on Solo)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1.25x Sparks & 15% VIP discounts for <strong>every child</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Deeper 20% discount</strong> on Spark top-up packs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Daily Vault 3.3x bonus Sparks & shields for all</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Golden profile tags & summit-exclusive gear</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unified multi-child parent reports 📊</span>
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
