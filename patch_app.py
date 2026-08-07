import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Add a state for showing manual profile switcher
state_addition = """  // Manual Profile Switcher State
  const [showManualProfileSwitcher, setShowManualProfileSwitcher] = useState(false);"""

content = content.replace("  // Consecutive problem miss tracking for Micro-Hints", state_addition + "\n\n  // Consecutive problem miss tracking for Micro-Hints")

# Add the Switch Profile button in the top HUD
# Right before the Parent Zone button
switch_btn = """            {storageService.getAllProfiles().length > 1 && (
              <button
                onClick={() => {
                  soundFx.playKeyTap();
                  setShowManualProfileSwitcher(true);
                }}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 shrink-0"
                title="Switch Profile"
              >
                <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            )}"""

# Replace the closing of action buttons to inject it
content = content.replace("""            <button
              onClick={() => setShowPinGateModal(true)}
              className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-700 active:scale-95 transition-all shadow-2xs shrink-0"
              title="Parent Zone (PIN Protected)"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>""", switch_btn + """
            <button
              onClick={() => setShowPinGateModal(true)}
              className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-700 active:scale-95 transition-all shadow-2xs shrink-0"
              title="Parent Zone (PIN Protected)"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>""")

# Import Users in App.jsx if missing. Let's see if Users is imported.
if "Users" not in content.split("from 'lucide-react';")[0]:
    content = content.replace("UserPlus", "UserPlus, Users")
    content = content.replace("Compass, MapPin", "Compass, MapPin, Users")

# Render manual ProfileSelectorScreen conditionally
# Right below the auto profile selector
manual_switcher = """
      {/* MANUAL PROFILE SELECTOR */}
      {showManualProfileSwitcher && (
        <ProfileSelectorScreen
          onSelectProfile={(profile) => {
            syncAppStateWithStorage();
            setShowManualProfileSwitcher(false);
          }}
          onClose={() => setShowManualProfileSwitcher(false)}
        />
      )}
"""
content = content.replace("{/* FIRST LAUNCH ONBOARDING MODAL */}", manual_switcher + "\n      {/* FIRST LAUNCH ONBOARDING MODAL */}")

with open('src/App.jsx', 'w') as f:
    f.write(content)
