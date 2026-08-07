import re

with open("src/App.jsx", "r") as f:
    content = f.read()

# 1. REMOVE SPRINT/WORLDMAP IMPORTS
content = re.sub(r"import QuitSprintModal from '\./components/QuitSprintModal';\n", "", content)
content = re.sub(r"import WorldMap from '\./components/WorldMap';\n", "", content)
content = re.sub(r"import SprintResultsModal from '\./components/SprintResultsModal';\n", "", content)

# 2. RENAME SPRINT HISTORY TO SESSION HISTORY
content = content.replace("sprintHistory", "sessionHistory")
content = content.replace("setSprintHistory", "setSessionHistory")
content = content.replace("Persistent Sprint History", "Persistent Session History")
content = content.replace("kibo_math_sprint_history", "kibo_math_session_history")

# 3. FIX APPSTATE REMOVING WORLDMAP & SPRINT & VICTORY & SKILL_MAP
# The user wants to remove obsolete features. WorldMap and Sprints are dead.
# `victory` and `skill_map` were tied to sprint/test-outs. Adaptive session handles its own victory.
# We will remove them from the appState type comment and logic.
content = content.replace("| 'sprint' | 'victory' | 'skill_map' | 'world_map' | 'placement_test'", "| 'placement_test'")
content = content.replace("!['sprint', 'victory', 'skill_map', 'placement_test']", "!['placement_test']")
content = content.replace("appState === 'world_map' ||", "")
content = content.replace("appState !== 'sprint'", "true")

# 4. REMOVE MODAL STATES
# Removed modals: QuitSprintModal, SprintResultsModal, WorldMap (not modal but view), TierIntroModal (used in WorldMap).
# Also TestOutFail/Pass modals were only used in the test-out sprints which are now dead.
content = re.sub(r"^\s*const \[showQuitModal, setShowQuitModal\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[showSprintResultsModal, setShowSprintResultsModal\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[showTestOutPassModal, setShowTestOutPassModal\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[showTestOutFailModal, setShowTestOutFailModal\] = useState\(false\);\n", "", content, flags=re.MULTILINE)

# Remove them from isAppPaused
content = content.replace(" || showQuitModal", "")
content = content.replace(" || showSprintResultsModal", "")
content = content.replace(" || showTestOutPassModal", "")
content = content.replace(" || showTestOutFailModal", "")

# 5. FIX THE LAUNCH VIEW BUTTONS
# In the `appState === 'launch'` section, buttons call `startNewSprint` or `setAppState('world_map')` or `startTestOutSprint`.
# We want them all to just do `setAppState('adaptive_session')`. So we don't crash, we won't delete the buttons unless necessary,
# but we will replace their click handlers.
content = content.replace("startNewSprint(false)", "setAppState('adaptive_session')")
content = content.replace("startNewSprint(true)", "setAppState('adaptive_session')")
content = content.replace("startTestOutSprint(selectedTier)", "setAppState('adaptive_session')")
content = content.replace("setAppState('world_map')", "setAppState('adaptive_session')")
content = content.replace("setAppState('skill_map')", "setAppState('adaptive_session')")
content = content.replace("handleOpenWorkshop('world_map')", "handleOpenWorkshop('adaptive_session')")

# Wait, there's a button for "World Map Trail". We can probably just delete that button entirely, but changing to adaptive_session is safer.
# Same for Boss Challenge.

# 6. DELETE DEAD VIEWS (Sprint, Victory, Skill Map, World Map)
def cut_between(content, start_str, end_str):
    start_idx = content.find(start_str)
    if start_idx == -1: return content
    end_idx = content.find(end_str, start_idx)
    if end_idx == -1: return content
    return content[:start_idx] + content[end_idx:]

content = cut_between(content, "{/* STATE 2: ACTIVE SPRINT VIEW */}", "{/* STATE 4: PLACEMENT TEST DIAGNOSTIC */}")
content = cut_between(content, "{/* SKILL MAP ROADMAP SCREEN */}", "{/* STATE 1: LAUNCH SCREEN (Default Child Play Dashboard) */}")
content = cut_between(content, "{/* TEST-OUT PASS CELEBRATION MODAL */}", "{/* STREAK SAVED MODAL */}")

# Remove QuitSprint and SprintResults Modals from render
content = cut_between(content, "{/* QUIT SPRINT CONFIRMATION MODAL */}", "{/* PARENT PIN GATE MODAL */}")

# 7. DELETE DEAD FUNCTIONS & STATES
# We have a LOT of dead functions.
def remove_function(content, func_name):
    start_idx = content.find(f"const {func_name} = ")
    if start_idx == -1: return content
    brace_count = 0
    in_func = False
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
            in_func = True
        elif content[i] == '}':
            brace_count -= 1
            if in_func and brace_count == 0:
                end_idx = i
                break
    if end_idx != -1:
        return content[:start_idx] + content[end_idx+1:]
    return content

content = remove_function(content, "startNewSprint")
content = remove_function(content, "startTestOutSprint")
content = remove_function(content, "finishSprint")
content = remove_function(content, "generateNextProblem")
content = remove_function(content, "handleDigitInput")
content = remove_function(content, "handleDelete")
content = remove_function(content, "handleSubmitAnswer")
content = remove_function(content, "handleSelectTierFromMap")
content = remove_function(content, "calculateStats")

# We should also remove the dead use-effects for keyboard & timers
content = re.sub(r"\s*// Main Sprint Live Elapsed Timer Loop\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[appState, showQuitModal\]\);\n", "\n", content)
content = re.sub(r"\s*// Physical Keyboard listener\n\s*useEffect\(\(\) => \{\n\s*if \(true\) return;[\s\S]*?\}\);\n", "\n", content)
content = re.sub(r"\s*useEffect\(\(\) => \{\n\s*setInputVal\(''\);\n\s*\}, \[currentIndex\]\);\n", "\n", content)

# 8. States that were only for Sprint
content = re.sub(r"^\s*const \[problems, setProblems\] = useState\(\[\]\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[currentIndex, setCurrentIndex\] = useState\(0\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[inputVal, setInputVal\] = useState\(''\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[isAnimating, setIsAnimating\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[results, setResults\] = useState\(\[\]\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[durationInSeconds, setDurationInSeconds\] = useState\(0\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[isBossMode, setIsBossMode\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[isTestOut, setIsTestOut\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[testOutTargetTier, setTestOutTargetTier\] = useState\(null\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[showHintCard, setShowHintCard\] = useState\(false\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[consecutiveMisses, setConsecutiveMisses\] = useState\(0\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[currentHint, setCurrentHint\] = useState\(null\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[stats, setStats\] = useState\(\{[\s\S]*?\}\);\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*const \[isDoubleCoinActive, setIsDoubleCoinActive\] = useState\(false\);\n", "", content, flags=re.MULTILINE)


# NOTE: the previous code review mentioned `currentTierMeta` was deleted and it broke the app!
# We MUST NOT delete `currentTierMeta`. We did not explicitly delete it above, so it should remain intact.
# Wait, let me make absolutely sure I don't delete `currentTierMeta`.
# I didn't delete `getTierMeta` here.

with open("src/App.jsx", "w") as f:
    f.write(content)
