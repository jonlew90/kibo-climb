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
  const type = Math.floor(Math.random() * 3);

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
  const type = Math.floor(Math.random() * 3);

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

  // Variable swapping logic
  const aVal = 5;
  const bVal = 9;
  const answer = `${aVal}`;
  const options = ensureUniqueOptions(answer, [String(bVal), '0', '14', String(aVal + bVal)]);
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

/**
 * Tier 5: Conditionals & Debugging
 */
function generateTier5Problem() {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // If / Else conditional branch
    const threshold = 70;
    const testScore = [65, 75, 80, 50][Math.floor(Math.random() * 4)];
    const isPass = testScore >= threshold;
    const answer = isPass ? 'PASS' : 'RETRY';
    return {
      tier: 5,
      concept: 'If / Else Branching',
      displayString: `What does this code output?`,
      codeSnippet: `score = ${testScore}\n\nif score >= ${threshold}:\n    status = "PASS"\nelse:\n    status = "RETRY"\n\nprint(status)`,
      options: ['PASS', 'RETRY'],
      answer,
      answerString: answer,
      hint: `score (${testScore}) is ${isPass ? '>=' : '<'} ${threshold}, so the ${isPass ? 'if' : 'else'} branch runs.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Spot the Bug / Off-by-one error
    const answer = 'Runs 6 times instead of 5';
    const options = ensureUniqueOptions(answer, [
      'Runs 4 times instead of 5',
      'Causes a syntax error',
      'Never stops running'
    ]);
    return {
      tier: 5,
      concept: 'Spot the Bug',
      displayString: `This loop is intended to print exactly 5 times. What is the bug?`,
      codeSnippet: `# Goal: print 5 times\nfor i in range(0, 6):\n    print("Climb!")`,
      options,
      answer,
      answerString: answer,
      hint: `range(0, 6) produces 6 values (0 through 5), so it runs 6 times.`,
      type: 'coding'
    };
  }

  // Nested Conditionals
  const isWeekend = true;
  const isSunny = false;
  const answer = 'Read a Book';
  const options = ensureUniqueOptions(answer, ['Go Hiking', 'Go to School', 'Do Homework']);
  return {
    tier: 5,
    concept: 'Nested Conditionals',
    displayString: `What activity is chosen by this program?`,
    codeSnippet: `is_weekend = True\nis_sunny = False\n\nif is_weekend:\n    if is_sunny:\n        activity = "Go Hiking"\n    else:\n        activity = "Read a Book"\nelse:\n    activity = "Go to School"`,
    options,
    answer,
    answerString: answer,
    hint: `is_weekend is True and is_sunny is False, so the inner else branch ("Read a Book") runs.`,
    type: 'coding'
  };
}

/**
 * Tier 6: Loops & Accumulators
 */
function generateTier6Problem() {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // For loop accumulator sum
    const n = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
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
    const startVal = 1;
    const maxVal = [8, 16, 20][Math.floor(Math.random() * 3)];
    let count = 0;
    let curr = startVal;
    while (curr < maxVal) {
      curr *= 2;
      count++;
    }
    const answer = String(curr);
    const options = ensureUniqueOptions(answer, [
      String(curr / 2),
      String(curr * 2),
      String(maxVal),
      String(curr + 2)
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

  // Array length & loop iterations
  const items = ['"ruby"', '"gem"', '"spark"', '"scroll"'];
  const answer = '4';
  const options = ensureUniqueOptions(answer, ['3', '5', '0']);
  return {
    tier: 6,
    concept: 'Array Iteration',
    displayString: `How many times does the print statement run?`,
    codeSnippet: `backpack = [${items.join(', ')}]\n\nfor item in backpack:\n    print("Found " + item)`,
    options,
    answer,
    answerString: answer,
    hint: `The backpack list has 4 items, so the loop runs 4 times.`,
    type: 'coding'
  };
}

/**
 * Tier 7: Functions & Data Structures (Stacks / Queues)
 */
function generateTier7Problem() {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // Function parameter passing & return value
    const p1 = Math.floor(Math.random() * 5) + 2;
    const p2 = Math.floor(Math.random() * 4) + 2;
    const mult = 3;
    const ansNum = (p1 + p2) * mult;
    const answer = String(ansNum);
    const options = ensureUniqueOptions(answer, [
      String(p1 + p2 * mult),
      String(ansNum + mult),
      String(p1 * mult + p2),
      String(ansNum - mult)
    ]);
    return {
      tier: 7,
      concept: 'Function Returns',
      displayString: `What does this function call return?`,
      codeSnippet: `def calculate(a, b):\n    return (a + b) * ${mult}\n\nresult = calculate(${p1}, ${p2})\nprint(result)`,
      options,
      answer,
      answerString: answer,
      hint: `Substitute a=${p1} and b=${p2}: (${p1} + ${p2}) * ${mult} = ${ansNum}.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Stack LIFO operations
    const answer = '7';
    const options = ensureUniqueOptions(answer, ['4', '9', '2']);
    return {
      tier: 7,
      concept: 'Stack (LIFO)',
      displayString: `What value is on TOP of the stack after these operations?`,
      codeSnippet: `stack = []\nstack.push(4)\nstack.push(9)\nstack.pop()      # Removes top item\nstack.push(7)\nprint(stack.top())`,
      options,
      answer,
      answerString: answer,
      hint: `Push 4, push 9, then pop removes 9. Push 7 leaves 7 on top.`,
      type: 'coding'
    };
  }

  // Queue FIFO operations
  const answer = 'Alpha';
  const options = ensureUniqueOptions(answer, ['Beta', 'Gamma', 'Empty']);
  return {
    tier: 7,
    concept: 'Queue (FIFO)',
    displayString: `Which item is removed first by dequeue()?`,
    codeSnippet: `queue = []\nqueue.enqueue("Alpha")\nqueue.enqueue("Beta")\nqueue.enqueue("Gamma")\n\nfirst_out = queue.dequeue()\nprint(first_out)`,
    options,
    answer,
    answerString: answer,
    hint: `A queue is First-In, First-Out (FIFO). "Alpha" was added first, so it is removed first.`,
    type: 'coding'
  };
}

/**
 * Tier 8: Recursion & Algorithmic Complexity
 */
function generateTier8Problem() {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // Factorial recursive trace
    const n = 4;
    const answer = '24';
    const options = ensureUniqueOptions(answer, ['12', '8', '48']);
    return {
      tier: 8,
      concept: 'Recursion',
      displayString: `What does factorial(4) return?`,
      codeSnippet: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))`,
      options,
      answer,
      answerString: answer,
      hint: `factorial(4) = 4 × 3 × 2 × 1 = 24.`,
      type: 'coding'
    };
  }

  if (type === 1) {
    // Big-O Time Complexity
    const answer = 'O(1) Constant Time';
    const options = ensureUniqueOptions(answer, [
      'O(N) Linear Time',
      'O(N²) Quadratic Time',
      'O(log N) Logarithmic Time'
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

  // Binary Search Step elimination
  const answer = '50';
  const options = ensureUniqueOptions(answer, ['25', '75', '100']);
  return {
    tier: 8,
    concept: 'Binary Search',
    displayString: `Searching sorted numbers 1 to 100 with binary search, what is the first midpoint checked?`,
    codeSnippet: `low = 1, high = 100\nmid = (1 + 100) // 2\n# First probe at mid`,
    options,
    answer,
    answerString: answer,
    hint: `The midpoint between 1 and 100 is (1 + 100) // 2 = 50.`,
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

  while (problems.length < count) {
    const isProbe = problems.length > 0 && problems.length % 5 === 0;
    const prob = generateCodingProblem(targetTier, isProbe, sessionSeen);
    const key = getNormalizedProblemKey(prob);

    if (!sessionSeen.has(key)) {
      sessionSeen.add(key);
      problems.push(prob);
    }
  }

  return problems;
}

export const generateProblems = generateCodingSession;
