import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  localStorageMiddleware,
  apiMiddleware,
  performanceMiddleware,
} from './apiMiddleware';
import type { MiddlewareAPI } from '@reduxjs/toolkit';

describe('localStorageMiddleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should save burgerConstructor to localStorage on burgerConstructor action', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');

    const mockStore = {
      getState: () => ({
        burgerConstructor: {
          bun: { _id: 'bun1', name: 'Булка' },
          ingredients: [{ _id: 'ing1', name: 'Котлета' }],
        },
      }),
    } as MiddlewareAPI;

    const next = vi.fn();
    const action = { type: 'burgerConstructor/addIngredient' };

    localStorageMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(mockSetItem).toHaveBeenCalledWith(
      'burgerConstructor',
      JSON.stringify({
        bun: { _id: 'bun1', name: 'Булка' },
        ingredients: [{ _id: 'ing1', name: 'Котлета' }],
      })
    );
  });

  it('should NOT save on non-burgerConstructor action', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
    const mockStore = { getState: () => ({}) } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'auth/login/fulfilled' };

    localStorageMiddleware(mockStore)(next)(action);

    expect(mockSetItem).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should save AFTER next() is called', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
    const next = vi.fn();

    const mockStore = {
      getState: () => ({
        burgerConstructor: { bun: null, ingredients: [] },
      }),
    } as MiddlewareAPI;
    const action = { type: 'burgerConstructor/addIngredient' };

    localStorageMiddleware(mockStore)(next)(action);

    // Порядок: next вызывается до setItem
    expect(next).toHaveBeenCalledBefore(mockSetItem);
  });

  it('should log error if saving fails, but not throw', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    void mockSetItem;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockStore = {
      getState: () => ({
        burgerConstructor: {
          bun: { _id: 'bun1', name: 'Булка' },
          ingredients: [],
        },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'burgerConstructor/add' };

    expect(() => {
      localStorageMiddleware(mockStore)(next)(action);
    }).not.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[localStorage] Ошибка сохранения:',
      expect.any(Error)
    );
    expect(next).toHaveBeenCalledWith(action);
  });
  it('should NOT save if burgerConstructor is missing in state', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
    const mockStore = {
      getState: () => ({}), // нет поля burgerConstructor
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'burgerConstructor/addIngredient' };

    localStorageMiddleware(mockStore)(next)(action);

    expect(mockSetItem).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });
  it('should save only bun and ingredients, ignoring extra fields', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
    const mockStore = {
      getState: () => ({
        burgerConstructor: {
          bun: { _id: 'bun1' },
          ingredients: [{ _id: 'ing1' }],
          extraField: 'should be ignored',
        },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'burgerConstructor/any' };

    localStorageMiddleware(mockStore)(next)(action);

    const savedData = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(savedData).toEqual({
      bun: { _id: 'bun1' },
      ingredients: [{ _id: 'ing1' }],
    });
    expect(savedData).not.toHaveProperty('extraField');
  });
});

describe('apiMiddleware', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Мокаем console.log и console.error, чтобы не засорять вывод
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // --- Тесты для order/sendOrder/pending ---

  it('should add Authorization header to meta when user is logged in and token exists', () => {
    localStorage.setItem('accessToken', 'real-token-123');
    const mockStore = {
      getState: () => ({
        auth: { isLoggedIn: true, user: { name: 'John' } },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = {
      type: 'order/sendOrder/pending',
      meta: { existingField: 'value' },
    };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledTimes(1);
    const calledAction = next.mock.calls[0][0];
    expect(calledAction).toEqual({
      ...action,
      meta: {
        existingField: 'value',
        headers: { Authorization: 'Bearer real-token-123' },
      },
    });
  });

  it('should return rejected action when user is not logged in', () => {
    const mockStore = {
      getState: () => ({
        auth: { isLoggedIn: false },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'order/sendOrder/pending' };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith({
      type: 'order/sendOrder/rejected',
      error: 'Необходима авторизация для оформления заказа',
      payload: { message: 'Пожалуйста, войдите в аккаунт' },
    });
  });

  it('should return rejected action when token is missing even if isLoggedIn true', () => {
    // Токена нет в localStorage
    localStorage.removeItem('accessToken');
    const mockStore = {
      getState: () => ({
        auth: { isLoggedIn: true },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'order/sendOrder/pending' };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith({
      type: 'order/sendOrder/rejected',
      error: 'Необходима авторизация для оформления заказа',
      payload: { message: 'Пожалуйста, войдите в аккаунт' },
    });
  });

  it('should return rejected action when both isLoggedIn false and token missing', () => {
    localStorage.removeItem('accessToken');
    const mockStore = {
      getState: () => ({
        auth: { isLoggedIn: false },
      }),
    } as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'order/sendOrder/pending' };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order/sendOrder/rejected',
      })
    );
  });

  // --- Тесты для логирования API-экшенов ---

  it('should log ingredients/ actions without changing them', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = {
      type: 'ingredients/fetch/pending',
      payload: { some: 'data' },
    };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[API] ingredients/fetch/pending:',
      expect.objectContaining({
        payload: { some: 'data' },
        timestamp: expect.any(String),
      })
    );
  });

  it('should log order/ actions', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'order/createOrder/pending', payload: { order: [] } };

    apiMiddleware(mockStore)(next)(action);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[API] order/createOrder/pending:',
      expect.any(Object)
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should log constructor/load actions', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'constructor/load/fulfilled', payload: {} };

    apiMiddleware(mockStore)(next)(action);

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should log error with console.error when action type ends with /rejected', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = {
      type: 'ingredients/fetch/rejected',
      payload: { message: 'Network Error' },
    };

    apiMiddleware(mockStore)(next)(action);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[API Error] ingredients/fetch/rejected:',
      { message: 'Network Error' }
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  // --- Тесты для прочих экшенов ---

  it('should pass through actions that are not API-related without logging', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = { type: 'auth/login/fulfilled', payload: { user: {} } };

    apiMiddleware(mockStore)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should handle non-any actions (e.g., undefined action) gracefully', () => {
    const mockStore = {} as MiddlewareAPI;
    const next = vi.fn();
    const action = null; // невалидный экшен

    // Проверяем, что не выбрасывает ошибку
    expect(() => {
      apiMiddleware(mockStore)(next)(action as any);
    }).not.toThrow();
    expect(next).toHaveBeenCalledWith(action);
  });
});
describe('performanceMiddleware', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let nowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    nowSpy = vi.spyOn(performance, 'now');
  });

  it('should call next and return its result', () => {
    const next = vi.fn(() => 'result');
    const action = { type: 'TEST_ACTION' };
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(150); // duration 50

    const result = performanceMiddleware({} as MiddlewareAPI)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(result).toBe('result');
  });

  it('should not warn when duration <= 100 ms', () => {
    const next = vi.fn();
    const action = { type: 'FAST' };
    // duration = 99 ms
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(199);

    performanceMiddleware({} as MiddlewareAPI)(next)(action);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should warn when duration > 100 ms', () => {
    const next = vi.fn();
    const action = { type: 'SLOW_ACTION' };
    // duration = 150 ms
    nowSpy.mockReturnValueOnce(100).mockReturnValueOnce(250);

    performanceMiddleware({} as MiddlewareAPI)(next)(action);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Медленный экшен SLOW_ACTION: 150\.00ms/)
    );
  });

  it('should round duration to two decimal places', () => {
    const next = vi.fn();
    const action = { type: 'PRECISE' };
    // duration = 123.456789 ms
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1123.456789);

    performanceMiddleware({} as MiddlewareAPI)(next)(action);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('123.46ms'));
  });

  it('should handle non-object actions (fallback type "unknown")', () => {
    const next = vi.fn();
    const invalidAction = null;
    nowSpy.mockReturnValueOnce(10).mockReturnValueOnce(120); // duration 110 > 100

    performanceMiddleware({} as MiddlewareAPI)(next)(invalidAction as any);

    expect(next).toHaveBeenCalledWith(invalidAction);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Медленный экшен unknown: 110.00ms')
    );
  });

  it('should handle action without type property', () => {
    const next = vi.fn();
    const action = { foo: 'bar' }; // нет поля type
    nowSpy.mockReturnValueOnce(50).mockReturnValueOnce(180); // duration 130

    performanceMiddleware({} as MiddlewareAPI)(next)(action as any);

    expect(next).toHaveBeenCalledWith(action);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Медленный экшен unknown: 130.00ms')
    );
  });
});
