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