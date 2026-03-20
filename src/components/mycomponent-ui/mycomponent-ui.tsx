import {
  Button,
  ConstructorElement,
  DragIcon,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';

import styles from './mycomponent-ui.module.css';
import type { TIngredient } from '@utils/types.ts';

type MyComponentUIProps = {
  ingredients: TIngredient[];
  onOrderClick: () => void;
  isLoading: boolean;
};

export const MyComponentUI = ({
  ingredients,
  onOrderClick,
  isLoading,
}: MyComponentUIProps): React.JSX.Element => {
  // Разделяем булки и остальные ингредиенты
  const bun = ingredients.find(item => item.type === 'bun');
  const otherIngredients = ingredients.filter(item => item.type !== 'bun');

  // Подсчет общей стоимости
  const totalPrice = (bun?.price || 0) * 2 + 
    otherIngredients.reduce((sum, item) => sum + item.price, 0);

  // Проверка на наличие ингредиентов
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className={styles.empty_state}>
        <p className="text text_type_main-default text_color_inactive">
          Добавьте ингредиенты в конструктор
        </p>
      </div>
    );
  }

  return (
    <div className={styles.burger_constructor}>
      {/* Верхняя булка */}
      {bun && (
        <div className={styles.bun_top}>
          <ConstructorElement
            handleClose={() => {}}
            isLocked={true}
            price={bun.price}
            text={`${bun.name} (верх)`}
            thumbnail={bun.image}
            type="top"
          />
        </div>
      )}

      {/* Контейнер для ингредиентов */}
      {otherIngredients.length > 0 && (
        <div className={styles.ingredients_container}>
          {otherIngredients.map((ingredient, index) => (
            <div key={`${ingredient._id}-${index}`} className={styles.ingredient_item}>
              <DragIcon type="secondary" />
              <ConstructorElement
                handleClose={() => {}}
                isLocked={false}
                price={ingredient.price}
                text={ingredient.name}
                thumbnail={ingredient.image}
              />
            </div>
          ))}
        </div>
      )}

      {/* Нижняя булка */}
      {bun && (
        <div className={styles.bun_bottom}>
          <ConstructorElement
            handleClose={() => {}}
            isLocked={true}
            price={bun.price}
            text={`${bun.name} (низ)`}
            thumbnail={bun.image}
            type="bottom"
          />
        </div>
      )}

      {/* Блок с ценой и кнопкой */}
      <div className={styles.order_section}>
        <div className={styles.price_container}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        
        <Button
          htmlType="button"
          type="primary"
          size="large"
          onClick={onOrderClick}
          disabled={isLoading || !bun || otherIngredients.length === 0}
        >
          {isLoading ? 'Оформляем...' : 'Оформить заказ'}
        </Button>
      </div>
    </div>
  );
};
