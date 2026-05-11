import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks/customHooks';
import { fetchFeed } from '../../services/slices/feedSlice';
import { selectIngredientsLoading } from '../../services/slices/ingredientsSlice';
import { OrderDetailPage } from '../order-detail-page/order-detail-page';

import styles from './order-page.module.css';

export const OrderPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const orders = useSelector((state) => state.feed.orders);
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
