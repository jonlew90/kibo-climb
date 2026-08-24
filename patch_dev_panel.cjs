const fs = require('fs');
const content = fs.readFileSync('src/components/DevControlPanel.jsx', 'utf-8');

const updatedContent = content.replace(
  "</button>",
  "</button>\n<button onClick={() => window.testRecordDailyPractice && window.testRecordDailyPractice()} className=\"w-full py-1.5 px-3 bg-fuchsia-50 text-fuchsia-700 border-2 border-fuchsia-200 rounded-xl font-bold hover:bg-fuchsia-100\">Trigger Daily Practice</button>"
);

fs.writeFileSync('src/components/DevControlPanel.jsx', updatedContent);
