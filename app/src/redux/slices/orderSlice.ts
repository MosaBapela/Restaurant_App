import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../types/order.types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    placeOrderStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    placeOrderSuccess: (state, action: PayloadAction<Order>) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
    },
    placeOrderFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order['status'] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = Date.now();
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
});

export const {
  placeOrderStart,
  placeOrderSuccess,
  placeOrderFailure,
  setOrders,
  updateOrderStatus,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;