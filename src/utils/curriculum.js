// 8-Tier Skill Roadmap Curriculum Engine for Kibo Math

export const CURRICULUM_TIERS = [
  {
    tier: 1,
    title: 'Single-Digit Math',
    subtitle: 'Addition & Subtraction (1–9)',
    location: 'Sunny Meadow',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master basic single-digit addition and subtraction fluency.'
  },
  {
    tier: 2,
    tierTitle: 'Tier 2: Crossing Tens & Missing Addends',
    title: 'Crossing the Tens',
    subtitle: 'Regrouping & Missing Addends',
    location: 'Forest Trail',
    icon: '🌲',
    color: 'from-amber-400 to-orange-500',
    description: 'Cross the tens boundary (8+7=15) and solve missing addends (7+?=12).'
  },
  {
    tier: 3,
    title: 'Core Multiplication',
    subtitle: '2×, 5×, and 10× Tables',
    location: 'Multiplication River',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    description: 'Build core multiplication table speed for 2, 5, and 10.'
  },
  {
    tier: 4,
    title: 'Complete Multiplication',
    subtitle: '3× through 12× Tables',
    location: 'Factor Canyon',
    icon: '🏜️',
    color: 'from-purple-400 to-indigo-500',
    description: 'Master the full multiplication table grid up to 12×12.'
  },
  {
    tier: 5,
    title: 'Division & Divisibility',
    subtitle: 'Fact Families & Divisibility Rules',
    location: 'Division Falls',
    icon: '🏞️',
    color: 'from-sky-400 to-blue-600',
    description: 'Master division fact families (56 ÷ 8 = 7) and divisibility rules.'
  },
  {
    tier: 6,
    title: 'Multi-Digit Mental Math',
    subtitle: '2-Digit Addition & Subtraction',
    location: 'Boulder Ridge',
    icon: '⛰️',
    color: 'from-amber-500 to-stone-600',
    description: 'Add and subtract double-digit numbers mentally (45 + 38 = 83).'
  },
  {
    tier: 7,
    title: 'Fractions, LCM & GCF',
    subtitle: 'LCM, GCF, Percentages & Decimals',
    location: 'Fraction Falls',
    icon: '🧩',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Find Least Common Multiples, Greatest Common Factors, and percentages.'
  },
  {
    tier: 8,
    title: 'Exponents, Roots & PEMDAS',
    subtitle: 'Mount Kibo Summit Peak',
    location: 'Mount Kibo Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master exponents (2³), square roots (√81), and PEMDAS at the summit!'
  }
];

// Mathematical Helpers for LCM & GCF
export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// Helper to calculate normalized key for commutative protection and deduplication
export function getNormalizedProblemKey(probData) {
  const { num1, num2, operatorSymbol, displayString } = probData;

  // Commutative protection for Addition (+) and Multiplication (×)
  if (operatorSymbol === '+' || operatorSymbol === '×') {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
      const minVal = Math.min(num1, num2);
      const maxVal = Math.max(num1, num2);
      return `${minVal}${operatorSymbol}${maxVal}`;
    }
  }

  return displayString || `${num1}${operatorSymbol}${num2}`;
}

// Problem generator per Tier
export function generateTierProblem(tierLevel) {
  let num1, num2, answer, operatorSymbol, displayString, options, hint;

  switch (tierLevel) {
    case 1: {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 + num2;
        operatorSymbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        operatorSymbol = '−';
      }
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 2: {
      const type = Math.random();
      if (type < 0.4) {
        num1 = Math.floor(Math.random() * 5) + 5;
        num2 = Math.floor(Math.random() * 5) + 6;
        answer = num1 + num2;
        operatorSymbol = '+';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else if (type < 0.7) {
        num1 = Math.floor(Math.random() * 9) + 11;
        num2 = Math.floor(Math.random() * 8) + 3;
        answer = num1 - num2;
        operatorSymbol = '−';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else {
        const total = Math.floor(Math.random() * 8) + 11;
        const known = Math.floor(Math.random() * (total - 3)) + 2;
        answer = total - known;
        num1 = known;
        num2 = '?';
        operatorSymbol = '+';
        displayString = `${known} + ? = ${total}`;
      }
      break;
    }
    case 3: {
      const tables = [2, 5, 10];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
      operatorSymbol = '×';
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 4: {
      const tables = [3, 4, 6, 7, 8, 9, 11, 12];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
      operatorSymbol = '×';
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 5: {
      // Tier 5: Division Fact Families (70%) & Divisibility Rules (30%)
      if (Math.random() < 0.3) {
        const divisors = [2, 3, 5, 10];
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        const mult = Math.floor(Math.random() * 30) + 10;
        const isDivisible = Math.random() > 0.3;
        num1 = isDivisible ? divisor * mult : divisor * mult + (Math.floor(Math.random() * (divisor - 1)) + 1);
        num2 = divisor;
        answer = isDivisible ? 'Yes' : 'No';
        operatorSymbol = '÷';
        displayString = `Is ${num1} divisible by ${divisor}?`;
        options = ['Yes', 'No'];
        hint = `Hint: Check the digit rule for ${divisor}!`;
      } else {
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * answer;
        operatorSymbol = '÷';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      }
      break;
    }
    case 6: {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        num1 = Math.floor(Math.random() * 40) + 15;
        num2 = Math.floor(Math.random() * 40) + 15;
        answer = num1 + num2;
        operatorSymbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 50) + 40;
        num2 = Math.floor(Math.random() * 30) + 12;
        answer = num1 - num2;
        operatorSymbol = '−';
      }
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 7: {
      // Tier 7: LCM (35%), GCF (35%), Percentages (30%)
      const subType = Math.random();
      if (subType < 0.35) {
        // LCM Problem
        const pairs = [
          [2, 3], [3, 4], [4, 6], [3, 5], [4, 8], [6, 8], [5, 10], [6, 9], [4, 10], [8, 12]
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        num1 = pair[0];
        num2 = pair[1];
        answer = lcm(num1, num2);
        operatorSymbol = 'LCM';
        displayString = `Find the LCM of ${num1} and ${num2}`;
        hint = 'Hint: Skip-count the larger number until the smaller one divides into it!';
      } else if (subType < 0.70) {
        // GCF Problem
        const pairs = [
          [6, 9], [12, 18], [8, 12], [15, 20], [14, 21], [16, 24], [18, 27], [20, 30], [24, 36]
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        num1 = pair[0];
        num2 = pair[1];
        answer = gcd(num1, num2);
        operatorSymbol = 'GCF';
        displayString = `Find the GCF of ${num1} and ${num2}`;
        hint = 'Hint: Subtract the two numbers to find common factors!';
      } else {
        // Percentages Problem
        const percentages = [10, 20, 25, 50, 75];
        const pct = percentages[Math.floor(Math.random() * percentages.length)];
        const base = (Math.floor(Math.random() * 9) + 1) * 20;
        answer = Math.round((pct / 100) * base);
        num1 = pct;
        num2 = base;
        operatorSymbol = '%';
        displayString = `${pct}% of ${base}`;
      }
      break;
    }
    case 8:
    default: {
      // Tier 8: Exponents (30%), Squares/Roots (40%), PEMDAS (30%)
      const type = Math.random();
      if (type < 0.3) {
        // Exponents
        const base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
        const exp = base === 10 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 3;
        num1 = base;
        num2 = exp;
        answer = Math.pow(base, exp);
        operatorSymbol = '^';
        displayString = `${base}${exp === 3 ? '³' : exp === 4 ? '⁴' : '^' + exp}`;
        hint = `Hint: Multiply ${base} by itself ${exp} times!`;
      } else if (type < 0.6) {
        // Square Root
        answer = Math.floor(Math.random() * 9) + 2;
        num1 = answer * answer;
        num2 = 2;
        operatorSymbol = '√';
        displayString = `√${num1}`;
      } else if (type < 0.8) {
        // Square
        const base = Math.floor(Math.random() * 9) + 2;
        num1 = base;
        num2 = 2;
        answer = base * base;
        operatorSymbol = '²';
        displayString = `${base}²`;
      } else {
        // PEMDAS Order of Operations
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 5) + 2;
        const c = Math.floor(Math.random() * 4) + 2;
        num1 = a;
        num2 = b;
        answer = a + b * c;
        operatorSymbol = '+';
        displayString = `${a} + ${b} × ${c}`;
      }
      break;
    }
  }

  return {
    num1,
    num2,
    operatorSymbol,
    displayString,
    answer,
    answerString: String(answer),
    options,
    hint
  };
}

// Generate 10-Problem Placement Diagnostic Set (deduplicated)
export function generatePlacementDiagnosticSet() {
  const problems = [];
  const diagnosticTiers = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
  const seenKeys = new Set();

  diagnosticTiers.forEach((tierLevel, idx) => {
    let probData;
    let attempts = 0;
    do {
      probData = generateTierProblem(tierLevel);
      attempts++;
    } while (seenKeys.has(getNormalizedProblemKey(probData)) && attempts < 50);

    const normKey = getNormalizedProblemKey(probData);
    seenKeys.add(normKey);

    problems.push({
      id: `diag-${idx + 1}-${Date.now()}`,
      ...probData,
      tier: tierLevel
    });
  });

  return problems;
}

export function evaluatePlacementTier(results) {
  let highestTier = 1;
  if (!results || results.length === 0) return 1;

  for (const res of results) {
    if (res.correct && (res.latencySec === undefined || res.latencySec <= 4.0)) {
      highestTier = Math.max(highestTier, (res.tier || 1) + 1);
    }
  }

  return Math.min(8, Math.max(1, highestTier));
}
