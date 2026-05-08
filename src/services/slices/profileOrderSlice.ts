import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TOrder } from '../../utils/types';
import type { RootState } from '../store';

export type ProfileOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
  connected: boolean;
};

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
    connect: (state, _action: PayloadAction<string>) => {
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

export const { connect, disconnect, onOpen, onError, onMessage } =
  profileOrdersSlice.actions;

export const selectProfileOrders = (state: RootState): TOrder[] =>
  state.profileOrders.orders;

export const selectProfileOrdersLoading = (state: RootState): boolean =>
  state.profileOrders.loading;

export const selectProfileOrdersConnected = (state: RootState): boolean =>
  state.profileOrders.connected;

export const selectProfileOrdersError = (state: RootState): string | null =>
  state.profileOrders.error;

export default profileOrdersSlice.reducer;
