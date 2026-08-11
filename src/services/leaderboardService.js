// src/services/leaderboardService.js
import { db, auth } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
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
  async syncUserScore({ profileId, name, score, subjectsMastered = 5, equipped = [] }) {
    try {
      // Wait for auth if signing in
      if (!this.currentUser && auth.currentUser) {
        this.currentUser = auth.currentUser;
      }

      const uid = this.currentUser ? this.currentUser.uid : (profileId || 'local_user');
      const userRef = doc(db, LEADERBOARD_COLLECTION, uid);

      const payload = {
        uid,
        name: name || 'Kibo Climber',
        score: Number(score) || 1000,
        subjectsMastered: Number(subjectsMastered) || 0,
        equipped: Array.isArray(equipped) ? equipped : [],
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      console.warn('LeaderboardService: Failed to sync score to Firestore (check security rules / network)', error);
    }
  }

  // Real-time listener for top standings
  subscribeToLeaderboard(limitCount = 20, onUpdate) {
    try {
      const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('score', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot) => {
        const standings = snapshot.docs.map((docSnap, index) => ({
          id: docSnap.id,
          rank: index + 1,
          ...docSnap.data()
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
}

export const leaderboardService = new LeaderboardService();
