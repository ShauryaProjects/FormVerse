// Firebase initialization for FormVerse client
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtfo6LMMuAk67_3Ugbmz4BwcQ2rssvDjA",
  authDomain: "formify-f411f.firebaseapp.com",
  projectId: "formify-f411f",
  storageBucket: "formify-f411f.firebasestorage.app",
  messagingSenderId: "274952070691",
  appId: "1:274952070691:web:75bdc068e9812195f2b396",
  measurementId: "G-GVVY1CB1TH"
};

// Initialize Firebase (guard against re-init on HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Analytics is optional in SSR; wrap in try in case window is undefined
let analytics;
try { analytics = getAnalytics(app); } catch {}

// Auth + Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Storage and Firestore
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;