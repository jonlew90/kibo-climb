const fs = require('fs');
const content = fs.readFileSync('src/utils/badgeManager.js', 'utf-8');

const logicToAdd = `
  // Combine all subjects' sprint history to evaluate perfect month badges globally
  const allSubjects = globalProfile?.userData?.subjects || {};
  let combinedGlobalHistory = [...(Array.isArray(sprintHistory) ? sprintHistory : [])];
  Object.values(allSubjects).forEach((sub) => {
    if (Array.isArray(sub?.sprintHistory)) {
      combinedGlobalHistory.push(...sub.sprintHistory);
    }
  });

  // Calculate unique active days per month
  const monthlyActiveDays = {};
  combinedGlobalHistory.forEach((item) => {
    if (!item) return;
    let logicalDateStr;
    if (item.date) {
      logicalDateStr = item.date; // assuming item.date is already 'YYYY-MM-DD'
    } else if (item.timestamp) {
      const logicalDate = getLogicalDate(new Date(item.timestamp), CUTOFF_HOUR);
      logicalDateStr = \`\${logicalDate.getFullYear()}-\${String(logicalDate.getMonth() + 1).padStart(2, '0')}-\${String(logicalDate.getDate()).padStart(2, '0')}\`;
    }
    if (logicalDateStr) {
      const [y, m, d] = logicalDateStr.split('-');
      const monthKey = \`\${y}-\${m}\`;
      if (!monthlyActiveDays[monthKey]) {
        monthlyActiveDays[monthKey] = new Set();
      }
      monthlyActiveDays[monthKey].add(d);
    }
  });

  const checkPerfectMonth = (monthIndex) => {
    // Check across all years in history for this specific month (0-11)
    for (const [monthKey, daysSet] of Object.entries(monthlyActiveDays)) {
      const [y, m] = monthKey.split('-');
      const yearInt = parseInt(y, 10);
      const monthInt = parseInt(m, 10) - 1; // 0-indexed
      if (monthInt === monthIndex) {
        const totalDays = getDaysInMonth(yearInt, monthInt);
        if (daysSet.size >= totalDays) {
          return true;
        }
      }
    }
    return false;
  };
`;

const replaceTarget = "  BADGES_CATALOG.forEach((badge) => {";

const updatedContent = content.replace(replaceTarget, logicToAdd + '\n' + replaceTarget);

fs.writeFileSync('src/utils/badgeManager.js', updatedContent);
