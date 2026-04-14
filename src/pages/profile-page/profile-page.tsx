import { EmailInput, Button } from '@krgaa/react-developer-burger-ui-components';
import styles from './profile-page.module.css';
import { useState, useEffect } from 'react';

// Предполагаемая структура данных пользователя

interface UserData {
  name: string;
  email: string;
  password?: string;
}

// Пример получения данных пользователя (замените на вашу реализацию)
const getUserData = (): UserData => {
  // Здесь могут быть данные из localStorage, контекста, Redux и т.д.
  return {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    password: '', // пароль не заполняем
  };
};

export const ProfilePage = (): React.JSX.Element => {
  // Состояния для полей формы
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Состояния для отслеживания изменений и загрузки
  const [isEdited, setIsEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Исходные данные пользователя
  const [originalUser, setOriginalUser] = useState<UserData | null>(null);

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    const userData = getUserData();
    setName(userData.name);
    setEmail(userData.email);
    setPassword(''); // Поле пароля всегда пустое
    setOriginalUser(userData);
  }, []);

  // Отслеживание изменений в полях
  useEffect(() => {
    if (originalUser) {
      const hasChanges =
        name !== originalUser.name || email !== originalUser.email || password !== '';

      setIsEdited(hasChanges);
    }
  }, [name, email, password, originalUser]);

  // Обработчик отмены редактирования
  const handleCancel = () => {
    if (originalUser) {
      setName(originalUser.name);
      setEmail(originalUser.email);
      setPassword(''); // Пароль всегда сбрасывается в пустую строку
      setIsEdited(false);
    }
  };

  // Обработчик сохранения
  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Подготовка данных для отправки
      const updateData = {
        name: name,
        email: email,
        password: password, // Если пароль не редактировался, будет пустая строка
      };

      // Отправка запроса на обновление
      const response = await fetch(
        'https://new-stellarburgers.education-services.ru/api/auth/user',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при обновлении данных');
      }

      const updatedUser = await response.json();

      // Обновляем исходные данные
      setOriginalUser({
        name: updatedUser.name,
        email: updatedUser.email,
        password: '',
      });

      // Очищаем поле пароля после успешного сохранения
      setPassword('');
      setIsEdited(false);

      // Опционально: показать уведомление об успехе
      console.log('Данные успешно обновлены');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      // Опционально: показать уведомление об ошибке
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.mail_container}>
      <EmailInput
        isIcon
        name="name"
        placeholder="Имя"
        onChange={(e) => setName(e.target.value)}
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
