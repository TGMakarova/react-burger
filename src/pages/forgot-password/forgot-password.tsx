import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import styles from './forgot-password.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { burgerApi } from '@utils/burger-api';

// Правильный интерфейс для ответа forgot-password
interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Введите email');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Правильный эндпоинт для запроса сброса пароля
      const data = await burgerApi.post<ForgotPasswordResponse>('/password-reset', {
        email
      });
      
      if (data.success) {
        console.log('Инструкция отправлена:', data.message);
        // Сохраняем флаг, что запрос отправлен
        localStorage.setItem('passwordResetRequested', 'true');
        // Перенаправляем на страницу ввода нового пароля
        navigate('/reset-password');
      } else {
        setError(data.message || 'Ошибка при отправке запроса');
      }
    } catch (error: any) {
      console.error('Ошибка при запросе сброса пароля:', error);
      setError(error.message || 'Не удалось отправить запрос. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.header}>Восстановление пароля</h1>
      
      {error && (
        <div className={styles.error_message}>
          {error}
        </div>
      )}
      
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
            onClick={handleForgotPassword} 
            size="large" 
            type="primary" 
            htmlType="button"
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
          style={{ cursor: 'pointer' }}
        >
          Войти
        </p>
      </div>
    </div>
  );
};
