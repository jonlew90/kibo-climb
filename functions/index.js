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
