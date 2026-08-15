const fs = require('fs');
let content = fs.readFileSync('src/components/WordsSessionView.jsx', 'utf8');

const keypadOld = /\{\/\* NUMERIC KEYPAD[\s\S]*?<\/Keypad>\n\s+<\/div>\n\s+\}\)/;
const keypadNew = `{/* QWERTY KEYBOARD */}
      {hasStartedClimb && (
        <div className="w-full max-w-sm shrink-0 animate-pop mt-0.5 sm:mt-2 max-h-[35vh]">
          <QwertyKeyboard
            onChar={handleCharInput}
            onDelete={handleDeleteDigit}
            onClear={handleClearInput}
            onSubmit={(val) => {
              const answerToSubmit = typeof val === 'string' && val.trim() ? val : inputVal;
              processAnswerEvaluation(answerToSubmit);
            }}
          />
        </div>
      )}`;
content = content.replace(keypadOld, keypadNew);
content = content.replace(/import Keypad from '\.\/Keypad';/, '');

fs.writeFileSync('src/components/WordsSessionView.jsx', content);
