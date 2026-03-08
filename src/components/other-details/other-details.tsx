import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';
import styles from './other-details.module.css';
import { Modal } from '../modal/modal';

interface OtherDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: string | null;
}

export const OtherDetails = ({ children, ...modalProps }: OtherDetailsProps) => {
  return (
    <Modal {...modalProps}>
      <div className={styles.other_details_content}>
        <h1 className={`${styles.other_details_id} text text_type_digits-large`} > 034563</h1>
        <h3 className={`${styles.other_details_id_text} text text_type_main-medium `}> идентификатор заказа</h3>
        <CheckMarkIcon type="primary" />
        <h3 className={`${styles.other_details_order_text} text text_type_main-small `}> Ваш заказ начали готовить</h3>
        <h3 className= {`${styles.other_details_finish_text} text text_type_main-default text_color_inactive`}>
          Дождитесь готовности на орбитальной станции
        </h3>
      </div>
    </Modal>
  );
};
export default OtherDetails;
