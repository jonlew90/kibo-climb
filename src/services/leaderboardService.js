// src/services/leaderboardService.js
import { db, auth, functions } from '../config/firebase.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
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

}

export const leaderboardService = new LeaderboardService();
