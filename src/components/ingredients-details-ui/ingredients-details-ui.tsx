import styles from './ingredients-details-ui.module.css';
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';

import type { TIngredient } from '@utils/types.ts';
import { useState } from 'react';
import { IngredientDetails } from '../ingredient-details/ingredient-details';

interface IngredientsDetailsUIProps {
  ingredients: TIngredient[];
}

export const IngredientsDetailsUI = ({ ingredients }: IngredientsDetailsUIProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
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

  const groupedIngredients = ingredients.reduce<{ [key: string]: TIngredient[] }>(
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
    <>
      <div className={styles.ingredients_element}>
        {sortedTypes.map((type) => {
          const ingredientsOfType = groupedIngredients[type];
          if (ingredientsOfType) {
            return (
              <div key={type}>
                <h3>
                  {type === 'bun'
                    ? 'БУЛКИ'
                    : type === 'main'
                      ? 'ОСНОВНЫЕ'
                      : type === 'sauce'
                        ? 'СОУСЫ'
                        : type}
                </h3>
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
                      <div className={styles.ingredients_price}>
                        <span>{ingredient.price}</span>
                        <CurrencyIcon type="primary" />
                      </div>
                      <div className={styles.ingredients_name}>{ingredient.name}</div>
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
