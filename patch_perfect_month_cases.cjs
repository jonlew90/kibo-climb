const fs = require('fs');
const content = fs.readFileSync('src/utils/badgeManager.js', 'utf-8');

const casesToAdd = `
      case 'perfect_month_0': unlocked = checkPerfectMonth(0); break;
      case 'perfect_month_1': unlocked = checkPerfectMonth(1); break;
      case 'perfect_month_2': unlocked = checkPerfectMonth(2); break;
      case 'perfect_month_3': unlocked = checkPerfectMonth(3); break;
      case 'perfect_month_4': unlocked = checkPerfectMonth(4); break;
      case 'perfect_month_5': unlocked = checkPerfectMonth(5); break;
      case 'perfect_month_6': unlocked = checkPerfectMonth(6); break;
      case 'perfect_month_7': unlocked = checkPerfectMonth(7); break;
      case 'perfect_month_8': unlocked = checkPerfectMonth(8); break;
      case 'perfect_month_9': unlocked = checkPerfectMonth(9); break;
      case 'perfect_month_10': unlocked = checkPerfectMonth(10); break;
      case 'perfect_month_11': unlocked = checkPerfectMonth(11); break;
`;

const replaceTarget2 = "      case 'early_bird': {";
const updatedContent2 = content.replace(replaceTarget2, casesToAdd + '\n' + replaceTarget2);

fs.writeFileSync('src/utils/badgeManager.js', updatedContent2);
