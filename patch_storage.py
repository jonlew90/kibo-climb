import re

with open('src/services/storageService.js', 'r') as f:
    content = f.read()

# Add getProfileById
new_method = """  getProfileById(id) {
    const state = safeGetProfilesState();
    return state.profiles[id] || null;
  },
  getActiveProfile() {"""

content = content.replace("  getActiveProfile() {", new_method)

with open('src/services/storageService.js', 'w') as f:
    f.write(content)
