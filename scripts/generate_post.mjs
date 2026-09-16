#!/usr/bin/env node
/**
 * Single Source of Truth (SSOT) Curriculum-Driven Blog Post Generator
 * Directly imports live curriculum definitions and worksheet catalogs from src/utils/
 * ensuring 100% parity with the app with ZERO data duplication or drift.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CURRICULUM_TIERS as MATH_TIERS } from '../src/utils/mathCurriculum.js';
import { WORDS_CURRICULUM_TIERS as WORDS_TIERS } from '../src/utils/wordsCurriculum.js';
import { WORLD_CURRICULUM_TIERS as WORLD_TIERS } from '../src/utils/worldCurriculum.js';
import { CODING_CURRICULUM_TIERS as CODING_TIERS } from '../src/utils/codingCurriculum.js';
import { WORKSHEET_CATALOG, getBestWorksheetForTier } from '../src/utils/worksheetGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_JSON_DIR = path.join(ROOT_DIR, 'src', 'content', 'blog');

function getCurriculumTier(subject, tier) {
  const targetTier = Number(tier) || 1;
  if (subject === 'math') {
    return MATH_TIERS.find(t => t.tier === targetTier) || MATH_TIERS[0];
  }
  if (subject === 'words') {
    return WORDS_TIERS?.find(t => t.tier === targetTier) || WORDS_TIERS?.[0] || null;
  }
  if (subject === 'world') {
    return WORLD_TIERS?.find(t => t.tier === targetTier) || WORLD_TIERS?.[0] || null;
  }
  if (subject === 'coding') {
    return CODING_TIERS?.find(t => t.tier === targetTier) || CODING_TIERS?.[0] || null;
  }
  return MATH_TIERS[0];
}

export function generatePostData({ subject = 'math', tier = 1, customSlug = null, customTitle = null } = {}) {
  const targetTier = Number(tier) || 1;
  const tierData = getCurriculumTier(subject, targetTier);
  const relatedWorksheet = getBestWorksheetForTier(subject, tier);
  const worksheetSlug = relatedWorksheet?.slug || 'grade-4-multi-digit-division';
  const worksheetTitle = relatedWorksheet?.title || 'Practice Worksheet';
  const worksheetUrl = `/worksheets/${subject}/${worksheetSlug}`;
  const gradeLabel = relatedWorksheet?.gradeLabel || (targetTier === 1 ? 'Grades K–2' : targetTier <= 3 ? 'Grades 3–4' : 'Grades 4–6');

  const name = tierData?.name || tierData?.title || `${subject.toUpperCase()} Tier ${targetTier}`;
  const location = tierData?.location || 'Mountain Trail';
  const trick = tierData?.trailTrick || tierData?.hintText || {
    title: `${subject.toUpperCase()} Shortcut`,
    description: tierData?.description || 'Core curriculum strategy.',
    summary: tierData?.description || 'Core curriculum strategy.'
  };
  const proTip = tierData?.proTip || {
    title: 'Trail Guide Tip',
    content: 'Consistent daily sprints build lightning-fast mental fluency.',
    summary: 'Consistent daily sprints build lightning-fast mental fluency.'
  };

  const trickTitle = trick.title || 'Curriculum Strategy';
  const trickDesc = trick.description || trick.summary || '';
  const sampleProblem = trick.sampleProblem;
  const topicsList = Array.isArray(tierData?.topics) ? tierData.topics : ['Core skill practice and fluency'];

  const title = customTitle || `Mastering ${name}: ${trickTitle} for ${gradeLabel}`;
  let cleanSlug = customSlug || `${subject}-tier-${targetTier}-${trickTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  cleanSlug = cleanSlug.replace(/^-+|-+$/g, '');

  const metaDescription = `Master ${name} on Mount Kibo with the ${trickTitle} shortcut. Includes worked examples and free printable worksheet practice for ${gradeLabel}.`;

  let workedExampleSection = '';
  if (sampleProblem) {
    workedExampleSection = `
**Worked Example:**
- Problem: **${sampleProblem.question}**
- Strategy Application: **${sampleProblem.hint || sampleProblem.correctAnswer}**
- Solution: **${sampleProblem.correctAnswer}**
`;
  }

  const markdown = `## Conquering ${name} on Mount Kibo

When ascending through **${location}** on Mount Kilimanjaro with Kibo the red panda mascot, speed and accuracy unlock essential momentum. Traditional paper-and-pencil methods often create unnecessary cognitive friction during timed mental challenges. By mastering intuitive curriculum strategies, students transform tricky calculations into second-nature shortcuts.

In our Tier ${targetTier} curriculum (${gradeLabel}), students build foundational mastery in:
${topicsList.map(t => `- ${t}`).join('\n')}

### Trail Trick: ${trickTitle}

${trickDesc}
${workedExampleSection}
By visualizing numbers and concepts as adaptable mental landmarks, working memory strain is significantly reduced.

### Trail Pro Tip: ${proTip.title}

> ${proTip.content || proTip.summary}

## Reinforce Skills with Offline Practice

Deliberate practice turns these shortcuts into permanent fluency. You can practice this exact topic live in the [Kibo Climb app](/) or download our verified offline companion resource:

- **Free Practice Worksheet:** [${worksheetTitle}](${worksheetUrl})
- **Includes:** 16 targeted questions and a complete parent/teacher answer key.

## Next Steps for Climbers

Encourage your student to test the ${trickTitle} technique during their next 5-minute practice session. Step by step, they will build an unbreakable foundation of speed and confidence!`;

  const tags = [
    `tier ${targetTier}`,
    subject,
    'mental math',
    'kibo climb',
    gradeLabel.toLowerCase(),
    trickTitle.toLowerCase()
  ];

  const socialCopy = {
    x_post: `Help your ${gradeLabel} student master ${name} with the ${trickTitle} shortcut on Kibo Climb! 🏔️🐾 #MathPractice #EdTech`,
    short_blurb: `Learn the ${trickTitle} mental shortcut for ${gradeLabel} students tackling Tier ${targetTier} on Mount Kibo.`
  };

  const nowIso = new Date().toISOString();

  return {
    title,
    slug: cleanSlug,
    subject,
    tier: targetTier,
    topic: name,
    worksheet_slug: worksheetSlug,
    meta_description: metaDescription,
    tags,
    featured_asset: 'kibo-climbing.jpeg',
    content_markdown: markdown,
    social_copy: socialCopy,
    published_at: nowIso
  };
}

export function saveBlogPost(postData) {
  if (!fs.existsSync(BLOG_JSON_DIR)) {
    fs.mkdirSync(BLOG_JSON_DIR, { recursive: true });
  }
  const filename = `${postData.slug}.json`;
  const filepath = path.join(BLOG_JSON_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(postData, null, 2), 'utf8');
  console.log(` Saved Blog Post JSON (SSOT): ${filepath}`);
  return filepath;
}

function printCurriculumList() {
  console.log('\n=== Kibo Climb Curriculum Tiers (Live Single Source of Truth) ===\n');
  console.log('--- MATH CURRICULUM TIERS ---');
  MATH_TIERS.forEach(t => {
    const ws = getBestWorksheetForTier('math', t.tier);
    console.log(`Tier ${t.tier}: ${t.name} (${t.subtitle || ''})`);
    console.log(`  Location: ${t.location}`);
    console.log(`  Trail Trick: ${t.trailTrick?.title || 'None'}`);
    console.log(`  Linked Worksheet: ${ws?.slug || 'none'}\n`);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    subject: 'math',
    tier: 1,
    slug: null,
    title: null,
    list: false,
    build: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--subject' && args[i + 1]) {
      options.subject = args[++i];
    } else if (arg === '--tier' && args[i + 1]) {
      options.tier = parseInt(args[++i], 10);
    } else if (arg === '--slug' && args[i + 1]) {
      options.slug = args[++i];
    } else if (arg === '--title' && args[i + 1]) {
      options.title = args[++i];
    } else if (arg === '--list-curriculum' || arg === '--list') {
      options.list = true;
    } else if (arg === '--build') {
      options.build = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  if (options.list) {
    printCurriculumList();
    return;
  }

  const postData = generatePostData({
    subject: options.subject,
    tier: options.tier,
    customSlug: options.slug,
    customTitle: options.title
  });

  saveBlogPost(postData);

  if (options.build) {
    const buildScript = path.join(ROOT_DIR, 'scripts', 'build_blog_html.mjs');
    console.log('⚡ Running static HTML builder...');
    const { spawnSync } = await import('child_process');
    spawnSync('node', [buildScript], { stdio: 'inherit', cwd: ROOT_DIR });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
