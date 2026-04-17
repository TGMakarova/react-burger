import { Routes, Route, useLocation } from 'react-router-dom';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { Home } from '@/pages/home/home';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import { LoginPage } from '@/pages/login-page/login-page';
import { RegisterPage } from '@/pages/register-page/register-page';
import { FeedPage } from '@/pages/feed-page/feed-page';
import { ProfilePage } from '@/pages/profile-page/profile-page';
import { ResetPassword} from '@/pages/reset-password/reset-password';
import { AppHeader } from '../app-header/app-header';
import { ForgotPassword } from '@/pages/forgot-password/forgot-password';
import { ProfileOrderPage } from '@/pages/profile-order-page/profile-order-page';
import { ProfileLayout } from '@/pages/profile-layout/profile-layout';
import ProtectedRoute from '../protected-route/propected-route';
import PublicRoute from '../public-route/public-route';
import { NotFoundPage } from '@/pages/not-found-page copy/not-found-page';
import { useEffect } from 'react';

export function App() {
  const location = useLocation();
  const background = location.state?.background;

  // Очищаем localStorage при закрытии попапа
  useEffect(() => {
    if (!background) {
      // Не очищаем сразу, даем время на восстановление
      const timer = setTimeout(() => {
        if (!localStorage.getItem('popupRestored')) {
          localStorage.removeItem('popupIngredientId');
          localStorage.removeItem('popupBackgroundPath');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [background]);

  return (
    <>
      <AppHeader />

      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="ingredients/:id" element={<IngredientPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route
          path="login-page"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="register-page"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route path="profile" element={<ProfileLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <ProfileOrderPage />
              </ProtectedRoute>
            }
          />
        </Route>

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
                onClose={() => {
                  // Очищаем все данные при закрытии
                  localStorage.removeItem('popupIngredientId');
                  localStorage.removeItem('popupBackgroundPath');
                  localStorage.removeItem('popupRestored');
                  window.history.back();
                }}
                header={'Детали ингредиента'}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}