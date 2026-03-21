// services/middleware/apiMiddleware.ts
import type { Middleware } from '@reduxjs/toolkit';

// Type guard для проверки, является ли action AnyAction
function isAnyAction(action: unknown): action is { type: string; payload?: unknown } {
  return (
    action !== null &&
    typeof action === 'object' &&
    'type' in action &&
    typeof (action as { type: string }).type === 'string'
  );
}

// Middleware для синхронизации с localStorage - используем store
export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (isAnyAction(action) && action.type.startsWith('burgerConstructor/')) {
    try {
      // Используем store для получения состояния
      const state = store.getState();
      const burgerConstructor = (state as any).burgerConstructor;

      if (burgerConstructor) {
        localStorage.setItem(
          'burgerConstructor',
          JSON.stringify({
            bun: burgerConstructor.bun,
            ingredients: burgerConstructor.ingredients,
          })
        );
      }
    } catch (error) {
      console.error('[localStorage] Ошибка сохранения:', error);
    }
  }

  return result;
};

// Middleware для отслеживания API запросов - store не используется, помечаем как _store
export const apiMiddleware: Middleware = (_store) => (next) => (action) => {
  if (isAnyAction(action)) {
    if (
      action.type.startsWith('ingredients/') ||
      action.type.startsWith('order/') ||
      action.type.startsWith('constructor/load')
    ) {
      console.log(`[API] ${action.type}:`, {
        payload: action.payload,
        timestamp: new Date().toISOString(),
      });

      if (action.type.endsWith('/rejected')) {
        console.error(`[API Error] ${action.type}:`, action.payload);
      }
    }
  }

  return next(action);
};

// Middleware для отслеживания времени выполнения - store не используется, помечаем как _store
export const performanceMiddleware: Middleware = (_store) => (next) => (action) => {
  const actionType = isAnyAction(action) ? action.type : 'unknown';
  const start = performance.now();
  const result = next(action);
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(
      `[Performance] Медленный экшен ${actionType}: ${duration.toFixed(2)}ms`
    );
  }

  return result;
};
