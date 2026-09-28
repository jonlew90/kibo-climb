import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Subject-agnostic review banner for incorrect answers or shield-absorbed mistakes.
 */
export default function IncorrectReviewBanner({
  reviewData,
  hint = null,
  userLabel = 'Your answer',
  hintPrefix = '💡',
  formatUserAnswer = (ans) => ans || '—',
  formatCorrectAnswer = (ans) => ans
}) {
  if (!reviewData) return null;

  const isShield = !!reviewData.isShieldAbsorbed;
  const userAnswerFormatted = formatUserAnswer(reviewData.userAnswer);
  const correctAnswerFormatted = formatCorrectAnswer(reviewData.correctAnswer);

  if (isShield) {
    return (
      <div className="w-full bg-sky-50 border-2 border-sky-300 rounded-2xl p-2.5 sm:p-3 text-center space-y-1.5 animate-pop mt-1 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold text-sky-900">
          <Shield className="w-4 h-4 text-sky-600 fill-sky-200 shrink-0" />
          <span>Kibo Shield Absorbed Mistake (Streak Protected ✨)</span>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
          <span className="text-slate-600 bg-white/90 px-2.5 py-0.5 rounded-full border border-sky-200">
            ✕ {userLabel}: <span className="line-through font-extrabold text-slate-800">{userAnswerFormatted}</span>
          </span>
          <span className="text-sky-900 bg-sky-100/90 px-2.5 py-0.5 rounded-full border border-sky-300 font-extrabold flex items-center gap-1">
            ✓ Correct: {correctAnswerFormatted}
          </span>
        </div>
        {hint && (
          <p className="text-xs text-sky-950 font-medium italic pt-0.5">
            {hintPrefix} {hint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-rose-50 border-2 border-rose-200 rounded-2xl p-2 sm:p-2.5 text-center space-y-1 animate-pop mt-1">
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
        <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 text-xs sm:text-sm">
          ✕ {userLabel}: <span className="line-through font-extrabold">{userAnswerFormatted}</span>
        </span>
        <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-1">
          ✓ Correct: {correctAnswerFormatted}
        </span>
      </div>
      {hint && (
        <p className="text-xs text-indigo-900 font-medium italic pt-0.5">
          {hintPrefix} {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Subject-agnostic CTA button to continue after reviewing an incorrect or shield-absorbed problem.
 */
export function IncorrectReviewAction({ reviewData, onContinue }) {
  if (!reviewData) return null;

  const isShield = !!reviewData.isShieldAbsorbed;
  const buttonGradient = isShield
    ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 border-sky-700'
    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-emerald-700';

  const label = reviewData.isBlockComplete
    ? 'Finish Climb 🏔️'
    : isShield
    ? 'Next Question ➔ (Streak Saved ✨)'
    : 'Next Question ➔';

  return (
    <div className="w-full space-y-1.5 sm:space-y-2 py-2">
      <button
        type="button"
        autoFocus
        onClick={onContinue}
        className={`w-full text-white font-black text-lg sm:text-xl py-3.5 px-6 rounded-2xl shadow-lg border-b-4 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer select-none ${buttonGradient}`}
      >
        {isShield && <Shield className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />}
        <span>{label}</span>
      </button>
      <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
        Press Enter or Space ↵
      </p>
    </div>
  );
}
