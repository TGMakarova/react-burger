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

// Функция создания заказа
export const createOrder = async (ingredientsIds: string[]) => {
  try {
    const res = await fetch(`${BURGER_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients: ingredientsIds,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log('Ответ от сервера (заказ):', data);

    return data;
  } catch (error) {
    console.error('Ошибка в createOrder:', error);
    throw error;
  }
};

//createOrder(orderIngredientsIds);
// utils/api.ts
export const checkResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    // Создаем объект ошибки с дополнительной информацией
    const error = {
      status: response.status,
      statusText: response.statusText,
      message: data.message || `Ошибка ${response.status}: ${response.statusText}`,
      data: data
    };
    return Promise.reject(error);
  }
  
  return data;
};