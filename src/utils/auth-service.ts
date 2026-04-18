import { checkResponse } from './api';
import { BURGER_API_URL } from './burger-api';
import { refreshTokens } from './authUtils';

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string;
  };
}

interface UserResponse {
  success: boolean;
  user: {
    email: string;
    name: string;
  };
}

interface LogoutResponse {
  success: boolean;
  message?: string;
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    console.log('AuthService init, token exists:', !!this.accessToken);
    if (this.accessToken) {
      console.log('Token starts with Bearer:', this.accessToken.startsWith('Bearer '));
    }
  }

  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
      console.log('Token saved, length:', token.length);
      console.log('Token preview:', token.substring(0, 50));
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = this.getAccessToken();
    
    console.log('fetchWithAuth called for:', url);
    console.log('Token exists:', !!token);
    
    if (!token) {
      throw new Error('Не авторизован');
    }

    const makeRequest = async (requestToken: string) => {
      // Убираем префикс Bearer если он уже есть, чтобы не добавлять дважды
      const cleanToken = requestToken.replace(/^Bearer\s+/i, '');
      const authHeader = `Bearer ${cleanToken}`;
      
      console.log('Making request to:', url);
      console.log('Authorization header:', authHeader.substring(0, 60) + '...');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          ...options.headers,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        const error: any = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      return checkResponse<T>(response);
    };

    try {
      return await makeRequest(token);
    } catch (error: any) {
      console.log('Request failed with status:', error.status);
      
      if (error.status === 401 || error.status === 403) {
        console.log('Attempting to refresh token...');
        const refreshed = await refreshTokens();
        
        if (refreshed) {
          const newToken = this.getAccessToken();
          if (newToken) {
            console.log('Retrying request with new token');
            return await makeRequest(newToken);
          }
        }
        
        this.clearAuth();
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('Login attempt for:', email);
    
    const response = await fetch(`${BURGER_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    
    const data = await checkResponse<LoginResponse>(response);
    console.log('Login response data:', { ...data, accessToken: data.accessToken?.substring(0, 50) + '...' });
    
    if (data.success && data.accessToken && data.refreshToken) {
      // Очищаем старые токены
      this.clearAuth();
      
      // Сохраняем новые токены
      this.setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      console.log('Tokens saved successfully');
      console.log('AccessToken saved:', data.accessToken.substring(0, 50) + '...');
      console.log('RefreshToken saved:', data.refreshToken.substring(0, 50) + '...');
    } else {
      console.error('Invalid login response:', data);
    }
    
    return data;
  }

  async getUser(): Promise<UserResponse> {
    console.log('Getting user data...');
    return this.fetchWithAuth<UserResponse>(`${BURGER_API_URL}/auth/user`, {
      method: 'GET',
    });
  }

  async updateUser(email: string, name: string): Promise<UserResponse> {
    return this.fetchWithAuth<UserResponse>(`${BURGER_API_URL}/auth/user`, {
      method: 'PATCH',
      body: JSON.stringify({ email, name }),
    });
  }

  async logout(): Promise<LogoutResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearAuth();
      return { success: true };
    }

    try {
      const response = await fetch(`${BURGER_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshToken }),
      });
      
      const data = await checkResponse<LogoutResponse>(response);
      this.clearAuth();
      return data;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  private clearAuth() {
    console.log('Clearing auth data');
    this.setAccessToken(null);
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getAccessToken();
    console.log('isAuthenticated check:', hasToken);
    return hasToken;
  }
}

export const authService = new AuthService();