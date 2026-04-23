import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import styles from './profile-layout.module.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { burgerApi } from '@utils/burger-api';
import { clearConstructor } from '../../services/slices/burgerConstructorSlice';
import { logout } from '../../services/slices/authSlice';

export function ProfileLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await burgerApi.logout();

      // Очищаем Redux состояние
      dispatch(clearConstructor());
      dispatch(logout());

      // Очищаем все данные
      localStorage.clear();
      sessionStorage.clear();

      // Перенаправляем на логин
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже при ошибке очищаем и перенаправляем
      dispatch(clearConstructor());
      dispatch(logout());
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
              `${styles.nav_link} text text_type_main-medium ${isActive ? styles.active_link : 'text_color_inactive'}`
            }
          >
            Профиль
          </NavLink>
          <NavLink
            to="/profile/orders"
            className={({ isActive }) =>
              `${styles.nav_link} text text_type_main-medium ${isActive ? styles.active_link : 'text_color_inactive'}`
            }
          >
            История заказов
          </NavLink>
          <button
            className={`${styles.logout_button} text text_type_main-medium text_color_inactive`}
            onClick={handleLogout}
            disabled={isLoggingOut}
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
