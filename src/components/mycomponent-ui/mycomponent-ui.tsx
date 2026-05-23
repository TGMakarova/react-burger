import {
  Button,
  ConstructorElement,
  DragIcon,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { useDispatch, useSelector } from '../../hooks/customHooks';
import {
  removeIngredient,
  moveIngredient,
} from '../../services/slices/burgerConstructorSlice';

import type { ConstructorIngredient } from '../../services/slices/burgerConstructorSlice';
import type { TIngredient } from '@utils/types.ts';

import styles from './mycomponent-ui.module.css';

type MyComponentUIProps = {
  ingredients: TIngredient[];
  onOrderClick: () => void;
  isLoading: boolean;
};

export const MyComponentUI = ({
  onOrderClick,
  isLoading,
}: MyComponentUIProps): React.JSX.Element => {
  const dispatch = useDispatch();

  // Пустая функция-заглушка для ConstructorElement
  const noop = (): void => {
    // заглушка для обязательного пропса handleClose
  };

  const { bun, ingredients: storeIngredients } = useSelector(
    (state) => state.burgerConstructor
  );

  const displayBun = bun;
  const displayIngredients = storeIngredients;

  const totalPrice =
    (displayBun?.price ?? 0) * 2 +
    displayIngredients.reduce((sum, item) => sum + item.price, 0);

  const handleRemove = (constructorId: string): void => {
    dispatch(removeIngredient(constructorId));
  };

  const handleMove = (dragIndex: number, hoverIndex: number): void => {
    dispatch(moveIngredient({ dragIndex, hoverIndex }));
  };

  return (
    <div className={styles.burger_constructor}>
      {/* Верхняя булка - заглушка или реальная булка */}
      {!displayBun ? (
        <div className={`${styles.empty_bun} ${styles.empty_bun_top}`}>
          <p className="text text_type_main-default text_color_inactive">
            Перетащите булку сюда (верх)
          </p>
        </div>
      ) : (
        <div className={styles.bun_top}>
          <div data-testid="ingredient-bun">
            <ConstructorElement
              handleClose={noop}
              isLocked={true}
              price={displayBun.price}
              text={`${displayBun.name} (верх)`}
              thumbnail={displayBun.image}
              type="top"
            />
          </div>
        </div>
      )}

      {/* Контейнер для ингредиентов */}
      <div className={styles.ingredients_container}>
        {displayIngredients.length === 0 ? (
          <div className={styles.empty_ingredients}>
            <p className="text text_type_main-default text_color_inactive">
              Перетащите начинку сюда
            </p>
          </div>
        ) : (
          displayIngredients.map((ingredient, index) => (
            <DraggableIngredient
              key={ingredient.constructorId}
              ingredient={ingredient}
              constructorId={ingredient.constructorId}
              index={index}
              onRemove={handleRemove}
              onMove={handleMove}
            />
          ))
        )}
      </div>

      {/* Нижняя булка */}
      {!displayBun ? (
        <div className={`${styles.empty_bun} ${styles.empty_bun_bottom}`}>
          <p className="text text_type_main-default text_color_inactive">
            Перетащите булку сюда (низ)
          </p>
        </div>
      ) : (
        <div className={styles.bun_bottom}>
          <div data-testid="ingredient-bun">
            <ConstructorElement
              handleClose={noop}
              isLocked={true}
              price={displayBun.price}
              text={`${displayBun.name} (низ)`}
              thumbnail={displayBun.image}
              type="bottom"
            />
          </div>
        </div>
      )}

      {/* Блок с ценой и кнопкой */}
      <div className={styles.order_section}>
        <div className={styles.price_container}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>

        <Button
          data-testid="order-button"
          htmlType="button"
          type="primary"
          size="large"
          onClick={onOrderClick}
          disabled={isLoading || !displayBun || displayIngredients.length === 0}
        >
          {isLoading ? 'Оформляем...' : 'Оформить заказ'}
        </Button>
      </div>
    </div>
  );
};

// Компонент перетаскиваемого ингредиента
const DraggableIngredient = ({
  ingredient,
  constructorId,
  index,
  onRemove,
  onMove,
}: {
  ingredient: ConstructorIngredient;
  constructorId: string;
  index: number;
  onRemove: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'constructor-ingredient',
    item: (): { index: number; type: string } => ({
      index,
      type: 'constructor-ingredient',
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'constructor-ingredient',
    hover: (item: { index: number }, monitor): void => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleRemoveClick = (): void => {
    onRemove(constructorId);
  };

  return (
    <div
      ref={ref}
      data-testid="ingredient-item"
      className={`${styles.ingredient_item} ${isDragging ? styles.ingredient_item_dragging : ''}`}
    >
      <DragIcon type="secondary" />
      <ConstructorElement
        handleClose={handleRemoveClick}
        isLocked={false}
        price={ingredient.price}
        text={ingredient.name}
        thumbnail={ingredient.image}
      />
    </div>
  );
};
