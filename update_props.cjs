const fs = require('fs');

// Update App.jsx to pass activeSubject to modals/screens
let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Dashboard modal
appContent = appContent.replace(
  /<ParentDashboardModal/,
  `<ParentDashboardModal\n        activeSubject={activeSubject}`
);

// Badges modal
appContent = appContent.replace(
  /<BadgesModal/,
  `<BadgesModal\n        activeSubject={activeSubject}`
);

// Leaderboard screen
appContent = appContent.replace(
  /<LeaderboardScreen/,
  `<LeaderboardScreen\n          activeSubject={activeSubject}`
);

fs.writeFileSync('src/App.jsx', appContent);

// Update ParentDashboardModal.jsx to use activeSubject prop
let dashboardContent = fs.readFileSync('src/components/ParentDashboardModal.jsx', 'utf8');
dashboardContent = dashboardContent.replace(
  /export default function ParentDashboardModal\(\{/,
  `export default function ParentDashboardModal({\n  activeSubject = 'math',`
);
dashboardContent = dashboardContent.replace(
  /storageService\.getUserData\('math'\)/g,
  `storageService.getUserData(activeSubject)`
);
// Make sure initial state picks it up properly or uses effect
dashboardContent = dashboardContent.replace(
  /const \[liveUserData, setLiveUserData\] = useState\(\(\) => storageService\.getUserData\(activeSubject\)\);/,
  `const [liveUserData, setLiveUserData] = useState(() => storageService.getUserData(activeSubject));

  useEffect(() => {
    setLiveUserData(storageService.getUserData(activeSubject));
  }, [activeSubject, isOpen]);`
);
fs.writeFileSync('src/components/ParentDashboardModal.jsx', dashboardContent);

// Update LeaderboardScreen.jsx to fetch based on aggregate vs math
let leaderboardContent = fs.readFileSync('src/components/LeaderboardScreen.jsx', 'utf8');
leaderboardContent = leaderboardContent.replace(
  /export default function LeaderboardScreen\(\{/,
  `export default function LeaderboardScreen({\n  activeSubject = 'math',`
);
fs.writeFileSync('src/components/LeaderboardScreen.jsx', leaderboardContent);
