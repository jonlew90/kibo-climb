// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyChxuSodJZU61Gwd3_yhs7oAHwoqQm_UEM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kibo-climb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kibo-climb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kibo-climb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "171658556844",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:171658556844:web:8cae9e926818529ef0b609",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PNQ5D8DFHP"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics conditionally (only in production on kiboclimb.com)
let analytics = null;
const isProductionHost = typeof window !== 'undefined' && (
  window.location.hostname === 'kiboclimb.com' ||
  window.location.hostname === 'www.kiboclimb.com'
);

if (isProductionHost) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(console.error);
}

export { analytics };

