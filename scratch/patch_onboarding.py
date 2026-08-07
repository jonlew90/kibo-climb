import re

with open('src/components/FirstLaunchOnboardingModal.jsx', 'r') as f:
    content = f.read()

# Replace root div of the main screen
# The root of the main screen is: `<div className="fixed inset-0 z-[1000] w-vw h-[100dvh] max-h-[100dvh] bg-[#fdfbf7] bg-gradient-to-b from-amber-50 via-sky-50 to-teal-50 text-slate-800 flex flex-col justify-between overflow-hidden overflow-x-hidden select-none animate-pop border-none">`
# The inner is `w-full max-w-2xl mx-auto min-h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 box-border relative z-10 text-center gap-4`
# That inner is already constrained to max-w-2xl and centered, and the outer is full width!

# Wait, FirstLaunchOnboardingModal is ALREADY full screen!
# The outer div has `fixed inset-0 w-vw h-[100dvh] bg-gradient-to-b ... flex flex-col justify-between ...`
# The inner is `w-full max-w-2xl mx-auto`
# So the outer background ALREADY stretches full width!

pass
