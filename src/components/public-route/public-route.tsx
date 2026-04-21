import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';
import type { RootState } from '../../services/store';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const location = useLocation();
  const { isLoggedIn, isAuthChecked } = useSelector((state: RootState) => state.auth);

  if (!isAuthChecked) {
    return null;
  }

  // Список публичных маршрутов
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

  // Если пользователь авторизован и пытается зайти на публичный маршрут
  if (isLoggedIn && publicPaths.includes(location.pathname)) {
    // Редиректим на главную, а не на /profile
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
