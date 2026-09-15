#!/usr/bin/env python3
"""
Curriculum-Driven Blog Post Generator Bridge for Kibo Climb
Delegates directly to scripts/generate_post.mjs to ensure 100% parity and zero
drift with src/utils/mathCurriculum.js and src/utils/worksheetGenerator.js.
"""

import os
import subprocess
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MJS_SCRIPT = os.path.join(ROOT_DIR, "scripts", "generate_post.mjs")


def main():
    if not os.path.exists(MJS_SCRIPT):
        print(f"Error: {MJS_SCRIPT} not found.", file=sys.stderr)
        sys.exit(1)

    cmd = ["node", MJS_SCRIPT] + sys.argv[1:]
    res = subprocess.run(cmd, cwd=ROOT_DIR)
    sys.exit(res.returncode)


if __name__ == "__main__":
    main()
