import re

with open('src/components/SkillMapScreen.jsx', 'r') as f:
    content = f.read()

# Replace root div to be full width
# The root is `<div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">`
# We want to wrap the contents in a constrained div `w-full h-full max-w-lg mx-auto flex flex-col relative`

content = content.replace(
    '<div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 flex flex-col w-full h-full overflow-hidden animate-fade-in text-slate-800">',
    '<div className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 w-full h-full overflow-hidden animate-fade-in text-slate-800">\n      <div className="w-full h-full max-w-lg mx-auto flex flex-col relative">'
)

# And add the closing div at the end
pattern = r'(    <\/div>\n  \);\n\})'
content = re.sub(pattern, r'      </div>\n\1', content)

with open('src/components/SkillMapScreen.jsx', 'w') as f:
    f.write(content)
