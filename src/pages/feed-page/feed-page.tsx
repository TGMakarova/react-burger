import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { formatDate } from '@/utils/formatDate';

import {
  fetchFeed,
  selectFeed,
  selectFeedLoading,
} from '../../services/slices/feedSlice';
import {
  selectIngredients,
  selectIngredientsLoading,
} from '../../services/slices/ingredientsSlice';

import type { AppDispatch } from '../../services/store';
import type { TIngredient, TOrder } from '../../utils/types';

import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const ingredients = useSelector(selectIngredients);

  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectFeed);
  const completedOrders = orders.filter((order) => order.status === 'done');
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const feedLoading = useSelector(selectFeedLoading);

  // Загружаем заказы при монтировании
  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);

  // Открываем модальное окно при клике на карточку
  const handleCardClick = (order: TOrder, e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    void navigate(`/feed/${order._id}`, { state: { background: location } });
  };

  // Функция для получения полных данных с подсчетом количества
  const getOrderIngredientsWithCount = (
    orderIngredientIds: string[]
  ): Map<string, TIngredient & { count: number }> => {
    if (!ingredients.length) return new Map();

    const ingredientsMap = new Map<string, TIngredient & { count: number }>();

    orderIngredientIds.forEach((ingredientId) => {
      const ingredient = ingredients.find((ing) => ing._id === ingredientId);
      if (ingredient) {
        if (ingredient.type === 'bun') {
          if (!ingredientsMap.has(ingredientId)) {
            ingredientsMap.set(ingredientId, { ...ingredient, count: 1 });
          }
        } else {
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

  const getOrdersByColumns = (): {
    col1_completed: number[];
    col2_completed: number[];
    col3_pending: number[];
    col4_pending: number[];
  } => {
    const completedNumbers = completedOrders.map((order) => order.number);
    const pendingNumbers = pendingOrders.map((order) => order.number);
    const limitedCompleted = completedNumbers.slice(0, 20);
    const limitedPending = pendingNumbers.slice(0, 20);
    const col1_completed = limitedCompleted.slice(0, 10);
    const col2_completed = limitedCompleted.slice(10, 20);
    const col3_pending = limitedPending.slice(0, 10);
    const col4_pending = limitedPending.slice(10, 20);
    return { col1_completed, col2_completed, col3_pending, col4_pending };
  };

  const getTodayOrders = (allOrders: typeof orders): TOrder[] => {
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
                  onClick={(e) => handleCardClick(order, e)}
                  style={{
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
                        <div key={ingredient._id} className={styles.circle_block}>
                          <img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className={styles.ingredient_image}
                          />
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

          <p className={`text text_type_main-medium mt-2 mb-1 ${styles.deviation}`}>
            Выполнено за все время:
          </p>
          <span className={`text text_type_digits-large ${styles.no_margin}`}>
            {totalCompletedCount}
          </span>
          <div className={styles.interval}></div>
          <p className={`text text_type_main-medium mt-2 mb-1 ${styles.deviation}`}>
            Выполнено за сегодня:
          </p>
          <span className={`text text_type_digits-large ${styles.no_margin}`}>
            {todayCompletedCount}
          </span>
        </div>
      </div>
    </div>
  );
};
