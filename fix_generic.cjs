const fs = require('fs');

const files = [
  'src/services/parentChildService.js',
  'src/services/shopLedgerService.js',
  'src/services/syncService.js',
  'src/services/authService.js',
  'src/services/userSyncService.js',
  'src/components/TierIntroModal.jsx',
  'src/components/AccountLinkModal.jsx',
  'src/components/DevControlPanel.jsx',
  'src/hooks/useDevState.js'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData('math')");
  fs.writeFileSync(file, content);
}
