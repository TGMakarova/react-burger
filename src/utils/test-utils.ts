import type { RootState } from '../services/store';
import { initialState as ingredientsInitialState } from '../services/slices/ingredientsSlice';
import { initialState as burgerConstructorInitialState } from '../services/slices/burgerConstructorSlice';
import { initialState as selectedIngredientInitialState } from '../services/slices/selectedIngredientSlice';
import { initialState as authInitialState } from '../services/slices/authSlice';
import { initialState as orderInitialState } from '../services/slices/orderSlice';
import { initialState as feedInitialState } from '../services/slices/feedSlice';
import { initialState as profileFeedInitialState } from '../services/slices/profileFeedSlice';
import { initialState as profileOrdersInitialState } from '../services/slices/profileOrderSlice';

// Собираем корневое состояние из реальных начальных состояний
export const defaultRootState: RootState = {
  ingredients: ingredientsInitialState,
  burgerConstructor: burgerConstructorInitialState,
  selectedIngredient: selectedIngredientInitialState,
  auth: authInitialState,
  order: orderInitialState,
  feed: feedInitialState,
  profileFeed: profileFeedInitialState,
  profileOrders: profileOrdersInitialState,
};

// Функция для создания переопределённого состояния
export const createTestRootState = <K extends keyof RootState>(
  overrides?: Partial<Pick<RootState, K>>
): RootState => ({
  ...defaultRootState,
  ...overrides,
});
