import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import styles from './forgot-password.module.css';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { burgerApi } from '@utils/burger-api';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const ForgotPassword = (): React.ReactNode => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmitForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await burgerApi.post<ForgotPasswordResponse>('/password-reset', {
        email,
      });

      if (data.success) {
        localStorage.setItem('passwordResetRequested', 'true');
        navigate('/reset-password');
      } else {
        setError(data.message || 'Ошибка при отправке запроса');
      }
    } catch (error: any) {
      setError(error.message || 'Не удалось отправить запрос. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <form className={styles.login_container} onSubmit={handleSubmitForgotPassword}>
      <h1 className={styles.header}>Восстановление пароля</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <EmailInput
          name="email"
          placeholder="Укажите e-mail"
          onChange={(e) => setEmail(e.target.value)}
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
          onClick={handleLoginClick}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
