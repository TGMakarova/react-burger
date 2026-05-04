import { configureStore } from '@reduxjs/toolkit';

import {
  apiMiddleware,
  localStorageMiddleware,
  performanceMiddleware,
} from '../middleware/apiMiddleware';
import authReducer from '../slices/authSlice'; // 👈 ДОБАВИТЬ ЭТУ СТРОКУ
import burgerConstructorReducer from '../slices/burgerConstructorSlice';
import ingredientsReducer from '../slices/ingredientsSlice';
import orderReducer from '../slices/orderSlice';
import selectedIngredientReducer from '../slices/selectedIngredientSlice';
import feedReducer from '../slices/feedSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    burgerConstructor: burgerConstructorReducer,
    selectedIngredient: selectedIngredientReducer,
    order: orderReducer,
    auth: authReducer,
    feed: feedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['burgerConstructor/addIngredient'],
      },
    })
      .concat(apiMiddleware)
      .concat(localStorageMiddleware)
      .concat(performanceMiddleware),

  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

