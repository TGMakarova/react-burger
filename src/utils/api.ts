const BURGER_API_URL = 'https://new-stellarburgers.education-services.ru/api';

export const getIngredients = async () => {
  try {
    // Используем новый URL
    const res = await fetch(`${BURGER_API_URL}/ingredients`);
    
    // Проверяем статус ответа
    if (!res.ok) {
      throw new Error(`Ошибка HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Ответ от сервера:', data); // Для отладки
    
    if (data.success) {
      return data.data; // Возвращаем массив ингредиентов
    } else {
      throw new Error('Сервер вернул ошибку');
    }
  } catch (error) {
    console.error('Ошибка в getIngredients:', error);
    throw error;
  }
};


