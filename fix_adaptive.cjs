const fs = require('fs');
let content = fs.readFileSync('src/components/AdaptiveSessionView.jsx', 'utf8');

content = content.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData('math')");

fs.writeFileSync('src/components/AdaptiveSessionView.jsx', content);
