import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload image to Firebase Storage
 */
export const uploadImage = async (
  uri: string,
  path: string
): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Delete image from Firebase Storage
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete image');
  }
};

/**
 * Upload food image
 */
export const uploadFoodImage = async (
  uri: string,
  foodId: string
): Promise<string> => {
  const path = `food_images/${foodId}_${Date.now()}.jpg`;
  return uploadImage(uri, path);
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (
  uri: string,
  userId: string
): Promise<string> => {
  const path = `profile_images/${userId}.jpg`;
  return uploadImage(uri, path);
};

// ==========================================
// FILE: src/services/payment/paymentService.ts
// ==========================================
/**
 * Payment Service
 * This is a placeholder for payment integration
 * Integrate with Stripe, PayPal, or other payment providers
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Process payment
 * Replace with actual payment gateway integration
 */
export const processPayment = async (
  amount: number,
  cardToken: string
): Promise<PaymentResult> => {
  try {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock success response
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment failed',
    };
  }
};

/**
 * Refund payment
 * Replace with actual payment gateway integration
 */
export const refundPayment = async (
  transactionId: string
): Promise<PaymentResult> => {
  try {
    // Simulate refund processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      transactionId: `ref_${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};

/**
 * Validate card
 * Basic validation before payment
 */
export const validateCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
};