/**
 * Firebase App — Singleton Initializer
 * Initializes Firebase once for the whole app.
 * Services (Firestore, Auth, Storage, Messaging) are
 * exported from here for use in service modules.
 *
 * Firebase Console: https://console.firebase.google.com
 * Project: vantage-match
 *
 * Collections structure in Firestore:
 *   /profiles/{userId}      — user profile docs
 *   /matches/{matchId}      — match docs (both users keyed)
 *   /messages/{matchId}/msgs/{msgId} — sub-collection per match
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guard against double-initialization in Vite HMR
const app: FirebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

export const isFirebaseConfigured = (): boolean =>
  !!(firebaseConfig.apiKey && firebaseConfig.projectId);

export default app;
