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
  options,
  prunedKeys = []
}) {
  const handleInputDigit = onDigit || onKeyPress || (() => {});
  const handleDelete = onDelete || (() => {});
  const handleClear = onClear || (() => {});

  const isKeyPruned = (k) => {
    if (!prunedKeys) return false;
    if (Array.isArray(prunedKeys)) return prunedKeys.includes(k);
    if (prunedKeys instanceof Set) return prunedKeys.has(k);
    return false;
  };

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
      <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-3.5 p-2.5 sm:p-3.5 bg-slate-100/90 rounded-2xl sm:rounded-3xl border-2 border-slate-200 shadow-inner my-1.5 sm:my-4">
        <button
          onClick={() => {
            soundFx.playKeyTap();
            if (onSubmit) {
              onSubmit('Yes');
            } else {
              handleInputDigit('Yes');
            }
          }}
          className="btn-3d-emerald flex-1 py-4 text-xl sm:text-2xl font-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          aria-label="Select Yes"
        >
          <CheckCircle2 className="w-6 h-6 stroke-[3]" /> YES
        </button>

        <button
          onClick={() => {
            soundFx.playKeyTap();
            if (onSubmit) {
              onSubmit('No');
            } else {
              handleInputDigit('No');
            }
          }}
          className="btn-3d-rose flex-1 py-4 text-xl sm:text-2xl font-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          aria-label="Select No"
        >
          <XCircle className="w-6 h-6 stroke-[3]" /> NO
        </button>
      </div>
    );
  }

  const choiceOptions = options || (displayString && (displayString.includes(' or ') || displayString.includes(' vs ')) ? (() => {
    const match = displayString.match(/:\s*([^\?]+)\?/i) || displayString.match(/(.+)/);
    if (match) {
      const parts = match[1].split(/\s+or\s+|\s+vs\s+/i).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) return parts;
    }
    return null;
  })() : null);

  const isChoiceQuestion = Boolean(
    (choiceOptions && choiceOptions.length >= 2) ||
    (displayString && (
      displayString.toLowerCase().includes('which is larger') ||
      displayString.toLowerCase().includes('which is smaller') ||
      displayString.toLowerCase().includes('which is greater')
    ))
  );

  if (isChoiceQuestion && choiceOptions && choiceOptions.length >= 2) {
    const operatorColors = [
      'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-b-4 border-emerald-700',
      'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-amber-700',
      'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 border-b-4 border-indigo-700',
      'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-b-4 border-purple-700'
    ];

    const optStrings = choiceOptions.map(o => String(o || ''));
    const maxOptLen = Math.max(...optStrings.map(s => s.length));
    const maxOverallWordLen = Math.max(0, ...optStrings.flatMap(s => s.split(/[\s,()/]+/).map(w => w.length)));
    const isTextChoices = maxOptLen > 3;

    // Use 2x2 grid for text choices, or 4-column row for short operators/single numbers
    const gridLayoutClass = isTextChoices
      ? 'grid grid-cols-2 gap-2 sm:gap-2.5'
      : (choiceOptions.length > 2 ? 'grid grid-cols-2 sm:grid-cols-4 gap-2' : 'flex items-center justify-center gap-3.5');

    return (
      <div className={`w-full max-w-sm mx-auto p-2.5 sm:p-3.5 bg-slate-100/90 rounded-2xl sm:rounded-3xl border-2 border-slate-200 shadow-inner my-1.5 sm:my-3 ${gridLayoutClass}`}>
        {choiceOptions.map((opt, idx) => {
          const pruned = isKeyPruned(opt);
          const colorClass = operatorColors[idx % operatorColors.length];
          const optStr = String(opt || '');
          const optLength = optStr.length;
          const words = optStr.split(/[\s,()/]+/);
          const maxWordLen = Math.max(0, ...words.map(w => w.length));

          // Dynamic typography scaling based on string & word length
          let fontClass = 'text-2xl sm:text-3xl font-black';
          if (isTextChoices) {
            if (optLength >= 24 || maxOptLen >= 25) {
              fontClass = 'text-xs sm:text-sm leading-tight tracking-tight font-bold';
            } else if (optLength >= 16 || maxOptLen >= 18 || maxWordLen >= 11 || maxOverallWordLen >= 12) {
              fontClass = 'text-xs sm:text-sm md:text-base leading-tight font-bold';
            } else if (optLength >= 9 || maxOptLen >= 11 || maxWordLen >= 7) {
              fontClass = 'text-sm sm:text-base md:text-lg leading-snug font-bold';
            } else {
              fontClass = 'text-base sm:text-lg md:text-xl leading-snug font-black';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={pruned}
              onClick={() => {
                if (pruned) return;
                soundFx.playKeyTap();
                if (onSubmit) {
                  onSubmit(opt);
                } else {
                  handleInputDigit(opt);
                }
              }}
              className={`w-full py-2.5 sm:py-3.5 px-2 sm:px-3 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all min-h-[52px] sm:min-h-[58px] ${
                pruned
                  ? 'opacity-20 pointer-events-none grayscale scale-95 cursor-not-allowed bg-slate-400 border-slate-500'
                  : `active:scale-95 cursor-pointer ${colorClass}`
              }`}
            >
              <span className={`w-full max-w-full text-center break-words [overflow-wrap:anywhere] hyphens-auto px-0.5 ${fontClass}`}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const isTimeQuestion = Boolean(
    (problemType && problemType.includes('time')) ||
    (answerString && answerString.includes(':')) ||
    (displayString && /\d+:\d+/.test(displayString)) ||
    operatorSymbol === '⏰'
  );

  const isFractionQuestion = Boolean(
    (problemType && (problemType.includes('fraction') || problemType.includes('rational') || problemType.includes('ratio') || problemType.includes('applied'))) ||
    (answerString && (answerString.includes('/') || answerString.includes(':'))) ||
    (displayString && (displayString.includes('/') || displayString.includes(':') || displayString.toLowerCase().includes('ratio') || displayString.toLowerCase().includes('probability')))
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
    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2 p-2.5 bg-slate-100/90 rounded-3xl border-2 border-slate-200 shadow-inner my-2">
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

        const pruned = isKeyPruned(keyVal);

        return (
          <button
            key={`${keyVal}-${idx}`}
            disabled={pruned}
            onClick={() => {
              if (pruned) return;
              handleKeyClick(keyVal);
            }}
            className={`btn-3d-key transition-all ${
              pruned
                ? 'opacity-20 pointer-events-none grayscale scale-95 cursor-not-allowed bg-slate-200 text-slate-400 border-slate-300 shadow-none'
                : 'text-slate-800'
            }`}
            aria-label={`Digit ${keyVal}`}
          >
            {keyVal}
          </button>
        );
      })}
    </div>
  );
}
