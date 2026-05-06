import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { OrderCard } from '@/components/order-card/order-card';
import {
  selectProfileFeed,
  selectProfileFeedLoading,
  selectProfileWsConnected,
  wsConnectProfile,
  wsDisconnectProfile,
} from '@/services/slices/profileFeedSlice';
import {
  selectIngredients,
  selectIngredientsLoading,
} from '../../services/slices/ingredientsSlice';

import type { AppDispatch } from '../../services/store';
import type { TOrder } from '../../utils/types';

import styles from './orders.module.css';

// Функция для получения чистого токена (без Bearer)
const getCleanToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  let cleanToken = token;
  if (token.startsWith('Bearer ')) {
    cleanToken = token.slice(7);
  }
  cleanToken = cleanToken.trim().replace(/^"|"$/g, '');
  return cleanToken || null;
};

export const ProfileOrderPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isConnectedRef = useRef(false);

  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectProfileFeed);
  const feedLoading = useSelector(selectProfileFeedLoading);
  const wsConnected = useSelector(selectProfileWsConnected);

  // ЕДИНСТВЕННЫЙ useEffect для подключения к WebSocket
  useEffect(() => {
    // Подключаемся только если ещё не подключены
    if (!isConnectedRef.current) {
      const token = getCleanToken();
      
      if (token && token.length > 0) {
        const wsUrl = `wss://new-stellarburgers.education-services.ru/orders?token=${token}`;
        console.log('🟢 Connecting to profile WebSocket');
        dispatch(wsConnectProfile(wsUrl));
        isConnectedRef.current = true;
      } else {
        console.error('🔴 No valid token found for WebSocket connection');
      }
    }

    return () => {
      console.log('🔴 Disconnecting profile WebSocket');
      dispatch(wsDisconnectProfile());
      isConnectedRef.current = false;
    };
  }, [dispatch]);

  const handleCardClick = (order: TOrder, e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/orders/${order._id}`);
  };

  if (ingredientsLoading || (feedLoading && orders.length === 0)) {
    return <div className={styles.loading}>Загрузка заказов...</div>;
  }

  return (
    <div className={styles.profile_orders_page}>
      {/* Индикатор WebSocket */}
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