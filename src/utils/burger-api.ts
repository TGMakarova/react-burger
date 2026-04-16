import { checkResponse } from './api';
import type { TIngredient, TOrder } from './types';

export const BURGER_API_URL = 'https://new-stellarburgers.education-services.ru/api';

class BurgerApi {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      return checkResponse<T>(response);
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }
  
  // GET запрос
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  // POST запрос
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // PUT запрос
  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // PATCH запрос
  patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // Получение ингредиентов
  getIngredients() {
    return this.get<{ data: TIngredient[] }>('/ingredients');
  }
  
  // Создание заказа
  createOrder(ingredients: string[]) {
    return this.post<{ order: TOrder }>('/orders', { ingredients });
  }
}

// Создаем экземпляр API клиента
export const burgerApi = new BurgerApi(BURGER_API_URL);