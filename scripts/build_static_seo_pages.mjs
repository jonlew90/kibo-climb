import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WORKSHEET_CATALOG, generateWorksheetHtml } from '../src/utils/worksheetGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const BASE_URL = 'https://kiboclimb.com';

function getPageShell({ title, description, canonicalUrl, contentHtml, activeNav = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${title}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
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
    gtag('config', 'G-PNQ5D8DFHP', {
      'cookie_domain': 'kiboclimb.com'
    });
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

  <!-- Open Graph -->
  <meta property="og:site_name" content="Kibo Climb" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${BASE_URL}/favicon.png" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${BASE_URL}/favicon.png" />
</head>
<body class="blog-page-wrapper">
  <!-- Navigation Header -->
  <header style="background: #FFFFFF; border-bottom: 2px solid #E2E8F0; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <div class="nav-bar">
      <a href="/" class="nav-logo" title="Kibo Climb Home">
        <span style="font-size: 1.6rem; margin-right: 0.35rem;">🐾</span>
        <span style="background: linear-gradient(135deg, #EA580C 0%, #D97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Kibo Climb</span>
      </a>
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <a href="/worksheets" class="nav-link ${activeNav === 'worksheets' ? 'active' : ''}" style="text-decoration: none; font-weight: 700; color: #475569; font-size: 0.95rem;">Worksheets</a>
        <a href="/blog" class="nav-link ${activeNav === 'blog' ? 'active' : ''}" style="text-decoration: none; font-weight: 700; color: #475569; font-size: 0.95rem;">Blog</a>
        <a href="/tips" class="nav-link ${activeNav === 'tips' ? 'active' : ''}" style="text-decoration: none; font-weight: 700; color: #475569; font-size: 0.95rem;">Tips</a>
        <a href="/?action=play" style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 0.85rem; padding: 0.45rem 0.9rem; border-radius: 9999px; box-shadow: 0 2px 4px rgba(234,88,12,0.25);">Start Climb 🏔️</a>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <main style="max-width: 800px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem;">
    ${contentHtml}
  </main>

  <!-- Global Footer -->
  <footer style="background: #0F172A; color: #94A3B8; padding: 3rem 1.25rem 2rem; border-top: 1px solid #1E293B;">
    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="color: #FFFFFF; font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>🐾</span> Kibo Climb
          </div>
          <div style="font-size: 0.85rem; margin-top: 0.25rem;">Daily gamified learning expedition for children & families.</div>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.85rem;">
          <a href="/worksheets" style="color: #CBD5E1; text-decoration: none;">Worksheets</a>
          <a href="/blog" style="color: #CBD5E1; text-decoration: none;">Blog</a>
          <a href="/tips" style="color: #CBD5E1; text-decoration: none;">Tips</a>
          <a href="/terms" style="color: #CBD5E1; text-decoration: none;">Terms of Service</a>
          <a href="/privacy" style="color: #CBD5E1; text-decoration: none;">Privacy Policy</a>
          <a href="/coppa-privacy" style="color: #CBD5E1; text-decoration: none;">COPPA Notice</a>
        </div>
      </div>
      <div style="border-top: 1px solid #1E293B; padding-top: 1.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem;">
        <div>© ${new Date().getFullYear()} Kibo Climb LLC. All rights reserved. Kibo is the Red Panda mascot.</div>
        <div>Support: <a href="mailto:support@kiboclimb.com" style="color: #38BDF8; text-decoration: none;">support@kiboclimb.com</a></div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function buildWorksheetsPages() {
  const publicSheets = WORKSHEET_CATALOG.filter(w => !w.isDynamic);
  let count = 0;

  for (const sheet of publicSheets) {
    const sheetDir = path.join(PUBLIC_DIR, 'worksheets', sheet.subject, sheet.slug);
    fs.mkdirSync(sheetDir, { recursive: true });

    const htmlContent = generateWorksheetHtml(sheet);
    const outPath = path.join(sheetDir, 'index.html');
    fs.writeFileSync(outPath, htmlContent, 'utf8');
    count++;
  }

  // Worksheets Index Hub
  const wsHubDir = path.join(PUBLIC_DIR, 'worksheets');
  fs.mkdirSync(wsHubDir, { recursive: true });

  const subjects = ['math', 'words', 'world', 'coding'];
  const subjectTitles = {
    math: 'Mental Math & Arithmetic',
    words: 'Vocabulary, Phonics & Spelling',
    world: 'World Geography & Maps',
    coding: 'Coding Logic & Algorithms'
  };

  let hubContentHtml = `
    <div style="text-align: center; margin-bottom: 3rem;">
      <span style="background: #FEF3C7; color: #B45309; font-weight: 800; font-size: 0.8rem; padding: 0.35rem 0.85rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Free Printable Practice</span>
      <h1 style="font-size: 2.5rem; font-weight: 900; color: #0F172A; margin: 0.75rem 0 0.5rem; line-height: 1.2;">Printable Kibo Climb Worksheets</h1>
      <p style="font-size: 1.1rem; color: #475569; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        Download and print teacher-crafted practice sheets with full answer keys. Perfect for homeschoolers, daily review drills, and classroom supplement.
      </p>
    </div>
  `;

  for (const sub of subjects) {
    const subSheets = publicSheets.filter(s => s.subject === sub);
    if (!subSheets.length) continue;

    hubContentHtml += `
      <section style="margin-bottom: 3rem; background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 1.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0 0 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>${sub === 'math' ? '🔢' : sub === 'words' ? '📚' : sub === 'world' ? '🌍' : '💻'}</span>
          ${subjectTitles[sub] || sub}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${subSheets.map(sheet => `
            <a href="/worksheets/${sheet.subject}/${sheet.slug}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 1rem; padding: 1.25rem; transition: transform 0.15s ease, border-color 0.15s ease;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.75rem; font-weight: 800; color: #0284C7; background: #E0F2FE; padding: 0.2rem 0.5rem; border-radius: 6px;">${sheet.gradeLabel || 'All Grades'}</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #64748B;">16 Problems</span>
                </div>
                <strong style="font-size: 1.05rem; color: #0F172A; display: block; margin-bottom: 0.35rem;">${sheet.title}</strong>
                <p style="font-size: 0.85rem; color: #475569; margin: 0; line-height: 1.5;">${sheet.desc || ''}</p>
              </div>
              <div style="margin-top: 1rem; font-size: 0.85rem; font-weight: 800; color: #EA580C; display: flex; align-items: center; gap: 0.25rem;">
                Print Worksheet &amp; Key →
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  }

  const hubHtml = getPageShell({
    title: 'Free Printable Worksheets for Kids (Grades K–8) | Kibo Climb',
    description: 'Download free printable math, reading phonics, geography, and coding worksheets with answer keys for Kindergarten through 8th Grade.',
    canonicalUrl: `${BASE_URL}/worksheets`,
    contentHtml: hubContentHtml,
    activeNav: 'worksheets'
  });

  fs.writeFileSync(path.join(wsHubDir, 'index.html'), hubHtml, 'utf8');
  console.log(` Rendered ${count} Static Worksheets + Hub Index at /worksheets/index.html`);
}

export function buildTermsPage() {
  const termsDir = path.join(PUBLIC_DIR, 'terms');
  fs.mkdirSync(termsDir, { recursive: true });

  const contentHtml = `
    <article style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 2.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="margin-bottom: 2rem; border-bottom: 2px solid #F1F5F9; padding-bottom: 1.5rem;">
        <span style="background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px; text-transform: uppercase;">Legal Agreement</span>
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #0F172A; margin: 0.75rem 0 0.5rem;">Terms of Service</h1>
        <div style="font-size: 0.85rem; color: #64748B; font-weight: 600;">Effective Date: September 9, 2026 • Version 1.0</div>
      </div>

      <div style="line-height: 1.8; color: #334155; font-size: 1rem; display: flex; flex-direction: column; gap: 1.75rem;">
        <p>
          Welcome to Kibo Climb. These Terms of Service are entered into by and between you and <strong>Kibo Climb LLC</strong> ("Kibo Climb", "Company", "we", "us", or "our"). By creating an account, practicing on our application, downloading worksheets, or accessing our services, you agree to these Terms of Service.
        </p>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">1. Acceptance &amp; Parent Responsibility</h2>
          <p>
            Kibo Climb is designed for children and families. If a user is under 18 years old, a parent or legal guardian must review and accept these terms on behalf of the child before establishing an account or subscribing to premium features. These Terms are governed by the laws of the State of Texas, without regard to conflict of law principles. Our collection and handling of educational data is governed by our COPPA Privacy Policy, which is incorporated into these Terms.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">2. Educational Service &amp; Gameplay</h2>
          <p>
            Kibo Climb provides adaptive learning exercises, progress tracking, and gamified climbing incentives. While we strive to maintain high uptime and continuous difficulty balancing, service availability may occasionally be affected by maintenance or software updates.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">3. Virtual Currency, Items, Subscriptions &amp; Cancellation</h2>
          <p>In-game currencies ("Sparks"), mascot accessories, badges, and avatars earned during climbs are virtual items:</p>
          <ul style="padding-left: 1.25rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>Virtual items hold no real-world monetary value and cannot be exchanged or redeemed for cash.</li>
            <li>Sparks earned through practice sessions are educational incentives designed to celebrate effort.</li>
            <li>Subscriptions (Kibo Club Solo and Family plans) and in-app purchases may only be authorized and purchased by an adult parent or legal guardian through the Parent Zone.</li>
            <li>We reserve the right to adjust virtual item balances in the event of software glitches or cheat prevention.</li>
          </ul>

          <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 1rem; padding: 1.25rem; margin-top: 1rem;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-top: 0;">Cancellation &amp; Refund Policy ("Cancel at Period End")</h3>
            <ul style="padding-left: 1.25rem; margin-bottom: 0; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.95rem;">
              <li><strong>Cancellation Takes Effect at Period End:</strong> Subscriptions automatically renew at the end of each billing cycle unless canceled prior to the renewal date. When you cancel a subscription, your cancellation takes effect at the conclusion of the current paid billing period. You retain full access to all Kibo Club benefits until that date.</li>
              <li><strong>No Prorated Refunds:</strong> Membership payments are non-refundable. We do not provide prorated cash refunds or store credits for unused days upon cancellation.</li>
              <li><strong>Digital Goods Are Final &amp; Non-Returnable:</strong> All purchases of real-money bundles, cosmetic items, avatar equipment, and virtual currency are digital content delivered immediately upon purchase and are non-refundable.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">4. Acceptable Use, Fair Play &amp; Child Privacy</h2>
          <p>
            Users agree not to exploit bugs, use automated bots or scripts to auto-answer practice problems, attempt unauthorized access to servers, or tamper with app storage data.
          </p>
          <p>
            <strong>Climber Handles &amp; Privacy:</strong> To protect child privacy under COPPA, users agree not to input full real names, phone numbers, email addresses, or personal identifying details as climber tags or profile handles. Automated filters screen handles, and players are encouraged to use randomized safe tags.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">5. Intellectual Property</h2>
          <p>
            All original graphics, character designs (including Kibo the mascot), logos, audio assets, and software code are protected by intellectual property laws and remain the exclusive property of Kibo Climb LLC.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">6. Third-Party Trademarks &amp; Academic Alignment Estimates</h2>
          <p>
            NWEA® and MAP® are registered trademarks of NWEA (a division of Houghton Mifflin Harcourt). Kibo Climb is not affiliated with, sponsored by, or endorsed by NWEA or HMH.
          </p>
          <p>
            Any references to MAP® Growth, RIT scores, or grade-level equivalencies within Kibo Climb are provided solely as informational estimates based on publicly available national normative research data. They do not constitute official test administrations or certified academic credentials.
          </p>
        </section>

        <section style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 1rem; padding: 1.25rem;">
          <h2 style="font-size: 1.2rem; font-weight: 800; color: #166534; margin-top: 0;">7. Questions &amp; Contact</h2>
          <p style="margin: 0.5rem 0;">If you have questions about these Terms of Service, please contact our support team:</p>
          <div style="font-size: 0.9rem; line-height: 1.6; color: #14532D;">
            <strong>Entity:</strong> Kibo Climb LLC<br>
            <strong>Mailing Address:</strong> 906 W McDermott Dr, Suite 116, PMB 345, Allen, TX 75013<br>
            <strong>Support Email:</strong> <a href="mailto:support@kiboclimb.com" style="color: #15803D; font-weight: 700;">support@kiboclimb.com</a>
          </div>
        </section>
      </div>
    </article>
  `;

  const html = getPageShell({
    title: 'Terms of Service | Kibo Climb',
    description: 'Terms and Conditions of Use for Kibo Climb educational apps and services. Parent authorization, COPPA safety, subscriptions, and fair play policies.',
    canonicalUrl: `${BASE_URL}/terms`,
    contentHtml
  });

  fs.writeFileSync(path.join(termsDir, 'index.html'), html, 'utf8');
  console.log(' Rendered Static Terms of Service HTML: /terms/index.html');
}

export function buildPrivacyPage() {
  const privacyDir = path.join(PUBLIC_DIR, 'privacy');
  fs.mkdirSync(privacyDir, { recursive: true });

  const contentHtml = `
    <article style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 2.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="margin-bottom: 2rem; border-bottom: 2px solid #F1F5F9; padding-bottom: 1.5rem;">
        <span style="background: #DBEAFE; color: #1E40AF; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px; text-transform: uppercase;">General Privacy</span>
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #0F172A; margin: 0.75rem 0 0.5rem;">Privacy Policy</h1>
        <div style="font-size: 0.85rem; color: #64748B; font-weight: 600;">Effective Date: September 3, 2026</div>
      </div>

      <div style="line-height: 1.8; color: #334155; font-size: 1rem; display: flex; flex-direction: column; gap: 1.75rem;">
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 1rem; padding: 1.25rem;">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #166534; margin: 0 0 0.25rem;">Looking for Information on Child Data &amp; Under-13 Protections?</h3>
          <p style="margin: 0; font-size: 0.95rem; color: #14532D;">
            Please see our dedicated <a href="/coppa-privacy" style="font-weight: 800; color: #15803D; text-decoration: underline;">COPPA Children's Privacy Notice</a> for detailed protections regarding child accounts.
          </p>
        </div>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">1. Information We Collect</h2>
          <p>
            When adult parents interact with Kibo Climb, we may collect parent email addresses (for login authentication, weekly student progress digests, and account receipt notifications) and payment details processed securely through our PCI-compliant payment provider (Stripe).
          </p>
          <p>
            For child learning profiles, we collect anonymous pseudonyms/handles, grade level, and educational problem performance (answers, speed, and accuracy).
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">2. How We Use Information</h2>
          <p>We use collected data solely to:</p>
          <ul style="padding-left: 1.25rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>Deliver adaptive educational problems calibrated to student proficiency.</li>
            <li>Send scheduled weekly progress email digests to parents upon request.</li>
            <li>Maintain user streak continuity and sync game progress across authorized devices.</li>
            <li>Prevent fraud, cheating, and unauthorized account access.</li>
          </ul>
          <p><strong>We never sell student or family data. We do not serve third-party behavioral ads.</strong></p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">3. Data Security &amp; Retention</h2>
          <p>
            We implement industry-standard encryption in transit (HTTPS / TLS 1.3) and at rest via Google Cloud Firestore. Data is retained only as long as an active account exists or until a parent requests deletion.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">4. Parent Rights &amp; Account Deletion</h2>
          <p>
            Parents may inspect, modify, or permanently delete their family profile data and learning history at any time through the Parent Zone or by emailing <a href="mailto:support@kiboclimb.com" style="color: #0284C7; font-weight: 700;">support@kiboclimb.com</a>.
          </p>
        </section>
      </div>
    </article>
  `;

  const html = getPageShell({
    title: 'Privacy Policy | Kibo Climb',
    description: 'Learn how Kibo Climb protects child privacy, COPPA compliance, and account security.',
    canonicalUrl: `${BASE_URL}/privacy`,
    contentHtml
  });

  fs.writeFileSync(path.join(privacyDir, 'index.html'), html, 'utf8');
  console.log(' Rendered Static Privacy Policy HTML: /privacy/index.html');
}

export function buildCoppaPage() {
  const coppaDir = path.join(PUBLIC_DIR, 'coppa-privacy');
  fs.mkdirSync(coppaDir, { recursive: true });

  const contentHtml = `
    <article style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 2.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="margin-bottom: 2rem; border-bottom: 2px solid #F1F5F9; padding-bottom: 1.5rem;">
        <span style="background: #ECFDF5; color: #065F46; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px; text-transform: uppercase;">Child Safety Notice</span>
        <h1 style="font-size: 2.25rem; font-weight: 900; color: #0F172A; margin: 0.75rem 0 0.5rem;">COPPA Children's Privacy Notice</h1>
        <div style="font-size: 0.85rem; color: #64748B; font-weight: 600;">Compliant with the Children's Online Privacy Protection Act</div>
      </div>

      <div style="line-height: 1.8; color: #334155; font-size: 1rem; display: flex; flex-direction: column; gap: 1.75rem;">
        <p>
          At Kibo Climb, the safety and privacy of young learners is our highest priority. This Notice explains our information collection, disclosure, and parental consent practices with respect to children under the age of 13 pursuant to the <strong>Children's Online Privacy Protection Act ("COPPA")</strong>.
        </p>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">1. Safe Account Creation &amp; Anonymous Handles</h2>
          <p>
            Children do not need to provide personal identifying information (PII) such as full names, email addresses, physical addresses, or phone numbers to use Kibo Climb. Climber profiles use randomized animal tags or child-chosen handles, which are screened to filter out real names or contact details.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">2. Educational Performance Data</h2>
          <p>
            We collect problem responses, timestamp metadata, mastery ratings, and virtual rewards to power the adaptive learning engine. This educational data is never sold, leased, or rented, and is never used to build commercial advertising profiles.
          </p>
        </section>

        <section>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">3. Parental Consent &amp; Controls</h2>
          <p>
            Parents must authorize account registration, email notifications, and optional paid subscriptions via our verified Parent Gate. Parents retain the unconditional right to review their child's learning history, refuse further data collection, and request immediate permanent deletion of all associated records by contacting <a href="mailto:support@kiboclimb.com" style="color: #059669; font-weight: 700;">support@kiboclimb.com</a>.
          </p>
        </section>
      </div>
    </article>
  `;

  const html = getPageShell({
    title: "COPPA Children's Privacy Notice | Kibo Climb",
    description: "Children's Online Privacy Protection Act (COPPA) notice and parental consent policy for Kibo Climb.",
    canonicalUrl: `${BASE_URL}/coppa-privacy`,
    contentHtml
  });

  fs.writeFileSync(path.join(coppaDir, 'index.html'), html, 'utf8');
  console.log(' Rendered Static COPPA Notice HTML: /coppa-privacy/index.html');
}

export function buildTipsPage() {
  const tipsDir = path.join(PUBLIC_DIR, 'tips');
  fs.mkdirSync(tipsDir, { recursive: true });

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 3rem;">
      <span style="background: #EDE9FE; color: #6D28D9; font-weight: 800; font-size: 0.8rem; padding: 0.35rem 0.85rem; border-radius: 9999px; text-transform: uppercase;">Ascent Strategy Guides</span>
      <h1 style="font-size: 2.5rem; font-weight: 900; color: #0F172A; margin: 0.75rem 0 0.5rem; line-height: 1.2;">Kibo Climb Tips &amp; Shortcuts</h1>
      <p style="font-size: 1.1rem; color: #475569; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        Master mental math formulas, phonics decoding anchors, geography navigation landmarks, and step-by-step coding logic tricks.
      </p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <section style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🔢</span> Mental Math Strategy Guides
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <div style="background: #FFF7ED; border: 1.5px solid #FFEDD5; border-radius: 1rem; padding: 1.25rem;">
            <strong style="font-size: 1.05rem; color: #9A3412; display: block; margin-bottom: 0.35rem;">Making Tens &amp; Hundreds</strong>
            <p style="font-size: 0.9rem; color: #7C2D12; margin: 0; line-height: 1.5;">Break numbers apart to find clean tens first (e.g., 28 + 15 = 28 + 2 + 13 = 43).</p>
          </div>
          <div style="background: #FFF7ED; border: 1.5px solid #FFEDD5; border-radius: 1rem; padding: 1.25rem;">
            <strong style="font-size: 1.05rem; color: #9A3412; display: block; margin-bottom: 0.35rem;">Left-to-Right Addition</strong>
            <p style="font-size: 0.9rem; color: #7C2D12; margin: 0; line-height: 1.5;">Add hundreds, then tens, then units to calculate in your head faster than pencil and paper.</p>
          </div>
          <div style="background: #FFF7ED; border: 1.5px solid #FFEDD5; border-radius: 1rem; padding: 1.25rem;">
            <strong style="font-size: 1.05rem; color: #9A3412; display: block; margin-bottom: 0.35rem;">Multiplication Doubling &amp; Halving</strong>
            <p style="font-size: 0.9rem; color: #7C2D12; margin: 0; line-height: 1.5;">Double one factor and halve the other (e.g., 16 × 5 = 8 × 10 = 80) for effortless speed.</p>
          </div>
        </div>
      </section>

      <section style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>📚</span> Phonics &amp; Spelling Anchors
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <div style="background: #F0FDF4; border: 1.5px solid #DCFCE7; border-radius: 1rem; padding: 1.25rem;">
            <strong style="font-size: 1.05rem; color: #166534; display: block; margin-bottom: 0.35rem;">The Magic E Rule</strong>
            <p style="font-size: 0.9rem; color: #14532D; margin: 0; line-height: 1.5;">A silent 'e' at the end makes the vowel say its own name (e.g., cap → cape, hop → hope).</p>
          </div>
          <div style="background: #F0FDF4; border: 1.5px solid #DCFCE7; border-radius: 1rem; padding: 1.25rem;">
            <strong style="font-size: 1.05rem; color: #166534; display: block; margin-bottom: 0.35rem;">Root &amp; Stem Decoding</strong>
            <p style="font-size: 0.9rem; color: #14532D; margin: 0; line-height: 1.5;">Peel off prefixes (un-, re-) and suffixes (-ful, -ing) to find the core word meaning.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  const html = getPageShell({
    title: 'Tips & Tricks Strategy Cheat-Sheets | Kibo Climb',
    description: 'Interactive mental math formulas, phonics rules, coding step-tracing, and geography anchor cheat cards for fast learners.',
    canonicalUrl: `${BASE_URL}/tips`,
    contentHtml,
    activeNav: 'tips'
  });

  fs.writeFileSync(path.join(tipsDir, 'index.html'), html, 'utf8');
  console.log(' Rendered Static Tips HTML: /tips/index.html');
}

export function buildAllStaticSeoPages() {
  console.log('--- Generating Pre-Rendered Static SEO Pages ---');
  buildWorksheetsPages();
  buildTermsPage();
  buildPrivacyPage();
  buildCoppaPage();
  buildTipsPage();
  console.log('--- Static SEO Pages Generation Complete ---');
}
