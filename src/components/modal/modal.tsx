import React from 'react';
import styles from './modal.module.css';
import ReactDOM from 'react-dom';
import { ModalOverlay } from '../modal-overlay/modal-overlay';
import { useEffect } from 'react';

const modalRoot = document.getElementById('react-modals');

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: string | null;
}

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
          <p>{header} </p>
          <button onClick={onClose}> &times;</button>
        </div>
        <div className={styles.modal_content}>{children}</div>
      </div>
    </ModalOverlay>,
    modalRoot
  );
};

export default Modal;
