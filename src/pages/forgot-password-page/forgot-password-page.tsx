import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import styles from './forgot-password-page.module.css';
import { checkResponse } from '@/utils/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export const ForgotPasswordPage = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Инициализируем хук

  const handleRegister = async () => {
    const response = await fetch(
      'https://new-stellarburgers.education-services.ru/api/password-reset/reset',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );
    try {
      const data: RegisterResponse = await checkResponse(response);
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Токены успешно сохранены:', accessToken, refreshToken);
        localStorage.setItem('passwordResetRequested', 'true');
        navigate('/reset-password-page'); // Перенаправляем на страницу восстановления пароля
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
        <EmailInput
          name="email"
          placeholder="Укажите e-mail"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className={styles.size_button}>
          <Button onClick={handleRegister} size="large" type="primary" htmlType="button">
            {' '}
            Восстановить
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
