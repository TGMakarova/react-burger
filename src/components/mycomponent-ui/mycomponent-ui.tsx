import {
  Button,
  ConstructorElement,
  DragIcon,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';

import {
  removeIngredient,
  moveIngredient,
} from '../../services/slices/burgerConstructorSlice';

import type { ConstructorIngredient } from '../../services/slices/burgerConstructorSlice';
import type { AppDispatch, RootState } from '../../services/store';
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
  const dispatch = useDispatch<AppDispatch>();

  // Получаем данные напрямую из Redux store
  const { bun, ingredients: storeIngredients } = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  // Для отображения используем данные из Redux
  const displayBun = bun;
  const displayIngredients = storeIngredients;

  // Подсчет общей стоимости
  const totalPrice =
    (displayBun?.price || 0) * 2 +
    displayIngredients.reduce((sum, item) => sum + item.price, 0);

  const handleRemove = (constructorId: string) => {
    dispatch(removeIngredient(constructorId));
  };

  const handleMove = (dragIndex: number, hoverIndex: number) => {
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
          <ConstructorElement
            handleClose={() => {}}
            isLocked={true}
            price={displayBun.price}
            text={`${displayBun.name} (верх)`}
            thumbnail={displayBun.image}
            type="top"
          />
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
          <ConstructorElement
            handleClose={() => {}}
            isLocked={true}
            price={displayBun.price}
            text={`${displayBun.name} (низ)`}
            thumbnail={displayBun.image}
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
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'constructor-ingredient',
    item: { index, type: 'constructor-ingredient' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'constructor-ingredient',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y || 0) - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleRemoveClick = () => {
    onRemove(constructorId);
  };

  return (
    <div
      ref={ref}
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
