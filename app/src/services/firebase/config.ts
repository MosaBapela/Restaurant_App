// Firebase initialization using Expo/React Native (modular SDK v9+)
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// Read config from environment (Expo will expose EXPO_PUBLIC_ vars to the client)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // measurementId is optional
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize the Firebase App instance safely. If env vars are missing we warn but
// avoid throwing to keep the dev server running.
let firebaseApp: FirebaseApp | null = null;
if (!getApps().length) {
  if (!firebaseConfig.apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[firebase] EXPO_PUBLIC_FIREBASE_API_KEY not found — copy .env.example to .env and fill values from Firebase console.');
  }
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firebase] initializeApp failed:', (err as Error).message);
    firebaseApp = null;
  }
} else {
  firebaseApp = getApps()[0];
}

// Export initialized services (may be `null` when not initialized — callers should handle that)
export const app: FirebaseApp | null = firebaseApp;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

export default firebaseApp;
