import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';

type SelectedIngredientState = {
  ingredient: TIngredient | null;
};

export const initialState: SelectedIngredientState = {
  ingredient: null,
};

const selectedIngredientSlice = createSlice({
  name: 'selectedIngredient',
  initialState,
  reducers: {
    //Добавление данных об ингредиенте для просмотра
    setSelectedIngredient: (state, action: PayloadAction<TIngredient | null>) => {
      state.ingredient = action.payload;
    },

    //Удаление данных при закрытии модального окна
    clearSelectedIngredient: (state) => {
      state.ingredient = null;
    },
  },
});

export const { setSelectedIngredient, clearSelectedIngredient } =
  selectedIngredientSlice.actions;
export default selectedIngredientSlice.reducer;
