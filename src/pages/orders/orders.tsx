import styles from './orders.module.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Order = {
  id: number;
  date: string;
  status: string;
  total: number;
};

export default function ProfileOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: позже замените на реальный API
    // Пока используем мок-данные
    const mockOrders = [
      { id: 1, date: '2025-04-10', status: 'Доставлен', total: 4500 },
      { id: 2, date: '2025-04-05', status: 'В пути', total: 1200 },
      { id: 3, date: '2025-03-28', status: 'Оформлен', total: 8900 },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="loading">Загрузка заказов...</div>;
  }

  return (
    <div className="profile-orders-page">
      <h1>Мои заказы</h1>
      
      {orders.length === 0 ? (
        <p>У вас пока нет заказов</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link 
              to={`/profile/orders/${order.id}`}
              key={order.id}
              className="order-card"
            >
              <div className="order-header">
                <span className="order-number">Заказ №{order.id}</span>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-date">
                📅 {order.date}
              </div>
              
              <div className="order-total">
                💰 {order.total} ₽
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
