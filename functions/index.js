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

/**
 * Callable function to claim a username.
 * Ensures the username is unique and saves it to the 'usernames' collection.
 */
exports.claimUsername = onCall(
  {
    cors: true
  },
  async (request) => {
    const { username, profileId, oldUsername } = request.data || {};
    const uid = request.auth ? request.auth.uid : 'anonymous';

    if (!username || typeof username !== 'string' || !profileId) {
      throw new HttpsError('invalid-argument', 'Missing required fields.');
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      throw new HttpsError('invalid-argument', 'Username must be between 3 and 20 characters.');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      throw new HttpsError('invalid-argument', 'Username can only contain letters, numbers, and underscores.');
    }

    const lowerUsername = cleanUsername.toLowerCase();
    const db = admin.firestore();

    try {
      return await db.runTransaction(async (transaction) => {
        // Check if the username is already taken
        const usernameRef = db.collection('usernames').doc(lowerUsername);
        const usernameDoc = await transaction.get(usernameRef);

        if (usernameDoc.exists) {
          const data = usernameDoc.data();
          // If the caller already owns this username, just return success
          if (data.uid === uid && data.profileId === profileId) {
             return { success: true, username: cleanUsername };
          }
          throw new HttpsError('already-exists', 'This username is already taken.');
        }

        // If replacing an old username, release the old one
        if (oldUsername && typeof oldUsername === 'string') {
           const oldLower = oldUsername.trim().toLowerCase();
           if (oldLower !== lowerUsername) {
             const oldRef = db.collection('usernames').doc(oldLower);
             const oldDoc = await transaction.get(oldRef);
             if (oldDoc.exists && oldDoc.data().uid === uid && oldDoc.data().profileId === profileId) {
                 transaction.delete(oldRef);
             }
           }
        }

        // Claim the new username
        transaction.set(usernameRef, {
          uid: uid,
          profileId: profileId,
          originalUsername: cleanUsername,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, username: cleanUsername };
      });
    } catch (error) {
      console.error('Error claiming username:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'An error occurred while claiming the username.');
    }
  }
);

/**
 * Callable function to search for usernames.
 */
exports.searchUsername = onCall(
  {
    cors: true
  },
  async (request) => {
    const { query } = request.data || {};
    const uid = request.auth ? request.auth.uid : 'anonymous';

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
       return { results: [] };
    }

    const lowerQuery = query.trim().toLowerCase();
    const db = admin.firestore();

    try {
       // Search for usernames that start with the query using >= and <
       // 'z' + 1 to get the upper bound
       const endQuery = lowerQuery + '\uf8ff';

       const usernamesRef = db.collection('usernames');
       const snapshot = await usernamesRef
           .where(admin.firestore.FieldPath.documentId(), '>=', lowerQuery)
           .where(admin.firestore.FieldPath.documentId(), '<=', endQuery)
           .limit(10)
           .get();

       const results = [];
       snapshot.forEach(doc => {
           const data = doc.data();
           // Don't return the searcher's own profile
           if (data.uid !== uid) {
               results.push({
                   username: data.originalUsername,
                   id: `${data.uid}_${data.profileId}`
               });
           }
       });

       return { results };

    } catch (error) {
       console.error('Error searching usernames:', error);
       throw new HttpsError('internal', 'An error occurred while searching for usernames.');
    }
  }
);

/**
 * Callable function to get scores for an array of friend IDs.
 */
exports.getFriendScores = onCall(
  {
    cors: true
  },
  async (request) => {
    const { friendIds, subject } = request.data || {};

    if (!Array.isArray(friendIds) || friendIds.length === 0) {
       return { friends: [] };
    }

    // Firestore 'in' queries are limited to 30 items, we limit to 25 anyway
    const safeSubject = subject || 'math';
    const db = admin.firestore();

    try {
      // friendIds are composite IDs (uid_profileId)
      // We need to fetch from leaderboard appending _subject
      const docIds = friendIds.map(id => `${id}_${safeSubject}`);

      const leaderboardRef = db.collection('leaderboard');

      // Batch get max 25 documents
      const docsToFetch = docIds.slice(0, 25).map(id => leaderboardRef.doc(id));
      const snapshot = await db.getAll(...docsToFetch);

      const friends = [];
      snapshot.forEach(doc => {
         if (doc.exists) {
            friends.push({
               id: doc.id,
               ...doc.data()
            });
         }
      });

      return { friends };

    } catch (error) {
       console.error('Error fetching friend scores:', error);
       throw new HttpsError('internal', 'An error occurred while fetching friend scores.');
    }
  }
);
