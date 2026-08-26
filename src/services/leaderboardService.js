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

      const payload = {
        uid: baseUid,
        profileId: safeProfileId,
        subject: safeSubject,
        name: name || 'Kibo Climber',
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
        const rawDocs = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .filter(p => (p.subject || 'math') === (subject || 'math'));

        // Deduplicate remote entries: if the same player exists multiple times across sessions, keep highest score
        const seenKeys = new Set();
        const deduplicated = [];

        for (const player of rawDocs) {
          const uniqueKey = player.uid && player.profileId 
            ? `${player.uid}_${player.profileId}` 
            : (player.name ? player.name.trim().toLowerCase() : player.id);
          
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            deduplicated.push(player);
          }
        }

        const standings = deduplicated
          .slice(0, limitCount)
          .map((player, index) => ({
            ...player,
            rank: index + 1
          }));
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

      const payload = {
        uid: baseUid,
        profileId: safeProfileId,
        subject: safeSubject,
        name: name || 'Kibo Climber',
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

  // ─── Friend System & Username Management ──────────────────────────────────
  async claimUsername(username, profileId = 'default_child') {
    if (!username || typeof username !== 'string') {
      return { success: false, error: 'Please enter a username.' };
    }

    const trimmed = username.trim();
    const normalized = trimmed.toLowerCase();

    try {
      const claimFn = httpsCallable(functions, 'claimUsername');
      const res = await claimFn({ username: trimmed, profileId });
      return { success: true, username: res.data?.username || trimmed };
    } catch (error) {
      // If error is already-exists, surface human-readable message
      if (error?.code === 'functions/already-exists' || error?.message?.includes('already taken')) {
        return { success: false, error: 'This username is already taken. Please choose another one.' };
      }
      
      console.warn('LeaderboardService: claimUsername network fallback to direct Firestore', error);
      
      try {
        let user = this.getCurrentUser();
        if (!user) {
          try {
            const userCred = await signInAnonymously(auth);
            user = userCred.user;
            this.currentUser = user;
          } catch (authErr) {}
        }

        if (user && user.uid) {
          const usernameRef = doc(db, 'usernames', normalized);
          const existingSnap = await getDoc(usernameRef);
          if (existingSnap.exists()) {
            const data = existingSnap.data();
            if (data.uid && data.uid !== user.uid) {
              return { success: false, error: 'This username is already taken. Please choose another one.' };
            }
          }
          await setDoc(usernameRef, {
            username: trimmed,
            normalized,
            uid: user.uid,
            profileId: profileId || 'default_child',
            claimedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('LeaderboardService: direct Firestore claim error', firestoreErr);
      }

      return { success: true, username: trimmed, isOfflineFallback: true };
    }
  }

  async searchUsername(queryStr) {
    if (!queryStr || typeof queryStr !== 'string' || queryStr.trim().length < 2) {
      return { results: [] };
    }

    const trimmed = queryStr.trim();
    const normalized = trimmed.toLowerCase();
    const localMatches = [];

    // Check local profiles so profiles under the same account / device are always discoverable
    try {
      const rawProfilesData = localStorage.getItem('kibo_profiles_data');
      if (rawProfilesData) {
        const parsed = JSON.parse(rawProfilesData);
        const profilesMap = parsed.profiles || {};
        for (const pId of Object.keys(profilesMap)) {
          const p = profilesMap[pId];
          const pName = (p.username || p.name || '').trim();
          if (pName && pName.toLowerCase().includes(normalized)) {
            const uData = p.userData || {};
            const currentSubRating = uData.adaptiveCompetenceRating || 1000;
            localMatches.push({
              id: `${this.getCurrentUser()?.uid || 'local'}_${p.id}`,
              uid: this.getCurrentUser()?.uid || 'local',
              profileId: p.id,
              username: p.username || p.name,
              name: p.name || p.username,
              score: currentSubRating,
              equipped: p.shopState?.equippedItems || [],
              subjectsMastered: 5
            });
          }
        }
      }
    } catch (e) {
      console.warn('LeaderboardService: Local profile search check', e);
    }

    let remoteResults = [];

    // Attempt Cloud Function
    let cloudFunctionSucceeded = false;
    try {
      const searchFn = httpsCallable(functions, 'searchUsername');
      const res = await searchFn({ query: trimmed });
      if (res?.data?.results) {
        remoteResults = res.data.results;
        cloudFunctionSucceeded = true;
      }
    } catch (error) {
      // Cloud function failed (CORS / offline) - fall back to direct Firestore query
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

        const q = query(
          collection(db, 'usernames'),
          where('normalized', '>=', normalized),
          where('normalized', '<=', normalized + '\uf8ff'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          for (const docSnap of snapshot.docs) {
            const uData = docSnap.data();
            const friendUid = uData.uid;
            const friendProfileId = uData.profileId || 'default_child';
            const friendDocId = `${friendUid}_${friendProfileId}_math`;

            let score = 1000;
            let equipped = [];
            let subjectsMastered = 5;

            try {
              const lbDoc = await getDoc(doc(db, LEADERBOARD_COLLECTION, friendDocId));
              if (lbDoc.exists()) {
                const lbData = lbDoc.data();
                score = lbData.score || 1000;
                equipped = lbData.equipped || [];
                subjectsMastered = lbData.subjectsMastered || 5;
              }
            } catch (e) {}

            remoteResults.push({
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
}

export const leaderboardService = new LeaderboardService();
