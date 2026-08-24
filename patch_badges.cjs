const fs = require('fs');
const content = fs.readFileSync('src/data/badges.js', 'utf-8');

const badgesToAdd = `
  // ==========================================
  // PERFECT MONTH BADGES
  // ==========================================
  { id: 'perfect_month_0', title: 'Perfect January', description: 'Completed a climb every single day in January!', category: 'consistency', icon: '❄️', reqText: 'Play every day in January' },
  { id: 'perfect_month_1', title: 'Perfect February', description: 'Completed a climb every single day in February!', category: 'consistency', icon: '💝', reqText: 'Play every day in February' },
  { id: 'perfect_month_2', title: 'Perfect March', description: 'Completed a climb every single day in March!', category: 'consistency', icon: '☘️', reqText: 'Play every day in March' },
  { id: 'perfect_month_3', title: 'Perfect April', description: 'Completed a climb every single day in April!', category: 'consistency', icon: '🌸', reqText: 'Play every day in April' },
  { id: 'perfect_month_4', title: 'Perfect May', description: 'Completed a climb every single day in May!', category: 'consistency', icon: '🌺', reqText: 'Play every day in May' },
  { id: 'perfect_month_5', title: 'Perfect June', description: 'Completed a climb every single day in June!', category: 'consistency', icon: '☀️', reqText: 'Play every day in June' },
  { id: 'perfect_month_6', title: 'Perfect July', description: 'Completed a climb every single day in July!', category: 'consistency', icon: '🎆', reqText: 'Play every day in July' },
  { id: 'perfect_month_7', title: 'Perfect August', description: 'Completed a climb every single day in August!', category: 'consistency', icon: '🏕️', reqText: 'Play every day in August' },
  { id: 'perfect_month_8', title: 'Perfect September', description: 'Completed a climb every single day in September!', category: 'consistency', icon: '🍎', reqText: 'Play every day in September' },
  { id: 'perfect_month_9', title: 'Perfect October', description: 'Completed a climb every single day in October!', category: 'consistency', icon: '🎃', reqText: 'Play every day in October' },
  { id: 'perfect_month_10', title: 'Perfect November', description: 'Completed a climb every single day in November!', category: 'consistency', icon: '🦃', reqText: 'Play every day in November' },
  { id: 'perfect_month_11', title: 'Perfect December', description: 'Completed a climb every single day in December!', category: 'consistency', icon: '🎄', reqText: 'Play every day in December' },
`;

const updatedContent = content.replace('  // ==========================================\n  // 2. KIBO MATH BADGES\n  // ==========================================', badgesToAdd + '\n  // ==========================================\n  // 2. KIBO MATH BADGES\n  // ==========================================');

fs.writeFileSync('src/data/badges.js', updatedContent);
