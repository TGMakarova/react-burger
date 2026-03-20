import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils/types';

// Расширенный тип ингредиента с уникальным ID для конструктора
export interface ConstructorIngredient extends TIngredient {
  uniqueId: string;
}

interface BurgerConstructorState {
  bun: TIngredient | null;
  ingredients: ConstructorIngredient[];
}

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<ConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          uniqueId: `${ingredient._id}_${Date.now()}_${Math.random()}`,
        },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        item => item.uniqueId !== action.payload
      );
    },
    reorderIngredients: (state, action: PayloadAction<{ dragIndex: number; hoverIndex: number }>) => {
      const { dragIndex, hoverIndex } = action.payload;
      const newIngredients = [...state.ingredients];
      const [draggedItem] = newIngredients.splice(dragIndex, 1);
      newIngredients.splice(hoverIndex, 0, draggedItem);
      state.ingredients = newIngredients;
    },
  },
});

export const { addIngredient, removeIngredient, reorderIngredients } = burgerConstructorSlice.actions;
export default burgerConstructorSlice.reducer;