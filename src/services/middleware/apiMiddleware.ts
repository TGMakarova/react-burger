import type { Middleware } from '@reduxjs/toolkit';

// Тип RootState с вашим authSlice
interface RootState {
  auth: {
    isLoggedIn: boolean;
    user: { email: string; name: string } | null;
    isAuthChecked: boolean;
    isLoading: boolean;
    error: string | null;
  };
  burgerConstructor: {
    bun: any;
    ingredients: any[];
  };
}

// Type guard для проверки action
function isAnyAction(
  action: unknown
): action is { type: string; payload?: unknown; meta?: any } {
  return (
    action !== null &&
    typeof action === 'object' &&
    'type' in action &&
    typeof (action as { type: string }).type === 'string'
  );
}

// Функция для получения токена из localStorage
const getAccessToken = (): string | null => {
  // Проверьте, как именно вы храните токен
  // Вариант 1: Прямое хранение
  return localStorage.getItem('accessToken');

  // Вариант 2: В объекте (раскомментируйте если нужно)
  // const tokens = localStorage.getItem('tokens');
  // if (tokens) {
  //   const { accessToken } = JSON.parse(tokens);
  //   return accessToken;
  // }
  // return null;
};

// Middleware для синхронизации с localStorage
export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (isAnyAction(action) && action.type.startsWith('burgerConstructor/')) {
    try {
      const state = store.getState() as RootState;
      const burgerConstructor = state.burgerConstructor;

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

// Middleware для отслеживания API запросов и проверки авторизации
export const apiMiddleware: Middleware = (store) => (next) => (action) => {
  // Проверяем, это экшен отправки заказа?
  if (isAnyAction(action) && action.type === 'order/sendOrder/pending') {
    const state = store.getState() as RootState;
    const isLoggedIn = state.auth.isLoggedIn;
    const token = getAccessToken(); // Получаем токен из localStorage

    console.log('[API] Проверка авторизации перед заказом:', {
      isLoggedIn,
      hasToken: !!token,
      actionType: action.type,
    });

    // Если пользователь не авторизован - не отправляем заказ
    if (!isLoggedIn || !token) {
      console.error('[API] Пользователь не авторизован! Заказ не будет отправлен.');

      // Возвращаем rejected action
      return next({
        type: 'order/sendOrder/rejected',
        error: 'Необходима авторизация для оформления заказа',
        payload: { message: 'Пожалуйста, войдите в аккаунт' },
      });
    }

    // Добавляем токен в метаданные action
    const modifiedAction = {
      ...action,
      meta: {
        ...action.meta,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    };

    console.log('[API] Отправка заказа с авторизацией');
    return next(modifiedAction);
  }

  // Для остальных API запросов просто логируем
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

// Middleware для отслеживания времени выполнения
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
