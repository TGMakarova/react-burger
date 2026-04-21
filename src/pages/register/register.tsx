import {
  Button,
  EmailInput,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './register.module.css';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { burgerApi } from '@utils/burger-api';
import { useDispatch } from 'react-redux';
import { setUser, setAuthChecked } from '../../services/slices/authSlice';

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    setIsLoading(true);
    setError('');

    try {
      const data = await burgerApi.register(name, email, password);

      if (data.accessToken && data.refreshToken) {
        // Сохраняем токены
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Сохраняем пользователя в Redux
        dispatch(setUser(data.user));
        dispatch(setAuthChecked(true)); // ЭТО ВАЖНО!

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
      } else {
        setError('Токены не найдены в ответе сервера');
      }
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      setError(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
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
