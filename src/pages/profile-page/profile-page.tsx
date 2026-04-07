import {
  Button,
  EmailInput,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';

import { checkResponse } from '@/utils/api';
import styles from './profile-page.module.css';
import { useState } from 'react';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}
export const ProfilePage = (): React.JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleRegister = async () => {
    const response = await fetch(
      'https://new-stellarburgers.education-services.ru/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      }
    );
    try {
      const data: RegisterResponse = await checkResponse(response);
      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        // Сохраняем токен в localStorage
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
    <div className={styles.register_container}>
      <div>
        <div className={styles.header_container}>
          <p className={`text text_type_main-medium mb-6`}> Профиль </p>
          <p className={`text text_type_main-medium mb-6 text_color_inactive `}>
            {' '}
            История заказов{' '}
          </p>
          <p className={`text text_type_main-medium mb-6 text_color_inactive `}>
            {' '}
            Выход
          </p>
        </div>
        <p className={`text text_type_main-medium mb-6  text_color_inactive`}>
          В этом разделе вы можете изменить свои персональные данные
        </p>
      </div>
      <div className={styles.mail_container}>
        <EmailInput
          errorText="Ошибка"
          isIcon
          name="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          size="default"
          value={name}
        />
        <EmailInput
          isIcon
          name="email"
          placeholder="Логин"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <EmailInput
          isIcon
          name="password"
          placeholder="Пароль"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>
    </div>
  );
};
