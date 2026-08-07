import re
import os

# Delete obsolete files
for f in [
    "src/components/QuitSprintModal.jsx",
    "src/components/SprintResultsModal.jsx",
    "src/components/TierIntroModal.jsx",
    "src/components/WorldMap.jsx"
]:
    if os.path.exists(f): os.remove(f)

# Patch storage/services
for f in ["src/services/parentChildService.js", "src/services/syncService.js", "src/services/storageService.js", "src/components/AdaptiveSessionView.jsx", "src/utils/domainStats.js", "src/utils/badgeManager.js", "src/components/ParentDashboardModal.jsx", "src/components/DevControlPanel.jsx", "src/utils/itemsCatalog.js", "src/data/badges.js"]:
    with open(f, "r") as file:
        content = file.read()

    content = content.replace("sprintHistory", "sessionHistory")
    content = content.replace("hideSprintTimer", "hideSessionTimer")
    content = content.replace("recentSprints", "recentSessions")
    content = content.replace("(sprint, i)", "(sessionData, i)")
    content = content.replace("sprint.date", "sessionData.date")
    content = content.replace("sprint.totalTimeSec", "sessionData.totalTimeSec")
    content = content.replace("sprint.durationInSeconds", "sessionData.durationInSeconds")
    content = content.replace("sprint.accuracyPct", "sessionData.accuracyPct")
    content = content.replace("sprint.correctCount", "sessionData.correctCount")
    content = content.replace("sprint.score", "sessionData.score")
    content = content.replace("sprint.totalQuestions", "sessionData.totalQuestions")
    content = content.replace("sprint.answers", "sessionData.answers")
    content = content.replace("sprint.ratingGain", "sessionData.ratingGain")

    content = content.replace("sprint)", "sessionData)")
    content = content.replace("sprint =>", "sessionData =>")
    content = content.replace("sprint history", "session history")
    content = content.replace("sprint.tier", "sessionData.tier")
    content = content.replace("sprintDate", "sessionDate")
    content = content.replace("lastSprintResult", "lastSessionResult")
    content = content.replace("latestSprint", "latestSession")
    content = content.replace("previousSprint", "previousSession")
    content = content.replace("sprintTime", "sessionTime")

    content = content.replace("SPRINT BACKGROUNDS", "SESSION BACKGROUNDS")
    content = content.replace("RECORD COMPLETED CLIMB BLOCK INTO SPRINT HISTORY", "RECORD COMPLETED CLIMB BLOCK INTO SESSION HISTORY")

    with open(f, "w") as file:
        file.write(content)
