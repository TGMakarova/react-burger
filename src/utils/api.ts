import { BURGER_API_URL } from './burger-api';

export const checkResponse = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;

  if (!response.ok) {
    const error = {
      status: response.status,
      statusText: response.statusText,
      message: `Ошибка ${response.status}: ${response.statusText}`,
      data: data,
    };
    return Promise.reject(error);
  }

  return data;
};

export const sendAuthRequest = async <T>(
  url: string,
  method: string = 'GET',
  body?: any
): Promise<T> => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    throw new Error('Токен доступа не найден');
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return checkResponse(response);
};

export const sendWithTokenRefresh = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    return checkResponse(response);
  } catch (error: any) {
    if (error.status === 401) {
      // Токен истёк — обновляем его
      await refreshAccessToken();

      // Повторяем запрос с новыми заголовками
      return sendWithTokenRefresh(url, options);
    }

    throw error; // Другие ошибки пробрасываем дальше
  }
};

// Вспомогательная функция для обновления токена
interface TokenResponse {
  accessToken: string;
}

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('Refresh token не найден');

  const response = await fetch(`${BURGER_API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await checkResponse<TokenResponse>(response); // указываем ожидаемый тип
  localStorage.setItem('accessToken', data.accessToken); // теперь TypeScript знает, что accessToken есть
};
