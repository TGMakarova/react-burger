import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';

import { NavLink } from 'react-router-dom'; 

import styles from './app-header.module.css';

export const AppHeader = (): React.JSX.Element => {
  // Функция для определения стиля активной ссылки
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `${styles.link} ${isActive ? styles.link_active : ''}`;
  };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          {/* Конструктор - точное совпадение с "/" */}
          <NavLink
            to="/"
            end // 👈 активен только на главной
            className={getLinkClass}
          >
            <BurgerIcon type="primary" />
            <p className="text text_type_main-default ml-2">Конструктор</p>
          </NavLink>

          {/* Лента заказов */}
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `${styles.link} ml-10 ${isActive ? styles.link_active : ''}`
            }
          >
            <ListIcon type="secondary" />
            <p className="text text_type_main-default ml-2">Лента заказов</p>
          </NavLink>
        </div>

        <div className={styles.logo}>
          <Logo />
        </div>

        {/* Личный кабинет - активен на /profile и всех вложенных */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${styles.link} ${styles.link_position_last} ${isActive ? styles.link_active : ''}`
          }
        >
          <ProfileIcon type="secondary" />
          <p className="text text_type_main-default ml-2">Личный кабинет</p>
        </NavLink>
      </nav>
    </header>
  );
};
