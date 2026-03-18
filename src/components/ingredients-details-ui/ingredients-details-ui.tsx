import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useState, useRef, useEffect } from 'react';

import { IngredientDetails } from '../ingredient-details/ingredient-details';

import type { TIngredient } from '@utils/types.ts';

import styles from './ingredients-details-ui.module.css';

type IngredientsDetailsUIProps = {
  ingredients: TIngredient[];
  setCategoryRef: (type: 'bun' | 'sauce' | 'main', element: HTMLDivElement | null) => void;
};

export const IngredientsDetailsUI = ({ ingredients, setCategoryRef }: IngredientsDetailsUIProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

//Создаем локальные рефы

  const bunTitleRef = useRef<HTMLDivElement>(null);
  const sauceTitleRef = useRef<HTMLDivElement>(null);
  const mainTitleRef = useRef<HTMLDivElement>(null);

  //Передаем рефы в родительский компонент

  useEffect(() => {
    setCategoryRef('bun', bunTitleRef.current);
    setCategoryRef('sauce', sauceTitleRef.current);
    setCategoryRef('main', mainTitleRef.current);

    //  Очистка при размонтировании
    return () => {
      setCategoryRef('bun', null);
      setCategoryRef('sauce', null);
      setCategoryRef('main', null);
    }

  }, [setCategoryRef]
  )

  // Обработчик клика по ингредиенту

  const handleIngredientClick = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId);
    setIsModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIngredientId(null);
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

  const sortedTypes = ['bun',  'main', 'sauce'];

  return (
    <>
      <div  className={styles.ingredients_container}>
        {sortedTypes.map((type) => {
          const ingredientsOfType = groupedIngredients[type];
          if (ingredientsOfType) {
            //Выбираем нужный реф в зависимости от типа
    
            const titleRef =
              type === 'bun' ? bunTitleRef :
                type === 'main' ? mainTitleRef :
                  sauceTitleRef;
            
            return (
              <div key={type}>
                <div ref = {titleRef}
                
                  className={`${styles.ingredients_name_container} text text_type_main-medium `}
                >
                  {type === 'bun'
                    ? 'Булки'
                    : type === 'main'
                      ? 'Начинки'
                      : type === 'sauce'
                        ? 'Соусы'
                        : type}
                </div>
                <div className={styles.ingredients_grid}>
                  {ingredientsOfType.map((ingredient) => (
                    <div
                      key={ingredient._id}
                      className={styles.ingredients_element}
                      onClick={() => handleIngredientClick(ingredient._id)}
                    >
                      <img
                        className={styles.ingredients_picture}
                        src={ingredient.image_large}
                        alt="Пример изображения"
                      />
                      <div
                        className={`${styles.ingredients_price} text text_type_digits-default`}
                      >
                        <span>{ingredient.price}</span>
                        <CurrencyIcon type="primary" />
                      </div>
                      <div
                        className={`${styles.ingredients_name} text text_type_main-default `}
                      >
                        {ingredient.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      {selectedIngredientId && (
        <IngredientDetails
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          ingredientId={selectedIngredientId}
          ingredients={ingredients}
          header="Детали ингредиента"
        >
          <p>Содержимое модального окна</p>
        </IngredientDetails>
      )}
    </>
  );
};
