import { Link } from 'react-router-dom';

import styles from './not-found-page.module.css';

export const NotFoundPage = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🔍</div>
        <h1 className="text text_type_digits-large mb-4">404</h1>
        <p className="text text_type_main-large mb-8">Страница не найдена</p>
        <Link to="/" className={styles.link}>
          <div className={styles.homeButton}>← Вернуться на главную</div>
        </Link>
      </div>
    </div>
  );
};
