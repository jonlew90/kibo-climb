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
                Kibo Climb is designed to be a safe, distraction-free learning environment. We do not sell personal data, display third-party advertisements, or track children across other apps.
              </p>
              <div className="mt-3 text-xs font-semibold text-slate-400">
                Last Updated: August 9, 2026
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: KIDS & COPPA SAFETY */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-teal-700">
            <HeartHandshake className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">1. Child Safety & COPPA Compliance</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We strictly adhere to the Children's Online Privacy Protection Act (COPPA) and international child safety standards:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 font-medium pl-1">
            <li><strong className="text-slate-800">No Advertising:</strong> We never display third-party ads or commercial promotions to children.</li>
            <li><strong className="text-slate-800">No Public Social Features:</strong> Children cannot chat with strangers, upload photos, or share location data.</li>
            <li><strong className="text-slate-800">Parental Gate:</strong> Adult settings, subscription management, and account linking are protected behind a 4-digit Parent PIN Gate.</li>
          </ul>
        </section>

        {/* SECTION 2: INFORMATION WE COLLECT */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <EyeOff className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">2. Information We Collect</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
            <p>
              To provide adaptive practice and track learning milestones, we handle the following minimal data:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Local & Gameplay Data</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong className="text-slate-700">Practice Performance:</strong> Accuracy, response speed, streak history, and unlocked badges.</li>
                <li><strong className="text-slate-700">Guest Profiles:</strong> Profile nicknames (e.g. "Climb Explorer") stored directly on your device.</li>
                <li><strong className="text-slate-700">Game Preferences:</strong> Audio toggle states and haptic settings.</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Optional Account Information</h4>
              <p className="text-slate-600">
                If a parent chooses to link an account via Email or Google Sign-In, we collect an email address solely for progress backup and account authentication across devices.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW WE USE & STORE DATA */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Server className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">3. How Data Is Stored & Used</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Your learning progress is stored locally on your device using encrypted browser storage. When linked to an account, progress updates sync securely to our database to ensure children never lose earned badges or sparks.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We use anonymized learning statistics strictly to calibrate problem difficulty and improve adaptive learning algorithms.
          </p>
        </section>

        {/* SECTION 4: PARENT RIGHTS & DATA DELETION */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">4. Parental Rights & Data Deletion</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Parents have complete control over their child's data. At any time, parents can:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 font-medium pl-1">
            <li>Reset or delete student profiles directly within the <strong className="text-slate-800">Parent Dashboard</strong>.</li>
            <li>Request full account and data deletion by contacting our support team.</li>
            <li>Export practice statistics and mastery reports from the Parent Dashboard.</li>
          </ul>
        </section>

        {/* SECTION 5: CONTACT US */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-700">
            <Mail className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-extrabold tracking-tight">5. Contact Our Privacy Team</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            If you have questions regarding this Privacy Policy or child privacy protections, please reach out to us at:
          </p>
          <a
            href="mailto:hello@kiboclimb.com?subject=Kibo%20Climb%20Privacy%20Inquiry"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-extrabold text-sm transition-colors"
          >
            <Mail className="w-4 h-4 stroke-[2.5]" />
            hello@kiboclimb.com
          </a>
        </section>
      </main>

      {/* STICKY BOTTOM NAVIGATION FOOTER */}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
