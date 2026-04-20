import {
  Button,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './reset-password.module.css';
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { burgerApi } from '@utils/burger-api';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const ResetPassword = (): React.ReactNode => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hasRequestedReset = localStorage.getItem('passwordResetRequested') === 'true';
    
    if (!hasRequestedReset) {
      navigate('/forgot-password');
    }
  }, [navigate]);
  
  useEffect(() => {
    return () => {
      // Опционально: очищаем флаг при уходе со страницы
      // localStorage.removeItem('passwordResetRequested');
    };
  }, []);

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

    setIsLoading(true);
    setError('');

    try {
      const data = await burgerApi.post<ResetPasswordResponse>(
        '/password-reset/reset',
        {
          password: password,
          token: token,
        }
      );

      if (data.success) {
        localStorage.removeItem('passwordResetRequested');
        navigate('/login');
      } else {
        setError(data.message || 'Ошибка при сбросе пароля');
      }
    } catch (error: any) {
      setError(error.message || 'Не удалось изменить пароль. Попробуйте позже.');
    } finally {
      setIsLoading(false);
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
          style={{ cursor: 'pointer' }}
        >
          Войти
        </p>
      </div>
    </form>
  );
};