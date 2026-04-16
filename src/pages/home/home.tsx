import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BurgerIngredients } from '@/components/burger-ingredients/burger-ingredients';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import type { AppDispatch, RootState } from '@/services/store/index';
import styles from './home.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIngredients } from '@/services/slices/ingredientsSlice';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setSelectedIngredient } from '@/services/slices/selectedIngredientSlice';

export const Home = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    loading,
    error,
    items: ingredients,
  } = useSelector((state: RootState) => state.ingredients);

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  // Восстанавливаем попап после перезагрузки
useEffect(() => {
  const savedIngredientId = localStorage.getItem('popupIngredientId');
  const savedBackgroundPath = localStorage.getItem('popupBackgroundPath');
  
  if (savedIngredientId && savedBackgroundPath && ingredients.length > 0) {
    const ingredient = ingredients.find(item => item._id === savedIngredientId);
    
    if (ingredient && !location.pathname.includes('/ingredients/')) {
      dispatch(setSelectedIngredient(ingredient));
      
      navigate(`/ingredients/${savedIngredientId}`, {
        state: { background: { pathname: savedBackgroundPath } },
        replace: true
      });
    }
  }
}, [ingredients]); ;

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
        <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
          Соберите бургер
        </h1>
        <main className={`${styles.main} pl-5 pr-5`}>
          <BurgerIngredients />
          <BurgerConstructor />
        </main>
      </div>
    </DndProvider>
  );
};
