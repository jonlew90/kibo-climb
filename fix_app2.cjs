const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace all remaining getUserData calls in App.jsx to use activeSubject
content = content.replace(/storageService\.getUserData\(\)/g, "storageService.getUserData(activeSubject)");

fs.writeFileSync('src/App.jsx', content);
