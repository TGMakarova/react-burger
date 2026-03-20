import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createOrder } from '../../utils/api';
import type { RootState } from '@/services/store';

interface OrderState {
  orderNumber: number | null;
  orderName: string | null;
  loading: boolean;
  error: string | null;
}

interface OrderResponse {
  success: boolean;
  name: string;
  order: {
    number: number;
  };
}

const initialState: OrderState = {
  orderNumber: null,
  orderName: null,
  loading: false,
  error: null,
};

export const submitOrder = createAsyncThunk<
  OrderResponse,
  string[],
  { rejectValue: string }
>(
  'order/submitOrder',
  async (ingredientsIds: string[], { rejectWithValue }) => {
    try {
      const response = await createOrder(ingredientsIds);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.orderNumber = null;
      state.orderName = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.loading = false;
        state.orderNumber = action.payload.order.number;
        state.orderName = action.payload.name;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка при создании заказа';
      });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;

// Селекторы
export const selectOrderNumber = (state: RootState) => state.order.orderNumber;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;