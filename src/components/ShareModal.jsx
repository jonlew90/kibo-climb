import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Share2, Gift } from 'lucide-react';
import { authService } from '../services/authService';

export default function ShareModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUser = authService.getAuthState();
  const userId = currentUser?.uid || '';
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/?ref=${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Kibo Climb!',
          text: 'Use my referral link to get a special starting bonus!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
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
          <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200 flex items-center justify-between gap-2 overflow-hidden">
            <div className="text-xs font-mono text-slate-500 truncate select-all">{shareUrl}</div>
            <button onClick={handleCopy} className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg shrink-0">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleNativeShare} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-black text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
