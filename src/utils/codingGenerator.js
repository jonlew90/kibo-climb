// Coding & Logic Problem Generator for Kibo Climb
import { isNearTierThreshold } from './codingCurriculum.js';

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ensureUniqueOptions(answer, options = [], fallbackPool = []) {
  const ansStr = String(answer);
  const result = [ansStr];
  const seen = new Set([ansStr]);

  for (const opt of options) {
    if (opt === undefined || opt === null) continue;
    const str = String(opt);
    if (!seen.has(str)) {
      seen.add(str);
      result.push(str);
    }
  }

  for (const fb of fallbackPool) {
    if (result.length >= 4) break;
    if (fb === undefined || fb === null) continue;
    const str = String(fb);
    if (!seen.has(str)) {
      seen.add(str);
      result.push(str);
    }
  }

  let step = 1;
  while (result.length < 4) {
    const num = Number(ansStr);
    if (!isNaN(num)) {
      const up = String(num + step);
      const down = String(num - step);
      if (!seen.has(up)) {
        seen.add(up);
        result.push(up);
      } else if (!seen.has(down) && (num - step >= 0 || num < 0)) {
        seen.add(down);
        result.push(down);
      }
    } else {
      const fbStr = `${ansStr} #${step}`;
      if (!seen.has(fbStr)) {
        seen.add(fbStr);
        result.push(fbStr);
      }
    }
    step++;
  }

  return shuffleArray(result.slice(0, 4));
}

// ============================================================================
// PROCEDURAL TEMPLATE GENERATORS BY TIER
// ============================================================================

/**
 * Tier 1: Patterns, Repeating Sequences, Next Step
 */
function generateTier1Problem() {
  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    // Arithmetic skip counting
    const step = [2, 3, 4, 5, 10][Math.floor(Math.random() * 5)];
    const start = Math.floor(Math.random() * 10) + 1;
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const ansNum = start + step * 4;
    const answer = String(ansNum);
    const options = ensureUniqueOptions(answer, [
      String(ansNum + step),
      String(ansNum - step),
      String(ansNum + 1),
      String(ansNum - 1)
    ]);
    return {
      tier: 1,
      concept: 'Numeric Sequences',
      displayString: `What number comes next?\n${seq.join(', ')}, ?`,
      codeSnippet: `pattern = [${seq.join(', ')}, ?]\n# Rule: +${step} each step`,
      options,
      answer,
      answerString: answer,
      hint: `Each number increases by ${step}. Add ${step} to ${seq[3]}.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Doubling sequence
    const start = [1, 2, 3][Math.floor(Math.random() * 3)];
    const seq = [start, start * 2, start * 4, start * 8];
    const ansNum = start * 16;
    const answer = String(ansNum);
    const options = ensureUniqueOptions(answer, [
      String(ansNum / 2 + 4),
      String(ansNum + 4),
      String(ansNum - 4),
      String(start * 12)
    ]);
    return {
      tier: 1,
      concept: 'Doubling Patterns',
      displayString: `What number comes next in the sequence?\n${seq.join(', ')}, ?`,
      codeSnippet: `sequence = [${seq.join(', ')}, ?]\n# Rule: multiply by 2`,
      options,
      answer,
      answerString: answer,
      hint: `Each number doubles. Multiply ${seq[3]} by 2.`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Visual symbol sequence (AB, ABC)
    const shapes = ['🔴', '🔷', '⭐', '🟩', '🟡', '🟣'];
    const s1 = shapes[Math.floor(Math.random() * 3)];
    const s2 = shapes[3 + Math.floor(Math.random() * 3)];
    const seq = `${s1} ${s2} ${s1} ${s2} ${s1}`;
    const answer = s2;
    const wrong = shapes.filter(s => s !== answer).slice(0, 3);
    const options = shuffleArray([answer, ...wrong]);
    return {
      tier: 1,
      concept: 'Repeating Patterns',
      displayString: `What shape comes next?\n${seq} [ ? ]`,
      codeSnippet: `repeat_pattern = "${seq} ?"\n# Pattern: A - B - A - B...`,
      options,
      answer,
      answerString: answer,
      hint: `The shapes alternate: ${s1}, then ${s2}.`,
      type: 'coding'
    };
  }

  // Execution Step Order
  const startVal = Math.floor(Math.random() * 5) + 1;
  const addVal = Math.floor(Math.random() * 4) + 1;
  const ansNum = startVal + addVal;
  const answer = String(ansNum);
  const distractors = [
    String(ansNum + 1),
    String(ansNum + 2),
    String(ansNum + 3),
    ansNum - 1 > 0 ? String(ansNum - 1) : String(ansNum + 4),
    ansNum - 2 > 0 ? String(ansNum - 2) : String(ansNum + 5)
  ];
  const options = ensureUniqueOptions(answer, distractors);
  return {
    tier: 1,
    concept: 'Step-by-Step Execution',
    displayString: `Follow the steps in order:\n1. Start with ${startVal}\n2. Add ${addVal}\nWhat is the result?`,
    codeSnippet: `val = ${startVal}\nval = val + ${addVal}`,
    options,
    answer,
    answerString: answer,
    hint: `Start with ${startVal}, then add ${addVal}.`,
    type: 'coding'
  };
}

/**
 * Tier 2: Grid Navigation & Repeat Loops
 */
function generateTier2Problem() {
  const type = Math.floor(Math.random() * 5);

  if (type === 0) {
    // 2D Grid coordinates step
    const startX = Math.floor(Math.random() * 3);
    const startY = Math.floor(Math.random() * 3);
    const right = Math.floor(Math.random() * 4) + 1;
    const up = Math.floor(Math.random() * 4) + 1;
    const finalX = startX + right;
    const finalY = startY + up;
    const answer = `(${finalX}, ${finalY})`;
    const options = ensureUniqueOptions(answer, [
      `(${finalX + 1}, ${finalY})`,
      `(${finalX}, ${finalY + 1})`,
      `(${finalY}, ${finalX})`,
      `(${finalX - 1}, ${finalY})`,
      `(${finalX}, ${finalY - 1})`
    ]);
    return {
      tier: 2,
      concept: 'Grid Coordinates',
      displayString: `Kibo starts at (${startX}, ${startY}).\nMove right ${right}, then up ${up}.\nWhere does Kibo land?`,
      codeSnippet: `x, y = ${startX}, ${startY}\nx += ${right}  # Move right\ny += ${up}     # Move up`,
      options,
      answer,
      answerString: answer,
      hint: `Right increases x (${startX} + ${right} = ${finalX}). Up increases y (${startY} + ${up} = ${finalY}).`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Repeat Loop Compression
    const count = Math.floor(Math.random() * 4) + 3;
    const action = ['Forward', 'Jump', 'Turn Left', 'Climb'][Math.floor(Math.random() * 4)];
    const expanded = Array(count).fill(action).join(', ');
    const answer = `Repeat ${count} [${action}]`;
    const options = ensureUniqueOptions(answer, [
      `Repeat ${count - 1} [${action}]`,
      `Repeat ${count + 1} [${action}]`,
      `Repeat ${count + 2} [${action}]`,
      `Repeat 2 [${action}]`
    ]);
    return {
      tier: 2,
      concept: 'Repeat Loops',
      displayString: `Which loop replaces this sequence?\n[ ${expanded} ]`,
      codeSnippet: `# Long code:\n${Array(count).fill(`robot.${action.toLowerCase().replace(' ', '_')}()`).join('\n')}`,
      options,
      answer,
      answerString: answer,
      hint: `${action} appears ${count} times in a row.`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Total steps in nested loop
    const outer = Math.floor(Math.random() * 3) + 2;
    const inner = Math.floor(Math.random() * 3) + 2;
    const totalSteps = outer * inner;
    const answer = String(totalSteps);
    const options = ensureUniqueOptions(answer, [
      String(outer + inner),
      String(totalSteps + inner),
      String(totalSteps - inner),
      String(totalSteps + 2)
    ]);
    return {
      tier: 2,
      concept: 'Loop Iteration Count',
      displayString: `A loop runs ${outer} times. Inside, Kibo takes ${inner} steps each time.\nHow many total steps are taken?`,
      codeSnippet: `for round in 1..${outer}:\n    repeat ${inner} [Step Forward]`,
      options,
      answer,
      answerString: answer,
      hint: `Multiply rounds by steps per round: ${outer} × ${inner}.`,
      type: 'coding'
    };
  }

  if (type === 3) {
    // Path-following map trace (follow a sequence of directional moves)
    const dirs = ['Left', 'Right', 'Up', 'Down'];
    const moves = Array.from({ length: 4 }, () => dirs[Math.floor(Math.random() * 4)]);
    let x = 3, y = 3;
    for (const m of moves) {
      if (m === 'Right') x++;
      else if (m === 'Left') x--;
      else if (m === 'Up') y++;
      else if (m === 'Down') y--;
    }
    const answer = `(${x}, ${y})`;
    const options = ensureUniqueOptions(answer, [
      `(${x + 1}, ${y})`, `(${x}, ${y - 1})`, `(${x - 1}, ${y})`, `(${x}, ${y + 1})`
    ]);
    const moveLines = moves.map(m => `kibo.move("${m}")`).join('\n');
    return {
      tier: 2,
      concept: 'Path Tracing',
      displayString: `Kibo starts at (3, 3).\nFollow each move in order.\nWhere does Kibo end up?`,
      codeSnippet: `x, y = 3, 3\n${moveLines}`,
      options,
      answer,
      answerString: answer,
      hint: `Trace each move step by step: Right/Left changes x, Up/Down changes y.`,
      type: 'coding'
    };
  }

  // Nested loop asterisk output counter
  const rows = Math.floor(Math.random() * 3) + 2; // 2-4
  const cols = Math.floor(Math.random() * 3) + 2; // 2-4
  const totalStars = rows * cols;
  const answer = String(totalStars);
  const options = ensureUniqueOptions(answer, [
    String(rows + cols), String(totalStars + cols), String(totalStars - rows), String(rows)
  ]);
  return {
    tier: 2,
    concept: 'Nested Loop Output',
    displayString: `How many times is "*" printed in total?`,
    codeSnippet: `for row in range(${rows}):\n    for col in range(${cols}):\n        print("*")`,
    options,
    answer,
    answerString: answer,
    hint: `The outer loop runs ${rows} times. Each time, the inner loop prints ${cols} stars. ${rows} × ${cols} = ${totalStars}.`,
    type: 'coding'
  };
}

/**
 * Tier 3: Boolean Logic (AND, OR, NOT) & Comparison
 */
function generateTier3Problem() {
  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    // Basic AND / OR gate
    const a = Math.random() > 0.5;
    const b = Math.random() > 0.5;
    const op = Math.random() > 0.5 ? 'AND' : 'OR';
    const result = op === 'AND' ? (a && b) : (a || b);
    const answer = result ? 'true' : 'false';
    const options = ['true', 'false'];
    return {
      tier: 3,
      concept: 'Boolean Gates',
      displayString: `What is the value of this expression?\n${a} ${op} ${b}`,
      codeSnippet: `result = ${a} ${op.toLowerCase()} ${b}\nprint(result)`,
      options,
      answer,
      answerString: answer,
      hint: op === 'AND' ? 'AND is true only when both values are true.' : 'OR is true when at least one value is true.',
      type: 'coding'
    };
  }

  if (type === 1) {
    // NOT operator
    const val = Math.random() > 0.5;
    const result = !val;
    const answer = result ? 'true' : 'false';
    return {
      tier: 3,
      concept: 'NOT Operator',
      displayString: `What is the value of this expression?\nNOT (${val})`,
      codeSnippet: `is_ready = ${val}\nprint(not is_ready)`,
      options: ['true', 'false'],
      answer,
      answerString: answer,
      hint: 'The NOT operator flips true to false and false to true.',
      type: 'coding'
    };
  }

  if (type === 2) {
    // Comparison operators (<, >, ===)
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = ['>', '<', '=='][Math.floor(Math.random() * 3)];
    let result = false;
    if (op === '>') result = n1 > n2;
    if (op === '<') result = n1 < n2;
    if (op === '==') result = n1 === n2;
    const answer = result ? 'true' : 'false';
    return {
      tier: 3,
      concept: 'Comparison Operators',
      displayString: `Is this comparison true or false?\n${n1} ${op} ${n2}`,
      codeSnippet: `test = (${n1} ${op} ${n2})\nprint(test)`,
      options: ['true', 'false'],
      answer,
      answerString: answer,
      hint: `Check if ${n1} is ${op === '>' ? 'greater than' : op === '<' ? 'less than' : 'equal to'} ${n2}.`,
      type: 'coding'
    };
  }

  // Compound Boolean: (5 > 2) AND (3 == 4)
  const leftNum1 = 6;
  const leftNum2 = 3;
  const leftVal = leftNum1 > leftNum2; // true
  const rightNum1 = 2;
  const rightNum2 = 4;
  const rightVal = rightNum1 === rightNum2; // false
  const answer = 'false';
  return {
    tier: 3,
    concept: 'Compound Booleans',
    displayString: `What is the value of this expression?\n(${leftNum1} > ${leftNum2}) AND (${rightNum1} == ${rightNum2})`,
    codeSnippet: `cond = (${leftNum1} > ${leftNum2}) and (${rightNum1} == ${rightNum2})\n# Left: ${leftVal} | Right: ${rightVal}`,
    options: ['true', 'false'],
    answer,
    answerString: answer,
    hint: `The left side is true, but the right side is false. true AND false is false.`,
    type: 'coding'
  };
}

/**
 * Tier 4: Variables & Binary State
 */
function generateTier4Problem() {
  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    // Multi-step variable arithmetic trace
    const initial = Math.floor(Math.random() * 6) + 2;
    const add = Math.floor(Math.random() * 5) + 2;
    const mult = 2;
    const ansNum = (initial + add) * mult;
    const answer = String(ansNum);
    const options = ensureUniqueOptions(answer, [
      String(initial + add * mult),
      String(ansNum + 2),
      String(initial * mult + add),
      String(ansNum - 2)
    ]);
    return {
      tier: 4,
      concept: 'Variable State Tracing',
      displayString: `What is the final value of x?`,
      codeSnippet: `x = ${initial}\nx = x + ${add}\nx = x * ${mult}`,
      options,
      answer,
      answerString: answer,
      hint: `Start at ${initial}, add ${add} (${initial + add}), then multiply by ${mult} (${answer}).`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Binary 4-bit to decimal conversion
    const b3 = Math.random() > 0.5 ? 1 : 0;
    const b2 = Math.random() > 0.5 ? 1 : 0;
    const b1 = Math.random() > 0.5 ? 1 : 0;
    const b0 = Math.random() > 0.5 ? 1 : 0;
    // ensure not all zero
    const finalB3 = (b3 || b2 || b1 || b0) ? b3 : 1;
    const binStr = `${finalB3}${b2}${b1}${b0}`;
    const decVal = finalB3 * 8 + b2 * 4 + b1 * 2 + b0 * 1;
    const answer = String(decVal);
    const options = ensureUniqueOptions(answer, [
      String((decVal + 2) % 16),
      String((decVal + 4) % 16),
      String(Math.max(1, (decVal - 3 + 16) % 16)),
      String((decVal + 1) % 16)
    ]);
    return {
      tier: 4,
      concept: 'Binary Conversion',
      displayString: `Convert the 4-bit binary number ${binStr} to decimal:`,
      codeSnippet: `# Bit weights: [8] [4] [2] [1]\n# Binary:      [${finalB3}]  [${b2}]  [${b1}]  [${b0}]`,
      options,
      answer,
      answerString: answer,
      hint: `Add active bit values: (${finalB3}×8) + (${b2}×4) + (${b1}×2) + (${b0}×1) = ${decVal}.`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Randomized variable swapping
    const aVal = Math.floor(Math.random() * 8) + 2;
    const bVal = Math.floor(Math.random() * 8) + 10;
    const answer = String(aVal);
    const options = ensureUniqueOptions(answer, [String(bVal), '0', String(aVal + bVal), String(bVal - aVal)]);
    return {
      tier: 4,
      concept: 'Variable Swapping',
      displayString: `What is the value of b after running this code?`,
      codeSnippet: `a = ${aVal}\nb = ${bVal}\ntemp = a\na = b\nb = temp`,
      options,
      answer,
      answerString: answer,
      hint: `temp stores a (${aVal}). Then b is assigned temp (${aVal}).`,
      type: 'coding'
    };
  }

  // String variable concatenation trace
  const names = [['Kibo', 'Climber'], ['Summit', 'Explorer'], ['Pixel', 'Coder'], ['Trail', 'Runner']];
  const [first, second] = names[Math.floor(Math.random() * names.length)];
  const sep = [' ', '_', '-'][Math.floor(Math.random() * 3)];
  const answer = `"${first}${sep}${second}"`;
  const options = ensureUniqueOptions(answer, [
    `"${second}${sep}${first}"`,
    `"${first}"`,
    `"${second}"`,
    `"${first}${second}"`
  ]);
  return {
    tier: 4,
    concept: 'String Concatenation',
    displayString: `What is the final value of result?`,
    codeSnippet: `first = "${first}"\nsecond = "${second}"\nresult = first + "${sep}" + second\nprint(result)`,
    options,
    answer,
    answerString: answer,
    hint: `Concatenate "${first}" + "${sep}" + "${second}" = "${first}${sep}${second}".`,
    type: 'coding'
  };
}

/**
 * Tier 5: Conditionals & Debugging
 */
function generateTier5Problem() {
  const type = Math.floor(Math.random() * 5);

  if (type === 0) {
    // If / Else conditional branch with randomized thresholds
    const configs = [
      { threshold: 70, label: 'score', pass: 'PASS', fail: 'RETRY' },
      { threshold: 100, label: 'coins', pass: 'Unlock!', fail: 'Keep Climbing' },
      { threshold: 50, label: 'energy', pass: 'Hike!', fail: 'Rest' },
    ];
    const cfg = configs[Math.floor(Math.random() * configs.length)];
    const pool = [cfg.threshold - 20, cfg.threshold - 5, cfg.threshold + 5, cfg.threshold + 15];
    const testVal = pool[Math.floor(Math.random() * pool.length)];
    const isPass = testVal >= cfg.threshold;
    const answer = isPass ? cfg.pass : cfg.fail;
    return {
      tier: 5,
      concept: 'If / Else Branching',
      displayString: `What does this code output?`,
      codeSnippet: `${cfg.label} = ${testVal}\n\nif ${cfg.label} >= ${cfg.threshold}:\n    result = "${cfg.pass}"\nelse:\n    result = "${cfg.fail}"\n\nprint(result)`,
      options: [cfg.pass, cfg.fail],
      answer,
      answerString: answer,
      hint: `${cfg.label} (${testVal}) is ${isPass ? '>=' : '<'} ${cfg.threshold}, so the ${isPass ? 'if' : 'else'} branch runs.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Spot the Bug — off-by-one (range)
    const intended = Math.floor(Math.random() * 4) + 4; // 4-7
    const actual = intended + 1;
    const answer = `Runs ${actual} times instead of ${intended}`;
    const options = ensureUniqueOptions(answer, [
      `Runs ${intended - 1} times instead of ${intended}`,
      'Causes a syntax error',
      'Never stops running'
    ]);
    return {
      tier: 5,
      concept: 'Spot the Bug',
      displayString: `This loop is intended to print exactly ${intended} times. What is the bug?`,
      codeSnippet: `# Goal: print ${intended} times\nfor i in range(0, ${actual}):\n    print("Climb!")`,
      options,
      answer,
      answerString: answer,
      hint: `range(0, ${actual}) produces ${actual} values (0 through ${actual - 1}), so it runs ${actual} times.`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Spot the Bug — assignment instead of comparison (= vs ==), parameterized
    const bugCases = [
      { varName: 'gems',  val: 10,  msg: 'Jackpot!' },
      { varName: 'lives', val: 3,   msg: 'Full health!' },
      { varName: 'score', val: 100, msg: 'Level up!' },
      { varName: 'level', val: 5,   msg: 'Boss fight!' },
    ];
    const bc = bugCases[Math.floor(Math.random() * bugCases.length)];
    const answer = 'Uses = instead of == to compare';
    const options = ensureUniqueOptions(answer, [
      'Missing indentation',
      'Causes an infinite loop',
      'Variable is undefined'
    ]);
    return {
      tier: 5,
      concept: 'Spot the Bug',
      displayString: `What is the bug in this code?\n${bc.varName} = ${bc.val}`,
      codeSnippet: `${bc.varName} = ${bc.val}\n\nif ${bc.varName} = ${bc.val}:   # BUG HERE\n    print("${bc.msg}")`,
      options,
      answer,
      answerString: answer,
      hint: `In Python, a single = is assignment. Use == to compare. Fix: if ${bc.varName} == ${bc.val}:`,
      type: 'coding'
    };
  }

  if (type === 3) {
    // Nested Conditionals — randomized boolean combos
    const combos = [
      { w: true,  s: true,  r: '"Go Hiking"',   display: 'True, True' },
      { w: true,  s: false, r: '"Read a Book"',  display: 'True, False' },
      { w: false, s: true,  r: '"Go to School"', display: 'False, True' },
      { w: false, s: false, r: '"Go to School"', display: 'False, False' },
    ];
    const combo = combos[Math.floor(Math.random() * combos.length)];
    const answer = combo.r;
    const options = ensureUniqueOptions(answer, ['"Go Hiking"', '"Read a Book"', '"Go to School"', '"Do Homework"']);
    return {
      tier: 5,
      concept: 'Nested Conditionals',
      displayString: `is_weekend = ${combo.w}, is_sunny = ${combo.s}\nWhat activity is chosen?`,
      codeSnippet: `is_weekend = ${combo.w}\nis_sunny = ${combo.s}\n\nif is_weekend:\n    if is_sunny:\n        activity = "Go Hiking"\n    else:\n        activity = "Read a Book"\nelse:\n    activity = "Go to School"`,
      options,
      answer,
      answerString: answer,
      hint: `is_weekend is ${combo.w}${combo.w ? `, is_sunny is ${combo.s}` : ''} → ${combo.r}.`,
      type: 'coding'
    };
  }

  // elif chain branching
  const tierVal = [1, 2, 3][Math.floor(Math.random() * 3)];
  const labelMap = { 1: '"Basecamp"', 2: '"Summit"', 3: '"Peak"' };
  const answer = labelMap[tierVal];
  const options = ensureUniqueOptions(answer, ['"Basecamp"', '"Summit"', '"Peak"']);
  return {
    tier: 5,
    concept: 'elif Chains',
    displayString: `What is printed when climber_tier = ${tierVal}?`,
    codeSnippet: `climber_tier = ${tierVal}\n\nif climber_tier == 1:\n    print("Basecamp")\nelif climber_tier == 2:\n    print("Summit")\nelif climber_tier == 3:\n    print("Peak")`,
    options,
    answer,
    answerString: answer,
    hint: `climber_tier is ${tierVal}, so the matching elif branch prints ${answer}.`,
    type: 'coding'
  };
}

/**
 * Tier 6: Loops & Accumulators
 */
function generateTier6Problem() {
  const type = Math.floor(Math.random() * 5);

  if (type === 0) {
    // For loop accumulator sum
    const n = Math.floor(Math.random() * 4) + 3; // 3-6
    let expectedSum = 0;
    for (let i = 1; i <= n; i++) expectedSum += i;
    const answer = String(expectedSum);
    const options = ensureUniqueOptions(answer, [
      String(expectedSum + n),
      String(expectedSum - 1),
      String(n * 2),
      String(expectedSum + 1)
    ]);
    return {
      tier: 6,
      concept: 'Loop Accumulator',
      displayString: `What is the value of total after the loop finishes?`,
      codeSnippet: `total = 0\nfor i in range(1, ${n + 1}):\n    total += i\nprint(total)`,
      options,
      answer,
      answerString: answer,
      hint: `Add the numbers from 1 to ${n}: ${Array.from({ length: n }, (_, i) => i + 1).join(' + ')} = ${expectedSum}.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // While loop counter trace
    const maxVal = [8, 16, 20, 32][Math.floor(Math.random() * 4)];
    let curr = 1;
    while (curr < maxVal) curr *= 2;
    const answer = String(curr);
    const options = ensureUniqueOptions(answer, [
      String(curr / 2), String(curr * 2), String(maxVal), String(curr + 2)
    ]);
    return {
      tier: 6,
      concept: 'While Loops',
      displayString: `What is the final value of x when the loop terminates?`,
      codeSnippet: `x = 1\nwhile x < ${maxVal}:\n    x = x * 2\nprint(x)`,
      options,
      answer,
      answerString: answer,
      hint: `x doubles each step until it is no longer less than ${maxVal}.`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Randomized array iteration count
    const allItems = ['"ruby"', '"gem"', '"spark"', '"scroll"', '"potion"', '"badge"'];
    const len = Math.floor(Math.random() * 3) + 3; // 3-5
    const items = shuffleArray(allItems).slice(0, len);
    const answer = String(len);
    const options = ensureUniqueOptions(answer, [String(len - 1), String(len + 1), '0']);
    return {
      tier: 6,
      concept: 'Array Iteration',
      displayString: `How many times does the print statement run?`,
      codeSnippet: `backpack = [${items.join(', ')}]\n\nfor item in backpack:\n    print("Found " + item)`,
      options,
      answer,
      answerString: answer,
      hint: `The backpack list has ${len} items, so the loop runs ${len} times.`,
      type: 'coding'
    };
  }

  if (type === 3) {
    // List index access
    const allWords = ['"Kibo"', '"Summit"', '"Spark"', '"Gem"', '"Trail"', '"Peak"'];
    const listLen = Math.floor(Math.random() * 2) + 4; // 4-5
    const wordList = shuffleArray(allWords).slice(0, listLen);
    const idx = Math.floor(Math.random() * listLen);
    const answer = wordList[idx];
    const options = ensureUniqueOptions(answer, wordList.filter(w => w !== answer));
    return {
      tier: 6,
      concept: 'List Index Access',
      displayString: `What is printed by this code?`,
      codeSnippet: `climbers = [${wordList.join(', ')}]\nprint(climbers[${idx}])`,
      options,
      answer,
      answerString: answer,
      hint: `List indexes start at 0. climbers[${idx}] is the ${idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`} element: ${answer}.`,
      type: 'coding'
    };
  }

  // List mutation running total (accumulate a list of values)
  const vals = Array.from({ length: Math.floor(Math.random() * 2) + 3 }, () => Math.floor(Math.random() * 8) + 2);
  const total = vals.reduce((a, b) => a + b, 0);
  const answer = String(total);
  const options = ensureUniqueOptions(answer, [
    String(total + vals[0]), String(total - vals[vals.length - 1]), String(total * 2), String(total - 1)
  ]);
  return {
    tier: 6,
    concept: 'List Accumulation',
    displayString: `What is the value of total after the loop?`,
    codeSnippet: `scores = [${vals.join(', ')}]\ntotal = 0\nfor s in scores:\n    total += s\nprint(total)`,
    options,
    answer,
    answerString: answer,
    hint: `Add all scores: ${vals.join(' + ')} = ${total}.`,
    type: 'coding'
  };
}

/**
 * Tier 7: Functions & Data Structures (Stacks / Queues / Dictionaries)
 */
function generateTier7Problem() {
  const type = Math.floor(Math.random() * 5);

  if (type === 0) {
    // Diverse Function Math & Parameter Return Templates
    const funcTemplates = [
      () => {
        const w = Math.floor(Math.random() * 8) + 3;
        const h = Math.floor(Math.random() * 6) + 2;
        const ansNum = w * h;
        const answer = String(ansNum);
        const options = ensureUniqueOptions(answer, [
          String((w + h) * 2),
          String(ansNum + w),
          String(ansNum - h),
          String(w * (h + 1))
        ]);
        return {
          concept: 'Function Returns',
          displayString: 'What does this function call return?',
          codeSnippet: `def calculate_area(width, height):\n    return width * height\n\nresult = calculate_area(${w}, ${h})\nprint(result)`,
          options,
          answer,
          answerString: answer,
          hint: `Substitute width=${w} and height=${h}: ${w} * ${h} = ${ansNum}.`
        };
      },
      () => {
        const x = Math.floor(Math.random() * 7) + 2;
        const y = Math.floor(Math.random() * 8) + 1;
        const ansNum = (x * 2) + y;
        const answer = String(ansNum);
        const options = ensureUniqueOptions(answer, [
          String(x + (y * 2)),
          String((x + y) * 2),
          String(ansNum + 2),
          String(ansNum - 2)
        ]);
        return {
          concept: 'Function Returns',
          displayString: 'What does this function call return?',
          codeSnippet: `def double_and_add(x, y):\n    return (x * 2) + y\n\nresult = double_and_add(${x}, ${y})\nprint(result)`,
          options,
          answer,
          answerString: answer,
          hint: `Substitute x=${x} and y=${y}: (${x} * 2) + ${y} = ${x * 2} + ${y} = ${ansNum}.`
        };
      },
      () => {
        const base = Math.floor(Math.random() * 6) + 3;
        const bonus = Math.floor(Math.random() * 4) + 2;
        const mult = [2, 3, 4][Math.floor(Math.random() * 3)];
        const ansNum = (base + bonus) * mult;
        const answer = String(ansNum);
        const options = ensureUniqueOptions(answer, [
          String(base + (bonus * mult)),
          String(ansNum + mult),
          String(base * mult + bonus),
          String(ansNum - mult)
        ]);
        return {
          concept: 'Function Returns',
          displayString: 'What does this function call return?',
          codeSnippet: `def score_bonus(base, bonus):\n    return (base + bonus) * ${mult}\n\nresult = score_bonus(${base}, ${bonus})\nprint(result)`,
          options,
          answer,
          answerString: answer,
          hint: `Substitute base=${base} and bonus=${bonus}: (${base} + ${bonus}) * ${mult} = ${base + bonus} * ${mult} = ${ansNum}.`
        };
      },
      () => {
        const price = (Math.floor(Math.random() * 6) + 4) * 10;
        const coupon = (Math.floor(Math.random() * 3) + 1) * 5;
        const ansNum = price - coupon;
        const answer = String(ansNum);
        const options = ensureUniqueOptions(answer, [
          String(price + coupon),
          String(ansNum - 5),
          String(ansNum + 10),
          String(price)
        ]);
        return {
          concept: 'Function Returns',
          displayString: 'What does this function call return?',
          codeSnippet: `def apply_discount(price, coupon):\n    return price - coupon\n\nfinal_cost = apply_discount(${price}, ${coupon})\nprint(final_cost)`,
          options,
          answer,
          answerString: answer,
          hint: `Substitute price=${price} and coupon=${coupon}: ${price} - ${coupon} = ${ansNum}.`
        };
      }
    ];

    const chosen = funcTemplates[Math.floor(Math.random() * funcTemplates.length)]();
    return {
      tier: 7,
      ...chosen,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Conditional Branching in Functions
    const condTemplates = [
      () => {
        const a = Math.floor(Math.random() * 30) + 10;
        const b = Math.floor(Math.random() * 30) + 10;
        const ansNum = Math.max(a, b);
        const answer = String(ansNum);
        const options = ensureUniqueOptions(answer, [
          String(Math.min(a, b)),
          String(a + b),
          String(Math.abs(a - b))
        ]);
        return {
          concept: 'Function Conditionals',
          displayString: 'What is printed after calling find_max?',
          codeSnippet: `def find_max(a, b):\n    if a > b:\n        return a\n    else:\n        return b\n\nprint(find_max(${a}, ${b}))`,
          options,
          answer,
          answerString: answer,
          hint: `Compare ${a} and ${b}: ${a > b ? `${a} > ${b}` : `${b} >= ${a}`}, so ${ansNum} is returned.`
        };
      },
      () => {
        const energy = Math.floor(Math.random() * 50) + 20;
        const req = 40;
        const isReady = energy >= req;
        const answer = isReady ? '"Ready to Climb"' : '"Need Rest"';
        const options = ensureUniqueOptions(answer, ['"Ready to Climb"', '"Need Rest"', 'None', 'Error']);
        return {
          concept: 'Function Conditionals',
          displayString: 'What does this function call return?',
          codeSnippet: `def check_status(energy):\n    if energy >= 40:\n        return "Ready to Climb"\n    return "Need Rest"\n\nstatus = check_status(${energy})\nprint(status)`,
          options,
          answer,
          answerString: answer,
          hint: `energy is ${energy}. Since ${energy} ${isReady ? '>= 40' : '< 40'}, the function returns ${answer}.`
        };
      }
    ];

    const chosen = condTemplates[Math.floor(Math.random() * condTemplates.length)]();
    return {
      tier: 7,
      ...chosen,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Dynamic Stack (LIFO) Operations
    const isGemTheme = Math.random() > 0.5;
    if (isGemTheme) {
      const gemPool = ['"Ruby"', '"Emerald"', '"Sapphire"', '"Diamond"', '"Topaz"', '"Amethyst"'];
      const picked = shuffleArray(gemPool).slice(0, 4);
      const answer = picked[3];
      const options = ensureUniqueOptions(answer, [picked[1], picked[0], picked[2]]);
      return {
        tier: 7,
        concept: 'Stack (LIFO)',
        displayString: 'What gem is on TOP of the stack after these operations?',
        codeSnippet: `gem_stack = []\ngem_stack.push(${picked[0]})\ngem_stack.push(${picked[1]})\ngem_stack.pop()         # Removes top gem\ngem_stack.push(${picked[2]})\ngem_stack.pop()         # Removes top gem\ngem_stack.push(${picked[3]})\nprint(gem_stack.top())`,
        options,
        answer,
        answerString: answer,
        hint: `Pushes and pops leave ${picked[0]}, then ${picked[3]} is pushed onto the top.`,
        type: 'coding'
      };
    } else {
      const v1 = Math.floor(Math.random() * 10) + 2;
      const v2 = Math.floor(Math.random() * 10) + 12;
      const v3 = Math.floor(Math.random() * 10) + 25;
      const v4 = Math.floor(Math.random() * 10) + 40;
      const answer = String(v4);
      const options = ensureUniqueOptions(answer, [String(v2), String(v1), String(v3)]);
      return {
        tier: 7,
        concept: 'Stack (LIFO)',
        displayString: 'What value is on TOP of the stack after these operations?',
        codeSnippet: `stack = []\nstack.push(${v1})\nstack.push(${v2})\nstack.pop()      # Removes top item (${v2})\nstack.push(${v3})\nstack.pop()      # Removes top item (${v3})\nstack.push(${v4})\nprint(stack.top())`,
        options,
        answer,
        answerString: answer,
        hint: `Push ${v1}, push ${v2}, pop removes ${v2}. Push ${v3}, pop removes ${v3}. Push ${v4} places ${v4} on top.`,
        type: 'coding'
      };
    }
  }

  if (type === 3) {
    // Dynamic Queue (FIFO) Operations
    const names = shuffleArray(['"Kibo"', '"Pip"', '"Tara"', '"Leo"', '"Milo"']).slice(0, 3);
    const answer = names[0];
    const options = ensureUniqueOptions(answer, [names[1], names[2], '"Empty"']);
    return {
      tier: 7,
      concept: 'Queue (FIFO)',
      displayString: 'Which climber is served first by dequeue()?',
      codeSnippet: `climber_queue = []\nclimber_queue.enqueue(${names[0]})\nclimber_queue.enqueue(${names[1]})\nclimber_queue.enqueue(${names[2]})\n\nfirst_up = climber_queue.dequeue()\nprint(first_up)`,
      options,
      answer,
      answerString: answer,
      hint: `A queue is First-In, First-Out (FIFO). ${names[0]} joined the queue first, so they are dequeued first.`,
      type: 'coding'
    };
  }

  // Dictionary / Key-Value Mapping Lookup
  const items = [
    { key: '"sparks"', val: Math.floor(Math.random() * 50) + 25 },
    { key: '"potions"', val: Math.floor(Math.random() * 5) + 1 },
    { key: '"scrolls"', val: Math.floor(Math.random() * 6) + 2 }
  ];
  const target = items[Math.floor(Math.random() * items.length)];
  const answer = String(target.val);
  const options = ensureUniqueOptions(answer, items.map(i => String(i.val)));
  return {
    tier: 7,
    concept: 'Dictionaries',
    displayString: 'What is printed by accessing this dictionary key?',
    codeSnippet: `inventory = {\n    "sparks": ${items[0].val},\n    "potions": ${items[1].val},\n    "scrolls": ${items[2].val}\n}\n\nprint(inventory[${target.key}])`,
    options,
    answer,
    answerString: answer,
    hint: `Accessing inventory[${target.key}] retrieves the value paired with that key (${target.val}).`,
    type: 'coding'
  };
}

/**
 * Tier 8: Recursion & Algorithmic Complexity
 */
function generateTier8Problem() {
  const type = Math.floor(Math.random() * 8);

  if (type === 0) {
    // Parameterized factorial recursive trace
    const nOpts = [{ n: 3, ans: 6 }, { n: 4, ans: 24 }, { n: 5, ans: 120 }];
    const { n, ans } = nOpts[Math.floor(Math.random() * nOpts.length)];
    const answer = String(ans);
    const options = ensureUniqueOptions(answer, [
      String(ans * 2), String(ans / 2), String(ans - n), String(ans + n)
    ]);
    return {
      tier: 8,
      concept: 'Recursion',
      displayString: `What does factorial(${n}) return?`,
      codeSnippet: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(${n}))`,
      options,
      answer,
      answerString: answer,
      hint: `factorial(${n}) = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${ans}.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Big-O — O(1) array index access
    const answer = 'O(1) Constant Time';
    const options = ensureUniqueOptions(answer, [
      'O(N) Linear Time', 'O(N²) Quadratic Time', 'O(log N) Logarithmic Time'
    ]);
    return {
      tier: 8,
      concept: 'Time Complexity',
      displayString: `What is the Big-O time complexity of accessing an array element by index?`,
      codeSnippet: `# Access first element\nfirst = array[0]`,
      options,
      answer,
      answerString: answer,
      hint: `Direct array index lookup takes constant time: O(1).`,
      type: 'coding'
    };
  }

  if (type === 2) {
    // Big-O — O(N) linear search
    const answer = 'O(N) Linear Time';
    const options = ensureUniqueOptions(answer, [
      'O(1) Constant Time', 'O(N²) Quadratic Time', 'O(log N) Logarithmic Time'
    ]);
    return {
      tier: 8,
      concept: 'Time Complexity',
      displayString: `What is the Big-O time complexity of this search?`,
      codeSnippet: `def find_item(items, target):\n    for item in items:      # checks each one\n        if item == target:\n            return True\n    return False`,
      options,
      answer,
      answerString: answer,
      hint: `The loop checks up to N items in the worst case — that is O(N) linear time.`,
      type: 'coding'
    };
  }

  if (type === 3) {
    // Big-O — O(N²) nested loop
    const answer = 'O(N²) Quadratic Time';
    const options = ensureUniqueOptions(answer, [
      'O(N) Linear Time', 'O(1) Constant Time', 'O(log N) Logarithmic Time'
    ]);
    return {
      tier: 8,
      concept: 'Time Complexity',
      displayString: `What is the Big-O time complexity of this algorithm?`,
      codeSnippet: `for i in range(N):\n    for j in range(N):\n        print(i, j)  # runs N × N times`,
      options,
      answer,
      answerString: answer,
      hint: `A nested loop where both run N times results in N × N = N² total operations: O(N²).`,
      type: 'coding'
    };
  }

  if (type === 4) {
    // Fibonacci trace
    const nFib = [5, 6, 7][Math.floor(Math.random() * 3)];
    const fibSeq = [0, 1];
    while (fibSeq.length <= nFib) fibSeq.push(fibSeq[fibSeq.length - 1] + fibSeq[fibSeq.length - 2]);
    const answer = String(fibSeq[nFib]);
    const options = ensureUniqueOptions(answer, [
      String(fibSeq[nFib - 1]), String(fibSeq[nFib + 1] || fibSeq[nFib] + 2), String(fibSeq[nFib] + 1), String(fibSeq[nFib] * 2)
    ]);
    return {
      tier: 8,
      concept: 'Recursion',
      displayString: `What does fib(${nFib}) return?`,
      codeSnippet: `def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(${nFib}))`,
      options,
      answer,
      answerString: answer,
      hint: `Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13… fib(${nFib}) = ${answer}.`,
      type: 'coding'
    };
  }

  if (type === 5) {
    // Binary Search — parameterized first midpoint
    const configs = [
      { low: 1, high: 100, mid: 50 },
      { low: 1, high: 64,  mid: 32 },
      { low: 0, high: 50,  mid: 25 },
    ];
    const cfg = configs[Math.floor(Math.random() * configs.length)];
    const answer = String(cfg.mid);
    const options = ensureUniqueOptions(answer, [
      String(cfg.mid - 10), String(cfg.mid + 10), String(cfg.high), String(cfg.low)
    ]);
    return {
      tier: 8,
      concept: 'Binary Search',
      displayString: `Searching sorted numbers ${cfg.low} to ${cfg.high} with binary search, what is the first midpoint checked?`,
      codeSnippet: `low = ${cfg.low}\nhigh = ${cfg.high}\nmid = (low + high) // 2\n# First probe at mid`,
      options,
      answer,
      answerString: answer,
      hint: `The midpoint between ${cfg.low} and ${cfg.high} is (${cfg.low} + ${cfg.high}) // 2 = ${cfg.mid}.`,
      type: 'coding'
    };
  }

  if (type === 6) {
    // Big-O — O(1) dictionary / hash map lookup
    const answer = 'O(1) Constant Time';
    const options = ensureUniqueOptions(answer, [
      'O(N) Linear Time', 'O(N²) Quadratic Time', 'O(log N) Logarithmic Time'
    ]);
    return {
      tier: 8,
      concept: 'Time Complexity',
      displayString: `What is the Big-O time complexity of looking up a key in a dictionary?`,
      codeSnippet: `inventory = {"gems": 50, "potions": 3}\ncount = inventory["gems"]   # direct key lookup`,
      options,
      answer,
      answerString: answer,
      hint: `Dictionary (hash map) key lookups are O(1) — they jump directly to the value without scanning.`,
      type: 'coding'
    };
  }

  // Big-O — O(N log N) sorting
  const answer = 'O(N log N) Linearithmic Time';
  const options = ensureUniqueOptions(answer, [
    'O(N) Linear Time', 'O(N²) Quadratic Time', 'O(log N) Logarithmic Time'
  ]);
  return {
    tier: 8,
    concept: 'Time Complexity',
    displayString: `Merge sort splits and merges a list of N items. What is its Big-O time complexity?`,
    codeSnippet: `# Merge sort: splits list in half each time\n# then merges N items back — log N levels × N work\nresult = merge_sort(items)`,
    options,
    answer,
    answerString: answer,
    hint: `Merge sort does O(log N) split levels, each requiring O(N) work to merge — total: O(N log N).`,
    type: 'coding'
  };
}

export function generateCodingProblem(tier = 1, isProbe = false, seenKeys = new Set()) {
  const targetTier = isProbe ? Math.min(8, tier + 2) : Math.max(1, Math.min(8, tier));
  let prob;

  switch (targetTier) {
    case 1: prob = generateTier1Problem(); break;
    case 2: prob = generateTier2Problem(); break;
    case 3: prob = generateTier3Problem(); break;
    case 4: prob = generateTier4Problem(); break;
    case 5: prob = generateTier5Problem(); break;
    case 6: prob = generateTier6Problem(); break;
    case 7: prob = generateTier7Problem(); break;
    case 8: prob = generateTier8Problem(); break;
    default: prob = generateTier1Problem(); break;
  }

  const finalOptions = (prob.options && prob.options.length === 2 && prob.options.includes('true') && prob.options.includes('false'))
    ? prob.options
    : (prob.options && prob.options.length === 2 && prob.options.includes('PASS') && prob.options.includes('RETRY'))
    ? prob.options
    : ensureUniqueOptions(prob.answer, prob.options || []);

  return {
    ...prob,
    options: finalOptions,
    id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isProbeQuestion: !!isProbe
  };
}

export function getNormalizedProblemKey(problem) {
  if (!problem) return '';
  return `${problem.concept || ''}_${problem.answer || ''}_${problem.displayString || ''}`;
}

export function generateCodingSession(count = 15, targetTier = 1, history = [], seenKeys = new Set()) {
  const problems = [];
  const sessionSeen = new Set(seenKeys);
  let attempts = 0;
  const maxAttempts = count * 6;

  // Pass 1: Deduplicated unique problems
  while (problems.length < count && attempts < maxAttempts) {
    attempts++;
    const isProbe = problems.length > 0 && problems.length % 5 === 0;
    const prob = generateCodingProblem(targetTier, isProbe, sessionSeen);
    const key = getNormalizedProblemKey(prob);

    if (!sessionSeen.has(key)) {
      sessionSeen.add(key);
      problems.push(prob);
    }
  }

  // Pass 2: Fallback to fill remaining problem count if template pool is smaller than count
  while (problems.length < count) {
    const isProbe = problems.length > 0 && problems.length % 5 === 0;
    const prob = generateCodingProblem(targetTier, isProbe, sessionSeen);
    problems.push(prob);
  }

  return problems;
}

export const generateProblems = generateCodingSession;
