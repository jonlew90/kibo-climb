/**
 * Skip Diagnostic Engine
 * Handles concept categorization, stuck vs avoidance categorization,
 * pattern detection triggers (topic bottlenecks & session fatigue),
 * parent visual breakdown metrics, and actionable diagnostic card generation.
 */

export const MATH_CONCEPTS = [
  { id: 'add_sub', name: 'Addition & Subtraction', icon: '🌱' },
  { id: 'mult_foundations', name: 'Multiplication Foundations', icon: '🌲' },
  { id: 'adv_multiplication', name: 'Advanced Multiplication', icon: '🌊' },
  { id: 'multi_digit', name: 'Multi-Digit Shortcuts', icon: '🏜️' },
  { id: 'money_decimals', name: 'Money & Decimals', icon: '🪙' },
  { id: 'division_ladder', name: 'Division', icon: '⛰️' },
  { id: 'fractions_lcm_gcf', name: 'Fractions & GCF/LCM', icon: '🧩' },
  { id: 'peak_algebra', name: 'Pre-Algebra & Exponents', icon: '🏔️' }
];

/**
 * Maps a math problem object to its human-readable concept name.
 */
export function getConceptForProblem(problem) {
  if (!problem) return 'Addition & Subtraction';

  if (problem.concept) return problem.concept;

  const display = String(problem.displayString || '');
  const type = String(problem.type || '');
  const tier = Number(problem.tier) || 1;

  if (display.includes('/') || type.includes('fraction') || tier === 7) {
    return 'Fractions & GCF/LCM';
  }
  if (display.includes('$') || display.includes('¢') || type.includes('money') || type.includes('decimal') || tier === 5) {
    return 'Money & Decimals';
  }
  if (display.includes('÷') || type.includes('division') || tier === 6) {
    return 'Division';
  }
  if (display.includes('^') || display.includes('√') || type.includes('algebra') || tier === 8) {
    return 'Pre-Algebra & Exponents';
  }
  if (display.includes('×') || type.includes('multiplication')) {
    if (tier >= 4) return 'Multi-Digit Shortcuts';
    if (tier === 3) return 'Advanced Multiplication';
    return 'Multiplication Foundations';
  }
  if (tier === 4) return 'Multi-Digit Shortcuts';
  if (tier === 3) return 'Advanced Multiplication';
  if (tier === 2) return 'Multiplication Foundations';

  return 'Addition & Subtraction';
}

/**
 * Categorizes a skip attempt based on time elapsed before skipping.
 * - Immediate (<3s): Topic avoidance / prerequisite knowledge gap
 * - Deliberate (≥30s): Active effort before getting stuck (self-regulation)
 * - Moderate (3s-29s): Active solve attempt before passing
 */
export function categorizeSkip(timeElapsedSec = 0) {
  const sec = Number(timeElapsedSec) || 0;
  if (sec < 3.0) {
    return {
      type: 'immediate',
      label: 'Immediate Skip (<3s)',
      insight: 'Topic avoidance / prerequisite knowledge gap',
      color: 'rose'
    };
  }
  if (sec >= 30.0) {
    return {
      type: 'deliberate',
      label: 'Deliberate Skip (≥30s)',
      insight: 'Active effort before getting stuck (self-regulation)',
      color: 'emerald'
    };
  }
  return {
    type: 'moderate',
    label: 'Moderate Hesitation (3s–29s)',
    insight: 'Tried briefly before passing',
    color: 'amber'
  };
}

/**
 * Analyzes skip logs to detect pattern triggers:
 * 1. Topic Bottleneck: 3+ skips on the same concept within session or recent logs.
 * 2. Session Fatigue: 3+ skips within 60 seconds regardless of topic.
 */
export function detectDiagnosticTriggers(skipLogs = []) {
  if (!Array.isArray(skipLogs) || skipLogs.length === 0) {
    return {
      topicBottlenecks: [],
      sessionFatigue: null,
      immediateSkips: [],
      deliberateSkips: []
    };
  }

  // Group by concept
  const conceptCounts = {};
  const immediateSkips = [];
  const deliberateSkips = [];

  skipLogs.forEach((log) => {
    const concept = log.concept || 'General Math';
    if (!conceptCounts[concept]) {
      conceptCounts[concept] = { count: 0, logs: [] };
    }
    conceptCounts[concept].count += 1;
    conceptCounts[concept].logs.push(log);

    const cat = categorizeSkip(log.timeElapsedSec);
    if (cat.type === 'immediate') {
      immediateSkips.push(log);
    } else if (cat.type === 'deliberate') {
      deliberateSkips.push(log);
    }
  });

  // Filter topic bottlenecks (3+ skips)
  const topicBottlenecks = Object.entries(conceptCounts)
    .filter(([_, data]) => data.count >= 3)
    .map(([concept, data]) => {
      const totalSec = data.logs.reduce((acc, l) => acc + (l.timeElapsedSec || 0), 0);
      const avgTime = Math.round(totalSec / data.logs.length);
      return {
        concept,
        count: data.count,
        avgTimeSec: avgTime,
        logs: data.logs
      };
    });

  // Detect session fatigue (3+ skips in 60 seconds window)
  let sessionFatigue = null;
  const sortedLogs = [...skipLogs].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  for (let i = 0; i <= sortedLogs.length - 3; i++) {
    const tStart = new Date(sortedLogs[i].timestamp || 0).getTime();
    const tEnd = new Date(sortedLogs[i + 2].timestamp || 0).getTime();
    if (tStart > 0 && tEnd > 0 && (tEnd - tStart) <= 60000) {
      sessionFatigue = {
        count: 3,
        timeSpanSec: Math.round((tEnd - tStart) / 1000),
        firstTimestamp: sortedLogs[i].timestamp,
        lastTimestamp: sortedLogs[i + 2].timestamp
      };
      break;
    }
  }

  return {
    topicBottlenecks,
    sessionFatigue,
    immediateSkips,
    deliberateSkips
  };
}

/**
 * Calculates Correct vs Incorrect vs Skipped metrics per math concept across history and skip logs.
 */
export function calculateConceptBreakdown(sprintHistory = [], skipLogs = []) {
  const breakdown = {};

  MATH_CONCEPTS.forEach((c) => {
    breakdown[c.name] = {
      id: c.id,
      name: c.name,
      icon: c.icon,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      total: 0
    };
  });

  // Process sprint history
  (sprintHistory || []).forEach((sprint) => {
    const tier = Number(sprint.tier) || 1;
    let conceptName = 'Addition & Subtraction';
    if (tier === 2) conceptName = 'Multiplication Foundations';
    else if (tier === 3) conceptName = 'Advanced Multiplication';
    else if (tier === 4) conceptName = 'Multi-Digit Shortcuts';
    else if (tier === 5) conceptName = 'Money & Decimals';
    else if (tier === 6) conceptName = 'Division';
    else if (tier === 7) conceptName = 'Fractions & GCF/LCM';
    else if (tier >= 8) conceptName = 'Pre-Algebra & Exponents';

    if (!breakdown[conceptName]) {
      breakdown[conceptName] = {
        id: `concept_${tier}`,
        name: conceptName,
        icon: '🔢',
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0
      };
    }

    const correct = Number(sprint.correctCount || sprint.score || 0);
    const totalQ = Number(sprint.totalQuestions || 12);
    const incorrect = Math.max(0, totalQ - correct);

    breakdown[conceptName].correct += correct;
    breakdown[conceptName].incorrect += incorrect;
  });

  // Process skip logs
  (skipLogs || []).forEach((log) => {
    const conceptName = log.concept || 'Addition & Subtraction';
    if (!breakdown[conceptName]) {
      breakdown[conceptName] = {
        id: 'concept_custom',
        name: conceptName,
        icon: '🔢',
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0
      };
    }
    breakdown[conceptName].skipped += 1;
  });

  // Calculate totals and percentages
  Object.keys(breakdown).forEach((key) => {
    const b = breakdown[key];
    b.total = b.correct + b.incorrect + b.skipped;
    if (b.total > 0) {
      b.correctPct = Math.round((b.correct / b.total) * 100);
      b.incorrectPct = Math.round((b.incorrect / b.total) * 100);
      b.skippedPct = Math.round((b.skipped / b.total) * 100);
    } else {
      b.correctPct = 0;
      b.incorrectPct = 0;
      b.skippedPct = 0;
    }
  });

  return breakdown;
}

/**
 * Generates warm, actionable parent diagnostic insight cards based on triggers and skip categorization.
 */
export function generateParentInsightCards(skipLogs = [], sprintHistory = [], profileName = 'Child') {
  const cards = [];
  const name = profileName || 'Child';
  const triggers = detectDiagnosticTriggers(skipLogs);

  // 1. Topic Bottlenecks Cards
  triggers.topicBottlenecks.forEach((b) => {
    const deliberateCount = b.logs.filter((l) => l.timeElapsedSec >= 30).length;
    const immediateCount = b.logs.filter((l) => l.timeElapsedSec < 3).length;

    let tip = `A quick 5-minute review on ${b.concept.toLowerCase()} will help build confidence!`;
    if (b.concept.includes('Fraction')) {
      tip = 'A quick review on common denominators and fraction models will help!';
    } else if (b.concept.includes('Multiplication')) {
      tip = 'Practicing multiplication landmark facts (like 5s and 10s) will boost speed!';
    } else if (b.concept.includes('Money') || b.concept.includes('Decimal')) {
      tip = 'Counting change up to $1.00 using physical coins or benchmark jumps can work wonders!';
    } else if (b.concept.includes('Division')) {
      tip = 'Remind them that division is just multiplication in reverse (asking how many groups)!';
    }

    let detailMsg = '';
    if (deliberateCount >= 2) {
      detailMsg = `${name} skipped ${b.count} ${b.concept.toLowerCase()} problems today after trying for over 30 seconds each.`;
    } else if (immediateCount >= 2) {
      detailMsg = `${name} passed ${b.count} ${b.concept.toLowerCase()} problems in under 3 seconds each, suggesting a prerequisite knowledge gap.`;
    } else {
      detailMsg = `${name} passed ${b.count} ${b.concept.toLowerCase()} problems during recent climbs.`;
    }

    cards.push({
      id: `bottleneck-${b.concept}`,
      type: 'bottleneck',
      title: `Topic Bottleneck: ${b.concept}`,
      icon: '🧩',
      badge: 'Needs Review',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      description: `${detailMsg} ${tip}`
    });
  });

  // 2. Session Fatigue Card
  if (triggers.sessionFatigue) {
    cards.push({
      id: 'session-fatigue',
      type: 'fatigue',
      title: 'Session Fatigue Detected',
      icon: '⚡',
      badge: 'Pacing Alert',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      description: `${name} passed 3 problems within ${triggers.sessionFatigue.timeSpanSec} seconds. Short 10-minute sessions or a quick water break can keep focus fresh!`
    });
  }

  // 3. Positive Self-Regulation / Active Effort Card
  if (triggers.deliberateSkips.length > 0 && triggers.topicBottlenecks.length === 0) {
    cards.push({
      id: 'active-effort',
      type: 'positive_regulation',
      title: 'Great Self-Regulation & Effort',
      icon: '💪',
      badge: 'Active Solve',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: `${name} gave deliberate effort (30+ seconds) on challenging problems before choosing to try another. This shows great mathematical perseverance!`
    });
  }

  // Default encouragement card if no bottlenecks or fatigue
  if (cards.length === 0) {
    cards.push({
      id: 'steady-climb',
      type: 'steady',
      title: 'Steady Climb Progress',
      icon: '🏔️',
      badge: 'On Track',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: `${name} is maintaining a balanced pacing through problem sets with great stamina and no major bottlenecks!`
    });
  }

  return cards;
}
