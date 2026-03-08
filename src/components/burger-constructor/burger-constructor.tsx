import type { TIngredient } from '@utils/types';
import { MyComponentUI } from '../mycomponent-ui/mycomponent-ui';
import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
};

export const BurgerConstructor = ({
  ingredients,
}: TBurgerConstructorProps): React.JSX.Element => {
  console.log(ingredients);

  return <section className={styles.burger_constructor}>
    <MyComponentUI />
  </section>;
};
