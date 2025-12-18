import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './profileService';
import { User } from '../../types/user.types';
import { timeAsync } from './timing';
import { Platform } from 'react-native';

async function quickNetworkCheck(timeout = 3000) {
  // On web, many third-party hosts (e.g. google.com) block CORS for browser fetch probes.
  // Use navigator.onLine as a lightweight heuristic for connectivity in browsers.
  if (Platform.OS === 'web') {
    try {
      // navigator may be undefined in some test envs
      // eslint-disable-next-line no-undef
      return (globalThis as any).navigator?.onLine === true;
    } catch (e) {
      return false;
    }
  }

  // For native runtimes, perform a short fetch to a CORS-friendly endpoint.
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    // gstatic generate_204 is lightweight and commonly reachable.
    const res = await fetch('https://www.gstatic.com/generate_204', { method: 'GET', signal: controller.signal });
    clearTimeout(id);
    return res.ok || res.status === 204;
  } catch (err) {
    clearTimeout(id);
    return false;
  }
}

/**
 * Register a new user with email and password. Returns the UserCredential.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  profileData: { name?: string; surname?: string; contactNumber?: string; addresses?: any[] } = {}
): Promise<{ credential: UserCredential; profile: User | null }> {
  if (!auth) throw new Error('Firebase Auth not initialized. Check your EXPO_PUBLIC_FIREBASE_* env vars.');
  const credential = await timeAsync('createUserWithEmailAndPassword', () =>
    createUserWithEmailAndPassword(auth!, email, password)
  );

  let profile: User | null = null;
  try {
    profile = await timeAsync('createUserProfile', () =>
      createUserProfile(credential.user.uid, {
        email: credential.user.email ?? null,
        name: profileData.name ?? null,
        surname: profileData.surname ?? null,
        contactNumber: profileData.contactNumber ?? null,
        addresses: profileData.addresses ?? [],
      })
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[auth] createUserProfile failed:', (err as Error).message);
  }
  return { credential, profile };
}

/**
 * Sign in an existing user with email and password. Returns the UserCredential.
 */
export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!auth) throw new Error('Firebase Auth not initialized. Check your EXPO_PUBLIC_FIREBASE_* env vars.');
  try {
    // Diagnostic: quick network probe to give a clearer error message on emulator/dev
    const canReach = await quickNetworkCheck();
    if (!canReach) {
      // eslint-disable-next-line no-console
      console.error('[auth] network check failed: runtime cannot reach external https endpoints.');
      throw new Error('Network appears to be unavailable from the JS runtime (emulator/device). Please check emulator network, device internet, or Windows firewall and restart the Metro bundler.');
    }
    return await timeAsync('signInWithEmail', () => signInWithEmailAndPassword(auth!, email, password));
  } catch (err: any) {
    // Log Firebase error info (useful during dev to inspect REST response body)
    // eslint-disable-next-line no-console
    console.error('[auth] signInWithEmail error:', {
      message: err?.message,
      code: err?.code,
      customData: err?.customData,
      serverResponse: err?.serverResponse ?? err,
    });
    throw err;
  }
}

/** Sign out current user */
export async function signOutUser(): Promise<void> {
  if (!auth) return;
  // Allow callers to perform optimistic logout and call signOut in background.
  await timeAsync('signOut', () => firebaseSignOut(auth!));
}