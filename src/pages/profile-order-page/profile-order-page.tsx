import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import type { RootState } from '../../services/store';
import type { TOrder } from '../../utils/types';
import { formatDate } from '@/utils/formatDate';
import { selectIngredients } from '../../services/slices/ingredientsSlice';

import styles from './profile-order-page.module.css';

export const ProfileOrderPageID = (): React.JSX.Element => {
  const location = useLocation();
  console.log('🔥 ProfileOrderPageID - СТРАНИЦА');
  
  const { id } = useParams<{ id: string }>();
  
  const wsOrders = useSelector((state: RootState) => state.profileFeed.orders);
  const wsConnected = useSelector((state: RootState) => state.profileFeed.wsConnected);
  const ingredients = useSelector(selectIngredients);
  
  const [order, setOrder] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  const cleanId = id?.replace(/^0+/, '') || '';
  const orderNumber = Number(cleanId);
  
  useEffect(() => {
    if (wsOrders && wsOrders.length > 0) {
      const found = wsOrders.find(o => o.number === orderNumber);
      if (found) {
        setOrder(found);
        setLoading(false);
      }
    } else if (wsConnected && wsOrders.length === 0) {
      const interval = setInterval(() => {
        if (wsOrders.length > 0) {
          const found = wsOrders.find(o => o.number === orderNumber);
          if (found) {
            setOrder(found);
            setLoading(false);
            clearInterval(interval);
          }
        }
      }, 500);
      
      setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
      }, 5000);
      
      return () => clearInterval(interval);
    } else if (!wsConnected) {
      setLoading(false);
    }
  }, [orderNumber, wsOrders, wsConnected]);
  
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.spinner} />
        <div>Загрузка заказа...</div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className={styles.pageWrapper}>
        <h1 className="text text_type_main-large mb-6">Заказ не найден</h1>
        <p>Номер заказа: {orderNumber}</p>
        <button onClick={() => window.location.reload()}>Обновить</button>
      </div>
    );
  }
  
  const getOrderIngredients = () => {
    if (!ingredients.length) return [];
    const map = new Map();
    order.ingredients.forEach(ingredientId => {
      const ingredient = ingredients.find(ing => ing._id === ingredientId);
      if (ingredient) {
        if (map.has(ingredientId)) {
          map.get(ingredientId).count++;
        } else {
          map.set(ingredientId, { ...ingredient, count: 1 });
        }
      }
    });
    return Array.from(map.values());
  };
  
  const orderIngredients = getOrderIngredients();
  const totalPrice = orderIngredients.reduce((sum, ing) => sum + ing.price * ing.count, 0);
  
  const statusText = {
    done: 'Выполнен',
    pending: 'Готовится',
    created: 'Создан',
  }[order.status] || order.status;
  
  // ✅ Рендерим как обычную страницу - без затемнения
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageContent}>
        <p className="text text_type_digits-default mb-6">
          #{String(order.number).padStart(6, '0')}
        </p>
        
        <h2 className="text text_type_main-medium mb-2">{order.name}</h2>
        
        <p className={`text text_type_main-default mb-6 ${styles.status}`}>
          {statusText}
        </p>
        
        <p className="text text_type_main-medium mb-4">Состав:</p>
        
        <div className={styles.ingredientsList}>
          {orderIngredients.map(ing => (
            <div key={ing._id} className={styles.ingredientItem}>
              <img src={ing.image} alt={ing.name} className={styles.image} />
              <span className={styles.name}>{ing.name}</span>
              <span className={styles.price}>
                {ing.count} x {ing.price} <CurrencyIcon type="primary" />
              </span>
            </div>
          ))}
        </div>
        
        <div className={styles.footer}>
          <span className="text text_type_main-default text_color_inactive">
            {formatDate(order.createdAt)}
          </span>
          <span className="text text_type_digits-default">
            {totalPrice} <CurrencyIcon type="primary" />
          </span>
        </div>
      </div>
    </div>
  );
};
