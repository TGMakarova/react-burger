import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIngredients } from '../utils/api'; // предполагаем, что у вас есть API функция

// Асинхронный экшен для получения ингредиентов
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIngredients();
      return response.data; // предполагаем, что данные находятся в response.data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Синхронные редьюсеры (если нужны)
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

export const { clearIngredients } = ingredientsSlice.actions;
export default ingredientsSlice.reducer;