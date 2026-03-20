import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import selectedIngredientReducer from './slices/selectedIngredientSlice'; 
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    selectedIngredient: selectedIngredientReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;