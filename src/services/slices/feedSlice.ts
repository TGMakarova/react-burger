import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { burgerApi } from '../../utils/burger-api';

import type { RootState } from '../store';

type TOrder = {
  _id: string;
  ingredients: string[];
  status: 'done' | 'pending' | 'created';
  number: number;
  createdAt: string;
  updatedAt: string;
  name: string;
};

type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  wsError: string | null;
};

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null,
  wsConnected: false,
  wsError: null,
};

// REST API (fallback)
export const fetchFeed = createAsyncThunk(
  'feed/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await burgerApi.getFeed();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки ленты';
      return rejectWithValue(errorMessage);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    wsConnect: (state, _action: PayloadAction<string>) => {
      state.wsConnected = false;
      state.wsError = null;
    },
    wsDisconnect: (state) => {
      state.wsConnected = false;
    },
    wsOpen: (state) => {
      state.wsConnected = true;
      state.wsError = null;
      state.error = null;
    },
    wsClose: (state) => {
      state.wsConnected = false;
    },
    wsError: (state, action: PayloadAction<string>) => {
      state.wsError = action.payload;
      state.wsConnected = false;
    },
    wsMessage: (
      state,
      action: PayloadAction<unknown> // Изменено с конкретного типа на unknown
    ) => {
      const payload = action.payload as {
        orders?: TOrder[];
        total?: number;
        totalToday?: number;
      };
      if (payload.orders) {
        state.orders = payload.orders;
      }
      if (payload.total !== undefined) {
        state.total = payload.total;
      }
      if (payload.totalToday !== undefined) {
        state.totalToday = payload.totalToday;
      }
      state.wsConnected = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { wsConnect, wsDisconnect, wsOpen, wsClose, wsError, wsMessage } =
  feedSlice.actions;

export const selectFeed = (state: RootState): TOrder[] => state.feed.orders;
export const selectFeedLoading = (state: RootState): boolean => state.feed.loading;
export const selectFeedTotal = (state: RootState): number => state.feed.total;
export const selectFeedTotalToday = (state: RootState): number => state.feed.totalToday;
export const selectWsConnected = (state: RootState): boolean => state.feed.wsConnected;
export const selectWsError = (state: RootState): string | null => state.feed.wsError;

export default feedSlice.reducer;
