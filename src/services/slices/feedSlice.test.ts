
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import feedReducer, {
  initialState,
  fetchFeed,
  wsConnect,
  wsDisconnect,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
  selectFeed,
  selectFeedLoading,
  selectFeedTotal,
  selectFeedTotalToday,
  selectWsConnected,
  selectWsError,
} from './feedSlice';
import { burgerApi } from '@utils/burger-api';
import { createTestRootState } from '../../utils/test-utils';
import type { RootState } from '../store';

// Мокаем burgerApi
vi.mock('@utils/burger-api', () => ({
  burgerApi: {
    getFeed: vi.fn(),
  },
}));

describe('Слайс ленты заказов (feed)', () => {
  const setupStore = () =>
    configureStore({
      reducer: { feed: feedReducer },
      preloadedState: { feed: initialState },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Начальное состояние', () => {
    it('должно возвращать initialState', () => {
      const store = setupStore();
      expect(store.getState().feed).toEqual(initialState);
    });
  });

  describe('Синхронные экшены WebSocket', () => {
    it('wsConnect должен сбросить wsConnected и wsError', () => {
      const store = setupStore();
      store.dispatch(wsConnect('ws://test'));
      const state = store.getState().feed;
      expect(state.wsConnected).toBe(false);
      expect(state.wsError).toBeNull();
    });

    it('wsDisconnect должен установить wsConnected = false', () => {
      const store = setupStore();
      store.dispatch(wsOpen());
      expect(store.getState().feed.wsConnected).toBe(true);
      store.dispatch(wsDisconnect());
      expect(store.getState().feed.wsConnected).toBe(false);
    });

    it('wsOpen должен установить wsConnected = true и сбросить wsError и error', () => {
      const store = setupStore();
      store.dispatch(wsError('Ошибка'));
      expect(store.getState().feed.wsError).toBe('Ошибка');
      store.dispatch(wsOpen());
      const state = store.getState().feed;
      expect(state.wsConnected).toBe(true);
      expect(state.wsError).toBeNull();
      expect(state.error).toBeNull();
    });

    it('wsClose должен установить wsConnected = false', () => {
      const store = setupStore();
      store.dispatch(wsOpen());
      expect(store.getState().feed.wsConnected).toBe(true);
      store.dispatch(wsClose());
      expect(store.getState().feed.wsConnected).toBe(false);
    });

    it('wsError должен установить wsError и wsConnected = false', () => {
      const store = setupStore();
      store.dispatch(wsError('Сервер недоступен'));
      const state = store.getState().feed;
      expect(state.wsError).toBe('Сервер недоступен');
      expect(state.wsConnected).toBe(false);
    });

    describe('wsMessage', () => {
      const mockOrders = [
        {
          _id: '1',
          number: 123,
          status: 'done' as const,
          name: 'Бургер',
          ingredients: ['ing1', 'ing2'],
          createdAt: '',
          updatedAt: '',
        },
      ];

      it('должен обновить orders, total, totalToday и установить wsConnected = true, если все поля присутствуют', () => {
        const store = setupStore();
        const message = {
          orders: mockOrders,
          total: 100,
          totalToday: 5,
        };
        store.dispatch(wsMessage(message));
        const state = store.getState().feed;
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(5);
        expect(state.wsConnected).toBe(true);
      });

      it('должен обновить только те поля, которые переданы (частичное обновление)', () => {
        const store = setupStore();
        // Сначала установим начальные данные
        store.dispatch(wsMessage({ orders: mockOrders, total: 100, totalToday: 5 }));
        expect(store.getState().feed.orders).toEqual(mockOrders);
        expect(store.getState().feed.total).toBe(100);
        expect(store.getState().feed.totalToday).toBe(5);

        // Отправляем сообщение только с totalToday
        store.dispatch(wsMessage({ totalToday: 10 }));
        const state = store.getState().feed;
        expect(state.orders).toEqual(mockOrders); // не изменились
        expect(state.total).toBe(100);            // не изменился
        expect(state.totalToday).toBe(10);        // обновился
        expect(state.wsConnected).toBe(true);
      });

      it('должен игнорировать поля, отсутствующие в сообщении (не затирать их)', () => {
        const store = setupStore();
        store.dispatch(wsMessage({ orders: mockOrders, total: 100, totalToday: 5 }));
        // Отправляем сообщение только с orders
        const newOrders = [{ ...mockOrders[0], number: 999 }];
        store.dispatch(wsMessage({ orders: newOrders }));
        const state = store.getState().feed;
        expect(state.orders).toEqual(newOrders);
        expect(state.total).toBe(100);   // осталось прежним
        expect(state.totalToday).toBe(5); // осталось прежним
      });

      it('должен корректно обрабатывать пустой объект (ничего не менять, кроме wsConnected)', () => {
        const store = setupStore();
        store.dispatch(wsMessage({}));
        const state = store.getState().feed;
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
        expect(state.wsConnected).toBe(true);
      });
    });
  });

  describe('Асинхронный экшен fetchFeed (REST fallback)', () => {
    const mockApiResponse = {
      orders: [
        {
          _id: '1',
          number: 123,
          status: 'done' as const,
          name: 'Бургер',
          ingredients: ['ing1'],
          createdAt: '',
          updatedAt: '',
        },
      ],
      total: 10,
      totalToday: 2,
    };

    it('при успешном запросе должен установить loading=false и обновить данные', async () => {
      (burgerApi.getFeed as ReturnType<typeof vi.fn>).mockResolvedValue(mockApiResponse);
      const store = setupStore();
      const resultAction = await store.dispatch(fetchFeed());

      expect(resultAction.type).toBe(fetchFeed.fulfilled.type);
      expect(resultAction.payload).toEqual(mockApiResponse);

      const state = store.getState().feed;
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockApiResponse.orders);
      expect(state.total).toBe(mockApiResponse.total);
      expect(state.totalToday).toBe(mockApiResponse.totalToday);
      expect(state.error).toBeNull();
    });

    it('при ошибке должен перевести состояние в rejected и сохранить сообщение об ошибке', async () => {
      const errorMessage = 'Ошибка сети';
      (burgerApi.getFeed as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));
      const store = setupStore();
      const resultAction = await store.dispatch(fetchFeed());

      expect(resultAction.type).toBe(fetchFeed.rejected.type);
      expect(resultAction.payload).toBe(errorMessage);

      const state = store.getState().feed;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('если ошибка не является экземпляром Error, должно использоваться сообщение по умолчанию', async () => {
      (burgerApi.getFeed as ReturnType<typeof vi.fn>).mockRejectedValue('Просто строка');
      const store = setupStore();
      await store.dispatch(fetchFeed());
      expect(store.getState().feed.error).toBe('Ошибка загрузки ленты');
    });

    it('во время запроса должен установить loading=true и сбросить error', async () => {
      let resolvePending: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePending = resolve;
      });
      (burgerApi.getFeed as ReturnType<typeof vi.fn>).mockImplementationOnce(() => pendingPromise);
      const store = setupStore();
      const dispatchPromise = store.dispatch(fetchFeed());

      expect(store.getState().feed.loading).toBe(true);
      expect(store.getState().feed.error).toBeNull();

      resolvePending!(mockApiResponse);
      await dispatchPromise;
    });
  });

  describe('Селекторы', () => {
    it('selectFeed должен возвращать массив заказов', () => {
      const mockOrders = [{ _id: '1', number: 99 }] as any;
      const state = createTestRootState({
        feed: { ...initialState, orders: mockOrders },
      });
      expect(selectFeed(state)).toEqual(mockOrders);
    });

    it('selectFeedLoading должен возвращать флаг загрузки', () => {
      const state = createTestRootState({
        feed: { ...initialState, loading: true },
      });
      expect(selectFeedLoading(state)).toBe(true);
    });

    it('selectFeedTotal должен возвращать общее количество заказов', () => {
      const state = createTestRootState({
        feed: { ...initialState, total: 50 },
      });
      expect(selectFeedTotal(state)).toBe(50);
    });

    it('selectFeedTotalToday должен возвращать количество заказов за сегодня', () => {
      const state = createTestRootState({
        feed: { ...initialState, totalToday: 3 },
      });
      expect(selectFeedTotalToday(state)).toBe(3);
    });

    it('selectWsConnected должен возвращать статус WebSocket', () => {
      const state = createTestRootState({
        feed: { ...initialState, wsConnected: true },
      });
      expect(selectWsConnected(state)).toBe(true);
    });

    it('selectWsError должен возвращать ошибку WebSocket', () => {
      const state = createTestRootState({
        feed: { ...initialState, wsError: 'Ошибка соединения' },
      });
      expect(selectWsError(state)).toBe('Ошибка соединения');
    });
  });
});
