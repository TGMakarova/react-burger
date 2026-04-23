import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../services/slices/authSlice'; // ✅ импортируем экшен
import type { AppDispatch, RootState } from '../../services/store';

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ Берём состояние загрузки из Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  // ✅ Получаем путь для возврата
  const getReturnPath = () => {
    const fromState = location.state?.from?.pathname;
    if (fromState) return fromState;
    
    const savedPath = localStorage.getItem('returnTo');
    if (savedPath) return savedPath;
    
    return '/';
  };

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setError('');

    try {
      // ✅ Используем Redux экшен вместо прямого вызова burgerApi
      const result = await dispatch(login({ email, password })).unwrap();
      
      // ✅ Восстанавливаем сохраненный путь
      const returnPath = getReturnPath();
      const savedConstructor = localStorage.getItem('savedConstructor');
      
      localStorage.removeItem('returnTo');
      
      if (savedConstructor && returnPath.includes('/orders')) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('savedConstructor');
        navigate(returnPath, { replace: true });
        return;
      }

      navigate(returnPath, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Ошибка авторизации. Проверьте email и пароль');
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
