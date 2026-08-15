const fs = require('fs');
let content = fs.readFileSync('src/components/WordsSessionView.jsx', 'utf8');

const keypadOld = /<Keypad[\s\S]*?\/>/;
const keypadNew = `<QwertyKeyboard
            onChar={handleCharInput}
            onDelete={handleDeleteDigit}
            onClear={handleClearInput}
            onSubmit={(val) => {
              const answerToSubmit = typeof val === 'string' && val.trim() ? val : inputVal;
              processAnswerEvaluation(answerToSubmit);
            }}
          />`;
content = content.replace(keypadOld, keypadNew);

fs.writeFileSync('src/components/WordsSessionView.jsx', content);
