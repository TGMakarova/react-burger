import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className="text text_type_main-large mb-8">
          Лента заказов
        </h1>
        <div className={styles.underConstruction}>
          <div className={styles.icon}>🚧</div>  
          <p className="text text_type_main-medium mt-4 mb-2">
            Страница находится в разработке
          </p>
          <p className="text text_type_main-default text_color_inactive">
            Скоро здесь появится лента заказов
          </p>
        </div>
      </div>
    </div>  
  );
}; 