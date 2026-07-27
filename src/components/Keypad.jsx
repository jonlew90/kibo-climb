import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function Keypad({
  onKeyPress,
  onDelete,
  onClear,
  problemType,
  allowDecimal,
  answerString
}) {
  const isMoneyOrDecimal = Boolean(
    allowDecimal ||
    (problemType && (
      problemType.includes('money') ||
      problemType.includes('decimal') ||
      problemType === 'change' ||
      problemType === 'coins'
    )) ||
    (answerString && answerString.includes('.'))
  );

  const bottomLeftKey = isMoneyOrDecimal ? '.' : 'clear';

  const keyGrid = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [bottomLeftKey, '0', 'backspace']
  ];

  const handleKeyClick = (keyVal) => {
    soundFx.playKeyTap();
    if (keyVal === 'backspace') {
      onDelete();
    } else if (keyVal === 'clear') {
      onClear();
    } else {
      onKeyPress(keyVal);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3 sm:gap-4 p-3.5 bg-slate-100/90 rounded-3xl border-2 border-slate-200 shadow-inner">
      {keyGrid.flat().map((keyVal, idx) => {
        if (keyVal === '.') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick('.')}
              className="btn-3d-key text-amber-600 font-black text-3xl hover:bg-amber-50 border-amber-200"
              aria-label="Decimal point"
            >
              .
            </button>
          );
        }

        if (keyVal === 'clear') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick('clear')}
              className="btn-3d-key text-rose-500 hover:bg-rose-50 border-rose-200 text-lg font-bold"
              aria-label="Clear all input"
            >
              <RotateCcw className="w-7 h-7 stroke-[2.5]" />
            </button>
          );
        }

        if (keyVal === 'backspace') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick('backspace')}
              className="btn-3d-key text-amber-600 hover:bg-amber-50 border-amber-200 text-lg font-bold"
              aria-label="Delete last digit"
            >
              <Delete className="w-7 h-7 stroke-[2.5]" />
            </button>
          );
        }

        return (
          <button
            key={`${keyVal}-${idx}`}
            onClick={() => handleKeyClick(keyVal)}
            className="btn-3d-key text-slate-800"
            aria-label={`Digit ${keyVal}`}
          >
            {keyVal}
          </button>
        );
      })}
    </div>
  );
}
