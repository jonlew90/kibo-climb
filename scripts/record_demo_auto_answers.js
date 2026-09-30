import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const outputDir = path.resolve('./recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 180
  });

  // Emulate authentic iPhone 13 device preset
  const iPhone13 = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone13,
    recordVideo: {
      dir: outputDir,
      size: { width: iPhone13.viewport.width, height: iPhone13.viewport.height }
    }
  });

  const page = await context.newPage();

  console.log('1. Navigating to Kibo Climb on iPhone 13...');
  await page.goto('https://kiboclimb.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('2. Waiting 2.75s for splash/loading screen...');
  await page.waitForTimeout(2750);

  const tapAndPause = async (locator, label) => {
    console.log(` -> Tapping: ${label}`);
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(200);
    await locator.tap({ force: true }).catch(async () => {
      await locator.click({ force: true });
    });
    await page.waitForTimeout(500);
  };

  // --- STEP 1: Welcome Next button ---
  console.log('3. Welcome Next button...');
  const welcomeArrowBtn = page.locator([
    'button:visible:has(svg)',
    'button:visible:has-text("Next")',
    'button:visible:has-text("→")',
    '.fixed button:visible'
  ].join(', ')).last();

  await welcomeArrowBtn.waitFor({ state: 'visible', timeout: 8000 });
  await tapAndPause(welcomeArrowBtn, 'Welcome Next button');

  // --- STEP 2: Username Next button ---
  console.log('4. Username Next button...');
  const usernameNextBtn = page.locator('button[type="submit"]:visible:has-text("Next")').first();
  await usernameNextBtn.waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]');
    return btn && !btn.disabled;
  }, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await tapAndPause(usernameNextBtn, 'Username Next submit button');

  // --- STEP 3: Grade Selection ---
  console.log('5. Selecting Grade 1–2...');
  const gradeTile = page.locator('button:visible').filter({
    hasText: /Grade 1[–-]2/i
  }).first();
  await gradeTile.waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(500);
  await tapAndPause(gradeTile, 'Grade 1–2 tile');

  const gradeNextBtn = page.locator('button:visible').filter({
    hasText: /Next|Continue|Confirm/i
  }).first();
  if (await gradeNextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await tapAndPause(gradeNextBtn, 'Grade Continue button');
  }

  // --- STEP 4: Math Subject Button ---
  console.log('6. Waiting for Math subject button in DOM...');
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => {
      const truncateSpan = b.querySelector('span.truncate');
      return truncateSpan && truncateSpan.textContent.trim() === 'Math';
    });
  }, { timeout: 10000 });

  const clickedMath = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mathBtn = btns.find(b => {
      const truncateSpan = b.querySelector('span.truncate');
      return truncateSpan && truncateSpan.textContent.trim() === 'Math';
    });
    if (mathBtn) {
      mathBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      mathBtn.click();
      return true;
    }
    return false;
  });

  if (clickedMath) {
    console.log(' -> Tapped Math button');
  }
  await page.waitForTimeout(600);

  // --- STEP 5: Dismiss Kibo News Modal ---
  console.log('7. Checking for Kibo News modal...');
  const newsDismissBtn = page.locator('button:visible').filter({
    hasText: /Got it|Awesome|Close|Continue|OK|Thanks|Play/i
  }).first();

  if (await newsDismissBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Dismissing Kibo News modal...');
    await tapAndPause(newsDismissBtn, 'Kibo News dismiss button');
    await newsDismissBtn.waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {});
  }

  // --- STEP 6: Daily Vault Modal & "Collect & Climb" ---
  console.log('8. Handling Daily Vault modal...');
  const vaultActionBtn = page.locator('button:visible').filter({
    hasText: /Collect & Climb|Unlock Vault|Unlock|Open Vault|Claim/i
  }).first();

  if (await vaultActionBtn.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false)) {
    await tapAndPause(vaultActionBtn, 'Vault action button');
    await page.waitForTimeout(1000);

    const collectBtn = page.locator('button:visible').filter({
      hasText: /Collect & Climb|Collect|Climb/i
    }).first();

    if (await collectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tapAndPause(collectBtn, 'Collect & Climb button');
      await collectBtn.waitFor({ state: 'hidden', timeout: 1500 }).catch(() => {});
    }
  }

  // --- STEP 7: Click "START CLIMB 🏔️" ---
  console.log('9. Waiting for START CLIMB 🏔️ button...');
  const startClimbBtn = page.locator('button:visible').filter({
    hasText: 'START CLIMB'
  }).first();

  await startClimbBtn.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(200);
  await tapAndPause(startClimbBtn, 'START CLIMB 🏔️ button');

  // --- STEP 8: Comprehensive DOM Solver (Analogies, Money, Divisibility, Decimals, Fractions, Time, Coins) ---
  console.log('10. Climb session started! Running Solver on iPhone 13...');
  await page.waitForTimeout(1200);

  let lastPrompt = '';

  for (let round = 1; round <= 12; round++) {
    // 1. Check if the session is complete (Summary / Claim screen)
    const isSummaryVisible = await page.locator('button:visible').filter({
      hasText: /Climb Again|Continue|Back to Base|Claim/i
    }).first().isVisible({ timeout: 300 }).catch(() => false);

    if (isSummaryVisible) {
      console.log('\nSession complete: Summary screen detected!');
      break;
    }

    console.log(`\n==================== [ROUND ${round}] ====================`);

    // 2. Dismiss review banners, mistake popups, or shield modals ('✕')
    await page.evaluate(() => {
      const dismissBtns = Array.from(document.querySelectorAll('button:not(header button)'));
      const closeBtn = dismissBtns.find(b => {
        const txt = (b.innerText || '').trim();
        const aria = b.getAttribute('aria-label') || '';
        return (txt === '✕' || txt === '×' || /dismiss|close/i.test(aria)) && b.offsetParent !== null;
      });
      if (closeBtn) closeBtn.click();
    });

    // 3. Barrier wait: Wait until the active question card mounts
    await page.waitForFunction(() => {
      const main = document.querySelector('main') || document.body;
      const text = main.innerText || '';
      const hasClock = !!main.querySelector('svg circle, [class*="clock"], [aria-label*="clock"]');
      const hasMoney = /[$¢]|saved|total|change|cent|paid|cost|quarter|dime|nickel|penn/i.test(text);
      const hasTime = /what time|minute|mins?|after|past|:\d{2}/i.test(text);
      const hasFraction = /lowest terms|simplify|reduce|larger|greater|smaller|least|\d+\/\d+/i.test(text);
      const hasDivisible = /divisible/i.test(text);
      const hasAnalogy = /is to\b/i.test(text);
      const hasMath = /[\+\-\−\×\*\÷\/]/.test(text) || /\d+,\s*[\d\?_]/.test(text);
      
      return hasClock || hasMoney || hasTime || hasFraction || hasDivisible || hasAnalogy || hasMath;
    }, { timeout: 8000 }).catch(() => {});

    await page.waitForTimeout(300);

    const questionAnalysis = await page.evaluate(() => {
      const cleanOp = (op) => {
        if (op === '−' || op === '-') return '-';
        if (op === '×' || op === '*') return '*';
        if (op === '÷' || op === '/') return '/';
        return '+';
      };

      const cleanFloat = (num) => {
        return String(parseFloat(num.toFixed(4)));
      };

      const gcd = (a, b) => {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
          const t = b;
          b = a % b;
          a = t;
        }
        return a;
      };

      const toCents = (str) => {
        if (!str) return null;
        const s = str.trim();
        const dollarOrDecimal = s.match(/\$?(?:(\d+)?\.(\d{1,2})|(\d+))/);
        if (dollarOrDecimal) {
          if (dollarOrDecimal[2] !== undefined) {
            const whole = parseInt(dollarOrDecimal[1] || '0', 10);
            const frac = parseInt(dollarOrDecimal[2].padEnd(2, '0'), 10);
            return whole * 100 + frac;
          }
          if (dollarOrDecimal[3] !== undefined) {
            return parseInt(dollarOrDecimal[3], 10);
          }
        }
        return null;
      };

      const formatCents = (cents) => {
        if (cents < 100) {
          const pad = cents < 10 ? `0${cents}` : `${cents}`;
          return `.${pad}`;
        }
        return (cents / 100).toFixed(2);
      };

      const main = document.querySelector('main') || document.body;

      // Gather candidate card texts
      const elements = Array.from(main.querySelectorAll('h1, h2, h3, [class*="card"], [class*="equation"], div, p, span'))
        .filter(el => {
          if (el.closest('header') || el.closest('[class*="hud"]')) return false;
          const t = (el.innerText || '').trim();
          return t.length > 0 && t.length < 180;
        });

      let candidateTexts = Array.from(new Set(elements.map(el => el.innerText.trim().replace(/\s+/g, ' '))));

      candidateTexts = candidateTexts
        .map(t => t.replace(/.*(?:PRUNE|SPYGLASS|HINT|PASS|PROBE)[^\d\?]*\(\d+\)\s*(?:✕\s*)*/i, '').trim())
        .filter(t => !/^(?:QUESTION|SHIELD|Kibo Shield|REVIEWING)/i.test(t) && t.length > 0);

      let solution = null;
      let matchedType = 'unknown';
      let cleanPrompt = '';

      for (const line of candidateTexts) {
        // --- CASE 1: NUMERICAL ANALOGIES / RATIOS (e.g. "3 is to 7 as s 6 is to ?", "4 is to 12 as 5 is to ?") ---
        if (/is to/i.test(line)) {
          const analogyMatch = line.match(/(\d+(?:\.\d+)?)\s*is to\s*(\d+(?:\.\d+)?)\s*as(?:\s+[a-z])?\s*(\d+(?:\.\d+)?)\s*is to\s*[\?_□⬜]/i);
          if (analogyMatch) {
            const a = parseFloat(analogyMatch[1]);
            const b = parseFloat(analogyMatch[2]);
            const c = parseFloat(analogyMatch[3]);

            if (a !== 0) {
              // Direct proportion: a / b = c / x => x = (b * c) / a
              const propResult = (b * c) / a;
              solution = cleanFloat(propResult);
              cleanPrompt = line;
              matchedType = 'numerical_analogy';
              break;
            }
          }
        }

        // --- CASE 2: MONEY TOTALS / SAVINGS (e.g. "Saved $.25 and .10. Total?") ---
        if (/saved|total|altogether|in all/i.test(line) && (line.includes('$') || line.includes('.'))) {
          const amounts = Array.from(line.matchAll(/\$?\d*\.\d{1,2}/gi)).map(m => m[0]);
          if (amounts.length >= 2) {
            let totalCents = 0;
            for (const amt of amounts) {
              const cents = toCents(amt);
              if (cents !== null) totalCents += cents;
            }
            solution = formatCents(totalCents);
            cleanPrompt = line;
            matchedType = 'money_savings_total';
            break;
          }
        }

        // --- CASE 3: DIVISIBILITY QUESTIONS (e.g. "Is 87 divisible by 3?") ---
        if (/divisible/i.test(line)) {
          const divMatch = line.match(/(?:is\s*)?(\d+)\s*divisible\s*by\s*(\d+)/i);
          if (divMatch) {
            const num = parseInt(divMatch[1], 10);
            const div = parseInt(divMatch[2], 10);

            if (div !== 0) {
              const isDivisible = (num % div === 0);
              solution = isDivisible ? 'Yes' : 'No';
              cleanPrompt = line;
              matchedType = 'divisibility_yes_no';
              break;
            }
          }
        }

        // --- CASE 4: FRACTION COMPARISON ---
        if (/larger|greater|bigger|smaller|lesser/i.test(line) && line.includes('/')) {
          const fracMatches = Array.from(line.matchAll(/(\d+)\s*\/\s*(\d+)/g));
          if (fracMatches.length >= 2) {
            const n1 = parseInt(fracMatches[0][1], 10);
            const d1 = parseInt(fracMatches[0][2], 10);
            const n2 = parseInt(fracMatches[1][1], 10);
            const d2 = parseInt(fracMatches[1][2], 10);

            const v1 = n1 / d1;
            const v2 = n2 / d2;
            const wantsSmaller = /smaller|lesser|least/i.test(line);

            if (wantsSmaller) {
              solution = v1 < v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
            } else {
              solution = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
            }

            cleanPrompt = line;
            matchedType = 'fraction_comparison';
            break;
          }
        }

        // --- CASE 5: FRACTION REDUCTION / LOWEST TERMS ---
        if (/lowest terms|simplify|reduce/i.test(line) || (line.includes('/') && /lowest|term/i.test(line))) {
          const fracMatch = line.match(/(\d+)\s*\/\s*(\d+)/);
          if (fracMatch) {
            const num = parseInt(fracMatch[1], 10);
            const den = parseInt(fracMatch[2], 10);
            if (den !== 0) {
              const divisor = gcd(num, den);
              const redNum = num / divisor;
              const redDen = den / divisor;
              solution = redDen === 1 ? String(redNum) : `${redNum}/${redDen}`;
              cleanPrompt = line;
              matchedType = 'fraction_reduction';
              break;
            }
          }
        }

        // --- CASE 6: COIN COMBINATIONS ---
        if (/quarter|dime|nickel|penn/i.test(line)) {
          let totalCents = 0;
          let foundCoins = false;

          const quarterMatch = line.match(/(\d+)\s*quarter/i);
          if (quarterMatch) { totalCents += parseInt(quarterMatch[1], 10) * 25; foundCoins = true; }

          const dimeMatch = line.match(/(\d+)\s*dime/i);
          if (dimeMatch) { totalCents += parseInt(dimeMatch[1], 10) * 10; foundCoins = true; }

          const nickelMatch = line.match(/(\d+)\s*nickel/i);
          if (nickelMatch) { totalCents += parseInt(nickelMatch[1], 10) * 5; foundCoins = true; }

          const pennyMatch = line.match(/(\d+)\s*penn(?:y|ies)/i);
          if (pennyMatch) { totalCents += parseInt(pennyMatch[1], 10) * 1; foundCoins = true; }

          const halfMatch = line.match(/(\d+)\s*half\s*dollar/i);
          if (halfMatch) { totalCents += parseInt(halfMatch[1], 10) * 50; foundCoins = true; }

          if (foundCoins) {
            solution = String(totalCents);
            cleanPrompt = line;
            matchedType = 'coin_combination_sum';
            break;
          }
        }

        // --- CASE 7: CHANGE / PAYMENT PROBLEMS ---
        if (/change|paid|cost/i.test(line) && !line.includes('o\'clock')) {
          const moneyMatches = Array.from(line.matchAll(/(?:\$\d+(?:\.\d{1,2})?|\d*\.\d{1,2}|\d+\s*(?:¢|c\b|cents?))/gi)).map(m => m[0]);
          if (moneyMatches.length >= 2) {
            const val1 = toCents(moneyMatches[0]);
            const val2 = toCents(moneyMatches[1]);
            if (val1 !== null && val2 !== null) {
              const changeCents = Math.max(val1, val2) - Math.min(val1, val2);
              solution = formatCents(changeCents);
              cleanPrompt = line;
              matchedType = 'money_change';
              break;
            }
          }

          const singleDollarWithNum = line.match(/\$(\d+)(?:\.00)?\s*[\-−]\s*(\d+)/i);
          if (singleDollarWithNum) {
            const paid = parseInt(singleDollarWithNum[1], 10) * 100;
            const cost = parseInt(singleDollarWithNum[2], 10);
            solution = formatCents(paid - cost);
            cleanPrompt = line;
            matchedType = 'money_change';
            break;
          }
        }

        // --- CASE 8: FORWARD TIME ---
        const forwardTimeMatch = line.match(/(?:what time is\s*)?(\d+)\s*mins?\s*(?:after|past)\s*(\d{1,2}):(\d{2})/i);
        if (forwardTimeMatch) {
          const addMins = parseInt(forwardTimeMatch[1], 10);
          const startH = parseInt(forwardTimeMatch[2], 10);
          const startM = parseInt(forwardTimeMatch[3], 10);

          let totalMins = (startH % 12) * 60 + startM + addMins;
          let resH = Math.floor(totalMins / 60) % 12;
          if (resH === 0) resH = 12;
          let resM = totalMins % 60;
          const padM = resM < 10 ? `0${resM}` : `${resM}`;

          solution = `${resH}:${padM}`;
          cleanPrompt = line;
          matchedType = 'forward_time_addition';
          break;
        }

        const forwardHourMatch = line.match(/(\d+)\s*hours?\s*(?:after|past)\s*(\d{1,2}):(\d{2})/i);
        if (forwardHourMatch) {
          const addH = parseInt(forwardHourMatch[1], 10);
          const startH = parseInt(forwardHourMatch[2], 10);
          const m = forwardHourMatch[3];
          let resH = ((startH - 1 + addH) % 12) + 1;

          solution = `${resH}:${m}`;
          cleanPrompt = line;
          matchedType = 'forward_hour_addition';
          break;
        }

        // --- CASE 9: ELAPSED MINUTES ---
        const twoTimesMatch = Array.from(line.matchAll(/(\d{1,2}):(\d{2})/g));
        if (twoTimesMatch.length >= 2 && /how many minutes|minutes after|from|to/i.test(line)) {
          const t1_h = parseInt(twoTimesMatch[0][1], 10);
          const t1_m = parseInt(twoTimesMatch[0][2], 10);
          const t2_h = parseInt(twoTimesMatch[1][1], 10);
          const t2_m = parseInt(twoTimesMatch[1][2], 10);
          let totalMin1 = (t1_h % 12) * 60 + t1_m;
          let totalMin2 = (t2_h % 12) * 60 + t2_m;
          if (totalMin2 < totalMin1) totalMin2 += 12 * 60;

          solution = String(totalMin2 - totalMin1);
          cleanPrompt = line;
          matchedType = 'elapsed_minutes_between_times';
          break;
        }

        // --- CASE 10: NUMBER SEQUENCES (Integer or Decimal) ---
        if (line.includes(',') || line.includes('→')) {
          const rawTokens = line.split(/[,→\s]+/).filter(t => t.length > 0);
          const hasMissing = rawTokens.some(t => t === '?' || t === '_' || t === 'X');

          if (hasMissing) {
            const parsed = rawTokens.map(t => /^\d+(?:\.\d+)?$/.test(t) ? parseFloat(t) : null);
            const validIndices = parsed.map((v, i) => v !== null ? i : -1).filter(i => i !== -1);

            if (validIndices.length >= 2) {
              const idxA = validIndices[0];
              const idxB = validIndices[1];
              const step = (parsed[idxB] - parsed[idxA]) / (idxB - idxA);
              const missingIdx = rawTokens.findIndex(t => t === '?' || t === '_' || t === 'X');

              if (!isNaN(step) && missingIdx !== -1) {
                solution = cleanFloat(parsed[idxA] + (missingIdx - idxA) * step);
                cleanPrompt = line;
                matchedType = 'number_sequence';
                break;
              }
            }
          }
        }

        // --- CASE 11: MISSING OPERATOR (Integer or Decimal) ---
        const opMatch = line.match(/(\d+(?:\.\d+)?)\s*[\?_□⬜]\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/);
        if (opMatch) {
          const a = parseFloat(opMatch[1]);
          const b = parseFloat(opMatch[2]);
          const c = parseFloat(opMatch[3]);
          const eps = 0.0001;

          if (Math.abs((a + b) - c) < eps) solution = '+';
          else if (Math.abs((a - b) - c) < eps) solution = '-';
          else if (Math.abs((a * b) - c) < eps) solution = '×';
          else if (b !== 0 && Math.abs((a / b) - c) < eps) solution = '÷';

          cleanPrompt = opMatch[0];
          matchedType = 'missing_operator';
          break;
        }

        // --- CASE 12: MISSING LEAD OPERAND (Integer or Decimal) ---
        const leadMatch = line.match(/[\?_□⬜]\s*([+\-−×*÷/])\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/);
        if (leadMatch) {
          const op = cleanOp(leadMatch[1]);
          const b = parseFloat(leadMatch[2]);
          const c = parseFloat(leadMatch[3]);

          if (op === '+') solution = cleanFloat(c - b);
          if (op === '-') solution = cleanFloat(c + b);
          if (op === '*') solution = cleanFloat(c / b);
          if (op === '/') solution = cleanFloat(c * b);

          cleanPrompt = leadMatch[0];
          matchedType = 'missing_lead_operand';
          break;
        }

        // --- CASE 13: MISSING TRAIL OPERAND (Integer or Decimal) ---
        const trailMatch = line.match(/(\d+(?:\.\d+)?)\s*([+\-−×*÷/])\s*[\?_□⬜]\s*=\s*(\d+(?:\.\d+)?)/);
        if (trailMatch) {
          const a = parseFloat(trailMatch[1]);
          const op = cleanOp(trailMatch[2]);
          const c = parseFloat(trailMatch[3]);

          if (op === '+') solution = cleanFloat(c - a);
          if (op === '-') solution = cleanFloat(a - c);
          if (op === '*') solution = cleanFloat(c / a);
          if (op === '/') solution = cleanFloat(a / c);

          cleanPrompt = trailMatch[0];
          matchedType = 'missing_trail_operand';
          break;
        }

        // --- CASE 14: STANDARD EXPRESSION (Integer or Decimal) ---
        const stdMatch = line.match(/(\d+(?:\.\d+)?)\s*([+\-−×*÷/])\s*(\d+(?:\.\d+)?)\s*=\s*[\?_□⬜]/);
        if (stdMatch) {
          const a = parseFloat(stdMatch[1]);
          const op = cleanOp(stdMatch[2]);
          const b = parseFloat(stdMatch[3]);

          if (op === '+') solution = cleanFloat(a + b);
          if (op === '-') solution = cleanFloat(a - b);
          if (op === '*') solution = cleanFloat(a * b);
          if (op === '/') solution = cleanFloat(a / b);

          cleanPrompt = stdMatch[0];
          matchedType = 'standard_expression';
          break;
        }
      }

      return {
        cleanPrompt,
        matchedType,
        solution
      };
    });

    console.log(`[Clean Prompt]: "${questionAnalysis.cleanPrompt || 'None'}"`);
    console.log(`[Solved Type]: ${questionAnalysis.matchedType}`);
    console.log(`[Calculated Solution]: ${questionAnalysis.solution || 'None'}`);

    lastPrompt = questionAnalysis.cleanPrompt;

    // --- PURE DISPATCH (YES/NO BUTTONS, COMPARISON PILLS, OR KEYBOARD) ---
    if (questionAnalysis.solution !== null) {
      let sol = questionAnalysis.solution;
      if (sol === '×') sol = '*';
      if (sol === '−') sol = '-';
      if (sol === '÷') sol = '/';

      let buttonTapped = false;

      if (questionAnalysis.matchedType === 'divisibility_yes_no' || questionAnalysis.matchedType === 'fraction_comparison') {
        buttonTapped = await page.evaluate((targetLabel) => {
          const btns = Array.from(document.querySelectorAll('button:not(header button)'));
          const target = btns.find(b => {
            const t = (b.innerText || '').trim().replace(/\s+/g, '');
            return t.toLowerCase() === targetLabel.toLowerCase();
          });
          if (target && target.offsetParent !== null) {
            target.scrollIntoView({ behavior: 'instant', block: 'center' });
            target.click();
            return true;
          }
          return false;
        }, sol);
      }

      if (buttonTapped) {
        console.log(`[SUBMITTED]: Tapped on-screen button for "${sol}"`);
      } else {
        console.log(`[SUBMITTED]: Typing "${sol}" via keyboard + Enter`);

        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(30);

        await page.keyboard.type(sol, { delay: 40 });
        await page.waitForTimeout(80);

        await page.keyboard.press('Enter');
      }
    } else {
      console.log(`[SUBMITTED]: Fallback "1" via keyboard + Enter`);
      await page.keyboard.press('Digit1');
      await page.waitForTimeout(50);
      await page.keyboard.press('Enter');
    }

    // --- PACING CONTROL ---
    if (round === 12) {
      console.log('Final round completed! Holding 3.0s for summit victory celebration & summary...');
      await page.waitForTimeout(3000);
    } else {
      await page.waitForTimeout(950);
    }
  }

  console.log('11. Finalizing iPhone 13 demo recording...');
  await page.waitForTimeout(2500);

  await context.close();
  await browser.close();

  const videoFile = await page.video().path();
  console.log(`\nRecording finished successfully!\nSaved to: ${videoFile}`);
})();
