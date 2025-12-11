import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely — don't crash the bundler when env vars are missing
let app: any = null;
try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase API key (EXPO_PUBLIC_FIREBASE_API_KEY)');
  }
  app = initializeApp(firebaseConfig);
} catch (err) {
  const error = err as Error | undefined;
  // Log a warning during development; avoid throwing to keep the dev server up
  // The rest of the app should handle missing firebase services gracefully.
  // eslint-disable-next-line no-console
  console.warn('Firebase initialization skipped:', error?.message ?? String(err));
}

// Initialize Firebase services only when app is available
export const auth = app ? getAuth(app) : (null as any);
export const db = app ? getFirestore(app) : (null as any);
export const storage = app ? getStorage(app) : (null as any);

export default app;
