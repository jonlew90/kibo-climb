/**
 * Printable Worksheet Generator for Kibo Climb
 * Produces printer-friendly HTML worksheets with answer keys, Kibo Red Panda mascot branding,
 * and strict 2-page print layout (Page 1 = Questions, Page 2 = Answer Key).
 */

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
    title: 'Base Camp Sums & Differences',
    gradeLabel: 'Grades K–2',
    description: 'Addition & subtraction fluency up to 20 with clear layout.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'math_starter_34',
    subject: 'math',
    title: 'Alpine Multiplication Sprint',
    gradeLabel: 'Grades 3–4',
    description: 'Multiplication tables (0–9) & rapid recall drills.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'math_club_fractions_decimals',
    subject: 'math',
    title: 'Summit Fractions & Decimals Mastery',
    gradeLabel: 'Grades 4–6',
    description: 'Equivalent fractions, mixed numbers, and decimal operations with answer key.',
    isKiboClubOnly: true,
    problemCount: 16
  },
  {
    id: 'math_club_weak_spot',
    subject: 'math',
    title: 'Personalized Weak-Spot Drill Packet',
    gradeLabel: 'Adaptive to Climber',
    description: 'Custom worksheet generated from recent mistakes and missed problem types in session history.',
    isKiboClubOnly: true,
    isDynamic: true,
    problemCount: 16
  },

  // WORDS
  {
    id: 'words_starter_phonics',
    subject: 'words',
    title: 'Trailhead Phonics & Sight Words',
    gradeLabel: 'Grades K–2',
    description: 'Missing vowels, rhyming pairs, and high-frequency sight words.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'words_club_spelling_mastery',
    subject: 'words',
    title: 'Summit Vocabulary & Spelling Expedition',
    gradeLabel: 'Grades 3–6',
    description: 'Context clues, irregular plurals, prefixes, and word definitions.',
    isKiboClubOnly: true,
    problemCount: 16
  },

  // WORLD
  {
    id: 'world_starter_capitals',
    subject: 'world',
    title: 'World Explorer: Continents & Capitals',
    gradeLabel: 'All Ages',
    description: 'Match countries to capitals and identify mountain summits.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'world_club_geography_deep_dive',
    subject: 'world',
    title: 'Peak Cartography & Physical Geography',
    gradeLabel: 'Grades 3–8',
    description: 'Biomes, latitude/longitude navigation, and mountain topography.',
    isKiboClubOnly: true,
    problemCount: 16
  },

  // CODING
  {
    id: 'coding_starter_logic',
    subject: 'coding',
    title: 'Junior Algorithm & Pattern Paths',
    gradeLabel: 'Grades 1–4',
    description: 'Trace step-by-step directional algorithms and sequence paths.',
    isKiboClubOnly: false,
    problemCount: 16
  },
  {
    id: 'coding_club_syntax_loops',
    subject: 'coding',
    title: 'Summit Loops & Logic Puzzles',
    gradeLabel: 'Grades 3–8',
    description: 'Loop iterations, conditional branching logic, and bug hunt tracing.',
    isKiboClubOnly: true,
    problemCount: 16
  }
];

export function getWorksheetsForSubject(subject = 'math') {
  return WORKSHEET_CATALOG.filter(w => w.subject === subject);
}

export function getWorksheetById(id) {
  return WORKSHEET_CATALOG.find(w => w.id === id);
}

export function generateProblemsForWorksheet(worksheetId, recentMistakes = []) {
  const problems = [];

  if (worksheetId === 'math_starter_k2') {
    const list = [
      { q: '7 + 5 = ___', ans: '12' },
      { q: '14 - 6 = ___', ans: '8' },
      { q: '9 + 8 = ___', ans: '17' },
      { q: '15 - 9 = ___', ans: '6' },
      { q: '6 + 7 = ___', ans: '13' },
      { q: '18 - 9 = ___', ans: '9' },
      { q: '8 + 8 = ___', ans: '16' },
      { q: '13 - 7 = ___', ans: '6' },
      { q: '5 + 9 = ___', ans: '14' },
      { q: '12 - 5 = ___', ans: '7' },
      { q: '11 + 6 = ___', ans: '17' },
      { q: '16 - 8 = ___', ans: '8' },
      { q: '4 + 8 = ___', ans: '12' },
      { q: '17 - 8 = ___', ans: '9' },
      { q: '9 + 9 = ___', ans: '18' },
      { q: '20 - 7 = ___', ans: '13' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'math_starter_34') {
    const list = [
      { q: '6 × 7 = ___', ans: '42' },
      { q: '8 × 4 = ___', ans: '32' },
      { q: '9 × 6 = ___', ans: '54' },
      { q: '7 × 8 = ___', ans: '56' },
      { q: '4 × 9 = ___', ans: '36' },
      { q: '8 × 8 = ___', ans: '64' },
      { q: '7 × 7 = ___', ans: '49' },
      { q: '6 × 8 = ___', ans: '48' },
      { q: '9 × 9 = ___', ans: '81' },
      { q: '5 × 12 = ___', ans: '60' },
      { q: '7 × 9 = ___', ans: '63' },
      { q: '8 × 3 = ___', ans: '24' },
      { q: '6 × 6 = ___', ans: '36' },
      { q: '9 × 8 = ___', ans: '72' },
      { q: '4 × 7 = ___', ans: '28' },
      { q: '11 × 6 = ___', ans: '66' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'math_club_fractions_decimals') {
    const list = [
      { q: '1/2 + 1/4 = ___', ans: '3/4' },
      { q: '2/5 + 1/5 = ___', ans: '3/5' },
      { q: '3/4 - 1/4 = ___', ans: '2/4 (or 1/2)' },
      { q: '0.5 + 0.25 = ___', ans: '0.75' },
      { q: '1.2 + 0.8 = ___', ans: '2.0' },
      { q: '4.5 - 1.2 = ___', ans: '3.3' },
      { q: '2/3 of 12 = ___', ans: '8' },
      { q: '3/5 of 20 = ___', ans: '12' },
      { q: '0.1 × 10 = ___', ans: '1' },
      { q: '2.5 × 2 = ___', ans: '5.0' },
      { q: '1/3 + 1/6 = ___', ans: '1/2' },
      { q: '5/8 - 3/8 = ___', ans: '2/8 (or 1/4)' },
      { q: '0.75 - 0.25 = ___', ans: '0.50' },
      { q: '3/4 + 1/2 = ___', ans: '5/4 (or 1 1/4)' },
      { q: '0.4 × 5 = ___', ans: '2.0' },
      { q: '7/10 + 2/10 = ___', ans: '9/10 (or 0.9)' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'math_club_weak_spot') {
    if (recentMistakes && recentMistakes.length > 0) {
      recentMistakes.slice(0, 16).forEach((m, idx) => {
        problems.push({
          q: `${m.question || m.text || `Problem #${idx + 1}`}`,
          ans: String(m.correctAnswer || m.answer || 'Refer to lesson')
        });
      });
    }
    while (problems.length < 16) {
      const a = Math.floor(Math.random() * 12) + 6;
      const b = Math.floor(Math.random() * 9) + 3;
      problems.push({ q: `${a} × ${b} = ___`, ans: String(a * b) });
    }
  } else if (worksheetId === 'words_starter_phonics') {
    const list = [
      { q: 'c _ t (Animal with whiskers: a, e, i, o, u)', ans: 'cat' },
      { q: 'm _ p (Tool to clean floors: a, e, i, o, u)', ans: 'mop' },
      { q: 's _ n (Bright star in the sky: a, e, i, o, u)', ans: 'sun' },
      { q: 'Rhyme with "bed": r _ d', ans: 'red' },
      { q: 'Rhyme with "light": n _ _ _ t', ans: 'night' },
      { q: 'Sight Word: T - H - E - Y = ___', ans: 'THEY' },
      { q: 'Sight Word: W - H - E - R - E = ___', ans: 'WHERE' },
      { q: 'f _ sh (Swims underwater: a, e, i, o, u)', ans: 'fish' },
      { q: 'b _ _ k (Has pages to read: a, e, i, o, u)', ans: 'book' },
      { q: 't r _ _ (Has leaves and branches)', ans: 'tree' },
      { q: 'Rhyme with "cake": b _ k _', ans: 'bake' },
      { q: 'Rhyme with "jump": b _ m _', ans: 'bump' },
      { q: 'Sight Word: C - O - U - L - D = ___', ans: 'COULD' },
      { q: 'p _ n (Used for writing in ink: a, e, i, o, u)', ans: 'pen' },
      { q: 'Rhyme with "ring": s _ n _', ans: 'sing' },
      { q: 'Sight Word: B - E - C - A - U - S - E = ___', ans: 'BECAUSE' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'words_club_spelling_mastery') {
    const list = [
      { q: 'What is the plural of "CHILD"?', ans: 'children' },
      { q: 'What is the plural of "MOUSE"?', ans: 'mice' },
      { q: 'Prefix meaning "NOT" in "unhappy":', ans: 'un-' },
      { q: 'Prefix meaning "AGAIN" in "replay":', ans: 're-' },
      { q: 'Correct spelling: NECESSARY or NECASARY?', ans: 'NECESSARY' },
      { q: 'Correct spelling: SEPARATE or SEPERATE?', ans: 'SEPARATE' },
      { q: 'Antonym (opposite) of "ABUNDANT":', ans: 'Scarce' },
      { q: 'Synonym of "COURAGEOUS":', ans: 'Brave' },
      { q: 'What does suffix "-LESS" mean in "hopeless"?', ans: 'Without' },
      { q: 'What does suffix "-FUL" mean in "joyful"?', ans: 'Full of' },
      { q: 'Correct homophone: "I can ___ the ocean." (see / sea)', ans: 'see' },
      { q: 'Correct homophone: "The bird flew over ___." (their / there)', ans: 'there' },
      { q: 'What does "DILIGENT" mean?', ans: 'Hardworking and thorough' },
      { q: 'What does "RELUCTANT" mean?', ans: 'Hesitant or unwilling' },
      { q: 'Plural form of "TOOTH":', ans: 'teeth' },
      { q: 'What is the root word of "UNBREAKABLE"?', ans: 'break' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'world_starter_capitals') {
    const list = [
      { q: 'What is the capital of France?', ans: 'Paris' },
      { q: 'What is the capital of Japan?', ans: 'Tokyo' },
      { q: 'What is the capital of Canada?', ans: 'Ottawa' },
      { q: 'What is the capital of the United Kingdom?', ans: 'London' },
      { q: 'What is the capital of Italy?', ans: 'Rome' },
      { q: 'What is the capital of Egypt?', ans: 'Cairo' },
      { q: 'What is the capital of Australia?', ans: 'Canberra' },
      { q: 'What is the capital of Brazil?', ans: 'Brasília' },
      { q: 'Which continent is Mount Kilimanjaro on?', ans: 'Africa' },
      { q: 'What is the largest ocean on Earth?', ans: 'Pacific Ocean' },
      { q: 'What is the capital of Germany?', ans: 'Berlin' },
      { q: 'What is the capital of Spain?', ans: 'Madrid' },
      { q: 'Which continent is the Amazon Rainforest in?', ans: 'South America' },
      { q: 'What is the capital of Mexico?', ans: 'Mexico City' },
      { q: 'What is the capital of India?', ans: 'New Delhi' },
      { q: 'Which continent has the South Pole?', ans: 'Antarctica' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'world_club_geography_deep_dive') {
    const list = [
      { q: 'What is the imaginary line at 0° latitude?', ans: 'The Equator' },
      { q: 'What is the imaginary line at 0° longitude?', ans: 'Prime Meridian' },
      { q: 'What mountain range separates Europe and Asia?', ans: 'Ural Mountains' },
      { q: 'What is the longest river in the world?', ans: 'Nile River' },
      { q: 'What biome is characterized by frozen permafrost?', ans: 'Tundra' },
      { q: 'Which country has the most natural lakes?', ans: 'Canada' },
      { q: 'What is the tallest summit above sea level on Earth?', ans: 'Mount Everest (8,849m)' },
      { q: 'What is the highest mountain peak in Africa?', ans: 'Mount Kilimanjaro (5,895m)' },
      { q: 'Which strait separates Europe and Africa?', ans: 'Strait of Gibraltar' },
      { q: 'What is the largest desert on Earth by land area?', ans: 'Antarctic Desert' },
      { q: 'What country spans 11 time zones?', ans: 'Russia' },
      { q: 'Which ocean lies between Africa and Australia?', ans: 'Indian Ocean' },
      { q: 'What tectonic feature encircles the Pacific Ocean basin?', ans: 'Ring of Fire' },
      { q: 'Which river flows through the Grand Canyon?', ans: 'Colorado River' },
      { q: 'What is the capital of South Korea?', ans: 'Seoul' },
      { q: 'What is the driest non-polar desert on Earth?', ans: 'Atacama Desert' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'coding_starter_logic') {
    const list = [
      { q: 'Algorithm step 1: Turn Right. Step 2: Move 2 steps. Which direction did Kibo face?', ans: 'Right' },
      { q: 'If repeat(4) { move() }, how many times is move() called?', ans: '4' },
      { q: 'What symbol represents the "AND" logic operator in JavaScript?', ans: '&&' },
      { q: 'What symbol represents the "OR" logic operator in JavaScript?', ans: '||' },
      { q: 'What data type is the value: true ?', ans: 'Boolean' },
      { q: 'What data type is the value: "Kibo the Red Panda" ?', ans: 'String' },
      { q: 'What data type is the number: 42 ?', ans: 'Number' },
      { q: 'If x = 5 and x = x + 3, what is x?', ans: '8' },
      { q: 'What is an unexpected flaw or glitch in code called?', ans: 'Bug' },
      { q: 'What is the process of fixing code errors called?', ans: 'Debugging' },
      { q: 'If (score >= 10) { win() } else { tryAgain() }. If score is 8, which runs?', ans: 'tryAgain()' },
      { q: 'What is an ordered list of items called in code?', ans: 'Array (or List)' },
      { q: 'Which index is the FIRST element in most coding arrays?', ans: 'Index 0' },
      { q: 'What command prints output to the developer console?', ans: 'console.log()' },
      { q: 'What loop runs as long as a condition remains true?', ans: 'while loop' },
      { q: 'In code, what does "=" do in x = 10?', ans: 'Assignment (stores 10 in x)' }
    ];
    problems.push(...list);
  } else if (worksheetId === 'coding_club_syntax_loops') {
    const list = [
      { q: 'For loop: for (let i = 0; i < 5; i++). How many iterations occur?', ans: '5 (i = 0, 1, 2, 3, 4)' },
      { q: 'What does "break" do inside a loop?', ans: 'Immediately terminates the loop' },
      { q: 'What does "continue" do inside a loop?', ans: 'Skips to the next iteration' },
      { q: 'What is the value of: 10 % 3 (modulus remainder)?', ans: '1' },
      { q: 'What is the value of: 14 % 7 ?', ans: '0' },
      { q: 'If a function calls itself, what is it called?', ans: 'Recursion (Recursive Function)' },
      { q: 'What is the difference between "==" and "===" in JS?', ans: '=== checks both value AND type' },
      { q: 'What will Boolean("") evaluate to?', ans: 'false (empty string is falsy)' },
      { q: 'What will Boolean("Kibo") evaluate to?', ans: 'true (non-empty string is truthy)' },
      { q: 'What data structure follows FIFO (First-In, First-Out)?', ans: 'Queue' },
      { q: 'What data structure follows LIFO (Last-In, Last-Out)?', ans: 'Stack' },
      { q: 'What method adds an element to the end of an array?', ans: '.push()' },
      { q: 'What method removes the last element of an array?', ans: '.pop()' },
      { q: 'What does JSON stand for?', ans: 'JavaScript Object Notation' },
      { q: 'What is the output of: Math.floor(4.9) ?', ans: '4' },
      { q: 'What is the time complexity of searching a sorted array with binary search?', ans: 'O(log n)' }
    ];
    problems.push(...list);
  } else {
    for (let i = 1; i <= 16; i++) {
      problems.push({ q: `Practice Question #${i}: Solve for the missing answer`, ans: `Answer #${i}` });
    }
  }

  return problems.slice(0, 16);
}

export function generateWorksheetHtml(worksheet, childName = 'Kibo Climber', recentMistakes = []) {
  const problems = generateProblemsForWorksheet(worksheet.id, recentMistakes);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kibo Climb • ${worksheet.title}</title>
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
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .meta-box {
      display: flex;
      gap: 16px;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 14px;
      padding: 8px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .meta-box span {
      border-bottom: 1px solid #94a3b8;
      min-width: 110px;
      display: inline-block;
    }

    /* 16 QUESTIONS: 8 ROWS x 2 COLUMNS (FITS NEATLY ON PAGE 1) */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(8, auto);
      gap: 10px 18px;
      flex-grow: 1;
      margin-bottom: 14px;
    }
    .problem-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      font-size: 14px;
      font-weight: 700;
      min-height: 48px;
    }
    .num {
      color: #0d9488;
      font-size: 12px;
      margin-right: 6px;
      font-weight: 900;
    }
    .answer-line {
      display: inline-block;
      min-width: 50px;
      border-bottom: 2px solid #334155;
      height: 18px;
    }

    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #64748b;
      font-weight: 700;
    }

    /* PAGE 2: PARENT ANSWER KEY */
    .page-2 {
      page-break-before: always;
      break-before: page;
      padding-top: 14px;
      min-height: 920px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .key-header {
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .key-title {
      color: #5b21b6;
      font-size: 20px;
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .key-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 18px;
      margin-bottom: 24px;
      flex-grow: 1;
    }
    .key-item {
      padding: 10px 14px;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .key-ans {
      color: #047857;
      font-weight: 900;
      background: #d1fae5;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid #6ee7b7;
    }
    .parent-tip {
      background: #f8fafc;
      border: 1.5px dashed #94a3b8;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 12px;
      color: #475569;
      font-weight: 600;
      margin-bottom: 14px;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      .page-1 { page-break-after: always; break-after: page; min-height: 100vh; }
      .page-2 { page-break-before: always; break-before: page; min-height: 100vh; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page page-1">
    <div>
      <div class="header">
        <div>
          <div class="brand-title">
            <span class="mascot-avatar">${KIBO_RED_PANDA_FAVICON_SVG}</span>
            <span>Kibo Climb • ${worksheet.title}</span>
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">${worksheet.description}</div>
        </div>
        <div>
          <span class="badge ${worksheet.isKiboClubOnly ? 'club-badge' : ''}">
            ${worksheet.isKiboClubOnly ? '👑 Kibo Club VIP' : 'Free Starter'} • ${worksheet.gradeLabel}
          </span>
        </div>
      </div>

      <div class="meta-box">
        <div>Climber: <span>${childName !== 'Kibo Climber' ? childName : ''}</span></div>
        <div>Date: <span></span></div>
        <div>Score: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ ${problems.length}</span></div>
      </div>

      <div class="grid">
        ${problems.map((p, idx) => `
          <div class="problem-card">
            <div><span class="num">#${idx + 1}</span> ${p.q}</div>
            <div class="answer-line"></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Kibo the Red Panda Mascot 🐾 • www.kiboclimb.com</div>
      <div>Page 1 of 2 • Practice Worksheet</div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page page-2">
    <div>
      <div class="key-header">
        <div class="key-title">
          <span class="mascot-avatar">${KIBO_RED_PANDA_FAVICON_SVG}</span>
          <span>Parent Answer Key & Verification Guide</span>
        </div>
        <span class="badge" style="background:#ede9fe; color:#5b21b6; border-color:#c4b5fd;">
          Page 2 of 2
        </span>
      </div>

      <div class="parent-tip">
        <strong>🐾 Mascot Kibo's Learning Tip:</strong> Review any missed problems with your child using scrap paper or counters. Mistakes are valuable milestones!
      </div>

      <div class="key-grid">
        ${problems.map((p, idx) => `
          <div class="key-item">
            <span><strong>#${idx + 1}:</strong> ${p.q.replace(/___/g, '').replace(/=.*$/, '=')}</span>
            <span class="key-ans">${p.ans}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Kibo Climb Offline Practice Solutions • Verified Solutions</div>
      <div>Page 2 of 2 • Answer Key</div>
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

export function openPrintableWorksheet(worksheet, childName = 'Kibo Climber', recentMistakes = []) {
  // Navigate directly to dedicated worksheet URL for SEO & history
  if (typeof window !== 'undefined') {
    const targetUrl = `/worksheets/${worksheet.id}`;
    if (window.history && window.history.pushState) {
      window.history.pushState({ worksheetId: worksheet.id }, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return true;
    }
  }
  return false;
}
