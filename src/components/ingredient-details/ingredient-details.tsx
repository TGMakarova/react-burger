import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from 'src/store';
import { clearSelectedIngredient } from '@/store/slices/selectedIngredientSlice';
import { Modal } from '../modal/modal';

import type { TIngredient } from '@utils/types.ts';

import styles from './ingredient-details.module.css';

type IngredientDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: string | null;
  
  
};

export const IngredientDetails = ({
  children,
  header,
  isOpen,
  onClose
}: IngredientDetailsProps): React.JSX.Element => {

  const dispatch = useDispatch<AppDispatch>();
  const ingredient = useSelector(
    (state: RootState) => state.selectedIngredient.ingredient);
   
  const handleClose = () => {
    dispatch(clearSelectedIngredient());
    onClose();
}
  if (!ingredient) {
    return <></>;
  }
  return (
    <Modal isOpen= {isOpen} onClose={handleClose} header ={header}>
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
        {children}
      </div>
    </Modal>
  );
};
