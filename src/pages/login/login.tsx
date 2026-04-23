import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { burgerApi } from '@utils/burger-api';
import { useDispatch } from 'react-redux';
import { setUser, setAuthChecked } from '../../services/slices/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ добавляем useLocation

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  console.log('📱 [LoginPage] Рендер');

  useEffect(() => {
    console.log('📱 [LoginPage] returnTo из localStorage:', localStorage.getItem('returnTo'));
  }, []);



  // ✅ Получаем путь для возврата (приоритет: state > localStorage > '/')
  const getReturnPath = () => {
    // 1. Сначала проверяем state из Navigate
    const fromState = location.state?.from?.pathname;
    if (fromState) return fromState;
    
    // 2. Затем проверяем localStorage (от ProtectedRoute)
    const savedPath = localStorage.getItem('returnTo');
    if (savedPath) return savedPath;
    
    // 3. По умолчанию - на главную
    return '/';
  };

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
console.log('📱 [LoginPage] Попытка входа');

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await burgerApi.login(email, password);

      dispatch(setUser(response.user));
      dispatch(setAuthChecked(true));

      // ✅ Восстанавливаем сохраненный путь
      const returnPath = getReturnPath();
      
      // Проверяем, восстанавливаем ли заказ
      const savedConstructor = localStorage.getItem('savedConstructor');
      
      // Очищаем сохраненный путь
      localStorage.removeItem('returnTo');
      
      if (savedConstructor && returnPath.includes('/orders')) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('savedConstructor');
        navigate(returnPath, { replace: true });
        return;
      }

      // Редирект на сохраненный путь или на главную
      navigate(returnPath, { replace: true });
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
