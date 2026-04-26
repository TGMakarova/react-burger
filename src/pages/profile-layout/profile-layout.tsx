import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';

import { logoutUser } from '../../services/slices/authSlice';
import { clearConstructor } from '../../services/slices/burgerConstructorSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './profile-layout.module.css';

export function ProfileLayout(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const handleLogout = async (): Promise<void> => {
    if (isLoading) return;

    try {
      await dispatch(logoutUser()).unwrap();

      void dispatch(clearConstructor());

      localStorage.clear();
      sessionStorage.clear();

      void navigate('/login', { replace: true });
    } catch (_error) {
      void dispatch(clearConstructor());
      localStorage.clear();
      sessionStorage.clear();
      void navigate('/login', { replace: true });
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
            onClick={() => {
              void handleLogout();
            }}
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
