#!/usr/bin/env node
/**
 * CLI Blog Post Broadcast Utility (Resend API)
 * Dispatches educational blog posts to newsletter subscribers and opted-in parents.
 *
 * Usage:
 *   node scripts/broadcast_blog_post.mjs --slug=mental-math-shortcuts-for-fast-climbers --dry-run
 *   node scripts/broadcast_blog_post.mjs --slug=mental-math-shortcuts-for-fast-climbers
 *   node scripts/broadcast_blog_post.mjs --latest --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBlogEmailHtml } from '../src/utils/blogEmailTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_JSON_DIR = path.join(ROOT_DIR, 'src', 'content', 'blog');

// Parse CLI Arguments
const args = process.argv.slice(2);
let targetSlug = null;
let isDryRun = false;
let isLatest = false;

for (const arg of args) {
  if (arg.startsWith('--slug=')) {
    targetSlug = arg.split('=')[1];
  } else if (arg === '--dry-run') {
    isDryRun = true;
  } else if (arg === '--latest') {
    isLatest = true;
  }
}

function getBlogPost(slug) {
  if (!fs.existsSync(BLOG_JSON_DIR)) {
    throw new Error(`Blog directory not found: ${BLOG_JSON_DIR}`);
  }

  const files = fs.readdirSync(BLOG_JSON_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error('No blog posts found.');
  }

  if (isLatest || !slug) {
    // Sort by file mtime descending
    const sorted = files.map(file => ({
      file,
      mtime: fs.statSync(path.join(BLOG_JSON_DIR, file)).mtime.getTime()
    })).sort((a, b) => b.mtime - a.mtime);
    
    const latestFile = sorted[0].file;
    return JSON.parse(fs.readFileSync(path.join(BLOG_JSON_DIR, latestFile), 'utf8'));
  }

  const targetFile = files.find(f => {
    const raw = fs.readFileSync(path.join(BLOG_JSON_DIR, f), 'utf8');
    try {
      const data = JSON.parse(raw);
      return data.slug === slug || f.replace('.json', '') === slug;
    } catch {
      return false;
    }
  });

  if (!targetFile) {
    throw new Error(`Post with slug "${slug}" not found in ${BLOG_JSON_DIR}`);
  }

  return JSON.parse(fs.readFileSync(path.join(BLOG_JSON_DIR, targetFile), 'utf8'));
}

async function runBroadcast() {
  const post = getBlogPost(targetSlug);
  console.log(`\n🐾 Kibo Climb Blog Post Broadcast`);
  console.log(`---------------------------------`);
  console.log(`Title:   ${post.title}`);
  console.log(`Slug:    ${post.slug}`);
  console.log(`Subject: ${(post.subject || 'math').toUpperCase()} (Tier ${post.tier || 1})`);
  console.log(`Mode:    ${isDryRun ? '🔍 DRY RUN (Preview only)' : '🚀 LIVE BROADCAST'}`);

  const htmlBody = generateBlogEmailHtml({ post });
  const subject = `🐾 New Kibo Guide: ${post.title}`;

  if (isDryRun) {
    console.log(`\n✅ Email HTML generated successfully (${htmlBody.length} bytes).`);
    console.log(`Subject: "${subject}"`);
    console.log(`Ready for broadcast. Run without '--dry-run' to dispatch via Resend.`);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`\n❌ Error: RESEND_API_KEY environment variable is missing.`);
    console.error(`Set RESEND_API_KEY=re_... in your environment or secrets before running live.`);
    process.exit(1);
  }

  const senderEmail = process.env.SENDER_EMAIL || 'Kibo Climb <updates@kiboclimb.com>';
  const targetEmail = process.env.BROADCAST_TEST_EMAIL || 'support@kiboclimb.com';

  console.log(`\nDispatching to Resend API for: ${targetEmail}`);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: senderEmail,
      to: [targetEmail],
      subject,
      html: htmlBody
    })
  });

  const resJson = await response.json();
  if (!response.ok) {
    throw new Error(`Resend API Error: ${JSON.stringify(resJson)}`);
  }
  console.log(`✅ Broadcast sent successfully:`, resJson);
}

runBroadcast().catch(err => {
  console.error(`Broadcast failed:`, err.message || err);
  process.exit(1);
});
