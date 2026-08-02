export function getTierFromRating(rating = 1000) {
  const numRating = Number(rating) || 1000;
  if (numRating < 1200) return 1; // Tier 1: Sums & Differences to 20 (Addition & Subtraction only)
  if (numRating < 1400) return 2; // Tier 2: Multiplication 0s-5s
  if (numRating < 1600) return 3; // Tier 3: Advanced Multiplication (6s-9s) & Time Math
  if (numRating < 1800) return 4; // Tier 4: Division & Fraction Foundations
  if (numRating < 2000) return 5; // Tier 5: Decimals & Money
  if (numRating < 2200) return 6; // Tier 6: Multi-Digit Multiplication & Long Division
  if (numRating < 2400) return 7; // Tier 7: Pre-Algebra & Order of Operations
  return 8;                       // Tier 8: Exponents, Square Roots & Peak Algebra
}

export const CURRICULUM_TIERS = [
  {
    tier: 1,
    id: 1,
    name: 'Sums & Differences to 20',
    title: 'Sums & Differences to 20',
    subtitle: 'Addition & Subtraction Fluency',
    location: 'Sunny Meadow',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Master single-digit addition and subtraction fluency.',
    problemCount: 20,
    targetSpeedPerQuestion: 2.0,
    targetSprintDuration: 40,
    targetSpeed: '≤ 2.0s / question',
    topics: [
      'Single-digit addition & subtraction fluency',
      'Making 10s regrouping strategy (Anchor to 10)',
      'Plus 9 Hop shortcut (+10 then subtract 1)',
      'Fact families within 20'
    ],
    associatedBadge: { id: 'perfect_sprint', name: 'Accuracy Ace', icon: '🎯' },
    trailTrick: {
      title: 'Making 10s',
      description: 'Split the smaller number to turn the bigger number into 10 first! For 8 + 5, take 2 from 5 to make 10, then add 3 to get 13!',
      summary: 'Split the smaller number to turn the bigger number into 10 first! For 8 + 5, take 2 from 5 to make 10, then add 3 to get 13!',
      sampleProblem: {
        question: '8 + 5',
        correctAnswer: '13',
        hint: '8 + 2 = 10, then add the remaining 3!'
      }
    },
    proTip: {
      title: 'Anchor to 10',
      content: '10 is your safest mountain resting spot! Always look for ways to break numbers apart to make a clean 10 first.',
      summary: '10 is your safest mountain resting spot! Always look for ways to break numbers apart to make a clean 10 first.'
    }
  },
  {
    tier: 2,
    id: 2,
    name: 'Multiplication Foundations (0s–5s)',
    title: 'Multiplication Foundations (0s–5s)',
    subtitle: 'Fact Tables & Clock Tricks',
    location: 'Forest Trail',
    icon: '🌲',
    color: 'from-amber-400 to-orange-500',
    description: 'Build core multiplication fluency for factors 0s through 5s.',
    problemCount: 20,
    targetSpeedPerQuestion: 2.5,
    targetSprintDuration: 50,
    targetSpeed: '≤ 2.5s / question',
    topics: [
      'Multiplication tables for 0s, 1s, 2s, 3s, 4s, and 5s',
      'The 5s Clock Trick (10x cut in half)',
      'Reading analog clock faces (hours & 15-min quarters)',
      'Commutative property (order flip)'
    ],
    associatedBadge: { id: 'clock_master', name: 'Clock Master', icon: '⏰' },
    trailTrick: {
      title: 'The 5s Clock Trick',
      description: 'To multiply by 5, multiply by 10 first, then cut the answer in half! For 5 × 8, do 10 × 8 = 80, then half of 80 is 40!',
      summary: 'To multiply by 5, multiply by 10 first, then cut the answer in half! For 5 × 8, do 10 × 8 = 80, then half of 80 is 40!',
      sampleProblem: {
        question: '5 × 8',
        correctAnswer: '40',
        hint: '10 × 8 = 80. Half of 80 is 40!'
      }
    },
    proTip: {
      title: 'Commutative Flip',
      content: "Order doesn't matter in multiplication! If 8 × 3 feels tricky, flip it to 3 × 8 and skip-count by 3s!",
      summary: "Order doesn't matter in multiplication! If 8 × 3 feels tricky, flip it to 3 × 8 and skip-count by 3s!"
    }
  },
  {
    tier: 3,
    id: 3,
    name: 'Advanced Multiplication (6s–9s) & Time Math',
    title: 'Advanced Multiplication & Time Math',
    subtitle: 'Multiplication Tables & Time Math Jumps',
    location: 'Multiplication River',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-500',
    description: 'Master advanced multiplication tables and elapsed time math.',
    problemCount: 20,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 80,
    targetSpeed: '≤ 4.0s / question',
    topics: [
      'Multiplication tables for 6s, 7s, 8s, and 9s',
      'Reading analog clock faces & calculating elapsed time',
      'The 9s Finger Trick (10-finger magic)',
      'Counting coin combinations (quarters, dimes, nickels)'
    ],
    associatedBadge: { id: 'coin_counter', name: 'Trail Merchant', icon: '🪙' },
    trailTrick: {
      title: 'The 9s Finger Trick',
      description: 'Fold down the finger you are multiplying by! Count fingers to the left for tens, and fingers to the right for ones!',
      summary: 'Fold down the finger you are multiplying by! Count fingers to the left for tens, and fingers to the right for ones!',
      sampleProblem: {
        question: '9 × 7',
        correctAnswer: '63',
        hint: 'Fold finger 7 down → 6 tens on left, 3 ones on right!'
      }
    },
    proTip: {
      title: 'Build from Known Facts',
      content: 'Stuck on 7 × 8? Use a landmark! Do 5 × 8 = 40, then add two more 8s (16) to reach 56.',
      summary: 'Stuck on 7 × 8? Use a landmark! Do 5 × 8 = 40, then add two more 8s (16) to reach 56.'
    }
  },
  {
    tier: 4,
    id: 4,
    name: 'Multi-Digit & 11s Trick',
    title: 'Multi-Digit & 11s Trick',
    subtitle: 'Multi-Digit Mental Math Shortcuts',
    location: 'Factor Canyon',
    icon: '🏜️',
    color: 'from-purple-400 to-indigo-500',
    description: 'Master multi-digit mental multiplication and the 11s split shortcut.',
    problemCount: 20,
    targetSpeedPerQuestion: 3.0,
    targetSprintDuration: 60,
    targetSpeed: '≤ 3.0s / question',
    topics: [
      '11s Split & Add mental multiplication shortcut',
      '2-digit mental addition (left-to-right tens first)',
      'Finger strategies for 9s and 11s',
      'Regrouping boundary leaps'
    ],
    associatedBadge: { id: 'master_9s', name: '10-Finger Magic', icon: '🖐️' },
    trailTrick: {
      title: '11s Split & Add',
      description: 'For 11 × 35, split the 3 and 5, add them together (3 + 5 = 8), and put the sum in the middle to get 385!',
      summary: 'For 11 × 35, split the 3 and 5, add them together (3 + 5 = 8), and put the sum in the middle to get 385!',
      sampleProblem: {
        question: '11 × 35',
        correctAnswer: '385',
        hint: 'Split 3 and 5. Add 3 + 5 = 8, put 8 in the middle!'
      }
    },
    proTip: {
      title: 'Left-to-Right Mental Addition',
      content: 'Add the tens first, then the ones! For 45 + 38, do 45 + 30 = 75, then + 8 = 83.',
      summary: 'Add the tens first, then the ones! For 45 + 38, do 45 + 30 = 75, then + 8 = 83.'
    }
  },
  {
    tier: 5,
    id: 5,
    name: 'Money & Elapsed Time Jumps',
    title: 'Money & Elapsed Time Jumps',
    subtitle: 'Coin Combinations, Change & Time Jumps',
    location: 'Division Falls',
    icon: '🪙',
    color: 'from-sky-400 to-blue-600',
    description: 'Calculate coin combinations, change under $1.00, and elapsed time jumps.',
    problemCount: 20,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 80,
    targetSpeed: '≤ 4.0s / question',
    topics: [
      'Calculating change under $1.00 ($1.00 Bridge)',
      'Elapsed time jumps forward and backward',
      'Multi-digit mental subtraction',
      'High-speed velocity recall'
    ],
    associatedBadge: { id: 'speed_demon', name: 'Speed Demon', icon: '🏃' },
    trailTrick: {
      title: 'The $1.00 Bridge',
      description: 'Count up to $1.00 (100¢) using benchmark coins! From 65¢, add 5¢ to get to 70¢, then 30¢ to reach $1.00!',
      summary: 'Count up to $1.00 (100¢) using benchmark coins! From 65¢, add 5¢ to get to 70¢, then 30¢ to reach $1.00!',
      sampleProblem: {
        question: '$1.00 - $0.65',
        correctAnswer: '0.35',
        hint: 'Count up from 65¢: +5¢ to 70¢, then +30¢ to $1.00!'
      }
    },
    proTip: {
      title: 'Use the Number Line Bridge',
      content: 'For time and money, jump to the nearest benchmark! Jump to the next hour or whole dollar first, then add the leftover minutes or cents.',
      summary: 'For time and money, jump to the nearest benchmark! Jump to the next hour or whole dollar first, then add the leftover minutes or cents.'
    }
  },
  {
    tier: 6,
    id: 6,
    name: 'Division & Long Division Mental Math',
    title: 'Division & Long Division Mental Math',
    subtitle: 'Division Fact Families & Halving Ladders',
    location: 'Boulder Ridge',
    icon: '⛰️',
    color: 'from-amber-500 to-stone-600',
    description: 'Master division fact families and the halving ladder mental strategy.',
    problemCount: 20,
    targetSpeedPerQuestion: 3.5,
    targetSprintDuration: 70,
    targetSpeed: '≤ 3.5s / question',
    topics: [
      'Division fact families (reverse multiplication)',
      'The Halving Ladder mental division strategy (÷4 and ÷8)',
      'Mental long division estimation',
      'Elapsed time hours & minutes conversions'
    ],
    associatedBadge: { id: 'clock_master', name: 'Clock Master', icon: '⏰' },
    trailTrick: {
      title: 'The Halving Ladder',
      description: 'Dividing by 4? Cut the number in half twice! For 84 ÷ 4, half of 84 is 42, and half of 42 is 21!',
      summary: 'Dividing by 4? Cut the number in half twice! For 84 ÷ 4, half of 84 is 42, and half of 42 is 21!',
      sampleProblem: {
        question: '84 ÷ 4',
        correctAnswer: '21',
        hint: 'Half of 84 is 42. Half of 42 is 21!'
      }
    },
    proTip: {
      title: 'Think Multiplication in Reverse',
      content: "Division is just asking 'How many groups?' For 72 ÷ 8, think: 'What times 8 equals 72?'",
      summary: "Division is just asking 'How many groups?' For 72 ÷ 8, think: 'What times 8 equals 72?'"
    }
  },
  {
    tier: 7,
    id: 7,
    name: 'Fractions, Decimals, & GCF/LCM',
    title: 'Fractions, Decimals, & GCF/LCM',
    subtitle: 'Least Common Multiples & Factor Ladders',
    location: 'Fraction Falls',
    icon: '🧩',
    color: 'from-teal-400 via-emerald-500 to-cyan-600',
    description: 'Find Least Common Multiples (LCM), Greatest Common Factors (GCF), and decimal percentages.',
    problemCount: 20,
    targetSpeedPerQuestion: 4.0,
    targetSprintDuration: 80,
    targetSpeed: '≤ 4.0s / question',
    topics: [
      'Least Common Multiples (LCM Summit Sync)',
      'Greatest Common Factors (GCF Factor Ladder)',
      'Fraction & decimal equivalents (quarter & tenth rhythms)',
      'Divisibility rules (2, 3, 5, 9, 10)'
    ],
    associatedBadge: { id: 'summit_sync', name: 'Summit Sync', icon: '📐' },
    trailTrick: {
      title: 'The GCF Factor Ladder',
      description: 'To find the GCF of 12 and 18, divide both by shared prime factors (2, then 3). Multiply the divisors (2 × 3 = 6)!',
      summary: 'To find the GCF of 12 and 18, divide both by shared prime factors (2, then 3). Multiply the divisors (2 × 3 = 6)!',
      sampleProblem: {
        question: 'GCF of 12 & 18',
        correctAnswer: '6',
        hint: 'Find the largest number that divides evenly into both 12 and 18.'
      }
    },
    proTip: {
      title: 'GCF vs. LCM Landmark',
      content: 'Remember: GCF makes a smaller number (factors divide down), while LCM makes a larger number (multiples leap up)!',
      summary: 'Remember: GCF makes a smaller number (factors divide down), while LCM makes a larger number (multiples leap up)!'
    }
  },
  {
    tier: 8,
    id: 8,
    name: 'Exponents, Square Roots, & Pre-Algebra',
    title: 'Exponents, Square Roots, & Pre-Algebra',
    subtitle: 'Powers, Roots & PEMDAS Peak',
    location: 'Mount Kibo Summit',
    icon: '🏔️',
    color: 'from-yellow-400 via-amber-500 to-purple-600',
    description: 'Master exponents (2⁴), square roots (√81), and PEMDAS at the peak of Mount Kibo!',
    problemCount: 20,
    targetSpeedPerQuestion: 3.5,
    targetSprintDuration: 70,
    targetSpeed: '≤ 3.5s / question',
    topics: [
      'Evaluating exponents (2⁴, 3³, 5²)',
      'Square roots of perfect squares (√81 = 9)',
      'Order of Operations (PEMDAS Peak)',
      'Combining like terms in simple pre-algebra equations'
    ],
    associatedBadge: { id: 'exponent_peak', name: 'Power Peak', icon: '⚡' },
    trailTrick: {
      title: 'Power Doubling',
      description: 'An exponent tells you how many times to multiply the base by itself! For 2⁴, double four times: 2 → 4 → 8 → 16!',
      summary: 'An exponent tells you how many times to multiply the base by itself! For 2⁴, double four times: 2 → 4 → 8 → 16!',
      sampleProblem: {
        question: 'Evaluate 2⁴',
        correctAnswer: '16',
        hint: 'Multiply 2 × 2 × 2 × 2!'
      }
    },
    proTip: {
      title: 'Treat Variables Like Items',
      content: 'In pre-algebra, x is just a box of mystery Sparks! 3x + 2x just means 3 boxes plus 2 boxes equals 5 boxes (5x).',
      summary: 'In pre-algebra, x is just a box of mystery Sparks! 3x + 2x just means 3 boxes plus 2 boxes equals 5 boxes (5x).'
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

// Single Source of Truth for Dynamic Star Calculation
export function calculateStars(accuracyPct, durationInSeconds, tierConfig = null, totalQuestions = 20) {
  const accuracy = Number(accuracyPct) || 0;
  const rawSec = Number(durationInSeconds) || 0;
  const durationSec = rawSec > 1000 ? Math.floor(rawSec / 1000) : rawSec;

  const targetSpeed = tierConfig?.targetSpeedPerQuestion || 2.0;
  const questionsCount = Number(totalQuestions || 20);

  const targetTime3Star = questionsCount * targetSpeed;
  const targetTime2Star = targetTime3Star * 1.5;

  if (accuracy >= 95 && durationSec <= targetTime3Star) {
    return 3; // Speed & Accuracy Mastery
  }
  if (accuracy >= 90 && durationSec <= targetTime2Star) {
    return 2; // Proficiency
  }
  if (accuracy >= 80) {
    return 1; // Basic Completion
  }

  return 0; // Needs Retry
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

// Problem generator per Tier (with cumulative topic review for higher tiers)
export function generateTierProblem(targetTier) {
  let effectiveTier = targetTier;
  // For tiers > 1, 55% chance current tier, 45% chance of any unlocked lower tier (including fractions, decimals, division)
  if (targetTier > 1 && Math.random() < 0.45) {
    effectiveTier = Math.floor(Math.random() * (targetTier - 1)) + 1;
  }

  let num1, num2, answer, operatorSymbol, displayString, options, hint;

  switch (effectiveTier) {
    case 1: {
      if (Math.random() > 0.4) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 + num2;
        operatorSymbol = '+';
        const maxVal = Math.max(num1, num2);
        const minVal = Math.min(num1, num2);
        hint = `Tip: Start at ${maxVal} and count on ${minVal}!`;
      } else {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        operatorSymbol = '−';
        const diff = num1 - num2;
        if (diff === 1) {
          hint = `Tip: How far apart are ${num1} and ${num2}? Just 1 step!`;
        } else {
          hint = `Tip: Start at ${num1} and count back ${num2}!`;
        }
      }
      displayString = `${num1} ${operatorSymbol} ${num2}`;
      break;
    }
    case 2: {
      const type = Math.random();
      if (type < 0.25) {
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
        const q = Math.floor(Math.random() * 3) + 1;
        const d = Math.floor(Math.random() * 3) + 1;
        answer = q * 25 + d * 10;
        num1 = q;
        num2 = d;
        operatorSymbol = '🪙';
        displayString = `${q} Quarter${q > 1 ? 's' : ''} + ${d} Dime${d > 1 ? 's' : ''}`;
        hint = 'Hint: Quarters are 25¢, Dimes are 10¢!';
      } else if (type < 0.45) {
        const cost = (Math.floor(Math.random() * 15) + 5) * 5;
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
      const type = Math.random();
      if (type < 0.35) {
        const items = ['Trail Bar', 'Water Bottle', 'Carabiner', 'Compass', 'Trail Map', 'Kibo Badge'];
        const item = items[Math.floor(Math.random() * items.length)];
        const centsList = [15, 25, 35, 45, 55, 65, 75, 85];
        const costCents = centsList[Math.floor(Math.random() * centsList.length)];
        const changeCents = 100 - costCents;

        const templateType = Math.floor(Math.random() * 3);
        let ansStr, dispStr, numA, numB;

        if (templateType === 0) {
          dispStr = `${item} costs $0.${costCents}. Change from $1.00?`;
          ansStr = (changeCents / 100).toFixed(2);
          numA = 100;
          numB = costCents;
        } else if (templateType === 1) {
          dispStr = `Spent $0.${costCents} of $1.00. Leftover?`;
          ansStr = (changeCents / 100).toFixed(2);
          numA = 100;
          numB = costCents;
        } else {
          const p1 = [10, 20, 25, 30][Math.floor(Math.random() * 4)];
          const p2 = [15, 25, 35, 40][Math.floor(Math.random() * 4)];
          dispStr = `Saved $0.${p1} & $0.${p2}. Total saved?`;
          ansStr = ((p1 + p2) / 100).toFixed(2);
          numA = p1;
          numB = p2;
        }

        return {
          tier: effectiveTier,
          num1: numA,
          num2: numB,
          operatorSymbol: '🪙',
          answer: ansStr,
          answerString: ansStr,
          displayString: dispStr,
          type: 'money',
          requiresDecimal: true,
          hint: 'Hint: Enter exact dollar decimal amount (e.g. 0.35)!'
        };
      } else if (type < 0.65) {
        // General Decimal Addition & Subtraction
        const isAdd = Math.random() > 0.5;
        const a = (Math.floor(Math.random() * 45) + 10) / 10;
        const b = (Math.floor(Math.random() * 35) + 10) / 10;
        let ansNum, dispText;

        if (isAdd) {
          ansNum = Number((a + b).toFixed(2));
          dispText = `${a} + ${b}`;
          num1 = a;
          num2 = b;
          operatorSymbol = '+';
        } else {
          num1 = Number((a + b).toFixed(2));
          num2 = b;
          ansNum = a;
          dispText = `${num1} − ${num2}`;
          operatorSymbol = '−';
        }

        return {
          tier: effectiveTier,
          num1,
          num2,
          operatorSymbol,
          answer: ansNum.toString(),
          answerString: ansNum.toString(),
          displayString: dispText,
          type: 'decimal',
          requiresDecimal: true,
          hint: 'Hint: Align the decimal points and compute!'
        };
      } else {
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
      }
      break;
    }
    case 6: {
      const subType = Math.random();
      if (subType < 0.35) {
        // Explicit Long Division
        const divisors = [4, 6, 7, 8, 9, 12, 14, 15];
        num2 = divisors[Math.floor(Math.random() * divisors.length)];
        answer = Math.floor(Math.random() * 25) + 11;
        num1 = num2 * answer;
        operatorSymbol = '÷';
        displayString = `${num1} ÷ ${num2}`;
        hint = `Hint: Long division! How many times does ${num2} fit into ${num1}?`;
      } else if (subType < 0.65) {
        const startHour = Math.floor(Math.random() * 4) + 1;
        const startMin = 30;
        const durHours = 1;
        const durMins = [15, 30, 45][Math.floor(Math.random() * 3)];
        num1 = startHour;
        num2 = durMins;
        const endMinTotal = startMin + durMins;
        const endHour = startHour + durHours + Math.floor(endMinTotal / 60);
        const finalMin = endMinTotal % 60;
        answer = `${endHour}:${finalMin === 0 ? '00' : finalMin} PM`;
        operatorSymbol = '⏰';
        displayString = `Hike started at ${startHour}:${startMin} PM. Duration: 1 hr ${durMins} mins. End time?`;
        hint = 'Hint: Add hours first, then add minutes!';
      } else {
        num1 = Math.floor(Math.random() * 50) + 40;
        num2 = Math.floor(Math.random() * 30) + 10;
        answer = num1 - num2;
        operatorSymbol = '−';
        displayString = `${num1} ${operatorSymbol} ${num2}`;
      }
      break;
    }
    case 7: {
      const subType = Math.random();
      if (subType < 0.30) {
        // Fraction Addition & Subtraction
        const den = [4, 5, 6, 8, 10][Math.floor(Math.random() * 5)];
        const n1 = Math.floor(Math.random() * (den - 2)) + 1;
        const n2 = Math.floor(Math.random() * (den - n1 - 1)) + 1;
        const isAdd = Math.random() > 0.5;

        let ansFrac;
        if (isAdd) {
          const numSum = n1 + n2;
          const g = gcd(numSum, den);
          const simpN = numSum / g;
          const simpD = den / g;
          ansFrac = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
          num1 = `${n1}/${den}`;
          num2 = `${n2}/${den}`;
          operatorSymbol = '+';
          displayString = `${n1}/${den} + ${n2}/${den}`;
          hint = `Hint: Keep the denominator (${den}) and add the numerators!`;
        } else {
          const nBig = Math.max(n1 + 1, n2 + 1);
          const nSmall = Math.min(n1, n2);
          const numDiff = nBig - nSmall;
          const g = gcd(numDiff, den);
          const simpN = numDiff / g;
          const simpD = den / g;
          ansFrac = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
          num1 = `${nBig}/${den}`;
          num2 = `${nSmall}/${den}`;
          operatorSymbol = '−';
          displayString = `${nBig}/${den} − ${nSmall}/${den}`;
          hint = `Hint: Keep the denominator (${den}) and subtract the numerators!`;
        }

        return {
          tier: effectiveTier,
          num1,
          num2,
          operatorSymbol,
          answer: ansFrac,
          answerString: ansFrac,
          displayString,
          type: 'fraction',
          requiresFraction: true,
          hint
        };
      } else if (subType < 0.55) {
        const pairs = [
          [4, 6], [3, 5], [6, 8], [4, 10], [5, 10], [6, 9], [8, 12]
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        num1 = pair[0];
        num2 = pair[1];
        answer = lcm(num1, num2);
        operatorSymbol = 'LCM';
        displayString = `Find LCM(${num1}, ${num2})`;
        hint = `Hint: Skip count by ${Math.max(num1, num2)} until ${Math.min(num1, num2)} divides evenly!`;
      } else if (subType < 0.80) {
        const gcfPairs = [
          [12, 18], [16, 24], [20, 30], [15, 25], [14, 21], [18, 27]
        ];
        const pair = gcfPairs[Math.floor(Math.random() * gcfPairs.length)];
        num1 = pair[0];
        num2 = pair[1];
        answer = gcd(num1, num2);
        operatorSymbol = 'GCF';
        displayString = `Find GCF(${num1}, ${num2})`;
        hint = `Hint: Find the largest number that divides into both ${num1} and ${num2}!`;
      } else {
        const p = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        const total = [40, 60, 80, 100, 200][Math.floor(Math.random() * 5)];
        answer = (p / 100) * total;
        num1 = p;
        num2 = total;
        operatorSymbol = '%';
        displayString = `What is ${p}% of ${total}?`;
        hint = `Hint: Multiply ${total} by ${p / 100}!`;
      }
      break;
    }
    case 8: {
      const subType = Math.random();
      if (subType < 0.35) {
        const bases = [2, 3, 5, 10];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const exp = base === 10 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2) + 2;
        num1 = base;
        num2 = exp;
        answer = Math.pow(base, exp);
        operatorSymbol = '^';
        displayString = `${base}^${exp}`;
        hint = `Hint: Multiply ${base} by itself ${exp} times!`;
      } else if (subType < 0.7) {
        const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
        const sq = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
        num1 = sq;
        num2 = 2;
        answer = Math.sqrt(sq);
        operatorSymbol = '√';
        displayString = `√${sq}`;
        hint = `Hint: What number times itself equals ${sq}?`;
      } else {
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 4) + 2;
        const c = Math.floor(Math.random() * 5) + 1;
        answer = a * b + c;
        num1 = `${a} × ${b}`;
        num2 = c;
        operatorSymbol = '+';
        displayString = `${a} × ${b} + ${c}`;
        hint = 'Hint: Remember PEMDAS! Multiply first, then add.';
      }
      break;
    }
    default: {
      num1 = 1;
      num2 = 1;
      answer = 2;
      operatorSymbol = '+';
      displayString = '1 + 1';
    }
  }

  return {
    tier: effectiveTier,
    num1,
    num2,
    operatorSymbol,
    answer,
    answerString: answer.toString(),
    displayString,
    options,
    hint
  };
}

export function generatePlacementDiagnosticSet() {
  const diagnosticProblems = [];
  for (let tierLevel = 1; tierLevel <= 8; tierLevel++) {
    diagnosticProblems.push({
      tierLevel,
      problem: generateTierProblem(tierLevel)
    });
  }
  return diagnosticProblems;
}

export function evaluatePlacementTier(diagnosticResults) {
  let highestPassedTier = 1;

  for (const item of diagnosticResults) {
    if (item.isCorrect) {
      highestPassedTier = item.tierLevel;
    } else {
      break;
    }
  }

  return Math.min(8, Math.max(1, highestPassedTier));
}
