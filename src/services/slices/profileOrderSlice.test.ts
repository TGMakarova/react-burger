import type { RootState } from '../store';
import { describe, it, expect } from 'vitest';
import profileOrdersReducer from './profileOrderSlice';
import {
  connect,
  disconnect,
  onOpen,
  onError,
  onMessage,
  selectProfileOrders,
  selectProfileOrdersLoading,
  selectProfileOrdersConnected,
  selectProfileOrdersError,
} from './profileOrderSlice';

import type { TOrder } from '../../utils/types';

//  Глобальные тестовые данные
const mockOrders: TOrder[] = [
  {
    _id: '1',
    ingredients: ['ing1', 'ing2'],
    status: 'done',
    name: 'Order 1',
    number: 123,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
  },
  {
    _id: '2',
    ingredients: ['ing3', 'ing4'],
    status: 'pending',
    name: 'Order 2',
    number: 124,
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:30:00Z',
  },
];

describe('profileOrders reducer', () => {
  // 1. Проверка начального состояния

  it('должен вернуть начальное состояние', () => {
    // Подготовка: вызываем редьюсер с undefined и пустым действием
    const result = profileOrdersReducer(undefined, { type: '' });

    // Проверка: результат должен быть равен initialState
    expect(result).toEqual({
      orders: [],
      loading: false,
      error: null,
      connected: false,
    });
  });

  //2. Проверка состояния  загрузки  loading false -> loading true
  it('должен установить loading=true при connect', () => {
    const initialState = {
      orders: [],
      loading: false,
      error: null,
      connected: false,
    };

    const result = profileOrdersReducer(initialState, connect('ws://test.com'));

    expect(result.loading).toBe(true); // Проверяем, что loading стал true
    expect(result.connected).toBe(false); // connected не изменился
  });

  // 3. Проверка Actions
  // 3.1.  Проверка onOpen
  it('должен установить connected=true при onOpen', () => {
    const initialState = {
      orders: [],
      loading: true,
      error: 'Ошибка',
      connected: false,
    };

    const result = profileOrdersReducer(initialState, onOpen());

    expect(result.connected).toBe(true); // connected стал true
    expect(result.loading).toBe(false); // loading выключился
    expect(result.error).toBe(null); //  ошибка сброшена
  });

  // 3.2 Проверка onMessage orders: [] -> orders: [mockOrders]
  it('должен сохранить заказы при onMessage', () => {
    const initialState = {
      orders: [],
      loading: true,
      error: null,
      connected: false,
    };
    const result = profileOrdersReducer(initialState, onMessage({ orders: mockOrders }));

    expect(result.orders).toEqual(mockOrders); // заказы сохранились
    expect(result.loading).toBe(false); //  загрузка выключилась
  });

  // 3.3  Проверка onError
  it('должен сохранить ошибку и выключить loading при onError', () => {
    const initialState = {
      orders: mockOrders,
      loading: true,
      error: null,
      connected: false,
    };

    const errorMessage = 'WebSocket connection failed';
    const result = profileOrdersReducer(initialState, onError(errorMessage));

    expect(result.error).toBe(errorMessage);
    expect(result.loading).toBe(false);
    expect(result.connected).toBe(false);
    expect(result.orders).toEqual(mockOrders); // заказы НЕ должны очищаться при ошибке
  });

  // 3.4 Проверка disconnect
  it('должен очистить заказы и отключиться при disconnect', () => {
    const initialState = {
      orders: mockOrders,
      loading: false,
      error: null,
      connected: true,
    };

    const result = profileOrdersReducer(initialState, disconnect());

    expect(result.connected).toBe(false);
    expect(result.orders).toEqual([]); //  заказы очистились
    expect(result.loading).toBe(false); //  loading не изменился
    expect(result.error).toBe(null); //  ошибка не изменилась
  });

  //3.5. Проверка disconnect во время загрузки

  it('должен корректно обработать disconnect во время загрузки', () => {
    const initialState = {
      orders: [],
      loading: true, // идёт подключение
      error: null,
      connected: false,
    };

    const result = profileOrdersReducer(initialState, disconnect());

    expect(result.connected).toBe(false);
    expect(result.loading).toBe(true);
    expect(result.orders).toEqual([]);
  });

  // 3.6. Проверка, что onMessage заменяет старые заказы, а не добавляет
  it('должен заменить существующие заказы новыми при onMessage', () => {
    const oldOrders = [{ _id: 'old', number: 999 }] as TOrder[];
    const initialState = {
      orders: oldOrders,
      loading: true,
      error: null,
      connected: true,
    };

    const newOrders = [{ _id: 'new', number: 1000 }] as TOrder[];
    const result = profileOrdersReducer(initialState, onMessage({ orders: newOrders }));

    expect(result.orders).toEqual(newOrders); // старые заказы заменены
    expect(result.orders).not.toEqual(oldOrders); //  старых больше нет
    expect(result.orders.length).toBe(1); //  только новые заказы
  });

  // 3.7. Проверка с пустым массивом заказов
  it('должен корректно обработать пустой массив заказов в onMessage', () => {
    const initialState = {
      orders: mockOrders,
      loading: true,
      error: null,
      connected: true,
    };

    const result = profileOrdersReducer(initialState, onMessage({ orders: [] }));

    expect(result.orders).toEqual([]); // заказы очистились
    expect(result.loading).toBe(false); //  загрузка выключилась
  });

  //4. Дополнительные проверки

  // 4.1. Проверка последовательности действий (жизненный цикл)
  it('должен правильно обработать полный цикл: connect → onOpen → onMessage → disconnect', () => {
    let state = profileOrdersReducer(undefined, { type: '' });

    // 1. Подключение
    state = profileOrdersReducer(state, connect('ws://test.com'));
    expect(state.loading).toBe(true);
    expect(state.connected).toBe(false);

    // 2. Открытие соединения
    state = profileOrdersReducer(state, onOpen());
    expect(state.connected).toBe(true);
    expect(state.loading).toBe(false);

    // 3. Получение заказов
    state = profileOrdersReducer(state, onMessage({ orders: mockOrders }));
    expect(state.orders).toEqual(mockOrders);
    expect(state.loading).toBe(false);

    // 4. Отключение
    state = profileOrdersReducer(state, disconnect());
    expect(state.connected).toBe(false);
    expect(state.orders).toEqual([]);
  });

  // 4.2. Проверка, что неизвестный экшен не меняет состояние
  it('не должен изменять состояние при неизвестном экшене', () => {
    const initialState = {
      orders: mockOrders,
      loading: true,
      error: 'some error',
      connected: true,
    };

    const result = profileOrdersReducer(initialState, { type: 'UNKNOWN_ACTION' });

    expect(result).toEqual(initialState); //  состояние не изменилось
  });

  // 4.3. Проверка, что connect не сбрасывает существующие заказы
  it('не должен сбрасывать заказы при повторном connect', () => {
    const initialState = {
      orders: mockOrders,
      loading: false,
      error: null,
      connected: true,
    };

    const result = profileOrdersReducer(initialState, connect('ws://test.com'));

    expect(result.loading).toBe(true); //  loading изменился
    expect(result.orders).toEqual(mockOrders); //  заказы остались
    expect(result.connected).toBe(true); //  connected остался
  });

  // 4.4. Проверка, что onOpen сбрасывает ошибку даже если её не было
  it('должен сбросить error в null при onOpen, даже если ошибки не было', () => {
    const initialState = {
      orders: [],
      loading: true,
      error: null,
      connected: false,
    };

    const result = profileOrdersReducer(initialState, onOpen());

    expect(result.error).toBe(null); //  всё равно null
    expect(result.connected).toBe(true);
  });

  // 4.5. Проверка, что несколько ошибок подряд корректно обрабатываются
  it('должен корректно обработать несколько ошибок подряд', () => {
    let state = profileOrdersReducer(undefined, { type: '' });

    state = profileOrdersReducer(state, onError('Ошибка 1'));
    expect(state.error).toBe('Ошибка 1');
    expect(state.loading).toBe(false);

    state = profileOrdersReducer(state, onError('Ошибка 2'));
    expect(state.error).toBe('Ошибка 2'); //  ошибка обновилась
    expect(state.loading).toBe(false);
  });

  // 4.6. Проверка onMessage после ошибки
  it('должен восстановить работу после ошибки при новом onMessage', () => {
    const initialState = {
      orders: [],
      loading: false,
      error: 'Предыдущая ошибка',
      connected: false,
    };

    const result = profileOrdersReducer(initialState, onMessage({ orders: mockOrders }));

    expect(result.orders).toEqual(mockOrders); // заказы пришли
    expect(result.error).toBe(null); //  ошибка сброшена
    expect(result.loading).toBe(false);
  });

  //4.7 Проверка сброса connected при error
  it('должен сбросить connected при onError', () => {
    const initialState = {
      orders: [],
      loading: false,
      error: null,
      connected: true, // были подключены
    };

    const result = profileOrdersReducer(initialState, onError('Ошибка'));

    expect(result.connected).toBe(false); // connected должен стать false
    expect(result.error).toBe('Ошибка');
    expect(result.loading).toBe(false);
  });

  //4.8 Проверка иммутабельности

  it('не должен мутировать исходное состояние', () => {
    const originalState = {
      orders: [],
      loading: false,
      error: null,
      connected: false,
    };
    const frozenState = JSON.parse(JSON.stringify(originalState));

    profileOrdersReducer(originalState, connect('ws://test.com'));

    expect(originalState).toEqual(frozenState); // исходное не изменилось
  });
});
// Тестирование селекторов
describe('selectors', () => {
  const mockState = {
    profileOrders: {
      orders: mockOrders,
      loading: true,
      error: 'test error',
      connected: false,
    },
  } as RootState;

  it('selectProfileOrders должен вернуть заказы', () => {
    expect(selectProfileOrders(mockState)).toEqual(mockOrders);
  });

  it('selectProfileOrdersLoading должен вернуть loading', () => {
    expect(selectProfileOrdersLoading(mockState)).toBe(true);
  });

  it('selectProfileOrdersError должен вернуть ошибку', () => {
    expect(selectProfileOrdersError(mockState)).toBe('test error');
  });

  it('selectProfileOrdersConnected должен вернуть connected', () => {
    expect(selectProfileOrdersConnected(mockState)).toBe(false);
  });
});
