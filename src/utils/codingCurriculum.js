// Coding Curriculum Tiers & Rating Mappings for Kibo Climb

export function getTierFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 1; // Tier 1: Patterns & Sequences
  if (numRating < 1400) return 2; // Tier 2: Grid Navigation & Loops
  if (numRating < 1600) return 3; // Tier 3: Boolean Logic & Gates
  if (numRating < 1800) return 4; // Tier 4: Variables & Binary State
  if (numRating < 2000) return 5; // Tier 5: Conditionals & Debugging
  if (numRating < 2200) return 6; // Tier 6: Loops & Accumulators
  if (numRating < 2400) return 7; // Tier 7: Functions & Data Structures
  return 8;                       // Tier 8: Algorithms & Complexity
}

export const getTierForRating = getTierFromRating;

export const GRADE_STARTING_RATINGS = {
  'Kindergarten':         900,   // Tier 1 — basic visual patterns & sequences
  'Grade 1–2':            1000,  // Tier 1 — growing patterns & step order
  'Grade 3–4':            1200,  // Tier 2 — grid algorithms & repeat blocks
  'Grade 5–6':            1800,  // Tier 5 — conditionals & state tracing
  'Grade 7–8':            2200,  // Tier 7 — functions & stack logic
  'High School & Beyond': 2400   // Tier 8 — peak recursion & algorithmic complexity
};

export function getStartingRatingForGrade(gradeLevel) {
  if (GRADE_STARTING_RATINGS[gradeLevel]) {
    return GRADE_STARTING_RATINGS[gradeLevel];
  }
  if (gradeLevel === 'Pre-Algebra / Middle School' || gradeLevel === 'Pre-Algebra') return 2000;
  if (gradeLevel === 'Algebra & Beyond' || gradeLevel === 'Algebra+') return 2400;
  return 1000;
}

export function getGradeLevelFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 'K–Grade 2';
  if (numRating < 1600) return 'Grade 3–4';
  if (numRating < 2000) return 'Grade 4–5';
  if (numRating < 2200) return 'Grade 5–6';
  if (numRating < 2400) return 'Grade 6–7';
  return 'Grade 7–8+';
}

export const CODING_CURRICULUM_TIERS = [
  {
    tier: 1,
    id: 1,
    name: 'Patterns & Sequences',
    title: 'Patterns & Sequences',
    subtitle: 'Sequencing, Patterns & Step Order',
    location: 'Logic Glade',
    icon: '🧩',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master repeating patterns, numeric sequences, missing elements, and sequential execution order.',
    problemCount: 15,
    targetSpeedPerQuestion: 3.0,
    targetSprintDuration: 45,
    targetSpeed: '≤ 3.0s / question',
    topics: [
      'Visual & Symbol Patterns (AB, AAB, ABC)',
      'Numeric Progressions (+2, +5, ×2)',
      'Next Step in Sequence',
      'Execution Order Foundations'
    ],
    associatedBadge: { id: 'pattern_scout', name: 'Pattern Pathfinder', icon: '🧩' },
    trailTrick: {
      title: 'Spot the Rule',
      description: 'Look at the jump between neighboring items. If numbers grow by +3 each step, apply that rule to find the missing slot!',
      summary: 'Find the repeating jump between items to predict what comes next.',
      sampleProblem: {
        question: '2, 5, 8, 11, ?',
        correctAnswer: '14',
        hint: 'Each number increases by +3!'
      }
    },
    proTip: {
      title: 'Check the Repeat Unit',
      content: 'In repeating shape patterns, identify the core repeat block before answering.',
      summary: 'Identify the smallest repeating loop of symbols.'
    }
  },
  {
    tier: 2,
    id: 2,
    name: 'Grid Navigation & Loops',
    title: 'Grid Navigation & Loops',
    subtitle: 'Directional Algorithms & Repeat Blocks',
    location: 'Algorithm Forest',
    icon: '🤖',
    color: 'from-amber-400 to-orange-500',
    description: 'Learn directional commands (North, South, East, West), grid step calculations, and repeat loop compression.',
    problemCount: 15,
    targetSpeedPerQuestion: 3.5,
    targetSprintDuration: 52,
    targetSpeed: '≤ 3.5s / question',
    topics: [
      'Cardinal Navigation (Up, Down, Left, Right)',
      '2D Grid Coordinates (X, Y)',
      'Repeat Loop Compression (repeat 3 [Right])',
      'Obstacle Avoidance Logic'
    ],
    associatedBadge: { id: 'grid_navigator', name: 'Algorithm Ace', icon: '🤖' },
    trailTrick: {
      title: 'Loop Compression',
      description: 'Instead of saying [Up, Up, Up, Up], write Repeat 4 [Up]. Loops make code shorter and easier to read!',
      summary: 'Count identical steps to compress them into a loop.',
      sampleProblem: {
        question: 'Start at (0, 0). Move Right 3, Up 2. Final (x, y)?',
        correctAnswer: '(3, 2)',
        hint: 'Right adds to x, Up adds to y!'
      }
    },
    proTip: {
      title: 'Coordinate Tracking',
      content: 'Horizontal steps change X (left -, right +) and vertical steps change Y (down -, up +).',
      summary: 'Track horizontal X and vertical Y changes separately.'
    }
  },
  {
    tier: 3,
    id: 3,
    name: 'Boolean Logic & Gates',
    title: 'Boolean Logic & Gates',
    subtitle: 'AND, OR, NOT & Truth Tables',
    location: 'Condition Canyon',
    icon: '🔀',
    color: 'from-blue-400 to-indigo-500',
    description: 'Evaluate true/false expressions, logical operators (AND, OR, NOT), and comparison operators (<, >, ===, !==).',
    problemCount: 15,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 60,
    targetSpeed: '≤ 4.0s / question',
    topics: [
      'Boolean values (true / false)',
      'AND logic (both must be true)',
      'OR logic (at least one is true)',
      'NOT logic (inverts the condition)',
      'Comparison operators (<, >, ==, !=)'
    ],
    associatedBadge: { id: 'boolean_ranger', name: 'Boolean Boss', icon: '🔀' },
    trailTrick: {
      title: 'Gate Rules',
      description: 'AND needs BOTH sides to be true. OR only needs ONE side to be true. NOT flips true to false and false to true!',
      summary: 'AND requires both true; OR requires any true; NOT inverts.',
      sampleProblem: {
        question: 'What is: true AND (5 > 2)?',
        correctAnswer: 'true',
        hint: '5 > 2 is true, and true AND true is true!'
      }
    },
    proTip: {
      title: 'Evaluate Parentheses First',
      content: 'Always resolve the inner comparisons inside parentheses before applying AND/OR/NOT.',
      summary: 'Solve inner comparison statements first.'
    }
  },
  {
    tier: 4,
    id: 4,
    name: 'Variables & Binary State',
    title: 'Variables & Binary State',
    subtitle: 'State Tracking, Assignment & Base-2',
    location: 'Bitstream Ridge',
    icon: '🔢',
    color: 'from-purple-400 to-fuchsia-500',
    description: 'Track variable storage, value reassignments, mathematical updates, and binary-to-decimal conversions.',
    problemCount: 15,
    targetSpeedPerQuestion: 4.5,
    targetSprintDuration: 68,
    targetSpeed: '≤ 4.5s / question',
    topics: [
      'Variable assignment (x = 5)',
      'Reassignment & mutability (x = x + 2)',
      'Multiple variable swaps & dependencies',
      'Binary conversion (0101 in base-10)'
    ],
    associatedBadge: { id: 'variable_virtuoso', name: 'Variable Virtuoso', icon: '🔢' },
    trailTrick: {
      title: 'Step-by-Step Memory Box',
      description: 'Think of a variable as a labeled box. When code assigns a new value, the old value is replaced!',
      summary: 'Update the variable box value on each line of code in order.',
      sampleProblem: {
        question: 'x = 4; x = x + 3; x = x * 2; What is x?',
        correctAnswer: '14',
        hint: '4 + 3 = 7, then 7 * 2 = 14!'
      }
    },
    proTip: {
      title: 'Binary Place Values',
      content: 'Binary bit places represent powers of 2: [8s][4s][2s][1s]. Binary 1010 = 8 + 2 = 10.',
      summary: 'Add 8 + 4 + 2 + 1 based on active 1 bits.'
    }
  },
  {
    tier: 5,
    id: 5,
    name: 'Conditionals & Debugging',
    title: 'Conditionals & Debugging',
    subtitle: 'If / Else Branching & Spot the Bug',
    location: 'Decision Falls',
    icon: '⚡',
    color: 'from-sky-400 to-blue-600',
    description: 'Navigate branching paths (if / else if / else), evaluate complex decision trees, and spot syntax or logical bugs.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.0,
    targetSprintDuration: 75,
    targetSpeed: '≤ 5.0s / question',
    topics: [
      'If / Else statement evaluation',
      'Branching decision outcomes',
      'Off-by-one errors & boundary checks',
      'Bug spotting & code inspection'
    ],
    associatedBadge: { id: 'debug_detective', name: 'Debug Detective', icon: '⚡' },
    trailTrick: {
      title: 'Take the True Branch',
      description: 'If the `if` condition is true, execute the code inside it and skip the `else` block completely!',
      summary: 'Execute only the matching true condition block.',
      sampleProblem: {
        question: 'score = 85; if (score >= 90) rank = "A"; else rank = "B"; rank?',
        correctAnswer: 'B',
        hint: '85 is not >= 90, so take the else branch!'
      }
    },
    proTip: {
      title: 'Watch Strict Inequalities',
      content: 'Be careful with `<` vs `<=`. If score is 90, `score > 90` is false, but `score >= 90` is true!',
      summary: 'Check whether boundaries are inclusive (>=) or exclusive (>).'
    }
  },
  {
    tier: 6,
    id: 6,
    name: 'Loops & Accumulators',
    title: 'Loops & Accumulators',
    subtitle: 'While Loops, For Loops & Counters',
    location: 'Iteration Pass',
    icon: '🔁',
    color: 'from-amber-500 to-stone-600',
    description: 'Trace loop execution counts, sum accumulators, while loop termination conditions, and index iteration.',
    problemCount: 15,
    targetSpeedPerQuestion: 5.5,
    targetSprintDuration: 82,
    targetSpeed: '≤ 5.5s / question',
    topics: [
      'For loop range tracing (for i = 1 to 4)',
      'Accumulator variables (sum += i)',
      'While loop termination conditions',
      'Loop iteration count calculation'
    ],
    associatedBadge: { id: 'loop_legend', name: 'Iteration Specialist', icon: '🔁' },
    trailTrick: {
      title: 'Tally the Passes',
      description: 'Write down each pass of the loop: i=1 (sum=1), i=2 (sum=3), i=3 (sum=6). Keep a running tally!',
      summary: 'Tally the accumulator value after each loop iteration.',
      sampleProblem: {
        question: 'total = 0; for i in [1, 2, 3]: total += i * 2; total?',
        correctAnswer: '12',
        hint: 'Pass 1: +2, Pass 2: +4, Pass 3: +6. Sum = 12!'
      }
    },
    proTip: {
      title: 'Check Loop End Condition',
      content: 'Confirm whether the loop stops before or after the upper limit.',
      summary: 'Verify how many total times the loop body executes.'
    }
  },
  {
    tier: 7,
    id: 7,
    name: 'Functions & Data Structures',
    title: 'Functions & Data Structures',
    subtitle: 'Function Return Values, Stacks & Queues',
    location: 'Complexity Peak',
    icon: '🏛️',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Trace function arguments, return values, stack operations (LIFO - Push/Pop), and queue operations (FIFO).',
    problemCount: 15,
    targetSpeedPerQuestion: 6.0,
    targetSprintDuration: 90,
    targetSpeed: '≤ 6.0s / question',
    topics: [
      'Function definitions & parameters',
      'Return value calculations',
      'Stack operations (LIFO: Push & Pop)',
      'Queue operations (FIFO: Enqueue & Dequeue)',
      'Array indexing & length queries'
    ],
    associatedBadge: { id: 'function_architect', name: 'Function Architect', icon: '🏛️' },
    trailTrick: {
      title: 'LIFO vs FIFO',
      description: 'A Stack is LIFO (Last-In, First-Out like a stack of plates). A Queue is FIFO (First-In, First-Out like a lunch line)!',
      summary: 'Stacks pop the newest item; Queues pop the oldest item.',
      sampleProblem: {
        question: 'def tripleSum(a, b): return (a + b) * 3; What is tripleSum(2, 4)?',
        correctAnswer: '18',
        hint: 'First (2 + 4) = 6, then 6 * 3 = 18!'
      }
    },
    proTip: {
      title: 'Zero-Based Indexing',
      content: 'Remember that in most programming languages, array indices start at 0: list[0] is the first item!',
      summary: 'Array item 0 is the first element.'
    }
  },
  {
    tier: 8,
    id: 8,
    name: 'Algorithms & Complexity',
    title: 'Algorithms & Complexity',
    subtitle: 'Recursion, Big-O & Peak Logic',
    location: 'Mount Kibo Core',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master recursive step evaluations, sorting mechanics (bubble/binary search), and peak computational reasoning.',
    problemCount: 15,
    targetSpeedPerQuestion: 6.5,
    targetSprintDuration: 97,
    targetSpeed: '≤ 6.5s / question',
    topics: [
      'Recursive function call traces (factorial, fibonacci)',
      'Binary search midpoint elimination',
      'Sorting algorithm steps',
      'Big-O time complexity intuition (O(1), O(N), O(N²))'
    ],
    associatedBadge: { id: 'code_summit_master', name: 'Code Summit Legend', icon: '🏔️' },
    trailTrick: {
      title: 'Base Case First in Recursion',
      description: 'Every recursive function has a base case that stops it. Trace downward until you reach the base case, then return back up!',
      summary: 'Trace recursive calls down to base case, then bubble values up.',
      sampleProblem: {
        question: 'def fact(n): return 1 if n <= 1 else n * fact(n-1); fact(4)?',
        correctAnswer: '24',
        hint: '4 * 3 * 2 * 1 = 24!'
      }
    },
    proTip: {
      title: 'Binary Search Halving',
      content: 'Binary search cuts the remaining search space in half with every single step.',
      summary: 'Halve the search space on each comparison.'
    }
  }
];

export function isNearTierThreshold(currentRating) {
  const boundaries = [1200, 1400, 1600, 1800, 2000, 2200, 2400];
  return boundaries.some((threshold) => Math.abs(currentRating - threshold) <= 25);
}

export function calculateStars(accuracyPct, durationInSeconds, tierConfig = null, totalQuestions = 15) {
  const accuracy = Number(accuracyPct) || 0;
  const rawSec = Number(durationInSeconds) || 0;
  const durationSec = rawSec > 1000 ? Math.floor(rawSec / 1000) : rawSec;

  const targetSpeed = tierConfig?.targetSpeedPerQuestion || 4.0;
  const questionsCount = Number(totalQuestions || 15);

  const targetTime3Star = questionsCount * targetSpeed;
  const targetTime2Star = targetTime3Star * 1.5;

  if (accuracy >= 95 && durationSec <= targetTime3Star) {
    return 3;
  }
  if (accuracy >= 90 && durationSec <= targetTime2Star) {
    return 2;
  }
  if (accuracy >= 80) {
    return 1;
  }

  return 0;
}
