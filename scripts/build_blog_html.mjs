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

  fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
  console.log(` Synchronized Sitemap with blog index and ${posts.length} posts: ${SITEMAP_PATH}`);
}

function generatePostHtml(data) {
  const slug = data.slug;
  const title = data.title;
  const metaDescription = data.meta_description || data.summary || '';
  const publishedAt = data.published_at || '';
  const formattedDate = formatDate(publishedAt);
  const featuredFilename = data.featured_asset || 'kibo-climbing.jpeg';
  const featuredImageUrl = `${BASE_URL}/images/blog/${featuredFilename}`;
  const postUrl = `${BASE_URL}/blog/${slug}`;

  const contentHtml = markdownToHtml(data.content_markdown || '');
  const relatedWorksheet = resolveRelatedWorksheet(data);
  const worksheetCalloutHtml = renderWorksheetCallout(relatedWorksheet);

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: metaDescription,
    image: featuredImageUrl,
    datePublished: publishedAt,
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

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:site_name" content="Kibo Climb" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${postUrl}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${featuredImageUrl}" />

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
    <a href="/" class="nav-cta">Play Free</a>
  </nav>

  <main class="article-container">
    <h1>${title}</h1>
    <div class="date">Published ${formattedDate} • Adaptive Math Strategies</div>
    
    <img src="${featuredImageUrl}" alt="${title.replace(/"/g, '&quot;')}" class="hero-img" />

    <article>
      ${contentHtml}
      ${worksheetCalloutHtml}
    </article>

    <section class="cta-card">
      <h3>Turn Math Practice Into a Mountain Adventure</h3>
      <p>Help Kibo summit Mount Kilimanjaro by tackling mental math shortcuts, adaptive levels, and skill-building challenges tailored directly to your student.</p>
      <a href="/" class="cta-button">Start the Climb - Free to Play</a>
    </section>
  </main>
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

  const gridCardsHtml = gridPosts.map(post => `
    <article class="flex">
      <a href="/blog/${post.slug}" class="blog-card w-full">
        <div class="blog-card-img-wrap">
          <img
            src="${BASE_URL}/images/blog/${post.featured_asset || 'kibo-climbing.jpeg'}"
            alt="${post.title.replace(/"/g, '&quot;')}"
            class="blog-card-img"
            loading="lazy"
          />
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-category-badge">${(post.tags && post.tags[0]) || post.topic || 'Math Strategies'}</span>
            <span class="blog-card-date">${formatDate(post.published_at)}</span>
          </div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${(post.social_copy?.short_blurb || post.meta_description || '').replace(/"/g, '&quot;')}</p>
          <div class="blog-card-footer">
            <span class="blog-read-time">3 min read</span>
            <span class="blog-card-read-link">Read Guide →</span>
          </div>
        </div>
      </a>
    </article>
  `).join('\n');

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

    if (!data.slug) continue;

    const slug = data.slug;
    const htmlOutDir = path.join(PUBLIC_DIR, 'blog', slug);
    fs.mkdirSync(htmlOutDir, { recursive: true });

    const htmlContent = generatePostHtml(data);
    const htmlFilePath = path.join(htmlOutDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

    console.log(` Rendered Static HTML: ${htmlFilePath}`);
    posts.push(data);
  }

  // Render static blog index HTML
  const blogIndexDir = path.join(PUBLIC_DIR, 'blog');
  fs.mkdirSync(blogIndexDir, { recursive: true });
  const blogIndexHtml = generateBlogIndexHtml(posts);
  const blogIndexFilePath = path.join(blogIndexDir, 'index.html');
  fs.writeFileSync(blogIndexFilePath, blogIndexHtml, 'utf8');
  console.log(` Rendered Static Blog Index HTML: ${blogIndexFilePath}`);

  updateSitemap(posts);
  console.log(` Successfully built ${posts.length} static blog posts and blog index.`);
}

buildAll();

