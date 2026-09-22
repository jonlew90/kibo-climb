/**
 * Communications Service
 * Centralized service for sending parent emails, weekly reports, and milestone alerts via Firebase Cloud Functions + Resend.
 */

import { httpsCallable } from 'firebase/functions';
import { signInAnonymously } from 'firebase/auth';
import { functions, auth } from '../config/firebase';
import { generateWeeklyDigestData, formatWeeklyDigestText, formatWeeklyDigestHtml, getAppBaseUrl } from '../utils/weeklyDigest';
import { generateBlogEmailHtml } from '../utils/blogEmailTemplate';
import { SUBJECTS_CONFIG } from '../config/subjects';

class CommunicationsService {
  /**
   * Helper to wrap plain text / summary reports in a responsive HTML email layout
   */
  formatEmailHtml({ subject, message, childName = 'Student' }) {
    const formattedBody = (message || '')
      .split('\n\n')
      .map(paragraph => `<p style="margin: 0 0 14px 0; color: #334155; line-height: 1.6; font-size: 15px;">${paragraph.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 14px;" width="48">
                    <!-- Official Kibo Mascot Icon -->
                    <img src="https://kiboclimb.com/favicon.png" alt="Kibo Mascot" width="44" height="44" style="display: block; width: 44px; height: 44px; border-radius: 10px; border: 0;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">🐾 Kibo Climb Progress</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">${subject}</h2>
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                ${formattedBody}
              </div>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                You are receiving this update because email reports are enabled in your Kibo Climb Parent Zone.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} Kibo Climb. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Helper to check client-side rate limit and cooldown (prevents rapid clicking and abuse)
   * Enforces 15-second minimum interval between sends and max 5 sends per 10-minute window per device/account.
   */
  checkClientRateLimit() {
    try {
      const now = Date.now();
      const raw = localStorage.getItem('kibo_email_dispatch_log');
      const log = raw ? JSON.parse(raw) : { windowStart: now, timestamps: [] };

      // Prune timestamps older than 10 minutes
      const tenMinutesAgo = now - 10 * 60 * 1000;
      const recentTimestamps = (log.timestamps || []).filter(ts => ts > tenMinutesAgo);

      // Check minimum cooldown (15 seconds between dispatches)
      const lastSent = recentTimestamps[recentTimestamps.length - 1] || 0;
      if (now - lastSent < 15 * 1000) {
        const waitSec = Math.ceil((15000 - (now - lastSent)) / 1000);
        return {
          allowed: false,
          error: `Please wait ${waitSec}s before sending another email.`
        };
      }

      // Check max count in 10-minute window (max 5 per device)
      if (recentTimestamps.length >= 5) {
        return {
          allowed: false,
          error: 'Email limit reached (5 emails per 10 minutes). Please wait a few minutes before trying again.'
        };
      }

      return { allowed: true, recentTimestamps };
    } catch {
      return { allowed: true, recentTimestamps: [] };
    }
  }

  /**
   * Records a successful client email dispatch timestamp in localStorage.
   */
  recordClientDispatch() {
    try {
      const now = Date.now();
      const raw = localStorage.getItem('kibo_email_dispatch_log');
      const log = raw ? JSON.parse(raw) : { timestamps: [] };
      const tenMinutesAgo = now - 10 * 60 * 1000;
      const timestamps = (log.timestamps || []).filter(ts => ts > tenMinutesAgo);
      timestamps.push(now);
      localStorage.setItem('kibo_email_dispatch_log', JSON.stringify({ timestamps }));
    } catch (e) {
      console.warn('[CommunicationsService] Could not persist email dispatch log:', e);
    }
  }

  /**
   * Sends a parent notification / report via Firebase Cloud Functions (Resend backend).
   *
   * @param {Object} params
   * @param {string} params.email - Recipient email address
   * @param {string} params.subject - Email subject line
   * @param {string} params.message - Body text / summary report
   * @param {string} [params.htmlBody] - Optional raw custom HTML template
   * @param {string} [params.type='email'] - Type ('email', 'digest', 'alert')
   * @returns {Promise<Object>} - Resolves with { success: boolean, messageId?: string, error?: string }
   */
  async sendParentNotification({ email, subject, message, htmlBody, type = 'email' }) {
    if (!email) {
      console.warn('[CommunicationsService] Missing email address. Aborting notification.');
      return { success: false, error: 'Parent email address is required.' };
    }

    // Check client-side rate limit & cooldown
    const rateCheck = this.checkClientRateLimit();
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    const payloadHtml = htmlBody || this.formatEmailHtml({ subject, message });

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const sendEmailCallable = httpsCallable(functions, 'sendParentEmail');
      const response = await sendEmailCallable({
        to: email,
        subject: subject,
        textBody: message,
        htmlBody: payloadHtml,
        type: type,
      });

      const data = response.data || {};
      console.log('✅ [CommunicationsService] Email sent successfully:', data);

      // Record dispatch on success
      this.recordClientDispatch();

      return {
        success: true,
        messageId: data.id || `resend-${Date.now()}`,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [CommunicationsService] Failed to send email via Cloud Function:', {
        error,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        customData: error?.customData,
      });
      
      const errorMessage =
        (typeof error?.details === 'string' ? error.details : error?.details?.message) ||
        error?.message ||
        (error?.code ? `Firebase Functions error: ${error.code}` : 'Failed to dispatch email.');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sends a complete multi-subject weekly digest across all active subjects for a single child profile.
   * Includes the mascot icon in the subject line (e.g. like the favicon) and detailed played topics.
   *
   * @param {Object} params
   * @param {string} params.email - Parent recipient email
   * @param {Object} params.profile - Child profile object
   * @param {Object} [params.subjectsConfig=SUBJECTS_CONFIG] - Active subjects configuration
   * @param {string} [params.baseUrl] - Web app base URL
   * @returns {Promise<Object>}
   */
  async sendWeeklyDigest({ email, profile, subjectsConfig = SUBJECTS_CONFIG, baseUrl, isKiboClub, options = {} }) {
    if (!profile) {
      return { success: false, error: 'Child profile is required to generate weekly digest.' };
    }

    const mergedOptions = {
      ...options,
      ...(typeof isKiboClub === 'boolean' ? { isKiboClub } : {})
    };

    const childName = profile.username || profile.name || 'Kibo Climber';
    const digestData = generateWeeklyDigestData(profile, subjectsConfig, baseUrl, mergedOptions);
    
    // Subject line includes the Kibo Red Panda mascot icon 🐾 🏔️ and club tag if Kibo Club
    const clubBadge = digestData.isKiboClub ? ' 👑 [Kibo Club]' : '';
    const subjectLine = `🐾 🏔️ Kibo Weekly Progress for ${childName}${clubBadge} | Topics & Mastery Summary`;
    const textMessage = formatWeeklyDigestText({ childName, digestData });
    const htmlMessage = formatWeeklyDigestHtml({ childName, digestData });

    return this.sendParentNotification({
      email,
      subject: subjectLine,
      message: textMessage,
      htmlBody: htmlMessage,
      type: 'digest'
    });
  }

  /**
   * Sends personalized weekly progress digests per profile for ALL child profiles in an account.
   *
   * @param {Object} params
   * @param {string} params.email - Parent recipient email
   * @param {Array<Object>} params.profiles - Array of child profile objects
   * @param {Object} [params.subjectsConfig=SUBJECTS_CONFIG] - Active subjects configuration
   * @param {string} [params.baseUrl] - Web app base URL
   * @param {boolean} [params.isKiboClub] - Optional override for Kibo Club membership status
   * @param {Object} [params.options] - Optional custom options passed to generator
   * @returns {Promise<{ success: boolean, totalSent: number, results: Array<Object> }>}
   */
  async sendAllWeeklyDigests({ email, profiles = [], subjectsConfig = SUBJECTS_CONFIG, baseUrl, isKiboClub, options = {} }) {
    if (!email) {
      return { success: false, totalSent: 0, error: 'Parent email address is required.' };
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return { success: false, totalSent: 0, error: 'No profiles available to dispatch weekly digests.' };
    }

    const digestPromises = profiles.map(async (profile) => {
      const res = await this.sendWeeklyDigest({ email, profile, subjectsConfig, baseUrl, isKiboClub, options });
      return {
        profileId: profile.id,
        profileName: profile.name || profile.username || 'Child',
        ...res
      };
    });

    const results = await Promise.all(digestPromises);
    const successCount = results.filter(res => res.success).length;

    return {
      success: successCount > 0,
      totalSent: successCount,
      totalProfiles: profiles.length,
      results
    };
  }

  /**
   * Broadcasts a blog post email via Firebase Cloud Functions (Resend backend).
   *
   * @param {Object} params
   * @param {Object} params.post - Full post metadata object
   * @param {string} [params.customSubject] - Optional custom email subject
   * @param {boolean} [params.dryRun=false] - Dry run mode flag
   * @returns {Promise<Object>}
   */
  async broadcastBlogPost({ post, customSubject, dryRun = false }) {
    if (!post || !post.title || !post.slug) {
      return { success: false, error: 'Valid blog post object is required.' };
    }

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const htmlBody = generateBlogEmailHtml({ post });
      const emailSubject = customSubject || `🐾 New Kibo Guide: ${post.title}`;

      const broadcastCallable = httpsCallable(functions, 'sendParentEmail');
      const response = await broadcastCallable({
        type: 'blog_broadcast',
        post,
        subject: emailSubject,
        htmlBody,
        dryRun
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('❌ [CommunicationsService] Failed to broadcast blog post:', error);
      const errorMessage =
        (typeof error?.details === 'string' ? error.details : error?.details?.message) ||
        error?.message ||
        'Failed to dispatch blog broadcast.';

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Triggers a test push notification via OneSignal (callable Firebase Function).
   *
   * @param {Object} params
   * @param {string} params.profileId - Child profile ID
   * @param {string} params.childName - Child profile display name
   * @param {string} [params.type='streak'] - 'streak' | 'unclaimed_reward' | 'double_sparks'
   * @param {string} [params.customTitle] - Optional custom title override
   * @param {string} [params.customMessage] - Optional custom message override
   * @returns {Promise<Object>}
   */
  async triggerTestPushNotification({ profileId, childName, type = 'streak', customTitle, customMessage }) {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      let subscriptionId = null;
      if (auth.currentUser?.uid) {
        try {
          const { loginToOneSignal, initOneSignal } = await import('../config/onesignal.js');
          await initOneSignal();
          await loginToOneSignal(auth.currentUser.uid);
          const os = (typeof window !== 'undefined' && window.OneSignal);
          subscriptionId = os?.User?.PushSubscription?.id || null;
        } catch (osErr) {
          console.warn('[CommunicationsService] Could not auto-bind OneSignal uid:', osErr);
        }
      }

      const sendPushCallable = httpsCallable(functions, 'sendParentEmail');
      const response = await sendPushCallable({
        type: 'push_test',
        profileId,
        childName,
        pushType: type,
        subscriptionId,
        customTitle,
        customMessage
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('❌ [CommunicationsService] Failed to send test push notification:', error);
      const errorMessage =
        (typeof error?.details === 'string' ? error.details : error?.details?.message) ||
        error?.message ||
        'Failed to dispatch test push notification.';

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export const communicationsService = new CommunicationsService();
