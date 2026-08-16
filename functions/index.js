const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { Resend } = require("resend");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Callable function to send parent reports, alerts, and notifications via Resend.
 * Called from client via communicationsService.js.
 */
exports.sendParentEmail = onCall(
  {
    cors: true,
    invoker: "public"
  },
  async (request) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in environment/secrets.");
      throw new HttpsError(
        "failed-precondition",
        "RESEND_API_KEY is not configured in backend environment."
      );
    }

    const resend = new Resend(apiKey);
    const { to, subject, htmlBody, textBody } = request.data || {};

    if (!to || !subject || (!htmlBody && !textBody)) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: 'to', 'subject', and email content ('htmlBody' or 'textBody')."
      );
    }

    const senderEmail = process.env.SENDER_EMAIL || "Kibo Climb <onboarding@resend.dev>";

    try {
      const response = await resend.emails.send({
        from: senderEmail,
        to: [to],
        subject: subject,
        html: htmlBody,
        text: textBody,
      });

      if (response.error) {
        console.error("Resend API returned an error:", response.error);
        throw new HttpsError("internal", response.error.message || "Failed to send email.");
      }

      return {
        success: true,
        id: response.data ? response.data.id : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Resend delivery failed:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", error.message || "Failed to send email via Resend.");
    }
  }
);
