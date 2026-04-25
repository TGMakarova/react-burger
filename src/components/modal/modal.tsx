import { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { ModalOverlay } from '../modal-overlay/modal-overlay';

import type React from 'react';

import styles from './modal.module.css';

const modalRoot = document.getElementById('react-modals');

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: string | null;
};

export const Modal = ({ isOpen, onClose, children, header }: ModalProps) => {
  useEffect(() => {
    const handleEscClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscClose);
      // Блокировка прокрутки страницы
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscClose);
      // Возврат прокрутки страницы
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!modalRoot) {
    throw new Error('Modal root element not found');
  }
  return ReactDOM.createPortal(
    <ModalOverlay onClose={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <p className={`${styles.modal_header} text text_type_main-large `}>{header}</p>
          <button onClick={onClose} className={styles.close_button} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.modal_content}>{children}</div>
      </div>
    </ModalOverlay>,
    modalRoot
  );
};

export default Modal;
