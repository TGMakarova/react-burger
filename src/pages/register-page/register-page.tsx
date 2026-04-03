import {
  Button,
  EmailInput,
  PasswordInput,
  Input
} from '@krgaa/react-developer-burger-ui-components';
import styles from './register-page.module.css';

export const RegisterPage = (): React.JSX.Element => {

  return (
  <div className={styles.register_container}>
      <h1>Регистрация</h1>
      <div className={styles.mail_container}>
        
        <Input
  errorText="Ошибка"
  
  name="name"
  onChange={function fee(){}}
  onIconClick={function fee(){}}
  placeholder="placeholder"
  size="default"
  type="text"
  value="value"
/>
      <EmailInput
  name="email"
  onChange={function fee(){}}
  value="bob@example.com"
        />
        <PasswordInput
  icon="ShowIcon"
  name="password"
  onChange={function fee(){}}
  value="password"
        />
        </div>
        <div className={styles.size_button}>
        <Button 
  onClick={function fee(){}}
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