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
        const standings = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .filter(p => (p.subject || 'math') === (subject || 'math'))
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
}

export const leaderboardService = new LeaderboardService();
