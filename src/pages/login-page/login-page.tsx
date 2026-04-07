import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login-page.module.css';
import { checkResponse } from '@/utils/api';


import { useState } from 'react';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}
export const LoginPage = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
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
    try {
      const data: RegisterResponse = await checkResponse(response);
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        // Перезаписываем  токены в localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Токены успешно сохранены:', accessToken, refreshToken);
      } else {
        console.error('Токены не найдены в ответе сервера');
      }
      console.log('Регистрация прошла успешно:', data);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
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
        <div className={styles.size_button}>
          <Button onClick={handleRegister} size="large" type="primary">
            {' '}
            Войти
          </Button>
        </div>
      </div>
      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          {' '}
          Вы - новый пользователь?{' '}
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive `}
        >
          {' '}
          Зарегистрироваться
        </p>
        <p className={`${styles.grid_item_3} text text_type_main-default`}>
          {' '}
          Забыли пароль?{' '}
        </p>
        <p
          className={`${styles.grid_item_4} text text_type_main-default text_color_inactive `}
        >
          {' '}
          Восстановить пароль
        </p>
      </div>
    </div>
  );
};
