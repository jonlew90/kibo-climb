import React, { useState, useRef } from 'react';
import { X, Copy, CheckCircle2, Share2, Gift } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { authService } from '../services/authService';
import { soundFx } from '../utils/audio';
import { getAppOrigin } from '../utils/qrProtocol';


export default function ShareModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isSharingRef = useRef(false);

  if (!isOpen) return null;

  const currentUser = authService.getAuthState();
  const userId = currentUser?.uid || '';
  const baseUrl = getAppOrigin();
  const shareUrl = `${baseUrl}/?ref=${userId}`;


  const handleCopy = async () => {
    soundFx.playKeyTap();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (isSharingRef.current) return;
    soundFx.playKeyTap();

    const shareData = {
      title: 'Join me on Kibo Climb!',
      text: 'Use my referral link to get a special starting bonus!',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          await handleCopy();
          return;
        }
        isSharingRef.current = true;
        setIsSharing(true);
        await navigator.share(shareData);
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'InvalidStateError') {
          // User canceled or earlier share is in flight - ignore safely
          return;
        }
        // Fallback to copying link on any other share failure
        await handleCopy();
      } finally {
        isSharingRef.current = false;
        setIsSharing(false);
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-200 cursor-default"
      >
        <button 
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }} 
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-300">
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Share & Earn!</h2>
          <p className="text-slate-600 text-sm font-medium">
            Invite friends using your unique link! When they sign up, they get a <span className="text-amber-500 font-bold">500 Sparks</span> welcome bonus, and you earn an exclusive reward of your choice!
          </p>
        </div>
        <div className="space-y-4">
          {/* QR Code Presentation */}
          <div className="p-3 bg-white rounded-2xl shadow-inner border-2 border-indigo-200 flex flex-col items-center justify-center">
            <QRCodeSVG
              value={shareUrl}
              size={160}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1e1b4b"
              imageSettings={{
                src: '/favicon.png',
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true
              }}
            />
            <span className="text-[11px] font-bold text-indigo-700 mt-1">Scan with any phone camera</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200 flex items-center justify-between gap-2 overflow-hidden">
            <div className="text-xs font-mono text-slate-500 truncate select-all">{shareUrl}</div>
            <button onClick={handleCopy} className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg shrink-0 cursor-pointer">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button 
            onClick={handleNativeShare} 
            disabled={isSharing}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-black text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {isSharing ? 'Sharing...' : 'Share Link'}
          </button>
        </div>

      </div>
    </div>
  );
}
