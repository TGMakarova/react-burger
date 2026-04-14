import { useNavigate } from 'react-router-dom';
import { Outlet, NavLink } from 'react-router-dom';
import styles from './profile-layout.module.css';

export function ProfileLayout() {
  const navigate = useNavigate(); // Обновлённый хук

  const handleLogout = async () => {
    try {
      await fetch('https://new-stellarburgers.education-services.ru/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      localStorage.removeItem('accessToken');

      navigate('/login-page');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
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
          >
            Выход
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
