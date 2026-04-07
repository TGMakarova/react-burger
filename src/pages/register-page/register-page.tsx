import {
  Button,
  EmailInput,
  PasswordInput,
  Input
} from '@krgaa/react-developer-burger-ui-components';

import { checkResponse } from '@/utils/api';
import styles from './register-page.module.css';
import { useState } from 'react';
  
 interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  
}
export const RegisterPage = (): React.JSX.Element => {
const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
  const handleRegister = async () => {
     const response = await fetch('https://new-stellarburgers.education-services.ru/api/auth/register', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ name, email, password })
     });
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
      <h1 className={styles.header}>Регистрация</h1>
      <div className={styles.mail_container}>
        
        <Input
  errorText="Ошибка"
  
  name="name"
  onChange={(e) => setName(e.target.value)}
  //onIconClick={function fee(){}}
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
> Зарегистрироваться
          </Button>
        </div>
       
    
      <div className={styles.registration_container}>
        <p className={`${ styles.grid_item_1 } text text_type_main-default`}> Уже зарегистрировались? </p>
        <p className ={`${ styles.grid_item_2 } text text_type_main-default text_color_inactive `}> Войти</p>
       
      </div>
   </div>
  );
};