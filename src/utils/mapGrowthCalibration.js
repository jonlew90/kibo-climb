/**
 * NWEA MAP Growth Math RIT Alignment & Calibration Utilities
 * 
 * Based on published national normative benchmark data (NWEA Student Achievement Norms):
 * - Kindergarten: Fall ~140, Spring ~157
 * - Grade 1: Fall ~160, Spring ~176
 * - Grade 2: Fall ~175, Spring ~189
 * - Grade 3: Fall ~188, Spring ~201
 * - Grade 4: Fall ~200, Spring ~211
 * - Grade 5: Fall ~209, Spring ~219
 * - Grade 6: Fall ~215, Spring ~223
 * - Grade 7: Fall ~220, Spring ~227
 * - Grade 8+: Fall ~225, Spring ~230+
 *
 * Maps continuous Kibo Climb competence ratings (900 - 2500+) smoothly
 * to estimated RIT score ranges, providing bidirectional conversion for
 * onboarding calibration and parent academic diagnostics.
 */

// Calibration anchors connecting Kibo Competence Rating to median MAP Math RIT
export const RIT_RATING_ANCHORS = [
  { rating: 900,  rit: 145, grade: 'Kindergarten', label: 'Early Math Foundations' },
  { rating: 1000, rit: 165, grade: 'Grade 1–2',      label: 'Sums & Differences to 20' },
  { rating: 1200, rit: 185, grade: 'Grade 2–3',      label: 'Multiplication Foundations' },
  { rating: 1400, rit: 198, grade: 'Grade 3–4',      label: 'Multiplication & Elapsed Time' },
  { rating: 1600, rit: 206, grade: 'Grade 4–5',      label: 'Multi-Digit Mental Math' },
  { rating: 1800, rit: 214, grade: 'Grade 5–6',      label: 'Fractions, Decimals & Division' },
  { rating: 2000, rit: 220, grade: 'Grade 6–7',      label: 'Long Division & Decimals' },
  { rating: 2200, rit: 226, grade: 'Grade 7–8',      label: 'Fraction Equations, LCM & PEMDAS' },
  { rating: 2400, rit: 234, grade: 'Grade 8+',       label: 'Algebra, Exponents & Roots' },
  { rating: 2600, rit: 245, grade: 'High School+',   label: 'Advanced Peak Algebra' }
];

/**
 * Converts a Kibo Competence Rating to an estimated MAP RIT score.
 * Uses piecewise linear interpolation across anchors.
 */
export function ratingToEstimatedRIT(rating = 1000) {
  const numRating = Math.max(700, Math.min(3000, Number(rating) || 1000));
  
  if (numRating <= RIT_RATING_ANCHORS[0].rating) {
    return Math.max(130, Math.round(RIT_RATING_ANCHORS[0].rit - ((RIT_RATING_ANCHORS[0].rating - numRating) * 0.1)));
  }

  const lastAnchor = RIT_RATING_ANCHORS[RIT_RATING_ANCHORS.length - 1];
  if (numRating >= lastAnchor.rating) {
    return Math.min(270, Math.round(lastAnchor.rit + ((numRating - lastAnchor.rating) * 0.05)));
  }

  for (let i = 0; i < RIT_RATING_ANCHORS.length - 1; i++) {
    const a1 = RIT_RATING_ANCHORS[i];
    const a2 = RIT_RATING_ANCHORS[i + 1];
    if (numRating >= a1.rating && numRating <= a2.rating) {
      const pct = (numRating - a1.rating) / (a2.rating - a1.rating);
      return Math.round(a1.rit + pct * (a2.rit - a1.rit));
    }
  }

  return 170;
}

/**
 * Returns an estimated RIT range band (e.g. "195–205") and corresponding grade narrative.
 */
export function getRITBandDetails(rating = 1000) {
  const estimatedRIT = ratingToEstimatedRIT(rating);
  const bandMin = Math.max(130, estimatedRIT - 5);
  const bandMax = estimatedRIT + 5;

  let gradeBand = 'Kindergarten';
  let descriptor = 'Number foundations & single-digit operations';

  if (estimatedRIT >= 232) {
    gradeBand = 'Grade 8+ / Advanced Algebra';
    descriptor = 'Pre-algebra, linear equations, exponents & roots';
  } else if (estimatedRIT >= 224) {
    gradeBand = 'Grade 7–8';
    descriptor = 'Order of operations (PEMDAS), fractions, ratios & LCM';
  } else if (estimatedRIT >= 216) {
    gradeBand = 'Grade 5–6';
    descriptor = 'Multi-digit division, decimals, and fraction foundations';
  } else if (estimatedRIT >= 203) {
    gradeBand = 'Grade 4–5';
    descriptor = 'Multi-digit operations, fractions & elapsed time';
  } else if (estimatedRIT >= 188) {
    gradeBand = 'Grade 3–4';
    descriptor = 'Multiplication fluency (0s–9s) & mental math';
  } else if (estimatedRIT >= 165) {
    gradeBand = 'Grade 1–2';
    descriptor = 'Sums & differences to 20 and number sense';
  }

  return {
    estimatedRIT,
    bandString: `${bandMin}–${bandMax}`,
    gradeBand,
    descriptor
  };
}

/**
 * Converts an entered MAP Math RIT score (e.g., 140 - 250) into an initial Kibo Competence Rating
 * and recommended starting grade label.
 */
export function ritToStartingRating(ritScore) {
  const numRIT = Math.max(130, Math.min(260, Number(ritScore) || 170));

  let matchedRating = 1000;
  let recommendedGrade = 'Grade 1–2';

  if (numRIT < 155) {
    matchedRating = 900;
    recommendedGrade = 'Kindergarten';
  } else if (numRIT < 182) {
    matchedRating = 1000;
    recommendedGrade = 'Grade 1–2';
  } else if (numRIT < 205) {
    matchedRating = 1200;
    recommendedGrade = 'Grade 3–4';
  } else if (numRIT < 218) {
    matchedRating = 1800;
    recommendedGrade = 'Grade 5–6';
  } else if (numRIT < 230) {
    matchedRating = 2200;
    recommendedGrade = 'Grade 7–8';
  } else {
    matchedRating = 2400;
    recommendedGrade = 'High School & Beyond';
  }

  return {
    rating: matchedRating,
    gradeLevel: recommendedGrade,
    rit: numRIT
  };
}

/**
 * Four Core NWEA MAP Growth Math Instructional Domains.
 * Maps Kibo Climb curriculum tiers into the 4 official reporting clusters.
 */
export const MAP_MATH_DOMAINS = [
  {
    id: 'operations_algebra',
    name: 'Operations & Algebraic Thinking',
    icon: '⚡',
    shortName: 'Operations & Algebra',
    description: 'Addition, subtraction, multiplication tables, fact families & pre-algebra',
    curriculumTiers: [1, 2, 3, 8],
    minUnlockRating: 900
  },
  {
    id: 'numbers_fractions',
    name: 'Numbers & Operations / Fractions',
    icon: '🍰',
    shortName: 'Fractions & Multi-Digit',
    description: 'Multi-digit mental math, fraction concepts, %, LCM & GCF',
    curriculumTiers: [4, 7],
    minUnlockRating: 1600
  },
  {
    id: 'measurement_data',
    name: 'Measurement, Time & Data',
    icon: '⏱️',
    shortName: 'Measurement & Time',
    description: 'Analog clock reading, elapsed time math & coin counting',
    curriculumTiers: [2, 3, 5],
    minUnlockRating: 1200
  },
  {
    id: 'real_world_decimals',
    name: 'Decimals, Money & Systems',
    icon: '💵',
    shortName: 'Decimals & Money',
    description: 'Money math, decimals, long division & place value systems',
    curriculumTiers: [5, 6],
    minUnlockRating: 1800
  }
];

/**
 * Calculates domain scores across the 4 MAP Growth categories from sprint history and rating.
 */
export function calculateMapDomainBreakdown(sprintHistory = [], activeRating = 1000) {
  const recentSprints = (sprintHistory || []).slice(-30);

  return MAP_MATH_DOMAINS.map(domain => {
    let attempted = 0;
    let correct = 0;

    recentSprints.forEach(sprint => {
      if (Array.isArray(sprint.answers) && sprint.answers.length > 0) {
        sprint.answers.forEach(ans => {
          const qTier = Number(ans.tier || ans.problemTier || sprint.tier || 1);
          if (domain.curriculumTiers.includes(qTier)) {
            attempted += 1;
            if (ans.isCorrect) correct += 1;
          }
        });
      } else if (sprint.tier && domain.curriculumTiers.includes(Number(sprint.tier))) {
        attempted += Number(sprint.totalQuestions || 12);
        correct += Number(sprint.correctCount || sprint.score || 0);
      }
    });

    let accuracyPct = attempted > 0 ? Math.round((correct / attempted) * 100) : null;
    let status = 'Not Started';

    if (activeRating < domain.minUnlockRating) {
      status = 'Locked';
    } else if (attempted === 0) {
      status = 'Ready to Practice';
      accuracyPct = 80; // Baseline assumption if unlocked
    } else if (accuracyPct >= 80) {
      status = 'On Track (Proficient)';
    } else if (accuracyPct >= 65) {
      status = 'Developing';
    } else {
      status = 'Reinforcement Recommended';
    }

    return {
      ...domain,
      attempted,
      correct,
      accuracyPct,
      status
    };
  });
}
