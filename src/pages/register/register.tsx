import {
  Button,
  EmailInput,
  PasswordInput,
  Input,
} from '@krgaa/react-developer-burger-ui-components';
import styles from './register.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { burgerApi } from '@utils/burger-api';

interface RegisterResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string;
  };
}

export const RegisterPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await burgerApi.post<RegisterResponse>('/auth/register', {
        name,
        email,
        password,
      });

      const { accessToken, refreshToken } = data;

      if (accessToken && refreshToken) {
        // ОЧИЩАЕМ старые токены перед сохранением новых
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Сохраняем новые токены
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        console.log('Токены успешно сохранены для нового пользователя');

        // Очищаем форму
        setName('');
        setEmail('');
        setPassword('');

        // Перенаправляем на страницу профиля
        navigate('/profile');
      } else {
        setError('Токены не найдены в ответе сервера');
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      setError('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className={styles.register_container}>
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
        <Button
          onClick={handleRegister}
          size="large"
          type="primary"
          disabled={isLoading}
          htmlType="button"
        >
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
          style={{ cursor: 'pointer' }}
        >
          Войти
        </p>
      </div>
    </div>
  );
};
