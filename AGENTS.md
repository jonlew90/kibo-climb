# Token Optimization Rules

1. **Autonomous Execution with Concise Reporting:** Implement requested changes autonomously without waiting for manual confirmation. Accompany the execution with a brief, high-level summary of actions taken and recommendations.
2. **Minimal In-Place Diffs:** Apply targeted, surgical code edits. Do not regenerate full files, duplicate surrounding context, or print extensive code blocks unless explicitly requested.
3. **Essential Terminal Commands Only:** Run necessary commands autonomously (e.g., builds, targeted tests, installations), but strictly avoid exploratory terminal searches (`ls`, `find`, `cat`, redundant git status) to minimize context inflation.
4. **Strict Retry Cap:** If a change causes a build, type-check, or lint error, attempt at most **one** auto-fix. If it fails a second time, immediately halt execution and report the blocker.
5. **No Conversational Filler:** Omit conversational introductions, conversational preambles, and conversational sign-offs. Present direct action summaries and code diffs immediately.
6. **Targeted Context & Search Boundaries:** 
   - Never run global grep, regex, or directory traversals across the entire workspace.
   - Restrict file inspection to files named directly in the prompt or their 1st-degree imports.
   - Never inspect or traverse `functions/node_modules/` or root `node_modules/`.
7. **Silent Tool Invocations:** Do not output status messages or preambles describing tool calls before running them.
8. **Mascot Identity:** Kibo is the Red Panda mascot (represented in the favicon and `Mascot.jsx`), NOT a mountain. Mount Kibo is the climb setting/theme, not the mascot.
9. **Code Exploration Rules:**
   - Before reading files, search using exact string matches rather than broad regex patterns.
   - Read files in full or large contiguous sections (up to 200 lines) instead of multiple tiny fragmented chunks.
   - Never read more than 3 distinct files without pausing to report findings or ask for clarification.
   - Exclude build artifacts, generated types, and package lock files from searches.
10. **No Prose:** Do not explain the code unless explicitly asked.
11. **Use Local CLI Tools first:** Use internal commands like `grep` or `find` to map files instead of forcing the LLM to read through directory files to search for things.
