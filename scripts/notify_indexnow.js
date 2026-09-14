#!/usr/bin/env node

/**
 * Script to submit URLs to IndexNow (Bing, Yandex, etc.).
 *
 * Usage:
 *   node scripts/notify_indexnow.js https://kiboclimb.com/math https://kiboclimb.com/words
 *   node scripts/notify_indexnow.js --all (submits all URLs from sitemap.xml)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'kiboclimb.com';
const KEY = 'a2855a69ad19069fe332fdd1e50e5930';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function submitToIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.log('No URLs provided to submit.');
    return;
  }

  // Normalize URLs to full URLs on the host
  const normalizedUrls = urls.map(u => {
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `https://${HOST}${u.startsWith('/') ? '' : '/'}${u}`;
  });

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: normalizedUrls
  };

  try {
    console.log(`Submitting ${normalizedUrls.length} URL(s) to IndexNow...`);
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200) {
      console.log('✅ Successfully submitted URLs to IndexNow.');
    } else if (response.status === 202) {
      console.log('✅ URLs received and queued by IndexNow (HTTP 202).');
    } else {
      const text = await response.text();
      console.error(`⚠️ IndexNow responded with HTTP ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error('❌ Error submitting to IndexNow:', err.message);
  }
}

function parseSitemapUrls() {
  const sitemapPath = path.resolve(__dirname, '../dist/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found at dist/sitemap.xml');
    return [];
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const matches = [...content.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)];
  return matches.map(m => m[1]);
}

// CLI execution
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  if (args.includes('--all')) {
    const urls = parseSitemapUrls();
    submitToIndexNow(urls);
  } else if (args.length > 0) {
    submitToIndexNow(args);
  } else {
    console.log('Usage:');
    console.log('  node scripts/notify_indexnow.js <url1> <url2> ...');
    console.log('  node scripts/notify_indexnow.js --all');
  }
}
