import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';

import styles from './other-details-content.module.css';

type OtherDetailsContentProps = {
  orderNumber: number | null;
  error: string | null;
};

export const OtherDetailsContent = ({
  orderNumber,
  error: _error, // ← добавляем префикс _, показывая что параметр не используется
}: OtherDetailsContentProps): React.JSX.Element => {
  return (
    <div className={styles.other_details_content}>
      <h1 className={`${styles.other_details_id} text text_type_digits-large`}>
        {orderNumber}
      </h1>
      <h3 className={`${styles.other_details_id_text} text text_type_main-medium`}>
        идентификатор заказа
      </h3>
      <div className={styles.icon_container}>
        <CheckMarkIcon type="primary" />
      </div>
      <h3 className={`${styles.other_details_order_text} text text_type_main-default`}>
        Ваш заказ начали готовить
      </h3>
      <p
        className={`${styles.other_details_finish_text} text text_type_main-default text_color_inactive`}
      >
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
};

export default OtherDetailsContent;
