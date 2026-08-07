import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# Fix usage of sprintHistory -> historyList
content = content.replace("calculateAdaptiveCompetenceProfile(sprintHistory, currentMathTier", "calculateAdaptiveCompetenceProfile(activeUserData.sprintHistory || [], currentMathTier")

with open('src/components/ParentDashboardModal.jsx', 'w') as f:
    f.write(content)
