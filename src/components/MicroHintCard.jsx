import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function MicroHintCard({ problem, tierLevel }) {
  if (!problem) return null;

  const hintText = problem.hint || problem.hintText || (
    tierLevel === 1 ? 'Start with the larger number and count on!' :
    tierLevel === 2 ? 'Count back or use 10 as a benchmark!' :
    tierLevel === 3 ? 'Think of equal rows in a multiplication grid!' :
    tierLevel === 4 ? 'Break large numbers into tens and ones!' :
    tierLevel === 5 ? 'Share total items equally into groups!' :
    tierLevel === 6 ? 'Split tens and ones to add mentally!' :
    tierLevel === 7 ? 'Match denominators first or convert % to decimals!' :
    'Remember PEMDAS: Parentheses → Exponents → Multiply/Divide → Add/Subtract'
  );

  return (
    <div className="mt-3 bg-amber-50/95 text-amber-900 border-2 border-amber-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm animate-pop max-w-sm w-full mx-auto">
      <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0 stroke-[2.5]" />
      <p className="leading-snug text-left">{hintText}</p>
    </div>
  );
}
