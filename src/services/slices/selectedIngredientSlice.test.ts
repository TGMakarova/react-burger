import { describe, it, expect } from 'vitest';
import selectedIngredientReducer, {
  initialState,
  setSelectedIngredient,
  clearSelectedIngredient,
} from './selectedIngredientSlice';
import type { TIngredient } from '../../utils/types';

describe('Слайс выбранного ингредиента', () => {
  // Моковый ингредиент для тестов
  const mockIngredient: TIngredient = {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1250,
    image: 'https://code.s3.yandex.net/react/code/bun-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-01-large.png',
    __v: 0,
  };

  describe('Начальное состояние', () => {
    it('должно возвращать initialState', () => {
      expect(initialState).toEqual({ ingredient: null });
    });
  });

  describe('Редьюсер setSelectedIngredient', () => {
    it('должен установить переданный ингредиент', () => {
      const newState = selectedIngredientReducer(
        initialState,
        setSelectedIngredient(mockIngredient)
      );
      expect(newState.ingredient).toEqual(mockIngredient);
    });

    it('должен установить null, если передан null', () => {
      // Сначала установим ингредиент, затем сбросим через setSelectedIngredient(null)
      let state = selectedIngredientReducer(
        initialState,
        setSelectedIngredient(mockIngredient)
      );
      expect(state.ingredient).not.toBeNull();

      state = selectedIngredientReducer(state, setSelectedIngredient(null));
      expect(state.ingredient).toBeNull();
    });
  });

  describe('Редьюсер clearSelectedIngredient', () => {
    it('должен сбросить ингредиент в null (если он был установлен)', () => {
      let state = selectedIngredientReducer(
        initialState,
        setSelectedIngredient(mockIngredient)
      );
      expect(state.ingredient).toEqual(mockIngredient);

      state = selectedIngredientReducer(state, clearSelectedIngredient());
      expect(state.ingredient).toBeNull();
    });

    it('если ингредиент уже null, clearSelectedIngredient оставляет null', () => {
      const state = selectedIngredientReducer(
        initialState,
        clearSelectedIngredient()
      );
      expect(state.ingredient).toBeNull();
    });
  });
});
