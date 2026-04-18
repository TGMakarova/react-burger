import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from '../slices/ingredientsSlice';
import burgerConstructorReducer from '../slices/burgerConstructorSlice';
import selectedIngredientReducer from '../slices/selectedIngredientSlice';
import orderReducer from '../slices/orderSlice';
import authReducer from '../slices/authSlice'; // 👈 ДОБАВИТЬ ЭТУ СТРОКУ
import {
  apiMiddleware,
  localStorageMiddleware,
  performanceMiddleware,
} from '../middleware/apiMiddleware';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    burgerConstructor: burgerConstructorReducer,
    selectedIngredient: selectedIngredientReducer,
    order: orderReducer,
    auth: authReducer, 
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
