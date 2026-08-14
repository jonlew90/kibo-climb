/**
 * Communications Service
 * Centralized service for sending parent emails, weekly reports, and milestone alerts via Firebase Cloud Functions + Resend.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

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
                    <span style="font-size: 28px;">🏔️</span>
                    <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Kibo Math Progress</h1>
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
                © ${new Date().getFullYear()} Kibo Climb Math. All rights reserved.
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
}

export const communicationsService = new CommunicationsService();
