import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';
import type { RootState } from '@/services/store';

// Расширенный тип ингредиента с уникальным ID для конструктора
export interface ConstructorIngredient extends TIngredient {
  constructorId: string; // Добавляем уникальный ID для каждого экземпляра
}

interface BurgerConstructorState {
  bun: ConstructorIngredient | null; // Используем расширенный тип для булки
  ingredients: ConstructorIngredient[]; // Используем расширенный тип
  loading: boolean;
  error: string | null;
}

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
  loading: false,
  error: null,
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    // Добавление ингредиента в конструктор
    addIngredient: (state, action: PayloadAction<ConstructorIngredient>) => {
      if (action.payload.type === 'bun') {
        state.bun = action.payload;
      } else {
        state.ingredients.push(action.payload);
      }
      // Сохраняем в localStorage
      localStorage.setItem('burgerConstructor', JSON.stringify({
        bun: state.bun,
        ingredients: state.ingredients
      }));
    },
    
    // Удаление ингредиента из конструктора
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        item => item.constructorId !== action.payload
      );
      // Сохраняем в localStorage
      localStorage.setItem('burgerConstructor', JSON.stringify({
        bun: state.bun,
        ingredients: state.ingredients
      }));
    },
    
    // Перемещение ингредиента
    moveIngredient: (state, action: PayloadAction<{ dragIndex: number; hoverIndex: number }>) => {
      const { dragIndex, hoverIndex } = action.payload;
      const newIngredients = [...state.ingredients];
      const draggedItem = newIngredients[dragIndex];
      newIngredients.splice(dragIndex, 1);
      newIngredients.splice(hoverIndex, 0, draggedItem);
      state.ingredients = newIngredients;
      
      localStorage.setItem('burgerConstructor', JSON.stringify({
        bun: state.bun,
        ingredients: state.ingredients
      }));
    },
    
    // Очистка конструктора
    clearBurgerConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
      localStorage.removeItem('burgerConstructor');
    },
  },
});

export const { 
  addIngredient, 
  removeIngredient, 
  moveIngredient, 
  clearBurgerConstructor 
} = burgerConstructorSlice.actions;

export default burgerConstructorSlice.reducer;