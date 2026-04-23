import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/services/store';
import { IngredientDetailsContent } from '../ingredient-details-content/ingredient-details-content';
import styles from './ingredient-page.module.css';

export const IngredientPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const ingredients = useSelector((state: RootState) => state.ingredients.items);
  const loading = useSelector((state: RootState) => state.ingredients.loading);
  const error = useSelector((state: RootState) => state.ingredients.error);

  // Проверяем, не передан ли ингредиент через state (при клике из модала)
  const ingredientFromState = location.state?.ingredient;

  let ingredient = ingredientFromState;
  if (!ingredient && ingredients.length > 0) {
    ingredient = ingredients.find((item) => item._id === id);
  }

  if (loading && ingredients.length === 0) {
    return <div className={styles.not_found}>Загрузка ингредиентов...</div>;
  }

  if (error) {
    return (
      <div className={styles.not_found}>
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className={styles.not_found}>
        <h2>Ингредиент не найден</h2>
        <p>ID: {id}</p>
        <p>Загружено ингредиентов: {ingredients.length}</p>
      </div>
    );
  }

  return (
    <div className={styles.ingredient_page}>
      <div className={styles.container}>
        <h1 className="text text_type_main-large mb-5">Детали ингредиента</h1>
        <IngredientDetailsContent ingredient={ingredient} />
      </div>
    </div>
  );
};
