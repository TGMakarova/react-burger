import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { burgerApi } from '@utils/burger-api';

import type { RootState } from '../store';

type User = {
  email: string;
  name: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

export const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

// ✅ checkAuth - использует burgerApi.getUser()
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return rejectWithValue('No token');
    }

    try {
      const response = await burgerApi.getUser();
      return response.user;
    } catch (_error) {
      localStorage.removeItem('accessToken');
      return rejectWithValue('Invalid token');
    }
  }
);

// ✅ updateUser - использует burgerApi.updateUser()
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ name, email }: { name: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await burgerApi.updateUser({ name, email });
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка обновления данных';
      return rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await burgerApi.login(email, password);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await burgerApi.forgotPassword(email);
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка восстановления пароля';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await burgerApi.register(name, email, password);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { password, token }: { password: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await burgerApi.resetPassword(password, token);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сброса пароля';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await burgerApi.logout();
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      return rejectWithValue(errorMessage);
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
        state.isLoading = true;
        state.isAuthChecked = false;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error = action.payload as string;
      });
  },
});

export const { setAuthChecked, setUser, setLoading, setError, logout } =
  authSlice.actions;

// Селекторы
export const selectUser = (state: RootState): User | null => state.auth.user;
export default authSlice.reducer;
