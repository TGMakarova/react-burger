import { checkResponse } from './api';
import { BURGER_API_URL } from './burger-api';
interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}


export const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.error('Refresh token не найден в localStorage');
    return false;
  }

  try {
    const response = await fetch(
      `${BURGER_API_URL}/auth/refresh`,

      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    const data: RegisterResponse = await checkResponse(response);
    const { accessToken, refreshToken: newRefreshToken } = data;

    if (accessToken && newRefreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log('Токены успешно обновлены:', accessToken);
      return true;
    } else {
      console.error('Не удалось обновить токены');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при обновлении токенов:', error);
    return false;
  }
};
