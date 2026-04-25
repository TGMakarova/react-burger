import {
  Input,
  EmailInput,
  PasswordInput,
  Button,
} from '@krgaa/react-developer-burger-ui-components';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { updateUser } from '../../services/slices/authSlice';

import type { AppDispatch, RootState } from '../../services/store';

import styles from './profile.module.css';

export const ProfilePage = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Берём пользователя из Redux store
  const {
    user,
    isLoggedIn,
    isLoading: isAuthLoading,
  } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Заполняем форму данными из store
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, isAuthLoading, navigate]);

  // Отслеживание изменений
  useEffect(() => {
    if (user) {
      const hasChanges = name !== user.name || email !== user.email || password !== '';
      setIsEdited(hasChanges);

      if (hasChanges) {
        setError('');
        setSuccessMessage('');
      }
    }
  }, [name, email, password, user]);

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
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

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Используем Redux экшен для обновления
      const result = await dispatch(
        updateUser({
          name: name.trim(),
          email: email.trim(),
        })
      ).unwrap();

      if (result.success && result.user) {
        setPassword('');
        setIsEdited(false);
        setSuccessMessage('Данные успешно обновлены!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      // ✅ Удалён console.error
      if (error.message?.includes('409')) {
        setError('Пользователь с таким email уже существует');
      } else {
        setError(error.message || 'Не удалось сохранить изменения');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Показываем загрузку, если пользователь ещё не загружен
  if (isAuthLoading || !user) {
    return (
      <div className={styles.mail_container}>
        <div className={styles.loading_message}>Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className={styles.mail_container}>
      {error && <div className={styles.error_message}>{error}</div>}
      {successMessage && <div className={styles.success_message}>{successMessage}</div>}

      <Input
        name="name"
        placeholder="Имя"
        onChange={(e) => setName(e.target.value)}
        value={name}
        disabled={isSaving}
      />

      <EmailInput
        name="email"
        placeholder="Логин"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        disabled={isSaving}
      />

      <PasswordInput
        name="password"
        placeholder="Новый пароль"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        disabled={isSaving}
      />

      {isEdited && (
        <div className={styles.buttons_container}>
          <Button
            type="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            htmlType="button"
          >
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={isSaving}
            htmlType="button"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      )}
    </div>
  );
};
