import { createSlice, createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';

export type ConstructorIngredient = TIngredient & {
  constructorId: string;
};

type BurgerConstructorState = {
  bun: ConstructorIngredient | null;
  ingredients: ConstructorIngredient[];
};

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: (state, action: PayloadAction<ConstructorIngredient>) => {
      const ingredient = action.payload;

      if (ingredient.type === 'bun') {
        state.bun = ingredient;
      } else {
        state.ingredients.push(ingredient);
      }
    },

    removeIngredient: (state, action: PayloadAction<string>) => {
      const constructorId = action.payload;
      state.ingredients = state.ingredients.filter(
        (item) => item.constructorId !== constructorId
      );
    },

    moveIngredient: (
      state,
      action: PayloadAction<{ dragIndex: number; hoverIndex: number }>
    ) => {
      const { dragIndex, hoverIndex } = action.payload;
      const ingredients = [...state.ingredients];
      const draggedItem = ingredients[dragIndex];
      ingredients.splice(dragIndex, 1);
      ingredients.splice(hoverIndex, 0, draggedItem);
      state.ingredients = ingredients;
    },

    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
  },
});

export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  burgerConstructorSlice.actions;

export default burgerConstructorSlice.reducer;

// Мемоизированный селектор для получения ингредиентов с счётчиками
export const selectIngredientsWithCounts = createSelector(
  [
    (state: RootState) => state.ingredients.items,
    (state: RootState) => state.burgerConstructor,
  ],
  (allIngredients: TIngredient[], burgerConstructor: BurgerConstructorState) => {
    // Создаём карту для подсчёта
    const countMap = new Map<string, number>();

    // Инициализируем все ингредиенты нулями
    allIngredients.forEach((ingredient: TIngredient) => {
      countMap.set(ingredient._id, 0);
    });

    // Подсчитываем булку (2 штуки)
    if (burgerConstructor.bun) {
      const bunId = burgerConstructor.bun._id;
      countMap.set(bunId, (countMap.get(bunId) ?? 0) + 2);
    }

    // Подсчитываем обычные ингредиенты
    burgerConstructor.ingredients.forEach((ingredient: ConstructorIngredient) => {
      const ingredientId = ingredient._id;
      countMap.set(ingredientId, (countMap.get(ingredientId) ?? 0) + 1);
    });

    // Возвращаем ингредиенты с актуальными счётчиками
    return allIngredients.map((ingredient: TIngredient) => ({
      ...ingredient,
      count: countMap.get(ingredient._id) ?? 0,
    }));
  }
);

// Селектор для общей стоимости
export const selectTotalPrice = createSelector(
  [(state: RootState) => state.burgerConstructor],
  (burgerConstructor: BurgerConstructorState) => {
    let total = 0;

    if (burgerConstructor.bun) {
      total += burgerConstructor.bun.price * 2;
    }

    total += burgerConstructor.ingredients.reduce(
      (sum: number, item: ConstructorIngredient) => sum + item.price,
      0
    );

    return total;
  }
);

// Тип для ингредиента с счётчиком
export type TIngredientWithCount = TIngredient & {
  count: number;
};
