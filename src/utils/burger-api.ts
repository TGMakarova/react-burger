import { checkResponse } from './api';
import type { TIngredient, TOrder } from './types';

export const BURGER_API_URL = 'https://new-stellarburgers.education-services.ru/api';

interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string;
  };
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  success: boolean;
  user: {
    email: string;
    name: string;
  };
}

class BurgerApi {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.accessToken = localStorage.getItem('accessToken');
  }

  private getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  private setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
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

  private async requestWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = this.getAccessToken();
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    const makeRequest = async (requestToken: string) => {
      const cleanToken = requestToken.replace(/^Bearer\s+/i, '');
      const authHeader = `Bearer ${cleanToken}`;
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          ...options.headers,
        },
      });
      
      if (response.status === 401 || response.status === 403) {
        const error: any = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      return checkResponse<T>(response);
    };

    try {
      return await makeRequest(token);
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshData = await this.refreshToken(refreshToken);
            if (refreshData.accessToken) {
              this.setAccessToken(refreshData.accessToken);
              localStorage.setItem('refreshToken', refreshData.refreshToken);
              return await makeRequest(this.getAccessToken()!);
            }
          } catch (refreshError) {
            this.clearAuth();
            throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
          }
        }
        this.clearAuth();
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
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
  
  // ========== МЕТОДЫ АВТОРИЗАЦИИ ==========
  
  // Логин
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', { email, password });
    
    if (response.accessToken && response.refreshToken) {
      this.setAccessToken(response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  }
  
  // Регистрация
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', { name, email, password });
    
    if (response.accessToken && response.refreshToken) {
      this.setAccessToken(response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  }
  
  // Выход
  async logout(): Promise<LogoutResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await this.post<LogoutResponse>('/auth/logout', { token: refreshToken });
      this.clearAuth();
      return response;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }
  
  // Обновление токена
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.post<RefreshTokenResponse>('/auth/token', { token: refreshToken });
  }
  
  // Получение данных пользователя
  async getUser(): Promise<UserResponse> {
    return this.requestWithAuth<UserResponse>('/auth/user', { method: 'GET' });
  }
  
  // Обновление данных пользователя
  async updateUser(user: { name: string; email: string }): Promise<UserResponse> {
    return this.requestWithAuth<UserResponse>('/auth/user', {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  }
  
  // Запрос на сброс пароля
  forgotPassword(email: string): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>('/password-reset', { email });
  }
  
  // Сброс пароля с токеном
  resetPassword(password: string, token: string): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>('/password-reset/reset', { password, token });
  }
  
  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  clearAuth() {
    this.setAccessToken(null);
    localStorage.removeItem('refreshToken');
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