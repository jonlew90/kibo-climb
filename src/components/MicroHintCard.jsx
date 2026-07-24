import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function MicroHintCard({ problem, tierLevel }) {
  if (!problem) return null;

  const num1 = Number(problem.num1) || 0;
  const num2 = Number(problem.num2) || 0;
  const op = problem.operatorSymbol || '+';

  // Render Tier-Specific Visual Hint Content
  const renderHintVisual = () => {
    // T1 / T2: Ten-frame dots representation
    if (tierLevel <= 2) {
      const totalDots = Math.min(20, Math.max(1, num1 + (op === '-' ? 0 : num2)));
      return (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900">
            💡 <strong>Ten-Frame Visual:</strong> Count dots to combine quantities!
          </p>
          <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto bg-amber-100/60 p-2 rounded-xl border border-amber-200">
            {Array.from({ length: totalDots }).map((_, i) => (
              <span
                key={i}
                className={`w-3.5 h-3.5 rounded-full inline-block border ${
                  i < num1 ? 'bg-amber-500 border-amber-600' : 'bg-kibo-teal border-teal-600'
                }`}
              />
            ))}
          </div>
        </div>
      );
    }

    // T3 / T4: Dot Array Grid (N x M)
    if (tierLevel === 3 || tierLevel === 4) {
      const rows = Math.min(8, Math.max(1, num1));
      const cols = Math.min(8, Math.max(1, num2));
      return (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900">
            💡 <strong>Dot Array Grid:</strong> {rows} rows of {cols} dots
          </p>
          <div className="inline-block bg-amber-100/60 p-2 rounded-xl border border-amber-200 max-w-[220px]">
            <div className="grid gap-1 justify-center" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: rows * cols }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // T5: Equal Sharing Groups
    if (tierLevel === 5) {
      const totalItems = Math.min(24, Math.max(1, num1));
      const groups = Math.min(6, Math.max(1, num2));
      const itemsPerGroup = Math.floor(totalItems / groups) || 1;

      return (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900">
            💡 <strong>Equal Groups:</strong> Share {totalItems} items into {groups} equal groups
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[240px] mx-auto bg-amber-100/60 p-2 rounded-xl border border-amber-200">
            {Array.from({ length: groups }).map((_, gIdx) => (
              <div key={gIdx} className="p-1 bg-white border border-amber-300 rounded-lg flex gap-0.5">
                {Array.from({ length: itemsPerGroup }).map((_, itemIdx) => (
                  <div key={itemIdx} className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // T6: Split Mental Math Formula
    if (tierLevel === 6) {
      const tens1 = Math.floor(num1 / 10) * 10;
      const ones1 = num1 % 10;
      const tens2 = Math.floor(num2 / 10) * 10;
      const ones2 = num2 % 10;

      return (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900">
            💡 <strong>Split & Add Strategy:</strong> Tens first, then ones!
          </p>
          <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-200 font-mono text-xs text-amber-950">
            <span>({tens1} + {tens2}) + ({ones1} + {ones2})</span> = <span>{tens1 + tens2} + {ones1 + ones2}</span>
          </div>
        </div>
      );
    }

    // T7: Fraction Bar / Percentage Rule
    if (tierLevel === 7) {
      return (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900">
            💡 <strong>Fraction Bar & Percentage Rule:</strong>
          </p>
          <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-200 text-xs font-semibold text-amber-950">
            {problem.displayString && problem.displayString.includes('%') ? (
              <span>20% means divide by 5 • 25% means divide by 4 • 50% means half</span>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <div className="w-24 h-4 bg-white border border-amber-300 rounded overflow-hidden flex">
                  <div className="w-1/2 h-full bg-amber-400 border-r border-amber-300" />
                  <div className="w-1/4 h-full bg-teal-400" />
                </div>
                <span className="text-[10px]">Match denominators first!</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // T8: Perfect Square Grid / PEMDAS Highlight
    return (
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-amber-900">
          💡 <strong>Order of Operations (PEMDAS):</strong>
        </p>
        <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-200 text-xs font-bold text-purple-900">
          <span>Parentheses $\rightarrow$ Exponents/Roots $\rightarrow$ Multiply/Divide $\rightarrow$ Add/Subtract</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3 text-center shadow-sm animate-pop my-2 relative">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-700">
        <Lightbulb className="w-4 h-4 fill-amber-300 stroke-[2.5]" />
        <span className="text-xs font-black uppercase tracking-wider">Kibo Micro-Hint</span>
      </div>
      {renderHintVisual()}
    </div>
  );
}
