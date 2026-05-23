import { vi } from 'vitest';

vi.mock('@utils/burger-api', () => ({
  getIngredientsApi: vi.fn(),
}));


import { describe, it, expect, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import ingredientsReducer, {
  initialState,
  fetchIngredients,
  selectIngredients,
  selectIngredientsLoading,
  selectIngredientsError,
} from './ingredientsSlice';
import { createTestRootState } from '@utils/test-utils';
import type { TIngredient } from '../../utils/types';
import { getIngredientsApi } from '@utils/burger-api';

// 3. Типизированный мок для API
const mockedGetIngredientsApi = getIngredientsApi as MockedFunction<
  typeof getIngredientsApi
>;

// ======================= Тесты =======================

describe('ingredients slice', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ---------- Начальное состояние ----------
  it('should return initial state', () => {
    expect(ingredientsReducer(undefined, { type: 'test' })).toEqual(initialState);
  });

  // ---------- Тесты асинхронного thunk fetchIngredients ----------
  describe('fetchIngredients thunk', () => {
    it('dispatches fulfilled on success', async () => {
      const mockData: TIngredient[] = [
        /* ... */
      ];
      mockedGetIngredientsApi.mockResolvedValue({ data: mockData });

      const dispatch = vi.fn();
      const getState = vi.fn();

      await fetchIngredients()(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        fetchIngredients.pending(expect.any(String), undefined)
      );
      expect(dispatch).toHaveBeenCalledWith(
        fetchIngredients.fulfilled(mockData, expect.any(String), undefined)
      );
      // Дополнительно можно проверить, что rejected не вызывался
      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchIngredients.rejected.type })
      );
      expect(mockedGetIngredientsApi).toHaveBeenCalledTimes(1);
    });

    it('dispatches rejected on API error', async () => {
  // Сначала сбрасываем всё и задаём реализацию по умолчанию
  mockedGetIngredientsApi.mockRestore(); // Возвращает к исходному моку (vi.fn())
  // Затем задаём нужное поведение
  mockedGetIngredientsApi.mockRejectedValue(new Error('Network error'));

  const dispatch = vi.fn();
  const getState = vi.fn();

  await fetchIngredients()(dispatch, getState, undefined);

  expect(dispatch).toHaveBeenCalledWith(
    fetchIngredients.pending(expect.any(String), undefined)
  );

  const rejectedAction = dispatch.mock.calls.find(
    call => call[0].type === fetchIngredients.rejected.type
  )?.[0];
  expect(rejectedAction).toBeDefined();
  expect(rejectedAction.payload).toBe('Network error');
});
  });

  // ---------- Тесты редьюсера на экшены ----------
  describe('reducer actions', () => {
    it('pending action sets loading = true and clears error', () => {
      const action = fetchIngredients.pending('testRequestId', undefined);
      const nextState = ingredientsReducer(initialState, action);
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBe(null);
    });

    it('fulfilled action sets loading = false and stores ingredients', () => {
      const mockIngredients: TIngredient[] = [
        {
          _id: '2',
          name: 'Соус',
          type: 'sauce',
          proteins: 2,
          fat: 10,
          carbohydrates: 5,
          calories: 100,
          price: 50,
          image: 'url2',
          image_mobile: 'url2',
          image_large: 'url2',
          __v: 0,
        },
      ];
      const action = fetchIngredients.fulfilled(
        mockIngredients,
        'testRequestId',
        undefined
      );
      const nextState = ingredientsReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.items).toEqual(mockIngredients);
      expect(nextState.error).toBe(null);
    });

    it('rejected action sets loading = false and stores error message', () => {
      const errorMessage = 'Network error';
      const action = fetchIngredients.rejected(
        new Error(errorMessage),
        'testRequestId',
        undefined,
        errorMessage
      );
      const nextState = ingredientsReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe(errorMessage);
    });

    it('rejected action uses default error message when payload is undefined', () => {
      // Вручную создаём экшен, имитирующий rejected без rejectValue
      const action = {
        type: fetchIngredients.rejected.type,
        payload: undefined,
      } as any;
      const nextState = ingredientsReducer(initialState, action);
      expect(nextState.error).toBe('Ошибка загрузки ингредиентов');
    });
  });

  // ---------- Тесты селекторов ----------
  describe('selectors', () => {
    const mockIngredients: TIngredient[] = [
      {
        _id: '3',
        name: 'Начинка',
        type: 'main',
        proteins: 15,
        fat: 20,
        carbohydrates: 30,
        calories: 250,
        price: 120,
        image: 'url3',
        image_mobile: 'url3',
        image_large: 'url3',
        __v: 0,
      },
    ];

    const filledState = createTestRootState({
      ingredients: {
        items: mockIngredients,
        loading: true,
        error: 'Test error',
      },
    });

    it('selectIngredients returns items', () => {
      expect(selectIngredients(filledState)).toEqual(mockIngredients);
    });

    it('selectIngredientsLoading returns loading flag', () => {
      expect(selectIngredientsLoading(filledState)).toBe(true);
    });

    it('selectIngredientsError returns error', () => {
      expect(selectIngredientsError(filledState)).toBe('Test error');
    });

    it('selectors return initial values when state is empty', () => {
      const emptyState = createTestRootState();
      expect(selectIngredients(emptyState)).toEqual([]);
      expect(selectIngredientsLoading(emptyState)).toBe(false);
      expect(selectIngredientsError(emptyState)).toBe(null);
    });
  });
});
