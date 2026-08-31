// src/services/leaderboardService.js
import { db, auth, functions } from '../config/firebase.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { storageService } from './storageService.js';
import { getDeterministicAnonymousName } from '../utils/safeNames.js';

const LEADERBOARD_COLLECTION = 'leaderboard';

class LeaderboardService {
  constructor() {
    this.currentUser = null;
    this.isAuthInitialized = false;
    this.initAuth();
  }

  getCurrentUser() {
    return this.currentUser || auth.currentUser;
  }

  // Ensure anonymous auth session for cloud sync
  initAuth() {
    if (this.isAuthInitialized) return;
    this.isAuthInitialized = true;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
      } else {
        try {
          const userCred = await signInAnonymously(auth);
          this.currentUser = userCred.user;
        } catch (error) {
          console.warn('LeaderboardService: Auth error, fallback to local offline mode', error);
        }
      }
    });
  }

  // Sync user score and equipped gear to Firestore
  async syncUserScore({ profileId, name, score, subjectsMastered = 5, equipped = [], subject = 'math' }) {
    try {
      // Ensure user is authenticated before attempting sync
      let user = this.currentUser || auth.currentUser;

      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (authErr) {
          // If offline / unauthenticated, gracefully skip remote sync without console warning
          return;
        }
      }

      if (!user || !user.uid) {
        return;
      }

      const baseUid = user.uid;
      const safeProfileId = profileId || 'default_child';
      const safeSubject = subject || 'math';
      const documentId = `${baseUid}_${safeProfileId}_${safeSubject}`;
      const userRef = doc(db, LEADERBOARD_COLLECTION, documentId);
      const anonymousName = getDeterministicAnonymousName(documentId);

      const payload = {
        uid: baseUid,
        profileId: safeProfileId,
        subject: safeSubject,
        name: name || 'Kibo Climber',
        anonymousName: anonymousName,
        score: Number(score) || 1000,
        subjectsMastered: Number(subjectsMastered) || 0,
        equipped: Array.isArray(equipped) ? equipped : [],
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      if (error?.code === 'permission-denied') {
        console.warn('LeaderboardService: Sync permission denied. Ensure backend Firestore security rules are deployed to Firebase.', error);
      } else {
        console.warn('LeaderboardService: Failed to sync score to Firestore', error);
      }
    }
  }

  // Generates or retrieves a fallback device ID for anonymous users who fail to sign in to Firebase
  _getFallbackDeviceId() {
    try {
      let deviceId = localStorage.getItem('kibo_fallback_device_id');
      if (!deviceId) {
        deviceId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('kibo_fallback_device_id', deviceId);
      }
      return deviceId;
    } catch (e) {
      return 'local_user_' + Date.now();
    }
  }

  // Real-time listener for top standings separated by subject
  subscribeToLeaderboard(subject = 'math', limitCount = 20, onUpdate) {
    try {
      // Query top items and filter in memory to avoid requiring complex Firestore composite indices
      const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('score', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const seenKeys = new Set();
        const standings = [];
        const targetSubject = subject || 'math';

        // Process sequentially and short-circuit once we reach limitCount
        // Deduplicate remote entries: if the same player exists multiple times across sessions, keep highest score
        for (let i = 0; i < snapshot.docs.length; i++) {
          if (standings.length >= limitCount) break;

          const docSnap = snapshot.docs[i];
          const data = docSnap.data();
          
          const pSubject = data.subject || 'math';
          if (pSubject !== targetSubject) continue;

          const uniqueKey = data.uid && data.profileId
            ? `${data.uid}_${data.profileId}`
            : (data.name ? data.name.trim().toLowerCase() : docSnap.id);

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            standings.push({
              id: docSnap.id,
              ...data,
              rank: standings.length + 1
            });
          }
        }

        onUpdate(standings);
      }, (error) => {
        console.warn('LeaderboardService: Firestore subscription fallback', error);
        onUpdate([]);
      });
    } catch (error) {
      console.warn('LeaderboardService: Firestore subscription error', error);
      onUpdate([]);
      return () => {};
    }
  }

  // Join or retrieve weekly cohort with Cloud Function + resilient client fallback
  async joinWeeklyLeague({ profileId = 'default_child', weekStr, subject = 'math' }) {
    const safeProfileId = profileId || 'default_child';
    const cacheKey = `kibo_cohort_${weekStr}_${subject}_${safeProfileId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return { cohortId: cached };
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Attempt to invoke the Cloud Function if available
    try {
      const joinFunc = httpsCallable(functions, 'joinWeeklyLeague');
      const res = await joinFunc({ profileId: safeProfileId, weekStr, subject });
      if (res?.data?.cohortId) {
        try { localStorage.setItem(cacheKey, res.data.cohortId); } catch (e) {}
        return { cohortId: res.data.cohortId };
      }
    } catch (err) {
      // Graceful fallback without crashing or spamming console
      console.info('LeaderboardService: Cloud Function unavailable, using cohort allocation fallback.');
    }

    // Resilient fallback cohort bucket
    const fallbackCohortId = `league_${weekStr}_${subject}_bucket_1`;
    try {
      localStorage.setItem(cacheKey, fallbackCohortId);
    } catch (e) {}

    return { cohortId: fallbackCohortId };
  }

  // Sync weekly effort stats (sparks and max streak) to Firestore
  async syncWeeklyScore({ profileId, name, weekStr, cohortId, sparks = 0, maxStreak = 0, equipped = [], subject = 'math' }) {
    try {
      let user = this.currentUser || auth.currentUser;
      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (authErr) {
          return; // Skip silently if offline
        }
      }

      if (!user || !user.uid) return;

      const baseUid = user.uid;
      const safeProfileId = profileId || 'default_child';
      const safeSubject = subject || 'math';
      const safeCohortId = cohortId || `league_${weekStr}_${safeSubject}_bucket_1`;
      const documentId = `${baseUid}_${safeProfileId}_${safeSubject}`;
      const userRef = doc(db, 'weekly_stats', documentId);
      const anonymousName = getDeterministicAnonymousName(documentId);

      const payload = {
        uid: baseUid,
        profileId: safeProfileId,
        subject: safeSubject,
        name: name || 'Kibo Climber',
        anonymousName: anonymousName,
        weekStr: weekStr,
        cohortId: safeCohortId,
        sparks: Number(sparks) || 0,
        maxStreak: Number(maxStreak) || 0,
        equipped: Array.isArray(equipped) ? equipped : [],
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      if (error?.code === 'permission-denied') {
        console.warn('LeaderboardService: Weekly sync permission denied. Check Firestore security rules.');
      } else {
        console.warn('LeaderboardService: Failed to sync weekly score', error);
      }
    }
  }

  // Subscribe to a specific cohort's weekly standings
  subscribeToWeeklyLeaderboard(weekStr, cohortId, subject = 'math', limitCount = 30, onUpdate) {
    try {
      if (!cohortId) {
        onUpdate([]);
        return () => {};
      }

      const q = query(
        collection(db, 'weekly_stats')
      );

      return onSnapshot(q, (snapshot) => {
        const standings = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .filter(p => p.weekStr === weekStr && (!p.cohortId || p.cohortId === cohortId) && (p.subject || 'math') === subject)
          .sort((a, b) => (b.sparks || 0) - (a.sparks || 0))
          .slice(0, limitCount)
          .map((player, index) => ({
            ...player,
            rank: index + 1
          }));
        onUpdate(standings);
      }, (error) => {
        console.warn('LeaderboardService: Firestore weekly subscription fallback', error);
        onUpdate([]);
      });
    } catch (error) {
      console.warn('LeaderboardService: Firestore weekly subscription error', error);
      onUpdate([]);
      return () => {};
    }
  }

  // Sync quest progress & elevation to Firestore
  async syncQuestScore({ profileId, name, totalXp = 0, level = 1, ascentTier = 1, ascentName = 'Sunny Trailhead', title = 'Basecamp Explorer', claimsCount = 0, equipped = [] }) {
    try {
      let user = this.currentUser || auth.currentUser;
      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (authErr) {
          return;
        }
      }

      if (!user || !user.uid) return;

      const baseUid = user.uid;
      const safeProfileId = profileId || 'default_child';
      const documentId = `${baseUid}_${safeProfileId}`;
      const userRef = doc(db, 'quest_stats', documentId);
      const anonymousName = getDeterministicAnonymousName(documentId);

      const payload = {
        uid: baseUid,
        profileId: safeProfileId,
        name: name || 'Kibo Climber',
        anonymousName: anonymousName,
        totalXp: Number(totalXp) || 0,
        level: Number(level) || 1,
        ascentTier: Number(ascentTier) || 1,
        ascentName: ascentName || 'Sunny Trailhead',
        title: title || 'Basecamp Explorer',
        claimsCount: Number(claimsCount) || 0,
        equipped: Array.isArray(equipped) ? equipped : [],
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      if (error?.code === 'permission-denied') {
        console.warn('LeaderboardService: Quest sync permission denied. Check Firestore security rules.');
      } else {
        console.warn('LeaderboardService: Failed to sync quest score', error);
      }
    }
  }

  // Subscribe to real-time Quest Elevation Leaderboard
  subscribeToQuestLeaderboard(limitCount = 30, onUpdate) {
    try {
      const q = query(
        collection(db, 'quest_stats'),
        orderBy('totalXp', 'desc'),
        limit(limitCount * 2)
      );

      return onSnapshot(q, (snapshot) => {
        const seenKeys = new Set();
        const standings = [];

        for (let i = 0; i < snapshot.docs.length; i++) {
          if (standings.length >= limitCount) break;

          const docSnap = snapshot.docs[i];
          const data = docSnap.data();

          const uniqueKey = data.uid && data.profileId
            ? `${data.uid}_${data.profileId}`
            : (data.name ? data.name.trim().toLowerCase() : docSnap.id);

          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            standings.push({
              id: docSnap.id,
              ...data,
              score: Number(data.totalXp) || 0,
              rank: standings.length + 1
            });
          }
        }

        onUpdate(standings);
      }, (error) => {
        console.warn('LeaderboardService: Firestore quest subscription fallback', error);
        onUpdate([]);
      });
    } catch (error) {
      console.warn('LeaderboardService: Firestore quest subscription error', error);
      onUpdate([]);
      return () => {};
    }
  }

  // ─── Friend System & Username Management ──────────────────────────────────
  async claimUsername(username, profileId = 'default_child', friendCode = null) {
    if (!username || typeof username !== 'string') {
      return { success: false, error: 'Please enter a username.' };
    }

    const trimmed = username.trim();
    const normalized = trimmed.toLowerCase();
    const cleanCode = (friendCode || storageService.getFriendCode(profileId) || '').trim().toUpperCase();

    try {
      let user = this.getCurrentUser();
      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (authErr) {
          console.warn('LeaderboardService: anonymous auth failed', authErr);
        }
      }

      if (!user || !user.uid) {
        return { success: false, error: 'Unable to authenticate user session.' };
      }

      const uid = user.uid;
      const usernameRef = doc(db, 'usernames', normalized);
      const codeRef = cleanCode ? doc(db, 'friend_codes', cleanCode) : null;

      // Check if username is already taken by another UID
      const existingSnap = await getDoc(usernameRef);
      if (existingSnap.exists()) {
        const data = existingSnap.data();
        if (data.uid && data.uid !== uid) {
          return { success: false, error: 'This username is already taken. Please choose another one.' };
        }
      }

      if (codeRef) {
        const existingCodeSnap = await getDoc(codeRef);
        if (existingCodeSnap.exists()) {
          const codeData = existingCodeSnap.data();
          if (codeData.uid && codeData.uid !== uid) {
            return { success: false, error: 'This climber code is already in use.' };
          }
        }
      }

      const payload = {
        username: trimmed,
        normalized,
        uid,
        profileId: profileId || 'default_child',
        claimedAt: serverTimestamp()
      };
      if (cleanCode) payload.friendCode = cleanCode;

      await setDoc(usernameRef, payload, { merge: true });

      if (codeRef) {
        await setDoc(codeRef, {
          friendCode: cleanCode,
          username: trimmed,
          normalized,
          uid,
          profileId: profileId || 'default_child',
          claimedAt: serverTimestamp()
        }, { merge: true });
      }

      return { success: true, username: trimmed, friendCode: cleanCode };
    } catch (error) {
      console.warn('LeaderboardService: direct Firestore claim error', error);
      return { success: false, error: error.message || 'Failed to claim username.' };
    }
  }

  async searchUsername(queryStr) {
    if (!queryStr || typeof queryStr !== 'string' || queryStr.trim().length < 2) {
      return { results: [] };
    }

    const trimmed = queryStr.trim();
    const normalized = trimmed.toLowerCase();
    const cleanCode = trimmed.toUpperCase();
    const localMatches = [];

    // Check local profiles so profiles under the same account / device are always discoverable by code
    try {
      const allProfiles = storageService.getAllProfiles ? storageService.getAllProfiles() : [];
      for (const p of allProfiles) {
        const pCode = (p.friendCode || '').trim().toUpperCase();
        if (pCode === cleanCode) {
          const uData = p.userData || {};
          const currentSubRating = uData.adaptiveCompetenceRating || 1000;
          localMatches.push({
            id: `${this.getCurrentUser()?.uid || 'local'}_${p.id}`,
            uid: this.getCurrentUser()?.uid || 'local',
            profileId: p.id,
            friendCode: pCode || storageService.getFriendCode(p.id),
            username: p.username || p.name,
            name: p.name || p.username,
            score: currentSubRating,
            equipped: p.shopState?.equippedItems || [],
            subjectsMastered: 5
          });
        }
      }
    } catch (e) {
      console.warn('LeaderboardService: Local profile search check', e);
    }

    let remoteResults = [];

    // Attempt Cloud Function (exact match by code)
    let cloudFunctionSucceeded = false;
    try {
      const searchFn = httpsCallable(functions, 'searchUsername');
      const res = await searchFn({ query: cleanCode, exact: true });
      if (res?.data?.results) {
        remoteResults = res.data.results;
        cloudFunctionSucceeded = true;
      }
    } catch (error) {
      // Cloud function failed (CORS / offline) - fall back to direct Firestore exact query
    }

    if (!cloudFunctionSucceeded) {
      try {
        let user = this.getCurrentUser();
        if (!user) {
          try {
            const userCred = await signInAnonymously(auth);
            user = userCred.user;
            this.currentUser = user;
          } catch (authErr) {}
        }

        // Helper timeout for offline/test environments
        const withTimeout = (promise, ms = 1200) =>
          Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
          ]);

        // COPPA Safe: Exact match only by friendCode
        let docs = [];
        
        // Exact friendCode lookup
        const codeQuery = query(
          collection(db, 'usernames'),
          where('friendCode', '==', cleanCode),
          limit(1)
        );
        try {
          const codeSnapshot = await withTimeout(getDocs(codeQuery));
          if (codeSnapshot && !codeSnapshot.empty) {
            docs = codeSnapshot.docs;
          }
        } catch (e) {}

        if (docs.length > 0) {
          const fetchPromises = docs.map(async (docSnap) => {
            const uData = docSnap.data();
            const friendUid = uData.uid;
            const friendProfileId = uData.profileId || 'default_child';
            const friendDocId = `${friendUid}_${friendProfileId}_math`;

            let score = 1000;
            let equipped = [];
            let subjectsMastered = 5;

            try {
              const lbDoc = await withTimeout(getDoc(doc(db, LEADERBOARD_COLLECTION, friendDocId)), 800);
              if (lbDoc.exists()) {
                const lbData = lbDoc.data();
                score = lbData.score || 1000;
                equipped = lbData.equipped || [];
                subjectsMastered = lbData.subjectsMastered || 5;
              }
            } catch (e) {}

            return {
              id: `${friendUid}_${friendProfileId}`,
              uid: friendUid,
              profileId: friendProfileId,
              friendCode: uData.friendCode || cleanCode,
              username: uData.username || docSnap.id,
              name: uData.username || docSnap.id,
              score,
              equipped,
              subjectsMastered
            };
          });

          const results = await Promise.all(fetchPromises);
          remoteResults.push(...results);
        }
      } catch (firestoreErr) {
        console.warn('LeaderboardService: direct Firestore search fallback error', firestoreErr);
      }
    }

    // Merge and deduplicate results
    const combined = [...localMatches, ...remoteResults];
    const seen = new Set();
    const results = [];

    for (const item of combined) {
      const key = (item.username || item.name || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        results.push(item);
      }
    }

    return { results };
  }

  async fetchFriendScores(subject = 'math', friendIds = []) {
    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      return { standings: [] };
    }

    try {
      const getScoresFn = httpsCallable(functions, 'getFriendScores');
      const res = await getScoresFn({ subject, friendIds });
      if (res?.data?.standings && res.data.standings.length > 0) {
        return { standings: res.data.standings };
      }
    } catch (error) {
      console.warn('LeaderboardService: fetchFriendScores fallback', error);
    }

    // Direct Firestore fallback
    try {
      const safeFriendIds = friendIds.slice(0, 25);
      const promises = safeFriendIds.map(async (fId) => {
        const parts = fId.split('_');
        let docId = `${fId}_${subject}`;
        if (parts.length === 1) {
          docId = `${fId}_default_child_${subject}`;
        }
        try {
          const lbDoc = await getDoc(doc(db, LEADERBOARD_COLLECTION, docId));
          if (lbDoc.exists()) {
            const data = lbDoc.data();
            return {
              id: fId,
              uid: data.uid || parts[0],
              profileId: data.profileId || parts[1] || 'default_child',
              name: data.name || 'Climber Friend',
              score: Number(data.score) || 1000,
              equipped: data.equipped || [],
              subjectsMastered: data.subjectsMastered || 5,
              subject
            };
          }
        } catch (e) {}
        return null;
      });
      const results = await Promise.all(promises);
      const standings = results.filter(Boolean);
      return { standings };
    } catch (err) {
      return { standings: [] };
    }
  }

  // ─── Cloud Friend Request Sync (Mutual Ask & Accept) ──────────────────────
  async sendCloudFriendRequest(receiverUser, senderProfile) {
    try {
      let user = this.getCurrentUser();
      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (e) {}
      }

      if (!user) return false;

      const senderUid = user.uid;
      const senderProfileId = senderProfile?.id || 'default_child';
      const senderUsername = senderProfile?.username || 'Climber Friend';
      const receiverUid = receiverUser.uid;
      const receiverProfileId = receiverUser.profileId || 'default_child';

      const requestId = `${senderUid}_${receiverUid}_${Date.now()}`;
      await setDoc(doc(db, 'friend_requests', requestId), {
        id: requestId,
        senderUid,
        senderProfileId,
        senderUsername,
        senderScore: senderProfile?.score || 1000,
        senderEquipped: senderProfile?.equipped || [],
        senderSubjectsMastered: senderProfile?.subjectsMastered || 5,
        receiverUid,
        receiverProfileId,
        receiverUsername: receiverUser.username || receiverUser.name,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.warn('LeaderboardService: sendCloudFriendRequest error', err);
      return false;
    }
  }

  async fetchCloudFriendRequests(profileId = null) {
    try {
      const user = this.getCurrentUser();
      if (!user) return { received: [], sent: [], acceptedSent: [] };

      const receivedQuery = query(
        collection(db, 'friend_requests'),
        where('receiverUid', '==', user.uid),
        where('status', '==', 'pending'),
        limit(25)
      );

      const sentQuery = query(
        collection(db, 'friend_requests'),
        where('senderUid', '==', user.uid),
        where('status', '==', 'pending'),
        limit(25)
      );

      const acceptedSentQuery = query(
        collection(db, 'friend_requests'),
        where('senderUid', '==', user.uid),
        where('status', '==', 'accepted'),
        limit(25)
      );

      const [receivedSnap, sentSnap, acceptedSentSnap] = await Promise.all([
        getDocs(receivedQuery).catch(() => ({ empty: true, docs: [] })),
        getDocs(sentQuery).catch(() => ({ empty: true, docs: [] })),
        getDocs(acceptedSentQuery).catch(() => ({ empty: true, docs: [] }))
      ]);

      const received = [];
      if (!receivedSnap.empty) {
        receivedSnap.docs.forEach(docSnap => {
          received.push({ ...docSnap.data(), id: docSnap.id });
        });
      }

      const sent = [];
      if (!sentSnap.empty) {
        sentSnap.docs.forEach(docSnap => {
          sent.push({ ...docSnap.data(), id: docSnap.id });
        });
      }

      const acceptedSent = [];
      if (!acceptedSentSnap.empty) {
        acceptedSentSnap.docs.forEach(docSnap => {
          acceptedSent.push({ ...docSnap.data(), id: docSnap.id });
        });
      }

      return { received, sent, acceptedSent };
    } catch (err) {
      console.warn('LeaderboardService: fetchCloudFriendRequests error', err);
      return { received: [], sent: [], acceptedSent: [] };
    }
  }

  async respondToCloudFriendRequest(requestId, action = 'accept') {
    try {
      const reqRef = doc(db, 'friend_requests', requestId);
      if (action === 'accept') {
        await setDoc(reqRef, { status: 'accepted', respondedAt: serverTimestamp() }, { merge: true });
      } else {
        await deleteDoc(reqRef);
      }
      return true;
    } catch (err) {
      console.warn('LeaderboardService: respondToCloudFriendRequest error', err);
      return false;
    }
  }

  /**
   * Connects two climbers mutually via Climber Code (Direct QR scan / physical handshake).
   * Automatically adds the target friend to the local profile, and writes an 'accepted' request
   * record to Firestore so the other player's client auto-adds them in real-time.
   */
  async connectMutualFriendByCode(climberCode, currentProfile = null) {
    try {
      const cleanCode = (climberCode || '').trim().toUpperCase();
      if (!cleanCode) return { success: false, error: 'Invalid climber code' };

      const activeProfile = currentProfile || storageService.getActiveProfile();
      const activePid = activeProfile?.id || storageService.getActiveProfileId();
      const myClimberCode = storageService.getFriendCode(activePid);

      if (cleanCode === myClimberCode) {
        return { success: false, error: "That's your own Climber Code!" };
      }

      // Search for the friend by code
      const { results } = await this.searchUsername(cleanCode);
      if (!results || results.length === 0) {
        return { success: false, error: `No climber found with code ${cleanCode}` };
      }

      const targetClimber = results[0];
      const targetFriendId = targetClimber.id || targetClimber.uid || targetClimber.username;

      // Add to local friends list immediately
      storageService.addFriend({
        id: targetFriendId,
        uid: targetClimber.uid,
        profileId: targetClimber.profileId || 'default_child',
        username: targetClimber.username || targetClimber.name || 'Climber Friend',
        name: targetClimber.name || targetClimber.username || 'Climber Friend',
        score: targetClimber.score || 1000,
        equipped: targetClimber.equipped || [],
        subjectsMastered: targetClimber.subjectsMastered || 5
      }, activePid);

      // Write accepted mutual request to cloud for the other device
      let user = this.getCurrentUser();
      if (!user) {
        try {
          const userCred = await signInAnonymously(auth);
          user = userCred.user;
          this.currentUser = user;
        } catch (e) {}
      }

      if (user && targetClimber.uid) {
        const senderUid = user.uid;
        const senderProfileId = activePid;
        const senderUsername = activeProfile?.username || activeProfile?.name || 'Climber Friend';
        const senderRating = activeProfile?.userData?.adaptiveCompetenceRating || 1000;
        const senderEquipped = activeProfile?.shopState?.equippedItems || [];
        const senderTricks = Object.keys(activeProfile?.userData?.masteredTricks || {}).length || 5;

        // Auto-accepted 2-way friendship request doc
        const mutualRequestId = `mutual_${senderUid}_${targetClimber.uid}_${Date.now()}`;
        await setDoc(doc(db, 'friend_requests', mutualRequestId), {
          id: mutualRequestId,
          senderUid,
          senderProfileId,
          senderUsername,
          senderScore: senderRating,
          senderEquipped,
          senderSubjectsMastered: senderTricks,
          receiverUid: targetClimber.uid,
          receiverProfileId: targetClimber.profileId || 'default_child',
          receiverUsername: targetClimber.username || targetClimber.name,
          status: 'accepted',
          isDirectQrScan: true,
          createdAt: serverTimestamp(),
          respondedAt: serverTimestamp()
        });
      }

      return {
        success: true,
        friend: targetClimber
      };
    } catch (err) {
      console.warn('LeaderboardService: connectMutualFriendByCode error', err);
      return { success: false, error: err.message || 'Failed to connect climber' };
    }
  }
}


export const leaderboardService = new LeaderboardService();
