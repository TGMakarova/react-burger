import { BurgerIngredients } from '@/components/burger-ingredients/burger-ingredients';
import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { IngredientDetails } from '@/components/ingredient-details/ingredient-details';
import type { AppDispatch, RootState } from 'src/store/index';
import styles from './app.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients } from '@/store/slices/ingredientsSlice';
import { useEffect, useState } from 'react';

export const App = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Получаем данные из Redux store
  const { items: ingredients, loading, error } = useSelector(
    (state: RootState) => state.ingredients
  );
  
  const selectedIngredient = useSelector(
    (state: RootState) => state.selectedIngredient.ingredient
  );

  // Загружаем ингредиенты при монтировании компонента
  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  // Открываем модальное окно когда появляется выбранный ингредиент
  useEffect(() => {
    if (selectedIngredient) {
      setIsModalOpen(true);
    }
  }, [selectedIngredient]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Показываем загрузку
  if (loading) return <div>Загрузка...</div>;
  
  // Показываем ошибку если есть
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.app}>
      <AppHeader />
      <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
        Соберите бургер
      </h1>
      <main className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients ingredients={ingredients} />
        <BurgerConstructor ingredients={ingredients} />
      </main>
      {/* Модальное окно для деталей ингредиента */}
      <IngredientDetails 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header="Детали ингредиента"
      />
    </div>
  );
};

