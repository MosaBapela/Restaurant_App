import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';
import { timeAsync } from './timing';

/**
 * Upload a file (image) located at `fileUri` to Firebase Storage at `path`.
 * Works with Expo/React Native URIs (file:// or local asset) and web blob URLs.
 * Returns the publicly-accessible download URL.
 *
 * Example: await uploadImage(`food_images/${Date.now()}_pizza.jpg`, uri)
 */
export const uploadImage = async (path: string, fileUri: string, contentType?: string): Promise<string> => {
  if (!storage) throw new Error('Firebase Storage not initialized');

  return timeAsync(`storage:upload:${path}`, async () => {
    // Convert local file URI to Blob (works in Expo and browsers)
    const response = await fetch(fileUri);
    const blob = await response.blob();

  const storageRef = ref(storage!, path);
    // Upload the blob
    await uploadBytes(storageRef, blob, { contentType: contentType ?? blob.type ?? 'application/octet-stream' });
    // Return download URL
    const url = await getDownloadURL(storageRef);
    return url;
  });
};

/** Delete a file at given storage path */
export const deleteFile = async (path: string): Promise<void> => {
  if (!storage) throw new Error('Firebase Storage not initialized');
  return timeAsync(`storage:delete:${path}`, async () => {
  const storageRef = ref(storage!, path);
    await deleteObject(storageRef);
  });
};

export const uploadFoodImage = async (fileUri: string, foodId: string): Promise<string> => {
  const path = `food_images/${foodId}_${Date.now()}.jpg`;
  return uploadImage(path, fileUri);
};

export const uploadProfileImage = async (fileUri: string, userId: string): Promise<string> => {
  const path = `profile_images/${userId}_${Date.now()}.jpg`;
  return uploadImage(path, fileUri);
};

export default {
  uploadImage,
  deleteFile,
  uploadFoodImage,
  uploadProfileImage,
};