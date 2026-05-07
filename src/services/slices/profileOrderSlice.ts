import  { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TOrder } from '../../utils/types';
interface ProfileOrdersState {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

const initialState: ProfileOrdersState = {
  orders: [],
  loading: false,
  error: null,
  connected: false,
};

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<string>) => {
      state.loading = true;
    },
    disconnect: (state) => {
      state.connected = false;
      state.orders = [];
    },
    onOpen: (state) => {
      state.loading = false;
      state.connected = true;
      state.error = null;
    },
    onError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    onMessage: (state, action: PayloadAction<{ orders: TOrder[] }>) => {
      state.orders = action.payload.orders;
      state.loading = false;
    },
  },
});

export const { connect, disconnect, onOpen, onError, onMessage } = profileOrdersSlice.actions;
export const selectProfileOrders = (state: any) => state.profileOrders.orders;
export const selectProfileOrdersLoading = (state: any) => state.profileOrders.loading;

export default profileOrdersSlice.reducer;