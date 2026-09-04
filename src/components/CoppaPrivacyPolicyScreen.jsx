import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, HeartHandshake, EyeOff, Server, Mail, UserCheck, ExternalLink } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function CoppaPrivacyPolicyScreen({ onBack, onNavigatePrivacy, renderFooter }) {
  const handleBack = () => {
    soundFx.playKeyTap();
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/settings');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleGoToGeneralPrivacy = (e) => {
    e.preventDefault();
    soundFx.playKeyTap();
    if (onNavigatePrivacy) {
      onNavigatePrivacy();
    } else {
      window.history.pushState({}, '', '/privacy');
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
            <h2 className="text-base sm:text-lg font-black tracking-tight">COPPA & Children's Privacy</h2>
          </div>
        </div>
        <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
          16 CFR § 312.4
        </span>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* CROSS-LINK NOTICE */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-900">
          <div className="text-xs sm:text-sm font-medium">
            <strong>Looking for our General Website Privacy Policy?</strong> This page focuses exclusively on child data protections under COPPA.
          </div>
          <button
            type="button"
            onClick={handleGoToGeneralPrivacy}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-black text-teal-800 bg-white border border-teal-300 hover:bg-teal-100/60 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>General Privacy Policy</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* HERO CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl border border-teal-200 shrink-0">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Children's Online Privacy Protection Act (COPPA) Notice
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                This page specifically satisfies the FTC COPPA Rule (16 CFR § 312.4). It focuses entirely on players under the age of 13 and parental rights.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-400">
                Last Updated: August 28, 2026
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: OPERATOR IDENTIFICATION & CONTACT INFO */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-teal-700">
            <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">1. Operator Identification & Contact Info</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Kibo Climb is operated by the following legal entity:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-1.5">
            <p><strong>Legal Entity Name:</strong> Kibo Climb LLC</p>
            <p><strong>Physical Mailing Address:</strong> 906 W McDermott Dr, Suite 116, PMB 345, Allen, TX 75013</p>
            <p><strong>Parent Privacy Email:</strong> <a href="mailto:privacy@kiboclimb.com" className="text-teal-700 underline font-bold">privacy@kiboclimb.com</a></p>
            <p><strong>Parent Privacy Phone Line:</strong> <a href="tel:8624385426" className="text-teal-700 underline font-bold">(862) GET-KIBO</a> <span className="text-slate-500 font-normal">((862) 438-5426)</span></p>
            <p><strong>Designated Parent Privacy Inquiries:</strong> privacy@kiboclimb.com (Attention: Child Privacy Officer)</p>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Parents may contact our designated privacy team at any time using the postal address or email above regarding inquiries about child data collection, practices, or deletion.
          </p>
        </section>

        {/* SECTION 2: CHILD DATA PRACTICES DURING GUEST PLAY */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <EyeOff className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">2. Child Data Practices During Guest Play</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>
              We believe children should be able to practice and learn without surrendering personal data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 font-medium pl-1">
              <li><strong className="text-slate-900">No Account or Identifiers Needed:</strong> Guests can play without providing an email, real name, phone number, or creating an account.</li>
              <li><strong className="text-slate-900">Strictly Local Device Storage:</strong> Guest gameplay progress (stars, sparks, cosmetic gear, and learning levels) is stored strictly on the local device in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono">localStorage</code> and never on central servers.</li>
              <li><strong className="text-slate-900">No Server Footprint:</strong> In guest mode, no learner records or telemetry profiles are created or maintained on cloud infrastructure.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 3: CHILD DATA PRACTICES FOR LINKED ACCOUNTS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">3. Child Data Practices for Linked Accounts</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>
              When an account is created to sync progress across devices or unlock parent reporting, only the following specific items are stored:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">What We Store</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li><strong className="text-slate-900">Parent Email Address:</strong> Used for parental authentication, account recovery, and direct parental notices.</li>
                <li><strong className="text-slate-900">Child's Anonymous Climber Handle:</strong> A randomized or kid-safe nickname (e.g., "CosmicOtter42"). Filter algorithms screen against real names, phone numbers, and email patterns.</li>
                <li><strong className="text-slate-900">Grade Band:</strong> Educational level (e.g., Grade 1, Grade 2, Grade 3+) to calibrate age-appropriate academic questions.</li>
                <li><strong className="text-slate-900">Game Performance Stats:</strong> Questions answered, academic accuracy, unlocked badges, and summit level progress.</li>
              </ul>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
              <p className="text-xs font-bold leading-relaxed">
                🛡️ <strong>Absolute Prohibition:</strong> Real names, phone numbers, and physical addresses are <u>never</u> collected from children.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: SOCIAL & SAFETY PROTECTIONS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Lock className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">4. Social & Safety Protections</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Kibo Climb is designed from the foundation as an unexploitable educational space:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 font-medium pl-1">
            <li><strong className="text-slate-900">Zero Chat or Direct Messaging:</strong> The platform contains zero chat, private direct messaging, or communication boards. Children cannot contact or be contacted by strangers.</li>
            <li><strong className="text-slate-900">Masked Climber Usernames:</strong> Climber usernames are masked from non-friends. There is no open public search or profile browsing.</li>
            <li><strong className="text-slate-900">Mutual Friending Only:</strong> Friending is strictly mutual via direct Climber Code or physical QR code exchange.</li>
          </ul>
        </section>

        {/* SECTION 5: INTERNAL OPERATIONS & THIRD-PARTY SERVICE PROVIDERS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-purple-700">
            <Server className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">5. Internal Operations & Third-Party Service Providers</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Under the statutory COPPA "internal operations" exception (16 CFR § 312.2), we utilize select third-party infrastructure providers strictly to support game performance, sync, and security:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 font-medium pl-1">
            <li>
              <strong className="text-slate-900">Google Analytics:</strong> Utilized strictly for technical performance and telemetry. Ad personalization, Google Signals, remarketing, and behavioral tracking are strictly disabled.
            </li>
            <li>
              <strong className="text-slate-900">Cloud Database and Hosting Infrastructure (Firebase / Google Cloud):</strong> Secure database used to store linked account progress, secured with encryption in transit (TLS 1.3) and at rest (AES-256).
            </li>
            <li>
              <strong className="text-slate-900">Payment Processor (Stripe):</strong> Operates exclusively behind the adult gate for parent membership checkout. Children cannot view, initiate, or execute financial transactions.
            </li>
          </ul>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs font-bold text-purple-950">
            🚫 <strong>No Sale of Child Data:</strong> Child data is <u>never</u> sold, leased, rented, or disclosed to advertising networks, data brokers, or third-party marketers.
          </div>
        </section>

        {/* SECTION 6: PARENTAL RIGHTS & CONTROL PROCEDURES */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">6. Parental Rights & Control Procedures</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Under COPPA, parents have complete authority over their child’s information and may exercise these rights at any time:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 font-medium pl-1">
            <li>
              <strong className="text-slate-900">Review & Correct Progress:</strong> Parents can view their child’s stored progress, accuracy records, and badges in real-time within the Parent Dashboard.
            </li>
            <li>
              <strong className="text-slate-900">Permanently Delete Account & Data:</strong> Parents can immediately and permanently delete their child’s stored progress and account via the Parent Dashboard (Data & Privacy Settings) or by sending a written request to <a href="mailto:privacy@kiboclimb.com" className="text-sky-700 underline font-bold">privacy@kiboclimb.com</a>.
            </li>
            <li>
              <strong className="text-slate-900">Revoke Previously Granted Consent:</strong> A parent can revoke previously granted consent at any time directly in the Parent Dashboard. Revoking consent immediately halts cloud syncing and permanently purges remote child records.
            </li>
          </ul>
          <div className="pt-2">
            <a
              href="mailto:privacy@kiboclimb.com?subject=COPPA%20Parental%20Rights%20Request"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold text-sm transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Mail className="w-4 h-4" />
              Contact Privacy Officer (privacy@kiboclimb.com)
            </a>
          </div>
        </section>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
