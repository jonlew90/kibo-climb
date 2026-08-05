# Token Optimization Rules

1. **Direct Diffs Only:** Generate minimal, targeted code diffs for the requested changes. Do not rewrite unchanged surrounding code or refactor unrelated sections.
2. **Strict Retry Cap:** If an edit causes a linter, type-check, or build error, you may attempt **one** auto-fix. If it fails a second time, STOP execution immediately and report the error to the user.
3. **No Conversational Filler:** Omit conversational introductions, conversational preambles, and unnecessary summaries.
4. **Targeted Context:** Limit file reading strictly to files explicitly tagged in the prompt or direct imports of those files. Do not conduct workspace-wide exploratory searches unless requested.
