import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Replace root div
content = content.replace(
    '<div className="app-viewport-root p-2 sm:p-4 safe-pt max-w-lg mx-auto relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50">',
    '<div className="app-viewport-root w-full h-full relative bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50">\n      <div className="w-full h-full max-w-lg mx-auto flex flex-col p-2 sm:p-4 safe-pt relative">'
)

# And add the closing div at the end before the footer/spacing element
# Let's find the closing tag for the main container
pattern = r'(      \{\/\* Spacing element to prevent bottom nav from covering content \*\/}[\s\S]*?)(    <\/div>\n  \);\n\})'

content = re.sub(pattern, r'      </div>\n\1\2', content)

with open('src/App.jsx', 'w') as f:
    f.write(content)
