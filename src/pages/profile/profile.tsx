import { Input, EmailInput, PasswordInput, Button } from '@krgaa/react-developer-burger-ui-components';
import styles from './profile.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@utils/auth-service';

interface UserData {
  name: string;
  email: string;
}

interface UserResponse {
  success: boolean;
  user: UserData;
}

export const ProfilePage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [originalUser, setOriginalUser] = useState<UserData | null>(null);

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Fetching user data with authService...');
        const data = await authService.getUser();
        
        console.log('User data received:', data);
        if (data.success && data.user) {
          setName(data.user.name);
          setEmail(data.user.email);
          setOriginalUser(data.user);
        } else {
          setError('Не удалось загрузить данные пользователя');
        }
      } catch (error: any) {
        console.error('Ошибка загрузки:', error);
        
        // Обработка разных кодов ошибок
        if (error.message?.includes('401') || error.message?.includes('403')) {
          setError('Сессия истекла. Пожалуйста, войдите заново.');
          // Очищаем токены и перенаправляем на логин через 2 секунды
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        } else if (error.message?.includes('404')) {
          setError('Сервис недоступен. Попробуйте позже.');
        } else {
          setError(error.message || 'Не удалось загрузить данные пользователя');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Проверяем авторизацию перед загрузкой
    if (authService.isAuthenticated()) {
      fetchUserData();
    } else {
      setError('Не авторизован. Пожалуйста, войдите в систему.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate]);

  // Отслеживание изменений
  useEffect(() => {
    if (originalUser) {
      const hasChanges = name !== originalUser.name || 
                        email !== originalUser.email || 
                        password !== '';
      setIsEdited(hasChanges);
      
      // Очищаем сообщения при новом изменении
      if (hasChanges) {
        setError('');
        setSuccessMessage('');
      }
    }
  }, [name, email, password, originalUser]);

  const handleCancel = () => {
    if (originalUser) {
      setName(originalUser.name);
      setEmail(originalUser.email);
      setPassword('');
      setIsEdited(false);
      setError('');
      setSuccessMessage('');
    }
  };

  const handleSave = async () => {
    // Валидация
    if (name.trim().length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Введите корректный email');
      return;
    }
    
    if (password && password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Используем authService для обновления
      const data = await authService.updateUser(email.trim(), name.trim());
      
      console.log('Update response:', data);
      
      if (data.success && data.user) {
        setOriginalUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setPassword('');
        setIsEdited(false);
        setSuccessMessage('Данные успешно обновлены!');
        
        // Обновляем данные пользователя в localStorage если они там хранятся
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.name = data.user.name;
          user.email = data.user.email;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Автоматически скрыть сообщение через 3 секунды
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Не удалось обновить данные');
      }
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      
      if (error.message?.includes('409')) {
        setError('Пользователь с таким email уже существует');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        setError('Сессия истекла. Пожалуйста, войдите заново.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError(error.message || 'Не удалось сохранить изменения');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.mail_container}>
      {isLoading && !originalUser && (
        <div className={styles.loading_message}>
          Загрузка данных...
        </div>
      )}
      
      {error && (
        <div className={styles.error_message}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className={styles.success_message}>
          {successMessage}
        </div>
      )}
      
      <Input
        name="name"
        placeholder="Имя"
        onChange={(e) => setName(e.target.value)}
        value={name}
        disabled={isLoading}
      />
      
      <EmailInput
        name="email"
        placeholder="Логин"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        disabled={isLoading}
      />
      
      <PasswordInput
        name="password"
        placeholder="Новый пароль"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        disabled={isLoading}
      />

      {isEdited && (
        <div className={styles.buttons_container}>
          <Button
            type="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            htmlType="button"
          >
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={isLoading}
            htmlType="button"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      )}
    </div>
  );
};
