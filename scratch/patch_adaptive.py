import re

with open('src/components/AdaptiveSessionView.jsx', 'r') as f:
    content = f.read()

# Replace root div to be full width, then add an inner container for the max-w-lg
content = content.replace(
    '<div className="w-full h-full flex-1 min-h-0 flex flex-col items-center justify-between py-1 px-1 sm:px-2 max-w-lg mx-auto relative overflow-hidden animate-pop">',
    '<div className="w-full h-full flex-1 min-h-0 relative overflow-hidden animate-pop">\n      <div className="w-full h-full flex flex-col items-center justify-between py-1 px-1 sm:px-2 max-w-lg mx-auto relative">'
)

# And add the closing div at the end before the main closing div
pattern = r'(    <\/div>\n  \);\n\})'
content = re.sub(pattern, r'      </div>\n\1', content)

with open('src/components/AdaptiveSessionView.jsx', 'w') as f:
    f.write(content)
