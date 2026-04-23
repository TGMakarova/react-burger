import { Tab } from '@krgaa/react-developer-burger-ui-components';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IngredientsDetailsUI } from '../ingredients-details-ui/ingredients-details-ui';

import type { RootState } from '../../services/store';
import styles from './burger-ingredients.module.css';

type CategoryType = 'bun' | 'sauce' | 'main';

export const BurgerIngredients = (): React.JSX.Element => {
  const [currentTab, setCurrentTab] = useState<CategoryType>('bun');

  // Получаем ингредиенты из Redux
  const {
    items: ingredients,
    loading,
    error,
  } = useSelector((state: RootState) => state.ingredients);

  const categoryRefs = useRef<{
    bun: HTMLDivElement | null;
    sauce: HTMLDivElement | null;
    main: HTMLDivElement | null;
  }>({
    bun: null,
    sauce: null,
    main: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Функция для установки рефов
  const setCategoryRef = useCallback(
    (type: CategoryType, element: HTMLDivElement | null) => {
      categoryRefs.current[type] = element;
    },
    []
  );

  const handleScroll = useCallback((): void => {
    const container = containerRef.current;
    const refs = categoryRefs.current;

    if (!container || !refs.bun || !refs.sauce || !refs.main) return;

    const containerTop = container.getBoundingClientRect().top;

    const bunTop = Math.abs(refs.bun.getBoundingClientRect().top - containerTop);
    const sauceTop = Math.abs(refs.sauce.getBoundingClientRect().top - containerTop);
    const mainTop = Math.abs(refs.main.getBoundingClientRect().top - containerTop);

    const minDiff = Math.min(bunTop, sauceTop, mainTop);

    if (minDiff === bunTop) {
      setCurrentTab('bun');
    } else if (minDiff === sauceTop) {
      setCurrentTab('sauce');
    } else if (minDiff === mainTop) {
      setCurrentTab('main');
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToCategory = (category: CategoryType): void => {
    const targetElement = categoryRefs.current[category];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Отображение состояния загрузки
  if (loading && ingredients.length === 0) {
    return (
      <section className={styles.burger_ingredients}>
        <div className={styles.loader}>Загрузка ингредиентов...</div>
      </section>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <section className={styles.burger_ingredients}>
        <div className={styles.error}>Ошибка: {error}</div>
      </section>
    );
  }

  return (
    <section className={styles.burger_ingredients}>
      <nav>
        <ul className={styles.menu}>
          <Tab
            value="bun"
            active={currentTab === 'bun'}
            onClick={() => scrollToCategory('bun')}
          >
            Булки
          </Tab>
          <Tab
            value="sauce"
            active={currentTab === 'sauce'}
            onClick={() => scrollToCategory('sauce')}
          >
            Соусы
          </Tab>
          <Tab
            value="main"
            active={currentTab === 'main'}
            onClick={() => scrollToCategory('main')}
          >
            Начинки
          </Tab>
        </ul>
      </nav>
      <div ref={containerRef} className={styles.ingredients_scroll_container}>
        <IngredientsDetailsUI setCategoryRef={setCategoryRef} />
      </div>
    </section>
  );
};
