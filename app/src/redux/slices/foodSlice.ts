import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  items: [],
  filteredItems: [],
  selectedCategory: 'All',
  searchQuery: '',
  isLoading: false,
  error: null,
};

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    setFoodItems: (state, action: PayloadAction<FoodItem[]>) => {
      state.items = action.payload;
      state.filteredItems = action.payload;
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
