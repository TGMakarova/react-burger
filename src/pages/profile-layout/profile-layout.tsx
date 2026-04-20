import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import styles from './profile-layout.module.css';
import { useState } from 'react';
import { burgerApi } from '@utils/burger-api';

export function ProfileLayout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await burgerApi.logout();
      
      // Очищаем все данные
      localStorage.clear();
      sessionStorage.clear();
      
      // Перенаправляем на логин
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже при ошибке очищаем и перенаправляем
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.profile_container}>
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