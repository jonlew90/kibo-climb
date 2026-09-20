import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'https://kiboclimb.com';
const BLOG_JSON_DIR = path.join(ROOT_DIR, 'src', 'content', 'blog');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const RSS_FEED_PATH = path.join(PUBLIC_DIR, 'feed.xml');

import { WORKSHEET_CATALOG, getBestWorksheetForTier, getWorksheetBySlug } from '../src/utils/worksheetGenerator.js';

function formatInlineMarkdown(text) {
  if (!text) return '';
  let safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Bold **text**
  safeText = safeText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Markdown links [text](url)
  safeText = safeText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return safeText;
}

function markdownToHtml(mdText) {
  if (!mdText) return '';
  const blocks = mdText.trim().split(/\n\n+/).filter(b => b.trim());
  const htmlParts = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const firstLine = lines[0];

    if (firstLine.startsWith('### ')) {
      const heading = formatInlineMarkdown(firstLine.slice(4));
      htmlParts.push(`<h3>${heading}</h3>`);
      for (const line of lines.slice(1)) {
        htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
      }
    } else if (firstLine.startsWith('## ')) {
      const heading = formatInlineMarkdown(firstLine.slice(3));
      htmlParts.push(`<h2>${heading}</h2>`);
      for (const line of lines.slice(1)) {
        htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
      }
    } else if (/^\d+\.\s+/.test(firstLine)) {
      const items = lines.map(line => {
        const text = line.replace(/^\d+\.\s*/, '');
        return `<li>${formatInlineMarkdown(text)}</li>`;
      });
      htmlParts.push(`<ol>${items.join('')}</ol>`);
    } else if (firstLine.startsWith('- ') || firstLine.startsWith('* ')) {
      const items = lines.map(line => {
        const text = line.replace(/^[-*]\s*/, '');
        return `<li>${formatInlineMarkdown(text)}</li>`;
      });
      htmlParts.push(`<ul>${items.join('')}</ul>`);
    } else if (firstLine.startsWith('> ') || firstLine.startsWith('>')) {
      const quoteText = lines.map(line => line.replace(/^>\s*/, '')).join(' ');
      htmlParts.push(`<blockquote><p>${formatInlineMarkdown(quoteText)}</p></blockquote>`);
    } else {
      const text = lines.join(' ');
      htmlParts.push(`<p>${formatInlineMarkdown(text)}</p>`);
    }
  }

  return htmlParts.join('\n      ');
}

function resolveRelatedWorksheet(data) {
  if (data.worksheet_slug) {
    const match = WORKSHEET_CATALOG.find(w => w.slug === data.worksheet_slug);
    if (match) return match;
  }
  const subject = data.subject || 'math';
  const tier = Number(data.tier) || 1;
  return getBestWorksheetForTier(subject, tier);
}

function renderWorksheetCallout(worksheet) {
  if (!worksheet) return '';
  const worksheetUrl = `/worksheets/${worksheet.subject}/${worksheet.slug}`;
  return `
    <div class="worksheet-callout-card">
      <div class="worksheet-callout-header">
        <span>🎯 Free Printable Practice</span>
        <span>•</span>
        <span>${worksheet.gradeLabel || 'Grades K–6'}</span>
      </div>
      <h3>Practice This Skill: ${worksheet.title}</h3>
      <p>${worksheet.desc || 'Reinforce this strategy offline with 16 targeted curriculum problems and a complete parent answer key.'}</p>
      <a href="${worksheetUrl}" class="worksheet-cta-button">Download Printable Worksheet & Key →</a>
    </div>
  `;
}

function formatDate(isoString) {
  if (!isoString) return 'September 14, 2026';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return isoString.slice(0, 10);
  }
}

function updateSitemap(posts) {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.warn(`Sitemap not found at ${SITEMAP_PATH}. Skipping sitemap sync.`);
    return;
  }

  let sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');

  // Sync /blog index URL in sitemap
  const blogIndexUrl = `${BASE_URL}/blog`;
  const blogIndexLocPattern = new RegExp(`<loc>${blogIndexUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>([\\s\\S]*?)</url>`, 'i');
  const todayDate = new Date().toISOString().slice(0, 10);

  if (blogIndexLocPattern.test(sitemapContent)) {
    sitemapContent = sitemapContent.replace(
      blogIndexLocPattern,
      `<loc>${blogIndexUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`
    );
  } else {
    const newEntry = `  <url>\n    <loc>${blogIndexUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`;
    sitemapContent = sitemapContent.replace('</urlset>', newEntry);
  }

  for (const post of posts) {
    const slug = post.slug;
    const postUrl = `${BASE_URL}/blog/${slug}`;
    const publishedAt = post.published_at || '2026-09-14';
    const pubDateShort = publishedAt.slice(0, 10);

    const locPattern = new RegExp(`<loc>${postUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>([\\s\\S]*?)</url>`, 'i');
    
    if (locPattern.test(sitemapContent)) {
      sitemapContent = sitemapContent.replace(
        locPattern,
        `<loc>${postUrl}</loc>\n    <lastmod>${pubDateShort}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      );
    } else {
      const newEntry = `  <url>\n    <loc>${postUrl}</loc>\n    <lastmod>${pubDateShort}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
      sitemapContent = sitemapContent.replace('</urlset>', newEntry);
    }
  }

  // Sync /worksheets index and public catalog sheets in sitemap
  const worksheetsIndexUrl = `${BASE_URL}/worksheets`;
  const wsIndexLocPattern = new RegExp(`<loc>${worksheetsIndexUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>([\\s\\S]*?)</url>`, 'i');
  if (wsIndexLocPattern.test(sitemapContent)) {
    sitemapContent = sitemapContent.replace(
      wsIndexLocPattern,
      `<loc>${worksheetsIndexUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`
    );
  } else {
    const newEntry = `  <url>\n    <loc>${worksheetsIndexUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`;
    sitemapContent = sitemapContent.replace('</urlset>', newEntry);
  }

  const publicSheets = WORKSHEET_CATALOG.filter(w => !w.isDynamic);
  for (const sheet of publicSheets) {
    const sheetUrl = `${BASE_URL}/worksheets/${sheet.subject}/${sheet.slug}`;
    const locPattern = new RegExp(`<loc>${sheetUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>([\\s\\S]*?)</url>`, 'i');
    if (locPattern.test(sitemapContent)) {
      sitemapContent = sitemapContent.replace(
        locPattern,
        `<loc>${sheetUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      );
    } else {
      const newEntry = `  <url>\n    <loc>${sheetUrl}</loc>\n    <lastmod>${todayDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
      sitemapContent = sitemapContent.replace('</urlset>', newEntry);
    }
  }

  fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
  console.log(` Synchronized Sitemap with blog index, ${posts.length} posts, and ${publicSheets.length} worksheets: ${SITEMAP_PATH}`);
}

function generateRssFeed(posts) {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
  const nowRfc822 = new Date().toUTCString();

  const itemsXml = sortedPosts.map(post => {
    const postUrl = `${BASE_URL}/blog/${post.slug}`;
    const pubDateRfc822 = post.published_at ? new Date(post.published_at).toUTCString() : nowRfc822;
    const titleClean = (post.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const descClean = (post.social_copy?.short_blurb || post.meta_description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const postIndex = sortedPosts.findIndex(p => p.slug === post.slug);
    const fallbackImage = AVAILABLE_BLOG_IMAGES[(postIndex >= 0 ? postIndex : 0) % AVAILABLE_BLOG_IMAGES.length];
    const featuredFilename = post.featured_asset || fallbackImage;
    const featuredImage = `${BASE_URL}/images/blog/${featuredFilename}`;
    const contentHtml = markdownToHtml(post.content_markdown || '');
    const categories = Array.isArray(post.tags) ? post.tags : [post.subject || 'mental math'];

    const categoriesXml = categories.map(cat => `      <category><![CDATA[${cat}]]></category>`).join('\n');

    return `    <item>
      <title>${titleClean}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDateRfc822}</pubDate>
      <dc:creator><![CDATA[Kibo Climb]]></dc:creator>
      <author>support@kiboclimb.com (Kibo Climb)</author>
      <description><![CDATA[${descClean}]]></description>
      <content:encoded><![CDATA[<figure><img src="${featuredImage}" alt="${titleClean}" /><figcaption>${titleClean}</figcaption></figure>${contentHtml}]]></content:encoded>
      <enclosure url="${featuredImage}" type="image/jpeg" length="0" />
      <media:content url="${featuredImage}" type="image/jpeg" medium="image">
        <media:title type="plain">${titleClean}</media:title>
        <media:thumbnail url="${featuredImage}" />
      </media:content>
${categoriesXml}
    </item>`;
  }).join('\n');

  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Kibo Climb Blog – Math Strategies, Phonics, Geography &amp; Coding for Kids</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Discover expert mental math shortcuts, adaptive phonics, geography insights, coding logic, and printable worksheet practice to turn daily learning into an exciting mountain climb.</description>
    <language>en-US</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <image>
      <url>${BASE_URL}/icons/icon-512.png</url>
      <title>Kibo Climb</title>
      <link>${BASE_URL}/blog</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

  fs.writeFileSync(RSS_FEED_PATH, rssContent, 'utf8');
  console.log(` Generated Enhanced RSS Feed (Flipboard, Telegram & Discord ready) with ${sortedPosts.length} posts: ${RSS_FEED_PATH}`);
}

const BLOG_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'blog');
const AVAILABLE_BLOG_IMAGES = fs.existsSync(BLOG_IMAGES_DIR)
  ? fs.readdirSync(BLOG_IMAGES_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  : [
      'kibo_sitting_on_boulder_thinking_20260916125021.jpeg',
      'kibo_rock_climbing_granite_cliff_20260916124919.jpeg',
      'kibo-climbing.jpeg'
    ];

function generatePostHtml(data, allPosts = []) {
  const slug = data.slug;
  const title = data.title;
  const metaDescription = data.meta_description || data.summary || '';
  const publishedAt = data.published_at || '';
  const formattedDate = formatDate(publishedAt);
  const postIndex = allPosts.findIndex(p => p.slug === slug);
  const fallbackImage = AVAILABLE_BLOG_IMAGES[(postIndex >= 0 ? postIndex : 0) % AVAILABLE_BLOG_IMAGES.length];
  const featuredFilename = data.featured_asset || fallbackImage;
  const featuredImageUrl = `${BASE_URL}/images/blog/${featuredFilename}`;
  const postUrl = `${BASE_URL}/blog/${slug}`;

  const contentHtml = markdownToHtml(data.content_markdown || '');
  const relatedWorksheet = resolveRelatedWorksheet(data);
  const worksheetCalloutHtml = renderWorksheetCallout(relatedWorksheet);

  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex !== -1 && currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const prevNextHtml = (prevPost || nextPost) ? `
    <nav aria-label="Related Articles" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 2rem 0; padding-top: 1.5rem; border-top: 1px solid #FED7AA;">
      ${prevPost ? `
        <a href="/blog/${prevPost.slug}" style="display: flex; flex-direction: column; justify-content: space-between; padding: 1rem; background: #FFFFFF; border-radius: 1rem; border: 2px solid #E2E8F0; text-decoration: none; color: inherit;">
          <span style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.25rem;">← Previous Article</span>
          <strong style="font-size: 0.9rem; color: #1E293B;">${prevPost.title}</strong>
        </a>
      ` : '<div></div>'}
      ${nextPost ? `
        <a href="/blog/${nextPost.slug}" style="display: flex; flex-direction: column; justify-content: space-between; padding: 1rem; background: #FFFFFF; border-radius: 1rem; border: 2px solid #E2E8F0; text-decoration: none; color: inherit; text-align: right;">
          <span style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.25rem;">Next Article →</span>
          <strong style="font-size: 0.9rem; color: #1E293B;">${nextPost.title}</strong>
        </a>
      ` : ''}
    </nav>
  ` : '';

  const tags = Array.isArray(data.tags) ? data.tags : [];
  const tagsKeywords = tags.join(', ');
  const tagsMetaHtml = tags.map(tag => `<meta property="article:tag" content="${tag.replace(/"/g, '&quot;')}" />`).join('\n  ');
  const sectionMeta = (data.topic || data.subject) ? `<meta property="article:section" content="${(data.topic || data.subject).replace(/"/g, '&quot;')}" />` : '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: metaDescription,
    image: featuredImageUrl,
    datePublished: publishedAt,
    dateModified: data.updated_at || publishedAt,
    inLanguage: 'en-US',
    keywords: tagsKeywords,
    ...(data.topic ? { about: data.topic } : {}),
    ...(data.tier ? { educationalLevel: `Tier ${data.tier}` } : {}),
    author: {
      '@type': 'Organization',
      name: 'Kibo Climb',
      url: BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kibo Climb',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${title} | Kibo Climb</title>
  <meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  ${tagsKeywords ? `<meta name="keywords" content="${tagsKeywords.replace(/"/g, '&quot;')}" />` : ''}
  <link rel="canonical" href="${postUrl}" />
  <meta name="robots" content="index, follow" />

  <!-- Google Analytics 4 (COPPA Compliant) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PNQ5D8DFHP"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'granted'
    });
    gtag('set', {
      'restricted_data_processing': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false
    });
    gtag('js', new Date());
    gtag('config', 'G-PNQ5D8DFHP');
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/blog.css" />

  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=kibo-duo-v2" />
  <link rel="shortcut icon" href="/favicon.ico?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" href="/favicon.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=kibo-duo-v2" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=kibo-duo-v2" />

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:site_name" content="Kibo Climb" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${postUrl}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${featuredImageUrl}" />
  <meta property="article:author" content="Kibo Climb" />
  <meta property="article:published_time" content="${publishedAt}" />
  ${sectionMeta ? sectionMeta + '\n  ' : ''}${tagsMetaHtml ? tagsMetaHtml + '\n  ' : ''}<meta name="author" content="Kibo Climb" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${postUrl}" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${featuredImageUrl}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <nav class="nav-bar">
    <a href="/" class="nav-logo">
      <img src="/favicon.svg" alt="Kibo" width="28" height="28" />
      <span>Kibo Climb</span>
    </a>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="/worksheets" style="font-weight: 700; color: #475569; text-decoration: none; font-size: 0.875rem;">Worksheets</a>
      <a href="/blog" style="font-weight: 700; color: #475569; text-decoration: none; font-size: 0.875rem;">Blog</a>
      <a href="/" class="nav-cta">Play Free</a>
    </div>
  </nav>

  <main class="article-container">
    <div style="margin-bottom: 1.25rem; font-size: 0.875rem; font-weight: 700; color: #64748B;">
      <a href="/blog" style="color: #475569; text-decoration: none;">← Blog</a>
      <span style="margin: 0 0.5rem; color: #CBD5E1;">›</span>
      <span style="color: #EA580C; font-weight: 900;">${title}</span>
    </div>

    <h1>${title}</h1>
    <div class="date">Published ${formattedDate} • Adaptive Math Strategies</div>
    
    <img src="${featuredImageUrl}" alt="${title.replace(/"/g, '&quot;')}" class="hero-img" />

    <article>
      ${contentHtml}
      ${worksheetCalloutHtml}
    </article>

    ${prevNextHtml}

    <section class="social-follow-card" aria-label="Stay Connected &amp; Newsletter">
      <div class="social-follow-header">
        <span class="social-follow-badge">Stay Connected</span>
        <h4 class="social-follow-title">Follow Our Learning Drops &amp; Practice Sheets</h4>
        <p class="social-follow-desc">Get weekly math strategies, mental shortcuts, and new printable worksheet releases.</p>
      </div>

      <div class="social-follow-links">
        <a href="https://www.pinterest.com/kiboclimb/kibo-climb-education/" target="_blank" rel="noopener noreferrer" class="social-btn social-btn-pinterest" title="Follow Kibo Climb on Pinterest">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.177.268-.407.16-1.52-.707-2.47-2.927-2.47-4.713 0-3.835 2.786-7.359 8.037-7.359 4.22 0 7.498 3.008 7.498 7.027 0 4.193-2.643 7.571-6.311 7.571-1.232 0-2.391-.64-2.787-1.396l-.758 2.896c-.274 1.045-1.014 2.352-1.51 3.146C10.07 23.818 11.017 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/></svg>
          <span>Pinterest</span>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61594522407493" target="_blank" rel="noopener noreferrer" class="social-btn social-btn-facebook" title="Follow Kibo Climb on Facebook">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>Facebook</span>
        </a>
        <a href="https://x.com/kiboclimbapp" target="_blank" rel="noopener noreferrer" class="social-btn social-btn-x" title="Follow Kibo Climb on X">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span>X</span>
        </a>
        <a href="https://www.threads.com/@kiboclimb" target="_blank" rel="noopener noreferrer" class="social-btn social-btn-threads" title="Follow Kibo Climb on Threads">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.836 13.84c-.187 2.766-2.023 4.685-4.836 4.685-2.973 0-5.06-2.18-5.06-5.289 0-3.158 2.148-5.358 5.17-5.358 2.875 0 4.758 1.944 4.887 4.544h-2.19c-.114-1.464-1.127-2.483-2.697-2.483-1.749 0-2.887 1.34-2.887 3.297 0 1.93 1.116 3.238 2.83 3.238 1.543 0 2.457-.96 2.627-2.164h-2.627v-1.89h4.893v5.42z"/></svg>
          <span>Threads</span>
        </a>
        <a href="https://www.linkedin.com/company/kiboclimb" target="_blank" rel="noopener noreferrer" class="social-btn social-btn-linkedin" title="Follow Kibo Climb on LinkedIn">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          <span>LinkedIn</span>
        </a>
      </div>

      <div class="social-newsletter-wrap">
        <form class="social-newsletter-form" onsubmit="event.preventDefault(); this.querySelector('.newsletter-submit-btn').innerText = '✓ Subscribed!'; this.querySelector('input').disabled = true;">
          <input type="email" placeholder="Enter parent email for free drops..." required class="social-newsletter-input" />
          <button type="submit" class="newsletter-submit-btn">✨ Subscribe</button>
        </form>
        <p class="social-newsletter-subtext">Free weekly digest. No spam, parent-controlled, unsubscribe anytime.</p>
      </div>
    </section>

    <section class="cta-card">
      <h3>Turn Math Practice Into a Mountain Adventure</h3>
      <p>Help Kibo summit Mount Kilimanjaro by tackling mental math shortcuts, adaptive levels, and skill-building challenges tailored directly to your student.</p>
      <a href="/" class="cta-button">Start the Climb - Free to Play</a>
    </section>
  </main>

  <footer style="border-top: 1px solid #FFEDD5; background: #FFFFFF; padding: 2rem 1rem; text-align: center; font-size: 0.75rem; color: #64748B; font-weight: 500;">
    <div style="max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
      <p style="margin: 0;">© 2026 Kibo Climb. Adaptive math practice, mental arithmetic strategies &amp; printable worksheets for K–8 learners.</p>
      <div style="display: flex; gap: 1rem; color: #475569; font-weight: 700;">
        <a href="/" style="color: inherit; text-decoration: none;">Game</a>
        <a href="/worksheets" style="color: inherit; text-decoration: none;">Worksheets</a>
        <a href="/blog" style="color: inherit; text-decoration: none;">Blog</a>
        <a href="/privacy" style="color: inherit; text-decoration: none;">Privacy</a>
        <a href="/terms" style="color: inherit; text-decoration: none;">Terms</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function generateBlogIndexHtml(posts) {
  const title = 'Kibo Climb Blog – Math Strategies, Mental Math Shortcuts & Parent Guides';
  const metaDescription = 'Discover expert mental math shortcuts, adaptive learning strategies, and printable resources to turn math practice into an exciting mountain climb.';
  const canonicalUrl = `${BASE_URL}/blog`;
  const defaultImage = `${BASE_URL}/images/blog/kibo-climbing.jpeg`;

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
  });

  const featured = sortedPosts[0];
  const gridPosts = sortedPosts.slice(1);

  const featuredHtml = featured ? `
    <section aria-label="Featured Article">
      <a href="/blog/${featured.slug}" class="blog-featured-card">
        <div class="featured-img-container">
          <img
            src="${BASE_URL}/images/blog/${featured.featured_asset || 'kibo-climbing.jpeg'}"
            alt="${featured.title.replace(/"/g, '&quot;')}"
            class="featured-cover-img"
          />
          <span class="featured-card-badge">⭐ Featured Guide</span>
        </div>
        <div class="featured-content">
          <div class="featured-meta">
            <span>${featured.topic || (featured.tags && featured.tags[0]) || 'Mental Math'}</span>
          </div>
          <h2 class="featured-title">${featured.title}</h2>
          <p class="featured-excerpt">${(featured.social_copy?.short_blurb || featured.meta_description || '').replace(/"/g, '&quot;')}</p>
          <div class="featured-footer">
            <span class="featured-author-meta">Published ${formatDate(featured.published_at)}</span>
            <span class="featured-cta-link">Read Article →</span>
          </div>
        </div>
      </a>
    </section>
  ` : '';

  const gridCardsHtml = gridPosts.map(post => {
    const coverImg = `${BASE_URL}/images/blog/${post.featured_asset || 'kibo-climbing.jpeg'}`;
    const categoryBadge = (post.tags && post.tags[0]) || post.topic || 'Math Strategies';
    const topicText = post.topic || categoryBadge;

    return `
    <div class="flex">
      <a href="/blog/${post.slug}" class="blog-card w-full">
        <div class="blog-card-img-wrap">
          <img
            src="${coverImg}"
            alt="${post.title.replace(/"/g, '&quot;')}"
            class="blog-card-img"
            loading="lazy"
          />
          <span class="blog-card-badge">${categoryBadge}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${topicText}</span>
            <span>•</span>
            <span>3 min read</span>
          </div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${(post.social_copy?.short_blurb || post.meta_description || '').replace(/"/g, '&quot;')}</p>
          <div class="blog-card-footer">
            <span class="blog-card-date">Published ${formatDate(post.published_at)}</span>
            <span class="blog-card-read-link">Read Article →</span>
          </div>
        </div>
      </a>
    </div>
  `;
  }).join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Kibo Climb Learning Blog',
    url: canonicalUrl,
    description: metaDescription,
    publisher: {
      '@type': 'Organization',
      name: 'Kibo Climb',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512.png`
      }
    },
    blogPost: sortedPosts.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${BASE_URL}/blog/${p.slug}`,
      datePublished: p.published_at,
      description: p.social_copy?.short_blurb || p.meta_description,
      image: `${BASE_URL}/images/blog/${p.featured_asset || 'kibo-climbing.jpeg'}`
    }))
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${title}</title>
  <meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />

  <!-- Google Analytics 4 (COPPA Compliant) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PNQ5D8DFHP"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'granted'
    });
    gtag('set', {
      'restricted_data_processing': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false
    });
    gtag('js', new Date());
    gtag('config', 'G-PNQ5D8DFHP');
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

  <!-- Shared Blog Stylesheet -->
  <link rel="stylesheet" href="/css/blog.css" />

  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=kibo-duo-v2" />
  <link rel="shortcut icon" href="/favicon.ico?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/png" href="/favicon.png?v=kibo-duo-v2" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=kibo-duo-v2" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=kibo-duo-v2" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Kibo Climb" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${defaultImage}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${defaultImage}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <nav class="nav-bar">
    <a href="/" class="nav-logo">
      <img src="/favicon.svg" alt="Kibo" width="28" height="28" />
      <span>Kibo Climb</span>
    </a>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <a href="/worksheets" style="color: #0F766E; font-weight: 700; text-decoration: none; font-size: 0.9rem;">Worksheets</a>
      <a href="/" class="nav-cta">Play Free</a>
    </div>
  </nav>

  <main class="blog-index-container">
    <nav aria-label="Breadcrumb" class="blog-breadcrumbs">
      <a href="/"><span>Home</span></a>
      <span class="crumb-separator" aria-hidden="true">&gt;</span>
      <span class="current-crumb">Blog</span>
    </nav>

    <header class="blog-header-section">
      <div class="blog-header-badge">
        <span>✨ Kibo Learning Hub</span>
      </div>
      <h1 class="blog-main-title">Math Strategies, Mental Tricks &amp; Parent Guides</h1>
      <p class="blog-sub-title">
        Discover expert mental math shortcuts, adaptive learning strategies, and printable resources designed to turn everyday arithmetic into an exciting mountain adventure.
      </p>
    </header>

    ${featuredHtml}

    <section aria-label="Article Feed">
      <div class="blog-grid-header">
        <h2 class="blog-grid-title">Latest Articles &amp; Guides</h2>
        <span class="blog-grid-count">${sortedPosts.length} articles</span>
      </div>
      <div class="blog-grid">
        ${gridCardsHtml}
      </div>
    </section>

    <!-- Worksheet Center Banner -->
    <section class="blog-worksheet-banner" aria-label="Printable Worksheets Promotion">
      <div class="worksheet-banner-icon" aria-hidden="true">📄</div>
      <div class="worksheet-banner-text">
        <h3>Looking for Hands-On Practice?</h3>
        <p>Explore our free and printable math worksheets for all grade levels. Reinforce mental math, multiplication, and problem-solving with targeted offline practice and parent answer keys.</p>
      </div>
      <div>
        <a href="/worksheets" class="worksheet-banner-btn">Visit Worksheet Center</a>
      </div>
    </section>

    <!-- Footer Core Product Banner -->
    <section class="cta-card" aria-label="Start Learning Adventure">
      <h3>Turn Math Practice Into a Kilimanjaro Quest</h3>
      <p>Help Kibo the red panda summit Mount Kilimanjaro! Tackling adaptive math prompts, mental arithmetic shortcuts, and daily streak quests tailored directly to your student.</p>
      <a href="/" class="cta-button">Start the Climb - Free to Play</a>
    </section>
  </main>

  <footer style="border-top: 1px solid #FFEDD5; background: #FFFFFF; padding: 2rem 1rem; text-align: center; font-size: 0.75rem; color: #64748B; font-weight: 500;">
    <div style="max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
      <p style="margin: 0;">© 2026 Kibo Climb. Adaptive math practice, mental arithmetic strategies &amp; printable worksheets for K–8 learners.</p>
      <div style="display: flex; gap: 1rem; color: #475569; font-weight: 700;">
        <a href="/" style="color: inherit; text-decoration: none;">Game</a>
        <a href="/worksheets" style="color: inherit; text-decoration: none;">Worksheets</a>
        <a href="/blog" style="color: inherit; text-decoration: none;">Blog</a>
        <a href="/privacy" style="color: inherit; text-decoration: none;">Privacy</a>
        <a href="/terms" style="color: inherit; text-decoration: none;">Terms</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function buildAll() {
  if (!fs.existsSync(BLOG_JSON_DIR)) {
    console.log(`Directory ${BLOG_JSON_DIR} does not exist. Nothing to build.`);
    return;
  }

  const jsonFiles = fs.readdirSync(BLOG_JSON_DIR).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.log(`No blog posts found in ${BLOG_JSON_DIR}.`);
    return;
  }

  const posts = [];
  for (const filename of jsonFiles.sort()) {
    const filepath = path.join(BLOG_JSON_DIR, filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const rawTags = Array.isArray(data.tags) ? data.tags : [];
    data.tags = rawTags.map(t => t ? t.replace(/\b\w/g, c => c.toUpperCase()) : '').filter(Boolean);
    if (data.slug) posts.push(data);
  }

  // Sort descending by published_at (newest first)
  posts.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());

  for (const data of posts) {
    const slug = data.slug;
    const htmlOutDir = path.join(PUBLIC_DIR, 'blog', slug);
    fs.mkdirSync(htmlOutDir, { recursive: true });

    const htmlContent = generatePostHtml(data, posts);
    const htmlFilePath = path.join(htmlOutDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

    console.log(` Rendered Static HTML: ${htmlFilePath}`);
  }

  // Render static blog index HTML
  const blogIndexDir = path.join(PUBLIC_DIR, 'blog');
  fs.mkdirSync(blogIndexDir, { recursive: true });
  const blogIndexHtml = generateBlogIndexHtml(posts);
  const blogIndexFilePath = path.join(blogIndexDir, 'index.html');
  fs.writeFileSync(blogIndexFilePath, blogIndexHtml, 'utf8');
  console.log(` Rendered Static Blog Index HTML: ${blogIndexFilePath}`);

  updateSitemap(posts);
  generateRssFeed(posts);
  console.log(` Successfully built ${posts.length} static blog posts, RSS feed, and blog index.`);
}

buildAll();

