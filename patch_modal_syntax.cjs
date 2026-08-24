const fs = require('fs');
const content = fs.readFileSync('src/components/PerfectMonthProgressModal.jsx', 'utf-8');

const updatedContent = content.replace(/\\\`You've climbed every single day in \\\$\{currentMonthName\}!\\\`/g, "\`You've climbed every single day in \${currentMonthName}!\`")
                              .replace(/\\\`You've played \\\$\{daysPlayedThisMonth\} days in \\\$\{currentMonthName\} so far.\\\`/g, "\`You've played \${daysPlayedThisMonth} days in \${currentMonthName} so far.\`");

fs.writeFileSync('src/components/PerfectMonthProgressModal.jsx', updatedContent);
