import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './reset-password-page.module.css';
import { checkResponse } from '@/utils/api';

import { useState } from 'react';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}
export const ResetPasswordPage = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const response = await fetch(
      'https://new-stellarburgers.education-services.ru/api/password-reset/reset',
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
      <h1 className={styles.header}>Восстановление пароля</h1>
      <div className={styles.mail_container}>
        <PasswordInput
          icon="ShowIcon"
          name="password"
          placeholder='Введите новый пароль'
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <EmailInput
          name="email"
          placeholder='Введите код из письма'
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        
        <div className={styles.size_button}>
          <Button onClick={handleRegister} size="large" type="primary">
            {' '}
            Сохранить
          </Button>
        </div>
      </div>
      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          {' '}
          Вспомнили пароль?{' '}
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive `}
        >
          {' '}
          Войти
        </p>
        
      </div>
    </div>
  );
};