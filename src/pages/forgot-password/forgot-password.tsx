import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { forgotPassword } from '../../services/slices/authSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './forgot-password.module.css';

export const ForgotPassword = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Введите email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email');
      return false;
    }
    return true;
  };

  const handleSubmitForgotPassword = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      localStorage.setItem('passwordResetRequested', 'true');
      void navigate('/reset-password');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Не удалось отправить запрос. Попробуйте позже.';
      setError(errorMessage);
    }
  };

  const handleLoginClick = (): void => {
    void navigate('/login');
  };

  return (
    <form
      className={styles.login_container}
      onSubmit={(e) => {
        void handleSubmitForgotPassword(e);
      }}
    >
      <h1 className={styles.header}>Восстановление пароля</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <EmailInput
          name="email"
          placeholder="Укажите e-mail"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          value={email}
          disabled={isLoading}
        />

        <div className={styles.size_button}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Отправка...' : 'Восстановить'}
          </Button>
        </div>
      </div>

      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          Вспомнили пароль?
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
          onClick={() => {
            void handleLoginClick();
          }}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
