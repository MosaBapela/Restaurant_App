import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../../types/user.types';
import { auth, db } from './config';

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  userData: Omit<User, 'uid' | 'email' | 'createdAt'>
): Promise<User> => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: `${userData.name} ${userData.surname}`,
    });

    // Create user document
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      ...userData,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

    return newUser;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to register user');
  }
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to login');
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send reset email');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};