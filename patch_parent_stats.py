import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# I need to find where props like `streak`, `totalProblemsSolved`, `tier`, `sparks`, `unlockedBadges` are used
# and replace them with data from `liveUserData`

# 1. Update streak
content = content.replace("const childStreak = activeUserData.streak ?? streak ?? 1;",
                          "const childStreak = activeUserData.streak ?? 1;")

# 2. Update totalProblemsSolved
content = content.replace("const childTotalSolved = activeUserData.totalProblemsSolved ?? totalProblemsSolved ?? 0;",
                          "const childTotalSolved = activeUserData.totalProblemsSolved ?? 0;")

with open('src/components/ParentDashboardModal.jsx', 'w') as f:
    f.write(content)
