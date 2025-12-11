import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// simple favorites slice storing an array of favorite food item ids
const initialState: string[] = [];

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const idx = state.indexOf(id);
      if (idx >= 0) {
        state.splice(idx, 1);
      } else {
        state.push(id);
      }
    },
    clearFavorites: () => [],
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
