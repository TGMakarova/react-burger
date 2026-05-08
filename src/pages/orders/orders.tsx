import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { OrderCard } from '@/components/order-card/order-card';
import {
  selectProfileFeed,
  selectProfileFeedLoading,
  selectProfileWsConnected,
} from '@/services/slices/profileFeedSlice';

import {
  selectIngredients,
  selectIngredientsLoading,
} from '../../services/slices/ingredientsSlice';

import type { TOrder } from '../../utils/types';

import styles from './orders.module.css';

// Удаляем неиспользуемый тип IngredientWithCount

export const ProfileOrderPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectProfileFeed);
  const loading = useSelector(selectProfileFeedLoading);
  const wsConnected = useSelector(selectProfileWsConnected);

  const handleCardClick = (order: TOrder, e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    void navigate(`/profile/orders/${order.number}`, {
      state: { background: location },
    });
  };

  if (ingredientsLoading || (loading && orders.length === 0)) {
    return <div className={styles.loading}>Загрузка заказов...</div>;
  }

  return (
    <div className={styles.profile_orders_page}>
      <div className={styles.wsStatus}>
        {wsConnected ? (
          <span className={styles.wsConnected}>🟢 Личные заказы: подключены</span>
        ) : (
          <span className={styles.wsDisconnected}>🔴 Личные заказы: отключены</span>
        )}
      </div>

      <h1 className="text text_type_main-large mb-6">Мои заказы</h1>

      <div className={styles.orders_column}>
        <div className={styles.orders_list}>
          {orders.length === 0 ? (
            <p className="text text_type_main-medium text_color_inactive">
              У вас пока нет заказов
            </p>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                ingredients={ingredients}
                onClick={handleCardClick}
                showStatus={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
