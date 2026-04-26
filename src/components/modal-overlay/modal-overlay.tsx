import type React from 'react';

import styles from './modal-overlay.module.css';

type ModalOverlayProps = {
  onClose: () => void;
  children: React.ReactNode;
};

export const ModalOverlay = ({
  onClose,
  children,
}: ModalOverlayProps): React.JSX.Element => {
  const handleOverlayClick = (e: React.MouseEvent): void => {
    // Закрываем Modal при клике именно на оверлей
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      {children}
    </div>
  );
};
