import React from 'react';
import { FileText, ArrowLeft, Shield, Sparkles, BookOpen, AlertCircle, Mail, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function TermsOfServiceScreen({ onBack, renderFooter }) {
  const handleBack = () => {
    soundFx.playKeyTap();
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/settings');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
      {/* STICKY TOP HEADER BAR */}
      <header className="bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-amber-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Terms of Service</h2>
          </div>
        </div>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
          v1.0 Agreement
        </span>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* HERO CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 shrink-0">
              <BookOpen className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Terms & Conditions of Use</h1>
              <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                Welcome to Kibo Climb. By creating an account, practicing on our application, or accessing our services, you agree to these Terms of Service.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-400">
                Effective Date: August 28, 2026
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: ACCEPTANCE OF TERMS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">1. Acceptance & Parent Responsibility</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Kibo Climb is designed for children and families. If a user is under 18 years old, a parent or legal guardian must review and accept these terms on behalf of the child before establishing an account or subscribing to premium features. Our collection and handling of educational data is governed by our COPPA Privacy Policy, which is incorporated into these Terms.
          </p>
        </section>

        {/* SECTION 2: DESCRIPTION OF SERVICE */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-teal-700">
            <Shield className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">2. Educational Service & Gameplay</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Kibo Climb provides adaptive learning exercises, progress tracking, and gamified climbing incentives. While we strive to maintain 99.9% uptime and continuous difficulty balancing, service availability may occasionally be affected by maintenance or software updates.
          </p>
        </section>

        {/* SECTION 3: VIRTUAL ITEMS & CURRENCY */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">3. Virtual Currency, Items, Subscriptions & Cancellation</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600 font-medium leading-relaxed">
            <p>
              In-game currencies ("Sparks"), mascot accessories, badges, and avatars earned during climbs are virtual items:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
              <li>Virtual items hold no real-world monetary value and cannot be exchanged or redeemed for cash.</li>
              <li>Sparks earned through practice sessions are educational incentives designed to celebrate effort.</li>
              <li>Subscriptions (Kibo Club Solo and Family plans) and in-app purchases may only be authorized and purchased by an adult parent or legal guardian through the Parent Zone.</li>
              <li>We reserve the right to adjust virtual item balances in the event of software glitches or cheat prevention.</li>
            </ul>

            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Cancellation & Refund Policy ("Cancel at Period End")</h4>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
                <li>
                  <strong>Cancellation Takes Effect at Period End:</strong> Subscriptions automatically renew at the end of each billing cycle unless canceled prior to the renewal date. When you cancel a subscription, your cancellation takes effect at the conclusion of the current paid billing period ("cancel at period end"). You retain full access to all Kibo Club benefits and multipliers until that date.
                </li>
                <li>
                  <strong>No Prorated Refunds:</strong> Membership payments are non-refundable. We do not provide prorated cash refunds, store credits, or reimbursements for unused days or partial subscription cycles upon cancellation.
                </li>
                <li>
                  <strong>Digital Goods Are Final & Non-Returnable:</strong> All purchases of real-money bundles, cosmetic items, avatar equipment, and virtual currency—including any items acquired at VIP/Club member discount rates—are digital content delivered immediately upon purchase. All such purchases are final, non-returnable, and non-refundable.
                </li>
                <li>
                  <strong>Anti-Arbitrage & Billing Abuse:</strong> Creating or activating a subscription solely to obtain discounted real-money items followed by initiating payment disputes, fraudulent chargebacks, or refund requests violates these Terms. Accounts engaging in billing arbitrage will be flagged for review, subject to revocation of discounted goods, and may face permanent suspension.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: CODE OF CONDUCT */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">4. Acceptable Use, Fair Play & Child Privacy</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Users agree not to exploit bugs, use automated bots or scripts to auto-answer practice problems, attempt unauthorized access to servers, or tamper with app local storage data.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            <strong>Climber Handles & Privacy:</strong> To protect child privacy under COPPA, users agree not to input full real names, phone numbers, email addresses, or personal identifying details as climber tags or profile handles. Automated filters are used to screen handles, and we encourage players to use randomized safe tags.
          </p>
        </section>

        {/* SECTION 5: INTELLECTUAL PROPERTY */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-700">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">5. Intellectual Property</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            All original graphics, character designs (including Kibo the mascot), logos, audio assets, and software code are protected by intellectual property laws and remain the exclusive property of Kibo Climb.
          </p>
        </section>

        {/* SECTION 6: CONTACT INFORMATION */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">6. Questions & Contact</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            If you have questions about these Terms of Service, please contact our support team:
          </p>
          <a
            href="mailto:support@kiboclimb.com?subject=Kibo%20Climb%20Terms%20Inquiry"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-extrabold text-sm transition-colors"
          >
            <Mail className="w-4 h-4 stroke-[2.5]" />
            support@kiboclimb.com
          </a>
        </section>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
