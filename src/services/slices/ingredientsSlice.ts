import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getIngredientsApi } from '../../utils/burger-api';

import type { TIngredient } from '../../utils/types';
import type { RootState } from '../store';
import type { PayloadAction } from '@reduxjs/toolkit';

type IngredientsState = {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
};

const initialState: IngredientsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIngredientsApi();
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка загрузки ингредиентов';
      return rejectWithValue(errorMessage);
    }
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<TIngredient[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Ошибка загрузки ингредиентов';
      });
  },
});

// Селекторы
export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;
export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.loading;
export const selectIngredientsError = (state: RootState): string | null =>
  state.ingredients.error;

export default ingredientsSlice.reducer;
