const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf-8');
const fixed = content.replace("  React.useEffect(() => { window.testRecordDailyPractice = recordDailyPractice; }, [recordDailyPractice]);\n  const recordDailyPractice = () => {", "  const recordDailyPractice = () => {");
fs.writeFileSync('src/App.jsx', fixed);
