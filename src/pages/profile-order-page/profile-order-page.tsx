import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { formatDate } from '@/utils/formatDate';

import { useSelector } from '../../hooks/customHooks';
import { selectIngredients } from '../../services/slices/ingredientsSlice';

import type { TOrder, TIngredient } from '../../utils/types';

import styles from './profile-order-page.module.css';

type IngredientWithCount = TIngredient & { count: number };

export const ProfileOrderPageID = (): React.JSX.Element => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const wsOrders = useSelector((state) => state.profileFeed.orders);
  const wsConnected = useSelector((state) => state.profileFeed.wsConnected);
  const ingredients = useSelector(selectIngredients);

  const [order, setOrder] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanId = id?.replace(/^0+/, '') ?? ''; // Используем ?? вместо ||
  const orderNumber = Number(cleanId);

  useEffect(() => {
    if (wsOrders && wsOrders.length > 0) {
      const found = wsOrders.find((o) => o.number === orderNumber);
      if (found) {
        setOrder(found);
        setLoading(false);
      }
    } else if (wsConnected && wsOrders.length === 0) {
      const interval = setInterval(() => {
        if (wsOrders.length > 0) {
          const found = wsOrders.find((o) => o.number === orderNumber);
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
      <div className={styles.pageContainer}>
        <div className={styles.spinner} />
        <div>Загрузка заказа...</div>
      </div>
    );
  }

  if (!order) {
    const handleNavigate = (): void => {
      void navigate('/profile/orders'); // Добавляем void для игнорирования Promise
    };

    return (
      <div className={styles.pageContainer}>
        <h1 className="text text_type_main-large mb-6">Заказ не найден</h1>
        <p className="mb-6">Номер заказа: {orderNumber}</p>
        <button
          onClick={handleNavigate} // Используем функцию с правильным типом
          className="text text_type_main-default"
          style={{ color: '#4C4CFF', cursor: 'pointer' }}
        >
          ← Вернуться к списку заказов
        </button>
      </div>
    );
  }

  const getOrderIngredients = (): IngredientWithCount[] => {
    if (!ingredients.length) return [];
    const map = new Map<string, IngredientWithCount>();

    order.ingredients.forEach((ingredientId: string) => {
      const ingredient = ingredients.find(
        (ing: TIngredient) => ing._id === ingredientId
      );
      if (ingredient) {
        if (map.has(ingredientId)) {
          const existing = map.get(ingredientId);
          if (existing) {
            existing.count++;
          }
        } else {
          map.set(ingredientId, { ...ingredient, count: 1 });
        }
      }
    });
    return Array.from(map.values());
  };

  const orderIngredients: IngredientWithCount[] = getOrderIngredients();
  const totalPrice = orderIngredients.reduce(
    (sum: number, ing: IngredientWithCount): number => sum + ing.price * ing.count,
    0
  );

  const statusText: string =
    {
      done: 'Выполнен',
      pending: 'Готовится',
      created: 'Создан',
    }[order.status] ?? order.status;

  const statusColor: string =
    order.status === 'done' ? styles.statusDone : styles.statusPending;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <p className="text text_type_digits-default mb-6">
          #{String(order.number).padStart(6, '0')}
        </p>

        <h2 className="text text_type_main-medium mb-2">{order.name}</h2>

        <p className={`text text_type_main-default mb-6 ${statusColor}`}>{statusText}</p>

        <p className="text text_type_main-medium mb-4">Состав:</p>

        <div className={styles.ingredientsList}>
          {orderIngredients.map((ing: IngredientWithCount) => (
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
