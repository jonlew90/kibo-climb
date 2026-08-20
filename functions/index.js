const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { Resend } = require("resend");
const admin = require("firebase-admin");

const { getApps, initializeApp } = require("firebase-admin/app");

if (!getApps().length) {
  initializeApp();
}

/**
 * Callable function to send parent reports, alerts, and notifications via Resend.
 * Called from client via communicationsService.js.
 */
exports.sendParentEmail = onCall(
  {
    cors: true
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

/**
 * Callable function to validate a promo code.
 * Queries the 'promoCodes' collection in Firestore.
 * Returns the promo data if valid, throws an error if invalid, expired, or not active.
 */
exports.validatePromoCode = onCall(
  {
    cors: true
  },
  async (request) => {
    const { code } = request.data || {};

    if (!code || typeof code !== 'string') {
      throw new HttpsError('invalid-argument', 'Please enter a promo code.');
    }

    const normalizedCode = code.trim().replace(/^#/, '').toUpperCase();

    try {
      const db = admin.firestore();
      const promoRef = db.collection('promoCodes').doc(normalizedCode);
      const promoSnap = await promoRef.get();

      if (!promoSnap.exists) {
        throw new HttpsError('not-found', 'Invalid promo code. Check your spelling and try again.');
      }

      const promoData = promoSnap.data();
      const now = Date.now();

      if (promoData.availableFrom && now < new Date(promoData.availableFrom).getTime()) {
        throw new HttpsError('failed-precondition', 'This promo code is not active yet. Check back soon!');
      }

      if (promoData.expiresAt && now > new Date(promoData.expiresAt).getTime()) {
        throw new HttpsError('failed-precondition', 'This promo code has expired.');
      }

      return promoData;
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('Error validating promo code:', error);
      throw new HttpsError('internal', 'An error occurred while validating the promo code.');
    }
  }
);

/**
 * Callable function to assign a user to a weekly cohort.
 * Cohorts are buckets of up to 30 players.
 */
exports.joinWeeklyLeague = onCall(
  {
    cors: true
  },
  async (request) => {
    const { profileId, weekStr, subject } = request.data || {};
    const uid = request.auth ? request.auth.uid : 'anonymous';

    if (!profileId || !weekStr || !subject) {
      throw new HttpsError('invalid-argument', 'Missing required fields.');
    }

    const db = admin.firestore();
    const documentId = `${uid}_${profileId}`;
    const userStatsRef = db.collection('weekly_stats').doc(documentId);

    try {
      return await db.runTransaction(async (transaction) => {
        const userStatsDoc = await transaction.get(userStatsRef);
        let currentCohortId = null;

        if (userStatsDoc.exists) {
          const data = userStatsDoc.data();
          if (data.weekStr === weekStr && data.subject === subject && data.cohortId) {
            return { cohortId: data.cohortId };
          }
        }

        // Need to assign a new cohort
        const leagueRef = db.collection('weekly_leagues').doc(`${weekStr}_${subject}`);
        const leagueDoc = await transaction.get(leagueRef);

        let activeBucket = 1;
        let bucketCount = 0;

        if (leagueDoc.exists) {
          const data = leagueDoc.data();
          activeBucket = data.activeBucket || 1;
          bucketCount = data.bucketCount || 0;
        }

        if (bucketCount >= 30) {
          activeBucket += 1;
          bucketCount = 0;
        }

        const newCohortId = `league_${weekStr}_${subject}_bucket_${activeBucket}`;

        // Update the league tracker
        transaction.set(leagueRef, {
          activeBucket: activeBucket,
          bucketCount: bucketCount + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update the user's assigned cohort
        transaction.set(userStatsRef, {
          uid: uid,
          profileId: profileId,
          subject: subject,
          weekStr: weekStr,
          cohortId: newCohortId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { cohortId: newCohortId };
      });
    } catch (error) {
      console.error('Error assigning weekly cohort:', error);
      throw new HttpsError('internal', 'An error occurred while joining the weekly league.');
    }
  }
);
