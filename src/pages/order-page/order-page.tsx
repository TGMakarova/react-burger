import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchFeed } from '../../services/slices/feedSlice';
import { selectIngredientsLoading } from '../../services/slices/ingredientsSlice';
import { OrderDetailPage } from '../order-detail-page/order-detail-page';

import type { RootState, AppDispatch } from '../../services/store';

import styles from './order-page.module.css';

export const OrderPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector((state: RootState) => state.feed.orders);
  const ingredientsLoading = useSelector(selectIngredientsLoading);

  useEffect(() => {
    if (!orders || orders.length === 0) {
      void dispatch(fetchFeed());
    }
  }, [dispatch, orders]);

  const order = orders?.find((o) => o._id === id || String(o.number) === id);

  if (ingredientsLoading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  if (!order) {
    return <div className={styles.container}>Заказ не найден</div>;
  }

  return (
    <div className={styles.container}>
      <OrderDetailPage order={order} />
    </div>
  );
};
