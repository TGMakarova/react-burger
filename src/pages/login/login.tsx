import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@utils/auth-service';
import { useDispatch } from 'react-redux';
import { setUser } from '../../services/slices/authSlice'; 

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login...');
      const response = await authService.login(email, password);
      console.log('Login successful', response);
      
      // ✅ Обновляем Redux с данными пользователя
      dispatch(setUser(response.user));
      
      // Перенаправляем пользователя
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Ошибка авторизации. Проверьте email и пароль');
    } finally {
      setIsLoading(false);
    }
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
        {error && <div className={styles.error_message}>{error}</div>}
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
          onClick={() => navigate('/register')}
          style={{ cursor: 'pointer' }}
        >
          Зарегистрироваться
        </p>
        <p className={`${styles.grid_item_3} text text_type_main-default`}>
          Забыли пароль?
        </p>
        <p
          className={`${styles.grid_item_4} text text_type_main-default text_color_inactive`}
          onClick={() => navigate('/forgot-password')}
          style={{ cursor: 'pointer' }}
        >
          Восстановить пароль
        </p>
      </div>
    </div>
  );
};
