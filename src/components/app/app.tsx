import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import { FeedPage } from '@/pages/feed-page/feed-page';
import { ForgotPassword } from '@/pages/forgot-password/forgot-password';
import { Home } from '@/pages/home/home';
import { LoginPage } from '@/pages/login/login';
import { NotFoundPage } from '@/pages/not-found-page/not-found-page';
import { OrderDetailPage } from '@/pages/order-detail-page/order-detail-page';
import { OrderPage } from '@/pages/order-page/order-page';
import { ProfileOrderPage } from '@/pages/orders/orders';
import { ProfileLayout } from '@/pages/profile-layout/profile-layout';
import { ProfilePage } from '@/pages/profile/profile';
import { RegisterPage } from '@/pages/register/register';
import { ResetPassword } from '@/pages/reset-password/reset-password';

import { checkAuth } from '../../services/slices/authSlice';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';
import { AppHeader } from '../app-header/app-header';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import ProtectedRoute from '../protected-route/protected-route';
import PublicRoute from '../public-route/public-route';

import type { RootState, AppDispatch } from '../../services/store';

import styles from './app.module.css';

// Добавьте интерфейс для location state
type LocationState = {
  from?: string;
  background?: Location;
};

export function App(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const background = (location.state as LocationState)?.background;

  const { isAuthChecked, isLoading, isLoggedIn } = useSelector(
    (state: RootState) => state.auth
  );

  // Загрузка ингредиентов при запуске приложения
  useEffect(() => {
    void dispatch(fetchIngredients());
  }, [dispatch]);

  // Проверка токена при загрузке приложения
  useEffect(() => {
    const isRestoringOrder = sessionStorage.getItem('restoringOrder') === 'true';

    if (!isRestoringOrder) {
      void dispatch(checkAuth());
    } else {
      sessionStorage.removeItem('restoringOrder');
    }
  }, [dispatch]);

  // Восстановление URL после авторизации
  useEffect(() => {
    if (isAuthChecked && isLoggedIn) {
      const returnTo = localStorage.getItem('returnTo');
      if (
        returnTo &&
        window.location.pathname !== returnTo &&
        !window.location.pathname.includes('/login')
      ) {
        localStorage.removeItem('returnTo');
        void navigate(returnTo, { replace: true });
      }
    }
  }, [isAuthChecked, isLoggedIn, navigate]);

  const handleCloseModal = (): void => {
    localStorage.removeItem('popupIngredientId');
    localStorage.removeItem('popupBackgroundPath');
    localStorage.removeItem('popupRestored');

    const returnPath = (location.state as LocationState)?.from ?? '/';
    void navigate(returnPath, { replace: true });
  };

  // Пока проверяем токен - показываем загрузку
  if (!isAuthChecked || isLoading) {
    return (
      <>
        <AppHeader />
        <div className={styles.container}>
          <div className={styles.spinner} />
          <div className={styles.text}>Проверка авторизации...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />

      <Routes location={background ?? location}>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="ingredients/:id" element={<IngredientPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="feed/:id" element={<OrderPage />} />

        {/* Маршруты для неавторизованных пользователей */}
        <Route
          path="login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="register"
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

        {/* Защищённые маршруты */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path="orders" element={<ProfileOrderPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>

        {/* 404 страница */}
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
                onClose={handleCloseModal}
                header="Детали ингредиента"
              />
            }
          />
          <Route
            path="feed/:id"
            element={
              <OrderDetailPage
                isOpen={true}
                onClose={handleCloseModal}
                orderId={location.pathname.split('/').pop()}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}
