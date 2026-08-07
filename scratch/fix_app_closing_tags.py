import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# First, undo the previous bad closing tag addition
content = content.replace(
"""      </div>
      {/* Spacing element to prevent bottom nav from covering content */}""",
"""      {/* Spacing element to prevent bottom nav from covering content */}"""
)

# Now put it right before the bottom navigation bar so the nav bar stretches full width and is fixed at the bottom
# actually wait, the navigation bar has `fixed bottom-0 left-0 right-0 w-full` so it will be full width regardless.
# But it's cleaner to have the inner content block enclose all modals? Let's check where modals are.
# Modals typically are `fixed inset-0` so they don't care.

# Let's insert the closing </div> right before the bottom nav bar
target = "{/* Bottom Navigation Bar */}"
content = content.replace(target, "</div>\n      " + target)

with open('src/App.jsx', 'w') as f:
    f.write(content)
