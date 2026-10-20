const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Resend } = require("resend");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const { getApps, initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

if (!getApps().length) {
  initializeApp({
    projectId: process.env.GCLOUD_PROJECT || "kibo-climb"
  });
}

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

// Pre-configured Stripe Price IDs (set in Firebase secret manager)
const STRIPE_PRICE_KIBO_CLUB_SUB         = defineSecret('STRIPE_PRICE_KIBO_CLUB_SUB');
const STRIPE_PRICE_KIBO_CLUB_SUB_ANNUAL  = defineSecret('STRIPE_PRICE_KIBO_CLUB_SUB_ANNUAL');
const STRIPE_PRICE_KIBO_CLUB_FAMILY      = defineSecret('STRIPE_PRICE_KIBO_CLUB_FAMILY');
const STRIPE_PRICE_KIBO_CLUB_FAMILY_ANNUAL = defineSecret('STRIPE_PRICE_KIBO_CLUB_FAMILY_ANNUAL');

/**
 * Sanitizes HTML email content to prevent script injection and dangerous tags.
 */
function sanitizeEmailHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript:/gi, "blocked-javascript:");
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Callable function to send parent reports, alerts, and notifications via Resend.
 * Called from client via communicationsService.js.
 */
exports.sendParentEmail = onCall(
  {
    cors: true,
    secrets: ["RESEND_API_KEY", "ONESIGNAL_REST_API_KEY"]
  },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "Authentication required to send notifications.");
    }

    const uid = request.auth.uid;
    const db = getFirestore();
    const auth = getAuth();
    const { to, subject, htmlBody, textBody, type, post, dryRun, profileId, childName = "Kibo Climber", pushType = "streak", customTitle, customMessage } = request.data || {};

    // For push_test type, dispatch OneSignal push test
    if (type === "push_test") {
      const { subscriptionId } = request.data || {};
      let title = customTitle;
      let message = customMessage;
      let actionUrl = `https://kiboclimb.com/?action=play&profile=${encodeURIComponent(profileId || '')}&utm_source=push_notification&utm_medium=push&utm_campaign=test_push`;

      if (!title || !message) {
        switch (pushType) {
          case "unclaimed_reward":
          case "unclaimed_quest":
            title = `🎁 Unclaimed Quest Sparks for ${childName}!`;
            message = `${childName} has completed daily quests with unclaimed Sparks! Tap to collect before midnight.`;
            actionUrl = `https://kiboclimb.com/?action=quests&profile=${encodeURIComponent(profileId || '')}&utm_source=push_notification&utm_medium=push&utm_campaign=unclaimed_quests`;
            break;
          case "double_sparks":
            title = `⚡ Double Sparks Active on Mount Kibo!`;
            message = `Earn 2x Sparks on all climbs today! Help ${childName} climb the mountain leaderboard.`;
            actionUrl = `https://kiboclimb.com/?action=play&profile=${encodeURIComponent(profileId || '')}&utm_source=push_notification&utm_medium=push&utm_campaign=double_sparks_event`;
            break;
          case "streak":
          default:
            title = `🏔️ Keep ${childName}'s Daily Streak Alive!`;
            message = `Kibo the Red Panda is waiting! Complete today's climb to protect your flame 🔥`;
            actionUrl = `https://kiboclimb.com/?action=play&profile=${encodeURIComponent(profileId || '')}&utm_source=push_notification&utm_medium=push&utm_campaign=daily_streak`;
            break;
        }
      }

      const pushResult = await dispatchOneSignalPush({
        uids: [uid],
        subscriptionIds: subscriptionId ? [subscriptionId] : [],
        title,
        message,
        url: actionUrl,
        data: { profileId, notificationType: pushType },
        apiKey: process.env.ONESIGNAL_REST_API_KEY
      });

      if (!pushResult.success) {
        throw new HttpsError("internal", pushResult.error || "Failed to dispatch push.");
      }

      return {
        success: true,
        notificationId: pushResult.id,
        title,
        message,
        recipients: pushResult.recipients
      };
    }

    // For delete_profile type, permanently prune child profile from user's Firestore doc and any orphaned docs
    if (type === "delete_profile") {
      const { profileId, childName } = request.data || {};
      if (!profileId && !childName) {
        throw new HttpsError("invalid-argument", "Must specify profileId or childName to delete.");
      }

      const userEmail = request.auth.token?.email;
      let deletedCount = 0;

      // 1. Delete from caller's direct user doc
      const userDocRef = db.collection("users").doc(uid);
      const userDocSnap = await userDocRef.get();
      if (userDocSnap.exists) {
        const data = userDocSnap.data() || {};
        const profiles = data.profiles || {};
        const updates = {};

        for (const [pid, prof] of Object.entries(profiles)) {
          const pName = (prof.username || prof.name || '').trim().toLowerCase();
          if ((profileId && pid === profileId) || (childName && pName === childName.trim().toLowerCase())) {
            updates[`profiles.${pid}`] = FieldValue.delete();
            deletedCount++;
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = FieldValue.serverTimestamp();
          await userDocRef.update(updates);
        }
      }

      // 2. Also search for any orphaned user docs associated with the caller's email
      if (userEmail && EMAIL_REGEX.test(userEmail)) {
        const normalizedEmail = userEmail.trim().toLowerCase();
        const emailQuerySnap = await db.collection("users").where("email", "==", normalizedEmail).get();
        for (const docSnap of emailQuerySnap.docs) {
          if (docSnap.id === uid) continue;
          const data = docSnap.data() || {};
          const profiles = data.profiles || {};
          const updates = {};

          for (const [pid, prof] of Object.entries(profiles)) {
            const pName = (prof.username || prof.name || '').trim().toLowerCase();
            if ((profileId && pid === profileId) || (childName && pName === childName.trim().toLowerCase())) {
              updates[`profiles.${pid}`] = FieldValue.delete();
              deletedCount++;
            }
          }

          if (Object.keys(updates).length > 0) {
            updates.updatedAt = FieldValue.serverTimestamp();
            await docSnap.ref.update(updates);
          }
        }
      }

      return { success: true, deletedCount };
    }

    // For blog_broadcast type, handle subscriber broadcast
    if (type === "blog_broadcast") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey && !dryRun) {
        throw new HttpsError("failed-precondition", "RESEND_API_KEY is not configured.");
      }

      if (!post || !post.title || !post.slug) {
        throw new HttpsError("invalid-argument", "Valid blog post object is required.");
      }

      const recipientEmails = new Set();
      const { recipients: requestedRecipients, testRecipient } = request.data || {};

      if (Array.isArray(requestedRecipients) && requestedRecipients.length > 0) {
        requestedRecipients.forEach(r => {
          if (typeof r === "string" && r.includes("@")) {
            recipientEmails.add(r.trim().toLowerCase());
          }
        });
      } else if (testRecipient && typeof testRecipient === "string" && testRecipient.includes("@")) {
        recipientEmails.add(testRecipient.trim().toLowerCase());
      } else {
        let subErr = null;
        let userErr = null;

        try {
          const subSnap = await db.collection("newsletter_subscribers").get();
          subSnap.forEach((doc) => {
            const data = doc.data();
            if (data.email && typeof data.email === "string" && !data.unsubscribed) {
              const clean = data.email.trim().toLowerCase();
              if (clean.includes("@")) recipientEmails.add(clean);
            }
          });
        } catch (err) {
          subErr = err;
          console.warn("[sendParentEmail:blog_broadcast] Error fetching newsletter_subscribers:", err);
        }

        try {
          const userSnap = await db.collection("users").get();
          for (const doc of userSnap.docs) {
            const data = doc.data() || {};
            const parentEmail = data.email || data.parentEmail;
            if (parentEmail && typeof parentEmail === "string") {
              const clean = parentEmail.trim().toLowerCase();
              const notifSettings = data.notificationSettings || data.notifPrefs || {};
              const isEnabled = notifSettings.blogNewsletterEnabled !== false && !notifSettings.unsubscribedAll;
              if (isEnabled && clean.includes("@")) {
                recipientEmails.add(clean);
              }
            }
          }
        } catch (err) {
          userErr = err;
          console.warn("[sendParentEmail:blog_broadcast] Error fetching users:", err);
        }

        if (recipientEmails.size === 0 && (subErr || userErr)) {
          const primaryErr = subErr || userErr;
          const msg = primaryErr.message || String(primaryErr);
          if (msg.includes("PERMISSION_DENIED") || primaryErr.code === 7) {
            throw new HttpsError(
              "permission-denied",
              "Firestore permission denied. In Google Cloud IAM, grant 'Cloud Datastore User' role to 171658556844-compute@developer.gserviceaccount.com."
            );
          }
          throw new HttpsError("internal", `Database error fetching subscribers: ${msg}`);
        }
      }

      const recipients = Array.from(recipientEmails);
      const emailSubject = subject || `🐾 New Kibo Guide: ${post.title}`;

      if (dryRun) {
        return {
          success: true,
          dryRun: true,
          recipientCount: recipients.length,
          recipientsSample: recipients.slice(0, 5),
          subject: emailSubject,
          postSlug: post.slug
        };
      }

      if (recipients.length === 0) {
        return {
          success: true,
          sentCount: 0,
          message: "No active subscribers found."
        };
      }

      const resend = new Resend(apiKey);
      const senderEmail = (process.env.SENDER_EMAIL && !process.env.SENDER_EMAIL.includes("hello@kiboclimb.com"))
        ? process.env.SENDER_EMAIL
        : "Kibo Climb <noreply@kiboclimb.com>";

      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const sendRes = await resend.emails.send({
            from: senderEmail,
            to: [recipient],
            subject: emailSubject,
            html: htmlBody
          });
          if (sendRes.error) {
            failedCount++;
            console.error(`[sendParentEmail:blog_broadcast] Failed to send to ${recipient}:`, sendRes.error);
          } else {
            sentCount++;
          }
        } catch (err) {
          failedCount++;
          console.error(`[sendParentEmail:blog_broadcast] Error sending to ${recipient}:`, err);
        }
      }

      try {
        await db.collection("newsletter_broadcasts").add({
          postSlug: post.slug,
          postTitle: post.title,
          recipientCount: recipients.length,
          sentCount,
          failedCount,
          sentBy: uid,
          sentAt: FieldValue.serverTimestamp()
        });
      } catch (logErr) {
        console.warn("[sendParentEmail:blog_broadcast] Failed to record broadcast log:", logErr);
      }

      return {
        success: true,
        sentCount,
        failedCount,
        totalRecipients: recipients.length
      };
    }

    // Enforce per-user rate limit (maximum 5 emails per 10-minute window) for single emails
    try {
      const rateLimitRef = db.collection("email_rate_limits").doc(uid);
      const now = Date.now();
      const WINDOW_MS = 10 * 60 * 1000;
      const MAX_EMAILS_PER_WINDOW = 5;

      await db.runTransaction(async (transaction) => {
        const docSnap = await transaction.get(rateLimitRef);
        if (docSnap.exists) {
          const data = docSnap.data();
          const windowStart = data.windowStart || 0;
          const count = data.count || 0;

          if (now - windowStart < WINDOW_MS) {
            if (count >= MAX_EMAILS_PER_WINDOW) {
              throw new HttpsError(
                "resource-exhausted",
                "Too many notification requests. Please wait a few minutes before sending another update."
              );
            }
            transaction.update(rateLimitRef, {
              count: count + 1,
              lastSentAt: FieldValue.serverTimestamp()
            });
          } else {
            transaction.set(rateLimitRef, {
              windowStart: now,
              count: 1,
              lastSentAt: FieldValue.serverTimestamp()
            });
          }
        } else {
          transaction.set(rateLimitRef, {
            windowStart: now,
            count: 1,
            lastSentAt: FieldValue.serverTimestamp()
          });
        }
      });
    } catch (rateLimitErr) {
      if (rateLimitErr instanceof HttpsError) {
        throw rateLimitErr;
      }
      console.warn("Could not check/update email rate limit in Firestore:", rateLimitErr.message || rateLimitErr);
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in environment/secrets.");
      throw new HttpsError(
        "failed-precondition",
        "RESEND_API_KEY is not configured in backend environment."
      );
    }

    const resend = new Resend(apiKey);

    if (!to || typeof to !== "string" || !EMAIL_REGEX.test(to.trim()) || to.length > 254) {
      throw new HttpsError("invalid-argument", "A valid recipient email address is required.");
    }

    if (!subject || typeof subject !== "string") {
      throw new HttpsError("invalid-argument", "A valid subject line is required.");
    }

    // Strip carriage returns and line feeds from subject to prevent SMTP header injection
    const cleanSubject = subject.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
    const cleanTo = to.trim();

    if (!htmlBody && !textBody) {
      throw new HttpsError("invalid-argument", "Email body content is required.");
    }

    const cleanHtml = htmlBody ? sanitizeEmailHtml(String(htmlBody)).slice(0, 150000) : undefined;
    const cleanText = textBody ? String(textBody).slice(0, 50000) : undefined;

    const senderEmail = (process.env.SENDER_EMAIL && !process.env.SENDER_EMAIL.includes('hello@kiboclimb.com'))
      ? process.env.SENDER_EMAIL
      : "Kibo Climb <noreply@kiboclimb.com>";

    try {
      const response = await resend.emails.send({
        from: senderEmail,
        to: [cleanTo],
        subject: cleanSubject,
        html: cleanHtml,
        text: cleanText,
      });

      if (response.error) {
        console.error("Resend API returned an error:", response.error);
        throw new HttpsError("internal", response.error.message || "Failed to send email.", response.error);
      }

      return {
        success: true,
        id: response.data ? response.data.id : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Resend delivery failed:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", error.message || "Failed to send email via Resend.", { message: error.message });
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
      const db = getFirestore();
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
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required to join leagues.');
    }
    const { profileId, weekStr, subject } = request.data || {};
    const uid = request.auth.uid;

    if (!profileId || typeof profileId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(profileId)) {
      throw new HttpsError('invalid-argument', 'Invalid profileId.');
    }
    if (!weekStr || typeof weekStr !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(weekStr)) {
      throw new HttpsError('invalid-argument', 'Invalid week identifier.');
    }
    if (!subject || typeof subject !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(subject)) {
      throw new HttpsError('invalid-argument', 'Invalid subject identifier.');
    }

    const db = getFirestore();
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
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Update the user's assigned cohort
        transaction.set(userStatsRef, {
          uid: uid,
          profileId: profileId,
          subject: subject,
          weekStr: weekStr,
          cohortId: newCohortId,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return { cohortId: newCohortId };
      });
    } catch (error) {
      console.error('Error assigning weekly cohort:', error);
      throw new HttpsError('internal', 'An error occurred while joining the weekly league.');
    }
  }
);

/**
 * Callable function to process a referral when a user links their account.
 * Creates a pending reward for the referrer.
 */
exports.processReferralLinking = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }
    const { referrerId, newUserId } = request.data || {};
    if (!referrerId || typeof referrerId !== 'string' || !newUserId || typeof newUserId !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing or invalid referrer or new user ID.');
    }
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(referrerId) || !/^[a-zA-Z0-9_-]{1,128}$/.test(newUserId)) {
      throw new HttpsError('invalid-argument', 'Invalid user ID format.');
    }
    if (referrerId === newUserId) {
       throw new HttpsError('invalid-argument', 'Cannot refer yourself.');
    }
    if (request.auth.uid !== newUserId) {
       throw new HttpsError('permission-denied', 'You can only register referrals for your own account.');
    }

    try {
      const rewardRef = getFirestore().collection('users').doc(referrerId).collection('pendingRewards').doc(newUserId);
      await rewardRef.set({
        referredUserId: newUserId,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        type: 'referral_bonus'
      });
      return { success: true };
    } catch (error) {
      console.error('Error processing referral:', error);
      throw new HttpsError('internal', 'Failed to process referral.', error);
    }
  }
);

/**
 * Callable function to claim and reserve a unique username.
 */
exports.claimUsername = onCall(
  { cors: true },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required to claim a username.');
    }
    const { username, profileId, friendCode } = request.data || {};
    const uid = request.auth.uid;

    if (!username || typeof username !== 'string') {
      throw new HttpsError('invalid-argument', 'Please provide a valid username.');
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      throw new HttpsError('invalid-argument', 'Username must be 3-20 alphanumeric characters or underscores.');
    }

    const normalized = trimmed.toLowerCase();
    const cleanCode = (friendCode || '').trim().toUpperCase();
    const db = getFirestore();
    const usernameRef = db.collection('usernames').doc(normalized);
    const codeRef = cleanCode ? db.collection('friend_codes').doc(cleanCode) : null;

    try {
      return await db.runTransaction(async (transaction) => {
        const docSnap = await transaction.get(usernameRef);
        if (docSnap.exists) {
          const data = docSnap.data();
          // If owned by different UID and profile, reject
          if (data.uid && data.uid !== uid) {
            throw new HttpsError('already-exists', 'This username is already taken. Please choose another one.');
          }
        }

        if (codeRef) {
          const codeSnap = await transaction.get(codeRef);
          if (codeSnap.exists) {
            const codeData = codeSnap.data();
            if (codeData.uid && codeData.uid !== uid) {
              throw new HttpsError('already-exists', 'This climber code is already in use. A new one will be generated.');
            }
          }
        }

        const usernamePayload = {
          username: trimmed,
          normalized,
          uid,
          profileId: profileId || 'default_child',
          claimedAt: FieldValue.serverTimestamp()
        };
        if (cleanCode) usernamePayload.friendCode = cleanCode;

        transaction.set(usernameRef, usernamePayload, { merge: true });

        if (codeRef) {
          transaction.set(codeRef, {
            friendCode: cleanCode,
            username: trimmed,
            normalized,
            uid,
            profileId: profileId || 'default_child',
            claimedAt: FieldValue.serverTimestamp()
          }, { merge: true });
        }

        return { success: true, username: trimmed, friendCode: cleanCode };
      });
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('Error claiming username:', error);
      throw new HttpsError('internal', 'Failed to claim username.', error);
    }
  }
);

/**
 * Callable function to search for climbers by username.
 */
exports.searchUsername = onCall(
  { cors: true },
  async (request) => {
    const { query } = request.data || {};
    if (!query || typeof query !== 'string') {
      throw new HttpsError('invalid-argument', 'Please enter a search query.');
    }

    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) {
      return { results: [] };
    }

    const db = getFirestore();
    const cleanCode = query.trim().toUpperCase();
    try {
      // COPPA Safe: Exact match lookup by Climber Code only
      const snapshot = await db.collection('usernames')
        .where('friendCode', '==', cleanCode)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { results: [] };
      }

      const results = [];
      for (const docSnap of snapshot.docs) {
        const uData = docSnap.data();
        const friendUid = uData.uid;
        const friendProfileId = uData.profileId || 'default_child';
        const friendDocId = `${friendUid}_${friendProfileId}_math`;

        let score = 1000;
        let equipped = [];
        let subjectsMastered = 5;

        // Fetch their leaderboard document for extra stats if available
        try {
          const lbDoc = await db.collection('leaderboard').doc(friendDocId).get();
          if (lbDoc.exists) {
            const lbData = lbDoc.data();
            score = lbData.score || 1000;
            equipped = lbData.equipped || [];
            subjectsMastered = lbData.subjectsMastered || 5;
          }
        } catch (e) {
          // Fallback gracefully
        }

        results.push({
          id: `${friendUid}_${friendProfileId}`,
          uid: friendUid,
          profileId: friendProfileId,
          username: uData.username || docSnap.id,
          name: uData.username || docSnap.id,
          score,
          equipped,
          subjectsMastered
        });
      }

      return { results };
    } catch (error) {
      console.error('Error searching username:', error);
      throw new HttpsError('internal', 'Search failed.', error);
    }
  }
);

/**
 * Callable function to retrieve score details for a list of friends.
 */
exports.getFriendScores = onCall(
  { cors: true },
  async (request) => {
    const { friendIds, subject = 'math' } = request.data || {};
    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      return { standings: [] };
    }

    const safeFriendIds = friendIds.slice(0, 25);
    const db = getFirestore();
    const standings = [];

    try {
      for (const fId of safeFriendIds) {
        // ID is expected in the format uid_profileId or just raw ID
        const parts = fId.split('_');
        let docId = `${fId}_${subject}`;
        if (parts.length === 1) {
          docId = `${fId}_default_child_${subject}`;
        }

        try {
          const lbDoc = await db.collection('leaderboard').doc(docId).get();
          if (lbDoc.exists) {
            const data = lbDoc.data();
            standings.push({
              id: fId,
              uid: data.uid || parts[0],
              profileId: data.profileId || parts[1] || 'default_child',
              name: data.name || 'Climber Friend',
              score: Number(data.score) || 1000,
              equipped: data.equipped || [],
              subjectsMastered: data.subjectsMastered || 5,
              subject
            });
          }
        } catch (e) {
          console.warn('Could not fetch leaderboard doc for friend:', fId);
        }
      }

      return { standings };
    } catch (error) {
      console.error('Error fetching friend scores:', error);
      throw new HttpsError('internal', 'Could not load friend scores.', error);
    }
  }
);


/**
 * Callable function to create a Stripe Checkout Session.
 * Uses pre-configured Stripe Price IDs instead of ad-hoc price_data.
 */
exports.createStripeCheckoutSession = onCall(
  {
    cors: true,
    secrets: [
      STRIPE_SECRET_KEY,
      STRIPE_PRICE_KIBO_CLUB_SUB,
      STRIPE_PRICE_KIBO_CLUB_SUB_ANNUAL,
      STRIPE_PRICE_KIBO_CLUB_FAMILY,
      STRIPE_PRICE_KIBO_CLUB_FAMILY_ANNUAL,
    ]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { itemId, isSubscription, profileId, successUrl, cancelUrl } = request.data || {};

    if (!itemId) {
      throw new HttpsError('invalid-argument', 'Missing required item ID.');
    }

    const stripeKey = STRIPE_SECRET_KEY.value();
    if (!stripeKey) {
      throw new HttpsError('internal', 'Stripe secret key not configured.');
    }

    const stripeClient = require('stripe')(stripeKey);
    const uid = request.auth.uid;
    const db = getFirestore();

    // Reuse existing Stripe Customer ID if available (prepopulates saved card for returning users)
    let existingCustomerId = null;
    try {
      const userSnap = await db.collection('users').doc(uid).get();
      if (userSnap.exists) {
        existingCustomerId = userSnap.data()?.stripeCustomerId || null;
      }
    } catch (e) {
      console.warn('Could not fetch existing stripeCustomerId:', e.message);
    }

    // Map our internal plan IDs to pre-configured Stripe Price IDs
    const PRICE_ID_MAP = {
      kibo_club_sub:           STRIPE_PRICE_KIBO_CLUB_SUB.value(),
      kibo_club_sub_annual:    STRIPE_PRICE_KIBO_CLUB_SUB_ANNUAL.value(),
      kibo_club_family:        STRIPE_PRICE_KIBO_CLUB_FAMILY.value(),
      kibo_club_family_annual: STRIPE_PRICE_KIBO_CLUB_FAMILY_ANNUAL.value(),
    };

    const priceId = PRICE_ID_MAP[itemId];
    const isKnownSubscription = !!priceId;

    // For one-time sparks purchases, price_data is still needed (no pre-configured price)
    // Synchronized with itemsCatalog.js SPARKS_PACKAGES ($2.49, $3.99, $7.99, $19.99)
    const sparksPriceMap = {
      sparks_pack_1: 249,
      sparks_pack_2: 399,
      sparks_pack_3: 799,
      sparks_pack_4: 1999
    };
    const sparksAmountCents = sparksPriceMap[itemId];

    if (!isKnownSubscription && !sparksAmountCents) {
      throw new HttpsError('invalid-argument', `Unknown item or plan: ${itemId}`);
    }

    // Check for active recurring seasonal sale discounts (Back to School, Cyber Week, New Year, Summer)
    // Synchronized with itemsCatalog.js REAL_MONEY_SALE_EVENTS
    const getActiveSeasonalDiscount = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const nowTime = now.getTime();

      const events = [
        {
          id: 'back_to_school_sale',
          name: 'Back to School Sale',
          startMonth: 8, startDay: 15, endMonth: 9, endDay: 15,
          discounts: { kibo_club_sub_annual: 25, kibo_club_family_annual: 25 }
        },
        {
          id: 'black_friday_sale',
          name: 'Cyber Week Mega Sale',
          startMonth: 11, startDay: 20, endMonth: 12, endDay: 2,
          discounts: { kibo_club_sub_annual: 33, kibo_club_family_annual: 33 }
        },
        {
          id: 'new_year_sale',
          name: 'New Year Learning Kickoff',
          startMonth: 12, startDay: 26, endMonth: 1, endDay: 15,
          discounts: { kibo_club_sub_annual: 25, kibo_club_family_annual: 25 }
        },
        {
          id: 'summer_kickoff_sale',
          name: 'Summer Learning Kickoff',
          startMonth: 6, startDay: 1, endMonth: 6, endDay: 30,
          discounts: { kibo_club_sub_annual: 20, kibo_club_family_annual: 20 }
        }
      ];

      for (const event of events) {
        for (const yr of [currentYear - 1, currentYear, currentYear + 1]) {
          const isSpanning = event.startMonth > event.endMonth;
          const startYear = yr;
          const endYear = isSpanning ? yr + 1 : yr;
          const start = new Date(Date.UTC(startYear, event.startMonth - 1, event.startDay, 0, 0, 0));
          const end = new Date(Date.UTC(endYear, event.endMonth - 1, event.endDay, 23, 59, 59, 999));

          if (nowTime >= start.getTime() && nowTime <= end.getTime()) {
            const discountPct = event.discounts[itemId];
            if (discountPct) {
              return { eventId: event.id, eventName: event.name, discountPct };
            }
          }
        }
      }
      return null;
    };

    const activeDiscount = isKnownSubscription ? getActiveSeasonalDiscount() : null;

    try {
      const sessionConfig = {
        mode: isKnownSubscription ? 'subscription' : 'payment',
        line_items: isKnownSubscription
          ? [{ price: priceId, quantity: 1 }]
          : [{
              price_data: {
                currency: 'usd',
                product_data: { name: 'Kibo Sparks', metadata: { itemId } },
                unit_amount: sparksAmountCents,
              },
              quantity: 1,
            }],
        success_url: successUrl || 'https://kiboclimb.com/?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl || 'https://kiboclimb.com/',
        client_reference_id: uid,
        metadata: {
          uid,
          profileId: profileId || '',
          itemId,
          isSubscription: isKnownSubscription ? 'true' : 'false',
        },
      };

      // Automatically apply active seasonal sale discount if running
      if (activeDiscount) {
        try {
          const couponId = `AUTO_${activeDiscount.eventId.toUpperCase()}_${activeDiscount.discountPct}PCT`;
          // Create coupon idempotently in Stripe
          try {
            await stripeClient.coupons.create({
              id: couponId,
              name: `${activeDiscount.eventName} (${activeDiscount.discountPct}% Off)`,
              percent_off: activeDiscount.discountPct,
              duration: 'once', // Discounts initial billing period (1 year), then auto-renews at catalog price
            });
          } catch (couponErr) {
            // If already exists, ignore 400 error
            if (couponErr.code !== 'resource_already_exists') {
              console.warn('Coupon creation notice:', couponErr.message);
            }
          }

          sessionConfig.discounts = [{ coupon: couponId }];
        } catch (discErr) {
          console.error('Could not attach automatic seasonal discount:', discErr);
          sessionConfig.allow_promotion_codes = true;
        }
      } else {
        // Allow manual promo codes when no automatic event coupon is attached
        sessionConfig.allow_promotion_codes = true;
      }

      // Reuse existing Customer or always create one (so the Customer ID can be persisted)
      if (existingCustomerId) {
        sessionConfig.customer = existingCustomerId;
      } else {
        sessionConfig.customer_creation = 'always';
      }

      // Embed uid + profileId on the Stripe Subscription object for webhook routing
      if (isKnownSubscription) {
        sessionConfig.subscription_data = {
          metadata: { uid, profileId: profileId || '' },
        };
      }

      const session = await stripeClient.checkout.sessions.create(sessionConfig);
      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
      throw new HttpsError('internal', error.message || 'Failed to create checkout session.');
    }
  }
);



/**
 * HTTP endpoint for Stripe Webhook events.
 * Handles: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted, invoice.payment_failed
 */
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (request, response) => {
    const stripeKey = STRIPE_SECRET_KEY.value();
    const endpointSecret = STRIPE_WEBHOOK_SECRET.value();

    if (!stripeKey || !endpointSecret) {
      console.error('Stripe secrets not configured');
      response.status(500).send('Internal Server Error');
      return;
    }

    const stripeClient = require('stripe')(stripeKey);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const db = getFirestore();

    // ── checkout.session.completed ────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { uid, profileId, itemId, isSubscription } = session.metadata || {};

      if (uid && itemId) {
        try {
          const userRef = db.collection('users').doc(uid);
          const userSnap = await userRef.get();
          const userData = userSnap.exists ? userSnap.data() : {};
          const profiles = userData.profiles || {};

          const sparksMap = {
            sparks_pack_1: 500,
            sparks_pack_2: 1200,
            sparks_pack_3: 3000,
            sparks_pack_4: 10000
          };

          const targetProfileId = profileId && profiles[profileId]
            ? profileId
            : (userData.activeProfileId || Object.keys(profiles)[0] || '');

          if (isSubscription === 'true') {
            // Store Stripe IDs + entitlements
            await userRef.set({
              stripeCustomerId: session.customer || null,
              stripeSubscriptionId: session.subscription || null,
              entitlements: {
                isPremium: true,
                subscriptionTier: itemId,
                subscriptionActivatedAt: FieldValue.serverTimestamp(),
                lastVerifiedPlatform: 'stripe',
                paymentStatus: 'active',
              },
              updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
          } else {
            // One-time purchase: persist Customer ID for future prepopulated card, add sparks
            const updates = {
              stripeCustomerId: session.customer || null,
              updatedAt: FieldValue.serverTimestamp(),
            };

            if (sparksMap[itemId] && profiles[targetProfileId]) {
              const currentSparks = Number(profiles[targetProfileId]?.userData?.sparks || 0);
              profiles[targetProfileId].userData = profiles[targetProfileId].userData || {};
              profiles[targetProfileId].userData.sparks = currentSparks + sparksMap[itemId];
              profiles[targetProfileId].updatedAtMillis = Date.now();
              updates.profiles = profiles;
            }

            await userRef.set(updates, { merge: true });
          }

          // Audit log
          await userRef.collection('transactions').doc(session.id).set({
            sessionId: session.id,
            itemId,
            amount: session.amount_total,
            currency: session.currency,
            customer: session.customer,
            status: 'completed',
            profileId: targetProfileId,
            isSubscription: isSubscription === 'true',
            timestamp: FieldValue.serverTimestamp()
          });

          console.log(`Processed purchase for uid=${uid}, item=${itemId}`);
        } catch (e) {
          console.error('Error processing checkout.session.completed:', e);
        }
      }

    // ── customer.subscription.updated ────────────────────────────────────────
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const uid = sub.metadata?.uid;

      if (uid) {
        try {
          const userRef = db.collection('users').doc(uid);
          const isActive = sub.status === 'active' || sub.status === 'trialing';
          const cancelAtPeriodEnd = !!sub.cancel_at_period_end;

          // Derive our plan ID from the Stripe Price ID on the subscription
          const priceId = sub.items?.data?.[0]?.price?.id || '';
          const PRICE_TO_PLAN = {
            [STRIPE_PRICE_KIBO_CLUB_SUB.value()]:            'kibo_club_sub',
            [STRIPE_PRICE_KIBO_CLUB_SUB_ANNUAL.value()]:     'kibo_club_sub_annual',
            [STRIPE_PRICE_KIBO_CLUB_FAMILY.value()]:         'kibo_club_family',
            [STRIPE_PRICE_KIBO_CLUB_FAMILY_ANNUAL.value()]:  'kibo_club_family_annual',
          };
          const planId = PRICE_TO_PLAN[priceId] || null;

          await userRef.set({
            entitlements: {
              isPremium: isActive,
              subscriptionTier: planId,
              lastVerifiedPlatform: 'stripe',
              paymentStatus: sub.status,
              cancelAtPeriodEnd,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
            },
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`Subscription updated for uid=${uid}, status=${sub.status}, cancelAtPeriodEnd=${cancelAtPeriodEnd}`);
        } catch (e) {
          console.error('Error processing customer.subscription.updated:', e);
        }
      }

    // ── customer.subscription.deleted ────────────────────────────────────────
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const uid = sub.metadata?.uid;

      if (uid) {
        try {
          const userRef = db.collection('users').doc(uid);
          await userRef.set({
            stripeSubscriptionId: null,
            entitlements: {
              isPremium: false,
              subscriptionTier: null,
              lastVerifiedPlatform: 'stripe',
              paymentStatus: 'canceled',
              cancelAtPeriodEnd: false,
              currentPeriodEnd: null,
            },
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`Subscription canceled for uid=${uid}`);
        } catch (e) {
          console.error('Error processing customer.subscription.deleted:', e);
        }
      }

    // ── invoice.payment_failed ────────────────────────────────────────────────
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      // Look up uid via the subscription's customer ID in Firestore
      try {
        const customerId = invoice.customer;
        if (customerId) {
          const usersSnap = await db.collection('users')
            .where('stripeCustomerId', '==', customerId)
            .limit(1)
            .get();

          if (!usersSnap.empty) {
            const userRef = usersSnap.docs[0].ref;
            await userRef.set({
              entitlements: {
                paymentStatus: 'past_due',
              },
              updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`Payment failed for customer=${customerId}`);
          }
        }
      } catch (e) {
        console.error('Error processing invoice.payment_failed:', e);
      }
    }

    response.status(200).send({ received: true });
  }
);

/**
 * Callable function to create a Stripe Customer Portal session.
 * Allows parents to manage their subscription, update payment, or cancel.
 */
exports.createStripePortalSession = onCall(
  { cors: true, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const db = getFirestore();
    const userSnap = await db.collection('users').doc(request.auth.uid).get();
    const customerId = userSnap.exists ? userSnap.data()?.stripeCustomerId : null;

    if (!customerId) {
      throw new HttpsError('not-found', 'No billing account found. Please subscribe first.');
    }

    const stripeKey = STRIPE_SECRET_KEY.value();
    const stripeClient = require('stripe')(stripeKey);

    try {
      const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: request.data?.returnUrl || 'https://kiboclimb.com/',
      });
      return { url: session.url };
    } catch (error) {
      console.error('Error creating Stripe Portal session:', error);
      throw new HttpsError('internal', error.message || 'Failed to create portal session.');
    }
  }
);

/**
 * Compiles a weekly summary and HTML template for scheduled email digests.
 */
function computeProfileWeeklyStats({ childName, profile, profileId = null }) {
  const name = childName || profile?.name || profile?.username || 'Kibo Climber';
  const grade = profile?.gradeLevel || 'Grade 1–2';
  const userData = profile?.userData || {};
  const streak = userData.streak || 0;
  const unlockedBadges = userData.unlockedBadges || [];

  const now = new Date();
  const mathData = userData.subjects?.math || userData || {};
  const wordsData = userData.subjects?.words || {};

  const profileQuery = profileId ? `&profile=${encodeURIComponent(profileId)}` : '';
  const subjects = [];

  // Math Subject Summary
  const mathSolved = mathData.totalProblemsSolved || 0;
  const mathSprints = mathData.sprintHistory || [];
  const mathRecent = mathSprints.filter(s => s.date && (now - new Date(s.date)) / (1000 * 60 * 60 * 24) <= 7);
  let mathWeekSolved = 0, mathWeekCorrect = 0, mathWeekTime = 0;
  mathRecent.forEach(s => {
    mathWeekSolved += Number(s.totalQuestions || 12);
    mathWeekCorrect += Number(s.correctCount || s.score || 0);
    mathWeekTime += Number(s.totalTimeSec || 0);
  });
  const mathRating = mathData.adaptiveCompetenceRating || 1000;
  const mathAcc = mathWeekSolved > 0 ? Math.round((mathWeekCorrect / mathWeekSolved) * 100) : null;
  const mathSpeed = mathWeekSolved > 0 ? (mathWeekTime / mathWeekSolved).toFixed(1) : null;

  subjects.push({
    name: 'Math',
    icon: '🔢',
    rating: mathRating,
    tier: mathData.tier || 1,
    solvedThisWeek: mathWeekSolved,
    totalSolved: mathSolved,
    accuracyPct: mathAcc,
    avgLatencySec: mathSpeed,
    playUrl: `https://kiboclimb.com/math?utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=subject_math${profileQuery}`
  });

  // Words Subject Summary
  const wordsSolved = wordsData.totalProblemsSolved || 0;
  const wordsSprints = wordsData.sprintHistory || [];
  if (wordsSolved > 0 || wordsSprints.length > 0) {
    const wordsRecent = wordsSprints.filter(s => s.date && (now - new Date(s.date)) / (1000 * 60 * 60 * 24) <= 7);
    let wordsWeekSolved = 0, wordsWeekCorrect = 0, wordsWeekTime = 0;
    wordsRecent.forEach(s => {
      wordsWeekSolved += Number(s.totalQuestions || 12);
      wordsWeekCorrect += Number(s.correctCount || s.score || 0);
      wordsWeekTime += Number(s.totalTimeSec || 0);
    });
    subjects.push({
      name: 'Words',
      icon: '📚',
      rating: wordsData.adaptiveCompetenceRating || 1000,
      tier: wordsData.tier || 1,
      solvedThisWeek: wordsWeekSolved,
      totalSolved: wordsSolved,
      accuracyPct: wordsWeekSolved > 0 ? Math.round((wordsWeekCorrect / wordsWeekSolved) * 100) : null,
      avgLatencySec: wordsWeekSolved > 0 ? (wordsWeekTime / wordsWeekSolved).toFixed(1) : null,
      playUrl: `https://kiboclimb.com/words?utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=subject_words${profileQuery}`
    });
  }

  const totalProblemsThisWeek = subjects.reduce((sum, s) => sum + s.solvedThisWeek, 0);

  const subjectsHtml = subjects.map(sub => `
    <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 16px; text-align: left;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800;">
          <span style="font-size: 18px; margin-right: 6px;">${sub.icon}</span> ${sub.name} Climb
        </h3>
        <span style="background-color: #f3e8ff; color: #6b21a8; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 12px;">
          Rating: ${sub.rating} · Tier ${sub.tier}
        </span>
      </div>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="50%" style="padding: 4px 0;">
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Completed</span>
            <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${sub.solvedThisWeek} this week (${sub.totalSolved} total)</div>
          </td>
          <td width="50%" style="padding: 4px 0;">
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Accuracy</span>
            <div style="font-size: 13px; font-weight: 800; color: ${sub.accuracyPct >= 80 ? '#16a34a' : '#d97706'};">${sub.accuracyPct !== null ? `${sub.accuracyPct}%` : 'Calibrating'}</div>
          </td>
        </tr>
      </table>
      <div style="text-align: right; margin-top: 10px;">
        <a href="${sub.playUrl}" style="font-size: 12px; font-weight: 800; color: #7c3aed; text-decoration: none;">
          Play ${sub.name} Climb →
        </a>
      </div>
    </div>
  `).join('');

  return {
    name,
    grade,
    streak,
    unlockedBadgesCount: unlockedBadges.length,
    totalProblemsThisWeek,
    subjects,
    subjectsHtml,
    profileQuery,
    profileId
  };
}

function buildScheduledDigestHtml({ childName, profile, isKiboClub = false, profileId = null }) {
  const stats = computeProfileWeeklyStats({ childName, profile, profileId });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>🐾 Kibo Climb Weekly Progress for ${stats.name}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900;">🐾 Kibo Climb</h1>
                    <p style="margin: 2px 0 0 0; color: #a5b4fc; font-size: 13px; font-weight: 600;">Weekly Progress Summary for <strong>${stats.name}</strong></p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                      ${stats.grade}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 16px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 18px;">🔥</span>
                    <div style="font-size: 15px; font-weight: 900; color: #d97706;">${stats.streak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Streak</div>
                  </td>
                  <td align="center" style="border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 18px;">⚡</span>
                    <div style="font-size: 15px; font-weight: 900; color: #7c3aed;">${stats.totalProblemsThisWeek}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Weekly Items</div>
                  </td>
                  <td align="center">
                    <span style="font-size: 18px;">🏆</span>
                    <div style="font-size: 15px; font-weight: 900; color: #0284c7;">${stats.unlockedBadgesCount}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Badges</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SUBJECTS -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc;">
              ${stats.subjectsHtml}

              <div style="margin-top: 24px; padding-top: 18px; border-top: 2px solid #e2e8f0; text-align: center;">
                <a href="https://kiboclimb.com/?action=play&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=cta_continue_ascent${stats.profileQuery}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 12px;">
                  🏔️ Continue ${stats.name}'s Ascent
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You are receiving this because Weekly Digest is enabled in your Kibo Climb Parent Zone.<br/>
                © ${new Date().getFullYear()} Kibo Climb. The Daily Climb to Mastery.
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
 * Builds a single consolidated family weekly digest email covering all children in a family account.
 */
function buildScheduledFamilyDigestHtml({ children = [], isKiboClub = false }) {
  const childrenStats = children.map(c => computeProfileWeeklyStats({
    childName: c.childName,
    profile: c.profile,
    profileId: c.pid
  }));

  const totalFamilyProblems = childrenStats.reduce((sum, c) => sum + c.totalProblemsThisWeek, 0);
  const totalFamilyBadges = childrenStats.reduce((sum, c) => sum + c.unlockedBadgesCount, 0);
  const topStreak = Math.max(0, ...childrenStats.map(c => c.streak));
  const namesSummary = childrenStats.map(c => c.name).join(' & ');

  const childrenSectionsHtml = childrenStats.map(c => `
    <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 18px; padding: 22px; margin-bottom: 24px; text-align: left;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
        <tr>
          <td>
            <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 900;">👤 ${c.name}</h2>
            <span style="color: #64748b; font-size: 12px; font-weight: 700;">${c.grade}</span>
          </td>
          <td align="right">
            <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px; margin-right: 6px;">
              🔥 ${c.streak}d streak
            </span>
            <span style="background-color: #f3e8ff; color: #6b21a8; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
              ⚡ ${c.totalProblemsThisWeek} this week
            </span>
          </td>
        </tr>
      </table>

      ${c.subjectsHtml}

      <div style="text-align: center; margin-top: 14px;">
        <a href="https://kiboclimb.com/?action=play&profile=${encodeURIComponent(c.profileId || '')}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_family_digest" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
          🏔️ Continue ${c.name}'s Ascent →
        </a>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>🐾 Kibo Climb Weekly Family Progress: ${namesSummary}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900;">🐾 Kibo Climb</h1>
                    <p style="margin: 2px 0 0 0; color: #a5b4fc; font-size: 13px; font-weight: 600;">Family Progress Summary · <strong>${children.length} Climbers</strong></p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                      👨‍👩‍👧‍👦 Family Plan
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- COMBINED FAMILY RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 16px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 18px;">🔥</span>
                    <div style="font-size: 15px; font-weight: 900; color: #d97706;">${topStreak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Top Streak</div>
                  </td>
                  <td align="center" style="border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 18px;">⚡</span>
                    <div style="font-size: 15px; font-weight: 900; color: #7c3aed;">${totalFamilyProblems}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Family Solved</div>
                  </td>
                  <td align="center">
                    <span style="font-size: 18px;">🏆</span>
                    <div style="font-size: 15px; font-weight: 900; color: #0284c7;">${totalFamilyBadges}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Total Badges</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PER-CHILD SECTIONS -->
          <tr>
            <td style="padding: 24px 28px; background-color: #f8fafc;">
              ${childrenSectionsHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You are receiving this single consolidated digest because Weekly Digest is enabled in your Kibo Climb Parent Zone.<br/>
                © ${new Date().getFullYear()} Kibo Climb. The Daily Climb to Mastery.
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

exports.buildScheduledDigestHtml = buildScheduledDigestHtml;
exports.buildScheduledFamilyDigestHtml = buildScheduledFamilyDigestHtml;

/**
 * ============================================================================
 * SCHEDULED NOTIFICATION & ENGAGEMENT PIPELINE
 * Note: The codebase currently sends BOTH:
 *  1. Scheduled weekly email progress digests (via Resend: `sendScheduledWeeklyDigests`)
 *  2. Scheduled daily streak reminder push notifications to Android PWAs,
 *     web browsers, and native apps (via OneSignal: `scheduledDailyStreakPush`)
 * ============================================================================
 */

/**
 * Scheduled Cloud Function: Executes weekly on Sundays at 9:00 AM America/Chicago.
 * Dispatches automated weekly progress summaries to parents with linked accounts.
 */
exports.sendScheduledWeeklyDigests = onSchedule(
  {
    schedule: "0 18 * * 0",
    timeZone: "America/Chicago",
    secrets: ["RESEND_API_KEY"]
  },
  async (event) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[sendScheduledWeeklyDigests] RESEND_API_KEY not configured.");
      return;
    }

    const resend = new Resend(apiKey);
    const db = getFirestore();
    const auth = getAuth();
    const senderEmail = (process.env.SENDER_EMAIL && !process.env.SENDER_EMAIL.includes('hello@kiboclimb.com'))
      ? process.env.SENDER_EMAIL
      : "Kibo Climb <noreply@kiboclimb.com>";

    console.log("[sendScheduledWeeklyDigests] Starting weekly digest run...");

    try {
      const usersSnap = await db.collection("users").get();
      if (usersSnap.empty) {
        console.log("[sendScheduledWeeklyDigests] No users found in Firestore.");
        return;
      }

      let sentCount = 0;
      let skippedCount = 0;

      // Group candidate digests by recipient email + child name/ID to prevent duplicate sends across orphaned docs
      const digestCandidates = new Map();

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const uid = userDoc.id;

        // Check if user has weekly digests enabled (defaults to true if not explicitly false)
        const notifSettings = userData.notificationSettings || userData.notifPrefs || {};
        if (notifSettings.weeklyDigestEnabled === false || notifSettings.unsubscribedAll) {
          skippedCount++;
          continue;
        }

        // Determine recipient email: doc.email -> doc.parentEmail -> auth user record
        let targetEmail = userData.email || userData.parentEmail;
        if (!targetEmail || !EMAIL_REGEX.test(targetEmail)) {
          try {
            const authUser = await auth.getUser(uid);
            if (authUser && authUser.email && EMAIL_REGEX.test(authUser.email)) {
              targetEmail = authUser.email;
            }
          } catch (authErr) {
            // Anonymous or deleted auth user
          }
        }

        if (!targetEmail) {
          skippedCount++;
          continue;
        }

        const normalizedEmail = targetEmail.trim().toLowerCase();
        const profiles = userData.profiles || {};
        const profileKeys = Object.keys(profiles);
        if (profileKeys.length === 0) {
          skippedCount++;
          continue;
        }

        const docUpdatedMillis = Number(userData.updatedAtMillis || userData.lastSyncedMillis || 0);

        for (const pid of profileKeys) {
          const profile = profiles[pid];
          if (!profile || profile.isDeleted === true) continue;

          const childName = (profile?.username || profile?.name || 'Kibo Climber').trim();
          const childKey = childName.toLowerCase();
          const dedupKey = `${normalizedEmail}:::${childKey}`;

          const uData = profile?.userData || {};
          const subjects = uData.subjects || {};
          const totalProblems = Number(uData.totalProblemsSolved || subjects.math?.totalProblemsSolved || 0);
          const mathSprints = subjects.math?.sprintHistory || uData.sprintHistory || [];
          const wordsSprints = subjects.words?.sprintHistory || [];
          const hasAnySprints = (mathSprints.length > 0 || wordsSprints.length > 0);

          // Skip completely unplayed placeholder profiles
          if (totalProblems === 0 && !hasAnySprints) {
            continue;
          }

          // Check if profile has had any practice in the last 45 days
          const nowMs = Date.now();
          const fortyFiveDaysMs = 45 * 24 * 60 * 60 * 1000;
          const mathRecent45 = mathSprints.some(s => s.date && (nowMs - new Date(s.date).getTime()) <= fortyFiveDaysMs);
          const wordsRecent45 = wordsSprints.some(s => s.date && (nowMs - new Date(s.date).getTime()) <= fortyFiveDaysMs);
          const lastDate = uData.lastSprintDate || uData.lastPlayedDate || uData.lastSprintTimestamp;
          const isRecentLastDate = lastDate && (nowMs - new Date(lastDate).getTime()) <= fortyFiveDaysMs;

          if (!mathRecent45 && !wordsRecent45 && !isRecentLastDate) {
            // Profile has been inactive for > 45 days — skip weekly digest to prevent ghost digests
            continue;
          }

          const profileUpdatedMillis = Number(profile?.updatedAtMillis || docUpdatedMillis || 0);
          const badgeCount = Array.isArray(profile?.userData?.unlockedBadges) ? profile.userData.unlockedBadges.length : 0;
          const problemsSolved = totalProblems;
          const candidateScore = (profileUpdatedMillis * 1000) + (badgeCount * 10) + problemsSolved;

          const isKiboClub = Boolean(
            userData.isKiboClub ||
            userData.hasFamilyPlan ||
            profile?.isKiboClub ||
            profile?.shopState?.unlockedItems?.includes('kibo_club_sub') ||
            profile?.shopState?.unlockedItems?.includes('kibo_club_sub_annual')
          );

          const existingCandidate = digestCandidates.get(dedupKey);
          if (!existingCandidate || candidateScore > existingCandidate.score) {
            digestCandidates.set(dedupKey, {
              targetEmail: normalizedEmail,
              childName,
              profile,
              pid,
              isKiboClub,
              userDocRef: userDoc.ref,
              score: candidateScore
            });
          }
        }
      }

      // Group candidate profiles by parent email so multi-profile accounts receive 1 consolidated family digest
      const familyEmailMap = new Map();
      for (const candidate of digestCandidates.values()) {
        const { targetEmail } = candidate;
        if (!familyEmailMap.has(targetEmail)) {
          familyEmailMap.set(targetEmail, []);
        }
        familyEmailMap.get(targetEmail).push(candidate);
      }

      for (const [targetEmail, children] of familyEmailMap.entries()) {
        const isMultiChild = children.length > 1;
        const isAnyKiboClub = children.some(c => c.isKiboClub);

        let subject;
        let htmlBody;

        if (isMultiChild) {
          const namesSummary = children.map(c => c.childName).join(' & ');
          subject = `🐾 🏔️ Kibo Weekly Family Progress: ${namesSummary}`;
          htmlBody = buildScheduledFamilyDigestHtml({
            children,
            isKiboClub: isAnyKiboClub
          });
        } else {
          const single = children[0];
          subject = `🐾 🏔️ Kibo Weekly Progress for ${single.childName}`;
          htmlBody = buildScheduledDigestHtml({
            childName: single.childName,
            profile: single.profile,
            isKiboClub: single.isKiboClub,
            profileId: single.pid
          });
        }

        try {
          const sendRes = await resend.emails.send({
            from: senderEmail,
            to: [targetEmail],
            subject,
            html: htmlBody
          });

          if (sendRes.error) {
            console.error(`[sendScheduledWeeklyDigests] Failed to send digest to ${targetEmail}:`, sendRes.error);
          } else {
            sentCount++;
            console.log(`[sendScheduledWeeklyDigests] Sent digest (${children.length} climber(s)) to ${targetEmail}`);
            for (const child of children) {
              if (child.userDocRef) {
                await child.userDocRef.set({
                  lastDigestSentAt: FieldValue.serverTimestamp()
                }, { merge: true }).catch(() => {});
              }
            }
          }
        } catch (sendErr) {
          console.error(`[sendScheduledWeeklyDigests] Error sending to ${targetEmail}:`, sendErr);
        }
      }

      console.log(`[sendScheduledWeeklyDigests] Completed weekly digest run. Sent: ${sentCount}, Skipped: ${skippedCount}`);
    } catch (err) {
      console.error("[sendScheduledWeeklyDigests] Fatal error during digest run:", err);
    }
  }
);

/**
 * Dispatches a push notification via the OneSignal REST API.
 * Targets users via their authenticated external user ID (Firebase UID).
 */
async function dispatchOneSignalPush({ uids = [], subscriptionIds = [], title, message, url, data = {}, apiKey, appId }) {
  const finalApiKey = apiKey || process.env.ONESIGNAL_REST_API_KEY;
  const finalAppId = appId || process.env.ONESIGNAL_APP_ID || "d192b852-cda6-4a6b-897a-51b3831ab1af";

  if (!finalApiKey) {
    console.warn("[OneSignal Push] Missing ONESIGNAL_REST_API_KEY in environment/secrets. Push skipped.");
    return { success: false, error: "OneSignal REST API Key not configured." };
  }

  const payload = {
    app_id: finalAppId,
    target_channel: "push",
    headings: { en: title },
    contents: { en: message },
    url: url || "https://kiboclimb.com/?action=play&utm_source=push_notification&utm_medium=push&utm_campaign=daily_streak",
    chrome_web_icon: "https://kiboclimb.com/favicon.png",
    firefox_icon: "https://kiboclimb.com/favicon.png",
    small_icon: "ic_stat_onesignal_default",
    large_icon: "https://kiboclimb.com/favicon.png",
    data: {
      ...data,
      sentAt: new Date().toISOString()
    }
  };

  let hasTarget = false;
  if (subscriptionIds && subscriptionIds.length > 0) {
    payload.include_subscription_ids = subscriptionIds;
    hasTarget = true;
  }
  if (uids && uids.length > 0) {
    payload.include_aliases = {
      external_id: uids
    };
    hasTarget = true;
  }

  if (!hasTarget) {
    return { success: false, error: "No target external user IDs or subscription IDs specified." };
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${finalApiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || (result.errors && result.errors.length > 0)) {
      console.error("[OneSignal Push Error]:", result);
      return { success: false, error: result.errors ? JSON.stringify(result.errors) : `HTTP ${response.status}` };
    }

    return {
      success: true,
      id: result.id,
      recipients: result.recipients || 0
    };
  } catch (err) {
    console.error("[OneSignal Push Exception]:", err);
    return { success: false, error: err.message || "Failed to dispatch push notification." };
  }
}

/**
 * Evaluates whether a profile should receive a daily practice/streak reminder.
 * Enforces scheduled practice days (never alerts on rest days) and prevents UTC date bleed.
 */
function evaluateDailyStreakReminder(prof, { now = new Date(), fallbackTimezone = 'America/New_York' } = {}) {
  if (!prof || prof.dailyReminderEnabled === false) {
    return { shouldAlert: false, reason: 'profile_reminders_disabled' };
  }

  const uData = prof?.userData || {};
  const subjects = uData.subjects || {};
  const userTz = uData.lastSprintTimezone || fallbackTimezone;

  let profileDateStr, profileDayOfWeek;
  try {
    profileDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    profileDayOfWeek = new Date(`${profileDateStr}T12:00:00Z`).getUTCDay();
  } catch (e) {
    profileDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: fallbackTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    profileDayOfWeek = new Date(`${profileDateStr}T12:00:00Z`).getUTCDay();
  }

  // Check practice days schedule if set (defaults to 1..5 Mon-Fri)
  const practiceDays = Array.isArray(prof.practiceDays) ? prof.practiceDays : [1, 2, 3, 4, 5];
  const isScheduledPracticeDay = practiceDays.includes(profileDayOfWeek);

  // Scheduled practice days guard: Rest days NEVER break a streak and never trigger daily alarms.
  if (!isScheduledPracticeDay) {
    return { shouldAlert: false, reason: 'not_a_practice_day', profileDayOfWeek };
  }

  // Collect all potential climb dates formatted in the user's local timezone
  const candidateDates = [];
  if (uData.lastSprintDate) candidateDates.push(String(uData.lastSprintDate).slice(0, 10));
  if (uData.lastPlayedDate) candidateDates.push(String(uData.lastPlayedDate).slice(0, 10));

  if (uData.lastSprintTimestamp) {
    try {
      const tsDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: userTz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(uData.lastSprintTimestamp));
      candidateDates.push(tsDateStr);
    } catch (e) {
      candidateDates.push(String(uData.lastSprintTimestamp).slice(0, 10));
    }
  }

  ['math', 'words', 'world', 'coding'].forEach((sub) => {
    const subData = subjects[sub];
    if (subData) {
      if (subData.lastSprintDate) candidateDates.push(String(subData.lastSprintDate).slice(0, 10));
      if (subData.sprintHistory && subData.sprintHistory[0]?.date) {
        candidateDates.push(String(subData.sprintHistory[0].date).slice(0, 10));
      }
      if (subData.lastSprintTimestamp) {
        try {
          const subTsStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(new Date(subData.lastSprintTimestamp));
          candidateDates.push(subTsStr);
        } catch (e) {}
      }
    }
  });

  if (uData.sprintHistory && uData.sprintHistory[0]?.date) {
    candidateDates.push(String(uData.sprintHistory[0].date).slice(0, 10));
  }

  const hasClimbedToday = candidateDates.some(d => d === profileDateStr);
  if (hasClimbedToday) {
    return { shouldAlert: false, reason: 'already_climbed_today', profileDateStr };
  }

  const currentStreak = Number(uData.streak || 0);
  const unclaimedQuests = Number(prof?.unclaimedQuestsCount || 0);

  return {
    shouldAlert: true,
    profileDateStr,
    profileDayOfWeek,
    currentStreak,
    unclaimedQuests,
    name: prof.username || prof.name || 'Kibo Climber'
  };
}

exports.evaluateDailyStreakReminder = evaluateDailyStreakReminder;

/**
 * Scheduled Cron Function: scheduledDailyStreakPush
 * Runs daily at 5:00 PM (17:00 America/New_York) to remind active accounts whose children haven't climbed yet today.
 */
exports.scheduledDailyStreakPush = onSchedule(
  {
    schedule: "0 17 * * *",
    timeZone: "America/New_York",
    secrets: ["ONESIGNAL_REST_API_KEY"]
  },
  async (event) => {
    console.log("[scheduledDailyStreakPush] Starting daily streak push reminder check...");
    const db = getFirestore();

    try {
      const usersSnap = await db.collection("users").get();
      if (usersSnap.empty) {
        console.log("[scheduledDailyStreakPush] No user accounts found.");
        return;
      }

      const now = new Date();
      let pushesDispatched = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data() || {};
        const uid = userDoc.id;
        const profiles = userData.profiles || {};
        const notifSettings = userData.notificationSettings || {};

        // If parent account-level notifications explicitly disabled, skip
        if (notifSettings.dailyReminderEnabled === false) {
          continue;
        }

        // Find profiles that have practice scheduled today and haven't climbed yet
        const unplayedProfiles = [];
        for (const [pid, prof] of Object.entries(profiles)) {
          const evalResult = evaluateDailyStreakReminder(prof, { now, fallbackTimezone: 'America/New_York' });
          if (evalResult.shouldAlert) {
            unplayedProfiles.push({
              id: pid,
              name: evalResult.name,
              streak: evalResult.currentStreak,
              unclaimedQuests: evalResult.unclaimedQuests
            });
          }
        }

        if (unplayedProfiles.length > 0) {
          const firstUnplayed = unplayedProfiles[0];
          const streakText = firstUnplayed.streak > 1 ? ` (${firstUnplayed.streak}-day streak)` : '';
          const hasQuestBonus = firstUnplayed.unclaimedQuests > 0 ? ' 🎁 Unclaimed quest Sparks waiting!' : '';

          const title = firstUnplayed.streak > 0
            ? `🏔️ Keep ${firstUnplayed.name}'s Streak Alive! 🔥`
            : `🏔️ Time for ${firstUnplayed.name}'s Daily Climb! 🎒`;
          const message = firstUnplayed.streak > 0
            ? `Kibo the Red Panda is waiting! Complete today's climb${streakText} before midnight.${hasQuestBonus}`
            : `Kibo the Red Panda is waiting! Complete today's scheduled climb before midnight.${hasQuestBonus}`;
          const actionUrl = `https://kiboclimb.com/?action=play&profile=${encodeURIComponent(firstUnplayed.id)}&utm_source=push_notification&utm_medium=push&utm_campaign=daily_streak`;

          // Collect target subscription IDs if registered on user doc
          const subscriptionIds = [];
          if (userData.oneSignalSubscriptionId) {
            subscriptionIds.push(userData.oneSignalSubscriptionId);
          }
          if (Array.isArray(userData.oneSignalSubscriptionIds)) {
            userData.oneSignalSubscriptionIds.forEach(id => {
              if (id && !subscriptionIds.includes(id)) {
                subscriptionIds.push(id);
              }
            });
          }

          const res = await dispatchOneSignalPush({
            uids: [uid],
            subscriptionIds,
            title,
            message,
            url: actionUrl,
            data: { profileId: firstUnplayed.id, streak: firstUnplayed.streak },
            apiKey: process.env.ONESIGNAL_REST_API_KEY
          });

          if (res.success) {
            pushesDispatched++;
          }
        }
      }

      console.log(`[scheduledDailyStreakPush] Finished daily streak push run. Sent to ${pushesDispatched} accounts.`);
    } catch (err) {
      console.error("[scheduledDailyStreakPush] Error executing streak push schedule:", err);
    }
  }
);

// Helper exports for unit testing and modular use
exports.computeProfileWeeklyStats = computeProfileWeeklyStats;
exports.buildScheduledDigestHtml = buildScheduledDigestHtml;
exports.buildScheduledFamilyDigestHtml = buildScheduledFamilyDigestHtml;


