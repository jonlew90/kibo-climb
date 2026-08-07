import re

with open('src/components/ProfileSelectorScreen.jsx', 'r') as f:
    content = f.read()

# Replace root div to add inner container
content = content.replace(
    '<div className="fixed inset-0 z-[900] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 select-none overflow-hidden">',
    '<div className="fixed inset-0 z-[900] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 select-none overflow-hidden">\n      <div className="w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center p-4 relative">'
)

# And add the closing div at the end
pattern = r'(    <\/div>\n  \);\n\})'
content = re.sub(pattern, r'      </div>\n\1', content)

with open('src/components/ProfileSelectorScreen.jsx', 'w') as f:
    f.write(content)
