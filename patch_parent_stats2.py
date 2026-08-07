import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# Let's check other props used from App.jsx that shouldn't be:
# - tier
# - sparks
# - practiceQueueCount
# - practiceQueue
# - sprintHistory
# - unlockedBadges
# - personalRecords

# But they are destructured in the component signature:
#   tier,
#   onSetTier,
#   streak,
#   sparks,
#   practiceQueueCount,
#   practiceQueue = [],
#   sprintHistory,
#   ...

# Let's see if they are used directly.
# Replace any usage of `tier` with `currentMathTier` if applicable, or remove the props.
# `tier` is passed to `ParentDashboardModal` but inside the component it computes `currentMathTier`:
# const childRating = activeUserData.adaptiveCompetenceRating || activeUserData.competenceRank || 1000;
# const currentMathTier = getTierFromRating(childRating);

# We need to make sure we don't just replace blindly. Let's see how `tier` is used.
