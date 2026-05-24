import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { burgerApi } from '@utils/burger-api';

import type { RootState } from '../store';
import type { PayloadAction } from '@reduxjs/toolkit';

type OrderState = {
  orderNumber: number | null;
  loading: boolean;
  error: string | null;
};

export const initialState: OrderState = {
  orderNumber: null,
  loading: false,
  error: null,
};

export const submitOrder = createAsyncThunk(
  'order/submit',
  async (ingredientsIds: string[], { rejectWithValue }) => {
    try {
      const data = await burgerApi.createOrder(ingredientsIds);
      return data.order.number;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка оформления заказа';
      return rejectWithValue(errorMessage);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.orderNumber = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.orderNumber = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrder } = orderSlice.actions;

// Селекторы
export const selectOrderNumber = (state: RootState): number | null =>
  state.order.orderNumber;
export const selectOrderLoading = (state: RootState): boolean => state.order.loading;
export const selectOrderError = (state: RootState): string | null => state.order.error;

export default orderSlice.reducer;
