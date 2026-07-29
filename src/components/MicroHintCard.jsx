import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function MicroHintCard({ problem, tierLevel }) {
  if (!problem) return null;

  const num1 = Number(problem.num1) || 0;
  const num2 = Number(problem.num2) || 0;
  const op = problem.operatorSymbol || problem.operator || '+';

  let hintText = problem.hint || problem.hintText;

  if (!hintText) {
    if (op === '-' || op === '−' || problem.type?.includes('subtraction')) {
      const diff = num1 - num2;
      if (diff === 1) {
        hintText = `Tip: How far apart are ${num1} and ${num2}? Just 1 step!`;
      } else if (num2 > 0) {
        hintText = `Tip: Start at ${num1} and count back ${num2}!`;
      } else {
        hintText = `Tip: Count back from ${num1}!`;
      }
    } else if (op === '+' || problem.type?.includes('addition')) {
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      hintText = `Tip: Start at ${larger} and count on ${smaller}!`;
    } else if (op === '×' || op === '*') {
      hintText = `Tip: Think of ${num1} equal rows of ${num2}!`;
    } else if (op === '÷' || op === '/') {
      hintText = `Tip: Share ${num1} into ${num2} equal groups!`;
    } else {
      hintText = (
        tierLevel === 1 ? 'Tip: Start with the larger number and count on!' :
        tierLevel === 2 ? 'Tip: Count back or use 10 as a benchmark!' :
        tierLevel === 3 ? 'Tip: Think of equal rows in a multiplication grid!' :
        tierLevel === 4 ? 'Tip: Break large numbers into tens and ones!' :
        tierLevel === 5 ? 'Tip: Share total items equally into groups!' :
        tierLevel === 6 ? 'Tip: Split tens and ones to add mentally!' :
        tierLevel === 7 ? 'Tip: Match denominators first or convert % to decimals!' :
        'Tip: Remember PEMDAS: Parentheses → Exponents → Multiply/Divide → Add/Subtract'
      );
    }
  }

  return (
    <div className="mt-3 bg-amber-50/95 text-amber-900 border-2 border-amber-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm animate-pop max-w-sm w-full mx-auto">
      <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0 stroke-[2.5]" />
      <p className="leading-snug text-left">{hintText}</p>
    </div>
  );
}
