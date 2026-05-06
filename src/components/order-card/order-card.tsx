import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { formatDate } from '@/utils/formatDate';
import type { TOrder, TIngredient } from '../../utils/types';
import styles from './order-card.module.css';

const MAX_VISIBLE_INGREDIENTS = 6;

type OrderCardProps = {
  order: TOrder;
  ingredients: TIngredient[];
  onClick: (order: TOrder, e: React.MouseEvent<HTMLDivElement>) => void;
  showStatus?: boolean; // 👈 Добавляем опцию для показа статуса
};

// Функции для работы с ингредиентами (как в FeedPage)
const getOrderIngredientsWithCount = (
  orderIngredientIds: string[],
  ingredients: TIngredient[]
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

const getUniqueIngredientsForDisplay = (
  ingredientsMap: Map<string, TIngredient & { count: number }>
): (TIngredient & { count: number })[] => {
  const ingredientsList = Array.from(ingredientsMap.values());
  const bun = ingredientsList.find((ing) => ing.type === 'bun');
  const others = ingredientsList.filter((ing) => ing.type !== 'bun');
  return bun ? [bun, ...others] : others;
};

const calculateTotalPrice = (
  ingredientsMap: Map<string, TIngredient & { count: number }>
): number => {
  let total = 0;
  ingredientsMap.forEach((ing) => {
    total += ing.price * ing.count;
  });
  return total;
};

// Функция для получения текста статуса
const getStatusText = (status: string): string => {
  switch (status) {
    case 'done': return 'Выполнен';
    case 'pending': return 'Готовится';
    case 'created': return 'Создан';
    default: return status;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'done': return styles.status_done;
    case 'pending': return styles.status_pending;
    case 'created': return styles.status_created;
    default: return '';
  }
};

export const OrderCard = ({ order, ingredients, onClick, showStatus = true }: OrderCardProps): React.JSX.Element => {
  const ingredientsMap = getOrderIngredientsWithCount(order.ingredients, ingredients);
  const uniqueIngredients = getUniqueIngredientsForDisplay(ingredientsMap);
  const totalPrice = calculateTotalPrice(ingredientsMap);
  const visibleIngredients = uniqueIngredients.slice(0, MAX_VISIBLE_INGREDIENTS);
  const remainingCount = uniqueIngredients.length - MAX_VISIBLE_INGREDIENTS;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick(order, e);
  };

  return (
    <div className={styles.order_card} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.order_header}>
        <p className="text text_type_digits-default">
          #{String(order.number).padStart(6, '0')}
        </p>
        <p className="text text_type_main-default text_color_inactive">
          {formatDate(order.createdAt)}
        </p>
      </div>

      <p className="text text_type_main-medium mt-2 mb-2">{order.name}</p>

      {/* 👇 Отображение статуса (опционально) */}
      {showStatus && (
        <p className={`text text_type_main-default mb-4 ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </p>
      )}

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
              {index === MAX_VISIBLE_INGREDIENTS - 1 && remainingCount > 0 && (
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
};