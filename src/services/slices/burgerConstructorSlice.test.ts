import { describe, it, expect } from 'vitest';
import burgerConstructorReducer, {
  initialState,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  selectIngredientsWithCounts,
  selectTotalPrice,
  type ConstructorIngredient,
  type TIngredientWithCount,
} from './burgerConstructorSlice';
import type { RootState } from '../store';
import { initialState as ingredientsInitialState } from './ingredientsSlice';
import { createTestRootState } from '../../utils/test-utils';
import type { TIngredient } from '@utils/types';

const createBun = (id: string, price: number): ConstructorIngredient => ({
  _id: id,
  name: `Булка ${id}`,
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 30,
  calories: 200,
  price,
  image: '',
  image_mobile: '',
  image_large: '',
  __v: 0,
  constructorId: `bun-${id}`,
});

const createIngredient = (id: string, price: number, index: number): ConstructorIngredient => ({
  _id: id,
  name: `Ингредиент ${id}`,
  type: 'main',
  proteins: 5,
  fat: 2,
  carbohydrates: 15,
  calories: 100,
  price,
  image: '',
  image_mobile: '',
  image_large: '',
  __v: 0,
  constructorId: `ing-${id}-${index}`,
});

describe('Слайс конструктора бургера', () => {
  // Вспомогательные фабрики для создания тестовых ингредиентов
  const createBun = (id: string, price: number): ConstructorIngredient => ({
    _id: id,
    name: `Булка ${id}`,
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 30,
    calories: 200,
    price,
    image: '',
    image_mobile: '',
    image_large: '',
    __v: 0,
    constructorId: `bun-${id}`,
  });

  const createIngredient = (id: string, price: number, index: number): ConstructorIngredient => ({
    _id: id,
    name: `Ингредиент ${id}`,
    type: 'main',
    proteins: 5,
    fat: 2,
    carbohydrates: 15,
    calories: 100,
    price,
    image: '',
    image_mobile: '',
    image_large: '',
    __v: 0,
    constructorId: `ing-${id}-${index}`,
  });

  const mockBun: ConstructorIngredient = createBun('bun1', 100);
  const mockIngredient1: ConstructorIngredient = createIngredient('ing1', 50, 1);
  const mockIngredient2: ConstructorIngredient = createIngredient('ing2', 75, 2);
  const mockIngredient3: ConstructorIngredient = createIngredient('ing3', 30, 3);

  describe('Начальное состояние', () => {
    it('должно возвращать initialState', () => {
      expect(initialState).toEqual({ bun: null, ingredients: [] });
    });
  });

  describe('Редьюсер addIngredient', () => {
    it('должен добавить булку в поле bun (заменяя предыдущую)', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockBun));
      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toHaveLength(0);

      // Добавление другой булки должно заменить старую
      const anotherBun = createBun('bun2', 120);
      state = burgerConstructorReducer(state, addIngredient(anotherBun));
      expect(state.bun).toEqual(anotherBun);
      expect(state.ingredients).toHaveLength(0);
    });

    it('должен добавить обычный ингредиент в массив ingredients', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockIngredient1));
      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([mockIngredient1]);

      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));
      expect(state.ingredients).toEqual([mockIngredient1, mockIngredient2]);
    });

    it('должен корректно обрабатывать добавление и булки, и ингредиентов вместе', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockBun));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient1));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));

      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toEqual([mockIngredient1, mockIngredient2]);
    });
  });

  describe('Редьюсер removeIngredient', () => {
    it('должен удалить ингредиент по constructorId', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockIngredient1));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));
      expect(state.ingredients).toHaveLength(2);

      state = burgerConstructorReducer(state, removeIngredient(mockIngredient1.constructorId));
      expect(state.ingredients).toEqual([mockIngredient2]);

      state = burgerConstructorReducer(state, removeIngredient(mockIngredient2.constructorId));
      expect(state.ingredients).toEqual([]);
    });

    it('не должен ничего менять, если ингредиент с таким constructorId не найден', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockIngredient1));
      const original = { ...state };
      state = burgerConstructorReducer(state, removeIngredient('non-existent-id'));
      expect(state).toEqual(original);
    });
  });

  describe('Редьюсер moveIngredient', () => {
    it('должен перемещать ингредиент внутри списка', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockIngredient1));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient3));
      // Исходный порядок: [ing1, ing2, ing3]

      // Перемещаем ing1 (индекс 0) на позицию ing2 (индекс 1) -> должно остаться [ing2, ing1, ing3]
      state = burgerConstructorReducer(
        state,
        moveIngredient({ dragIndex: 0, hoverIndex: 1 })
      );
      expect(state.ingredients).toEqual([mockIngredient2, mockIngredient1, mockIngredient3]);

      // Перемещаем ing3 (индекс 2) на позицию ing2 (индекс 0) -> [ing3, mockIngredient2, mockIngredient1]
      state = burgerConstructorReducer(
        state,
        moveIngredient({ dragIndex: 2, hoverIndex: 0 })
      );
      expect(state.ingredients).toEqual([mockIngredient3, mockIngredient2, mockIngredient1]);
    });

    it('не должен изменять список, если dragIndex === hoverIndex', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockIngredient1));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));
      const original = { ...state };
      state = burgerConstructorReducer(state, moveIngredient({ dragIndex: 0, hoverIndex: 0 }));
      expect(state).toEqual(original);
    });
  });

  describe('Редьюсер clearConstructor', () => {
    it('должен сбросить bun и ingredients в null/пустой массив', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(mockBun));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient1));
      state = burgerConstructorReducer(state, addIngredient(mockIngredient2));
      expect(state.bun).not.toBeNull();
      expect(state.ingredients).toHaveLength(2);

      state = burgerConstructorReducer(state, clearConstructor());
      expect(state).toEqual(initialState);
    });
  });

  describe('Селекторы (мемоизированные)', () => {
    // Подготавливаем полный список всех доступных ингредиентов для селектора selectIngredientsWithCounts
    const allIngredientsMock: TIngredient[] = [
      { _id: 'bun1', name: 'Булка', type: 'bun', proteins: 10, fat: 5, carbohydrates: 30, calories: 200, price: 100, image: '', image_mobile: '', image_large: '', __v: 0 },
      { _id: 'ing1', name: 'Инг1', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 50, image: '', image_mobile: '', image_large: '', __v: 0 },
      { _id: 'ing2', name: 'Инг2', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 75, image: '', image_mobile: '', image_large: '', __v: 0 },
      { _id: 'ing3', name: 'Инг3', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 30, image: '', image_mobile: '', image_large: '', __v: 0 },
    ];

   const createFullState = (bun: ConstructorIngredient | null, ingredients: ConstructorIngredient[]) =>
  createTestRootState({
    ingredients: {
      ...ingredientsInitialState, // содержит items, loading, error
      items: allIngredientsMock,
    },
    burgerConstructor: { bun, ingredients },
  });

    describe('selectIngredientsWithCounts', () => {
      it('должен вернуть все ингредиенты с нулевым счётчиком, если конструктор пуст', () => {
        const state = createFullState(null, []);
        const result = selectIngredientsWithCounts(state);
        expect(result).toHaveLength(allIngredientsMock.length);
        result.forEach((item: TIngredientWithCount) => {
          expect(item.count).toBe(0);
        });
      });

      it('должен учитывать булку (счётчик 2) и обычные ингредиенты (+1 каждый)', () => {
        const bun = createBun('bun1', 100);
        const ing1 = createIngredient('ing1', 50, 1);
        const ing1Duplicate = createIngredient('ing1', 50, 2); // тот же _id, другой constructorId
        const state = createFullState(bun, [ing1, ing1Duplicate]);

        const result = selectIngredientsWithCounts(state);
        const bunEntry = result.find((i: TIngredientWithCount) => i._id === 'bun1');
        const ingEntry = result.find((i: TIngredientWithCount) => i._id === 'ing1');
        const otherEntry = result.find((i: TIngredientWithCount) => i._id === 'ing2');

        expect(bunEntry?.count).toBe(2);
        expect(ingEntry?.count).toBe(2);   // два экземпляра ing1
        expect(otherEntry?.count).toBe(0);
      });

      it('должен корректно обрабатывать ситуацию, когда булки нет, а ингредиенты есть', () => {
        const ing1 = createIngredient('ing1', 50, 1);
        const ing2 = createIngredient('ing2', 75, 2);
        const state = createFullState(null, [ing1, ing2]);

        const result = selectIngredientsWithCounts(state);
        const ing1Entry = result.find((i: TIngredientWithCount) => i._id === 'ing1');
        const ing2Entry = result.find((i: TIngredientWithCount) => i._id === 'ing2');
        expect(ing1Entry?.count).toBe(1);
        expect(ing2Entry?.count).toBe(1);
      });
    });

    describe('selectTotalPrice', () => {
      it('должен вернуть 0, если конструктор пуст', () => {
        const state = createFullState(null, []);
        expect(selectTotalPrice(state)).toBe(0);
      });

      it('должен учитывать булку (цена * 2) и сумму всех ингредиентов', () => {
        const bun = createBun('bun1', 100);
        const ing1 = createIngredient('ing1', 50, 1);
        const ing2 = createIngredient('ing2', 75, 2);
        const state = createFullState(bun, [ing1, ing2]);

        const expected = 100 * 2 + 50 + 75; // 200 + 125 = 325
        expect(selectTotalPrice(state)).toBe(expected);
      });

      it('должен корректно считать, если есть только булка', () => {
        const bun = createBun('bun1', 150);
        const state = createFullState(bun, []);
        expect(selectTotalPrice(state)).toBe(300);
      });

      it('должен корректно считать, если есть только ингредиенты (без булки)', () => {
        const ing1 = createIngredient('ing1', 50, 1);
        const ing2 = createIngredient('ing2', 75, 2);
        const state = createFullState(null, [ing1, ing2]);
        expect(selectTotalPrice(state)).toBe(50 + 75);
      });
    });
  });
});describe('Селекторы (мемоизированные)', () => {
  // Подготавливаем полный список всех доступных ингредиентов
  const allIngredientsMock: TIngredient[] = [
    { _id: 'bun1', name: 'Булка', type: 'bun', proteins: 10, fat: 5, carbohydrates: 30, calories: 200, price: 100, image: '', image_mobile: '', image_large: '', __v: 0 },
    { _id: 'ing1', name: 'Инг1', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 50, image: '', image_mobile: '', image_large: '', __v: 0 },
    { _id: 'ing2', name: 'Инг2', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 75, image: '', image_mobile: '', image_large: '', __v: 0 },
    { _id: 'ing3', name: 'Инг3', type: 'main', proteins: 5, fat: 2, carbohydrates: 15, calories: 100, price: 30, image: '', image_mobile: '', image_large: '', __v: 0 },
  ];

  const createFullState = (bun: ConstructorIngredient | null, ingredients: ConstructorIngredient[]) =>
    createTestRootState({
      ingredients: {
        ...ingredientsInitialState, // содержит items, loading, error
        items: allIngredientsMock,
      },
      burgerConstructor: { bun, ingredients },
    });

  describe('selectIngredientsWithCounts', () => {
    it('должен вернуть все ингредиенты с нулевым счётчиком, если конструктор пуст', () => {
      const state = createFullState(null, []);
      const result = selectIngredientsWithCounts(state);
      expect(result).toHaveLength(allIngredientsMock.length);
      result.forEach((item: TIngredientWithCount) => {
        expect(item.count).toBe(0);
      });
    });

    it('должен учитывать булку (счётчик 2) и обычные ингредиенты (+1 каждый)', () => {
      const bun = createBun('bun1', 100);
      const ing1 = createIngredient('ing1', 50, 1);
      const ing1Duplicate = createIngredient('ing1', 50, 2);
      const state = createFullState(bun, [ing1, ing1Duplicate]);

      const result = selectIngredientsWithCounts(state);
      const bunEntry = result.find((i: TIngredientWithCount) => i._id === 'bun1');
      const ingEntry = result.find((i: TIngredientWithCount) => i._id === 'ing1');
      const otherEntry = result.find((i: TIngredientWithCount) => i._id === 'ing2');

      expect(bunEntry?.count).toBe(2);
      expect(ingEntry?.count).toBe(2);
      expect(otherEntry?.count).toBe(0);
    });

    it('должен корректно обрабатывать ситуацию, когда булки нет, а ингредиенты есть', () => {
      const ing1 = createIngredient('ing1', 50, 1);
      const ing2 = createIngredient('ing2', 75, 2);
      const state = createFullState(null, [ing1, ing2]);

      const result = selectIngredientsWithCounts(state);
      const ing1Entry = result.find((i: TIngredientWithCount) => i._id === 'ing1');
      const ing2Entry = result.find((i: TIngredientWithCount) => i._id === 'ing2');
      expect(ing1Entry?.count).toBe(1);
      expect(ing2Entry?.count).toBe(1);
    });
  });

  describe('selectTotalPrice', () => {
    it('должен вернуть 0, если конструктор пуст', () => {
      const state = createFullState(null, []);
      expect(selectTotalPrice(state)).toBe(0);
    });

    it('должен учитывать булку (цена * 2) и сумму всех ингредиентов', () => {
      const bun = createBun('bun1', 100);
      const ing1 = createIngredient('ing1', 50, 1);
      const ing2 = createIngredient('ing2', 75, 2);
      const state = createFullState(bun, [ing1, ing2]);

      const expected = 100 * 2 + 50 + 75; // 325
      expect(selectTotalPrice(state)).toBe(expected);
    });

    it('должен корректно считать, если есть только булка', () => {
      const bun = createBun('bun1', 150);
      const state = createFullState(bun, []);
      expect(selectTotalPrice(state)).toBe(300);
    });

    it('должен корректно считать, если есть только ингредиенты (без булки)', () => {
      const ing1 = createIngredient('ing1', 50, 1);
      const ing2 = createIngredient('ing2', 75, 2);
      const state = createFullState(null, [ing1, ing2]);
      expect(selectTotalPrice(state)).toBe(125);
    });
  });
});