import { ingredients } from '@/utils/ingredients';
import {
  Button,
  ConstructorElement,
  DragIcon,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';

import { OtherDetails } from '../other-details/other-details';

import styles from './mycomponent-ui.module.css';

export const MyComponentUI = (): React.JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Состояние для управления видимостью модала

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className={styles.constructor_element}>
      {ingredients.map((ingredient) => (
        <div key={ingredient._id}>
          <>
            <DragIcon type="secondary"></DragIcon>
            <ConstructorElement
              handleClose={function fee() {}}
              isLocked={false}
              price={ingredient.price}
              text={ingredient.name}
              thumbnail={ingredient.image}
            />
          </>
          <p className={styles.constructor_padding} />
        </div>
      ))}
      <div className={styles.constructor_button}>
        <span className={`${styles.constructor_button} text text_type_digits-medium`}>
          610
        </span>
        <CurrencyIcon type="primary" className={styles.constructor_icon}></CurrencyIcon>
        <Button onClick={handleOpenModal} size="medium" type="primary" htmlType="button">
          <span>Оформить заказ</span>
        </Button>
      </div>
      {isModalOpen && (
        <OtherDetails
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          children="Содержимое модального окна"
        />
      )}
    </div>
  );
};
