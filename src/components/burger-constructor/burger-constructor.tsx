import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import { OtherDetails } from '../other-details/other-details';
import { submitOrder, clearOrder } from '../../services/slices/orderSlice';
import { addIngredient } from '../../services/slices/burgerConstructorSlice';
import type { TIngredient } from '@utils/types';
import type { ConstructorIngredient } from '../../services/slices/burgerConstructorSlice';
import type { AppDispatch, RootState } from '../../services/store';
import styles from './burger-constructor.module.css';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const dropRef = useRef<HTMLElement>(null);

  // Получаем данные из Redux store
  const { bun, ingredients } = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  const { orderNumber, loading, error } = useSelector((state: RootState) => state.order);

  const [isModalOpen, setIsModalOpen] = useState(false);

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

    try {
      const ingredientsIds = [bun._id, ...ingredients.map((item) => item._id), bun._id];

      console.log('🚀 Sending order with IDs:', ingredientsIds);

      const resultAction = await dispatch(submitOrder(ingredientsIds));

      if (submitOrder.fulfilled.match(resultAction)) {
        console.log('✅ Order successful!');
        setIsModalOpen(true);
      } else if (submitOrder.rejected.match(resultAction)) {
        console.error('❌ Order failed:', resultAction.error);
        alert(`Ошибка: ${resultAction.error.message || 'Не удалось оформить заказ'}`);
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
