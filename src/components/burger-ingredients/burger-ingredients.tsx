import { Tab } from '@krgaa/react-developer-burger-ui-components';
import { useState, useRef, useEffect, useCallback } from 'react';
import { IngredientsDetailsUI } from '../ingredients-details-ui/ingredients-details-ui';

import type { TIngredient } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TBurgerIngredientsProps = {
  ingredients: TIngredient[];
};

type CategoryType = 'bun' | 'sauce' | 'main';
  

export const BurgerIngredients = ({
  ingredients,
}: TBurgerIngredientsProps): React.JSX.Element => {
  console.log(ingredients);

  // Задаем начальное положение заголовка категории Tab
  const [currentTab, setCurrentTab] = useState<CategoryType>('bun');

  // Рефы для заголовков категорий
  const [categoryRefs, setCategoryRefs] = useState<{
    bun: HTMLDivElement | null;
    sauce: HTMLDivElement | null;
    main: HTMLDivElement | null;
  }>({
    bun: null,
    sauce: null,
    main: null
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Функция для установки рефов из дочернего компонента
  const setCategoryRef = useCallback((type: CategoryType, element: HTMLDivElement | null) => {
    setCategoryRefs(prev => ({
      ...prev,
      [type]: element
    }));
  }, []);
  
  

  const handleScroll = useCallback ((): void => {
    if (!containerRef.current || !categoryRefs.bun || !categoryRefs.sauce || !categoryRefs.main) return
  
    //Определяем  верхнюю координату контейнера

    const containerTop = containerRef.current.getBoundingClientRect().top;
    //Определяем расстояние от верха контейнера до каждого заголовка

    const bunTop = Math.abs(categoryRefs.bun.getBoundingClientRect().top - containerTop);
    const sauceTop = Math.abs(categoryRefs.sauce.getBoundingClientRect().top - containerTop);
    const mainTop = Math.abs(categoryRefs.main.getBoundingClientRect().top - containerTop);


    //Находим минимальное значение
    const minDiff = Math.min(bunTop, sauceTop, mainTop);

    if (minDiff === bunTop) {
      setCurrentTab('bun')
    
    } else if (minDiff === sauceTop) {
      setCurrentTab('sauce')
    } else if (minDiff === mainTop) {
      setCurrentTab('main');
    }
  }, [categoryRefs]);
  
    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll)
      }
    }, [handleScroll]);

    const scrollToCategory = (category: CategoryType): void => {
      const targetElement = categoryRefs[category];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
  
  return (
    <section className={styles.burger_ingredients}>
      <nav>
        <ul className={styles.menu}>
          <Tab
            value="bun"
            active={currentTab==='bun'}
            onClick={() => 
              scrollToCategory('bun')
            }
          >
            Булки
          </Tab>
          <Tab
            value="main"
            active={currentTab ==='main'}
            onClick={() => 
              scrollToCategory ('main')
            }
          >
            Начинки
          </Tab>
          <Tab
            value="sauce"
            active={currentTab === 'sauce'}
            onClick={() => 
              scrollToCategory ('sauce')
            }
          >
            Соусы
          </Tab>
        </ul>
      </nav>
      <div ref={containerRef} className={styles.ingredients_scroll_container}>
        <IngredientsDetailsUI ingredients={ingredients}
        setCategoryRef = {setCategoryRef}
        />
        </div>
    </section>
  );
}
