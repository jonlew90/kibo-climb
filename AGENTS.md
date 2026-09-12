# Token Optimization Rules

1. **Direct Diffs Only:** Generate minimal, targeted code diffs for the requested changes. Do not rewrite unchanged surrounding code or refactor unrelated sections.
2. **Strict Retry Cap:** If an edit causes a linter, type-check, or build error, you may attempt **one** auto-fix. If it fails a second time, STOP execution immediately and report the error to the user.
3. **No Conversational Filler:** Omit conversational introductions, conversational preambles, and unnecessary summaries.
4. **Targeted Context & Search Boundaries:** 
   - Never run global grep, regex, or file-tree searches across the entire workspace.
   - Limit file inspection strictly to files named in the prompt or their direct 1st-degree imports.
   - Never inspect or traverse `functions/node_modules/` or root `node_modules/`.
5. **Skip Preamble on Tool Results:** Do not summarize tool outputs before acting on them.
6. **Mascot Identity:** Kibo is the Red Panda mascot (represented in the favicon and `Mascot.jsx`), NOT a mountain. Mount Kibo is the climb setting/theme, not the mascot.
