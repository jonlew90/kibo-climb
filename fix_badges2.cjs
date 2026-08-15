const fs = require('fs');

let content = fs.readFileSync('src/components/BadgesModal.jsx', 'utf8');

content = content.replace(
  /export default function BadgesModal\(\{/,
  `export default function BadgesModal({\n  activeSubject = 'math',`
);

content = content.replace(
  /storageService\.getUserData\(\)/g,
  `storageService.getUserData(activeSubject)`
);

fs.writeFileSync('src/components/BadgesModal.jsx', content);
