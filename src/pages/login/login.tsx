import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { burgerApi } from '@utils/burger-api';
import { useDispatch } from 'react-redux';
import { setUser, setAuthChecked } from '../../services/slices/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await burgerApi.login(email, password);

      dispatch(setUser(response.user));
      dispatch(setAuthChecked(true));

      const savedConstructor = localStorage.getItem('savedConstructor');
      const returnTo = localStorage.getItem('returnTo');

      if (savedConstructor && returnTo) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('returnTo');
        navigate(returnTo, { replace: true });
        return;
      }

      navigate('/', { replace: true });
    } catch (error: any) {
      setError(error.message || 'Ошибка авторизации. Проверьте email и пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.header}>Вход</h1>

      <form onSubmit={handleSubmitLogin} className={styles.mail_container}>
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
          <Button size="large" type="primary" disabled={isLoading} htmlType="submit">
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </div>
      </form>

      <div className={styles.registration_container}>
        <div className={styles.grid_row}>
          <p className={`${styles.grid_item_1} text text_type_main-default`}>
            Вы - новый пользователь?
          </p>
          <p
            className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </p>
        </div>
        <div className={styles.grid_row}>
          <p className={`${styles.grid_item_1} text text_type_main-default`}>
            Забыли пароль?
          </p>
          <p
            className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
            onClick={() => navigate('/forgot-password')}
          >
            Восстановить пароль
          </p>
        </div>
      </div>
    </div>
  );
}
