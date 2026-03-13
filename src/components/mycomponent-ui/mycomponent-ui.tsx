import {
  Button,
  ConstructorElement,
  DragIcon,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';

import { OtherDetails } from '../other-details/other-details';

import styles from './mycomponent-ui.module.css';
import type { TIngredient } from '@utils/types.ts';

type IngredientsDetailsUIProps = {
  ingredients: TIngredient[];
};

export const MyComponentUI = ({
  ingredients,
}: IngredientsDetailsUIProps): React.JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние для управления видимостью модала

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const sostavIds = [
    '692889f16bf770001bfeb4cc',
    '692889f16bf770001bfeb4d7',
    '692889f16bf770001bfeb4d3',
    '692889f16bf770001bfeb4d3',
    '692889f16bf770001bfeb4d9',
    '692889f16bf770001bfeb4d9',
  ];

  // ПРОВЕРКА: есть ли ингредиенты вообще
  if (!ingredients || ingredients.length === 0) {
    setError('Ошибка: список ингредиентов пуст');
    return <div className={styles.error}>{error}</div>;
  }

  // Фильтруем ID из sostavIds, которые соответствуют типу "bun"
  const bulIds = sostavIds.filter((id) => {
    const ingredient = ingredients.find((item) => item._id === id);
    return ingredient?.type === 'bun';
  });

  // ПРОВЕРКА ОШИБОК ДЛЯ БУЛОК
  if (bulIds.length === 0) {
    setError('Ошибка: в sostavIds не найдено ни одной булки (тип "bun")');
    return <div className={styles.error}>{error}</div>;
  }

  if (bulIds.length > 1) {
    setError('Ошибка: в sostavIds найдено больше одной булки (тип "bun")');
    return <div className={styles.error}>{error}</div>;
  }

  // УДАЛЯЕМ bulIds ИЗ sostavIds - получаем массив без булок
  const otherIds = sostavIds.filter((id) => !bulIds.includes(id));
  console.log(otherIds);

  // Получаем ингредиенты без булок (используем otherIds вместо sostavIds)
  const otherIngredients = otherIds
    .map((id) => ingredients.find((item) => item._id === id))
    .filter((ingredient): ingredient is TIngredient => ingredient !== null);
  console.log(otherIngredients);

  // Получаем булку (она одна)
  const bulIngredient = ingredients.find((item) => item._id === bulIds[0])!;
  console.log(bulIngredient);

  // ПРОВЕРКА: существует ли булка
  if (!bulIngredient) {
    setError(`Ошибка: булка с ID ${bulIds[0]} не найдена`);
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.burger_constructor}>
      {/* Верхняя булка */}
      <div className={styles.bun_top} key={`${bulIngredient._id}-top`}>
        <ConstructorElement
          handleClose={function fee() {}}
          isLocked={true}
          price={bulIngredient.price}
          text={`${bulIngredient.name} (верх)`}
          thumbnail={bulIngredient.image}
          type="top"
        />
      </div>

      {/* Контейнер для скролла только ингредиентов */}
      <div className={styles.ingredients_container}>
        {otherIngredients.map((ingredient, index) => (
          <div key={`${ingredient._id}-${index}`} className={styles.ingredient_item}>
            <DragIcon type="secondary"></DragIcon>
            <ConstructorElement
              handleClose={function fee() {}}
              isLocked={false}
              price={ingredient.price}
              text={ingredient.name}
              thumbnail={ingredient.image}
            />
          </div>
        ))}
      </div>

      {/* Нижняя булка */}
      <div className={styles.bun_bottom} key={`${bulIngredient._id}-bottom`}>
        <ConstructorElement
          handleClose={function fee() {}}
          isLocked={true}
          price={bulIngredient.price}
          text={`${bulIngredient.name} (низ)`}
          thumbnail={bulIngredient.image}
          type="bottom"
        />
      </div>

      <div className={styles.constructor_button}>
        <span className={`${styles.constructor_button} text text_type_digits-medium`}>
          {356}
        </span>
        <CurrencyIcon type="primary" className={styles.constructor_icon}></CurrencyIcon>
        <Button onClick={handleOpenModal} size="medium" type="primary" htmlType="button">
          <span>Оформить заказ</span>
        </Button>
      </div>
      {isModalOpen && (
        <OtherDetails
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          children="Содержимое модального окна"
        />
      )}
    </div>
  );
};
