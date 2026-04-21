const API_URL = 'https://norma.nomoreparties.space/api'; 

// Получение данных пользователя с проверкой токена
export const getUserApi = async () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No token');
  }
  
  const response = await fetch(`${API_URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Токен невалиден
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Token invalid');
    }
    throw new Error(data.message || 'Failed to get user');
  }
  
  return data.user;
};