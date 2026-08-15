const fs = require('fs');
let content = fs.readFileSync('src/components/WordsSessionView.jsx', 'utf8');
content = content.replace(/NUMERIC KEYPAD \(AUTO-DETECTING & TYPE AWARE\)/, 'QWERTY KEYBOARD');
fs.writeFileSync('src/components/WordsSessionView.jsx', content);
