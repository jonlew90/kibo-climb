import React, { useCallback } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function QwertyKeyboard({ onChar, onDelete, onClear, onSubmit, prunedKeys = [] }) {
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const isPruned = (char) => {
    if (!prunedKeys || prunedKeys.length === 0) return false;
    return prunedKeys.includes(char.toUpperCase()) || (prunedKeys.has && prunedKeys.has(char.toUpperCase()));
  };

  const handleCharClick = useCallback((char, e) => {
    e.preventDefault();
    if (isPruned(char)) return;
    soundFx.playKeyTap();
    onChar(char.toLowerCase());
  }, [onChar, prunedKeys]);

  const handleDeleteClick = useCallback((e) => {
    e.preventDefault();
    soundFx.playKeyTap();
    onDelete();
  }, [onDelete]);

  const handleClearClick = useCallback((e) => {
    e.preventDefault();
    soundFx.playKeyTap();
    onClear();
  }, [onClear]);

  return (
    <div className="w-full flex flex-col gap-1 sm:gap-1.5 p-1 sm:p-2 select-none touch-manipulation pb-safe-nav">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        {row1.map((char) => {
          const pruned = isPruned(char);
          return (
            <button
              key={char}
              disabled={pruned}
              onPointerDown={(e) => handleCharClick(char, e)}
              className={`flex-1 h-12 sm:h-14 rounded-xl shadow-sm text-lg sm:text-xl font-black transition-all flex items-center justify-center min-w-0 ${
                pruned
                  ? 'bg-slate-100/60 border-2 border-slate-200 text-slate-300 opacity-25 cursor-not-allowed scale-90'
                  : 'bg-white border-2 border-slate-200 text-slate-800 active:bg-amber-100 active:border-amber-400 active:text-amber-900 active:scale-95 cursor-pointer'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-[90%] mx-auto">
        {row2.map((char) => {
          const pruned = isPruned(char);
          return (
            <button
              key={char}
              disabled={pruned}
              onPointerDown={(e) => handleCharClick(char, e)}
              className={`flex-1 h-12 sm:h-14 rounded-xl shadow-sm text-lg sm:text-xl font-black transition-all flex items-center justify-center min-w-0 ${
                pruned
                  ? 'bg-slate-100/60 border-2 border-slate-200 text-slate-300 opacity-25 cursor-not-allowed scale-90'
                  : 'bg-white border-2 border-slate-200 text-slate-800 active:bg-amber-100 active:border-amber-400 active:text-amber-900 active:scale-95 cursor-pointer'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        <button
          onPointerDown={handleClearClick}
          aria-label="Clear"
          title="Clear"
          className="w-14 sm:w-16 h-12 sm:h-14 bg-slate-200 border-2 border-slate-300 rounded-xl shadow-sm text-slate-700 font-black active:bg-slate-300 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {row3.map((char) => {
          const pruned = isPruned(char);
          return (
            <button
              key={char}
              disabled={pruned}
              onPointerDown={(e) => handleCharClick(char, e)}
              className={`flex-1 h-12 sm:h-14 rounded-xl shadow-sm text-lg sm:text-xl font-black transition-all flex items-center justify-center min-w-0 ${
                pruned
                  ? 'bg-slate-100/60 border-2 border-slate-200 text-slate-300 opacity-25 cursor-not-allowed scale-90'
                  : 'bg-white border-2 border-slate-200 text-slate-800 active:bg-amber-100 active:border-amber-400 active:text-amber-900 active:scale-95 cursor-pointer'
              }`}
            >
              {char}
            </button>
          );
        })}

        <button
          onPointerDown={handleDeleteClick}
          aria-label="Delete"
          title="Delete"
          className="w-14 sm:w-16 h-12 sm:h-14 bg-slate-200 border-2 border-slate-300 rounded-xl shadow-sm text-slate-700 font-black active:bg-slate-300 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}
