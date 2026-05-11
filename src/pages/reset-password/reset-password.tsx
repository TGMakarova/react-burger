import {
  Button,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks/customHooks';
import { resetPassword } from '../../services/slices/authSlice';

import styles from './reset-password.module.css';

export const ResetPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const isLoading = useSelector((state) => state.auth.isLoading);

  useEffect(() => {
    const hasRequestedReset = localStorage.getItem('passwordResetRequested') === 'true';

    if (!hasRequestedReset) {
      void navigate('/forgot-password');
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    if (!password.trim()) {
      setError('Введите новый пароль');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (!token.trim()) {
      setError('Введите код из письма');
      return false;
    }
    return true;
  };

  const handleSubmitResetPassword = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      await dispatch(resetPassword({ password, token })).unwrap();
      localStorage.removeItem('passwordResetRequested');
      void navigate('/login');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Не удалось изменить пароль. Попробуйте позже.';
      setError(errorMessage);
    }
  };

  return (
    <form
      className={styles.login_container}
      onSubmit={(e) => {
        void handleSubmitResetPassword(e);
      }}
    >
      <h1 className={styles.header}>Восстановление пароля</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <PasswordInput
          icon="ShowIcon"
          name="password"
          placeholder="Введите новый пароль"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          value={password}
          disabled={isLoading}
        />
        <Input
          name="token"
          placeholder="Введите код из письма"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
          value={token}
          disabled={isLoading}
        />

        <div className={styles.size_button}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={isLoading || !password || !token}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
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
            void navigate('/login');
          }}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
