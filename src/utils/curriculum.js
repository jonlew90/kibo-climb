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
    title: 'Division Fact Families',
    subtitle: 'Exact Division & Reciprocals',
    location: 'Division Falls',
    icon: '🏞️',
    color: 'from-sky-400 to-blue-600',
    description: 'Instant recall of division fact families (56 ÷ 8 = 7).'
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
    title: 'Fractions, Decimals & Percentages',
    subtitle: 'Fractions, Decimals & Percentages',
    location: 'Fraction Falls',
    icon: '🧩',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Calculate percentages (20% of 80 = 16), decimals, and fractions.'
  },
  {
    tier: 8,
    title: 'Squares, Roots & PEMDAS',
    subtitle: 'Powers, Square Roots & Order of Ops',
    location: 'Mount Kibo Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master powers (6²), square roots (√81), and PEMDAS at the peak of Mount Kibo!'
  }
];

// Problem generator per Tier
export function generateTierProblem(tierLevel) {
  let num1, num2, answer, operatorSymbol, displayString;

  switch (tierLevel) {
    case 1: {
      // Tier 1: Single-digit addition/subtraction
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
      // Tier 2: Crossing tens & missing addends
      const type = Math.random();
      if (type < 0.4) {
        // Crossing tens add: e.g., 8+7
        num1 = Math.floor(Math.random() * 5) + 5; // 5-9
        num2 = Math.floor(Math.random() * 5) + 6; // 6-10
        answer = num1 + num2;
        operatorSymbol = '+';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else if (type < 0.7) {
        // Crossing tens sub: e.g., 15-8
        num1 = Math.floor(Math.random() * 9) + 11; // 11-19
        num2 = Math.floor(Math.random() * 8) + 3;  // 3-10
        answer = num1 - num2;
        operatorSymbol = '−';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else {
        // Missing addend: 7 + ? = 12
        const total = Math.floor(Math.random() * 8) + 11; // 11-18
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
      // Tier 3: Core Multiplication (2, 5, 10)
      const tables = [2, 5, 10];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
      operatorSymbol = '×';
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 4: {
      // Tier 4: Complete Multiplication (3x through 12x)
      const tables = [3, 4, 6, 7, 8, 9, 11, 12];
      num1 = tables[Math.floor(Math.random() * tables.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
      operatorSymbol = '×';
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 5: {
      // Tier 5: Division Fact Families (e.g., 56 ÷ 8 = 7)
      num2 = Math.floor(Math.random() * 9) + 2; // divisor 2 to 10
      answer = Math.floor(Math.random() * 9) + 1; // quotient 1 to 9
      num1 = num2 * answer; // dividend
      operatorSymbol = '÷';
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 6: {
      // Tier 6: Multi-Digit Mental Math (2-digit add/sub)
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        num1 = Math.floor(Math.random() * 40) + 15; // 15-54
        num2 = Math.floor(Math.random() * 40) + 15; // 15-54
        answer = num1 + num2;
        operatorSymbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 50) + 40; // 40-89
        num2 = Math.floor(Math.random() * 30) + 12; // 12-41
        answer = num1 - num2;
        operatorSymbol = '−';
      }
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 7: {
      // Tier 7: Mental Percentages, Decimals & Fractions (e.g., 20% of 80 = 16, 0.25 × 4 = 1)
      const percentages = [10, 20, 25, 50, 75];
      const pct = percentages[Math.floor(Math.random() * percentages.length)];
      const base = (Math.floor(Math.random() * 9) + 1) * 20; // 20, 40, ... 180
      answer = Math.round((pct / 100) * base);
      num1 = pct;
      num2 = base;
      operatorSymbol = '%';
      displayString = `${pct}% of ${base}`;
      break;
    }
    case 8:
    default: {
      // Tier 8 (Final Peak): Squares, Roots & PEMDAS (6^2 = 36, sqrt(81) = 9, 4 + 3 * 5 = 19)
      const type = Math.random();
      if (type < 0.4) {
        // Square: e.g., 6^2 = 36
        const base = Math.floor(Math.random() * 9) + 2; // 2-10
        num1 = base;
        num2 = 2;
        answer = base * base;
        operatorSymbol = '²';
        displayString = `${base}²`;
      } else if (type < 0.7) {
        // Square Root: e.g., sqrt(81) = 9
        answer = Math.floor(Math.random() * 9) + 2; // 2-10
        num1 = answer * answer;
        num2 = 2;
        operatorSymbol = '√';
        displayString = `√${num1}`;
      } else {
        // Simple PEMDAS: e.g., 4 + 3 * 5 = 19
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
    answerString: answer.toString()
  };
}

// Generate 10-Problem Placement Diagnostic Set (2 problems per Tier from Tier 1 to 5)
export function generatePlacementDiagnosticSet() {
  const problems = [];
  const diagnosticTiers = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

  diagnosticTiers.forEach((tierLevel, idx) => {
    const probData = generateTierProblem(tierLevel);
    problems.push({
      id: `diag-${idx + 1}-${Date.now()}`,
      ...probData,
      diagnosticTier: tierLevel,
      isDiagnosticItem: true
    });
  });

  return problems;
}

// Diagnostic placement evaluation algorithm
export function evaluatePlacementTier(diagnosticResults) {
  const tierStats = {};
  for (let t = 1; t <= 5; t++) {
    tierStats[t] = { correct: 0, total: 0, totalLatencyMs: 0 };
  }

  diagnosticResults.forEach((r) => {
    const t = r.problem.diagnosticTier || 1;
    if (tierStats[t]) {
      tierStats[t].total += 1;
      if (r.isCorrect) tierStats[t].correct += 1;
      tierStats[t].totalLatencyMs += r.latencyMs;
    }
  });

  let recommendedTier = 1;

  for (let t = 1; t <= 5; t++) {
    const stat = tierStats[t];
    if (stat.total === 0) break;

    const accuracy = stat.correct / stat.total;
    const avgLatencySec = stat.totalLatencyMs / (stat.total * 1000);

    if (accuracy >= 0.8 && avgLatencySec <= 3.0) {
      recommendedTier = Math.min(8, t + 1);
    } else {
      recommendedTier = t;
      break;
    }
  }

  return Math.min(8, Math.max(1, recommendedTier));
}
