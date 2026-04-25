import {
  Button,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import { useState, useEffect, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { resetPassword } from '../../services/slices/authSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './reset-password.module.css';

export const ResetPassword = (): React.ReactNode => {
  const dispatch = useDispatch<AppDispatch>();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Берём состояние загрузки из Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    const hasRequestedReset = localStorage.getItem('passwordResetRequested') === 'true';

    if (!hasRequestedReset) {
      navigate('/forgot-password');
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

  const handleSubmitResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      // Используем Redux экшен вместо прямого вызова API
      await dispatch(resetPassword({ password, token })).unwrap();
      localStorage.removeItem('passwordResetRequested');
      navigate('/login');
    } catch (error: any) {
      setError(error.message || 'Не удалось изменить пароль. Попробуйте позже.');
    }
  };

  return (
    <form className={styles.login_container} onSubmit={handleSubmitResetPassword}>
      <h1 className={styles.header}>Восстановление пароля</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <PasswordInput
          icon="ShowIcon"
          name="password"
          placeholder="Введите новый пароль"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          disabled={isLoading}
        />
        <Input
          name="token"
          placeholder="Введите код из письма"
          onChange={(e) => setToken(e.target.value)}
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
          onClick={() => navigate('/login')}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
