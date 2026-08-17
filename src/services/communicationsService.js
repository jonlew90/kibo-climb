/**
 * Communications Service
 * Centralized service for sending parent emails, weekly reports, and milestone alerts via Firebase Cloud Functions + Resend.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { generateWeeklyDigestData, formatWeeklyDigestText, formatWeeklyDigestHtml, getAppBaseUrl } from '../utils/weeklyDigest';
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
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background-color: #f97316; border-radius: 10px; font-size: 24px;">
                      🐾
                    </div>
                    <h1 style="margin: 10px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Kibo Climb Progress</h1>
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

    const payloadHtml = htmlBody || this.formatEmailHtml({ subject, message });

    console.log(`📡 [CommunicationsService] Invoking sendParentEmail Cloud Function for: ${email}`);

    try {
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

      return {
        success: true,
        messageId: data.id || `resend-${Date.now()}`,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [CommunicationsService] Failed to send email via Cloud Function:', error);
      
      const errorMessage = error?.message || error?.details || 'Failed to dispatch email.';
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
  async sendWeeklyDigest({ email, profile, subjectsConfig = SUBJECTS_CONFIG, baseUrl }) {
    if (!profile) {
      return { success: false, error: 'Child profile is required to generate weekly digest.' };
    }

    const childName = profile.username || profile.name || 'Kibo Climber';
    const digestData = generateWeeklyDigestData(profile, subjectsConfig, baseUrl);
    
    // Subject line includes the Kibo Red Panda mascot icon 🐾 🏔️
    const subjectLine = `🐾 🏔️ Kibo Weekly Progress for ${childName} | Topics & Mastery Summary`;
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
   * @returns {Promise<{ success: boolean, totalSent: number, results: Array<Object> }>}
   */
  async sendAllWeeklyDigests({ email, profiles = [], subjectsConfig = SUBJECTS_CONFIG, baseUrl }) {
    if (!email) {
      return { success: false, totalSent: 0, error: 'Parent email address is required.' };
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return { success: false, totalSent: 0, error: 'No profiles available to dispatch weekly digests.' };
    }

    const results = [];
    let successCount = 0;

    for (const profile of profiles) {
      const res = await this.sendWeeklyDigest({ email, profile, subjectsConfig, baseUrl });
      results.push({
        profileId: profile.id,
        profileName: profile.name || profile.username || 'Child',
        ...res
      });
      if (res.success) {
        successCount++;
      }
    }

    return {
      success: successCount > 0,
      totalSent: successCount,
      totalProfiles: profiles.length,
      results
    };
  }
}

export const communicationsService = new CommunicationsService();
