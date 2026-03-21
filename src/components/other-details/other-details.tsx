import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';
import { Modal } from '../modal/modal';

import styles from './other-details.module.css';

type OtherDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode; // делаем children опциональным
  header?: string | null;
  orderNumber?: number | null; // добавляем пропс для номера заказа
  error?: string | null; // добавляем пропс для ошибки
};

export const OtherDetails = ({
  children,
  orderNumber,
  error,
  ...modalProps
}: OtherDetailsProps) => {
  // Если есть ошибка, показываем её
  if (error) {
    return (
      <Modal {...modalProps}>
        <div className={styles.other_details_content}>
          <h2 className="text text_type_main-medium mb-6">Ошибка</h2>
          <p className="text text_type_main-default mb-10">{error}</p>
        </div>
      </Modal>
    );
  }

  // Если есть номер заказа, показываем его
  if (orderNumber) {
    return (
      <Modal {...modalProps}>
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
          <h3 className={`${styles.other_details_order_text} text text_type_main-small`}>
            Ваш заказ начали готовить
          </h3>
          <h3
            className={`${styles.other_details_finish_text} text text_type_main-default text_color_inactive`}
          >
            Дождитесь готовности на орбитальной станции
          </h3>
        </div>
      </Modal>
    );
  }

  // Если нет ни ошибки, ни номера заказа, показываем children
  return (
    <Modal {...modalProps}>
      <div className={styles.other_details_content}>{children}</div>
    </Modal>
  );
};

export default OtherDetails;
