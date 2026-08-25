import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquare, Bug, Lightbulb, FileText, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const autoCloseTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  const categories = [
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-300', ring: 'ring-rose-400' },
    { id: 'idea', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', ring: 'ring-amber-400' },
    { id: 'general', label: 'General', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-300', ring: 'ring-indigo-400' },
    { id: 'other', label: 'Other', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', ring: 'ring-slate-400' }
  ];

  const handleClose = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    soundFx.playKeyTap();
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setSuccess(false);
      setMessage('');
      setCategory('bug');
      setError('');
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    soundFx.playKeyTap();
    setIsSubmitting(true);
    setError('');

    try {
      const userData = storageService.getUserData('math');
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      };

      await addDoc(collection(db, 'feedback'), {
        category,
        message: message.trim(),
        userId: userData?.cloudUid || 'anonymous',
        profileId: userData?.id || 'unknown',
        deviceInfo,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      autoCloseTimerRef.current = setTimeout(() => {
        handleClose();
      }, 4000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={!isSubmitting ? handleClose : undefined}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border-4 border-indigo-500 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto animate-pop flex flex-col cursor-default"
      >
        {!isSubmitting && (
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-5 animate-pop">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900">Thank You!</h2>
              <p className="text-sm text-slate-600 font-medium max-w-xs leading-relaxed">
                Your feedback has been received and helps us make Kibo Climb better for everyone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center mt-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                Send Feedback
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Spot a bug? Have an idea? Let us know!
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 font-bold text-xs flex items-center justify-center gap-2 animate-pop">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { soundFx.playKeyTap(); setCategory(cat.id); }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        category === cat.id
                          ? `${cat.bg} ${cat.border} ${cat.color} ${cat.ring} shadow-sm ring-1 ring-offset-1`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <cat.icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
