import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './reset-password-page.module.css';
import { checkResponse } from '@/utils/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export const ResetPasswordPage = (): React.ReactNode => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Проверяем флаг в useEffect, а не при рендере
  useEffect(() => {
    const hasRequestedReset = localStorage.getItem('passwordResetRequested') === 'true';
    
    if (!hasRequestedReset) {
      navigate('/forgot-password-page');
    }
  }, [navigate]);

  const handleRegister = async () => {
    const response = await fetch(
      'https://new-stellarburgers.education-services.ru/api/password-reset/reset',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ВНИМАНИЕ: API восстановления пароля обычно ожидает password и token, а не email и password
        body: JSON.stringify({ password, token: email }), // email здесь используется как токен
      }
    );

    try {
      const data: RegisterResponse = await checkResponse(response);
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // Очищаем флаг после успешного сброса
        localStorage.removeItem('passwordResetRequested');
        console.log('Токены успешно сохранены:', accessToken, refreshToken);
        navigate('/login-page');
      } else {
        console.error('Токены не найдены в ответе сервера');
      }
      console.log('Пароль успешно изменен:', data);
    } catch (error) {
      console.error('Ошибка изменения пароля:', error);
    }
  };

  return (
    <div className={styles.login_container}>
      <h1 className={styles.header}>Восстановление пароля</h1>
      <div className={styles.mail_container}>
        <PasswordInput
          icon="ShowIcon"
          name="password"
          placeholder="Введите новый пароль"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <EmailInput
          name="token"
          placeholder="Введите код из письма"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div className={styles.size_button}>
          <Button onClick={handleRegister} size="large" type="primary" htmlType="button">
            Сохранить
          </Button>
        </div>
      </div>
      <div className={styles.registration_container}>
        <p className={`${styles.grid_item_1} text text_type_main-default`}>
          Вспомнили пароль?
        </p>
        <p
          className={`${styles.grid_item_2} text text_type_main-default text_color_inactive`}
          onClick={() => navigate('/login-page')}
          style={{ cursor: 'pointer' }}
        >
          Войти
        </p>
      </div>
    </div>
  );
};
