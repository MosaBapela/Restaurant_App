import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { FoodCategory, FoodItem } from '../../types/food.types';
import { db } from './config';

const FOOD_COLLECTION = 'foods';

/**
 * Fetch all food items
 */
export const fetchFoodItems = async (): Promise<FoodItem[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, FOOD_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodItem[];
  } catch (error: any) {
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
    const q = query(
      collection(db, FOOD_COLLECTION),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodItem[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch food items');
  }
};

/**
 * Fetch single food item
 */
export const fetchFoodItem = async (foodId: string): Promise<FoodItem> => {
  try {
    const docRef = doc(db, FOOD_COLLECTION, foodId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Food item not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as FoodItem;
  } catch (error: any) {
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
    const docRef = await addDoc(collection(db, FOOD_COLLECTION), foodItem);
    return docRef.id;
  } catch (error: any) {
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
    const docRef = doc(db, FOOD_COLLECTION, foodId);
    await updateDoc(docRef, updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update food item');
  }
};

/**
 * Delete food item
 */
export const deleteFoodItem = async (foodId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, FOOD_COLLECTION, foodId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete food item');
  }
};