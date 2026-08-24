const fs = require('fs');
const content = fs.readFileSync('src/components/PerfectMonthProgressModal.jsx', 'utf-8');

const updatedContent = content.replace('shadow-bouncy', 'shadow-clay-purple');

fs.writeFileSync('src/components/PerfectMonthProgressModal.jsx', updatedContent);
