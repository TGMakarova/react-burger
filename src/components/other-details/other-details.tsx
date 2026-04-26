import { Modal } from '../modal/modal';
import { OtherDetailsContent } from '../other-details-content/other-details-content';

import styles from './other-details.module.css';

type OtherDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: string | null;
  orderNumber?: number | null;
  error?: string | null;
};

export const OtherDetails = ({
  children,
  orderNumber,
  error: _error, // помечаем как неиспользуемый, если не нужен
  ...modalProps
}: OtherDetailsProps): React.JSX.Element | null => {
  // Если есть ошибка, показываем её
  if (_error) {
    return (
      <Modal {...modalProps}>
        <div className={styles.error_content}>
          <h2 className="text text_type_main-medium mb-6">Ошибка</h2>
          <p className="text text_type_main-default mb-10">{_error}</p>
        </div>
      </Modal>
    );
  }

  // Если есть номер заказа, показываем его
  if (orderNumber) {
    return (
      <Modal {...modalProps}>
        <OtherDetailsContent orderNumber={orderNumber} error={null} />
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
