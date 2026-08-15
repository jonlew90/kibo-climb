const fs = require('fs');

let content = fs.readFileSync('src/components/ParentDashboardModal.jsx', 'utf8');

// Replace all getUserData() calls to respect activeSubject but default to math
content = content.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData('math')");

fs.writeFileSync('src/components/ParentDashboardModal.jsx', content);
