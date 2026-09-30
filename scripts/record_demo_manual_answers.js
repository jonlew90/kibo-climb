import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const outputDir = path.resolve('./recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Format filename timestamp using US Central Time
  const now = new Date();
  const getCentralPart = (type, options) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      [type]: options
    }).format(now);
  };

  const year = getCentralPart('year', 'numeric');
  const month = getCentralPart('month', '2-digit');
  const day = getCentralPart('day', '2-digit');
  const hour = getCentralPart('hour', '2-digit').padStart(2, '0');
  const minute = getCentralPart('minute', '2-digit').padStart(2, '0');
  const second = getCentralPart('second', '2-digit').padStart(2, '0');
  const timestamp = `${year}-${month}-${day}_${hour}-${minute}-${second}_CT`;

  const browser = await chromium.launch({
    headless: false,
    slowMo: 180
  });

  // Emulate Pixel 7: taller (915px vs 844px) and wider (412px vs 390px) than iPhone 13
  const targetDevice = devices['Pixel 7'];
  const context = await browser.newContext({
    ...targetDevice,
    recordVideo: {
      dir: outputDir,
      size: { width: targetDevice.viewport.width, height: targetDevice.viewport.height }
    }
  });

  const page = await context.newPage();

  console.log(`1. Navigating to Kibo Climb on ${targetDevice.defaultBrowserType || 'Pixel 7'} (${targetDevice.viewport.width}x${targetDevice.viewport.height})...`);
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
  const usernameNextBtn = page.locator('button[type="submit"]:visible, button:visible:has-text("Next")').first();
  if (await usernameNextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(400);
    await tapAndPause(usernameNextBtn, 'Username Next submit button');
  }

  // --- STEP 3: Grade Selection (Resilient Matching) ---
  console.log('5. Checking for Grade Selection...');
  await page.waitForTimeout(600);

  const gradeTile = page.locator('button:visible, [role="button"]:visible').filter({
    hasText: /Grade\s*1[–—\-]?2|1st\s*[–—\-]?\s*2nd|1\s*[–—\-]\s*2/i
  }).first();

  const isGradeScreenVisible = await gradeTile.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

  if (isGradeScreenVisible) {
    console.log(' -> Found Grade 1–2 tile');
    await tapAndPause(gradeTile, 'Grade 1–2 tile');

    const gradeNextBtn = page.locator('button:visible').filter({
      hasText: /Next|Continue|Confirm|Start/i
    }).first();

    if (await gradeNextBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await tapAndPause(gradeNextBtn, 'Grade Continue button');
    }
  } else {
    console.log(' -> Grade selection bypassed or already active.');
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

  // --- STEP 8: Manual Play Window (20 Seconds) ---
  console.log('\n======================================================');
  console.log('🎮 10. CLIMB STARTED! YOU HAVE 20 SECONDS TO PLAY!');
  console.log('======================================================\n');

  for (let sec = 20; sec > 0; sec--) {
    process.stdout.write(`⏱️  Time remaining: ${sec}s...\r`);
    await page.waitForTimeout(1000);
  }

  console.log('\n\n⏱️  Time is up! Finalizing mobile demo recording...');
  await page.waitForTimeout(3000);

  // Close context to finish writing video file
  const video = page.video();
  await context.close();
  await browser.close();

  const originalVideoPath = await video.path();
  const finalVideoPath = path.join(outputDir, `kibo_demo_${timestamp}.webm`);

  fs.renameSync(originalVideoPath, finalVideoPath);
  console.log(`\nRecording finished successfully!\nSaved to: ${finalVideoPath}`);
})();
