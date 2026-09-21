/**
 * Blog Email Template Generator
 * Builds responsive, child-safe, beautifully styled HTML email for Resend broadcasts.
 */

export function generateBlogEmailHtml({
  post,
  siteUrl = 'https://kiboclimb.com',
  unsubscribeUrl = 'https://kiboclimb.com/?action=parent-settings&tab=notifications&utm_source=transactional_email&utm_medium=email&utm_campaign=blog_broadcast&utm_content=footer_unsubscribe'
}) {
  if (!post) throw new Error('Post data is required to generate blog email');

  const title = post.title || 'New Guide from Kibo Climb';
  const excerpt = post.excerpt || post.description || '';
  const subjectName = (post.subject || 'math').toUpperCase();
  const tier = post.tier || 1;
  const readingTime = post.reading_time_minutes || 4;
  const slug = post.slug || '';
  const postUrl = `${siteUrl}/blog/${slug}/`;
  const featuredAsset = post.featured_asset || 'kibo_sitting_on_boulder_thinking_20260916125021.jpeg';
  const imageUrl = `${siteUrl}/images/blog/${featuredAsset}`;
  const promoCode = post.reader_reward_code || post.promo_code || null;
  const promoReward = post.reader_reward_desc || '50 Free Sparks';

  // Format bullet points or key takeaways from content if present
  const keyTakeaways = Array.isArray(post.key_takeaways)
    ? post.key_takeaways
    : [
        'Practical step-by-step strategies designed for young climbers',
        'Built directly into the Kibo Climb interactive curriculum',
        'Includes free printable companion worksheets & practice drills'
      ];

  const takeawaysHtml = keyTakeaways
    .map(
      (item) => `
      <li style="margin-bottom: 8px; color: #334155; font-size: 15px; line-height: 1.5;">
        ${item}
      </li>`
    )
    .join('');

  const rewardSectionHtml = promoCode
    ? `
    <!-- Secret Reader Drop Box -->
    <div style="margin-top: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #f97316; border-radius: 12px; padding: 18px 20px; text-align: center;">
      <div style="font-size: 12px; font-weight: 800; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
        🎁 Exclusive Reader Drop
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #7c2d12; margin-bottom: 8px;">
        Claim ${promoReward} in Kibo Climb!
      </div>
      <div style="display: inline-block; background-color: #ffffff; border: 1px solid #fed7aa; padding: 6px 14px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: 700; color: #ea580c; letter-spacing: 0.05em;">
        ${promoCode}
      </div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9a3412;">
        Redeem in the Spark Shop or Workshop inside the app.
      </p>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background-color: #ea580c; padding: 24px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                      🐾 Kibo Climb
                    </span>
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #ffedd5; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;">
                      Parent & Educator Learning Digest
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Featured Image (if available) -->
          <tr>
            <td style="padding: 0; background-color: #fff7ed; text-align: center;">
              <a href="${postUrl}" target="_blank" style="text-decoration: none; display: block;">
                <img src="${imageUrl}" alt="${title}" style="width: 100%; max-height: 280px; object-fit: cover; display: block; border-bottom: 1px solid #fed7aa;" />
              </a>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              
              <!-- Badges -->
              <div style="margin-bottom: 14px;">
                <span style="display: inline-block; background-color: #ffedd5; color: #c2410c; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.05em; margin-right: 6px;">
                  ${subjectName} • Tier ${tier}
                </span>
                <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                  ⏱️ ${readingTime} min read
                </span>
              </div>

              <!-- Title -->
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.01em;">
                <a href="${postUrl}" target="_blank" style="color: #0f172a; text-decoration: none;">
                  ${title}
                </a>
              </h1>

              <!-- Excerpt / Summary -->
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                ${excerpt}
              </p>

              <!-- Highlights / Takeaways -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 8px; letter-spacing: 0.05em;">
                  What's Inside This Guide:
                </div>
                <ul style="margin: 0; padding-left: 20px;">
                  ${takeawaysHtml}
                </ul>
              </div>

              ${rewardSectionHtml}

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px; margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${postUrl}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 16px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);">
                      Read Full Guide & Print Worksheets →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #64748b;">
                🐾 Kibo Climb — Master mental math, vocabulary, world trivia, and coding!
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                You are receiving this email because you subscribed to the Kibo Climb parent newsletter or enabled educational blog updates in your Parent Dashboard. Kibo Climb is strictly COPPA compliant and collects zero personal information from children.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                <a href="${unsubscribeUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">
                  Manage Notification Preferences / Unsubscribe
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
