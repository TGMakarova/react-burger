import { useEffect, useRef } from 'react';
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
import { wsConnectProfile, wsDisconnectProfile } from '../../services/slices/profileFeedSlice';
import { AppHeader } from '../app-header/app-header';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import ProtectedRoute from '../protected-route/protected-route';
import PublicRoute from '../public-route/public-route';
import { ProfileOrderPageID } from '@/pages/profile-order-page/profile-order-page';
import { BURGER_WS_URL } from '@/utils/burger-api';
import type { RootState, AppDispatch } from '../../services/store';

import styles from './app.module.css';

type LocationState = {
  from?: string;
  background?: Location;
};

export function App(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const background = (location.state as LocationState)?.background;
  
  // ✅ Проверяем, является ли текущий путь страницей профиля (не модалкой)
  const isProfileOrderPage = location.pathname.includes('/profile/orders/') && !background;

  const { isAuthChecked, isLoading, isLoggedIn } = useSelector(
    (state: RootState) => state.auth
  );
  
  const wsConnected = useSelector((state: RootState) => state.profileFeed.wsConnected);
  
  const hasConnected = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

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

  // 🌐 ГЛОБАЛЬНОЕ ПОДКЛЮЧЕНИЕ WEBSOCKET ДЛЯ ПРОФИЛЯ
  useEffect(() => {
    if (isAuthChecked && isLoggedIn && !hasConnected.current) {
      let token = localStorage.getItem('accessToken');
      
      if (token) {
        let cleanToken = token.replace('Bearer ', '').replace(/^"|"$/g, '');
        const wsUrl = `${BURGER_WS_URL}/orders?token=${cleanToken}`;
        
        console.log('🔌 Подключение WebSocket для профиля (ОДИН РАЗ)');
        dispatch(wsConnectProfile(wsUrl));
        hasConnected.current = true;
      } else {
        console.warn('⚠️ Нет токена! WebSocket для профиля не подключен');
      }
    }
    
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [dispatch, isAuthChecked, isLoggedIn]);

  // ✅ Отдельный эффект для отслеживания выхода пользователя
  useEffect(() => {
    if (isAuthChecked && !isLoggedIn && hasConnected.current) {
      console.log('🔌 Пользователь вышел, отключаем WebSocket');
      dispatch(wsDisconnectProfile());
      hasConnected.current = false;
    }
  }, [isAuthChecked, isLoggedIn, dispatch]);

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
          {/* ✅ ДЛЯ ОТДЕЛЬНОЙ СТРАНИЦЫ */}
          <Route path="orders/:id" element={<ProfileOrderPageID />} />
        </Route>

        {/* 404 страница */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

     {/* Модальное окно - только для ингредиентов и feed */}
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
        />
      }
    />
    {/* profile/orders/:id - НЕ ДОЛЖЕН БЫТЬ ЗДЕСЬ */}
  </Routes>
)}
    </>
  );
}
