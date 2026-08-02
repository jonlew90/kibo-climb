import React from 'react';
import { Delete, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function Keypad({
  onDigit,
  onKeyPress,
  onDelete,
  onClear,
  onSubmit,
  problemType,
  allowDecimal,
  answerString,
  displayString,
  operatorSymbol,
  options
}) {
  const handleInputDigit = onDigit || onKeyPress || (() => {});
  const handleDelete = onDelete || (() => {});
  const handleClear = onClear || (() => {});

  const isBooleanQuestion = Boolean(
    (options && options.includes('Yes')) ||
    (answerString && (
      answerString.toLowerCase() === 'yes' ||
      answerString.toLowerCase() === 'no' ||
      answerString.toLowerCase() === 'true' ||
      answerString.toLowerCase() === 'false'
    )) ||
    (displayString && (
      displayString.toLowerCase().startsWith('is ') ||
      displayString.toLowerCase().startsWith('can ') ||
      displayString.toLowerCase().startsWith('does ')
    ))
  );

  if (isBooleanQuestion) {
    return (
      <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-3.5 p-3.5 bg-slate-100/90 rounded-3xl border-2 border-slate-200 shadow-inner">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            handleInputDigit('Yes');
          }}
          className="btn-3d-emerald flex-1 py-4 text-xl sm:text-2xl font-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          aria-label="Select Yes"
        >
          <CheckCircle2 className="w-6 h-6 stroke-[3]" /> YES
        </button>

        <button
          onClick={() => {
            soundFx.playKeyTap();
            handleInputDigit('No');
          }}
          className="btn-3d-rose flex-1 py-4 text-xl sm:text-2xl font-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          aria-label="Select No"
        >
          <XCircle className="w-6 h-6 stroke-[3]" /> NO
        </button>
      </div>
    );
  }

  const isFractionQuestion = Boolean(
    (problemType && (problemType.includes('fraction') || problemType.includes('rational'))) ||
    (answerString && answerString.includes('/')) ||
    (displayString && displayString.includes('/'))
  );

  const isMoneyOrDecimal = Boolean(
    allowDecimal ||
    (problemType && (
      problemType.includes('money') ||
      problemType.includes('decimal') ||
      problemType === 'change' ||
      problemType === 'coins'
    )) ||
    (answerString && answerString.includes('.')) ||
    (displayString && (displayString.includes('$') || displayString.includes('¢') || displayString.includes('Change'))) ||
    operatorSymbol === '🪙'
  );

  const isNegativeQuestion = Boolean(
    (problemType && (problemType.includes('signed') || problemType.includes('negative'))) ||
    (answerString && answerString.startsWith('-'))
  );

  const bottomLeftKey = isTimeQuestion ? ':' : isFractionQuestion ? '/' : isNegativeQuestion ? '-' : isMoneyOrDecimal ? '.' : 'clear';

  const keyGrid = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [bottomLeftKey, '0', 'backspace']
  ];

  const handleKeyClick = (keyVal) => {
    soundFx.playKeyTap();
    if (keyVal === 'backspace') {
      handleDelete();
    } else if (keyVal === 'clear') {
      handleClear();
    } else {
      handleInputDigit(keyVal);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-100/90 rounded-3xl border-2 border-slate-200 shadow-inner">
      {keyGrid.flat().map((keyVal, idx) => {
        if (keyVal === ':') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick(':')}
              className="btn-3d-key text-purple-700 font-black text-3xl hover:bg-purple-50 border-purple-200"
              aria-label="Colon time separator"
            >
              :
            </button>
          );
        }

        if (keyVal === '/') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick('/')}
              className="btn-3d-key text-teal-700 font-black text-3xl hover:bg-teal-50 border-teal-200"
              aria-label="Fraction slash separator"
            >
              /
            </button>
          );
        }

        if (keyVal === '-') {
          return (
            <button
              key={`${keyVal}-${idx}`}
              onClick={() => handleKeyClick('-')}
              className="btn-3d-key text-indigo-700 font-black text-3xl hover:bg-indigo-50 border-indigo-200"
              aria-label="Negative sign"
            >
              −
            </button>
          );
        }

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
