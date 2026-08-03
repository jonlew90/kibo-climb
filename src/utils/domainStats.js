/**
 * Calculates skill domain accuracy and metrics matching the student's actual Competence Rating & Elo Tier.
 * Provides accurate, dynamically updated performance metrics for parent reporting.
 */

export const DOMAIN_DEFINITIONS = [
  {
    id: 'add_sub',
    name: 'Addition & Subtraction',
    icon: '🌱',
    subtitle: 'Sums & Differences to 20 (Making 10s)',
    minUnlockRating: 0,
    tiers: [1],
    defaultAcc: 90,
    defaultSpeed: 1.8
  },
  {
    id: 'mult_foundations',
    name: 'Multiplication Foundations',
    icon: '🌲',
    subtitle: 'Multiplication Facts (0s–5s) & Clock Math',
    minUnlockRating: 1200,
    tiers: [2],
    defaultAcc: 85,
    defaultSpeed: 2.2
  },
  {
    id: 'adv_multiplication',
    name: 'Advanced Multiplication & Coins',
    icon: '🌊',
    subtitle: 'Tables (6s–9s), 9s Trick & Coins',
    minUnlockRating: 1400,
    tiers: [3],
    defaultAcc: 82,
    defaultSpeed: 2.5
  },
  {
    id: 'multi_digit',
    name: 'Multi-Digit Mental Shortcuts',
    icon: '🏜️',
    subtitle: '11s Split Shortcut & Left-to-Right Tens',
    minUnlockRating: 1600,
    tiers: [4],
    defaultAcc: 80,
    defaultSpeed: 2.8
  },
  {
    id: 'money_decimals',
    name: 'Money & Decimal Arithmetic',
    icon: '🪙',
    subtitle: '$1.00 Bridge & Decimal Addition/Subtraction',
    minUnlockRating: 1800,
    tiers: [5],
    defaultAcc: 78,
    defaultSpeed: 3.0
  },
  {
    id: 'division_ladder',
    name: 'Explicit Long Division',
    icon: '⛰️',
    subtitle: 'Division Fact Families & Long Division',
    minUnlockRating: 2000,
    tiers: [6],
    defaultAcc: 75,
    defaultSpeed: 3.2
  },
  {
    id: 'fractions_lcm_gcf',
    name: 'Fractions, % & GCF/LCM',
    icon: '🧩',
    subtitle: 'Fraction Reduction, × / ÷, %, LCM & GCF',
    minUnlockRating: 2200,
    tiers: [7],
    defaultAcc: 72,
    defaultSpeed: 3.5
  },
  {
    id: 'peak_algebra',
    name: 'Pre-Algebra, Signed & Exponents',
    icon: '🏔️',
    subtitle: '2-Step Equations (3x+5=20), Signed (-/+) & Powers',
    minUnlockRating: 2400,
    tiers: [8],
    defaultAcc: 70,
    defaultSpeed: 3.5
  }
];

export const calculateDomainMastery = (sprintHistory = [], currentTier = 1, activeRating = 1000) => {
  const recentSprints = (sprintHistory || []).slice(-20);

  return DOMAIN_DEFINITIONS.map((def) => {
    let matchedCorrect = 0;
    let matchedTotal = 0;
    let matchedDuration = 0;

    recentSprints.forEach((sprint) => {
      if (sprint.tier && def.tiers.includes(sprint.tier)) {
        const correct = Number(sprint.correctCount || sprint.score || 0);
        const total = Number(sprint.totalQuestions || (sprint.answers ? sprint.answers.length : 12));
        matchedCorrect += correct;
        matchedTotal += total;
        matchedDuration += Number(sprint.durationInSeconds || 0);
      }
    });

    let accuracy = 0;
    let speed = def.defaultSpeed;
    let totalAttempted = matchedTotal;
    let status = 'Locked';

    if (matchedTotal > 0) {
      accuracy = Math.round((matchedCorrect / matchedTotal) * 100);
      speed = Number((matchedDuration / matchedTotal).toFixed(1));
      status = accuracy >= 80 ? 'Mastered' : accuracy >= 60 ? 'Practicing' : 'Challenged';
    } else {
      // Real-time calculation based on actual problem history
      const hasAnyHistory = (sprintHistory || []).length > 0;
      
      if (activeRating < def.minUnlockRating) {
        status = 'Locked';
        accuracy = 0;
        speed = def.defaultSpeed;
      } else if (!hasAnyHistory) {
        // Brand new user with 0 completed climbs
        if (def.minUnlockRating < 1200) {
          status = 'Ready for Placement';
          accuracy = 0;
        } else {
          status = 'Locked';
          accuracy = 0;
        }
      } else {
        // Active unlocked strand without recent sprint data
        status = 'Ready for Practice';
        accuracy = 0;
      }
    }

    let recommendation = '';
    if (status === 'Locked') {
      recommendation = `Upcoming topic! Unlocks at Competence Rating ${def.minUnlockRating}+.`;
    } else if (status === 'Mastered') {
      recommendation = `Great mastery! Strong recall across ${def.name.toLowerCase()}.`;
    } else if (status === 'Practicing') {
      recommendation = `Active practice strand. Building recall speed toward target speed.`;
    } else if (status === 'Ready for Placement') {
      recommendation = `Active starting topic! Complete your first climb to establish baseline accuracy.`;
    } else {
      recommendation = `Active strand ready for climbing practice.`;
    }

    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      subtitle: def.subtitle,
      minUnlockRating: def.minUnlockRating,
      accuracy,
      speed,
      status,
      totalAttempted,
      recommendation
    };
  });
};

export const calculateAdaptiveCompetenceProfile = (sprintHistory = [], currentTier = 1, activeRating = 1000, rawRatingHistory = []) => {
  const domains = calculateDomainMastery(sprintHistory, currentTier, activeRating);

  let masteredCount = 0;
  let practicingCount = 0;
  let lockedCount = 0;

  const strandBreakdown = {};

  const defaultFactsMap = {
    add_sub: ['15 + 8', '24 - 9'],
    mult_div: ['7 × 8', '63 ÷ 9'],
    money_time: ['$1.00 - $0.35', '4:45 + 30m'],
    multi_digit: ['48 + 37', '82 - 45'],
    number_theory: ['LCM(6, 8)', 'GCF(18, 24)'],
    adv_math: ['2⁴ = ?', '√144 = ?']
  };

  domains.forEach((d) => {
    if (d.status === 'Mastered') {
      masteredCount++;
    } else if (d.status === 'Practicing' || d.status === 'Challenged') {
      practicingCount++;
    } else {
      lockedCount++;
    }

    const strandRating = d.status === 'Locked'
      ? d.minUnlockRating
      : Math.max(d.minUnlockRating, activeRating);

    strandBreakdown[d.name] = {
      id: d.id,
      strandName: d.name,
      rating: strandRating,
      status: d.status,
      accuracy: d.accuracy,
      speed: d.speed,
      icon: d.icon,
      subtitle: d.subtitle,
      minUnlockRating: d.minUnlockRating,
      challengedFacts: d.status === 'Practicing' ? (defaultFactsMap[d.id] || ['Review facts']) : [],
      needsAttention: d.status === 'Challenged' ? [`Regrouping in ${d.subtitle}`] : []
    };
  });

  const total = domains.length || 1;
  const masteredPct = Math.round((masteredCount / total) * 100);
  const practicingPct = Math.round((practicingCount / total) * 100);
  const lockedPct = Math.max(0, 100 - masteredPct - practicingPct);

  // Use actual active rating
  const adaptiveCompetenceRating = activeRating;

  // Use authentic recorded ratingHistory if available
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const last30DaysGrowthData = (Array.isArray(rawRatingHistory) && rawRatingHistory.length > 0)
    ? rawRatingHistory.map((h) => ({
        label: h.label || h.date || todayLabel,
        rating: h.rating || activeRating
      }))
    : [{ label: todayLabel, rating: activeRating }];

  return {
    adaptiveCompetenceRating,
    last30DaysGrowthData,
    masteryDistribution: {
      mastered: masteredPct,
      practicing: practicingPct,
      challenged: lockedPct
    },
    skillStrandBreakdown: strandBreakdown
  };
};
