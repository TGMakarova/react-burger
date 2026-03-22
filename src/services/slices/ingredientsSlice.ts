import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIngredients } from '../../utils/api';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';
import type { RootState } from '@/services/store';

// Тип для состояния
interface IngredientsState {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
}

// Асинхронный экшен
export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    const ingredients = await getIngredients();
    return ingredients as TIngredient[];
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла неизвестная ошибка');
  }
});

const initialState: IngredientsState = {
  items: [],
  loading: false,
  error: null,
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    clearIngredients: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка при загрузке ингредиентов';
      });
  },
});

//export const { clearIngredients } = ingredientsSlice.actions;
export default ingredientsSlice.reducer;
// Селекторы
export const selectIngredients = (state: RootState) => state.ingredients.items;
export const selectIngredientsLoading = (state: RootState) => state.ingredients.loading;
export const selectIngredientsError = (state: RootState) => state.ingredients.error;
