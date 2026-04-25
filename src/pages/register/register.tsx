import {
  Button,
  EmailInput,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { register } from '../../services/slices/authSlice'; // ✅ импортируем экшен

import type { AppDispatch, RootState } from '../../services/store';

import styles from './register.module.css';

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ Берём состояние загрузки из Redux
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

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

  const handleSubmitRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      // ✅ Используем Redux экшен вместо прямого вызова burgerApi
      await dispatch(register({ name, email, password })).unwrap();

      // Проверяем, нужно ли восстановить конструктор
      const savedConstructor = localStorage.getItem('savedConstructor');
      const returnTo = localStorage.getItem('returnTo');

      if (savedConstructor && returnTo) {
        sessionStorage.setItem('restoringOrder', 'true');
        localStorage.removeItem('returnTo');
        navigate(returnTo);
        return;
      }

      // Перенаправляем на главную
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <form className={styles.register_container} onSubmit={handleSubmitRegister}>
      <h1 className={styles.header}>Регистрация</h1>

      {error && <div className={styles.error_message}>{error}</div>}

      <div className={styles.mail_container}>
        <Input
          errorText="Ошибка"
          name="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          size="default"
          type="text"
          value={name}
        />
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
          onClick={handleLoginClick}
        >
          Войти
        </p>
      </div>
    </form>
  );
};
