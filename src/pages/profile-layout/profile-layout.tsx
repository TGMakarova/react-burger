import { useNavigate } from 'react-router-dom';
import { Outlet, NavLink } from 'react-router-dom';
import styles from './profile-layout.module.css';
import { burgerApi } from '@utils/burger-api';
import { useState } from 'react';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

export function ProfileLayout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setError('');
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.warn('Нет refreshToken для выхода');
        // Если нет токена, просто очищаем localStorage
        localStorage.clear();
        navigate('/login-page');
        return;
      }
      
      // Используем burgerApi для выхода
      const data = await burgerApi.post<LogoutResponse>('/auth/logout', {
        token: refreshToken
      });
      
      if (data.success) {
        console.log('Выход выполнен успешно');
      }
      
      // Полная очистка localStorage
      localStorage.clear();
      
      // Перенаправляем на страницу входа
      navigate('/login-page');
    } catch (error: any) {
      console.error('Ошибка при выходе:', error);
      setError(error.message || 'Ошибка при выходе');
      
      // Даже при ошибке очищаем токены
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Небольшая задержка перед редиректом, чтобы пользователь увидел ошибку
      setTimeout(() => {
        navigate('/login-page');
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.profile_container}>
      {/* Левая колонка с меню */}
      <div className={styles.profile_sidebar}>
        <div className={styles.header_container}>
          <NavLink
            to="/profile"
            end
            className={({ isActive }) =>
              `text text_type_main-medium ${!isActive ? 'text_color_inactive' : ''}`
            }
          >
            Профиль
          </NavLink>
          <NavLink
            to="/profile/orders"
            className={({ isActive }) =>
              `text text_type_main-medium ${!isActive ? 'text_color_inactive' : ''}`
            }
          >
            История заказов
          </NavLink>
          <button
            className="text text_type_main-medium text_color_inactive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ cursor: isLoggingOut ? 'not-allowed' : 'pointer' }}
          >
            {isLoggingOut ? 'Выход...' : 'Выход'}
          </button>
        </div>
        
        {error && (
          <div className={styles.error_message}>
            {error}
          </div>
        )}
        
        <p
          className={`text text_type_main-default text_color_inactive ${styles.description_text}`}
        >
          В этом разделе вы можете изменить свои персональные данные
        </p>
      </div>

      <div className={styles.profile_content}>
        <Outlet />
      </div>
    </div>
  );
}