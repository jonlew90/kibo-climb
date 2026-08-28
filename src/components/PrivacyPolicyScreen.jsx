import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, HeartHandshake, EyeOff, Server, Mail, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function PrivacyPolicyScreen({ onBack, renderFooter }) {
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
            <ShieldCheck className="w-5 h-5 text-teal-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Privacy Policy</h2>
          </div>
        </div>
        <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
          COPPA Safe
        </span>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* HERO CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl border border-teal-200 shrink-0">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Child's Privacy Comes First</h1>
              <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                Kibo Climb is committed to protecting the privacy of children under 13. We strictly adhere to the Children's Online Privacy Protection Act (COPPA). We do not sell personal data, display third-party advertisements, or track children across third-party apps.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-400">
                Last Updated: August 28, 2026
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: COPPA PRIVACY NOTICE */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-teal-700">
            <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">1. Direct COPPA Notice to Parents</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Under COPPA (16 CFR Part 312), online services directed to children under 13 must provide direct notice to parents and obtain verifiable parental consent before collecting personal information.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 font-medium pl-1">
            <li><strong className="text-slate-800">Zero Behavioral Advertising:</strong> We never serve targeted or third-party ads to children.</li>
            <li><strong className="text-slate-800">No Open Social Interaction:</strong> Children cannot send direct messages, share live chat, or upload multimedia to strangers.</li>
            <li><strong className="text-slate-800">Protected Adult Gates:</strong> All account settings, subscription purchases, and data controls require parent verification via biometric authentication, a custom Parent PIN, or dynamic adult knowledge challenges.</li>
          </ul>
        </section>

        {/* SECTION 2: INFORMATION WE COLLECT FROM CHILDREN */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <EyeOff className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">2. Information Collected From Children Under 13</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>
              In accordance with COPPA's data minimization mandate, we aim to collect only minimal data strictly necessary for participation in educational learning climbs:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">What We Collect</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong className="text-slate-700">Kid-Safe Pseudonym / Handle:</strong> Screen nicknames (e.g. "CosmicOtter42") generated or chosen by the user. We implement automated filtering designed to screen out emails, phone numbers, and common real name patterns, and we strongly encourage players and parents to use randomized climber tags.</li>
                <li><strong className="text-slate-700">Academic Learning Telemetry:</strong> Questions answered, accuracy, response speeds, streak lengths, mastery tiers, and unlocked badges.</li>
                <li><strong className="text-slate-700">Gameplay Preferences:</strong> Audio toggle states, avatar customization, and local app preferences.</li>
                <li><strong className="text-slate-700">Technical Device Identifiers:</strong> Anonymous device tokens used solely for session persistence, offline caching, and crash diagnostics with PII redacted.</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-amber-900">
              <h4 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider">Information We Ask You Not to Provide</h4>
              <p className="text-xs font-medium leading-relaxed">
                Kibo Climb is designed to operate without collecting personal identifying information from children. We ask that children and parents never submit full real names, postal addresses, phone numbers, precise location data, photos, or voice recordings. If you discover that your child has submitted personal details, please contact us immediately at hello@kiboclimb.com so we can remove it.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW DATA IS USED */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Server className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">3. How Information Is Used</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Collected learning data is used exclusively to support internal educational operations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 font-medium pl-1">
            <li>Calibrating problem difficulty dynamically so exercises remain engaging and appropriately leveled.</li>
            <li>Generating parental mastery reports and progress charts inside the secure Parent Dashboard.</li>
            <li>Enabling offline practice caching and synchronization across devices when a parent links an account.</li>
          </ul>
        </section>

        {/* SECTION 4: THIRD-PARTY DISCLOSURES */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-purple-700">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">4. Third-Party Disclosures & Non-Sale of Data</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            <strong>We do not sell, rent, or trade personal information of children under 13.</strong> We do not disclose personal information to third parties for advertising or commercial marketing purposes.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Data is shared only with trusted infrastructure service providers who act strictly as processors under contractual obligations:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 font-medium pl-1">
            <li><strong className="text-slate-700">Google Cloud / Firebase:</strong> Secure cloud storage, data persistence, and authentication infrastructure with end-to-end encryption in transit and at rest.</li>
            <li><strong className="text-slate-700">Stripe:</strong> Payment processing for parent subscription billing. Child users cannot access or initiate payment flows.</li>
          </ul>
        </section>

        {/* SECTION 5: VERIFIABLE PARENTAL CONSENT & PARENT RIGHTS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">5. Verifiable Parental Consent, Review & Deletion</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Under COPPA, parents have full legal rights regarding their child's collected information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 font-medium pl-1">
            <li><strong className="text-slate-800">Verifiable Consent (VPC):</strong> We obtain verifiable consent before collecting child data via adult knowledge-based challenge verification or Parent PIN setup during onboarding.</li>
            <li><strong className="text-slate-800">Review Collected Data:</strong> Parents can review all practice data, streaks, and profile details inside the Parent Dashboard or export complete records via the "Export Data (JSON)" feature.</li>
            <li><strong className="text-slate-800">Revoke Consent:</strong> Parents can revoke consent at any time in the Parent Dashboard. Revoking consent halts cloud syncing and purges remote child records.</li>
            <li><strong className="text-slate-800">Permanent Deletion:</strong> Parents can permanently delete child profiles or execute full account wipe via the Parent Dashboard.</li>
          </ul>
        </section>

        {/* SECTION 6: CONTACT INFORMATION */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">6. Contact Information</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            If you have questions regarding this COPPA Privacy Policy, our data practices, or wish to submit a data request:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-700 space-y-1">
            <p><strong>App:</strong> Kibo Climb</p>
            <p><strong>Support & Privacy Inquiries:</strong> hello@kiboclimb.com</p>
          </div>
          <a
            href="mailto:hello@kiboclimb.com?subject=COPPA%20Child%20Privacy%20Inquiry"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-extrabold text-sm transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 stroke-[2.5]" />
            Contact Support & Privacy (hello@kiboclimb.com)
          </a>
        </section>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
