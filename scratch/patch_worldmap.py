import re

with open('src/components/WorldMap.jsx', 'r') as f:
    content = f.read()

# Replace root div to be full width
content = content.replace(
    '<div className="w-full flex-1 flex flex-col items-center justify-between py-3 px-2 sm:px-4 max-w-lg mx-auto animate-pop relative">',
    '<div className="w-full flex-1 animate-pop relative">\n      <div className="w-full h-full flex flex-col items-center justify-between py-3 px-2 sm:px-4 max-w-lg mx-auto relative">'
)

# And add the closing div at the end
pattern = r'(    <\/div>\n  \);\n\})'
content = re.sub(pattern, r'      </div>\n\1', content)

with open('src/components/WorldMap.jsx', 'w') as f:
    f.write(content)
