import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop } from 'react-dnd';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import { OtherDetails } from '../other-details/other-details';
import { submitOrder, clearOrder } from '../../services/slices/orderSlice';
import {
  addIngredient,
  clearConstructor,
} from '../../services/slices/burgerConstructorSlice';
import type { TIngredient } from '@utils/types';
import type { ConstructorIngredient } from '../../services/slices/burgerConstructorSlice';
import type { AppDispatch, RootState } from '../../services/store';
import styles from './burger-constructor.module.css';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef<HTMLElement>(null);

  // Получаем данные из Redux store
  const { bun, ingredients } = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  const { orderNumber, loading, error } = useSelector((state: RootState) => state.order);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Проверка авторизации
  const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  };

  // Сохраняем конструктор в localStorage
  const saveConstructorToLocalStorage = () => {
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

    // Если есть сохраненный конструктор и мы на странице, куда должны вернуться
    if (
      savedConstructor &&
      !isRestored &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      // Если returnTo указан, проверяем соответствие
      if (returnTo && returnTo !== location.pathname) {
        return;
      }

      try {
        const { bun: savedBun, ingredients: savedIngredients } =
          JSON.parse(savedConstructor);

        // Проверяем, нужно ли восстанавливать (если конструктор пустой)
        const hasNoIngredients = !bun && ingredients.length === 0;

        if (hasNoIngredients && savedBun) {
          // Очищаем текущий конструктор (на всякий случай)
          dispatch(clearConstructor());

          // Восстанавливаем булку
          if (savedBun) {
            dispatch(addIngredient({ ...savedBun, constructorId: uuidv4() }));
          }

          // Восстанавливаем все ингредиенты
          if (savedIngredients && savedIngredients.length > 0) {
            savedIngredients.forEach((ingredient: ConstructorIngredient) => {
              dispatch(addIngredient({ ...ingredient, constructorId: uuidv4() }));
            });
          }

          setIsRestored(true);
          sessionStorage.removeItem('restoringOrder');
        }
      } catch (err) {
        console.error('Error restoring constructor:', err);
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
  const allIngredientsForDisplay = [];

  if (bun) {
    allIngredientsForDisplay.push(bun);
  }
  allIngredientsForDisplay.push(...ingredients);
  if (bun) {
    allIngredientsForDisplay.push(bun);
  }

  // Функция для валидации формы
  const validateOrder = () => {
    if (!bun) {
      alert('Добавьте булку');
      return false;
    }

    if (ingredients.length === 0) {
      alert('Добавьте хотя бы один ингредиент');
      return false;
    }

    return true;
  };

  // Основная функция отправки заказа
  const handleSubmitOrder = async () => {
    console.log('1. Начало handleSubmitOrder');
    console.log('2. bun:', bun);
    console.log('3. ingredients:', ingredients);
    console.log('4. Токен:', localStorage.getItem('accessToken'));
    console.log('5. isAuthenticated:', isAuthenticated());

    if (!bun) {
      alert('Добавьте булку');
      return;
    }

    if (ingredients.length === 0) {
      alert('Добавьте хотя бы один ингредиент');
      return;
    }

    if (!isAuthenticated()) {
      console.log('6. Не авторизован, сохраняем и редирект');
      saveConstructorToLocalStorage();
      localStorage.setItem('returnTo', location.pathname);
      navigate('/login');
      return;
    }

    console.log('7. Авторизован, отправляем заказ');

    // Если авторизован, отправляем заказ
    // Добавляем проверку, что bun не null (хотя validateOrder уже проверяет)
    if (!bun) {
      alert('Добавьте булку');
      return;
    }

    const ingredientsIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];

    try {
      const resultAction = await dispatch(submitOrder(ingredientsIds));

      if (submitOrder.fulfilled.match(resultAction)) {
        // Очищаем конструктор после успешного заказа
        dispatch(clearConstructor());

        // Очищаем сохраненные данные
        localStorage.removeItem('savedConstructor');
        localStorage.removeItem('returnTo');

        // Сбрасываем флаг восстановления
        setIsRestored(false);

        // Открываем модальное окно с номером заказа
        setIsModalOpen(true);
      } else if (submitOrder.rejected.match(resultAction)) {
        // Проверяем, может быть ошибка из-за отсутствия авторизации
        if (
          resultAction.error.message?.includes('401') ||
          resultAction.error.message?.includes('unauthorized')
        ) {
          saveConstructorToLocalStorage();
          localStorage.setItem('returnTo', location.pathname);
          navigate('/login');
        } else {
          alert(`Ошибка: ${resultAction.error.message || 'Не удалось оформить заказ'}`);
        }
      }
    } catch (err) {
      alert('Произошла ошибка при оформлении заказа');
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearOrder());
  };

  return (
    <section
      ref={dropRef}
      className={`${styles.burger_constructor} ${isHover ? styles.hover : ''}`}
    >
      <MyComponentUI
        ingredients={allIngredientsForDisplay}
        onOrderClick={handleSubmitOrder}
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
