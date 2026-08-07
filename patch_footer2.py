import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Let's adjust the top sticky header to also have border-2 so they match perfectly,
# or we can leave it if the user just wanted the bottom to match the top's overall look (rounded).
# Top is `border-b-2 border-slate-200/80` and `rounded-2xl`. Wait, if it has `rounded-2xl` but only `border-b-2`, the other sides have no border. Let's make top header `border-2 border-slate-200/80`.
old_header = 'className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 px-2 py-1.5 flex items-center justify-between shadow-sm rounded-2xl mb-2 shrink-0 gap-1.5 overflow-x-auto hide-scrollbar"'
new_header = 'className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-2 border-slate-200/80 px-2 py-1.5 flex items-center justify-between shadow-sm rounded-2xl mb-2 shrink-0 gap-1.5 overflow-x-auto hide-scrollbar"'

content = content.replace(old_header, new_header)

with open('src/App.jsx', 'w') as f:
    f.write(content)
