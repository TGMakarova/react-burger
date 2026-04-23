import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { burgerApi } from '@utils/burger-api';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

// ✅ Исправленный checkAuth - правильно обрабатываем ответ от API
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    
    console.log('🔍 [checkAuth] Начало проверки');
    console.log('🔍 [checkAuth] Токен из localStorage:', token ? `${token.substring(0, 20)}...` : 'нет');
    
    if (!token) {
      console.log('🔍 [checkAuth] Нет токена');
      return rejectWithValue('No token');
    }
    
    try {
      const response = await burgerApi.getUser();
      console.log('🔍 [checkAuth] Ответ от getUser:', response);
      console.log('🔍 [checkAuth] Возвращаем user:', response.user);
      return response.user;
    } catch (error) {
      console.log('🔍 [checkAuth] Ошибка:', error);
      localStorage.removeItem('accessToken');
      return rejectWithValue('Invalid token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isAuthChecked = true;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        console.log('[authSlice] checkAuth.pending');
        state.isLoading = true;
        state.isAuthChecked = false;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('[authSlice] checkAuth.fulfilled:', action.payload);
        // ✅ action.payload теперь содержит { email, name }
        state.isLoggedIn = true;
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log('[authSlice] checkAuth.rejected:', action.payload);
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuthChecked, setUser, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;