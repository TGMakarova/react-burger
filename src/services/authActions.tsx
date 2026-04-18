import { setAuthChecked, setUser, setLoading, logout } from './slices/authSlice';
import type { AppDispatch } from './store';

export const checkAuth = () => async (dispatch: AppDispatch) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    dispatch(setAuthChecked(true));
    return;
  }

  try {
    dispatch(setLoading(true));
    
    const response = await fetch('https://norma.nomoreparties.space/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      dispatch(setUser(data.user));
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logout());
    }
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
    dispatch(setAuthChecked(true));
  }
};