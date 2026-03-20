import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils/types';
import type { RootState } from '@/services/store';


interface BurgerConstructorState {
  bun: TIngredient | null;
  ingredients: TIngredient[];
  loading: boolean;
  error: string | null;

}

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
  loading: false,
  error: null,
};


// Расширенный тип ингредиента с уникальным ID для конструктора
export interface ConstructorIngredient extends TIngredient {
uniqueId: string;
}



const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    //Добавление ингредиента в конструктор
    addIngredient:  (state, action: PayloadAction<TIngredient>) => {
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
    //Удаление ингредиента из конструктора

    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        item => item._id !== action.payload
      );
      // Сохраняем в localStorage
      localStorage.setItem('burgerConstructor', JSON.stringify({
        bun: state.bun,
        ingredients: state.ingredients
      }));
    },
    //Перемещение ингредиента
     moveIngredient: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const [moved] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, moved);
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


export default burgerConstructorSlice.reducer;
