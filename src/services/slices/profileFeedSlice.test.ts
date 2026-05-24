import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import profileFeedReducer, {
  initialState,
  fetchProfileFeed,
  wsConnectProfile,
  wsDisconnectProfile,
  wsOpenProfile,
  wsCloseProfile,
  wsErrorProfile,
  wsMessageProfile,
  selectProfileFeed,
  selectProfileFeedLoading,
  selectProfileFeedTotal,
  selectProfileFeedTotalToday,
  selectProfileWsConnected,
} from './profileFeedSlice';
import { BURGER_API_URL } from '@utils/burger-api';
import type { RootState } from '../store';
import { createTestRootState } from '../../utils/test-utils';

// Мокаем fetch глобально
const mockFetch = vi.fn();
global.fetch = mockFetch;


describe('Слайс ленты заказов пользователя (profileFeed)', () => {
  // Хранилище только для этого слайса
  const setupStore = () =>
    configureStore({
      reducer: { profileFeed: profileFeedReducer },
      preloadedState: { profileFeed: initialState },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем моки localStorage
    vi.restoreAllMocks();
  });

  describe('Начальное состояние', () => {
    it('должен возвращать initialState', () => {
      const store = setupStore();
      expect(store.getState().profileFeed).toEqual(initialState);
    });
  });

  describe('Синхронные экшены WebSocket', () => {
    it('wsConnectProfile должен сбросить wsConnected и wsError', () => {
      const store = setupStore();
      store.dispatch(wsConnectProfile('ws://test'));
      const state = store.getState().profileFeed;
      expect(state.wsConnected).toBe(false);
      expect(state.wsError).toBeNull();
    });

    it('wsDisconnectProfile должен установить wsConnected = false', () => {
      const store = setupStore();
      // Принудительно устанавливаем true через wsOpen
      store.dispatch(wsOpenProfile());
      expect(store.getState().profileFeed.wsConnected).toBe(true);

      store.dispatch(wsDisconnectProfile());
      expect(store.getState().profileFeed.wsConnected).toBe(false);
    });

    it('wsOpenProfile должен установить wsConnected = true, сбросить wsError и error', () => {
      const store = setupStore();
      // Предварительно установим ошибки
      store.dispatch(wsErrorProfile('Ошибка соединения'));
      expect(store.getState().profileFeed.wsError).toBe('Ошибка соединения');

      store.dispatch(wsOpenProfile());
      const state = store.getState().profileFeed;
      expect(state.wsConnected).toBe(true);
      expect(state.wsError).toBeNull();
      expect(state.error).toBeNull();
    });

    it('wsCloseProfile должен установить wsConnected = false', () => {
      const store = setupStore();
      store.dispatch(wsOpenProfile());
      expect(store.getState().profileFeed.wsConnected).toBe(true);

      store.dispatch(wsCloseProfile());
      expect(store.getState().profileFeed.wsConnected).toBe(false);
    });

    it('wsErrorProfile должен установить wsError и wsConnected = false', () => {
      const store = setupStore();
      store.dispatch(wsErrorProfile('Сервер недоступен'));
      const state = store.getState().profileFeed;
      expect(state.wsError).toBe('Сервер недоступен');
      expect(state.wsConnected).toBe(false);
    });

    it('wsMessageProfile должен обновить orders, total, totalToday и установить wsConnected = true', () => {
  const store = setupStore();
  store.dispatch(wsMessageProfile({
    orders: [
      { _id: '1', number: 123, status: 'done' as const, name: 'Бургер', createdAt: '', updatedAt: '', ingredients: [] },
      { _id: '2', number: 124, status: 'pending' as const, name: 'Бургер2', createdAt: '', updatedAt: '', ingredients: [] },
    ],
    total: 100,
    totalToday: 5,
  }));
  const state = store.getState().profileFeed;
  expect(state.orders).toHaveLength(2);
  expect(state.total).toBe(100);
  expect(state.totalToday).toBe(5);
  expect(state.wsConnected).toBe(true);
});
  });

  describe('Асинхронный экшен fetchProfileFeed (REST)', () => {
    const mockOrders = [
      {
        _id: '1',
        number: 123,
        status: 'done',
        name: 'Бургер',
        createdAt: '',
        updatedAt: '',
        ingredients: [],
      },
    ];
    const mockApiResponse = {
      orders: mockOrders,
      total: 10,
      totalToday: 2,
    };

    it('при успешном запросе должен установить loading=false и обновить данные', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });
      // Мокаем localStorage с токеном
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const store = setupStore();
      const resultAction = await store.dispatch(fetchProfileFeed());

      expect(resultAction.type).toBe(fetchProfileFeed.fulfilled.type);
      expect(resultAction.payload).toEqual(mockApiResponse);

      const state = store.getState().profileFeed;
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockApiResponse.orders);
      expect(state.total).toBe(mockApiResponse.total);
      expect(state.totalToday).toBe(mockApiResponse.totalToday);
      expect(state.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledWith(`${BURGER_API_URL}/orders`, {
        headers: { Authorization: 'mock-token' },
      });
    });

    it('должен вернуть rejected, если токен отсутствует в localStorage', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const store = setupStore();
      const resultAction = await store.dispatch(fetchProfileFeed());

      expect(resultAction.type).toBe(fetchProfileFeed.rejected.type);
      expect(resultAction.payload).toBe('Токен авторизации не найден');

      const state = store.getState().profileFeed;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Токен авторизации не найден');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('должен вернуть rejected при HTTP ошибке (response.ok = false)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const store = setupStore();
      const resultAction = await store.dispatch(fetchProfileFeed());

      expect(resultAction.type).toBe(fetchProfileFeed.rejected.type);
      expect(resultAction.payload).toBe('HTTP ошибка! статус: 401');

      const state = store.getState().profileFeed;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('HTTP ошибка! статус: 401');
    });

    it('должен вернуть rejected при ошибке сети (fetch бросает исключение)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const store = setupStore();
      const resultAction = await store.dispatch(fetchProfileFeed());

      expect(resultAction.type).toBe(fetchProfileFeed.rejected.type);
      expect(resultAction.payload).toBe('Network error');

      const state = store.getState().profileFeed;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('при ошибке, не являющейся экземпляром Error, должно использоваться сообщение по умолчанию', async () => {
      mockFetch.mockRejectedValueOnce('Просто строка');
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const store = setupStore();
      await store.dispatch(fetchProfileFeed());

      const state = store.getState().profileFeed;
      expect(state.error).toBe('Ошибка загрузки');
    });

    it('во время запроса должен установить loading=true и сбросить error', async () => {
      // Замораживаем промис, чтобы проверить pending состояние
      let resolvePending: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePending = resolve;
      });
      mockFetch.mockImplementationOnce(() => pendingPromise);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');

      const store = setupStore();
      const dispatchPromise = store.dispatch(fetchProfileFeed());

      expect(store.getState().profileFeed.loading).toBe(true);
      expect(store.getState().profileFeed.error).toBeNull();

      // Разрешаем промис, чтобы тест не висел
      resolvePending!({
        ok: true,
        json: async () => mockApiResponse,
      });
      await dispatchPromise;
    });
  });

  describe('Селекторы', () => {
  it('selectProfileFeed должен возвращать массив заказов', () => {
    const mockOrders = [{ _id: '1', number: 99, status: 'done' as const, name: '', createdAt: '', updatedAt: '', ingredients: [] }];
    const state = createTestRootState({
      profileFeed: {
        ...initialState,
        orders: mockOrders,
        total: 50,
        totalToday: 3,
        wsConnected: true,
      }
    });
    expect(selectProfileFeed(state)).toEqual(mockOrders);
  });

  it('selectProfileFeedLoading должен возвращать флаг загрузки', () => {
    const state = createTestRootState({
      profileFeed: { ...initialState, loading: true }
    });
    expect(selectProfileFeedLoading(state)).toBe(true);
  });

  it('selectProfileFeedTotal должен возвращать общее количество заказов', () => {
    const state = createTestRootState({
      profileFeed: { ...initialState, total: 50 }
    });
    expect(selectProfileFeedTotal(state)).toBe(50);
  });

  it('selectProfileFeedTotalToday должен возвращать количество заказов за сегодня', () => {
    const state = createTestRootState({
      profileFeed: { ...initialState, totalToday: 3 }
    });
    expect(selectProfileFeedTotalToday(state)).toBe(3);
  });

  it('selectProfileWsConnected должен возвращать статус подключения WebSocket', () => {
    const state = createTestRootState({
      profileFeed: { ...initialState, wsConnected: true }
    });
    expect(selectProfileWsConnected(state)).toBe(true);
  });
});
});
