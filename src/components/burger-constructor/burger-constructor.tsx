import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop } from 'react-dnd';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import { OtherDetails } from '../other-details/other-details';
import { submitOrder, clearOrder } from '../../services/slices/orderSlice';
import { addIngredient, clearConstructor } from '../../services/slices/burgerConstructorSlice';
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

  // Восстанавливаем конструктор после авторизации
  useEffect(() => {
    const savedConstructor = localStorage.getItem('savedConstructor');
    const returnTo = localStorage.getItem('returnTo');
    
    console.log('🔍 Restoration check:', {
      savedConstructor: !!savedConstructor,
      returnTo,
      currentPath: location.pathname,
      isAuthenticated: isAuthenticated(),
      isRestored
    });
    
    // Если есть сохраненный конструктор и мы на странице, куда должны вернуться
    if (savedConstructor && returnTo === location.pathname && !isRestored) {
      try {
        const { bun: savedBun, ingredients: savedIngredients } = JSON.parse(savedConstructor);
        
        console.log('🔄 Restoring constructor:', { savedBun, savedIngredients });
        
        // Очищаем текущий конструктор
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
        console.log('✅ Constructor restored successfully');
      } catch (err) {
        console.error('Error restoring constructor:', err);
      }
    }
  }, [location.pathname, dispatch, isRestored]);

  // Очищаем флаг восстановления при изменении конструктора
  useEffect(() => {
    if (bun || ingredients.length > 0) {
      setIsRestored(false);
    }
  }, [bun, ingredients]);

  // Настройка drop-зоны для перетаскивания
  const [{ isHover }, drop] = useDrop({
    accept: 'ingredient',
    drop: (item: TIngredient) => {
      console.log('🎯 ITEM DROPPED:', item);

      const ingredientWithId: ConstructorIngredient = {
        ...item,
        constructorId: uuidv4(),
      };

      console.log('➕ Adding ingredient:', ingredientWithId);
      dispatch(addIngredient(ingredientWithId));
    },
    collect: (monitor) => ({
      isHover: monitor.isOver(),
    }),
  });

  drop(dropRef);

  // Формируем массив для отображения (пропсы для MyComponentUI)
  const allIngredientsForDisplay = [];

  if (bun) {
    allIngredientsForDisplay.push(bun);
  }
  allIngredientsForDisplay.push(...ingredients);
  if (bun) {
    allIngredientsForDisplay.push(bun);
  }

  // Сохраняем конструктор в localStorage
  const saveConstructorToLocalStorage = () => {
    if (bun || ingredients.length > 0) {
      const constructorData = {
        bun: bun,
        ingredients: ingredients
      };
      localStorage.setItem('savedConstructor', JSON.stringify(constructorData));
      console.log('💾 Constructor saved to localStorage:', constructorData);
    }
  };

  // Функция для отправки заказа
  const handleOrder = async () => {
    console.log('📞 handleOrder called');
    console.log('Current bun:', bun);
    console.log('Current ingredients:', ingredients);

    if (!bun) {
      console.log('❌ No bun selected');
      alert('Добавьте булку');
      return;
    }

    if (ingredients.length === 0) {
      console.log('❌ No ingredients selected');
      alert('Добавьте хотя бы один ингредиент');
      return;
    }

    // Проверяем авторизацию перед отправкой заказа
    if (!isAuthenticated()) {
      console.log('🔒 User not authenticated, saving constructor and redirecting to login');
      
      // Сохраняем конструктор перед редиректом
      saveConstructorToLocalStorage();
      
      // Сохраняем текущий путь для возврата
      localStorage.setItem('returnTo', location.pathname);
      
      // Перенаправляем на логин
      navigate('/login');
      return;
    }

    // Если авторизован, отправляем заказ
    const ingredientsIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];

    try {
      console.log('🚀 Sending order with IDs:', ingredientsIds);

      const resultAction = await dispatch(submitOrder(ingredientsIds));

      if (submitOrder.fulfilled.match(resultAction)) {
        console.log('✅ Order successful!');
        
        // Очищаем конструктор после успешного заказа
        dispatch(clearConstructor());
        
        // Очищаем сохраненные данные
        localStorage.removeItem('savedConstructor');
        localStorage.removeItem('returnTo');
        
        // Открываем модальное окно с номером заказа
        setIsModalOpen(true);
      } else if (submitOrder.rejected.match(resultAction)) {
        console.error('❌ Order failed:', resultAction.error);
        
        // Проверяем, может быть ошибка из-за отсутствия авторизации
        if (resultAction.error.message?.includes('401') || 
            resultAction.error.message?.includes('unauthorized')) {
          console.log('🔒 Unauthorized, saving constructor and redirecting to login');
          saveConstructorToLocalStorage();
          localStorage.setItem('returnTo', location.pathname);
          navigate('/login');
        } else {
          alert(`Ошибка: ${resultAction.error.message || 'Не удалось оформить заказ'}`);
        }
      }
    } catch (err) {
      console.error('❌ Order error:', err);
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
        onOrderClick={handleOrder}
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