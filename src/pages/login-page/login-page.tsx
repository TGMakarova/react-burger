import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login-page.module.css';
import { checkResponse } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export const LoginPage = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Если уже авторизован, перенаправляем на профиль
      navigate('/profile');
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (isLoading) return; // Предотвращаем двойной клик
    
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://new-stellarburgers.education-services.ru/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );
      
      const data: RegisterResponse = await checkResponse(response);
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Токены успешно сохранены');
        
        // Проверяем, есть ли сохраненный маршрут
        const returnTo = localStorage.getItem('returnTo');
        if (returnTo) {
          localStorage.removeItem('returnTo');
          navigate(returnTo);
        } else {
          navigate('/profile');
        }
      } else {
        console.error('Токены не найдены в ответе сервера');
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка авторизации. Проверьте email и пароль');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = () => {
    navigate('/register-page');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password-page');
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.header}>Вход</h1>
      <div className={styles.mail_container}>
        <EmailInput
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <PasswordInput
          icon="ShowIcon"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <div className={styles.size_button}>
          <Button 
            onClick={handleLogin} 
            size="large" 
            type="primary"
            disabled={isLoading}
            htmlType="button"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </div>
      </div>
      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          Вы - новый пользователь?
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
          onClick={handleRegister}
          style={{ cursor: 'pointer' }}
        >
          Зарегистрироваться
        </p>
        <p className={`${styles.grid_item_3} text text_type_main-default`}>
          Забыли пароль?
        </p>
        <p
          className={`${styles.grid_item_4} text text_type_main-default text_color_inactive`}
          onClick={handleForgotPassword}
          style={{ cursor: 'pointer' }}
        >
          Восстановить пароль
        </p>
      </div>
    </div>
  );
};