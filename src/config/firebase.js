// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyChxuSodJZU61Gwd3_yhs7oAHwoqQm_UEM",
  authDomain: "kibo-climb.firebaseapp.com",
  projectId: "kibo-climb",
  storageBucket: "kibo-climb.firebasestorage.app",
  messagingSenderId: "171658556844",
  appId: "1:171658556844:web:8cae9e926818529ef0b609",
  measurementId: "G-PNQ5D8DFHP"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics conditionally (it may not be supported in some environments like Node.js)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export { analytics };
