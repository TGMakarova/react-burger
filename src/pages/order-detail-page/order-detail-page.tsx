import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './order-detail-page.module.css';
import { useEffect } from 'react';
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import type { RootState } from '@/services/store';
import { formatDate } from '@/utils/formatDate';
import type { TOrder } from '@/utils/types';

type OrderDetailPageProps = {
  orderId?: string | number;
};

export const OrderDetailPage = ({ orderId }: OrderDetailPageProps) => {
  // Получаем все заказы из feed - проверьте правильное имя поля в store
  const orders = useSelector((state: RootState) => {
    console.log('Все состояние store:', state);
    console.log('Данные feed:', state.feed);
    return state.feed.orders;
  });
  
  const ingredients = useSelector((state: RootState) => {
    console.log('Ингредиенты:', state.ingredients.items);
    return state.ingredients.items;
  });
  
  console.log('Полученный orderId:', orderId);
  console.log('Все заказы:', orders);
  
  // Находим нужный заказ по ID
  const order = orders?.find((order: TOrder) => {
    console.log('Сравниваем:', order._id, 'с', orderId);
    return order._id === orderId;
  });
  
  console.log('Найденный заказ:', order);

  // Функция для получения ингредиентов с подсчетом количества
  const getOrderIngredientsWithCount = (orderIngredientIds: string[]) => {
    if (!ingredients?.length) return [];
    
    const ingredientsMap = new Map();
    
    orderIngredientIds.forEach((ingredientId) => {
      const ingredient = ingredients.find((ing) => ing._id === ingredientId);
      if (ingredient) {
        if (ingredientsMap.has(ingredientId)) {
          const existing = ingredientsMap.get(ingredientId);
          existing.count += 1;
        } else {
          ingredientsMap.set(ingredientId, { ...ingredient, count: 1 });
        }
      }
    });
    
    return Array.from(ingredientsMap.values());
  };

  // Расчет общей стоимости
  const calculateTotalPrice = (ingredientsList: any[]) => {
    return ingredientsList.reduce((total, ing) => total + ing.price * ing.count, 0);
  };

  // Если заказ не найден
  if (!order) {
    return (
      <div className={styles.error}>
        <p>Заказ не найден</p>
        <p>Order ID: {orderId}</p>
        <p>Всего заказов: {orders?.length || 0}</p>
      </div>
    );
  }

  const orderIngredients = getOrderIngredientsWithCount(order.ingredients);
  const totalPrice = calculateTotalPrice(orderIngredients);

  // Функция для отображения статуса на русском
  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return 'Выполнен';
      case 'pending': return 'Готовится';
      case 'created': return 'Создан';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      <p className={`text text_type_digits-default ${styles.order_number}`}>
        #{String(order.number).padStart(6, '0')}
      </p>
      
      <h2 className="text text_type_main-medium mt-3 mb-2">{order.name}</h2>
      
      <p className={`text text_type_main-default ${styles.status} ${
        order.status === 'done' ? styles.status_done : 
        order.status === 'pending' ? styles.status_pending : styles.status_created
      }`}>
        {getStatusText(order.status)}
      </p>

      <p className="text text_type_main-medium mt-5 mb-3">Состав:</p>
      
      <div className={styles.ingredients_list}>
        {orderIngredients.map((ingredient) => (
          <div key={ingredient._id} className={styles.ingredient_item}>
            <div className={styles.ingredient_info}>
              <div className={styles.ingredient_image}>
                <img src={ingredient.image} alt={ingredient.name} />
              </div>
              <span className="text text_type_main-default">{ingredient.name}</span>
            </div>
            <div className={styles.ingredient_price}>
              <span className="text text_type_digits-default">
                {ingredient.count} x {ingredient.price}
              </span>
              <CurrencyIcon type="primary" />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className="text text_type_main-default text_color_inactive">
          {formatDate(order.createdAt)}
        </p>
        <div className={styles.price}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </div>
  );
};