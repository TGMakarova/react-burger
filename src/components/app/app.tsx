import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { Home } from '@/pages/home/home';
import { IngredientPage } from '../ingredient-page/ingredient-page';
import { LoginPage } from '@/pages/login/login';
import { RegisterPage } from '@/pages/register/register';
import { FeedPage } from '@/pages/feed-page/feed-page';
import { ProfilePage } from '@/pages/profile/profile';
import { ResetPassword} from '@/pages/reset-password/reset-password';
import { AppHeader } from '../app-header/app-header';
import { ForgotPassword } from '@/pages/forgot-password/forgot-password';
import { ProfileOrderPage } from '@/pages/orders/orders';
import { ProfileLayout } from '@/pages/profile-layout/profile-layout';
import  ProtectedRoute  from '../protected-route/protected-route';
import PublicRoute from '../public-route/public-route';
import { NotFoundPage } from '@/pages/not-found-page/not-found-page';
import { checkAuth } from '../../services/authActions';
import type { RootState, AppDispatch } from '../../services/store';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const background = location.state?.background;
  
  const { isAuthChecked, isLoading } = useSelector((state: RootState) => state.auth);

  // Проверка токена при загрузке приложения
  useEffect(() => {
    // ✅ Если мы восстанавливаем заказ - не делаем checkAuth
    const isRestoringOrder = sessionStorage.getItem('restoringOrder') === 'true';
    
    if (!isRestoringOrder) {
      console.log('🔍 Running checkAuth');
      dispatch(checkAuth());
    } else {
      console.log('⏭️ Skipping checkAuth - restoring order');
      // ✅ Сбрасываем флаг после того как он использован
      sessionStorage.removeItem('restoringOrder');
    }
  }, [dispatch]);

  const handleCloseModal = () => {
    localStorage.removeItem('popupIngredientId');
    localStorage.removeItem('popupBackgroundPath');
    localStorage.removeItem('popupRestored');
    
    const returnPath = location.state?.from || '/';
    navigate(returnPath);
  };

  // Пока проверяем токен - показываем загрузку
  if (!isAuthChecked || isLoading) {
    return (
      <>
        <AppHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #E2E8F0',
            borderTop: '4px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div>Проверка авторизации...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />

      <Routes location={background || location}>
        {/* Публичные маршруты */}
        <Route path="/" element={<Home />} />
        <Route path="ingredients/:id" element={<IngredientPage />} />
        <Route path="feed" element={<FeedPage />} />
        
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
                header={'Детали ингредиента'}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}