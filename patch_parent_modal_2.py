import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# Make sure the delete profile has activeProfileId inside for `deleteProfile`
content = content.replace("onClick={() => handleDeleteProfile(activeProfileId)}", "onClick={() => handleDeleteProfile(viewingProfileId)}")

with open('src/components/ParentDashboardModal.jsx', 'w') as f:
    f.write(content)
