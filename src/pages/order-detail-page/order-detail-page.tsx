import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useSelector } from 'react-redux';

import { formatDate } from '@/utils/formatDate';

import { Modal } from '../../components/modal/modal';

import type { RootState } from '@/services/store';
import type { TOrder, TIngredient } from '@/utils/types';

import styles from './order-detail-page.module.css';

type OrderDetailPageProps = {
  order?: TOrder;
  orderId?: string | number;
  isOpen?: boolean;
  onClose?: () => void;
};

type IngredientWithCount = TIngredient & { count: number };

export const OrderDetailPage = ({
  order: propOrder,
  orderId,
  isOpen,
  onClose,
}: OrderDetailPageProps): React.JSX.Element | null => {
  const orders = useSelector((state: RootState) => state.feed.orders);
  const ingredients = useSelector((state: RootState) => state.ingredients.items);
  const ingredientsLoading = useSelector(
    (state: RootState) => state.ingredients.loading
  );
  const feedLoading = useSelector((state: RootState) => state.feed.loading);

  // Поиск заказа
  let order = propOrder;

  if (orderId) {
    order ??= orders.find((o) => o._id === orderId);
    order ??= orders.find((o) => String(o._id) === String(orderId));
    order ??= orders.find((o) => o.number === Number(orderId));
  }

  const content = ((): React.JSX.Element => {
    if (feedLoading || ingredientsLoading) {
      return (
        <div className={styles.loading}>
          <p className="text text_type_main-medium">Загрузка данных...</p>
        </div>
      );
    }

    if (!order) {
      return (
        <div className={styles.error}>
          <p className="text text_type_main-medium">Заказ не найден</p>
          <p className="text text_type_main-default mt-2">ID: {orderId}</p>
        </div>
      );
    }

    // Функция для получения ингредиентов с подсчетом
    const getOrderIngredientsWithCount = (
      orderIngredientIds: string[]
    ): IngredientWithCount[] => {
      if (!ingredients?.length) return [];

      const ingredientsMap = new Map<string, IngredientWithCount>();

      orderIngredientIds.forEach((ingredientId) => {
        const ingredient = ingredients.find((ing) => ing._id === ingredientId);
        if (ingredient) {
          if (ingredientsMap.has(ingredientId)) {
            const existing = ingredientsMap.get(ingredientId)!;
            existing.count += 1;
          } else {
            ingredientsMap.set(ingredientId, { ...ingredient, count: 1 });
          }
        }
      });

      return Array.from(ingredientsMap.values());
    };

    const calculateTotalPrice = (ingredientsList: IngredientWithCount[]): number => {
      return ingredientsList.reduce((total, ing) => total + ing.price * ing.count, 0);
    };

    const orderIngredients = getOrderIngredientsWithCount(order.ingredients);
    const totalPrice = calculateTotalPrice(orderIngredients);

    const getStatusText = (status: string): string => {
      switch (status) {
        case 'done':
          return 'Выполнен';
        case 'pending':
          return 'Готовится';
        case 'created':
          return 'Создан';
        default:
          return status;
      }
    };

    const getStatusClass = (status: string): string => {
      switch (status) {
        case 'done':
          return styles.status_done;
        case 'pending':
          return styles.status_pending;
        case 'created':
          return styles.status_created;
        default:
          return '';
      }
    };

    return (
      <div className={styles.container}>
        <p className={`text text_type_digits-default ${styles.order_number}`}>
          #{String(order.number).padStart(6, '0')}
        </p>

        <h2 className="text text_type_main-medium mt-3 mb-2">{order.name}</h2>

        <p
          className={`text text_type_main-default ${styles.status} ${getStatusClass(order.status)}`}
        >
          {getStatusText(order.status)}
        </p>

        <p className="text text_type_main-medium mt-5 mb-3">Состав:</p>

        <div className={styles.ingredients_list}>
          {orderIngredients.map((ingredient) => (
            <div key={ingredient._id} className={styles.ingredient_item}>
              <div className={styles.ingredient_info}>
                <div className={styles.ingredient_image}>
                  <img src={ingredient.image} alt={ingredient.name} />
                </div>
                <span className="text text_type_main-default">{ingredient.name}</span>
              </div>
              <div className={styles.ingredient_price}>
                <span className="text text_type_digits-default">
                  {ingredient.count} x {ingredient.price}
                </span>
                <CurrencyIcon type="primary" />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p className="text text_type_main-default text_color_inactive">
            {formatDate(order.createdAt)}
          </p>
          <div className={styles.price}>
            <span className="text text_type_digits-medium">{totalPrice}</span>
            <CurrencyIcon type="primary" />
          </div>
        </div>
      </div>
    );
  })();

  if (isOpen && onClose) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        {content}
      </Modal>
    );
  }

  return content;
};
