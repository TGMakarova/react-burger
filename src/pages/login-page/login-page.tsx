import {
  Button,
  EmailInput,
  PasswordInput
} from '@krgaa/react-developer-burger-ui-components';
import styles from './login-page.module.css';

export const LoginPage = (): React.JSX.Element => {

  return (
    <div className={styles.login_container}>
      <h1>Вход</h1>
      <div className = {styles.mail_container}>
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
        <div className={styles.size_button}>
        <Button 
  onClick={function fee(){}}
  size="large"
  type="primary"
> Войти
          </Button>
        </div>
       
      </div>
      <div className={styles.registration_container}>
        <p className={`${ styles.grid_item_1 } text text_type_main-default`}> Вы - новый пользователь? </p>
        <p className ={`${ styles.grid_item_2 } text text_type_main-default text_color_inactive `}> Зарегистрироваться</p>
        <p className = {`${ styles.grid_item_3 } text text_type_main-default`}> Забыли пароль? </p>
        <p className= {`${ styles.grid_item_4 } text text_type_main-default text_color_inactive `}> Восстановить пароль</p>
      </div>
   </div>
  );
};