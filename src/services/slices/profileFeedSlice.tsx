import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { BURGER_API_URL } from '@/utils/burger-api';

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

// Определяем тип для ответа API
type ApiResponse = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

// REST API (запасной вариант)
export const fetchProfileFeed = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: string }
>('profileFeed/fetch', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');

    // ✅ Проверяем наличие токена и возвращаем ошибку если его нет
    if (!token) {
      return rejectWithValue('Токен авторизации не найден');
    }

    const response = await fetch(`${BURGER_API_URL}/orders`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      return rejectWithValue(`HTTP ошибка! статус: ${response.status}`);
    }

    const data = (await response.json()) as ApiResponse;
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
  }
});

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
    wsMessageProfile: (
      state,
      action: PayloadAction<{ orders: TOrder[]; total: number; totalToday: number }>
    ) => {
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
        // ✅ Безопасно обрабатываем payload
        state.error = action.payload ?? 'Неизвестная ошибка';
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

export const selectProfileFeed = (state: RootState): TOrder[] =>
  state.profileFeed.orders;
export const selectProfileFeedLoading = (state: RootState): boolean =>
  state.profileFeed.loading;
export const selectProfileFeedTotal = (state: RootState): number =>
  state.profileFeed.total;
export const selectProfileFeedTotalToday = (state: RootState): number =>
  state.profileFeed.totalToday;
export const selectProfileWsConnected = (state: RootState): boolean =>
  state.profileFeed.wsConnected;

export default profileFeedSlice.reducer;
