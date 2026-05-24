import { configureStore } from '@reduxjs/toolkit';
import { login } from '../slices/authSlice';
import authReducer from '../slices/authSlice';
import burgerConstructorReducer from '../slices/burgerConstructorSlice';
import feedReducer from '../slices/feedSlice';
import ingredientsReducer from '../slices/ingredientsSlice';
import orderReducer from '../slices/orderSlice';
import profileFeedReducer from '../slices/profileFeedSlice';
import profileOrdersReducer from '../slices/profileOrderSlice';
import selectedIngredientReducer from '../slices/selectedIngredientSlice';
import { describe, it, expect, vi } from 'vitest';
// Импортируем тип корневого состояния (если нужен для типизации ожидаемого объекта)
import type { RootState } from './index';
import { localStorageMiddleware } from '../middleware/apiMiddleware';

// Создаём store ТОЛЬКО для теста – без middleware, которые могут вызвать побочные эффекты
const createTestStore = () => {
  return configureStore({
    reducer: {
      ingredients: ingredientsReducer,
      burgerConstructor: burgerConstructorReducer,
      selectedIngredient: selectedIngredientReducer,
      order: orderReducer,
      auth: authReducer,
      feed: feedReducer,
      profileFeed: profileFeedReducer,
      profileOrders: profileOrdersReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // только базовые middleware, без socket- и localStorage-
  });
};

describe('Root store initial state', () => {
  it('should have correct initial state for all slices', () => {
    const store = createTestStore();
    const state = store.getState();

    // Ожидаемая структура начального состояния (опираемся на initialState каждого слайса)
    const expectedState: RootState = {
      ingredients: {
        items: [],
        loading: false,
        error: null,
      },
      burgerConstructor: {
        bun: null,
        ingredients: [],
      },

      selectedIngredient: {
        ingredient: null,
      },

      order: {
        orderNumber: null,
        loading: false,
        error: null,
      },

      auth: {
        isLoggedIn: false,
        user: null,
        isAuthChecked: false,
        isLoading: false,
        error: null,
      },

      feed: {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null,
        wsConnected: false,
        wsError: null,
      },

      profileFeed: {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null,
        wsConnected: false,
        wsError: null,
      },

      profileOrders: {
        orders: [],
        loading: false,
        error: null,
        connected: false,
      },
    };

    expect(state).toEqual(expectedState);
  });
});
