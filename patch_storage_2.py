import re

with open('src/services/storageService.js', 'r') as f:
    content = f.read()

# Add saveProfilePracticeDaysWithId
new_method = """  saveProfilePracticeDays(profileIdOrDays, days) {
    const state = safeGetProfilesState();
    let targetId, newDays;

    if (typeof profileIdOrDays === 'string' && Array.isArray(days)) {
      targetId = profileIdOrDays;
      newDays = days;
    } else {
      targetId = state.activeProfileId || DEFAULT_PROFILE_ID;
      newDays = profileIdOrDays;
    }

    if (!state.profiles[targetId]) {
      state.profiles[targetId] = { ...DEFAULT_PROFILE, id: targetId };
    }
    state.profiles[targetId].practiceDays = newDays;
    safeSaveProfilesState(state);
  },"""

content = content.replace("""  saveProfilePracticeDays(days) {
    const state = safeGetProfilesState();
    const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
    if (!state.profiles[activeId]) {
      state.profiles[activeId] = { ...DEFAULT_PROFILE, id: activeId };
    }
    state.profiles[activeId].practiceDays = days;
    safeSaveProfilesState(state);
  },""", new_method)

with open('src/services/storageService.js', 'w') as f:
    f.write(content)
