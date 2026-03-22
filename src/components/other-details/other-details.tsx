
import { Modal } from '../modal/modal';
import styles from './other-details.module.css';
import {OtherDetailsContent} from '../other-details-content/other-details-content'

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
       <OtherDetailsContent orderNumber={orderNumber} />
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
