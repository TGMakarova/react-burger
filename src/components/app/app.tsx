import { Routes, Route, useLocation } from 'react-router-dom';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { Home } from '@/pages/home/home';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import { LoginPage } from '@/pages/login-page/login-page';
import { RegisterPage } from '@/pages/register-page/register-page';
import { AppHeader } from '../app-header/app-header';

export function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    
    <>
      <AppHeader />
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        {/* Страница отдельного ингредиента для прямых переходов */}
          <Route path="ingredients/:id" element={<IngredientPage />} />
        <Route path="login-page" element={<LoginPage />} />
         <Route path="register-page" element={<RegisterPage />} />
      </Routes>

      {/* Модальное окно поверх основного контента */}
      {background && (
        <Routes>
          <Route
            path="ingredients/:id"
            element={
              <IngredientDetails
                isOpen={true}
                onClose={() => window.history.back()}
                header={'Детали ингредиента'}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}
