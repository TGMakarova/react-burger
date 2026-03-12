import { Modal } from '../modal/modal';

import type { TIngredient } from '@utils/types.ts';

import styles from './ingredient-details.module.css';

type IngredientDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: string | null;
  ingredientId: string;
  ingredients: TIngredient[];
};

export const IngredientDetails = ({
  children,
  ingredientId,
  ingredients,
  ...modalProps
}: IngredientDetailsProps): React.JSX.Element => {
  const ingredient = ingredients.find((item) => item._id === ingredientId);

  if (!ingredient) {
    return <></>;
  }
  return (
    <Modal {...modalProps}>
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
          <p>Калории,ккал</p>
          <p>Белки, г</p>
          <p>Жиры, г</p>
          <p>Углеводы, г</p>
          <p className={`${styles.ingredient_container} text text_type_digits-default `}>
            {ingredient.calories}
          </p>
          <p className={`${styles.ingredient_container} text text_type_digits-default `}>
            {ingredient.proteins}
          </p>
          <p className={`${styles.ingredient_container} text text_type_digits-default `}>
            {ingredient.fat}
          </p>
          <p className={`${styles.ingredient_container} text text_type_digits-default `}>
            {ingredient.carbohydrates}
          </p>
        </div>
      </div>
    </Modal>
  );
};
