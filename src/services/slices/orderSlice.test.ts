import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import orderReducer, {
  submitOrder,
  clearOrder,
  selectOrderNumber,
  selectOrderLoading,
  selectOrderError,
} from './orderSlice';
import { burgerApi } from '@utils/burger-api';

import { createTestRootState } from '../../utils/test-utils';
// Мокаем burgerApi
vi.mock('@utils/burger-api', () => ({
  burgerApi: { createOrder: vi.fn() }
}));

describe('order slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Тестирование синхронных редукторов
  describe('синхронные действия', () => {
    it('должен вернуть начальное состояние', () => {
      const result = orderReducer(undefined, { type: '' });

      expect(result).toEqual({
        orderNumber: null,
        loading: false,
        error: null,
      });
    });

    it('должен очистить заказ при clearOrder', () => {
      const initialState = {
        orderNumber: 12345,
        loading: false,
        error: 'some error',
      };

      const result = orderReducer(initialState, clearOrder());

      expect(result.orderNumber).toBe(null);
      expect(result.error).toBe(null);
      expect(result.loading).toBe(false);
    });
  });

  // 2. Тестирование асинхронного thunk (правильный способ)
  describe('submitOrder async thunk - тестирование редьюсера', () => {
    const mockOrderNumber = 12345;

    it('должен установить loading=true при pending', () => {
      // ✅ Правильно: создаём action объект напрямую
      const action = {
        type: submitOrder.pending.type,
        payload: undefined,
      };
      const initialState = {
        orderNumber: null,
        loading: false,
        error: null,
      };

      const result = orderReducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBe(null);
      expect(result.orderNumber).toBe(null);
    });

    it('должен сохранить номер заказа и выключить loading при fulfilled', () => {
      // ✅ Правильно: создаём action с payload
      const action = {
        type: submitOrder.fulfilled.type,
        payload: mockOrderNumber,
      };
      const initialState = {
        orderNumber: null,
        loading: true,
        error: null,
      };

      const result = orderReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.orderNumber).toBe(mockOrderNumber);
      expect(result.error).toBe(null);
    });

    it('должен сохранить ошибку и выключить loading при rejected', () => {
      const errorMessage = 'Ошибка сервера';
      const action = {
        type: submitOrder.rejected.type,
        payload: errorMessage,
        error: { message: errorMessage },
      };
      const initialState = {
        orderNumber: null,
        loading: true,
        error: null,
      };

      const result = orderReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.orderNumber).toBe(null);
    });

    it('должен сбросить предыдущую ошибку при новом submitOrder', () => {
      const action = {
        type: submitOrder.pending.type,
        payload: undefined,
      };
      const initialState = {
        orderNumber: null,
        loading: false,
        error: 'Предыдущая ошибка',
      };

      const result = orderReducer(initialState, action);

      expect(result.error).toBe(null);
      expect(result.loading).toBe(true);
    });
  });

  // 3. Тестирование интеграции с API (правильный способ)
  describe('интеграционные тесты submitOrder', () => {
    let store: ReturnType<
      typeof configureStore<{ order: ReturnType<typeof orderReducer> }>
    >;

    beforeEach(() => {
      store = configureStore({
        reducer: { order: orderReducer },
      });
    });

    const mockIngredients = ['ing1', 'ing2', 'ing3'];
    const mockOrderNumber = 12345;

    it('должен успешно создать заказ', async () => {
      // Мокаем успешный ответ API
      vi.mocked(burgerApi.createOrder).mockResolvedValue({
        order: { number: mockOrderNumber },
      } as any);

      // ✅ Диспатчим thunk - это работает только с реальным store
      const result = await store.dispatch(submitOrder(mockIngredients));

      // Проверяем результат
      expect(result.type).toBe('order/submit/fulfilled');
      expect(result.payload).toBe(mockOrderNumber);

      // Проверяем состояние store
      const state = store.getState().order;
      expect(state.orderNumber).toBe(mockOrderNumber);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);

      // Проверяем, что API был вызван с правильными аргументами
      expect(burgerApi.createOrder).toHaveBeenCalledWith(mockIngredients);
      expect(burgerApi.createOrder).toHaveBeenCalledTimes(1);
    });

    it('должен обработать ошибку API', async () => {
      const errorMessage = 'Не удалось создать заказ';

      vi.mocked(burgerApi.createOrder).mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(submitOrder(mockIngredients));

      expect(result.type).toBe('order/submit/rejected');
      expect(result.payload).toBe(errorMessage);

      const state = store.getState().order;
      expect(state.orderNumber).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('должен обработать неизвестную ошибку', async () => {
      vi.mocked(burgerApi.createOrder).mockRejectedValue('Строковая ошибка');

      const result = await store.dispatch(submitOrder(mockIngredients));

      expect(result.payload).toBe('Ошибка оформления заказа');

      const state = store.getState().order;
      expect(state.error).toBe('Ошибка оформления заказа');
    });
  });

  // 4. Тестирование селекторов
  describe('селекторы', () => {
    // ✅ Используем createTestRootState для создания полного состояния
    const mockState = createTestRootState({
      order: {
        orderNumber: 12345,
        loading: true,
        error: 'test error',
      },
    });

    it('selectOrderNumber должен вернуть номер заказа', () => {
      expect(selectOrderNumber(mockState)).toBe(12345);
    });

    it('selectOrderLoading должен вернуть состояние загрузки', () => {
      expect(selectOrderLoading(mockState)).toBe(true);
    });

    it('selectOrderError должен вернуть ошибку', () => {
      expect(selectOrderError(mockState)).toBe('test error');
    });
  });

  // 5. Дополнительные проверки
  describe('дополнительные сценарии', () => {
    it('не должен изменять состояние при неизвестном экшене', () => {
      const initialState = {
        orderNumber: 12345,
        loading: false,
        error: null,
      };

      const result = orderReducer(initialState, { type: 'UNKNOWN_ACTION' });

      expect(result).toEqual(initialState);
    });
  });
});
