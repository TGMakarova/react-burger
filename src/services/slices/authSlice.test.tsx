import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  initialState,
  checkAuth,
  updateUser,
  login,
  register,
  forgotPassword,
  resetPassword,
  logoutUser,
  setAuthChecked,
  setUser,
  setLoading,
  setError,
  logout,
  selectUser,
} from './authSlice';
import { burgerApi } from '@utils/burger-api';
import { createTestRootState } from '../../utils/test-utils';
import type { RootState } from '../store';

// Мокаем burgerApi
vi.mock('@utils/burger-api', () => ({
  burgerApi: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
  },
}));

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Слайс авторизации (auth)', () => {
  const setupStore = () =>
    configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: initialState },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  // Моковые данные
  const mockUser = { email: 'test@example.com', name: 'Test User' };
  const mockAuthResponse = {
    success: true,
    user: mockUser,
    accessToken: 'Bearer token123',
    refreshToken: 'refresh123',
  };
  const mockUpdateResponse = {
    success: true,
    user: { ...mockUser, name: 'Updated Name' },
  };

  describe('Начальное состояние', () => {
    it('должно возвращать initialState', () => {
      const store = setupStore();
      expect(store.getState().auth).toEqual(initialState);
    });
  });

  describe('Синхронные экшены', () => {
    it('setAuthChecked должен установить isAuthChecked', () => {
      const store = setupStore();
      store.dispatch(setAuthChecked(true));
      expect(store.getState().auth.isAuthChecked).toBe(true);
    });

    it('setUser должен установить user и isLoggedIn', () => {
      const store = setupStore();
      store.dispatch(setUser(mockUser));
      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isLoggedIn).toBe(true);
    });

    it('setUser с null должен сбросить user и isLoggedIn', () => {
      const store = setupStore();
      store.dispatch(setUser(mockUser));
      store.dispatch(setUser(null));
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });

    it('setLoading должен установить isLoading', () => {
      const store = setupStore();
      store.dispatch(setLoading(true));
      expect(store.getState().auth.isLoading).toBe(true);
    });

    it('setError должен установить error', () => {
      const store = setupStore();
      store.dispatch(setError('Ошибка'));
      expect(store.getState().auth.error).toBe('Ошибка');
    });

    it('logout должен сбросить состояние и очистить localStorage', () => {
      const store = setupStore();
      // Предустановим авторизованное состояние
      store.dispatch(setUser(mockUser));
      localStorageMock.setItem('accessToken', 'token');
      localStorageMock.setItem('refreshToken', 'refresh');

      store.dispatch(logout());
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isLoggedIn).toBe(false);
      expect(state.isAuthChecked).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Асинхронный экшен checkAuth', () => {
    it('при наличии токена и успешном getUser должен установить авторизацию', async () => {
      localStorageMock.getItem.mockReturnValue('Bearer token');
      (burgerApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });

      const store = setupStore();
      const resultAction = await store.dispatch(checkAuth());

      expect(resultAction.type).toBe(checkAuth.fulfilled.type);
      expect(resultAction.payload).toEqual(mockUser);
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('при отсутствии токена должен вернуть rejected и сбросить состояние', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const store = setupStore();
      const resultAction = await store.dispatch(checkAuth());

      expect(resultAction.type).toBe(checkAuth.rejected.type);
      expect(resultAction.payload).toBe('No token');
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('No token');
    });

    it('при ошибке запроса getUser должен удалить токен и вернуть rejected', async () => {
      localStorageMock.getItem.mockReturnValue('Bearer token');
      (burgerApi.getUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Invalid token'));

      const store = setupStore();
      const resultAction = await store.dispatch(checkAuth());

      expect(resultAction.type).toBe(checkAuth.rejected.type);
      expect(resultAction.payload).toBe('Invalid token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      const state = store.getState().auth;
      expect(state.isLoggedIn).toBe(false);
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('Асинхронный экшен login', () => {
    const credentials = { email: 'test@example.com', password: '123456' };

    it('при успешном входе должен установить пользователя', async () => {
      (burgerApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockAuthResponse);

      const store = setupStore();
      const resultAction = await store.dispatch(login(credentials));

      expect(resultAction.type).toBe(login.fulfilled.type);
      expect(resultAction.payload).toEqual(mockAuthResponse);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('при ошибке должен вернуть rejected и сбросить состояние', async () => {
      (burgerApi.login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Неверный пароль'));

      const store = setupStore();
      const resultAction = await store.dispatch(login(credentials));

      expect(resultAction.type).toBe(login.rejected.type);
      expect(resultAction.payload).toBe('Неверный пароль');
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBe('Неверный пароль');
    });
  });

  describe('Асинхронный экшен register', () => {
    const regData = { name: 'Test', email: 'test@example.com', password: '123456' };

    it('при успешной регистрации должен установить пользователя', async () => {
      (burgerApi.register as ReturnType<typeof vi.fn>).mockResolvedValue(mockAuthResponse);

      const store = setupStore();
      const resultAction = await store.dispatch(register(regData));

      expect(resultAction.type).toBe(register.fulfilled.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
    });

    it('при ошибке должен вернуть rejected', async () => {
      (burgerApi.register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Email занят'));

      const store = setupStore();
      const resultAction = await store.dispatch(register(regData));

      expect(resultAction.type).toBe(register.rejected.type);
      expect(resultAction.payload).toBe('Email занят');
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(false);
      expect(state.error).toBe('Email занят');
    });
  });

  describe('Асинхронный экшен updateUser', () => {
    const updateData = { name: 'New Name', email: 'new@example.com' };

    it('при успешном обновлении должен изменить данные пользователя', async () => {
      (burgerApi.updateUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUpdateResponse);

      const store = setupStore();
      const resultAction = await store.dispatch(updateUser(updateData));

      expect(resultAction.type).toBe(updateUser.fulfilled.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUpdateResponse.user);
      expect(state.error).toBeNull();
    });

    it('при ошибке должен вернуть rejected и сохранить сообщение', async () => {
      (burgerApi.updateUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Ошибка обновления'));

      const store = setupStore();
      const resultAction = await store.dispatch(updateUser(updateData));

      expect(resultAction.type).toBe(updateUser.rejected.type);
      expect(resultAction.payload).toBe('Ошибка обновления');
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Ошибка обновления');
    });
  });

  describe('Асинхронный экшен forgotPassword', () => {
    it('при успешном запросе должен сбросить loading и error', async () => {
      (burgerApi.forgotPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

      const store = setupStore();
      const resultAction = await store.dispatch(forgotPassword({ email: 'test@example.com' }));

      expect(resultAction.type).toBe(forgotPassword.fulfilled.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('при ошибке должен установить error', async () => {
      (burgerApi.forgotPassword as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Пользователь не найден'));

      const store = setupStore();
      const resultAction = await store.dispatch(forgotPassword({ email: 'wrong@example.com' }));

      expect(resultAction.type).toBe(forgotPassword.rejected.type);
      expect(resultAction.payload).toBe('Пользователь не найден');
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Пользователь не найден');
    });
  });

  describe('Асинхронный экшен resetPassword', () => {
    const resetData = { password: 'newpass', token: '123456' };

    it('при успешном сбросе должен сбросить loading и error', async () => {
      (burgerApi.resetPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

      const store = setupStore();
      const resultAction = await store.dispatch(resetPassword(resetData));

      expect(resultAction.type).toBe(resetPassword.fulfilled.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('при ошибке должен установить error', async () => {
      (burgerApi.resetPassword as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Неверный токен'));

      const store = setupStore();
      const resultAction = await store.dispatch(resetPassword(resetData));

      expect(resultAction.type).toBe(resetPassword.rejected.type);
      expect(resultAction.payload).toBe('Неверный токен');
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Неверный токен');
    });
  });

  describe('Асинхронный экшен logoutUser', () => {
    it('при успешном выходе должен сбросить состояние авторизации', async () => {
      (burgerApi.logout as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      // Предварительно залогиним
      const store = setupStore();
      store.dispatch(setUser(mockUser));
      store.dispatch(setAuthChecked(true));

      const resultAction = await store.dispatch(logoutUser());

      expect(resultAction.type).toBe(logoutUser.fulfilled.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
    });

    it('при ошибке выхода должен сбросить состояние всё равно (как в редьюсере)', async () => {
      (burgerApi.logout as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Ошибка'));
      const store = setupStore();
      store.dispatch(setUser(mockUser));

      const resultAction = await store.dispatch(logoutUser());

      expect(resultAction.type).toBe(logoutUser.rejected.type);
      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isLoggedIn).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBe('Ошибка');
    });
  });

  describe('Селекторы', () => {
    it('selectUser должен возвращать пользователя из состояния', () => {
      const state = createTestRootState({
        auth: { ...initialState, user: mockUser },
      });
      expect(selectUser(state)).toEqual(mockUser);
    });
  });
});
