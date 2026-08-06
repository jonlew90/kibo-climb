/**
 * Communications Service
 * Acts as the centralized hub for sending outbound communications (Emails, Push Notifications, SMS) to parents.
 * Currently uses a mock implementation (Option A) that logs to the console and simulates a successful delivery.
 * In the future, this can be integrated with services like EmailJS, SendGrid, or a real backend API.
 */

class CommunicationsService {
  /**
   * Sends a notification to the parent.
   *
   * @param {Object} params
   * @param {string} params.email - The recipient's email address.
   * @param {string} params.subject - The subject line or notification title.
   * @param {string} params.message - The body of the notification/email.
   * @param {string} params.type - The type of notification ('email', 'push', 'digest', 'alert').
   * @returns {Promise<Object>} - Resolves with success state.
   */
  async sendParentNotification({ email, subject, message, type = 'email' }) {
    if (!email) {
      console.warn('[CommunicationsService] Missing email address. Aborting notification.');
      return { success: false, error: 'Email address is required.' };
    }

    console.log('--------------------------------------------------');
    console.log(`📡 [CommunicationsService] Sending ${type.toUpperCase()}`);
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: \n${message}`);
    console.log('--------------------------------------------------');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock success response
    return {
      success: true,
      messageId: `mock-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString()
    };
  }
}

export const communicationsService = new CommunicationsService();
