import re

with open("src/utils/testAdaptiveEngine.test.js", "r") as f:
    content = f.read()

content = f"""import {{ describe, it, expect }} from 'vitest';
{content}

describe('Adaptive Engine', () => {{
  it('should run simulation proficient student', () => {{
    runSimulationProficientStudent();
  }});
  it('should run simulation beginner probe miss', () => {{
    runSimulationBeginnerProbeMiss();
  }});
}});
"""

with open("src/utils/testAdaptiveEngine.test.js", "w") as f:
    f.write(content)
