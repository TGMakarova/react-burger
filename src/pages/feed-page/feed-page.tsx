import { useEffect } from 'react';
import { useState } from 'react';
import { Modal } from '../../components/modal/modal'
import { OrderDetailPage } from '@/pages/order-detail-page/order-detail-page'; 
import { useDispatch, useSelector } from 'react-redux';
import styles from './feed-page.module.css';
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import {
  fetchFeed,
  selectFeed,
  selectFeedLoading,
} from '../../services/slices/feedSlice';
import {
  selectIngredients,
  selectIngredientsLoading,
} from '../../services/slices/ingredientsSlice';
import type { TIngredient } from '../../utils/types';
import type { AppDispatch } from '../../services/store';
import { formatDate } from '@/utils/formatDate';
import type { TOrder } from '@/utils/types';


export const FeedPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const ingredients = useSelector(selectIngredients);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null); // Храним весь объект заказа
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Закрываем модальное окно
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Открываем модальное окно при клике на изображение
  const handleImageClick = (order: TOrder, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation(); // Останавливаем всплытие события
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectFeed);
  const completedOrders = orders.filter((order) => order.status === 'done');
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const feedLoading = useSelector(selectFeedLoading);

  const formatOrderNumber = (number: number, digits: number = 6): string => {
    return `#${number.toString().padStart(digits, '0')}`;
  };

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  // Функция для получения полных данных с подсчетом количества
  const getOrderIngredientsWithCount = (
    orderIngredientIds: string[]
  ): Map<string, TIngredient & { count: number }> => {
    if (!ingredients.length) return new Map();

    const ingredientsMap = new Map<string, TIngredient & { count: number }>();

    orderIngredientIds.forEach((ingredientId) => {
      const ingredient = ingredients.find((ing) => ing._id === ingredientId);
      if (ingredient) {
        // Для булки не считаем количество, всегда 1
        if (ingredient.type === 'bun') {
          if (!ingredientsMap.has(ingredientId)) {
            ingredientsMap.set(ingredientId, { ...ingredient, count: 1 });
          }
        } else {
          // Для остальных ингредиентов считаем нормально
          if (ingredientsMap.has(ingredientId)) {
            const existing = ingredientsMap.get(ingredientId)!;
            existing.count += 1;
          } else {
            ingredientsMap.set(ingredientId, { ...ingredient, count: 1 });
          }
        }
      }
    });

    return ingredientsMap;
  };

  // Убираем дубликаты для отображения, но сохраняем count
  const getUniqueIngredientsForDisplay = (
    ingredientsMap: Map<string, TIngredient & { count: number }>
  ): (TIngredient & { count: number })[] => {
    const ingredientsList = Array.from(ingredientsMap.values());

    // Булку ставим первой, остальные как есть
    const bun = ingredientsList.find((ing) => ing.type === 'bun');
    const others = ingredientsList.filter((ing) => ing.type !== 'bun');

    return bun ? [bun, ...others] : others;
  };

  // Расчет общей стоимости
  const calculateTotalPrice = (
    ingredientsMap: Map<string, TIngredient & { count: number }>
  ): number => {
    let total = 0;
    ingredientsMap.forEach((ing) => {
      total += ing.price * ing.count;
    });
    return total;
  };

  if (ingredientsLoading || feedLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const maxVisible = 6;
  const getOrdersByColumns = () => {
    // Берем только номера заказов
    const completedNumbers = completedOrders.map((order) => order.number);
    const pendingNumbers = pendingOrders.map((order) => order.number);

    // Обрезаем до 20 (если больше 20 - "отсекаем")
    const limitedCompleted = completedNumbers.slice(0, 20);
    const limitedPending = pendingNumbers.slice(0, 20);

    // Выполненные: первая колонка (первые 10), вторая колонка (следующие 10)
    const col1_completed = limitedCompleted.slice(0, 10);
    const col2_completed = limitedCompleted.slice(10, 20);

    // Невыполненные: третья колонка (первые 10), четвертая колонка (следующие 10)
    const col3_pending = limitedPending.slice(0, 10);
    const col4_pending = limitedPending.slice(10, 20);

    return { col1_completed, col2_completed, col3_pending, col4_pending };
  };
  
  const getTodayOrders = (allOrders: typeof orders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  const totalCompletedCount = completedOrders.length;
  const todayCompletedCount = getTodayOrders(completedOrders).length;

  return (
    <div className={styles.container}>
      <p className="text text_type_main-large mt-4 mb-2">Лента заказов</p>

      <div className={styles.two_columns}>
        {/* Левая колонка - список заказов */}
        <div className={styles.orders_column}>
          <div className={styles.orders_list}>
            {orders.map((order) => {
              const ingredientsMap = getOrderIngredientsWithCount(order.ingredients);
              const uniqueIngredients = getUniqueIngredientsForDisplay(ingredientsMap);
              const totalPrice = calculateTotalPrice(ingredientsMap);
              const visibleIngredients = uniqueIngredients.slice(0, maxVisible);
              const remainingCount = uniqueIngredients.length - maxVisible;

              return (
                <div
                  key={order._id}
                  className={styles.order_card}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <div className={styles.order_header}>
                    <p className="text text_type_digits-default">
                      #{String(order.number).padStart(6, '0')}
                    </p>
                    <p className="text text_type_main-default text_color_inactive">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <p className="text text_type_main-medium mt-2 mb-4">{order.name}</p>

                  <div className={styles.order_footer}>
                    <div className={styles.circles_block}>
                      {visibleIngredients.map((ingredient, index) => (
                        <div 
                          key={ingredient._id} 
                          className={styles.circle_block}
                          onClick={(e) => handleImageClick(order, e)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className={styles.ingredient_image}
                          />
                          {/* Показываем счетчик только НЕ для булки и если count > 1 */}
                          {ingredient.type !== 'bun' && ingredient.count > 1 && (
                            <div className={styles.count_overlay}>
                              +{ingredient.count}
                            </div>
                          )}
                          {index === maxVisible - 1 && remainingCount > 0 && (
                            <div className={styles.remaining_overlay}>
                              +{remainingCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className={styles.price_display}>
                      <span className="text text_type_digits-medium">{totalPrice}</span>
                      <CurrencyIcon type="primary" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая колонка - статистика */}
        <div className={styles.right_column}>
          <div className={styles.two_columns_right}>
            <p className="text text_type_main-medium mt-2 mb-4">Готовы:</p>
            <p className="text text_type_main-medium mt-2 mb-4">В работе:</p>
          </div>

          <div className={styles.four_columns_right}>
            {/* Колонка 1 - выполненные (первые 10) */}
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

            {/* Колонка 2 - выполненные (следующие 10, если больше 10) */}
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

            {/* Колонка 3 - в работе (первые 10) */}
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

            {/* Колонка 4 - в работе (следующие 10, если больше 10) */}
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
          <p className={`text text_type_main-medium mt-2 mb-1" ${styles.deviation}`}>
            Выполнено за все время:
          </p>
          <span className={`text text_type_digits-large ${styles.no_margin}`}>
            {totalCompletedCount}
          </span>
          <div className={styles.interval}></div>
          <p className={`text text_type_main-medium mt-2 mb-1" ${styles.deviation}`}>
            Выполнено за сегодня:
          </p>
          <span className={`text text_type_digits-large ${styles.no_margin}`}>
            {todayCompletedCount}
          </span>
        </div>
      </div>

      {/* Модальное окно с деталями заказа */}
      {isModalOpen && selectedOrder && (
  <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
    <OrderDetailPage orderId={selectedOrder._id} />
  </Modal>
)}
    </div>
  );
};
