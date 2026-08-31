import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle2, QrCode, Sparkles, ShieldCheck, Share2 } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { buildUniversalFriendUrl, buildFriendQrPayload } from '../utils/qrProtocol';

export default function QrCodeModal({
  isOpen,
  onClose,
  climberCode,
  username = 'Climber',
  equipped = [],
  referrerUid = '',
  title = 'My Climber QR Code',
  subtitle = 'Scan with another phone or tablet to instantly connect!'
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const universalUrl = buildUniversalFriendUrl(climberCode, referrerUid);
  const internalQrValue = universalUrl; // Scanning universal URL works in both browser camera and in-app scanner

  const handleCopyLink = async () => {
    soundFx.playKeyTap();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(universalUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn('Copy link error', e);
    }
  };

  const handleCopyCode = async () => {
    soundFx.playKeyTap();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(climberCode);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.warn('Copy code error', e);
    }
  };

  const handleNativeShare = async () => {
    soundFx.playKeyTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Climb with ${username} on Kibo Climb!`,
          text: `Join me on Kibo Climb to practice math together! Use my Climber Code: ${climberCode}`,
          url: universalUrl
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-300 flex flex-col items-center text-center cursor-default overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Close QR Modal"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Mascot Avatar Preview */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border-2 border-indigo-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm mb-3">
          <div className="absolute inset-0 flex items-center justify-center scale-90">
            <Mascot mood="happy" state="idle" equipped={equipped} size={48} className="w-full h-full" />
          </div>
        </div>

        {/* Header Title */}
        <h2 className="text-xl font-black text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1 px-4">{subtitle}</p>

        {/* High Contrast QR Code Canvas with rounded frame */}
        <div className="my-4 p-4 bg-white rounded-2xl shadow-inner border-2 border-indigo-200 relative flex items-center justify-center">
          <QRCodeSVG
            value={internalQrValue}
            size={190}
            level="H" // High error correction
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
            imageSettings={{
              src: '/favicon.png',
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true
            }}
          />
        </div>

        {/* Climber Code Display */}
        <div className="w-full bg-slate-100 rounded-2xl p-3 mb-4 flex items-center justify-between gap-2 border border-slate-200">
          <div className="text-left">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Climber Code</span>
            <span className="text-base font-black font-mono tracking-wider text-indigo-700">{climberCode}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions Button Group */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Invite</span>
          </button>
        </div>

        {/* COPPA Safety Notice */}
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>COPPA Safe: No private info is shared</span>
        </div>
      </div>
    </div>
  );
}
