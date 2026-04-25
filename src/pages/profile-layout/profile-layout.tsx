import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';

import { logoutUser } from '../../services/slices/authSlice'; // ✅ импортируем экшен
import { clearConstructor } from '../../services/slices/burgerConstructorSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './profile-layout.module.css';

export function ProfileLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ✅ Берём состояние загрузки из Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const handleLogout = async () => {
    if (isLoading) return;

    try {
      // ✅ Используем Redux экшен вместо прямого вызова API
      await dispatch(logoutUser()).unwrap();

      // Очищаем конструктор
      dispatch(clearConstructor());

      // Очищаем все данные
      localStorage.clear();
      sessionStorage.clear();

      // Перенаправляем на логин
      navigate('/login', { replace: true });
    } catch (error) {
      // Даже при ошибке очищаем и перенаправляем
      dispatch(clearConstructor());
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
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
            disabled={isLoading}
          >
            {isLoading ? 'Выход...' : 'Выход'}
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
