import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCrp1q7NlfttWmrADsk6Af6jXpugUNxVqM",
  authDomain: "hospital-management--system.firebaseapp.com",
  projectId: "hospital-management--system",
  storageBucket: "hospital-management--system.firebasestorage.app",
  messagingSenderId: "213359605258",
  appId: "1:213359605258:web:b304b0ac7e52496b8491f3",
  measurementId: "G-CCTJDRQN91"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
