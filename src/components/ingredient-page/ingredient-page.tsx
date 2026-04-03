import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '@/services/store';
import { IngredientDetailsContent } from '../ingredient-details-content/ingredient-details-content';
import styles from './ingredient-page.module.css';
import { fetchIngredients } from '@/services/slices/ingredientsSlice';

export const IngredientPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

   const ingredients = useSelector((state: RootState) => state.ingredients.items);
  const loading = useSelector((state: RootState) => state.ingredients.loading);
  const error = useSelector((state: RootState) => state.ingredients.error);
  
  
  useEffect(() => {
    if (ingredients.length === 0 && !loading && !error) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length, loading, error]);
  
  const ingredient = ingredients.find(item => item._id === id);

  if (loading) {
    return <div className={styles.not_found}>Загрузка...</div>;
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
        <p>Доступно ингредиентов: {ingredients.length}</p>
      </div>
    );
  }

  // Теперь ingredient точно существует
  return (
    <div className={styles.ingredient_page}>
      <div className={styles.container}>
        <h1 className="text text_type_main-large mb-5">
          Детали ингредиента
        </h1>
        <IngredientDetailsContent ingredient={ingredient} />
      </div>
    </div>
  );
};