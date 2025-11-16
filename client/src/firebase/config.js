// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhJoYms2hyFPfMmXGEJb88tN_BWG2-E_0",
  authDomain: "hospital-management-syst-87670.firebaseapp.com",
  projectId: "hospital-management-syst-87670",
  storageBucket: "hospital-management-syst-87670.firebasestorage.app",
  messagingSenderId: "639264376349",
  appId: "1:639264376349:web:6214ee679b54a4ea33a8f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

