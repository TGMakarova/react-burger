import { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useDispatch, useSelector } from '../../hooks/customHooks';
import {
  addIngredient,
  clearConstructor,
} from '../../services/slices/burgerConstructorSlice';
import { submitOrder, clearOrder } from '../../services/slices/orderSlice';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import { OtherDetails } from '../other-details/other-details';

import type { ConstructorIngredient } from '../../services/slices/burgerConstructorSlice';
import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef<HTMLElement>(null);

  // Получаем данные из Redux store
  const { bun, ingredients } = useSelector((state) => state.burgerConstructor);

  const { orderNumber, loading, error } = useSelector((state) => state.order);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Проверка авторизации
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  };

  // Сохраняем конструктор в localStorage
  const saveConstructorToLocalStorage = (): void => {
    if (bun || ingredients.length > 0) {
      const constructorData = {
        bun: bun,
        ingredients: ingredients,
      };
      localStorage.setItem('savedConstructor', JSON.stringify(constructorData));
    }
  };

  // Восстанавливаем конструктор после авторизации
  useEffect(() => {
    const savedConstructor = localStorage.getItem('savedConstructor');
    const returnTo = localStorage.getItem('returnTo');

    if (
      savedConstructor &&
      !isRestored &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      if (returnTo && returnTo !== location.pathname) {
        return;
      }

      try {
        const { bun: savedBun, ingredients: savedIngredients } = JSON.parse(
          savedConstructor
        ) as { bun: ConstructorIngredient | null; ingredients: ConstructorIngredient[] };

        const hasNoIngredients = !bun && ingredients.length === 0;

        if (hasNoIngredients && savedBun) {
          void dispatch(clearConstructor());

          if (savedBun) {
            void dispatch(addIngredient({ ...savedBun, constructorId: uuidv4() }));
          }

          if (savedIngredients && savedIngredients.length > 0) {
            savedIngredients.forEach((ingredient: ConstructorIngredient) => {
              void dispatch(addIngredient({ ...ingredient, constructorId: uuidv4() }));
            });
          }

          setIsRestored(true);
          sessionStorage.removeItem('restoringOrder');
        }
      } catch (_err) {
        console.error('Error restoring constructor:', _err);
      }
    }
  }, [location.pathname, dispatch, isRestored, bun, ingredients]);

  // Очищаем флаг восстановления при изменении конструктора
  useEffect(() => {
    if ((bun || ingredients.length > 0) && isRestored) {
      setIsRestored(false);
    }
  }, [bun, ingredients, isRestored]);

  // Настройка drop-зоны для перетаскивания
  const [{ isHover }, drop] = useDrop({
    accept: 'ingredient',
    drop: (item: TIngredient) => {
      const ingredientWithId: ConstructorIngredient = {
        ...item,
        constructorId: uuidv4(),
      };
      dispatch(addIngredient(ingredientWithId));
    },
    collect: (monitor) => ({
      isHover: monitor.isOver(),
    }),
  });

  drop(dropRef);

  // Формируем массив для отображения
  const allIngredientsForDisplay: ConstructorIngredient[] = [];

  if (bun) {
    allIngredientsForDisplay.push(bun);
  }
  allIngredientsForDisplay.push(...ingredients);
  if (bun) {
    allIngredientsForDisplay.push(bun);
  }

  // ✅ Функция для валидации формы
  const validateOrder = (): { isValid: boolean; errorMessage?: string } => {
    if (!bun) {
      return { isValid: false, errorMessage: 'Добавьте булку' };
    }

    if (ingredients.length === 0) {
      return { isValid: false, errorMessage: 'Добавьте хотя бы один ингредиент' };
    }

    return { isValid: true };
  };

  // Основная функция отправки заказа
  const handleSubmitOrder = async (): Promise<void> => {
    const validation = validateOrder();
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    if (!isAuthenticated()) {
      saveConstructorToLocalStorage();
      localStorage.setItem('returnTo', location.pathname);
      void navigate('/login');
      return;
    }

    const ingredientsIds = [bun!._id, ...ingredients.map((item) => item._id), bun!._id];

    try {
      const resultAction = await dispatch(submitOrder(ingredientsIds));

      if (submitOrder.fulfilled.match(resultAction)) {
        void dispatch(clearConstructor());
        localStorage.removeItem('savedConstructor');
        localStorage.removeItem('returnTo');
        setIsRestored(false);
        setIsModalOpen(true);
      } else if (submitOrder.rejected.match(resultAction)) {
        if (
          resultAction.error.message?.includes('401') ||
          resultAction.error.message?.includes('unauthorized')
        ) {
          saveConstructorToLocalStorage();
          localStorage.setItem('returnTo', location.pathname);
          void navigate('/login');
        } else {
          alert(`Ошибка: ${resultAction.error.message ?? 'Не удалось оформить заказ'}`);
        }
      }
    } catch (_err) {
      alert('Произошла ошибка при оформлении заказа');
    }
  };
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    void dispatch(clearOrder());
  };

  return (
    <section
      ref={dropRef}
      data-testid="constructor-dropzone"
      className={`${styles.burger_constructor} ${isHover ? styles.hover : ''}`}
    >
      <MyComponentUI
        ingredients={allIngredientsForDisplay}
        onOrderClick={() => {
          void handleSubmitOrder();
        }}
        isLoading={loading}
      />

      <OtherDetails
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderNumber={orderNumber}
        error={error}
      />
    </section>
  );
};
