import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address, PaymentCard } from '../../types/user.types';

interface ProfileState {
  selectedAddress: Address | null;
  selectedCard: PaymentCard | null;
}

const initialState: ProfileState = {
  selectedAddress: null,
  selectedCard: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    setSelectedCard: (state, action: PayloadAction<PaymentCard | null>) => {
      state.selectedCard = action.payload;
    },
  },
});

export const { setSelectedAddress, setSelectedCard } = profileSlice.actions;

export default profileSlice.reducer;
