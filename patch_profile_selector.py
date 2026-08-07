import re

with open('src/components/ProfileSelectorScreen.jsx', 'r') as f:
    content = f.read()

# Make it accept onClose prop
content = content.replace("export default function ProfileSelectorScreen({ onSelectProfile }) {",
                          "export default function ProfileSelectorScreen({ onSelectProfile, onClose }) {")

# Add X from lucide-react
if "X" not in content.split("from 'lucide-react';")[0]:
    content = content.replace("User }", "User, X }")

# Add close button inside the modal wrapper
close_btn = """
      {onClose && (
        <button
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
"""
content = content.replace("<div className=\"absolute top-0 left-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none\" />",
                          close_btn + "\n      <div className=\"absolute top-0 left-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none\" />")

with open('src/components/ProfileSelectorScreen.jsx', 'w') as f:
    f.write(content)
