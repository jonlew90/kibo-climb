// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChxuSodJZU61Gwd3_yhs7oAHwoqQm_UEM",
  authDomain: "kibo-climb.firebaseapp.com",
  projectId: "kibo-climb",
  storageBucket: "kibo-climb.firebasestorage.app",
  messagingSenderId: "171658556844",
  appId: "1:171658556844:web:8cae9e926818529ef0b609",
  measurementId: "G-PNQ5D8DFHP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
