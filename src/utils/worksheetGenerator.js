/**
 * Printable Worksheet Generator for Kibo Climb
 * Produces printer-friendly HTML worksheets with answer keys, Kibo Red Panda mascot branding,
 * and strict 2-page print layout (Page 1 = Questions, Page 2 = Answer Key).
 */

import { generateTierProblem as generateMathTierProblem } from './mathCurriculum.js';
import { generateTierProblem as generateWordsTierProblem, WORD_LISTS } from './wordsGenerator.js';
import { generateTierProblem as generateWorldTierProblem } from './worldGenerator.js';
import { generateCodingProblem } from './codingGenerator.js';

export const KIBO_RED_PANDA_FAVICON_SVG = `<svg viewBox="0 0 512 512" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="512" height="512" rx="115" ry="115" fill="#F97316" />
  <path d="M 0 0 L 190 0 C 160 50, 110 110, 0 140 Z" fill="#C2410C" />
  <path d="M 18 18 L 145 18 C 125 55, 90 95, 18 110 Z" fill="#FFF9F2" stroke="#FED7AA" stroke-width="4" />
  <path d="M 512 0 L 322 0 C 352 50, 402 110, 512 140 Z" fill="#C2410C" />
  <path d="M 494 18 L 367 18 C 387 55, 422 95, 494 110 Z" fill="#FFF9F2" stroke="#FED7AA" stroke-width="4" />
  <path d="M 0 240 L 45 270 L 0 305 L 55 350 L 0 400 Z" fill="#C2410C" />
  <path d="M 512 240 L 467 270 L 512 305 L 457 350 L 512 400 Z" fill="#C2410C" />
  <g id="face-markings">
    <ellipse cx="165" cy="270" rx="95" ry="115" fill="#FFFFFF" />
    <ellipse cx="347" cy="270" rx="95" ry="115" fill="#FFFFFF" />
    <ellipse cx="256" cy="365" rx="115" ry="90" fill="#FFFFFF" />
  </g>
  <ellipse cx="105" cy="360" rx="42" ry="24" fill="#FF4D79" />
  <ellipse cx="407" cy="360" rx="42" ry="24" fill="#FF4D79" />
  <path d="M 85 335 L 0 315 M 85 360 L 0 360 M 95 385 L 0 410" stroke="#3D1000" stroke-width="10" stroke-linecap="round" />
  <path d="M 427 335 L 512 315 M 427 360 L 512 360 M 417 385 L 512 410" stroke="#3D1000" stroke-width="10" stroke-linecap="round" />
  <path d="M 140 160 C 130 148, 172 138, 185 152 C 192 165, 155 175, 142 162 Z" fill="#FFFFFF" stroke="#9A3412" stroke-width="3" />
  <path d="M 372 160 C 382 148, 340 138, 327 152 C 320 165, 357 175, 370 162 Z" fill="#FFFFFF" stroke="#9A3412" stroke-width="3" />
  <g id="eyes">
    <ellipse cx="175" cy="265" rx="56" ry="68" fill="#1E0700" />
    <circle cx="158" cy="236" r="22" fill="#FFFFFF" />
    <circle cx="202" cy="256" r="11" fill="#FFFFFF" />
    <circle cx="182" cy="302" r="8" fill="#FFFFFF" />
    <ellipse cx="337" cy="265" rx="56" ry="68" fill="#1E0700" />
    <circle cx="320" cy="236" r="22" fill="#FFFFFF" />
    <circle cx="364" cy="256" r="11" fill="#FFFFFF" />
    <circle cx="344" cy="302" r="8" fill="#FFFFFF" />
  </g>
  <ellipse cx="256" cy="330" rx="26" ry="18" fill="#1E0700" />
  <path d="M 222 355 C 230 380, 248 380, 256 360 C 264 380, 282 380, 290 355" stroke="#1E0700" stroke-width="13" stroke-linecap="round" fill="none" />
</svg>`;

export const WORKSHEET_CATALOG = [
  // MATH
  {
    id: 'math_starter_k2',
    subject: 'math',
    tier: 1,
    curriculumTiers: [1],
    slug: 'addition-subtraction-grades-k-2',
    title: 'Base Camp Sums & Differences',
    gradeLabel: 'Grades K–2',
    desc: 'Addition & subtraction fluency up to 20 with clear layout.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'math_starter_34',
    subject: 'math',
    tier: 2,
    curriculumTiers: [2, 3],
    slug: 'multiplication-sprint-grades-3-4',
    title: 'Alpine Multiplication Sprint (0–12)',
    gradeLabel: 'Grades 3–4',
    desc: 'Multiplication tables up to 12×12 & rapid recall drills.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'math_club_multidigit',
    subject: 'math',
    tier: 4,
    curriculumTiers: [4],
    slug: 'multi-digit-mental-math-grades-4-6',
    title: 'Summit Multi-Digit & Mental Math',
    gradeLabel: 'Grades 4–6',
    desc: '2-digit mental multiplication, 11s shortcut, and tens distribution.',
    isKiboClubOnly: true,
    problemCount: 16
  },
  {
    id: 'math_club_fractions_decimals',
    subject: 'math',
    tier: 5,
    curriculumTiers: [5, 6, 7],
    slug: 'fractions-decimals-mastery-grades-4-6',
    title: 'Summit Fractions & Decimals Mastery',
    gradeLabel: 'Grades 4–6',
    desc: 'Equivalent fractions, mixed numbers, and decimal operations with answer key.',
    isKiboClubOnly: true,
    problemCount: 16
  },
  {
    id: 'math_club_weak_spot',
    subject: 'math',
    tier: 0,
    curriculumTiers: [],
    slug: 'personalized-weak-spot-drill',
    title: 'Personalized Weak-Spot Drill Packet',
    gradeLabel: 'Adaptive to Climber',
    desc: 'Custom worksheet generated from recent mistakes and missed problem types in session history.',
    isKiboClubOnly: true,
    isDynamic: true,
    problemCount: 16
  },

  // WORDS
  {
    id: 'words_starter_phonics',
    subject: 'words',
    tier: 1,
    curriculumTiers: [1, 2],
    slug: 'phonics-sight-words-grades-k-2',
    title: 'Trailhead Phonics & Sight Words',
    gradeLabel: 'Grades K–2',
    desc: 'Missing vowels, rhyming pairs, and high-frequency sight words.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'words_club_spelling_mastery',
    subject: 'words',
    tier: 4,
    curriculumTiers: [4, 5, 6],
    slug: 'vocabulary-spelling-grades-3-6',
    title: 'Summit Vocabulary & Spelling Expedition',
    gradeLabel: 'Grades 3–6',
    desc: 'Context clues, irregular plurals, prefixes, and word definitions.',
    isKiboClubOnly: true,
    problemCount: 16
  },

  // WORLD
  {
    id: 'world_starter_capitals',
    subject: 'world',
    tier: 1,
    curriculumTiers: [1, 2, 3],
    slug: 'continents-capitals-world-explorer',
    title: 'World Explorer: Continents & Capitals',
    gradeLabel: 'All Ages',
    desc: 'Match countries to capitals and identify mountain summits.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'world_club_geography_deep_dive',
    subject: 'world',
    tier: 5,
    curriculumTiers: [5, 6, 7, 8],
    slug: 'cartography-physical-geography-grades-3-8',
    title: 'Peak Cartography & Physical Geography',
    gradeLabel: 'Grades 3–8',
    desc: 'Biomes, latitude/longitude navigation, and mountain topography.',
    isKiboClubOnly: true,
    problemCount: 16
  },

  // CODING
  {
    id: 'coding_starter_logic',
    subject: 'coding',
    tier: 1,
    curriculumTiers: [1, 2],
    slug: 'algorithm-pattern-paths-grades-1-4',
    title: 'Junior Algorithm & Pattern Paths',
    gradeLabel: 'Grades 1–4',
    desc: 'Trace step-by-step directional algorithms and sequence paths.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'coding_club_syntax_loops',
    subject: 'coding',
    tier: 3,
    curriculumTiers: [3, 4, 5],
    slug: 'loops-logic-puzzles-grades-3-8',
    title: 'Summit Loops & Logic Puzzles',
    gradeLabel: 'Grades 3–8',
    desc: 'Loop iterations, conditional branching logic, and bug hunt tracing.',
    isKiboClubOnly: true,
    problemCount: 16
  }
];

// Simple Mulberry32 deterministic PRNG
export function createSeededRandom(seedInput = 0) {
  let s = typeof seedInput === 'string'
    ? Array.from(seedInput).reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0) | 0, 0)
    : (Number(seedInput) || 0);

  return function next() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getWorksheetsForSubject(subject = 'math') {
  return WORKSHEET_CATALOG.filter(w => w.subject === subject);
}

export function getWorksheetById(id) {
  return WORKSHEET_CATALOG.find(w => w.id === id);
}

/** Resolve a worksheet by subject path segment + URL slug (new canonical route format) */
export function getWorksheetBySlug(subject, slug) {
  return WORKSHEET_CATALOG.find(w => w.subject === subject && w.slug === slug);
}

/** Returns the canonical public URL path for a worksheet, e.g. /worksheets/math/multiplication-sprint-grades-3-4 */
export function getCanonicalPath(worksheet) {
  return `/worksheets/${worksheet.subject}/${worksheet.slug}`;
}

/**
 * Returns all worksheets for a subject that match a given curriculum tier.
 */
export function getWorksheetsForTier(subject = 'math', tier = 1) {
  const targetTier = Number(tier) || 1;
  return WORKSHEET_CATALOG.filter(
    w => w.subject === subject && !w.isDynamic && Array.isArray(w.curriculumTiers) && w.curriculumTiers.includes(targetTier)
  );
}

/**
 * Returns the best single worksheet match for a user's current curriculum tier.
 * Prioritizes:
 * 1. Exact tier match in curriculumTiers
 * 2. Closest tier difference
 * 3. Free starter sheet over locked VIP sheet if tied
 */
export function getBestWorksheetForTier(subject = 'math', tier = 1) {
  const targetTier = Number(tier) || 1;
  const nonDynamicSheets = WORKSHEET_CATALOG.filter(w => w.subject === subject && !w.isDynamic);
  if (nonDynamicSheets.length === 0) return WORKSHEET_CATALOG[0];

  // 1. Check exact match
  const exact = nonDynamicSheets.filter(w => Array.isArray(w.curriculumTiers) && w.curriculumTiers.includes(targetTier));
  if (exact.length > 0) {
    // Return free one if exists, otherwise first
    return exact.find(w => !w.isKiboClubOnly) || exact[0];
  }

  // 2. Find closest by minimum tier difference
  let bestSheet = nonDynamicSheets[0];
  let minDiff = Infinity;

  for (const sheet of nonDynamicSheets) {
    const sheetTiers = Array.isArray(sheet.curriculumTiers) && sheet.curriculumTiers.length > 0
      ? sheet.curriculumTiers
      : [sheet.tier || 1];
    
    for (const t of sheetTiers) {
      const diff = Math.abs(t - targetTier);
      if (diff < minDiff) {
        minDiff = diff;
        bestSheet = sheet;
      }
    }
  }

  return bestSheet;
}

/**
 * Unified problem generation: Pulls directly from the shared curriculum/generators
 * ensuring 100% parity across Regular Climb, Training Camp, and Worksheets.
 */
export function generateProblemsForWorksheet(worksheetId, recentMistakes = [], seed = 0) {
  const worksheet = getWorksheetById(worksheetId);
  const problems = [];
  const rng = createSeededRandom(seed);

  // Dynamic weak-spot worksheet
  if (worksheetId === 'math_club_weak_spot' || worksheet?.isDynamic) {
    if (recentMistakes && recentMistakes.length > 0) {
      recentMistakes.slice(0, 16).forEach((m, idx) => {
        problems.push({
          q: `${m.question || m.text || `Problem #${idx + 1}`}`,
          ans: String(m.correctAnswer || m.answer || 'Refer to lesson')
        });
      });
    }
    while (problems.length < 16) {
      const prob = generateMathTierProblem(3, true);
      const qText = prob.displayString || prob.question || `${prob.num1} ${prob.operatorSymbol} ${prob.num2} = ___`;
      const formattedQ = qText.includes('=') ? qText : `${qText} = ___`;
      problems.push({
        q: formattedQ,
        ans: String(prob.answer !== undefined ? prob.answer : prob.answerString || '')
      });
    }
    return problems.slice(0, 16);
  }

  const subject = worksheet?.subject || 'math';
  const targetTiers = (worksheet && Array.isArray(worksheet.curriculumTiers) && worksheet.curriculumTiers.length > 0)
    ? worksheet.curriculumTiers
    : [worksheet?.tier || 1];

  // Helper to generate a standardized problem candidate from live generators
  const generateCandidate = () => {
    // Pick tier from assigned curriculumTiers (seeded if active)
    const tierIdx = Math.floor(rng() * targetTiers.length);
    const chosenTier = targetTiers[tierIdx] || targetTiers[0];

    if (subject === 'math') {
      const prob = generateMathTierProblem(chosenTier, true);
      const rawQ = prob.displayString || prob.question || `${prob.num1} ${prob.operatorSymbol} ${prob.num2}`;
      const q = rawQ.includes('=') ? rawQ : `${rawQ} = ___`;
      const ans = String(prob.answer !== undefined ? prob.answer : (prob.answerString || ''));
      return { q, ans };
    }

    if (subject === 'words') {
      const wordList = WORD_LISTS[chosenTier] || WORD_LISTS[1] || [];
      const item = wordList.length > 0 ? wordList[Math.floor(rng() * wordList.length)] : null;
      const prob = generateWordsTierProblem(chosenTier, false, new Set(), item);
      const q = prob.prompt || prob.question || `Spell the word for: ${prob.hint || item?.hint || 'this term'}`;
      const ans = String(prob.correctAnswer || prob.answer || item?.word || '');
      return { q, ans };
    }

    if (subject === 'world') {
      const prob = generateWorldTierProblem(chosenTier, false, new Set());
      const q = prob.prompt || prob.question || 'Identify the correct geographical answer:';
      const ans = String(prob.correctAnswer || prob.answer || prob.answerString || '');
      return { q, ans };
    }

    if (subject === 'coding') {
      const prob = generateCodingProblem(chosenTier, false, new Set());
      const q = prob.prompt || prob.question || prob.displayString || 'Solve this coding logic puzzle:';
      const ans = String(prob.correctAnswer || prob.answer || prob.answerString || '');
      return { q, ans };
    }

    return { q: 'Solve the problem:', ans: 'Correct answer' };
  };

  // Generate 48 problem candidates from the live curriculum generator, deduplicate, and seeded-shuffle
  const pool = [];
  const seenQ = new Set();
  let attempts = 0;
  const maxAttempts = 150;

  while (pool.length < 48 && attempts < maxAttempts) {
    attempts++;
    const cand = generateCandidate();
    if (cand.q && cand.ans && !seenQ.has(cand.q)) {
      seenQ.add(cand.q);
      pool.push(cand);
    }
  }

  // Fallback if generator did not generate enough unique questions
  while (pool.length < 16) {
    pool.push(generateCandidate());
  }

  // Shuffle pool with seeded RNG
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 16);
}

export function generateWorksheetHtml(worksheet, childName = 'Kibo Climber', recentMistakes = [], seed = 0) {
  const problems = generateProblemsForWorksheet(worksheet.id, recentMistakes, seed);
  const isDefaultSeed = !seed || seed === 0 || seed === 'default' || seed === '0';
  const canonicalUrl = `https://www.kiboclimb.com${getCanonicalPath(worksheet)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kibo Climb • ${worksheet.title}${!isDefaultSeed ? ` (Set #${seed})` : ''}</title>
  <link rel="canonical" href="${canonicalUrl}" />
  <style>
    @page {
      margin: 1.2cm;
      size: letter portrait;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 20px;
      line-height: 1.3;
      background: #ffffff;
    }

    /* PAGE 1: WORKSHEET QUESTIONS */
    .page {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-1 {
      page-break-after: always;
      break-after: page;
      min-height: 920px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #0d9488;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mascot-avatar {
      width: 36px;
      height: 36px;
      display: inline-block;
      vertical-align: middle;
    }
    .badge {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 9999px;
      background: #ccfbf1;
      color: #0f766e;
      border: 1px solid #5eead4;
    }
    .club-badge {
      background: #fef3c7;
      color: #78350f;
      border: 1px solid #fde68a;
    }

    /* META ROW */
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 16px;
      padding: 6px 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
    }

    /* INSTRUCTIONS */
    .instructions {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 16px;
    }

    /* GRID LAYOUT (Strict 4x4 Grid for 16 Questions) */
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 24px;
      flex-grow: 1;
    }

    .problem-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      min-height: 52px;
    }

    .problem-num {
      font-size: 12px;
      font-weight: 800;
      color: #94a3b8;
      margin-right: 8px;
      width: 24px;
    }

    .problem-text {
      font-size: 16px;
      font-weight: 800;
      color: #1e293b;
      flex-grow: 1;
      letter-spacing: -0.02em;
    }

    .answer-box {
      width: 70px;
      height: 32px;
      border-bottom: 2px solid #94a3b8;
      background: #f8fafc;
      border-radius: 4px;
    }

    /* FOOTER */
    .footer {
      border-top: 2px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
    }

    /* PAGE 2: ANSWER KEY */
    .page-2 {
      min-height: 920px;
    }

    .key-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 24px;
      margin-top: 12px;
      flex-grow: 1;
    }

    .key-card {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
      font-weight: 700;
    }

    .key-num {
      color: #64748b;
    }

    .key-ans {
      color: #0d9488;
      font-weight: 900;
    }

    /* NO PRINT UTILITIES */
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <!-- PAGE 1: QUESTIONS -->
  <div class="page page-1">
    <div>
      <div class="header">
        <div class="brand-title">
          <span class="mascot-avatar">${KIBO_RED_PANDA_FAVICON_SVG}</span>
          <span>Kibo Climb • ${worksheet.title}</span>
        </div>
        <span class="badge ${worksheet.isKiboClubOnly ? 'club-badge' : ''}">
          ${worksheet.isKiboClubOnly ? '👑 Kibo Club VIP' : '🌟 Free Printable'} • ${worksheet.gradeLabel}
        </span>
      </div>

      <div class="meta-row">
        <span>Climber: <strong>${childName}</strong></span>
        <span>Date: ____________</span>
        <span>Score: _____ / 16</span>
        <span>Time: _____ min</span>
      </div>

      <div class="instructions">
        🧭 <strong>Directions:</strong> Complete each question carefully. Write your final answer in the blank or box provided.
      </div>

      <div class="grid">
        ${problems.map((p, idx) => `
          <div class="problem-card">
            <span class="problem-num">${idx + 1}.</span>
            <span class="problem-text">${p.q}</span>
            <div class="answer-box"></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Kibo Climb • Offline Skill Practice & Fluency • https://kiboclimb.com</div>
      <div>Page 1 of 2 • Student Worksheet</div>
    </div>
  </div>

  <!-- PAGE 2: ANSWER KEY -->
  <div class="page page-2">
    <div>
      <div class="header">
        <div class="brand-title">
          <span class="mascot-avatar">${KIBO_RED_PANDA_FAVICON_SVG}</span>
          <span>Parent Answer Key • ${worksheet.title}</span>
        </div>
        <span class="badge">Verified Solutions</span>
      </div>

      <div class="instructions">
        💡 <strong>Answer Key & Fast Grading Guide:</strong> Use this quick key to review solutions with your climber.
      </div>

      <div class="key-grid">
        ${problems.map((p, idx) => `
          <div class="key-card">
            <span class="key-num">${idx + 1}. ${p.q}</span>
            <span class="key-ans">${p.ans}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Kibo Climb • Offline Skill Practice & Fluency • https://kiboclimb.com</div>
      <div>Page 2 of 2 • Parent Answer Key</div>
    </div>
  </div>

  <div class="no-print" style="position: fixed; bottom: 16px; right: 16px; z-index: 100;">
    <button onclick="window.print()" style="background: #0d9488; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      🖨️ Print Worksheet & Key
    </button>
  </div>
</body>
</html>`;
}

export function openPrintableWorksheet(worksheet, childName = 'Kibo Climber', recentMistakes = [], seed = 0) {
  // Navigate directly to dedicated worksheet URL for SEO & history
  if (typeof window !== 'undefined') {
    const seedParam = seed ? `?seed=${seed}` : '';
    const targetUrl = `${getCanonicalPath(worksheet)}${seedParam}`;
    if (window.history && window.history.pushState) {
      window.history.pushState({ worksheetId: worksheet.id, seed }, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return true;
    }
  }
  return false;
}
