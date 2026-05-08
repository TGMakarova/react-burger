
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Modal } from '../modal/modal';
import { OrderDetailPage } from '@/pages/order-detail-page/order-detail-page';
import { getOrderByNumber } from '@/utils/burger-api';
import type { RootState } from '@/services/store';
import type { TOrder } from '@/utils/types';

interface ProfileOrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileOrderDetail = ({ isOpen, onClose }: ProfileOrderDetailProps): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  
  const wsOrders = useSelector((state: RootState) => state.profileFeed.orders);
  const [order, setOrder] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  const orderNumber = Number(id?.replace(/^0+/, ''));
  
  useEffect(() => {
    // Сначала ищем в WebSocket
    const wsOrder = wsOrders?.find(o => o.number === orderNumber);
    if (wsOrder) {
      setOrder(wsOrder);
      setLoading(false);
      return;
    }
    
    // Если нет, грузим через API
    const loadOrder = async () => {
      try {
        const response = await getOrderByNumber(orderNumber);
        // ✅ Правильная проверка для типа { order: TOrder }
        if (response.order) {
          setOrder(response.order);
        }
      } catch (error) {
        console.error('Ошибка загрузки заказа:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [orderNumber, wsOrders]);
  
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>
      </Modal>
    );
  }
  
  if (!order) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Заказ не найден</div>
      </Modal>
    );
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <OrderDetailPage order={order} />
    </Modal>
  );
};