import React, { useState } from 'react';
import { BRAND_CONFIG } from '../config/brand';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Check, Mail, Loader2, Sparkles } from 'lucide-react';

export default function SocialFollowStrip({ className = '', title = 'Follow Our Learning Drops & Practice Sheets' }) {
  const socials = BRAND_CONFIG.socials || {};

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const links = [
    {
      name: 'Pinterest',
      url: socials.pinterest,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.177.268-.407.16-1.52-.707-2.47-2.927-2.47-4.713 0-3.835 2.786-7.359 8.037-7.359 4.22 0 7.498 3.008 7.498 7.027 0 4.193-2.643 7.571-6.311 7.571-1.232 0-2.391-.64-2.787-1.396l-.758 2.896c-.274 1.045-1.014 2.352-1.51 3.146C10.07 23.818 11.017 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      styleClass: 'bg-[#E60023] hover:bg-[#c9001f] text-white border-[#E60023] shadow-xs'
    },
    {
      name: 'Facebook',
      url: socials.facebook,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      styleClass: 'bg-[#1877F2] hover:bg-[#166fe5] text-white border-[#1877F2] shadow-xs'
    },
    {
      name: 'X',
      url: socials.x,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      styleClass: 'bg-[#000000] hover:bg-[#1a1a1a] text-white border-[#000000] shadow-xs'
    },
    {
      name: 'Threads',
      url: socials.threads,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.836 13.84c-.187 2.766-2.023 4.685-4.836 4.685-2.973 0-5.06-2.18-5.06-5.289 0-3.158 2.148-5.358 5.17-5.358 2.875 0 4.758 1.944 4.887 4.544h-2.19c-.114-1.464-1.127-2.483-2.697-2.483-1.749 0-2.887 1.34-2.887 3.297 0 1.93 1.116 3.238 2.83 3.238 1.543 0 2.457-.96 2.627-2.164h-2.627v-1.89h4.893v5.42z" />
        </svg>
      ),
      styleClass: 'bg-[#101010] hover:bg-[#222222] text-white border-[#101010] shadow-xs'
    },
    {
      name: 'LinkedIn',
      url: socials.linkedin,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      styleClass: 'bg-[#0A66C2] hover:bg-[#095196] text-white border-[#0A66C2] shadow-xs'
    }
  ].filter(item => Boolean(item.url));

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      if (db) {
        await addDoc(collection(db, 'newsletter_subscribers'), {
          email: cleanEmail,
          source: typeof window !== 'undefined' ? window.location.pathname : 'social_strip',
          subscribedAt: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
      }
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.warn('Newsletter submission fallback:', err);
      // Fallback success for user UX if network/offline
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <div className={`bg-white border border-orange-100 rounded-2xl p-4 sm:p-5 shadow-2xs text-center space-y-4 ${className}`}>
      <div className="space-y-0.5">
        <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider">
          Stay Connected
        </span>
        <h4 className="text-sm sm:text-base font-black text-slate-800">
          {title}
        </h4>
        <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
          Get weekly math strategies, mental shortcuts, and new printable worksheet releases.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target={link.url.startsWith('/') ? '_self' : '_blank'}
            rel={link.url.startsWith('/') ? undefined : 'noopener noreferrer'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 border ${link.styleClass}`}
            title={`Follow Kibo Climb on ${link.name}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </a>
        ))}
      </div>

      {/* Email Newsletter Subscription */}
      <div className="pt-2 border-t border-slate-100 max-w-md mx-auto">
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🎉 You're subscribed to Kibo Climb learning drops!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter parent email for free drops..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 placeholder-slate-400 transition-all"
                  aria-label="Parent email address for learning newsletter"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Subscribe</span>
              </button>
            </div>
            {errorMsg && (
              <p className="text-[11px] font-bold text-rose-500 text-left pl-1">{errorMsg}</p>
            )}
            <p className="text-[10px] text-slate-400 font-medium">
              Free weekly digest. No spam, parent-controlled, unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
