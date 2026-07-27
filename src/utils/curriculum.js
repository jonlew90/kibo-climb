// 8-Tier Skill Roadmap Curriculum Engine for Kibo Math

export const CURRICULUM_TIERS = [
  {
    tier: 1,
    title: 'Single-Digit Math',
    subtitle: 'Addition & Subtraction (1–9)',
    location: 'Sunny Meadow',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master basic single-digit addition and subtraction fluency.',
    trailTrick: {
      title: 'Plus 9 Hop! 🦘',
      summary: 'Add 10 first, then step back 1! For 9 + 7, do 10 + 7 = 17, then minus 1 to get 16.',
      sampleProblem: {
        question: '9 + 7',
        correctAnswer: '16',
        hint: 'Add 10 first (10 + 7 = 17), then step back 1 to get 16!'
      }
    }
  },
  {
    tier: 2,
    tierTitle: 'Tier 2: Crossing Tens & Clock Basics',
    title: 'Crossing Tens & Time Basics',
    subtitle: 'Regrouping, Missing Addends & Time',
    location: 'Forest Trail',
    icon: '🌲',
    color: 'from-amber-400 to-orange-500',
    description: 'Cross the tens boundary (8+7=15), missing addends, and read clock times.',
    trailTrick: {
      title: 'Time Jump & Landmark 10s! ⏰',
      summary: 'Break the second number to land on 10! For 8 + 7, do 8 + 2 = 10, then add the remaining 5 to get 15.',
      sampleProblem: {
        question: '8 + 7',
        correctAnswer: '15',
        hint: 'Split 7 into 2 + 5. 8 + 2 = 10, plus 5 is 15!'
      }
    }
  },
  {
    tier: 3,
    title: 'Core Multiplication & Money',
    subtitle: '2×, 5×, 10× Tables & Coin Counting',
    location: 'Multiplication River',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    description: 'Build core multiplication tables and count coin combinations under $1.00.',
    trailTrick: {
      title: 'Quarter Rhythm (25¢, 50¢, 75¢, $1.00)! 🪙',
      summary: 'Count quarters in rhythm: 25¢, 50¢, 75¢, $1.00! For change under $1.00, count up to 100¢.',
      sampleProblem: {
        question: '3 Quarters (75¢) + 1 Dime (10¢)',
        correctAnswer: '85',
        hint: '3 Quarters = 75¢. 75¢ + 10¢ = 85¢!'
      }
    }
  },
  {
    tier: 4,
    title: 'Complete Multiplication',
    subtitle: '3× through 12× Tables',
    location: 'Factor Canyon',
    icon: '🏜️',
    color: 'from-purple-400 to-indigo-500',
    description: 'Master the full multiplication table grid up to 12×12.',
    trailTrick: {
      title: '10-Finger Magic for 9s! 🖐️',
      summary: 'Put down the finger you multiply by 9. Fingers left = Tens, fingers right = Ones!',
      sampleProblem: {
        question: '9 × 6',
        correctAnswer: '54',
        hint: 'Put down 6th finger. 5 left (50) + 4 right (4) = 54!'
      }
    }
  },
  {
    tier: 5,
    title: 'Division & Divisibility Secrets',
    subtitle: 'Fact Families & Divisibility Rules',
    location: 'Division Falls',
    icon: '🏞️',
    color: 'from-sky-400 to-blue-600',
    description: 'Master division fact families (56 ÷ 8 = 7) and digit divisibility secrets.',
    trailTrick: {
      title: 'Sum-of-3 Rule & Fact Family Reversal! 🏞️',
      summary: 'Add the digits together! If the digit sum divides by 3, the entire number is divisible by 3.',
      sampleProblem: {
        question: 'Is 123 divisible by 3? (Yes/No)',
        correctAnswer: 'Yes',
        hint: '1 + 2 + 3 = 6. Since 6 ÷ 3 = 2, 123 is divisible by 3!'
      }
    }
  },
  {
    tier: 6,
    title: 'Multi-Digit Math & Elapsed Time',
    subtitle: '2-Digit Operations, Time Jumps & Dollars',
    location: 'Boulder Ridge',
    icon: '⛰️',
    color: 'from-amber-500 to-stone-600',
    description: 'Mental math (45+38=83), calculate elapsed time jumps, and dollar change.',
    trailTrick: {
      title: 'Tens-First Split & Clock Jump! ⛰️',
      summary: 'Add the tens first (40+30=70), then add the ones (5+8=13) to get 83 instantly!',
      sampleProblem: {
        question: '45 + 38',
        correctAnswer: '83',
        hint: 'Tens: 40 + 30 = 70. Ones: 5 + 8 = 13. 70 + 13 = 83!'
      }
    }
  },
  {
    tier: 7,
    title: 'LCM, GCF & Percentages',
    subtitle: 'Least Common Multiples, GCF & Percentages',
    location: 'Fraction Falls',
    icon: '🧩',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Find Least Common Multiples (LCM), Greatest Common Factors (GCF), and percentages.',
    trailTrick: {
      title: 'Summit Sync (LCM) & GCF Difference Trick! 🧩',
      summary: 'For GCF(12, 18), subtract them (18 - 12 = 6). Since 6 divides both, 6 is the GCF!',
      sampleProblem: {
        question: 'GCF of 12 and 18',
        correctAnswer: '6',
        hint: '18 - 12 = 6. 6 divides both 12 and 18!'
      }
    }
  },
  {
    tier: 8,
    title: 'Exponents, Roots & PEMDAS',
    subtitle: 'Powers, Square Roots & Order of Operations',
    location: 'Mount Kibo Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master exponents (2³), square roots (√81), and PEMDAS at the peak of Mount Kibo!',
    trailTrick: {
      title: 'Exponent Base Multiply & PEMDAS Ladder! 🏔️',
      summary: 'For 2³, multiply the base 3 times: 2 × 2 × 2 = 8! Evaluate Parentheses & Exponents first.',
      sampleProblem: {
        question: '2³',
        correctAnswer: '8',
        hint: '2 × 2 × 2 = 8!'
      }
    }
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
      if (type < 0.25) {
        // Time Basics (Minutes to hour / half hour)
        const hours = Math.floor(Math.random() * 8) + 1;
        const minsAdd = [15, 30, 45][Math.floor(Math.random() * 3)];
        num1 = hours;
        num2 = minsAdd;
        answer = `${hours}:${minsAdd === 15 ? '15' : minsAdd === 30 ? '30' : '45'} PM`;
        operatorSymbol = '⏰';
        displayString = `What time is ${minsAdd} mins after ${hours}:00 PM?`;
        hint = 'Hint: Count forward by 15-minute quarters!';
      } else if (type < 0.50) {
        num1 = Math.floor(Math.random() * 5) + 5;
        num2 = Math.floor(Math.random() * 5) + 6;
        answer = num1 + num2;
        operatorSymbol = '+';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else if (type < 0.75) {
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
      const type = Math.random();
      if (type < 0.25) {
        // Coin Counting (Quarters, Dimes, Nickels)
        const q = Math.floor(Math.random() * 3) + 1; // 1-3 quarters
        const d = Math.floor(Math.random() * 3) + 1; // 1-3 dimes
        answer = q * 25 + d * 10;
        num1 = q;
        num2 = d;
        operatorSymbol = '🪙';
        displayString = `${q} Quarter${q > 1 ? 's' : ''} + ${d} Dime${d > 1 ? 's' : ''} = ? ¢`;
        hint = 'Hint: Quarters are 25¢, Dimes are 10¢!';
      } else if (type < 0.45) {
        // Making Change under $1.00
        const cost = (Math.floor(Math.random() * 15) + 5) * 5; // 25c - 95c
        answer = 100 - cost;
        num1 = 100;
        num2 = cost;
        operatorSymbol = '🪙';
        displayString = `Pay $1.00 for an item costing ${cost}¢. Change?`;
        hint = 'Hint: Subtract the cost from 100¢!';
      } else {
        const tables = [2, 5, 10];
        num1 = tables[Math.floor(Math.random() * tables.length)];
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 * num2;
        operatorSymbol = '×';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      }
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
      const subType = Math.random();
      if (subType < 0.2) {
        // Elapsed Time Jumps
        const startHour = Math.floor(Math.random() * 4) + 1; // 1 to 4 PM
        const startMin = 30;
        const durHours = 1;
        const durMins = [15, 30, 45][Math.floor(Math.random() * 3)];
        num1 = startHour;
        num2 = durMins;
        answer = `${durHours} hr ${durMins} min`;
        operatorSymbol = '⏱️';
        displayString = `Hike from ${startHour}:${startMin} PM to ${startHour + durHours + 1}:${(startMin + durMins) % 60 === 0 ? '00' : '15'} PM. Duration?`;
        hint = 'Hint: Jump to the next full hour first!';
      } else if (subType < 0.4) {
        // Multi-Dollar Change
        const bill = [5, 10, 20][Math.floor(Math.random() * 3)];
        const costCents = Math.floor(Math.random() * 300) + 150; // $1.50 - $4.50
        const costDollars = (costCents / 100).toFixed(2);
        answer = `$${(bill - costDollars).toFixed(2)}`;
        num1 = bill;
        num2 = costDollars;
        operatorSymbol = '💵';
        displayString = `Pay $${bill}.00 for a trail hat costing $${costDollars}. Change?`;
        hint = 'Hint: Count up to the dollar!';
      } else if (subType < 0.7) {
        num1 = Math.floor(Math.random() * 40) + 15;
        num2 = Math.floor(Math.random() * 40) + 15;
        answer = num1 + num2;
        operatorSymbol = '+';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      } else {
        num1 = Math.floor(Math.random() * 50) + 40;
        num2 = Math.floor(Math.random() * 30) + 12;
        answer = num1 - num2;
        operatorSymbol = '−';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      }
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
