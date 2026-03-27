import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
    updateDoc,
    where,
} from 'firebase/firestore';
import { FoodCategory, FoodItem } from '../../types/food.types';
import { auth, db } from './config';

const FOOD_COLLECTION = 'foods';

/**
 * Fetch all food items
 */
export const fetchFoodItems = async (): Promise<FoodItem[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db!, FOOD_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map((d) => {
      const data = d.data() as any;
      // normalize timestamp fields
      const createdAt = data?.createdAt && typeof (data.createdAt as any).toMillis === 'function'
        ? (data.createdAt as Timestamp).toMillis()
        : typeof data.createdAt === 'number'
        ? data.createdAt
        : Date.now();
      const updatedAt = data?.updatedAt && typeof (data.updatedAt as any).toMillis === 'function'
        ? (data.updatedAt as Timestamp).toMillis()
        : typeof data.updatedAt === 'number'
        ? data.updatedAt
        : createdAt;

      return ({
        id: d.id,
        ...data,
        createdAt,
        updatedAt,
      } as unknown) as FoodItem;
    });
  } catch (error: any) {
    // include auth state in error for easier debugging on web vs native
     
    console.error('[foodService] fetchFoodItems failed', { error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to fetch food items');
  }
};

/**
 * Fetch food items by category
 */
export const fetchFoodItemsByCategory = async (
  category: FoodCategory
): Promise<FoodItem[]> => {
  try {
    const q = query(collection(db!, FOOD_COLLECTION), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => {
      const data = d.data() as any;
      const createdAt = data?.createdAt && typeof (data.createdAt as any).toMillis === 'function'
        ? (data.createdAt as Timestamp).toMillis()
        : typeof data.createdAt === 'number'
        ? data.createdAt
        : Date.now();
      const updatedAt = data?.updatedAt && typeof (data.updatedAt as any).toMillis === 'function'
        ? (data.updatedAt as Timestamp).toMillis()
        : typeof data.updatedAt === 'number'
        ? data.updatedAt
        : createdAt;

      return ({
        id: d.id,
        ...data,
        createdAt,
        updatedAt,
      } as unknown) as FoodItem;
    });
  } catch (error: any) {
     
    console.error('[foodService] fetchFoodItemsByCategory failed', { error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to fetch food items by category');
  }
};

/**
 * Fetch single food item
 */
export const fetchFoodItem = async (foodId: string): Promise<FoodItem> => {
  try {
  const docRef = doc(db!, FOOD_COLLECTION, foodId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Food item not found');
    }
    const data = docSnap.data() as any;
    const createdAt = data?.createdAt && typeof (data.createdAt as any).toMillis === 'function'
      ? (data.createdAt as Timestamp).toMillis()
      : typeof data.createdAt === 'number'
      ? data.createdAt
      : Date.now();
    const updatedAt = data?.updatedAt && typeof (data.updatedAt as any).toMillis === 'function'
      ? (data.updatedAt as Timestamp).toMillis()
      : typeof data.updatedAt === 'number'
      ? data.updatedAt
      : createdAt;

    return {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
    } as FoodItem;
  } catch (error: any) {
     
    console.error('[foodService] fetchFoodItem failed', { foodId, error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to fetch food item');
  }
};

/**
 * Add new food item
 */
export const addFoodItem = async (
  foodItem: Omit<FoodItem, 'id'>
): Promise<string> => {
  try {
    const payload: any = {
      ...foodItem,
      // store createdAt as server timestamp and updatedAt as now
      createdAt: serverTimestamp(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db!, FOOD_COLLECTION), payload);
    return docRef.id;
  } catch (error: any) {
     
    console.error('[foodService] addFoodItem failed', { error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to add food item');
  }
};

/**
 * Update food item
 */
export const updateFoodItem = async (
  foodId: string,
  updates: Partial<FoodItem>
): Promise<void> => {
  try {
  const docRef = doc(db!, FOOD_COLLECTION, foodId);
    const payload: any = { ...updates, updatedAt: Timestamp.now() };
    await updateDoc(docRef, payload);
  } catch (error: any) {
     
    console.error('[foodService] updateFoodItem failed', { foodId, updates, error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to update food item');
  }
};

/**
 * Delete food item
 */
export const deleteFoodItem = async (foodId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db!, FOOD_COLLECTION, foodId));
  } catch (error: any) {
     
    console.error('[foodService] deleteFoodItem failed', { foodId, error, currentUser: auth?.currentUser?.uid ?? null });
    throw new Error(error.message || 'Failed to delete food item');
  }
};

/**
 * Subscribe to all food items in realtime.
 * Fires immediately on mount and on every add / update / delete in Firestore.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeToFoodItems = (
  onData: (items: FoodItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const q = query(collection(db!, FOOD_COLLECTION), orderBy('name'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const createdAt =
          data?.createdAt && typeof (data.createdAt as any).toMillis === 'function'
            ? (data.createdAt as Timestamp).toMillis()
            : typeof data.createdAt === 'number'
            ? data.createdAt
            : Date.now();
        const updatedAt =
          data?.updatedAt && typeof (data.updatedAt as any).toMillis === 'function'
            ? (data.updatedAt as Timestamp).toMillis()
            : typeof data.updatedAt === 'number'
            ? data.updatedAt
            : createdAt;
        return { id: d.id, ...data, createdAt, updatedAt } as FoodItem;
      });
      onData(items);
    },
    (error: any) => {
      if (onError)
        onError(new Error(error?.message || 'Realtime food subscription failed'));
    },
  );
};