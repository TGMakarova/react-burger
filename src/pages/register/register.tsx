import {
  Button,
  EmailInput,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks/customHooks';
import { register } from '../../services/slices/authSlice';

import styles from './register.module.css';

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isLoading = useSelector((state) => state.auth.isLoading);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Введите имя');
      return false;
    }
    if (!email.trim()) {
      setError('Введите email');
      return false;
    }
    if (!password.trim()) {
      setError('Введите пароль');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmitRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      await dispatch(register({ name, email, password })).unwrap();

      const savedConstructor = localStorage.getItem('savedConstructor');
      const returnTo = localStorage.getItem('returnTo');

      if (savedConstructor && returnTo) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('returnTo');
        void navigate(returnTo);
        return;
      }

      void navigate('/');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте еще раз.';
      setError(errorMessage);
    }
  };

  const handleLoginClick = (): void => {
    void navigate('/login');
  };

  return (
    <form
      className={styles.register_container}
      onSubmit={(e) => {
        void handleSubmitRegister(e);
      }}
    >
      <h1 className={styles.header}>Регистрация</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <Input
          errorText="Ошибка"
          name="name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Имя"
          size="default"
          type="text"
          value={name}
        />
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
      </div>

      <div className={styles.size_button}>
        <Button size="large" type="primary" disabled={isLoading} htmlType="submit">
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </div>

      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          Уже зарегистрировались?
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
          onClick={() => {
            void handleLoginClick();
          }}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
