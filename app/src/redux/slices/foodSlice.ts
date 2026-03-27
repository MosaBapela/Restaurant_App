import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockFoodItems } from '../../data/mockData';
import * as foodService from '../../services/firebase/foodService';
import { FoodCategory, FoodItem } from '../../types/food.types';

interface FoodState {
  items: FoodItem[];
  filteredItems: FoodItem[];
  selectedCategory: FoodCategory | 'All';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: FoodState = {
  // Start empty and bootstrap from Firestore on app startup. If the
  // Firestore `foods` collection is empty we seed it from the bundled
  // `mockFoodItems` so first-time dev environments have data.
  items: [],
  filteredItems: [],
  selectedCategory: 'All',
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Thunk: initialize foods from Firestore; seed from mock data if empty
export const initializeFoods = createAsyncThunk(
  'food/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const remote = await foodService.fetchFoodItems();
      if (remote && remote.length > 0) {
        return remote;
      }

      // If empty, seed mock data into Firestore and re-fetch
      // Strip `id` from mock items because addFoodItem will generate doc ids
      const seedPromises = mockFoodItems.map((m) => {
        const { id: _omit, ...payload } = m as any;
        return foodService.addFoodItem(payload as any);
      });
      await Promise.all(seedPromises);
      const reFetched = await foodService.fetchFoodItems();
      return reFetched;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to initialize foods');
    }
  }
);

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    setFoodItems: (state, action: PayloadAction<FoodItem[]>) => {
      state.items = action.payload;
      // Re-apply any active category / search filters so that a realtime
      // Firestore update (e.g. admin delete) doesn't reset the user's view.
      state.filteredItems = action.payload.filter((item) => {
        const categoryMatch =
          state.selectedCategory === 'All' || item.category === state.selectedCategory;
        const searchMatch =
          state.searchQuery === '' ||
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
      });
    },
    
    setCategory: (state, action: PayloadAction<FoodCategory | 'All'>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = state.items.filter((item) => {
        const categoryMatch =
          action.payload === 'All' || item.category === action.payload;
        const searchMatch =
          state.searchQuery === '' ||
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
      });
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = state.items.filter((item) => {
        const categoryMatch =
          state.selectedCategory === 'All' ||
          item.category === state.selectedCategory;
        const searchMatch =
          action.payload === '' ||
          item.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          item.description.toLowerCase().includes(action.payload.toLowerCase());
        return categoryMatch && searchMatch;
      });
    },
    
    addFoodItem: (state, action: PayloadAction<FoodItem>) => {
      state.items.push(action.payload);
      state.filteredItems = state.items;
    },
    
    updateFoodItem: (state, action: PayloadAction<FoodItem>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
        state.filteredItems = state.items;
      }
    },
    
    deleteFoodItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.filteredItems = state.items;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeFoods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeFoods.fulfilled, (state, action: PayloadAction<FoodItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
        state.error = null;
      })
      .addCase(initializeFoods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error?.message || 'Failed to initialize foods';
      });
  },
});

export const {
  setFoodItems,
  setCategory,
  setSearchQuery,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
} = foodSlice.actions;

export default foodSlice.reducer;
