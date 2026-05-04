import { useEffect } from 'react';
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

export const FeedPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();

  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const orders = useSelector(selectFeed);
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
                <div key={order._id} className={styles.order_card}>
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

        {/* Правая колонка - пустая для других целей */}
        <div className={styles.right_column}>
          <div className={styles.two_columns_right}>
          <p className="text text_type_main-medium mt-2 mb-4"> Готовы: </p>
            <p className="text text_type_main-medium mt-2 mb-4">В работе:</p>
            </div>
        </div>
      </div>
    </div>
  );
};
