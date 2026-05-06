import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { TOrder } from '../../utils/types';
import type { RootState } from '../store';

type ProfileFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  wsError: string | null;
};

const initialState: ProfileFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null,
  wsConnected: false,
  wsError: null,
};

// REST API (fallback)
export const fetchProfileFeed = createAsyncThunk(
  'profileFeed/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://new-stellarburgers.education-services.ru/api/orders', {
        headers: {
          'Authorization': token || '',
        },
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  }
);

const profileFeedSlice = createSlice({
  name: 'profileFeed',
  initialState,
  reducers: {
    wsConnectProfile: (state, _action: PayloadAction<string>) => {
      state.wsConnected = false;
      state.wsError = null;
    },
    wsDisconnectProfile: (state) => {
      state.wsConnected = false;
    },
    wsOpenProfile: (state) => {
      state.wsConnected = true;
      state.wsError = null;
      state.error = null;
    },
    wsCloseProfile: (state) => {
      state.wsConnected = false;
    },
    wsErrorProfile: (state, action: PayloadAction<string>) => {
      state.wsError = action.payload;
      state.wsConnected = false;
    },
    wsMessageProfile: (state, action: PayloadAction<{ orders: TOrder[]; total: number; totalToday: number }>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
      state.wsConnected = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchProfileFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  wsConnectProfile,
  wsDisconnectProfile,
  wsOpenProfile,
  wsCloseProfile,
  wsErrorProfile,
  wsMessageProfile,
} = profileFeedSlice.actions;

export const selectProfileFeed = (state: RootState) => state.profileFeed.orders;
export const selectProfileFeedLoading = (state: RootState) => state.profileFeed.loading;
export const selectProfileFeedTotal = (state: RootState) => state.profileFeed.total;
export const selectProfileFeedTotalToday = (state: RootState) => state.profileFeed.totalToday;
export const selectProfileWsConnected = (state: RootState) => state.profileFeed.wsConnected;

export default profileFeedSlice.reducer;