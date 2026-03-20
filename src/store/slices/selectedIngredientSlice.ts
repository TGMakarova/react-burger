import { createSlice } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';
import type {PayloadAction} from  '@reduxjs/toolkit';

interface SelectedIngredientState {
  ingredient: TIngredient | null;
}

const initialState: SelectedIngredientState = {
  ingredient: null,
};

const selectedIngredientSlice = createSlice({
  name: 'selectedIngredient',
  initialState,
  reducers: {
    setSelectedIngredient: (state, action: PayloadAction<TIngredient | null>) => {
      state.ingredient = action.payload;
    },
    clearSelectedIngredient: (state) => {
      state.ingredient = null;
    },
  },
});

export const { setSelectedIngredient, clearSelectedIngredient } = selectedIngredientSlice.actions;
export default selectedIngredientSlice.reducer;