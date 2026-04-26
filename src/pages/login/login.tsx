import {
  EmailInput,
  PasswordInput,
  Button,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { login } from '../../services/slices/authSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './login.module.css';

export function LoginPage(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const getReturnPath = (): string => {
    const locationState = location.state as { from?: { pathname?: string } } | undefined;
    const fromState = locationState?.from?.pathname;
    if (fromState) return fromState;

    const savedPath = localStorage.getItem('returnTo');
    if (savedPath) return savedPath;

    return '/';
  };

  const handleSubmitLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (isLoading) return;

    setError('');

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      void result;

      const returnPath = getReturnPath();
      const savedConstructor = localStorage.getItem('savedConstructor');

      localStorage.removeItem('returnTo');

      if (savedConstructor && returnPath.includes('/orders')) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('savedConstructor');
        void navigate(returnPath, { replace: true });
        return;
      }

      void navigate(returnPath, { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Ошибка авторизации. Проверьте email и пароль';
      setError(errorMessage);
    }
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.header}>Вход</h1>

      <form
        onSubmit={(e) => {
          void handleSubmitLogin(e);
        }}
        className={styles.mail_container}
      >
        <EmailInput
          name="email"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          value={email}
        />

        <PasswordInput
          icon="ShowIcon"
          name="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
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
            onClick={() => {
              void navigate('/register');
            }}
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
            onClick={() => {
              void navigate('/forgot-password');
            }}
          >
            Восстановить пароль
          </p>
        </div>
      </div>
    </div>
  );
}
