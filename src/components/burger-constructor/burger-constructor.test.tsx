import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { useDrop, useDrag } from 'react-dnd';

import { BurgerConstructor } from './burger-constructor';
import burgerConstructorReducer from '../../services/slices/burgerConstructorSlice';
import orderReducer from '../../services/slices/orderSlice';
import * as orderSlice from '../../services/slices/orderSlice';
import authReducer from '../../services/slices/authSlice';

// Мок Modal
vi.mock('../modal/modal', () => ({
  Modal: ({ isOpen, children, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        {children}
        <button data-testid="modal-close" onClick={onClose}>Закрыть</button>
      </div>
    );
  },
}));

vi.mock('react-dnd', () => ({
  useDrop: vi.fn(() => [{ isHover: false }, vi.fn()]),
  useDrag: vi.fn(() => [{ isDragging: false }, vi.fn(), vi.fn()]),
}));

vi.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

global.fetch = vi.fn();

describe('BurgerConstructor', () => {
  let store: ReturnType<typeof configureStore>;

  const mockIngredient = {
    _id: 'ing1',
    name: 'Тест',
    type: 'main' as const,
    price: 100,
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 150,
    image: 'test.jpg',
    image_mobile: 'test-mobile.jpg',
    image_large: 'test-large.jpg',
    __v: 0,
  };

  const mockBun = {
    _id: 'bun1',
    name: 'Булка',
    type: 'bun' as const,
    price: 100,
    proteins: 10,
    fat: 5,
    carbohydrates: 30,
    calories: 200,
    image: 'bun.jpg',
    image_mobile: 'bun-mobile.jpg',
    image_large: 'bun-large.jpg',
    __v: 0,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        burgerConstructor: burgerConstructorReducer,
        order: orderReducer,
        auth: authReducer,
      },
    });
    localStorage.setItem('accessToken', 'fake-token');
    (global.fetch as any).mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <BurgerConstructor />
        </MemoryRouter>
      </Provider>
    );
  };

  it('перетаскивание ингредиента в конструктор', () => {
    renderComponent();
    const dropSpec = vi.mocked(useDrop).mock.calls[0][0] as any;
    dropSpec.drop(mockIngredient, {});
    const state = store.getState() as any;
    expect(state.burgerConstructor.ingredients).toHaveLength(1);
  });

  it('открытие модального окна заказа', async () => {
    store.dispatch({
      type: 'burgerConstructor/addIngredient',
      payload: { ...mockBun, constructorId: 'bun1' },
    });
    store.dispatch({
      type: 'burgerConstructor/addIngredient',
      payload: { ...mockIngredient, constructorId: 'ing1' },
    });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, order: { number: 54321 } }),
    });
    renderComponent();

    const buttons = await screen.findAllByRole('button', { name: /оформить заказ/i });
    const activeButton = buttons.find((btn) => !btn.hasAttribute('disabled'));
    fireEvent.click(activeButton!);

    await waitFor(() => {
      const state = store.getState() as any;
      expect(state.order.orderNumber).toEqual(54321);
    });
  });
  
it('закрытие модального окна', async () => {
  store.dispatch({ type: 'burgerConstructor/addIngredient', payload: { ...mockBun, constructorId: 'bun1' } });
  store.dispatch({ type: 'burgerConstructor/addIngredient', payload: { ...mockIngredient, constructorId: 'ing1' } });
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, order: { number: null } }),
  });
  renderComponent();

  const buttons = await screen.findAllByRole('button', { name: /оформить заказ/i });
  const activeButton = buttons.find((btn) => !btn.hasAttribute('disabled'));
  fireEvent.click(activeButton!);

  // Ждём, что orderNumber установился (как в тесте открытия)
  await waitFor(() => {
    const state = store.getState() as any;
    expect(state.order.orderNumber).toBe(null);
  });

  // Находим кнопку закрытия (первую) и кликаем
  const closeButtons = screen.getAllByTestId('modal-close');
  fireEvent.click(closeButtons[0]);

  // Ждём, что orderNumber стал null (clearOrder сработал)
  await waitFor(() => {
    const state = store.getState() as any;
    expect(state.order.orderNumber).toBeNull();
  });
});
  
});
