const fs = require('fs');

let content = fs.readFileSync('src/utils/badgeManager.js', 'utf8');
content = content.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData('math')");
fs.writeFileSync('src/utils/badgeManager.js', content);

let content2 = fs.readFileSync('src/utils/linkPromptLogic.js', 'utf8');
content2 = content2.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData('math')");
fs.writeFileSync('src/utils/linkPromptLogic.js', content2);
