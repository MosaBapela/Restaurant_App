import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { User, Address, PaymentCard } from '../../types/user.types';

type ProfileData = Partial<{
  email: string | null;
  name: string | null;
  surname: string | null;
  contactNumber: string | null;
  addresses: Address[];
  isAdmin: boolean;
}>;

const USERS_COLLECTION = 'users';

function normalizeDocToUser(data: any): User {
  const createdAtField = data?.createdAt;
  let createdAtNumber: number;
  if (
    createdAtField &&
    typeof createdAtField === 'object' &&
    typeof (createdAtField as Timestamp).toMillis === 'function'
  ) {
    createdAtNumber = (createdAtField as Timestamp).toMillis();
  } else if (typeof createdAtField === 'number') {
    createdAtNumber = createdAtField;
  } else {
    createdAtNumber = Date.now();
  }

  return {
    uid: data.uid,
    email: data.email ?? '',
    name: data.name ?? '',
    surname: data.surname ?? '',
    contactNumber: data.contactNumber ?? '',
    addresses: data.addresses ?? [],
    paymentCards: data.paymentCards ?? [],
    createdAt: createdAtNumber,
    isAdmin: data.isAdmin ?? false,
  } as User;
}

/**
 * Create or merge a user profile document at users/{uid} using serverTimestamp for createdAt.
 * Returns the normalized User (with createdAt as number).
 */
export async function createUserProfile(
  uid: string,
  data: ProfileData = {}
): Promise<User> {
  if (!db) throw new Error('Firestore not initialized');
  const ref = doc(db, USERS_COLLECTION, uid);

  const payload: any = {
    uid,
    email: data.email ?? null,
    name: data.name ?? '',
    surname: data.surname ?? '',
    contactNumber: data.contactNumber ?? '',
    addresses: data.addresses ?? [],
    paymentCards: [],
    isAdmin: data.isAdmin ?? false,
    createdAt: serverTimestamp(),
  };

  // Write the document and return a client-normalized user immediately.
  // We intentionally avoid reading the document back here so the call is non-blocking.
  await setDoc(ref, payload, { merge: true });

  // Return a best-effort user object using a client timestamp. Caller may reconcile
  // with Firestore later via getUserProfile() to obtain serverTimestamp values.
  return normalizeDocToUser({ ...payload, createdAt: Date.now() });
}

/**
 * Get a user profile and normalize createdAt to a number.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  if (!db) throw new Error('Firestore not initialized');
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeDocToUser(snap.data());
}

/**
 * Update fields on the user profile and return the updated normalized User.
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<User> {
  if (!db) throw new Error('Firestore not initialized');
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, updates as any);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('User not found');
  return normalizeDocToUser(snap.data());
}

export async function addUserAddress(uid: string, address: Address): Promise<User> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  const updated = { ...user, addresses: [...user.addresses, address] };
  return updateUserProfile(uid, { addresses: updated.addresses });
}

export async function updateUserAddress(
  uid: string,
  addressId: string,
  updates: Partial<Address>
): Promise<User> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  const addresses = user.addresses.map((a) => (a.id === addressId ? { ...a, ...updates } : a));
  return updateUserProfile(uid, { addresses });
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<User> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  const addresses = user.addresses.filter((a) => a.id !== addressId);
  return updateUserProfile(uid, { addresses });
}

export async function addPaymentCard(uid: string, card: PaymentCard): Promise<User> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  const paymentCards = [...user.paymentCards, card];
  return updateUserProfile(uid, { paymentCards });
}

export async function deletePaymentCard(uid: string, cardId: string): Promise<User> {
  const user = await getUserProfile(uid);
  if (!user) throw new Error('User not found');
  const paymentCards = user.paymentCards.filter((c) => c.id !== cardId);
  return updateUserProfile(uid, { paymentCards });
}