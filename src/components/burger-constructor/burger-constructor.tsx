import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import { OtherDetails } from '../other-details/other-details';
import { submitOrder, clearOrder } from '../../services/slices/orderSlice'; // Импортируем экшены
import type { TIngredient } from '@utils/types';
import type { AppDispatch, RootState } from '../../services/store'; // Импортируем типы
import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
};

export const BurgerConstructor = ({
  ingredients,
}: TBurgerConstructorProps): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>(); // Используем типизированный dispatch
  
  // Получаем данные из Redux store
  const { orderNumber, loading, error } = useSelector(
    (state: RootState) => state.order
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функция для отправки заказа
  const handleOrder = async () => {
    // Разделяем булки и остальные ингредиенты
    const bun = ingredients.find(item => item.type === 'bun');
    const otherIngredients = ingredients.filter(item => item.type !== 'bun');

    if (!bun) {
      // Показываем ошибку через модальное окно (без Redux)
      setIsModalOpen(true);
      return;
    }

    if (otherIngredients.length === 0) {
      setIsModalOpen(true);
      return;
    }

    try {
      // Формируем массив ID (булка дважды)
      const ingredientsIds = [
        bun._id,
        ...otherIngredients.map(item => item._id),
        bun._id
      ];

      console.log('Отправляем заказ с ID:', ingredientsIds);
      
      // Отправляем thunk через dispatch
      const resultAction = await dispatch(submitOrder(ingredientsIds));
      
      // Проверяем, успешно ли выполнен запрос
      if (submitOrder.fulfilled.match(resultAction)) {
        setIsModalOpen(true); // Открываем модальное окно при успехе
      }
    } catch (err) {
      console.error('Ошибка:', err);
      setIsModalOpen(true); // Открываем модальное окно при ошибке
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearOrder()); // Очищаем данные заказа в Redux
  };

  return (
    <section className={styles.burger_constructor}>
      <MyComponentUI 
        ingredients={ingredients}
        onOrderClick={handleOrder}
        isLoading={loading} // Используем loading из Redux
      />

      {/* Модальное окно с номером заказа или ошибкой */}
      <OtherDetails 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        orderNumber={orderNumber} // Используем из Redux
        error={error} // Используем из Redux
      />
    </section>
  );
};
