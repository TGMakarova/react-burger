import { Routes, Route, useLocation } from 'react-router-dom';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { Home } from '@/pages/home/home';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import { LoginPage } from '@/pages/login-page/login-page';
import { RegisterPage } from '@/pages/register-page/register-page';
import { FeedPage } from '@/pages/feed-page/feed-page';
import { ProfilePage } from '@/pages/profile-page/profile-page';
import { ResetPasswordPage } from '@/pages/reset-password-page/reset-password-page';
import { AppHeader } from '../app-header/app-header';
import { ForgotPasswordPage } from '@/pages/forgot-password-page/forgot-password-page';
import { ProfileOrderPage } from '@/pages/profile-order-page/profile-order-page';

import { NotFoundPage } from '@/pages/not-found-page copy/not-found-page'; 

export function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <AppHeader />
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="ingredients/:id" element={<IngredientPage />} />
        <Route path="login-page" element={<LoginPage />} />
        <Route path="register-page" element={<RegisterPage />} />
        <Route path="forgot-password-page" element={<ForgotPasswordPage />} />
        <Route path="reset-password-page" element={<ResetPasswordPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/orders" element={<ProfileOrderPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
