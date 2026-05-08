import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { OrderCard } from '@/components/order-card/order-card';

import {
  selectFeed,
  selectFeedLoading,
  selectFeedTotal,
  selectFeedTotalToday,
  wsConnect,
  wsDisconnect,
  selectWsConnected,
} from '../../services/slices/feedSlice';
import {
  selectIngredients,
  selectIngredientsLoading,
} from '../../services/slices/ingredientsSlice';

import type { AppDispatch } from '../../services/store';
import type { TOrder } from '../../utils/types';

import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectFeed);
  const feedLoading = useSelector(selectFeedLoading);
  const total = useSelector(selectFeedTotal);
  const totalToday = useSelector(selectFeedTotalToday);
  const wsConnected = useSelector(selectWsConnected);

  const completedOrders = orders.filter((order) => order.status === 'done');
  const pendingOrders = orders.filter((order) => order.status === 'pending');

  // Подключаемся к WebSocket при монтировании
  useEffect(() => {
    const wsUrl = 'wss://new-stellarburgers.education-services.ru/orders/all';
    void dispatch(wsConnect(wsUrl));

    return () => {
      void dispatch(wsDisconnect());
    };
  }, [dispatch]);

  const handleCardClick = (order: TOrder, e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    void navigate(`/feed/${order._id}`, { state: { background: location } });
  };

  if (ingredientsLoading || (feedLoading && orders.length === 0)) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const getOrdersByColumns = (): {
    col1_completed: number[];
    col2_completed: number[];
    col3_pending: number[];
    col4_pending: number[];
  } => {
    // Показываем только первые 20 выполненных и 20 в работе
    const completedNumbers = completedOrders.map((order) => order.number);
    const pendingNumbers = pendingOrders.map((order) => order.number);
    const limitedCompleted = completedNumbers.slice(0, 20);
    const limitedPending = pendingNumbers.slice(0, 20);
    return {
      col1_completed: limitedCompleted.slice(0, 10),
      col2_completed: limitedCompleted.slice(10, 20),
      col3_pending: limitedPending.slice(0, 10),
      col4_pending: limitedPending.slice(10, 20),
    };
  };

  return (
    <div className={styles.container}>
      {/* Индикатор WebSocket */}
      <div className={styles.wsStatus}>
        {wsConnected ? (
          <span className={styles.wsConnected}>🟢 WebSocket подключен</span>
        ) : (
          <span className={styles.wsDisconnected}>🔴 WebSocket отключен</span>
        )}
      </div>

      <p className="text text_type_main-large mt-4 mb-2">Лента заказов</p>

      <div className={styles.two_columns}>
        {/* Левая колонка - список заказов */}
        <div className={styles.orders_column}>
          <div className={styles.orders_list}>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                ingredients={ingredients}
                onClick={handleCardClick}
                showStatus={false}
              />
            ))}
          </div>
        </div>

        {/* Правая колонка - статистика */}
        <div className={styles.right_column}>
          <div className={styles.two_columns_right}>
            <p className="text text_type_main-medium mt-2 mb-4">Готовы:</p>
            <p className="text text_type_main-medium mt-2 mb-4">В работе:</p>
          </div>

          <div className={styles.four_columns_right}>
            <div className={styles.order_column}>
              {getOrdersByColumns().col1_completed.map((number) => (
                <p
                  key={number}
                  className={`text text_type_digits-default ${styles.order_number}`}
                >
                  {String(number).padStart(6, '0')}
                </p>
              ))}
            </div>

            <div className={styles.order_column}>
              {getOrdersByColumns().col2_completed.map((number) => (
                <p
                  key={number}
                  className={`text text_type_digits-default ${styles.order_number}`}
                >
                  {String(number).padStart(6, '0')}
                </p>
              ))}
            </div>

            <div className={styles.order_column}>
              {getOrdersByColumns().col3_pending.map((number) => (
                <p
                  key={number}
                  className={`text text_type_digits-default ${styles.order_number_pending}`}
                >
                  {String(number).padStart(6, '0')}
                </p>
              ))}
            </div>

            <div className={styles.order_column}>
              {getOrdersByColumns().col4_pending.map((number) => (
                <p
                  key={number}
                  className={`text text_type_digits-default ${styles.order_number_pending}`}
                >
                  {String(number).padStart(6, '0')}
                </p>
              ))}
            </div>
          </div>

          <p className="text text_type_main-medium mt-2 mb-1">Выполнено за все время:</p>
          <span className="text text_type_digits-large">{total}</span>

          <div className={styles.interval}></div>

          <p className="text text_type_main-medium mt-2 mb-1">Выполнено за сегодня:</p>
          <span className="text text_type_digits-large">{totalToday}</span>
        </div>
      </div>
    </div>
  );
};
