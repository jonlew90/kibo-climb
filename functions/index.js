const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { Resend } = require("resend");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const { getApps, initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

if (!getApps().length) {
  initializeApp();
}

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

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
    secrets: ["RESEND_API_KEY"]
  },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError("unauthenticated", "Authentication required to send notifications.");
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    // Enforce per-user rate limit (maximum 5 emails per 10-minute window)
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
    const { to, subject, htmlBody, textBody } = request.data || {};

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

    const senderEmail = process.env.SENDER_EMAIL || "Kibo Climb <hello@kiboclimb.com>";

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
 */
exports.createStripeCheckoutSession = onCall(
  { secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { itemId, itemName, priceAmount, isSubscription, profileId, successUrl, cancelUrl } = request.data || {};

    if (!itemId || !priceAmount) {
      throw new HttpsError('invalid-argument', 'Missing required item details.');
    }

    const stripeKey = STRIPE_SECRET_KEY.value() || process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new HttpsError('internal', 'Stripe secret key not configured.');
    }
    const stripeClient = require('stripe')(stripeKey);

    try {
      const priceData = {
        currency: 'usd',
        product_data: {
          name: itemName,
          metadata: { itemId }
        },
        unit_amount: Math.round(priceAmount * 100), // Convert to cents
      };

      if (isSubscription) {
        // Assume monthly unless it contains 'yr' or 'annual'
        priceData.recurring = {
          interval: itemName.toLowerCase().includes('annual') ? 'year' : 'month'
        };
      }

      const sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: successUrl || 'https://kiboclimb.com/?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl || 'https://kiboclimb.com/',
        client_reference_id: request.auth.uid,
        metadata: {
          uid: request.auth.uid,
          profileId: profileId || 'default_child',
          itemId,
          isSubscription: isSubscription ? 'true' : 'false'
        },
      };

      const session = await stripeClient.checkout.sessions.create(sessionConfig);

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
      throw new HttpsError('internal', 'Failed to create checkout session.', error.message);
    }
  }
);

/**
 * HTTP endpoint for Stripe Webhook events.
 */
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (request, response) => {
    const stripeKey = STRIPE_SECRET_KEY.value() || process.env.STRIPE_SECRET_KEY;
    const endpointSecret = STRIPE_WEBHOOK_SECRET.value() || process.env.STRIPE_WEBHOOK_SECRET;

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

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const { uid, profileId, itemId, isSubscription } = session.metadata || {};

      if (uid && itemId) {
        try {
          const db = getFirestore();

          if (isSubscription === 'true') {
             const userRef = db.collection('users').doc(uid);
             await userRef.set({
               entitlements: {
                 isPremium: true,
                 subscriptionTier: itemId,
                 subscriptionActivatedAt: FieldValue.serverTimestamp(),
                 lastVerifiedPlatform: 'stripe'
               }
             }, { merge: true });
          } else {
             // Example: Single purchase, record it
             const txRef = db.collection('users').doc(uid).collection('transactions').doc(session.id);
             await txRef.set({
                itemId,
                amount: session.amount_total,
                status: 'completed',
                timestamp: FieldValue.serverTimestamp()
             });
          }
          console.log(`Successfully processed purchase for user ${uid}, item: ${itemId}`);
        } catch (e) {
          console.error('Error updating user purchase in Firestore', e);
        }
      }
    }

    response.status(200).send({ received: true });
  }
);
