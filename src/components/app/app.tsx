import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BurgerIngredients } from '@/components/burger-ingredients/burger-ingredients';
import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { IngredientDetails } from '@/components/ingredient-details/ingredient-details';
import type { AppDispatch, RootState } from '@/services/store/index';
import styles from './app.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients } from '@/services/slices/ingredientsSlice';
import { useEffect, useState } from 'react';

export const App = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { items: ingredients, loading, error } = useSelector(
    (state: RootState) => state.ingredients
  );
  
  const selectedIngredient = useSelector(
    (state: RootState) => state.selectedIngredient.ingredient
  );

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  useEffect(() => {
    if (selectedIngredient) {
      setIsModalOpen(true);
    }
  }, [selectedIngredient]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p className="text text_type_main-large">Загрузка ингредиентов...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.error}>
        <p className="text text_type_main-large">Ошибка: {error}</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.app}>
        <AppHeader />
        <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
          Соберите бургер
        </h1>
        <main className={`${styles.main} pl-5 pr-5`}>
          <BurgerIngredients ingredients={ingredients} />
          <BurgerConstructor />
        </main>
        <IngredientDetails 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          header="Детали ингредиента"
        />
      </div>
    </DndProvider>
  );
};