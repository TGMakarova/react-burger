import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { selectIngredientsWithCounts } from '@/services/slices/burgerConstructorSlice';
import { setSelectedIngredient } from '@/services/slices/selectedIngredientSlice';

import type { AppDispatch, RootState } from '@/services/store';
import type { TIngredient } from '@utils/types';

import styles from './ingredients-details-ui.module.css';

type IngredientsDetailsUIProps = {
  setCategoryRef: (
    type: 'bun' | 'sauce' | 'main',
    element: HTMLDivElement | null
  ) => void;
};

export const IngredientsDetailsUI = ({
  setCategoryRef,
}: IngredientsDetailsUIProps): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const ingredients = useSelector((state: RootState) => state.ingredients.items);
  const ingredientsWithCounts = useSelector(selectIngredientsWithCounts);

  const bunTitleRef = useRef<HTMLDivElement>(null);
  const sauceTitleRef = useRef<HTMLDivElement>(null);
  const mainTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategoryRef('bun', bunTitleRef.current);
    setCategoryRef('sauce', sauceTitleRef.current);
    setCategoryRef('main', mainTitleRef.current);

    return () => {
      setCategoryRef('bun', null);
      setCategoryRef('sauce', null);
      setCategoryRef('main', null);
    };
  }, [setCategoryRef]);

  const handleIngredientClick = (ingredient: TIngredient): void => {
    localStorage.setItem('popupIngredientId', ingredient._id);
    localStorage.setItem('popupBackgroundPath', location.pathname);
    localStorage.removeItem('popupRestored');

    void dispatch(setSelectedIngredient(ingredient));

    void navigate(`/ingredients/${ingredient._id}`, {
      state: { background: location, from: location.pathname },
    });
  };

  // Компонент для отдельного ингредиента с drag-and-drop и счётчиком
  const IngredientCard = ({
    ingredient,
  }: {
    ingredient: TIngredient;
  }): React.JSX.Element => {
    const elementRef = useRef<HTMLDivElement>(null);

    const ingredientWithCount = ingredientsWithCounts.find(
      (item: TIngredient & { count?: number }) => item._id === ingredient._id
    );
    const count = ingredientWithCount?.count ?? 0;

    const [{ isDragging }, drag] = useDrag({
      type: 'ingredient',
      item: (): TIngredient => ({ ...ingredient }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    useEffect(() => {
      if (elementRef.current) {
        drag(elementRef.current);
      }
    }, [drag]);

    return (
      <div
        ref={elementRef}
        className={`${styles.ingredients_element} ${isDragging ? styles.ingredients_element_dragging : ''}`}
        onClick={() => handleIngredientClick(ingredient)}
      >
        <img
          className={styles.ingredients_picture}
          src={ingredient.image_large}
          alt={ingredient.name}
        />
        <div className={`${styles.ingredients_price} text text_type_digits-default`}>
          <span>{ingredient.price}</span>
          <CurrencyIcon type="primary" />
        </div>
        <div className={`${styles.ingredients_name} text text_type_main-default`}>
          {ingredient.name}
        </div>

        {count > 0 && <div className={styles.counter}>{count}</div>}
      </div>
    );
  };

  const groupedIngredients = ingredients.reduce<Record<string, TIngredient[]>>(
    (acc, item) => {
      const key = item.type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const sortedTypes = ['bun', 'sauce', 'main'];

  return (
    <div className={styles.ingredients_container}>
      {sortedTypes.map((type) => {
        const ingredientsOfType = groupedIngredients[type];
        if (ingredientsOfType && ingredientsOfType.length > 0) {
          const titleRef =
            type === 'bun'
              ? bunTitleRef
              : type === 'sauce'
                ? sauceTitleRef
                : mainTitleRef;

          return (
            <div key={type}>
              <div
                ref={titleRef}
                className={`${styles.ingredients_name_container} text text_type_main-medium`}
              >
                {type === 'bun' ? 'Булки' : type === 'sauce' ? 'Соусы' : 'Начинки'}
              </div>
              <div className={styles.ingredients_grid}>
                {ingredientsOfType.map((ingredient) => (
                  <IngredientCard key={ingredient._id} ingredient={ingredient} />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
