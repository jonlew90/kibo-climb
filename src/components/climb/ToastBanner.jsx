import React from 'react';

export default function ToastBanner({
  feedbackBanner,
  hasStartedClimb,
  onDismiss
}) {
  const isBannerVisible = Boolean(feedbackBanner && (feedbackBanner.text || feedbackBanner.message));
  const text = feedbackBanner?.text || feedbackBanner?.message || '';
  const isError = feedbackBanner?.type === 'error' || feedbackBanner?.isCorrect === false;

  return (
    <div
      onClick={onDismiss}
      className={`absolute inset-x-4 z-50 transition-all duration-300 ${
        isBannerVisible
          ? hasStartedClimb
            ? 'top-12 opacity-100 scale-100 pointer-events-auto cursor-pointer'
            : 'top-0 opacity-100 scale-100 pointer-events-auto cursor-pointer'
          : '-top-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`py-2.5 px-4 rounded-2xl text-center font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md border flex items-center justify-between gap-2 ${
          isError
            ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
            : 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40'
        }`}
      >
        <span className="flex-1 text-center leading-snug">{text}</span>
        <span className="text-xs font-black opacity-80 hover:opacity-100 bg-black/20 px-2 py-0.5 rounded-full shrink-0">✕</span>
      </div>
    </div>
  );
}
