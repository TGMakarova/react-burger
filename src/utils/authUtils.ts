import { checkResponse } from './api';
import { BURGER_API_URL } from './burger-api';

interface RefreshResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');

  console.log('refreshTokens called');
  console.log('Refresh token exists:', !!refreshToken);

  if (!refreshToken) {
    console.error('Refresh token не найден в localStorage');
    return false;
  }

  try {
    // Очищаем refreshToken от возможного префикса Bearer
    const cleanRefreshToken = refreshToken.replace(/^Bearer\s+/i, '');

    const response = await fetch(`${BURGER_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: cleanRefreshToken }),
    });

    console.log('Refresh token response status:', response.status);

    const data: RefreshResponse = await checkResponse(response);
    console.log('Refresh response:', {
      ...data,
      accessToken: data.accessToken?.substring(0, 50) + '...',
    });

    if (data.success && data.accessToken && data.refreshToken) {
      // Очищаем токены от префикса Bearer
      const cleanAccessToken = data.accessToken.replace(/^Bearer\s+/i, '');
      const cleanNewRefreshToken = data.refreshToken.replace(/^Bearer\s+/i, '');

      localStorage.setItem('accessToken', cleanAccessToken);
      localStorage.setItem('refreshToken', cleanNewRefreshToken);

      console.log('Токены успешно обновлены');
      console.log('New accessToken saved:', cleanAccessToken.substring(0, 50) + '...');
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
