import type { TIngredient } from '@utils/types';

// Типы экшенов для конструктора
export const CONSTRUCTOR_ACTIONS = {
  ADD_INGREDIENT: 'burgerConstructor/addIngredient',
  REMOVE_INGREDIENT: 'burgerConstructor/removeIngredient',
  MOVE_INGREDIENT: 'burgerConstructor/moveIngredient',
  CLEAR_CONSTRUCTOR: 'burgerConstructor/clearBurgerConstructor',
} as const;

// Типы экшенов для заказа
export const ORDER_ACTIONS = {
  SUBMIT_ORDER: 'order/submitOrder',
  CLEAR_ORDER: 'order/clearOrder',
} as const;

// Типы экшенов для ингредиентов
export const INGREDIENTS_ACTIONS = {
  FETCH_INGREDIENTS: 'ingredients/fetchIngredients',
} as const;

// Типизированные интерфейсы экшенов
export type AddIngredientAction = {
  type: typeof CONSTRUCTOR_ACTIONS.ADD_INGREDIENT;
  payload: TIngredient;
};

export type RemoveIngredientAction = {
  type: typeof CONSTRUCTOR_ACTIONS.REMOVE_INGREDIENT;
  payload: string;
};

export type MoveIngredientAction = {
  type: typeof CONSTRUCTOR_ACTIONS.MOVE_INGREDIENT;
  payload: { from: number; to: number };
};

export type ClearConstructorAction = {
  type: typeof CONSTRUCTOR_ACTIONS.CLEAR_CONSTRUCTOR;
};

// Общий тип для всех экшенов конструктора
export type ConstructorAction =
  | AddIngredientAction
  | RemoveIngredientAction
  | MoveIngredientAction
  | ClearConstructorAction;
