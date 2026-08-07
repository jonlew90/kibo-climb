import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# Replace any usages of App.jsx passed stats with the profile specific ones
# since App.jsx only sends the active profile's state.
# ParentDashboardModal receives: tier, streak, sparks, practiceQueueCount, practiceQueue, sprintHistory, practiceDays, unlockedBadges, totalProblemsSolved, personalRecords
# We should probably use `liveUserData` inside the dashboard instead of the props for the overview and settings.

# For example, practiceDays
content = content.replace("practiceDays.includes(d.idx)", "(storageService.getProfileById(viewingProfileId)?.practiceDays || []).includes(d.idx)")
content = content.replace("const isActive = (storageService.getProfileById(viewingProfileId)?.practiceDays || []).includes(d.idx);",
                          "const profileDays = storageService.getProfileById(viewingProfileId)?.practiceDays || [1, 2, 3, 4, 5];\n                  const isActive = profileDays.includes(d.idx);")

content = content.replace("let newDays;\n                        if (isActive) {\n                          if (practiceDays.length === 1) return;\n                          newDays = practiceDays.filter((idx) => idx !== d.idx);\n                        } else {\n                          newDays = [...practiceDays, d.idx].sort();\n                        }",
                          "let newDays;\n                        if (isActive) {\n                          if (profileDays.length === 1) return;\n                          newDays = profileDays.filter((idx) => idx !== d.idx);\n                        } else {\n                          newDays = [...profileDays, d.idx].sort();\n                        }")

content = content.replace("onUpdatePracticeDays(newDays);", "storageService.saveProfilePracticeDays(viewingProfileId, newDays);")

# We need to add saveProfilePracticeDays with an ID parameter to storageService
with open('src/components/ParentDashboardModal.jsx', 'w') as f:
    f.write(content)
