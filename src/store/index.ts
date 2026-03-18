import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
//import selectedIngredientReducer from './selectedIngredientSlice'; // Исправьте имя!

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    //selectedIngredient: selectedIngredientReducer // Было setSelectedIngredient
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;