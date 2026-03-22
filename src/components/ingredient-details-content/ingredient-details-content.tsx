import type { TIngredient } from '@utils/types.ts';

import styles from '../ingredient-details-content/ingredient-details-content.module.css'


export const IngredientDetailsContent = ({ ingredient }: { ingredient: TIngredient }) => {
  return (
   <div className={styles.ingredient_element}>
        <img
          className={styles.ingredient_picture}
          src={ingredient.image_large}
          alt="Пример изображения"
        />

        <h3 className={`${styles.ingredient_name} text text_type_main-medium `}>
          {ingredient.name}
        </h3>
        <div
          className={`${styles.ingredient_container} text text_type_main-default text_color_inactive`}
        >
          <p
            className={`${styles.ingredient_item} text text_type_main-default text_color_inactive `}
          >
            Калории,ккал
          </p>
          <p
            className={`${styles.ingredient_item} text text_type_main-default text_color_inactive `}
          >
            Белки, г
          </p>
          <p
            className={`${styles.ingredient_item} text text_type_main-default text_color_inactive `}
          >
            Жиры, г
          </p>
          <p
            className={`${styles.ingredient_item} text text_type_main-default text_color_inactive `}
          >
            Углеводы, г
          </p>
          <p className={`${styles.ingredient_item} text text_type_digits-default `}>
            {ingredient.calories}
          </p>
          <p className={`${styles.ingredient_item} text text_type_digits-default `}>
            {ingredient.proteins}
          </p>
          <p className={`${styles.ingredient_item} text text_type_digits-default `}>
            {ingredient.fat}
          </p>
          <p className={`${styles.ingredient_item} text text_type_digits-default `}>
            {ingredient.carbohydrates}
          </p>
        </div>
        
      </div>
  );
};
