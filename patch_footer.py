import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Original top header for reference:
# sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 px-2 py-1.5 flex items-center justify-between shadow-sm rounded-2xl mb-2 shrink-0 gap-1.5 overflow-x-auto hide-scrollbar

# Original bottom footer:
# fixed bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200/80 px-2 pt-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-nav

# New bottom footer:
# sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-2 border-slate-200/80 px-2 pt-2 flex items-center justify-around shadow-sm rounded-2xl pb-safe-nav mt-auto shrink-0

old_footer = 'className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200/80 px-2 pt-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-nav"'
new_footer = 'className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-2 border-slate-200/80 px-2 pt-2 flex items-center justify-around shadow-sm rounded-2xl pb-safe-nav mt-auto shrink-0"'

content = content.replace(old_footer, new_footer)

with open('src/App.jsx', 'w') as f:
    f.write(content)
