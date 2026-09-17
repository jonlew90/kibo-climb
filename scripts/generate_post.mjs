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

const BLOG_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'blog');
export const AVAILABLE_BLOG_IMAGES = fs.existsSync(BLOG_IMAGES_DIR)
  ? fs.readdirSync(BLOG_IMAGES_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  : [
      'kibo_sitting_on_boulder_thinking_20260916125021.jpeg',
      'kibo_rock_climbing_granite_cliff_20260916124919.jpeg',
      'kibo-climbing.jpeg'
    ];

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

function getExistingArticles() {
  if (!fs.existsSync(BLOG_JSON_DIR)) return [];
  const files = fs.readdirSync(BLOG_JSON_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(BLOG_JSON_DIR, file), 'utf8'));
      return { file, ...content };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function selectRandomSubjectAndTier() {
  const existingPosts = getExistingArticles();
  const coveredSet = new Set(existingPosts.map(p => `${p.subject || 'math'}:${p.tier || 1}`));
  const subjects = ['math', 'words', 'world', 'coding'];
  
  const allCombinations = [];
  subjects.forEach(subj => {
    for (let t = 1; t <= 8; t++) {
      allCombinations.push({ subject: subj, tier: t });
    }
  });

  const uncovered = allCombinations.filter(c => !coveredSet.has(`${c.subject}:${c.tier}`));
  const pool = uncovered.length > 0 ? uncovered : allCombinations;
  return pool[Math.floor(Math.random() * pool.length)];
}

function selectFeaturedImage(existingPosts = []) {
  const usedImages = new Set(existingPosts.map(p => p.featured_asset).filter(Boolean));
  const unusedImages = AVAILABLE_BLOG_IMAGES.filter(img => !usedImages.has(img));
  const pool = unusedImages.length > 0 ? unusedImages : AVAILABLE_BLOG_IMAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generatePostData({ subject = null, tier = null, customSlug = null, customTitle = null, featuredAsset = null } = {}) {
  const existingPosts = getExistingArticles();

  let finalSubject = subject;
  let finalTier = tier;

  if (!finalSubject || !finalTier) {
    const randomPick = selectRandomSubjectAndTier();
    if (!finalSubject) finalSubject = randomPick.subject;
    if (!finalTier) finalTier = randomPick.tier;
  }

  const targetTier = Number(finalTier) || 1;
  const tierData = getCurriculumTier(finalSubject, targetTier);
  const relatedWorksheet = getBestWorksheetForTier(finalSubject, targetTier);
  const worksheetSlug = relatedWorksheet?.slug || 'grade-4-multi-digit-division';
  const worksheetTitle = relatedWorksheet?.title || 'Practice Worksheet';
  const worksheetUrl = `/worksheets/${finalSubject}/${worksheetSlug}`;
  const gradeLabel = relatedWorksheet?.gradeLabel || (targetTier === 1 ? 'Grades K–2' : targetTier <= 3 ? 'Grades 3–4' : 'Grades 4–6');

  const name = tierData?.name || tierData?.title || `${finalSubject.toUpperCase()} Tier ${targetTier}`;
  const location = tierData?.location || 'Mountain Trail';
  const trick = tierData?.trailTrick || tierData?.hintText || {
    title: `${finalSubject.toUpperCase()} Shortcut`,
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
  let cleanSlug = customSlug || `${finalSubject}-tier-${targetTier}-${trickTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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

  const subjectTerminology = finalSubject === 'words' 
    ? 'spelling and vocabulary strategies' 
    : finalSubject === 'world' 
    ? 'geography and world knowledge' 
    : finalSubject === 'coding' 
    ? 'coding and logical thinking' 
    : 'mental math calculations';

  const markdown = `## Conquering ${name} on Mount Kibo

Let's be honest: when our kids hit **${location}** on Mount Kilimanjaro, the challenge kicks in for both of them—and sometimes us! Kibo the red panda mascot knows that speed and accuracy unlock essential momentum, but rigid memorization often creates unnecessary friction.

By mastering intuitive curriculum strategies, students transform tricky challenges into second-nature shortcuts (and help us parents remember how to navigate Tier ${targetTier} concepts in the process!).

In our Tier ${targetTier} curriculum (${gradeLabel}), students build foundational mastery in:
${topicsList.map(t => `- ${t}`).join('\n')}

### Trail Trick: ${trickTitle}

${trickDesc}
${workedExampleSection}
By visualizing concepts as adaptable mental landmarks, working memory strain is significantly reduced.

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
    finalSubject,
    'mental math',
    'kibo climb',
    gradeLabel.toLowerCase(),
    trickTitle.toLowerCase()
  ];

  const socialCopy = {
    x_post: `Help your ${gradeLabel} student master ${name} with the ${trickTitle} shortcut on Kibo Climb! 🏔️🐾 #MathPractice #EdTech`,
    short_blurb: `Learn the ${trickTitle} mental shortcut for ${gradeLabel} students tackling Tier ${targetTier} on Mount Kibo.`
  };

  const selectedImage = featuredAsset || selectFeaturedImage(existingPosts);
  const nowIso = new Date().toISOString();

  return {
    title,
    slug: cleanSlug,
    subject: finalSubject,
    tier: targetTier,
    topic: name,
    worksheet_slug: worksheetSlug,
    meta_description: metaDescription,
    tags,
    featured_asset: selectedImage,
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
    subject: null,
    tier: null,
    slug: null,
    title: null,
    image: null,
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
    } else if (arg === '--image' && args[i + 1]) {
      options.image = args[++i];
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
    customTitle: options.title,
    featuredAsset: options.image
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
