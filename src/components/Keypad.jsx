import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function Keypad({ onKeyPress, onDelete, onClear, problemType, allowDecimal }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const showDecimal = allowDecimal || (problemType && (
    problemType.startsWith('money') ||
    problemType === 'change' ||
    problemType === 'coins'
  ));

  const handlePress = (digit) => {
    soundFx.playKeyTap();
    onKeyPress(digit);
  };

  const handleDelete = () => {
    soundFx.playKeyTap();
    onDelete();
  };

  const handleClear = () => {
    soundFx.playKeyTap();
    onClear();
  };

  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3 sm:gap-4 p-3.5 bg-slate-100/90 rounded-3xl border-2 border-slate-200 shadow-inner">
      {keys.map((num) => (
        <button
          key={num}
          onClick={() => handlePress(num)}
          className="btn-3d-key text-slate-800"
          aria-label={`Digit ${num}`}
        >
          {num}
        </button>
      ))}

      {/* Decimal Point or Clear Button */}
      {showDecimal ? (
        <button
          onClick={() => handlePress('.')}
          className="btn-3d-key text-amber-600 font-black text-3xl hover:bg-amber-50 border-amber-200"
          aria-label="Decimal point"
        >
          .
        </button>
      ) : (
        <button
          onClick={handleClear}
          className="btn-3d-key text-rose-500 hover:bg-rose-50 border-rose-200 text-lg font-bold"
          aria-label="Clear all input"
        >
          <RotateCcw className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* 0 Button */}
      <button
        onClick={() => handlePress('0')}
        className="btn-3d-key text-slate-800"
        aria-label="Digit 0"
      >
        0
      </button>

      {/* Backspace Button */}
      <button
        onClick={handleDelete}
        className="btn-3d-key text-amber-600 hover:bg-amber-50 border-amber-200 text-lg font-bold"
        aria-label="Delete last digit"
      >
        <Delete className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
