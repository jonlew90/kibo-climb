import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, Database, CreditCard, Cookie, Mail, UserCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function PrivacyPolicyScreen({ onBack, onNavigateCoppa, renderFooter }) {
  const handleBack = () => {
    soundFx.playKeyTap();
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/settings');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleGoToCoppa = (e) => {
    e.preventDefault();
    soundFx.playKeyTap();
    if (onNavigateCoppa) {
      onNavigateCoppa();
    } else {
      window.history.pushState({}, '', '/coppa-privacy');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 via-sky-50 to-blue-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">
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
            <ShieldCheck className="w-5 h-5 text-blue-600 stroke-[2.5]" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">Privacy Policy</h2>
          </div>
        </div>
        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
          General & Web
        </span>
      </header>

      {/* FULLSCREEN SCROLLABLE CONTENT BODY */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* PROMINENT CROSS-REFERENCE CALLOUT BOX */}
        <div className="bg-gradient-to-r from-amber-50 to-teal-50 border-2 border-teal-300 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-100 text-teal-800 rounded-2xl border border-teal-200 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Looking for Information on Child Data & Under-13 Protections?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                For detailed disclosures on children's gameplay data, parental consent mechanisms, guest play local storage, and our strict adherence to the FTC COPPA Rule (16 CFR § 312.4), please visit our dedicated policy.
              </p>
            </div>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleGoToCoppa}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>View Dedicated COPPA & Children’s Privacy Policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl border border-blue-200 shrink-0">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                General Website Privacy Policy
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                This Privacy Policy describes how Kibo Climb LLC ("Kibo Climb", "we", "us", or "our") collects, uses, and safeguards information from adult website visitors, parents, and registered guardians in compliance with applicable consumer data protection laws (including CalOPPA and CCPA).
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-400">
                Last Updated: August 28, 2026
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: INFORMATION COLLECTED FROM ADULTS & VISITORS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-700">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">1. Information Collected from Adults & Visitors</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            When adult visitors access our public website or create a parent administrator account, we may collect:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 font-medium pl-1">
            <li>
              <strong className="text-slate-900">Parent Account Credentials:</strong> Parent email address, hashed cryptographic credentials, account creation timestamps, and billing status records via Stripe.
            </li>
            <li>
              <strong className="text-slate-900">Technical Web Analytics:</strong> Browser type, operating system, preferred language, referring and exit URLs, device characteristics, screen resolution, and truncated IP addresses for geo-regional telemetry.
            </li>
            <li>
              <strong className="text-slate-900">Inbound Ad Tracking Parameters:</strong> Inbound UTM campaign tags (e.g., source, medium, campaign), click IDs, and aggregated ad conversion statistics from Meta Ads and Google Ads campaigns promoting parent subscriptions.
            </li>
          </ul>
        </section>

        {/* SECTION 2: PAYMENT PROCESSING DISCLOSURES */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <CreditCard className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">2. Payment Processing Disclosures (Stripe)</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Optional premium membership plans (Kibo Club) are available for purchase exclusively by verified parents and guardians:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 font-medium pl-1">
            <li><strong className="text-slate-900">Secure Processor:</strong> All real-money transactions are processed securely via third-party payment infrastructure (Stripe, Inc.).</li>
            <li><strong className="text-slate-900">No Raw Card Storage:</strong> Kibo Climb does not collect, receive, or store full credit card numbers, CVVs, or sensitive banking credentials on our own servers. Payment tokenization is handled directly by Stripe in compliance with PCI-DSS Level 1 standards.</li>
            <li><strong className="text-slate-900">Adult Gate Restricted:</strong> Payment interfaces reside entirely behind verified adult gates; children cannot initiate or access subscription purchases.</li>
          </ul>
        </section>

        {/* SECTION 3: COOKIE & LOCAL STORAGE POLICY */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Cookie className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">3. Cookie & Local Storage Policy</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We employ modern browser storage technologies to maintain platform reliability:
          </p>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1">Essential Cookies & Tokens</h4>
              <p className="text-slate-600 font-medium">
                Used solely for user authentication state, session continuity, CSRF security defense, and parent authorization tokens. We do not place third-party advertising tracking cookies in children's sessions.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1">Device Local Storage (localStorage)</h4>
              <p className="text-slate-600 font-medium">
                Used for gameplay persistence, audio volume preferences, offline play caching, and guest climber progress. This data resides directly on your hardware and operates reliably without continuous server connectivity.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: MARKETING & COMMUNICATIONS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-purple-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">4. Marketing & Communications</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We maintain strict boundaries regarding commercial outreach:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 font-medium pl-1">
            <li>
              <strong className="text-slate-900">Opt-In Parent Communications Only:</strong> Product updates, educational tips, and subscription receipts are sent exclusively to adult parents who opted in or established an account.
            </li>
            <li>
              <strong className="text-slate-900">Instant One-Click Unsubscribe:</strong> Every promotional email includes an instant one-click unsubscribe link at the footer, or parents can update notification preferences inside the Parent Dashboard.
            </li>
            <li>
              <strong className="text-slate-900">Absolute Reassurance for Children:</strong> No marketing materials, commercial solicitations, or advertisements are ever delivered to child players.
            </li>
          </ul>
        </section>

        {/* SECTION 5: DATA RETENTION & SECURITY SAFEGUARDS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <Database className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">5. Data Retention & Security Safeguards</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We enforce comprehensive technical, administrative, and physical security measures to safeguard stored data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 font-medium pl-1">
            <li><strong className="text-slate-900">Encryption in Transit & Rest:</strong> All network communication is enforced over modern SSL/TLS (HTTPS) encryption. Database volumes are encrypted at rest with industry-standard AES-256 protocols.</li>
            <li><strong className="text-slate-900">Access Governance:</strong> Database access is restricted to authorized personnel under least-privilege role-based access control (RBAC) and multi-factor authentication.</li>
            <li><strong className="text-slate-900">Account Deletion Timelines:</strong> When a parent requests account deletion via the Parent Dashboard or via email, associated cloud database records are permanently purged from active systems within 30 days.</li>
          </ul>
        </section>

        {/* SECTION 6: JURISDICTIONAL RIGHTS (CCPA / STATE PRIVACY LAWS) */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-700">
            <FileText className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">6. Jurisdictional Rights (CCPA / CalOPPA / US State Laws)</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Consumers and residents of California and other jurisdictions offering statutory privacy rights have the right to exercise the following:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Right to Know / Access</strong>
              <p className="text-xs text-slate-600 font-medium">Request disclosures of categories and specific pieces of personal information collected about you.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Right to Delete</strong>
              <p className="text-xs text-slate-600 font-medium">Request the permanent deletion of your personal data held across our active database systems.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Opt-Out of Sale / Sharing</strong>
              <p className="text-xs text-slate-600 font-medium">We do not sell personal data. You have the right to verify or opt out of any data sharing.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">Non-Discrimination</strong>
              <p className="text-xs text-slate-600 font-medium">We will never discriminate against, deny services to, or penalize any user exercising privacy rights.</p>
            </div>
          </div>
        </section>

        {/* SECTION 7: POLICY CHANGE NOTIFICATIONS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">7. Policy Change Notifications</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We may revise this Privacy Policy periodically to reflect evolving legal standards or platform updates. Material changes will be communicated to registered parents via email notification to the account on file and highlighted through on-site banners prior to the effective date. The "Last Updated" timestamp at the top of this document indicates the most recent revision.
          </p>
        </section>

        {/* SECTION 8: CONTACT INFORMATION */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">8. Contact Information</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            For questions or requests regarding this Website Privacy Policy or data rights:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-1.5">
            <p><strong>Entity:</strong> Kibo Climb LLC</p>
            <p><strong>Mailing Address:</strong> 906 W McDermott Dr, Suite 116, PMB 345, Allen, TX 75013</p>
            <p><strong>Privacy Email:</strong> <a href="mailto:privacy@kiboclimb.com" className="text-blue-700 underline font-bold">privacy@kiboclimb.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:8624385426" className="text-blue-700 underline font-bold">(862) GET-KIBO</a> <span className="text-slate-500 font-normal">((862) 438-5426)</span></p>
          </div>
          <a
            href="mailto:privacy@kiboclimb.com?subject=Website%20Privacy%20Policy%20Inquiry"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Mail className="w-4 h-4 stroke-[2.5]" />
            Contact Legal & Privacy Desk (privacy@kiboclimb.com)
          </a>
        </section>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
