import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Address, PaymentCard, User } from '../../types/user.types';
import { db } from './config';

const USERS_COLLECTION = 'users';

/**
 * Fetch user profile
 */
export const fetchUserProfile = async (userId: string): Promise<User> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('User not found');
    }
    
    return docSnap.data() as User;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user profile');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Add user address
 */
export const addUserAddress = async (
  userId: string,
  address: Address
): Promise<void> => {
  try {
    const userDoc = await fetchUserProfile(userId);
    const updatedAddresses = [...userDoc.addresses, address];
    await updateUserProfile(userId, { addresses: updatedAddresses });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add address');
  }
};

/**
 * Update user address
 */
export const updateUserAddress = async (
  userId: string,
  addressId: string,
  updates: Partial<Address>
): Promise<void> => {
  try {
    const userDoc = await fetchUserProfile(userId);
    const updatedAddresses = userDoc.addresses.map((addr) =>
      addr.id === addressId ? { ...addr, ...updates } : addr
    );
    await updateUserProfile(userId, { addresses: updatedAddresses });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update address');
  }
};

/**
 * Delete user address
 */
export const deleteUserAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    const userDoc = await fetchUserProfile(userId);
    const updatedAddresses = userDoc.addresses.filter(
      (addr) => addr.id !== addressId
    );
    await updateUserProfile(userId, { addresses: updatedAddresses });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete address');
  }
};

/**
 * Add payment card
 */
export const addPaymentCard = async (
  userId: string,
  card: PaymentCard
): Promise<void> => {
  try {
    const userDoc = await fetchUserProfile(userId);
    const updatedCards = [...userDoc.paymentCards, card];
    await updateUserProfile(userId, { paymentCards: updatedCards });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add payment card');
  }
};

/**
 * Delete payment card
 */
export const deletePaymentCard = async (
  userId: string,
  cardId: string
): Promise<void> => {
  try {
    const userDoc = await fetchUserProfile(userId);
    const updatedCards = userDoc.paymentCards.filter(
      (card) => card.id !== cardId
    );
    await updateUserProfile(userId, { paymentCards: updatedCards });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete payment card');
  }
};