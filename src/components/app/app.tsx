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
import { ProfileLayout } from '@/pages/profile-layout/profile-layout';
import ProtectedRoute from '../protected-route/propected-route';
import PublicRoute from '../public-route/public-route';

<Route path="profile" element={<ProfileLayout />}>
  <Route index element={<ProfilePage />} />
  <Route path="orders" element={<ProfileOrderPage />} />
</Route>;
import { NotFoundPage } from '@/pages/not-found-page copy/not-found-page';

export function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <AppHeader />

      <Routes location={background || location}>
        {/* Открытые маршруты — для всех пользователей */}
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
          path="forgot-password-page"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="reset-password-page"
          element={
            <PublicRoute>
              <ResetPasswordPage />
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
